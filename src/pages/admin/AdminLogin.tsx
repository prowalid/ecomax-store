import { useEffect, useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldCheck, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [requires2fa, setRequires2fa] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const { user, isAdmin, isLoading: authLoading, setSession } = useAuth();

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
    if (!email.trim() || !password.trim()) return;
    if (requires2fa && !twoFactorCode.trim()) return;

    setLoading(true);
    try {
      const payload: any = {
        email: email.trim(),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-white">لوحة التحكم</h1>
          <p className="text-gray-400 text-sm mt-2">سجّل دخولك للوصول إلى لوحة الإدارة</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">البريد الإلكتروني</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={requires2fa}
                placeholder="admin@example.com"
                dir="ltr"
                className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500">كلمة المرور</label>
              <Link to="/admin/recover-password" className="text-[11px] font-bold text-primary hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={requires2fa}
                placeholder="••••••••"
                dir="ltr"
                className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {requires2fa && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <label className="text-xs font-medium text-primary">كود المصادقة الثنائية (الواتساب أو التطبيق)</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-primary/50">
                  <ShieldCheck size={18} />
                </div>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="123456"
                  maxLength={6}
                  dir="ltr"
                  className="w-full h-11 pr-10 pl-4 bg-primary/5 border border-primary/20 rounded-xl text-primary font-bold focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-center tracking-widest text-lg"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
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
      </div>
    </div>
  );
}
