import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useStoreSettings } from "./useStoreSettings";
import { getBootstrappedAppearance } from "@/lib/bootstrapAppearance";
import { writeCachedAppearance } from "@/lib/appearanceCache";

export interface AppearanceSlide {
  image_url: string;
  href?: string;
}

export interface AppearanceSettings {
  logo_url: string;
  footer_logo_url: string;
  favicon_url: string;
  store_name: string;
  // Colors
  accent_color: string;
  top_bar_bg: string;
  top_bar_text: string;
  header_bg: string;
  header_text: string;
  button_color: string;
  button_text: string;
  footer_bg: string;
  footer_text: string;
  footer_accent: string;
  badge_bg: string;
  badge_text: string;
  body_bg: string;
  // Fonts
  heading_font: string;
  body_font: string;
  // Slides
  slides: AppearanceSlide[];
  offers_banner_url: string;
}

export const defaultAppearance: AppearanceSettings = {
  logo_url: "",
  footer_logo_url: "",
  favicon_url: "",
  store_name: "ECOMAX",
  accent_color: "#dc3545",
  top_bar_bg: "#dc3545",
  top_bar_text: "#ffffff",
  header_bg: "#ffffff",
  header_text: "#1f2937",
  button_color: "#dc3545",
  button_text: "#ffffff",
  footer_bg: "#111827",
  footer_text: "#ffffff",
  footer_accent: "#dc3545",
  badge_bg: "#f4f6f8",
  badge_text: "#1f2937",
  body_bg: "#f8f9fa",
  heading_font: "Cairo",
  body_font: "Cairo",
  slides: [
    { image_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600" },
    { image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1600" },
    { image_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1600" },
  ],
  offers_banner_url: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=1400",
};
function normalizeSlides(value: unknown): AppearanceSlide[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .flatMap((entry): AppearanceSlide[] => {
      if (typeof entry === "string") {
        return [{ image_url: entry, href: "" }];
      }
      if (entry && typeof entry === "object" && "image_url" in entry && typeof entry.image_url === "string") {
        return [{
          image_url: entry.image_url,
          href: typeof (entry as { href?: unknown }).href === "string" ? (entry as { href?: string }).href : "",
        }];
      }
      return [];
    });
}

export function useAppearanceSettings() {
  const initialAppearance = getBootstrappedAppearance(defaultAppearance);
  const { data: serverSettings = initialAppearance, isLoading: loading } = useQuery({
    queryKey: ["store_settings", "appearance"],
    queryFn: async () => {
      try {
        const data = await api.get("/settings/appearance");
        if (data && data.value) {
          return { ...defaultAppearance, ...(data.value as Partial<AppearanceSettings>) };
        }
      } catch (err) {
        console.error("Failed to fetch appearance settings:", err);
      }
      return initialAppearance;
    },
  });

  useEffect(() => {
    if (serverSettings) {
      writeCachedAppearance(serverSettings);
    }
  }, [serverSettings]);

  const normalizedSettings = useMemo(
    () => ({
      ...serverSettings,
      slides: normalizeSlides(serverSettings.slides),
    }),
    [serverSettings]
  );

  return {
    loading,
    settings: normalizedSettings,
  };
}

export function useEditableAppearanceSettings() {
  const store = useStoreSettings<AppearanceSettings>("appearance", getBootstrappedAppearance(defaultAppearance));
  const normalizedSettings = useMemo(
    () => ({
      ...store.settings,
      slides: normalizeSlides(store.settings.slides),
    }),
    [store.settings]
  );

  return {
    ...store,
    settings: normalizedSettings,
  };
}
