import type { AppearanceSettings } from "@/hooks/useAppearanceSettings";

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const expandHex = (hex: string) => {
  if (hex.length === 4) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex;
};

export const hexToRgba = (hex: string, alpha: number) => {
  if (!HEX_COLOR_RE.test(hex)) {
    return `rgba(15, 23, 42, ${alpha})`;
  }

  const normalized = expandHex(hex).replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const isDarkColor = (hex: string) => {
  if (!HEX_COLOR_RE.test(hex)) {
    return false;
  }

  const normalized = expandHex(hex).replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

export const getStoreThemeTokens = (theme: AppearanceSettings) => ({
  surface: theme.header_bg,
  surfaceSoft: theme.badge_bg,
  page: theme.body_bg,
  textPrimary: theme.header_text,
  textMuted: hexToRgba(theme.header_text, 0.72),
  textSoft: hexToRgba(theme.header_text, 0.5),
  border: hexToRgba(theme.header_text, 0.12),
  borderStrong: hexToRgba(theme.header_text, 0.2),
  shadow: hexToRgba(theme.header_text, 0.06),
});
