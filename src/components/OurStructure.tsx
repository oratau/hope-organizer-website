import React from 'react';
import { WatermarkBg } from './WatermarkBg';
import { FooterContactCard } from './FooterContactCard';
import { Translations } from '../i18n';

interface OurStructureProps {
  t: Translations;
}

const Node = ({
  title,
  name,
  size = 'sm',
}: {
  title: string;
  name: string;
  size?: 'xl' | 'lg' | 'md' | 'sm';
}) => (
  <div className="text-center">
    <h3
      className={`font-serif font-bold text-[#ffcb04] leading-tight ${
        size === 'xl' ? 'text-3xl sm:text-4xl' :
        size === 'lg' ? 'text-2xl sm:text-3xl' :
        size === 'md' ? 'text-xl sm:text-2xl' :
        'text-base sm:text-lg'
      }`}
    >
      {title}
    </h3>
    <p className="text-white font-medium mt-1 font-serif text-sm sm:text-base">{name}</p>
  </div>
);

export const OurStructure: React.FC<OurStructureProps> = ({ t }) => {
  return (
    <section id="our-structure" className="min-h-screen py-24 border-b border-white/10 relative overflow-hidden">
      <WatermarkBg />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-10">

        {/* Title */}
        <div>
          <div className="title-box-navy text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            {t.ourStructure.heading}
          </div>
        </div>

        {/* ── Org Chart ── */}
        <div className="font-serif pb-4 select-none">

          {/* Level 1: Director → vertical line → General Manager */}
          <div className="flex flex-col items-center gap-0">
            <Node title="Director" name="Martin Teguh A S" size="xl" />
            <div className="w-px h-10 bg-white/70 mt-2" />
            <Node title="General Manager" name="Fernanda Rafaella M" size="lg" />
            <div className="w-px h-10 bg-white/70 mt-2" />
          </div>

          {/* Level 3 + Production Manager block */}
          {/*
            Layout (desktop):
            ─────────────────────────────── ← horizontal bar (top)
              │       │          │       │   ← 4 drop lines
            [GD]  [Admin]   [Oper]   [MD]
                              │           ← center drop to Production
                        [Production]
          */}
          <div className="hidden md:block relative w-full" style={{ minHeight: '260px' }}>

            {/* Horizontal bar at top */}
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-white/70" />

            {/* Center vertical drop — from horizontal bar down to Production Manager */}
            {/* Production Manager sits at ~200px below top (4-col height ~130px + gap ~70px) */}
            <div className="absolute top-0 left-1/2 -translate-x-px w-px bg-white/70" style={{ height: '175px' }} />

            {/* 4 columns for level-3 nodes */}
            <div className="grid grid-cols-4 gap-4 w-full">

              {/* Col 1: Graphic Designer Manager */}
              <div className="flex flex-col items-center">
                <div className="w-px h-10 bg-white/70" />
                <Node title="Graphic Designer Manager" name="Priandoko Abadi" size="sm" />
              </div>

              {/* Col 2: Admin & Finance Manager */}
              <div className="flex flex-col items-center">
                <div className="w-px h-10 bg-white/70" />
                <Node title="Admin & Finance Manager" name="Nita Mariati" size="sm" />
              </div>

              {/* Col 3: Operational Manager */}
              <div className="flex flex-col items-center">
                <div className="w-px h-10 bg-white/70" />
                <Node title="Operational Manager" name="Andriady Ibrahim" size="sm" />
              </div>

              {/* Col 4: Motion Designer Manager */}
              <div className="flex flex-col items-center">
                <div className="w-px h-10 bg-white/70" />
                <Node title="Motion Designer Manager" name="Khris Badawi" size="sm" />
              </div>

            </div>

            {/* Production Manager — centered below, connected by center vertical line */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '175px' }}>
              <Node title="Production Manager" name="Christopher Sanjaya" size="md" />
            </div>

          </div>

          {/* Mobile fallback — stacked vertically */}
          <div className="md:hidden flex flex-col items-center gap-4 mt-4">
            {[
              { title: 'Graphic Designer Manager', name: 'Priandoko Abadi' },
              { title: 'Admin & Finance Manager', name: 'Nita Mariati' },
              { title: 'Operational Manager', name: 'Andriady Ibrahim' },
              { title: 'Motion Designer Manager', name: 'Khris Badawi' },
              { title: 'Production Manager', name: 'Christopher Sanjaya' },
            ].map((n) => (
              <div key={n.title} className="flex flex-col items-center">
                <div className="w-px h-6 bg-white/70" />
                <Node title={n.title} name={n.name} size="sm" />
              </div>
            ))}
          </div>

        </div>

        {/* Footer Contact Card */}
        <div className="pt-36 md:pt-16">
          <FooterContactCard t={t} />
        </div>

      </div>
    </section>
  );
};
