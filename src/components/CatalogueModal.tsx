import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface CatalogueModalProps {
  title: string;
  images: string[];
  onClose: () => void;
}

export const CatalogueModal: React.FC<CatalogueModalProps> = ({ title, images, onClose }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrevious();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-[#121624] border border-white/10 rounded-lg p-8 max-w-md w-full text-center">
          <h3 className="font-serif text-2xl font-bold text-white mb-4">{title}</h3>
          <p className="text-gray-400 font-serif mb-6">
            Catalogue photos coming soon. Please check back later.
          </p>
          <button
            onClick={onClose}
            className="bg-[#ffcb04] text-black font-bold py-2 px-6 rounded hover:bg-[#e5b600] transition-all font-serif"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <div className="max-w-6xl w-full flex flex-col items-center">
        {/* Title */}
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#ffcb04] mb-6 text-center">
          {title} Catalogue
        </h2>

        {/* Image Container */}
        <div className="relative w-full aspect-[4/3] bg-black/50 rounded-lg overflow-hidden shadow-2xl mb-6">
          {/* Current Image */}
          <img
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-serif">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto max-w-full pb-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-[#ffcb04] scale-110'
                    : 'border-white/20 hover:border-white/50'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
