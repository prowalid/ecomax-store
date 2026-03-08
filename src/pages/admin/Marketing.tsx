import { Save } from "lucide-react";
import { useState } from "react";

const Marketing = () => {
  const [pixelId, setPixelId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">التسويق</h1>
        <p className="text-sm text-muted-foreground mt-0.5">إعدادات التتبع والأتمتة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Facebook Pixel */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 animate-slide-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">📊</div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Facebook Pixel</h3>
              <p className="text-xs text-muted-foreground">تتبع أحداث المتصفح</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Pixel ID</label>
            <input
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="123456789012345"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
              dir="ltr"
            />
          </div>
        </div>

        {/* CAPI */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5 animate-slide-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">🔗</div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Conversions API</h3>
              <p className="text-xs text-muted-foreground">تتبع أحداث الخادم (Server-Side)</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Access Token</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAxxxxxxx..."
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
              dir="ltr"
            />
          </div>
        </div>
      </div>

      {/* Webhook */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5 animate-slide-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">⚡</div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Webhook</h3>
            <p className="text-xs text-muted-foreground">إرسال بيانات الطلبات تلقائياً إلى n8n أو Zapier</p>
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-1.5">رابط Webhook</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-webhook-url.com/endpoint"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
              dir="ltr"
            />
          </div>
          <button className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity shrink-0">
            <Save className="w-4 h-4" />
            حفظ
          </button>
        </div>
      </div>

      {/* Save all */}
      <div className="flex justify-end">
        <button className="h-9 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity">
          حفظ جميع الإعدادات
        </button>
      </div>
    </div>
  );
};

export default Marketing;
