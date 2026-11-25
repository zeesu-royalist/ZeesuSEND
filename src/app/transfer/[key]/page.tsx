import Link from 'next/link';
import { TransferView } from '@/components/transfer/transfer-view';
import { getDb } from '@/lib/db';
import { createPresignedDownloadUrl } from '@/lib/storage';
import { purgeTransferById } from '@/lib/cleanup';
import { sanitizeTransferKey, isValidKeyFormat } from '@/lib/transfer/key-generator';
import { TransferItem, Transfer } from '@/types';
import { PillButton } from '@/components/ui/pill-button';
import { AlertCircle, Clock, ShieldX } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface TransferPageProps {
  params: {
    key: string;
  };
}

export async function generateMetadata({ params }: TransferPageProps) {
  const key = sanitizeTransferKey(params.key);
  return {
    title: `Transfer ${key} | ZeesuSEND`,
    description: `View and download shared content for transfer key ${key}.`,
  };
}

export default async function TransferDetailsPage({ params }: TransferPageProps) {
  const rawKey = params.key;
  const sanitizedKey = sanitizeTransferKey(rawKey);

  if (!isValidKeyFormat(sanitizedKey)) {
    return <ErrorCard message="Invalid transfer key format." icon="invalid" />;
  }

  const sql = getDb();

  // Query Transfer
  const transferRows = await sql`
    SELECT * FROM public.transfers WHERE transfer_key = ${sanitizedKey} LIMIT 1
  `;

  if (!transferRows || transferRows.length === 0) {
    return <ErrorCard message="Transfer not found." icon="notFound" />;
  }

  const transfer = transferRows[0];

  // Check Expiration
  if (transfer.expires_at && new Date(transfer.expires_at).getTime() <= Date.now()) {
    purgeTransferById(transfer.id).catch(() => {});
    return <ErrorCard message="This transfer has expired." icon="expired" />;
  }

  // Check Download Limit
  if (
    transfer.download_limit !== null &&
    transfer.download_count >= transfer.download_limit
  ) {
    if (transfer.status !== 'download_limit_reached') {
      await sql`
        UPDATE public.transfers SET status = 'download_limit_reached' WHERE id = ${transfer.id}
      `;
    }
    return (
      <ErrorCard
        message="This transfer is no longer available because it has reached its download limit."
        icon="limitReached"
      />
    );
  }

  // Fetch Items
  const items = await sql`
    SELECT * FROM public.transfer_items WHERE transfer_id = ${transfer.id} ORDER BY created_at ASC
  `;

  // Generate signed URLs for preview
  const processedItems: TransferItem[] = await Promise.all(
    (items || []).map(async (item: any) => {
      let signedUrl: string | undefined = undefined;

      if (item.file_path && (item.type === 'image' || item.type === 'file')) {
        try {
          signedUrl = await createPresignedDownloadUrl(item.file_path, null, 3600);
        } catch (e) {
          console.error('Error generating preview signed URL:', e);
        }
      }

      return {
        id: item.id,
        transfer_id: item.transfer_id,
        type: item.type,
        file_name: item.file_name,
        file_path: item.file_path,
        mime_type: item.mime_type,
        file_size: item.file_size ? Number(item.file_size) : null,
        text_content: item.text_content,
        created_at: item.created_at,
        signed_url: signedUrl,
      };
    })
  );

  const transferWithItems: Transfer = {
    id: transfer.id,
    transfer_key: transfer.transfer_key,
    status: transfer.status,
    created_at: transfer.created_at,
    expires_at: transfer.expires_at,
    download_limit: transfer.download_limit,
    download_count: transfer.download_count,
    items: processedItems,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex items-center justify-center">
      <TransferView transfer={transferWithItems} />
    </div>
  );
}

function ErrorCard({
  message,
  icon,
}: {
  message: string;
  icon: 'notFound' | 'expired' | 'limitReached' | 'invalid';
}) {
  return (
    <div className="w-full max-w-lg mx-auto bg-[#ffffff] border border-[#191314]/15 rounded-[32px] p-8 text-center space-y-6 shadow-xl animate-fadeIn my-12">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mx-auto border border-red-500/20">
        {icon === 'expired' ? (
          <Clock className="w-8 h-8" />
        ) : icon === 'limitReached' ? (
          <ShieldX className="w-8 h-8" />
        ) : (
          <AlertCircle className="w-8 h-8" />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-[#191314] tracking-tight">
          Transfer Unavailable
        </h2>
        <p className="text-xs sm:text-sm text-[#191314]/70 leading-relaxed font-mono">{message}</p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/receive" className="w-full sm:w-auto">
          <PillButton variant="primary" size="md" className="w-full">
            Try Another Key
          </PillButton>
        </Link>

        <Link href="/" className="w-full sm:w-auto">
          <PillButton variant="secondary" size="md" className="w-full">
            Back Home
          </PillButton>
        </Link>
      </div>
    </div>
  );
}
