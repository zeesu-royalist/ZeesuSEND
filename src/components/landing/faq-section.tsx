'use client';

import React, { useState } from 'react';
import { SectionBadge } from '@/components/ui/section-badge';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  number: string;
  question: string;
  answer: string;
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const faqs: FAQItem[] = [
    {
      number: '01',
      question: 'Is my data safe on this platform?',
      answer:
        'Yes. All files are uploaded securely over TLS/SSL encryption directly to isolated private storage buckets. Files can only be retrieved using the unique 6-character key generated at upload.',
    },
    {
      number: '02',
      question: 'What file types/sizes are supported?',
      answer:
        'We support virtually all file types including images, documents, archives, audio, video, and raw code files up to 100MB per file transfer.',
    },
    {
      number: '03',
      question: 'How long are my files stored?',
      answer:
        'By default, transfers expire after 24 hours. You can customize the expiration period from 1 hour to 7 days, or set a maximum download count after which files are automatically purged.',
    },
    {
      number: '04',
      question: 'How fast are transfers?',
      answer:
        'Transfers execute at max network speeds using direct signed browser uploads to global cloud storage endpoints, bypassing proxy bottlenecks.',
    },
    {
      number: '05',
      question: 'Are there any costs to use this?',
      answer:
        'ZeesuSEND is completely free for standard file transfers. No signup or credit card required.',
    },
    {
      number: '06',
      question: 'Can I password-protect a file?',
      answer:
        'Each transfer generates a random, cryptographically secure 6-character key. Optional password protection is coming in our next feature release.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="flex justify-center">
          <SectionBadge>FAQs</SectionBadge>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191314] tracking-tight">
          Frequently asked questions
        </h2>
        <p className="text-sm text-[#191314]/70">
          We have given answers to the most popular questions below
        </p>
      </div>

      {/* Numbered Accordion List */}
      <div className="border-t border-b border-[#191314]/15 divide-y divide-[#191314]/15">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.number} className="py-5 sm:py-6 transition-colors">
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between text-left gap-4 group focus:outline-none"
              >
                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                  <span className="text-sm font-bold text-[#191314]/50 group-hover:text-[#191314] transition-colors font-mono">
                    {faq.number}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#191314] tracking-tight">
                    {faq.question}
                  </h3>
                </div>

                {/* Lime Square +/- Toggle Button */}
                <div className="w-9 h-9 rounded-xl bg-[#ecf95a] text-[#191314] flex items-center justify-center shrink-0 border border-[#191314]/10 shadow-sm transition-transform duration-200 group-hover:scale-105">
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>

              {/* Accordion Expanded Answer */}
              {isOpen && (
                <div className="mt-4 pl-9 sm:pl-12 pr-12 text-xs sm:text-sm text-[#191314]/75 leading-relaxed font-normal animate-fadeIn">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
