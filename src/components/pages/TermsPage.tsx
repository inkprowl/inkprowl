import React from 'react';
import { SiteBranding } from '../../types';
import { Shield, FileText, CheckCircle, ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  branding: SiteBranding;
  onNavigate: (view: 'home' | '1to1' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact') => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ branding, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-neutral-900 font-serif text-sm leading-relaxed">
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300" />
          <span>RETURN TO HOME GALLERY</span>
        </button>
      </div>

      <div className="border-4 border-black bg-[#FAF4E6] p-6 sm:p-8 space-y-2 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 text-black font-mono font-bold text-xs uppercase tracking-wider">
          <FileText className="w-4 h-4 text-amber-600" />
          <span>LEGAL TERMS & AGREEMENT</span>
        </div>
        <h1 className="text-3xl font-serif font-black uppercase text-black">Terms and Conditions</h1>
        <p className="text-xs font-mono text-neutral-700">
          Last Updated: August 5, 2026 • Effective for all users of {branding.siteTitle || 'InkProwl'}
        </p>
      </div>

      {branding.termsPageContent ? (
        <div className="border-4 border-black bg-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4 font-serif text-sm leading-relaxed whitespace-pre-wrap">
          {branding.termsPageContent}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="border-4 border-black bg-white p-6 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black uppercase text-black flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or downloading artwork from <strong>{branding.siteTitle || 'InkProwl'}</strong>, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions. If you do not agree, please discontinue using our gallery.
            </p>
          </section>

          <section className="border-4 border-black bg-white p-6 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black uppercase text-black flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              2. Free Commercial & Personal License (CC0)
            </h2>
            <p>
              All vintage 2D comic art files, 1:1 square ratio wallpapers, and illustrations on {branding.siteTitle || 'InkProwl'} are provided under Creative Commons Zero (CC0) royalty-free terms:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-serif text-xs text-neutral-800">
              <li>You may download and use any image for free, for both personal and commercial projects.</li>
              <li>You may modify, crop, format, or print the artwork into merchandise, websites, or video games.</li>
              <li>Attribution is appreciated but not legally mandatory.</li>
              <li>You may NOT resell un-edited digital image files as standalone stock packages on competing markets.</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};
