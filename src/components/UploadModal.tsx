import React, { useState, useRef } from 'react';
import { ArtItem, Category, Orientation } from '../types';
import { compressImage } from '../utils/imageCompressor';
import { X, Upload, Image as ImageIcon, Sparkles, Plus, Check, AlertCircle, Palette, FileText } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (item: ArtItem) => void;
  onNavigate?: (view: 'home' | '1to1' | 'admin' | 'about' | 'terms' | 'privacy' | 'contact') => void;
}

const CATEGORIES: Category[] = [
  'Digital Art',
  'Fantasy & Sci-Fi',
  'Anime & Manga',
  'Abstract',
  '3D Render',
  'Nature & Landscapes',
  'Cyberpunk',
  'Minimalist',
  'Oil Painting',
  'Wallpapers',
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  onNavigate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Digital Art');
  const [author, setAuthor] = useState('');
  const [license, setLicense] = useState('Free Commercial & Personal Use');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Art', 'Free Download', 'Wallpaper']);
  const [featured, setFeatured] = useState(false);

  // Image states
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [format, setFormat] = useState<'PNG' | 'JPG' | 'WebP'>('PNG');
  const [width, setWidth] = useState(3840);
  const [height, setHeight] = useState(2160);
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait' | 'square'>('landscape');
  const [palette, setPalette] = useState<string[]>(['#1E1B4B', '#3B82F6', '#EC4899']);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isAdmin = sessionStorage.getItem('inkpulp_admin_logged') === 'true';

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-[#FAF4E6] border-4 border-black text-black p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] space-y-5">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black text-white hover:bg-neutral-800 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 bg-amber-200 border-2 border-black flex items-center justify-center text-2xl mx-auto shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            🔒
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-serif font-black uppercase text-black">
              Admin Authorization Required
            </h3>
            <p className="text-xs font-serif text-neutral-800 leading-relaxed">
              Artwork publishing is restricted strictly to the site <strong>Administrator</strong>. Standard visitors can browse, favorite, and download free 4K vintage comic line art.
            </p>
          </div>

          <div className="p-3 bg-amber-100 border border-black text-[11px] font-mono text-black space-y-1">
            <p><strong>Admin Credentials Required:</strong></p>
            <p>Only authorized administrators can upload new image files to the gallery.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-white hover:bg-neutral-100 border-2 border-black font-mono font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              CLOSE
            </button>
            {onNavigate && (
              <button
                onClick={() => {
                  onClose();
                  onNavigate('admin');
                }}
                className="flex-1 py-2.5 bg-black hover:bg-neutral-800 text-amber-300 font-mono font-bold text-xs uppercase border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                ADMIN SIGN IN
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setErrorMsg('');
    setFileName(file.name);

    // Format & size
    const ext = file.name.split('.').pop()?.toUpperCase();
    if (ext === 'JPG' || ext === 'JPEG') setFormat('JPG');
    else if (ext === 'WEBP') setFormat('WebP');
    else setFormat('PNG');

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    setFileSize(`${sizeInMB} MB`);

    compressImage(file, 1000, 1000, 0.8).then((compressedResult) => {
      const result = compressedResult || '';
      setPreviewDataUrl(result);

      // Load Image object to extract dimensions and palette
      const img = new Image();
      img.onload = () => {
        const w = img.width || 3840;
        const h = img.height || 2160;
        setWidth(w);
        setHeight(h);

        // Aspect ratio
        const ratio = w / h;
        if (ratio > 1.1) setAspectRatio('landscape');
        else if (ratio < 0.9) setAspectRatio('portrait');
        else setAspectRatio('square');

        // Extract palette color accents
        extractColorsFromImage(img);
      };
      img.src = result;
    });
  };

  const extractColorsFromImage = (img: HTMLImageElement) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 50;
      canvas.height = 50;
      if (ctx) {
        ctx.drawImage(img, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;
        const colors: string[] = [];
        for (let i = 0; i < data.length; i += 200) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          if (!colors.includes(hex)) colors.push(hex);
        }
        if (colors.length >= 3) {
          setPalette(colors.slice(0, 4));
        }
      }
    } catch {
      // Ignore palette error fallback
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewDataUrl) {
      setErrorMsg('Please upload an art image before submitting.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter an artwork title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { uploadImageFile } = await import('../utils/cloudUploader');
      const uploadRes = await uploadImageFile(previewDataUrl);
      const finalUrl = uploadRes.imageUrl;

      const newArtData: Omit<ArtItem, 'id' | 'createdAt' | 'views' | 'downloads' | 'likes'> = {
        title: title.trim(),
        description: description.trim() || 'High resolution digital artwork uploaded for free download.',
        category,
        tags: tags.length > 0 ? tags : [category, 'Free Download'],
        width,
        height,
        aspectRatio,
        format,
        fileSize: fileSize || '10 MB',
        author: author.trim() || 'Community Creator',
        license,
        imageUrl: finalUrl,
        highResUrl: finalUrl,
        palette,
        featured,
        isUserUploaded: true,
      };

      const { artStore } = await import('../services/artStore');
      const created = artStore.addArtwork(newArtData);
      onUploadSuccess(created);
      onClose();
    } catch (err) {
      console.error('Upload submission error:', err);
      setErrorMsg('Failed to process image upload. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Manual Art Upload</h2>
              <p className="text-xs text-slate-400">
                Add new high-res artwork to your gallery for visitors to download for free.
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

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Image Upload & Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Artwork File or CDN URL
                </label>
                <span className="text-[10px] text-indigo-400 font-mono">File upload or Direct CDN Link</span>
              </div>

              {/* Direct Image URL input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste direct Image URL (e.g. Cloudflare R2, Supabase Storage, ImgBB)..."
                  value={previewDataUrl.startsWith('data:') ? '' : previewDataUrl}
                  onChange={(e) => {
                    const url = e.target.value.trim();
                    if (url) {
                      setPreviewDataUrl(url);
                      const img = new Image();
                      img.crossOrigin = 'anonymous';
                      img.onload = () => {
                        setWidth(img.naturalWidth || 1000);
                        setHeight(img.naturalHeight || 1000);
                        const ratioStr = `${img.naturalWidth}:${img.naturalHeight}`;
                        setAspectRatio(ratioStr);
                      };
                      img.src = url;
                    } else {
                      setPreviewDataUrl('');
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileProcess(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer min-h-[260px] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-4 text-center overflow-hidden ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : previewDataUrl
                    ? 'border-indigo-500/40 bg-slate-950'
                    : 'border-slate-700 bg-slate-950/60 hover:border-slate-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {previewDataUrl ? (
                  <div className="relative w-full h-full flex flex-col items-center">
                    <img
                      src={previewDataUrl}
                      alt="Artwork Preview"
                      className="max-h-56 object-contain rounded-xl shadow-md border border-slate-800"
                    />
                    <div className="mt-3 flex items-center gap-2 text-xs text-indigo-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                      <Check className="w-3.5 h-3.5" /> Image Loaded ({width}x{height} • {format} • {fileSize})
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Click to upload or drag & drop artwork
                      </p>
                      <p className="text-xs text-slate-400 mt-1">High resolution PNG, JPG, or WebP up to 50MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Color Palette Display */}
              {palette.length > 0 && (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                    <Palette className="w-4 h-4 text-indigo-400" /> Extracted Color Palette:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {palette.map((color, idx) => (
                      <div
                        key={idx}
                        style={{ backgroundColor: color }}
                        title={color}
                        className="w-6 h-6 rounded-full border border-white/20 shadow-sm transform hover:scale-110 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Metadata Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Artwork Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Neon Cyber Dream 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Artist / Creator</label>
                  <input
                    type="text"
                    placeholder="e.g. Studio Alex"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description / Prompt</label>
                <textarea
                  rows={3}
                  placeholder="Describe the artwork or prompt used..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tags (Press Enter)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Download License</label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Free Commercial & Personal Use">Free Commercial & Personal Use</option>
                  <option value="Free Public Domain (CC0)">Free Public Domain (CC0)</option>
                  <option value="Free for Personal Wallpaper Use">Free for Personal Wallpaper Use</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500"
                />
                <label htmlFor="featured-check" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Feature this artwork on top showcase hero
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Upload...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Artwork to Gallery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
