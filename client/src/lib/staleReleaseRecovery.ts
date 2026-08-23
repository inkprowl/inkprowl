const recoveryKeyPrefix = "inkprowl:stale-release-recovery:";

export function isStaleReleaseError(error: unknown) {
  const message = error instanceof Error ? `${error.message}\n${error.stack ?? ""}` : String(error ?? "");
  return /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module|loading chunk \d+ failed/i.test(message);
}

export function buildStaleReleaseUrl(href: string, stamp = Date.now()) {
  const url = new URL(href);
  url.searchParams.set("release", stamp.toString(36));
  return url.toString();
}

export function claimStaleReleaseRecovery(error: unknown, storage: Pick<Storage, "getItem" | "setItem">) {
  const message = error instanceof Error ? error.message : String(error ?? "unknown");
  const key = `${recoveryKeyPrefix}${encodeURIComponent(message).slice(0, 180)}`;
  if (storage.getItem(key)) return false;
  storage.setItem(key, "1");
  return true;
}
