import { ArrowLeft, Download, House, RotateCcw, Share2, Tag, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArtworkCard, ArtworkVisual, AdSlot } from "@/components/ArtworkCard";
import { CloudinaryVideoPlayer, PageFrame } from "@/components/InkprowlChrome";
import { availableDownloadFormats, getArtwork, getArtworkShareUrl, getCloudinaryDownloadUrl, relatedArtworks, siteMedia, sponsoredCampaign } from "@/data/catalog";

export default function ArtworkDetail() {
  const [, params] = useRoute("/art/:slug");
  const artwork = getArtwork(params?.slug || "");
  const [shareStatus, setShareStatus] = useState("");
  const [zoom, setZoom] = useState(1);

  if (!artwork) return <PageFrame><div className="not-found-copy"><h1>This edition has left the archive.</h1><div className="detail-page-nav"><Link href="/" className="button-outline"><House size={16} /> Home</Link><Link href="/gallery" className="button-dark">Return to gallery</Link></div></div></PageFrame>;

  const related = relatedArtworks(artwork);
  const formats = availableDownloadFormats(artwork);
  const downloadLinks = availableDownloadFormats(artwork).map((format) => ({ format, url: getCloudinaryDownloadUrl(artwork.imageUrl, artwork.slug, format) })).filter((item): item is { format: "jpg" | "png" | "webp"; url: string } => Boolean(item.url));
  const shareUrl = getArtworkShareUrl(artwork.slug);
  const shareText = `${artwork.title} — INKPROWL`;
  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus("Share link copied");
      window.setTimeout(() => setShareStatus(""), 1800);
    } catch { setShareStatus("Copy this link from the address bar"); }
  };
  const nativeShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: shareText, text: artwork.description, url: shareUrl });
      else await copyShareUrl();
    } catch { setShareStatus(""); }
  };
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  return <PageFrame>
    <section className="detail-wrap">
      <nav className="detail-page-nav" aria-label="Artwork page navigation"><Link href="/" className="back-link"><House size={16} /> Home</Link><Link href="/gallery" className="back-link"><ArrowLeft size={16} /> Back to gallery</Link></nav>
      <div className="detail-grid">
        <div className="detail-art artwork-zoom-region"><div className="artwork-zoom-toolbar" role="group" aria-label="Artwork zoom controls"><button type="button" onClick={() => setZoom((current) => Math.max(1, Number((current - 0.2).toFixed(1))))} disabled={zoom <= 1} aria-label="Zoom out"><ZoomOut size={16} /></button><span aria-live="polite">{Math.round(zoom * 100)}%</span><button type="button" onClick={() => setZoom((current) => Math.min(2.4, Number((current + 0.2).toFixed(1))))} disabled={zoom >= 2.4} aria-label="Zoom in"><ZoomIn size={16} /></button>{zoom > 1 && <button type="button" onClick={() => setZoom(1)} aria-label="Reset artwork zoom"><RotateCcw size={15} /></button>}</div><div className="artwork-zoom-stage"><div className="artwork-zoom-content" style={{ transform: `scale(${zoom})` }}><ArtworkVisual artwork={artwork} large /></div></div><p className="artwork-zoom-note">Use zoom controls to inspect the edition detail. Download files remain unchanged.</p></div>
        <div className="detail-copy">
          <div className="eyebrow"><Tag size={14} /> {artwork.category}</div>
          <h1>{artwork.title}</h1><p>{artwork.description}</p><div className="detail-divider" />
          <dl><div><dt>FORMAT</dt><dd>High-resolution digital edition</dd></div><div><dt>STYLE</dt><dd>Vintage line art / cross-hatching</dd></div><div><dt>DELIVERY</dt><dd>Free digital download</dd></div></dl>
          {downloadLinks.length ? <div className="download-panel"><span className="eyebrow">FREE HIGH-RESOLUTION DOWNLOADS</span><p className="download-panel-copy">Choose the file format you need and download the edition in the quality that suits your project.</p><div className="download-actions" aria-label="Artwork download formats">{downloadLinks.map(({ format, url }) => <a className="button-outline" key={format} href={url} download={`inkprowl-${artwork.slug}.${format}`} aria-label={`Download ${artwork.title} as ${format.toUpperCase()}`}><Download size={17} /> Download {format === "jpg" ? "JPEG" : format.toUpperCase()}</a>)}</div></div> : <button className="button-outline wide" onClick={() => setShareStatus("This edition is being prepared.")}><Download size={17} /> Download preparing</button>}
          <div className="share-cluster"><button type="button" className="share-button" onClick={nativeShare}><Share2 size={15} /> Share this edition</button><a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noreferrer">WhatsApp</a><a href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noreferrer">X</a><button type="button" onClick={copyShareUrl}>Copy link</button></div>
          {shareStatus && <span className="detail-action-status" role="status">{shareStatus}</span>}
          <small className="detail-note">Shared edition links open a dedicated preview page with the artwork image, title, and description before landing in the INKPROWL archive.</small>
        </div>
        <section className="detail-video"><div className="sponsor-heading"><span className="eyebrow">IN MOTION</span><h2>Edition film.</h2><p>A full-frame film selected for this edition.</p></div><CloudinaryVideoPlayer className="detail-video-frame full-video-fit landscape-video-frame" src={artwork.videoUrl ?? siteMedia.defaultArtworkFilmUrl ?? sponsoredCampaign.videoUrl} title={`${artwork.title} film`} clientUrl={sponsoredCampaign.clientUrl} clientName="sponsor site" /></section>
      </div>
    </section>
    <AdSlot placement="social-native" label="A refined placement beside a collectible edition" />
    {related.length > 0 && <section className="section-wrap related-section"><div className="section-heading"><div><span className="eyebrow">FROM THE SAME CASE</span><h2>Related artwork</h2></div></div><div className="related-grid">{related.map((item) => <ArtworkCard key={item.slug} artwork={item} />)}</div></section>}
  </PageFrame>;
}
