import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  subtitle?: string;
}

const StatCard = ({ title, value, change, changeType = "neutral", subtitle }: StatCardProps) => {
  return (
    <div className="bg-card rounded-lg p-5 shadow-card border border-border animate-slide-in">
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
      <div className="flex items-center gap-2 mt-2">
        {change && (
          <span
            className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-critical",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
