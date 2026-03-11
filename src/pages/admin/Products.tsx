import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type ProductStatus, type Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProductImages, useUploadProductImage, useDeleteProductImage, useReorderProductImages } from "@/hooks/useProductImages";
import { exportCsv } from "@/lib/exportCsv";
import ProductDeleteDialog from "@/components/admin/products/ProductDeleteDialog";
import ProductFormModal from "@/components/admin/products/ProductFormModal";
import ProductsTable from "@/components/admin/products/ProductsTable";
import { emptyProductForm, productStatusLabels, type ProductForm } from "@/components/admin/products/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";

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
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const { data: editImages = [] } = useProductImages(editingId);
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const reorderImages = useReorderProductImages();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx || !editingId) return;
    const reordered = [...editImages];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    const updated = reordered.map((img, i) => ({ id: img.id, sort_order: i, image_url: img.image_url }));
    reorderImages.mutate({ productId: editingId, images: updated });
    setDragIdx(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedProducts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === filtered.length) setSelectedProducts([]);
    else setSelectedProducts(filtered.map((p) => p.id));
  };

  const handleBulkDelete = () => {
    if (!window.confirm(`هل أنت متأكد من حذف ${selectedProducts.length} منتجات؟ لا يمكن التراجع عن هذا الإجراء.`)) return;
    selectedProducts.forEach((id) => deleteProduct.mutate(id));
    setSelectedProducts([]);
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.includes(search) || (p.category_name || "").includes(search);
    const matchTab = activeTab === "all" || p.status === activeTab;
    return matchSearch && matchTab;
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert("لا توجد منتجات لتصديرها");
      return;
    }

    exportCsv({
      filename: `منتجات_${new Date().toISOString().split("T")[0]}.csv`,
      headers: [
        "معرف المنتج",
        "الاسم",
        "الوصف",
        "السعر (د.ج)",
        "السعر قبل التخفيض",
        "سعر التكلفة",
        "المخزون",
        "SKU",
        "التصنيف",
        "الحالة",
      ],
      rows: filtered.map((product) => [
        product.id,
        product.name,
        product.description || "",
        product.price,
        product.compare_price || "",
        product.cost_price || "",
        product.stock,
        product.sku || "",
        product.category_name || "",
        productStatusLabels[product.status].label,
      ]),
    });
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyProductForm);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
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
      status: p.status,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      price: Number(form.price) || 0,
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      stock: Number(form.stock) || 0,
      sku: form.sku || null,
      category_id: form.category_id || null,
      status: form.status,
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, ...payload }, {
        onSuccess: () => setShowModal(false),
      });
    } else {
      createProduct.mutate(payload as any, {
        onSuccess: () => setShowModal(false),
      });
    }
  };

  const handleUploadFiles = (files: FileList) => {
    if (!editingId) return;

    Array.from(files).forEach((file) => {
      uploadImage.mutate({ productId: editingId, file });
    });
  };

  const handleDeleteImage = (imageId: string) => {
    if (!editingId) return;
    deleteImage.mutate({ id: imageId, productId: editingId });
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
    return <AdminDataState type="loading" title="جاري تحميل المنتجات" description="يتم تحضير الكتالوج والمخزون والتصنيفات." />;
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="المنتجات"
        description="إدارة الكتالوج، التصنيفات، والأسعار مع تصفح أسرع وحالات أوضح."
        meta={`${filtered.length} / ${products.length}`}
        actions={(
          <>
            <button
              onClick={handleExportCSV}
              className="h-10 rounded-xl bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-95"
            >
              تصدير CSV
            </button>
            <button
              onClick={openAdd}
              className="flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-button transition-opacity hover:opacity-95"
            >
              <Plus className="w-4 h-4" />
              إضافة منتج
            </button>
          </>
        )}
      />

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

      {/* Bulk actions */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-2.5 animate-slide-in">
          <span className="text-sm text-foreground font-medium">{selectedProducts.length} منتج محدد</span>
          <div className="flex items-center gap-2 mr-auto" dir="ltr">
            <button
              onClick={handleBulkDelete}
              className="text-xs px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground hover:opacity-90 transition-opacity"
            >
              حذف المحدد
            </button>
          </div>
        </div>
      )}

      <ProductsTable
        products={filtered}
        selectedProducts={selectedProducts}
        allProductsCount={products.length}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onEdit={openEdit}
        onRequestDelete={setDeleteConfirm}
      />

      <ProductDeleteDialog
        open={deleteConfirm !== null}
        pending={deleteProduct.isPending}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            handleDelete(deleteConfirm);
          }
        }}
      />

      <ProductFormModal
        open={showModal}
        editingId={editingId}
        form={form}
        categories={categories}
        images={editImages}
        dragIdx={dragIdx}
        isSaving={isSaving}
        isUploading={uploadImage.isPending}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        onFieldChange={updateField}
        onUploadFiles={handleUploadFiles}
        onDeleteImage={handleDeleteImage}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    </div>
  );
};

export default Products;
