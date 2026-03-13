import type { CSSProperties, ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { defaultAppearance, useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";

interface AdminAuthShellProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

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

const withAlpha = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export default function AdminAuthShell({ icon: Icon, title, description, children }: AdminAuthShellProps) {
  const { settings: appearance } = useAppearanceSettings();
  const { settings: generalSettings } = useStoreSettings("general", {
    store_name: "ECOMAX",
  });

  const effectiveAppearance = appearance || defaultAppearance;
  const brandName = generalSettings.store_name?.trim() || effectiveAppearance.store_name?.trim() || "ECOMAX";
  const logoUrl = effectiveAppearance.logo_url?.trim();

  const pageStyle = {
    background: `radial-gradient(circle at top, ${withAlpha(effectiveAppearance.accent_color, 0.22)} 0%, transparent 36%), linear-gradient(135deg, ${effectiveAppearance.body_bg} 0%, ${withAlpha(effectiveAppearance.header_bg, 0.96)} 48%, ${withAlpha(effectiveAppearance.footer_bg, 0.16)} 100%)`,
    color: effectiveAppearance.header_text,
    fontFamily: `'${effectiveAppearance.body_font}', sans-serif`,
    "--auth-accent": effectiveAppearance.accent_color,
    "--auth-accent-soft": withAlpha(effectiveAppearance.accent_color, 0.16),
    "--auth-accent-softest": withAlpha(effectiveAppearance.accent_color, 0.08),
    "--auth-button-text": effectiveAppearance.button_text,
  } as CSSProperties;

  const panelStyle = {
    background: withAlpha(effectiveAppearance.header_bg, 0.94),
    borderColor: withAlpha(effectiveAppearance.accent_color, 0.18),
    boxShadow: `0 28px 80px ${withAlpha(effectiveAppearance.accent_color, 0.16)}`,
  } as CSSProperties;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" dir="rtl" style={pageStyle}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[32px] border p-6 sm:p-8" style={panelStyle}>
          <div className="text-center">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="mx-auto h-20 max-w-[220px] object-contain" />
            ) : (
              <div
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border bg-white/85 p-3 shadow-sm"
                style={{ borderColor: withAlpha(effectiveAppearance.accent_color, 0.18) }}
              >
                <Icon className="h-9 w-9" style={{ color: effectiveAppearance.accent_color }} />
              </div>
            )}
            <h1
              className="mt-5 text-2xl font-black sm:text-3xl"
              style={{ color: effectiveAppearance.header_text, fontFamily: `'${effectiveAppearance.heading_font}', sans-serif` }}
            >
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7" style={{ color: withAlpha(effectiveAppearance.header_text, 0.72) }}>
              {description}
            </p>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
