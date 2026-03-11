import type { AppearanceSettings } from "@/hooks/useAppearanceSettings";

interface AppearancePreviewCardProps {
  settings: AppearanceSettings;
}

export default function AppearancePreviewCard({ settings }: AppearancePreviewCardProps) {
  const storeName = settings.store_name || "اسم المتجر";
  const logo = settings.logo_url;
  const footerLogo = settings.footer_logo_url || settings.logo_url;

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-[15px] font-bold text-sidebar-heading">معاينة سريعة</h2>
          <p className="text-[12px] font-medium text-slate-400 mt-1">صورة تقريبية لما سيظهر في الواجهة بعد الحفظ</p>
        </div>
        <div
          className="rounded-full px-3 py-1 text-[11px] font-bold"
          style={{ backgroundColor: `${settings.accent_color}14`, color: settings.accent_color }}
        >
          Live Preview
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
        <div
          className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold"
          style={{ backgroundColor: settings.top_bar_bg, color: settings.top_bar_text }}
        >
          <span>توصيل سريع لكل الولايات</span>
          <span>دفع عند الاستلام</span>
        </div>

        <div
          className="flex items-center justify-between gap-4 px-4 py-4 border-b border-slate-200"
          style={{ backgroundColor: settings.header_bg, color: settings.header_text }}
        >
          <div className="min-w-0">
            {logo ? (
              <img src={logo} alt={storeName} className="h-9 object-contain" />
            ) : (
              <span
                className="block truncate text-lg font-black"
                style={{ fontFamily: `'${settings.heading_font}', sans-serif` }}
              >
                {storeName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full px-3 py-1 text-[11px] font-bold" style={{ backgroundColor: settings.body_bg }}>
              المنتجات
            </span>
            <button
              type="button"
              className="rounded-full px-4 py-2 text-[12px] font-bold"
              style={{ backgroundColor: settings.button_color, color: settings.button_text }}
            >
              اطلب الآن
            </button>
          </div>
        </div>

        <div className="p-4" style={{ backgroundColor: settings.body_bg }}>
          <div
            className="rounded-[18px] p-4 shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${settings.accent_color}, ${settings.button_color})`,
              color: "#ffffff",
            }}
          >
            <div className="text-[11px] font-bold uppercase opacity-90">Hero</div>
            <div
              className="mt-2 text-xl font-black"
              style={{ fontFamily: `'${settings.heading_font}', sans-serif` }}
            >
              واجهة المتجر
            </div>
            <p className="mt-2 text-[12px] opacity-90" style={{ fontFamily: `'${settings.body_font}', sans-serif` }}>
              هذه معاينة سريعة للألوان والهوية البصرية والزر الرئيسي.
            </p>
          </div>
        </div>

        <div className="px-4 py-5" style={{ backgroundColor: settings.footer_bg, color: settings.footer_text }}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              {footerLogo ? (
                <img src={footerLogo} alt={`${storeName} footer`} className="h-8 object-contain" />
              ) : (
                <div
                  className="truncate text-base font-black"
                  style={{ fontFamily: `'${settings.heading_font}', sans-serif` }}
                >
                  {storeName}
                </div>
              )}
              <p className="mt-1 text-[11px] opacity-80">فوتر احترافي ومتناسق مع هوية المتجر</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold"
              style={{ backgroundColor: `${settings.footer_accent}22`, color: settings.footer_accent }}
            >
              CTA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
