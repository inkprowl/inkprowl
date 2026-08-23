import { describe, expect, it } from "vitest";
import { buildStaleReleaseUrl, claimStaleReleaseRecovery, isStaleReleaseError } from "./staleReleaseRecovery";

describe("stale release recovery", () => {
  it("recognizes stale dynamic-import failures and creates a cache-busting reload URL", () => {
    const error = new TypeError("Failed to fetch dynamically imported module: https://inkprowl.github.io/inkprowl/assets/Home-old.js");
    expect(isStaleReleaseError(error)).toBe(true);
    expect(buildStaleReleaseUrl("https://inkprowl.github.io/inkprowl/#/art/chimp", 12345)).toContain("release=9ix");
  });

  it("permits one automatic recovery attempt per failing release module", () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
    const error = new Error("Failed to fetch dynamically imported module: current-artwork.js");
    expect(claimStaleReleaseRecovery(error, storage)).toBe(true);
    expect(claimStaleReleaseRecovery(error, storage)).toBe(false);
  });
});
