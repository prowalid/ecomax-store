import type { InputHTMLAttributes } from "react";

import { LockKeyhole } from "lucide-react";

import { cn } from "@/lib/utils";

interface AdminSecureFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  title: string;
  description: string;
  configured?: boolean;
  helperText?: string;
}

export default function AdminSecureField({
  title,
  description,
  configured = false,
  helperText,
  ...props
}: AdminSecureFieldProps) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        {configured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <LockKeyhole className="h-3.5 w-3.5" />
            محفوظ
          </span>
        ) : null}
      </div>

      <input
        {...props}
        className={cn(
          "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring",
          props.dir === "ltr" ? "text-left" : "text-right"
        )}
      />

      {helperText ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
