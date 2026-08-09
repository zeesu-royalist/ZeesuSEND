import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | ZeesuSend',
  description: 'Terms of Service for ZeesuSend anonymous file sharing platform.',
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto glass-card rounded-3xl p-6 sm:p-10 my-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Rules for anonymous content sharing</p>
        </div>
      </div>

      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptable Use</h2>
        <p>
          ZeesuSend is intended for legitimate file, image, and text transfer between individuals. You agree not to upload malware, illegal content, copyright-infringing material, or harmful files.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Responsibility for Transfers</h2>
        <p>
          Because ZeesuSend does not require authentication, you are solely responsible for keeping your 6-character transfer key private and sharing it only with intended receivers.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Expiration & Availability</h2>
        <p>
          Transfers are temporary by design. Once a transfer reaches its expiration time or download limit, it will no longer be accessible and cannot be recovered.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Limitation of Liability</h2>
        <p>
          The service is provided &quot;as is&quot; without warranties of any kind. ZeesuSend is not liable for data loss or unauthorized access resulting from key sharing.
        </p>
      </div>

      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sender</span>
        </Link>
      </div>
    </div>
  );
}
