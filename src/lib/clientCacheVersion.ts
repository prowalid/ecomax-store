import { safeGetLocalStorageItem, safeRemoveLocalStorageItem, safeSetLocalStorageItem } from "@/lib/safeStorage";

const CLIENT_CACHE_VERSION_KEY = "etk:client-cache-version";
const CLIENT_CACHE_VERSION = "2026-03-19-theme-cache-v1";

const STALE_KEYS = [
  "etk:appearance-settings-cache",
  "etk:appearance-settings-cache:v2",
  "etk:favicon-url",
];

export function syncClientCacheVersion() {
  const current = safeGetLocalStorageItem(CLIENT_CACHE_VERSION_KEY);
  if (current === CLIENT_CACHE_VERSION) {
    return;
  }

  for (const key of STALE_KEYS) {
    safeRemoveLocalStorageItem(key);
  }

  safeSetLocalStorageItem(CLIENT_CACHE_VERSION_KEY, CLIENT_CACHE_VERSION);
}
