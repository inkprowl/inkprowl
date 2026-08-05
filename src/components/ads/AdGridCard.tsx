import React from 'react';
import { AdSettings } from '../../types';
import { ExternalLink, Sparkles, Megaphone } from 'lucide-react';

interface AdGridCardProps {
  settings: AdSettings;
}

export const AdGridCard: React.FC<AdGridCardProps> = ({ settings }) => {
  if (!settings.enabled) return null;

  const directUrl = settings.adsterra.directLinkUrl || "https://adsterra.com";

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 border border-indigo-500/30 shadow-lg p-5 flex flex-col justify-between group hover:border-indigo-400/60 transition-all duration-300 transform hover:-translate-y-1">
      {/* Top Tag Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Megaphone className="w-3.5 h-3.5" /> SPONSORED
        </span>
        <span className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
          {settings.mode === 'adsterra' ? 'Adsterra Ad' : settings.mode === 'adsense' ? 'Google AdSense' : 'Ad Network'}
        </span>
      </div>

      {/* Main Visual Content */}
      <div className="relative my-2 h-44 rounded-xl overflow-hidden bg-slate-800 border border-indigo-500/20 flex flex-col items-center justify-center p-4 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 group-hover:scale-105 transition-transform duration-500"></div>
        <Sparkles className="w-10 h-10 text-indigo-400 mb-2 animate-bounce" />
        <h3 className="text-sm font-bold text-white relative z-10">AI Creative Suite 2026</h3>
        <p className="text-xs text-slate-300 mt-1 line-clamp-2 relative z-10 px-2">
          Generate 8K wallpapers, textures, and digital art prompts with instant speed.
        </p>
      </div>

      {/* Bottom Call to Action */}
      <div className="mt-3">
        <p className="text-xs text-slate-300 mb-3 line-clamp-2">
          Free access sponsored by our ad partners. Get premium creative design tools today.
        </p>
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-indigo-500/20"
        >
          <span>Visit Sponsor Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
