'use client';

import React from 'react';
import { PillButton } from '@/components/ui/pill-button';
import { CircularBadge } from '@/components/ui/circular-badge';
import { GlassStatCard } from '@/components/ui/glass-stat-card';
import { SendContainer } from '@/components/send/send-container';
import CursorGrid from '@/components/ui/cursor-grid';
import { Monitor, Puzzle } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative w-full px-0 sm:px-4 py-2 sm:py-3">
      {/* Outer Hero Frame Container */}
      <div className="relative bg-gradient-to-b from-[#f4f4f4] via-[#f4f4f4]/40 to-white rounded-[36px] sm:rounded-[44px] p-3 border-t border-l border-r border-[#191314]/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 items-stretch relative">
          
          {/* ================= LEFT CARD (WHITE PANEL) ================= */}
          <div className="bg-[#ffffff] rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 lg:p-14 flex flex-col justify-between min-h-[560px] lg:min-h-[620px] shadow-sm border border-[#191314]/5 relative overflow-hidden">
            {/* Interactive Cursor Grid Background */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <CursorGrid
                cellSize={70}
                color="#eaf94bff"
                radius={140}
                falloff="smooth"
                holdTime={400}
                fadeDuration={800}
                lineWidth={1.2}
                maxOpacity={1}
                fillOpacity={0}
                gridOpacity={0}
                cellRadius={0}
                clickPulse
                pulseSpeed={600}
              />
            </div>

            <div className="space-y-6 relative z-10">
              {/* Headlines matching reference line-height and monospace font */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191314] tracking-tight leading-[1.06] font-mono">
                Secure &<br />
                Easy-to-Use<br />
                File Transfer
              </h1>

              {/* Subtext */}
              <p className="text-xs sm:text-sm text-[#191314]/70 font-mono leading-relaxed max-w-md pt-2">
                Store, Send & Receive Files with Confidence, trusted by{' '}
                <a
                  href="http://zeesu-royalist.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whitespace-nowrap bg-[#ecf95a] text-black px-2 py-0.5 rounded font-bold hover:underline"
                >
                  Zeesu Royalist
                </a>
              </p>

              {/* Secondary Headline */}
              <h1 className="hidden lg:block text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#191314] tracking-tight leading-[1.06] font-mono">
                Quick Downloads<br />
                Zero Worries
              </h1>

              {/* Primary CTA Lime Pill Button */}
              <div className="pt-4">
                <a href="#upload-area">
                  <PillButton
                    variant="primary"
                    size="lg"
                    className="px-7 py-3.5 text-sm font-extrabold shadow-sm"
                  >
                    Get Started
                  </PillButton>
                </a>
              </div>
            </div>

            {/* Bottom App/Store Pill Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-12 relative z-10">
              <div className="px-4 py-2.5 rounded-full bg-white border border-[#191314]/20 text-[#191314] text-xs font-bold font-mono inline-flex items-center gap-2 shadow-sm hover:bg-[#f4f4f4] cursor-pointer transition-colors">
                <span>Desktop App</span>
                <Monitor className="w-4 h-4 text-[#191314]" />
              </div>

              <div className="px-4 py-2.5 rounded-full bg-white border border-[#191314]/20 text-[#191314] text-xs font-bold font-mono inline-flex items-center gap-2 shadow-sm hover:bg-[#f4f4f4] cursor-pointer transition-colors">
                <span>Browser Ext</span>
                <Puzzle className="w-4 h-4 text-[#191314]" />
              </div>
            </div>
          </div>

          {/* ================= RIGHT CARD (LIME PANEL) ================= */}
          <div
            id="upload-area"
            className="bg-[#ecf95a] rounded-[28px] sm:rounded-[36px] p-6 sm:p-10 relative overflow-hidden flex flex-col items-center justify-center min-h-[560px] lg:min-h-[620px] shadow-sm border border-[#191314]/10"
          >
            {/* FLOATING GLASS STAT CARD (Overlapping Top-Left of Lime Panel) */}
            <div className="absolute top-6 left-6 z-20 hidden sm:block animate-fadeIn">
              <GlassStatCard />
            </div>

            {/* DEVICE MOCKUP FRAME (MOBILE PHONE ON MOBILE, LAPTOP/DESKTOP WINDOW ON DESKTOP) */}
            <div className="relative w-full max-w-[340px] sm:max-w-[370px] lg:max-w-xl lg:w-full bg-[#191314] rounded-[44px] lg:rounded-[28px] p-4 sm:p-5 lg:p-6 shadow-2xl border-[6px] lg:border-[4px] border-[#262021] text-white my-6 lg:my-8 transition-all duration-300">
              {/* Phone Volume Button Nubs (Mobile only) */}
              <div className="absolute -left-[9px] top-24 w-[3px] h-8 bg-[#332c2e] rounded-l-md lg:hidden" />
              <div className="absolute -left-[9px] top-36 w-[3px] h-12 bg-[#332c2e] rounded-l-md lg:hidden" />
              <div className="absolute -left-[9px] top-52 w-[3px] h-12 bg-[#332c2e] rounded-l-md lg:hidden" />

              {/* Phone Notch / Speaker Island (Mobile only) */}
              <div className="w-28 h-4 bg-black rounded-full mx-auto mb-4 flex items-center justify-center gap-1.5 lg:hidden">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
                <div className="w-2 h-2 rounded-full bg-blue-900/60" />
              </div>

              {/* Desktop Window Title Bar (Laptop / Desktop only) */}
              <div className="hidden lg:flex items-center justify-between pb-3.5 mb-4 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="ml-3 px-3 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-[11px] text-white/70 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>https://zeesusend.app/upload</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#ecf95a]/20 text-[#ecf95a] text-[10px] font-bold uppercase font-mono tracking-wider">
                  AES-256 Encrypted
                </span>
              </div>

              {/* Internal Phone Screen Header (Mobile only) */}
              <div className="flex lg:hidden items-center justify-between px-2 pb-3 mb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#ecf95a] text-[#191314] flex items-center justify-center font-extrabold text-xs">
                    Z
                  </div>
                  <span className="font-bold text-xs font-mono">ZeesuSEND App</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#ecf95a]/20 text-[#ecf95a] text-[10px] font-bold uppercase font-mono">
                  Encrypted
                </span>
              </div>

              {/* FUNCTIONAL SENDER CONTAINER */}
              <SendContainer />
            </div>

            {/* BOTTOM RIGHT WHITE CORNER NOTCH & CAPTION */}
            <div className="absolute bottom-0 right-0 bg-[#ffffff] rounded-tl-2xl py-2 px-4 shadow-sm border-t border-l border-[#191314]/10 hidden sm:block">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#191314] font-mono">
                CREATE YOUR TRANSFER WITH EASE
              </span>
            </div>
          </div>

          {/* ================= CIRCULAR ROTATING BADGE ================= */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30 hidden lg:block">
            <a href="#upload-area">
              <CircularBadge />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
