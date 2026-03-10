import { useRef, useState } from "react";
import { Palette, Type, Image, Globe, Save, Loader2, SlidersHorizontal, Plus, X, Upload, Smartphone, Monitor, Tag } from "lucide-react";
import { useAppearanceSettings, type AppearanceSettings } from "@/hooks/useAppearanceSettings";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
  const logoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const slideInputRef = useRef<HTMLInputElement>(null);
  const mobileSlideInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [uploadingMobileSlide, setUploadingMobileSlide] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const update = (key: keyof AppearanceSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleUpload = async (file: File): Promise<string | null> => {
    try {
      const data = await api.upload('/upload', file);
      return data.url;
    } catch {
      toast.error("فشل رفع الصورة");
      return null;
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const url = await handleUpload(file);
    if (url) update("logo_url", url);
    setUploadingLogo(false);
    e.target.value = "";
  };
  
  const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFooterLogo(true);
    const url = await handleUpload(file);
    if (url) update("footer_logo_url", url);
    setUploadingFooterLogo(false);
    e.target.value = "";
  };
  
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const url = await handleUpload(file);
    if (url) update("offers_banner_url", url);
    setUploadingBanner(false);
    e.target.value = "";
  };

  const handleSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingSlide(true);
    const newSlides = [...(settings.slides || [])];
    for (const file of Array.from(files)) {
      const url = await handleUpload(file);
      if (url) newSlides.push(url);
    }
    update("slides", newSlides);
    setUploadingSlide(false);
    e.target.value = "";
  };

  const removeSlide = (idx: number) => {
    update("slides", settings.slides.filter((_: string, i: number) => i !== idx));
  };

  const handleMobileSlideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingMobileSlide(true);
    const newSlides = [...(settings.mobile_slides || [])];
    for (const file of Array.from(files)) {
      const url = await handleUpload(file);
      if (url) newSlides.push(url);
    }
    update("mobile_slides", newSlides);
    setUploadingMobileSlide(false);
    e.target.value = "";
  };

  const removeMobileSlide = (idx: number) => {
    update("mobile_slides", (settings.mobile_slides || []).filter((_: string, i: number) => i !== idx));
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
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground">شعار الهيدر (رئيسي)</label>
            <div className="flex items-center gap-3">
              {settings.logo_url ? (
                <div className="relative group">
                  <img src={settings.logo_url} alt="شعار" className="h-16 w-16 object-contain rounded-lg border border-border p-1 bg-background" />
                  <button
                    onClick={() => update("logo_url", "")}
                    className="absolute -top-1.5 -left-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-lg border-2 border-dashed border-input bg-muted/30 flex items-center justify-center">
                  <Image className="w-6 h-6 text-muted-foreground/50" />
                </div>
              )}
              <div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="h-8 px-3 flex items-center gap-2 rounded-lg border border-dashed border-input text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {settings.logo_url ? "تغيير الشعار" : "رفع شعار"}
                </button>
                <p className="text-[10px] text-muted-foreground mt-1.5">المقاس الموصى به: 250×80 بكسل</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 pt-3 border-t border-border/50">
            <label className="text-xs font-medium text-muted-foreground">شعار الفوتر (أسفل الصفحة)</label>
            <div className="flex items-center gap-3">
              {settings.footer_logo_url ? (
                <div className="relative group">
                  <img src={settings.footer_logo_url} alt="شعار الفوتر" className="h-16 w-16 object-contain rounded-lg border border-border p-1 bg-background" />
                  <button
                    onClick={() => update("footer_logo_url", "")}
                    className="absolute -top-1.5 -left-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-lg border-2 border-dashed border-input bg-muted/30 flex items-center justify-center">
                  <Image className="w-6 h-6 text-muted-foreground/50" />
                </div>
              )}
              <div>
                <input ref={footerLogoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFooterLogoUpload} />
                <button
                  onClick={() => footerLogoInputRef.current?.click()}
                  disabled={uploadingFooterLogo}
                  className="h-8 px-3 flex items-center gap-2 rounded-lg border border-dashed border-input text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  {uploadingFooterLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {settings.footer_logo_url ? "تغيير الشعار" : "رفع شعار"}
                </button>
                <p className="text-[10px] text-muted-foreground mt-1.5">شعار فاتح ليتناسب مع الخلفية الداكنة للفوتر</p>
              </div>
            </div>
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
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4 lg:row-span-3">
          <div className="flex items-center gap-3">
            <Palette className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">الألوان</h2>
          </div>
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-1">
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
                          <input
                            type="text"
                            value={(settings as any)[field.key] || "#000000"}
                            onChange={(e) => update(field.key, e.target.value)}
                            className="w-24 h-8 px-2 rounded-md border border-input bg-background text-xs font-mono text-center focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                            dir="ltr"
                          />
                          <div className="relative w-8 h-8 rounded-md overflow-hidden border border-input shrink-0">
                            <input
                              type="color"
                              value={(settings as any)[field.key] || "#000000"}
                              onChange={(e) => update(field.key, e.target.value)}
                              className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer border-0 outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slideshow Images Desktop */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-muted-foreground" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">سلايدشو الحاسوب</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">المقاس: 1920×800 بكسل (أفقي)</p>
              </div>
            </div>
            <div>
              <input ref={slideInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSlideUpload} />
              <button
                onClick={() => slideInputRef.current?.click()}
                disabled={uploadingSlide}
                className="h-7 px-2 flex items-center gap-1 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
              >
                {uploadingSlide ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                رفع صور
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(settings.slides || []).map((url: string, idx: number) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-border">
                <img src={url} alt={`سلايد ${idx + 1}`} className="w-full h-20 object-cover" />
                <button
                  onClick={() => removeSlide(idx)}
                  className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{idx + 1}</span>
              </div>
            ))}
            {uploadingSlide && (
              <div className="rounded-lg border border-dashed border-border h-20 flex items-center justify-center bg-muted/30">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {(!settings.slides || settings.slides.length === 0) && !uploadingSlide && (
            <div className="text-center py-4 border-2 border-dashed border-border rounded-lg">
              <p className="text-xs text-muted-foreground">اضغط "رفع صور" للمتابعة</p>
            </div>
          )}
        </div>
        
        {/* Slideshow Images Mobile */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-muted-foreground" />
              <div>
                <h2 className="text-sm font-semibold text-foreground">سلايدشو الهاتف المحمول</h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">المقاس: 1080×1350 بكسل (عمودي)</p>
              </div>
            </div>
            <div>
              <input ref={mobileSlideInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleMobileSlideUpload} />
              <button
                onClick={() => mobileSlideInputRef.current?.click()}
                disabled={uploadingMobileSlide}
                className="h-7 px-2 flex items-center gap-1 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
              >
                {uploadingMobileSlide ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                رفع صور
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(settings.mobile_slides || []).map((url: string, idx: number) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden border border-border">
                <img src={url} alt={`سلايد موبايل ${idx + 1}`} className="w-full h-24 object-cover" />
                <button
                  onClick={() => removeMobileSlide(idx)}
                  className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{idx + 1}</span>
              </div>
            ))}
            {uploadingMobileSlide && (
              <div className="rounded-lg border border-dashed border-border h-24 flex items-center justify-center bg-muted/30">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          {(!settings.mobile_slides || settings.mobile_slides.length === 0) && !uploadingMobileSlide && (
            <div className="text-center py-4 border-2 border-dashed border-border rounded-lg">
              <p className="text-xs text-muted-foreground">الصور الطولية للهواتف تحافظ على جمال المتجر</p>
            </div>
          )}
        </div>
        
        {/* Offers Banner */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">صورة بانر العروض (تخفيضات)</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">المقاس الموصى به: 1200×400 بكسل</p>
            </div>
          </div>
          <div className="space-y-3">
            {settings.offers_banner_url ? (
              <div className="relative group rounded-lg overflow-hidden border border-border">
                <img src={settings.offers_banner_url} alt="بانر التخفيضات" className="w-full h-24 object-cover" />
                <button
                  onClick={() => update("offers_banner_url", "")}
                  className="absolute top-2 left-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="w-full h-24 bg-muted/30 rounded-lg border-2 border-dashed border-input flex flex-col items-center justify-center">
                <Image className="w-6 h-6 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">لا يوجد صورة بانر حالياً</p>
              </div>
            )}
            
            <div className="flex justify-start">
              <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
              <button
                onClick={() => bannerInputRef.current?.click()}
                disabled={uploadingBanner}
                className="h-8 px-4 flex items-center gap-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {settings.offers_banner_url ? "تغيير صورة البانر" : "رفع صورة البانر"}
              </button>
            </div>
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

      </div>
    </div>
  );
};

export default Appearance;
