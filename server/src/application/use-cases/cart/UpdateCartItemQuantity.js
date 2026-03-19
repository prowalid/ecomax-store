const { isValidSessionId } = require('../../../domain/cart/sessionValidation');

class UpdateCartItemQuantityUseCase {
  constructor({ cartRepository }) {
    this.cartRepository = cartRepository;
  }

  async execute({ itemId, quantity, sessionId }) {
    if (!isValidSessionId(sessionId)) {
      const error = new Error('Invalid session ID');
      error.status = 400;
      throw error;
    }

    if (quantity <= 0) {
      const deleted = await this.cartRepository.deleteByIdAndSessionId(itemId, sessionId);
      if (!deleted) {
        const error = new Error('Cart item not found');
        error.status = 404;
        throw error;
      }

      return { deleted: true };
    }

    const updatedItem = await this.cartRepository.updateQuantityByIdAndSessionId(
      itemId,
      sessionId,
      quantity
    );

    if (!updatedItem) {
      const error = new Error('Cart item not found');
      error.status = 404;
      throw error;
    }

    return {
      deleted: false,
      item: updatedItem,
    };
  }
}

module.exports = {
  UpdateCartItemQuantityUseCase,
};

