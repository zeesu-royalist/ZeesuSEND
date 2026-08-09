'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sanitizeTransferKey, isValidKeyFormat } from '@/lib/transfer/key-generator';
import { SectionBadge } from '@/components/ui/section-badge';
import { PillButton } from '@/components/ui/pill-button';
import { KeyRound, AlertCircle } from 'lucide-react';

export function ReceiveForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL query parameter `?key=1A3S7K`
  useEffect(() => {
    const urlKey = searchParams?.get('key');
    if (urlKey) {
      const sanitized = sanitizeTransferKey(urlKey);
      setKey(sanitized);
    }
  }, [searchParams]);

  const handleInputChange = (val: string) => {
    const sanitized = sanitizeTransferKey(val);
    setKey(sanitized);
    if (error) setError(null);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const sanitized = sanitizeTransferKey(key);

    if (!sanitized) {
      setError('Please enter a transfer key.');
      return;
    }

    if (sanitized.length !== 6) {
      setError('Transfer key must be exactly 6 characters long.');
      return;
    }

    if (!isValidKeyFormat(sanitized)) {
      setError('Invalid transfer key format.');
      return;
    }

    setIsSubmitting(true);
    router.push(`/transfer/${sanitized}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#ffffff] border border-[#191314]/15 rounded-[32px] p-6 sm:p-10 space-y-8 shadow-xl">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <SectionBadge>Receive File</SectionBadge>
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#ecf95a] text-[#191314] flex items-center justify-center mx-auto shadow-sm border border-[#191314]/10">
          <KeyRound className="w-7 h-7" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191314] tracking-tight">
          Enter Transfer Key
        </h2>

        <p className="text-xs sm:text-sm text-[#191314]/70 max-w-sm mx-auto leading-relaxed font-normal">
          Enter the 6-character key shared with you to access and download files or text.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs sm:text-sm flex items-center gap-3 animate-fadeIn font-mono">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase font-bold text-[#191314]/60 tracking-wider block text-center font-mono">
            6-Character Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="1A3S7K"
            maxLength={6}
            autoFocus
            className="w-full font-mono text-4xl sm:text-5xl font-black text-center tracking-widest uppercase py-4 px-4 rounded-2xl bg-[#f4f4f4] border border-[#191314]/20 text-[#191314] placeholder-[#191314]/30 focus:outline-none focus:border-[#191314]"
          />
        </div>

        <PillButton
          type="submit"
          variant="primary"
          size="lg"
          disabled={isSubmitting || key.length !== 6}
          className="w-full py-4 text-base font-bold"
        >
          {isSubmitting ? 'Accessing Transfer...' : 'Access Transfer ↗'}
        </PillButton>
      </form>
    </div>
  );
}
