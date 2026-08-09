'use client';

import Link from 'next/link';
import { ArrowUp, ArrowUpRight, ShieldCheck, Zap, Lock, Heart } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-20 bg-[#ecf95a] text-[#191314] rounded-t-[36px] sm:rounded-t-[48px] border-t border-[#191314]/15 font-mono overflow-hidden">
      {/* TOP CALL-TO-ACTION BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8">
        <div className="bg-[#191314] text-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-white/10">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ecf95a]/20 text-[#ecf95a] text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant & Anonymous</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Ready to Send Files Securely?
            </h2>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans">
              No account, email, or passwords required. Upload your file, get your 6-character key, and share instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={scrollToTop}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ecf95a] hover:bg-[#dbe937] text-[#191314] font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Upload File Now</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <Link href="/receive" className="w-full sm:w-auto">
              <div className="w-full px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                <span>Receive File</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* MULTI-COLUMN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-[#191314]/15">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* COLUMN 1: BRAND & CREATOR (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#191314] flex items-center justify-center text-[#ecf95a] font-black text-xl shadow-md">
                Z
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-[#191314]">
                Zeesu<span className="opacity-70">SEND</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#191314]/80 leading-relaxed font-normal">
              Fast, private, and end-to-end encrypted file sharing platform. Send large files, media, or text anonymously without tracking or signup.
            </p>

            {/* CREATOR BADGE */}
            <div className="pt-2">
              <a
                href="http://zeesu-royalist.github.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#191314] text-[#ecf95a] text-xs font-bold shadow-sm hover:scale-[1.02] transition-transform"
              >
                <span>Powered by</span>
                <span className="underline decoration-[#ecf95a] underline-offset-2">Zeesu Royalist</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* COLUMN 2: QUICK NAVIGATION (2 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#191314]/60">
              Product Nav
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-bold">
              <li>
                <a href="#how-it-works" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Platform Features
                </a>
              </li>
              <li>
                <a href="#security" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Security Specs
                </a>
              </li>
              <li>
                <a href="#faqs" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  FAQs & Knowledge
                </a>
              </li>
              <li>
                <Link href="/receive" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Receive File Key
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: PLATFORM CAPABILITIES (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#191314]/60">
              Capabilities
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#191314] shrink-0" />
                <span>AES-256 GCM Encrypted</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#191314] shrink-0" />
                <span>100MB File Size Limits</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#191314] shrink-0" />
                <span>Zero Account Credentials</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#191314]" />
                <span>Auto-Purge Expiration</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#191314]" />
                <span>Zip Archive Download</span>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: TRUST & LEGAL (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#191314]/60">
              Trust & Legal
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm font-bold">
              <li>
                <Link href="/privacy" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#security" className="hover:underline opacity-90 hover:opacity-100 transition-opacity">
                  Security Overview
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold">
        {/* COPYRIGHT & BRAND */}
        <div className="flex items-center gap-2">
          <span>&copy; {new Date().getFullYear()} ZeesuSEND. All rights reserved.</span>
        </div>

        {/* BACK TO TOP BUTTON */}
        <button
          onClick={scrollToTop}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#191314] text-white hover:bg-black transition-colors shadow-sm cursor-pointer text-xs"
        >
          <span>Back to top</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
}
