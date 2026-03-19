const { ValidationError } = require('../errors/ValidationError');

class Money {
  constructor(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new ValidationError('Money value must be a non-negative number');
    }

    this.cents = Math.round(parsed * 100);
    Object.freeze(this);
  }

  add(other) {
    return new Money((this.cents + Money.from(other).cents) / 100);
  }

  multiply(quantity) {
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      throw new ValidationError('Quantity must be a non-negative number');
    }

    return new Money((this.cents * parsedQuantity) / 100);
  }

  toNumber() {
    return this.cents / 100;
  }

  static from(value) {
    return value instanceof Money ? value : new Money(value);
  }
}

module.exports = {
  Money,
};
