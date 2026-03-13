import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Loader2, ShieldCheck, Phone, Lock, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function PasswordRecovery() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-white">استعادة كلمة المرور</h1>
          <p className="text-gray-400 text-sm mt-2">استعد حسابك عبر رقم الهاتف (واتساب)</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
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
                    className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال كود الواتساب"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-primary">الكود المرسل (6 أرقام)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-primary/50">
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
                    className="w-full h-11 pr-10 pl-4 bg-primary/5 border border-primary/20 rounded-xl text-primary text-center font-bold tracking-widest focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-lg"
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
                    className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
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
      </div>
    </div>
  );
}
