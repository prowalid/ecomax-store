import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, User, KeyRound, Smartphone, Mail, AlertTriangle } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

  // Use useEffect instead of setting state in queryFn, to handle React Query caching
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || user?.email || "");
      setPhone(profile.phone || "");
    }
  }, [profile, user?.email]);

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
    return (
      <div className="flex items-center justify-center p-8 h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-sidebar-heading tracking-tight mb-2">الملف الشخصي والأمان</h1>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          إدارة بياناتك الشخصية وحماية حسابك
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              البيانات الأساسية
            </CardTitle>
            <CardDescription>تحديث بيانات الاتصال واسم المدير</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">الاسم</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسم المدير"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2"><Mail className="w-4 h-4"/> البريد الإلكتروني</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2"><Smartphone className="w-4 h-4"/> الهاتف (لاستعادة الحساب)</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="0555123456"
                dir="ltr"
              />
            </div>
            <Button
              className="w-full font-bold mt-2"
              disabled={updateProfileMutation.isPending}
              onClick={() => updateProfileMutation.mutate({ name, email, phone })}
            >
              {updateProfileMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ التغييرات
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              تغيير كلمة المرور
            </CardTitle>
            <CardDescription>تغيير كلمة المرور الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">كلمة المرور الحالية</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold">كلمة المرور الجديدة</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                dir="ltr"
              />
            </div>
            <Button
              className="w-full font-bold mt-2"
              disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
              onClick={() => changePasswordMutation.mutate({ currentPassword, newPassword })}
            >
              {changePasswordMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              تحديث كلمة المرور
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              المصادقة الثنائية (2FA)
            </CardTitle>
            <CardDescription>طبقة حماية إضافية لحسابك باستخدام رمز من التطبيق (مثل Google Authenticator)</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.two_factor_enabled ? (
              <div className="space-y-4 p-4 border border-destructive/20 bg-destructive/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-700">المصادقة الثنائية مفعلة</h3>
                    <p className="text-sm text-green-600/80">حسابك محمي بنجاح. لا تنسخ رمز الـ 2FA في مكان آمن تجنباً لفقدان الحساب.</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-destructive/10 space-y-4">
                  <p className="text-sm font-medium text-destructive">لإيقاف وتأكيد الإيقاف، يرجى كتابة الرمز الحالي أدناه:</p>
                  <div className="flex gap-4 items-end">
                    <div className="space-y-2 flex-1">
                      <Input
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        maxLength={6}
                        className="text-center text-lg tracking-widest font-bold font-mono"
                        dir="ltr"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      className="font-bold whitespace-nowrap"
                      disabled={disable2FAMutation.isPending || twoFactorCode.length !== 6}
                      onClick={() => disable2FAMutation.mutate(twoFactorCode)}
                    >
                      {disable2FAMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                      تعطيل الحماية
                    </Button>
                  </div>
                </div>
              </div>
            ) : setup2faData ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                <div className="bg-orange-50 text-orange-800 p-4 rounded-xl flex items-start gap-3 border border-orange-200">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed">
                    <strong>خطوات التفعيل:</strong>
                    <ol className="list-decimal mr-4 mt-2 space-y-1">
                      <li>قم بتحميل تطبيق Google Authenticator.</li>
                      <li>امسح رمز الـ QR أدناه بالتطبيق.</li>
                      <li>أدخل الرمز المكون من 6 أرقام لتأكيد التفعيل.</li>
                    </ol>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 justify-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="bg-white p-2 rounded-xl shadow-sm">
                    <img src={setup2faData.qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                  </div>
                  <div className="space-y-4 w-full sm:w-64 text-center sm:text-right">
                    <p className="text-xs text-muted-foreground mb-4">أو استخدم المفتاح: <code className="block bg-gray-100 p-2 mt-1 rounded text-center ltr">{setup2faData.secret}</code></p>
                    <div className="space-y-2">
                      <Input
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        maxLength={6}
                        className="text-center text-xl tracking-widest font-bold font-mono py-6"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="w-full font-bold"
                        disabled={verify2FAMutation.isPending || twoFactorCode.length !== 6}
                        onClick={() => verify2FAMutation.mutate(twoFactorCode)}
                      >
                        {verify2FAMutation.isPending && <Loader2 className="ml-2 animate-spin w-4 h-4" />}
                        تأكيد وتفعيل
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSetup2faData(null)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">حسابك غير محمي حالياً بـ 2FA</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">تفعيل المصادقة الثنائية سيجعل حسابك منيعاً ضد الاختراق، حيث يتطلب خطوة إضافية للمرور.</p>
                </div>
                <Button
                  onClick={() => setup2FAMutation.mutate()}
                  className="font-bold hover:-translate-y-0.5 transition-transform"
                  disabled={setup2FAMutation.isPending}
                >
                  {setup2FAMutation.isPending && <Loader2 className="ml-2 animate-spin w-4 h-4" />}
                  ابدأ عملية التفعيل
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
