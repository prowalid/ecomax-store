import { Globe, Headphones, RotateCcw, ShieldCheck } from "lucide-react";
import { useAppearanceSettings, defaultAppearance } from "@/hooks/useAppearanceSettings";
import { getStoreThemeTokens } from "@/lib/storeTheme";

const badges = [
  { icon: ShieldCheck, title: "دفع آمن", sub: "100% عند الاستلام" },
  { icon: Headphones, title: "دعم العملاء", sub: "متوفر 24/7" },
  { icon: RotateCcw, title: "إرجاع سهل", sub: "ضمان 7 أيام" },
  { icon: Globe, title: "شحن سريع", sub: "لجميع الولايات" },
];

export default function ProductTrustBadges() {
  const { settings: rawTheme, loading } = useAppearanceSettings();
  const theme = loading ? defaultAppearance : rawTheme;
  const tokens = getStoreThemeTokens(theme);

  return (
    <section className="container mx-auto px-4 py-6 mb-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {badges.map((badge) => (
          <div
            key={badge.title}
            className="p-3 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center text-right space-x-3 sm:space-x-4 space-x-reverse transition-all duration-300 group hover:-translate-y-1"
            style={{ backgroundColor: tokens.surface, border: `1px solid ${tokens.border}` }}
          >
            <div className="transition-colors p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shrink-0" style={{ backgroundColor: tokens.surfaceSoft, color: theme.accent_color }}>
              <badge.icon className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[13px] sm:text-lg mb-0.5 truncate" style={{ color: tokens.textPrimary }}>{badge.title}</h3>
              <p className="text-[10px] sm:text-sm truncate" style={{ color: tokens.textMuted }}>{badge.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
