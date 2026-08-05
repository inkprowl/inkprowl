import React, { useState, useEffect } from 'react';
import { ArtItem, AdSettings } from '../types';
import { AdBanner } from './ads/AdBanner';
import { 
  X, Download, Heart, Share2, Eye, Maximize2, Sparkles, Check, Tag, ShieldCheck, Layers, Home, ArrowLeft, Copy, Send, MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ArtDetailModalProps {
  art: ArtItem | null;
  isOpen: boolean;
  onClose: () => void;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  adSettings: AdSettings;
  onDownloadCompleted: (id: string) => void;
  relatedArtworks?: ArtItem[];
  onSelectRelated?: (art: ArtItem) => void;
  categories?: string[];
  onSelectCategory?: (category: string) => void;
  onGoHome?: () => void;
}

export const ArtDetailModal: React.FC<ArtDetailModalProps> = ({
  art,
  isOpen,
  onClose,
  isLiked,
  onToggleLike,
  adSettings,
  onDownloadCompleted,
  relatedArtworks = [],
  onSelectRelated,
  categories = [],
  onSelectCategory,
  onGoHome,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'PNG' | 'JPG' | 'WebP'>('PNG');
  const [fullZoom, setFullZoom] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDownloading(false);
      setCountdown(null);
      setFullZoom(false);
    } else if (art) {
      setSelectedFormat(art.format || 'PNG');
    }
  }, [isOpen, art]);

  if (!isOpen || !art) return null;

  const handleStartDownload = (format: 'PNG' | 'JPG' | 'WebP') => {
    setSelectedFormat(format);
    const timerSeconds = adSettings.downloadCountdownSeconds || 0;

    if (timerSeconds > 0) {
      setDownloading(true);
      setCountdown(timerSeconds);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            setTimeout(() => {
              executeActualDownload(format);
            }, 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      executeActualDownload(format);
    }
  };

  const executeActualDownload = (fmt: 'PNG' | 'JPG' | 'WebP') => {
    setDownloading(false);
    setCountdown(null);

    try {
      confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    } catch {
      // Confetti fallback
    }

    const link = document.createElement('a');
    link.href = art.highResUrl || art.imageUrl;
    const cleanTitle = art.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `${cleanTitle}.${fmt.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onDownloadCompleted(art.id);

    if (adSettings.openDirectLinkOnDownload && adSettings.adsterra.directLinkUrl) {
      window.open(adSettings.adsterra.directLinkUrl, '_blank');
    }
  };

  const getFullShareUrl = () => {
    if (!art) return window.location.href;
    const origin = window.location.origin || '';
    const pathname = window.location.pathname || '';
    return `${origin}${pathname}?art=${art.id}`;
  };

  const handleCopyLink = () => {
    const url = getFullShareUrl();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }).catch(() => {
        fallbackCopyTextToClipboard(url);
      });
    } else {
      fallbackCopyTextToClipboard(url);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleNativeShare = async () => {
    const url = getFullShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({
          title: art.title,
          text: `Check out "${art.title}" on InkProwl! Free 2D line art download:`,
          url: url,
        });
      } catch {
        // User closed share dialog
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSocialShare = (platform: 'whatsapp' | 'telegram' | 'twitter' | 'pinterest' | 'reddit' | 'facebook') => {
    const fullUrl = getFullShareUrl();
    const shareUrl = encodeURIComponent(fullUrl);
    const rawText = `Check out "${art.title}" on InkProwl! Free 2D vintage line art:`;
    const title = encodeURIComponent(rawText);
    let url = '';

    if (platform === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${rawText} ${fullUrl}`)}`;
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${shareUrl}&text=${title}`;
    } else if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${title}`;
    } else if (platform === 'pinterest') {
      url = `https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${encodeURIComponent(art.imageUrl)}&description=${title}`;
    } else if (platform === 'reddit') {
      url = `https://reddit.com/submit?url=${shareUrl}&title=${title}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    }

    if (url) window.open(url, '_blank', 'width=600,height=500');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#F7F2E8] border-4 border-black text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] my-4 max-h-[92vh] flex flex-col">
        {/* Modal Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b-2 border-black bg-[#FAF4E6]">
          <div className="flex items-center gap-2">
            {/* Prominent HOME Button */}
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                else onClose();
              }}
              className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 transition-all shrink-0"
              title="Return to Home Gallery"
            >
              <Home className="w-4 h-4 text-amber-300" />
              <span>HOME</span>
            </button>

            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-white hover:bg-neutral-100 text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">BACK</span>
            </button>

            <span className="px-2 py-1 border border-black bg-amber-200 text-black font-mono font-bold text-[10px] uppercase hidden xs:inline-block">
              {art.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleLike(art.id)}
              className={`p-1.5 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-xs font-bold flex items-center gap-1 ${
                isLiked ? 'bg-red-200 text-red-700' : 'bg-white hover:bg-neutral-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600' : ''}`} />
              <span>{art.likes}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 bg-white hover:bg-neutral-100 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-xs font-bold flex items-center gap-1"
              title="Copy direct share link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-700" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden xs:inline">{copiedLink ? 'COPIED' : 'SHARE'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-black text-white hover:bg-neutral-800 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Selection Bar inside Modal */}
        {categories.length > 0 && (
          <div className="bg-[#FAF4E6] px-4 py-2 border-b-2 border-black flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono font-bold uppercase text-black shrink-0 flex items-center gap-1">
              <Tag className="w-3 h-3 text-amber-700" /> CATEGORIES:
            </span>
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory('All');
                else onClose();
              }}
              className="px-2.5 py-0.5 border border-black text-[11px] font-mono font-bold uppercase bg-amber-300 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-400 shrink-0"
            >
              ALL
            </button>
            {categories.filter(c => c !== 'All').map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat);
                  else onClose();
                }}
                className={`px-2.5 py-0.5 border border-black text-[11px] font-mono font-bold uppercase transition-all whitespace-nowrap shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0 ${
                  art.category === cat
                    ? 'bg-black text-amber-300'
                    : 'bg-white text-black hover:bg-amber-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 bg-[#FBF7EE]">
          {/* Main Artwork Preview Box */}
          <div className="relative border-2 border-black bg-[#FAF4E6] p-4 flex items-center justify-center min-h-[320px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img
              src={art.imageUrl}
              alt={art.title}
              referrerPolicy="no-referrer"
              className={`max-h-[55vh] object-contain ${fullZoom ? 'scale-125' : ''}`}
              onClick={() => setFullZoom(!fullZoom)}
            />
            <button
              onClick={() => setFullZoom(!fullZoom)}
              className="absolute top-3 right-3 p-2 border border-black bg-white/90 text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Ad Placement */}
          <AdBanner type="download" settings={adSettings} />

          {/* Headline & Description Section */}
          <div className="space-y-3 border-b-2 border-black pb-4">
            <span className="text-xs font-mono font-bold text-neutral-600 uppercase tracking-widest block">
              {art.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black italic uppercase tracking-tight text-black leading-tight">
              {art.title}
            </h2>
            <p className="text-sm font-serif text-neutral-800 leading-relaxed">
              Premium <strong>{art.title}</strong> — vintage comic-style 2D line art with crisp ink hatching and anatomical precision. Download in high-resolution PNG, JPEG, or WebP.
            </p>

            <div className="flex items-center gap-4 text-xs font-mono font-bold pt-2">
              <span className="text-emerald-700 text-base">FREE</span>
              <span className="text-neutral-600">📥 {art.downloads} downloads</span>
              <span className="border border-emerald-700 bg-emerald-100 text-emerald-800 px-2 py-0.5">
                FREE LICENSE
              </span>
            </div>
          </div>

          {/* Download Format Buttons (Matching Reference Image 2) */}
          <div className="space-y-3 bg-[#FFFDF7] border-2 border-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              DOWNLOAD FORMAT:
            </h3>

            {downloading ? (
              <div className="p-4 bg-amber-100 border-2 border-black space-y-2 text-center">
                <p className="text-xs font-mono font-bold text-black">
                  Preparing High-Res {selectedFormat} Download in {countdown}s...
                </p>
                <div className="w-full bg-neutral-300 h-2 border border-black overflow-hidden">
                  <div
                    className="bg-black h-full transition-all duration-1000"
                    style={{
                      width: `${
                        ((adSettings.downloadCountdownSeconds - (countdown || 0)) /
                          adSettings.downloadCountdownSeconds) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleStartDownload('PNG')}
                  className="py-3 px-4 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>PNG FORMAT</span>
                </button>

                <button
                  onClick={() => handleStartDownload('JPG')}
                  className="py-3 px-4 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>JPEG FORMAT</span>
                </button>

                <button
                  onClick={() => handleStartDownload('WebP')}
                  className="py-3 px-4 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>WEBP FORMAT</span>
                </button>
              </div>
            )}

            {/* Shield Quality Box */}
            <div className="mt-3 p-3 bg-amber-100 border border-black font-mono text-xs text-black flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-800 shrink-0" />
              <span>
                <strong>🛡️ 4K / 600 DPI PRODUCTION QUALITY</strong> — Perfect for print, apparel, merchandise, and digital use.
              </span>
            </div>
          </div>

          {/* Social Media & Link Sharing Box */}
          <div className="space-y-3 bg-[#FAF4E6] border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-black flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-700" /> SHARE THIS ARTWORK:
              </span>
              <span className="text-[10px] font-mono text-neutral-600">Shows image preview when shared</span>
            </div>

            {/* Direct Copyable Link Box */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={getFullShareUrl()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-white border border-black px-3 py-2 text-xs font-mono text-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none select-all"
                />
              </div>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 shrink-0 transition-transform active:translate-y-0.5"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-800" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>COPY LINK</span>
                  </>
                )}
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="px-3 py-2 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0"
                  title="Share using native app menu"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Platform Share Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {/* WhatsApp Button */}
              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white border border-black text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-4 h-4 text-white fill-white/20" />
                <span>WHATSAPP</span>
              </button>

              {/* Telegram Button */}
              <button
                onClick={() => handleSocialShare('telegram')}
                className="px-3 py-1.5 bg-[#0088cc] hover:bg-[#0077b3] text-white border border-black text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 transition-transform hover:-translate-y-0.5"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>TELEGRAM</span>
              </button>

              {/* Twitter / X */}
              <button
                onClick={() => handleSocialShare('twitter')}
                className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white border border-black text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
              >
                TWITTER / X
              </button>

              {/* Pinterest */}
              <button
                onClick={() => handleSocialShare('pinterest')}
                className="px-3 py-1.5 bg-[#E60023] hover:bg-[#cc001f] text-white border border-black text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
              >
                PINTEREST
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleSocialShare('facebook')}
                className="px-3 py-1.5 bg-[#1877F2] hover:bg-[#1464cc] text-white border border-black text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
              >
                FACEBOOK
              </button>

              {/* Reddit */}
              <button
                onClick={() => handleSocialShare('reddit')}
                className="px-3 py-1.5 bg-[#FF4500] hover:bg-[#e03d00] text-white border border-black text-xs font-mono font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5"
              >
                REDDIT
              </button>
            </div>
          </div>

          {/* Bottom Return to Home Navigation Bar */}
          <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => {
                if (onGoHome) onGoHome();
                else onClose();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4 text-amber-300" />
              <span>RETURN TO HOME GALLERY</span>
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-neutral-100 text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center"
            >
              CLOSE PREVIEW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


