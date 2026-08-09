import React from 'react';
import { SectionBadge } from '@/components/ui/section-badge';
import { ShieldCheck, Zap, Clock, HardDrive, ArrowUpRight } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isHighlighted?: boolean;
}

function FeatureCard({ icon, title, description, isHighlighted = false }: FeatureCardProps) {
  return (
    <div
      className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover-lift border ${
        isHighlighted
          ? 'bg-[#ecf95a] text-[#191314] border-[#191314]/15 shadow-xl'
          : 'bg-[#ffffff] text-[#191314] border-[#191314]/10 shadow-sm hover:shadow-md hover:border-[#191314]/20'
      }`}
    >
      <div className="space-y-5">
        {/* Icon Container */}
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isHighlighted ? 'bg-[#191314] text-[#ecf95a]' : 'bg-[#f4f4f4] text-[#191314]'
          }`}
        >
          {icon}
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isHighlighted ? 'text-[#191314]/80' : 'text-[#191314]/70'
            }`}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Learn More Link */}
      <div className="pt-6 mt-4 border-t border-[#191314]/10 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
        <span>Learn more</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

export function FeatureGrid() {
  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'End-to-End Encryption',
      description: 'Files are securely encrypted in transit and at rest with bank-grade algorithms.',
      isHighlighted: false,
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Sharing',
      description: 'Generate a short 6-character key and shareable link the moment upload completes.',
      isHighlighted: true, // Lime Highlighted Card
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Auto-Expiring Links',
      description: 'Set custom expiration times from 1 hour to 7 days or limit download counts.',
      isHighlighted: false,
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      title: 'Large File Support',
      description: 'Send large high-resolution media, archives, and files without restrictive size caps.',
      isHighlighted: false,
    },
  ];

  return (
    <section id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex justify-center">
          <SectionBadge>Features</SectionBadge>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191314] tracking-tight">
          We offer a safe, user-friendly, and efficient File Transfer App
        </h2>
        <p className="text-sm text-[#191314]/70">
          We envision a seamless web experience where individuals have complete control over their shared media.
        </p>
      </div>

      {/* 4 Feature Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, i) => (
          <FeatureCard
            key={i}
            icon={feat.icon}
            title={feat.title}
            description={feat.description}
            isHighlighted={feat.isHighlighted}
          />
        ))}
      </div>
    </section>
  );
}
