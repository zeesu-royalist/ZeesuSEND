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
          placeholder="Write or paste your text here..."
          rows={8}
          maxLength={maxChars}
          className="w-full text-sm p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-y"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>Text Transfer Mode</span>
        </div>
        <span>
          {charCount.toLocaleString()} / {maxChars.toLocaleString()} chars
        </span>
      </div>
    </div>
  );
}
