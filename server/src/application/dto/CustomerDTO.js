class CustomerDTO {
  static from(customer) {
    if (!customer) {
      return null;
    }

    const dto = {
      id: customer.id ?? null,
      name: customer.name ?? '',
      phone: customer.phone ?? null,
    };

    if (customer.wilaya != null) dto.wilaya = customer.wilaya;
    if (customer.commune != null) dto.commune = customer.commune;
    if (customer.address != null) dto.address = customer.address;
    if (customer.notes != null) dto.notes = customer.notes;
    if (customer.created_at != null) dto.created_at = customer.created_at;
    if (customer.updated_at != null) dto.updated_at = customer.updated_at;

    return dto;
  }
}

module.exports = {
  CustomerDTO,
};
