import React, { useState } from 'react';
import { SiteBranding } from '../../types';
import { Mail, Send, CheckCircle2, ArrowLeft, Globe, HelpCircle } from 'lucide-react';

interface ContactPageProps {
  branding: SiteBranding;
  onNavigate: (view: 'home' | '1to1' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact') => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ branding, onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-amber-300" />
          <span>RETURN TO HOME GALLERY</span>
        </button>
      </div>

      <div className="border-4 border-black bg-[#FAF4E6] p-8 text-center space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="w-12 h-12 bg-amber-300 border-2 border-black flex items-center justify-center mx-auto text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Mail className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-black uppercase text-black">
          Contact Support & Creators
        </h1>
        <p className="text-xs sm:text-sm font-serif text-neutral-800 max-w-xl mx-auto">
          Have questions regarding artwork licenses, bulk submissions, or advertising partnerships? Send us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Form Container */}
        <div className="md:col-span-2 border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {submitted ? (
            <div className="p-8 text-center space-y-4 bg-emerald-100 border-2 border-black text-emerald-900">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-700" />
              <h3 className="text-xl font-serif font-black uppercase">Message Received!</h3>
              <p className="text-xs font-serif text-emerald-800">
                Thank you, {formData.name}. Our editorial team will review your inquiry and get back to you at <strong>{formData.email}</strong> within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                }}
                className="px-5 py-2.5 bg-black text-amber-300 font-mono font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold uppercase block text-black mb-1">
                    Your Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sudatt Makwana"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF7] border-2 border-black font-mono text-xs text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold uppercase block text-black mb-1">
                    Your Email:
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="makwanasudatt56@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFDF7] border-2 border-black font-mono text-xs text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold uppercase block text-black mb-1">
                  Topic / Subject:
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFFDF7] border-2 border-black font-mono text-xs text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bulk Submission">Bulk Image Submission</option>
                  <option value="Adsterra / AdSense Sponsor">Adsterra / AdSense Sponsorship</option>
                  <option value="Copyright & Licensing">Copyright & License Question</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono font-bold uppercase block text-black mb-1">
                  Message:
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your question, request, or proposal in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-3 bg-[#FFFDF7] border-2 border-black font-serif text-xs text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'SENDING MESSAGE...' : 'SUBMIT CONTACT FORM'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          <div className="border-4 border-black bg-[#FAF4E6] p-6 space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-sm font-mono font-bold uppercase text-black flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-600" /> Direct Support Email
            </h3>
            <p className="text-xs font-mono text-black font-bold bg-amber-200 p-2 border border-black break-all">
              {branding.contactEmail || 'makwanasudatt56@gmail.com'}
            </p>
          </div>

          <div className="border-4 border-black bg-[#FAF4E6] p-6 space-y-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-sm font-mono font-bold uppercase text-black flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-600" /> Creator Community
            </h3>
            <p className="text-xs font-serif text-neutral-800">
              Response time is typically within 24 hours. For urgent bulk image requests or copyright claims, please include artwork ID references.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
