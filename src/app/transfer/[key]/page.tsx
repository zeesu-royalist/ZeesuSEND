import Link from 'next/link';
import { TransferView } from '@/components/transfer/transfer-view';
import { getAdminSupabase } from '@/lib/supabase/server';
import { sanitizeTransferKey, isValidKeyFormat } from '@/lib/transfer/key-generator';
import { TransferItem } from '@/types';
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
    title: `Transfer ${key} | ZeesuSend`,
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
    <div className="w-full max-w-4xl mx-auto my-8">
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
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto shadow-inner">
        {icon === 'expired' ? (
          <Clock className="w-8 h-8" />
        ) : icon === 'limitReached' ? (
          <ShieldX className="w-8 h-8" />
        ) : (
          <AlertCircle className="w-8 h-8" />
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Transfer Unavailable
        </h2>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{message}</p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/receive"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
        >
          <KeyRound className="w-4 h-4" />
          <span>Try Another Key</span>
        </Link>

        <Link
          href="/"
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back Home</span>
        </Link>
      </div>
    </div>
  );
}
