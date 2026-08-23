import { describe, expect, it } from "vitest";
import { createArtworkUploadDraft, updateArtworkUploadDraft } from "./artworkUploadDrafts";

describe("artwork upload drafts", () => {
  it("creates editable title, category, description, tag, and metadata fields from a filename", () => {
    const draft = createArtworkUploadDraft("velvet-fox-in-blue.webp", "Business Animals");

    expect(draft.title).toBe("Velvet Fox In Blue");
    expect(draft.category).toBe("Business Animals");
    expect(draft.description).toContain("Velvet Fox In Blue");
    expect(draft.description).not.toMatch(/cloudinary|storage|queue|github/i);
    expect(draft.tags).toContain("velvet");
    expect(draft.metaTitle).toBe("INKPROWL — Velvet Fox In Blue");
    expect(draft.metaDescription).toBe(draft.description.slice(0, 155));
  });

  it("refreshes untouched automatic fields when title or category changes without overwriting manual content", () => {
    const draft = createArtworkUploadDraft("velvet-fox.webp", "Business Animals");
    const updated = updateArtworkUploadDraft(draft, { title: "Midnight Fox", category: "Mafia Bosses" });

    expect(updated.description).toContain("mafia bosses");
    expect(updated.tags).toContain("mafia");
    expect(updated.metaTitle).toBe("INKPROWL — Midnight Fox");

    const manual = updateArtworkUploadDraft(updated, { description: "A handwritten description.", tags: "custom, fox", metaTitle: "A custom search title" });
    const retitled = updateArtworkUploadDraft(manual, { title: "Noir Fox" });
    expect(retitled.description).toBe("A handwritten description.");
    expect(retitled.tags).toBe("custom, fox");
    expect(retitled.metaTitle).toBe("A custom search title");
  });
});
