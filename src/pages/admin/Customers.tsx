import { useEffect, useState } from "react";
import { Search } from "lucide-react";
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

      <div className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-sm animate-slide-in">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-right" dir="rtl">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/30">
              <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">معرف الزبون</th>
              <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الاسم</th>
              <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الهاتف</th>
              <th className="text-[13px] font-semibold text-slate-400 px-4 py-4 font-sans">الموقع</th>
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
                  {customer.name || "بدون اسم"}
                </td>
                <td className="px-4 py-4 text-[14px] font-semibold text-slate-500" dir="ltr">
                  {customer.phone || "—"}
                </td>
                <td className="px-4 py-4 text-[13px] text-slate-500 font-medium">
                  {customer.wilaya ? `${customer.wilaya} - ${customer.commune || ""}` : "—"}
                </td>
                <td className="px-4 py-4 text-[13px] text-slate-500 font-medium">
                  {new Date(customer.created_at).toLocaleDateString("en-GB")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {totalCustomers === 0 ? "لا يوجد زبائن بعد" : "لا يوجد زبائن مطابقين"}
          </div>
        )}
      </div>

      {totalPages > 1 && (
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
