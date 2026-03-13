import { ExternalLink, LogOut, Menu, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAdminPageMeta } from "./adminNavigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminHeaderProps {
  onOpenNavigation: () => void;
}

const AdminHeader = ({ onOpenNavigation }: AdminHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pageMeta = getAdminPageMeta(location.pathname);

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={onOpenNavigation}
            aria-label="فتح قائمة التنقل"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-sm sm:flex">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-tight text-sidebar-heading sm:text-2xl">
              {pageMeta.title}
            </h1>
            <p className="mt-1 hidden text-sm text-muted-foreground md:block">{pageMeta.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-border bg-card p-2 shadow-sm">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden h-10 items-center gap-2 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-primary sm:inline-flex"
            title="فتح المتجر في تبويب جديد"
          >
            <span>عرض المتجر</span>
            <ExternalLink className="h-4 w-4" />
          </a>
          {user && (
            <div className="hidden text-right px-2 sm:block" dir="rtl">
              <p className="w-[150px] truncate text-[13px] font-bold leading-tight text-sidebar-heading">
                {user.email}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground">جلسة آمنة فعالة</p>
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-primary text-white shadow-sm transition-colors hover:bg-destructive group"
                title="تسجيل الخروج"
              >
                <span className="font-bold text-sm uppercase group-hover:hidden">
                  {user?.email?.charAt(0) || "A"}
                </span>
                <LogOut className="w-4 h-4 absolute inset-0 m-auto hidden group-hover:block" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-right">تأكيد تسجيل الخروج</AlertDialogTitle>
                <AlertDialogDescription className="text-right">
                  هل أنت متأكد من أنك تريد تسجيل الخروج من لوحة التحكم؟ ستحتاج إلى إدخال بيانات الاعتماد الخاصة بك مرة أخرى للوصول إليها.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row-reverse gap-2">
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  تسجيل الخروج
                </AlertDialogAction>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
