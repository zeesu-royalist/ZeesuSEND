'use client';

import { FileText } from 'lucide-react';

interface TextEditorProps {
  text: string;
  setText: (val: string) => void;
}

export function TextEditor({ text, setText }: TextEditorProps) {
  const maxChars = 100000;
  const charCount = text.length;

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write or paste your text content here..."
          rows={7}
          maxLength={maxChars}
          className="w-full text-xs sm:text-sm p-4 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#ecf95a] resize-y font-mono"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-white/60 font-mono px-1">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-[#ecf95a]" />
          <span>Text Mode</span>
        </div>
        <span>
          {charCount.toLocaleString()} / {maxChars.toLocaleString()} chars
        </span>
      </div>
    </div>
  );
}
