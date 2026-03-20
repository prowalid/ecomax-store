import { useState, type InputHTMLAttributes } from "react";
import { LockKeyhole, EyeOff, Lock } from "lucide-react";
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
  const [showSecret, setShowSecret] = useState(false);
  const isPassword = props.type === "password";

  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-[15px] font-bold text-sidebar-heading">{title}</h3>
          <p className="mt-1 text-[13px] leading-relaxed font-medium text-slate-500">{description}</p>
        </div>
        {configured ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <LockKeyhole className="h-3.5 w-3.5" />
            جاهز
          </span>
        ) : null}
      </div>

      <div className="relative">
        <input
          {...props}
          type={isPassword && showSecret ? "text" : props.type}
          className={cn(
            "w-full h-11 px-4 rounded-[12px] border border-slate-200 bg-slate-50 text-[14px] font-medium text-sidebar-heading placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all",
            props.dir === "ltr" ? "text-left" : "text-right",
            isPassword ? "pr-4 pl-12" : ""
          )}
        />
        {isPassword && (
          <button 
            type="button"
            onClick={() => setShowSecret(!showSecret)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
          >
            {showSecret ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
        )}
      </div>

      {helperText ? (
        <p className="mt-2 text-[12px] leading-relaxed text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}
