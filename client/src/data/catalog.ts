import generatedCatalogueJson from "./generated-catalog.json";

export type DownloadFormat = "jpg" | "png" | "webp";
export type GifDownloadFormat = "gif";

export type Artwork = {
  slug: string;
  title: string;
  category: string;
  description: string;
  isPremium: boolean;
  isPublished?: boolean;
  accent: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  orientation: "portrait" | "landscape" | "square";
  tags: string[];
  downloadFormats?: DownloadFormat[];
  assetKey?: string;
  publishedAt?: string;
};

export type Gif = {
  slug: string;
  title: string;
  category: "GIFs";
  description: string;
  isPremium: boolean;
  isPublished?: boolean;
  accent: string;
  imageUrl: string;
  mediaType: "gif";
  orientation: "portrait" | "landscape" | "square";
  tags: string[];
  downloadFormats?: GifDownloadFormat[];
  assetKey?: string;
  publishedAt?: string;
};

type MediaField = "imageUrl" | "audioUrl" | "videoUrl";

export type SiteMedia = {
  heroFilmUrl?: string;
  defaultArtworkFilmUrl?: string;
  soundtrackUrl?: string;
  soundtrackTitle: string;
  soundtrackArtist?: string;
};

export type SiteBranding = {
  logoUrl?: string;
  heroBannerUrl?: string;
  heroTitle: string;
  heroKicker: string;
  heroFeaturedLabel?: string;
  heroFeaturedTitle?: string;
};

export type SponsoredCampaign = {
  enabled: boolean;
  label: string;
  clientName: string;
  clientUrl?: string;
  videoUrl?: string;
};

export type AdvertisingSettings = {
  /** Global owner switch. Turning it off hides all public placements without clearing provider code or placement choices. */
  advertisingEnabled?: boolean;
  adsenseEnabled: boolean;
  adsterraEnabled: boolean;
  adsenseCode?: string;
  adsterraCode?: string;
  placements?: Partial<Record<AdvertisingPlacement, boolean>>;
  placementCodes?: Partial<Record<AdvertisingPlacement, { adsense?: string; adsterra?: string }>>;
};

export const advertisingPlacements = ["header", "social-native", "between-grid", "popunder", "footer", "native-banner", "social-bar", "rectangle-300x250", "leaderboard-728x90", "mobile-320x50"] as const;
export type AdvertisingPlacement = (typeof advertisingPlacements)[number];
/** Owner-selectable Adsterra units that render only in their matching visible public hosts. */
export const adsterraVisiblePlacements: readonly AdvertisingPlacement[] = ["native-banner", "social-bar", "rectangle-300x250", "leaderboard-728x90", "mobile-320x50"];
/** Legacy code remains preserved in the catalogue, but these are the only generic slots exposed to the owner editor. */
export const ownerAdvertisingPlacements = ["header", "between-grid", "popunder", "footer"] as const satisfies readonly AdvertisingPlacement[];
export const advertisingPlacementLabels: Record<AdvertisingPlacement, string> = {
  header: "Header banner",
  "social-native": "Social / native banner",
  "between-grid": "Between artwork grids",
  popunder: "Popunder",
  footer: "Footer banner",
  "native-banner": "Adsterra Native Banner",
  "social-bar": "Adsterra Social Bar",
  "rectangle-300x250": "Adsterra 300 × 250",
  "leaderboard-728x90": "Adsterra 728 × 90",
  "mobile-320x50": "Adsterra 320 × 50",
};
type ManagedAsset = { publicId: string; resourceType: "image" | "video"; deliveryUrl: string };
type CategoryDefinition = { name: string; icon?: string; count?: number };
type GeneratedCatalogue = {
  artworks: Artwork[];
  artworkOverrides?: Record<string, Partial<Pick<Artwork, "title" | "category" | "description" | "tags" | "isPublished">>>;
  artworkMedia: Record<string, Partial<Pick<Artwork, "audioUrl" | "videoUrl">>>;
  gifs?: Gif[];
  gifOverrides?: Record<string, Partial<Pick<Gif, "title" | "description" | "tags" | "isPublished">> & { metaTitle?: string; metaDescription?: string }>;
  siteMedia: Partial<SiteMedia>;
  siteBranding: Partial<SiteBranding>;
  sponsoredCampaign: Partial<SponsoredCampaign>;
  advertisingSettings: Partial<AdvertisingSettings>;
  categories?: CategoryDefinition[];
  categoryAliases?: Record<string, string>;
  assets: Record<string, ManagedAsset>;
};
const generatedCatalogue = generatedCatalogueJson as GeneratedCatalogue;

