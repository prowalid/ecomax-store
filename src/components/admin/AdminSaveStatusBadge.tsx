import { CheckCircle2, Clock3, Loader2 } from "lucide-react";

type AdminSaveStatusBadgeProps = {
  saving?: boolean;
  dirty?: boolean;
  lastSavedAt?: Date | null;
};

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("ar-DZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function AdminSaveStatusBadge({
  saving = false,
  dirty = false,
  lastSavedAt = null,
}: AdminSaveStatusBadgeProps) {
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        جاري الحفظ...
      </span>
    );
  }

  if (dirty) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
        <Clock3 className="h-3.5 w-3.5" />
        تغييرات غير محفوظة
      </span>
    );
  }

  if (lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        تم الحفظ • {formatTime(lastSavedAt)}
      </span>
    );
  }

  return null;
}
