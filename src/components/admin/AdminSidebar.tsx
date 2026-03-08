import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Settings,
  BarChart3,
  Megaphone,
  LogOut,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "لوحة القيادة" },
  { to: "/admin/orders", icon: ShoppingCart, label: "الطلبات" },
  { to: "/admin/products", icon: Package, label: "المنتجات" },
  { to: "/admin/shipping", icon: Truck, label: "الشحن" },
  { to: "/admin/marketing", icon: Megaphone, label: "التسويق" },
  { to: "/admin/analytics", icon: BarChart3, label: "الإحصائيات" },
  { to: "/admin/settings", icon: Settings, label: "الإعدادات" },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-sidebar flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-active-foreground tracking-tight">
          🛒 COD Store
        </h1>
        <p className="text-xs text-sidebar-foreground/60 mt-1">لوحة تحكم التاجر</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.to === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-active text-sidebar-active-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active-foreground transition-colors w-full">
          <LogOut className="w-5 h-5 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
