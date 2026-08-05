import React, { useEffect, useRef } from 'react';
import { AdSettings } from '../../types';
import { ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

interface AdBannerProps {
  type: 'leaderboard' | 'rectangle' | 'native' | 'download' | 'mobile_anchor';
  settings: AdSettings;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ type, settings, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!settings.enabled) return;

    // Execute custom script if present for Adsterra or AdSense
    if (adContainerRef.current && (settings.mode === 'adsterra' || settings.mode === 'both')) {
      const bannerScript = settings.adsterra.bannerScript;
      if (bannerScript && bannerScript.trim().length > 0) {
        // Safe evaluation / container injection for preview
        try {
          const container = adContainerRef.current;
          // Check if already injected
          if (!container.dataset.injected) {
            container.dataset.injected = 'true';
            // Create range to load script nodes cleanly
            const range = document.createRange();
            range.selectNode(container);
            const fragment = range.createContextualFragment(bannerScript);
            // Append if fragment contains nodes
            if (fragment.children.length > 0) {
              container.appendChild(fragment);
            }
          }
        } catch (err) {
          console.warn('Adsterra script injection notice:', err);
        }
      }
    }
  }, [settings, type]);

  if (!settings.enabled) {
    return null;
  }

  const { mode, adsense, adsterra } = settings;

  // Render Live AdSense if publisher ID is configured
  const isRealAdSenseActive = (mode === 'adsense' || mode === 'both') && adsense.publisherId && adsense.publisherId.startsWith('ca-pub-');
  const isRealAdsterraActive = (mode === 'adsterra' || mode === 'both') && adsterra.bannerScript && adsterra.bannerScript.includes('script');

  // If live ad scripts are detected or enabled, render live container + fallback demo if script fails
  if (isRealAdSenseActive && type === 'leaderboard') {
    return (
      <div className={`w-full overflow-hidden my-4 text-center ${className}`}>
        <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 font-medium">
          Advertisement • AdSense
        </div>
        <div ref={adContainerRef} className="min-h-[90px] flex items-center justify-center bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-2">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '90px' }}
            data-ad-client={adsense.publisherId}
            data-ad-slot={adsense.headerLeaderboardSlot || '7289012345'}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    );
  }

  // Demo / Placeholder Display Modes
  if (type === 'leaderboard') {
    return (
      <div className={`w-full my-4 ${className}`}>
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 mb-1 px-1 font-medium">
          <span className="flex items-center gap-1">
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">
              SPONSORED
            </span>
            <span>{mode === 'adsterra' ? 'Adsterra 728x90 Leaderboard' : mode === 'adsense' ? 'Google AdSense Unit' : 'AdSense & Adsterra Space'}</span>
          </span>
          <span className="text-[10px] opacity-75">728x90 Banner</span>
        </div>
        <div className="relative overflow-hidden group rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                Ultra 8K Digital Canvas Suite
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">Ad</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">
                Unlock professional graphics tools, textures, and brush packs for digital creators.
              </p>
            </div>
          </div>
          <a
            href={adsterra.directLinkUrl || "https://adsterra.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            Explore Now <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  if (type === 'download') {
    return (
      <div className={`w-full my-3 p-3.5 rounded-xl bg-slate-900 text-white border border-slate-800 ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Sponsored Download Partner
          </span>
          <span>{mode === 'adsterra' ? 'Adsterra Native Unit' : 'AdSense Banner'}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-100 truncate">High Speed Download Server</h4>
            <p className="text-[11px] text-slate-400 line-clamp-1">Free fast CDN hosting sponsored by Adsterra & AdSense monetization network.</p>
          </div>
          {adsterra.directLinkUrl ? (
            <a
              href={adsterra.directLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shrink-0"
            >
              Visit Sponsor
            </a>
          ) : null}
        </div>
      </div>
    );
  }

  if (type === 'rectangle') {
    return (
      <div className={`w-full my-3 ${className}`}>
        <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1 font-medium text-center">
          Advertisement (300x250)
        </div>
        <div className="w-full h-[250px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between text-white relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl"></div>
          <div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold uppercase">
              Adsterra / AdSense
            </span>
            <h3 className="text-sm font-bold mt-2 text-slate-100">Pro Creator Asset Pack</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-3">
              Get instant access to 5,000+ vector textures, 3D models, and brush presets. High speed direct downloads available.
            </p>
          </div>
          <a
            href={adsterra.directLinkUrl || "https://adsterra.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold text-center rounded-lg transition-all flex items-center justify-center gap-1"
          >
            Download Free Trial <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full text-center py-2 text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-800 rounded-lg">
      Ad Space ({mode.toUpperCase()})
    </div>
  );
};
