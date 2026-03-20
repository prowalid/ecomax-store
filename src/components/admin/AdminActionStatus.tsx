import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminActionStatusProps = {
  state: "idle" | "pending" | "success" | "error";
  message?: string;
  className?: string;
};

const stateConfig = {
  pending: {
    icon: Loader2,
    iconClassName: "animate-spin text-primary",
    containerClassName: "border-slate-200 bg-white text-slate-600",
  },
  success: {
    icon: CheckCircle2,
    iconClassName: "text-emerald-600",
    containerClassName: "border-emerald-200 bg-emerald-50/80 text-emerald-800",
  },
  error: {
    icon: AlertCircle,
    iconClassName: "text-red-600",
    containerClassName: "border-red-200 bg-red-50/80 text-red-800",
  },
} as const;

export default function AdminActionStatus({
  state,
  message,
  className,
}: AdminActionStatusProps) {
  if (state === "idle" || !message) {
    return null;
  }

  const Icon = stateConfig[state].icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm",
        stateConfig[state].containerClassName,
        className
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", stateConfig[state].iconClassName)} />
      <span>{message}</span>
    </div>
  );
}
