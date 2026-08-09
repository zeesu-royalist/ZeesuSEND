import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | ZeesuSend',
  description: 'Learn about ZeesuSend anonymous privacy architecture and data storage policies.',
};

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-3xl mx-auto glass-card rounded-3xl p-6 sm:p-10 my-8 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-500">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Zero User Data Collection Architecture</p>
        </div>
      </div>

      <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Absolutely No Accounts</h2>
        <p>
          ZeesuSend is designed to operate completely without user accounts. We do not require, collect, or store your name, email address, phone number, passwords, or personal details.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Private Storage & File Expiration</h2>
        <p>
          Uploaded files and text content are assigned random storage identifiers and stored in private buckets. Access is strictly granted through short-lived signed URLs generated upon valid transfer key requests.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Automated Data Purging</h2>
        <p>
          Transfers automatically expire based on your chosen expiration settings (1 hour, 6 hours, 24 hours, 3 days, 7 days). Expired transfer objects and database records are permanently deleted.
        </p>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Analytics & Tracking</h2>
        <p>
          We do not use third-party tracking scripts or persistent cookies for user identification. Rate limiting is applied strictly to IP addresses on server API routes to protect against brute-force key lookup attacks.
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
