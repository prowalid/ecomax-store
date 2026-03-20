class ProductDTO {
  static from(product) {
    if (!product) {
      return null;
    }

    return {
      id: product.id ?? null,
      name: product.name ?? '',
      slug: product.slug ?? null,
      description: product.description ?? '',
      price: product.price?.toNumber ? product.price.toNumber() : Number(product.price ?? 0),
      compare_price: product.compare_price?.toNumber
        ? product.compare_price.toNumber()
        : (product.compare_price ?? null),
      cost_price: product.cost_price?.toNumber
        ? product.cost_price.toNumber()
        : (product.cost_price ?? null),
      stock: Number(product.stock ?? 0),
      sku: product.sku ?? null,
      category_id: product.category_id ?? null,
      category_name: product.category_name ?? null,
      image_url: product.image_url ?? null,
      custom_options: Array.isArray(product.custom_options) ? product.custom_options : [],
      status: product.status ?? 'active',
      version: Number(product.version ?? 1),
    };
  }
}

module.exports = {
  ProductDTO,
};
