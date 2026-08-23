import { describe, expect, it } from "vitest";
import { activeAdvertisementProviders, adsterraVisiblePlacements, advertisingPlacements, advertisingSettings, artworks, availableDownloadFormats, categories, getAdvertisementProviderCodes, getArtwork, getArtworkShareUrl, getCloudinaryDownloadUrl, isAdvertisementPlacementEnabled, isAdvertisementPlacementRenderableAtViewport, isApprovedClientDestination, isCloudinaryDeliveryUrl, isSafeVisibleAdsterraCode, publishedArtworks, relatedArtworks, siteBranding, siteMedia, sponsoredCampaign, validateArtworkMedia, validateOwnerConfiguration, validateSiteMedia } from "./catalog";

describe("INKPROWL catalog", () => {
  it("contains all requested public browsing categories while honouring the owner-approved category rename", () => {
    expect(categories.map((category) => category.name)).toEqual([
      "Business Animals",
      "Mafia Bosses",
      "Funny Animals",
      "Collectible Art",
      "Tailored Animals",
      "Vintage Comic Art",
      "BEAR & BULL MARKET",
      "2D Line Art",
      "Animal Characters",
      "Fashion Animals",
      "Premium Art",
      "Free Art",
    ]);
    expect(categories).toHaveLength(12);
  });

  it("shows only owner-managed Cloudinary editions in the catalog", () => {
    const newest = publishedArtworks[0];

    expect(newest?.isPremium).toBe(false);
    expect(newest?.imageUrl).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    expect(artworks.every((artwork) => Boolean(artwork.assetKey))).toBe(true);
  });

  it("keeps every published edition available for free access", () => {
    expect(artworks.every((artwork) => !artwork.isPremium)).toBe(true);
  });

  it("creates an unrestricted attachment link for every public edition", () => {
    expect(publishedArtworks.length).toBeGreaterThan(0);
    for (const artwork of publishedArtworks) {
      expect(artwork.imageUrl).toMatch(/^https:\/\/res\.cloudinary\.com\//);
      for (const format of availableDownloadFormats(artwork)) {
        expect(getCloudinaryDownloadUrl(artwork.imageUrl, artwork.slug, format)).toContain(`fl_attachment:inkprowl-${artwork.slug}-${format}`);
      }
    }
  });

  it("never recommends the active artwork as related work", () => {
    const current = artworks[0]!;
    const related = relatedArtworks(current);

    expect(related.every((artwork) => artwork.slug !== current.slug)).toBe(true);
  });

  it("accepts only Cloudinary URLs for permanent image, audio, and video fields", () => {
    expect(isCloudinaryDeliveryUrl("https://res.cloudinary.com/inkprowl/image/upload/v1/panther.png")).toBe(true);
    expect(isCloudinaryDeliveryUrl("https://res.cloudinary.com/inkprowl/video/upload/v1/score.mp3")).toBe(true);
    expect(isCloudinaryDeliveryUrl("https://example.com/panther.png")).toBe(false);
    expect(() => validateArtworkMedia({
      ...artworks[0]!,
      imageUrl: "https://example.com/panther.png",
    })).toThrow(/Cloudinary delivery URL/);
  });

  it("keeps optional site-wide soundtrack and film settings Cloudinary-only", () => {
    expect(() => validateSiteMedia(siteMedia)).not.toThrow();
    expect(() => validateSiteMedia({ ...siteMedia, soundtrackUrl: "https://example.com/score.mp3" })).toThrow(/Cloudinary delivery URL/);
    expect(siteMedia.soundtrackArtist).toBeTruthy();
  });

  it("provides owner-editable defaults for the homepage featured-banner caption", () => {
    expect(siteBranding.heroFeaturedLabel).toBe("01 — FEATURED EDITION");
    expect(siteBranding.heroFeaturedTitle).toBe("Panther in Pinstripe Suit");
  });

  it("provides the active campaign Cloudinary film for individual artwork-player fallback", () => {
    expect(isCloudinaryDeliveryUrl(sponsoredCampaign.videoUrl)).toBe(true);
  });

  it("exposes only explicitly enabled advertising providers to public placements", () => {
    expect(activeAdvertisementProviders(advertisingSettings)).toEqual([]);
    expect(activeAdvertisementProviders({ adsenseEnabled: true, adsterraEnabled: false })).toEqual(["Google AdSense"]);
    expect(activeAdvertisementProviders({ adsenseEnabled: true, adsterraEnabled: true })).toEqual(["Google AdSense", "Adsterra"]);
  });

  it("keeps named advertising placements hidden until both a provider and the placement are enabled", () => {
    expect(advertisingPlacements).toEqual(["header", "social-native", "between-grid", "popunder", "footer", "native-banner", "social-bar", "rectangle-300x250", "leaderboard-728x90", "mobile-320x50"]);
    expect(isAdvertisementPlacementEnabled("header", advertisingSettings)).toBe(false);
    expect(isAdvertisementPlacementEnabled("between-grid", { adsenseEnabled: true, adsterraEnabled: false, placements: { "between-grid": true } })).toBe(true);
    expect(isAdvertisementPlacementEnabled("footer", { adsenseEnabled: false, adsterraEnabled: false, placements: { footer: true } })).toBe(false);
  });

  it("keeps Popunder code dormant so ordinary site clicks never launch an unexpected ad link", () => {
    const configuredPopunder = { adsenseEnabled: false, adsterraEnabled: true, placements: {}, placementCodes: { popunder: { adsterra: '<script src="https://example.test/popunder.js"></script>' } } };
    expect(isAdvertisementPlacementEnabled("popunder", configuredPopunder)).toBe(false);
    expect(isAdvertisementPlacementEnabled("popunder", { ...configuredPopunder, placements: { popunder: true } })).toBe(false);
    expect(isAdvertisementPlacementEnabled("popunder", { ...configuredPopunder, placements: { popunder: false } })).toBe(false);
  });

  it("keeps every requested visible Adsterra format as an independent owner-controlled placement", () => {
    expect(adsterraVisiblePlacements).toEqual(["native-banner", "social-bar", "rectangle-300x250", "leaderboard-728x90", "mobile-320x50"]);
    for (const placement of adsterraVisiblePlacements) {
      expect(isAdvertisementPlacementEnabled(placement, advertisingSettings)).toBe(false);
      expect(isAdvertisementPlacementEnabled(placement, { adsenseEnabled: false, adsterraEnabled: true, placements: { [placement]: true } })).toBe(true);
    }
  });

  it("mounts only the matching fixed-size provider banner for the active viewport", () => {
    expect(isAdvertisementPlacementRenderableAtViewport("leaderboard-728x90", false)).toBe(true);
    expect(isAdvertisementPlacementRenderableAtViewport("leaderboard-728x90", true)).toBe(false);
    expect(isAdvertisementPlacementRenderableAtViewport("mobile-320x50", false)).toBe(false);
    expect(isAdvertisementPlacementRenderableAtViewport("mobile-320x50", true)).toBe(true);
  });

  it("uses the owner master switch to hide every placement without erasing saved code or placement choices", () => {
    const settings = {
      advertisingEnabled: false,
      adsenseEnabled: false,
      adsterraEnabled: true,
      placements: { "leaderboard-728x90": true },
      placementCodes: { "leaderboard-728x90": { adsterra: '<script src="https://cdn.example.test/leaderboard.js"></script>' } },
    };
    expect(settings.placementCodes["leaderboard-728x90"]?.adsterra).toContain("leaderboard.js");
    expect(settings.placements["leaderboard-728x90"]).toBe(true);
    expect(isAdvertisementPlacementEnabled("leaderboard-728x90", settings)).toBe(false);
    expect(getAdvertisementProviderCodes("leaderboard-728x90", settings)).toEqual([]);
    expect(isAdvertisementPlacementEnabled("leaderboard-728x90", { ...settings, advertisingEnabled: true })).toBe(true);
  });

  it("accepts provider-hosted visible unit scripts while withholding only snippets explicitly marked as Popunder", () => {
    expect(isSafeVisibleAdsterraCode('<script src="https://cdn.example.test/banner.js"></script>')).toBe(true);
    expect(isSafeVisibleAdsterraCode('<script async src="https://profitableratecpmnetwork.com/df1754d24286634e3299cded445fd34e/invoke.js"></script>')).toBe(true);
    expect(isSafeVisibleAdsterraCode('<script>/* popunder */</script>')).toBe(false);
  });

  it("selects visible Adsterra code only for its enabled matching slot and never for Popunder", () => {
    const settings = {
      adsenseEnabled: false,
      adsterraEnabled: true,
      placements: { "leaderboard-728x90": true, "mobile-320x50": true, popunder: true },
      placementCodes: {
        "leaderboard-728x90": { adsterra: '<script src="https://cdn.example.test/leaderboard.js"></script>' },
        popunder: { adsterra: '<script src="https://cdn.example.test/popunder.js"></script>' },
      },
    };
    expect(getAdvertisementProviderCodes("leaderboard-728x90", settings)).toEqual([{ name: "Adsterra", code: '<script src="https://cdn.example.test/leaderboard.js"></script>' }]);
    expect(getAdvertisementProviderCodes("mobile-320x50", settings)).toEqual([]);
    expect(getAdvertisementProviderCodes("popunder", settings)).toEqual([]);
  });

  it("keeps provider-hosted visible code available for its selected unit without relying on a provider domain allowlist", () => {
    const code = '<script async src="https://profitableratecpmnetwork.com/df1754d24286634e3299cded445fd34e/invoke.js"></script>';
    const settings = { adsenseEnabled: false, adsterraEnabled: true, placements: { "leaderboard-728x90": true }, placementCodes: { "leaderboard-728x90": { adsterra: code } } };
    expect(getAdvertisementProviderCodes("leaderboard-728x90", settings)).toEqual([{ name: "Adsterra", code }]);
  });

  it("uses saved Native Banner code only in its enabled dedicated visible slot", () => {
    const code = '<script async data-cfasync="false" src="https://pl30795920.profitableratecpmnetwork.com/c1f8260496fe21bbc3c50899238f0512/invoke.js"></script><div id="container-c1f8260496fe21bbc3c50899238f0512"></div>';
    const settings = { advertisingEnabled: true, adsenseEnabled: false, adsterraEnabled: true, placements: { "native-banner": true }, placementCodes: { "native-banner": { adsterra: code } } };
    expect(getAdvertisementProviderCodes("native-banner", settings)).toEqual([{ name: "Adsterra", code }]);
    expect(getAdvertisementProviderCodes("social-native", { ...settings, advertisingEnabled: false })).toEqual([]);
  });

  it("creates Cloudinary attachment URLs for each approved free-download format", () => {
    const newest = publishedArtworks[0]!;
    expect(availableDownloadFormats(newest)).toEqual(["jpg", "png", "webp"]);
    expect(new Set(availableDownloadFormats(newest))).toEqual(new Set(["jpg", "png", "webp"]));
    for (const format of ["jpg", "png", "webp"] as const) {
      expect(getCloudinaryDownloadUrl(newest.imageUrl, newest.slug, format)).toContain(`/image/upload/f_${format},fl_attachment:inkprowl-${newest.slug}-${format}/`);
    }
    expect(getCloudinaryDownloadUrl(newest.imageUrl, newest.slug, "webp")).toContain(`/image/upload/f_webp,fl_attachment:inkprowl-${newest.slug}-webp/`);
  });

  it("uses direct static edition URLs for social previews and validates owner media settings", () => {
    expect(getArtworkShareUrl(publishedArtworks[0]!.slug)).toBe(`https://inkprowl.github.io/inkprowl/art/${publishedArtworks[0]!.slug}/`);
    expect(() => validateOwnerConfiguration()).not.toThrow();
  });

  it("accepts only HTTPS destinations for sponsored client visit controls", () => {
    expect(isApprovedClientDestination("https://client.example/campaign")).toBe(true);
    expect(isApprovedClientDestination(undefined)).toBe(true);
    expect(isApprovedClientDestination("http://client.example/campaign")).toBe(false);
    expect(isApprovedClientDestination("not-a-url")).toBe(false);
  });
});
