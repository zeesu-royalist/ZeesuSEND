import Link from 'next/link';
import { TransferView } from '@/components/transfer/transfer-view';
import { getAdminSupabase } from '@/lib/supabase/server';
import { sanitizeTransferKey, isValidKeyFormat } from '@/lib/transfer/key-generator';
import { TransferItem } from '@/types';
import { PillButton } from '@/components/ui/pill-button';
import { AlertCircle, Clock, ShieldX, ArrowLeft, KeyRound } from 'lucide-react';

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

  const supabaseAdmin = getAdminSupabase();

  // Query Transfer
  const { data: transfer, error: transferError } = await supabaseAdmin
    .from('transfers')
    .select('*')
    .eq('transfer_key', sanitizedKey)
    .maybeSingle();

  if (transferError || !transfer) {
    return <ErrorCard message="Transfer not found." icon="notFound" />;
  }

  // Check Expiration
  if (transfer.expires_at && new Date(transfer.expires_at).getTime() <= Date.now()) {
    if (transfer.status !== 'expired') {
      await supabaseAdmin.from('transfers').update({ status: 'expired' }).eq('id', transfer.id);
    }
    return <ErrorCard message="This transfer has expired." icon="expired" />;
  }

  // Check Download Limit
  if (
    transfer.download_limit !== null &&
    transfer.download_count >= transfer.download_limit
  ) {
    if (transfer.status !== 'download_limit_reached') {
      await supabaseAdmin
        .from('transfers')
        .update({ status: 'download_limit_reached' })
        .eq('id', transfer.id);
    }
    return (
      <ErrorCard
        message="This transfer is no longer available because it has reached its download limit."
        icon="limitReached"
      />
    );
  }

  // Fetch Items
  const { data: items } = await supabaseAdmin
    .from('transfer_items')
    .select('*')
    .eq('transfer_id', transfer.id);

  // Generate signed URLs for preview
  const processedItems: TransferItem[] = await Promise.all(
    (items || []).map(async (item) => {
      let signedUrl: string | undefined = undefined;

      if (item.file_path && (item.type === 'image' || item.type === 'file')) {
        const { data: signedData } = await supabaseAdmin.storage
          .from('transfers')
          .createSignedUrl(item.file_path, 3600);

        if (signedData?.signedUrl) {
          signedUrl = signedData.signedUrl;
        }
      }

      return {
        id: item.id,
        transfer_id: item.transfer_id,
        type: item.type,
        file_name: item.file_name,
        file_path: item.file_path,
        mime_type: item.mime_type,
        file_size: item.file_size,
        text_content: item.text_content,
        created_at: item.created_at,
        signed_url: signedUrl,
      };
    })
  );

  const transferWithItems = {
    ...transfer,
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
            <KeyRound className="w-4 h-4 mr-1" />
            Try Another Key
          </PillButton>
        </Link>

        <Link href="/" className="w-full sm:w-auto">
          <PillButton variant="secondary" size="md" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back Home
          </PillButton>
        </Link>
      </div>
    </div>
  );
}
