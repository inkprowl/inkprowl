import React from 'react';
import { SiteBranding } from '../../types';
import { Sparkles, ShieldCheck, Download, Zap, Layers, ArrowLeft } from 'lucide-react';

interface AboutPageProps {
  branding: SiteBranding;
  onNavigate: (view: 'home' | '1to1' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact') => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ branding, onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Back Navigation */}
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300" />
          <span>RETURN TO HOME GALLERY</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="border-4 border-black bg-[#FAF4E6] p-8 sm:p-12 text-center space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
        <div className="w-16 h-16 bg-amber-300 border-2 border-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black">
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-black uppercase text-black tracking-tight italic">
          About {branding.siteTitle || 'InkProwl'}
        </h1>
        <p className="text-sm sm:text-base font-serif text-neutral-800 max-w-2xl mx-auto leading-relaxed">
          {branding.siteSubtitle || '1960s Vintage Comic Line Art & 1:1 Square Ratio Public Domain Marketplace'}
        </p>
      </div>

      {/* If Admin set custom page content, render it! */}
      {branding.aboutPageContent ? (
        <div className="border-4 border-black bg-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4 font-serif text-sm leading-relaxed text-neutral-900 whitespace-pre-wrap">
          {branding.aboutPageContent}
        </div>
      ) : (
        <>
          {/* Mission & Vision Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-4 border-black bg-[#FAF4E6] p-6 space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 bg-amber-200 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-black uppercase text-black">1:1 Square Ratios</h3>
              <p className="text-xs font-serif text-neutral-800 leading-relaxed">
                Specialized marketplace curated for 1:1 aspect ratio square artwork — ideal for avatars, profile banners, album covers, Instagram line art, and print collectibles.
              </p>
            </div>

            <div className="border-4 border-black bg-[#FAF4E6] p-6 space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 bg-amber-200 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-black uppercase text-black">Free Downloads</h3>
              <p className="text-xs font-serif text-neutral-800 leading-relaxed">
                Download high resolution 2D comic art files in PNG, JPG, or WebP formats without paywalls or subscriptions.
              </p>
            </div>

            <div className="border-4 border-black bg-[#FAF4E6] p-6 space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-12 h-12 bg-amber-200 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-black uppercase text-black">CC0 Public Domain</h3>
              <p className="text-xs font-serif text-neutral-800 leading-relaxed">
                All hosted artworks are released for free personal and commercial distribution. Modify, re-use, or print with total freedom.
              </p>
            </div>
          </div>

          {/* Detailed Story Section */}
          <div className="border-4 border-black bg-white p-8 space-y-6 text-sm font-serif text-neutral-900 leading-relaxed shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase border-b-2 border-black pb-3 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-600" />
              Empowering Creators & Vintage Art Enthusiasts
            </h2>
            <p>
              Founded with a passion for classic 1960s comic book illustration and 2D cross-hatching, <strong>{branding.siteTitle || 'InkProwl'}</strong> delivers human-prompted line art featuring anthropomorphic animal characters, bespoke tailored vintage attire, and retro pulp graphic styles.
            </p>
            <p>
              Our platform is supported by ethical advertisement network partnerships with Google AdSense and Adsterra. This monetization model guarantees that creators can showcase their artwork globally while end-users enjoy unrestricted high-resolution downloads at zero cost.
            </p>
          </div>
        </>
      )}

      {/* Call to Action Bar */}
      <div className="border-4 border-black bg-black text-[#FAF4E6] p-8 text-center space-y-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-serif font-black uppercase text-amber-300">
          Ready to explore 1960s comic line art?
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]"
          >
            BROWSE GALLERY
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-3 bg-white hover:bg-neutral-100 text-black font-mono font-bold text-xs uppercase border-2 border-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]"
          >
            CONTACT SUPPORT
          </button>
        </div>
      </div>
    </div>
  );
};
