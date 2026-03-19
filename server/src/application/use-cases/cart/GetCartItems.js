const { isValidSessionId } = require('../../../domain/cart/sessionValidation');

class GetCartItemsUseCase {
  constructor({ cartRepository }) {
    this.cartRepository = cartRepository;
  }

  async execute({ sessionId }) {
    if (!isValidSessionId(sessionId)) {
      const error = new Error('Invalid session ID');
      error.status = 400;
      throw error;
    }

    return this.cartRepository.findBySessionId(sessionId);
  }
}

module.exports = {
  GetCartItemsUseCase,
};

