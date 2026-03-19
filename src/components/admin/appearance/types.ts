import type { AppearanceSettings } from "@/hooks/useAppearanceSettings";

export type AppearanceColorKey =
  | "accent_color"
  | "top_bar_bg"
  | "top_bar_text"
  | "header_bg"
  | "header_text"
  | "button_color"
  | "button_text"
  | "badge_bg"
  | "badge_text"
  | "body_bg"
  | "footer_bg"
  | "footer_text"
  | "footer_accent";

export const colorFields: { key: AppearanceColorKey; label: string; group: string }[] = [
  { key: "accent_color", label: "اللون الرئيسي (Accent)", group: "عام" },
  { key: "top_bar_bg", label: "خلفية الشريط العلوي", group: "الشريط العلوي" },
  { key: "top_bar_text", label: "نص الشريط العلوي", group: "الشريط العلوي" },
  { key: "header_bg", label: "خلفية الهيدر", group: "الهيدر" },
  { key: "header_text", label: "نص الهيدر", group: "الهيدر" },
  { key: "button_color", label: "لون الأزرار", group: "الأزرار" },
  { key: "button_text", label: "نص الأزرار", group: "الأزرار" },
  { key: "badge_bg", label: "خلفية البطاقات", group: "المحتوى" },
  { key: "badge_text", label: "نص البطاقات", group: "المحتوى" },
  { key: "body_bg", label: "خلفية الصفحة", group: "المحتوى" },
  { key: "footer_bg", label: "خلفية الفوتر", group: "الفوتر" },
  { key: "footer_text", label: "نص الفوتر", group: "الفوتر" },
  { key: "footer_accent", label: "لون التمييز في الفوتر", group: "الفوتر" },
];

export interface AppearancePreset {
  id: string;
  name: string;
  description: string;
  colors: Pick<
    AppearanceSettings,
    AppearanceColorKey
  >;
}

export const appearancePresets: AppearancePreset[] = [
  {
    id: "classic-commerce",
    name: "تجاري كلاسيكي",
    description: "واضح ومباشر ومناسب للمتاجر العامة.",
    colors: {
      accent_color: "#dc3545",
      top_bar_bg: "#dc3545",
      top_bar_text: "#ffffff",
      header_bg: "#ffffff",
      header_text: "#1f2937",
      button_color: "#dc3545",
      button_text: "#ffffff",
      badge_bg: "#f4f6f8",
      badge_text: "#1f2937",
      body_bg: "#f8f9fa",
      footer_bg: "#111827",
      footer_text: "#ffffff",
      footer_accent: "#dc3545",
    },
  },
  {
    id: "forest-market",
    name: "أخضر احترافي",
    description: "ثقة وهدوء بصري مع تباين أوضح في العناصر والنصوص.",
    colors: {
      accent_color: "#177245",
      top_bar_bg: "#177245",
      top_bar_text: "#ffffff",
      header_bg: "#f5fbf7",
      header_text: "#173127",
      button_color: "#177245",
      button_text: "#ffffff",
      badge_bg: "#e7f4ec",
      badge_text: "#173127",
      body_bg: "#eef7f1",
      footer_bg: "#0f241b",
      footer_text: "#f3faf5",
      footer_accent: "#67c58f",
    },
  },
  {
    id: "lux-dark",
    name: "فاخر داكن",
    description: "أنسب للمنتجات الراقية والعلامات الجريئة.",
    colors: {
      accent_color: "#d6a54b",
      top_bar_bg: "#101010",
      top_bar_text: "#f7edd8",
      header_bg: "#191919",
      header_text: "#f6eddc",
      button_color: "#d6a54b",
      button_text: "#111111",
      badge_bg: "#242424",
      badge_text: "#f6eddc",
      body_bg: "#121212",
      footer_bg: "#080808",
      footer_text: "#f4ead8",
      footer_accent: "#d6a54b",
    },
  },
  {
    id: "soft-modern",
    name: "حديث هادئ",
    description: "هوية خفيفة وعصرية للمتاجر النظيفة.",
    colors: {
      accent_color: "#2563eb",
      top_bar_bg: "#dbeafe",
      top_bar_text: "#1e3a8a",
      header_bg: "#ffffff",
      header_text: "#0f172a",
      button_color: "#2563eb",
      button_text: "#ffffff",
      badge_bg: "#eff6ff",
      badge_text: "#1e3a8a",
      body_bg: "#f8fbff",
      footer_bg: "#0f172a",
      footer_text: "#e2e8f0",
      footer_accent: "#60a5fa",
    },
  },
  {
    id: "sunset-fashion",
    name: "غروب أنيق",
    description: "مناسب للملابس والعطور والمنتجات ذات الهوية الناعمة.",
    colors: {
      accent_color: "#d9485f",
      top_bar_bg: "#fff1f2",
      top_bar_text: "#8a1c33",
      header_bg: "#fffafb",
      header_text: "#3f1d2b",
      button_color: "#d9485f",
      button_text: "#ffffff",
      badge_bg: "#ffe4e8",
      badge_text: "#5f2535",
      body_bg: "#fff6f7",
      footer_bg: "#2f1320",
      footer_text: "#fff0f2",
      footer_accent: "#ff8da1",
    },
  },
  {
    id: "desert-gold",
    name: "صحراوي ذهبي",
    description: "دافئ ومتوازن للمنتجات المنزلية والهدايا.",
    colors: {
      accent_color: "#b7791f",
      top_bar_bg: "#fdf2d8",
      top_bar_text: "#6b4423",
      header_bg: "#fffdf8",
      header_text: "#4a3421",
      button_color: "#b7791f",
      button_text: "#ffffff",
      badge_bg: "#f8ead1",
      badge_text: "#5f4525",
      body_bg: "#fdf8ee",
      footer_bg: "#3d2a19",
      footer_text: "#f9ebd1",
      footer_accent: "#e9b45f",
    },
  },
  {
    id: "plum-boutique",
    name: "برقوقي راق",
    description: "مميز وأنيق للبوتيكات والمتاجر النسائية.",
    colors: {
      accent_color: "#8b3d73",
      top_bar_bg: "#f8eaf3",
      top_bar_text: "#5d2249",
      header_bg: "#fffafd",
      header_text: "#35192c",
      button_color: "#8b3d73",
      button_text: "#ffffff",
      badge_bg: "#f3ddeb",
      badge_text: "#542040",
      body_bg: "#fcf5fa",
      footer_bg: "#26131f",
      footer_text: "#f7eaf2",
      footer_accent: "#c777aa",
    },
  },
  {
    id: "tech-midnight",
    name: "تقني ليلي",
    description: "أنسب للمتاجر التقنية والإلكترونيات الحديثة.",
    colors: {
      accent_color: "#14b8a6",
      top_bar_bg: "#0f172a",
      top_bar_text: "#d5fff9",
      header_bg: "#111827",
      header_text: "#e6fffb",
      button_color: "#14b8a6",
      button_text: "#06211d",
      badge_bg: "#1f2937",
      badge_text: "#d8fffb",
      body_bg: "#0b1220",
      footer_bg: "#050b14",
      footer_text: "#d6fff8",
      footer_accent: "#2dd4bf",
    },
  },
];
