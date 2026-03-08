const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
        <p className="text-muted-foreground text-sm mt-1">إعدادات المتجر العامة</p>
      </div>

      <div className="bg-card rounded-lg shadow-card border border-border p-6 animate-fade-in space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">اسم المتجر</label>
          <input
            type="text"
            defaultValue="متجري"
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">رقم الهاتف</label>
          <input
            type="tel"
            placeholder="0555 123 456"
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">البريد الإلكتروني</label>
          <input
            type="email"
            placeholder="admin@store.com"
            className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            dir="ltr"
          />
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
};

export default Settings;
