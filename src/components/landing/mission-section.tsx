import React from 'react';
import { SectionBadge } from '@/components/ui/section-badge';

export function MissionSection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
      <div className="flex justify-center">
        <SectionBadge>Our Mission</SectionBadge>
      </div>

      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#191314] tracking-tight leading-tight max-w-3xl mx-auto">
        We provide a secure, intuitive, and efficient platform
      </h2>

      <p className="text-base sm:text-lg text-[#191314]/70 max-w-2xl mx-auto leading-relaxed">
        We believe in a private internet where everyone has complete control over their shared files, without forced registration or surveillance.
      </p>
    </section>
  );
}
