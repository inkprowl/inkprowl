export type OwnerPublishStatus = {
  percent: number;
  tone: "idle" | "working" | "success" | "error";
  message: string;
  revision?: string;
  publicRefreshUrl?: string;
};

const publicRefreshUrl = (revision?: string) => `https://inkprowl.github.io/inkprowl/?published=${encodeURIComponent(revision || String(Date.now()))}`;

export const initialOwnerPublishStatus: OwnerPublishStatus = {
  percent: 0,
  tone: "idle",
  message: "Choose a file, review its filename-derived details, then select Upload & Publish.",
};

export function authorizationPendingStatus(kind: "upload" | "save" | "deletion") : OwnerPublishStatus {
  return kind === "upload"
    ? { percent: 5, tone: "working", message: "Authorise this upload once. Your selected file will start uploading automatically as soon as authorisation is confirmed." }
    : kind === "save"
      ? { percent: 5, tone: "working", message: "Authorise this save once. Your category or artwork change will be saved automatically when authorisation is confirmed." }
      : { percent: 5, tone: "working", message: "Authorise this deletion once. The selected Cloudinary removal will begin automatically when authorisation is confirmed." };
}

export const savingCatalogueStatus = (): OwnerPublishStatus => ({
  percent: 25,
  tone: "working",
  message: "Saving your permanent catalogue change…",
});

export function catalogueSavedStatus(success: string, revision?: string): OwnerPublishStatus {
  return {
    percent: 100,
    tone: "success",
    message: `${success} GitHub Pages will rebuild automatically from this permanent catalogue revision.`,
    revision,
    publicRefreshUrl: publicRefreshUrl(revision),
  };
}

export const preparingArtworkDeletionStatus = (): OwnerPublishStatus => ({
  percent: 18,
  tone: "working",
  message: "Preparing the permanent Cloudinary image deletion…",
});

export function preparingBulkArtworkDeletionStatus(total: number): OwnerPublishStatus {
  return {
    percent: 18,
    tone: "working",
    message: `Preparing ${total} artwork${total === 1 ? "" : "s"} for permanent Cloudinary deletion…`,
  };
}

export const requestingCloudinaryDeletionStatus = (): OwnerPublishStatus => ({
  percent: 45,
  tone: "working",
  message: "Requesting permanent Cloudinary removal…",
});

export const cloudinaryDeletionQueuedStatus = (): OwnerPublishStatus => ({
  percent: 100,
  tone: "success",
  message: "Removal requested. The protected workflow will delete the Cloudinary asset, update the catalogue, and rebuild the site.",
});

export function cloudinaryBulkDeletionQueuedStatus(total: number): OwnerPublishStatus {
  return {
    percent: 100,
    tone: "success",
    message: `${total} artwork${total === 1 ? "" : "s"} queued for permanent Cloudinary deletion. The catalogue is hidden immediately and the public site will rebuild after the protected workflow finishes.`,
    publicRefreshUrl: publicRefreshUrl(),
  };
}

export function deletionFailureStatus(reason?: string): OwnerPublishStatus {
  return {
    percent: 0,
    tone: "error",
    message: reason || "The permanent removal request failed.",
  };
}

export const publishHandoffStatus = (): OwnerPublishStatus => ({
  percent: 8,
  tone: "working",
  message: "Preparing the secure publish handoff…",
});

export function uploadToQueueStatus(filename: string, index: number, total: number): OwnerPublishStatus {
  return {
    percent: Math.round(15 + (index / total) * 65),
    tone: "working",
    message: `Uploading ${filename} to the protected publish handoff…`,
  };
}

export const savingArtworkMetadataStatus = (): OwnerPublishStatus => ({
  percent: 88,
  tone: "working",
  message: "Saving filename-derived artwork title, description, tags, and metadata…",
});

export function queuedForCloudinaryStatus(total: number, role?: "soundtrack" | "sponsor-video" | "artwork" | "gif" | "logo" | "hero-banner"): OwnerPublishStatus {
  const videoNote = role === "sponsor-video"
    ? " Cloudinary is preparing the video now. It will appear on the site when publishing finishes—do not upload it again."
    : "";
  return {
    percent: 100,
    tone: "success",
    message: `${total === 1 ? "Upload saved" : `${total} uploads saved`}. Cloudinary and GitHub Pages are publishing it in the background; this can take a few minutes. Refresh the public site later—do not upload the same file again.${videoNote}`,
    publicRefreshUrl: publicRefreshUrl(),
  };
}

export function publishFailureStatus(reason?: string): OwnerPublishStatus {
  return {
    percent: 0,
    tone: "error",
    message: reason || "The upload handoff failed. Your media was not published.",
  };
}
