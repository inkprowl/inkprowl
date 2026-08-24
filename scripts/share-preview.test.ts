import { describe, expect, it } from "vitest";
import { getCloudinaryArtworkPreviewUrl, normalizePreviewImageUrl, renderArtworkSharePage } from "./share-preview";

describe("static artwork share previews", () => {
  it("removes accidental whitespace from the Cloudinary image URL used by social crawlers", () => {
    expect(normalizePreviewImageUrl("https:\n//res.cloudinary.com/demo/image/upload/edition.jpg")).toBe("https://res.cloudinary.com/demo/image/upload/edition.jpg");
  });

  it("creates a compact padded JPEG derivative for Cloudinary artwork previews without changing source downloads", () => {
    expect(getCloudinaryArtworkPreviewUrl("https://res.cloudinary.com/y1pc8ocl/image/upload/v1/panther.png")).toBe("https://res.cloudinary.com/y1pc8ocl/image/upload/f_jpg,q_auto:good,c_pad,w_1200,h_630,b_rgb:f7edd7/v1/panther.png");
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

  it("identifies animated GIF previews while retaining the delayed redirect", () => {
    const html = renderArtworkSharePage({
      title: "Noir loop — INKPROWL animated GIF",
      description: "An original animated GIF edition.",
      imageUrl: "https://res.cloudinary.com/y1pc8ocl/image/upload/noir-loop.gif",
      shareUrl: "https://inkprowl.github.io/inkprowl/gif/noir-loop/",
      redirectUrl: "https://inkprowl.github.io/inkprowl/#/gif/noir-loop",
      imageType: "image/gif",
    });

    expect(html).toContain('property="og:image:type" content="image/gif"');
    expect(html).toContain("#/gif/noir-loop");
    expect(html).not.toContain('http-equiv="refresh"');
  });

  it("emits an explicit JPEG image type for crawler-safe artwork cards", () => {
    const html = renderArtworkSharePage({ title: "Panther — INKPROWL", description: "A collectible animal artwork.", imageUrl: "https://res.cloudinary.com/y1pc8ocl/image/upload/f_jpg/panther.jpg", shareUrl: "https://inkprowl.github.io/inkprowl/art/panther/?v=2026", redirectUrl: "https://inkprowl.github.io/inkprowl/#/art/panther", imageType: "image/jpeg" });
    expect(html).toContain('property="og:image:type" content="image/jpeg"');
  });
});
