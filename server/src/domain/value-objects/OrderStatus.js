const { ORDER_STATUS_FLOW } = require('../orders/orderStatusRules');
const { ValidationError } = require('../errors/ValidationError');

class OrderStatus {
  constructor(value) {
    if (!OrderStatus.isKnown(value)) {
      throw new ValidationError(`Unknown order status: ${value}`);
    }

    this.value = value;
    Object.freeze(this);
  }

  static isKnown(value) {
    return Object.prototype.hasOwnProperty.call(ORDER_STATUS_FLOW, value);
  }

  allowedNextStatuses() {
    return ORDER_STATUS_FLOW[this.value] || [];
  }

  canTransitionTo(nextStatus) {
    if (nextStatus === this.value) {
      return true;
    }

    return this.allowedNextStatuses().includes(nextStatus);
  }

  assertTransition(nextStatus) {
    if (!this.canTransitionTo(nextStatus)) {
      const error = new ValidationError(
        `لا يمكن نقل الطلب من حالة "${this.value}" إلى حالة "${nextStatus}" مباشرة.`
      );
      error.code = 'INVALID_ORDER_STATUS_TRANSITION';
      throw error;
    }
  }
}

module.exports = {
  OrderStatus,
};
