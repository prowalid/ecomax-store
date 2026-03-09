import { useState, useEffect } from "react";
import { Save, Search, Loader2 } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { ALGERIA_WILAYAS } from "@/data/algeriaWilayas";

interface WilayaShipping {
  id: number;
  name: string;
  homePrice: number;
  deskPrice: number;
}

interface ShippingSettings {
  wilayas: WilayaShipping[];
}

const Shipping = () => {
  const { settings, loading, saving, saveSettings } = useStoreSettings<ShippingSettings>("shipping", { wilayas: [] });
  const [wilayas, setWilayas] = useState<WilayaShipping[]>(() =>
    ALGERIA_WILAYAS.map((w) => ({ id: w.id, name: w.name, homePrice: w.priceHome, deskPrice: w.priceDesk }))
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (settings.wilayas && settings.wilayas.length > 0) {
      // Merge: keep ALGERIA_WILAYAS as base, apply saved overrides by name
      const savedMap = new Map(settings.wilayas.map((w) => [w.name, w]));
      setWilayas(
        ALGERIA_WILAYAS.map((w) => {
          const saved = savedMap.get(w.name);
          return {
            id: w.id,
            name: w.name,
            homePrice: saved?.homePrice ?? w.priceHome,
            deskPrice: saved?.deskPrice ?? w.priceDesk,
          };
        })
      );
    }
  }, [settings]);

  const filtered = wilayas.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toString().includes(search)
  );

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
