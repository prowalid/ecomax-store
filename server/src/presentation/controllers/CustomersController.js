const { CustomerDTO } = require('../../application/dto');

async function getCustomers(req, res, next) {
  try {
    const getCustomersUseCase = req.app.locals.container?.resolve('getCustomersUseCase');
    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const paginate = Number.isInteger(requestedPage) || Number.isInteger(requestedLimit);
    const customers = await getCustomersUseCase.execute({
      search: typeof req.query.search === 'string' ? req.query.search : undefined,
      page: Number.isInteger(requestedPage) ? requestedPage : 1,
      limit: Number.isInteger(requestedLimit) ? requestedLimit : 20,
      paginate,
    });

    if (Array.isArray(customers)) {
      return res.json(customers.map((customer) => CustomerDTO.from(customer)));
    }

    return res.json({
      items: customers.items.map((customer) => CustomerDTO.from(customer)),
      pagination: customers.pagination,
    });
  } catch (err) {
    next(err);
  }
}

async function createOrUpdateCustomer(req, res, next) {
  try {
    const createOrUpdateCustomerUseCase = req.app.locals.container?.resolve('createOrUpdateCustomerUseCase');
    const { customer, created } = await createOrUpdateCustomerUseCase.execute(req.body);
    res.status(created ? 201 : 200).json(CustomerDTO.from(customer));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCustomers,
  createOrUpdateCustomer,
};
