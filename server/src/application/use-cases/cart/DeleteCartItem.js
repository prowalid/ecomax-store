const { isValidSessionId } = require('../../../domain/cart/sessionValidation');

class DeleteCartItemUseCase {
  constructor({ cartRepository }) {
    this.cartRepository = cartRepository;
  }

  async execute({ itemId, sessionId }) {
    if (!isValidSessionId(sessionId)) {
      const error = new Error('Invalid session ID');
      error.status = 400;
      throw error;
    }

    const deleted = await this.cartRepository.deleteByIdAndSessionId(itemId, sessionId);
    if (!deleted) {
      const error = new Error('Cart item not found');
      error.status = 404;
      throw error;
    }
  }
}

module.exports = {
  DeleteCartItemUseCase,
};

