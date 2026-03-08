import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";

const Customers = () => {
  const { data: customers = [], isLoading } = useCustomers();
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) => c.name.includes(search) || c.phone.includes(search) || (c.wilaya || "").includes(search)
  );

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
        <h1 className="text-xl font-semibold text-foreground">الزبائن</h1>
        <span className="text-sm text-muted-foreground">{customers.length} زبون</span>
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
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">البلدية</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">تاريخ الإضافة</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-foreground">{c.name}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground" dir="ltr">{c.phone}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.wilaya || "—"}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{c.commune || "—"}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("ar-DZ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {customers.length === 0 ? "لا يوجد زبائن بعد" : "لا يوجد زبائن مطابقين"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
