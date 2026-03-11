import type { OrderStatus } from "@/hooks/useOrders";

export const orderStatusConfig: Record<
  OrderStatus,
  {
    label: string;
    className: string;
    variant:
      | "info"
      | "warning"
      | "default"
      | "success"
      | "destructive"
      | "muted"
      | "purple"
      | "pink"
      | "secondary";
  }
> = {
  new: { label: "جديد", variant: "info", className: "bg-sky-100 text-sky-800 border border-sky-200" },
  attempt: { label: "محاولة اتصال", variant: "purple", className: "bg-violet-100 text-violet-800 border border-violet-200" },
  no_answer: { label: "لا يجيب", variant: "pink", className: "bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200" },
  confirmed: { label: "مؤكد", variant: "warning", className: "bg-amber-100 text-amber-800 border border-amber-200" },
  cancelled: { label: "ملغي", variant: "muted", className: "bg-slate-200 text-slate-700 border border-slate-300" },
  ready: { label: "جاهز للشحن", variant: "secondary", className: "bg-indigo-100 text-indigo-800 border border-indigo-200" },
  shipped: { label: "مشحون", variant: "default", className: "bg-blue-100 text-blue-800 border border-blue-200" },
  delivered: { label: "مسلّم", variant: "success", className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
  returned: { label: "مرتجع", variant: "destructive", className: "bg-rose-100 text-rose-800 border border-rose-200" },
};

export const allOrderStatuses: OrderStatus[] = [
  "new",
  "attempt",
  "no_answer",
  "confirmed",
  "cancelled",
  "ready",
  "shipped",
  "delivered",
  "returned",
];

export const orderStatusFlow: Record<OrderStatus, OrderStatus[]> = {
  new: ["attempt", "confirmed", "cancelled"],
  attempt: ["no_answer", "confirmed", "cancelled"],
  no_answer: ["attempt", "confirmed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  cancelled: [],
  ready: ["shipped"],
  shipped: ["delivered", "returned"],
  delivered: [],
  returned: [],
};
