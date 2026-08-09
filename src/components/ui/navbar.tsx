'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PillButton } from './pill-button';
import { Download } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#ffffff]/90 backdrop-blur-md border-b border-[#191314]/10 transition-colors rounded-b-3xl overflow-hidden shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* LOGO MARK */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#191314] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
            <span className="text-[#ecf95a] font-extrabold text-xl tracking-tighter">Z</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-[#191314]">
            Zeesu<span className="text-[#191314]/60">SEND</span>
          </span>
        </Link>

        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#191314]/70">
          <a href="#how-it-works" className="hover:text-[#191314] transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-[#191314] transition-colors">
            Features
          </a>
          <a href="#security" className="hover:text-[#191314] transition-colors">
            Security
          </a>
          <a href="#faqs" className="hover:text-[#191314] transition-colors">
            FAQs
          </a>
        </nav>

        {/* TOP-RIGHT ACTION BUTTON */}
        <div className="flex items-center gap-3">
          <Link href="/receive">
            <PillButton variant="dark" size="sm" className="hidden sm:inline-flex">
              Receive File
            </PillButton>
            <PillButton variant="dark" size="sm" className="sm:hidden">
              <Download className="w-4 h-4" />
            </PillButton>
          </Link>
        </div>
      </div>
    </header>
  );
}
