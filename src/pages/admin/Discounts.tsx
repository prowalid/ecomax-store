import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useDiscounts, useCreateDiscount, useUpdateDiscount, useDeleteDiscount, Discount } from "@/hooks/useDiscounts";
import { useProducts } from "@/hooks/useProducts";
import DiscountEditorModal from "@/components/admin/discounts/DiscountEditorModal";
import DiscountFormFields from "@/components/admin/discounts/DiscountFormFields";
import DiscountsTable from "@/components/admin/discounts/DiscountsTable";
import { discountToFormState, emptyDiscountForm, type DiscountFormState } from "@/components/admin/discounts/types";

const Discounts = () => {
  const {
    data: discounts = [],
    isLoading,
    isError: isDiscountsError,
    error: discountsError,
    refetch: refetchDiscounts,
    isFetching: isRefetchingDiscounts,
  } = useDiscounts();
  const {
    data: products = [],
    isError: isProductsError,
    error: productsError,
    refetch: refetchProducts,
    isFetching: isRefetchingProducts,
  } = useProducts();
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const deleteDiscount = useDeleteDiscount();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<DiscountFormState>(emptyDiscountForm);

  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DiscountFormState>(emptyDiscountForm);

  const activeProducts = products.filter((p) => p.status === "active");

  const formToPayload = (f: DiscountFormState) => ({
    code: f.code.trim().toUpperCase(),
    type: f.type,
    value: Number(f.value),
    usage_limit: f.usage_limit ? Number(f.usage_limit) : undefined,
    expires_at: f.expires_at ? new Date(f.expires_at).toISOString() : undefined,
    apply_to: f.apply_to,
    product_ids: f.apply_to === "specific" ? f.product_ids : [],
    quantity_behavior: f.quantity_behavior,
    min_quantity: f.quantity_behavior === "min_quantity" ? Number(f.min_quantity) : 1,
  });

  const handleAdd = () => {
    if (!form.code.trim() || !form.value) return;
    createDiscount.mutate(formToPayload(form), {
      onSuccess: () => {
        setForm(emptyDiscountForm);
        setShowAdd(false);
      },
    });
  };

  const startEdit = (d: Discount) => {
    setEditId(d.id);
    setEditForm(discountToFormState(d));
  };

  const saveEdit = () => {
    if (!editId || !editForm.code.trim() || !editForm.value) return;
    updateDiscount.mutate(
      {
        id: editId,
        ...formToPayload(editForm),
        usage_limit: editForm.usage_limit ? Number(editForm.usage_limit) : null,
        expires_at: editForm.expires_at ? new Date(editForm.expires_at).toISOString() : null,
      },
      { onSuccess: () => setEditId(null) }
    );
  };

  const toggleActive = (id: string, current: boolean) => {
    updateDiscount.mutate({ id, active: !current });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isDiscountsError || isProductsError) {
    const message = discountsError instanceof Error
      ? discountsError.message
      : productsError instanceof Error
        ? productsError.message
        : "تعذر تحميل الخصومات";

    return (
      <div className="bg-card rounded-lg border border-border p-6 space-y-3">
        <h1 className="text-xl font-semibold text-foreground">الخصومات والكوبونات</h1>
        <p className="text-sm text-destructive">{message}</p>
        <button
          onClick={() => {
            void refetchDiscounts();
            void refetchProducts();
          }}
          disabled={isRefetchingDiscounts || isRefetchingProducts}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">الخصومات والكوبونات</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إنشاء خصم
        </button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-lg shadow-card border border-border p-4 space-y-3 animate-slide-in">
          <DiscountFormFields form={form} activeProducts={activeProducts} autoFocus onPatch={(patch) => setForm((prev) => ({ ...prev, ...patch }))} />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setShowAdd(false); setForm(emptyDiscountForm); }}
              className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleAdd}
              disabled={createDiscount.isPending || !form.code.trim() || !form.value}
              className="h-9 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {createDiscount.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
            </button>
          </div>
        </div>
      )}

      <DiscountEditorModal
        open={editId !== null}
        title="تعديل الكوبون"
        form={editForm}
        activeProducts={activeProducts}
        isSaving={updateDiscount.isPending}
        saveLabel="حفظ"
        onClose={() => setEditId(null)}
        onSave={saveEdit}
        onPatch={(patch) => setEditForm((prev) => ({ ...prev, ...patch }))}
      />

      <DiscountsTable
        discounts={discounts}
        onToggleActive={toggleActive}
        onEdit={startEdit}
        onDelete={(id) => deleteDiscount.mutate(id)}
      />
    </div>
  );
};

export default Discounts;
