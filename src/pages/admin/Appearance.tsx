import { Palette, Type, Image, Globe, Save, Loader2, SlidersHorizontal, Plus, X, Layers } from "lucide-react";
import { useAppearanceSettings, type AppearanceSettings } from "@/hooks/useAppearanceSettings";

const colorFields: { key: keyof AppearanceSettings; label: string; group: string }[] = [
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

const Appearance = () => {
  const { settings, setSettings, loading, saving, saveSettings } = useAppearanceSettings();

  const update = (key: keyof AppearanceSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const addSlide = () => {
    const url = prompt("ألصق رابط صورة السلايد:");
    if (url?.trim()) update("slides", [...(settings.slides || []), url.trim()]);
  };

  const removeSlide = (idx: number) => {
    update("slides", settings.slides.filter((_: string, i: number) => i !== idx));
  };

  const addCatImage = () => {
    const url = prompt("ألصق رابط صورة التصنيف:");
    if (url?.trim()) update("category_images", [...(settings.category_images || []), url.trim()]);
  };

  const removeCatImage = (idx: number) => {
    update("category_images", settings.category_images.filter((_: string, i: number) => i !== idx));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Group colors
  const groups = [...new Set(colorFields.map((f) => f.group))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">المظهر</h1>
          <p className="text-sm text-muted-foreground mt-1">تحكم كامل في شكل وألوان المتجر</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Logo & Store Name */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">الشعار والاسم</h2>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">رابط الشعار</label>
            <input
              type="text"
              value={settings.logo_url}
              onChange={(e) => update("logo_url", e.target.value)}
              placeholder="https://example.com/logo.png"
              dir="ltr"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
            {settings.logo_url && (
              <img src={settings.logo_url} alt="شعار" className="h-12 object-contain rounded border border-border p-1" />
            )}
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

        {/* All Colors */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4 lg:row-span-2">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">الألوان</h2>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {groups.map((group) => (
              <div key={group}>
                <p className="text-xs font-bold text-muted-foreground mb-2 border-b border-border pb-1">{group}</p>
                <div className="space-y-2">
                  {colorFields
                    .filter((f) => f.group === group)
                    .map((field) => (
                      <div key={field.key} className="flex items-center justify-between">
                        <label className="text-sm text-foreground">{field.label}</label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono" dir="ltr">
                            {(settings as any)[field.key]}
                          </span>
                          <input
                            type="color"
                            value={(settings as any)[field.key]}
                            onChange={(e) => update(field.key, e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fonts */}
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

        {/* Slideshow Images */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">صور السلايدشو</h2>
            </div>
            <button onClick={addSlide} className="h-7 px-2 flex items-center gap-1 rounded-md bg-primary text-primary-foreground text-xs font-medium">
              <Plus className="w-3 h-3" /> إضافة
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(settings.slides || []).map((url: string, idx: number) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-border">
                <img src={url} alt={`سلايد ${idx + 1}`} className="w-full h-24 object-cover" />
                <button
                  onClick={() => removeSlide(idx)}
                  className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{idx + 1}</span>
              </div>
            ))}
          </div>
          {(!settings.slides || settings.slides.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-4">لا توجد صور، أضف صور للسلايدشو</p>
          )}
        </div>

        {/* Category Images */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">صور التصنيفات الافتراضية</h2>
            </div>
            <button onClick={addCatImage} className="h-7 px-2 flex items-center gap-1 rounded-md bg-primary text-primary-foreground text-xs font-medium">
              <Plus className="w-3 h-3" /> إضافة
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(settings.category_images || []).map((url: string, idx: number) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-border">
                <img src={url} alt={`تصنيف ${idx + 1}`} className="w-full h-20 object-cover" />
                <button
                  onClick={() => removeCatImage(idx)}
                  className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          {(!settings.category_images || settings.category_images.length === 0) && (
            <p className="text-xs text-muted-foreground text-center py-4">لا توجد صور افتراضية للتصنيفات</p>
          )}
        </div>

        {/* Domain */}
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
