import { Link, useLocation } from "wouter";
import "./inkprowlMedia.css";
import "./subjectSafeVideo.css";
import { Download, Film, ListMusic, Menu, Minimize2, Music2, Pause, Play, Search, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { siteBranding, siteMedia } from "@/data/catalog";
import { AdSlot } from "@/components/ArtworkCard";
import { publicNavigationItems } from "@/lib/publicNavigation";

export function Mark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="INKPROWL home">
      <span className="brand-seal">{siteBranding.logoUrl ? <img className="brand-logo" src={siteBranding.logoUrl} alt="INKPROWL logo" /> : "IP"}</span>
      {!compact && <span className="brand-word">INKPROWL</span>}
    </Link>
  );
}

export function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  return (
    <><header className="site-header">
      <div className="header-inner">
        <Mark />
        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          {publicNavigationItems.map((item) => (
            <Link key={item.href} href={item.href} className={location === item.href ? "active" : ""} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search artwork"><Search size={20} strokeWidth={1.7} /></button>
          <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={23} strokeWidth={1.7} /> : <Menu size={25} strokeWidth={1.7} />}
          </button>
        </div>
      </div>
    </header><AdSlot placement="header" label="Header partner placement" /><AdSlot placement="leaderboard-728x90" label="728 × 90 partner banner" /></>
  );
}

export function Footer() {
  return (
    <><AdSlot placement="footer" label="Footer partner placement" /><AdSlot placement="mobile-320x50" label="320 × 50 partner banner" /><footer className="site-footer">
      <div className="footer-top">
        <div>
          <Mark />
          <p>Human-directed animal editions, made for generous walls and curious collections.</p>
        </div>
        <div className="footer-links">
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/terms">Terms & Conditions</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
      <div className="footer-bottom"><span>© 2026 INKPROWL</span><span>Free digital editions</span></div>
    </footer></>
  );
}

export function FloatingPlayer() {
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [volume, setVolume] = useState(0.8);
  const [minimized, setMinimized] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches);
  const [dismissed, setDismissed] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const soundtrackReady = Boolean(siteMedia.soundtrackUrl);
  const soundtrackDownloadUrl = siteMedia.soundtrackUrl?.replace("/video/upload/", "/video/upload/fl_attachment:inkprowl-soundtrack/");
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  const togglePlayback = async () => {
    if (!audioRef.current || !soundtrackReady) return;
    if (audioRef.current.paused) {
      await audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  };
  const beginDrag = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button,input,a")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, offsetX: position.x, offsetY: position.y };
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    setPosition({ x: dragStart.current.offsetX + event.clientX - dragStart.current.x, y: dragStart.current.offsetY + event.clientY - dragStart.current.y });
  };
  const endDrag = () => { dragStart.current = null; };
  if (dismissed) return <button type="button" className="player-reopen" onClick={() => setDismissed(false)} aria-label="Show music player"><Music2 size={17} /> Music</button>;
  return (
    <div className={`floating-player ${minimized ? "is-minimized" : ""}`} aria-label="INKPROWL music player" onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
      {siteMedia.soundtrackUrl && <audio ref={audioRef} src={siteMedia.soundtrackUrl} onEnded={() => setPlaying(false)} />}
      <button onClick={togglePlayback} disabled={!soundtrackReady} className="floating-play" aria-label={playing ? "Pause soundtrack" : soundtrackReady ? "Play soundtrack" : "Soundtrack is not configured"} title={soundtrackReady ? "Play soundtrack" : "Owner can add a Cloudinary audio URL in the catalog"}>
        {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
      </button>
      {!minimized && <><div className="player-copy"><span><Music2 size={12} /> AUDIO EDITION</span><strong>{playing ? siteMedia.soundtrackTitle : soundtrackReady ? siteMedia.soundtrackTitle : "Curated sound"}</strong><small>{siteMedia.soundtrackArtist || "INKPROWL"}</small></div><div className="player-volume"><Volume2 size={14} /><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Music volume" /></div><button type="button" className="player-utility" onClick={() => setPlaylistOpen((current) => !current)} aria-label={playlistOpen ? "Close playlist" : "Open playlist"} title="Playlist"><ListMusic size={14} /></button>{soundtrackDownloadUrl && <a className="player-download" href={soundtrackDownloadUrl} aria-label="Free soundtrack download" title="Free soundtrack download"><Download size={14} /></a>}</>}
      <button type="button" className="player-utility" onClick={() => setMinimized((current) => !current)} aria-label={minimized ? "Expand music player" : "Minimize music player"} title={minimized ? "Expand" : "Minimize"}>{minimized ? <Music2 size={14} /> : <Minimize2 size={14} />}</button>
      <button type="button" className="player-utility player-close" onClick={() => setDismissed(true)} aria-label="Close music player" title="Close"><X size={14} /></button>
      <span className="player-dot" aria-hidden="true" />
      {playlistOpen && !minimized && <div className="player-playlist" role="dialog" aria-label="Current playlist"><span>NOW PLAYING</span><strong>{siteMedia.soundtrackTitle || "Curated sound"}</strong><small>{soundtrackReady ? `${siteMedia.soundtrackArtist || "INKPROWL"} · audio edition` : "Awaiting an owner upload"}</small></div>}
    </div>
  );
}

export function CloudinaryVideoPlayer({ src, title, className = "", clientUrl, clientName }: { src?: string; title: string; className?: string; clientUrl?: string; clientName?: string }) {
  if (!src) {
    return <div className={`cloudinary-video empty-video ${className}`}><div className="video-ratio-frame"><div className="empty-video-copy"><Film size={25} /><strong>Film awaiting release</strong><span>{title} will play here once its owner adds a video.</span></div></div></div>;
  }
  return <div className={`cloudinary-video ${className}`}><div className="video-ratio-frame"><video controls preload="metadata" playsInline aria-label={title}><source src={src} />Your browser does not support HTML5 video.</video></div>{clientUrl && <div className="video-controls-bar"><a href={clientUrl} target="_blank" rel="noreferrer sponsored" className="sponsor-visit-link">Visit {clientName || "client site"}</a></div>}</div>;
}

export function PageFrame({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <div className={`site-shell ${dark ? "dark-surface" : ""}`}><Header /><main>{children}</main><Footer /></div>;
}
