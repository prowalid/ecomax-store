import { Save, TestTube, CheckCircle2, XCircle, Info, Send, Shield, Eye, ShoppingCart, CreditCard } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateEventId, getFbp, getFbc } from "@/lib/facebook-pixel";
import { toast } from "sonner";

const STANDARD_EVENTS = [
  { name: "PageView", icon: <Eye className="w-4 h-4" />, desc: "عرض صفحة" },
  { name: "ViewContent", icon: <Eye className="w-4 h-4" />, desc: "عرض منتج" },
  { name: "AddToCart", icon: <ShoppingCart className="w-4 h-4" />, desc: "إضافة للسلة" },
  { name: "InitiateCheckout", icon: <CreditCard className="w-4 h-4" />, desc: "بدء الدفع" },
  { name: "Purchase", icon: <CheckCircle2 className="w-4 h-4" />, desc: "شراء" },
  { name: "Lead", icon: <Send className="w-4 h-4" />, desc: "عميل محتمل" },
];

const REQUIRED_PARAMS = [
  { key: "client_ip_address", label: "IP Address", hashed: false, source: "تلقائي من الخادم" },
  { key: "client_user_agent", label: "User Agent", hashed: false, source: "تلقائي من المتصفح" },
  { key: "ph", label: "Phone Number", hashed: true, source: "من بيانات الطلب" },
  { key: "fbp", label: "Browser ID (_fbp)", hashed: false, source: "تلقائي من الكوكيز" },
  { key: "fbc", label: "Click ID (_fbc)", hashed: false, source: "تلقائي من الكوكيز/URL" },
  { key: "fn", label: "First Name", hashed: true, source: "من بيانات الطلب" },
  { key: "ln", label: "Last Name", hashed: true, source: "من بيانات الطلب" },
  { key: "ct", label: "City", hashed: true, source: "من بيانات الطلب" },
  { key: "st", label: "State / Wilaya", hashed: true, source: "من بيانات الطلب" },
  { key: "em", label: "Email", hashed: true, source: "من بيانات الطلب (اختياري)" },
];

