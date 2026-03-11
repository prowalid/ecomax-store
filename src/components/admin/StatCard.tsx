import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: ReactNode;
  subtitle?: string;
  variant?: "red" | "orange" | "green" | "purple" | "default";
}

const StatCard = ({ title, value, change, changeType = "neutral", icon, subtitle, variant = "default" }: StatCardProps) => {

  // Map variants to specific custom properties we defined in index.css
  const variantStyles = {
    red: "bg-[hsl(var(--pastel-red-bg))] text-[hsl(var(--pastel-red-fg))]",
    orange: "bg-[hsl(var(--pastel-orange-bg))] text-[hsl(var(--pastel-orange-fg))]",
    green: "bg-[hsl(var(--pastel-green-bg))] text-[hsl(var(--pastel-green-fg))]",
    purple: "bg-[hsl(var(--pastel-purple-bg))] text-[hsl(var(--pastel-purple-fg))]",
    default: "bg-slate-100 text-slate-500",
  };

  const bgStyle = variantStyles[variant];

  return (
    <div className="bg-white rounded-[20px] p-6 shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow flex flex-col justify-between">
      
      {/* Top section: Icon and Value */}
      <div className="flex flex-col gap-4">
        {icon && (
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", bgStyle)}>
             {icon}
          </div>
        )}
        
        <div>
           <p className="text-[28px] font-bold text-sidebar-heading tracking-tight leading-none mb-2">{value}</p>
           <h3 className="text-[15px] font-semibold text-slate-600">{title}</h3>
        </div>
      </div>

      {/* Bottom section: Trend and Subtitle */}
      <div className="mt-4 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-1.5 flex-wrap">
          {change && changeType !== "neutral" && (
            <div className={cn(
              "flex items-center text-[12px] font-bold",
              changeType === "positive" ? "text-success" : "text-destructive"
            )}>
              {changeType === "positive" ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {change}
            </div>
          )}
          
          {change && changeType === "neutral" && (
             <div className="flex items-center text-[12px] font-bold text-slate-400">
               <Minus className="w-3.5 h-3.5 mr-0.5" />
               {change}
             </div>
          )}

          {subtitle && (
            <span className="text-[12px] text-slate-400 font-medium whitespace-nowrap">{subtitle}</span>
          )}
        </div>
      </div>

    </div>
  );
};

export default StatCard;
