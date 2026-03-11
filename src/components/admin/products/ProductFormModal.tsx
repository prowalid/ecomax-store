import { Loader2, Save, Upload, X } from "lucide-react";
import { useRef } from "react";

import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/hooks/useCategories";
import type { ProductImage } from "@/hooks/useProductImages";

import type { ProductForm } from "./types";

interface ProductFormModalProps {
  open: boolean;
  editingId: string | null;
  form: ProductForm;
  categories: Category[];
  images: ProductImage[];
  dragIdx: number | null;
  isSaving: boolean;
  isUploading: boolean;
  onClose: () => void;
  onSave: () => void;
  onFieldChange: (key: keyof ProductForm, value: string) => void;
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

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
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

            {editingId && (
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

            {editingId ? (
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
                  className="h-9 px-4 flex items-center gap-2 rounded-lg border border-dashed border-input text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  رفع صور
                </button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                💡 أضف المنتج أولاً ثم يمكنك رفع الصور عبر تعديله
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">اسم المنتج *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="مثال: حذاء رياضي..."
              className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">الوصف</label>
            <Textarea
              value={form.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              placeholder={"يمكنك كتابة نص عادي أو HTML بسيط مثل:\n<p>وصف المنتج</p>\n<ul><li>ميزة 1</li><li>ميزة 2</li></ul>"}
              rows={5}
              className="resize-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            />
            <p className="text-[11px] text-muted-foreground">
              مدعوم: <span dir="ltr">p, br, strong, b, em, ul, ol, li</span> والنص العادي أيضًا.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">السعر (د.ج) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => onFieldChange("price", e.target.value)}
                placeholder="0"
                dir="ltr"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">سعر التكلفة</label>
              <input
                type="number"
                value={form.cost_price}
                onChange={(e) => onFieldChange("cost_price", e.target.value)}
                placeholder="اختياري"
                dir="ltr"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">المخزون</label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => onFieldChange("stock", e.target.value)}
                placeholder="0"
                dir="ltr"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">رمز SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => onFieldChange("sku", e.target.value)}
                placeholder="اختياري"
                dir="ltr"
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">التصنيف</label>
              <select
                value={form.category_id}
                onChange={(e) => onFieldChange("category_id", e.target.value)}
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
