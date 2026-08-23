import fs from "node:fs";
import fs from "node:fs";
import path from "node:path";
import { getArtworkShareUrl, publishedArtworks, siteBranding } from "../client/src/data/catalog";
import { normalizePreviewImageUrl, renderArtworkSharePage } from "./share-preview";

const projectRoot = path.resolve(import.meta.dirname, "..");
const outputRoot = path.join(projectRoot, "client", "public", "art");
const fallbackPreview = normalizePreviewImageUrl(publishedArtworks.find((artwork) => artwork.imageUrl)?.imageUrl) || normalizePreviewImageUrl(siteBranding.heroBannerUrl);

fs.rmSync(outputRoot, { recursive: true, force: true });

for (const artwork of publishedArtworks) {
  const shareUrl = getArtworkShareUrl(artwork.slug);
  const imageUrl = normalizePreviewImageUrl(artwork.imageUrl) || normalizePreviewImageUrl(siteBranding.heroBannerUrl) || fallbackPreview;
  const title = `${artwork.title} — INKPROWL`;
  const description = `${artwork.description} Browse and download this free INKPROWL edition.`;
  const redirectUrl = `https://inkprowl.github.io/inkprowl/#/art/${artwork.slug}`;
  const destination = path.join(outputRoot, artwork.slug);
  fs.mkdirSync(destination, { recursive: true });
  fs.writeFileSync(path.join(destination, "index.html"), renderArtworkSharePage({ title, description, imageUrl, shareUrl, redirectUrl }), "utf8");
}

console.log(`Generated ${publishedArtworks.length} INKPROWL social preview pages.`);
