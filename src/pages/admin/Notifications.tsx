import { useEffect, useState } from "react";
import { Bell, Send, CheckCircle2, XCircle, MessageCircle, Phone, Settings2, FileText, Loader2, Save, Wifi, WifiOff } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import AdminIntegrationStatusNote from "@/components/admin/AdminIntegrationStatusNote";
import AdminSecureField from "@/components/admin/AdminSecureField";

const NOTIFICATION_TYPES = [
  { key: "order_confirmed", label: "تأكيد الطلب", desc: "إشعار للزبون عند تأكيد طلبه", icon: "✅", target: "customer" },
  { key: "order_shipped", label: "شحن الطلب", desc: "إشعار عند شحن الطلب مع رقم التتبع", icon: "🚚", target: "customer" },
  { key: "order_delivered", label: "تسليم الطلب", desc: "إشعار عند تسليم الطلب بنجاح", icon: "🎉", target: "customer" },
  { key: "new_order_admin", label: "طلب جديد للإدارة", desc: "إشعار لصاحب المتجر عند وصول طلب جديد", icon: "🔔", target: "admin" },
];

const TEMPLATE_PREVIEWS: Record<string, string> = {
  order_confirmed: `✅ *تأكيد الطلب #1234*\n\nمرحباً أحمد،\nتم تأكيد طلبك بنجاح.\n\n📦 المنتجات: حذاء رياضي x1\n💰 المبلغ: 4500 د.ج\n\nشكراً لثقتك بنا! 🙏`,
  order_shipped: `🚚 *طلبك #1234 في الطريق!*\n\nمرحباً أحمد،\nتم شحن طلبك.\n\n📋 رقم التتبع: TR-789456\n🏢 شركة الشحن: يلديز\n\nسيصلك قريباً إن شاء الله!`,
  order_delivered: `🎉 *تم تسليم طلبك #1234*\n\nمرحباً أحمد،\nتم تسليم طلبك بنجاح.\n\nنتمنى أن ينال المنتج إعجابك! ⭐\nلا تتردد في التواصل معنا لأي استفسار.`,
  new_order_admin: `🔔 *طلب جديد #1234*\n\n👤 الزبون: أحمد بن علي\n📞 الهاتف: 0555123456\n📍 العنوان: حي 500 مسكن\n🏙️ الولاية: الجزائر\n\n📦 المنتجات: حذاء رياضي x1\n💰 المبلغ: 4500 د.ج`,
};

