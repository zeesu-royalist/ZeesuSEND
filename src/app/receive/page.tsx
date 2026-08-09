import { Suspense } from 'react';
import { ReceiveForm } from '@/components/receive/receive-form';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Receive Transfer | ZeesuSend',
  description: 'Enter your 6-character transfer key to access and download shared files or text.',
};

export default function ReceivePage() {
  return (
    <div className="w-full max-w-2xl mx-auto my-8 space-y-6">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            <span className="text-sm text-slate-500">Loading receive interface...</span>
          </div>
        }
      >
        <ReceiveForm />
      </Suspense>
    </div>
  );
}
