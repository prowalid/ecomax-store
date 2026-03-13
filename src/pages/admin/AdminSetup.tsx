import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldCheck, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";
import AdminAuthShell from "@/components/admin/AdminAuthShell";
import { defaultAppearance, useAppearanceSettings } from "@/hooks/useAppearanceSettings";

type SetupStatusResponse = { hasAdmin: boolean };

export default function AdminSetup() {
  const navigate = useNavigate();
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setSession } = useAuth();
  const { settings: appearance } = useAppearanceSettings();
  const accent = (appearance || defaultAppearance).accent_color;

  useEffect(() => {
    // Check if an admin already exists using the dedicated endpoint
    api.get('/auth/setup-status')
      .then((res: SetupStatusResponse) => {
        setHasAdmin(res.hasAdmin);
      })
      .catch((err) => {
        console.error('Failed to check setup status:', err);
        setHasAdmin(true); // Default to true if API fails so it redirects to login
      });
  }, []);

  // Redirect if admin already exists
  useEffect(() => {
    if (hasAdmin === true) {
      navigate("/admin/login", { replace: true });
    }
  }, [hasAdmin, navigate]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password.trim()) return;
    if (password !== confirmPassword) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }
    if (!/^0[5-7][0-9]{8}$/.test(phone.trim())) {
      toast.error("رقم الهاتف غير صالح. يجب أن يكون رقمًا جزائريًا صحيحًا.");
      return;
    }
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      // 1. Create user and get token
      const response = await api.post('/auth/register', {
        name: name.trim(),
        phone: phone.replace(/\D/g, ""),
        password,
      });

      // 2. Save session
      setSession(response.user);

      toast.success("تم إنشاء حساب المدير بنجاح!");
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      console.error("Setup error:", err);
      const message = err instanceof Error ? err.message : "";
      if (message.includes("already exists")) {
        toast.error("هذا الرقم مسجل مسبقاً");
      } else {
        toast.error(message || "حدث خطأ أثناء الإعداد");
      }
    } finally {
      setLoading(false);
    }
  };

  if (hasAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <AdminAuthShell
      icon={ShieldCheck}
      title="إعداد المدير"
      description="أنشئ حساب المدير الأول بالاسم ورقم الهاتف وكلمة المرور"
    >
      <form onSubmit={handleSetup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">اسم المدير</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="اسم المدير"
                dir="rtl"
                className="w-full h-11 rounded-xl border border-slate-300 bg-white/80 pr-10 pl-4 font-medium text-slate-800 outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">رقم الهاتف</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                required
                placeholder="0555123456"
                dir="ltr"
                className="w-full h-11 rounded-xl border border-slate-300 bg-white/80 pr-10 pl-4 text-slate-800 outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">كلمة المرور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="8 أحرف على الأقل"
                dir="ltr"
                className="w-full h-11 rounded-xl border border-slate-300 bg-white/80 pr-10 pl-4 text-slate-800 outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500">تأكيد كلمة المرور</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="أعد كتابة كلمة المرور"
                dir="ltr"
                className="w-full h-11 rounded-xl border border-slate-300 bg-white/80 pr-10 pl-4 text-slate-800 outline-none transition-all focus:border-[var(--auth-accent)] focus:ring-2 focus:ring-[var(--auth-accent-soft)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: accent, color: "var(--auth-button-text)" }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl font-bold text-base transition-all hover:brightness-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> إنشاء حساب المدير</>}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            هذه الصفحة تظهر مرة واحدة فقط عند إعداد المتجر لأول مرة
          </p>
        </form>
    </AdminAuthShell>
  );
}
