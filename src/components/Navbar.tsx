import React from 'react';
import { Orientation, FilterState, AdSettings, SiteBranding } from '../types';
import { Search, Heart, X, Lock, Layers, Upload, Sparkles } from 'lucide-react';

interface NavbarProps {
  filter: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onOpenUpload: () => void;
  onOpenAdManager: () => void;
  likedCount: number;
  adSettings: AdSettings;
  onShowLikesOnly: () => void;
  showingLikesOnly: boolean;
  categories: string[];
  branding: SiteBranding;
  onNavigate: (view: 'home' | '1to1' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact') => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  filter,
  onFilterChange,
  onOpenUpload,
  likedCount,
  onShowLikesOnly,
  showingLikesOnly,
  categories,
  branding,
  onNavigate,
  currentView,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF7EE] border-b-2 border-black text-black">
      {/* Announcement Bar */}
      <div className="bg-black text-amber-300 font-bold uppercase tracking-widest text-[11px] py-1.5 px-4 text-center border-b border-amber-900/40 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        WELCOME TO INKPROWL — PREMIUM VINTAGE COMIC ART. NEW DROPS EVERY WEEK.
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group"
        >
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.siteTitle}
              className="w-11 h-11 border-2 border-black rounded-lg object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-0.5 transition-transform"
            />
          ) : (
            <div className="w-11 h-11 border-2 border-black rounded-lg bg-amber-400 flex items-center justify-center font-serif font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              IP
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-black tracking-tight flex items-center gap-2 uppercase">
              {branding.siteTitle || 'InkProwl'}
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded border border-black bg-amber-200 text-black">
                FREE 1:1
              </span>
            </h1>
            <p className="text-[10px] font-mono text-neutral-600 hidden sm:block truncate max-w-[240px]">
              {branding.siteSubtitle || '1960s Vintage Comic 2D Line Art'}
            </p>
          </div>
        </button>

        {/* Search Input Box */}
        <div className="flex-1 max-w-md relative hidden md:block">
          <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Bear, Bull, 1:1 pulp, 2D line art..."
            value={filter.searchQuery}
            onChange={(e) => {
              onFilterChange({ searchQuery: e.target.value });
              if (currentView !== 'home' && currentView !== '1to1') onNavigate('home');
            }}
            className="w-full pl-10 pr-9 py-2 bg-[#FFFDF7] border-2 border-black focus:outline-none focus:bg-white text-xs text-black font-semibold rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-colors"
          />
          {filter.searchQuery && (
            <button
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Header Links & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Home Nav Link */}
          <button
            onClick={() => onNavigate('home')}
            className={`hidden lg:block text-xs font-bold uppercase tracking-wider px-3 py-2 text-black hover:underline ${
              currentView === 'home' ? 'font-black underline decoration-2 underline-offset-4' : ''
            }`}
          >
            HOME
          </button>

          {/* About Nav Link */}
          <button
            onClick={() => onNavigate('about')}
            className={`hidden lg:block text-xs font-bold uppercase tracking-wider px-3 py-2 text-black hover:underline ${
              currentView === 'about' ? 'font-black underline decoration-2 underline-offset-4' : ''
            }`}
          >
            ABOUT US
          </button>

          {/* 1:1 Square Marketplace */}
          <button
            onClick={() => onNavigate('1to1')}
            className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
              currentView === '1to1'
                ? 'bg-amber-400 text-black'
                : 'bg-[#FFFDF7] text-black hover:bg-amber-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">1:1 SQUARE</span>
          </button>

          {/* Favorites */}
          <button
            onClick={onShowLikesOnly}
            className={`px-3 py-1.5 border-2 border-black text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5 ${
              showingLikesOnly
                ? 'bg-red-200 text-black'
                : 'bg-[#FFFDF7] text-black hover:bg-neutral-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showingLikesOnly ? 'fill-red-600 text-red-600' : ''}`} />
            <span className="hidden sm:inline">SAVED</span>
            {likedCount > 0 && (
              <span className="px-1.5 py-0.2 bg-red-600 text-white font-bold text-[10px] rounded-full">
                {likedCount}
              </span>
            )}
          </button>


          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">UPLOAD</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="px-4 pb-2.5 md:hidden">
        <div className="relative">
          <Search className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search art..."
            value={filter.searchQuery}
            onChange={(e) => {
              onFilterChange({ searchQuery: e.target.value });
              if (currentView !== 'home' && currentView !== '1to1') onNavigate('home');
            }}
            className="w-full pl-9 pr-8 py-2 bg-[#FFFDF7] border-2 border-black text-xs font-semibold text-black rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
      </div>

      {/* Categories Bar */}
      <div className="border-t border-black bg-[#FAF4E6] px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (currentView !== 'home' && currentView !== '1to1') onNavigate('home');
                  onFilterChange({ category: cat });
                  if (showingLikesOnly) onShowLikesOnly();
                }}
                className={`px-3 py-1 border border-black text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                  filter.category === cat && !showingLikesOnly
                    ? 'bg-black text-amber-300'
                    : 'bg-[#FFFDF7] text-black hover:bg-amber-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Orientation Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={filter.orientation}
              onChange={(e) => {
                if (currentView !== 'home' && currentView !== '1to1') onNavigate('home');
                onFilterChange({ orientation: e.target.value as Orientation });
              }}
              className="px-2.5 py-1 bg-[#FFFDF7] border border-black text-black text-xs font-bold uppercase tracking-wider focus:outline-none shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <option value="all">ALL RATIOS</option>
              <option value="square">1:1 SQUARE ONLY</option>
              <option value="landscape">LANDSCAPE (16:9)</option>
              <option value="portrait">PORTRAIT (9:16)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};


