import React, { useState, lazy, Suspense, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrustedBy } from './components/TrustedBy';
import { LatestArticles, Article } from './components/LatestArticles';
import { BusinessFields } from './components/BusinessFields';
import { AboutUs } from './components/AboutUs';
import { OurVision } from './components/OurVision';
import { OurMission } from './components/OurMission';
import { OurStructure } from './components/OurStructure';
import { ContactSection } from './components/ContactSection';
import { NotFound } from './components/NotFound';
import { Lang, translations } from './i18n';

// Code Splitting / Lazy Loading for Heavy Modals & Admin Suite
const BlogDetailModal = lazy(() => import('./components/BlogDetailModal').then(m => ({ default: m.BlogDetailModal })));
const AdminLogin = lazy(() => import('./components/AdminLogin').then(m => ({ default: m.AdminLogin })));
const TotpSetupModal = lazy(() => import('./components/TotpSetupModal').then(m => ({ default: m.TotpSetupModal })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));

// ─── SESSION HELPERS ────────────────────────────────────────────────────────
const SESSION_KEY = 'hope_admin_jwt';

const getStoredToken = (): string | null => {
  try { return sessionStorage.getItem(SESSION_KEY); } catch { return null; }
};

const setStoredToken = (token: string) => {
  try { sessionStorage.setItem(SESSION_KEY, token); } catch { /* noop */ }
};

const clearStoredToken = () => {
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
};

