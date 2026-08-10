import React, { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X } from 'lucide-react';
import { Lang, translations } from '../i18n';

export type NavTab = 'home' | 'about-us' | 'our-vision' | 'our-mission' | 'business-fields' | 'contact-us' | 'trusted-by';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAdmin: () => void;
  onOpenTotpSetup: () => void;
  isAdminLoggedIn: boolean;
  lang: Lang;
  onChangeLang: (lang: Lang) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAdmin,
  onOpenTotpSetup,
  isAdminLoggedIn,
  lang,
  onChangeLang,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const t = translations[lang];

  const handleTabClick = (tab: NavTab) => {
    setMobileMenuOpen(false);
    onSelectTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinkClass = (tab: NavTab) =>
    `hover:text-[#ffcb04] transition-colors duration-200 bg-transparent whitespace-nowrap ${
      activeTab === tab ? 'text-[#ffcb04] underline underline-offset-4' : 'text-white'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a] pt-3 pb-2 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Solid Navy Container (#192b58) */}
        <div className="bg-[#192b58] border border-navy-light/30 shadow-2xl relative h-14 px-3 sm:px-6 flex items-center">
          
          {/* Desktop 12-Column Grid Layout (Prevents Any Badge Overlap) */}
          <div className="hidden lg:grid grid-cols-12 items-center w-full h-full">
            
            {/* Left 5 Columns: Trusted By + About Us, Our Vision, Our Mission */}
            <nav className="col-span-5 flex items-center justify-end gap-6 xl:gap-8 font-serif text-xs xl:text-sm font-bold tracking-wide pr-4">
              <button type="button" onClick={() => handleTabClick('trusted-by')} className={navLinkClass('trusted-by')}>
                {t.trustedBy.heading}
              </button>
              <button type="button" onClick={() => handleTabClick('about-us')} className={navLinkClass('about-us')}>
                {t.nav.aboutUs}
              </button>
              <button type="button" onClick={() => handleTabClick('our-vision')} className={navLinkClass('our-vision')}>
                {t.nav.ourVision}
              </button>
              <button type="button" onClick={() => handleTabClick('our-mission')} className={navLinkClass('our-mission')}>
                {t.nav.ourMission}
              </button>
            </nav>

            {/* Center 2 Columns: Dedicated Yellow HOPE Badge */}
            <div className="col-span-2 flex items-center justify-center h-full relative">
              <div
                onClick={() => handleTabClick('home')}
                className="bg-[#ffcb04] h-full px-4 sm:px-6 flex items-center justify-center cursor-pointer shadow-md hover:brightness-105 transition-all z-20"
                style={{ borderRadius: '0 0 6px 6px' }}
              >
                <Logo variant="badge" className="bg-transparent shadow-none p-0 border-0" />
              </div>
            </div>

            {/* Right 5 Columns: Our Structure, Business Fields, Contact Us + EN|ID */}
            <div className="col-span-5 flex items-center justify-between pl-4">
              <nav className="flex items-center gap-6 xl:gap-8 font-serif text-xs xl:text-sm font-bold tracking-wide">
                <button type="button" onClick={() => handleTabClick('business-fields')} className={navLinkClass('business-fields')}>
                  {t.nav.businessFields}
                </button>
                <button type="button" onClick={() => handleTabClick('contact-us')} className={navLinkClass('contact-us')}>
                  {t.nav.contactUs}
                </button>
              </nav>

              {/* Language Switcher EN | ID */}
              <div className="pl-4">
                <button
                  type="button"
                  onClick={() => onChangeLang(lang === 'EN' ? 'ID' : 'EN')}
                  className="font-serif text-xs font-bold tracking-widest bg-transparent cursor-pointer whitespace-nowrap select-none"
                >
                  <span className={lang === 'EN' ? 'text-[#ffcb04] underline underline-offset-4' : 'text-white/70 hover:text-white'}>
                    EN
                  </span>
                  <span className="text-white/40 mx-1">|</span>
                  <span className={lang === 'ID' ? 'text-[#ffcb04] underline underline-offset-4' : 'text-white/70 hover:text-white'}>
                    ID
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* Mobile Navigation Bar Header */}
          <div className="lg:hidden flex items-center justify-between w-full">
            <div
              onClick={() => handleTabClick('home')}
              className="bg-[#ffcb04] h-10 px-3 flex items-center justify-center rounded cursor-pointer"
            >
              <Logo variant="badge" className="bg-transparent shadow-none p-0 border-0" />
            </div>

            <div className="flex items-center space-x-3">
              {/* Mobile Lang Switcher */}
              <button
                type="button"
                onClick={() => onChangeLang(lang === 'EN' ? 'ID' : 'EN')}
                className="font-serif text-xs font-bold text-white/80 bg-transparent"
              >
                <span className={lang === 'EN' ? 'text-[#ffcb04]' : ''}>EN</span>
                <span className="text-white/40 mx-0.5">|</span>
                <span className={lang === 'ID' ? 'text-[#ffcb04]' : ''}>ID</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 text-white hover:text-[#ffcb04] focus:outline-none bg-transparent"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden max-w-7xl mx-auto px-4 mt-2">
          <div className="bg-[#0d152a] border border-navy-light px-4 pt-3 pb-6 space-y-1 font-serif text-base text-center shadow-2xl">
            {([
              ['home', t.nav.home],
              ['trusted-by', t.trustedBy.heading],
              ['about-us', t.nav.aboutUs],
              ['our-vision', t.nav.ourVision],
              ['our-mission', t.nav.ourMission],
              ['our-structure', t.nav.ourStructure],
              ['business-fields', t.nav.businessFields],
              ['contact-us', t.nav.contactUs],
            ] as [NavTab, string][]).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => handleTabClick(tab)}
                className={`block w-full py-2.5 bg-transparent transition-colors ${
                  activeTab === tab ? 'text-[#ffcb04]' : 'text-white hover:text-[#ffcb04]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
