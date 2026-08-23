import { useState } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Download, House, Share2, Tag } from "lucide-react";
import { AdSlot, ArtworkCard, GifCard } from "@/components/ArtworkCard";
import { CloudinaryVideoPlayer, PageFrame } from "@/components/InkprowlChrome";
import { getCloudinaryGifDownloadUrl, getGif, getGifShareUrl, publishedArtworks, relatedGifs, siteMedia, sponsoredCampaign } from "@/data/catalog";

export default function GifDetail() {
  const [, params] = useRoute("/gif/:slug");
  const gif = getGif(params?.slug || "");
  const [shareStatus, setShareStatus] = useState("");
  if (!gif) return <PageFrame><div className="not-found-copy"><h1>This GIF edition has left the motion archive.</h1><div className="detail-page-nav"><Link href="/" className="button-outline"><House size={16} /> Home</Link><Link href="/gifs" className="button-dark">Return to GIFs</Link></div></div></PageFrame>;

  const related = relatedGifs(gif);
  const relatedArtwork = publishedArtworks.filter((artwork) => gif.tags.some((tag) => artwork.tags.includes(tag))).slice(0, 3);
  const downloadUrl = getCloudinaryGifDownloadUrl(gif.imageUrl, gif.slug);
  const shareUrl = getGifShareUrl(gif.slug);
  const shareText = `${gif.title} — INKPROWL animated GIF`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);
  const copyShareUrl = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setShareStatus("Share link copied"); window.setTimeout(() => setShareStatus(""), 1800); }
    catch { setShareStatus("Copy this link from the address bar"); }
  };
  const nativeShare = async () => {
    try { if (navigator.share) await navigator.share({ title: shareText, text: gif.description, url: shareUrl }); else await copyShareUrl(); }
    catch { setShareStatus(""); }
  };

  return <PageFrame artworkPageAds><section className="detail-wrap"><nav className="detail-page-nav" aria-label="GIF page navigation"><Link href="/" className="back-link"><House size={16} /> Home</Link><Link href="/gifs" className="back-link"><ArrowLeft size={16} /> Back to GIFs</Link></nav><div className="detail-grid"><div className="detail-art"><div className="artwork-zoom-stage gif-detail-stage"><img src={gif.imageUrl} alt={gif.title} className="art-image" /></div><p className="artwork-zoom-note">This original INKPROWL GIF plays in the page and downloads in its animated GIF format.</p></div><div className="detail-copy"><div className="eyebrow"><Tag size={14} /> GIFs</div><h1>{gif.title}</h1><p>{gif.description}</p><div className="detail-divider" /><dl><div><dt>FORMAT</dt><dd>Original animated GIF edition</dd></div><div><dt>STYLE</dt><dd>Looped INKPROWL motion artwork</dd></div><div><dt>DELIVERY</dt><dd>Free original GIF download</dd></div></dl>{downloadUrl ? <div className="download-panel"><span className="eyebrow">FREE ORIGINAL GIF DOWNLOAD</span><p className="download-panel-copy">Download the original animated GIF without converting it to a static image format.</p><div className="download-actions"><a className="button-outline" href={downloadUrl} download={`inkprowl-${gif.slug}.gif`} aria-label={`Download ${gif.title} as GIF`}><Download size={17} /> Download GIF</a></div></div> : <button className="button-outline wide" onClick={() => setShareStatus("This GIF is being prepared.")}><Download size={17} /> Download preparing</button>}<div className="share-cluster"><button type="button" className="share-button" onClick={nativeShare}><Share2 size={15} /> Share this GIF</button><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">Facebook</a><a href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noreferrer">WhatsApp</a><button type="button" onClick={copyShareUrl}>Copy link</button></div>{shareStatus && <span className="detail-action-status" role="status">{shareStatus}</span>}<small className="detail-note">Shared GIF links open a dedicated preview page with the animated edition, title, and description before landing in the INKPROWL motion archive.</small></div><section className="detail-video"><div className="sponsor-heading"><span className="eyebrow">IN MOTION</span><h2>Edition film.</h2><p>A full-frame film selected for this GIF edition.</p></div><CloudinaryVideoPlayer className="detail-video-frame full-video-fit landscape-video-frame" src={siteMedia.defaultArtworkFilmUrl ?? sponsoredCampaign.videoUrl} title={`${gif.title} film`} clientUrl={sponsoredCampaign.clientUrl} clientName="sponsor site" /></section></div></section><section className="detail-advertising" aria-label="GIF page advertising"><AdSlot placement="native-banner" label="GIF page native partner banner" /><AdSlot placement="leaderboard-728x90" label="GIF page 728 × 90 partner banner" /><AdSlot placement="mobile-320x50" label="GIF page 320 × 50 partner banner" /><AdSlot placement="social-bar" label="GIF page social partner placement" /></section>{related.length > 0 && <section className="section-wrap related-section"><div className="section-heading"><div><span className="eyebrow">MORE MOTION</span><h2>Related GIFs</h2></div></div><div className="related-grid">{related.map((item) => <GifCard key={item.slug} gif={item} />)}</div></section>}{relatedArtwork.length > 0 && <section className="section-wrap related-section"><div className="section-heading"><div><span className="eyebrow">FROM THE ART ARCHIVE</span><h2>Related artwork</h2></div></div><div className="related-grid">{relatedArtwork.map((item) => <ArtworkCard key={item.slug} artwork={item} />)}</div></section>}</PageFrame>;
}
