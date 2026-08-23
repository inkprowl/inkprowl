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
          <p>INKPROWL makes collectible animal characters in the language of old engravings, sharp tailoring, and editorial wit.</p>
          <div className="hero-cta-row"><Link href="/gallery" className="button-light">Explore the gallery <ArrowRight size={16} /></Link><Link href="/categories" className="text-link-light">Browse categories <ArrowDownRight size={17} /></Link></div>
        </div>
        <div className="hero-art-wrap"><div className="hero-stats"><span><ShieldCheck size={16} /> COLLECTIBLE EDITIONS</span><span>4K / 600 DPI</span></div><div className="hero-art-stage">{siteBranding.heroBannerUrl ? <HeroBanner src={siteBranding.heroBannerUrl} fallback={lead ? <ArtworkVisual artwork={lead} large /> : <div className="hero-empty-stage">New owner uploads will appear here.</div>} /> : lead ? <ArtworkVisual artwork={lead} large /> : <div className="hero-empty-stage">New owner uploads will appear here.</div>}</div><div className="hero-art-caption"><span>{siteBranding.heroFeaturedLabel || "01 — FEATURED EDITION"}</span><strong>{siteBranding.heroFeaturedTitle || lead?.title || "Fresh owner editions"}</strong></div></div>
      </section>
      {stageVideoUrl && <section className="media-section section-wrap"><div className="section-heading inverse sponsor-heading"><div><span className="eyebrow light">{sponsorFilmIsHeroFallback ? sponsoredCampaign.label : "IN MOTION"}</span><h2>{sponsorFilmIsHeroFallback ? sponsorName : "In motion."}</h2></div><p>{sponsorFilmIsHeroFallback ? (sponsoredCampaign.clientUrl ? "Sponsored film. Use Visit to open the approved partner site." : "Sponsored film preview. Add a partner destination in the owner admin to enable Visit.") : "A Cloudinary-hosted studio film."}</p></div><div className="video-stage"><CloudinaryVideoPlayer className="hero-video full-video-fit" src={stageVideoUrl} title={stageVideoTitle} clientUrl={sponsorFilmIsHeroFallback ? sponsoredCampaign.clientUrl : undefined} clientName={sponsorFilmIsHeroFallback ? sponsorName : undefined} /></div></section>}
      {sponsoredCampaign.enabled && sponsoredCampaign.videoUrl && siteMedia.heroFilmUrl && <section className="sponsor-film-section section-wrap"><div className="section-heading sponsor-heading"><div><span className="eyebrow">{sponsoredCampaign.label}</span><h2>{sponsorName}</h2></div><p>{sponsoredCampaign.clientUrl ? "Sponsored film. Use Visit to open the approved partner site." : "Sponsored film preview. Add a partner destination in the owner admin to enable Visit."}</p></div><CloudinaryVideoPlayer className="sponsor-video full-video-fit" src={sponsoredCampaign.videoUrl} title={`${sponsorName} sponsored film`} clientUrl={sponsoredCampaign.clientUrl} clientName={sponsorName} /></section>}
      <section className="section-wrap light-section featured-section"><div className="section-heading compact-section-heading"><div><span className="eyebrow">FEATURED EDITIONS</span><h2>Featured works</h2></div><Link href="/gallery" className="text-link">View all works <ArrowRight size={16} /></Link></div><div className="feature-grid">{publishedArtworks.slice(0, 3).map((artwork, index) => <ArtworkCard key={artwork.slug} artwork={artwork} feature={index === 0} />)}</div></section>
      <AdSlot placement="native-banner" label="Native partner banner" />
      <AdSlot placement="social-native" label="Social and native partner placement" />
      <AdSlot placement="social-bar" label="Social Bar partner placement" />
      <section className="section-wrap categories-preview"><div className="section-heading"><div><span className="eyebrow">FIND YOUR PROWL</span><h2>Categories with<br /><em>character.</em></h2></div><Link href="/categories" className="text-link">All categories <ArrowRight size={16} /></Link></div><div className="category-strip">{categories.slice(0, 6).map((category, index) => <Link href={`/gallery?category=${encodeURIComponent(category.name)}`} key={category.name} className="category-poster"><span className="category-number">0{index + 1}</span><span className="category-icon">{category.icon}</span><strong>{category.name}</strong><small>{category.count} WORKS</small></Link>)}</div></section>
      <section className="manifesto"><div className="manifesto-rule" /><span className="eyebrow light">THE INKPROWL STANDARD</span><h2>Made to be <em>looked at slowly.</em></h2><p>Each piece is composed by a human eye, then crafted with generative tools and refined for collection. No noise. No generic stock imagery. Just character, line, and intent.</p></section>
    </PageFrame>
  );
}
