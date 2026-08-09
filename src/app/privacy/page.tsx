import Link from 'next/link';
import { SectionBadge } from '@/components/ui/section-badge';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | ZeesuSEND',
  description: 'Learn about ZeesuSEND anonymous privacy architecture and data storage policies.',
};

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-20">
      <div className="bg-[#ffffff] border border-[#191314]/15 rounded-[32px] p-6 sm:p-10 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-[#191314]/10 pb-4">
          <div className="p-2.5 rounded-2xl bg-[#ecf95a] text-[#191314] shrink-0 border border-[#191314]/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <SectionBadge className="mb-1">Privacy</SectionBadge>
            <h1 className="text-2xl font-extrabold text-[#191314] tracking-tight">Privacy Policy</h1>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#191314]/80 leading-relaxed font-mono">
          <h2 className="text-sm sm:text-base font-bold text-[#191314]">1. Absolutely No Accounts</h2>
          <p>
            ZeesuSEND is designed to operate completely without user accounts. We do not require, collect, or store your name, email address, phone number, passwords, or personal details.
          </p>

          <h2 className="text-sm sm:text-base font-bold text-[#191314]">2. Private Storage & File Expiration</h2>
          <p>
            Uploaded files and text content are assigned random storage identifiers and stored in private buckets. Access is strictly granted through short-lived signed URLs generated upon valid transfer key requests.
          </p>

          <h2 className="text-sm sm:text-base font-bold text-[#191314]">3. Automated Data Purging</h2>
          <p>
            Transfers automatically expire based on your chosen expiration settings (1 hour, 6 hours, 24 hours, 3 days, 7 days). Expired transfer objects and database records are permanently deleted.
          </p>

          <h2 className="text-sm sm:text-base font-bold text-[#191314]">4. Analytics & Tracking</h2>
          <p>
            We do not use third-party tracking scripts or persistent cookies for user identification. Rate limiting is applied strictly to IP addresses on server API routes to protect against brute-force key lookup attacks.
          </p>
        </div>

        <div className="pt-4 border-t border-[#191314]/10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#191314] hover:underline font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
