import { describe, expect, it } from "vitest";
import { INKPROWL_PATHS } from "./App";

describe("INKPROWL GitHub Pages routes", () => {
  it("registers every public page and the separate owner path", () => {
    expect(INKPROWL_PATHS).toEqual([
      "/",
      "/gallery",
      "/gifs",
      "/categories",
      "/art/:slug",
      "/gif/:slug",
      "/about",
      "/contact",
      "/terms",
      "/privacy",
      "/admin",
      "/404",
    ]);
  });

  it("keeps the owner workspace outside the public navigation path set", () => {
    const publicPaths = INKPROWL_PATHS.filter((path) => path !== "/admin");

    expect(publicPaths).not.toContain("/admin");
    expect(INKPROWL_PATHS).toContain("/admin");
  });

  it("keeps the public home route available while the heavier secondary pages load on demand", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("./App.tsx", import.meta.url), "utf8"));
    expect(source).toContain('const Admin = lazy(() => import("./pages/Admin"))');
    expect(source).toContain('const ArtworkDetail = lazy(() => import("./pages/ArtworkDetail"))');
    expect(source).toContain('const GifDetail = lazy(() => import("./pages/GifDetail"))');
    expect(source).toContain('<Route path={"/gif/:slug"} component={GifDetail} />');
    expect(source).toContain('<Route path={"/"} component={Home} />');
  });
});
