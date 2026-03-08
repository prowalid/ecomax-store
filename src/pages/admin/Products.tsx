import { useState } from "react";
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  comparePrice?: string;
  stock: number;
  category: string;
  image: string;
  status: "active" | "draft";
}

const sampleProducts: Product[] = [
  { id: "1", name: "حذاء رياضي Nike Air", price: "4,500 د.ج", comparePrice: "5,500 د.ج", stock: 45, category: "أحذية", image: "👟", status: "active" },
  { id: "2", name: "تيشرت قطن ممتاز", price: "1,600 د.ج", stock: 120, category: "ملابس", image: "👕", status: "active" },
  { id: "3", name: "ساعة ذكية GT3 Pro", price: "7,800 د.ج", comparePrice: "9,000 د.ج", stock: 23, category: "إلكترونيات", image: "⌚", status: "active" },
  { id: "4", name: "حقيبة ظهر جلدية", price: "3,200 د.ج", stock: 0, category: "إكسسوارات", image: "🎒", status: "draft" },
  { id: "5", name: "نظارات شمسية بولارايزد", price: "2,400 د.ج", stock: 67, category: "إكسسوارات", image: "🕶️", status: "active" },
];

const Products = () => {
  const [products] = useState(sampleProducts);
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.includes(search) || p.category.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">المنتجات</h1>
          <p className="text-muted-foreground text-sm mt-1">{products.length} منتجات</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="البحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right text-xs font-medium text-muted-foreground p-4">المنتج</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">السعر</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">المخزون</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">التصنيف</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الحالة</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                      {product.image}
                    </div>
                    <span className="text-sm font-medium text-foreground">{product.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">{product.price}</span>
                    {product.comparePrice && (
                      <span className="text-xs text-muted-foreground line-through">{product.comparePrice}</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-sm font-medium ${product.stock === 0 ? "text-destructive" : "text-foreground"}`}>
                    {product.stock === 0 ? "نفذ" : product.stock}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    product.status === "active"
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {product.status === "active" ? "نشط" : "مسودة"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
