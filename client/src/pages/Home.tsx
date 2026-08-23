import { ArrowDownRight, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "wouter";
import { ArtworkVisual, AdSlot } from "@/components/ArtworkCard";
import { FullscreenInspectionViewer } from "@/components/FullscreenInspectionViewer";
import { CloudinaryVideoPlayer, PageFrame } from "@/components/InkprowlChrome";
import { categories, publishedArtworks, siteBranding, siteMedia, sponsoredCampaign } from "@/data/catalog";
import { sponsorDisplayName } from "@/lib/sponsorPresentation";

function HeroBanner({ src, fallback }: { src: string; fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <img className="hero-banner" src={src} alt="INKPROWL hero banner" loading="eager" decoding="sync" fetchPriority="high" onError={() => setFailed(true)} />;
}

function HeroArtwork({ lead }: { lead: (typeof publishedArtworks)[number] | undefined }) {
  return siteBranding.heroBannerUrl ? <HeroBanner src={siteBranding.heroBannerUrl} fallback={lead ? <ArtworkVisual artwork={lead} large /> : <div className="hero-empty-stage">New owner uploads will appear here.</div>} /> : lead ? <ArtworkVisual artwork={lead} large /> : <div className="hero-empty-stage">New owner uploads will appear here.</div>;
}

export default function Home() {
  const lead = publishedArtworks[0];
  const [heroViewerOpen, setHeroViewerOpen] = useState(false);
  const latestArtworks = [...publishedArtworks].sort((left, right) => Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "")).slice(0, 5);
  const trendingArtworks = publishedArtworks.filter((artwork) => !latestArtworks.some((latest) => latest.slug === artwork.slug)).slice(0, 4);
  const discoveryArtworks = latestArtworks.length ? latestArtworks : publishedArtworks.slice(0, 5);
  const collectorPicks = trendingArtworks.length ? trendingArtworks : discoveryArtworks.slice(0, 4);
  const sponsorFilmIsHeroFallback = !siteMedia.heroFilmUrl && sponsoredCampaign.enabled && Boolean(sponsoredCampaign.videoUrl);
  const stageVideoUrl = siteMedia.heroFilmUrl ?? (sponsorFilmIsHeroFallback ? sponsoredCampaign.videoUrl : undefined);
  const stageVideoTitle = sponsorFilmIsHeroFallback ? `${sponsoredCampaign.clientName} sponsored film` : "INKPROWL studio reel";
  const sponsorName = sponsorDisplayName(sponsoredCampaign.clientName);
  const railVideoUrl = sponsoredCampaign.enabled && sponsoredCampaign.videoUrl ? sponsoredCampaign.videoUrl : stageVideoUrl;
  const railVideoTitle = sponsoredCampaign.enabled && sponsoredCampaign.videoUrl ? `${sponsorName} sponsored film` : stageVideoTitle;
  const openHeroViewerOnTouch = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || !window.matchMedia("(max-width: 760px)").matches) return;
    event.preventDefault();
    setHeroViewerOpen(true);
  };
  return (
    <PageFrame dark>
      <section className="hero-panel retro-comic-hero comic-banner-hero">
        <div className="hero-copy">
          <div className="eyebrow light"><Sparkles size={14} /> {siteBranding.heroKicker || "INKPROWL ARCHIVES"}</div>
          <h1><span>INKPROWL</span> Animal comics</h1>
          <p className="hero-title-strip">{siteBranding.heroTitle}</p>
          <p className="hero-deck">Vintage animal editions, case files, and curious characters for the INKPROWL archive.</p>
          <div className="hero-cta-row"><Link href="/gallery" className="button-dark">Start reading <ArrowRight size={16} /></Link><Link href="/categories" className="text-link">Browse cases <ArrowDownRight size={17} /></Link></div>
        </div>
        <div className="hero-art-wrap hero-inspection-trigger" tabIndex={0} role="button" aria-label="Open the complete framed hero layout for full-screen inspection" onPointerDown={openHeroViewerOnTouch} onDoubleClick={() => setHeroViewerOpen(true)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setHeroViewerOpen(true); } }}><div className="hero-stats"><span><ShieldCheck size={16} /> COLLECTIBLE EDITIONS</span><span>4K / 600 DPI</span></div><div className="hero-art-stage"><HeroArtwork lead={lead} /></div><div className="hero-art-caption"><span>{siteBranding.heroFeaturedLabel || "01 — FEATURED EDITION"}</span><strong>{siteBranding.heroFeaturedTitle || lead?.title || "Fresh owner editions"}</strong></div></div>
      </section>
      <FullscreenInspectionViewer open={heroViewerOpen} onOpenChange={setHeroViewerOpen} title={siteBranding.heroFeaturedTitle || lead?.title || "INKPROWL featured edition"} description="Full-screen framed hero inspection"><div className="artwork-fullscreen-framed-layout hero-fullscreen-framed-layout"><div className="artwork-fullscreen-frame-heading"><span>INKPROWL · FEATURED EDITION</span><span>4K / 600 DPI</span></div><div className="artwork-fullscreen-framed-stage"><HeroArtwork lead={lead} /></div></div></FullscreenInspectionViewer>
      <AdSlot placement="native-banner" label="Native partner banner" />
      <section className="retro-market section-wrap">
        <div className="retro-catalogue">
          <section className="retro-latest-module"><div className="retro-module-head"><div><span className="eyebrow">LATEST UPLOADS</span><h2>Fresh issues</h2></div><Link href="/gallery" className="retro-arrow-link">All editions <ArrowRight size={16} /></Link></div><div className="retro-latest-strip">{discoveryArtworks.map((artwork, index) => <Link key={artwork.slug} href={`/art/${artwork.slug}`} className="retro-cover"><span className="retro-cover-number">#{String(index + 1).padStart(2, "0")}</span><ArtworkVisual artwork={artwork} /><strong>{artwork.title}</strong></Link>)}</div></section>
          <section className="retro-categories-module"><div className="retro-module-head"><div><span className="eyebrow">CATEGORIES</span><h2>Choose a case</h2></div><Link href="/categories" className="retro-arrow-link">View all <ArrowRight size={16} /></Link></div><div className="retro-category-tiles">{categories.slice(0, 6).map((category) => <Link href={`/gallery?category=${encodeURIComponent(category.name)}`} key={category.name} className="retro-category-tile"><span>{category.icon}</span><strong>{category.name}</strong></Link>)}</div></section>
        </div>
        <aside className="retro-media-rail">
          <section className="retro-rail-module retro-video-module"><div className="retro-rail-label"><span>FEATURED VIDEO</span><i>REEL 01</i></div>{railVideoUrl ? <CloudinaryVideoPlayer className="retro-rail-video" src={railVideoUrl} title={railVideoTitle} clientUrl={sponsoredCampaign.enabled && sponsoredCampaign.videoUrl ? sponsoredCampaign.clientUrl : undefined} clientName={sponsoredCampaign.enabled && sponsoredCampaign.videoUrl ? sponsorName : undefined} /> : <div className="retro-video-placeholder"><span>▶</span><strong>Screening soon</strong></div>}</section>
          <section className="retro-tunes-module"><div className="retro-rail-label"><span>COMIC TUNES</span><i>ON AIR</i></div><div className="retro-radio-face"><span className="retro-speaker" /><div><strong>{siteMedia.soundtrackTitle || "INKPROWL Radio"}</strong><small>{siteMedia.soundtrackArtist || "Use the floating player to listen"}</small></div><span className="retro-speaker" /></div><p>The draggable player stays with you while you browse.</p></section>
        </aside>
      </section>
      <section className="retro-trending section-wrap"><div className="retro-module-head"><div><span className="eyebrow">TRENDING FILES</span><h2>Characters in demand</h2></div><Link href="/gallery" className="retro-arrow-link">Browse archive <ArrowRight size={16} /></Link></div><div className="retro-trending-strip">{collectorPicks.map((artwork) => <Link key={artwork.slug} href={`/art/${artwork.slug}`} className="retro-trending-card"><ArtworkVisual artwork={artwork} /><span>{artwork.category}</span><strong>{artwork.title}</strong></Link>)}</div></section>
      <section className="manifesto archive-manifesto retro-manifesto"><span className="eyebrow light">THE INKPROWL PRINT HOUSE</span><h2>New stories. <em>Old ink.</em></h2><Link href="/about" className="text-link-light">Read the house notes <ArrowRight size={16} /></Link></section>
      <AdSlot placement="social-bar" label="Social partner placement" />
    </PageFrame>
  );
}
