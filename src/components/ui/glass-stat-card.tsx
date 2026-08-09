import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface GlassStatCardProps {
  className?: string;
}

export function GlassStatCard({ className = '' }: GlassStatCardProps) {
  return (
    <div
      className={`bg-white/50 backdrop-blur-xl rounded-[22px] p-4 shadow-xl border border-white/80 min-w-[210px] sm:min-w-[230px] font-mono select-none ${className}`}
    >
      <div className="text-[11px] font-semibold text-[#191314]/60 tracking-tight mb-1">
        Transferred Today
      </div>

      <div className="text-xl sm:text-2xl font-extrabold text-[#191314] tracking-tight mb-2">
        14,892.00 <span className="text-xs font-semibold text-[#191314]/60">Files</span>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-[#191314]/70">
        <span>3.8 TB Volume</span>
        <span className="inline-flex items-center font-bold px-1.5 py-0.5 rounded-full bg-[#ecf95a] text-[#191314]">
          ↗ 100%
        </span>
      </div>
    </div>
  );
}
