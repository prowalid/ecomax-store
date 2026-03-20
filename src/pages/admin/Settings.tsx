import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { formatWhatsAppForStorage, normalizeWhatsAppPhone } from "@/lib/whatsapp";
import AdminSaveStatusBadge from "@/components/admin/AdminSaveStatusBadge";
import AdminDataState from "@/components/admin/AdminDataState";

interface GeneralSettings {
  store_name: string;
  phone: string;
  whatsapp_phone: string;
  email: string;
  currency: string;
  meta_title: string;
  meta_description: string;
  social_facebook: string;
  social_instagram: string;
  social_tiktok: string;
}

const Settings = () => {
  const { settings, setSettings, loading, saving, saveSettings, dirty, lastSavedAt } = useStoreSettings<GeneralSettings>("general", {
    store_name: "ECOMAX",
    phone: "",
    whatsapp_phone: "",
    email: "",
    currency: "DZD",
    meta_title: "",
    meta_description: "أفضل متجر للدفع عند الاستلام في الجزائر. نوفر لك جودة استثنائية، سرعة في التوصيل، وتجربة تسوق آمنة تماماً.",
    social_facebook: "",
    social_instagram: "",
    social_tiktok: "",
  });
  const rawWhatsapp = settings.whatsapp_phone || "";
  const normalizedWhatsapp = normalizeWhatsAppPhone(rawWhatsapp);
  const hasWhatsappInput = rawWhatsapp.trim().length > 0;
  const whatsappHasError = hasWhatsappInput && !normalizedWhatsapp;

  const handleSave = async () => {
    if (whatsappHasError) {
      toast.error("رقم واتساب غير صالح. أدخله بصيغة صحيحة مثل: 0555123456 أو +213555123456");
      return;
    }

    const payload: GeneralSettings = {
      ...settings,
      whatsapp_phone: formatWhatsAppForStorage(rawWhatsapp),
    };

    try {
      await saveSettings(payload);
      setSettings(payload);
      const effectiveBrandTitle = settings.meta_title?.trim() || settings.store_name?.trim() || "ECOMAX";
      const storeTitle = settings.meta_title?.trim() || `${effectiveBrandTitle} — متجر إلكتروني`;
      const adminTitle = `${effectiveBrandTitle} — لوحة التحكم`;

      localStorage.setItem("etk:store-title", storeTitle);
      localStorage.setItem("etk:admin-title", adminTitle);
    } catch {
      // Error toast is already handled in the hook.
    }
  };

  if (loading) {
    return <AdminDataState type="loading" title="جاري تحميل الإعدادات" description="يتم تجهيز بيانات المتجر العامة والهوية الوصفية الحالية." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-sidebar-heading">الإعدادات</h1>
          <p className="text-[13px] text-slate-500 mt-1 font-medium">إعدادات المتجر العامة</p>
          <div className="mt-2">
            <AdminSaveStatusBadge saving={saving} dirty={dirty} lastSavedAt={lastSavedAt} />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          data-testid="settings-save-button"
          className="h-11 px-6 flex items-center gap-2 rounded-[14px] bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ الإعدادات
        </button>
      </div>

      <div className="w-full space-y-6">
        {/* Main Settings Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7 space-y-6">
          <h3 className="text-[16px] font-bold text-sidebar-heading border-b border-slate-100 pb-4">معلومات المتجر الأساسية</h3>
          
          <div>
            <label className="block text-[13px] font-semibold text-slate-500 mb-2">اسم المتجر</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              data-testid="settings-store-name-input"
              className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="0555 123 456"
                data-testid="settings-phone-input"
                className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-2">رقم واتساب للزر العائم</label>
              <input
                type="tel"
                value={settings.whatsapp_phone}
                onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value })}
                placeholder="0555 123 456 أو +213555123456"
                data-testid="settings-whatsapp-input"
                className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                dir="ltr"
              />
              <p className={`text-[11px] font-medium mt-2 ${whatsappHasError ? "text-red-500" : "text-slate-400"}`}>
                {whatsappHasError
                  ? "الرقم غير صالح. استخدم أرقام فقط مع + اختياري."
                  : "إذا تُرك الحقل فارغاً لن يظهر زر واتساب في المتجر."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="admin@store.com"
                data-testid="settings-email-input"
                className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-500 mb-2">العملة</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="DZD">دينار جزائري (د.ج)</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[14px] font-bold text-sidebar-heading mb-4">الهوية الوصفية و SEO</h4>
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-500 mb-2">عنوان المتجر في المتصفح ونتائج البحث</label>
                <input
                  type="text"
                  value={settings.meta_title}
                  onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                  placeholder="مثال: متجر الأحذية الرياضية في الجزائر"
                  data-testid="settings-meta-title-input"
                  className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <p className="text-[11px] font-medium text-slate-400 mt-2">إذا تركته فارغاً سيُستخدم اسم المتجر تلقائياً.</p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-500 mb-2">وصف المتجر</label>
                <textarea
                  value={settings.meta_description}
                  onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                  placeholder="وصف مختصر وواضح للمتجر يظهر في محركات البحث وعند مشاركة الصفحة."
                  rows={4}
                  data-testid="settings-meta-description-input"
                  className="w-full px-4 py-3 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-[14px] font-bold text-sidebar-heading mb-4">التواصل الاجتماعي</h4>
            <p className="text-[11px] font-medium text-slate-400 mb-4">أضف روابط حساباتك. ستظهر أيقونة الموقع فقط إذا أدخلت رابطه وحفظت.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-500 mb-2">فيسبوك</label>
                <input
                  type="url"
                  value={settings.social_facebook}
                  onChange={(e) => setSettings({ ...settings, social_facebook: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                  className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-500 mb-2">إنستغرام</label>
                <input
                  type="url"
                  value={settings.social_instagram}
                  onChange={(e) => setSettings({ ...settings, social_instagram: e.target.value })}
                  placeholder="https://instagram.com/yourpage"
                  className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-500 mb-2">تيك توك</label>
                <input
                  type="url"
                  value={settings.social_tiktok}
                  onChange={(e) => setSettings({ ...settings, social_tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@yourpage"
                  className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