// ─── DEFAULT ARTICLES ────────────────────────────────────────────────────────
const DEFAULT_ARTICLES: Article[] = [];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [lang, setLang] = useState<Lang>('EN');
  const [show404, setShow404] = useState(false);

  // Articles from API
  const [articles, setArticles] = useState<Article[]>(DEFAULT_ARTICLES);

  // Modal & View States
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [viewingAdminDashboard, setViewingAdminDashboard] = useState(false);

  // ─── Fetch public articles from API ────────────────────────────────────────
  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setArticles(data.articles);
      }
    } catch (error) {
      // Keep default state if API unavailable (expected in static deployment)
      console.log('Articles API not available - using default state');
    }
  };

  // ─── Validate existing session on load ─────────────────────────────────────
  const validateSession = async () => {
    const storedToken = getStoredToken();
    if (!storedToken) return;

    try {
      const res = await fetch('/api/admin/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: storedToken }),
      });
      const data = await res.json();
      if (data.valid) {
        setAdminToken(storedToken);
        setIsAdminLoggedIn(true);
      } else {
        clearStoredToken();
      }
    } catch (error) {
      // Admin API not available (expected in static deployment)
      clearStoredToken();
    }
  };

  // ─── Hash route: /#HOP33EXELENCE → secret TOTP setup ───────────────────────
  useEffect(() => {
    fetchArticles();
    validateSession();

    const checkHash = () => {
      const hash = window.location.hash;

      if (hash === '#HOP33EXELENCE') {
        setShowAdminLogin(false);
        setShowTotpSetup(true);
        setShow404(false);
        // Clean hash from URL without navigation
        history.replaceState(null, '', window.location.pathname);
      } else if (hash && hash !== '') {
        // If there's a hash but it's not recognized, show 404
        const validHashes = ['', '#home', '#about-us', '#our-vision', '#our-mission', '#our-structure', '#business-fields', '#contact-us', '#trusted-by'];
        if (!validHashes.includes(hash)) {
          setShow404(true);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // ─── Article CRUD Handlers ──────────────────────────────────────────────────
  const handleAddArticle = async (newArt: Partial<Article>) => {
    const token = adminToken || getStoredToken();
    if (token) {
      try {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(newArt),
        });
        const data = await res.json();
        if (data.success) {
          await fetchArticles();
          return;
        }
      } catch { /* fall through to local state */ }
    }
    // Fallback: update local state only
    const articleItem: Article = {
      id: 'art-' + Date.now(),
      title: newArt.title || 'Untitled Article',
      category: newArt.category || 'Event Highlights',
      date: newArt.date || new Date().toLocaleDateString(),
      excerpt: newArt.excerpt || '',
      content: newArt.content || '',
      coverImage: newArt.coverImage || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    };
    setArticles(prev => [articleItem, ...prev]);
  };

  const handleEditArticle = async (id: string, updated: Partial<Article>) => {
    const token = adminToken || getStoredToken();
    if (token) {
      try {
        const res = await fetch(`/api/articles/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(updated),
        });
        const data = await res.json();
        if (data.success) {
          await fetchArticles();
          return;
        }
      } catch { /* fall through */ }
    }
    setArticles(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
  };

  const handleDeleteArticle = async (id: string) => {
    const token = adminToken || getStoredToken();
    if (token) {
      try {
        const res = await fetch(`/api/articles/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          await fetchArticles();
          return;
        }
      } catch { /* fall through */ }
    }
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleArticleStatus = async (id: string, status: 'published' | 'draft') => {
    const token = adminToken || getStoredToken();
    if (token) {
      try {
        await fetch(`/api/articles/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status }),
        });
        await fetchArticles();
      } catch { /* noop */ }
    }
  };

  const handleSuccessAdminLogin = (token: string) => {
    setStoredToken(token);
    setAdminToken(token);
    setIsAdminLoggedIn(true);
    setShowAdminLogin(false);
    setViewingAdminDashboard(true);
    fetchArticles();
  };

  const handleLogout = () => {
    clearStoredToken();
    setAdminToken(null);
    setIsAdminLoggedIn(false);
    setViewingAdminDashboard(false);
  };

  // ─── Admin Dashboard View ───────────────────────────────────────────────────
  if (viewingAdminDashboard) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] text-[#ffcb04] flex items-center justify-center font-serif text-lg">Loading Admin Workspace...</div>}>
        <AdminDashboard
          onLogout={handleLogout}
          articles={articles}
          adminToken={adminToken || getStoredToken() || ''}
          onAddArticle={handleAddArticle}
          onEditArticle={handleEditArticle}
          onDeleteArticle={handleDeleteArticle}
          onToggleStatus={handleToggleArticleStatus}
        />
      </Suspense>
    );
  }

  // ─── Public Site View ───────────────────────────────────────────────────────
  const t = translations[lang];

  // Show 404 page if invalid route
  if (show404) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ffcb04] selection:text-black">
        <Navbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setShow404(false);
            window.location.hash = '';
          }}
          onOpenAdmin={() => {
            if (isAdminLoggedIn) {
              setViewingAdminDashboard(true);
            } else {
              setShowAdminLogin(true);
            }
            setShow404(false);
          }}
          onOpenTotpSetup={() => {
            setShowTotpSetup(true);
            setShow404(false);
          }}
          isAdminLoggedIn={isAdminLoggedIn}
          lang={lang}
          onChangeLang={setLang}
        />
        <NotFound onGoHome={() => {
          setActiveTab('home');
          setShow404(false);
          window.location.hash = '';
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#ffcb04] selection:text-black">
      {/* NAVBAR */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setViewingAdminDashboard(true);
          } else {
            setShowAdminLogin(true);
          }
        }}
        onOpenTotpSetup={() => setShowTotpSetup(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        lang={lang}
        onChangeLang={setLang}
      />

      {/* SINGLE PAGE VIEW SWITCHING */}
      {activeTab === 'home' && (
        <>
          <HeroSection t={t} />
          <TrustedBy t={t} />
          <LatestArticles
            articles={articles}
            onSelectArticle={(article) => setSelectedArticle(article)}
            t={t}
          />
          <ContactSection t={t} />
        </>
      )}

      {activeTab === 'about-us' && <AboutUs t={t} />}
      {activeTab === 'our-vision' && <OurVision t={t} />}
      {activeTab === 'our-mission' && <OurMission t={t} />}
      {activeTab === 'our-structure' && <OurStructure t={t} />}
      {activeTab === 'business-fields' && <BusinessFields t={t} />}
      {activeTab === 'contact-us' && <ContactSection t={t} />}
      {activeTab === 'trusted-by' && (
        <>
          <TrustedBy t={t} />
          <ContactSection t={t} />
        </>
      )}

      {/* MODALS WITH LAZY SUSPENSE */}
      <Suspense fallback={null}>
        {selectedArticle && (
          <BlogDetailModal
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
          />
        )}

        {showAdminLogin && (
          <AdminLogin
            onClose={() => setShowAdminLogin(false)}
            onSuccessLogin={handleSuccessAdminLogin}
            onOpenSetup={() => {
              setShowAdminLogin(false);
              setShowTotpSetup(true);
            }}
          />
        )}

        {showTotpSetup && (
          <TotpSetupModal
            onClose={() => setShowTotpSetup(false)}
            onSuccessSetup={() => {
              setShowTotpSetup(false);
              setShowAdminLogin(true);
            }}
          />
        )}
      </Suspense>

    </div>
  );
};
