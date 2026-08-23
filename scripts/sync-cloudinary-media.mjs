import fs from "node:fs";
import path from "node:path";
import { classifyIncomingFile } from "./cloudinary-filename-policy.ts";
import { removeCatalogueAssetState } from "./cloudinary-catalogue-state.ts";
import { reconcileMissingCloudinaryAssets } from "./cloudinary-reconciliation.ts";

const projectRoot = path.resolve(import.meta.dirname, "..");
const incomingRoot = path.join(projectRoot, "incoming");
const cataloguePath = path.join(projectRoot, "client", "src", "data", "generated-catalog.json");
const operation = process.argv[2] ?? "sync";
const requestedAssetKeys = String(process.argv[3] ?? "").split(/[\n,]+/).map((key) => key.trim()).filter(Boolean);

const rawCloudinaryUrl = (process.env.CLOUDINARY_URL ?? "").trim();
const cloudinaryUrl = rawCloudinaryUrl.replace(/^CLOUDINARY_URL\s*=\s*/i, "");

if (!cloudinaryUrl || /<your_api_key>|<your_api_secret>|cloud_name/i.test(cloudinaryUrl)) {
  throw new Error("CLOUDINARY_URL is empty or still uses a placeholder. Save the real Cloudinary API Environment Variable as a repository Actions secret.");
}

let cloudinaryCredentials;
try {
  cloudinaryCredentials = new URL(cloudinaryUrl);
} catch {
  throw new Error("CLOUDINARY_URL must use the Cloudinary API Environment Variable format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME");
}

if (cloudinaryCredentials.protocol !== "cloudinary:" || !cloudinaryCredentials.username || !cloudinaryCredentials.password || !cloudinaryCredentials.hostname) {
  throw new Error("CLOUDINARY_URL must include an API key, API secret, and cloud name in the Cloudinary API Environment Variable format.");
}

process.env.CLOUDINARY_URL = cloudinaryUrl;
const { v2: cloudinary } = await import("cloudinary");

cloudinary.config({
  cloud_name: cloudinaryCredentials.hostname,
  api_key: decodeURIComponent(cloudinaryCredentials.username),
  api_secret: decodeURIComponent(cloudinaryCredentials.password),
  secure: true,
});

