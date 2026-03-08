import { useState } from "react";
import { Bell, Send, CheckCircle2, XCircle, TestTube, MessageCircle, Phone, Settings2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [enabledNotifs, setEnabledNotifs] = useState<Record<string, boolean>>({
    order_confirmed: true,
    order_shipped: true,
    order_delivered: false,
    new_order_admin: true,
  });
  const [adminPhone, setAdminPhone] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("order_confirmed");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const toggleNotif = (key: string) => {
    setEnabledNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestSend = async () => {
    if (!testPhone.trim()) {
      toast.error("أدخل رقم الهاتف للاختبار");
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const testData: Record<string, any> = {
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

      const { data, error } = await supabase.functions.invoke("whatsapp-notify", {
        body: {
          template: selectedTemplate,
          phone: testPhone,
          data: testData,
        },
      });

      if (error) {
        setTestResult({ success: false, message: `خطأ: ${error.message}` });
        toast.error("فشل إرسال الرسالة التجريبية");
      } else if (data?.success) {
        setTestResult({ success: true, message: `✅ تم الإرسال — idMessage: ${data.idMessage}` });
        toast.success("تم إرسال الرسالة بنجاح!");
      } else {
        setTestResult({ success: false, message: `❌ ${data?.error || "خطأ غير معروف"}` });
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
        <h1 className="text-xl font-semibold text-foreground">الإشعارات</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          إشعارات واتساب تلقائية للزبائن والإدارة عبر Green API
        </p>
      </div>

      {/* Green API Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg shadow-card border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[hsl(142_70%_45%/0.1)] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-[hsl(142_70%_45%)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Green API — Instance ID</h3>
              <p className="text-xs text-muted-foreground">معرّف الجلسة من لوحة Green API</p>
            </div>
          </div>
          <input type="text" placeholder="1101234567" className={inputClass} dir="ltr" />
          <p className="text-xs text-muted-foreground mt-2">يُحفظ كـ Secret آمن في الخادم</p>
        </div>

        <div className="bg-card rounded-lg shadow-card border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-[hsl(142_70%_45%/0.1)] flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-[hsl(142_70%_45%)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">API Token</h3>
              <p className="text-xs text-muted-foreground">رمز المصادقة من Green API</p>
            </div>
          </div>
          <input type="password" placeholder="abc123def456..." className={inputClass} dir="ltr" />
        </div>
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
          value={adminPhone}
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
            <p className="text-xs text-muted-foreground">اختر الإشعارات التي تُرسل تلقائياً عند تغيير حالة الطلب</p>
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
                    checked={enabledNotifs[notif.key] || false}
                    onChange={() => toggleNotif(notif.key)}
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

      {/* Test Send */}
      <div className="bg-card rounded-lg shadow-card border border-border p-5">
        <div className="flex items-center gap-3 mb-4">
          <TestTube className="w-5 h-5 text-primary" />
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
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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
            <p className="text-xs leading-relaxed" dir="ltr">
              {testResult.message}
            </p>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button className="h-9 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity">
          حفظ الإعدادات
        </button>
      </div>
    </div>
  );
};

export default Notifications;
