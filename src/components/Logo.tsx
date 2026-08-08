import React, { memo } from 'react';

interface LogoProps {
  variant?: 'badge' | 'dark' | 'light';
  className?: string;
}

export const Logo: React.FC<LogoProps> = memo(({ variant = 'badge', className = '' }) => {
  if (variant === 'badge') {
    return (
      <div className={`bg-[#ffcb04] px-4 py-1.5 rounded-b-md shadow-md flex items-center justify-center hover:scale-105 transition-transform cursor-pointer ${className}`}>
        <img
          src="/assets/logo/logo-black.png"
          alt="HOPE The Organizer Logo"
          loading="eager"
          decoding="async"
          className="h-8 sm:h-9 w-auto object-contain max-w-[130px]"
        />
      </div>
    );
  }

  if (variant === 'dark') {
    return (
      <div className={`flex items-center ${className}`}>
        <img
          src="/assets/logo/logo-white.png"
          alt="HOPE The Organizer Logo White"
          loading="eager"
          decoding="async"
          className="h-14 sm:h-16 md:h-20 lg:h-24 w-auto object-contain max-w-[280px]"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/assets/logo/logo-black.png"
        alt="HOPE The Organizer Logo"
        loading="eager"
        decoding="async"
        className="h-12 sm:h-14 w-auto object-contain max-w-[200px]"
      />
    </div>
  );
});

Logo.displayName = 'Logo';
