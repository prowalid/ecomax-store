import { Loader2, Plus, Save, Upload, X } from "lucide-react";
import { useRef } from "react";

import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/admin/RichTextEditor";
import type { Category } from "@/hooks/useCategories";
import type { ProductForm } from "./types";
import type { ProductOptionGroup } from "@/lib/productOptions";

type EditableProductImage = {
  id: string;
  image_url: string;
};

interface ProductFormModalProps {
  open: boolean;
  editingId: string | null;
  form: ProductForm;
  categories: Category[];
  images: EditableProductImage[];
  dragIdx: number | null;
  isSaving: boolean;
  isUploading: boolean;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (key: keyof ProductForm, value: string | ProductOptionGroup[]) => void;
  onUploadFiles: (files: FileList) => void;
  onDeleteImage: (imageId: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (index: number) => void;
}

export default function ProductFormModal({
  open,
  editingId,
  form,
  categories,
  images,
  dragIdx,
  isSaving,
  isUploading,
  onClose,
  onSave,
  onFieldChange,
  onUploadFiles,
  onDeleteImage,
  onDragStart,
  onDragOver,
  onDrop,
}: ProductFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateOptions = (nextOptions: ProductOptionGroup[]) => onFieldChange("custom_options", nextOptions);
  const addOptionGroup = () => updateOptions([...form.custom_options, { name: "", values: [""] }]);
  const updateOptionGroup = (index: number, nextGroup: ProductOptionGroup) => {
    const nextOptions = [...form.custom_options];
    nextOptions[index] = nextGroup;
    updateOptions(nextOptions);
  };
  const removeOptionGroup = (index: number) => updateOptions(form.custom_options.filter((_, currentIndex) => currentIndex !== index));
  const addOptionValue = (groupIndex: number) => {
    const group = form.custom_options[groupIndex];
    updateOptionGroup(groupIndex, { ...group, values: [...group.values, ""] });
  };
  const updateOptionValue = (groupIndex: number, valueIndex: number, nextValue: string) => {
    const group = form.custom_options[groupIndex];
    const nextValues = [...group.values];
    nextValues[valueIndex] = nextValue;
    updateOptionGroup(groupIndex, { ...group, values: nextValues });
  };
  const removeOptionValue = (groupIndex: number, valueIndex: number) => {
    const group = form.custom_options[groupIndex];
    const nextValues = group.values.filter((_, currentIndex) => currentIndex !== valueIndex);
    updateOptionGroup(groupIndex, { ...group, values: nextValues.length > 0 ? nextValues : [""] });
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        data-testid="product-form-modal"
        className="bg-white rounded-[24px] shadow-2xl border border-slate-100 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <h2 className="text-[18px] font-bold text-sidebar-heading">
            {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-slate-50/30">
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground">صور المنتج</label>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={onDragOver}
                    onDrop={() => onDrop(idx)}
                    className={cn(
                      "relative group rounded-lg overflow-hidden border-2 aspect-square cursor-grab active:cursor-grabbing transition-all",
                      dragIdx === idx ? "border-primary opacity-50 scale-95" : "border-border hover:border-primary/50",
                      idx === 0 && "ring-2 ring-primary/30"
                    )}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">
                        رئيسية
                      </span>
                    )}
                    <button
                      onClick={() => onDeleteImage(img.id)}
                      className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {isUploading && (
                  <div className="rounded-lg border border-dashed border-border aspect-square flex items-center justify-center bg-muted">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            )}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    onUploadFiles(e.target.files);
                  }
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                data-testid="product-upload-images-button"
                className="h-9 px-4 flex items-center gap-2 rounded-lg border border-dashed border-input text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                رفع صور
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">اسم المنتج *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="مثال: حذاء رياضي..."
              data-testid="product-name-input"
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">الوصف</label>
            <RichTextEditor
              value={form.description}
              onChange={(html) => onFieldChange("description", html)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">السعر (د.ج) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => onFieldChange("price", e.target.value)}
                placeholder="0"
                dir="ltr"
                data-testid="product-price-input"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <label className="text-xs font-medium text-muted-foreground">السعر قبل التخفيض</label>
              <input
                type="number"
                value={form.compare_price}
                onChange={(e) => onFieldChange("compare_price", e.target.value)}
                placeholder="اختياري"
                dir="ltr"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">المخزون</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => onFieldChange("stock", e.target.value)}
                placeholder="0"
                dir="ltr"
                data-testid="product-stock-input"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">خيارات المنتج المخصصة</label>
                <p className="mt-1 text-[11px] text-slate-500">أضف عناصر مرنة مثل اللون، المقاس، أو أي اختيار آخر يظهر للزبون قبل الإضافة للسلة.</p>
              </div>
              <button
                type="button"
                onClick={addOptionGroup}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Plus className="h-4 w-4" />
                إضافة عنصر
              </button>
            </div>

            {form.custom_options.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                لا توجد خيارات مخصصة لهذا المنتج.
              </div>
            ) : (
              <div className="space-y-4">
                {form.custom_options.map((group, groupIndex) => (
                  <div key={groupIndex} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={group.name}
                        onChange={(e) => updateOptionGroup(groupIndex, { ...group, name: e.target.value })}
                        placeholder="اسم العنصر مثل: اللون"
                        className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionGroup(groupIndex)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition-colors hover:bg-red-100"
                        aria-label="حذف عنصر الخيارات"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {group.values.map((value, valueIndex) => (
                        <div key={`${groupIndex}-${valueIndex}`} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateOptionValue(groupIndex, valueIndex, e.target.value)}
                            placeholder="قيمة مثل: أحمر أو 42"
                            className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeOptionValue(groupIndex, valueIndex)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100"
                            aria-label="حذف قيمة"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => addOptionValue(groupIndex)}
                      className="inline-flex h-8 items-center gap-2 rounded-lg border border-input bg-white px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      إضافة قيمة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">التصنيف</label>
              <select
                value={form.category_id}
                onChange={(e) => onFieldChange("category_id", e.target.value)}
                data-testid="product-category-select"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              >
                <option value="">بدون تصنيف</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">الحالة</label>
              <select
                value={form.status}
                onChange={(e) => onFieldChange("status", e.target.value)}
                data-testid="product-status-select"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              >
                <option value="active">نشط</option>
                <option value="draft">مسودة</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-border sticky bottom-0 bg-card">
          <button
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={onSave}
            disabled={isSaving || !form.name.trim()}
            data-testid="product-save-button"
            className="h-9 px-5 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editingId ? "تحديث" : "إضافة"}
          </button>
        </div>
      </div>
    </div>
  );
}
