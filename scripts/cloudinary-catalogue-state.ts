export type GeneratedCatalogueState = Record<string, any>;

/**
 * Removes every catalogue pointer owned by a Cloudinary-managed asset after
 * Cloudinary confirms permanent deletion. Keeping this pure makes the
 * deletion state transition regression-testable without invoking Cloudinary.
 */
export function removeCatalogueAssetState(catalogue: GeneratedCatalogueState, key: string) {
  if (key.startsWith("artwork:")) {
    const slug = key.slice("artwork:".length);
    catalogue.artworks = (catalogue.artworks ?? []).filter((artwork: { assetKey?: string }) => artwork.assetKey !== key);
    const hiddenOverride = catalogue.artworkOverrides?.[slug]?.isPublished === false;
    if (catalogue.artworkOverrides && !hiddenOverride) delete catalogue.artworkOverrides[slug];
    if (catalogue.artworkMedia) delete catalogue.artworkMedia[slug];
  }

  if (key.startsWith("gif:")) {
    const slug = key.slice("gif:".length);
    catalogue.gifs = (catalogue.gifs ?? []).filter((gif: { assetKey?: string }) => gif.assetKey !== key);
    const hiddenOverride = catalogue.gifOverrides?.[slug]?.isPublished === false;
    if (catalogue.gifOverrides && !hiddenOverride) delete catalogue.gifOverrides[slug];
  }

  if (key.startsWith("artworkVideo:")) {
    const slug = key.slice("artworkVideo:".length);
    const current = catalogue.artworkMedia?.[slug] ?? {};
    delete current.videoUrl;
    if (Object.keys(current).length) catalogue.artworkMedia[slug] = current;
    else if (catalogue.artworkMedia) delete catalogue.artworkMedia[slug];
  }

  if (key === "siteMedia:soundtrack") {
    delete catalogue.siteMedia?.soundtrackUrl;
    if (catalogue.siteMedia) {
      catalogue.siteMedia.soundtrackTitle = "Curated sound";
      delete catalogue.siteMedia.soundtrackArtist;
    }
  }
  if (key === "siteMedia:heroFilm") delete catalogue.siteMedia?.heroFilmUrl;
  if (key === "siteBranding:heroBanner") delete catalogue.siteBranding?.heroBannerUrl;
  if (key === "siteBranding:logo") delete catalogue.siteBranding?.logoUrl;
  if (key === "sponsoredCampaign:video") {
    delete catalogue.sponsoredCampaign?.videoUrl;
    if (catalogue.sponsoredCampaign) catalogue.sponsoredCampaign.enabled = false;
  }
  if (catalogue.assets) delete catalogue.assets[key];
}
