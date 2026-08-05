import React from 'react';
import { ArtItem, AdSettings } from '../types';
import { AdGridCard } from './ads/AdGridCard';
import { Heart, Download, Eye, Upload, ShieldCheck, Feather, ArrowRight } from 'lucide-react';

interface ArtGridProps {
  artworks: ArtItem[];
  onSelectArt: (art: ArtItem) => void;
  likedIds: string[];
  onToggleLike: (id: string) => void;
  adSettings: AdSettings;
  onOpenUpload: () => void;
}

export const ArtGrid: React.FC<ArtGridProps> = ({
  artworks,
  onSelectArt,
  likedIds,
  onToggleLike,
  adSettings,
  onOpenUpload,
}) => {
  if (artworks.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-[#FFFDF7] border-4 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="w-16 h-16 mx-auto bg-amber-200 border-2 border-black flex items-center justify-center font-serif text-2xl font-bold">
          ✒️
        </div>
        <h3 className="text-xl font-serif font-black uppercase">No Artworks Found</h3>
        <p className="text-xs font-mono text-neutral-600">
          No line art matched your current filter. Try searching for a different keyword or upload new vintage art!
        </p>
        <button
          onClick={onOpenUpload}
          className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-2"
        >
          <Upload className="w-4 h-4 text-amber-300" /> UPLOAD ARTWORK NOW
        </button>
      </div>
    );
  }

  // Insert ad cards at specified frequency
  const itemsWithAds: Array<{ type: 'art'; data: ArtItem } | { type: 'ad'; id: string }> = [];
  const freq = adSettings.adFrequencyInGrid || 6;

  artworks.forEach((art, index) => {
    itemsWithAds.push({ type: 'art', data: art });
    if (adSettings.enabled && (index + 1) % freq === 0) {
      itemsWithAds.push({ type: 'ad', id: `ad-card-${index}` });
    }
  });

  return (
    <div id="gallery-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 bg-[#FBF7EE]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div>
          <h2 className="text-2xl font-serif font-black text-black uppercase tracking-tight flex items-center gap-2">
            Vintage 2D Comic Line Art Collection
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded border border-black bg-amber-200 text-black">
              {artworks.length} WORKS
            </span>
          </h2>
          <p className="text-xs font-mono text-neutral-600 mt-1">
            Free high-resolution downloads • CC0 Commercial License • PNG / JPEG / WebP
          </p>
        </div>
      </div>

      {/* Artwork Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {itemsWithAds.map((item) => {
          if (item.type === 'ad') {
            return <AdGridCard key={item.id} settings={adSettings} />;
          }

          const art = item.data;
          const isLiked = likedIds.includes(art.id);

          return (
            <div
              key={art.id}
              className="bg-[#FFFDF7] border-2 border-black p-3 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group"
            >
              <div className="space-y-3">
                {/* Image Container */}
                <div
                  onClick={() => onSelectArt(art)}
                  className="relative cursor-pointer overflow-hidden border border-black bg-[#FAF4E6] aspect-square"
                >
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Top Right Green FREE Badge */}
                  <div className="absolute top-2 right-2 border border-emerald-700 bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px] px-2 py-0.5 uppercase tracking-wider">
                    FREE
                  </div>

                  {/* Top Left Format Tag */}
                  <div className="absolute top-2 left-2 border border-black bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5">
                    {art.format} • 1:1
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLike(art.id);
                    }}
                    className={`absolute bottom-2 right-2 p-1.5 border border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${
                      isLiked ? 'bg-red-100 text-red-600' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                    title={isLiked ? 'Saved' : 'Save artwork'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-600' : ''}`} />
                  </button>
                </div>

                {/* Card Title & Meta */}
                <div>
                  <h3
                    onClick={() => onSelectArt(art)}
                    className="text-sm font-serif font-black uppercase tracking-tight text-black line-clamp-1 cursor-pointer hover:underline"
                  >
                    {art.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-600 mt-1">
                    <span className="truncate">{art.category}</span>
                    <span className="shrink-0 font-bold">📥 {art.downloads} downloads</span>
                  </div>
                </div>
              </div>

              {/* Green Outlined Download Button */}
              <div className="pt-3 mt-3 border-t border-neutral-300">
                <button
                  onClick={() => onSelectArt(art)}
                  className="w-full py-2 px-3 border-2 border-emerald-700 text-emerald-800 hover:bg-emerald-700 hover:text-white font-mono font-bold text-xs uppercase tracking-wider text-center transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] block"
                >
                  FREE DOWNLOAD
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dark Banner Strip (Matching Reference Image 4) */}
      <div className="bg-black text-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✒️</span>
          <div>
            <h4 className="text-sm font-serif font-black uppercase text-amber-300 tracking-wider">
              Discover Rare Vintage Comic Art &amp; Collectible Line Illustrations
            </h4>
            <p className="text-xs font-mono text-neutral-400">
              Updated daily with bespoke animal portraits, 1960s woodcut prints, and 4K digital assets.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const element = document.getElementById('gallery-section');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-4 py-2 bg-[#991B1B] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5"
        >
          <span>EXPLORE EXCLUSIVE COLLECTIONS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* "Beyond the Prompt" Cream Section (Matching Reference Image 4) */}
      <div className="bg-[#FFFDF7] border-4 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✒️</span>
            <h3 className="text-2xl font-serif font-black italic text-black uppercase tracking-tight">
              Beyond the Prompt
            </h3>
          </div>

          <div className="px-3 py-1 bg-black text-amber-300 font-mono font-bold text-xs uppercase tracking-wider border border-black">
            🛡️ 4K / 600 DPI STANDARD
          </div>
        </div>

        <p className="text-sm font-serif text-neutral-800 leading-relaxed">
          <strong>INKPROWL</strong> is a curated comic art marketplace featuring human-directed 2D line art, vintage animal characters, and collectible downloadable assets crafted with style, precision, and originality. Every work is anatomically refined, directionally composed, and production-grade for commercial merchandise, print publishing, and high-definition digital screens.
        </p>

        <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono font-bold text-neutral-700">
          <span>✓ ANATOMICAL ACCURACY</span>
          <span>✓Savile Row Bespoke Suits</span>
          <span>✓ 1:1 SQUARE OPTIMIZED</span>
          <span>✓ NO WATERMARKS</span>
        </div>
      </div>
    </div>
  );
};
