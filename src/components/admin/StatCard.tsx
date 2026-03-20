import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  subtitle?: string;
  variant?: "red" | "orange" | "green" | "purple" | "blue" | "default";
  trend?: number; // e.g. +12 or -5 (percentage)
}

const variantStyles = {
  red: {
    icon: "bg-[hsl(var(--pastel-red-bg))] text-[hsl(var(--pastel-red-fg))]",
    bar: "bg-rose-400",
  },
  orange: {
    icon: "bg-[hsl(var(--pastel-orange-bg))] text-[hsl(var(--pastel-orange-fg))]",
    bar: "bg-orange-400",
  },
  green: {
    icon: "bg-[hsl(var(--pastel-green-bg))] text-[hsl(var(--pastel-green-fg))]",
    bar: "bg-emerald-400",
  },
  purple: {
    icon: "bg-[hsl(var(--pastel-purple-bg))] text-[hsl(var(--pastel-purple-fg))]",
    bar: "bg-purple-400",
  },
  blue: {
    icon: "bg-blue-50 text-blue-500",
    bar: "bg-blue-400",
  },
  default: {
    icon: "bg-slate-100 text-slate-500",
    bar: "bg-slate-300",
  },
};

const StatCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  subtitle,
  variant = "default",
  trend,
}: StatCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div className="relative bg-white rounded-[20px] p-4 sm:p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
      {/* Accent bar on the left edge */}
      <div className={cn("absolute top-0 right-0 w-1 h-full rounded-r-[20px]", styles.bar)} />

      {/* Top section: Icon and Value */}
      <div className="flex flex-col gap-2 sm:gap-4">
        {icon && (
          <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0", styles.icon)}>
            {icon}
          </div>
        )}

        <div>
          <p className="text-xl sm:text-[28px] font-bold text-sidebar-heading tracking-tight leading-none mb-1 sm:mb-2">
            {value}
          </p>
          <h3 className="text-xs sm:text-[14px] font-semibold text-slate-600">{title}</h3>
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {change && changeType === "positive" && (
            <div className="flex items-center text-[10px] sm:text-[12px] font-bold text-emerald-600">
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
              {change}
            </div>
          )}
          {change && changeType === "negative" && (
            <div className="flex items-center text-[10px] sm:text-[12px] font-bold text-rose-500">
              <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
              {change}
            </div>
          )}
          {change && changeType === "neutral" && (
            <div className="flex items-center text-[10px] sm:text-[12px] font-medium text-slate-400">
              {change}
            </div>
          )}
          {subtitle && (
            <span className="text-[10px] sm:text-[12px] text-slate-400 font-medium whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </div>

        {trend !== undefined && (
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
              trend > 0 ? "bg-emerald-50 text-emerald-600" : trend < 0 ? "bg-rose-50 text-rose-500" : "bg-slate-100 text-slate-500"
            )}
          >
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
