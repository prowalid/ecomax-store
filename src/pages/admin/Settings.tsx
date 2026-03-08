import { Save } from "lucide-react";
import { useState } from "react";

const Settings = () => {
  const [storeName, setStoreName] = useState("متجري");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("DZD");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">الإعدادات</h1>
        <p className="text-sm text-muted-foreground mt-0.5">إعدادات المتجر العامة</p>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Store info */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 space-y-4 animate-slide-in">
          <h3 className="text-base font-semibold text-foreground">معلومات المتجر</h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">اسم المتجر</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">رقم الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0555 123 456"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.com"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">العملة</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            >
              <option value="DZD">دينار جزائري (د.ج)</option>
            </select>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-card rounded-lg shadow-card border border-critical/20 p-5 space-y-3 animate-slide-in">
          <h3 className="text-base font-semibold text-critical">منطقة الخطر</h3>
          <p className="text-sm text-muted-foreground">
            حذف جميع بيانات المتجر بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
          </p>
          <button className="h-9 px-4 rounded-lg border border-critical/30 text-critical text-sm font-medium hover:bg-critical-bg transition-colors">
            حذف المتجر
          </button>
        </div>

        <div className="flex justify-end">
          <button className="h-9 px-6 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity">
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
