import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePaginatedProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, type ProductStatus, type Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProductImages, useUploadProductImage, useDeleteProductImage, useReorderProductImages } from "@/hooks/useProductImages";
import { exportCsv } from "@/lib/exportCsv";
import ProductDeleteDialog from "@/components/admin/products/ProductDeleteDialog";
import ProductFormModal from "@/components/admin/products/ProductFormModal";
import ProductsTable from "@/components/admin/products/ProductsTable";
import { emptyProductForm, productStatusLabels, type ProductForm } from "@/components/admin/products/types";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";

type DraftProductImage = {
  id: string;
  image_url: string;
  persistedId?: string;
  file?: File;
  previewObjectUrl?: string;
};

const Products = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | ProductStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [draftImages, setDraftImages] = useState<DraftProductImage[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isSyncingImages, setIsSyncingImages] = useState(false);
  const [productDraftDirty, setProductDraftDirty] = useState(false);

  const { data: paginatedProducts, isLoading } = usePaginatedProducts(
    {
      search,
      status: activeTab,
    },
    {
      page: currentPage,
      limit: 20,
    }
  );
  const products = paginatedProducts?.items ?? [];
  const totalProducts = paginatedProducts?.pagination.total ?? products.length;
  const totalPages = paginatedProducts?.pagination.totalPages ?? 1;
  const { data: categories = [] } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const { data: editImages = [] } = useProductImages(editingId);
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const reorderImages = useReorderProductImages();
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedProducts([]);
  }, [search, activeTab]);

  useEffect(() => {
    if (!showModal || !editingId) return;

    setDraftImages(
      editImages.map((img) => ({
        id: img.id,
        persistedId: img.id,
        image_url: img.image_url,
      }))
    );
  }, [showModal, editingId, editImages]);

  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) return;
    setProductDraftDirty(true);
    const reordered = [...draftImages];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(dropIdx, 0, moved);
    setDraftImages(reordered);
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
    void (async () => {
      try {
        for (const id of selectedProducts) {
          await deleteProduct.mutateAsync({ id, suppressToast: true });
        }
        toast.success(`تم حذف ${selectedProducts.length} منتجات بنجاح`);
        setSelectedProducts([]);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "فشل حذف بعض المنتجات");
      }
    })();
  };

  const filtered = products;
  const hasActiveFilters = Boolean(search.trim() || activeTab !== "all");
  const catalogInsights = useMemo(() => {
    const activeCount = products.filter((product) => product.status === "active").length;
    const lowStockCount = products.filter((product) => product.stock > 0 && product.stock < 15).length;
    const outOfStockCount = products.filter((product) => product.stock === 0).length;
    const onSaleCount = products.filter((product) => Number(product.compare_price || 0) > Number(product.price || 0)).length;

    return {
      visibleCount: filtered.length,
      activeCount,
      lowStockCount,
      outOfStockCount,
      onSaleCount,
    };
  }, [filtered.length, products]);

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
        "المخزون",
        "التصنيف",
        "الحالة",
      ],
      rows: filtered.map((product) => [
        product.id,
        product.name,
        product.description || "",
        product.price,
        product.compare_price || "",
        product.stock,
        product.category_name || "",
        productStatusLabels[product.status].label,
      ]),
    });
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyProductForm);
    setDraftImages([]);
    setProductDraftDirty(false);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : "",
      stock: String(p.stock),
      category_id: p.category_id || "",
      status: p.status,
      custom_options: p.custom_options || [],
    });
    setDraftImages([]);
    setProductDraftDirty(false);
    setShowModal(true);
  };

  const cleanupDraftObjectUrls = () => {
    draftImages.forEach((image) => {
      if (image.previewObjectUrl) {
        URL.revokeObjectURL(image.previewObjectUrl);
      }
    });
  };

  const resetModalState = () => {
    cleanupDraftObjectUrls();
    setDraftImages([]);
    setDragIdx(null);
    setProductDraftDirty(false);
    setShowModal(false);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    if (!isSaving && productDraftDirty && !window.confirm("لديك تعديلات غير محفوظة على المنتج. هل تريد إغلاق النافذة؟")) {
      return;
    }
    resetModalState();
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      price: Number(form.price) || 0,
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      stock: Number(form.stock) || 0,
      category_id: form.category_id || null,
      custom_options: form.custom_options,
      status: form.status,
    };

    if (editingId) {
      try {
        setIsSyncingImages(true);
        const currentProduct = products.find((product) => product.id === editingId);
        await updateProduct.mutateAsync({ id: editingId, ...payload, version: currentProduct?.version, suppressToast: true });

        const existingImageIds = new Set(editImages.map((img) => img.id));
        const keptExistingIds = new Set(
          draftImages.map((img) => img.persistedId).filter((value): value is string => Boolean(value))
        );

        const deletedExistingIds = Array.from(existingImageIds).filter((id) => !keptExistingIds.has(id));
        for (const imageId of deletedExistingIds) {
          await deleteImage.mutateAsync({ id: imageId, productId: editingId, suppressToast: true });
        }

        const finalizedImages: { id: string; image_url: string; sort_order: number }[] = [];
        for (const image of draftImages) {
          if (image.persistedId) {
            finalizedImages.push({
              id: image.persistedId,
              image_url: image.image_url,
              sort_order: finalizedImages.length,
            });
            continue;
          }

          if (!image.file) continue;
          const uploaded = await uploadImage.mutateAsync({ productId: editingId, file: image.file, suppressToast: true });
          finalizedImages.push({
            id: uploaded.id,
            image_url: uploaded.image_url,
            sort_order: finalizedImages.length,
          });
        }

        if (finalizedImages.length > 0) {
          await reorderImages.mutateAsync({ productId: editingId, images: finalizedImages });
        }

        resetModalState();
        toast.success("تم تحديث المنتج بنجاح");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "فشل حفظ المنتج");
      } finally {
        setIsSyncingImages(false);
      }
    } else {
      try {
        setIsSyncingImages(true);
        const created = await createProduct.mutateAsync({ ...(payload as any), suppressToast: true });
        const newProductId = (created as any)?.id;

        // Upload images that were selected during creation
        if (newProductId && draftImages.length > 0) {
          const finalizedImages: { id: string; image_url: string; sort_order: number }[] = [];
          for (const image of draftImages) {
            if (!image.file) continue;
            const uploaded = await uploadImage.mutateAsync({ productId: newProductId, file: image.file, suppressToast: true });
            finalizedImages.push({
              id: uploaded.id,
              image_url: uploaded.image_url,
              sort_order: finalizedImages.length,
            });
          }
          if (finalizedImages.length > 0) {
            await reorderImages.mutateAsync({ productId: newProductId, images: finalizedImages });
          }
        }

        resetModalState();
        toast.success("تم إضافة المنتج بنجاح");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "فشل إنشاء المنتج");
      } finally {
        setIsSyncingImages(false);
      }
    }
  };

  const handleUploadFiles = (files: FileList) => {
    const nextImages = Array.from(files).map((file) => {
      const previewObjectUrl = URL.createObjectURL(file);
      return {
        id: `draft-${crypto.randomUUID()}`,
        image_url: previewObjectUrl,
        file,
        previewObjectUrl,
      } satisfies DraftProductImage;
    });
    setProductDraftDirty(true);
    setDraftImages((prev) => [...prev, ...nextImages]);
  };

  const handleDeleteImage = (imageId: string) => {
    setProductDraftDirty(true);
    setDraftImages((prev) => {
      const target = prev.find((image) => image.id === imageId);
      if (target?.previewObjectUrl) {
        URL.revokeObjectURL(target.previewObjectUrl);
      }
      return prev.filter((image) => image.id !== imageId);
    });
  };

  const handleDelete = (id: string) => {
    deleteProduct.mutate({ id }, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  const updateField = (key: keyof ProductForm, value: string | ProductForm["custom_options"]) => {
    setProductDraftDirty(true);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isSaving =
    createProduct.isPending ||
    updateProduct.isPending ||
    uploadImage.isPending ||
    deleteImage.isPending ||
    reorderImages.isPending ||
    isSyncingImages;

  if (isLoading) {
    return <AdminDataState type="loading" title="جاري تحميل المنتجات" description="يتم تحضير الكتالوج والمخزون والتصنيفات." />;
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="المنتجات"
        description="إدارة الكتالوج، التصنيفات، والأسعار مع تصفح أسرع وحالات أوضح."
        meta={`${filtered.length} / ${totalProducts}`}
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
              data-testid="products-add-button"
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
          const count = tab === activeTab || (tab === "all" && activeTab === "all")
            ? totalProducts
            : undefined;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {labels[tab]} {count !== undefined && <span className="text-xs text-muted-foreground mr-1">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="products-search-input"
            className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab !== "all" && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              التبويب الحالي: {productStatusLabels[activeTab].label}
            </span>
          )}
          {search.trim() && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              بحث: {search.trim()}
            </span>
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveTab("all");
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              تصفير الفلاتر
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">المعروض الآن</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{catalogInsights.visibleCount}</p>
          <p className="mt-1 text-xs text-slate-500">من أصل {totalProducts} منتجًا</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700">منتجات نشطة</p>
          <p className="mt-2 text-2xl font-black text-emerald-900">{catalogInsights.activeCount}</p>
          <p className="mt-1 text-xs text-emerald-700">جاهزة للظهور داخل المتجر</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold text-amber-700">مخزون منخفض</p>
          <p className="mt-2 text-2xl font-black text-amber-900">{catalogInsights.lowStockCount}</p>
          <p className="mt-1 text-xs text-amber-700">أقل من 15 قطعة</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold text-rose-700">نفد المخزون</p>
          <p className="mt-2 text-2xl font-black text-rose-900">{catalogInsights.outOfStockCount}</p>
          <p className="mt-1 text-xs text-rose-700">تحتاج إعادة تعبئة أو إخفاء</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold text-sky-700">عروض حالية</p>
          <p className="mt-2 text-2xl font-black text-sky-900">{catalogInsights.onSaleCount}</p>
          <p className="mt-1 text-xs text-sky-700">منتجات بسعر قبل التخفيض</p>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedProducts.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 animate-slide-in md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-foreground">{selectedProducts.length} منتج محدد</span>
            <p className="text-xs text-muted-foreground">استخدم الحذف الجماعي فقط عندما تكون متأكدًا أن هذه المنتجات لم تعد مطلوبة.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="h-9 rounded-lg bg-destructive px-3 text-xs font-medium text-destructive-foreground hover:opacity-90 transition-opacity"
            >
              حذف المحدد
            </button>
            <button
              type="button"
              onClick={() => setSelectedProducts([])}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <AdminDataState
          type="empty"
          title={hasActiveFilters ? "لا توجد منتجات مطابقة" : "لا توجد منتجات بعد"}
          description={
            hasActiveFilters
              ? "جرّب تغيير البحث أو التبويب الحالي، أو أعد تصفير الفلاتر للرجوع إلى كامل الكتالوج."
              : "ابدأ بإضافة أول منتج حتى يظهر الكتالوج داخل المتجر وتتمكن من إدارة المخزون والأسعار."
          }
          actionLabel={hasActiveFilters ? "عرض كل المنتجات" : "إضافة منتج"}
          onAction={() => {
            if (hasActiveFilters) {
              setSearch("");
              setActiveTab("all");
              setCurrentPage(1);
              return;
            }
            openAdd();
          }}
        />
      ) : (
        <ProductsTable
          products={filtered}
          selectedProducts={selectedProducts}
          allProductsCount={totalProducts}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onEdit={openEdit}
          onRequestDelete={setDeleteConfirm}
        />
      )}

      {filtered.length > 0 && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage > 1) {
                    setCurrentPage((page) => page - 1);
                  }
                }}
                className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(Math.max(currentPage - 3, 0), Math.max(currentPage - 3, 0) + 5)
              .map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage < totalPages) {
                    setCurrentPage((page) => page + 1);
                  }
                }}
                className={cn(currentPage >= totalPages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

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
        images={draftImages}
        dragIdx={dragIdx}
        isSaving={isSaving}
        isUploading={false}
        onClose={closeModal}
        onSave={handleSave}
        hasUnsavedChanges={productDraftDirty}
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