/** Only stable Cloudinary delivery URLs are permitted for permanent INKPROWL media. */
export const isCloudinaryDeliveryUrl = (url: string) =>
  /^https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\//.test(url);

export function validateArtworkMedia(artwork: Artwork) {
  const mediaFields: MediaField[] = ["imageUrl", "audioUrl", "videoUrl"];
  for (const field of mediaFields) {
    const url = artwork[field];
    if (url && !isCloudinaryDeliveryUrl(url)) {
      throw new Error(`${artwork.slug}: ${field} must be a Cloudinary delivery URL`);
    }
  }
}

export function validateSiteMedia(media: SiteMedia) {
  const mediaFields: (keyof Pick<SiteMedia, "heroFilmUrl" | "defaultArtworkFilmUrl" | "soundtrackUrl">)[] = ["heroFilmUrl", "defaultArtworkFilmUrl", "soundtrackUrl"];
  for (const field of mediaFields) {
    const url = media[field];
    if (url && !isCloudinaryDeliveryUrl(url)) {
      throw new Error(`siteMedia: ${field} must be a Cloudinary delivery URL`);
    }
  }
}

/** Owner-managed Cloudinary delivery settings. Leave a field empty until the matching asset is published in Cloudinary. */
export const siteMedia: SiteMedia = {
  heroFilmUrl: undefined,
  defaultArtworkFilmUrl: undefined,
  soundtrackUrl: undefined,
  soundtrackTitle: "Curated sound",
  soundtrackArtist: "INKPROWL",
  ...generatedCatalogue.siteMedia,
};

/** Owner-managed image branding. Only Cloudinary image delivery URLs are accepted. */
export const siteBranding: SiteBranding = {
  logoUrl: undefined,
  heroBannerUrl: undefined,
  heroKicker: "HUMAN-DIRECTED / AI-CRAFTED",
  heroTitle: "Art that prowls past the ordinary.",
  heroFeaturedLabel: "01 — FEATURED EDITION",
  heroFeaturedTitle: "Panther in Pinstripe Suit",
  ...generatedCatalogue.siteBranding,
};

/** A direct sponsored-client video can be published after the owner has approved its Cloudinary delivery URL. */
export const sponsoredCampaign: SponsoredCampaign = {
  enabled: false,
  label: "PRESENTED IN PARTNERSHIP",
  clientName: "A considered sponsor",
  clientUrl: undefined,
  videoUrl: undefined,
  ...generatedCatalogue.sponsoredCampaign,
};

/** Static advertisement placements are only activated by the owner after the relevant provider code is approved. */
export const advertisingSettings: AdvertisingSettings = {
  advertisingEnabled: true,
  adsenseEnabled: false,
  adsterraEnabled: false,
  ...generatedCatalogue.advertisingSettings,
  placements: generatedCatalogue.advertisingSettings.placements ?? {},
};

export const activeAdvertisementProviders = (settings: AdvertisingSettings = advertisingSettings) => [
  settings.advertisingEnabled !== false && settings.adsenseEnabled ? "Google AdSense" : undefined,
  settings.advertisingEnabled !== false && settings.adsterraEnabled ? "Adsterra" : undefined,
].filter((provider): provider is string => Boolean(provider));

export const isAdvertisementPlacementEnabled = (placement: AdvertisingPlacement, settings: AdvertisingSettings = advertisingSettings) => {
  // The owner master switch hides every public placement while preserving the saved configuration.
  if (settings.advertisingEnabled === false) return false;
  // Popunder networks hijack ordinary navigation gestures without providing a visible placement.
  // Preserve owner configuration data, but never execute those scripts in the public experience.
  if (placement === "popunder") return false;
  const configuredState = settings.placements?.[placement];
  if (isAdsterraVisiblePlacement(placement)) return Boolean(configuredState) && settings.adsterraEnabled;
  return Boolean(configuredState) && activeAdvertisementProviders(settings).length > 0;
};

export const isAdsterraVisiblePlacement = (placement: AdvertisingPlacement) =>
  ["native-banner", "social-bar", "rectangle-300x250", ...adsterraVisiblePlacements].includes(placement);

