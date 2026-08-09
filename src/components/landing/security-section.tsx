import React from 'react';
import { SectionBadge } from '@/components/ui/section-badge';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export function SecuritySection() {
  return (
    <section id="security" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* LEFT COLUMN: MOCKUP PREVIEW CARD */}
        <div className="lg:col-span-6">
          <div className="bg-[#f4f4f4] rounded-[36px] p-6 sm:p-10 border border-[#191314]/10 shadow-lg flex items-center justify-center">
            <div className="w-full max-w-sm bg-[#191314] rounded-3xl p-6 text-white space-y-6 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ecf95a] text-[#191314] flex items-center justify-center font-bold text-xs">
                    Z
                  </div>
                  <span className="font-bold text-sm">Security Guard</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                  100% Private
                </span>
              </div>

              {/* Mockup Progress Indicator */}
              <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <div className="flex justify-between text-xs font-mono text-white/70">
                  <span>Transfer Key:</span>
                  <span className="text-[#ecf95a] font-bold">X7K9P2</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-[#ecf95a]" />
                </div>
                <p className="text-[11px] text-white/50 text-center font-mono">
                  AES-256 GCM Encrypted payload
                </p>
              </div>

              <div className="space-y-2 text-xs text-white/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ecf95a]" />
                  <span>No account or email recorded</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ecf95a]" />
                  <span>Expiring signed bucket access</span>
                </div>
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-[#ecf95a]" />
                  <span>Zero trackers or analytics profiling</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: TEXT CONTENT */}
        <div className="lg:col-span-6 space-y-6">
          <SectionBadge>Security</SectionBadge>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191314] tracking-tight leading-tight">
            Secure & Private File Transfer
          </h2>

          <p className="text-base text-[#191314]/75 leading-relaxed">
            Industry-leading encryption and direct signed uploads ensure your files are only accessible to people who possess the unique 6-character key.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#ecf95a] text-[#191314] flex items-center justify-center shrink-0 font-bold">
                01
              </div>
              <div>
                <h4 className="text-base font-bold text-[#191314]">Zero-Knowledge Storage</h4>
                <p className="text-xs sm:text-sm text-[#191314]/70 mt-0.5">
                  We don’t analyze your files or link uploads to user profiles. Anonymous by design.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#f4f4f4] border border-[#191314]/15 text-[#191314] flex items-center justify-center shrink-0 font-bold">
                02
              </div>
              <div>
                <h4 className="text-base font-bold text-[#191314]">Automatic File Purging</h4>
                <p className="text-xs sm:text-sm text-[#191314]/70 mt-0.5">
                  Once your transfer expires or reaches its download limit, stored objects are permanently deleted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
