import { afterEach, describe, expect, it, vi } from "vitest";
import { dispatchCloudinaryBulkDeletion, dispatchCloudinaryDeletion, emptyOwnerCatalogue, mutateGeneratedCatalogue, normalizeCloudinaryDeletionKeys, normalizeOwnerCatalogue, queueIncomingFile, readRepositoryJson, toBase64, verifyGitHubOwnerSession, writeRepositoryJson } from "./githubOwnerSession";

const response = (body: unknown, status = 200) => new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

describe("INKPROWL owner GitHub session helpers", () => {
  it("creates a complete owner catalogue from a legacy generated-catalogue document", () => {
    const catalogue = normalizeOwnerCatalogue({
      artworks: [],
      artworkMedia: {},
      siteMedia: {},
      siteBranding: {},
      sponsoredCampaign: {},
      advertisingSettings: {},
      assets: {},
    });

    expect(catalogue.artworkOverrides).toEqual({});
    expect(catalogue.categories).toEqual([]);
    expect(catalogue.categoryAliases).toEqual({});
  });

  it("keeps the empty generated catalogue safe for every dashboard panel", () => {
    expect(emptyOwnerCatalogue()).toMatchObject({
      artworks: [],
      artworkOverrides: {},
      artworkMedia: {},
      siteMedia: {},
      categories: [],
      assets: {},
    });
  });

  it("encodes binary media bytes exactly once for the GitHub Contents API", () => {
    expect(toBase64(new Uint8Array([0, 1, 2, 255]))).toBe("AAEC/w==");
  });

  it("verifies a write-capable GitHub identity and rejects read-only repository access", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ login: "inkprowl-owner" }))
      .mockResolvedValueOnce(response({ permissions: { push: true } }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(verifyGitHubOwnerSession("session-token")).resolves.toMatchObject({ login: "inkprowl-owner" });
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/user");
    expect(fetchMock.mock.calls[1]?.[0]).toContain("/repos/inkprowl/inkprowl");

    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(response({ login: "reader" })).mockResolvedValueOnce(response({ permissions: { push: false, admin: false } })));
    await expect(verifyGitHubOwnerSession("read-only-token")).rejects.toThrow(/cannot write/i);
  });

  it("reads and commits generated catalogue JSON through the Contents API", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ content: "eyJhc3NldHMiOnt9fQ==", encoding: "base64", sha: "catalogue-sha" }))
      .mockResolvedValueOnce(response({ content: { sha: "next-sha" } }));
    vi.stubGlobal("fetch", fetchMock);

    const document = await readRepositoryJson<{ assets: Record<string, never> }>("session-token", "client/src/data/generated-catalog.json");
    expect(document).toEqual({ value: { assets: {} }, sha: "catalogue-sha" });
    const [readPath, readInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(readPath).toContain("?ref=main&cache_bust=");
    expect(readInit.cache).toBe("no-store");
    await writeRepositoryJson("session-token", "client/src/data/generated-catalog.json", { assets: { owl: {} } }, "chore: update owner catalogue", document.sha);

    const [, init] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(init.method).toBe("PUT");
    expect(JSON.parse(String(init.body))).toMatchObject({ branch: "main", sha: "catalogue-sha", message: "chore: update owner catalogue" });
  });

  it("retries an idempotent generated-catalogue mutation after a stale revision conflict", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ content: "eyJhcnR3b3JrT3ZlcnJpZGVzIjp7fX0=", encoding: "base64", sha: "stale-sha" }))
      .mockResolvedValueOnce(response({ message: "client/src/data/generated-catalog.json does not match stale-sha" }, 409))
      .mockResolvedValueOnce(response({ content: "eyJhcnR3b3JrT3ZlcnJpZGVzIjp7fX0=", encoding: "base64", sha: "fresh-sha" }))
      .mockResolvedValueOnce(response({ content: { sha: "saved-sha" } }));
    vi.stubGlobal("fetch", fetchMock);

    const catalogue = await mutateGeneratedCatalogue("session-token", "chore: retry catalogue save", (next) => {
      next.artworkOverrides.owl = { title: "Owl" };
    });

    expect(catalogue.artworkOverrides.owl).toEqual({ title: "Owl" });
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const [, retryWrite] = fetchMock.mock.calls[3] as [string, RequestInit];
    expect(JSON.parse(String(retryWrite.body))).toMatchObject({ sha: "fresh-sha", message: "chore: retry catalogue save" });
  });

  it("retries repeated stale revisions before saving the latest sponsor settings", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ content: "eyJzcG9uc29yZWRDYW1wYWlnbiI6e319", encoding: "base64", sha: "first-sha" }))
      .mockResolvedValueOnce(response({ message: "client/src/data/generated-catalog.json does not match first-sha" }, 409))
      .mockResolvedValueOnce(response({ content: "eyJzcG9uc29yZWRDYW1wYWlnbiI6e319", encoding: "base64", sha: "second-sha" }))
      .mockResolvedValueOnce(response({ message: "client/src/data/generated-catalog.json does not match second-sha" }, 409))
      .mockResolvedValueOnce(response({ content: "eyJzcG9uc29yZWRDYW1wYWlnbiI6e319", encoding: "base64", sha: "third-sha" }))
      .mockResolvedValueOnce(response({ content: { sha: "saved-sha" } }));
    vi.stubGlobal("fetch", fetchMock);

    const pending = mutateGeneratedCatalogue("session-token", "chore: update INKPROWL media settings", (next) => {
      next.sponsoredCampaign = { label: "PRESENTED IN PARTNERSHIP", enabled: true };
    });
    await vi.runAllTimersAsync();

    await expect(pending).resolves.toMatchObject({ sponsoredCampaign: { label: "PRESENTED IN PARTNERSHIP", enabled: true } });
    expect(fetchMock).toHaveBeenCalledTimes(6);
    const [, finalWrite] = fetchMock.mock.calls[5] as [string, RequestInit];
    expect(JSON.parse(String(finalWrite.body))).toMatchObject({ sha: "third-sha", message: "chore: update INKPROWL media settings" });
    vi.useRealTimers();
  });

  it("derives a fresh Git blob SHA for an immediate follow-up sponsor save", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(response({ content: "eyJzcG9uc29yZWRDYW1wYWlnbiI6e319", encoding: "base64", sha: "initial-catalogue-sha" }))
      .mockResolvedValueOnce(response({ content: { sha: "after-first-save-sha" } }))
      .mockResolvedValueOnce(response({ content: { sha: "after-second-save-sha" } }));
    vi.stubGlobal("fetch", fetchMock);

    await mutateGeneratedCatalogue("session-token", "chore: update immediate sponsor settings", (next) => {
      next.sponsoredCampaign.label = "First";
    });
    await mutateGeneratedCatalogue("session-token", "chore: update immediate sponsor settings", (next) => {
      next.sponsoredCampaign.label = "Second";
    });

    const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
    expect(calls).toHaveLength(3);
    const [, firstWrite] = calls[1] as [string, RequestInit];
    const [, secondWrite] = calls[2] as [string, RequestInit];
    expect(JSON.parse(String(firstWrite.body))).toMatchObject({ sha: "initial-catalogue-sha" });
    const secondBody = JSON.parse(String(secondWrite.body));
    expect(secondBody.sha).toMatch(/^[a-f0-9]{40}$/);
    expect(secondBody.sha).not.toBe("initial-catalogue-sha");
  });

  it("queues binary media and dispatches the protected Cloudinary deletion workflow", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response({ content: { sha: "queue-sha" } })).mockResolvedValueOnce(response({}, 204));
    vi.stubGlobal("fetch", fetchMock);
    const file = new Blob([new Uint8Array([0, 1, 2, 255])], { type: "image/png" }) as File;

    await queueIncomingFile("session-token", "art--business-animals--owl.png", file);
    await dispatchCloudinaryDeletion("session-token", "inkprowl/artworks/owl");

    const [queuePath] = fetchMock.mock.calls[0] as [string, RequestInit];
    const [, queueInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(queuePath).toMatch(/\/incoming\/[^/]+\/art--business-animals--owl\.png$/);
    expect(JSON.parse(String(queueInit.body))).toMatchObject({ message: "chore: queue art--business-animals--owl.png for Cloudinary", content: "AAEC/w==" });
    const [dispatchPath, dispatchInit] = fetchMock.mock.calls[1] as [string, RequestInit];
    expect(dispatchPath).toContain("sync-cloudinary-media.yml/dispatches");
    expect(JSON.parse(String(dispatchInit.body))).toEqual({ ref: "main", inputs: { operation: "delete", asset_key: "inkprowl/artworks/owl" } });
  });

  it("deduplicates selected managed keys and dispatches them as a protected bulk delete", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(response({}, 204));
    vi.stubGlobal("fetch", fetchMock);

    expect(normalizeCloudinaryDeletionKeys([" artwork:owl ", "", "artwork:fox", "artwork:owl"])).toEqual(["artwork:owl", "artwork:fox"]);
    await dispatchCloudinaryBulkDeletion("session-token", [" artwork:owl ", "artwork:fox", "artwork:owl"]);

    const [dispatchPath, dispatchInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(dispatchPath).toContain("sync-cloudinary-media.yml/dispatches");
    expect(JSON.parse(String(dispatchInit.body))).toEqual({ ref: "main", inputs: { operation: "bulk-delete", asset_keys: "artwork:owl\nartwork:fox" } });
  });
});
