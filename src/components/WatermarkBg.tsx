import React, { memo } from 'react';

// Full-page background: 1 image, cover size, no repeat, no overlap
export const WatermarkBg: React.FC = memo(() => {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 select-none"
      style={{
        backgroundImage: "url('/assets/patterns/hope pattern.png')",
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        opacity: 1,
      }}
      aria-hidden="true"
    />
  );
});

WatermarkBg.displayName = 'WatermarkBg';
