'use client';

import { useState } from 'react';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { PillButton } from '@/components/ui/pill-button';
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
        <pre className="whitespace-pre-wrap text-xs sm:text-sm text-[#191314] leading-relaxed select-text">
          {textContent}
        </pre>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <PillButton
          variant="primary"
          size="md"
          onClick={handleCopy}
          className="w-full sm:flex-1"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              <span>Text Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              <span>Copy Text</span>
            </>
          )}
        </PillButton>

        <PillButton
          variant="secondary"
          size="md"
          onClick={handleDownloadTxt}
          className="w-full sm:w-auto"
        >
          <Download className="w-4 h-4 mr-1" />
          <span>Save as TXT</span>
        </PillButton>
      </div>
    </div>
  );
}
