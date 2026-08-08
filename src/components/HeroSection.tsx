import React, { memo } from 'react';
import { Logo } from './Logo';
import { Translations } from '../i18n';

interface HeroSectionProps {
  t: Translations;
}

export const HeroSection: React.FC<HeroSectionProps> = memo(({ t }) => {
  return (
    <section id="hero" className="relative min-h-[85vh] bg-[#0a0a0a] overflow-hidden flex items-center">
      
      {/* 1. Background Event Photo Collage Asset (100% Opacity & Full RGB Color) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/hero/Photo HeroSection.png"
          alt="HOPE Hero Event Collage"
          decoding="async"
          loading="lazy"
          className="w-full h-full object-cover opacity-100"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80';
          }}
        />
      </div>

      {/* Content Container (Shifted Further to the Far Left) */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Shifted to Far Left Edge */}
          <div className="lg:col-span-9 xl:col-span-10 space-y-0 -ml-2 sm:-ml-4 md:-ml-8 lg:-ml-12">
            
            {/* White HOPE Logo Overlapping the top-left of the navy box */}
            <div className="relative z-20 pl-2 sm:pl-4 mb-[-20px] sm:mb-[-28px] md:mb-[-34px]">
              <Logo variant="dark" />
            </div>

            {/* Solid Navy Headline Box Fitted Tightly Around "We Serve Different." */}
            <div className="bg-[#192b58] px-6 sm:px-8 py-4 sm:py-5 shadow-2xl relative z-10 border border-navy-light/30 w-fit">
              <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-none whitespace-nowrap">
                {t.hero.servesDifferent}
              </h1>
            </div>

            {/* Paragraph Text Container Width Adjusted to Match the Navy Box Width */}
            <div className="pt-3 sm:pt-4 px-1 max-w-[540px]">
              <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed font-serif drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                {t.hero.description}
              </p>
            </div>

          </div>

          {/* Right Counter Banner */}
          <div className="lg:col-span-3 xl:col-span-2 flex flex-col items-center lg:items-end justify-center text-center lg:text-right space-y-1">
            <span className="font-serif text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.95)]">
              5000+
            </span>
            <span className="font-serif italic text-2xl sm:text-3xl lg:text-4xl text-[#ffcb04] font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              Different Clients
            </span>
            <div className="w-24 h-1 bg-[#ffcb04] mt-2 rounded-full shadow-lg" />
          </div>

        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
