import { useState } from "react";
import { Plus, FolderOpen, GripVertical, Loader2, Trash2 } from "lucide-react";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/useCategories";

const Categories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/\s+/g, "-");
    createCategory.mutate(
      { name: newName.trim(), slug, sort_order: categories.length + 1 },
      { onSuccess: () => { setNewName(""); setShowAdd(false); } }
    );
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
            <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{cat.name}</p>
              </div>
              <button
                onClick={() => deleteCategory.mutate(cat.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
