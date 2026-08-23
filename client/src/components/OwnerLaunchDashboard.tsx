import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Film, ImagePlus, LoaderCircle, LogOut, Music2, Pencil, Plus, Save, Tags, Trash2, UploadCloud, XCircle } from "lucide-react";
import { artworks, categories, siteBranding } from "@/data/catalog";
import { GENERATED_CATALOGUE_PATH, type ManagedCloudinaryAsset, type OwnerGeneratedCatalogue, dispatchCloudinaryBulkDeletion, dispatchCloudinaryDeletion, mutateGeneratedCatalogue, normalizeOwnerCatalogue, queueIncomingFile, readRepositoryJson, recentGeneratedCatalogueRevision } from "@/lib/githubOwnerSession";
import { artworkDescription, artworkTags, createArtworkUploadDraft, type ArtworkUploadDraft, titleFromArtworkFilename, updateArtworkUploadDraft } from "@/lib/artworkUploadDrafts";
import { applyCategoryOperation, categoryOperationValidationMessage, resolvedCategoryNames } from "@/lib/ownerCatalogueOps";
import { authorizationPendingStatus, catalogueSavedStatus, cloudinaryBulkDeletionQueuedStatus, cloudinaryDeletionQueuedStatus, deletionFailureStatus, initialOwnerPublishStatus, type OwnerPublishStatus, preparingArtworkDeletionStatus, preparingBulkArtworkDeletionStatus, publishFailureStatus, publishHandoffStatus, queuedForCloudinaryStatus, requestingCloudinaryDeletionStatus, savingArtworkMetadataStatus, savingCatalogueStatus, uploadToQueueStatus } from "@/lib/ownerPublishingStatus";
import { ownerUploadAccept, type OwnerUploadRole, validateOwnerUploadFiles } from "@/lib/ownerUploadRules";
import { ownerUploadFailureMessage } from "@/lib/ownerUploadFailure";
import "./ownerPublishStatus.css";

type OwnerConnection = { token: string; identity: { login: string } };
type PublishRole = OwnerUploadRole;
type OwnerWorkspace = "home" | "artwork" | "song" | "video" | "logo" | "banner" | "inventory" | "categories";
const workspaceCopy: Record<Exclude<OwnerWorkspace, "home">, { eyebrow: string; title: string; description: string }> = {
  artwork: { eyebrow: "ARTWORK UPLOAD", title: "Publish artwork images.", description: "Select images, edit each filename-derived listing, then publish them to the protected Cloudinary workflow." },
  song: { eyebrow: "MUSIC UPLOAD", title: "Publish a soundtrack.", description: "Select one supported song file and give the floating player its public title." },
  video: { eyebrow: "SPONSOR VIDEO", title: "Publish a campaign film.", description: "Select one supported landscape video. Cloudinary processes the film after the secure queue finishes." },
  logo: { eyebrow: "LOGO UPLOAD", title: "Publish the INKPROWL logo.", description: "Select a supported logo image and publish it to permanent Cloudinary delivery." },
  banner: { eyebrow: "HERO BANNER UPLOAD", title: "Publish the homepage banner.", description: "Select a supported banner image and publish it to permanent Cloudinary delivery." },
  inventory: { eyebrow: "ARTWORK INVENTORY", title: "Edit published editions.", description: "Choose an edition to change its public metadata, visibility, or permanent Cloudinary file." },
  categories: { eyebrow: "CATEGORIES & ASSETS", title: "Organise the archive.", description: "Add, rename, or remove public categories and manage the permanent Cloudinary asset list." },
};
type InventoryArtwork = { slug: string; title: string; description: string; category: string; tags: string[]; imageUrl: string };
type ArtworkFileDraft = ArtworkUploadDraft & { file: File };
type PendingPublish = { role: PublishRole; files: File[]; title: string; category: string; description?: string; tags?: string[]; artist?: string; artworkDrafts?: ArtworkFileDraft[] };
type PendingMutation = { message: string; success: string; mutate: (next: OwnerGeneratedCatalogue) => void };
type PendingDeletion = { assetKey?: string; artwork?: InventoryArtwork; artworks?: InventoryArtwork[] };

function titleFromFilename(filename: string) {
  return titleFromArtworkFilename(filename);
}

function descriptionFromFilename(title: string, category: string) {
  return artworkDescription(title, category);
}

function tagsFromFilename(title: string, category: string) {
  return artworkTags(title, category).split(", ").filter(Boolean);
}

