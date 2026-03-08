import { useState } from "react";
import { Search, Phone, MapPin, ShoppingCart } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  wilaya: string;
  orders: number;
  totalSpent: string;
  lastOrder: string;
  status: "active" | "inactive";
}

const initialCustomers: Customer[] = [
  { id: "C001", name: "أحمد بن علي", phone: "0555 12 34 56", wilaya: "الجزائر", orders: 5, totalSpent: "22,500 د.ج", lastOrder: "اليوم", status: "active" },
  { id: "C002", name: "فاطمة زهراء", phone: "0661 23 45 67", wilaya: "وهران", orders: 3, totalSpent: "9,600 د.ج", lastOrder: "أمس", status: "active" },
  { id: "C003", name: "محمد كريم", phone: "0770 12 34 56", wilaya: "قسنطينة", orders: 8, totalSpent: "62,400 د.ج", lastOrder: "منذ يومين", status: "active" },
  { id: "C004", name: "سارة بوعلام", phone: "0550 98 76 54", wilaya: "سطيف", orders: 1, totalSpent: "2,100 د.ج", lastOrder: "منذ أسبوع", status: "inactive" },
  { id: "C005", name: "يوسف حداد", phone: "0660 11 22 33", wilaya: "باتنة", orders: 2, totalSpent: "11,200 د.ج", lastOrder: "منذ 3 أيام", status: "active" },
];

const Customers = () => {
  const [search, setSearch] = useState("");

  const filtered = initialCustomers.filter(
    (c) => c.name.includes(search) || c.phone.includes(search) || c.wilaya.includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">الزبائن</h1>
        <span className="text-sm text-muted-foreground">{initialCustomers.length} زبون</span>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث بالاسم، الهاتف، أو الولاية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
        />
      </div>

      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الزبون</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الهاتف</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الولاية</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الطلبات</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">إجمالي الإنفاق</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">آخر طلب</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{c.name}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground" dir="ltr">{c.phone}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.wilaya}</td>
                <td className="px-5 py-3 text-sm text-foreground">{c.orders}</td>
                <td className="px-5 py-3 text-sm font-medium text-foreground">{c.totalSpent}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.lastOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">لا يوجد زبائن مطابقين</div>
        )}
      </div>
    </div>
  );
};

export default Customers;
