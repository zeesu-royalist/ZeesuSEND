'use client';

import { useState } from 'react';
import { CheckCircle2, Copy, Link as LinkIcon, ArrowRight, Clock, Download } from 'lucide-react';
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
    <div className="space-y-5 text-center animate-fadeIn text-white">
      <div className="w-14 h-14 rounded-2xl bg-[#ecf95a] text-[#191314] flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-white">
          Transfer Ready!
        </h2>
        <p className="text-xs text-white/70 mt-1 font-mono">
          Your content is encrypted & ready to share.
        </p>
      </div>

      {/* KEY DISPLAY BOX */}
      <div className="p-5 rounded-2xl bg-white/10 border border-white/15 space-y-3">
        <span className="text-[10px] uppercase font-bold text-white/60 tracking-wider font-mono">
          Transfer Key
        </span>

        <div className="font-mono text-4xl sm:text-5xl font-black text-[#ecf95a] tracking-widest py-1 select-all">
          {key}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
          <button
            onClick={copyKeyToClipboard}
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#ecf95a] hover:bg-[#dbe937] text-[#191314] font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedKey ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Key Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Key
              </>
            )}
          </button>

          <button
            onClick={copyLinkToClipboard}
            type="button"
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ecf95a]" />
                Link Copied!
              </>
            ) : (
              <>
                <LinkIcon className="w-3.5 h-3.5" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>

      {/* METADATA OVERVIEW */}
      <div className="grid grid-cols-2 gap-2.5 text-left font-mono">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-[#ecf95a] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-white/50">Expires</p>
            <p className="text-xs font-bold text-white truncate">
              {formatExpires(payload.expiresAt)}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2.5">
          <Download className="w-4 h-4 text-[#ecf95a] shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] text-white/50">Limit</p>
            <p className="text-xs font-bold text-white truncate">
              {payload.downloadLimit ? `${payload.downloadLimit} DLs` : 'Unlimited'}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={onReset}
          type="button"
          className="text-xs font-bold text-[#ecf95a] hover:underline inline-flex items-center gap-1 focus:outline-none cursor-pointer"
        >
          <span>Send another transfer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
