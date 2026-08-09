'use client';

import { useState } from 'react';
import { CheckCircle2, Copy, Link as LinkIcon, ArrowRight, ShieldCheck, Clock, Download } from 'lucide-react';
import { TransferSuccessPayload } from '@/types';

interface SuccessCardProps {
  payload: TransferSuccessPayload;
  onReset: () => void;
}

export function SuccessCard({ payload, onReset }: SuccessCardProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const key = payload.key;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const receiveUrl = `${origin}/receive?key=${key}`;

  const copyKeyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2500);
    } catch (e) {
      console.error('Failed to copy key:', e);
    }
  };

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(receiveUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      console.error('Failed to copy link:', e);
    }
  };

  const formatExpires = (expiresAt: string | null) => {
    if (!expiresAt) return 'Never';
    const date = new Date(expiresAt);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 text-center animate-fadeIn">
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Transfer Ready!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your content is securely uploaded and ready to be received.
        </p>
      </div>

      {/* KEY BOX */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/80 dark:from-slate-900 dark:to-slate-950 border border-slate-300/80 dark:border-slate-800 space-y-4">
        <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
          Receiver Transfer Key
        </span>

        <div className="font-mono-key text-4xl sm:text-5xl font-black text-brand-600 dark:text-brand-400 tracking-widest py-2 select-all">
          {key}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={copyKeyToClipboard}
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            {copiedKey ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Key Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Key
              </>
            )}
          </button>

          <button
            onClick={copyLinkToClipboard}
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Link Copied!
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                Copy Direct Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* METADATA OVERVIEW */}
      <div className="grid grid-cols-2 gap-3 text-left">
        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Expires</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {formatExpires(payload.expiresAt)}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-500">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Download Limit</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {payload.downloadLimit ? `${payload.downloadLimit} downloads` : 'Unlimited'}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onReset}
          type="button"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1.5 focus:outline-none"
        >
          <span>Send another transfer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
