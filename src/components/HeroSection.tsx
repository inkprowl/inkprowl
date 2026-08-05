import React from 'react';
import { ArtItem, AdSettings, SiteBranding } from '../types';
import { AdBanner } from './ads/AdBanner';
import { Sparkles, ArrowRight, ShieldCheck, Layers } from 'lucide-react';

interface HeroSectionProps {
  featuredArtworks: ArtItem[];
  onSelectArt: (art: ArtItem) => void;
  onOpenUpload: () => void;
  adSettings: AdSettings;
  totalArtworksCount: number;
  branding?: SiteBranding;
  onNavigate1to1?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  featuredArtworks,
  onSelectArt,
  onOpenUpload,
  adSettings,
  totalArtworksCount,
  branding,
  onNavigate1to1,
}) => {
  const primaryHero = featuredArtworks[0] || null;

  return (
    <section className="relative pt-4 pb-6 bg-[#FBF7EE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Ad Banner Leaderboard */}
        <AdBanner type="leaderboard" settings={adSettings} />

        {/* Vintage Dark Hero Box */}
        <div className="relative border-4 border-black bg-[#0F0F0F] text-[#F7F2E8] p-6 sm:p-10 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {/* Halftone texture overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            {/* TOP CONTENT: Badge & Headline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-400 text-black font-mono font-bold text-[11px] uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                HUMAN-PROMPTED & ANATOMICALY REFINED
              </div>

              <h2 className="text-3xl sm:text-5xl font-serif font-black italic tracking-tight text-[#FAF5EB] uppercase leading-tight">
                {branding?.heroHeadline || 'Premium 2D Line Art Marketplace'}
              </h2>
            </div>

            {/* CENTER CONTENT: Crisp 1:1 Banner Image */}
            {branding?.heroBannerUrl ? (
              <div className="my-6 max-w-sm sm:max-w-md mx-auto aspect-square border-4 border-black shadow-[8px_8px_0px_0px_rgba(245,158,11,1)] overflow-hidden bg-black relative group">
                <img 
                  src={branding.heroBannerUrl} 
                  alt="Hero Banner Artwork" 
                  className="w-full h-full object-cover select-none"
                />
                <div className="absolute top-2 right-2 bg-black/80 text-amber-300 font-mono text-[10px] font-bold px-2 py-1 border border-amber-400/50 uppercase tracking-widest">
                  1:1 Ratio
                </div>
              </div>
            ) : primaryHero ? (
              <div 
                onClick={() => onSelectArt(primaryHero)}
                className="my-6 max-w-sm sm:max-w-md mx-auto aspect-square border-4 border-black shadow-[8px_8px_0px_0px_rgba(245,158,11,1)] overflow-hidden bg-black relative cursor-pointer group"
              >
                <img 
                  src={primaryHero.imageUrl} 
                  alt={primaryHero.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest bg-black px-3 py-1 border border-amber-400">
                    CLICK TO PREVIEW ARTWORK
                  </span>
                </div>
                <div className="absolute top-2 right-2 bg-black/80 text-amber-300 font-mono text-[10px] font-bold px-2 py-1 border border-amber-400/50 uppercase tracking-widest">
                  Featured 1:1
                </div>
              </div>
            ) : null}

            {/* BOTTOM CONTENT: Subheadline & CTA Buttons */}
            <div className="space-y-6">
              <p className="text-sm sm:text-base font-serif text-neutral-300 max-w-2xl mx-auto leading-relaxed">
                {branding?.heroSubheadline ||
                  'Curated vintage comic-style illustrations, anthropomorphic animal characters in bespoke tailored attire, and collectible downloadable art assets.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={() => {
                    const element = document.getElementById('gallery-section');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 bg-[#B91C1C] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                >
                  <span>BROWSE ALL ARTWORKS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onNavigate1to1 && (
                  <button
                    onClick={onNavigate1to1}
                    className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                  >
                    <Layers className="w-4 h-4" />
                    <span>1:1 PULP MARKETPLACE</span>
                  </button>
                )}
              </div>

              {/* Features Bar */}
              <div className="pt-6 border-t border-neutral-800 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-amber-300/90 uppercase tracking-widest">
                <span>✦ FREE MULTI-FORMAT DOWNLOADS</span>
                <span>✦ CC0 COMMERCIAL LICENSE</span>
                <span>✦ 4K / 600 DPI QUALITY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


