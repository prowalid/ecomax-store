import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { useStoreSettings } from "@/hooks/useStoreSettings";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { settings: appearance, loading } = useAppearanceSettings();
  const { settings: generalSettings, loading: generalLoading } = useStoreSettings("general", {
    store_name: "ECOMAX",
    meta_title: "",
  });
  const effectiveBrandTitle = generalSettings.meta_title?.trim() || generalSettings.store_name?.trim() || "ECOMAX";

  useEffect(() => {
    if (generalLoading) {
      return;
    }

    const adminTitle = `${effectiveBrandTitle} — لوحة التحكم`;
    document.title = adminTitle;
    try {
      localStorage.setItem("etk:admin-title", adminTitle);
    } catch {
      // Ignore storage failures; title still updates in the current tab.
    }
  }, [effectiveBrandTitle, generalLoading]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const faviconHref = appearance.favicon_url?.trim();
    let faviconTag = document.getElementById("app-favicon");
    if (!faviconTag) {
      faviconTag = document.createElement("link");
      faviconTag.setAttribute("id", "app-favicon");
      faviconTag.setAttribute("rel", "icon");
      faviconTag.setAttribute("type", "image/svg+xml");
      document.head.appendChild(faviconTag);
    }

    const resolvedFavicon = faviconHref || "/images/logo-cart.svg";
    faviconTag.setAttribute("href", resolvedFavicon);

    try {
      if (faviconHref) {
        localStorage.setItem("etk:favicon-url", faviconHref);
      } else {
        localStorage.removeItem("etk:favicon-url");
      }
    } catch {
      // Ignore storage failures; favicon fallback still works.
    }
  }, [loading, appearance.favicon_url]);

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
