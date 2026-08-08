import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  RotateCcw,
  Eye,
  Edit3,
  CheckCircle2,
  Upload,
  Save,
} from 'lucide-react';
import { Article } from './LatestArticles';

interface WordEditorProps {
  onPublishArticle: (article: Partial<Article>) => void;
  onEditArticle?: (id: string, article: Partial<Article>) => void;
  editingArticle?: Article | null;
  onCancelEdit?: () => void;
}

export const WordEditor: React.FC<WordEditorProps> = ({
  onPublishArticle,
  onEditArticle,
  editingArticle,
  onCancelEdit,
}) => {
  const isEditing = !!editingArticle;

  const [title, setTitle] = useState(editingArticle?.title || '');
  const [category, setCategory] = useState(editingArticle?.category || 'Event Highlights');
  const [coverImage, setCoverImage] = useState(editingArticle?.coverImage || '');
  const [excerpt, setExcerpt] = useState(editingArticle?.excerpt || '');
  const [editorContent, setEditorContent] = useState(editingArticle?.content || '');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const editorRef = useRef<HTMLDivElement>(null);

  // When editingArticle changes, re-populate fields
  useEffect(() => {
    if (editingArticle) {
      setTitle(editingArticle.title);
      setCategory(editingArticle.category);
      setCoverImage(editingArticle.coverImage);
      setExcerpt(editingArticle.excerpt || '');
      setEditorContent(editingArticle.content || '');
      if (editorRef.current) {
        editorRef.current.innerHTML = editingArticle.content || '';
      }
    }
  }, [editingArticle]);

  const executeCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEditorContent(editorRef.current.innerHTML);
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter Image URL:', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80');
    if (url) executeCommand('insertImage', url);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL:', 'https://hopeorganizer.com');
    if (url) executeCommand('createLink', url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      alert('Please enter an article title.');
      return;
    }

    const htmlContent = editorRef.current ? editorRef.current.innerHTML : editorContent;
    const articleData: Partial<Article> = {
      title,
      category,
      coverImage,
      excerpt: excerpt || title + ' - Read more about this event story.',
      content: htmlContent,
      date: isEditing
        ? editingArticle!.date
        : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    if (isEditing && onEditArticle) {
      onEditArticle(editingArticle!.id, articleData);
      setSuccessMessage('Article updated successfully! Changes are now live.');
    } else {
      onPublishArticle(articleData);
      setSuccessMessage('Article published successfully! It is now live on the public site.');
    }

    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setSuccessMessage('');
      if (!isEditing) {
        setTitle('');
        setExcerpt('');
        setEditorContent('<h2>Key Highlights of the Event</h2><p>Write your article content here...</p>');
        if (editorRef.current) {
          editorRef.current.innerHTML = '<h2>Key Highlights of the Event</h2><p>Write your article content here...</p>';
        }
      }
      if (isEditing && onCancelEdit) {
        onCancelEdit();
      }
    }, 2500);
  };

  return (
    <div className="bg-[#121624] border border-white/10 rounded-xl p-6 space-y-6 shadow-2xl">
      
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            {isEditing && (
              <span className="text-[10px] bg-amber-900/60 text-amber-300 border border-amber-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Editing Mode
              </span>
            )}
            <h2 className="font-serif font-bold text-2xl text-white">
              {isEditing ? 'Edit Article' : 'Word-Style Rich Text Editor'}
            </h2>
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            {isEditing
              ? `Editing: "${editingArticle?.title}"`
              : 'Compose and format news, articles, and press releases for HOPE website.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex items-center space-x-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded transition-colors"
            >
              <span>Cancel</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
            className="flex items-center space-x-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded transition-colors"
          >
            {viewMode === 'editor' ? (
              <>
                <Eye className="w-3.5 h-3.5 text-[#ffcb04]" />
                <span>Live Preview</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-[#ffcb04]" />
                <span>Edit Article</span>
              </>
            )}
          </button>
        </div>
      </div>

      {publishedSuccess && (
        <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-200 p-4 rounded-lg text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Article Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Article Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Grand Opening of PSMTI Semarang 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffcb04] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ffcb04] transition-colors"
            >
              <option value="Event Highlights">Event Highlights</option>
              <option value="Grand Opening">Grand Opening</option>
              <option value="Concert">Concert</option>
              <option value="Corporate Gathering">Corporate Gathering</option>
              <option value="Product Launch">Product Launch</option>
              <option value="Exhibition">Exhibition</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#ffcb04] transition-colors"
            />
            {coverImage && (
              <img src={coverImage} alt="preview" className="mt-2 h-14 w-full object-cover rounded opacity-70" />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Short Excerpt (Summary)
            </label>
            <textarea
              placeholder="Brief summary for carousel cards..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg px-3 py-2.5 text-white text-xs focus:outline-none focus:border-[#ffcb04] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Word Toolbar & Editor Area */}
        {viewMode === 'editor' ? (
          <div className="border border-gray-700 rounded-xl overflow-hidden bg-[#0a0a0a]">
            
            {/* Word Toolbar */}
            <div className="bg-[#192b58] p-2 border-b border-gray-700 flex flex-wrap items-center gap-1">
              <button type="button" onClick={() => executeCommand('bold')} title="Bold (Ctrl+B)"
                className="p-1.5 hover:bg-white/10 text-white rounded transition-colors">
                <Bold className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => executeCommand('italic')} title="Italic (Ctrl+I)"
                className="p-1.5 hover:bg-white/10 text-white rounded transition-colors">
                <Italic className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => executeCommand('underline')} title="Underline (Ctrl+U)"
                className="p-1.5 hover:bg-white/10 text-white rounded transition-colors">
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-1" />

              <button type="button" onClick={() => executeCommand('formatBlock', '<h2>')} title="Heading 1"
                className="p-1.5 hover:bg-white/10 text-[#ffcb04] rounded transition-colors font-bold">
                <Heading1 className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => executeCommand('formatBlock', '<h3>')} title="Heading 2"
                className="p-1.5 hover:bg-white/10 text-[#ffcb04] rounded transition-colors font-bold">
                <Heading2 className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-1" />

              <button type="button" onClick={() => executeCommand('insertUnorderedList')} title="Bulleted List"
                className="p-1.5 hover:bg-white/10 text-white rounded transition-colors">
                <List className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => executeCommand('insertOrderedList')} title="Numbered List"
                className="p-1.5 hover:bg-white/10 text-white rounded transition-colors">
                <ListOrdered className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => executeCommand('formatBlock', '<blockquote>')} title="Quote"
                className="p-1.5 hover:bg-white/10 text-white rounded transition-colors">
                <Quote className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-1" />

              <button type="button" onClick={handleInsertImage} title="Insert Image"
                className="p-1.5 hover:bg-white/10 text-[#ffcb04] rounded transition-colors">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button type="button" onClick={handleInsertLink} title="Insert Link"
                className="p-1.5 hover:bg-white/10 text-[#ffcb04] rounded transition-colors">
                <LinkIcon className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => executeCommand('removeFormat')} title="Clear Formatting"
                className="p-1.5 hover:bg-white/10 text-gray-400 rounded transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Editable Content Area */}
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={() => {
                if (editorRef.current) {
                  setEditorContent(editorRef.current.innerHTML);
                }
              }}
              dangerouslySetInnerHTML={{ __html: editorContent }}
              className="p-5 min-h-[280px] max-h-[450px] overflow-y-auto text-gray-200 text-sm font-sans focus:outline-none prose prose-invert max-w-none"
            />
          </div>
        ) : (
          /* Live Preview Mode */
          <div className="border border-[#ffcb04]/30 rounded-xl p-6 bg-[#0a0a0a] space-y-4">
            <h3 className="text-xs uppercase font-bold text-[#ffcb04] tracking-widest">
              Live Published Preview
            </h3>
            {coverImage && (
              <img src={coverImage} alt="cover" className="w-full h-48 object-cover rounded-lg opacity-90" />
            )}
            <div className="border-b border-gray-800 pb-4">
              <h1 className="font-serif font-bold text-2xl text-white">{title || 'Untitled Article'}</h1>
              <p className="text-xs text-gray-400 mt-1">{category} • {new Date().toLocaleDateString()}</p>
              {excerpt && <p className="text-sm text-gray-400 mt-2 italic">{excerpt}</p>}
            </div>
            <div
              className="prose prose-invert max-w-none text-gray-300 text-sm"
              dangerouslySetInnerHTML={{ __html: editorContent }}
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2 gap-3">
          {isEditing && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="bg-gray-800 text-gray-200 font-semibold px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-[#ffcb04] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#e5b600] active:scale-[0.99] transition-all flex items-center space-x-2 shadow-lg text-sm"
          >
            {isEditing ? <Save className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
            <span>{isEditing ? 'Update Article' : 'Publish Article To Public Website'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};
