const { ProductDTO } = require('../../application/dto');
const { recordAdminAudit } = require('./audit');

async function getProducts(req, res, next) {
  try {
    const listProductsUseCase = req.app.locals.container?.resolve('listProductsUseCase');
    const cacheService = req.app.locals.container?.resolve('cacheService');
    if (!listProductsUseCase) {
      throw new Error('ListProductsUseCase is not available');
    }

    const cacheKey = req.user?.role === 'admin' ? 'products:list:admin' : 'products:list:public';
    const products = await cacheService.getOrSet(
      cacheKey,
      30 * 1000,
      () => listProductsUseCase.execute({ user: req.user })
    );
    res.json(Array.isArray(products) ? products.map((product) => ProductDTO.from(product)) : products);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const createProductUseCase = req.app.locals.container?.resolve('createProductUseCase');
    if (!createProductUseCase) {
      throw new Error('CreateProductUseCase is not available');
    }

    const product = await createProductUseCase.execute(req.body);
    await recordAdminAudit(req, {
      action: 'product.create',
      entityType: 'product',
      entityId: product.id,
      meta: { name: product.name, status: product.status },
    });
    res.status(201).json(ProductDTO.from(product));
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updateProductUseCase = req.app.locals.container?.resolve('updateProductUseCase');
    const uploadCleanupService = req.app.locals.container?.resolve('uploadCleanupService');
    if (!updateProductUseCase) {
      throw new Error('UpdateProductUseCase is not available');
    }

    const { previousImageUrl, updatedProduct } = await updateProductUseCase.execute({
      productId: id,
      updates,
    });

    await uploadCleanupService.cleanupRemovedUploadUrls([previousImageUrl], [updatedProduct.image_url]);
    await recordAdminAudit(req, {
      action: 'product.update',
      entityType: 'product',
      entityId: updatedProduct.id,
      meta: { name: updatedProduct.name, status: updatedProduct.status },
    });
    res.json(ProductDTO.from(updatedProduct));
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  const { id } = req.params;
  try {
    const deleteProductUseCase = req.app.locals.container?.resolve('deleteProductUseCase');
    const uploadCleanupService = req.app.locals.container?.resolve('uploadCleanupService');
    if (!deleteProductUseCase) {
      throw new Error('DeleteProductUseCase is not available');
    }

    const { urlsToCleanup } = await deleteProductUseCase.execute({ productId: id });
    await uploadCleanupService.cleanupRemovedUploadUrls(urlsToCleanup, []);
    await recordAdminAudit(req, {
      action: 'product.delete',
      entityType: 'product',
      entityId: id,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getProductImages(req, res, next) {
  const { id } = req.params;
  try {
    const getProductImagesUseCase = req.app.locals.container?.resolve('getProductImagesUseCase');
    if (!getProductImagesUseCase) {
      throw new Error('GetProductImagesUseCase is not available');
    }

    const images = await getProductImagesUseCase.execute({ productId: id });
    res.json(images);
  } catch (err) {
    next(err);
  }
}

async function addProductImage(req, res, next) {
  const { id } = req.params;
  const { image_url } = req.body;

  try {
    const addProductImageUseCase = req.app.locals.container?.resolve('addProductImageUseCase');
    if (!addProductImageUseCase) {
      throw new Error('AddProductImageUseCase is not available');
    }

    const image = await addProductImageUseCase.execute({
      productId: id,
      imageUrl: image_url,
    });

    await recordAdminAudit(req, {
      action: 'product.image.add',
      entityType: 'product',
      entityId: id,
      meta: { imageId: image.id },
    });
    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
}

async function reorderProductImages(req, res, next) {
  const { id } = req.params;
  const { images } = req.body;

  try {
    const reorderProductImagesUseCase = req.app.locals.container?.resolve('reorderProductImagesUseCase');
    if (!reorderProductImagesUseCase) {
      throw new Error('ReorderProductImagesUseCase is not available');
    }

    const result = await reorderProductImagesUseCase.execute({ productId: id, images });
    await recordAdminAudit(req, {
      action: 'product.image.reorder',
      entityType: 'product',
      entityId: id,
      meta: { imagesCount: Array.isArray(images) ? images.length : 0 },
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteProductImage(req, res, next) {
  const { id, imageId } = req.params;
  try {
    const deleteProductImageUseCase = req.app.locals.container?.resolve('deleteProductImageUseCase');
    const uploadCleanupService = req.app.locals.container?.resolve('uploadCleanupService');
    if (!deleteProductImageUseCase) {
      throw new Error('DeleteProductImageUseCase is not available');
    }

    const { deletedImageUrl, newMainImage } = await deleteProductImageUseCase.execute({
      productId: id,
      imageId,
    });
    await uploadCleanupService.cleanupRemovedUploadUrls([deletedImageUrl], [newMainImage]);

    await recordAdminAudit(req, {
      action: 'product.image.delete',
      entityType: 'product',
      entityId: id,
      meta: { imageId },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductImages,
  addProductImage,
  reorderProductImages,
  deleteProductImage,
};
