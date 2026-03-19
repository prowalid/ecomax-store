const { CustomerDTO } = require('../../application/dto');

async function getCustomers(req, res, next) {
  try {
    const getCustomersUseCase = req.app.locals.container?.resolve('getCustomersUseCase');
    const customers = await getCustomersUseCase.execute();
    res.json(Array.isArray(customers) ? customers.map((customer) => CustomerDTO.from(customer)) : customers);
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
