import { useState } from "react";
import { useOrders, useUpdateOrderStatus, type OrderStatus } from "@/hooks/useOrders";
import { api } from "@/lib/api";
import { exportCsv } from "@/lib/exportCsv";
import OrdersFilters from "@/components/admin/orders/OrdersFilters";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import { orderStatusConfig } from "@/components/admin/orders/constants";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataState from "@/components/admin/AdminDataState";

const Orders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = o.customer_name.includes(search) || String(o.order_number).includes(search) || o.customer_phone.includes(search);
    const matchFilter = activeFilter === "all" || o.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === id);
    if (order) {
      updateStatus.mutate({ id, status: newStatus, order });
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
          "المنتجات",
          "إجمالي القطع",
          "تفاصيل العناصر",
          "المجموع الفرعي",
          "الشحن",
          "كود الخصم",
          "قيمة الخصم",
          "الإجمالي النهائي",
          "شركة الشحن",
          "رقم التتبع",
          "ملاحظات",
        ],
        rows: dataToExport.map((order) => {
          const items = orderItemsMap.get(order.id) ?? [];
          const productsSummary = items.map((item) => item.product_name).join(" | ");
          const itemsDetails = items
            .map((item) => `${item.product_name} × ${item.quantity} × ${item.unit_price}`)
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
            productsSummary,
            totalQty,
            itemsDetails,
            order.subtotal,
            order.shipping_cost,
            order.discount_code || "",
            order.discount_amount || 0,
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

      <OrdersTable
        orders={filtered}
        allOrdersCount={orders.length}
        selectedOrders={selectedOrders}
        expandedOrder={expandedOrder}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onToggleExpand={(id) => setExpandedOrder(expandedOrder === id ? null : id)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Orders;
