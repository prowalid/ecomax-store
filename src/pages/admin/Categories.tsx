import { useState } from "react";
import { Plus, FolderOpen, GripVertical } from "lucide-react";

interface Category {
  id: string;
  name: string;
  productsCount: number;
  order: number;
}

const initialCategories: Category[] = [
  { id: "CAT1", name: "أحذية", productsCount: 12, order: 1 },
  { id: "CAT2", name: "ساعات", productsCount: 8, order: 2 },
  { id: "CAT3", name: "ملابس رجالية", productsCount: 15, order: 3 },
  { id: "CAT4", name: "ملابس نسائية", productsCount: 20, order: 4 },
  { id: "CAT5", name: "إكسسوارات", productsCount: 6, order: 5 },
];

const Categories = () => {
  const [categories] = useState(initialCategories);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">التصنيفات</h1>
        <button className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity flex items-center gap-2">
          <Plus className="w-4 h-4" />
          إضافة تصنيف
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/40 transition-colors">
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <FolderOpen className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{cat.name}</p>
              </div>
              <span className="text-xs text-muted-foreground">{cat.productsCount} منتج</span>
              <button className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                تعديل
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
