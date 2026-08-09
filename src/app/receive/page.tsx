import { Suspense } from 'react';
import { ReceiveForm } from '@/components/receive/receive-form';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Receive Transfer | ZeesuSEND',
  description: 'Enter your 6-character transfer key to access and download shared files or text.',
};

export default function ReceivePage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto bg-[#ffffff] border border-[#191314]/15 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#191314] animate-spin" />
            <span className="text-xs font-mono text-[#191314]/70">Loading receive interface...</span>
          </div>
        }
      >
        <ReceiveForm />
      </Suspense>
    </div>
  );
}
