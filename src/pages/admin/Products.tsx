import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, Pencil, Trash2, X, Save, Image, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type ProductStatus } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProductImages, useUploadProductImage, useDeleteProductImage } from "@/hooks/useProductImages";

const statusLabels: Record<ProductStatus, { label: string; variant: "success" | "secondary" | "destructive" }> = {
  active: { label: "نشط", variant: "success" },
  draft: { label: "مسودة", variant: "secondary" },
  archived: { label: "مؤرشف", variant: "destructive" },
};

const formatPrice = (n: number) => Number(n).toLocaleString("ar-DZ") + " د.ج";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  compare_price: string;
  cost_price: string;
  stock: string;
  sku: string;
  category_id: string;
  status: ProductStatus;
}
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  price: "",
  compare_price: "",
  cost_price: "",
  stock: "0",
  sku: "",
  category_id: "",
  status: "active",
  status: "active",
};

const Products = () => {
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | ProductStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: editImages = [], isLoading: imagesLoading } = useProductImages(editingId);
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();

  const filtered = products.filter((p) => {
    const matchSearch = p.name.includes(search) || (p.category_name || "").includes(search);
    const matchTab = activeTab === "all" || p.status === activeTab;
    return matchSearch && matchTab;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : "",
      cost_price: p.cost_price ? String(p.cost_price) : "",
      stock: String(p.stock),
      sku: p.sku || "",
      category_id: p.category_id || "",
      image_url: p.image_url || "",
      status: p.status,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload: any = {
      name: form.name.trim(),
      description: form.description || null,
      price: Number(form.price) || 0,
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      stock: Number(form.stock) || 0,
      sku: form.sku || null,
      category_id: form.category_id || null,
      image_url: form.image_url || null,
      status: form.status,
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, ...payload }, {
        onSuccess: () => setShowModal(false),
      });
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => setShowModal(false),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteProduct.mutate(id, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  const updateField = (key: keyof ProductForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isSaving = createProduct.isPending || updateProduct.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">المنتجات</h1>
        <button
          onClick={openAdd}
          className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {(["all", "active", "draft", "archived"] as const).map((tab) => {
          const labels = { all: "الكل", active: "نشط", draft: "مسودة", archived: "مؤرشف" };
          const count = tab === "all" ? products.length : products.filter((p) => p.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {labels[tab]} <span className="text-xs text-muted-foreground mr-1">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
        />
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">المنتج</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">الحالة</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">المخزون</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">السعر</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">التصنيف</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const s = statusLabels[product.status];
              return (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-muted border border-border flex items-center justify-center text-lg shrink-0 overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          "📦"
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground block">{product.name}</span>
                        {product.sku && <span className="text-xs text-muted-foreground" dir="ltr">SKU: {product.sku}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.variant}>{s.label}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-sm",
                      product.stock === 0 ? "text-destructive font-medium" : product.stock < 15 ? "text-orange-500 font-medium" : "text-foreground"
                    )}>
                      {product.stock === 0 ? "نفذ" : `${product.stock}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{formatPrice(product.price)}</span>
                      {product.compare_price && (
                        <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compare_price)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-muted-foreground">{product.category_name || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {products.length === 0 ? "لا توجد منتجات بعد — أضف أول منتج" : "لا توجد منتجات مطابقة"}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-card rounded-xl shadow-xl border border-border p-6 w-full max-w-sm mx-4 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-foreground">حذف المنتج</h3>
            <p className="text-sm text-muted-foreground">هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="h-9 px-4 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteProduct.isPending}
                className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deleteProduct.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div
            className="bg-card rounded-xl shadow-xl border border-border w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-base font-semibold text-foreground">
                {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground">صور المنتج</label>
                
                {/* Existing images grid */}
                {editingId && (
                  <div className="grid grid-cols-4 gap-3">
                    {editImages.map((img) => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => deleteImage.mutate({ id: img.id, productId: editingId, imageUrl: img.image_url })}
                          className="absolute top-1 left-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {uploadImage.isPending && (
                      <div className="rounded-lg border border-dashed border-border aspect-square flex items-center justify-center bg-muted">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>
                )}

                {/* Upload button */}
                {editingId ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (!files || !editingId) return;
                        Array.from(files).forEach((file) => {
                          uploadImage.mutate({ productId: editingId, file });
                        });
                        e.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadImage.isPending}
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

                {/* Fallback URL input */}
                <div className="flex gap-3 items-start">
                  <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {form.image_url ? (
                      <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs text-muted-foreground">أو ألصق رابط الصورة الرئيسية</label>
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) => updateField("image_url", e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      dir="ltr"
                      className="w-full h-8 px-3 rounded-lg border border-input bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">اسم المنتج *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="مثال: حذاء رياضي..."
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">الوصف</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="وصف المنتج..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors resize-none"
                />
              </div>

              {/* Price Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">السعر (د.ج) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
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
                    onChange={(e) => updateField("compare_price", e.target.value)}
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
                    onChange={(e) => updateField("cost_price", e.target.value)}
                    placeholder="اختياري"
                    dir="ltr"
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
              </div>

              {/* Stock & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">المخزون</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => updateField("stock", e.target.value)}
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
                    onChange={(e) => updateField("sku", e.target.value)}
                    placeholder="اختياري"
                    dir="ltr"
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">التصنيف</label>
                  <select
                    value={form.category_id}
                    onChange={(e) => updateField("category_id", e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  >
                    <option value="">بدون تصنيف</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">الحالة</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  >
                    <option value="active">نشط</option>
                    <option value="draft">مسودة</option>
                    <option value="archived">مؤرشف</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-border sticky bottom-0 bg-card">
              <button
                onClick={() => setShowModal(false)}
                className="h-9 px-4 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !form.name.trim()}
                className="h-9 px-5 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "تحديث" : "إضافة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
