import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Sheet, SheetContent, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { Search, SlidersHorizontal, CheckCircle2, BadgePercent, X, ArrowDownUp } from "lucide-react";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { getStoreThemeTokens } from "@/lib/storeTheme";
import type { ProductSort } from "@/hooks/useProducts";

interface SearchDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SEARCH_DEBOUNCE_MS = 350;

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "الأحدث" },
  { value: "price_asc", label: "الأرخص" },
  { value: "price_desc", label: "الأغلى" },
  { value: "name_asc", label: "أبجدي" },
  { value: "discount_desc", label: "أكبر تخفيض" },
];

export default function SearchDrawer({ open, onOpenChange }: SearchDrawerProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings: theme } = useAppearanceSettings();
  const tokens = getStoreThemeTokens(theme);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchFromUrl = searchParams.get("q") || "";
  const sortFromUrl = (searchParams.get("sort") as ProductSort | null) || "newest";
  const inStockFromUrl = searchParams.get("in_stock") === "1";
  const onSaleFromUrl = searchParams.get("on_sale") === "1";

  const [localSearch, setLocalSearch] = useState(searchFromUrl);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocalSearch(searchFromUrl);
  }, [searchFromUrl, open]);

  useEffect(() => {
    if (open) {
      // Small delay so the sheet animation finishes before focusing
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

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
    navigate(
      { pathname: location.pathname, search: "" },
      { replace: true, preventScrollReset: true }
    );
    onOpenChange(false);
  };

  const hasActiveFilters = Boolean(searchFromUrl || sortFromUrl !== "newest" || inStockFromUrl || onSaleFromUrl);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        showCloseButton={false}
        className="w-full p-0 flex flex-col rounded-b-[28px] shadow-[0_10px_40px_rgba(0,0,0,0.12)] max-h-[70vh]"
        dir="rtl"
        style={{ backgroundColor: tokens.surface, borderBottom: `1px solid ${tokens.border}` }}
      >
        <SheetTitle className="sr-only">البحث والفلترة</SheetTitle>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Search input — compact */}
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 border transition-colors"
            style={{ borderColor: tokens.border, backgroundColor: tokens.surfaceSoft }}
          >
            <Search className="h-5 w-5 shrink-0" style={{ color: theme.accent_color }} />
            <input
              ref={inputRef}
              value={localSearch}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="ابحث عن منتج..."
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-gray-400"
              style={{ color: tokens.textPrimary }}
            />
            {localSearch && (
              <button onClick={() => handleSearchChange("")} className="shrink-0 p-0.5 opacity-40 hover:opacity-100 transition-opacity">
                <X className="h-4 w-4" style={{ color: tokens.textPrimary }} />
              </button>
            )}
          </div>
        </div>

        {/* Filters — compact grid */}
        <div className="px-4 pb-4 space-y-3 overflow-y-auto flex-1">
          {/* Sort chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: tokens.textMuted }}>
              <ArrowDownUp className="w-3.5 h-3.5" /> الترتيب
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SORT_OPTIONS.map((option) => {
                const active = sortFromUrl === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateDiscoveryParams({ sort: option.value })}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={active
                      ? { backgroundColor: theme.accent_color, color: "#fff" }
                      : { backgroundColor: tokens.surfaceSoft, color: tokens.textMuted, border: `1px solid ${tokens.border}` }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle filters */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateDiscoveryParams({ inStock: !inStockFromUrl })}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all"
              style={inStockFromUrl
                ? { backgroundColor: theme.accent_color, color: "#fff" }
                : { backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary, border: `1px solid ${tokens.border}` }}
            >
              <CheckCircle2 className="h-4 w-4" />
              متوفر فقط
            </button>

            <button
              type="button"
              onClick={() => updateDiscoveryParams({ onSale: !onSaleFromUrl })}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all"
              style={onSaleFromUrl
                ? { backgroundColor: theme.accent_color, color: "#fff" }
                : { backgroundColor: tokens.surfaceSoft, color: tokens.textPrimary, border: `1px solid ${tokens.border}` }}
            >
              <BadgePercent className="h-4 w-4" />
              عروض فقط
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 border-t flex items-center justify-between gap-3"
          style={{ backgroundColor: tokens.surface, borderColor: tokens.border }}
        >
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl font-bold text-xs hover:opacity-70 transition-opacity"
              style={{ color: tokens.textMuted }}
            >
              مسح الكل
            </button>
          )}
          <SheetClose asChild>
            <button
              className="flex-1 max-w-[180px] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-md mr-auto"
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
