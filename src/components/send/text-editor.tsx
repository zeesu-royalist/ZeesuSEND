'use client';

import { useState } from 'react';
import { FileText, Clipboard, Check } from 'lucide-react';

interface TextEditorProps {
  text: string;
  setText: (val: string) => void;
}

export function TextEditor({ text, setText }: TextEditorProps) {
  const [isPasted, setIsPasted] = useState(false);
  const maxChars = 100000;
  const charCount = text.length;

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) return;
      setText(clipboardText.slice(0, maxChars));
      setIsPasted(true);
      setTimeout(() => setIsPasted(false), 2000);
    } catch (err) {
      console.error('Failed to paste from clipboard:', err);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write or paste your text content here..."
          rows={7}
          maxLength={maxChars}
          className="w-full text-xs sm:text-sm p-4 pb-10 rounded-2xl bg-white/5 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-[#ecf95a] resize-y font-mono"
        />

        {/* Small corner paste button */}
        <button
          type="button"
          onClick={handlePaste}
          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#ecf95a] text-white/80 hover:text-[#191314] border border-white/15 hover:border-[#ecf95a] transition-all flex items-center gap-1.5 text-[11px] font-mono font-bold cursor-pointer backdrop-blur-sm"
        >
          {isPasted ? (
            <>
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Pasted!</span>
            </>
          ) : (
            <>
              <Clipboard className="w-3 h-3 shrink-0" />
              <span>Paste</span>
            </>
          )}
        </button>
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
