import { Loader2 } from "lucide-react";

interface ProductDeleteDialogProps {
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ProductDeleteDialog({
  open,
  pending,
  onClose,
  onConfirm,
}: ProductDeleteDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-xl shadow-xl border border-border p-6 w-full max-w-sm mx-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-foreground">حذف المنتج</h3>
        <p className="text-sm text-muted-foreground">
          هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={pending}
            data-testid="product-delete-confirm"
            className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}
