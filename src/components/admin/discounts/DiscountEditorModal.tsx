import { Loader2, X } from "lucide-react";
import type { Product } from "@/hooks/useProducts";

import DiscountFormFields from "./DiscountFormFields";
import type { DiscountFormState } from "./types";

interface DiscountEditorModalProps {
  open: boolean;
  title: string;
  form: DiscountFormState;
  activeProducts: Product[];
  isSaving: boolean;
  saveLabel: string;
  onClose: () => void;
  onSave: () => void;
  onPatch: (patch: Partial<DiscountFormState>) => void;
}

export default function DiscountEditorModal({
  open,
  title,
  form,
  activeProducts,
  isSaving,
  saveLabel,
  onClose,
  onSave,
  onPatch,
}: DiscountEditorModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-card rounded-xl shadow-2xl border border-border w-full max-w-lg p-5 space-y-4 max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <DiscountFormFields form={form} activeProducts={activeProducts} autoFocus onPatch={onPatch} />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="h-9 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
