import React from 'react';
import { SiteBranding } from '../types';
import { Sparkles, ShieldCheck, Layers, Mail, Globe } from 'lucide-react';

interface FooterProps {
  branding: SiteBranding;
  onNavigate: (view: 'home' | '1to1' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact') => void;
  onSelectCategory?: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ branding, onNavigate, onSelectCategory }) => {
  return (
    <footer className="bg-black text-[#FAF4E6] border-t-4 border-black pt-12 pb-8 mt-16 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt={branding.siteTitle}
                  className="w-10 h-10 border-2 border-amber-300 object-cover"
                />
              ) : (
                <div className="w-10 h-10 border-2 border-amber-300 bg-amber-400 text-black flex items-center justify-center font-serif font-black text-xl">
                  IP
                </div>
              )}
              <div>
                <h3 className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-2">
                  {branding.siteTitle || 'InkProwl'}
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 border border-amber-300 bg-amber-300 text-black">
                    FREE CC0
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 font-mono">{branding.siteSubtitle || '1960s Vintage Comic Line Art'}</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed max-w-md font-serif">
              Explore and download high-resolution 1:1 square vintage comic line art, 2D animal character illustrations in tailored suits, and retro pulp graphic artwork. Free for personal and commercial distribution.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-amber-400/50 bg-amber-950/40 text-amber-300">
                <ShieldCheck className="w-3.5 h-3.5" /> CC0 Public Domain
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-amber-400/50 bg-amber-950/40 text-amber-300">
                <Layers className="w-3.5 h-3.5" /> 1:1 Square Ratios
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest border-b border-neutral-800 pb-1">
              EXPLORE COLLECTION
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-amber-300 transition-colors uppercase"
                >
                  ► Trending Vintage Line Art
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('1to1')}
                  className="hover:text-amber-300 transition-colors uppercase text-amber-300 font-bold"
                >
                  <Sparkles className="w-3 h-3 inline mr-1 text-amber-300" />
                  1:1 Square Pulp Market
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    if (onSelectCategory) onSelectCategory('Vintage Line Art');
                  }}
                  className="hover:text-amber-300 transition-colors uppercase"
                >
                  ► Tailored Animal Characters
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigate('home');
                    if (onSelectCategory) onSelectCategory('1960s Comic');
                  }}
                  className="hover:text-amber-300 transition-colors uppercase"
                >
                  ► 1960s Comic Classics
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Static Pages */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-widest border-b border-neutral-800 pb-1">
              INFORMATION
            </h4>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-amber-300 transition-colors uppercase"
                >
                  About InkProwl
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-amber-300 transition-colors uppercase"
                >
                  Terms & Licensing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-amber-300 transition-colors uppercase"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-300 transition-colors uppercase flex items-center gap-1.5"
                >
                  <Mail className="w-3 h-3 text-amber-300" /> Support & Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Ad Monetization & Verification Notice */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 mb-8 text-[11px] text-neutral-300 leading-relaxed font-serif">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-1.5 font-mono">
            <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              Verified Ad Partner Network (Google AdSense & Adsterra)
            </span>
            <span className="text-[10px] bg-neutral-800 px-2 py-0.5 border border-neutral-700 text-neutral-400">
              100% Free Downloads Supported by Ads
            </span>
          </div>
          <p>
            {branding.siteTitle} displays non-intrusive advertisements from verified ad networks including Google AdSense and Adsterra to keep digital comic art open and free for creators worldwide.
          </p>
        </div>

        {/* Bottom Bar with Secret Admin Access */}
        <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-400">
          <p>© {new Date().getFullYear()} {branding.siteTitle || 'InkProwl'}. All comic art free under CC0.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => onNavigate('terms')} className="hover:text-white uppercase">Terms</button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-white uppercase">Privacy</button>
            <button onClick={() => onNavigate('about')} className="hover:text-white uppercase">About</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-white uppercase">Contact</button>
            {/* Secret/Discreet Admin Link (not visible as a primary button) */}
            <button
              onClick={() => onNavigate('admin')}
              className="text-neutral-700 hover:text-amber-400 text-[10px] font-mono underline ml-2"
              title="Admin Portal (Secret Link)"
            >
              [Admin]
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
