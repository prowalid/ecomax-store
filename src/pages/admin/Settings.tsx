import { Save, Loader2, Store, Phone, Globe, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { formatWhatsAppForStorage, normalizeWhatsAppPhone } from "@/lib/whatsapp";
import AdminSaveStatusBadge from "@/components/admin/AdminSaveStatusBadge";
import AdminDataState from "@/components/admin/AdminDataState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

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

const FIELD_CLASS =
  "w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

const LABEL_CLASS = "block text-[13px] font-semibold text-slate-500 mb-2";

interface SectionCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

function SectionCard({ icon: Icon, iconColor, title, children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7 space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="text-[15px] font-bold text-sidebar-heading">{title}</h2>
      </div>
      {children}
    </div>
  );
}

const Settings = () => {
  const { settings, setSettings, loading, saving, saveSettings, dirty, lastSavedAt } =
    useStoreSettings<GeneralSettings>("general", {
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
      // Error toast handled in hook.
    }
  };

  if (loading) {
    return (
      <AdminDataState
        type="loading"
        title="جاري تحميل الإعدادات"
        description="يتم تجهيز بيانات المتجر العامة والهوية الوصفية الحالية."
      />
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الإعدادات"
        description="تحكم في هوية متجرك، معلومات التواصل، والوجود الرقمي."
        actions={
          <div className="flex items-center gap-3">
            <AdminSaveStatusBadge saving={saving} dirty={dirty} lastSavedAt={lastSavedAt} />
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              data-testid="settings-save-button"
              className="h-11 px-6 flex items-center gap-2 rounded-[14px] bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ
            </button>
          </div>
        }
      />

      {/* Section 1: Store identity */}
      <SectionCard icon={Store} iconColor="bg-primary/10 text-primary" title="هوية المتجر">
        <div>
          <label className={LABEL_CLASS}>اسم المتجر</label>
          <input
            type="text"
            value={settings.store_name}
            onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
            data-testid="settings-store-name-input"
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>العملة</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            className={FIELD_CLASS}
          >
            <option value="DZD">دينار جزائري (د.ج)</option>
          </select>
        </div>
      </SectionCard>

      {/* Section 2: Contact */}
      <SectionCard icon={Phone} iconColor="bg-emerald-50 text-emerald-600" title="معلومات التواصل">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={LABEL_CLASS}>رقم الهاتف</label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="0555 123 456"
              data-testid="settings-phone-input"
              className={FIELD_CLASS}
              dir="ltr"
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>رقم واتساب للزر العائم</label>
            <input
              type="tel"
              value={settings.whatsapp_phone}
              onChange={(e) => setSettings({ ...settings, whatsapp_phone: e.target.value })}
              placeholder="0555 123 456 أو +213555123456"
              data-testid="settings-whatsapp-input"
              className={`${FIELD_CLASS} ${whatsappHasError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
              dir="ltr"
            />
            {whatsappHasError && (
              <p className="text-[11px] font-medium mt-2 text-red-500">
                الرقم غير صالح. استخدم أرقام فقط مع + اختياري.
              </p>
            )}
            {!whatsappHasError && hasWhatsappInput && (
              <p className="text-[11px] font-medium mt-2 text-emerald-500">رقم صالح</p>
            )}
            {!hasWhatsappInput && (
              <p className="text-[11px] font-medium mt-2 text-slate-400">
                إذا تُرك فارغاً لن يظهر زر واتساب في المتجر.
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>البريد الإلكتروني</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            placeholder="admin@store.com"
            data-testid="settings-email-input"
            className={FIELD_CLASS}
            dir="ltr"
          />
        </div>
      </SectionCard>

      {/* Section 3: SEO */}
      <SectionCard icon={Globe} iconColor="bg-blue-50 text-blue-500" title="الهوية الوصفية و SEO">
        <div>
          <label className={LABEL_CLASS}>عنوان المتجر في المتصفح ونتائج البحث</label>
          <input
            type="text"
            value={settings.meta_title}
            onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
            placeholder="مثال: متجر الأحذية الرياضية في الجزائر"
            data-testid="settings-meta-title-input"
            className={FIELD_CLASS}
          />
          <p className="text-[11px] font-medium text-slate-400 mt-2">
            إذا تركته فارغاً سيُستخدم اسم المتجر تلقائياً.
          </p>
        </div>

        <div>
          <label className={LABEL_CLASS}>وصف المتجر</label>
          <textarea
            value={settings.meta_description}
            onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
            placeholder="وصف مختصر وواضح للمتجر يظهر في محركات البحث وعند مشاركة الصفحة."
            rows={4}
            data-testid="settings-meta-description-input"
            className="w-full px-4 py-3 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y"
          />
        </div>
      </SectionCard>

      {/* Section 4: Social */}
      <SectionCard icon={Share2} iconColor="bg-purple-50 text-purple-500" title="التواصل الاجتماعي">
        <p className="text-[13px] font-medium text-slate-400 -mt-1">
          أضف روابط حساباتك. ستظهر أيقونة الموقع فقط إذا أدخلت رابطه وحفظت.
        </p>
        <div className="space-y-4">
          {[
            { key: "social_facebook" as const, label: "فيسبوك", placeholder: "https://facebook.com/yourpage" },
            { key: "social_instagram" as const, label: "إنستغرام", placeholder: "https://instagram.com/yourpage" },
            { key: "social_tiktok" as const, label: "تيك توك", placeholder: "https://tiktok.com/@yourpage" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className={LABEL_CLASS}>{label}</label>
              <input
                type="url"
                value={settings[key]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                placeholder={placeholder}
                className={FIELD_CLASS}
                dir="ltr"
              />
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};

export default Settings;
