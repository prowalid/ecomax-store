import { useRef, useState } from "react";
import { Type, Image, Save, Loader2, X, Upload, Tag, Layers3 } from "lucide-react";
import { useEditableAppearanceSettings, type AppearanceSettings, type AppearanceSlide } from "@/hooks/useAppearanceSettings";
import { api } from "@/lib/api";
import { toast } from "sonner";
import AdminSaveStatusBadge from "@/components/admin/AdminSaveStatusBadge";
import AppearanceUploadCard from "@/components/admin/appearance/AppearanceUploadCard";
import AppearanceSlidesSection from "@/components/admin/appearance/AppearanceSlidesSection";
import AppearancePresetsCard from "@/components/admin/appearance/AppearancePresetsCard";
import { appearancePresets } from "@/components/admin/appearance/types";
import AdminDataState from "@/components/admin/AdminDataState";

const Appearance = () => {
  const { settings, setSettings, loading, saving, saveSettings, dirty, lastSavedAt } = useEditableAppearanceSettings();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const slideInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const update = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleUpload = async (file: File): Promise<string | null> => {
    try {
      const data = (await api.upload('/upload', file)) as { url: string };
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

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFavicon(true);
    const url = await handleUpload(file);
    if (url) update("favicon_url", url);
    setUploadingFavicon(false);
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
      if (url) newSlides.push({ image_url: url, href: "" });
    }
    update("slides", newSlides);
    setUploadingSlide(false);
    e.target.value = "";
  };

  const removeSlide = (idx: number) => {
    update("slides", settings.slides.filter((_: AppearanceSlide, i: number) => i !== idx));
  };

  const updateSlideLink = (idx: number, href: string) => {
    update("slides", settings.slides.map((slide, index) => (index === idx ? { ...slide, href } : slide)));
  };

  const applyPreset = (presetId: string) => {
    const preset = appearancePresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setSettings((current) => ({
      ...current,
      ...preset.colors,
    }));
    toast.success(`تم تطبيق قالب ${preset.name}`);
  };

  if (loading) {
    return <AdminDataState type="loading" title="جاري تحميل المظهر" description="يتم تجهيز الألوان والشعارات والعناصر البصرية الحالية." />;
  }

  return (
    <div className="space-y-6 w-full">
      <input
        ref={slideInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        multiple
        className="hidden"
        onChange={handleSlideUpload}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-sidebar-heading">المظهر</h1>
          <p className="text-[13px] text-slate-500 mt-1 font-medium">تحكم كامل في شكل وألوان المتجر الخاص بك</p>
          <div className="mt-2">
            <AdminSaveStatusBadge saving={saving} dirty={dirty} lastSavedAt={lastSavedAt} />
          </div>
        </div>
        <button
          onClick={() => saveSettings()}
          disabled={saving || !dirty}
          className="h-11 px-6 flex items-center justify-center gap-2 rounded-[14px] bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 w-full sm:w-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Logos & Brand Assets */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-5 sm:p-7 space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Image className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className="text-[15px] font-bold text-sidebar-heading">الشعارات والهوية</h2>
          </div>
          
          <div className="space-y-3">
            <label className="block text-[13px] font-semibold text-slate-500">شعار الهيدر (رئيسي)</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
              {settings.logo_url ? (
                <div className="relative group shrink-0">
                  <img src={settings.logo_url} alt="شعار" className="h-16 w-16 object-contain rounded-xl border border-slate-200 p-1 bg-white shadow-sm" />
                  <button
                    onClick={() => update("logo_url", "")}
                    className="absolute -top-2 -left-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full p-1.5 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center shrink-0">
                  <Image className="w-6 h-6 text-slate-300" />
                </div>
              )}
              <div>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="h-10 px-5 rounded-[12px] bg-primary/10 text-primary text-[13px] font-bold hover:bg-primary/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {settings.logo_url ? "تغيير الشعار" : "رفع شعار جديد"}
                </button>
                <p className="text-[11px] font-medium text-slate-400 mt-2">المقاس الموصى به: 250×80 بكسل</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <label className="block text-[13px] font-semibold text-slate-500">شعار الفوتر (أسفل الصفحة)</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
              {settings.footer_logo_url ? (
                <div className="relative group shrink-0">
                  <img src={settings.footer_logo_url} alt="شعار الفوتر" className="h-16 w-16 object-contain rounded-xl border border-slate-200 p-1 bg-white shadow-sm" />
                  <button
                    onClick={() => update("footer_logo_url", "")}
                    className="absolute -top-2 -left-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full p-1.5 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center shrink-0">
                  <Image className="w-6 h-6 text-slate-300" />
                </div>
              )}
              <div>
                <input ref={footerLogoInputRef} type="file" accept="image/*" className="hidden" onChange={handleFooterLogoUpload} />
                <button
                  onClick={() => footerLogoInputRef.current?.click()}
                  disabled={uploadingFooterLogo}
                  className="h-10 px-5 rounded-[12px] bg-primary/10 text-primary text-[13px] font-bold hover:bg-primary/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadingFooterLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {settings.footer_logo_url ? "تغيير الشعار" : "رفع الشعار المفرغ"}
                </button>
                <p className="text-[11px] font-medium text-slate-400 mt-2">شعار فاتح ليتناسب مع الخلفية الداكنة للفوتر</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <label className="block text-[13px] font-semibold text-slate-500">Favicon المتجر</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
              {settings.favicon_url ? (
                <div className="relative group shrink-0">
                  <img src={settings.favicon_url} alt="Favicon" className="h-16 w-16 object-contain rounded-xl border border-slate-200 p-2 bg-white shadow-sm" />
                  <button
                    onClick={() => update("favicon_url", "")}
                    className="absolute -top-2 -left-2 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-full p-1.5 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-200 bg-white flex items-center justify-center shrink-0">
                  <Image className="w-6 h-6 text-slate-300" />
                </div>
              )}
              <div>
                <input ref={faviconInputRef} type="file" accept="image/png,image/x-icon,image/webp" className="hidden" onChange={handleFaviconUpload} />
                <button
                  onClick={() => faviconInputRef.current?.click()}
                  disabled={uploadingFavicon}
                  className="h-10 px-5 rounded-[12px] bg-primary/10 text-primary text-[13px] font-bold hover:bg-primary/20 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {settings.favicon_url ? "تغيير الفاف أيكون" : "رفع فاف أيكون"}
                </button>
                <p className="text-[11px] font-medium text-slate-400 mt-2">يفضل مقاس مربع 32×32 أو 64×64 بكسل.</p>
              </div>
            </div>
          </div>
        </div>
        <AppearancePresetsCard settings={settings} onApplyPreset={applyPreset} />

        <AppearanceSlidesSection
          title="سلايدشو الواجهة الرئيسي"
          description="المقاس الموصى به: 1920×800 بكسل"
          helperText="هذه هي صور السلايدشو الوحيدة المعتمدة على جميع الأجهزة. يمكنك إضافة رابط اختياري لكل صورة لتوجيه الزبون إلى منتج أو صفحة محددة."
          icon={
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Layers3 className="w-4 h-4 text-blue-500" />
            </div>
          }
          buttonLabel="إضافة صور"
          uploading={uploadingSlide}
          slides={settings.slides || []}
          previewHeightClass="h-28"
          columnsClass="sm:grid-cols-2"
          emptyLabel='اضغط "إضافة صور" للبدء بتشكيل سلايدشو رائع للمتجر'
          onUploadClick={() => slideInputRef.current?.click()}
          onRemove={removeSlide}
          onLinkChange={updateSlideLink}
        />
        
        <AppearanceUploadCard
          title="صورة بانر التخفيضات"
          description="المقاس الموصى به: 1200×400 بكسل"
          icon={
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
              <Tag className="w-4 h-4 text-pink-500" />
            </div>
          }
          buttonLabel={settings.offers_banner_url ? "استبدال البانر" : "رفع بانر التخفيضات"}
          emptyLabel="لا يوجد بانر لعرضه حالياً"
          imageUrl={settings.offers_banner_url}
          previewHeightClass="h-32"
          uploading={uploadingBanner}
          onUpload={(files) => {
            const [file] = Array.from(files);
            if (!file) return;
            setUploadingBanner(true);
            handleUpload(file).then((url) => {
              if (url) update("offers_banner_url", url);
            }).finally(() => setUploadingBanner(false));
          }}
          onClear={() => update("offers_banner_url", "")}
        />

        {/* Fonts */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-5 sm:p-7 space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Type className="w-4 h-4 text-teal-600" />
            </div>
            <h2 className="text-[15px] font-bold text-sidebar-heading">الخطوط ونظام الكتابة</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-2">خط العناوين البارزة</label>
              <select
                value={settings.heading_font}
                onChange={(e) => update("heading_font", e.target.value)}
                className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-bold text-sidebar-heading focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option>Cairo</option>
                <option>Tajawal</option>
                <option>IBM Plex Sans Arabic</option>
                <option>Noto Sans Arabic</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-2">خط النصوص العادية</label>
              <select
                value={settings.body_font}
                onChange={(e) => update("body_font", e.target.value)}
                className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
