import { Save, Loader2 } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

interface GeneralSettings {
  store_name: string;
  phone: string;
  email: string;
  currency: string;
  custom_domain: string;
}

const Settings = () => {
  const { settings, setSettings, loading, saving, saveSettings } = useStoreSettings<GeneralSettings>("general", {
    store_name: "ECOMAX",
    phone: "",
    email: "",
    currency: "DZD",
    custom_domain: "",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">الإعدادات</h1>
        <p className="text-sm text-muted-foreground mt-0.5">إعدادات المتجر العامة</p>
      </div>

      <div className="max-w-2xl space-y-4">
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4 animate-slide-in">
          <h3 className="text-base font-semibold text-foreground">معلومات المتجر</h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">اسم المتجر</label>
            <input
              type="text"
              value={settings.store_name}
              onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">رقم الهاتف</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                placeholder="0555 123 456"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                placeholder="admin@store.com"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">العملة</label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            >
              <option value="DZD">دينار جزائري (د.ج)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">النطاق المخصص (الدومين)</label>
            <input
              type="text"
              value={settings.custom_domain}
              onChange={(e) => setSettings({ ...settings, custom_domain: e.target.value })}
              placeholder="www.mystore.com"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => saveSettings(settings)}
            disabled={saving}
            className="h-9 px-6 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
