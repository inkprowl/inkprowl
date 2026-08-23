import { ArrowDownRight, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { ArtworkCard, ArtworkVisual, AdSlot } from "@/components/ArtworkCard";
import { CloudinaryVideoPlayer, PageFrame } from "@/components/InkprowlChrome";
import { categories, publishedArtworks, siteBranding, siteMedia, sponsoredCampaign } from "@/data/catalog";
import { sponsorDisplayName } from "@/lib/sponsorPresentation";

function HeroBanner({ src, fallback }: { src: string; fallback: React.ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return <img className="hero-banner" src={src} alt="INKPROWL hero banner" loading="eager" decoding="sync" fetchPriority="high" onError={() => setFailed(true)} />;
}

export default function Home() {
  const lead = publishedArtworks[0];
  const latestArtworks = [...publishedArtworks].sort((left, right) => Date.parse(right.publishedAt ?? "") - Date.parse(left.publishedAt ?? "")).slice(0, 5);
  const trendingArtworks = publishedArtworks.filter((artwork) => !latestArtworks.some((latest) => latest.slug === artwork.slug)).slice(0, 4);
  const discoveryArtworks = latestArtworks.length ? latestArtworks : publishedArtworks.slice(0, 5);
  const collectorPicks = trendingArtworks.length ? trendingArtworks : discoveryArtworks.slice(0, 4);
  const sponsorFilmIsHeroFallback = !siteMedia.heroFilmUrl && sponsoredCampaign.enabled && Boolean(sponsoredCampaign.videoUrl);
  const stageVideoUrl = siteMedia.heroFilmUrl ?? (sponsorFilmIsHeroFallback ? sponsoredCampaign.videoUrl : undefined);
  const stageVideoTitle = sponsorFilmIsHeroFallback ? `${sponsoredCampaign.clientName} sponsored film` : "INKPROWL studio reel";
  const sponsorName = sponsorDisplayName(sponsoredCampaign.clientName);
  return (
    <PageFrame dark>
      <section className="hero-panel">
        <div className="hero-copy">
          <div className="eyebrow light"><Sparkles size={14} /> {siteBranding.heroKicker}</div>
          <h1>{siteBranding.heroTitle}</h1>
          <p className="hero-deck">A collector’s archive of animal characters, printed in line, shadow, and 1960s comic drama.</p>
          <div className="hero-cta-row"><Link href="/gallery" className="button-light">Enter the archive <ArrowRight size={16} /></Link><Link href="/categories" className="text-link-light">Browse departments <ArrowDownRight size={17} /></Link></div>
        </div>
        <div className="hero-art-wrap"><div className="hero-stats"><span><ShieldCheck size={16} /> COLLECTIBLE EDITIONS</span><span>4K / 600 DPI</span></div><div className="hero-art-stage">{siteBranding.heroBannerUrl ? <HeroBanner src={siteBranding.heroBannerUrl} fallback={lead ? <ArtworkVisual artwork={lead} large /> : <div className="hero-empty-stage">New owner uploads will appear here.</div>} /> : lead ? <ArtworkVisual artwork={lead} large /> : <div className="hero-empty-stage">New owner uploads will appear here.</div>}</div><div className="hero-art-caption"><span>{siteBranding.heroFeaturedLabel || "01 — FEATURED EDITION"}</span><strong>{siteBranding.heroFeaturedTitle || lead?.title || "Fresh owner editions"}</strong></div></div>
      </section>
      <AdSlot placement="native-banner" label="Native partner banner" />
      <section className="section-wrap home-discovery latest-discovery"><div className="section-heading archive-section-heading"><div><span className="eyebrow">LATEST INTO THE ARCHIVE</span><h2>Fresh <em>off the press.</em></h2></div><Link href="/gallery" className="text-link">View all editions <ArrowRight size={16} /></Link></div><div className="latest-grid">{discoveryArtworks.map((artwork, index) => <ArtworkCard key={artwork.slug} artwork={artwork} feature={index === 0} />)}</div></section>
      <section className="section-wrap trending-section"><div className="section-heading archive-section-heading inverse"><div><span className="eyebrow light">TRENDING NOW</span><h2>Characters on the <em>move.</em></h2></div><span className="archive-section-note">A rotating collector’s selection from the archive.</span></div><div className="trending-grid">{collectorPicks.map((artwork) => <ArtworkCard key={artwork.slug} artwork={artwork} />)}</div></section>
      {stageVideoUrl && <section className="archive-screening section-wrap"><div className="archive-screening-head"><span className="eyebrow light">{sponsorFilmIsHeroFallback ? sponsoredCampaign.label : "ARCHIVE SCREENING"}</span><strong>{sponsorFilmIsHeroFallback ? sponsorName : "INKPROWL in motion"}</strong></div><CloudinaryVideoPlayer className="hero-video full-video-fit" src={stageVideoUrl} title={stageVideoTitle} clientUrl={sponsorFilmIsHeroFallback ? sponsoredCampaign.clientUrl : undefined} clientName={sponsorFilmIsHeroFallback ? sponsorName : undefined} /></section>}
      {sponsoredCampaign.enabled && sponsoredCampaign.videoUrl && siteMedia.heroFilmUrl && <section className="archive-screening archive-screening-paper section-wrap"><div className="archive-screening-head"><span className="eyebrow">{sponsoredCampaign.label}</span><strong>{sponsorName}</strong></div><CloudinaryVideoPlayer className="sponsor-video full-video-fit" src={sponsoredCampaign.videoUrl} title={`${sponsorName} sponsored film`} clientUrl={sponsoredCampaign.clientUrl} clientName={sponsorName} /></section>}
      <section className="section-wrap categories-preview archive-categories"><div className="section-heading archive-section-heading"><div><span className="eyebrow">SHOP THE DEPARTMENTS</span><h2>Pick your <em>case file.</em></h2></div><Link href="/categories" className="text-link">All departments <ArrowRight size={16} /></Link></div><div className="category-strip">{categories.slice(0, 6).map((category, index) => <Link href={`/gallery?category=${encodeURIComponent(category.name)}`} key={category.name} className="category-poster"><span className="category-number">0{index + 1}</span><span className="category-icon">{category.icon}</span><strong>{category.name}</strong><small>{category.count} WORKS</small></Link>)}</div></section>
      <section className="manifesto archive-manifesto"><span className="eyebrow light">THE INKPROWL PRINT HOUSE</span><h2>Line. Character. <em>Collectible mischief.</em></h2><Link href="/about" className="text-link-light">Read the house notes <ArrowRight size={16} /></Link></section>
      <AdSlot placement="social-bar" label="Social partner placement" />
    </PageFrame>
  );
}
