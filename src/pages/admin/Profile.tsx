import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldCheck, User, KeyRound, Smartphone, AlertTriangle } from "lucide-react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";

const FIELD_CLASS =
  "w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

const LABEL_CLASS = "block text-[13px] font-semibold text-slate-500 mb-2";

const BTN_PRIMARY =
  "w-full h-11 rounded-[14px] bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2";

interface SectionCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function SectionCard({ icon: Icon, iconColor, title, description, children, className = "" }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-[24px] shadow-sm border border-slate-100 p-7 space-y-5 ${className}`}>
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="text-[15px] font-bold text-sidebar-heading">{title}</h2>
        </div>
        {description && (
          <p className="text-[13px] text-slate-400 font-medium mt-2 mr-11">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [setup2faData, setSetup2faData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const data = await api.get("/auth/profile");
      return data;
    },
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.name || "");
      setPhone(profile.phone || user?.phone || "");
    }
  }, [profile, user?.name, user?.phone]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.put("/auth/profile", data),
    onSuccess: () => {
      toast.success("تم تحديث الملف الشخصي بنجاح");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || err.error || "خطأ في التحديث");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => api.post("/auth/change-password", data),
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (err: any) => {
      toast.error(err.message || err.error || "كلمة المرور الحالية غير صحيحة");
    },
  });

  const setup2FAMutation = useMutation({
    mutationFn: () => api.post("/auth/2fa/setup", {}),
    onSuccess: (data) => {
      setSetup2faData(data);
    },
    onError: (err: any) => {
      toast.error(err.message || err.error || "خطأ في إعداد 2FA");
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: (code: string) => api.post("/auth/2fa/verify", { code }),
    onSuccess: () => {
      toast.success("تم تفعيل المصادقة الثنائية بنجاح");
      setSetup2faData(null);
      setTwoFactorCode("");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || err.error || "رمز التحقق غير صحيح");
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: (code: string) => api.post("/auth/2fa/disable", { code }),
    onSuccess: () => {
      toast.success("تم إيقاف المصادقة الثنائية");
      setTwoFactorCode("");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message || err.error || "رمز التحقق غير صحيح");
    },
  });

  if (isLoading) {
    return <AdminDataState type="loading" title="جاري تحميل الملف الشخصي" description="يتم تجهيز بيانات الحساب وحالة الأمان." />;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <AdminPageHeader
        title="الملف الشخصي والأمان"
        description="إدارة بياناتك الشخصية وحماية حسابك."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <SectionCard icon={User} iconColor="bg-primary/10 text-primary" title="البيانات الأساسية" description="تحديث بيانات الاتصال واسم المدير.">
          <div>
            <label className={LABEL_CLASS}>الاسم</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم المدير"
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>
              <span className="flex items-center gap-2"><Smartphone className="w-3.5 h-3.5" /> الهاتف (لاستعادة الحساب)</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="0555123456"
              dir="ltr"
              className={FIELD_CLASS}
            />
          </div>
          <button
            className={BTN_PRIMARY}
            disabled={updateProfileMutation.isPending}
            onClick={() => updateProfileMutation.mutate({ name, phone })}
          >
            {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            حفظ التغييرات
          </button>
        </SectionCard>

        {/* Password */}
        <SectionCard icon={KeyRound} iconColor="bg-amber-50 text-amber-600" title="تغيير كلمة المرور" description="تغيير كلمة المرور الخاصة بك.">
          <div>
            <label className={LABEL_CLASS}>كلمة المرور الحالية</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              dir="ltr"
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              dir="ltr"
              className={FIELD_CLASS}
            />
          </div>
          <button
            className={BTN_PRIMARY}
            disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
            onClick={() => changePasswordMutation.mutate({ currentPassword, newPassword })}
          >
            {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            تحديث كلمة المرور
          </button>
        </SectionCard>

        {/* 2FA */}
        <SectionCard
          icon={ShieldCheck}
          iconColor="bg-emerald-50 text-emerald-600"
          title="المصادقة الثنائية (2FA)"
          description="طبقة حماية إضافية باستخدام رمز من التطبيق (Google Authenticator)."
          className="md:col-span-2"
        >
          {profile?.two_factor_enabled ? (
            <div className="space-y-4 p-5 border border-rose-100 bg-rose-50/40 rounded-[18px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-[14px] text-emerald-700">المصادقة الثنائية مفعلة</h3>
                  <p className="text-[12px] text-emerald-500 font-medium">حسابك محمي. احتفظ برمز الـ 2FA في مكان آمن.</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-rose-100 space-y-3">
                <p className="text-[13px] font-bold text-rose-500">لإيقاف الحماية، أدخل الرمز الحالي:</p>
                <div className="flex gap-3 items-end">
                  <input
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    maxLength={6}
                    className="flex-1 h-11 text-center text-lg tracking-widest font-black font-mono rounded-[12px] border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    dir="ltr"
                  />
                  <button
                    className="h-11 px-6 rounded-[14px] bg-destructive text-white text-[13px] font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                    disabled={disable2FAMutation.isPending || twoFactorCode.length !== 6}
                    onClick={() => disable2FAMutation.mutate(twoFactorCode)}
                  >
                    {disable2FAMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    تعطيل الحماية
                  </button>
                </div>
              </div>
            </div>
          ) : setup2faData ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-4">
              <div className="bg-amber-50 text-amber-800 p-4 rounded-[16px] flex items-start gap-3 border border-amber-100">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-[13px] leading-relaxed font-medium">
                  <strong>خطوات التفعيل:</strong>
                  <ol className="list-decimal mr-4 mt-2 space-y-1">
                    <li>قم بتحميل تطبيق Google Authenticator.</li>
                    <li>امسح رمز الـ QR أدناه بالتطبيق.</li>
                    <li>أدخل الرمز المكون من 6 أرقام لتأكيد التفعيل.</li>
                  </ol>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-8 justify-center bg-slate-50 p-6 rounded-[20px] border border-slate-100">
                <div className="bg-white p-3 rounded-[16px] shadow-sm border border-slate-100">
                  <img src={setup2faData.qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                </div>
                <div className="space-y-4 w-full sm:w-64 text-center sm:text-right">
                  <p className="text-[12px] text-slate-400 font-medium mb-4">
                    أو استخدم المفتاح:
                    <code className="block bg-slate-100 p-2 mt-1 rounded-lg text-center font-mono text-[11px] text-sidebar-heading" dir="ltr">{setup2faData.secret}</code>
                  </p>
                  <input
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full h-12 text-center text-xl tracking-widest font-black font-mono rounded-[12px] border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    dir="ltr"
                  />
                  <div className="flex gap-2">
                    <button
                      className={BTN_PRIMARY}
                      disabled={verify2FAMutation.isPending || twoFactorCode.length !== 6}
                      onClick={() => verify2FAMutation.mutate(twoFactorCode)}
                    >
                      {verify2FAMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      تأكيد وتفعيل
                    </button>
                    <button
                      onClick={() => setSetup2faData(null)}
                      className="h-11 px-5 rounded-[14px] border border-slate-200 text-[13px] font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-[14px] text-sidebar-heading">حسابك غير محمي حالياً بـ 2FA</h3>
                <p className="text-[13px] text-slate-400 font-medium mt-1 max-w-sm mx-auto">
                  تفعيل المصادقة الثنائية سيجعل حسابك منيعاً ضد الاختراق.
                </p>
              </div>
              <button
                onClick={() => setup2FAMutation.mutate()}
                className="h-11 px-6 rounded-[14px] bg-primary text-white text-[14px] font-bold shadow-lg shadow-primary/25 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
                disabled={setup2FAMutation.isPending}
              >
                {setup2FAMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                ابدأ عملية التفعيل
              </button>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
