import React from 'react';

interface SectionBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionBadge({ children, className = '' }: SectionBadgeProps) {
  return (
    <div
      className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#f4f4f4] border border-[#191314]/15 text-[#191314] text-xs font-semibold tracking-wider uppercase ${className}`}
    >
      {children}
    </div>
  );
}
