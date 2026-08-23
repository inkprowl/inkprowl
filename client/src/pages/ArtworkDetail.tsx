import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Link, useRoute } from "wouter";
import { ArrowLeft, Download, House, Share2, Tag } from "lucide-react";
import { ArtworkCard, ArtworkVisual, AdSlot } from "@/components/ArtworkCard";
import { CloudinaryVideoPlayer, PageFrame } from "@/components/InkprowlChrome";
import { FullscreenInspectionViewer } from "@/components/FullscreenInspectionViewer";
import { availableDownloadFormats, getArtwork, getArtworkShareUrl, getCloudinaryDownloadUrl, relatedArtworks, siteMedia, sponsoredCampaign } from "@/data/catalog";

type Point = { x: number; y: number };

export default function ArtworkDetail() {
  const [, params] = useRoute("/art/:slug");
  const artwork = getArtwork(params?.slug || "");
  const [shareStatus, setShareStatus] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const zoomRef = useRef(1);
  const panRef = useRef<Point>({ x: 0, y: 0 });
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);
  const dragStart = useRef<{ point: Point; pan: Point } | null>(null);

  const commitPan = (next: Point, atZoom = zoomRef.current) => {
    const stage = stageRef.current;
    const maxX = ((stage?.clientWidth ?? 0) * Math.max(0, atZoom - 1)) / 2;
    const maxY = ((stage?.clientHeight ?? 0) * Math.max(0, atZoom - 1)) / 2;
    const bounded = { x: Math.max(-maxX, Math.min(maxX, next.x)), y: Math.max(-maxY, Math.min(maxY, next.y)) };
    panRef.current = bounded;
    setPan(bounded);
  };
  const commitZoom = (next: number) => {
    const bounded = Math.max(1, Math.min(3.5, Number(next.toFixed(2))));
    zoomRef.current = bounded;
    setZoom(bounded);
    commitPan(bounded === 1 ? { x: 0, y: 0 } : panRef.current, bounded);
  };
  const pointerDistance = () => {
    const [first, second] = Array.from(pointers.current.values());
    return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0;
  };
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2) {
      pinchStart.current = { distance: pointerDistance(), zoom: zoomRef.current };
      dragStart.current = null;
    } else if (zoomRef.current > 1) {
      dragStart.current = { point: { x: event.clientX, y: event.clientY }, pan: panRef.current };
    }
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2 && pinchStart.current) {
      const distance = pointerDistance();
      if (distance > 0) commitZoom(pinchStart.current.zoom * (distance / pinchStart.current.distance));
      return;
    }
    if (pointers.current.size === 1 && dragStart.current && zoomRef.current > 1) {
      commitPan({ x: dragStart.current.pan.x + event.clientX - dragStart.current.point.x, y: dragStart.current.pan.y + event.clientY - dragStart.current.point.y });
    }
  };
  const finishPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (pointers.current.size === 1 && zoomRef.current > 1) {
      dragStart.current = { point: Array.from(pointers.current.values())[0], pan: panRef.current };
    } else if (pointers.current.size === 0) {
      pinchStart.current = null;
      dragStart.current = null;
    }
  };
  const handleZoomKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.preventDefault(); commitZoom(1); }
    if ((event.key === "Enter" || event.key === " ") && window.matchMedia("(min-width: 761px)").matches) { event.preventDefault(); setViewerOpen(true); }
  };

  if (!artwork) return <PageFrame><div className="not-found-copy"><h1>This edition has left the archive.</h1><div className="detail-page-nav"><Link href="/" className="button-outline"><House size={16} /> Home</Link><Link href="/gallery" className="button-dark">Return to gallery</Link></div></div></PageFrame>;

  const related = relatedArtworks(artwork);
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

  return <PageFrame artworkPageAds>
    <section className="detail-wrap">
      <nav className="detail-page-nav" aria-label="Artwork page navigation"><Link href="/" className="back-link"><House size={16} /> Home</Link><Link href="/gallery" className="back-link"><ArrowLeft size={16} /> Back to gallery</Link></nav>
      <div className="detail-grid">
        <div className="detail-art artwork-zoom-region"><div ref={stageRef} className={`artwork-zoom-stage${zoom > 1 ? " is-zoomed" : ""}`} tabIndex={0} role="region" aria-label="Artwork preview. On a phone, use the normal page gestures. On a desktop, press Enter to open it full-screen." onPointerDown={(event) => { if (event.pointerType === "touch" && window.matchMedia("(max-width: 760px)").matches) return; handlePointerDown(event); }} onPointerMove={handlePointerMove} onPointerUp={finishPointer} onPointerCancel={finishPointer} onDoubleClick={() => { if (window.matchMedia("(min-width: 761px)").matches) setViewerOpen(true); }} onKeyDown={handleZoomKey}><div className="artwork-zoom-content" style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}><ArtworkVisual artwork={artwork} large /></div></div><p className="artwork-zoom-note">On larger screens, use pinch and drag to inspect the artwork in place.</p><button type="button" className="artwork-open-viewer" onClick={() => setViewerOpen(true)} aria-haspopup="dialog">Open full-screen artwork</button><FullscreenInspectionViewer open={viewerOpen} onOpenChange={setViewerOpen} title={artwork.title} description="Full-screen framed edition inspection"><div className="artwork-fullscreen-framed-layout"><div className="artwork-fullscreen-frame-heading"><span>INKPROWL · ARCHIVE EDITION</span><span>4K / 600 DPI</span></div><div className="artwork-fullscreen-framed-stage"><ArtworkVisual artwork={artwork} large /></div></div></FullscreenInspectionViewer></div>
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
    <section className="detail-advertising" aria-label="Artwork page advertising"><AdSlot placement="native-banner" label="Artwork page native partner banner" /><AdSlot placement="leaderboard-728x90" label="Artwork page 728 × 90 partner banner" /><AdSlot placement="mobile-320x50" label="Artwork page 320 × 50 partner banner" /><AdSlot placement="social-bar" label="Artwork page social partner placement" /></section>
    {related.length > 0 && <section className="section-wrap related-section"><div className="section-heading"><div><span className="eyebrow">FROM THE SAME CASE</span><h2>Related artwork</h2></div></div><div className="related-grid">{related.map((item) => <ArtworkCard key={item.slug} artwork={item} />)}</div></section>}
  </PageFrame>;
}
