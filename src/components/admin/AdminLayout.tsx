import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={cn(
          "min-h-screen transition-all duration-200",
          collapsed ? "mr-[56px]" : "mr-[240px]"
        )}
      >
        <AdminHeader />
        <main className="p-6 max-w-[1200px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
