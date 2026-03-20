const { ValidationError } = require('../errors/ValidationError');
const { ConflictError } = require('../errors/ConflictError');
const { Money } = require('../value-objects/Money');
const { Slug } = require('../value-objects/Slug');
const { OrderItem } = require('./OrderItem');

function asNumber(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  return parsed;
}

function normalizeText(value) {
  return value == null ? null : String(value).trim();
}

class Product {
  constructor(data) {
    const name = normalizeText(data.name);
    if (!name) {
      throw new ValidationError('Product name is required');
    }

    const stock = asNumber(data.stock ?? 0, 'Stock');
    if (stock < 0) {
      throw new ValidationError('Stock cannot be negative');
    }

    const price = Money.from(data.price ?? 0);
    const comparePrice = data.compare_price == null || data.compare_price === ''
      ? null
      : Money.from(data.compare_price);
    const costPrice = data.cost_price == null || data.cost_price === ''
      ? null
      : Money.from(data.cost_price);

    this.id = data.id || null;
    this.name = name;
    this.slug = Slug.optional(data.slug || name) || 'product';
    this.description = normalizeText(data.description) || '';
    this.price = price;
    this.compare_price = comparePrice;
    this.cost_price = costPrice;
    this.stock = stock;
    this.sku = normalizeText(data.sku) || null;
    this.category_id = data.category_id || null;
    this.image_url = normalizeText(data.image_url) || null;
    this.custom_options = Array.isArray(data.custom_options) ? data.custom_options : [];
    this.status = normalizeText(data.status) || 'active';
  }

  ensureCanReserve(quantity) {
    const requestedQuantity = asNumber(quantity, 'Quantity');
    if (requestedQuantity <= 0) {
      throw new ValidationError('Quantity must be greater than zero');
    }

    if (this.stock < requestedQuantity) {
      throw new ConflictError(`Insufficient stock for product: ${this.name}`, {
        code: 'INSUFFICIENT_STOCK',
        statusCode: 400,
      });
    }
  }

  toOrderItem({ quantity, selected_options = {} }) {
    this.ensureCanReserve(quantity);

    const normalizedQuantity = asNumber(quantity, 'Quantity');
    return new OrderItem({
      product_id: this.id,
      product_name: this.name,
      selected_options,
      quantity: normalizedQuantity,
      unit_price: this.price,
    });
  }

  applyUpdates(updates) {
    return new Product({
      ...this.toPersistence(),
      ...updates,
    });
  }

  toPersistence() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      price: this.price.toNumber(),
      compare_price: this.compare_price?.toNumber() ?? null,
      cost_price: this.cost_price?.toNumber() ?? null,
      stock: this.stock,
      sku: this.sku,
      category_id: this.category_id,
      image_url: this.image_url,
      custom_options: this.custom_options,
      status: this.status,
    };
  }
}

module.exports = {
  Product,
};
