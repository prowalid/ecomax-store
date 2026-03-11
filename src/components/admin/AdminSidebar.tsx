import { NavLink, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNavSections } from "./adminNavigation";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobile?: boolean;
  onNavigate?: () => void;
}

const AdminSidebar = ({ collapsed, onToggle, mobile = false, onNavigate }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "bg-sidebar flex flex-col transition-all duration-300 border-l-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] scrollbar-thin overflow-y-auto",
        mobile
          ? "h-full w-full rounded-none bg-white shadow-none"
          : "fixed right-0 top-0 z-50 h-screen",
        !mobile && (collapsed ? "w-[80px]" : "w-[260px]")
      )}
    >
      {/* Branding */}
      <div
        className={cn(
          "flex items-center shrink-0",
          mobile ? "h-20 gap-3 px-1" : "mt-2 h-24 px-6",
          collapsed && !mobile ? "justify-center px-0" : "gap-3"
        )}
      >
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
          <Store className="w-6 h-6 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold text-sidebar-heading tracking-tight leading-none mb-1">لوحة التحكم</h1>
            <p className="text-[12px] font-semibold text-sidebar-fg opacity-80 mt-1">
              {mobile ? "تنقل سريع بين أقسام الإدارة" : "الإدارة العامة"}
            </p>
          </div>
        )}
      </div>

      <div className={cn("mb-4 px-6", collapsed && !mobile && "hidden", mobile && "px-1")}>
         <div className="h-[1px] w-full bg-slate-100/50"></div>
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 pb-6", mobile ? "px-1" : "px-4")}>
        {adminNavSections.map((section, sIdx) => (
          <div key={sIdx} className={cn(sIdx > 0 && "mt-6")}>
            {section.title && (!collapsed || mobile) && (
              <p className="px-4 mb-3 text-[12px] font-bold text-sidebar-fg">
                {section.title}
              </p>
            )}
            {sIdx > 0 && collapsed && !mobile && (
              <div className="mx-4 mb-4 border-t border-slate-100" />
            )}
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center gap-3 transition-all duration-300 text-[14px] h-[48px]",
                        collapsed && !mobile ? "justify-center rounded-xl mx-auto w-12 h-12" : "px-4 rounded-[14px]",
                        isActive
                          ? "bg-primary text-white font-medium shadow-md shadow-primary/20"
                          : "text-sidebar-fg hover:bg-slate-50 hover:text-primary font-medium"
                      )}
                      title={collapsed && !mobile ? item.label : undefined}
                    >
                      <item.icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                      {(!collapsed || mobile) && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className={cn("shrink-0 bg-white border-t border-slate-50", mobile ? "hidden" : "sticky bottom-0 p-4")}>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-full h-11 rounded-[14px] text-sidebar-fg hover:bg-slate-50 hover:text-primary transition-colors"
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform duration-300",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
