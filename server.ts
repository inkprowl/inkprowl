import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { INITIAL_ARTWORKS, DEFAULT_BRANDING, DEFAULT_AD_SETTINGS } from "./src/data/seedArtworks";
import { ArtItem, SiteBranding, AdSettings } from "./src/types";

const DATA_DIR = path.join(process.cwd(), "data");
const ARTWORKS_FILE = path.join(DATA_DIR, "artworks.json");
const BRANDING_FILE = path.join(DATA_DIR, "branding.json");
const ADS_FILE = path.join(DATA_DIR, "ads.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helpers for persistent storage
function loadArtworks(): ArtItem[] {
  try {
    if (fs.existsSync(ARTWORKS_FILE)) {
      const data = fs.readFileSync(ARTWORKS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read artworks storage file, using seed data:", err);
  }
  // Initialize with seed data
  saveArtworks(INITIAL_ARTWORKS);
  return INITIAL_ARTWORKS;
}

function saveArtworks(items: ArtItem[]): void {
  try {
    fs.writeFileSync(ARTWORKS_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save artworks storage file:", err);
  }
}

function loadBranding(): SiteBranding {
  try {
    if (fs.existsSync(BRANDING_FILE)) {
      return JSON.parse(fs.readFileSync(BRANDING_FILE, "utf-8"));
    }
  } catch (err) {
    console.warn("Failed to read branding file:", err);
  }
  return DEFAULT_BRANDING;
}

function saveBranding(branding: SiteBranding): void {
  try {
    fs.writeFileSync(BRANDING_FILE, JSON.stringify(branding, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save branding file:", err);
  }
}

function loadAdSettings(): AdSettings {
  try {
    if (fs.existsSync(ADS_FILE)) {
      return JSON.parse(fs.readFileSync(ADS_FILE, "utf-8"));
    }
  } catch (err) {
    console.warn("Failed to read ad settings file:", err);
  }
  return DEFAULT_AD_SETTINGS;
}

function saveAdSettings(ads: AdSettings): void {
  try {
    fs.writeFileSync(ADS_FILE, JSON.stringify(ads, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save ad settings file:", err);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function injectMetaTags(html: string, data: { title: string; description: string; imageUrl: string; pageUrl: string }): string {
  let updated = html;

  // Replace title
  updated = updated.replace(/<title>.*?<\/title>/gi, `<title>${escapeHtml(data.title)}</title>`);

  const metaMap: Array<{ attr: string; name: string; content: string }> = [
    { attr: "property", name: "og:type", content: "website" },
    { attr: "property", name: "og:title", content: data.title },
    { attr: "property", name: "og:description", content: data.description },
    { attr: "property", name: "og:image", content: data.imageUrl },
    { attr: "property", name: "og:image:secure_url", content: data.imageUrl },
    { attr: "property", name: "og:url", content: data.pageUrl },
    { attr: "name", name: "twitter:card", content: "summary_large_image" },
    { attr: "name", name: "twitter:title", content: data.title },
    { attr: "name", name: "twitter:description", content: data.description },
    { attr: "name", name: "twitter:image", content: data.imageUrl },
  ];

  metaMap.forEach(({ attr, name, content }) => {
    const escapedVal = escapeHtml(content);
    const regex = new RegExp(`<meta\\s+[^>]*?${attr}=["']${name}["'][^>]*?>`, "gi");
    const newTag = `<meta ${attr}="${name}" content="${escapedVal}" />`;
    if (regex.test(updated)) {
      updated = updated.replace(regex, newTag);
    } else {
      updated = updated.replace("</head>", `  ${newTag}\n</head>`);
    }
  });

  return updated;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Health
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", appName: "InkProwl API" });
  });

  // Serve raw binary artwork image for OpenGraph link previews (WhatsApp, Twitter, FB)
  app.get("/api/artwork-image/:id", (req, res) => {
    const { id } = req.params;
    const artworks = loadArtworks();
    const art = artworks.find((a) => a.id === id);

    if (!art || !art.imageUrl) {
      return res.redirect("/icon.png");
    }

    const img = art.imageUrl;

    if (img.startsWith("http://") || img.startsWith("https://")) {
      return res.redirect(img);
    }

    if (img.startsWith("data:image/")) {
      const match = img.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const imgBuffer = Buffer.from(base64Data, "base64");
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(imgBuffer);
      }

      if (img.startsWith("data:image/svg+xml")) {
        const svgContent = decodeURIComponent(img.replace(/^data:image\/svg\+xml;?(utf8|charset=utf-8)?,/, ""));
        res.setHeader("Content-Type", "image/svg+xml");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(svgContent);
      }
    }

    if (img.startsWith("/")) {
      const localPath = path.join(process.cwd(), "public", img);
      if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
      }
    }

    return res.redirect("/icon.png");
  });

  // Serve raw binary branding image for fallback social previews
  app.get("/api/branding-image", (req, res) => {
    const branding = loadBranding();
    const img = branding.logoUrl || branding.heroBannerUrl;

    if (!img) {
      return res.redirect("/icon.png");
    }

    if (img.startsWith("http://") || img.startsWith("https://")) {
      return res.redirect(img);
    }

    if (img.startsWith("data:image/")) {
      const match = img.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        const imgBuffer = Buffer.from(base64Data, "base64");
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(imgBuffer);
      }
    }

    if (img.startsWith("/")) {
      const localPath = path.join(process.cwd(), "public", img);
      if (fs.existsSync(localPath)) {
        return res.sendFile(localPath);
      }
    }

    return res.redirect("/icon.png");
  });

  // Artworks API
  app.get("/api/artworks", (req, res) => {
    const items = loadArtworks();
    res.json(items);
  });

  app.post("/api/artworks", (req, res) => {
    const newItem = req.body;
    if (!newItem || !newItem.title || !newItem.imageUrl) {
      return res.status(400).json({ error: "Invalid artwork payload" });
    }
    const current = loadArtworks();
    const updated = [newItem, ...current.filter((a) => a.id !== newItem.id)];
    saveArtworks(updated);
    res.json({ success: true, item: newItem });
  });

  app.post("/api/artworks/bulk", (req, res) => {
    const newItems = req.body;
    if (!Array.isArray(newItems)) {
      return res.status(400).json({ error: "Expected an array of artworks" });
    }
    const current = loadArtworks();
    const newIds = new Set(newItems.map((i) => i.id));
    const updated = [...newItems, ...current.filter((a) => !newIds.has(a.id))];
    saveArtworks(updated);
    res.json({ success: true, count: newItems.length });
  });

  app.put("/api/artworks/:id", (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const current = loadArtworks();
    let updatedItem: ArtItem | null = null;
    const updatedList = current.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });
    if (updatedItem) {
      saveArtworks(updatedList);
      res.json({ success: true, item: updatedItem });
    } else {
      res.status(404).json({ error: "Artwork not found" });
    }
  });

  app.delete("/api/artworks/:id", (req, res) => {
    const { id } = req.params;
    const current = loadArtworks();
    const filtered = current.filter((a) => a.id !== id);
    saveArtworks(filtered);
    res.json({ success: true });
  });

  app.post("/api/artworks/delete-bulk", (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "Expected ids array" });
    }
    const current = loadArtworks();
    const filtered = current.filter((a) => !ids.includes(a.id));
    saveArtworks(filtered);
    res.json({ success: true });
  });

  // Branding API
  app.get("/api/branding", (req, res) => {
    res.json(loadBranding());
  });

  app.post("/api/branding", (req, res) => {
    saveBranding(req.body);
    res.json({ success: true });
  });

  // Ads API
  app.get("/api/ads", (req, res) => {
    res.json(loadAdSettings());
  });

  app.post("/api/ads", (req, res) => {
    saveAdSettings(req.body);
    res.json({ success: true });
  });

  // Dynamic OpenGraph Social Meta Tag Injection for Deep Links (?art=ID)
  const renderIndexWithMeta = (req: express.Request, template: string): string => {
    const artId = (req.query.art || req.query.id) as string;
    const branding = loadBranding();
    const artworks = loadArtworks();

    const host = req.get("host") || "";
    const protocol = req.protocol || "https";
    const pageUrl = `${protocol}://${host}${req.originalUrl}`;

    if (artId) {
      const art = artworks.find((a) => a.id === artId);
      if (art) {
        const ogImageUrl = `${protocol}://${host}/api/artwork-image/${art.id}`;
        return injectMetaTags(template, {
          title: `${art.title} — ${branding.siteTitle || "InkProwl"}`,
          description: art.description || `Download free high-res ${art.title} vintage comic line art on InkProwl.`,
          imageUrl: ogImageUrl,
          pageUrl,
        });
      }
    }

    // Default branding meta tags
    const defaultOgImageUrl = `${protocol}://${host}/api/branding-image`;
    return injectMetaTags(template, {
      title: `${branding.siteTitle || "InkProwl"} — Vintage Comic Art & Line Art Marketplace`,
      description: branding.siteSubtitle || "Curated vintage comic-style illustrations and downloadable art assets.",
      imageUrl: defaultOgImageUrl,
      pageUrl,
    });
  };

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Custom HTML interceptor for dev mode deep-linking & social previews
    app.use(async (req, res, next) => {
      if (
        req.method === "GET" &&
        !req.path.startsWith("/api") &&
        (req.headers.accept?.includes("text/html") || req.path === "/" || req.path === "/index.html")
      ) {
        try {
          let template = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
          template = await vite.transformIndexHtml(req.originalUrl, template);
          const finalHtml = renderIndexWithMeta(req, template);
          return res.status(200).set({ "Content-Type": "text/html" }).end(finalHtml);
        } catch (err) {
          next(err);
        }
      } else {
        next();
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        const template = fs.readFileSync(indexPath, "utf-8");
        const finalHtml = renderIndexWithMeta(req, template);
        res.status(200).set({ "Content-Type": "text/html" }).send(finalHtml);
      } else {
        res.status(404).send("Build output not found");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

