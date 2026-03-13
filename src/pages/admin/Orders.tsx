import { useMemo, useState } from "react";
import { useCreateShippingShipment, useOrders, useUpdateOrderStatus, type OrderStatus } from "@/hooks/useOrders";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { api } from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import OrdersFilters from "@/components/admin/orders/OrdersFilters";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import { orderStatusConfig } from "@/components/admin/orders/constants";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";
import { X, Loader2 } from "lucide-react";
import { formatSelectedOptions } from "@/lib/productOptions";

const Orders = () => {
  const { data: orders = [], isLoading } = useOrders();
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
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
  const normalizedSearch = search.trim().toLowerCase();

  const filtered = orders.filter((o) => {
    const searchableFields = [
      o.customer_name,
      String(o.order_number),
      o.customer_phone,
      o.ip_address || "",
      o.tracking_number || "",
      o.shipping_company || "",
      o.wilaya || "",
      o.commune || "",
    ]
      .join(" ")
      .toLowerCase();

    const matchSearch = !normalizedSearch || searchableFields.includes(normalizedSearch);
    const matchFilter = activeFilter === "all" || o.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      updateStatus.mutate({ id, status: newStatus, order });
    }
  };

  const handleCreateShipment = (id: string) => {
    createShippingShipment.mutate(id);
  };

  const handleBulkStatusChange = async (newStatus: OrderStatus) => {
    if (!window.confirm(`هل أنت متأكد من تغيير حالة ${selectedOrders.length} طلبات إلى "${orderStatusConfig[newStatus].label}"؟`)) {
      return;
    }
    
    setIsUpdatingBulk(true);
    try {
      for (const id of selectedOrders) {
        const order = orders.find((o) => o.id === id);
        if (order) {
          await updateStatus.mutateAsync({ id, status: newStatus, order });
          // small delay to prevent overwhelming the server's event loop and db pool
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      
      setSelectedOrders([]);
    } catch (error) {
      console.error("Bulk update error:", error);
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

  const getFilterCount = (status: OrderStatus) => orders.filter((o) => o.status === status).length;
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
        meta={`${filtered.length} / ${orders.length}`}
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
        totalCount={orders.length}
        getFilterCount={getFilterCount}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearch}
      />

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
        allOrdersCount={orders.length}
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
    </div>
  );
};

export default Orders;
