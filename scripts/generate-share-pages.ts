import fs from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { getArtworkShareUrl, getGifShareUrl, publishedArtworks, publishedGifs, siteBranding } from "../client/src/data/catalog";
import { getCloudinaryArtworkPreviewUrl, normalizePreviewImageUrl, renderArtworkSharePage } from "./share-preview";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputRoot = path.join(projectRoot, "client", "public", "art");
const gifOutputRoot = path.join(projectRoot, "client", "public", "gif");
const fallbackPreview = normalizePreviewImageUrl(publishedArtworks.find((artwork) => artwork.imageUrl)?.imageUrl) || normalizePreviewImageUrl(siteBranding.heroBannerUrl);

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.rmSync(gifOutputRoot, { recursive: true, force: true });

for (const artwork of publishedArtworks) {
  const shareUrl = getArtworkShareUrl(artwork.slug, artwork.publishedAt);
  const imageUrl = getCloudinaryArtworkPreviewUrl(artwork.imageUrl) || getCloudinaryArtworkPreviewUrl(siteBranding.heroBannerUrl) || getCloudinaryArtworkPreviewUrl(fallbackPreview);
  const title = `${artwork.title} — INKPROWL`;
  const description = `${artwork.description} Browse and download this free INKPROWL edition.`;
  const redirectUrl = `https://inkprowl.github.io/inkprowl/#/art/${artwork.slug}`;
  const destination = path.join(outputRoot, artwork.slug);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, "index.html"), renderArtworkSharePage({ title, description, imageUrl, shareUrl, redirectUrl, imageType: "image/jpeg" }), "utf8");
}

for (const gif of publishedGifs) {
  const shareUrl = getGifShareUrl(gif.slug);
  const imageUrl = normalizePreviewImageUrl(gif.imageUrl) || fallbackPreview;
  const title = `${gif.title} — INKPROWL animated GIF`;
  const description = `${gif.description} View, share, and download this original INKPROWL GIF edition.`;
  const redirectUrl = `https://inkprowl.github.io/inkprowl/#/gif/${gif.slug}`;
  const destination = path.join(gifOutputRoot, gif.slug);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, "index.html"), renderArtworkSharePage({ title, description, imageUrl, shareUrl, redirectUrl, imageType: "image/gif" }), "utf8");
}

console.log(`Generated ${publishedArtworks.length} artwork and ${publishedGifs.length} GIF INKPROWL social preview pages.`);
