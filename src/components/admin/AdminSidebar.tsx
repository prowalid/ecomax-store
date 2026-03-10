import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Settings,
  BarChart3,
  Megaphone,
  ChevronLeft,
  Store,
  Users,
  Tag,
  FolderOpen,
  FileText,
  Palette,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "الرئيسية", exact: true },
    ],
  },
  {
    title: "المبيعات",
    items: [
      { to: "/admin/orders", icon: ShoppingCart, label: "الطلبات" },
      { to: "/admin/products", icon: Package, label: "المنتجات" },
      { to: "/admin/categories", icon: FolderOpen, label: "التصنيفات" },
      { to: "/admin/customers", icon: Users, label: "الزبائن" },
      { to: "/admin/discounts", icon: Tag, label: "الخصومات" },
    ],
  },
  {
    title: "التشغيل",
    items: [
      { to: "/admin/shipping", icon: Truck, label: "الشحن" },
      { to: "/admin/marketing", icon: Megaphone, label: "التسويق" },
      { to: "/admin/analytics", icon: BarChart3, label: "التحليلات" },
      { to: "/admin/notifications", icon: Bell, label: "الإشعارات" },
    ],
  },
  {
    title: "الإعدادات",
    items: [
      { to: "/admin/pages", icon: FileText, label: "الصفحات" },
      { to: "/admin/appearance", icon: Palette, label: "المظهر" },
      { to: "/admin/settings", icon: Settings, label: "الإعدادات" },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ collapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed right-0 top-0 h-screen bg-sidebar flex flex-col z-50 transition-all duration-200 border-l border-sidebar-border scrollbar-thin overflow-y-auto",
        collapsed ? "w-[56px]" : "w-[240px]"
      )}
    >
      {/* Store header */}
      <div className="flex items-center gap-2.5 px-3 h-14 border-b border-sidebar-border shrink-0">
        <div className="w-8 h-8 rounded-lg bg-sidebar-active-bg flex items-center justify-center shrink-0">
          <Store className="w-4 h-4 text-sidebar-active" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sidebar-active truncate">ECOMAX</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 px-2">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className={cn(sIdx > 0 && "mt-4")}>
            {section.title && !collapsed && (
              <p className="px-2 mb-1 text-2xs font-medium text-sidebar-heading uppercase tracking-wider">
                {section.title}
              </p>
            )}
            {sIdx > 0 && collapsed && (
              <div className="mx-2 mb-2 border-t border-sidebar-border" />
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md transition-colors text-sm h-8",
                        collapsed ? "justify-center px-0" : "px-2",
                        isActive
                          ? "bg-sidebar-active-bg text-sidebar-active font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-sidebar-border shrink-0">
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-8 rounded-md text-sidebar-foreground hover:bg-sidebar-hover hover:text-sidebar-active transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
