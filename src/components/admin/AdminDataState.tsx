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
    iconWrapClass: "bg-primary/10",
    iconClassName: "animate-spin text-primary",
    containerClassName: "border-slate-100 bg-white",
  },
  error: {
    icon: AlertCircle,
    iconWrapClass: "bg-red-50",
    iconClassName: "text-red-500",
    containerClassName: "border-red-100 bg-red-50/40",
  },
  empty: {
    icon: Inbox,
    iconWrapClass: "bg-slate-100",
    iconClassName: "text-slate-400",
    containerClassName: "border-slate-100 bg-white",
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
  const { icon: Icon, iconWrapClass, iconClassName, containerClassName } = stateConfig[type];

  return (
    <div
      className={cn(
        "flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border px-8 py-12 text-center shadow-sm",
        containerClassName,
        className
      )}
    >
      <div className={cn("mb-5 rounded-2xl p-4", iconWrapClass)}>
        <Icon className={cn("h-7 w-7", iconClassName)} />
      </div>
      <h2 className="text-[16px] font-black text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-sm text-[13px] leading-6 text-slate-500 font-medium">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          onClick={onAction}
          disabled={actionDisabled}
          className="mt-6 rounded-[12px] px-6 h-10 font-bold text-[13px]"
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
