import { LockKeyhole, RefreshCcw, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

interface AdminIntegrationStatusNoteProps {
  configured: boolean;
  configuredTitle: string;
  configuredDescription: string;
  pendingTitle: string;
  pendingDescription: string;
  className?: string;
}

export default function AdminIntegrationStatusNote({
  configured,
  configuredTitle,
  configuredDescription,
  pendingTitle,
  pendingDescription,
  className,
}: AdminIntegrationStatusNoteProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[20px] border px-4 py-4 shadow-sm",
        configured ? "border-emerald-200 bg-emerald-50/80" : "border-slate-200 bg-slate-50/80",
        className
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          configured ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-500"
        )}
      >
        {configured ? <ShieldCheck className="h-5 w-5" /> : <RefreshCcw className="h-5 w-5" />}
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-black text-slate-900">
            {configured ? configuredTitle : pendingTitle}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
              configured ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-500"
            )}
          >
            <LockKeyhole className="h-3.5 w-3.5" />
            {configured ? "محفوظة بأمان" : "جاهزة للإعداد"}
          </span>
        </div>
        <p className="text-xs leading-6 text-slate-600">
          {configured ? configuredDescription : pendingDescription}
        </p>
      </div>
    </div>
  );
}
