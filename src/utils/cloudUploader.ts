import { artStore } from '../services/artStore';
import { compressImage } from './imageCompressor';

/**
 * Uploads a file to Cloud Storage (Cloudinary free 25GB CDN if configured in Admin)
 * or compresses it for safe local storage fallback.
 */
export async function uploadImageFile(file: File | string): Promise<{ imageUrl: string; isCloud: boolean }> {
  const branding = artStore.getBranding();
  const cloudName = branding.cloudinaryCloudName?.trim();
  const uploadPreset = branding.cloudinaryUploadPreset?.trim();

  // If file is already an external HTTP URL
  if (typeof file === 'string' && file.startsWith('http')) {
    return { imageUrl: file, isCloud: true };
  }

  // If Cloudinary is configured, upload directly to Cloudinary
  if (cloudName && uploadPreset) {
    try {
      const formData = new FormData();
      if (typeof file === 'string') {
        formData.append('file', file);
      } else {
        formData.append('file', file);
      }
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.secure_url) {
          return { imageUrl: data.secure_url, isCloud: true };
        }
      } else {
        console.warn('Cloudinary upload failed, falling back to compressed local storage.');
      }
    } catch (err) {
      console.warn('Cloudinary upload error:', err);
    }
  }

  // Fallback: compress image to safe local base64
  const compressed = await compressImage(file, 1000, 1000, 0.8);
  return { imageUrl: compressed, isCloud: false };
}
