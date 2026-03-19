import type { AppearanceSettings } from "@/hooks/useAppearanceSettings";

let bootstrappedAppearance: AppearanceSettings | null = null;

const API_URL = import.meta.env.VITE_API_URL || "/api";

export function getBootstrappedAppearance(fallback: AppearanceSettings) {
  return bootstrappedAppearance ? { ...fallback, ...bootstrappedAppearance } : fallback;
}

export async function bootstrapAppearance(fallback: AppearanceSettings) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const response = await fetch(`${API_URL}/settings/appearance?_=${Date.now()}`, {
      method: "GET",
      cache: "reload",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return fallback;
    }

    const data = (await response.json()) as { value?: Partial<AppearanceSettings> };
    if (!data?.value || typeof data.value !== "object") {
      return fallback;
    }

    bootstrappedAppearance = { ...fallback, ...data.value };
    return bootstrappedAppearance;
  } catch {
    return fallback;
  }
}
