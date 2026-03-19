import { useEffect, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldCheck, Phone, Lock } from "lucide-react";
import { toast } from "sonner";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import { defaultAppearance, useAppearanceSettings } from "@/hooks/useAppearanceSettings";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [requires2fa, setRequires2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const { user, isAdmin, isLoading: authLoading, setSession } = useAuth();
  const { settings: appearance } = useAppearanceSettings();
  const accent = (appearance || defaultAppearance).accent_color;

  useEffect(() => {
    if (authLoading) return;
    if (user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [authLoading, user, isAdmin, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) return;
    if (requires2fa && !twoFactorCode.trim()) return;
    if (!/^0[5-7][0-9]{8}$/.test(phone.trim())) {
      toast.error("رقم الهاتف غير صالح. يجب أن يكون رقمًا جزائريًا صحيحًا.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        phone: phone.replace(/\D/g, ""),
        password,
      };
      
      if (requires2fa) {
        payload.twoFactorCode = twoFactorCode.trim();
      }

      const response = await api.post('/auth/login', payload);

      if (response.user.role !== "admin") {
        toast.error("هذا الحساب ليس لديه صلاحيات المدير");
        return;
      }

      setSession(response.user);
      
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      console.error("Login error:", err);
      
      if (err?.requires_2fa || err?.message?.includes('Two-factor authentication code required')) {
        setRequires2fa(true);
        toast.info("هذا الحساب محمي. أدخل كود المصادقة.");
      } else {
        const message = err instanceof Error ? err.message : err?.error || "البريد أو كلمة المرور غير صحيح";
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthShell
      icon={ShieldCheck}
      title="لوحة التحكم"
      description="سجّل دخولك للوصول إلى لوحة الإدارة"
    >
      <form onSubmit={handleLogin} className="space-y-4" autoComplete="on" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="admin-login-username" className="text-xs font-medium text-gray-500">رقم الهاتف</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                id="admin-login-username"
                name="username"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                required
                disabled={requires2fa}
                placeholder="0555123456"
                autoComplete="username"
                inputMode="tel"
                dir="ltr"
                className="w-full h-11 rounded-xl border border-slate-300 bg-white/80 pr-10 pl-4 text-slate-800 outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)] disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="admin-login-password" className="text-xs font-medium text-gray-500">كلمة المرور</label>
              <Link to="/admin/recover-password" className="text-[11px] font-bold text-[var(--auth-accent)] hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="admin-login-password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={requires2fa}
                placeholder="••••••••"
                autoComplete="current-password"
                dir="ltr"
                className="w-full h-11 rounded-xl border border-slate-300 bg-white/80 pr-10 pl-4 text-slate-800 outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)] disabled:opacity-50"
              />
            </div>
          </div>

          {requires2fa && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <label htmlFor="admin-login-otp" className="text-xs font-medium text-[var(--auth-accent)]">كود المصادقة الثنائية من التطبيق</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--auth-accent)]/50 pointer-events-none">
                  <ShieldCheck size={18} />
                </div>
                <input
                  id="admin-login-otp"
                  name="one-time-code"
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="123456"
                  maxLength={6}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  dir="ltr"
                  className="h-11 w-full rounded-xl border border-[var(--auth-accent-soft)] bg-[var(--auth-accent-softest)] pr-10 pl-4 text-center text-lg font-bold tracking-widest text-[var(--auth-accent)] outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: accent, color: "var(--auth-button-text)" }}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-base transition-all hover:brightness-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : requires2fa ? "تحقق ودخول" : "تسجيل الدخول"}
          </button>

          {requires2fa && (
            <button
              type="button"
              onClick={() => { setRequires2fa(false); setTwoFactorCode(""); }}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-700 transition-colors mt-2"
            >
              إلغاء وإعادة كتابة البيانات
            </button>
          )}

          <Link
            to="/"
            className="block text-center text-xs text-gray-400 hover:text-gray-600 transition-colors mt-2"
          >
            العودة إلى المتجر
          </Link>
        </form>
    </AdminAuthShell>
  );
}
