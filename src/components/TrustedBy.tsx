import React, { memo } from 'react';
import { Translations } from '../i18n';

interface TrustedByProps {
  t: Translations;
}

export const TrustedBy: React.FC<TrustedByProps> = memo(({ t }) => {
  // Using exact uploaded files (PNG and SVG)
  const uploadedLogos = [
    { name: 'Angkasa Pura', file: 'logo-1.png', largeSize: false, extraLarge: false, noFilter: true }, // No filter
    { name: 'Pertamina', file: 'logo-2.png', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Mandiri', file: 'logo-3.svg', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Toyota', file: 'logo-4.svg', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'BCA', file: 'logo-5.png', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Partner 6', file: 'logo-6.png', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Partner 7', file: 'logo-7.png', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Partner 8', file: 'logo-8.png', largeSize: false, extraLarge: false, noFilter: true }, // No filter
    { name: 'Partner 9', file: 'logo-9.svg', largeSize: false, extraLarge: true, noFilter: false }, // EXTRA BESAR
    { name: 'Partner 10', file: 'logo-10.svg', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Partner 12', file: 'logo-12.svg', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Partner 13', file: 'logo-13.svg', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'XL Axiata', file: 'logo-14.svg', largeSize: true, extraLarge: false, noFilter: false }, // XL Axiata - diperbesar
    { name: 'Partner 15', file: 'logo-15.png', largeSize: false, extraLarge: false, noFilter: true }, // No filter
    { name: 'Partner 16', file: 'logo-16.png', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Partner 17', file: 'logo-17.png', largeSize: true, extraLarge: false, noFilter: false }, // DIPERBESAR
    { name: 'Hino', file: 'logo-18.png', largeSize: true, extraLarge: false, noFilter: false }, // Hino - diperbesar
    { name: 'Partner 19', file: 'logo-19.png', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Partner 20', file: 'logo-20.png', largeSize: false, extraLarge: false, noFilter: false },
    { name: 'Partner 21', file: 'logo-21.png', largeSize: false, extraLarge: false, noFilter: true }, // No filter
    { name: 'Partner 22', file: 'logo-22.png', largeSize: true, extraLarge: false, noFilter: false }, // DIPERBESAR
  ];

  // Repeat for continuous infinite marquee loop
  const marqueeList = [
    ...uploadedLogos,
    ...uploadedLogos,
    ...uploadedLogos,
    ...uploadedLogos,
  ];

  return (
    <section className="py-12 bg-[#0a0a0a] border-y border-white/10 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <h3 className="text-center font-serif italic text-2xl font-bold text-[#ffcb04] mb-6 tracking-wide drop-shadow">
          {t.trustedBy.heading}
        </h3>

        {/* Taller Outer Yellow Border Box (NO GLOW) */}
        <div className="border-2 border-[#ffcb04] bg-[#0a0a0a] py-5 sm:py-6 px-4 sm:px-8 rounded-none overflow-hidden relative shadow-none min-h-[110px] sm:min-h-[120px] flex items-center">
          
          {/* Edge Gradient Mask Fades */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

          {/* Infinite Auto Scroll Marquee Track */}
          <div className="overflow-hidden w-full">
            <div className="animate-marquee items-center gap-8 sm:gap-12">
              {marqueeList.map((partner, idx) => (
                <div
                  key={idx}
                  className={`${
                    partner.extraLarge
                      ? 'w-72 h-20 sm:w-80 sm:h-24'
                      : partner.largeSize 
                      ? 'w-56 h-16 sm:w-64 sm:h-20' 
                      : 'w-48 h-14 sm:w-56 sm:h-16'
                  } flex items-center justify-center p-2 flex-shrink-0 cursor-pointer hover:opacity-100 transition-all duration-300`}
                >
                  <img
                    src={`/assets/trusted-by/${partner.file}`}
                    alt={partner.name}
                    loading="lazy"
                    decoding="async"
                    className={`${
                      partner.extraLarge
                        ? 'h-14 sm:h-16 max-w-[260px] sm:max-w-[300px]'
                        : partner.largeSize 
                        ? 'h-11 sm:h-14 max-w-[220px] sm:max-w-[260px]' 
                        : 'h-10 sm:h-12 max-w-[180px] sm:max-w-[220px]'
                    } w-auto object-contain transition-all duration-300 hover:brightness-110`}
                    style={
                      partner.noFilter 
                        ? { opacity: 0.85 }
                        : {
                            filter: 'grayscale(100%) brightness(0) invert(1)',
                            opacity: 0.68
                          }
                    }
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const fallbackText = img.nextElementSibling;
                      if (fallbackText) fallbackText.classList.remove('hidden');
                    }}
                  />

                  {/* Fallback Text */}
                  <div className="hidden flex-col items-center justify-center text-center">
                    <span className="font-serif font-bold text-base sm:text-lg tracking-wider text-white uppercase">
                      {partner.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
});

TrustedBy.displayName = 'TrustedBy';
