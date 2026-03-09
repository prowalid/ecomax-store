import { useState } from "react";
import { Plus, FolderOpen, GripVertical, Loader2, Trash2, Image, X } from "lucide-react";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/useCategories";

const Categories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateCategory = useUpdateCategory();
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleAdd = () => {
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/\s+/g, "-");
    createCategory.mutate(
      { name: newName.trim(), slug, sort_order: categories.length + 1 },
      { onSuccess: () => { setNewName(""); setShowAdd(false); } }
    );
  };

  const handleImageSave = (catId: string) => {
    updateCategory.mutate({ id: catId, image_url: imageUrl || null });
    setEditingImage(null);
    setImageUrl("");
  };

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
        <h1 className="text-xl font-semibold text-foreground">التصنيفات</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة تصنيف
        </button>
      </div>

      {showAdd && (
        <div className="bg-card rounded-lg shadow-card border border-border p-4 flex items-center gap-3 animate-slide-in">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم التصنيف..."
            className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
          />
          <button
            onClick={handleAdd}
            disabled={createCategory.isPending}
            className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {createCategory.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إضافة"}
          </button>
        </div>
      )}

      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {categories.map((cat) => (
            <div key={cat.id} className="px-5 py-3.5 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-4">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                
                {/* Category image thumbnail */}
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-10 h-10 rounded-lg object-cover border border-border" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{cat.name}</p>
                  {cat.image_url && (
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]" dir="ltr">{cat.image_url}</p>
                  )}
                </div>

                <button
                  onClick={() => { setEditingImage(editingImage === cat.id ? null : cat.id); setImageUrl(cat.image_url || ""); }}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="تغيير الصورة"
                >
                  <Image className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteCategory.mutate(cat.id)}
                  className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Image edit panel */}
              {editingImage === cat.id && (
                <div className="mt-3 mr-8 flex items-center gap-2 animate-slide-in">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="ألصق رابط صورة التصنيف..."
                    dir="ltr"
                    className="flex-1 h-8 px-3 rounded-lg border border-input bg-background text-foreground text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
                  />
                  <button
                    onClick={() => handleImageSave(cat.id)}
                    disabled={updateCategory.isPending}
                    className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-95 disabled:opacity-50"
                  >
                    حفظ
                  </button>
                  {cat.image_url && (
                    <button
                      onClick={() => { setImageUrl(""); updateCategory.mutate({ id: cat.id, image_url: null }); setEditingImage(null); }}
                      className="h-8 px-2 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              لا توجد تصنيفات بعد
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
