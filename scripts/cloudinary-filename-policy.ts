export type IncomingAsset =
  | { kind: "artwork"; category: string; slug: string; title: string; tags: string[] }
  | { kind: "gif"; slug: string; title: string; tags: string[] }
  | { kind: "soundtrack"; title: string }
  | { kind: "hero-film" }
  | { kind: "hero-banner" }
  | { kind: "logo" }
  | { kind: "sponsor-video"; clientName: string }
  | { kind: "edition-video"; slug: string };

const categories = new Map([
  ["business-animals", "Business Animals"],
  ["business-animal-characters", "Business Animals"],
  ["mafia-bosses", "Mafia Bosses"],
  ["funny-animals", "Funny Animals"],
  ["funny-animal-characters", "Funny Animals"],
  ["collectible-art", "Collectible Art"],
  ["bear-bull-market", "BEAR & BULL MARKET"],
  ["tailored-animals", "Tailored Animals"],
  ["vintage-comic-art", "Vintage Comic Art"],
  ["cross-hatching", "Cross-Hatching"],
  ["2d-line-art", "2D Line Art"],
  ["animal-characters", "Animal Characters"],
  ["fashion-animals", "Fashion Animals"],
  ["premium-art", "Premium Art"],
  ["premium-animal-characters", "Premium Art"],
  ["free-art", "Free Art"],
]);

const imageExtensions = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
const gifExtensions = new Set(["gif"]);
const videoExtensions = new Set(["mp4", "webm", "mov"]);
const audioExtensions = new Set(["mp3", "wav", "m4a", "ogg"]);

const fileStem = (filename: string) => filename.replace(/\.[^/.]+$/, "");
const extension = (filename: string) => filename.split(".").pop()?.toLowerCase() ?? "";
const titleFromSlug = (value: string) => value.split("-").filter(Boolean).map((word) => word === "2d" ? "2D" : word[0]?.toUpperCase() + word.slice(1)).join(" ");
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function classifyIncomingFile(filename: string): IncomingAsset {
  const stem = fileStem(filename);
  const ext = extension(filename);

  if (stem.startsWith("art--")) {
    if (!imageExtensions.has(ext)) throw new Error(`Artwork files must use an image extension: ${filename}`);
    const [, categorySlug, ...titleParts] = stem.split("--");
    const category = categories.get(categorySlug);
    const slug = slugify(titleParts.join("-"));
    if (!category || !slug) throw new Error(`Use art--<category>--<title>.<image extension>; received ${filename}`);
    const title = titleFromSlug(slug);
    return { kind: "artwork", category, slug, title, tags: slug.split("-").filter((part) => part.length > 2).slice(0, 6) };
  }

  if (stem.startsWith("gif--")) {
    if (!gifExtensions.has(ext)) throw new Error(`GIF editions must use a GIF extension: ${filename}`);
    const slug = slugify(stem.slice("gif--".length));
    if (!slug) throw new Error(`Use gif--<title>.gif; received ${filename}`);
    return { kind: "gif", slug, title: titleFromSlug(slug), tags: slug.split("-").filter((part) => part.length > 2).slice(0, 6) };
  }

  if (stem.startsWith("song--")) {
    if (!audioExtensions.has(ext)) throw new Error(`Soundtrack files must use MP3, WAV, M4A, or OGG: ${filename}`);
    const title = titleFromSlug(slugify(stem.slice("song--".length))) || "Curated sound";
    return { kind: "soundtrack", title };
  }

  if (stem.startsWith("hero-film--")) {
    if (!videoExtensions.has(ext)) throw new Error(`Hero films must use MP4, WebM, or MOV: ${filename}`);
    return { kind: "hero-film" };
  }

  if (stem.startsWith("hero-banner--")) {
    if (!imageExtensions.has(ext)) throw new Error(`Hero banners must use a supported image extension: ${filename}`);
    return { kind: "hero-banner" };
  }

  if (stem.startsWith("logo--")) {
    if (!imageExtensions.has(ext)) throw new Error(`Logo files must use a supported image extension: ${filename}`);
    return { kind: "logo" };
  }

  if (stem.startsWith("sponsor-video--")) {
    if (!videoExtensions.has(ext)) throw new Error(`Sponsor films must use MP4, WebM, or MOV: ${filename}`);
    const clientName = titleFromSlug(slugify(stem.slice("sponsor-video--".length))) || "A considered sponsor";
    return { kind: "sponsor-video", clientName };
  }

  if (stem.startsWith("edition-video--")) {
    if (!videoExtensions.has(ext)) throw new Error(`Edition films must use MP4, WebM, or MOV: ${filename}`);
    const slug = slugify(stem.slice("edition-video--".length));
    if (!slug) throw new Error(`Use edition-video--<artwork-slug>.<video extension>; received ${filename}`);
    return { kind: "edition-video", slug };
  }

  throw new Error(`Unsupported INKPROWL upload filename: ${filename}`);
}
