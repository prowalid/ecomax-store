import type { AppearanceSettings } from "@/hooks/useAppearanceSettings";
import { readCachedAppearance } from "./appearanceCache";

let bootstrappedAppearance: AppearanceSettings | null = null;

export function getBootstrappedAppearance(fallback: AppearanceSettings) {
  if (!bootstrappedAppearance) {
    bootstrappedAppearance = readCachedAppearance(fallback);
  }
  return bootstrappedAppearance;
}

export async function bootstrapAppearance(fallback: AppearanceSettings) {
  if (typeof window === "undefined") {
    return fallback;
  }

  // Pre-hydrate immediately from cache to prevent FOUC without issuing
  // a pre-mount network request that could interfere with auth bootstrap.
  if (!bootstrappedAppearance) {
    bootstrappedAppearance = readCachedAppearance(fallback);
  }

  return bootstrappedAppearance || fallback;
}
