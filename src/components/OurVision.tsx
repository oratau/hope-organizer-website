import React from 'react';
import { WatermarkBg } from './WatermarkBg';
import { FooterContactCard } from './FooterContactCard';
import { Translations } from '../i18n';

interface OurVisionProps {
  t: Translations;
}

export const OurVision: React.FC<OurVisionProps> = ({ t }) => {
  return (
    <section id="our-vision" className="min-h-screen py-24 border-b border-white/10 relative overflow-hidden">
      <WatermarkBg />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-12">
        
        {/* Title Box with Navy Highlight */}
        <div>
          <div className="title-box-navy text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            {t.ourVision.heading}
          </div>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 text-left font-serif">
          
          {/* Left Column */}
          <div className="space-y-3 bg-[#111625] p-6 md:p-8 border border-white/10 rounded-sm hover:border-[#ffcb04]/40 transition-colors">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#ffcb04] flex items-center">
              <span className="mr-2 text-xl">•</span>To Be Number One
            </h3>
            <p className="text-gray-200 font-serif text-base leading-relaxed">
              HOPE aims to become a leading and top-tier event organizer in the industry. They strive to outperform competitors in terms of service quality, creativity, and client trust.
            </p>
          </div>

          {/* Right Column */}
          <div className="space-y-3 bg-[#111625] p-6 md:p-8 border border-white/10 rounded-sm hover:border-[#ffcb04]/40 transition-colors">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#ffcb04] flex items-center">
              <span className="mr-2 text-xl">•</span>Great Concept
            </h3>
            <p className="text-gray-200 font-serif text-base leading-relaxed">
              HOPE's focus on delivering strong, creative, and unique event concepts. They don't just organize events, but create memorable experiences with distinctive ideas that stand out.
            </p>
          </div>

        </div>

        {/* Footer Contact Card Asset */}
        <div className="pt-8">
          <FooterContactCard t={t} />
        </div>

      </div>
    </section>
  );
};
