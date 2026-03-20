import { Link } from "react-router-dom";
import { Plus, ShoppingBag, Settings } from "lucide-react";

const QUICK_ACTIONS = [
  {
    label: "إضافة منتج",
    to: "/admin/products",
    icon: Plus,
    color: "bg-primary text-white shadow-lg shadow-primary/25 hover:opacity-90",
  },
  {
    label: "عرض الطلبات",
    to: "/admin/orders",
    icon: ShoppingBag,
    color: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
  },
  {
    label: "إعدادات المتجر",
    to: "/admin/settings",
    icon: Settings,
    color: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
  },
];

export default function DashboardQuickActionsBar() {
  return (
    <div className="flex flex-wrap gap-3">
      {QUICK_ACTIONS.map(({ label, to, icon: Icon, color }) => (
        <Link
          key={to}
          to={to}
          className={`inline-flex items-center gap-2 rounded-[14px] px-4 h-10 text-[13px] font-bold transition-all hover:-translate-y-0.5 ${color}`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}
    </div>
  );
}
