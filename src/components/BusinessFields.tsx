import React, { useState } from 'react';
import { WatermarkBg } from './WatermarkBg';
import { Translations } from '../i18n';
import { CatalogueModal } from './CatalogueModal';
import { Eye } from 'lucide-react';

interface BusinessFieldsProps {
  t: Translations;
}

type BusinessField = {
  id: string;
  title: string;
  colSpan: string;
  bgColor: 'gold' | 'navy';
  images: string[];
};

export const BusinessFields: React.FC<BusinessFieldsProps> = ({ t }) => {
  const [selectedField, setSelectedField] = useState<BusinessField | null>(null);

  // Define business fields with their catalogue images
  const fields: BusinessField[] = [
    {
      id: 'grand-opening',
      title: 'Grand Opening',
      colSpan: 'md:col-span-4',
      bgColor: 'gold',
      images: [
        // Add your images here, e.g.:
        // '/assets/catalogue/grand-opening/img1.jpg',
        // '/assets/catalogue/grand-opening/img2.jpg',
      ],
    },
    {
      id: 'party',
      title: 'Party Consultant & Organizer',
      colSpan: 'md:col-span-8',
      bgColor: 'navy',
      images: [],
    },
    {
      id: 'concert',
      title: 'Concert',
      colSpan: 'md:col-span-3',
      bgColor: 'gold',
      images: [],
    },
    {
      id: 'product-launching',
      title: 'Product Launching',
      colSpan: 'md:col-span-5',
      bgColor: 'navy',
      images: [],
    },
    {
      id: 'exhibition',
      title: 'Exhibition',
      colSpan: 'md:col-span-4',
      bgColor: 'gold',
      images: [],
    },
    {
      id: 'gathering',
      title: 'Family & Company Gathering',
      colSpan: 'md:col-span-7',
      bgColor: 'navy',
      images: [],
    },
    {
      id: 'advertising',
      title: 'Advertising',
      colSpan: 'md:col-span-5',
      bgColor: 'gold',
      images: [],
    },
    {
      id: 'merchandise',
      title: 'Create Corporate Promotional Merchandise',
      colSpan: 'md:col-span-12',
      bgColor: 'gold',
      images: [],
    },
  ];

  const getCardClasses = (field: BusinessField) => {
    const baseClasses = 'group relative py-8 px-6 flex flex-col items-center justify-center text-center shadow-lg transition-all duration-300 cursor-pointer overflow-hidden';
    const bgClasses = field.bgColor === 'gold'
      ? 'bg-[#ffcb04] hover:brightness-110'
      : 'bg-[#192b58] border border-navy-light/40 hover:bg-navy-light';
    const textClasses = field.bgColor === 'gold'
      ? 'text-[#192b58]'
      : 'text-[#ffcb04]';
    
    return `${field.colSpan} ${baseClasses} ${bgClasses} ${textClasses}`;
  };

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

        {/* Bento Grid */}
        <div className="max-w-5xl mx-auto space-y-2 font-serif">
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <button
              onClick={() => setSelectedField(fields[0])}
              className={getCardClasses(fields[0])}
            >
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-3">
                {fields[0].title}
              </h3>
              <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
                <span>View Catalogue</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedField(fields[1])}
              className={getCardClasses(fields[1])}
            >
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-3">
                {fields[1].title}
              </h3>
              <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
                <span>View Catalogue</span>
              </div>
            </button>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <button
              onClick={() => setSelectedField(fields[2])}
              className={getCardClasses(fields[2])}
            >
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-3">
                {fields[2].title}
              </h3>
              <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
                <span>View Catalogue</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedField(fields[3])}
              className={getCardClasses(fields[3])}
            >
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-3">
                {fields[3].title}
              </h3>
              <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
                <span>View Catalogue</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedField(fields[4])}
              className={getCardClasses(fields[4])}
            >
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-3">
                {fields[4].title}
              </h3>
              <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
                <span>View Catalogue</span>
              </div>
            </button>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <button
              onClick={() => setSelectedField(fields[5])}
              className={getCardClasses(fields[5])}
            >
              <h3 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight leading-none mb-3">
                {fields[5].title}
              </h3>
              <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
                <span>View Catalogue</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedField(fields[6])}
              className={getCardClasses(fields[6])}
            >
              <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-none mb-3">
                {fields[6].title}
              </h3>
              <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="w-4 h-4" />
                <span>View Catalogue</span>
              </div>
            </button>
          </div>

          {/* Row 4 - Full Width Wide Banner */}
          <button
            onClick={() => setSelectedField(fields[7])}
            className={getCardClasses(fields[7])}
          >
            <h3 className="font-serif text-2xl sm:text-4xl lg:text-4xl font-bold tracking-tight leading-none mb-3">
              {fields[7].title}
            </h3>
            <div className="flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              <Eye className="w-4 h-4" />
              <span>View Catalogue</span>
            </div>
          </button>

        </div>

      </div>

      {/* Catalogue Modal */}
      {selectedField && (
        <CatalogueModal
          title={selectedField.title}
          images={selectedField.images}
          onClose={() => setSelectedField(null)}
        />
      )}
    </section>
  );
};
