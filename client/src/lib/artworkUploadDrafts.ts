export type ArtworkUploadDraft = {
  filename: string;
  title: string;
  category: string;
  description: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
};

export function titleFromArtworkFilename(filename: string) {
  return filename.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function artworkDescription(title: string, category: string) {
  return `An INKPROWL ${category.toLowerCase()} artwork featuring ${title}, created in a vintage editorial line-art style.`;
}

export function artworkTags(title: string, category: string) {
  return Array.from(new Set([...title.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2), ...category.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2), "inkprowl", "animal art"])).slice(0, 8).join(", ");
}

export function createArtworkUploadDraft(filename: string, category: string): ArtworkUploadDraft {
  const title = titleFromArtworkFilename(filename);
  const description = artworkDescription(title, category);
  return {
    filename,
    title,
    category,
    description,
    tags: artworkTags(title, category),
    metaTitle: `INKPROWL — ${title}`,
    metaDescription: description.slice(0, 155),
  };
}

export function updateArtworkUploadDraft(draft: ArtworkUploadDraft, patch: Partial<ArtworkUploadDraft>): ArtworkUploadDraft {
  const next = { ...draft, ...patch };
  const previousDefaultDescription = artworkDescription(draft.title, draft.category);
  const previousDefaultTags = artworkTags(draft.title, draft.category);
  const previousDefaultMetaTitle = `INKPROWL — ${draft.title}`;
  const previousDefaultMetaDescription = draft.description.slice(0, 155);

  if (("title" in patch || "category" in patch) && draft.description === previousDefaultDescription) next.description = artworkDescription(next.title, next.category);
  if (("title" in patch || "category" in patch) && draft.tags === previousDefaultTags) next.tags = artworkTags(next.title, next.category);
  if ("title" in patch && draft.metaTitle === previousDefaultMetaTitle) next.metaTitle = `INKPROWL — ${next.title}`;
  if (("title" in patch || "category" in patch || "description" in patch) && draft.metaDescription === previousDefaultMetaDescription) next.metaDescription = next.description.slice(0, 155);

  return next;
}
