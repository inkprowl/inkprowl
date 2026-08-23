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
});
