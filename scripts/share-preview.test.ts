import { describe, expect, it } from "vitest";
import { normalizePreviewImageUrl, renderArtworkSharePage } from "./share-preview";

describe("static artwork share previews", () => {
  it("removes accidental whitespace from the Cloudinary image URL used by social crawlers", () => {
    expect(normalizePreviewImageUrl("https:\n//res.cloudinary.com/demo/image/upload/edition.jpg")).toBe("https://res.cloudinary.com/demo/image/upload/edition.jpg");
  });

  it("renders stable artwork metadata without an immediate meta refresh", () => {
    const html = renderArtworkSharePage({
      title: "Tiger in Pinstripe Suit — INKPROWL",
      description: "A collectible animal artwork.",
      imageUrl: "https:\n//res.cloudinary.com/y1pc8ocl/image/upload/tiger.jpg",
      shareUrl: "https://inkprowl.github.io/inkprowl/art/tiger/",
      redirectUrl: "https://inkprowl.github.io/inkprowl/#/art/tiger",
    });

    expect(html).toContain('property="og:image" content="https://res.cloudinary.com/y1pc8ocl/image/upload/tiger.jpg"');
    expect(html).toContain('property="og:image:secure_url" content="https://res.cloudinary.com/y1pc8ocl/image/upload/tiger.jpg"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).not.toContain('http-equiv="refresh"');
    expect(html).toContain("window.setTimeout");
  });
});
