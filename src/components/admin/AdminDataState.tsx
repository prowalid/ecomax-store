import { AlertCircle, Inbox, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminDataStateProps = {
  type: "loading" | "error" | "empty";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
  className?: string;
};

const stateConfig = {
  loading: {
    icon: Loader2,
    iconClassName: "animate-spin text-primary",
    containerClassName: "border-slate-200 bg-white",
  },
  error: {
    icon: AlertCircle,
    iconClassName: "text-red-500",
    containerClassName: "border-red-200 bg-red-50/60",
  },
  empty: {
    icon: Inbox,
    iconClassName: "text-slate-400",
    containerClassName: "border-slate-200 bg-white",
  },
} as const;

export default function AdminDataState({
  type,
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled,
  className,
}: AdminDataStateProps) {
  const Icon = stateConfig[type].icon;

  return (
    <div
      className={cn(
        "flex min-h-[280px] flex-col items-center justify-center rounded-[24px] border px-6 py-10 text-center shadow-sm",
        stateConfig[type].containerClassName,
        className
      )}
    >
      <div className="mb-4 rounded-full bg-slate-100 p-3">
        <Icon className={cn("h-6 w-6", stateConfig[type].iconClassName)} />
      </div>
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          onClick={onAction}
          disabled={actionDisabled}
          className="mt-5 rounded-xl px-5"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