/** Fixed-size provider snippets share a global atOptions value, so only mount the banner that matches the active viewport. */
export const isAdvertisementPlacementRenderableAtViewport = (placement: AdvertisingPlacement, isMobileViewport: boolean) => {
  if (placement === "leaderboard-728x90") return !isMobileViewport;
  if (placement === "mobile-320x50") return isMobileViewport;
  return true;
};

/** Owner code always remains saved; snippets labelled as Popunder do not render in visible slots. */
export const isSafeVisibleAdsterraCode = (code: string | undefined) => {
  const normalized = code?.trim().toLowerCase();
  return normalized !== undefined && normalized.length > 0 && !/(popunder|pop-under)/.test(normalized);
};

export type AdvertisementProviderCode = { name: "Google AdSense" | "Adsterra"; code: string };

/** Resolve exactly which approved code snippets may mount in one visible public slot. */
export const getAdvertisementProviderCodes = (placement: AdvertisingPlacement, settings: AdvertisingSettings = advertisingSettings): AdvertisementProviderCode[] => {
  if (!isAdvertisementPlacementEnabled(placement, settings)) return [];
  const placementCodes = settings.placementCodes?.[placement];
  if (isAdsterraVisiblePlacement(placement)) {
    const code = placementCodes?.adsterra;
    return settings.adsterraEnabled && isSafeVisibleAdsterraCode(code) ? [{ name: "Adsterra", code: code! }] : [];
  }
  const providerCodes: AdvertisementProviderCode[] = [];
  const adsenseCode = placementCodes?.adsense ?? settings.adsenseCode;
  const adsterraCode = placementCodes?.adsterra ?? settings.adsterraCode;
  if (settings.adsenseEnabled && adsenseCode?.trim()) providerCodes.push({ name: "Google AdSense", code: adsenseCode });
  if (settings.adsterraEnabled && isSafeVisibleAdsterraCode(adsterraCode)) providerCodes.push({ name: "Adsterra", code: adsterraCode! });
  return providerCodes;
};

export const availableDownloadFormats = (artwork: Artwork): DownloadFormat[] => artwork.downloadFormats ?? ["jpg", "png", "webp"];

export const getCloudinaryDownloadUrl = (imageUrl: string | undefined, slug: string, format: DownloadFormat) => {
  if (!imageUrl || !isCloudinaryDeliveryUrl(imageUrl) || !imageUrl.includes("/image/upload/")) return undefined;
  const filename = `inkprowl-${slug}-${format}`;
  return imageUrl.replace("/image/upload/", `/image/upload/f_${format},fl_attachment:${filename}/`);
};

export const getArtworkShareUrl = (slug: string) => `https://inkprowl.github.io/inkprowl/art/${slug}/`;
export const getGifShareUrl = (slug: string) => `https://inkprowl.github.io/inkprowl/gif/${slug}/`;

/** The GIF download deliberately keeps the original animated asset; no format conversion is applied. */
export const getCloudinaryGifDownloadUrl = (gifUrl: string | undefined, slug: string) => {
  if (!gifUrl || !isCloudinaryDeliveryUrl(gifUrl) || !gifUrl.includes("/image/upload/")) return undefined;
  return gifUrl.replace("/image/upload/", `/image/upload/fl_attachment:inkprowl-${slug}-gif/`);
};

function validateCloudinaryImageUrl(url: string | undefined, field: string) {
  if (url && (!isCloudinaryDeliveryUrl(url) || !url.includes("/image/upload/"))) {
    throw new Error(`${field} must be a Cloudinary image delivery URL`);
  }
}

function validateCloudinaryVideoUrl(url: string | undefined, field: string) {
  if (url && (!isCloudinaryDeliveryUrl(url) || !url.includes("/video/upload/"))) {
    throw new Error(`${field} must be a Cloudinary video delivery URL`);
  }
}

export function isApprovedClientDestination(url: string | undefined) {
  if (!url) return true;
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return false;
  }
}

export function validateOwnerConfiguration() {
  validateCloudinaryImageUrl(siteBranding.logoUrl, "siteBranding.logoUrl");
  validateCloudinaryImageUrl(siteBranding.heroBannerUrl, "siteBranding.heroBannerUrl");
  validateCloudinaryVideoUrl(sponsoredCampaign.videoUrl, "sponsoredCampaign.videoUrl");
  if (!isApprovedClientDestination(sponsoredCampaign.clientUrl)) throw new Error("sponsoredCampaign.clientUrl must be an HTTPS client destination");
}

