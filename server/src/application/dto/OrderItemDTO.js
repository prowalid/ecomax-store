class OrderItemDTO {
  static from(item) {
    if (!item) {
      return null;
    }

    const dto = {};

    if (item.id != null) dto.id = item.id;
    if (item.order_id != null) dto.order_id = item.order_id;
    if (item.product_id != null) dto.product_id = item.product_id;
    if (item.product_name != null) dto.product_name = item.product_name;
    if (Object.prototype.hasOwnProperty.call(item, 'selected_options')) dto.selected_options = item.selected_options ?? {};
    if (Object.prototype.hasOwnProperty.call(item, 'quantity')) dto.quantity = Number(item.quantity ?? 0);
    if (Object.prototype.hasOwnProperty.call(item, 'unit_price')) dto.unit_price = item.unit_price?.toNumber ? item.unit_price.toNumber() : Number(item.unit_price ?? 0);
    if (Object.prototype.hasOwnProperty.call(item, 'total')) dto.total = item.total?.toNumber ? item.total.toNumber() : Number(item.total ?? 0);

    return dto;
  }
}

module.exports = {
  OrderItemDTO,
};
