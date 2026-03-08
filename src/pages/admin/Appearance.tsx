import { Palette, Type, Image, Globe, Save, Loader2 } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

interface AppearanceSettings {
  logo_url: string;
  store_name: string;
  primary_color: string;
  button_color: string;
  bg_color: string;
  heading_font: string;
  body_font: string;
  custom_domain: string;
}

const Appearance = () => {
  const { settings, setSettings, loading, saving, saveSettings } = useStoreSettings<AppearanceSettings>("appearance", {
    logo_url: "",
    store_name: "متجري",
    primary_color: "#0d6847",
    button_color: "#0d6847",
    bg_color: "#f4f5f7",
    heading_font: "Cairo",
    body_font: "Cairo",
    custom_domain: "",
  });

  const update = (key: keyof AppearanceSettings, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">المظهر</h1>
          <p className="text-sm text-muted-foreground mt-1">تخصيص شكل متجرك</p>
        </div>
        <button
          onClick={() => saveSettings(settings)}
          disabled={saving}
          className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">الشعار</h2>
          </div>
          <div className="border-2 border-dashed border-border rounded-lg h-32 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">اسحب الشعار هنا أو اضغط للرفع</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">اسم المتجر</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => update("store_name", e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">الألوان</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">اللون الرئيسي</label>
              <input type="color" value={settings.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">لون الأزرار</label>
              <input type="color" value={settings.button_color} onChange={(e) => update("button_color", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-foreground">لون الخلفية</label>
              <input type="color" value={settings.bg_color} onChange={(e) => update("bg_color", e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Type className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">الخطوط</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">خط العناوين</label>
              <select
                value={settings.heading_font}
                onChange={(e) => update("heading_font", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option>Cairo</option>
                <option>Tajawal</option>
                <option>IBM Plex Sans Arabic</option>
                <option>Noto Sans Arabic</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">خط النصوص</label>
              <select
                value={settings.body_font}
                onChange={(e) => update("body_font", e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option>Cairo</option>
                <option>Tajawal</option>
                <option>IBM Plex Sans Arabic</option>
                <option>Noto Sans Arabic</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">النطاق</h2>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">النطاق المخصص</label>
            <input
              type="text"
              value={settings.custom_domain}
              onChange={(e) => update("custom_domain", e.target.value)}
              placeholder="www.mystore.com"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appearance;
