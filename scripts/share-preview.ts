export type ArtworkSharePreview = {
  title: string;
  description: string;
  imageUrl: string;
  shareUrl: string;
  redirectUrl: string;
  imageType?: "image/gif";
};

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

/** Social crawlers reject whitespace-broken attribute URLs even though browsers often recover them. */
export const normalizePreviewImageUrl = (value: string | undefined) => (value ?? "").replace(/\s+/g, "");

export const renderArtworkSharePage = ({ title, description, imageUrl, shareUrl, redirectUrl, imageType }: ArtworkSharePreview) => {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImageUrl = escapeHtml(normalizePreviewImageUrl(imageUrl));
  const safeShareUrl = escapeHtml(shareUrl);
  const safeRedirectUrl = escapeHtml(redirectUrl);

  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${safeTitle}</title><meta name="description" content="${safeDescription}">
<link rel="canonical" href="${safeShareUrl}">
<meta property="og:type" content="website"><meta property="og:site_name" content="INKPROWL"><meta property="og:title" content="${safeTitle}"><meta property="og:description" content="${safeDescription}"><meta property="og:url" content="${safeShareUrl}"><meta property="og:image" content="${safeImageUrl}"><meta property="og:image:secure_url" content="${safeImageUrl}">${imageType ? `<meta property="og:image:type" content="${imageType}">` : ""}<meta property="og:image:alt" content="${safeTitle}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${safeTitle}"><meta name="twitter:description" content="${safeDescription}"><meta name="twitter:image" content="${safeImageUrl}">
</head><body><p>Opening <a href="${safeRedirectUrl}">${safeTitle}</a>…</p><script>window.setTimeout(() => window.location.replace(${JSON.stringify(redirectUrl)}), 800);</script></body></html>`;
};
