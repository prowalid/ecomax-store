const { isValidSessionId } = require('../../../domain/cart/sessionValidation');

class AddOrUpdateCartItemUseCase {
  constructor({ cartRepository, normalizeSelectedOptions }) {
    this.cartRepository = cartRepository;
    this.normalizeSelectedOptions = normalizeSelectedOptions;
  }

  async execute({ body }) {
    const {
      session_id,
      product_id,
      product_name,
      product_price,
      product_image_url,
      quantity,
    } = body;
    const selectedOptions = this.normalizeSelectedOptions(body.selected_options);

    if (!isValidSessionId(session_id)) {
      const error = new Error('Invalid session ID');
      error.status = 400;
      throw error;
    }

    const existingItem = await this.cartRepository.findMatchingItem({
      sessionId: session_id,
      productId: product_id,
      selectedOptions,
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + (quantity || 1);
      return this.cartRepository.updateQuantityById(existingItem.id, newQuantity);
    }

    return this.cartRepository.createItem({
      sessionId: session_id,
      productId: product_id,
      productName: product_name,
      selectedOptions,
      productPrice: product_price,
      productImageUrl: product_image_url || null,
      quantity: quantity || 1,
    });
  }
}

module.exports = {
  AddOrUpdateCartItemUseCase,
};

