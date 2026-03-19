const { isValidSessionId } = require('../../../domain/cart/sessionValidation');

class ClearCartUseCase {
  constructor({ cartRepository }) {
    this.cartRepository = cartRepository;
  }

  async execute({ sessionId }) {
    if (!isValidSessionId(sessionId)) {
      const error = new Error('Invalid session ID');
      error.status = 400;
      throw error;
    }

    await this.cartRepository.clearBySessionId(sessionId);
  }
}

module.exports = {
  ClearCartUseCase,
};

