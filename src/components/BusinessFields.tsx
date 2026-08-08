import React from 'react';
import { WatermarkBg } from './WatermarkBg';
import { Translations } from '../i18n';

interface BusinessFieldsProps {
  t: Translations;
}

export const BusinessFields: React.FC<BusinessFieldsProps> = ({ t }) => {
  return (
    <section id="business-fields" className="min-h-screen py-20 border-b border-white/10 relative overflow-hidden">
      <WatermarkBg />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="font-serif italic text-4xl sm:text-5xl font-bold text-white tracking-wide">
            {t.businessFields.heading}
          </h2>
        </div>

        {/* Bento Grid Asset Recreation matching exact image */}
        <div className="max-w-5xl mx-auto space-y-2 font-serif">
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-4 bg-[#ffcb04] py-8 px-6 flex items-center justify-center text-center shadow-lg hover:brightness-105 transition-all">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#192b58] tracking-tight leading-none">
                Grand Opening
              </h3>
            </div>
            <div className="md:col-span-8 bg-[#192b58] py-8 px-6 flex items-center justify-center text-center shadow-lg border border-navy-light/40 hover:bg-navy-light transition-all">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#ffcb04] tracking-tight leading-none">
                Party Consultant & Organizer
              </h3>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-3 bg-[#ffcb04] py-8 px-4 flex items-center justify-center text-center shadow-lg hover:brightness-105 transition-all">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#192b58] tracking-tight leading-none">
                Concert
              </h3>
            </div>
            <div className="md:col-span-5 bg-[#192b58] py-8 px-4 flex items-center justify-center text-center shadow-lg border border-navy-light/40 hover:bg-navy-light transition-all">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#ffcb04] tracking-tight leading-none">
                Product Launching
              </h3>
            </div>
            <div className="md:col-span-4 bg-[#ffcb04] py-8 px-4 flex items-center justify-center text-center shadow-lg hover:brightness-105 transition-all">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#192b58] tracking-tight leading-none">
                Exhibition
              </h3>
            </div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-7 bg-[#192b58] py-8 px-6 flex items-center justify-center text-center shadow-lg border border-navy-light/40 hover:bg-navy-light transition-all">
              <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#ffcb04] tracking-tight leading-none">
                Family & Company Gathering
              </h3>
            </div>
            <div className="md:col-span-5 bg-[#ffcb04] py-8 px-6 flex items-center justify-center text-center shadow-lg hover:brightness-105 transition-all">
              <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#192b58] tracking-tight leading-none">
                Advertising
              </h3>
            </div>
          </div>

          {/* Row 4 - Full Width Wide Banner */}
          <div className="bg-[#ffcb04] py-8 px-6 flex items-center justify-center text-center shadow-xl hover:brightness-105 transition-all">
            <h3 className="font-serif text-2xl sm:text-4xl lg:text-4xl font-bold text-[#192b58] tracking-tight leading-none">
              Create Corporate Promotional Merchandise
            </h3>
          </div>

        </div>

      </div>
    </section>
  );
};
