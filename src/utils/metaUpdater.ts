/**
 * Utility to dynamically update meta tags (Open Graph & Twitter)
 * for social media previews (WhatsApp, Twitter, Facebook, Pinterest, Telegram).
 */
export function updateSocialMetaTags(data: {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
}) {
  const { title, description, imageUrl, url } = data;

  // Update Page Title
  document.title = title;

  // Helper function to update or create meta tag
  const setMeta = (propertyAttr: string, propertyVal: string, content: string) => {
    let element = document.querySelector(`meta[${propertyAttr}="${propertyVal}"]`);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(propertyAttr, propertyVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Open Graph
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  if (imageUrl) {
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:image:secure_url', imageUrl);
  }
  if (url) {
    setMeta('property', 'og:url', url);
  }

  // Twitter
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  if (imageUrl) {
    setMeta('name', 'twitter:image', imageUrl);
  }
  setMeta('name', 'twitter:card', 'summary_large_image');
}
