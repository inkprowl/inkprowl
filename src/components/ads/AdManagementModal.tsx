import React, { useState } from 'react';
import { AdSettings, AdProviderMode } from '../../types';
import { X, Save, RefreshCw, Check, Info, ShieldCheck, DollarSign, Settings, Code, Zap } from 'lucide-react';

interface AdManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdSettings;
  onSave: (newSettings: AdSettings) => void;
}

export const AdManagementModal: React.FC<AdManagementModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<AdSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'adsense' | 'adsterra' | 'guide'>('general');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleModeChange = (mode: AdProviderMode) => {
    setFormData((prev) => ({ ...prev, mode }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Ad Management & Monetization Hub
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AdSense + Adsterra
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure your Google AdSense Publisher ID, Adsterra Banner Scripts, & Download Monetization.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 px-5 gap-1 pt-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'general'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Settings className="w-4 h-4" /> Global Controls
          </button>
          <button
            onClick={() => setActiveTab('adsense')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'adsense'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code className="w-4 h-4" /> Google AdSense
          </button>
          <button
            onClick={() => setActiveTab('adsterra')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'adsterra'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap className="w-4 h-4" /> Adsterra Network
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Info className="w-4 h-4" /> Setup Instructions
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <h3 className="text-sm font-semibold text-white">Enable Website Advertisements</h3>
                  <p className="text-xs text-slate-400">
                    Master switch to show or hide all ad spaces across the gallery and download modals.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData((prev) => ({ ...prev, enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Active Monetization Mode
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { id: 'both', label: 'Both AdSense & Adsterra', desc: 'Maximum revenue hybrid' },
                    { id: 'adsense', label: 'Google AdSense', desc: 'Standard banner network' },
                    { id: 'adsterra', label: 'Adsterra Network', desc: 'Native & direct link CPM' },
                    { id: 'demo', label: 'Demo / Preview Mode', desc: 'Test sponsor cards' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleModeChange(m.id as AdProviderMode)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.mode === m.id
                          ? 'border-indigo-500 bg-indigo-500/15 text-white ring-1 ring-indigo-500'
                          : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-slate-200">{m.label}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Ad Frequency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Gallery Grid Ad Placement Frequency
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Insert a sponsored ad card every N items in the masonry view.
                  </p>
                  <select
                    value={formData.adFrequencyInGrid}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, adFrequencyInGrid: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={4}>Every 4 Artworks (High Density)</option>
                    <option value={6}>Every 6 Artworks (Recommended)</option>
                    <option value={8}>Every 8 Artworks (Balanced)</option>
                    <option value={10}>Every 10 Artworks (Light)</option>
                  </select>
                </div>

                {/* Download Timer */}
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Free Download Countdown Timer
                  </label>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Seconds to display download sponsor banner before file download starts.
                  </p>
                  <select
                    value={formData.downloadCountdownSeconds}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        downloadCountdownSeconds: Number(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={0}>Instant Download (0 seconds)</option>
                    <option value={3}>3 Seconds Countdown</option>
                    <option value={5}>5 Seconds Countdown (Recommended)</option>
                    <option value={8}>8 Seconds Countdown</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adsense' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-200 rounded-xl text-xs flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Google AdSense Integration</h4>
                  <p className="text-slate-300">
                    Paste your Publisher ID (e.g. <code className="bg-slate-900 px-1 py-0.5 rounded">ca-pub-1234567890123456</code>). AdSense Auto Ads will run automatically once approved.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  AdSense Publisher ID
                </label>
                <input
                  type="text"
                  placeholder="ca-pub-1234567890123456"
                  value={formData.adsense.publisherId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      adsense: { ...prev.adsense, publisherId: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Header Leaderboard Slot ID (728x90)
                  </label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={formData.adsense.headerLeaderboardSlot}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adsense: { ...prev.adsense, headerLeaderboardSlot: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Download Modal Slot ID (Medium Rectangle)
                  </label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={formData.adsense.downloadBannerSlot}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adsense: { ...prev.adsense, downloadBannerSlot: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adsterra' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-purple-200 rounded-xl text-xs flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Adsterra Publisher Network</h4>
                  <p className="text-slate-300">
                    Paste your Adsterra Banner invocation code, Native Banner Keys, or High CPM Direct Link URL for sponsor download buttons.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adsterra Banner Script / Invocation Tag
                </label>
                <textarea
                  rows={3}
                  placeholder='<script type="text/javascript" src="//www.topcreativeformat.com/728x90/invoke.js"></script>'
                  value={formData.adsterra.bannerScript}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      adsterra: { ...prev.adsterra, bannerScript: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-300 font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adsterra Direct Link URL (For High Revenue Download Sponsor Button)
                </label>
                <input
                  type="url"
                  placeholder="https://www.highrevenuegate.com/your-direct-link"
                  value={formData.adsterra.directLinkUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      adsterra: { ...prev.adsterra, directLinkUrl: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" /> How to monetize your Art Gallery with AdSense & Adsterra
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>
                    <strong className="text-white">Google AdSense:</strong> Create a Google AdSense publisher account, submit your site domain, and copy your <code className="text-indigo-300 font-mono">ca-pub-XXXXXXXXXX</code> code into the Google AdSense tab.
                  </li>
                  <li>
                    <strong className="text-white">Adsterra Network:</strong> Sign up at Adsterra Publisher Portal, create a Native Banner or Direct Link unit, and paste the URL or Script snippet above.
                  </li>
                  <li>
                    <strong className="text-white">Manual Art Uploads:</strong> Upload high quality artworks using the "Upload Artwork" button. Each artwork attracts download traffic where sponsors can be displayed.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* Save Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              {savedSuccess ? (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-4 h-4" /> Settings Saved Successfully!
                </span>
              ) : (
                <span>All changes apply instantly to gallery banners.</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save Ad Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
