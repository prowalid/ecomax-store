import { Save } from "lucide-react";

const Marketing = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">إعدادات التسويق</h1>
        <p className="text-muted-foreground text-sm mt-1">ربط Facebook Pixel و CAPI للتتبع المزدوج</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Facebook Pixel */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-1">Facebook Pixel</h3>
          <p className="text-xs text-muted-foreground mb-4">تتبع الأحداث من المتصفح (Browser Events)</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Pixel ID</label>
              <input
                type="text"
                placeholder="مثال: 123456789012345"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* CAPI */}
        <div className="bg-card rounded-lg shadow-card border border-border p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-1">Conversions API (CAPI)</h3>
          <p className="text-xs text-muted-foreground mb-4">تتبع الأحداث من الخادم (Server Events)</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Access Token</label>
              <input
                type="password"
                placeholder="أدخل Access Token"
                className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                dir="ltr"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Webhook */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-foreground mb-1">Webhook (n8n / Zapier)</h3>
        <p className="text-xs text-muted-foreground mb-4">إرسال بيانات الطلبات تلقائياً لأتمتة العمليات</p>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1.5">رابط Webhook</label>
            <input
              type="url"
              placeholder="https://your-webhook-url.com/endpoint"
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              dir="ltr"
            />
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shrink-0">
            <Save className="w-4 h-4" />
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
