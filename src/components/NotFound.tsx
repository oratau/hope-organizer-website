import React from 'react';
import { WatermarkBg } from './WatermarkBg';

interface NotFoundProps {
  onGoHome: () => void;
}

export const NotFound: React.FC<NotFoundProps> = ({ onGoHome }) => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0a]">
      <WatermarkBg />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left: Mascot Illustration */}
          <div className="flex justify-center md:justify-end order-2 md:order-1">
            <div className="relative">
              {/* Mascot Image Container */}
              <div className="relative w-72 h-96 sm:w-80 sm:h-[28rem] flex items-center justify-center">
                <img
                  src="/assets/404/mascot.png"
                  alt="404 Mascot"
                  className="w-full h-full object-contain drop-shadow-2xl"
                  onError={(e) => {
                    // Fallback if image not found
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Text Content */}
          <div className="text-center md:text-left order-1 md:order-2 space-y-6">
            <div className="space-y-2">
              <h1 className="font-serif text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                The Page You Looking
                <br />
                For Isn't Available
              </h1>
              <p className="font-serif text-[#ffcb04] text-6xl sm:text-7xl md:text-8xl font-bold tracking-wider">
                404
              </p>
            </div>

            <p className="text-gray-400 font-serif text-base sm:text-lg max-w-md mx-auto md:mx-0">
              The page you are trying to access doesn't exist or has been moved. Let's get you back on track.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button
                onClick={onGoHome}
                className="bg-[#ffcb04] text-black font-bold py-3 px-8 rounded hover:bg-[#e5b600] transition-colors shadow-lg font-serif text-sm sm:text-base"
              >
                Back to Home
              </button>
              <button
                onClick={() => window.history.back()}
                className="bg-transparent border-2 border-[#ffcb04] text-[#ffcb04] font-bold py-3 px-8 rounded hover:bg-[#ffcb04] hover:text-black transition-colors font-serif text-sm sm:text-base"
              >
                Go Back
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
