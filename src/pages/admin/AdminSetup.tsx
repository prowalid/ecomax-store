import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ShieldCheck, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

export default function AdminSetup() {
  const navigate = useNavigate();
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if any admin exists
    supabase.rpc("admin_count").then(({ data, error }) => {
      if (error) {
        console.error("admin_count error:", error);
        setHasAdmin(true); // Assume admin exists on error to prevent unauthorized setup
      } else {
        setHasAdmin((data ?? 0) > 0);
      }
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
    if (!email.trim() || !password.trim()) return;
    if (password !== confirmPassword) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }
    if (password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      // 1. Create user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error("فشل إنشاء الحساب");

      // 2. Assign admin role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: authData.user.id, role: "admin" });
      if (roleError) throw roleError;

      toast.success("تم إنشاء حساب المدير بنجاح!");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      console.error("Setup error:", err);
      if (err.message?.includes("already registered")) {
        toast.error("هذا البريد مسجل مسبقاً");
      } else {
        toast.error(err.message || "حدث خطأ أثناء الإعداد");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-white">إعداد المدير</h1>
          <p className="text-gray-400 text-sm mt-2">أنشئ حساب المدير الأول للوحة التحكم</p>
        </div>

        <form onSubmit={handleSetup} className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
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
                placeholder="admin@example.com"
                dir="ltr"
                className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
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
                className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
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
                className="w-full h-11 pr-10 pl-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> إنشاء حساب المدير</>}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            هذه الصفحة تظهر مرة واحدة فقط عند إعداد المشروع لأول مرة
          </p>
        </form>
      </div>
    </div>
  );
}