const Marketing = () => {
  const [pixelId, setPixelId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testEventCode, setTestEventCode] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [selectedTestEvent, setSelectedTestEvent] = useState("PageView");

  const handleTestEvent = async () => {
    setTestLoading(true);
    setTestResult(null);

    try {
      const eventId = generateEventId();
      const testPayload = {
        event_name: selectedTestEvent,
        event_id: eventId,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: window.location.href,
        user_data: {
          ph: "0555123456",
          fn: "أحمد",
          ln: "بن علي",
          ct: "algiers",
          st: "alger",
          em: "test@example.com",
          fbp: getFbp() || "fb.1.1234567890.1234567890",
          fbc: getFbc() || null,
          client_user_agent: navigator.userAgent,
        },
        custom_data:
          selectedTestEvent === "Purchase"
            ? { value: 2500, currency: "DZD", content_name: "منتج تجريبي" }
            : selectedTestEvent === "ViewContent"
            ? { content_name: "منتج تجريبي", content_ids: ["SKU-001"], content_type: "product" }
            : {},
      };

      const { data, error } = await supabase.functions.invoke("facebook-capi", {
        body: testPayload,
      });

      if (error) {
        setTestResult({ success: false, message: `خطأ: ${error.message}` });
        toast.error("فشل إرسال الحدث التجريبي");
      } else if (data?.success) {
        setTestResult({
          success: true,
          message: `✅ تم الإرسال — events_received: ${data.events_received} | event_id: ${eventId}`,
        });
        toast.success("تم إرسال الحدث بنجاح!");
      } else {
        setTestResult({
          success: false,
          message: `❌ ${data?.error || "خطأ غير معروف"}`,
        });
        toast.error(data?.error || "فشل الإرسال");
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `خطأ: ${err.message}` });
      toast.error("خطأ في الاتصال");
    } finally {
      setTestLoading(false);
    }
  };

  const inputClass =
    "w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">التسويق</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Facebook Pixel + Conversions API — تتبع متقدم مع مطابقة بيانات المستخدم
        </p>
      </div>

      {/* Config Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pixel ID */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">📊</div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Pixel ID</h3>
              <p className="text-xs text-muted-foreground">تتبع أحداث المتصفح</p>
            </div>
          </div>
          <input
            type="text"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            placeholder="123456789012345"
            className={inputClass}
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground mt-2">
            يُحفظ كـ Secret في الخادم — لا يظهر في الكود
          </p>
        </div>

        {/* Access Token */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">🔑</div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Access Token</h3>
              <p className="text-xs text-muted-foreground">CAPI Server-Side</p>
            </div>
          </div>
          <input
            type="password"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="EAAxxxxxxx..."
            className={inputClass}
            dir="ltr"
          />
        </div>

        {/* Test Event Code */}
        <div className="bg-card rounded-lg shadow-card border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">🧪</div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Test Event Code</h3>
              <p className="text-xs text-muted-foreground">اختياري — للاختبار فقط</p>
            </div>
          </div>
          <input
            type="text"
            value={testEventCode}
            onChange={(e) => setTestEventCode(e.target.value)}
            placeholder="TEST12345"
            className={inputClass}
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground mt-2">
            من Events Manager → Test Events
          </p>
        </div>
      </div>

      {/* Data Matching Table */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">مطابقة بيانات المستخدم — User Data Parameters</h3>
            <p className="text-xs text-muted-foreground">
              البيانات التي تُرسل مع كل حدث حسب متطلبات Facebook
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">المعامل</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">التجزئة</th>
                <th className="text-right py-2 px-3 font-medium text-muted-foreground">المصدر</th>
                <th className="text-center py-2 px-3 font-medium text-muted-foreground">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {REQUIRED_PARAMS.map((param) => (
                <tr key={param.key} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{param.key}</code>
                      <span className="text-foreground text-xs">{param.label}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    {param.hashed ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        🔒 SHA-256
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">بدون تجزئة</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-muted-foreground">{param.source}</td>
                  <td className="py-2.5 px-3 text-center">
                    <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 p-3 bg-muted/50 rounded-lg flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            جميع البيانات الشخصية (الهاتف، الاسم، المدينة، الولاية) تُجزّأ بـ SHA-256 قبل الإرسال.
            عنوان IP و User Agent يُجمعان تلقائياً من الخادم.
            <code className="mx-1">_fbp</code> و <code className="mx-1">_fbc</code> يُقرأان من الكوكيز تلقائياً.
            يتم مطابقة الأحداث بين المتصفح والخادم عبر <code className="mx-1">event_id</code> مشترك لمنع التكرار.
          </p>
        </div>
      </div>

      {/* Standard Events */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">الأحداث القياسية المدعومة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STANDARD_EVENTS.map((ev) => (
            <div
              key={ev.name}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-muted/30 text-center"
            >
              <div className="text-primary">{ev.icon}</div>
              <span className="text-xs font-medium text-foreground">{ev.name}</span>
              <span className="text-[10px] text-muted-foreground">{ev.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Test Event Section */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">اختبار الإرسال</h3>
            <p className="text-xs text-muted-foreground">
              أرسل حدث تجريبي إلى Facebook لاختبار الإعداد
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">نوع الحدث</label>
            <select
              value={selectedTestEvent}
              onChange={(e) => setSelectedTestEvent(e.target.value)}
              className={inputClass + " w-48"}
            >
              {STANDARD_EVENTS.map((ev) => (
                <option key={ev.name} value={ev.name}>
                  {ev.name} — {ev.desc}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTestEvent}
            disabled={testLoading}
            className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {testLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            إرسال حدث تجريبي
          </button>
        </div>

        {testResult && (
          <div
            className={`mt-3 p-3 rounded-lg flex items-start gap-2 text-sm ${
              testResult.success
                ? "bg-primary/10 text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <p className="text-xs leading-relaxed" dir="ltr">
              {testResult.message}
            </p>
          </div>
        )}
      </div>

      {/* Webhook */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-lg">⚡</div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Webhook</h3>
            <p className="text-xs text-muted-foreground">
              إرسال بيانات الطلبات تلقائياً إلى n8n أو Zapier
            </p>
          </div>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-foreground mb-1.5">رابط Webhook</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-webhook-url.com/endpoint"
              className={inputClass}
              dir="ltr"
            />
          </div>
          <button className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity shrink-0">
            <Save className="w-4 h-4" />
            حفظ
          </button>
        </div>
      </div>

      {/* Save All */}
      <div className="flex justify-end">
        <button className="h-9 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity">
          حفظ جميع الإعدادات
        </button>
      </div>
    </div>
  );
};

export default Marketing;
