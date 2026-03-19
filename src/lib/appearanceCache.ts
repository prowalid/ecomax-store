type AppearanceLike = {
  accent_color?: string;
  button_color?: string;
};

export const APPEARANCE_CACHE_KEY = "etk:appearance-settings-cache:v2";
const LEGACY_APPEARANCE_CACHE_KEYS = ["etk:appearance-settings-cache"];

const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function hexToRgbChannels(hex: string) {
  if (!HEX_COLOR_RE.test(hex)) {
    return null;
  }

  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex;

  const value = normalized.slice(1);
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function readCachedAppearance<T extends AppearanceLike>(fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    for (const legacyKey of LEGACY_APPEARANCE_CACHE_KEYS) {
      localStorage.removeItem(legacyKey);
    }

    const raw = localStorage.getItem(APPEARANCE_CACHE_KEY);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return fallback;
    }

    return { ...fallback, ...(parsed as Partial<T>) };
  } catch {
    return fallback;
  }
}

export function writeCachedAppearance(settings: AppearanceLike) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(APPEARANCE_CACHE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures; UI still works with in-memory query data.
  }
}

export function applyAppearanceCssVars(settings: AppearanceLike) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const primary = typeof settings.accent_color === "string"
    ? hexToRgbChannels(settings.accent_color)
    : null;
  const button = typeof settings.button_color === "string"
    ? hexToRgbChannels(settings.button_color)
    : null;

  if (primary) {
    root.style.setProperty("--store-primary", primary);
  }

  if (button) {
    root.style.setProperty("--store-button", button);
  }
}
