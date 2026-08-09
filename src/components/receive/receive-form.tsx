'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sanitizeTransferKey, isValidKeyFormat } from '@/lib/transfer/key-generator';
import { Download, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

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
    <div className="w-full max-w-md mx-auto glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto shadow-inner">
          <KeyRound className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Receive Transfer
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter the 6-character transfer key shared with you to view and download content.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs uppercase font-bold text-slate-400 tracking-wider block text-center">
            Transfer Key
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="1A3S7K"
            maxLength={6}
            autoFocus
            className="w-full font-mono-key text-3xl font-black text-center tracking-widest uppercase py-4 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || key.length !== 6}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base shadow-xl shadow-brand-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>RECEIVE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
