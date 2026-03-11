import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>
      <div
        className={cn(
          "min-h-screen transition-all duration-300 w-full",
          collapsed ? "lg:mr-[80px] lg:w-[calc(100%-80px)]" : "lg:mr-[260px] lg:w-[calc(100%-260px)]"
        )}
      >
        <AdminHeader onOpenNavigation={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="right" className="w-[88vw] max-w-sm p-4" showCloseButton>
          <SheetHeader className="sr-only">
            <SheetTitle>التنقل الإداري</SheetTitle>
            <SheetDescription>الوصول السريع إلى أقسام لوحة التحكم.</SheetDescription>
          </SheetHeader>
          <AdminSidebar
            collapsed={false}
            mobile
            onNavigate={() => setMobileNavOpen(false)}
            onToggle={() => {}}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminLayout;
