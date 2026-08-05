export type Orientation = 'all' | 'landscape' | 'portrait' | 'square';

export type PageRoute = 'home' | 'art-detail' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact';

export type Category = string;

export interface ArtItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  width: number;
  height: number;
  aspectRatio: 'landscape' | 'portrait' | 'square';
  format: 'PNG' | 'JPG' | 'WebP';
  fileSize: string;
  views: number;
  downloads: number;
  likes: number;
  createdAt: string;
  author: string;
  authorAvatar?: string;
  license: string;
  imageUrl: string;
  highResUrl?: string;
  palette?: string[]; // Array of hex color strings
  featured?: boolean;
  isOneToOneRatio?: boolean;
  isUserUploaded?: boolean;
  price?: number; // 0 for free, or premium price tag
}

export interface SiteBranding {
  siteTitle: string;
  siteSubtitle: string;
  logoUrl: string;
  heroBannerUrl: string;
  contactEmail: string;
  heroHeadline: string;
  heroSubheadline: string;
  headCustomCode?: string;
  footerCustomCode?: string;
  aboutPageContent?: string;
  termsPageContent?: string;
  privacyPageContent?: string;
  cloudinaryCloudName?: string;
  cloudinaryUploadPreset?: string;
}

export interface AdminCredentials {
  username: string;
  passwordHash: string;
}

export type AdProviderMode = 'both' | 'adsense' | 'adsterra' | 'demo';

export interface AdSenseConfig {
  publisherId: string;
  headerLeaderboardSlot: string;
  sidebarRectangleSlot: string;
  downloadBannerSlot: string;
  inGridNativeSlot: string;
  autoAdsEnabled: boolean;
}

export interface AdsterraConfig {
  bannerScript: string;
  nativeBannerKey: string;
  socialBarKey: string;
  directLinkUrl: string;
  popunderScript: string;
}

export interface AdSettings {
  enabled: boolean;
  mode: AdProviderMode;
  adsense: AdSenseConfig;
  adsterra: AdsterraConfig;
  adFrequencyInGrid: number;
  downloadCountdownSeconds: number;
  showAdOnDownload: boolean;
  openDirectLinkOnDownload: boolean;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  selectedTag: string | null;
  orientation: Orientation;
  selectedColor: string | null;
  sortBy: 'trending' | 'latest' | 'downloads' | 'likes';
  onlyOneToOne: boolean;
}