const Notifications = () => {
  const {
    settings,
    loading,
    saving,
    saveSettings,
    toggleNotification,
    setAdminPhone,
    markApiConfigured,
  } = useNotificationSettings();

  const [instanceId, setInstanceId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [apiValidating, setApiValidating] = useState(false);
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; state?: string } | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  useEffect(() => {
    setInstanceId(settings.instance_id || "");
    setApiToken(settings.api_token || "");
  }, [settings.instance_id, settings.api_token]);

  // Test send state
  const [testPhone, setTestPhone] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("order_confirmed");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleValidateAndSaveApi = async () => {
    if (!instanceId.trim() || !apiToken.trim()) {
      toast.error("أدخل Instance ID و API Token");
      return;
    }

    setApiValidating(true);
    setApiStatus(null);

    try {
      const data = await api.post('/integrations/update-green-api', { instance_id: instanceId, api_token: apiToken });

      if (data?.success) {
        setApiStatus({ connected: true, state: data.state });
        markApiConfigured(true);
        toast.success("تم التحقق وحفظ بيانات Green API بنجاح");
      } else {
        setApiStatus({ connected: false });
        // Make sure to display the error we sent from node backend
        toast.error(data?.error || "بيانات API غير صالحة");
      }
    } catch (err: unknown) {
      setApiStatus({ connected: false });
      const message = err instanceof Error ? err.message : "خطأ في الاتصال";
      toast.error(message);
    } finally {
      setApiValidating(false);
    }
  };

  const handleSaveSettings = async () => {
    await saveSettings(settings);
  };

  const handleTestSend = async () => {
    if (!testPhone.trim()) {
      toast.error("أدخل رقم الهاتف للاختبار");
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const testData = {
        order_id: "TEST-" + Math.floor(Math.random() * 9999),
        customer_name: "أحمد بن علي",
        customer_phone: "0555123456",
        items: "منتج تجريبي x1",
        total: "2500",
        address: "حي 500 مسكن، باب الزوار",
        state: "الجزائر",
        tracking_number: "TR-789456",
        shipping_company: "يلديز إكسبراس",
      };

      const data = await api.post('/integrations/whatsapp-notify', { template: selectedTemplate, phone: testPhone, data: testData });

      if (data?.success) {
        setTestResult({ success: true, message: `✅ تم الإرسال بنجاح` });
        toast.success("تم إرسال الرسالة بنجاح!");
      } else {
        setTestResult({ success: false, message: `❌ ${data?.error || "خطأ غير معروف"}` });
        toast.error(data?.error || "فشل الإرسال");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "خطأ غير معروف";
      setTestResult({ success: false, message: `خطأ: ${message}` });
      toast.error("خطأ في الاتصال");
    } finally {
      setTestLoading(false);
    }
  };

  const inputClass =
    "w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">الإشعارات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إشعارات واتساب تلقائية عند تغيير حالة الطلبات
          </p>
        </div>
        <div className="flex items-center gap-4">
          {settings.api_configured ? (
            <span className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              <Wifi className="w-3.5 h-3.5" /> متصل
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              <WifiOff className="w-3.5 h-3.5" /> غير متصل
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="h-11 px-6 flex items-center gap-2 rounded-[14px] bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ الإعدادات
          </button>
        </div>
      </div>

      <AdminIntegrationStatusNote
        configured={settings.api_configured}
        configuredTitle="إعداد Green API محفوظ ومفعل"
        configuredDescription="بيانات الاتصال الحالية محفوظة بأمان داخل النظام. لن نعرضها هنا بشكل صريح، ويمكنك إدخال بيانات جديدة فقط إذا أردت استبدال الإعداد الحالي."
        pendingTitle="Green API غير مهيأ بعد"
        pendingDescription="أدخل Instance ID وAPI Token ثم نفّذ التحقق والحفظ لتفعيل إشعارات واتساب."
      />

      {/* Green API Config */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[hsl(142_70%_45%/0.1)] flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[hsl(142_70%_45%)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">إعداد Green API</h3>
            <p className="text-xs text-muted-foreground">نفس منطق العرض الآمن الموحّد مع صفحة التسويق</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AdminSecureField
            title="Instance ID"
            description="المعرّف التشغيلي الخاص بوصلة Green API."
            configured={settings.api_configured}
            type="text"
            value={instanceId}
            onChange={(e) => setInstanceId(e.target.value)}
            placeholder="1101234567"
            dir="ltr"
          />
          <AdminSecureField
            title="API Token"
            description="الرمز السري المستخدم لإرسال رسائل واتساب."
            configured={settings.api_configured && !!settings.api_token}
            type="password"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="abc123def456..."
            dir="ltr"
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleValidateAndSaveApi}
            disabled={apiValidating || (!instanceId.trim() && !apiToken.trim())}
            className="h-9 px-4 flex items-center gap-2 rounded-lg bg-[hsl(142_70%_45%)] text-white text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {apiValidating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Settings2 className="w-4 h-4" />
            )}
            تحقق وحفظ
          </button>
          {apiStatus && (
            <span className={`text-xs ${apiStatus.connected ? "text-primary" : "text-destructive"}`}>
              {apiStatus.connected ? `✅ متصل (${apiStatus.state})` : "❌ فشل الاتصال"}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          البيانات تُحفظ بشكل آمن كـ Secrets في الخادم ولا تظهر في الواجهة
        </p>
      </div>

      {/* Admin Phone */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <Phone className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">رقم هاتف الإدارة</h3>
            <p className="text-xs text-muted-foreground">الرقم الذي يستقبل إشعارات الطلبات الجديدة</p>
          </div>
        </div>
        <input
          type="tel"
          value={settings.admin_phone}
          onChange={(e) => setAdminPhone(e.target.value)}
          placeholder="0555123456"
          className={inputClass + " max-w-xs"}
          dir="ltr"
        />
      </div>

      {/* Notification Toggles */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">الإشعارات التلقائية</h3>
            <p className="text-xs text-muted-foreground">تُرسل تلقائياً عند تغيير حالة الطلب من صفحة الطلبات</p>
          </div>
        </div>

        <div className="space-y-1">
          {NOTIFICATION_TYPES.map((notif) => (
            <div
              key={notif.key}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{notif.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{notif.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${notif.target === "admin" ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                      {notif.target === "admin" ? "إدارة" : "زبون"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{notif.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTemplate(previewTemplate === notif.key ? null : notif.key)}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="معاينة القالب"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled_notifications[notif.key] || false}
                    onChange={() => toggleNotification(notif.key)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:right-0.5 after:bg-card after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-[-16px]" />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Preview */}
      {previewTemplate && (
        <div className="bg-card rounded-lg shadow-card border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            معاينة قالب: {NOTIFICATION_TYPES.find((n) => n.key === previewTemplate)?.label}
          </h3>
          <div className="bg-[hsl(142_70%_45%/0.05)] border border-[hsl(142_70%_45%/0.2)] rounded-lg p-4">
            <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans" dir="auto">
              {TEMPLATE_PREVIEWS[previewTemplate]}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            * البيانات أعلاه تجريبية — القالب يُملأ تلقائياً ببيانات الطلب الحقيقية
          </p>
        </div>
      )}

      {/* Test Send — only when API is configured */}
      {settings.api_configured && (
        <div className="bg-card rounded-lg shadow-card border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <Send className="w-5 h-5 text-primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">اختبار الإرسال</h3>
              <p className="text-xs text-muted-foreground">أرسل رسالة تجريبية للتأكد من عمل الإعداد</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">القالب</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className={inputClass + " w-52"}
              >
                {NOTIFICATION_TYPES.map((n) => (
                  <option key={n.key} value={n.key}>
                    {n.icon} {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">رقم الهاتف</label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="0555123456"
                className={inputClass + " w-44"}
                dir="ltr"
              />
            </div>

            <button
              onClick={handleTestSend}
              disabled={testLoading}
              className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {testLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              إرسال تجريبي
            </button>
          </div>

          {testResult && (
            <div
              className={`mt-3 p-3 rounded-lg flex items-start gap-2 text-sm ${
                testResult.success ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              )}
              <p className="text-xs leading-relaxed">{testResult.message}</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Notifications;
