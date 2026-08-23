import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("public media layout contracts", () => {
  it("keeps a Cloudinary hero image inside a defined stage and falls back only if delivery fails", () => {
    const home = source("client/src/pages/Home.tsx");
    const css = source("client/src/index.css");
    expect(home).toContain("function HeroBanner");
    expect(home).toContain("onError={() => setFailed(true)}");
    expect(home).toContain('className="hero-art-stage"');
    expect(css).toContain(".hero-art-stage{position:relative;display:block;width:100%");
    expect(css).toContain(".hero-art-stage>.hero-banner");
  });

  it("keeps sponsor and artwork films in a clean native-control 16:9 landscape frame", () => {
    const css = source("client/src/index.css");
    const subjectSafeCss = source("client/src/components/subjectSafeVideo.css");
    const mediaCss = source("client/src/components/inkprowlMedia.css");
    expect(css).toContain(".cloudinary-video.full-video-fit{display:block;min-height:0;aspect-ratio:16/9");
    expect(css).toContain(".cloudinary-video.full-video-fit>.video-ratio-frame>video");
    expect(css).toContain(".cloudinary-video.full-video-fit>.video-ratio-frame>video,\n.cloudinary-video.hero-video>.video-ratio-frame>video");
    expect(css).toContain("object-fit:contain;object-position:center;background:#110d0b");
    expect(subjectSafeCss).toContain("object-fit: contain !important");
    expect(subjectSafeCss).toContain("object-position: center center !important");
    const chrome = source("client/src/components/InkprowlChrome.tsx");
    expect(chrome).toContain("<video controls preload=\"metadata\" playsInline");
    expect(chrome).not.toContain("video-ambient-backdrop");
    expect(chrome).not.toContain("portraitSource");
    expect(chrome).not.toContain('aria-label="Video volume"');
    expect(mediaCss).toContain(".detail-grid > .detail-video { padding: 14px 0 0 !important; background: transparent !important; }");
    expect(mediaCss).toContain(".detail-grid > .detail-video .cloudinary-video.detail-video-frame { width: 100%; border: 0; box-shadow: none; }");
    expect(css).toContain(".detail-grid>.detail-video{display:block;grid-column:1/-1;padding:56px 0 0;background:transparent}");
    expect(css).toContain(".detail-grid>.detail-video .cloudinary-video.detail-video-frame{display:block;width:100%;max-width:none}");
  });

  it("hides unrelated owner workspaces after the owner chooses a focused task", () => {
    const css = source("client/src/index.css");
    expect(css).toContain('.owner-launch-dashboard[data-workspace="home"] .owner-upload-grid');
    expect(css).toContain('.owner-launch-dashboard[data-workspace="inventory"] .owner-upload-grid');
    expect(css).toContain('.owner-launch-dashboard[data-workspace="categories"] .workspace-inventory');
  });

  it("keeps mobile hero copy compact and starts the soundtrack control minimized on small screens", () => {
    const css = source("client/src/index.css");
    const chrome = source("client/src/components/InkprowlChrome.tsx");
    expect(css).toContain(".hero-copy p{display:none}");
    expect(css).toContain("-webkit-line-clamp:3");
    expect(chrome).toContain('window.matchMedia("(max-width: 800px)").matches');
  });

  it("removes a public artwork card if its Cloudinary image no longer delivers", () => {
    const card = source("client/src/components/ArtworkCard.tsx");
    expect(card).toContain('onImageError={() => setImageFailed(true)}');
    expect(card).toContain("if (imageFailed) return null;");
    expect(card).toContain("if (imageFailed && onImageError) return null;");
  });

  it("keeps public artwork copy art-focused and makes same-tab refresh reuse clear to the owner", () => {
    const drafts = source("client/src/lib/artworkUploadDrafts.ts");
    const sync = source("scripts/sync-cloudinary-media.mjs");
    const admin = source("client/src/pages/Admin.tsx");
    const dashboard = source("client/src/components/OwnerLaunchDashboard.tsx");
    expect(drafts).not.toContain("permanent Cloudinary storage");
    expect(sync).not.toContain("ready for direct Cloudinary download");
    expect(sync).toContain("refreshGeneratedArtworkDescriptions");
    expect(admin).toContain("keeps the verified owner session through refresh");
    expect(dashboard).toContain("Refresh keeps the connection");
    const detail = source("client/src/pages/ArtworkDetail.tsx");
    expect(detail).not.toContain("Direct Cloudinary download");
    expect(detail).not.toContain("permanent Cloudinary edition");
  });

  it("uses touch-first pinch and drag controls with a full-screen viewer for complete individual-artwork inspection", () => {
    const detail = source("client/src/pages/ArtworkDetail.tsx");
    const mediaCss = source("client/src/components/inkprowlMedia.css");
    expect(detail).toContain("onPointerDown={handlePointerDown}");
    expect(detail).toContain("onPointerMove={handlePointerMove}");
    expect(detail).toContain("FullscreenArtworkViewer");
    expect(detail).toContain("Open full-screen artwork");
    expect(detail).toContain("Pinch with two fingers to zoom");
    expect(detail).not.toContain("artwork-zoom-toolbar");
    expect(detail).not.toContain("ZoomIn");
    expect(mediaCss).toContain("touch-action: none");
    expect(mediaCss).toContain(".artwork-zoom-stage.is-zoomed");
    expect(mediaCss).toContain(".artwork-fullscreen-dialog");
    expect(mediaCss).toContain(".artwork-fullscreen-content .art-image");
    expect(mediaCss).toContain("object-fit: contain");
  });

  it("keeps configured display banners dismissible in the header without reactivating Popunder code", () => {
    const chrome = source("client/src/components/InkprowlChrome.tsx");
    const advertisingCss = source("client/src/components/publicAdvertising.css");
    const catalogue = source("client/src/data/catalog.ts");
    expect(chrome).toContain("dismissible-header-ad");
    expect(chrome).toContain("Hide header advertisement");
    expect(chrome).toContain("MutationObserver");
    expect(chrome).toContain('placement="leaderboard-728x90"');
    expect(chrome).toContain('placement="mobile-320x50"');
    expect(advertisingCss).toContain(".dismissible-header-ad");
    expect(advertisingCss).toContain(".dismissible-header-ad.is-waiting");
    expect(catalogue).toContain('if (placement === "popunder") return false;');
  });

  it("prioritizes a compact retro-comic catalogue and truthful discovery modules on the public storefront", () => {
    const home = source("client/src/pages/Home.tsx");
    const css = source("client/src/index.css");
    const retroCss = source("client/src/retro-market.css");
    expect(home).toContain("retro-comic-hero");
    expect(home).toContain("retro-market");
    expect(home).toContain("retro-latest-strip");
    expect(home).toContain("retro-category-tiles");
    expect(home).toContain("retro-media-rail");
    expect(home).toContain("retro-trending-strip");
    expect(home).toContain("latestArtworks");
    expect(home).toContain("collectorPicks");
    expect(css).toContain('@import "./retro-market.css";');
    expect(retroCss).toContain(".retro-market{display:grid;grid-template-columns");
    expect(retroCss).toContain(".retro-latest-strip{display:flex");
    expect(retroCss).toContain(".retro-category-tiles{display:grid");
    expect(retroCss).toContain(".retro-media-rail{display:grid");
    expect(retroCss).toContain(".retro-market{display:flex;flex-direction:column");
    expect(css).toContain(".detail-grid{grid-template-columns:minmax(0,1.5fr)");
  });

  it("places the video and music rail before trending discovery and provides practical soundtrack navigation", () => {
    const home = source("client/src/pages/Home.tsx");
    const chrome = source("client/src/components/InkprowlChrome.tsx");
    const css = source("client/src/index.css");
    const retroCss = source("client/src/retro-market.css");
    expect(home.indexOf("retro-comic-hero")).toBeLessThan(home.indexOf("retro-media-rail"));
    expect(home.indexOf("retro-media-rail")).toBeLessThan(home.indexOf("retro-trending"));
    expect(chrome).toContain("Previous soundtrack or restart");
    expect(chrome).toContain("Rewind 15 seconds");
    expect(chrome).toContain("Forward 15 seconds");
    expect(chrome).toContain("Next soundtrack");
    expect(chrome).toContain("publishedArtworks.filter((artwork) => Boolean(artwork.audioUrl))");
    expect(chrome).toContain("player-compact-transport");
    expect(chrome).toContain("player-drag-handle");
    expect(chrome).toContain("Move music player");
    expect(retroCss).toContain(".retro-rail-video{display:block;width:100%;min-height:0;aspect-ratio:16/9");
    expect(css).toContain(".player-transport");
    expect(css).toContain(".player-compact-transport");
    expect(css).toContain(".hero-art-wrap:before");
  });

  it("keeps the responsive sponsor film landscape, reserves a truly floating desktop player, and prevents category tiles from overflowing narrow screens", () => {
    const retroCss = source("client/src/retro-market.css");
    expect(retroCss).toContain(".retro-video-module .cloudinary-video.retro-rail-video{display:block!important;width:100%!important;height:auto!important;min-height:0!important;aspect-ratio:16/9!important");
    expect(retroCss).toContain("@media(max-width:1120px){.retro-market.section-wrap{grid-template-columns:1fr");
    expect(retroCss).toContain(".retro-media-rail{grid-template-columns:minmax(0,1.45fr) minmax(220px,.85fr)");
    expect(retroCss).toContain("@media(min-width:801px){.floating-player{position:fixed!important;right:26px!important;bottom:26px!important;z-index:80!important");
    expect(retroCss).toContain("@media(max-width:760px){.retro-market.section-wrap{display:flex;flex-direction:column;gap:30px;padding:32px 14px 38px");
  });
});
