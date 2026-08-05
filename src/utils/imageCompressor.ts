/**
 * Compress images (base64 or File) using HTML5 Canvas to ensure 
 * base64 strings stay small enough for localStorage (<100KB per image).
 */
export async function compressImage(
  input: string | File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const processImage = (img: HTMLImageElement) => {
      let width = img.naturalWidth || img.width || 800;
      let height = img.naturalHeight || img.height || 800;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof input === 'string' ? input : '');
        return;
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export compressed image
      try {
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } catch {
        resolve(typeof input === 'string' ? input : '');
      }
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onerror = () => {
      resolve(typeof input === 'string' ? input : '');
    };

    if (typeof input === 'string') {
      img.src = input;
      if (img.complete) {
        processImage(img);
      } else {
        img.onload = () => processImage(img);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl) {
          resolve('');
          return;
        }
        img.src = dataUrl;
        img.onload = () => processImage(img);
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(input);
    }
  });
}
