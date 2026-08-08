import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from 'lucide-react';
import { Translations } from '../i18n';

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status?: 'published' | 'draft';
}

interface LatestArticlesProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  loading?: boolean;
  t: Translations;
}

// --- Skeleton Card ---
const ArticleSkeletonCard: React.FC = () => (
  <div className="bg-[#121624] border border-white/10 rounded-sm overflow-hidden flex flex-col animate-pulse">
    {/* Thumbnail Skeleton */}
    <div className="h-48 bg-gray-800/70 relative">
      <div className="absolute top-3 left-3 h-4 w-16 bg-gray-700 rounded" />
    </div>
    {/* Content Skeleton */}
    <div className="p-5 flex-1 space-y-3">
      <div className="flex items-center space-x-2">
        <div className="w-3.5 h-3.5 bg-gray-700 rounded-full" />
        <div className="h-3 w-24 bg-gray-700 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-700 rounded" />
        <div className="h-4 w-3/4 bg-gray-700 rounded" />
      </div>
      <div className="space-y-1.5 pt-1">
        <div className="h-3 w-full bg-gray-800 rounded" />
        <div className="h-3 w-5/6 bg-gray-800 rounded" />
        <div className="h-3 w-4/6 bg-gray-800 rounded" />
      </div>
    </div>
    {/* Footer Skeleton */}
    <div className="px-5 pb-5 pt-2">
      <div className="h-3 w-28 bg-gray-700 rounded" />
    </div>
  </div>
);

export const LatestArticles: React.FC<LatestArticlesProps> = ({
  articles,
  onSelectArticle,
  loading = false,
  t,
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCards = 4;
  const skeletonCount = visibleCards;

  const nextSlide = () => {
    if (articles.length <= visibleCards) return;
    setStartIndex((prev) => (prev + 1) % (articles.length - visibleCards + 1));
  };

  const prevSlide = () => {
    if (articles.length <= visibleCards) return;
    setStartIndex((prev) => (prev === 0 ? articles.length - visibleCards : prev - 1));
  };

  const displayedArticles = articles.slice(startIndex, startIndex + visibleCards);

  return (
    <section id="latest-articles" className="py-16 bg-[#0a0a0a] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif italic text-3xl sm:text-4xl font-bold text-white">
            {t.latestArticles.heading}
          </h2>
          
          {!loading && (
            <div className="flex items-center space-x-3">
              <button
                onClick={prevSlide}
                disabled={startIndex === 0}
                className="p-2.5 rounded-full border border-gray-700 bg-[#121624] text-white hover:border-[#ffcb04] hover:text-[#ffcb04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Previous articles"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                disabled={startIndex >= Math.max(0, articles.length - visibleCards)}
                className="p-2.5 rounded-full border border-gray-700 bg-[#121624] text-white hover:border-[#ffcb04] hover:text-[#ffcb04] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                aria-label="Next articles"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {loading && (
            <div className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-800" />
              <div className="w-10 h-10 rounded-full bg-gray-800" />
            </div>
          )}
        </div>

        {/* Grid: Skeleton OR Real Cards */}
        {!loading && articles.length === 0 ? (
          <div className="py-12 text-center text-gray-500 font-serif text-sm bg-[#121624]/40 border border-white/5 rounded-sm">
            No articles published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: skeletonCount }).map((_, idx) => (
                  <ArticleSkeletonCard key={idx} />
                ))
              : displayedArticles.map((article) => (
                  <div
                    key={article.id}
                    onClick={() => onSelectArticle(article)}
                    className="bg-[#121624] border border-white/10 rounded-sm overflow-hidden group cursor-pointer hover:border-[#ffcb04] transition-all duration-200 flex flex-col justify-between"
                  >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative h-48 bg-gray-800 overflow-hidden">
                      <img
                        src={article.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80'}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-[#ffcb04] text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                        {article.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center text-xs text-gray-400 mb-2 space-x-1.5 font-sans">
                        <Calendar className="w-3.5 h-3.5 text-[#ffcb04]" />
                        <span>{article.date}</span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-white group-hover:text-[#ffcb04] line-clamp-2 transition-colors mb-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-xs line-clamp-3 leading-relaxed font-sans">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Read More Footer */}
                  <div className="px-5 pb-5 pt-2 flex items-center text-xs font-semibold text-[#ffcb04] group-hover:translate-x-1 transition-transform">
                    <span>{t.latestArticles.readMore}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              ))}
          </div>
        )}

      </div>
    </section>
  );
};
