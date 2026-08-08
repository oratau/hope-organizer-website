import React from 'react';
import { WatermarkBg } from './WatermarkBg';
import { FooterContactCard } from './FooterContactCard';
import { Translations } from '../i18n';

interface OurMissionProps {
  t: Translations;
}

export const OurMission: React.FC<OurMissionProps> = ({ t }) => {
  return (
    <section id="our-mission" className="min-h-screen py-24 border-b border-white/10 relative overflow-hidden">
      <WatermarkBg />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-12">
        
        {/* Title Box with Navy Highlight */}
        <div>
          <div className="title-box-navy text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            {t.ourMission.heading}
          </div>
        </div>

        {/* 3 Points Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto font-serif">
          
          {/* Point 1 */}
          <div className="space-y-3 bg-[#111625] p-6 md:p-8 border border-white/10 rounded-sm hover:border-[#ffcb04]/40 transition-colors">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#ffcb04] flex items-center">
              <span className="mr-2 text-xl">•</span>Gives A Different Color
            </h3>
            <p className="text-gray-200 font-serif text-base leading-relaxed">
              HOPE aims to bring a fresh, unique touch to every event they handle. They focus on creativity and innovation to ensure each project stands out and feels different from others.
            </p>
          </div>

          {/* Point 2 */}
          <div className="space-y-3 bg-[#111625] p-6 md:p-8 border border-white/10 rounded-sm hover:border-[#ffcb04]/40 transition-colors">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#ffcb04] flex items-center">
              <span className="mr-2 text-xl">•</span>Best Service
            </h3>
            <p className="text-gray-200 font-serif text-base leading-relaxed">
              HOPE is committed to delivering high-quality, professional service in every aspect of their work, from planning to execution, ensuring smooth and successful events.
            </p>
          </div>

          {/* Point 3 (Centered below) */}
          <div className="md:col-span-2 md:max-w-2xl md:mx-auto w-full space-y-3 bg-[#111625]/80 p-6 md:p-8 border border-white/10 rounded-sm backdrop-blur-sm hover:border-[#ffcb04]/40 transition-colors">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#ffcb04] flex items-center">
              <span className="mr-2 text-xl">•</span>Client Satisfaction
            </h3>
            <p className="text-gray-200 font-serif text-base leading-relaxed">
              The ultimate goal is to achieve maximum client satisfaction, by meeting expectations, maintaining strong communication, and delivering results that align with the client's vision.
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
