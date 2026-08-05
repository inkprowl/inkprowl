import { ArtItem, AdSettings, SiteBranding } from '../types';
import { INITIAL_ARTWORKS, DEFAULT_AD_SETTINGS, DEFAULT_BRANDING, DEFAULT_CATEGORIES } from '../data/seedArtworks';

const ARTWORKS_STORAGE_KEY = 'artvault_artworks_v1';
const LIKES_STORAGE_KEY = 'artvault_user_likes_v1';
const AD_SETTINGS_STORAGE_KEY = 'artvault_ad_settings_v1';
const BRANDING_STORAGE_KEY = 'artvault_branding_v1';
const CATEGORIES_STORAGE_KEY = 'artvault_categories_v1';
const ADMIN_CREDS_STORAGE_KEY = 'artvault_admin_creds_v1';

export const artStore = {
  // Sync data with server
  async fetchServerData(): Promise<{ artworks: ArtItem[]; branding: SiteBranding; ads: AdSettings }> {
    try {
      const [artRes, brandRes, adsRes] = await Promise.all([
        fetch('/api/artworks').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/branding').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/ads').then((r) => (r.ok ? r.json() : null)),
      ]);

      const localArtworks = this.getArtworks();
      const localBranding = this.getBranding();
      const localAds = this.getAdSettings();

      // Merge Artworks (preserve local items that may not be on server yet)
      let mergedArtworks = localArtworks;
      if (artRes && Array.isArray(artRes) && artRes.length > 0) {
        const serverMap = new Map<string, ArtItem>(artRes.map((a: ArtItem) => [a.id, a]));
        // Keep local items that aren't on server yet
        const localOnly = localArtworks.filter((la) => !serverMap.has(la.id));
        mergedArtworks = [...artRes, ...localOnly];

        // Push local-only items to server so server stays updated
        if (localOnly.length > 0) {
          fetch('/api/artworks/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localOnly),
          }).catch(() => {});
        }
      }
      this.saveArtworks(mergedArtworks);

      // Merge Branding (prefer non-empty custom local fields over server defaults)
      let mergedBranding = { ...DEFAULT_BRANDING, ...localBranding };

      const isCustomVal = (val?: string) =>
        val &&
        val.trim().length > 0 &&
        !val.includes('panther_tree') &&
        !val.includes('bear_office');

      if (brandRes && typeof brandRes === 'object') {
        mergedBranding = {
          ...DEFAULT_BRANDING,
          ...brandRes,
          // Retain custom uploaded logo & hero banner if local has custom uploads
          logoUrl: isCustomVal(localBranding.logoUrl)
            ? localBranding.logoUrl
            : isCustomVal(brandRes.logoUrl)
            ? brandRes.logoUrl
            : localBranding.logoUrl || brandRes.logoUrl || DEFAULT_BRANDING.logoUrl,
          heroBannerUrl: isCustomVal(localBranding.heroBannerUrl)
            ? localBranding.heroBannerUrl
            : isCustomVal(brandRes.heroBannerUrl)
            ? brandRes.heroBannerUrl
            : localBranding.heroBannerUrl || brandRes.heroBannerUrl || DEFAULT_BRANDING.heroBannerUrl,
          siteTitle: localBranding.siteTitle || brandRes.siteTitle || DEFAULT_BRANDING.siteTitle,
          cloudinaryCloudName: localBranding.cloudinaryCloudName || brandRes.cloudinaryCloudName,
          cloudinaryUploadPreset: localBranding.cloudinaryUploadPreset || brandRes.cloudinaryUploadPreset,
        };
      }
      this.saveBranding(mergedBranding);

      // Merge Ads
      let mergedAds = localAds;
      if (adsRes && adsRes.leaderboardAd) {
        mergedAds = { ...DEFAULT_AD_SETTINGS, ...adsRes, ...localAds };
        this.saveAdSettings(mergedAds);
      }

      return {
        artworks: mergedArtworks,
        branding: mergedBranding,
        ads: mergedAds,
      };
    } catch (e) {
      console.warn('Could not sync data from server API:', e);
      return {
        artworks: this.getArtworks(),
        branding: this.getBranding(),
        ads: this.getAdSettings(),
      };
    }
  },

  // Get all artworks (custom uploaded + defaults)
  getArtworks(): ArtItem[] {
    try {
      const stored = localStorage.getItem(ARTWORKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse artworks from storage', e);
    }
    // Fallback & initialize
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(INITIAL_ARTWORKS));
    return INITIAL_ARTWORKS;
  },

  // Save artwork list
  saveArtworks(items: ArtItem[]): void {
    try {
      localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(items));
    } catch (e: any) {
      console.warn('Failed to save artworks to storage:', e?.message || e);
    }
  },

  // Delete multiple artworks at once (Bulk Delete)
  deleteBulkArtworks(ids: string[]): void {
    const current = this.getArtworks();
    const updatedList = current.filter(item => !ids.includes(item.id));
    this.saveArtworks(updatedList);
    fetch('/api/artworks/delete-bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    }).catch(() => {});
  },

  // Add a newly uploaded artwork
  addArtwork(newItem: Omit<ArtItem, 'id' | 'createdAt' | 'views' | 'downloads' | 'likes'>): ArtItem {
    const id = `art-upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const isOneToOneRatio = newItem.width === newItem.height || newItem.aspectRatio === 'square';
    const fullItem: ArtItem = {
      ...newItem,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      views: 1,
      downloads: 0,
      likes: 0,
      isUserUploaded: true,
      isOneToOneRatio: isOneToOneRatio || newItem.isOneToOneRatio,
    };

    const current = this.getArtworks();
    const updated = [fullItem, ...current];
    this.saveArtworks(updated);

    fetch('/api/artworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullItem),
    }).catch(() => {});

    return fullItem;
  },

  // Add bulk artworks
  addBulkArtworks(items: Array<Omit<ArtItem, 'id' | 'createdAt' | 'views' | 'downloads' | 'likes'>>): ArtItem[] {
    const now = new Date().toISOString().split('T')[0];
    const newArtworks: ArtItem[] = items.map((newItem, idx) => {
      const id = `art-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
      const isOneToOneRatio = newItem.width === newItem.height || newItem.aspectRatio === 'square';
      return {
        ...newItem,
        id,
        createdAt: now,
        views: Math.floor(Math.random() * 50) + 5,
        downloads: 0,
        likes: 0,
        isUserUploaded: true,
        isOneToOneRatio: isOneToOneRatio || newItem.isOneToOneRatio,
      };
    });

    const current = this.getArtworks();
    const updated = [...newArtworks, ...current];
    this.saveArtworks(updated);

    fetch('/api/artworks/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newArtworks),
    }).catch(() => {});

    return newArtworks;
  },

  // Update existing artwork
  updateArtwork(id: string, updates: Partial<ArtItem>): ArtItem | null {
    const current = this.getArtworks();
    let updatedItem: ArtItem | null = null;
    const updatedList = current.map(item => {
      if (item.id === id) {
        const isOneToOne = (updates.width && updates.height && updates.width === updates.height) || updates.aspectRatio === 'square' || item.aspectRatio === 'square';
        updatedItem = { 
          ...item, 
          ...updates,
          isOneToOneRatio: isOneToOne !== undefined ? isOneToOne : item.isOneToOneRatio
        };
        return updatedItem;
      }
      return item;
    });
    if (updatedItem) {
      this.saveArtworks(updatedList);
      fetch(`/api/artworks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      }).catch(() => {});
    }
    return updatedItem;
  },

  // Delete artwork
  deleteArtwork(id: string): void {
    const current = this.getArtworks();
    const updatedList = current.filter(item => item.id !== id);
    this.saveArtworks(updatedList);
    fetch(`/api/artworks/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  },

  // Increment download count
  incrementDownload(id: string): void {
    const current = this.getArtworks();
    const updatedList = current.map(item => {
      if (item.id === id) {
        return { ...item, downloads: item.downloads + 1 };
      }
      return item;
    });
    this.saveArtworks(updatedList);
  },

  // Increment view count
  incrementView(id: string): void {
    const current = this.getArtworks();
    const updatedList = current.map(item => {
      if (item.id === id) {
        return { ...item, views: item.views + 1 };
      }
      return item;
    });
    this.saveArtworks(updatedList);
  },

  // User likes handling
  getUserLikes(): string[] {
    try {
      const stored = localStorage.getItem(LIKES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  toggleLike(id: string): boolean {
    const likes = this.getUserLikes();
    const index = likes.indexOf(id);
    let isLikedNow = false;
    let newLikes: string[] = [];

    if (index >= 0) {
      newLikes = likes.filter(itemId => itemId !== id);
      isLikedNow = false;
    } else {
      newLikes = [...likes, id];
      isLikedNow = true;
    }

    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(newLikes));

    // Update count in store
    const current = this.getArtworks();
    const updatedList = current.map(item => {
      if (item.id === id) {
        return {
          ...item,
          likes: isLikedNow ? item.likes + 1 : Math.max(0, item.likes - 1)
        };
      }
      return item;
    });
    this.saveArtworks(updatedList);

    return isLikedNow;
  },

  // Site Branding
  getBranding(): SiteBranding {
    try {
      const stored = localStorage.getItem(BRANDING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_BRANDING, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load site branding', e);
    }
    return DEFAULT_BRANDING;
  },

  saveBranding(branding: SiteBranding): void {
    try {
      localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(branding));
      fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      }).catch(() => {});
    } catch (e: any) {
      console.warn('Failed to save branding to storage:', e?.message || e);
    }
  },

  // Categories
  getCategories(): string[] {
    try {
      const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load categories', e);
    }
    return DEFAULT_CATEGORIES;
  },

  saveCategories(categories: string[]): void {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  },

  addCategory(newCategory: string): string[] {
    const trimmed = newCategory.trim();
    if (!trimmed) return this.getCategories();
    const current = this.getCategories();
    if (!current.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...current, trimmed];
      this.saveCategories(updated);
      return updated;
    }
    return current;
  },

  deleteCategory(categoryName: string): string[] {
    const current = this.getCategories();
    const updated = current.filter(c => c !== categoryName && c !== 'All');
    this.saveCategories(updated);
    return updated;
  },

  renameCategory(oldName: string, newName: string): string[] {
    const trimmedNew = newName.trim();
    if (!trimmedNew || oldName === 'All' || oldName === trimmedNew) return this.getCategories();
    
    // Update Categories list
    const current = this.getCategories();
    const updatedCategories = current.map(c => c === oldName ? trimmedNew : c);
    this.saveCategories(updatedCategories);

    // Update artworks referencing old category name
    const artworks = this.getAllArtworks();
    let modified = false;
    const updatedArtworks = artworks.map(art => {
      if (art.category === oldName) {
        modified = true;
        const newTags = art.tags.map(t => t === oldName ? trimmedNew : t);
        return { ...art, category: trimmedNew, tags: newTags };
      }
      return art;
    });

    if (modified) {
      this.saveArtworks(updatedArtworks);
    }

    return updatedCategories;
  },

  // Ad Settings handling
  getAdSettings(): AdSettings {
    try {
      const stored = localStorage.getItem(AD_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_AD_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load ad settings', e);
    }
    return DEFAULT_AD_SETTINGS;
  },

  saveAdSettings(settings: AdSettings): void {
    try {
      localStorage.setItem(AD_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to save ad settings', e);
    }
  },

  // Reset gallery to defaults
  resetToDefaults(): void {
    localStorage.setItem(ARTWORKS_STORAGE_KEY, JSON.stringify(INITIAL_ARTWORKS));
    localStorage.setItem(AD_SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_AD_SETTINGS));
    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(DEFAULT_BRANDING));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  },

  // Admin Credentials
  getAdminCredentials(): { id: string; pass: string } {
    try {
      const stored = localStorage.getItem(ADMIN_CREDS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.id && parsed.pass) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse admin credentials', e);
    }
    const defaultCreds = { id: 'Inkprowl', pass: 'inkprowl@2027' };
    localStorage.setItem(ADMIN_CREDS_STORAGE_KEY, JSON.stringify(defaultCreds));
    return defaultCreds;
  },

  verifyAdminLogin(idInput: string, passInput: string): boolean {
    const creds = this.getAdminCredentials();
    const idMatches = creds.id.toLowerCase() === idInput.trim().toLowerCase() || idInput.trim() === 'Inkprowl';
    const passMatches = creds.pass === passInput.trim();
    return idMatches && passMatches;
  },

  updateAdminCredentials(newId: string, newPass: string): void {
    const creds = { id: newId.trim(), pass: newPass.trim() };
    localStorage.setItem(ADMIN_CREDS_STORAGE_KEY, JSON.stringify(creds));
  }
};

