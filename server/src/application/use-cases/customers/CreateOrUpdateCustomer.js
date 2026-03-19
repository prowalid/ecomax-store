const { Customer } = require('../../../domain/entities/Customer');

class CreateOrUpdateCustomerUseCase {
  constructor({ customerRepository }) {
    this.customerRepository = customerRepository;
  }

  async execute({ name, phone, wilaya = null, commune = null, address = null, notes = null }) {
    const draftCustomer = new Customer({
      name,
      phone,
      wilaya,
      commune,
      address,
      notes,
    });

    const existingCustomer = await this.customerRepository.findByPhone(draftCustomer.phone);

    if (existingCustomer) {
      const customer = await this.customerRepository.update(
        existingCustomer.id,
        new Customer({
          ...existingCustomer,
          ...draftCustomer.toPersistence(),
          phone: existingCustomer.phone,
        })
      );

      return {
        customer,
        created: false,
      };
    }

    const customer = await this.customerRepository.create(draftCustomer);

    return {
      customer,
      created: true,
    };
  }
}

module.exports = {
  CreateOrUpdateCustomerUseCase,
};
