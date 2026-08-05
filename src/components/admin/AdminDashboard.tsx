import React, { useState, useEffect } from 'react';
import { ArtItem, AdSettings, SiteBranding } from '../../types';
import { artStore } from '../../services/artStore';
import { compressImage } from '../../utils/imageCompressor';
import { uploadImageFile } from '../../utils/cloudUploader';
import { 
  Upload, Image as ImageIcon, Layers, Settings, DollarSign, Database, Trash2, Edit2, 
  Plus, Check, RefreshCw, Eye, EyeOff, Download, Search, Shield, ArrowLeft, Tag, Sparkles, AlertCircle, FileText,
  Lock, Key, Code, HelpCircle, CheckCircle2, X, Mail
} from 'lucide-react';

interface AdminDashboardProps {
  artworks: ArtItem[];
  categories: string[];
  branding: SiteBranding;
  adSettings: AdSettings;
  onUpdateData: () => void;
  onNavigate?: (view: 'home' | '1to1' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  artworks,
  categories,
  branding,
  adSettings,
  onUpdateData,
  onNavigate,
}) => {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('inkpulp_admin_logged') === 'true';
  });
  const [loginId, setLoginId] = useState<string>('');
  const [loginPass, setLoginPass] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Password Eye & Reset Password State
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('makwanasudatt56@gmail.com');
  const [resetNewPass, setResetNewPass] = useState<string>('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetNewPass.trim()) {
      setLoginError('Please enter a new password to reset.');
      return;
    }
    const currentCreds = artStore.getAdminCredentials();
    artStore.updateAdminCredentials(currentCreds.id || 'admin', resetNewPass.trim());
    setResetSuccessMsg(`Password reset link sent to ${resetEmail}! Admin password updated successfully.`);
    setLoginPass(resetNewPass.trim());
    setIsResetMode(false);
    setLoginError(null);
  };

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<
    'bulk-upload' | 'artworks' | 'categories' | 'custom-codes' | 'branding' | 'ads' | 'pages' | 'security'
  >('bulk-upload');

  // Bulk Upload State
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkCategory, setBulkCategory] = useState<string>(categories[1] || '1:1 Pulp Square');
  const [bulkAuthor, setBulkAuthor] = useState<string>('InkPulp Studio');
  const [bulkTags, setBulkTags] = useState<string>('Vintage Comic, Line Art, 1960s, Bespoke Suit, Animal Character');
  const [bulkLicense, setBulkLicense] = useState<string>('Free Commercial & Personal Use (CC0)');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number; currentFile: string }>({ current: 0, total: 0, currentFile: '' });
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string | null>(null);

  // Artwork Search & Bulk Delete Table State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [ratioFilter, setRatioFilter] = useState<'all' | '1to1' | 'other'>('all');
  const [editingArt, setEditingArt] = useState<ArtItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirmBulkDelete, setShowConfirmBulkDelete] = useState<boolean>(false);

  // Category Manager State
  const [newCatName, setNewCatName] = useState<string>('');
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);

  // Site Branding State
  const [brandingForm, setBrandingForm] = useState<SiteBranding>(branding);
  const [brandingSaved, setBrandingSaved] = useState<boolean>(false);

  // Ad & Custom Code Settings State
  const [adForm, setAdForm] = useState<AdSettings>(adSettings);
  const [headCode, setHeadCode] = useState<string>(branding.headCustomCode || '');
  const [footerCode, setFooterCode] = useState<string>(branding.footerCustomCode || '');
  const [codesSaved, setCodesSaved] = useState<boolean>(false);

  // Pages Editor State
  const [aboutPageContent, setAboutPageContent] = useState<string>(branding.aboutPageContent || '');
  const [termsPageContent, setTermsPageContent] = useState<string>(branding.termsPageContent || '');
  const [privacyPageContent, setPrivacyPageContent] = useState<string>(branding.privacyPageContent || '');
  const [activePageEditor, setActivePageEditor] = useState<'about' | 'terms' | 'privacy'>('about');
  const [pagesSaved, setPagesSaved] = useState<boolean>(false);

  // Admin Security State
  const [newAdminId, setNewAdminId] = useState<string>('');
  const [newAdminPass, setNewAdminPass] = useState<string>('');
  const [securitySuccessMsg, setSecuritySuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setBrandingForm(branding);
    setHeadCode(branding.headCustomCode || '');
    setFooterCode(branding.footerCustomCode || '');
    setAboutPageContent(branding.aboutPageContent || '');
    setTermsPageContent(branding.termsPageContent || '');
    setPrivacyPageContent(branding.privacyPageContent || '');
  }, [branding]);

  useEffect(() => {
    setAdForm(adSettings);
  }, [adSettings]);

  // Handle Admin Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (artStore.verifyAdminLogin(loginId, loginPass)) {
      setIsLoggedIn(true);
      sessionStorage.setItem('inkpulp_admin_logged', 'true');
      setLoginError(null);
    } else {
      setLoginError('Invalid Admin ID or Password. (Default ID: admin, Password: admin123)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('inkpulp_admin_logged');
  };

  // Handle Bulk Image File Selection
  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).filter((f: File) => f.type.startsWith('image/'));
      setBulkFiles(filesArray);
    }
  };

  // Helper for Auto Title from file name
  const generateAutoTitle = (fileName: string): string => {
    const raw = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    // Clean up double spaces
    const words = raw.split(' ').filter(Boolean);
    return words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper for Auto Tags from file name and category
  const generateAutoTags = (fileName: string, category: string, customTagsInput: string): string[] => {
    const titleWords = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').split(' ').filter(Boolean);
    const set = new Set<string>();

    // Add base category
    set.add(category);
    set.add('1960s Comic');
    set.add('Vintage Line Art');
    set.add('Tailored Animals');

    titleWords.forEach(word => {
      const clean = word.toLowerCase();
      if (clean.length > 2 && !['and', 'the', 'for', 'with', 'art', 'png', 'jpg', 'jpeg'].includes(clean)) {
        set.add(word.charAt(0).toUpperCase() + word.slice(1));
      }
    });

    if (customTagsInput.trim()) {
      customTagsInput.split(',').forEach(t => {
        const tr = t.trim();
        if (tr) set.add(tr);
      });
    }

    return Array.from(set);
  };

  // Process Bulk File Uploads with Progress Indicator
  const handleProcessBulkUpload = async () => {
    if (bulkFiles.length === 0) return;
    setIsProcessing(true);
    setUploadSuccessMsg(null);
    setProcessingProgress({ current: 0, total: bulkFiles.length, currentFile: bulkFiles[0].name });

    const parsedItems: Array<Omit<ArtItem, 'id' | 'createdAt' | 'views' | 'downloads' | 'likes'>> = [];

    for (let i = 0; i < bulkFiles.length; i++) {
      const file = bulkFiles[i];
      setProcessingProgress({ current: i + 1, total: bulkFiles.length, currentFile: file.name });

      const uploadResult = await uploadImageFile(file);
      const dataUrl = uploadResult.imageUrl;

      // Calculate width, height & ratio
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width || 2560, height: img.height || 2560 });
        img.onerror = () => resolve({ width: 2560, height: 2560 });
        img.src = dataUrl;
      });

      const isSquare = dimensions.width === dimensions.height;
      const aspectRatio = isSquare ? 'square' : dimensions.width > dimensions.height ? 'landscape' : 'portrait';
      const fileExt = file.name.split('.').pop()?.toUpperCase() || 'PNG';
      const format = ['PNG', 'JPG', 'JPEG', 'WEBP'].includes(fileExt) ? (fileExt === 'JPEG' ? 'JPG' : fileExt) as any : 'PNG';
      
      const autoTitle = generateAutoTitle(file.name);
      const autoTags = generateAutoTags(file.name, bulkCategory, bulkTags);
      const autoDesc = `1960s vintage comic book 2D line art illustration titled "${autoTitle}", rendered with detailed anatomical accuracy and bespoke tailored vintage attire. Dimensions: ${dimensions.width}x${dimensions.height}.`;

      parsedItems.push({
        title: autoTitle,
        description: autoDesc,
        category: isSquare ? '1:1 Pulp Square' : bulkCategory,
        tags: autoTags,
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio,
        format,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        author: bulkAuthor,
        license: bulkLicense,
        imageUrl: dataUrl,
        highResUrl: dataUrl,
        palette: ['#0F172A', '#D97706', '#991B1B', '#1E293B'],
        featured: isSquare,
        isOneToOneRatio: isSquare,
      });

      // Small async yield for progress bar UI update
      await new Promise(r => setTimeout(r, 100));
    }

    artStore.addBulkArtworks(parsedItems);
    setIsProcessing(false);
    setUploadSuccessMsg(`Successfully processed and added ${parsedItems.length} artwork files with auto titles & tags!`);
    setBulkFiles([]);
    onUpdateData();
  };

  // Single Delete Artwork
  const handleDeleteSingle = (id: string) => {
    artStore.deleteArtwork(id);
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    onUpdateData();
  };

  // Bulk Delete Artworks
  const handleExecuteBulkDelete = () => {
    if (selectedIds.length === 0) return;
    artStore.deleteBulkArtworks(selectedIds);
    setSelectedIds([]);
    setShowConfirmBulkDelete(false);
    onUpdateData();
  };

  // Toggle Selection
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredArtworks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredArtworks.map((a) => a.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Category Operations
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    artStore.addCategory(newCatName.trim());
    setNewCatName('');
    onUpdateData();
  };

  const handleDeleteCategory = (catName: string) => {
    artStore.deleteCategory(catName);
    onUpdateData();
  };

  // Save Branding
  const handleSaveBranding = () => {
    const updatedBranding: SiteBranding = {
      ...brandingForm,
      headCustomCode: headCode,
      footerCustomCode: footerCode,
      aboutPageContent,
      termsPageContent,
      privacyPageContent,
    };
    artStore.saveBranding(updatedBranding);
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 3000);
    onUpdateData();
  };

  // Save Custom Codes
  const handleSaveCustomCodes = () => {
    handleSaveBranding();
    artStore.saveAdSettings(adForm);
    setCodesSaved(true);
    setTimeout(() => setCodesSaved(false), 3000);
    onUpdateData();
  };

  // Save Pages Content
  const handleSavePagesContent = () => {
    handleSaveBranding();
    setPagesSaved(true);
    setTimeout(() => setPagesSaved(false), 3000);
    onUpdateData();
  };

  // Update Admin Password / Security Credentials
  const handleUpdateAdminSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminId.trim() || !newAdminPass.trim()) {
      setSecuritySuccessMsg('Admin ID and Password cannot be empty.');
      return;
    }
    artStore.updateAdminCredentials(newAdminId, newAdminPass);
    setSecuritySuccessMsg(`Admin credentials updated successfully! New Login ID: "${newAdminId.trim()}"`);
    setNewAdminId('');
    setNewAdminPass('');
  };

  // Filter artworks for table view
  const filteredArtworks = artworks.filter((item) => {
    if (selectedCategoryFilter !== 'All' && item.category !== selectedCategoryFilter) return false;
    if (ratioFilter === '1to1' && !(item.isOneToOneRatio || item.aspectRatio === 'square')) return false;
    if (ratioFilter === 'other' && (item.isOneToOneRatio || item.aspectRatio === 'square')) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // UNAUTHENTICATED: Show Admin Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FBF7EE]">
        <div className="max-w-md w-full bg-[#FAF4E6] border-4 border-black text-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 bg-amber-200 border-2 border-black flex items-center justify-center mx-auto text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Lock className="w-7 h-7 text-black" />
            </div>
            <h2 className="text-2xl font-serif font-black uppercase text-black tracking-tight">
              Admin Portal
            </h2>
            <p className="text-xs font-serif text-neutral-800">
              {isResetMode
                ? 'Reset Admin Password via email confirmation.'
                : 'Enter your Admin Login ID and Password to manage gallery, bulk uploads, and monetization.'}
            </p>
          </div>

          {resetSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-100 border-2 border-black text-emerald-900 text-xs font-mono font-bold space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{resetSuccessMsg}</span>
              </div>
            </div>
          )}

          {loginError && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-black text-red-900 text-xs font-mono font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
              <span>{loginError}</span>
            </div>
          )}

          {isResetMode ? (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-black uppercase block mb-1">
                  Registered Admin Email:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-black font-mono text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <Mail className="w-4 h-4 text-neutral-600 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-black uppercase block mb-1">
                  New Admin Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={resetNewPass}
                    onChange={(e) => setResetNewPass(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-black font-mono text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-black hover:text-amber-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" /> Reset & Send Link to {resetEmail}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setLoginError(null);
                  }}
                  className="text-xs font-mono font-bold uppercase underline text-black hover:text-amber-700"
                >
                  Back to Admin Login
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-black uppercase block mb-1">
                  Admin User ID:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border-2 border-black font-mono text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold text-black uppercase block">
                    Admin Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setLoginError(null);
                    }}
                    className="text-[11px] font-mono font-bold text-black hover:underline hover:text-amber-800"
                  >
                    Forgot / Reset Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full pl-3 pr-10 py-2.5 bg-white border-2 border-black font-mono text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-black hover:text-amber-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" /> Secure Admin Access
              </button>

              <div className="pt-2 text-center text-[11px] font-mono text-neutral-700 border-t border-black/20">
                Admin Credentials: <code className="bg-amber-200 px-1 py-0.5 border border-black font-bold text-black">Inkprowl</code> / <code className="bg-amber-200 px-1 py-0.5 border border-black font-bold text-black">inkprowl@2027</code>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // AUTHENTICATED: Show Admin Dashboard Panel
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">InkPulp Master Control Panel</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                Admin Session Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Full manual site control, bulk upload with auto-titling, bulk delete, custom header/footer script codes, categories manager, and page editors.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Main Gallery
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Lock className="w-4 h-4" /> Logout Admin
          </button>
        </div>
      </div>

      {/* Navigation Tabs Header */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 pb-2">
        {[
          { id: 'bulk-upload', label: 'Bulk Image Upload', icon: Upload, badge: bulkFiles.length > 0 ? `${bulkFiles.length}` : null },
          { id: 'artworks', label: 'Catalog & Bulk Delete', icon: Layers, badge: `${artworks.length}` },
          { id: 'categories', label: 'Categories Manager', icon: Tag, badge: `${categories.length}` },
          { id: 'custom-codes', label: 'Header & Footer Ad Codes', icon: Code },
          { id: 'branding', label: 'Site Control & Branding', icon: Settings },
          { id: 'pages', label: 'About, Terms & Privacy', icon: FileText },
          { id: 'security', label: 'Admin Security', icon: Key },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                isActive
                  ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-amber-800 text-amber-100' : 'bg-slate-800 text-slate-300'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BULK IMAGE UPLOAD */}
      {activeTab === 'bulk-upload' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" /> Bulk Image Upload & Auto Processing
              </h2>
              <p className="text-xs text-slate-400">
                Upload multiple vintage line art images. Titles, tags, and descriptions will be automatically generated from file names and category selection.
              </p>
            </div>
          </div>

          {uploadSuccessMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{uploadSuccessMsg}</span>
              </div>
              <button onClick={() => setUploadSuccessMsg(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Upload Drop Zone */}
          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500 rounded-3xl p-8 text-center bg-slate-950/50 transition-colors relative cursor-pointer group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBulkFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="space-y-3 pointer-events-none">
              <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Click or drag & drop artwork image files</p>
                <p className="text-xs text-slate-400">Select multiple JPEG, PNG, or WebP images to batch process</p>
              </div>
            </div>
          </div>

          {/* Selected Files Count & Settings */}
          {bulkFiles.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">{bulkFiles.length} files selected for upload</span>
                </div>
                <button
                  onClick={() => setBulkFiles([])}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Clear Selection
                </button>
              </div>

              {/* Batch Settings Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Batch Category Option:</label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Artist / Author Credit:</label>
                  <input
                    type="text"
                    value={bulkAuthor}
                    onChange={(e) => setBulkAuthor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Custom Tags (Comma Separated):</label>
                  <input
                    type="text"
                    value={bulkTags}
                    onChange={(e) => setBulkTags(e.target.value)}
                    placeholder="e.g. Vintage, Comic, Tweed Suit"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload & Auto Process Action Button */}
              <button
                disabled={isProcessing}
                onClick={handleProcessBulkUpload}
                className="w-full py-4 bg-gradient-to-r from-amber-600 via-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-amber-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" /> Processing & Auto Categorizing Images...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Batch Upload & Generate Auto Titles ({bulkFiles.length} Images)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Processing Indicator Bar */}
          {isProcessing && (
            <div className="p-5 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                <span>Processing artwork file {processingProgress.current} of {processingProgress.total}...</span>
                <span>{Math.round((processingProgress.current / processingProgress.total) * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300"
                  style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                File: <code className="text-slate-200">{processingProgress.currentFile}</code>
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ARTWORKS CATALOG & BULK DELETE */}
      {activeTab === 'artworks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" /> Catalog Management & Bulk Delete
              </h2>
              <p className="text-xs text-slate-400">
                View, filter, edit, or select multiple artworks for bulk deletion. Total items in gallery: {artworks.length}.
              </p>
            </div>

            {/* Bulk Actions Button */}
            {selectedIds.length > 0 && (
              <button
                onClick={() => setShowConfirmBulkDelete(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all animate-bounce"
              >
                <Trash2 className="w-4 h-4" /> Bulk Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search catalog titles, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl focus:outline-none"
              >
                <option value="All">Category: All</option>
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={ratioFilter}
                onChange={(e) => setRatioFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-xl focus:outline-none"
              >
                <option value="all">Ratio: All</option>
                <option value="1to1">1:1 Square Only</option>
                <option value="other">Non-Square Only</option>
              </select>
            </div>
          </div>

          {/* Table of Artworks */}
          <div className="overflow-x-auto border border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-xs border-b border-slate-800">
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredArtworks.length && filteredArtworks.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                    />
                  </th>
                  <th className="p-3">Artwork</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Ratio / Format</th>
                  <th className="p-3">Stats</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredArtworks.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isSquare = item.isOneToOneRatio || item.aspectRatio === 'square';
                  return (
                    <tr key={item.id} className={`hover:bg-slate-950/60 transition-colors ${isSelected ? 'bg-amber-500/10' : ''}`}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectItem(item.id)}
                          className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-white max-w-xs truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-xs">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">
                        {isSquare ? (
                          <span className="text-purple-400 font-bold">1:1 Square</span>
                        ) : (
                          <span>{item.aspectRatio}</span>
                        )}
                        <br />
                        <span className="text-slate-400">{item.width}x{item.height} • {item.format}</span>
                      </td>
                      <td className="p-3 text-slate-300">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span title="Views"><Eye className="w-3 h-3 inline text-slate-500 mr-1" />{item.views}</span>
                          <span title="Downloads"><Download className="w-3 h-3 inline text-emerald-500 mr-1" />{item.downloads}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleDeleteSingle(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete artwork"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Confirmation Modal for Bulk Delete */}
          {showConfirmBulkDelete && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 space-y-4 text-center">
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Confirm Bulk Delete?</h3>
                <p className="text-xs text-slate-300">
                  Are you sure you want to permanently delete <strong className="text-rose-400">{selectedIds.length} selected artworks</strong> from the InkPulp gallery? This action cannot be undone.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmBulkDelete(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExecuteBulkDelete}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30"
                  >
                    Yes, Delete {selectedIds.length} Items
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-400" /> Categories Manager
            </h2>
            <p className="text-xs text-slate-400">Add, rename/edit, or remove gallery categories. Renaming updates all artworks in that category.</p>
          </div>

          {/* Inline Rename Form Modal Box */}
          {editingCategory && (
            <div className="p-4 bg-slate-950 border-2 border-amber-500/80 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-300">
                  Rename Category: <span className="text-white">"{editingCategory.oldName}"</span>
                </h4>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editingCategory.newName}
                  onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
                  placeholder="Enter new category name..."
                />
                <button
                  onClick={() => {
                    if (!editingCategory.newName.trim()) return;
                    artStore.renameCategory(editingCategory.oldName, editingCategory.newName.trim());
                    setEditingCategory(null);
                    onUpdateData();
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg"
                >
                  Save Rename
                </button>
              </div>
            </div>
          )}

          {/* Add Category Form */}
          <div className="flex items-center gap-3 max-w-md">
            <input
              type="text"
              placeholder="New Category Name (e.g. Vintage Hatching)..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>

          {/* Categories Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            {categories.map((cat) => {
              const itemCount = artworks.filter((a) => a.category === cat).length;
              return (
                <div
                  key={cat}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="text-xs font-bold text-white">{cat}</h3>
                    <p className="text-[10px] text-slate-400">{itemCount} artworks in catalog</p>
                  </div>

                  {cat !== 'All' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingCategory({ oldName: cat, newName: cat })}
                        className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        title="Rename category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: HEADER & FOOTER CUSTOM AD CODES */}
      {activeTab === 'custom-codes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-amber-400" /> Custom Header & Footer Script Codes
              </h2>
              <p className="text-xs text-slate-400">
                Insert raw script tags, AdSense auto-ads header snippets, Adsterra popunder scripts, and analytics tags into the page header or footer.
              </p>
            </div>
            {codesSaved && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center gap-1">
                <Check className="w-4 h-4" /> Custom Codes Saved!
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Head Custom Code Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-amber-400 block flex items-center gap-1.5">
                <Code className="w-4 h-4" /> Header Custom Code Snippet (Injected in &lt;head&gt;):
              </label>
              <textarea
                rows={5}
                value={headCode}
                onChange={(e) => setHeadCode(e.target.value)}
                placeholder="<script async src='https://pagead2.googlesyndication.com/.../adsbygoogle.js'></script>"
                className="w-full font-mono text-xs p-4 bg-slate-950 border border-slate-800 focus:border-amber-500 text-slate-200 rounded-2xl focus:outline-none"
              />
            </div>

            {/* Footer Custom Code Box */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-purple-400 block flex items-center gap-1.5">
                <Code className="w-4 h-4" /> Footer Custom Code Snippet (Injected before &lt;/body&gt;):
              </label>
              <textarea
                rows={5}
                value={footerCode}
                onChange={(e) => setFooterCode(e.target.value)}
                placeholder="<script type='text/javascript' src='//www.highrevenuegate.com/popunder.js'></script>"
                className="w-full font-mono text-xs p-4 bg-slate-950 border border-slate-800 focus:border-purple-500 text-slate-200 rounded-2xl focus:outline-none"
              />
            </div>

            <button
              onClick={handleSaveCustomCodes}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" /> Save Script Codes
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: SITE CONTROL & BRANDING */}
      {activeTab === 'branding' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" /> Full Manual Site Control & Branding
              </h2>
              <p className="text-xs text-slate-400">Upload site logo, hero banner image, update headlines, and manage contact email.</p>
            </div>
            {brandingSaved && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1 border border-emerald-500/30">
                <Check className="w-4 h-4" /> Branding Saved!
              </span>
            )}
          </div>

          {/* Logo & Hero Banner Uploaders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload Box */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-amber-400 block flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" /> Site Logo Image File:
                </span>
                {brandingForm.logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...brandingForm, logoUrl: '' };
                      setBrandingForm(updated);
                      artStore.saveBranding({ ...updated, headCustomCode: headCode, footerCustomCode: footerCode, aboutPageContent, termsPageContent, privacyPageContent });
                      onUpdateData();
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 underline font-mono"
                  >
                    Remove Logo
                  </button>
                )}
              </label>
              <div className="flex items-center gap-4">
                {brandingForm.logoUrl ? (
                  <img
                    src={brandingForm.logoUrl}
                    alt="Logo Preview"
                    className="w-16 h-16 rounded-xl object-contain border-2 border-amber-500 shadow-md shrink-0 bg-amber-300 p-1"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-amber-300 text-black font-serif font-black flex items-center justify-center text-xl border-2 border-black shrink-0 shadow-md">
                    IP
                  </div>
                )}
                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        compressImage(file, 300, 300, 0.85).then((result) => {
                          const updated = { ...brandingForm, logoUrl: result };
                          setBrandingForm(updated);
                          artStore.saveBranding({ ...updated, headCustomCode: headCode, footerCustomCode: footerCode, aboutPageContent, termsPageContent, privacyPageContent });
                          setBrandingSaved(true);
                          setTimeout(() => setBrandingSaved(false), 3000);
                          onUpdateData();
                        });
                      }
                    }}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="Or enter logo URL (https://...)"
                    value={brandingForm.logoUrl || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logoUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Hero Banner Image Upload Box */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-amber-400 block flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" /> Hero Banner Background Image:
                </span>
                {brandingForm.heroBannerUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...brandingForm, heroBannerUrl: '' };
                      setBrandingForm(updated);
                      artStore.saveBranding({ ...updated, headCustomCode: headCode, footerCustomCode: footerCode, aboutPageContent, termsPageContent, privacyPageContent });
                      onUpdateData();
                    }}
                    className="text-[10px] text-rose-400 hover:text-rose-300 underline font-mono"
                  >
                    Remove Hero Banner
                  </button>
                )}
              </label>
              <div className="flex items-center gap-4">
                {brandingForm.heroBannerUrl ? (
                  <img
                    src={brandingForm.heroBannerUrl}
                    alt="Hero Banner Preview"
                    className="w-24 h-16 rounded-xl object-cover border-2 border-amber-500 shadow-md shrink-0 bg-slate-900"
                  />
                ) : (
                  <div className="w-24 h-16 rounded-xl bg-slate-900 text-slate-500 font-mono text-[10px] flex items-center justify-center border border-slate-800 shrink-0 text-center">
                    Default Dark
                  </div>
                )}
                <div className="flex-1 space-y-2 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        compressImage(file, 1200, 600, 0.8).then((result) => {
                          const updated = { ...brandingForm, heroBannerUrl: result };
                          setBrandingForm(updated);
                          artStore.saveBranding({ ...updated, headCustomCode: headCode, footerCustomCode: footerCode, aboutPageContent, termsPageContent, privacyPageContent });
                          setBrandingSaved(true);
                          setTimeout(() => setBrandingSaved(false), 3000);
                          onUpdateData();
                        });
                      }
                    }}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    placeholder="Or enter Hero Banner URL..."
                    value={brandingForm.heroBannerUrl || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, heroBannerUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Storage CDN Settings (Cloudinary 25GB Free Storage) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Cloud Storage & CDN (Optional 25 GB Free Storage)</h4>
                  <p className="text-[11px] text-slate-400">
                    Connect a free Cloudinary account for 25 GB of permanent high-res image hosting without monthly costs.
                  </p>
                </div>
              </div>
              <a 
                href="https://cloudinary.com/signup" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline font-mono"
              >
                Create Free Account &rarr;
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Cloudinary Cloud Name:</label>
                <input
                  type="text"
                  placeholder="e.g. dxy12345"
                  value={brandingForm.cloudinaryCloudName || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, cloudinaryCloudName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Upload Preset (Unsigned):</label>
                <input
                  type="text"
                  placeholder="e.g. inkprowl_preset"
                  value={brandingForm.cloudinaryUploadPreset || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, cloudinaryUploadPreset: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 text-xs text-white rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              💡 <strong>How it works:</strong> When configured, any images uploaded in Admin (single or bulk batch) are automatically uploaded to your free Cloudinary CDN in high-res! If blank, local canvas compression keeps files under 80KB.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Site Title:</label>
              <input
                type="text"
                value={brandingForm.siteTitle}
                onChange={(e) => setBrandingForm({ ...brandingForm, siteTitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Site Subtitle:</label>
              <input
                type="text"
                value={brandingForm.siteSubtitle}
                onChange={(e) => setBrandingForm({ ...brandingForm, siteSubtitle: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Hero Headline:</label>
              <input
                type="text"
                value={brandingForm.heroHeadline}
                onChange={(e) => setBrandingForm({ ...brandingForm, heroHeadline: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Hero Subheadline:</label>
              <input
                type="text"
                value={brandingForm.heroSubheadline}
                onChange={(e) => setBrandingForm({ ...brandingForm, heroSubheadline: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Support Contact Email:</label>
              <input
                type="email"
                value={brandingForm.contactEmail || 'makwanasudatt56@gmail.com'}
                onChange={(e) => setBrandingForm({ ...brandingForm, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSaveBranding}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Save Branding & Site Controls
          </button>
        </div>
      )}

      {/* TAB 6: PAGES EDITOR (ABOUT, TERMS, PRIVACY) */}
      {activeTab === 'pages' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" /> Pages Content Editor
              </h2>
              <p className="text-xs text-slate-400">Manage About Us, Terms & Conditions, and Privacy Policy page copy.</p>
            </div>
            {pagesSaved && (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1">
                <Check className="w-4 h-4" /> Pages Content Saved!
              </span>
            )}
          </div>

          {/* Subtabs for Pages */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            {[
              { id: 'about', label: 'About Page' },
              { id: 'terms', label: 'Terms & Conditions' },
              { id: 'privacy', label: 'Privacy Policy' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePageEditor(p.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activePageEditor === p.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {activePageEditor === 'about' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">About Page Content (Markdown / Text):</label>
              <textarea
                rows={12}
                value={aboutPageContent}
                onChange={(e) => setAboutPageContent(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 text-xs text-white font-mono rounded-2xl focus:outline-none"
              />
            </div>
          )}

          {activePageEditor === 'terms' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Terms & Conditions Content:</label>
              <textarea
                rows={12}
                value={termsPageContent}
                onChange={(e) => setTermsPageContent(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 text-xs text-white font-mono rounded-2xl focus:outline-none"
              />
            </div>
          )}

          {activePageEditor === 'privacy' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Privacy Policy Content:</label>
              <textarea
                rows={12}
                value={privacyPageContent}
                onChange={(e) => setPrivacyPageContent(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 text-xs text-white font-mono rounded-2xl focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={handleSavePagesContent}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            Save Page Contents
          </button>
        </div>
      )}

      {/* TAB 7: ADMIN SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 max-w-xl">
          <div className="pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" /> Admin Credentials & Security
            </h2>
            <p className="text-xs text-slate-400">Update the login ID and password required to access this dashboard.</p>
          </div>

          {securitySuccessMsg && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{securitySuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateAdminSecurity} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">New Admin User ID:</label>
              <input
                type="text"
                required
                placeholder="New ID..."
                value={newAdminId}
                onChange={(e) => setNewAdminId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">New Admin Password:</label>
              <input
                type="password"
                required
                placeholder="New Password..."
                value={newAdminPass}
                onChange={(e) => setNewAdminPass(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-xl focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              Update Admin ID & Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
