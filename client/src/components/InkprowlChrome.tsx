import { Link, useLocation } from "wouter";
import "./inkprowlMedia.css";
import "./subjectSafeVideo.css";
import { Download, FastForward, Film, GripVertical, ListMusic, Menu, Minimize2, Music2, Pause, Play, Rewind, Search, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { advertisingSettings, getAdvertisementProviderCodes, publishedArtworks, siteBranding, siteMedia } from "@/data/catalog";
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

export function Header({ showBannerAds = true }: { showBannerAds?: boolean }) {
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
    </header>{showBannerAds && <DismissibleHeaderAd />}</>
  );
}

function DismissibleHeaderAd() {
  const [headerAdDismissed, setHeaderAdDismissed] = useState(false);
  const [hasVisibleProviderContent, setHasVisibleProviderContent] = useState(false);
  const hostRef = useRef<HTMLElement>(null);
  const hasConfiguredHeaderAd = (["header", "leaderboard-728x90", "mobile-320x50"] as const).some((placement) => getAdvertisementProviderCodes(placement, advertisingSettings).length > 0);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !hasConfiguredHeaderAd || headerAdDismissed) return;
    const updateVisibility = () => setHasVisibleProviderContent(Boolean(host.querySelector("iframe, ins.adsbygoogle, [data-google-query-id], a[href]")));
    updateVisibility();
    const observer = new MutationObserver(updateVisibility);
    observer.observe(host, { childList: true, subtree: true });
    const delayedCheck = window.setTimeout(updateVisibility, 1800);
    return () => {
      observer.disconnect();
      window.clearTimeout(delayedCheck);
    };
  }, [hasConfiguredHeaderAd, headerAdDismissed]);

  if (!hasConfiguredHeaderAd || headerAdDismissed) return null;
  return <section ref={hostRef} className={`dismissible-header-ad ${hasVisibleProviderContent ? "is-ready" : "is-waiting"}`} aria-label="Dismissible partner advertising"><div className="header-ad-toolbar"><span>PARTNER CONTENT</span><button type="button" onClick={() => setHeaderAdDismissed(true)} aria-label="Hide header advertisement">Hide <X size={13} /></button></div><div className="header-ad-units"><AdSlot placement="header" label="Header partner placement" /><AdSlot placement="leaderboard-728x90" label="728 × 90 partner banner" /><AdSlot placement="mobile-320x50" label="320 × 50 partner banner" /></div></section>;
}

