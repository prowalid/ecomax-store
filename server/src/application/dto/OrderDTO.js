const { OrderItemDTO } = require('./OrderItemDTO');

class OrderDTO {
  static from(order) {
    if (!order) {
      return null;
    }

    const dto = {};

    if (order.id != null) dto.id = order.id;
    if (order.order_number != null) dto.order_number = order.order_number;
    if (order.customer_name != null) dto.customer_name = order.customer_name;
    if (order.customer_phone != null) dto.customer_phone = order.customer_phone;
    if (order.customer_id != null) dto.customer_id = order.customer_id;
    if (order.wilaya != null) dto.wilaya = order.wilaya;
    if (order.commune != null) dto.commune = order.commune;
    if (order.address != null) dto.address = order.address;
    if (order.delivery_type != null) dto.delivery_type = order.delivery_type;
    if (order.note != null) dto.note = order.note;
    if (order.ip_address != null) dto.ip_address = order.ip_address;
    if (order.status != null) dto.status = order.status;
    if (Object.prototype.hasOwnProperty.call(order, 'call_attempts')) dto.call_attempts = Number(order.call_attempts ?? 0);
    if (Object.prototype.hasOwnProperty.call(order, 'subtotal')) dto.subtotal = order.subtotal?.toNumber ? order.subtotal.toNumber() : Number(order.subtotal ?? 0);
    if (Object.prototype.hasOwnProperty.call(order, 'shipping_cost')) dto.shipping_cost = order.shipping_cost?.toNumber ? order.shipping_cost.toNumber() : Number(order.shipping_cost ?? 0);
    if (Object.prototype.hasOwnProperty.call(order, 'total')) dto.total = order.total?.toNumber ? order.total.toNumber() : Number(order.total ?? 0);
    if (order.created_at != null) dto.created_at = order.created_at;
    if (order.updated_at != null) dto.updated_at = order.updated_at;
    if (Array.isArray(order.items)) dto.items = order.items.map((item) => OrderItemDTO.from(item));

    return dto;
  }
}

module.exports = {
  OrderDTO,
};
