import React from 'react';
import { ArrowDown } from 'lucide-react';

interface CircularBadgeProps {
  className?: string;
  onClick?: () => void;
}

export function CircularBadge({ className = '', onClick }: CircularBadgeProps) {
  return (
    <div
      onClick={onClick}
      className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center cursor-pointer group select-none ${className}`}
      role="button"
      tabIndex={0}
      aria-label="Scroll to learn more"
    >
      {/* Rotating Circular Text SVG */}
      <svg
        className="w-full h-full animate-spin-slow pointer-events-none p-1"
        viewBox="0 0 100 100"
      >
        <path
          id="circlePathHero"
          d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0"
          fill="none"
        />
        <text className="text-[9px] font-bold uppercase tracking-[0.2em] fill-[#191314]">
          <textPath href="#circlePathHero" startOffset="0%">
            Learn more • Learn more • Learn more •
          </textPath>
        </text>
      </svg>

      {/* Center Arrow Button */}
      <div className="absolute w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-transparent flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
        <ArrowDown className="w-5 h-5 text-[#191314] transition-transform duration-200 group-hover:translate-y-0.5" />
      </div>
    </div>
  );
}