const readCatalogue = () => JSON.parse(fs.readFileSync(cataloguePath, "utf8"));
const writeCatalogue = (catalogue) => fs.writeFileSync(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`);

const allFiles = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const entryPath = path.join(directory, entry.name);
  if (entry.isDirectory()) return allFiles(entryPath);
  return entry.name === ".gitkeep" ? [] : [entryPath];
});

const assetRecord = (result) => ({
  publicId: result.public_id,
  resourceType: result.resource_type,
  deliveryUrl: result.secure_url,
});

const queuePublicId = (file, asset) => {
  const queueId = path.basename(path.dirname(file));
  const suffix = asset.kind === "artwork" || asset.kind === "edition-video" ? asset.slug : asset.kind;
  return `inkprowl/${queueId}/${suffix}`;
};

async function findExistingQueuedAsset(publicId) {
  for (const resourceType of ["image", "video"]) {
    try {
      return await cloudinary.api.resource(publicId, { resource_type: resourceType });
    } catch (error) {
      const status = error?.http_code ?? error?.error?.http_code;
      if (status !== 404) throw new Error(`Cloudinary asset lookup failed for ${publicId} (${status ?? "unknown status"}).`);
    }
  }
  return undefined;
}

async function cloudinaryResourceExists(asset) {
  try {
    await cloudinary.api.resource(asset.publicId, { resource_type: asset.resourceType });
    return true;
  } catch (error) {
    const status = error?.http_code ?? error?.error?.http_code;
    if (status === 404) return false;
    throw new Error(`Cloudinary reconciliation lookup failed for ${asset.publicId} (${status ?? "unknown status"}).`);
  }
}

async function uploadQueuedFile(file, asset) {
  const publicId = queuePublicId(file, asset);
  const existing = await findExistingQueuedAsset(publicId);
  if (existing) return existing;
  return cloudinary.uploader.upload(file, {
    resource_type: "auto",
    public_id: publicId,
    unique_filename: false,
    overwrite: false,
  });
}

function applyUpload(catalogue, asset, result) {
  const record = assetRecord(result);
  catalogue.assets ??= {};
  catalogue.artworks ??= [];
  catalogue.artworkOverrides ??= {};
  catalogue.artworkMedia ??= {};
  catalogue.siteMedia ??= {};
  catalogue.siteBranding ??= {};
  catalogue.sponsoredCampaign ??= {};
  catalogue.advertisingSettings ??= {};
  catalogue.categories ??= [];
  catalogue.categoryAliases ??= {};

  if (asset.kind === "artwork") {
    if (catalogue.artworks.some((artwork) => artwork.slug === asset.slug)) throw new Error(`A generated artwork already uses the slug ${asset.slug}. Choose a different filename or remove the old artwork first.`);
    const assetKey = `artwork:${asset.slug}`;
    catalogue.artworks.unshift({
      slug: asset.slug,
      title: asset.title,
      category: asset.category,
      description: `An INKPROWL ${asset.category.toLowerCase()} artwork featuring ${asset.title}, created in a vintage editorial line-art style.`,
      isPremium: false,
      accent: "gold",
      imageUrl: record.deliveryUrl,
      orientation: "square",
      tags: asset.tags,
      downloadFormats: ["jpg", "png", "webp"],
      assetKey,
      publishedAt: new Date().toISOString(),
    });
    catalogue.assets[assetKey] = record;
    return;
  }

  const key = asset.kind === "soundtrack" ? "siteMedia:soundtrack"
    : asset.kind === "hero-film" ? "siteMedia:heroFilm"
    : asset.kind === "hero-banner" ? "siteBranding:heroBanner"
    : asset.kind === "logo" ? "siteBranding:logo"
    : asset.kind === "sponsor-video" ? "sponsoredCampaign:video"
    : `artworkVideo:${asset.slug}`;
  catalogue.assets[key] = record;

  if (asset.kind === "soundtrack") Object.assign(catalogue.siteMedia, { soundtrackUrl: record.deliveryUrl, soundtrackTitle: asset.title });
  if (asset.kind === "hero-film") catalogue.siteMedia.heroFilmUrl = record.deliveryUrl;
  if (asset.kind === "hero-banner") catalogue.siteBranding.heroBannerUrl = record.deliveryUrl;
  if (asset.kind === "logo") catalogue.siteBranding.logoUrl = record.deliveryUrl;
  if (asset.kind === "sponsor-video") Object.assign(catalogue.sponsoredCampaign, { enabled: true, clientName: asset.clientName, videoUrl: record.deliveryUrl });
  if (asset.kind === "edition-video") Object.assign(catalogue.artworkMedia, { [asset.slug]: { ...(catalogue.artworkMedia[asset.slug] ?? {}), videoUrl: record.deliveryUrl } });
}

function refreshGeneratedArtworkDescriptions(catalogue) {
  let changed = false;
  for (const artwork of catalogue.artworks ?? []) {
    const description = typeof artwork.description === "string" ? artwork.description : "";
    const generatedOperationalCopy = description.includes("published from the owner upload queue") || description.includes("permanent Cloudinary storage");
    if (!generatedOperationalCopy) continue;
    artwork.description = `An INKPROWL ${(artwork.category ?? "art").toLowerCase()} artwork featuring ${artwork.title}, created in a vintage editorial line-art style.`;
    changed = true;
  }
  return changed;
}

function removeAsset(catalogue, key) {
  const asset = catalogue.assets?.[key];
  if (!asset) throw new Error(`No managed Cloudinary asset uses the key ${key}. Open generated-catalog.json to copy an available asset key.`);
  return cloudinary.uploader.destroy(asset.publicId, { resource_type: asset.resourceType, invalidate: true }).then(() => {
    removeCatalogueAssetState(catalogue, key);
  });
}

async function removeAssets(catalogue, keys) {
  const uniqueKeys = [...new Set(keys)];
  if (!uniqueKeys.length) throw new Error("Provide at least one managed asset key when running a delete operation.");
  const missingKeys = uniqueKeys.filter((key) => !catalogue.assets?.[key]);
  if (missingKeys.length) throw new Error(`No managed Cloudinary asset uses: ${missingKeys.join(", ")}. No deletion was started.`);
  for (const key of uniqueKeys) await removeAsset(catalogue, key);
  return uniqueKeys;
}

async function main() {
  const catalogue = readCatalogue();
  const descriptionsRefreshed = refreshGeneratedArtworkDescriptions(catalogue);
  if (operation === "delete") {
    if (requestedAssetKeys.length !== 1) throw new Error("Provide exactly one asset key when running the delete operation.");
    const [requestedAssetKey] = await removeAssets(catalogue, requestedAssetKeys);
    writeCatalogue(catalogue);
    console.log(`Deleted Cloudinary asset ${requestedAssetKey} and updated the generated catalogue.`);
    return;
  }

  if (operation === "bulk-delete") {
    const deletedKeys = await removeAssets(catalogue, requestedAssetKeys);
    writeCatalogue(catalogue);
    console.log(`Deleted ${deletedKeys.length} Cloudinary asset(s) and updated the generated catalogue.`);
    return;
  }

  if (operation !== "sync" && operation !== "reconcile") throw new Error(`Unsupported operation: ${operation}`);
  const removedKeys = await reconcileMissingCloudinaryAssets(catalogue, cloudinaryResourceExists);
  for (const key of removedKeys) console.log(`Removed stale catalogue record for missing Cloudinary asset ${key}.`);
  if (operation === "reconcile") {
    if (removedKeys.length || descriptionsRefreshed) writeCatalogue(catalogue);
    console.log(removedKeys.length ? `Reconciled ${removedKeys.length} missing Cloudinary asset(s).` : "No stale managed Cloudinary assets found.");
    return;
  }
  const files = allFiles(incomingRoot);
  if (!files.length) {
    if (removedKeys.length || descriptionsRefreshed) writeCatalogue(catalogue);
    console.log("No incoming media files found.");
    return;
  }

  for (const file of files) {
    const asset = classifyIncomingFile(path.basename(file));
    const result = await uploadQueuedFile(file, asset);
    applyUpload(catalogue, asset, result);
    fs.rmSync(file);
    console.log(`Uploaded ${path.basename(file)} as ${result.public_id}.`);
  }
  writeCatalogue(catalogue);
}

await main();
