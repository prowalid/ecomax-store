import { Outlet } from "react-router-dom";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { defaultAppearance, useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((char) => char + char).join("")
    : normalized;

  const int = Number.parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === nr) h = ((ng - nb) / delta) % 6;
    else if (max === ng) h = (nb - nr) / delta + 2;
    else h = (nr - ng) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const hexToHslChannels = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return `${h} ${s}% ${l}%`;
};

const shiftLightness = (hex: string, delta: number) => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return `${h} ${s}% ${clamp(l + delta, 8, 94)}%`;
};

const getReadableForeground = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "222 47% 12%" : "0 0% 100%";
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { settings: appearance, loading } = useAppearanceSettings();
  const { settings: generalSettings, loading: generalLoading } = useStoreSettings("general", {
    store_name: "ECOMAX",
    meta_title: "",
  });
  const effectiveBrandTitle = generalSettings.meta_title?.trim() || generalSettings.store_name?.trim() || "ECOMAX";
  const adminAppearance = loading ? defaultAppearance : appearance;

  const adminThemeVars = useMemo(() => {
    const accent = adminAppearance.accent_color;
    const page = adminAppearance.body_bg;
    const surface = adminAppearance.header_bg;
    const text = adminAppearance.header_text;
    const soft = adminAppearance.badge_bg;
    const softText = adminAppearance.badge_text || text;
    const footer = adminAppearance.footer_bg;

    return {
      "--background": hexToHslChannels(page),
      "--foreground": hexToHslChannels(text),
      "--card": hexToHslChannels(surface),
      "--card-foreground": hexToHslChannels(text),
      "--popover": hexToHslChannels(surface),
      "--popover-foreground": hexToHslChannels(text),
      "--primary": hexToHslChannels(accent),
      "--primary-foreground": getReadableForeground(accent),
      "--secondary": hexToHslChannels(soft),
      "--secondary-foreground": hexToHslChannels(softText),
      "--muted": shiftLightness(soft, 2),
      "--muted-foreground": shiftLightness(text, 22),
      "--accent": shiftLightness(soft, 4),
      "--accent-foreground": hexToHslChannels(softText),
      "--border": shiftLightness(text, 52),
      "--input": shiftLightness(text, 52),
      "--ring": hexToHslChannels(accent),
      "--sidebar-bg": hexToHslChannels(surface),
      "--sidebar-fg": shiftLightness(text, 20),
      "--sidebar-active": hexToHslChannels(accent),
      "--sidebar-active-fg": getReadableForeground(accent),
      "--sidebar-active-bg": hexToHslChannels(accent),
      "--sidebar-hover": shiftLightness(soft, 4),
      "--sidebar-border": shiftLightness(text, 52),
      "--sidebar-heading": hexToHslChannels(text),
      "--sidebar-icon": shiftLightness(text, 20),
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--success": "152 69% 40%",
      "--success-foreground": "0 0% 100%",
      "--warning": "36 77% 49%",
      "--warning-foreground": "0 0% 100%",
      "--critical": "0 72% 51%",
      "--critical-bg": "0 86% 97%",
      "--critical-text": "0 74% 42%",
      "--info": "205 78% 56%",
      "--info-foreground": "0 0% 100%",
      "--shadow-sm": "0 4px 12px 0px rgba(0,0,0,.06)",
      "--shadow": "0 4px 15px 0px rgba(0,0,0,.08)",
      "--shadow-md": "0 10px 20px 0px rgba(0,0,0,.12)",
      "--shadow-lg": "0 18px 40px 0px rgba(0,0,0,.14)",
      "--shadow-xl": "0 25px 50px -12px rgba(0,0,0,.16)",
      "--font-sans": `'${adminAppearance.body_font}', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
      "--radius": "1rem",
      "--store-primary": `${hexToRgb(accent).r} ${hexToRgb(accent).g} ${hexToRgb(accent).b}`,
      "--store-button": `${hexToRgb(adminAppearance.button_color).r} ${hexToRgb(adminAppearance.button_color).g} ${hexToRgb(adminAppearance.button_color).b}`,
      "--sidebar-border-color": footer,
    } as CSSProperties;
  }, [adminAppearance]);

  useEffect(() => {
    if (generalLoading) {
      return;
    }

    const adminTitle = `${effectiveBrandTitle} — لوحة التحكم`;
    document.title = adminTitle;
    try {
      localStorage.setItem("etk:admin-title", adminTitle);
    } catch {
      // Ignore storage failures; title still updates in the current tab.
    }
  }, [effectiveBrandTitle, generalLoading]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const faviconHref = appearance.favicon_url?.trim();
    let faviconTag = document.getElementById("app-favicon");
    if (!faviconTag) {
      faviconTag = document.createElement("link");
      faviconTag.setAttribute("id", "app-favicon");
      faviconTag.setAttribute("rel", "icon");
      faviconTag.setAttribute("type", "image/svg+xml");
      document.head.appendChild(faviconTag);
    }

    const resolvedFavicon = faviconHref || "/images/logo-cart.svg";
    faviconTag.setAttribute("href", resolvedFavicon);

    try {
      if (faviconHref) {
        localStorage.setItem("etk:favicon-url", faviconHref);
      } else {
        localStorage.removeItem("etk:favicon-url");
      }
    } catch {
      // Ignore storage failures; favicon fallback still works.
    }
  }, [loading, appearance.favicon_url]);

  return (
    <div className="min-h-screen bg-background text-foreground" style={adminThemeVars}>
      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div
        className={cn(
          "min-h-screen transition-all duration-300 w-full",
          collapsed ? "lg:mr-[80px] lg:w-[calc(100%-80px)]" : "lg:mr-[260px] lg:w-[calc(100%-260px)]"
        )}
      >
        <AdminHeader onOpenNavigation={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="w-[88vw] max-w-sm p-4" showCloseButton>
          <SheetHeader className="sr-only">
            <SheetTitle>التنقل الإداري</SheetTitle>
            <SheetDescription>الوصول السريع إلى أقسام لوحة التحكم.</SheetDescription>
          </SheetHeader>
          <AdminSidebar
            collapsed={false}
            mobile
            onNavigate={() => setMobileNavOpen(false)}
            onToggle={() => {}}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLayout;