const baseCategories: CategoryDefinition[] = [
  { name: "Business Animals", icon: "♜", count: 19 },
  { name: "Mafia Bosses", icon: "♛", count: 8 },
  { name: "Funny Animals", icon: "✦", count: 8 },
  { name: "Collectible Art", icon: "✧", count: 16 },
  { name: "Tailored Animals", icon: "✂", count: 11 },
  { name: "Vintage Comic Art", icon: "▣", count: 13 },
  { name: "Cross-Hatching", icon: "╱", count: 14 },
  { name: "2D Line Art", icon: "⌁", count: 9 },
  { name: "Animal Characters", icon: "◉", count: 22 },
  { name: "Fashion Animals", icon: "◈", count: 7 },
  { name: "Premium Art", icon: "✩", count: 10 },
  { name: "Free Art", icon: "↓", count: 18 },
];

const categoryAliases = generatedCatalogue.categoryAliases ?? {};
export const categories = [...baseCategories, ...(generatedCatalogue.categories ?? [])]
  .map((category) => ({ ...category, name: categoryAliases[category.name] ?? category.name }))
  .filter((category, index, all) => all.findIndex((candidate) => candidate.name === category.name) === index);

/** GIFs remain an isolated media collection, but their category is always discoverable. */
export const gifCategory: CategoryDefinition = { name: "GIFs", icon: "↻", count: (generatedCatalogue.gifs ?? []).filter((gif) => gif.isPublished !== false).length };

/** The public gallery intentionally contains only owner-managed catalogue records. New uploads are inserted first by the sync worker. */
export const artworks: Artwork[] = [
  ...generatedCatalogue.artworks.map((artwork) => ({ ...artwork, ...(generatedCatalogue.artworkOverrides?.[artwork.slug] ?? {}), ...(generatedCatalogue.artworkMedia[artwork.slug] ?? {}) })),
].map((artwork) => ({
  ...artwork,
  category: categoryAliases[artwork.category] ?? artwork.category,
}));

artworks.forEach(validateArtworkMedia);
validateSiteMedia(siteMedia);
validateOwnerConfiguration();

export const publishedArtworks = artworks.filter((artwork) => artwork.isPublished !== false);
export const getArtwork = (slug: string) => publishedArtworks.find((artwork) => artwork.slug === slug);
export const relatedArtworks = (artwork: Artwork) => publishedArtworks.filter((candidate) => candidate.slug !== artwork.slug && candidate.category === artwork.category).slice(0, 3);

export const gifs: Gif[] = (generatedCatalogue.gifs ?? []).map((gif) => ({ ...gif, ...(generatedCatalogue.gifOverrides?.[gif.slug] ?? {}) }));
gifs.forEach((gif) => validateArtworkMedia({ ...gif, downloadFormats: ["jpg"] }));
export const publishedGifs = gifs.filter((gif) => gif.isPublished !== false);
export const getGif = (slug: string) => publishedGifs.find((gif) => gif.slug === slug);
export const relatedGifs = (gif: Gif) => publishedGifs.filter((candidate) => candidate.slug !== gif.slug).slice(0, 3);

/** Public homepage discovery intentionally combines media types without changing the artwork-only gallery contracts. */
export type DiscoveryEdition =
  | (Artwork & { editionType: "artwork" })
  | (Gif & { editionType: "gif" });

const discoveryTimestamp = (edition: Artwork | Gif) => {
  const timestamp = Date.parse(edition.publishedAt ?? "");
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const publishedEditions: DiscoveryEdition[] = [
  ...publishedArtworks.map((artwork) => ({ ...artwork, editionType: "artwork" as const })),
  ...publishedGifs.map((gif) => ({ ...gif, editionType: "gif" as const })),
].sort((left, right) => discoveryTimestamp(right) - discoveryTimestamp(left));

export const freshEditions = publishedEditions.slice(0, 5);
export const trendingEditions = publishedEditions.filter((edition) => !freshEditions.some((fresh) => fresh.editionType === edition.editionType && fresh.slug === edition.slug)).slice(0, 4);
