import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
  children: React.ReactNode;
  asChild?: boolean;
}

export function PillButton({
  variant = 'primary',
  size = 'md',
  showArrow = false,
  children,
  className = '',
  ...props
}: PillButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-full transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#ecf95a] text-[#191314] hover:bg-[#dbe937] shadow-sm hover:shadow-md border border-[#191314]/10',
    secondary:
      'bg-[#ffffff] text-[#191314] hover:bg-[#f4f4f4] border border-[#191314]/20 shadow-sm',
    dark:
      'bg-[#191314] text-[#ffffff] hover:bg-black shadow-md',
    outline:
      'bg-transparent text-[#191314] hover:bg-[#f4f4f4] border border-[#191314]/20',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <span>{children}</span>
      {(showArrow || variant === 'primary') && (
        <ArrowUpRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </button>
  );
}
