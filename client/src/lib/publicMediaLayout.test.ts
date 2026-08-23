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

  it("keeps phone artwork touches in the normal page layout and reserves the closeable viewer for larger screens", () => {
    const detail = source("client/src/pages/ArtworkDetail.tsx");
    const viewer = source("client/src/components/FullscreenInspectionViewer.tsx");
    const mediaCss = source("client/src/components/inkprowlMedia.css");
    expect(detail).toContain("FullscreenInspectionViewer");
    expect(detail).toContain("Open full-screen artwork");
    expect(detail).toContain('if (event.pointerType === "touch" && window.matchMedia("(max-width: 760px)").matches) return;');
    expect(detail).toContain('window.matchMedia("(min-width: 761px)").matches');
    expect(detail).toContain("On larger screens, use pinch and drag to inspect the artwork in place.");
    expect(detail).toContain("artwork-fullscreen-framed-layout");
    expect(detail).not.toContain("artwork-zoom-toolbar");
    expect(detail).not.toContain("ZoomIn");
    expect(viewer).toContain("onPointerDown={handlePointerDown}");
    expect(viewer).toContain("onPointerMove={handlePointerMove}");
    expect(viewer).toContain("Pinch the complete framed layout");
    expect(mediaCss).toContain(".artwork-zoom-stage { touch-action: auto; cursor: default; }");
    expect(mediaCss).toContain(".artwork-zoom-note, .artwork-open-viewer { display: none; }");
    expect(mediaCss).toContain(".artwork-zoom-stage.is-zoomed");
    expect(mediaCss).toContain(".artwork-fullscreen-dialog");
    expect(mediaCss).toContain(".artwork-fullscreen-content .art-image");
    expect(mediaCss).toContain("object-fit: contain");
    expect(mediaCss).toContain(".artwork-fullscreen-dialog { padding-inline: 0 !important; }");
    expect(mediaCss).toContain(".artwork-fullscreen-framed-layout");
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

  it("places the video rail before trending discovery and provides practical floating soundtrack navigation", () => {
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
    expect(retroCss).toContain(".retro-video-module .cloudinary-video.retro-rail-video,.retro-video-module .cloudinary-video.retro-rail-video>.video-ratio-frame{aspect-ratio:1/1!important");
    expect(css).toContain(".player-transport");
    expect(css).toContain(".player-compact-transport");
    expect(css).toContain(".hero-art-wrap:before");
  });

  it("places a wide sponsor screening before Fresh Issues on desktop while preserving the full-width video-only mobile module and floating player", () => {
    const retroCss = source("client/src/retro-market.css");
    expect(retroCss).toContain("Desktop screening sits immediately below the visible ad area and before Fresh Issues");
    expect(retroCss).toContain(".retro-market.section-wrap{grid-template-columns:1fr;gap:28px}");
    expect(retroCss).toContain(".retro-media-rail{order:-1;display:block;width:min(100%,1040px)");
    expect(retroCss).toContain(".retro-video-module .cloudinary-video.retro-rail-video,.retro-video-module .cloudinary-video.retro-rail-video>.video-ratio-frame{aspect-ratio:16/9!important");
    expect(retroCss).toContain(".retro-video-module .cloudinary-video.retro-rail-video video{aspect-ratio:16/9!important;object-fit:cover!important");
    expect(retroCss).toContain(".retro-media-rail{display:block;width:100%}");
    expect(retroCss).toContain(".retro-tunes-module{display:none!important}");
    expect(retroCss).toContain("@media(max-width:1120px){.retro-market.section-wrap{grid-template-columns:1fr");
    expect(retroCss).toContain(".retro-media-rail{grid-template-columns:minmax(0,1.45fr) minmax(220px,.85fr)");
    expect(retroCss).toContain("@media(min-width:801px){.floating-player{position:fixed!important;right:26px!important;bottom:26px!important;z-index:80!important");
    expect(retroCss).toContain("@media(max-width:760px){.retro-market.section-wrap{display:flex;flex-direction:column;gap:30px;padding:32px 14px 38px");
  });

  it("restores the unobstructed green-framed square hero while retaining compact comic discovery", () => {
    const home = source("client/src/pages/Home.tsx");
    const retroCss = source("client/src/retro-market.css");
    expect(home).toContain('retro-comic-hero comic-banner-hero');
    expect(home).toContain("<span>INKPROWL</span> Animal comics");
    expect(retroCss).toContain("section.retro-comic-hero.comic-banner-hero{display:grid;grid-template-columns:1fr;place-items:center;min-height:0");
    expect(retroCss).toContain(".comic-banner-hero .hero-copy{display:none}");
    expect(retroCss).toContain(".comic-banner-hero .hero-art-wrap{position:relative;z-index:1;inset:auto;justify-self:center;width:min(100%,760px)");
    expect(retroCss).toContain(".comic-banner-hero .hero-art-stage{position:relative;inset:auto;aspect-ratio:1/1");
    expect(retroCss).toContain(".retro-category-tile{display:flex;min-height:58px;align-items:center");
    expect(retroCss).toContain(".site-shell .menu-button{display:inline-flex!important;align-items:center");
  });

  it("uses a larger teal, mustard, and rust comic masthead on desktop and a full green wordmark on phone", () => {
    const retroCss = source("client/src/retro-market.css");
    expect(retroCss).toContain("Desktop masthead: larger, inked display type");
    expect(retroCss).toContain(".site-shell .site-header{background:#f7e8c9;border-top:7px solid #2f5f5a");
    expect(retroCss).toContain(".site-shell .brand-seal{width:62px;height:62px");
    expect(retroCss).toContain(".site-shell .brand-word{display:inline;color:#2f5f5a");
    expect(retroCss).toContain(".site-shell .main-nav a{padding:12px 16px");
    expect(retroCss).toContain(".site-shell .main-nav a.active,.site-shell .main-nav a:hover{color:#fff4d7;background:#2f5f5a");
    expect(retroCss).toContain("@media(max-width:760px){.site-shell .header-inner{min-height:76px");
    expect(retroCss).toContain(".site-shell .brand-seal{flex:0 0 auto;width:54px;height:54px");
    expect(retroCss).toContain(".site-shell .brand-word{display:block!important;min-width:0;flex:1;color:#2f5f5a");
    expect(retroCss).toContain("font-size:clamp(25px,8.25vw,34px)");
  });

  it("keeps the hero in normal page flow without a touch-opened inspection window", () => {
    const home = source("client/src/pages/Home.tsx");
    expect(home).toContain('<div className="hero-art-wrap">');
    expect(home).not.toContain("hero-inspection-trigger");
    expect(home).not.toContain("openHeroViewerOnTouch");
    expect(home).not.toContain("heroViewerOpen");
    expect(home).not.toContain("FullscreenInspectionViewer");
  });
});
