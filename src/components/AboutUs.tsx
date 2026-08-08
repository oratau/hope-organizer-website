import React from 'react';
import { WatermarkBg } from './WatermarkBg';
import { FooterContactCard } from './FooterContactCard';
import { Translations } from '../i18n';

interface AboutUsProps {
  t: Translations;
}

export const AboutUs: React.FC<AboutUsProps> = ({ t }) => {
  return (
    <section id="about-us" className="min-h-screen py-24 border-b border-white/10 relative overflow-hidden">
      <WatermarkBg />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-10">
        
        {/* Title Box with Yellow Highlight */}
        <div>
          <div className="title-box-gold text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
            {t.aboutUs.heading}
          </div>
        </div>

        {/* 2 Centered Paragraphs */}
        <div className="space-y-6 text-gray-200 font-serif text-base sm:text-lg leading-relaxed max-w-3xl mx-auto text-justify sm:text-center">
          <p>
            Hope The Organizer is an event organizer company with a long journey of growth and experience, evolving from a trade business established in the early 2000s into a professional event management company. Led by Martin Teguh A.S., HOPE has developed a solid and loyal team dedicated to delivering high-quality services.
          </p>
          <p>
            The company continues to grow by focusing on professionalism, creativity, and strong teamwork, allowing them to handle various types of events and build long-term relationships with clients. Their experience and consistency have shaped HOPE into a trusted organizer in the industry.
          </p>
        </div>

        {/* Footer Contact Card Asset */}
        <div className="pt-8">
          <FooterContactCard t={t} />
        </div>

      </div>
    </section>
  );
};
