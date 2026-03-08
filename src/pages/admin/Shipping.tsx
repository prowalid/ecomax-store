import { useState } from "react";
import { Save } from "lucide-react";

interface WilayaShipping {
  id: number;
  name: string;
  homePrice: number;
  deskPrice: number;
}

const initialWilayas: WilayaShipping[] = [
  { id: 1, name: "أدرار", homePrice: 800, deskPrice: 500 },
  { id: 2, name: "الشلف", homePrice: 600, deskPrice: 400 },
  { id: 3, name: "الأغواط", homePrice: 700, deskPrice: 450 },
  { id: 4, name: "أم البواقي", homePrice: 650, deskPrice: 400 },
  { id: 5, name: "باتنة", homePrice: 600, deskPrice: 400 },
  { id: 6, name: "بجاية", homePrice: 600, deskPrice: 400 },
  { id: 7, name: "بسكرة", homePrice: 650, deskPrice: 400 },
  { id: 8, name: "بشار", homePrice: 850, deskPrice: 550 },
  { id: 9, name: "البليدة", homePrice: 400, deskPrice: 300 },
  { id: 10, name: "البويرة", homePrice: 500, deskPrice: 350 },
  { id: 16, name: "الجزائر", homePrice: 400, deskPrice: 250 },
  { id: 31, name: "وهران", homePrice: 500, deskPrice: 350 },
  { id: 25, name: "قسنطينة", homePrice: 550, deskPrice: 350 },
  { id: 19, name: "سطيف", homePrice: 550, deskPrice: 350 },
];

const Shipping = () => {
  const [wilayas, setWilayas] = useState(initialWilayas);

  const updatePrice = (id: number, field: "homePrice" | "deskPrice", value: number) => {
    setWilayas((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">إعدادات الشحن</h1>
          <p className="text-muted-foreground text-sm mt-1">أسعار التوصيل للمنزل والمكتب حسب الولاية</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Save className="w-4 h-4" />
          حفظ التغييرات
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden animate-fade-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الرقم</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">الولاية</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">التوصيل للمنزل (د.ج)</th>
              <th className="text-right text-xs font-medium text-muted-foreground p-4">التوصيل للمكتب (د.ج)</th>
            </tr>
          </thead>
          <tbody>
            {wilayas.map((w) => (
              <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4 text-sm text-muted-foreground">{w.id}</td>
                <td className="p-4 text-sm font-medium text-foreground">{w.name}</td>
                <td className="p-4">
                  <input
                    type="number"
                    value={w.homePrice}
                    onChange={(e) => updatePrice(w.id, "homePrice", Number(e.target.value))}
                    className="w-24 px-3 py-1.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="number"
                    value={w.deskPrice}
                    onChange={(e) => updatePrice(w.id, "deskPrice", Number(e.target.value))}
                    className="w-24 px-3 py-1.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Shipping;