function cloudinaryAssetFromDeliveryUrl(url: string): ManagedCloudinaryAsset | null {
  try {
    const parsed = new URL(url);
    const marker = "/upload/";
    const resourceType = parsed.pathname.includes("/video/upload/") ? "video" : parsed.pathname.includes("/image/upload/") ? "image" : null;
    const tail = parsed.pathname.split(marker)[1];
    if (!resourceType || !tail) return null;
    const segments = tail.split("/");
    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    const publicPath = (versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments).join("/").replace(/\.[^.]+$/, "");
    return publicPath ? { publicId: decodeURIComponent(publicPath), resourceType, deliveryUrl: url } : null;
  } catch { return null; }
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fileExtension(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? extension : "";
}

function filenameFor(role: PublishRole, file: File, title: string, category: string) {
  const extension = fileExtension(file.name);
  if (!extension) throw new Error(`${file.name} needs a valid file extension.`);
  const recordTitle = slug(title || titleFromFilename(file.name));
  if (!recordTitle) throw new Error("Enter a title before publishing.");
  if (role === "artwork") return `art--${slug(category)}--${recordTitle}.${extension}`;
  if (role === "soundtrack") return `song--${recordTitle}.${extension}`;
  if (role === "sponsor-video") return `sponsor-video--${recordTitle}.${extension}`;
  if (role === "logo") return `logo--${recordTitle}.${extension}`;
  return `hero-banner--${recordTitle}.${extension}`;
}

function BulkArtworkDeletionPanel({ visible, artworks, selectedSlugs, busy, onToggle, onSelectAll, onClear, onDelete }: { visible: boolean; artworks: InventoryArtwork[]; selectedSlugs: readonly string[]; busy: boolean; onToggle: (slug: string) => void; onSelectAll: () => void; onClear: () => void; onDelete: () => void }) {
  if (!visible) return null;
  const selected = new Set(selectedSlugs);
  return <section className="owner-bulk-delete-panel" aria-labelledby="bulk-delete-title"><div className="owner-card-title"><div><span className="eyebrow">BULK PERMANENT REMOVAL</span><h4 id="bulk-delete-title">Select editions to delete</h4><p>Selected images are hidden from the public catalogue first, then the protected workflow removes their managed Cloudinary files together.</p></div><span>{selected.size} selected</span></div><div className="owner-bulk-delete-actions"><button type="button" className="admin-secondary-action" onClick={onSelectAll} disabled={!artworks.length || busy}>Select all</button><button type="button" className="admin-secondary-action" onClick={onClear} disabled={!selected.size || busy}>Clear selection</button></div><div className="owner-bulk-artwork-list">{artworks.map((artwork) => <label key={artwork.slug}><input type="checkbox" checked={selected.has(artwork.slug)} disabled={busy} onChange={() => onToggle(artwork.slug)} /><img src={artwork.imageUrl} alt="" /><span><strong>{artwork.title}</strong><small>{artwork.category}</small></span></label>)}</div><button type="button" className="admin-danger-action owner-bulk-delete-submit" disabled={!selected.size || busy} onClick={onDelete}><Trash2 size={16} /> {busy ? "Deletion in progress…" : `Delete ${selected.size} selected image${selected.size === 1 ? "" : "s"} permanently`}</button><p className="owner-delete-note">This cannot be undone. The public gallery is hidden immediately; the Cloudinary deletion and Pages refresh run in the protected workflow.</p></section>;
}

export function OwnerLaunchDashboard({ connection, requestAuthorization, onLogout, onOpenAdvanced }: { connection: OwnerConnection | null; requestAuthorization: () => void; onLogout: () => void; onOpenAdvanced: (panel: "video" | "brand" | "ads") => void }) {
  const [catalogue, setCatalogue] = useState<OwnerGeneratedCatalogue | null>(null);
  const [artworkFiles, setArtworkFiles] = useState<File[]>([]);
  const [artworkDrafts, setArtworkDrafts] = useState<ArtworkFileDraft[]>([]);
  const [songFile, setSongFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [heroBannerFile, setHeroBannerFile] = useState<File | null>(null);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [artworkDescription, setArtworkDescription] = useState("");
  const [artworkTags, setArtworkTags] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("INKPROWL");
  const [videoTitle, setVideoTitle] = useState("");
  const [logoTitle, setLogoTitle] = useState("");
  const [heroBannerTitle, setHeroBannerTitle] = useState("");
  const [heroFeaturedLabel, setHeroFeaturedLabel] = useState(siteBranding.heroFeaturedLabel ?? "01 — FEATURED EDITION");
  const [heroFeaturedTitle, setHeroFeaturedTitle] = useState(siteBranding.heroFeaturedTitle ?? "");
  const [artworkCategory, setArtworkCategory] = useState(categories[0]?.name ?? "Business Animals");
  const [status, setStatus] = useState<OwnerPublishStatus>(initialOwnerPublishStatus);
  const [pendingPublish, setPendingPublish] = useState<PendingPublish | null>(null);
  const [pendingMutation, setPendingMutation] = useState<PendingMutation | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
  const [selectedSlug, setSelectedSlug] = useState(artworks[0]?.slug ?? "");
  const [bulkArtworkSlugs, setBulkArtworkSlugs] = useState<string[]>([]);
  const artworkInventory = useMemo<InventoryArtwork[]>(() => {
    const items = new Map<string, InventoryArtwork>(artworks.map((artwork) => [artwork.slug, { slug: artwork.slug, title: artwork.title, description: artwork.description, category: artwork.category, tags: artwork.tags, imageUrl: artwork.imageUrl ?? "" }]));
    for (const record of catalogue?.artworks ?? []) {
      const slugValue = typeof record.slug === "string" ? record.slug : "";
      const imageUrl = typeof record.imageUrl === "string" ? record.imageUrl : "";
      if (!slugValue || !imageUrl) continue;
      items.set(slugValue, {
        slug: slugValue,
        title: typeof record.title === "string" ? record.title : titleFromFilename(slugValue),
        description: typeof record.description === "string" ? record.description : "Cloudinary-synced INKPROWL edition.",
        category: typeof record.category === "string" ? record.category : categories[0]?.name ?? "Uncategorized",
        tags: Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === "string") : [],
        imageUrl,
      });
    }
    return Array.from(items.values());
  }, [catalogue]);
  const selectedArtwork = artworkInventory.find((artwork) => artwork.slug === selectedSlug) ?? artworkInventory[0];
  const selectedBulkArtworks = artworkInventory.filter((artwork) => bulkArtworkSlugs.includes(artwork.slug));
  const [editTitle, setEditTitle] = useState(selectedArtwork?.title ?? "");
  const [editDescription, setEditDescription] = useState(selectedArtwork?.description ?? "");
  const [editCategory, setEditCategory] = useState(selectedArtwork?.category ?? categories[0]?.name ?? "Business Animals");
  const [editTags, setEditTags] = useState(selectedArtwork?.tags.join(", ") ?? "");
  const [categoryMode, setCategoryMode] = useState<"add" | "rename" | "retire">("add");
  const [categorySource, setCategorySource] = useState(categories[0]?.name ?? "Business Animals");
  const [categoryLabel, setCategoryLabel] = useState("");
  const [workspace, setWorkspace] = useState<OwnerWorkspace>("home");

  const categoryNames = useMemo(() => resolvedCategoryNames(categories.map((category) => category.name), catalogue ?? normalizeOwnerCatalogue({})), [catalogue]);
  const managedAssets = useMemo(() => Object.entries(catalogue?.assets ?? {}), [catalogue]);
  const selectedArtworkIsPublished = catalogue?.artworkOverrides[selectedArtwork?.slug ?? ""]?.isPublished !== false;
  const selectedArtworkAssetKey = selectedArtwork ? `artwork:${selectedArtwork.slug}` : "";

  useEffect(() => {
    if (!selectedArtwork) return;
    const override = catalogue?.artworkOverrides[selectedArtwork.slug] ?? {};
    setEditTitle(String(override.title ?? selectedArtwork.title));
    setEditDescription(String(override.description ?? selectedArtwork.description));
    setEditCategory(String(override.category ?? selectedArtwork.category));
    setEditTags(Array.isArray(override.tags) ? override.tags.join(", ") : selectedArtwork.tags.join(", "));
  }, [selectedArtwork?.slug, catalogue]);

  useEffect(() => {
    setBulkArtworkSlugs((current) => current.filter((slugValue) => artworkInventory.some((artwork) => artwork.slug === slugValue)));
  }, [artworkInventory]);

  useEffect(() => {
    setHeroFeaturedLabel(String(catalogue?.siteBranding?.heroFeaturedLabel ?? siteBranding.heroFeaturedLabel ?? "01 — FEATURED EDITION"));
    setHeroFeaturedTitle(String(catalogue?.siteBranding?.heroFeaturedTitle ?? siteBranding.heroFeaturedTitle ?? ""));
  }, [catalogue]);

  useEffect(() => {
    if (songFile) return;
    setSongArtist(String(catalogue?.siteMedia?.soundtrackArtist ?? "INKPROWL"));
  }, [catalogue, songFile]);

  useEffect(() => {
    if (!connection) return;
    void readRepositoryJson<Partial<OwnerGeneratedCatalogue>>(connection.token, GENERATED_CATALOGUE_PATH)
      .then((document) => setCatalogue(normalizeOwnerCatalogue(document.value)))
      .catch((reason) => setStatus({ percent: 0, tone: "error", message: reason instanceof Error ? reason.message : "Could not load the current owner catalogue." }));
  }, [connection]);

  async function saveCatalogueMutation({ message, success, mutate }: PendingMutation, activeConnection: OwnerConnection) {
    try {
      setStatus(savingCatalogueStatus());
      const next = await mutateGeneratedCatalogue(activeConnection.token, message, mutate);
      setCatalogue(next);
      setStatus(catalogueSavedStatus(success, recentGeneratedCatalogueRevision(activeConnection.token, message)));
    } catch (reason) {
      setStatus(publishFailureStatus(reason instanceof Error ? reason.message : "The permanent catalogue change could not be saved."));
    }
  }

  async function mutateCatalogue(message: string, success: string, mutate: (next: OwnerGeneratedCatalogue) => void) {
    const nextMutation = { message, success, mutate };
    if (!connection) {
      setPendingMutation(() => nextMutation);
      setStatus(authorizationPendingStatus("save"));
      requestAuthorization();
      return;
    }
    await saveCatalogueMutation(nextMutation, connection);
  }

  function saveCategoryAction() {
    const currentCatalogue = catalogue ?? normalizeOwnerCatalogue({});
    const baseCategoryNames = categories.map((category) => category.name);
    const liveCategoryNames = resolvedCategoryNames(baseCategoryNames, currentCatalogue);
    const validation = categoryOperationValidationMessage(currentCatalogue, liveCategoryNames, categoryMode, categorySource, categoryLabel);
    if (validation) {
      setStatus(publishFailureStatus(validation));
      return;
    }
    void mutateCatalogue("chore: update INKPROWL categories", categoryMode === "add" ? "Category added." : categoryMode === "rename" ? "Category renamed." : "Category deleted and editions moved.", (next) => {
      applyCategoryOperation(next, liveCategoryNames, categoryMode, categorySource, categoryLabel);
    });
  }

  function saveHeroCaption() {
    const featuredLabel = heroFeaturedLabel.trim() || "01 — FEATURED EDITION";
    const featuredTitle = heroFeaturedTitle.trim();
    void mutateCatalogue("chore: update INKPROWL hero banner caption", "Hero banner caption saved.", (next) => {
      next.siteBranding = {
        ...(next.siteBranding ?? {}),
        heroFeaturedLabel: featuredLabel,
        heroFeaturedTitle: featuredTitle,
      };
    });
  }

  function publishValidationMessage(role: PublishRole, files: File[]) { return validateOwnerUploadFiles(role, files); }

  async function queuePublish(payload: PendingPublish, activeConnection: OwnerConnection) {
    const { role, files, title, category, description, tags, artist, artworkDrafts } = payload;
    try {
      setStatus(publishHandoffStatus());
      if (role === "soundtrack") {
        const soundtrackTitle = title.trim() || titleFromFilename(files[0]?.name ?? "") || "Curated sound";
        setStatus(savingCatalogueStatus());
        const next = await mutateGeneratedCatalogue(activeConnection.token, "chore: save INKPROWL soundtrack metadata", (catalogue) => {
          catalogue.siteMedia = {
            ...(catalogue.siteMedia ?? {}),
            soundtrackTitle,
            soundtrackArtist: artist?.trim() || "INKPROWL",
          };
        });
        setCatalogue(next);
      }
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]!;
        const draft = role === "artwork" ? artworkDrafts?.[index] : undefined;
        const derivedTitle = draft?.title || (files.length === 1 ? title : titleFromFilename(file.name));
        const fileCategory = draft?.category || category;
        const incomingFilename = filenameFor(role, file, derivedTitle, fileCategory);
        setStatus(uploadToQueueStatus(file.name, index, files.length));
        await queueIncomingFile(activeConnection.token, incomingFilename, file);
      }
      if (role === "artwork") {
        setStatus(savingArtworkMetadataStatus());
        const next = await mutateGeneratedCatalogue(activeConnection.token, "chore: save INKPROWL artwork upload metadata", (catalogue) => {
          for (let index = 0; index < files.length; index += 1) {
            const file = files[index]!;
            const draft = artworkDrafts?.[index];
            const derivedTitle = draft?.title || (files.length === 1 ? title : titleFromFilename(file.name));
            const derivedDescription = draft?.description || (files.length === 1 ? description || descriptionFromFilename(derivedTitle, category) : descriptionFromFilename(derivedTitle, category));
            const derivedTags = draft ? draft.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean) : (files.length === 1 && tags?.length ? tags : tagsFromFilename(derivedTitle, category));
            const artworkSlug = slug(derivedTitle);
            catalogue.artworkOverrides[artworkSlug] = {
              ...(catalogue.artworkOverrides[artworkSlug] ?? {}),
              title: derivedTitle,
              description: derivedDescription,
              category: draft?.category || category,
              tags: derivedTags,
              metaTitle: draft?.metaTitle || `INKPROWL — ${derivedTitle}`,
              metaDescription: draft?.metaDescription || derivedDescription.slice(0, 155),
            };
          }
        });
        setCatalogue(next);
      }
      setStatus(queuedForCloudinaryStatus(files.length, role));
      if (role === "artwork") { setArtworkFiles([]); setArtworkDrafts([]); setArtworkTitle(""); setArtworkDescription(""); setArtworkTags(""); }
      if (role === "soundtrack") { setSongFile(null); setSongTitle(""); }
      if (role === "sponsor-video") { setVideoFile(null); setVideoTitle(""); }
      if (role === "logo") { setLogoFile(null); setLogoTitle(""); }
      if (role === "hero-banner") { setHeroBannerFile(null); setHeroBannerTitle(""); }
    } catch (reason) {
      setStatus(publishFailureStatus(ownerUploadFailureMessage(reason, files[0]?.name)));
    }
  }

  async function publish(role: PublishRole, files: File[], title: string) {
    const message = publishValidationMessage(role, files);
    if (message) { setStatus({ percent: 0, tone: "error", message }); return; }
    const nextPublish = { role, files, title, category: artworkCategory, description: artworkDescription, tags: artworkTags.split(",").map((tag) => tag.trim()).filter(Boolean), artist: role === "soundtrack" ? songArtist : undefined };
    if (!connection) {
      setPendingPublish(nextPublish);
      setStatus(authorizationPendingStatus("upload"));
      requestAuthorization();
      return;
    }
    await queuePublish(nextPublish, connection);
  }

  async function publishArtworkDrafts() {
    const message = publishValidationMessage("artwork", artworkFiles);
    if (message) { setStatus({ percent: 0, tone: "error", message }); return; }
    const nextPublish: PendingPublish = { role: "artwork", files: artworkFiles, title: artworkDrafts[0]?.title ?? "", category: artworkDrafts[0]?.category ?? artworkCategory, artworkDrafts };
    if (!connection) {
      setPendingPublish(nextPublish);
      setStatus(authorizationPendingStatus("upload"));
      requestAuthorization();
      return;
    }
    await queuePublish(nextPublish, connection);
  }

  useEffect(() => {
    if (!connection || !pendingPublish) return;
    const nextPublish = pendingPublish;
    setPendingPublish(null);
    void queuePublish(nextPublish, connection);
  }, [connection, pendingPublish]);

  useEffect(() => {
    if (!connection || !pendingMutation) return;
    const nextMutation = pendingMutation;
    setPendingMutation(null);
    void saveCatalogueMutation(nextMutation, connection);
  }, [connection, pendingMutation]);

  useEffect(() => {
    if (!connection || !pendingDeletion) return;
    const nextDeletion = pendingDeletion;
    setPendingDeletion(null);
    if (nextDeletion.artworks?.length) void removeSelectedArtworks(nextDeletion.artworks);
    else if (nextDeletion.artwork) void removeSelectedArtwork(nextDeletion.artwork);
    else if (nextDeletion.assetKey) void removeManagedAsset(nextDeletion.assetKey);
  }, [connection, pendingDeletion]);

  function chooseArtworkFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const validation = validateOwnerUploadFiles("artwork", files);
    if (validation) {
      setArtworkFiles([]);
      setArtworkDrafts([]);
      setStatus(publishFailureStatus(validation));
      event.currentTarget.value = "";
      return;
    }
    setArtworkFiles(files);
    setArtworkDrafts(files.map((file) => ({ ...createArtworkUploadDraft(file.name, artworkCategory), file })));
    if (files.length === 1) {
      const nextTitle = titleFromFilename(files[0]!.name);
      setArtworkTitle(nextTitle);
      setArtworkDescription(descriptionFromFilename(nextTitle, artworkCategory));
      setArtworkTags(tagsFromFilename(nextTitle, artworkCategory).join(", "));
    } else { setArtworkTitle(""); setArtworkDescription(""); setArtworkTags(""); }
  }

  function chooseSingleMedia(role: Exclude<PublishRole, "artwork">, event: ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void, setTitle: (title: string) => void) {
    const file = event.target.files?.[0] ?? null;
    const validation = validateOwnerUploadFiles(role, file ? [file] : []);
    if (!file || validation) {
      setFile(null);
      setStatus(publishFailureStatus(validation || "Choose one file first."));
      event.currentTarget.value = "";
      return;
    }
    setFile(file);
    setTitle(titleFromFilename(file.name));
    setStatus({ percent: 0, tone: "idle", message: `${file.name} is ready. Select Upload & Publish when you are ready to send it to Cloudinary.` });
  }

  async function removeManagedAsset(assetKey: string) {
    if (!connection) {
      setPendingDeletion({ assetKey });
      setStatus(authorizationPendingStatus("deletion"));
      requestAuthorization();
      return;
    }
    try {
      setStatus(requestingCloudinaryDeletionStatus());
      await dispatchCloudinaryDeletion(connection.token, assetKey);
      setStatus(cloudinaryDeletionQueuedStatus());
    } catch (reason) {
      setStatus(deletionFailureStatus(reason instanceof Error ? reason.message : undefined));
    }
  }

  async function removeSelectedArtwork(artwork = selectedArtwork) {
    if (!artwork) return;
    const assetKey = `artwork:${artwork.slug}`;
    if (!connection) {
      setPendingDeletion({ assetKey, artwork });
      setStatus(authorizationPendingStatus("deletion"));
      requestAuthorization();
      return;
    }
    const asset = cloudinaryAssetFromDeliveryUrl(artwork.imageUrl);
    if (!catalogue?.assets[assetKey] && !asset) { setStatus({ percent: 0, tone: "error", message: "This image does not have a removable Cloudinary delivery record." }); return; }
    try {
      setStatus(preparingArtworkDeletionStatus());
      const next = await mutateGeneratedCatalogue(connection.token, "chore: hide and remove INKPROWL artwork", (nextCatalogue) => {
        if (!nextCatalogue.assets[assetKey] && asset) nextCatalogue.assets[assetKey] = asset;
        nextCatalogue.artworkOverrides[artwork.slug] = {
          ...(nextCatalogue.artworkOverrides[artwork.slug] ?? {}),
          isPublished: false,
        };
      });
      setCatalogue(next);
      setStatus({ percent: 20, tone: "working", message: "Artwork is hidden from the public gallery. Permanent Cloudinary removal is now in progress." });
    } catch (reason) {
      setStatus(deletionFailureStatus(reason instanceof Error ? reason.message : "The image could not be hidden before Cloudinary deletion."));
      return;
    }
    await removeManagedAsset(assetKey);
  }

  function toggleBulkArtwork(slugValue: string) {
    setBulkArtworkSlugs((current) => current.includes(slugValue) ? current.filter((currentSlug) => currentSlug !== slugValue) : [...current, slugValue]);
  }

  async function removeSelectedArtworks(artworksToDelete = selectedBulkArtworks) {
    if (!artworksToDelete.length) { setStatus(publishFailureStatus("Select one or more artwork images before choosing permanent deletion.")); return; }
    if (!connection) {
      setPendingDeletion({ artworks: artworksToDelete });
      setStatus(authorizationPendingStatus("deletion"));
      requestAuthorization();
      return;
    }
    const deletions = artworksToDelete.map((artwork) => ({ artwork, assetKey: `artwork:${artwork.slug}`, asset: cloudinaryAssetFromDeliveryUrl(artwork.imageUrl) }));
    const unremovable = deletions.filter(({ assetKey, asset }) => !catalogue?.assets[assetKey] && !asset).map(({ artwork }) => artwork.title);
    if (unremovable.length) { setStatus(publishFailureStatus(`These images do not have a removable Cloudinary delivery record: ${unremovable.join(", ")}.`)); return; }
    try {
      setStatus(preparingBulkArtworkDeletionStatus(deletions.length));
      const next = await mutateGeneratedCatalogue(connection.token, "chore: hide and remove INKPROWL artwork batch", (nextCatalogue) => {
        for (const { artwork, assetKey, asset } of deletions) {
          if (!nextCatalogue.assets[assetKey] && asset) nextCatalogue.assets[assetKey] = asset;
          nextCatalogue.artworkOverrides[artwork.slug] = { ...(nextCatalogue.artworkOverrides[artwork.slug] ?? {}), isPublished: false };
        }
      });
      setCatalogue(next);
      setStatus({ percent: 35, tone: "working", message: `${deletions.length} artwork${deletions.length === 1 ? " is" : "s are"} now hidden from the public gallery. Permanent Cloudinary deletion is starting.` });
      await dispatchCloudinaryBulkDeletion(connection.token, deletions.map(({ assetKey }) => assetKey));
      setBulkArtworkSlugs([]);
      setStatus(cloudinaryBulkDeletionQueuedStatus(deletions.length));
    } catch (reason) {
      setStatus(deletionFailureStatus(reason instanceof Error ? reason.message : "The artwork batch could not be hidden before Cloudinary deletion."));
    }
  }

  const workspaceDetail = workspace === "home" ? null : workspaceCopy[workspace];
  return <main className="owner-launch-dashboard" data-workspace={workspace} aria-label="INKPROWL media publishing dashboard">
    <header className="owner-launch-topbar"><div className="owner-desk-brand"><span className="brand-seal">{siteBranding.logoUrl ? <img className="owner-desk-logo" src={siteBranding.logoUrl} alt="" /> : "IP"}</span><span>INKPROWL</span></div><span>OWNER ADMIN / CLOUDINARY DELIVERY</span><button type="button" className="owner-logout" onClick={onLogout}><LogOut size={15} /> Log out</button></header>
    <div className="owner-launch-heading"><div><span className="eyebrow">UPLOAD & PUBLISH</span><h3>Your permanent<br /><em>media desk.</em></h3><p>Choose files from your device. File names create draft titles; you can refine artwork content before publishing.</p></div><div className="owner-publish-session"><strong>{connection ? `Publishing ready · ${connection.identity.login}` : "Ready for your first save"}</strong><small>{connection ? "Ready for uploads, edits, and removals in this tab. Refresh keeps the connection; log out or close the tab clears it." : "Choose a file, then authorise the upload when prompted."}</small></div></div>
    {status.publicRefreshUrl && <a className="owner-public-refresh" href={status.publicRefreshUrl} target="_blank" rel="noreferrer">Open public site and refresh <ArrowUpRight size={14} />{status.revision && <small>Catalogue revision {status.revision.slice(0, 12)}</small>}</a>}
    <div className={`owner-publish-status ${status.tone}`} aria-live="polite"><div><span>{status.tone === "success" ? <CheckCircle2 size={17} /> : status.tone === "error" ? <XCircle size={17} /> : status.tone === "working" ? <LoaderCircle size={17} /> : <UploadCloud size={17} />}</span><p>{status.message}</p></div>{status.tone !== "success" && <progress value={status.percent} max="100" aria-label="Publishing progress" />}</div>
    {workspace === "home" ? <section className="owner-workspace-grid" aria-label="Choose an owner workspace"><button type="button" className="owner-workspace-card major" onClick={() => setWorkspace("artwork")}><ImagePlus size={24} /><span><strong>Artwork images</strong><small>Upload and edit each image’s metadata</small></span><UploadCloud size={16} /></button><button type="button" className="owner-workspace-card" onClick={() => setWorkspace("song")}><Music2 size={21} /><span><strong>Song upload</strong><small>Set the floating music player</small></span><UploadCloud size={16} /></button><button type="button" className="owner-workspace-card" onClick={() => setWorkspace("video")}><Film size={21} /><span><strong>Video upload</strong><small>Publish a sponsor film</small></span><UploadCloud size={16} /></button><button type="button" className="owner-workspace-card" onClick={() => setWorkspace("logo")}><ImagePlus size={21} /><span><strong>Logo upload</strong><small>Update the INKPROWL mark</small></span><UploadCloud size={16} /></button><button type="button" className="owner-workspace-card" onClick={() => setWorkspace("banner")}><ImagePlus size={21} /><span><strong>Hero banner upload</strong><small>Update the homepage banner and its caption</small></span><UploadCloud size={16} /></button><button type="button" className="owner-workspace-card" onClick={() => setWorkspace("inventory")}><Pencil size={21} /><span><strong>Artwork inventory</strong><small>Edit, hide, or delete editions</small></span><ArrowUpRight size={16} /></button><button type="button" className="owner-workspace-card" onClick={() => setWorkspace("categories")}><Tags size={21} /><span><strong>Categories & assets</strong><small>Organise and remove permanent media</small></span><ArrowUpRight size={16} /></button><button type="button" className="owner-workspace-card" onClick={() => onOpenAdvanced("ads")}><Tags size={21} /><span><strong>Advertising & sponsors</strong><small>Set codes, toggles, and client URLs</small></span><ArrowUpRight size={16} /></button></section> : <section className="owner-workspace-heading"><button type="button" className="owner-workspace-back" onClick={() => setWorkspace("home")}>← All workspaces</button><div><span className="eyebrow">{workspaceDetail?.eyebrow}</span><h4>{workspaceDetail?.title}</h4><p>{workspaceDetail?.description}</p></div>{workspace === "video" && <button type="button" className="admin-secondary-action owner-workspace-setting" onClick={() => onOpenAdvanced("video")}>Client URL & campaign settings</button>}{workspace === "logo" && <button type="button" className="admin-secondary-action owner-workspace-setting" onClick={() => onOpenAdvanced("brand")}>Hero heading settings</button>}</section>}
    <div className="owner-upload-grid">
      <article className="owner-upload-card owner-artwork-upload-card"><div className="owner-upload-icon"><ImagePlus size={22} /></div><span className="eyebrow">ARTWORK IMAGES</span><h4>Images Upload & Publish</h4><p>Choose JPG, PNG, WebP, or AVIF images. Every file receives its own editable title, category, description, tags, and search metadata before publishing.</p><label className="launch-file-picker"><input type="file" accept={ownerUploadAccept.artwork} multiple onChange={chooseArtworkFiles} /><span>{artworkFiles.length ? `${artworkFiles.length} image${artworkFiles.length === 1 ? "" : "s"} selected — edit each below` : "Choose artwork image files"}</span></label>{artworkDrafts.length > 0 && <div className="artwork-draft-list" aria-label="Selected artwork metadata"><div className="artwork-draft-list-head"><strong>{artworkDrafts.length} selected edition{artworkDrafts.length === 1 ? "" : "s"}</strong><span>Each entry publishes separately</span></div>{artworkDrafts.map((draft, index) => <section className="artwork-draft-card" key={`${draft.file.name}-${draft.file.lastModified}-${index}`}><div className="artwork-draft-name"><span>{index + 1}</span><strong>{draft.file.name}</strong></div><label>Title <input value={draft.title} onChange={(event) => setArtworkDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updateArtworkUploadDraft(item, { title: event.target.value }) } : item))} /></label><label>Category <select value={draft.category} onChange={(event) => setArtworkDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updateArtworkUploadDraft(item, { category: event.target.value }) } : item))}>{categoryNames.map((name) => <option key={name}>{name}</option>)}</select></label><label>Description <textarea rows={3} value={draft.description} onChange={(event) => setArtworkDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updateArtworkUploadDraft(item, { description: event.target.value }) } : item))} /></label><label>Tags <input value={draft.tags} onChange={(event) => setArtworkDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updateArtworkUploadDraft(item, { tags: event.target.value }) } : item))} placeholder="vintage, animal, editorial" /></label><label>Meta title <input value={draft.metaTitle} onChange={(event) => setArtworkDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updateArtworkUploadDraft(item, { metaTitle: event.target.value }) } : item))} /></label><label>Meta description <textarea rows={2} value={draft.metaDescription} onChange={(event) => setArtworkDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...updateArtworkUploadDraft(item, { metaDescription: event.target.value.slice(0, 155) }) } : item))} /></label></section>)}</div>}<button type="button" className="admin-primary-action" onClick={() => void publishArtworkDrafts()}><UploadCloud size={16} /> Upload & Publish images</button></article>
      <article className="owner-upload-card"><div className="owner-upload-icon"><Music2 size={22} /></div><span className="eyebrow">FLOATING MUSIC PLAYER</span><h4>Song Upload & Publish</h4><p>Upload one MP3, WAV, M4A, or OGG file for the public movable music player.</p><label className="launch-file-picker"><input type="file" accept={ownerUploadAccept.soundtrack} onChange={(event) => chooseSingleMedia("soundtrack", event, setSongFile, setSongTitle)} /><span>{songFile?.name ?? "Choose your song file"}</span></label><label>Song title <input value={songTitle} onChange={(event) => setSongTitle(event.target.value)} placeholder="Auto-generated from filename" /></label><label>Artist name <input value={songArtist} onChange={(event) => setSongArtist(event.target.value)} placeholder="e.g. INKPROWL" /></label><div className="launch-spacer" /><button type="button" className="admin-primary-action" onClick={() => void publish("soundtrack", songFile ? [songFile] : [], songTitle)}><Music2 size={16} /> Upload & Publish song</button></article>
      <article className="owner-upload-card"><div className="owner-upload-icon"><Film size={22} /></div><span className="eyebrow">SPONSORED VIDEO PLAYER</span><h4>Video Upload & Publish</h4><p>Upload one MP4, WebM, or MOV landscape video for the public sponsor stage and individual artwork film fallback.</p><label className="launch-file-picker"><input type="file" accept={ownerUploadAccept["sponsor-video"]} onChange={(event) => chooseSingleMedia("sponsor-video", event, setVideoFile, setVideoTitle)} /><span>{videoFile?.name ?? "Choose sponsor video file"}</span></label><label>Campaign title <input value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} placeholder="Auto-generated from filename" /></label><div className="launch-spacer" /><button type="button" className="admin-primary-action" onClick={() => void publish("sponsor-video", videoFile ? [videoFile] : [], videoTitle)}><Film size={16} /> Upload & Publish video</button></article>
      <article className="owner-upload-card owner-brand-upload-card"><div className="owner-upload-icon"><ImagePlus size={22} /></div><span className="eyebrow">BRAND STUDIO</span><h4>Logo Upload & Publish</h4><p>Choose the INKPROWL logo from your device. PNG, JPG, WebP, or AVIF is queued directly for permanent Cloudinary delivery.</p><label className="launch-file-picker"><input type="file" accept={ownerUploadAccept.logo} onChange={(event) => chooseSingleMedia("logo", event, setLogoFile, setLogoTitle)} /><span>{logoFile?.name ?? "Choose INKPROWL logo file"}</span></label><label>Logo label <input value={logoTitle} onChange={(event) => setLogoTitle(event.target.value)} placeholder="Auto-generated from filename" /></label><div className="launch-spacer" /><button type="button" className="admin-primary-action" onClick={() => void publish("logo", logoFile ? [logoFile] : [], logoTitle)}><UploadCloud size={16} /> Upload & Publish logo</button></article>
      <article className="owner-upload-card owner-brand-upload-card"><div className="owner-upload-icon"><ImagePlus size={22} /></div><span className="eyebrow">BRAND STUDIO</span><h4>Hero Banner Upload & Publish</h4><p>Choose a 1:1 homepage banner from your device. PNG, JPG, WebP, or AVIF is queued directly for permanent Cloudinary delivery.</p><label className="launch-file-picker"><input type="file" accept={ownerUploadAccept["hero-banner"]} onChange={(event) => chooseSingleMedia("hero-banner", event, setHeroBannerFile, setHeroBannerTitle)} /><span>{heroBannerFile?.name ?? "Choose hero banner file"}</span></label><label>Banner label <input value={heroBannerTitle} onChange={(event) => setHeroBannerTitle(event.target.value)} placeholder="Auto-generated from filename" /></label><label>Featured caption label <input value={heroFeaturedLabel} onChange={(event) => setHeroFeaturedLabel(event.target.value)} placeholder="e.g. 01 — FEATURED EDITION" /></label><label>Featured artwork title <input value={heroFeaturedTitle} onChange={(event) => setHeroFeaturedTitle(event.target.value)} placeholder="e.g. Panther in Pinstripe Suit" /></label><div className="launch-spacer" /><button type="button" className="admin-primary-action" onClick={() => void publish("hero-banner", heroBannerFile ? [heroBannerFile] : [], heroBannerTitle)}><UploadCloud size={16} /> Upload & Publish hero banner</button><button type="button" className="admin-secondary-action" onClick={saveHeroCaption}><Save size={14} /> Save featured caption</button></article>
    </div>
    <div className="owner-management-grid workspace-inventory"><article className="owner-record-card"><div className="owner-card-title"><div><span className="eyebrow">ARTWORK INVENTORY</span><h4>Thumbnails, title & metadata</h4></div><span>{artworkInventory.length} editions</span></div><div className="owner-artwork-list">{artworkInventory.map((artwork) => <button type="button" key={artwork.slug} className={selectedSlug === artwork.slug ? "selected" : ""} onClick={() => setSelectedSlug(artwork.slug)}><img src={artwork.imageUrl} alt="" /><span><strong>{artwork.title}</strong><small>{artwork.category}</small></span><Pencil size={15} /></button>)}</div></article><article className="owner-record-card"><div className="owner-card-title"><div><span className="eyebrow">EDIT SELECTED EDITION</span><h4>{selectedArtwork?.title}</h4></div></div><div className="owner-edit-form"><label>Title <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} /></label><label>Description <textarea rows={3} value={editDescription} onChange={(event) => setEditDescription(event.target.value)} /></label><label>Category <select value={editCategory} onChange={(event) => setEditCategory(event.target.value)}>{categoryNames.map((name) => <option key={name}>{name}</option>)}</select></label><label>Tags <input value={editTags} onChange={(event) => setEditTags(event.target.value)} placeholder="vintage, animals, tailored" /></label><div className="meta-preview"><strong>Automatic public metadata</strong><span>Title: INKPROWL — {editTitle || selectedArtwork?.title}</span><span>Description: {(editDescription || selectedArtwork?.description || "").slice(0, 150)}</span></div><button type="button" className="admin-primary-action" onClick={() => void mutateCatalogue("chore: update INKPROWL artwork metadata", "Artwork title, description, category, tags, and public metadata are saved.", (next) => { if (!selectedArtwork) return; next.artworkOverrides[selectedArtwork.slug] = { ...(next.artworkOverrides[selectedArtwork.slug] ?? {}), title: editTitle.trim(), description: editDescription.trim(), category: editCategory, tags: editTags.split(",").map((tag) => tag.trim()).filter(Boolean), metaTitle: `INKPROWL — ${editTitle.trim()}`, metaDescription: editDescription.trim().slice(0, 155), isPublished: true }; })}><Save size={16} /> Save artwork details</button><button type="button" className="admin-secondary-action" onClick={() => void mutateCatalogue(selectedArtworkIsPublished ? "chore: unpublish INKPROWL artwork" : "chore: publish INKPROWL artwork", selectedArtworkIsPublished ? "Artwork is now hidden from the public gallery." : "Artwork is now published to the public gallery.", (next) => { if (!selectedArtwork) return; next.artworkOverrides[selectedArtwork.slug] = { ...(next.artworkOverrides[selectedArtwork.slug] ?? {}), isPublished: !selectedArtworkIsPublished }; })}>{selectedArtworkIsPublished ? "Hide from public gallery" : "Publish to public gallery"}</button><button type="button" className="admin-danger-action" onClick={() => void removeSelectedArtwork()}><Trash2 size={16} /> Delete image permanently</button><p className="owner-delete-note">This deletes the Cloudinary image and hides its edition from the public gallery after the protected workflow completes.</p></div></article></div>
    <div className="owner-management-grid workspace-categories"><article className="owner-record-card"><div className="owner-card-title"><div><span className="eyebrow">CATEGORIES</span><h4>Add, rename, or delete</h4></div><Tags size={19} /></div><div className="owner-edit-form"><label>Action <select value={categoryMode} onChange={(event) => setCategoryMode(event.target.value as "add" | "rename" | "retire")}><option value="add">Add category</option><option value="rename">Rename category</option><option value="retire">Delete category and move editions</option></select></label>{categoryMode !== "add" && <label>Existing category <select value={categorySource} onChange={(event) => setCategorySource(event.target.value)}>{categoryNames.map((name) => <option key={name}>{name}</option>)}</select></label>}<label>{categoryMode === "retire" ? "Move editions to category" : "Category label"}<input value={categoryLabel} onChange={(event) => setCategoryLabel(event.target.value)} placeholder="e.g. Editorial Animals" /></label><button type="button" className="admin-primary-action" onClick={saveCategoryAction}><Plus size={16} /> {categoryMode === "add" ? "Add category" : categoryMode === "rename" ? "Rename category" : "Delete category"}</button></div></article><article className="owner-record-card"><div className="owner-card-title"><div><span className="eyebrow">PERMANENT ASSET REMOVAL</span><h4>Cloudinary-managed files</h4></div><Trash2 size={19} /></div>{managedAssets.length ? <div className="managed-asset-list">{managedAssets.map(([key, asset]) => <div key={key}><span><strong>{key}</strong><small>{asset.resourceType} · Cloudinary</small></span><button type="button" className="admin-danger-action" onClick={() => void removeManagedAsset(key)}><Trash2 size={14} /> Delete</button></div>)}</div> : <p className="empty-managed-assets">Authorise a save to load the managed Cloudinary asset inventory.</p>}</article></div>
    <BulkArtworkDeletionPanel visible={workspace === "inventory"} artworks={artworkInventory} selectedSlugs={bulkArtworkSlugs} busy={status.tone === "working"} onToggle={toggleBulkArtwork} onSelectAll={() => setBulkArtworkSlugs(artworkInventory.map((artwork) => artwork.slug))} onClear={() => setBulkArtworkSlugs([])} onDelete={() => { if (window.confirm(`Permanently delete ${selectedBulkArtworks.length} selected artwork image${selectedBulkArtworks.length === 1 ? "" : "s"} from the public gallery and Cloudinary? This cannot be undone.`)) void removeSelectedArtworks(); }} />
  </main>;
}
