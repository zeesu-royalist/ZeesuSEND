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
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-brand-500" />
          <span>Shared Text</span>
        </div>
        <span>{textContent.length.toLocaleString()} characters</span>
      </div>

      <div className="p-4 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-200 leading-relaxed select-text">
          {textContent}
        </pre>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Text Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Text</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadTxt}
          className="w-full sm:w-auto py-3 px-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Download as TXT</span>
        </button>
      </div>
    </div>
  );
}
