import { useEffect, useMemo, useState } from "react";
import { MapPin, Search, ShoppingBag } from "lucide-react";
import { usePaginatedCustomers } from "@/hooks/useCustomers";
import { exportCsv } from "@/lib/exportCsv";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Customers = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data: paginatedCustomers, isLoading, isError, error, refetch, isFetching } = usePaginatedCustomers(
    { search },
    { page: currentPage, limit: 20 }
  );
  const customers = paginatedCustomers?.items ?? [];
  const totalCustomers = paginatedCustomers?.pagination.total ?? customers.length;
  const totalPages = paginatedCustomers?.pagination.totalPages ?? 1;
  const filtered = customers;
  const hasActiveFilters = search.trim().length > 0;

  const customerInsights = useMemo(() => {
    const withOrders = customers.filter((customer) => Number(customer.orders_count || 0) > 0).length;
    const withPhone = customers.filter((customer) => Boolean(customer.phone?.trim())).length;
    const withLocation = customers.filter((customer) => Boolean(customer.wilaya?.trim())).length;
    const recentCustomers = customers.filter((customer) => {
      const createdAt = new Date(customer.created_at).getTime();
      return Number.isFinite(createdAt) && Date.now() - createdAt <= 1000 * 60 * 60 * 24 * 30;
    }).length;

    return {
      visibleCount: filtered.length,
      withOrders,
      withPhone,
      withLocation,
      recentCustomers,
    };
  }, [customers, filtered.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert("لا يوجد زبائن لتصديرهم");
      return;
    }

    exportCsv({
      filename: `زبائن_${new Date().toISOString().split("T")[0]}.csv`,
      headers: ["معرف الزبون", "الاسم", "الهاتف", "الولاية", "البلدية", "تاريخ الإضافة"],
      rows: filtered.map((customer) => [
        customer.id,
        customer.name || "",
        customer.phone || "",
        customer.wilaya || "",
        customer.commune || "",
        new Date(customer.created_at).toLocaleDateString("en-GB"),
      ]),
    });
  };

  if (isLoading) {
    return <AdminDataState type="loading" title="جاري تحميل الزبائن" description="يتم جلب قائمة الزبائن وبياناتهم الأساسية." />;
  }

  if (isError) {
    return (
      <AdminDataState
        type="error"
        title="تعذر تحميل الزبائن"
        description={error instanceof Error ? error.message : "تعذر تحميل الزبائن"}
        actionLabel="إعادة المحاولة"
        actionDisabled={isFetching}
        onAction={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="الزبائن"
        description="ابحث بسرعة في قاعدة الزبائن وصدّر البيانات الأساسية عند الحاجة."
        meta={`${filtered.length} / ${totalCustomers}`}
        actions={(
          <button
            onClick={handleExportCSV}
            className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-button transition-opacity hover:opacity-95"
          >
            تصدير CSV
          </button>
        )}
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالاسم، الهاتف، أو الولاية..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pr-9 pl-3 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {search.trim() && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              بحث: {search.trim()}
            </span>
          )}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              تصفير البحث
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">المعروض الآن</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{customerInsights.visibleCount}</p>
          <p className="mt-1 text-xs text-slate-500">من أصل {totalCustomers} زبونًا</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-700">لديهم طلبات</p>
          <p className="mt-2 text-2xl font-black text-emerald-900">{customerInsights.withOrders}</p>
          <p className="mt-1 text-xs text-emerald-700">زبائن مرتبطون بسجل شرائي</p>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold text-sky-700">هواتف مكتملة</p>
          <p className="mt-2 text-2xl font-black text-sky-900">{customerInsights.withPhone}</p>
          <p className="mt-1 text-xs text-sky-700">جاهزون للتواصل المباشر</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold text-amber-700">بيانات موقع</p>
          <p className="mt-2 text-2xl font-black text-amber-900">{customerInsights.withLocation}</p>
          <p className="mt-1 text-xs text-amber-700">تحتوي على ولاية أو بلدية</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 shadow-sm">
          <p className="text-xs font-semibold text-violet-700">أضيفوا آخر 30 يومًا</p>
          <p className="mt-2 text-2xl font-black text-violet-900">{customerInsights.recentCustomers}</p>
          <p className="mt-1 text-xs text-violet-700">حركة حديثة داخل قاعدة الزبائن</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <AdminDataState
          type="empty"
          title={totalCustomers === 0 ? "لا يوجد زبائن بعد" : "لا يوجد زبائن مطابقون"}
          description={
            totalCustomers === 0
              ? "سيظهر هنا كل زبون أنشأ طلبًا أو تم تسجيل بياناته داخل المتجر."
              : "جرّب تعديل عبارة البحث أو مسحها لعرض كامل قاعدة الزبائن."
          }
          actionLabel={totalCustomers === 0 ? undefined : "مسح البحث"}
          onAction={totalCustomers === 0 ? undefined : () => setSearch("")}
        />
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm animate-slide-in">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right" dir="rtl">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-50 bg-slate-50/95 backdrop-blur">
                <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">معرف الزبون</th>
                <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الاسم</th>
                <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الهاتف</th>
                <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الموقع</th>
                <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">النشاط</th>
                <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">تاريخ الإضافة</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 text-[13px] font-medium text-slate-400" dir="ltr">
                    #{customer.id.split("-")[0]}
                  </td>
                  <td className="px-4 py-4 text-[14px] font-bold text-sidebar-heading">
                    <div className="space-y-1">
                      <div>{customer.name || "بدون اسم"}</div>
                      {customer.notes ? (
                        <div className="text-[11px] font-medium text-slate-500 line-clamp-1">{customer.notes}</div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[14px] font-semibold text-slate-500" dir="ltr">
                    {customer.phone || "—"}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-500 font-medium">
                    {customer.wilaya ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{customer.wilaya}{customer.commune ? ` - ${customer.commune}` : ""}</span>
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-500 font-medium">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                        <span>{customer.orders_count ?? 0} طلب</span>
                      </div>
                      {typeof customer.total_spent === "number" ? (
                        <div className="text-[11px] text-slate-500" dir="ltr">
                          {customer.total_spent.toLocaleString("en-DZ")} DZD
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[13px] text-slate-500 font-medium">
                    <div className="space-y-1">
                      <div>{new Date(customer.created_at).toLocaleDateString("en-GB")}</div>
                      {customer.last_order_at ? (
                        <div className="text-[11px] text-slate-500">
                          آخر طلب: {new Date(customer.last_order_at).toLocaleDateString("en-GB")}
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {filtered.length > 0 && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage > 1) {
                    setCurrentPage((page) => page - 1);
                  }
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .slice(Math.max(currentPage - 3, 0), Math.max(currentPage - 3, 0) + 5)
              .map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(event) => {
                      event.preventDefault();
                      setCurrentPage(page);
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (currentPage < totalPages) {
                    setCurrentPage((page) => page + 1);
                  }
                }}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default Customers;
