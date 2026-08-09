import Link from 'next/link';
import { SectionBadge } from '@/components/ui/section-badge';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | ZeesuSEND',
  description: 'Terms of Service for ZeesuSEND anonymous file sharing platform.',
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 sm:py-20">
      <div className="bg-[#ffffff] border border-[#191314]/15 rounded-[32px] p-6 sm:p-10 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-[#191314]/10 pb-4">
          <div className="p-2.5 rounded-2xl bg-[#ecf95a] text-[#191314] shrink-0 border border-[#191314]/10">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <SectionBadge className="mb-1">Legal</SectionBadge>
            <h1 className="text-2xl font-extrabold text-[#191314] tracking-tight">Terms of Service</h1>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#191314]/80 leading-relaxed font-mono">
          <h2 className="text-sm sm:text-base font-bold text-[#191314]">1. Acceptable Use</h2>
          <p>
            ZeesuSEND is intended for legitimate file, image, and text transfer between individuals. You agree not to upload malware, illegal content, copyright-infringing material, or harmful files.
          </p>

          <h2 className="text-sm sm:text-base font-bold text-[#191314]">2. Responsibility for Transfers</h2>
          <p>
            Because ZeesuSEND does not require authentication, you are solely responsible for keeping your 6-character transfer key private and sharing it only with intended receivers.
          </p>

          <h2 className="text-sm sm:text-base font-bold text-[#191314]">3. Expiration & Availability</h2>
          <p>
            Transfers are temporary by design. Once a transfer reaches its expiration time or download limit, it will no longer be accessible and cannot be recovered.
          </p>

          <h2 className="text-sm sm:text-base font-bold text-[#191314]">4. Limitation of Liability</h2>
          <p>
            The service is provided &quot;as is&quot; without warranties of any kind. ZeesuSEND is not liable for data loss or unauthorized access resulting from key sharing.
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
