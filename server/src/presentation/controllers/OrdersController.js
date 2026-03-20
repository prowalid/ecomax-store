const { OrderDTO, OrderItemDTO } = require('../../application/dto');
const { recordAdminAudit, getRequestIp } = require('./audit');

async function getOrders(req, res, next) {
  try {
    const useCase = req.app.locals.container?.resolve('getOrdersUseCase');
    if (!useCase) {
      throw new Error('GetOrdersUseCase is not available');
    }

    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const paginate = Number.isInteger(requestedPage) || Number.isInteger(requestedLimit);

    const orders = await useCase.execute({
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      status: typeof req.query.status === 'string' ? req.query.status : undefined,
      page: Number.isInteger(requestedPage) ? requestedPage : 1,
      limit: Number.isInteger(requestedLimit) ? requestedLimit : 20,
      paginate,
    });

    if (Array.isArray(orders)) {
      return res.json(orders.map((order) => OrderDTO.from(order)));
    }

    return res.json({
      items: orders.items.map((order) => OrderDTO.from(order)),
      pagination: orders.pagination,
    });
  } catch (err) {
    next(err);
  }
}

async function getOrderItems(req, res, next) {
  try {
    const useCase = req.app.locals.container?.resolve('getOrderItemsUseCase');
    if (!useCase) {
      throw new Error('GetOrderItemsUseCase is not available');
    }

    const items = await useCase.execute({ orderId: req.params.id });
    res.json(Array.isArray(items) ? items.map((item) => OrderItemDTO.from(item)) : items);
  } catch (err) {
    next(err);
  }
}

async function createOrder(req, res, next) {
  try {
    const createOrderUseCase = req.app.locals.container?.resolve('createOrderUseCase');
    if (!createOrderUseCase) {
      throw new Error('CreateOrderUseCase is not available');
    }

    const { newOrder } = await createOrderUseCase.execute({
      body: req.body,
      requestIp: getRequestIp(req),
    });

    res.status(201).json(OrderDTO.from(newOrder));
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updateOrderStatusUseCase = req.app.locals.container?.resolve('updateOrderStatusUseCase');
    if (!updateOrderStatusUseCase) {
      throw new Error('UpdateOrderStatusUseCase is not available');
    }

    const { updatedOrder } = await updateOrderStatusUseCase.execute({
      orderId: id,
      status,
    });

    await recordAdminAudit(req, {
      action: 'order.status.update',
      entityType: 'order',
      entityId: updatedOrder.id || id,
      meta: { status: updatedOrder.status },
    });
    res.json(OrderDTO.from(updatedOrder));
  } catch (err) {
    next(err);
  }
}

async function createOrderShipment(req, res, next) {
  try {
    const useCase = req.app.locals.container?.resolve('createOrderShipmentUseCase');
    if (!useCase) {
      throw new Error('CreateOrderShipmentUseCase is not available');
    }

    const result = await useCase.execute({ orderId: req.params.id });
    await recordAdminAudit(req, {
      action: 'order.shipment.create',
      entityType: 'order',
      entityId: req.params.id,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOrders,
  getOrderItems,
  createOrder,
  updateOrderStatus,
  createOrderShipment,
};
