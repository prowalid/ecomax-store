import { useState, useEffect } from "react";
import { Save, Search, Loader2 } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";

interface WilayaShipping {
  id: number;
  name: string;
  homePrice: number;
  deskPrice: number;
}

const DEFAULT_WILAYAS: WilayaShipping[] = [
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
  { id: 11, name: "تمنراست", homePrice: 900, deskPrice: 600 },
  { id: 12, name: "تبسة", homePrice: 650, deskPrice: 400 },
  { id: 13, name: "تلمسان", homePrice: 600, deskPrice: 400 },
  { id: 14, name: "تيارت", homePrice: 600, deskPrice: 400 },
  { id: 15, name: "تيزي وزو", homePrice: 500, deskPrice: 350 },
  { id: 16, name: "الجزائر", homePrice: 400, deskPrice: 250 },
  { id: 17, name: "الجلفة", homePrice: 650, deskPrice: 400 },
  { id: 18, name: "جيجل", homePrice: 600, deskPrice: 400 },
  { id: 19, name: "سطيف", homePrice: 550, deskPrice: 350 },
  { id: 20, name: "سعيدة", homePrice: 650, deskPrice: 400 },
  { id: 21, name: "سكيكدة", homePrice: 600, deskPrice: 400 },
  { id: 22, name: "سيدي بلعباس", homePrice: 600, deskPrice: 400 },
  { id: 23, name: "عنابة", homePrice: 550, deskPrice: 350 },
  { id: 24, name: "قالمة", homePrice: 600, deskPrice: 400 },
  { id: 25, name: "قسنطينة", homePrice: 550, deskPrice: 350 },
  { id: 26, name: "المدية", homePrice: 500, deskPrice: 350 },
  { id: 27, name: "مستغانم", homePrice: 550, deskPrice: 350 },
  { id: 28, name: "المسيلة", homePrice: 600, deskPrice: 400 },
  { id: 29, name: "معسكر", homePrice: 600, deskPrice: 400 },
  { id: 30, name: "ورقلة", homePrice: 750, deskPrice: 500 },
  { id: 31, name: "وهران", homePrice: 500, deskPrice: 350 },
  { id: 32, name: "البيض", homePrice: 750, deskPrice: 500 },
  { id: 33, name: "إليزي", homePrice: 900, deskPrice: 600 },
  { id: 34, name: "برج بوعريريج", homePrice: 600, deskPrice: 400 },
  { id: 35, name: "بومرداس", homePrice: 450, deskPrice: 300 },
  { id: 36, name: "الطارف", homePrice: 600, deskPrice: 400 },
  { id: 37, name: "تندوف", homePrice: 900, deskPrice: 600 },
  { id: 38, name: "تيسمسيلت", homePrice: 600, deskPrice: 400 },
  { id: 39, name: "الوادي", homePrice: 700, deskPrice: 450 },
  { id: 40, name: "خنشلة", homePrice: 650, deskPrice: 400 },
  { id: 41, name: "سوق أهراس", homePrice: 650, deskPrice: 400 },
  { id: 42, name: "تيبازة", homePrice: 450, deskPrice: 300 },
  { id: 43, name: "ميلة", homePrice: 600, deskPrice: 400 },
  { id: 44, name: "عين الدفلى", homePrice: 550, deskPrice: 350 },
  { id: 45, name: "النعامة", homePrice: 750, deskPrice: 500 },
  { id: 46, name: "عين تموشنت", homePrice: 550, deskPrice: 350 },
  { id: 47, name: "غرداية", homePrice: 700, deskPrice: 450 },
  { id: 48, name: "غليزان", homePrice: 600, deskPrice: 400 },
  { id: 49, name: "تيميمون", homePrice: 900, deskPrice: 600 },
  { id: 50, name: "برج باجي مختار", homePrice: 950, deskPrice: 650 },
  { id: 51, name: "أولاد جلال", homePrice: 700, deskPrice: 450 },
  { id: 52, name: "بني عباس", homePrice: 850, deskPrice: 550 },
  { id: 53, name: "عين صالح", homePrice: 900, deskPrice: 600 },
  { id: 54, name: "عين قزام", homePrice: 950, deskPrice: 650 },
  { id: 55, name: "توقرت", homePrice: 700, deskPrice: 450 },
  { id: 56, name: "جانت", homePrice: 950, deskPrice: 650 },
  { id: 57, name: "المغير", homePrice: 700, deskPrice: 450 },
  { id: 58, name: "المنيعة", homePrice: 750, deskPrice: 500 },
];

interface ShippingSettings {
  wilayas: WilayaShipping[];
}

const Shipping = () => {
  const { settings, loading, saving, saveSettings } = useStoreSettings<ShippingSettings>("shipping", { wilayas: [] });
  const [wilayas, setWilayas] = useState<WilayaShipping[]>(DEFAULT_WILAYAS);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (settings.wilayas && settings.wilayas.length > 0) {
      setWilayas(settings.wilayas);
    }
  }, [settings]);

  const filtered = wilayas.filter((w) => w.name.includes(search) || w.id.toString().includes(search));

  const updatePrice = (id: number, field: "homePrice" | "deskPrice", value: number) => {
    setWilayas((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const handleSave = () => {
    saveSettings({ wilayas });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">الشحن</h1>
          <p className="text-sm text-muted-foreground mt-0.5">أسعار التوصيل للمنزل والمكتب حسب الولاية</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 px-4 flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-button hover:opacity-95 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التغييرات
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="بحث عن ولاية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
        />
      </div>

      <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden animate-slide-in">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-16">#</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">الولاية</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">🏠 التوصيل للمنزل (د.ج)</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">🏢 التوصيل للمكتب (د.ج)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((w) => (
              <tr key={w.id} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors">
                <td className="px-5 py-2.5 text-sm text-muted-foreground font-mono">{String(w.id).padStart(2, "0")}</td>
                <td className="px-5 py-2.5 text-sm font-medium text-foreground">{w.name}</td>
                <td className="px-5 py-2.5">
                  <input
                    type="number"
                    value={w.homePrice}
                    onChange={(e) => updatePrice(w.id, "homePrice", Number(e.target.value))}
                    className="w-24 h-8 px-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors text-center"
                  />
                </td>
                <td className="px-5 py-2.5">
                  <input
                    type="number"
                    value={w.deskPrice}
                    onChange={(e) => updatePrice(w.id, "deskPrice", Number(e.target.value))}
                    className="w-24 h-8 px-2.5 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors text-center"
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
