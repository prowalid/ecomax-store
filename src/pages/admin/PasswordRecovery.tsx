import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Loader2, ShieldCheck, Phone, Lock, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import { defaultAppearance, useAppearanceSettings } from "@/hooks/useAppearanceSettings";

export default function PasswordRecovery() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { settings: appearance } = useAppearanceSettings();
  const accent = (appearance || defaultAppearance).accent_color;

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    try {
      await api.post("/auth/recover-password", { phone: phone.replace(/\D/g, "") });
      toast.success("تم إرسال كود الاسترداد إلى رقم الواتساب الخاص بك");
      setStep(2);
    } catch (err: any) {
      toast.error(err.message || err.error || "الرقم غير مسجل أو توجد مشكلة في الإرسال");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !newPassword.trim()) return;

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        phone: phone.replace(/\D/g, ""),
        code: code.trim(),
        newPassword
      });
      toast.success("تم إعادة تعيين كلمة المرور بنجاح. يمكنك الدخول الآن.");
      navigate("/admin/login", { replace: true });
    } catch (err: any) {
      toast.error(err.message || err.error || "الكود خاطئ أو حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthShell
      icon={Lock}
      title="استعادة كلمة المرور"
      description="استعد حسابك عبر رقم الهاتف المرتبط بالمتجر"
    >
      <div>
          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500">رقم الهاتف (المرتبط بالحساب)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="0555123456"
                    dir="ltr"
                    className="w-full h-11 rounded-xl border border-slate-300 bg-white/80 pr-10 pl-4 text-slate-800 outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: accent, color: "var(--auth-button-text)" }}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-base transition-all hover:brightness-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال كود الواتساب"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--auth-accent)]">الكود المرسل (6 أرقام)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--auth-accent)]/50 pointer-events-none">
                    <ShieldCheck size={18} />
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    required
                    maxLength={6}
                    placeholder="123456"
                    dir="ltr"
                    className="h-11 w-full rounded-xl border border-[var(--auth-accent-soft)] bg-[var(--auth-accent-softest)] pr-10 pl-4 text-center text-lg font-bold tracking-widest text-[var(--auth-accent)] outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-gray-500">كلمة المرور الجديدة</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full h-11 rounded-xl border border-slate-300 bg-white/80 pr-10 pl-4 text-slate-800 outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: accent, color: "var(--auth-button-text)" }}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-base transition-all hover:brightness-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تعيين وتأكيد"}
              </button>
            </form>
          )}

          <Link
            to="/admin/login"
            className="flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors mt-6"
          >
            <ChevronRight className="w-4 h-4" />
            العودة إلى تسجيل الدخول
          </Link>
        </div>
    </AdminAuthShell>
  );
}
