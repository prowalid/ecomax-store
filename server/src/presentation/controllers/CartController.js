async function getCartItems(req, res, next) {
  try {
    const getCartItemsUseCase = req.app.locals.container?.resolve('getCartItemsUseCase');
    const items = await getCartItemsUseCase.execute({ sessionId: req.params.sessionId });
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function addOrUpdateCartItem(req, res, next) {
  try {
    const addOrUpdateCartItemUseCase = req.app.locals.container?.resolve('addOrUpdateCartItemUseCase');
    const item = await addOrUpdateCartItemUseCase.execute({ body: req.body });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

async function updateCartItemQuantity(req, res, next) {
  try {
    const updateCartItemQuantityUseCase = req.app.locals.container?.resolve('updateCartItemQuantityUseCase');
    const result = await updateCartItemQuantityUseCase.execute({
      itemId: req.params.itemId,
      quantity: req.body.quantity,
      sessionId: req.body.session_id,
    });

    if (result.deleted) {
      return res.status(204).send();
    }

    res.json(result.item);
  } catch (err) {
    next(err);
  }
}

async function deleteCartItem(req, res, next) {
  try {
    const deleteCartItemUseCase = req.app.locals.container?.resolve('deleteCartItemUseCase');
    await deleteCartItemUseCase.execute({
      itemId: req.params.itemId,
      sessionId: typeof req.query.session_id === 'string' ? req.query.session_id : '',
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    const clearCartUseCase = req.app.locals.container?.resolve('clearCartUseCase');
    await clearCartUseCase.execute({ sessionId: req.params.sessionId });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getCartItems,
  addOrUpdateCartItem,
  updateCartItemQuantity,
  deleteCartItem,
  clearCart,
};
