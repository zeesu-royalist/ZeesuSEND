'use client';

import { useState } from 'react';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { saveAs } from 'file-saver';

interface TextDisplayProps {
  textContent: string;
  transferKey: string;
}

export function TextDisplay({ textContent, transferKey }: TextDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${transferKey}_shared_text.txt`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#191314]/70 font-mono">
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-[#191314]" />
          <span>Shared Text</span>
        </div>
        <span>{textContent.length.toLocaleString()} characters</span>
      </div>

      <div className="p-5 rounded-2xl bg-[#f4f4f4] border border-[#191314]/15 max-h-96 overflow-y-auto font-mono">
        <pre className="whitespace-pre-wrap text-xs sm:text-sm text-[#191314] leading-relaxed select-text font-mono">
          {textContent}
        </pre>
      </div>

      {/* Balanced 2-Column Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-1">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#ecf95a] text-[#191314] font-extrabold text-xs sm:text-sm hover:bg-[#dbe937] border border-[#191314]/15 shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 shrink-0 text-[#191314]" />
              <span className="whitespace-nowrap">Text Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 shrink-0 text-[#191314]" />
              <span className="whitespace-nowrap">Copy Text</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadTxt}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-white text-[#191314] font-bold text-xs sm:text-sm hover:bg-[#f4f4f4] border border-[#191314]/20 shadow-sm hover:shadow active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
          <Download className="w-4 h-4 shrink-0 text-[#191314]" />
          <span className="whitespace-nowrap">Save as TXT</span>
        </button>
      </div>
    </div>
  );
}
