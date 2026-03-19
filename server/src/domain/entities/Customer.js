const { Phone } = require('../value-objects/Phone');
const { ValidationError } = require('../errors/ValidationError');

function normalizeNullableText(value) {
  const normalized = value == null ? null : String(value).trim();
  return normalized || null;
}

class Customer {
  constructor(data) {
    const name = normalizeNullableText(data.name);
    if (!name) {
      throw new ValidationError('Name and phone are required');
    }

    this.id = data.id || null;
    this.name = name;
    this.phone = new Phone(data.phone).value;
    this.wilaya = normalizeNullableText(data.wilaya);
    this.commune = normalizeNullableText(data.commune);
    this.address = normalizeNullableText(data.address);
    this.notes = normalizeNullableText(data.notes);
  }

  applyUpdates(updates) {
    return new Customer({
      ...this.toPersistence(),
      ...updates,
    });
  }

  toPersistence() {
    return {
      id: this.id,
      name: this.name,
      phone: this.phone,
      wilaya: this.wilaya,
      commune: this.commune,
      address: this.address,
      notes: this.notes,
    };
  }
}

module.exports = {
  Customer,
};
