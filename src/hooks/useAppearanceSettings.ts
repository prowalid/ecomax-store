import { useStoreSettings } from "./useStoreSettings";

export interface AppearanceSettings {
  logo_url: string;
  footer_logo_url: string;
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
  slides: string[];
  mobile_slides: string[];
  offers_banner_url: string;
  // Category default images
  category_images: string[];
}

export const defaultAppearance: AppearanceSettings = {
  logo_url: "",
  footer_logo_url: "",
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
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&q=80&w=1600",
  ],
  mobile_slides: [
    "https://images.unsplash.com/photo-1607083206869-4c7672072395?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&q=80&w=800",
  ],
  offers_banner_url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200",
  category_images: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1556910103-1c02745a8720?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=600",
  ],
};

export function useAppearanceSettings() {
  return useStoreSettings<AppearanceSettings>("appearance", defaultAppearance);
}
