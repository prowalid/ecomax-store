import { useRef, useState, useEffect, useCallback, useDeferredValue } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, CheckCircle2, BadgePercent, X } from "lucide-react";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { getStoreThemeTokens } from "@/lib/storeTheme";
import type { ProductSort } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SEARCH_DEBOUNCE_MS = 350;

export default function SearchDrawer({ open, onOpenChange }: SearchDrawerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings: theme } = useAppearanceSettings();
  const tokens = getStoreThemeTokens(theme);

  const searchFromUrl = searchParams.get("q") || "";
  const sortFromUrl = (searchParams.get("sort") as ProductSort | null) || "newest";
  const inStockFromUrl = searchParams.get("in_stock") === "1";
  const onSaleFromUrl = searchParams.get("on_sale") === "1";

  const [localSearch, setLocalSearch] = useState(searchFromUrl);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalSearch(searchFromUrl);
  }, [searchFromUrl, open]);

  const updateDiscoveryParams = useCallback(
    (updates: { q?: string | null; sort?: ProductSort | null; inStock?: boolean | null; onSale?: boolean | null }) => {
      const nextParams = new URLSearchParams(searchParams);

      if (updates.q !== undefined) {
        const nextQuery = updates.q?.trim();
        if (!nextQuery) nextParams.delete("q");
        else nextParams.set("q", nextQuery);
      }

      if (updates.sort !== undefined) {
        if (!updates.sort || updates.sort === "newest") nextParams.delete("sort");
        else nextParams.set("sort", updates.sort);
      }

      if (updates.inStock !== undefined) {
        if (updates.inStock) nextParams.set("in_stock", "1");
        else nextParams.delete("in_stock");
      }

      if (updates.onSale !== undefined) {
        if (updates.onSale) nextParams.set("on_sale", "1");
        else nextParams.delete("on_sale");
      }

      // If we are on the homepage and search begins, redirect to /shop to show results
      const targetPath = (location.pathname === "/" && nextParams.toString()) ? "/shop" : location.pathname;

      navigate(
        {
          pathname: targetPath,
          search: nextParams.toString() ? `?${nextParams.toString()}` : "",
        },
        { replace: true, preventScrollReset: true }
      );
    },
    [searchParams, navigate, location.pathname]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = setTimeout(() => {
        updateDiscoveryParams({ q: value });
      }, SEARCH_DEBOUNCE_MS);
    },
    [updateDiscoveryParams]
  );

  useEffect(() => () => clearTimeout(searchTimerRef.current), []);

  const clearAllFilters = () => {
    setLocalSearch("");
    const nextParams = new URLSearchParams();
    
    // Preserve category if we are on a category page
    navigate(
      {
        pathname: location.pathname,
        search: "",
      },
      { replace: true, preventScrollReset: true }
    );
    onOpenChange(false);
  };

  const hasActiveFilters = Boolean(searchFromUrl || sortFromUrl !== "newest" || inStockFromUrl || onSaleFromUrl);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" showCloseButton={false} className="w-full p-0 flex flex-col max-h-[85vh] rounded-b-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out" dir="rtl" style={{ backgroundColor: tokens.surface, borderBottom: `1px solid ${tokens.border}` }}>
        <SheetHeader className="p-4 border-b flex flex-row items-center justify-between shadow-sm relative z-10" style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}>
          <SheetTitle className="text-xl font-black flex items-center gap-2 m-0" style={{ color: tokens.textPrimary }}>
            <Search size={24} style={{ color: theme.accent_color }} />
            البحث والفلترة
          </SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full shrink-0" style={{ color: tokens.textPrimary }}>
              <X size={24} />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Search Input */}
          <div className="space-y-3">
            <label className="text-sm font-bold block" style={{ color: tokens.textPrimary }}>كلمات البحث</label>
            <label
              className="flex items-center gap-3 rounded-2xl border-2 px-4 py-3 sm:py-4 transition-colors"
              style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }}
            >
              <Search className="h-6 w-6 shrink-0" style={{ color: theme.accent_color }} />
              <input
                autoFocus
                value={localSearch}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="ابحث باسم المنتج أو الوصف..."
                className="w-full bg-transparent text-base sm:text-lg font-medium outline-none placeholder:text-slate-400"
                style={{ color: tokens.textPrimary }}
              />
              {localSearch && (
                <button onClick={() => handleSearchChange("")} className="shrink-0 p-1 opacity-50 hover:opacity-100 transition-opacity">
                  <X className="h-5 w-5" style={{ color: tokens.textPrimary }} />
                </button>
              )}
            </label>
          </div>

          {/* Sort & Filters Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-bold block" style={{ color: tokens.textPrimary }}>الترتيب</label>
              <label
                className="flex items-center gap-3 rounded-2xl border-2 px-4 py-3 sm:py-4 transition-colors"
                style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }}
              >
                <SlidersHorizontal className="h-6 w-6 shrink-0" style={{ color: theme.accent_color }} />
                <select
                  value={sortFromUrl}
                  onChange={(event) => updateDiscoveryParams({ sort: event.target.value as ProductSort })}
                  className="w-full bg-transparent text-base sm:text-lg font-medium outline-none cursor-pointer"
                  style={{ color: tokens.textPrimary }}
                >
                  <option value="newest">الأحدث</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                  <option value="name_asc">الاسم: أبجديًا</option>
                  <option value="discount_desc">الأكثر تخفيضًا</option>
                </select>
              </label>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold block" style={{ color: tokens.textPrimary }}>خيارات إضافية</label>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => updateDiscoveryParams({ inStock: !inStockFromUrl })}
                  className="flex items-center gap-3 rounded-2xl border-2 px-4 py-3 sm:py-4 text-base sm:text-lg font-bold transition-all"
                  style={inStockFromUrl
                    ? { backgroundColor: theme.accent_color, color: "#fff", borderColor: theme.accent_color }
                    : { backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary, borderColor: tokens.border }}
                >
                  <CheckCircle2 className="h-6 w-6" />
                  المتاح في المخزون فقط
                </button>

                <button
                  type="button"
                  onClick={() => updateDiscoveryParams({ onSale: !onSaleFromUrl })}
                  className="flex items-center gap-3 rounded-2xl border-2 px-4 py-3 sm:py-4 text-base sm:text-lg font-bold transition-all"
                  style={onSaleFromUrl
                    ? { backgroundColor: theme.accent_color, color: "#fff", borderColor: theme.accent_color }
                    : { backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary, borderColor: tokens.border }}
                >
                  <BadgePercent className="h-6 w-6" />
                  عروض وتخفيضات فقط
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t flex items-center justify-between gap-4" style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-100 transition-colors"
              style={{ color: tokens.textMuted }}
            >
              مسح الفلاتر
            </button>
          )}
          <SheetClose asChild>
            <button
              className="flex-1 max-w-[200px] text-white px-6 py-3 rounded-xl font-bold text-sm sm:text-base hover:opacity-90 transition-all shadow-lg"
              style={{ backgroundColor: theme.button_color, color: theme.button_text }}
            >
              عرض النتائج
            </button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
