const ORDER_STATUS_FLOW = {
  new: ['attempt', 'confirmed', 'cancelled'],
  attempt: ['no_answer', 'confirmed', 'cancelled'],
  no_answer: ['attempt', 'confirmed', 'cancelled'],
  confirmed: ['ready', 'cancelled'],
  cancelled: [],
  ready: ['shipped'],
  shipped: ['delivered', 'returned'],
  delivered: [],
  returned: [],
};

const STOCK_CONSUMED_STATUSES = ['new', 'attempt', 'no_answer', 'confirmed', 'ready', 'shipped', 'delivered'];
const STOCK_RESTORED_STATUSES = ['cancelled', 'returned'];

function getAllowedNextStatuses(status) {
  return ORDER_STATUS_FLOW[status] || [];
}

function isValidStatusTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) {
    return true;
  }

  return getAllowedNextStatuses(fromStatus).includes(toStatus);
}

function shouldIncrementCallAttempts(status) {
  return status === 'attempt';
}

function shouldRestoreStock(fromStatus, toStatus) {
  return STOCK_CONSUMED_STATUSES.includes(fromStatus) && STOCK_RESTORED_STATUSES.includes(toStatus);
}

function shouldConsumeStock(fromStatus, toStatus) {
  return STOCK_RESTORED_STATUSES.includes(fromStatus) && STOCK_CONSUMED_STATUSES.includes(toStatus);
}

module.exports = {
  ORDER_STATUS_FLOW,
  getAllowedNextStatuses,
  isValidStatusTransition,
  shouldIncrementCallAttempts,
  shouldRestoreStock,
  shouldConsumeStock,
};
