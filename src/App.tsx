import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArtItem, FilterState, AdSettings, SiteBranding } from './types';
import { artStore } from './services/artStore';
import { updateSocialMetaTags } from './utils/metaUpdater';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ArtGrid } from './components/ArtGrid';
import { ArtDetailModal } from './components/ArtDetailModal';
import { UploadModal } from './components/UploadModal';
import { AdManagementModal } from './components/ads/AdManagementModal';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AboutPage } from './components/pages/AboutPage';
import { TermsPage } from './components/pages/TermsPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { ContactPage } from './components/pages/ContactPage';
import { Layers } from 'lucide-react';

export type ViewPage = 'home' | '1to1' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact';

export default function App() {
  const [artworks, setArtworks] = useState<ArtItem[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [adSettings, setAdSettings] = useState<AdSettings>(artStore.getAdSettings());
  const [categories, setCategories] = useState<string[]>(artStore.getCategories());
  const [branding, setBranding] = useState<SiteBranding>(artStore.getBranding());
  const [currentView, setCurrentView] = useState<ViewPage>('home');

  // Modals state - initialize selectedArt directly from URL query if present
  const [selectedArt, setSelectedArt] = useState<ArtItem | null>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const artId = params.get('art') || params.get('id');
      if (artId) {
        const storeArtworks = artStore.getArtworks();
        return storeArtworks.find((a) => a.id === artId) || null;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const prevSelectedArtRef = useRef<ArtItem | null>(selectedArt);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAdManagerOpen, setIsAdManagerOpen] = useState(false);
  const [showingLikesOnly, setShowingLikesOnly] = useState(false);

  // Filter state
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    category: 'All',
    selectedTag: null,
    orientation: 'all',
    selectedColor: null,
    sortBy: 'trending',
  });

  // Initial Load & Refresh
  const refreshData = () => {
    const currentLocal = artStore.getArtworks();
    setArtworks(currentLocal);
    setLikedIds(artStore.getUserLikes());
    setAdSettings(artStore.getAdSettings());
    setCategories(artStore.getCategories());
    setBranding(artStore.getBranding());

    // Sync with backend server
    artStore.fetchServerData().then((data) => {
      setArtworks(data.artworks);
      setBranding(data.branding);
      setAdSettings(data.ads);
    });
  };

  useEffect(() => {
    refreshData();
    // Check if view=admin or ?art=ID in URL query or hash
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') || window.location.hash.replace('#', '');
    if (viewParam === 'admin') {
      setCurrentView('admin');
    }
  }, []);

  // Deep Link support: Auto-select artwork if ?art=ID or ?id=ID is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const artId = params.get('art') || params.get('id');
    if (artId) {
      const storeArtworks = artStore.getArtworks();
      const found = artworks.find((a) => a.id === artId) || storeArtworks.find((a) => a.id === artId);
      if (found) {
        setSelectedArt(found);
        setCurrentView('home');
      }
    }
  }, [artworks]);

  // Sync browser URL & OpenGraph Meta Tags when selectedArt changes
  useEffect(() => {
    if (selectedArt) {
      const shareUrl = `${window.location.origin}${window.location.pathname}?art=${selectedArt.id}`;
      try {
        window.history.replaceState({}, '', `?art=${selectedArt.id}`);
      } catch {
        // Fallback for restricted iframe env
      }
      updateSocialMetaTags({
        title: `${selectedArt.title} — InkProwl Vintage Art`,
        description: selectedArt.description || 'Download high-resolution vintage comic-style 2D line artwork on InkProwl.',
        imageUrl: selectedArt.imageUrl,
        url: shareUrl,
      });
    } else if (prevSelectedArtRef.current !== null) {
      // Only wipe ?art= parameter if user explicitly closed an active modal!
      try {
        if (window.location.search.includes('art=')) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      } catch {
        // Fallback
      }
      updateSocialMetaTags({
        title: `${branding.siteTitle || 'InkProwl'} — Vintage Comic Art & Line Art Marketplace`,
        description: branding.siteSubtitle || 'Curated vintage comic-style illustrations and downloadable art assets.',
        imageUrl: branding.logoUrl || '/icon.png',
        url: window.location.origin + window.location.pathname,
      });
    }
    prevSelectedArtRef.current = selectedArt;
  }, [selectedArt, branding]);

  // Filter & Sort Logic
  const filteredArtworks = useMemo(() => {
    let result = [...artworks];

    // Dedicated 1:1 Square Marketplace view
    if (currentView === '1to1') {
      result = result.filter(
        (item) => item.isOneToOneRatio || item.aspectRatio === 'square' || item.width === item.height
      );
    }

    // Favorites only filter
    if (showingLikesOnly) {
      result = result.filter((item) => likedIds.includes(item.id));
    }

    // Category filter
    if (filter.category !== 'All') {
      result = result.filter((item) => item.category === filter.category);
    }

    // Orientation filter (when on home view)
    if (currentView === 'home' && filter.orientation !== 'all') {
      result = result.filter((item) => item.aspectRatio === filter.orientation);
    }

    // Search query
    if (filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (filter.sortBy === 'trending') {
      result.sort((a, b) => b.downloads * 2 + b.views - (a.downloads * 2 + a.views));
    } else if (filter.sortBy === 'latest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filter.sortBy === 'downloads') {
      result.sort((a, b) => b.downloads - a.downloads);
    } else if (filter.sortBy === 'likes') {
      result.sort((a, b) => b.likes - a.likes);
    }

    return result;
  }, [artworks, filter, showingLikesOnly, likedIds, currentView]);

  // Featured Artworks for Hero Banner
  const featuredArtworks = useMemo(() => {
    return artworks.filter((item) => item.featured) || artworks.slice(0, 3);
  }, [artworks]);

  // Related artworks for modal view
  const relatedArtworks = useMemo(() => {
    if (!selectedArt) return [];
    return artworks.filter(
      (item) => item.id !== selectedArt.id && item.category === selectedArt.category
    );
  }, [artworks, selectedArt]);

  // Handlers
  const handleSelectArt = (art: ArtItem) => {
    artStore.incrementView(art.id);
    setSelectedArt(art);
  };

  const handleToggleLike = (id: string) => {
    artStore.toggleLike(id);
    refreshData();
  };

  const handleUploadSuccess = (newItem: ArtItem) => {
    refreshData();
    setSelectedArt(newItem);
  };

  const handleSaveAdSettings = (newSettings: AdSettings) => {
    artStore.saveAdSettings(newSettings);
    setAdSettings(newSettings);
  };

  const handleDownloadCompleted = (id: string) => {
    artStore.incrementDownload(id);
    refreshData();
  };

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
  };

  const handleNavigate = (page: ViewPage) => {
    setCurrentView(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FBF7EE] text-black font-sans selection:bg-amber-400 selection:text-black flex flex-col">
      {/* Navbar */}
      <Navbar
        filter={filter}
        onFilterChange={handleFilterChange}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAdManager={() => setIsAdManagerOpen(true)}
        likedCount={likedIds.length}
        adSettings={adSettings}
        onShowLikesOnly={() => setShowingLikesOnly(!showingLikesOnly)}
        showingLikesOnly={showingLikesOnly}
        categories={categories}
        branding={branding}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            {/* Hero Section */}
            {!showingLikesOnly && filter.category === 'All' && !filter.searchQuery && (
              <HeroSection
                featuredArtworks={featuredArtworks}
                onSelectArt={handleSelectArt}
                onOpenUpload={() => setIsUploadOpen(true)}
                adSettings={adSettings}
                totalArtworksCount={artworks.length}
                branding={branding}
                onNavigate1to1={() => handleNavigate('1to1')}
              />
            )}

            <ArtGrid
              artworks={filteredArtworks}
              onSelectArt={handleSelectArt}
              likedIds={likedIds}
              onToggleLike={handleToggleLike}
              adSettings={adSettings}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          </>
        )}

        {currentView === '1to1' && (
          <div className="space-y-6 pt-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="p-6 border-4 border-black bg-[#FAF4E6] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 border border-black bg-amber-200 text-black text-xs font-mono font-bold uppercase">
                    <Layers className="w-3.5 h-3.5 text-black" /> Premium 1:1 Square Art Market
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-black italic uppercase text-black">
                    Square Ratio (1:1) Vintage Pulp Collection
                  </h2>
                  <p className="text-xs font-serif text-neutral-700 max-w-2xl">
                    High-resolution 1:1 aspect ratio square comic line artworks designed specifically for Instagram, avatars, profile pictures, album covers, and collectible prints.
                  </p>
                </div>
                <button
                  onClick={() => handleNavigate('home')}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-mono font-bold uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0"
                >
                  View All Ratios
                </button>
              </div>
            </div>

            <ArtGrid
              artworks={filteredArtworks}
              onSelectArt={handleSelectArt}
              likedIds={likedIds}
              onToggleLike={handleToggleLike}
              adSettings={adSettings}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          </div>
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            artworks={artworks}
            adSettings={adSettings}
            branding={branding}
            categories={categories}
            onUpdateData={refreshData}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'about' && <AboutPage branding={branding} onNavigate={handleNavigate} />}
        {currentView === 'terms' && <TermsPage branding={branding} onNavigate={handleNavigate} />}
        {currentView === 'privacy' && <PrivacyPolicyPage branding={branding} onNavigate={handleNavigate} />}
        {currentView === 'contact' && <ContactPage branding={branding} onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <Footer branding={branding} onNavigate={handleNavigate} />

      {/* Artwork Detail Lightbox Modal */}
      <ArtDetailModal
        art={selectedArt}
        isOpen={!!selectedArt}
        onClose={() => setSelectedArt(null)}
        isLiked={selectedArt ? likedIds.includes(selectedArt.id) : false}
        onToggleLike={handleToggleLike}
        adSettings={adSettings}
        onDownloadCompleted={handleDownloadCompleted}
        relatedArtworks={relatedArtworks}
        onSelectRelated={handleSelectArt}
        categories={categories}
        onSelectCategory={(category) => {
          setFilter((prev) => ({ ...prev, category }));
          setSelectedArt(null);
          setCurrentView('home');
        }}
        onGoHome={() => {
          setSelectedArt(null);
          setCurrentView('home');
        }}
      />

      {/* Manual Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        onNavigate={handleNavigate}
      />

      {/* Ad Management & Monetization Modal */}
      <AdManagementModal
        isOpen={isAdManagerOpen}
        onClose={() => setIsAdManagerOpen(false)}
        settings={adSettings}
        onSave={handleSaveAdSettings}
      />
    </div>
  );
}
