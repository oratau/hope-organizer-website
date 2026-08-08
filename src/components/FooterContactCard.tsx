import React from 'react';
import { Mail, Instagram, Phone, MapPin } from 'lucide-react';
import { Translations } from '../i18n';

interface FooterContactCardProps {
  t: Translations;
}

export const FooterContactCard: React.FC<FooterContactCardProps> = ({ t }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 my-12">
      {/* Outer Gold Border Box */}
      <div className="border-2 border-[#ffcb04] p-3 md:p-4 bg-[#0a0a0a]/90 rounded-sm shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          
          {/* Card 1: Email */}
          <div className="bg-[#192b58] p-4 flex items-center space-x-4 border border-navy-light/40 hover:border-[#ffcb04]/50 transition-colors">
            <div className="p-2 border-2 border-[#ffcb04] rounded-sm text-[#ffcb04] flex-shrink-0">
              <Mail className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-serif text-sm sm:text-base text-[#ffcb04] leading-snug">
              <p className="hover:underline cursor-pointer">hope_enterprise@yahoo.com</p>
              <p className="hover:underline cursor-pointer">info@hopeorganizer.com</p>
            </div>
          </div>

          {/* Card 2: Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="bg-[#192b58] p-4 flex items-center space-x-4 border border-navy-light/40 hover:border-[#ffcb04]/50 transition-colors block"
          >
            <div className="p-2 border-2 border-[#ffcb04] rounded-sm text-[#ffcb04] flex-shrink-0">
              <Instagram className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-serif text-sm sm:text-base text-[#ffcb04] font-semibold tracking-wider">
              HOPETHEORGANIZER
            </div>
          </a>

          {/* Card 3: Phone */}
          <div className="bg-[#192b58] p-4 flex items-center space-x-4 border border-navy-light/40 hover:border-[#ffcb04]/50 transition-colors">
            <div className="p-2 border-2 border-[#ffcb04] rounded-sm text-[#ffcb04] flex-shrink-0">
              <Phone className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-serif text-sm sm:text-base text-[#ffcb04] tracking-wide">
              024-3510285/024-3512827
            </div>
          </div>

          {/* Card 4: Address */}
          <div className="bg-[#192b58] p-4 flex items-center space-x-4 border border-navy-light/40 hover:border-[#ffcb04]/50 transition-colors">
            <div className="p-2 border-2 border-[#ffcb04] rounded-sm text-[#ffcb04] flex-shrink-0">
              <MapPin className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-serif text-xs sm:text-sm text-[#ffcb04] leading-tight">
              <p>Jl. Taman Muara Mas No 39</p>
              <p>Semarang - Jawa Tengah 50177</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