export function Footer({ showBannerAds = true }: { showBannerAds?: boolean }) {
  return (
    <><AdSlot placement="footer" label="Footer partner placement" /><footer className="site-footer">
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
  const [trackIndex, setTrackIndex] = useState(0);
  const [minimized, setMinimized] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches);
  const [dismissed, setDismissed] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playlist = useMemo(() => {
    const primary = siteMedia.soundtrackUrl ? [{ url: siteMedia.soundtrackUrl, title: siteMedia.soundtrackTitle || "Curated sound", artist: siteMedia.soundtrackArtist || "INKPROWL" }] : [];
    const artworkTracks = publishedArtworks.filter((artwork) => Boolean(artwork.audioUrl)).map((artwork) => ({ url: artwork.audioUrl!, title: artwork.title, artist: "INKPROWL archive" }));
    return [...primary, ...artworkTracks.filter((track) => !primary.some((first) => first.url === track.url))];
  }, []);
  const activeTrack = playlist[trackIndex] ?? playlist[0];
  const soundtrackReady = Boolean(activeTrack?.url);
  const soundtrackDownloadUrl = activeTrack?.url?.replace("/video/upload/", "/video/upload/fl_attachment:inkprowl-soundtrack/");
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume; }, [volume]);
  useEffect(() => {
    if (!playing || !audioRef.current) return;
    audioRef.current.play().catch(() => setPlaying(false));
  }, [trackIndex, playing]);
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
  const moveTrack = (direction: -1 | 1) => {
    if (!playlist.length) return;
    setTrackIndex((current) => (current + direction + playlist.length) % playlist.length);
    setPlaying(true);
  };
  const restartOrPrevious = () => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3 || playlist.length < 2) { audioRef.current.currentTime = 0; return; }
    moveTrack(-1);
  };
  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.duration || Number.POSITIVE_INFINITY, audioRef.current.currentTime + seconds));
  };
  const beginDrag = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
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
    <div className={`floating-player ${minimized ? "is-minimized" : ""}`} aria-label="INKPROWL music player" onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} style={{ transform: `translate(${position.x}px, ${position.y}px)` }}>
      {activeTrack?.url && <audio key={activeTrack.url} ref={audioRef} src={activeTrack.url} onEnded={() => playlist.length > 1 ? moveTrack(1) : setPlaying(false)} />}
      <button type="button" className="player-drag-handle" onPointerDown={beginDrag} aria-label="Move music player" title="Drag to move music player"><GripVertical size={14} /><span>MOVE</span></button>
      <button onClick={togglePlayback} disabled={!soundtrackReady} className="floating-play" aria-label={playing ? "Pause soundtrack" : soundtrackReady ? "Play soundtrack" : "Soundtrack is not configured"} title={soundtrackReady ? "Play soundtrack" : "Owner can add a Cloudinary audio URL in the catalog"}>
        {playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
      </button>
      {minimized && <div className="player-compact-transport" aria-label="Soundtrack navigation"><button type="button" onClick={restartOrPrevious} disabled={!soundtrackReady} aria-label="Previous soundtrack or restart" title="Previous / restart"><SkipBack size={13} /></button><button type="button" onClick={() => seek(-15)} disabled={!soundtrackReady} aria-label="Rewind 15 seconds" title="Rewind 15 seconds"><Rewind size={13} /></button><button type="button" onClick={() => seek(15)} disabled={!soundtrackReady} aria-label="Forward 15 seconds" title="Forward 15 seconds"><FastForward size={13} /></button><button type="button" onClick={() => moveTrack(1)} disabled={!soundtrackReady} aria-label="Next soundtrack" title="Next soundtrack"><SkipForward size={13} /></button></div>}
      {!minimized && <><div className="player-copy"><span><Music2 size={12} /> AUDIO EDITION</span><strong>{activeTrack?.title || "Curated sound"}</strong><small>{activeTrack?.artist || "INKPROWL"}</small></div><div className="player-transport" aria-label="Soundtrack navigation"><button type="button" onClick={restartOrPrevious} disabled={!soundtrackReady} aria-label="Previous soundtrack or restart" title="Previous / restart"><SkipBack size={14} /></button><button type="button" onClick={() => seek(-15)} disabled={!soundtrackReady} aria-label="Rewind 15 seconds" title="Rewind 15 seconds"><Rewind size={14} /></button><button type="button" onClick={() => seek(15)} disabled={!soundtrackReady} aria-label="Forward 15 seconds" title="Forward 15 seconds"><FastForward size={14} /></button><button type="button" onClick={() => moveTrack(1)} disabled={!soundtrackReady} aria-label="Next soundtrack" title="Next soundtrack"><SkipForward size={14} /></button></div><div className="player-volume"><Volume2 size={14} /><input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Music volume" /></div><button type="button" className="player-utility" onClick={() => setPlaylistOpen((current) => !current)} aria-label={playlistOpen ? "Close playlist" : "Open playlist"} title="Playlist"><ListMusic size={14} /></button>{soundtrackDownloadUrl && <a className="player-download" href={soundtrackDownloadUrl} aria-label="Free soundtrack download" title="Free soundtrack download"><Download size={14} /></a>}</>}
      <button type="button" className="player-utility" onClick={() => setMinimized((current) => !current)} aria-label={minimized ? "Expand music player" : "Minimize music player"} title={minimized ? "Expand" : "Minimize"}>{minimized ? <Music2 size={14} /> : <Minimize2 size={14} />}</button>
      <button type="button" className="player-utility player-close" onClick={() => setDismissed(true)} aria-label="Close music player" title="Close"><X size={14} /></button>
      <span className="player-dot" aria-hidden="true" />
      {playlistOpen && !minimized && <div className="player-playlist" role="dialog" aria-label="Current playlist"><span>PLAYLIST · {playlist.length || 0} TRACK{playlist.length === 1 ? "" : "S"}</span>{playlist.length ? playlist.map((track, index) => <button type="button" key={track.url} className={index === trackIndex ? "is-current" : ""} onClick={() => { setTrackIndex(index); setPlaying(true); }}><strong>{track.title}</strong><small>{track.artist}</small></button>) : <small>Awaiting an owner upload</small>}</div>}
    </div>
  );
}

export function CloudinaryVideoPlayer({ src, title, className = "", clientUrl, clientName }: { src?: string; title: string; className?: string; clientUrl?: string; clientName?: string }) {
  if (!src) {
    return <div className={`cloudinary-video empty-video ${className}`}><div className="video-ratio-frame"><div className="empty-video-copy"><Film size={25} /><strong>Film awaiting release</strong><span>{title} will play here once its owner adds a video.</span></div></div></div>;
  }
  return <div className={`cloudinary-video ${className}`}><div className="video-ratio-frame"><video controls preload="metadata" playsInline aria-label={title}><source src={src} />Your browser does not support HTML5 video.</video></div>{clientUrl && <div className="video-controls-bar"><a href={clientUrl} target="_blank" rel="noreferrer sponsored" className="sponsor-visit-link">Visit {clientName || "client site"}</a></div>}</div>;
}

export function PageFrame({ children, dark = false, artworkPageAds = false }: { children: React.ReactNode; dark?: boolean; artworkPageAds?: boolean }) {
  return <div className={`site-shell ${dark ? "dark-surface" : ""}`}><Header showBannerAds={!artworkPageAds} /><main>{children}</main><Footer showBannerAds={!artworkPageAds} /></div>;
}
