import { useEffect, useMemo, useState } from "react";
import { useCreateShippingShipment, usePaginatedOrders, useUpdateOrderStatus, type OrderStatus } from "@/hooks/useOrders";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { api } from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import OrdersFilters from "@/components/admin/orders/OrdersFilters";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { orderStatusConfig } from "@/components/admin/orders/constants";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";
import { Loader2 } from "lucide-react";
import { formatSelectedOptions } from "@/lib/productOptions";
import { toast } from "sonner";
import AdminActionStatus from "@/components/admin/AdminActionStatus";

const Orders = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
  const [actionState, setActionState] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [actionMessage, setActionMessage] = useState("");
  const { data: paginatedOrders, isLoading } = usePaginatedOrders(
    { search, status: activeFilter },
    { page: currentPage, limit: 20 }
  );
  const orders = paginatedOrders?.items ?? [];
  const totalOrders = paginatedOrders?.pagination.total ?? orders.length;
  const totalPages = paginatedOrders?.pagination.totalPages ?? 1;
  const filtered = orders;
  const updateStatus = useUpdateOrderStatus();
  const { settings: shippingSettings } = useStoreSettings<{ provider?: { active_provider?: string } }>("shipping", { provider: { active_provider: "manual" } });
  const activeShippingProvider = shippingSettings.provider?.active_provider || "manual";
  const hasDirectShippingProvider = activeShippingProvider === "yalidine" || activeShippingProvider === "guepex";
  const activeProviderLabel = useMemo(() => {
    if (activeShippingProvider === "guepex") return "Guepex";
    if (activeShippingProvider === "yalidine") return "Yalidine";
    return "";
  }, [activeShippingProvider]);
  const createShippingShipment = useCreateShippingShipment(activeProviderLabel);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedOrders([]);
    setExpandedOrder(null);
  }, [search, activeFilter]);

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      setActionState("pending");
      setActionMessage(`جاري تحديث الطلب #${order.order_number}...`);
      updateStatus.mutate(
        { id, status: newStatus, order },
        {
          onSuccess: () => {
            setActionState("success");
            setActionMessage(`تم تحديث الطلب #${order.order_number} إلى "${orderStatusConfig[newStatus].label}"`);
          },
          onError: (error) => {
            setActionState("error");
            setActionMessage(error instanceof Error ? error.message : "فشل تحديث حالة الطلب");
          },
        }
      );
    }
  };

  const handleCreateShipment = (id: string) => {
    const order = orders.find((entry) => entry.id === id);
    setActionState("pending");
    setActionMessage(order ? `جاري إنشاء شحنة للطلب #${order.order_number}...` : "جاري إنشاء الشحنة...");
    createShippingShipment.mutate(id, {
      onSuccess: () => {
        setActionState("success");
        setActionMessage(order ? `تم إنشاء شحنة للطلب #${order.order_number}` : "تم إنشاء الشحنة بنجاح");
      },
      onError: (error) => {
        setActionState("error");
        setActionMessage(error instanceof Error ? error.message : "فشل إنشاء الشحنة");
      },
    });
  };

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    if (!window.confirm(`هل أنت متأكد من تغيير حالة ${selectedOrders.length} طلبات إلى "${orderStatusConfig[newStatus].label}"؟`)) {
      return;
    }
    
    setIsUpdatingBulk(true);
    setActionState("pending");
    setActionMessage(`جاري تحديث ${selectedOrders.length} طلبات...`);
    try {
      for (const id of selectedOrders) {
        const order = orders.find((o) => o.id === id);
        if (order) {
          await updateStatus.mutateAsync({ id, status: newStatus, order, suppressToast: true });
          // small delay to prevent overwhelming the server's event loop and db pool
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      
      toast.success(`تم تحديث ${selectedOrders.length} طلبات إلى "${orderStatusConfig[newStatus].label}"`);
      setActionState("success");
      setActionMessage(`تم تحديث ${selectedOrders.length} طلبات إلى "${orderStatusConfig[newStatus].label}"`);
      setSelectedOrders([]);
    } catch (error) {
      console.error("Bulk update error:", error);
      toast.error(error instanceof Error ? error.message : "فشل تحديث بعض الطلبات");
      setActionState("error");
      setActionMessage(error instanceof Error ? error.message : "فشل تحديث بعض الطلبات");
    } finally {
      setIsUpdatingBulk(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filtered.length) setSelectedOrders([]);
    else setSelectedOrders(filtered.map((o) => o.id));
  };

  const getFilterCount = (status: OrderStatus) => (activeFilter === status ? totalOrders : undefined);
  const handleExportCSV = async () => {
    const dataToExport = selectedOrders.length > 0 
      ? filtered.filter(o => selectedOrders.includes(o.id)) 
      : filtered;

    if (dataToExport.length === 0) {
      alert("لا يوجد طلبات لتصديرها");
      return;
    }

    try {
      const orderItemsMap = new Map<string, Array<{
        product_name: string;
        selected_options?: Record<string, string>;
        quantity: number;
        unit_price: number;
        total: number;
      }>>();

      const itemResponses = await Promise.all(
        dataToExport.map(async (order) => {
          const items = await api.get(`/orders/${order.id}/items`);
          return [order.id, Array.isArray(items) ? items : []] as const;
        })
      );

      itemResponses.forEach(([orderId, items]) => {
        orderItemsMap.set(orderId, items);
      });

      exportCsv({
        filename: `orders-shipping-export-${new Date().toISOString().split("T")[0]}.csv`,
        headers: [
          "رقم الطلب",
          "الحالة",
          "تاريخ الطلب",
          "اسم الزبون",
          "رقم الهاتف",
          "الولاية",
          "البلدية",
          "العنوان",
          "نوع التوصيل",
          "عنوان IP",
          "المنتجات",
          "إجمالي القطع",
          "تفاصيل العناصر",
          "المجموع الفرعي",
          "الشحن",
          "الإجمالي النهائي",
          "شركة الشحن",
          "رقم التتبع",
          "رابط البوليصة",
          "ملاحظات",
        ],
        rows: dataToExport.map((order) => {
          const items = orderItemsMap.get(order.id) ?? [];
          const productsSummary = items
            .map((item) => formatSelectedOptions(item.selected_options) ? `${item.product_name} (${formatSelectedOptions(item.selected_options)})` : item.product_name)
            .join(" | ");
          const itemsDetails = items
            .map((item) => {
              const optionLabel = formatSelectedOptions(item.selected_options);
              return `${item.product_name}${optionLabel ? ` (${optionLabel})` : ""} × ${item.quantity} × ${item.unit_price}`;
            })
            .join(" | ");
          const totalQty = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

          return [
            order.order_number,
            orderStatusConfig[order.status].label,
            new Date(order.created_at).toLocaleString("en-GB"),
            order.customer_name || "",
            order.customer_phone || "",
            order.wilaya || "",
            order.commune || "",
            order.address || "",
            order.delivery_type === "home" ? "التوصيل للمنزل" : "مكتب التوصيل",
            order.ip_address || "",
            productsSummary,
            totalQty,
            itemsDetails,
            order.subtotal,
            order.shipping_cost,
            order.total,
            order.shipping_company || "",
            order.tracking_number || "",
            order.shipping_label_url || "",
            order.note || "",
          ];
        }),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل تصدير الطلبات";
      alert(message);
    }
  };

  if (isLoading) {
    return <AdminDataState type="loading" title="جاري تحميل الطلبات" description="يتم جلب الطلبات وحالاتها من الخادم." />;
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="الطلبات"
        description="إدارة الطلبات اليومية، التصفية السريعة، والتصدير المناسب للتشغيل اللوجستي."
        meta={`${filtered.length} / ${totalOrders}`}
        actions={(
          <button
            onClick={handleExportCSV}
            className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground shadow-button transition-opacity hover:opacity-95"
          >
            تصدير CSV
          </button>
        )}
      />

      <OrdersFilters
        activeFilter={activeFilter}
        search={search}
        totalCount={activeFilter === "all" ? totalOrders : undefined}
        getFilterCount={getFilterCount}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearch}
      />

      <AdminActionStatus state={actionState} message={actionMessage} />

      {/* Bulk actions inline banner */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-3 bg-muted rounded-lg px-4 py-2.5 animate-slide-in border border-border">
          <span className="text-sm text-foreground font-medium">{selectedOrders.length} طلبات محددة</span>
          <div className="flex items-center gap-2 mr-auto" dir="ltr">
            {isUpdatingBulk && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mr-2" />}
            <select
              disabled={isUpdatingBulk}
              onChange={(e) => {
                const val = e.target.value as OrderStatus;
                if (val) handleBulkStatusChange(val);
                e.target.value = "";
              }}
              className="flex-1 h-8 px-2 text-xs rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              dir="rtl"
            >
              <option value="">تغيير الحالة إلى...</option>
              {Object.entries(orderStatusConfig).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <OrdersTable
        orders={filtered}
        allOrdersCount={totalOrders}
        selectedOrders={selectedOrders}
        expandedOrder={expandedOrder}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onToggleExpand={(id) => setExpandedOrder(expandedOrder === id ? null : id)}
        onStatusChange={handleStatusChange}
        onCreateShipment={handleCreateShipment}
        creatingShipmentId={createShippingShipment.isPending ? (createShippingShipment.variables ?? null) : null}
        activeShippingProvider={activeShippingProvider}
        activeShippingProviderLabel={activeProviderLabel}
        hasDirectShippingProvider={hasDirectShippingProvider}
      />

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

export default Orders;
