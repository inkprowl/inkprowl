import React from 'react';
import { SiteBranding } from '../../types';
import { Lock, Eye, Cookie, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyPageProps {
  branding: SiteBranding;
  onNavigate: (view: 'home' | '1to1' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact') => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ branding, onNavigate }) => {
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
          <Lock className="w-4 h-4 text-amber-600" />
          <span>DATA TRANSPARENCY & COOKIE DISCLOSURE</span>
        </div>
        <h1 className="text-3xl font-serif font-black uppercase text-black">Privacy Policy</h1>
        <p className="text-xs font-mono text-neutral-700">
          Last Updated: August 5, 2026 • Disclosure for {branding.siteTitle || 'InkProwl'} Visitors
        </p>
      </div>

      {branding.privacyPageContent ? (
        <div className="border-4 border-black bg-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4 font-serif text-sm leading-relaxed whitespace-pre-wrap">
          {branding.privacyPageContent}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="border-4 border-black bg-white p-6 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black uppercase text-black flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-600" />
              1. Information We Collect
            </h2>
            <p>
              At <strong>{branding.siteTitle || 'InkProwl'}</strong>, we prioritize visitor privacy. We do not require account creation to browse, preview, or download free artwork.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs font-serif text-neutral-800">
              <li><strong>Usage Data:</strong> Anonymized view counts and download counts to rank top popular vintage artworks.</li>
              <li><strong>Browser Logs:</strong> Anonymized server interaction logs to protect against spam or malicious traffic.</li>
              <li><strong>Contact Messages:</strong> Voluntary submissions via our Contact form.</li>
            </ul>
          </section>

          <section className="border-4 border-black bg-white p-6 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-lg font-black uppercase text-black flex items-center gap-2">
              <Cookie className="w-5 h-5 text-amber-600" />
              2. Cookies & Advertising Partners (Google AdSense & Adsterra)
            </h2>
            <p>
              We partner with Google AdSense and Adsterra ad networks to fund free high-resolution downloads:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs font-serif text-neutral-800">
              <li><strong>Google AdSense:</strong> Serves contextual banner ads using cookies. Visitors can opt out of personalized ads in Google account settings.</li>
              <li><strong>Adsterra Network:</strong> Uses web tokens to serve direct download links and native ad units.</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};
