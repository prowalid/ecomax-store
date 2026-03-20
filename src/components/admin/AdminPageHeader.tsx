import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  meta?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function AdminPageHeader({
  title,
  description,
  meta,
  badge,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[24px] border border-slate-100 bg-white px-6 py-5 shadow-sm",
        "md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h1>
          {meta ? (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
              {meta}
            </span>
          ) : null}
          {badge ? badge : null}
        </div>
        {description ? (
          <p className="max-w-2xl text-[13px] leading-relaxed text-slate-500 font-medium">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
