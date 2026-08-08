import React from 'react';
import { X, Calendar, User, Tag } from 'lucide-react';
import { Article } from './LatestArticles';

interface BlogDetailModalProps {
  article: Article | null;
  onClose: () => void;
}

export const BlogDetailModal: React.FC<BlogDetailModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#121624] border border-[#ffcb04]/40 rounded-lg shadow-2xl overflow-hidden my-8">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white bg-black/60 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Cover Image */}
        <div className="relative h-64 sm:h-80 w-full bg-gray-900">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121624] via-transparent to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6">
            <span className="bg-[#ffcb04] text-black font-bold text-xs uppercase px-2.5 py-1 rounded">
              {article.category}
            </span>
          </div>
        </div>

        {/* Header Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="space-y-3 border-b border-gray-800 pb-6">
            <h1 className="font-serif font-bold text-2xl sm:text-4xl text-white leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#ffcb04]" />
                <span>{article.date}</span>
              </span>
              <span className="flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-[#ffcb04]" />
                <span>HOPE Editorial Team</span>
              </span>
            </div>
          </div>

          {/* Article Rich Content Body */}
          <div
            className="prose prose-invert max-w-none text-gray-300 font-sans text-sm sm:text-base leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.content || article.excerpt }}
          />

          <div className="pt-6 border-t border-gray-800 flex justify-end">
            <button
              onClick={onClose}
              className="bg-[#192b58] text-[#ffcb04] border border-[#ffcb04]/40 hover:bg-[#ffcb04] hover:text-black font-bold px-6 py-2 rounded transition-colors text-sm"
            >
              Close Article
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
