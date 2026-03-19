const { OrderCreatedWorker } = require('./OrderCreatedWorker');
const { OrderStatusUpdatedWorker } = require('./OrderStatusUpdatedWorker');

module.exports = {
  OrderCreatedWorker,
  OrderStatusUpdatedWorker,
};
