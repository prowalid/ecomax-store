const { Phone } = require('../value-objects/Phone');
const { ValidationError } = require('../errors/ValidationError');
const { OrderStatus } = require('../value-objects/OrderStatus');
const { Money } = require('../value-objects/Money');
const { OrderItem } = require('./OrderItem');
const {
  shouldIncrementCallAttempts,
  shouldRestoreStock,
  shouldConsumeStock,
} = require('../orders/orderStatusRules');

function normalizeNullableText(value) {
  const normalized = value == null ? null : String(value).trim();
  return normalized || null;
}

class Order {
  constructor(data) {
    const customerName = normalizeNullableText(data.customer_name);
    const customerPhone = data.customer_phone ? new Phone(data.customer_phone).value : null;

    const requiresCustomerIdentity = data.requireCustomerIdentity !== false;

    if (requiresCustomerIdentity && (!customerName || !customerPhone)) {
      throw new ValidationError('Customer name and phone are required');
    }

    this.customer_name = customerName;
    this.customer_phone = customerPhone;
    this.customer_id = data.customer_id || null;
    this.wilaya = normalizeNullableText(data.wilaya);
    this.commune = normalizeNullableText(data.commune);
    this.address = normalizeNullableText(data.address);
    this.delivery_type = normalizeNullableText(data.delivery_type);
    this.note = normalizeNullableText(data.note);
    this.ip_address = normalizeNullableText(data.ip_address);
    this.status = normalizeNullableText(data.status);
    this.call_attempts = Number.isFinite(Number(data.call_attempts))
      ? Number(data.call_attempts)
      : 0;
    this.subtotal = Money.from(data.subtotal ?? 0);
    this.shipping_cost = Money.from(data.shipping_cost ?? 0);
    this.total = Money.from(data.total ?? 0);
  }

  static fromCheckoutDraft({ rawOrderData, items, requestIp }) {
    const orderItems = items.map((item) => (item instanceof OrderItem ? item : new OrderItem(item)));
    const subtotal = orderItems.reduce(
      (sum, item) => sum.add(item.total),
      new Money(0)
    );
    const shippingCost = Money.from(rawOrderData.shipping_cost ?? 0);
    const total = subtotal.add(shippingCost);

    return new Order({
      ...rawOrderData,
      ip_address: requestIp,
      subtotal: subtotal.toNumber(),
      shipping_cost: shippingCost.toNumber(),
      total: total.toNumber(),
    });
  }

  transitionTo(nextStatus) {
    const currentStatus = new OrderStatus(this.status);
    currentStatus.assertTransition(nextStatus);

    const updatedCallAttempts = shouldIncrementCallAttempts(nextStatus)
      ? (this.call_attempts || 0) + 1
      : this.call_attempts || 0;

    return {
      status: nextStatus,
      callAttempts: updatedCallAttempts,
      stockDirection: shouldRestoreStock(this.status, nextStatus)
        ? 1
        : (shouldConsumeStock(this.status, nextStatus) ? -1 : 0),
    };
  }

  toPersistence() {
    return {
      customer_name: this.customer_name,
      customer_phone: this.customer_phone,
      customer_id: this.customer_id,
      wilaya: this.wilaya,
      commune: this.commune,
      address: this.address,
      delivery_type: this.delivery_type,
      note: this.note,
      ip_address: this.ip_address,
      ...(this.status ? { status: this.status } : {}),
      ...(this.call_attempts ? { call_attempts: this.call_attempts } : {}),
      subtotal: this.subtotal.toNumber(),
      shipping_cost: this.shipping_cost.toNumber(),
      total: this.total.toNumber(),
    };
  }
}

module.exports = {
  Order,
};
