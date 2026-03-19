const { ValidationError } = require('../errors/ValidationError');
const { Money } = require('../value-objects/Money');

function normalizeText(value) {
  return value == null ? null : String(value).trim();
}

class OrderItem {
  constructor(data) {
    const productId = normalizeText(data.product_id);
    const productName = normalizeText(data.product_name);
    const quantity = Number(data.quantity);

    if (!productId || !productName) {
      throw new ValidationError('Order item requires product id and name');
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new ValidationError('Order item quantity must be greater than zero');
    }

    this.product_id = productId;
    this.product_name = productName;
    this.selected_options = data.selected_options && typeof data.selected_options === 'object'
      ? data.selected_options
      : {};
    this.quantity = quantity;
    this.unit_price = Money.from(data.unit_price);
    this.total = data.total != null
      ? Money.from(data.total)
      : this.unit_price.multiply(quantity);
  }

  toPersistence() {
    return {
      product_id: this.product_id,
      product_name: this.product_name,
      selected_options: this.selected_options,
      quantity: this.quantity,
      unit_price: this.unit_price.toNumber(),
      total: this.total.toNumber(),
    };
  }
}

module.exports = {
  OrderItem,
};
