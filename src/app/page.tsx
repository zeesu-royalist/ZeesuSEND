import { HeroSection } from '@/components/landing/hero-section';
import { MissionSection } from '@/components/landing/mission-section';
import { FeatureGrid } from '@/components/landing/feature-grid';
import { SecuritySection } from '@/components/landing/security-section';
import { FAQSection } from '@/components/landing/faq-section';

export default function HomePage() {
  return (
    <div className="w-full space-y-12 sm:space-y-20 pb-16">
      {/* 1. HERO SECTION (WITH INTEGRATED UPLOAD DROPZONE) */}
      <HeroSection />

      {/* 2. OUR MISSION SECTION */}
      <MissionSection />

      {/* 3. FEATURE GRID (4 CARDS, 1 HIGHLIGHTED LIME CARD) */}
      <FeatureGrid />

      {/* 4. SECURITY SECTION */}
      <SecuritySection />

      {/* 5. FAQ ACCORDION SECTION */}
      <FAQSection />
    </div>
  );
}
