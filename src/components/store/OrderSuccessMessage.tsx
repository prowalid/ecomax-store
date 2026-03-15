import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

interface OrderSuccessMessageProps {
  orderNumber?: number | null;
  title?: string;
  description?: string;
  actionLabel: string;
  actionTo?: string;
  onAction?: () => void;
  compact?: boolean;
}

export default function OrderSuccessMessage({
  orderNumber,
  title = "شكراً، تم إرسال طلبك بنجاح",
  description = "سنتواصل معك قريباً لتأكيد الطلب ومتابعة التوصيل.",
  actionLabel,
  actionTo,
  onAction,
  compact = false,
}: OrderSuccessMessageProps) {
  return (
    <div
      className={`mx-auto rounded-3xl bg-white text-center ${
        compact ? "p-6" : "max-w-2xl p-8"
      }`}
      style={{
        border: "1px solid rgb(var(--store-primary) / 0.18)",
        boxShadow: `0 20px 60px rgb(var(--store-primary) / 0.10)`,
      }}
      dir="rtl"
    >
      <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-store-primary" />
      <h2 className="text-2xl font-black text-gray-900">{title}</h2>
      {orderNumber ? (
        <p className="mt-3 text-sm text-gray-600">
          رقم الطلب: <span className="font-black text-store-primary">#{orderNumber}</span>
        </p>
      ) : null}
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      <div className="mt-6">
        {actionTo ? (
          <Link
            to={actionTo}
            className={`inline-flex items-center justify-center rounded-xl bg-store-primary px-6 font-bold text-white transition-colors hover:opacity-90 ${
              compact ? "h-10 text-sm" : "h-11"
            }`}
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className={`inline-flex items-center justify-center rounded-xl bg-store-primary px-6 font-bold text-white transition-colors hover:opacity-90 ${
              compact ? "h-10 text-sm" : "h-11"
            }`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
