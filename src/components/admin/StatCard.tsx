import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: ReactNode;
}

const StatCard = ({ title, value, change, changeType = "neutral", icon }: StatCardProps) => {
  const changeColor =
    changeType === "positive"
      ? "text-success"
      : changeType === "negative"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <div className="bg-card rounded-lg p-6 shadow-card border border-border animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted-foreground text-sm font-medium">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {change && (
        <p className={`text-xs mt-2 font-medium ${changeColor}`}>{change}</p>
      )}
    </div>
  );
};

export default StatCard;
