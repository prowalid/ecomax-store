import { Shield, Lock, EyeOff, Save, Loader2, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useState } from "react";

interface SecuritySettings {
  turnstile_enabled: boolean;
  site_key: string;
  secret_key: string;
  honeypot_enabled: boolean;
}

const Security = () => {
  const { settings, setSettings, loading, saving, saveSettings } = useStoreSettings<SecuritySettings>("security", {
    turnstile_enabled: false,
    site_key: "",
    secret_key: "",
    honeypot_enabled: true,
  });

  const [showSecret, setShowSecret] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-sidebar-heading">الأمان والحماية</h1>
          <p className="text-[13px] text-slate-500 mt-1 font-medium">إدارة حماية المتجر من البوتات والطلبات الوهمية</p>
        </div>
        <button
          onClick={() => saveSettings(settings)}
          disabled={saving}
          className="h-11 px-6 flex items-center justify-center gap-2 rounded-[14px] bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 w-full sm:w-auto"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ الإعدادات
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Cloudflare Turnstile Card */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-500" />
              </div>
              <h2 className="text-[15px] font-bold text-sidebar-heading">Cloudflare Turnstile</h2>
            </div>
            <div 
              onClick={() => setSettings({ ...settings, turnstile_enabled: !settings.turnstile_enabled })}
              className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative ${settings.turnstile_enabled ? 'bg-primary' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.turnstile_enabled ? 'right-7' : 'right-1'}`} />
            </div>
          </div>

          <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
            حماية ذكية غير مرئية من كلاودفلير تمنع البوتات من إتمام الطلبات دون إزعاج الزبائن الحقيقيين.
          </p>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-2">Site Key (مفتاح الموقع)</label>
              <input
                type="text"
                value={settings.site_key}
                onChange={(e) => setSettings({ ...settings, site_key: e.target.value })}
                placeholder="0x4AAAAAA..."
                className="w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-2">Secret Key (المفتاح السري)</label>
              <div className="relative">
                <input
                  type={showSecret ? "text" : "password"}
                  value={settings.secret_key}
                  onChange={(e) => setSettings({ ...settings, secret_key: e.target.value })}
                  placeholder="0x4AAAAAA..."
                  className="w-full h-11 pr-4 pl-12 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  dir="ltr"
                />
                <button 
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-[12px] text-blue-700 leading-relaxed">
              يمكنك الحصول على هذه المفاتيح مجاناً من لوحة تحكم Cloudflare في قسم Turnstile. تجد شرح الطريقة في التوثيق.
            </div>
          </div>
        </div>

        {/* Other Protections */}
        <div className="space-y-6">
          <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-7">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-orange-500" />
              </div>
              <h2 className="text-[15px] font-bold text-sidebar-heading">طبقات الحماية التلقائية</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <span className="text-green-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-sidebar-heading mb-1">مصيدة البوتات (Honey Pot)</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    حقل مخفي لا يراه الزبون الحقيقي ولكن تملأه البوتات تلقائياً، مما يسمح للسيرفر بكشفهم وحظرهم فوراً.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-600 mt-2 bg-green-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> مفعّل دائماً بالخفاء
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <span className="text-purple-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-sidebar-heading mb-1">التحقق من صحة الرقم (Algerian Phone)</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    يمنع إرسال أي طلب برقم لا يتوافق مع الصيغة الجزائرية الرسمية (05/06/07) لضمان جودة الطلبات.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-600 mt-2 bg-green-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> مفعّل تلقائياً
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <span className="text-red-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-sidebar-heading mb-1">منع تكرار الطلبات (Spam Check)</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    فحص ذكي للـ IP ورقم الهاتف لمنع تكرار نفس الطلب عدة مرات في وقت قصير من قبل نفس المصدر.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-green-600 mt-2 bg-green-50 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> مفعّل تلقائياً
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className={`p-5 rounded-[24px] border ${settings.turnstile_enabled ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'} transition-colors`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${settings.turnstile_enabled ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-slate-300'}`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-sidebar-heading">حالة الحماية الحالية</h3>
                <p className={`text-[12px] font-bold ${settings.turnstile_enabled ? 'text-green-600' : 'text-slate-500'}`}>
                  {settings.turnstile_enabled ? 'المتجر محصن بطبقات حماية متقدمة' : 'المتجر يعمل بطبقات الحماية الافتراضية'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
