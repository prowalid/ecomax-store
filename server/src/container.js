const pool = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler } = require('./presentation/middleware/errorHandler');
const { getVersionPayload } = require('./utils/versionInfo');
const { getCacheConfig } = require('./config/cache');
const { getQueueConfig } = require('./config/queue');
const { getMetricsConfig } = require('./config/metrics');
const { getStorageConfig } = require('./config/storage');
const { PgOrderRepository } = require('./infrastructure/repositories/PgOrderRepository');
const { PgProductRepository } = require('./infrastructure/repositories/PgProductRepository');
const { UpdateOrderStatusUseCase } = require('./application/use-cases/orders/UpdateOrderStatus');
const { CreateOrderUseCase } = require('./application/use-cases/orders/CreateOrder');
const { GetOrdersUseCase } = require('./application/use-cases/orders/GetOrders');
const { GetOrderItemsUseCase } = require('./application/use-cases/orders/GetOrderItems');
const { EventBus } = require('./application/services/EventBus');
const { CacheService } = require('./application/services/CacheService');
const { InMemoryCache } = require('./infrastructure/cache/InMemoryCache');
const { RedisCache } = require('./infrastructure/cache/RedisCache');
const { InlineQueueManager } = require('./infrastructure/queue/InlineQueueManager');
const { BullMQQueueManager } = require('./infrastructure/queue/BullMQQueueManager');
const { OrderCreatedWorker, OrderStatusUpdatedWorker } = require('./infrastructure/queue/workers');
const { normalizeSelectedOptions } = require('./utils/normalizeSelectedOptions');
const { normalizeCustomOptions } = require('./utils/normalizeCustomOptions');
const { ListProductsUseCase } = require('./application/use-cases/products/ListProducts');
const { CreateProductUseCase } = require('./application/use-cases/products/CreateProduct');
const { UpdateProductUseCase } = require('./application/use-cases/products/UpdateProduct');
const { DeleteProductUseCase } = require('./application/use-cases/products/DeleteProduct');
const { GetProductImagesUseCase } = require('./application/use-cases/products/GetProductImages');
const { AddProductImageUseCase } = require('./application/use-cases/products/AddProductImage');
const { ReorderProductImagesUseCase } = require('./application/use-cases/products/ReorderProductImages');
const { DeleteProductImageUseCase } = require('./application/use-cases/products/DeleteProductImage');
const { PgSettingsRepository } = require('./infrastructure/repositories/PgSettingsRepository');
const { GetSettingsUseCase } = require('./application/use-cases/settings/GetSettings');
const { SaveSettingsUseCase } = require('./application/use-cases/settings/SaveSettings');
const { PgPageRepository } = require('./infrastructure/repositories/PgPageRepository');
const { GetAllPagesUseCase } = require('./application/use-cases/pages/GetAllPages');
const { GetPublishedPagesUseCase } = require('./application/use-cases/pages/GetPublishedPages');
const { GetPageBySlugUseCase } = require('./application/use-cases/pages/GetPageBySlug');
const { CreatePageUseCase } = require('./application/use-cases/pages/CreatePage');
const { UpdatePageUseCase } = require('./application/use-cases/pages/UpdatePage');
const { DeletePageUseCase } = require('./application/use-cases/pages/DeletePage');
const { EnsurePagesSlugIntegrityUseCase } = require('./application/use-cases/pages/EnsurePagesSlugIntegrity');
const { PgCategoryRepository } = require('./infrastructure/repositories/PgCategoryRepository');
const { GetCategoriesUseCase } = require('./application/use-cases/categories/GetCategories');
const { CreateCategoryUseCase } = require('./application/use-cases/categories/CreateCategory');
const { UpdateCategoryUseCase } = require('./application/use-cases/categories/UpdateCategory');
const { DeleteCategoryUseCase } = require('./application/use-cases/categories/DeleteCategory');
const { PgCustomerRepository } = require('./infrastructure/repositories/PgCustomerRepository');
const { PgCartRepository } = require('./infrastructure/repositories/PgCartRepository');
const { GetCustomersUseCase } = require('./application/use-cases/customers/GetCustomers');
const { CreateOrUpdateCustomerUseCase } = require('./application/use-cases/customers/CreateOrUpdateCustomer');
const { GetCartItemsUseCase } = require('./application/use-cases/cart/GetCartItems');
const { AddOrUpdateCartItemUseCase } = require('./application/use-cases/cart/AddOrUpdateCartItem');
const { UpdateCartItemQuantityUseCase } = require('./application/use-cases/cart/UpdateCartItemQuantity');
const { DeleteCartItemUseCase } = require('./application/use-cases/cart/DeleteCartItem');
const { ClearCartUseCase } = require('./application/use-cases/cart/ClearCart');
const { PgBlacklistRepository } = require('./infrastructure/repositories/PgBlacklistRepository');
const { PgAnalyticsRepository } = require('./infrastructure/repositories/PgAnalyticsRepository');
const { GetBlacklistUseCase } = require('./application/use-cases/blacklist/GetBlacklist');
const { AddToBlacklistUseCase } = require('./application/use-cases/blacklist/AddToBlacklist');
const { RemoveFromBlacklistUseCase } = require('./application/use-cases/blacklist/RemoveFromBlacklist');
const { GetAnalyticsUseCase } = require('./application/use-cases/analytics/GetAnalytics');
const { GetAdminAuditLogUseCase } = require('./application/use-cases/analytics/GetAdminAuditLog');
const { PgUserRepository } = require('./infrastructure/repositories/PgUserRepository');
const { PgAuthSessionRepository } = require('./infrastructure/repositories/PgAuthSessionRepository');
const { PgAdminAuditLogRepository } = require('./infrastructure/repositories/PgAdminAuditLogRepository');
const { GetSetupStatusUseCase } = require('./application/use-cases/auth/GetSetupStatus');
const { GetCurrentUserUseCase } = require('./application/use-cases/auth/GetCurrentUser');
const { GetProfileUseCase } = require('./application/use-cases/auth/GetProfile');
const { UpdateProfileUseCase } = require('./application/use-cases/auth/UpdateProfile');
const { AuthTokenService } = require('./infrastructure/services/AuthTokenService');
const { AuthSessionService } = require('./infrastructure/services/AuthSessionService');
const { LoginUseCase } = require('./application/use-cases/auth/Login');
const { RefreshSessionUseCase } = require('./application/use-cases/auth/RefreshSession');
const { LogoutUseCase } = require('./application/use-cases/auth/Logout');
const { RegisterUseCase } = require('./application/use-cases/auth/Register');
const { ChangePasswordUseCase } = require('./application/use-cases/auth/ChangePassword');
const { SetupTwoFactorUseCase } = require('./application/use-cases/auth/SetupTwoFactor');
const { VerifyTwoFactorUseCase } = require('./application/use-cases/auth/VerifyTwoFactor');
const { DisableTwoFactorUseCase } = require('./application/use-cases/auth/DisableTwoFactor');
const { RecoverPasswordUseCase } = require('./application/use-cases/auth/RecoverPassword');
const { ResetPasswordUseCase } = require('./application/use-cases/auth/ResetPassword');
const { WhatsAppRecoveryService } = require('./infrastructure/services/WhatsAppRecoveryService');
const { UploadCleanupService } = require('./infrastructure/services/UploadCleanupService');
const { GetHealthStatusUseCase } = require('./application/use-cases/health/GetHealthStatus');
const { TurnstileVerifier } = require('./infrastructure/services/TurnstileVerifier');
const { ValidateOrderSecurityUseCase } = require('./application/use-cases/security/ValidateOrderSecurity');
const { WhatsAppMessagingService } = require('./infrastructure/services/WhatsAppMessagingService');
const { OrderWebhookService } = require('./infrastructure/services/OrderWebhookService');
const { SendFacebookCapiEventUseCase } = require('./application/use-cases/integrations/SendFacebookCapiEvent');
const { SendWhatsAppNotificationUseCase } = require('./application/use-cases/integrations/SendWhatsAppNotification');
const { UpdateGreenApiCredentialsUseCase } = require('./application/use-cases/integrations/UpdateGreenApiCredentials');
const { TestOrderWebhookUseCase } = require('./application/use-cases/integrations/TestOrderWebhook');
const { CreateOrderShipmentUseCase } = require('./application/use-cases/shipping/CreateOrderShipment');
const { HandleFileUploadUseCase } = require('./application/use-cases/upload/HandleFileUpload');
const { ShippingSettingsService } = require('./application/services/ShippingSettingsService');
const { MetricsService } = require('./infrastructure/services/MetricsService');
const { AdminAuditService } = require('./application/services/AdminAuditService');
const { LocalFileStorage } = require('./infrastructure/storage/LocalFileStorage');
const { PageIntegrityService } = require('./infrastructure/services/PageIntegrityService');
const { SchemaMigrationService } = require('./infrastructure/services/SchemaMigrationService');
const { EnsureStartupSchemaUseCase } = require('./application/use-cases/system/EnsureStartupSchema');
const { CategoryDefaultsService } = require('./infrastructure/services/CategoryDefaultsService');
const { CartCleanupService } = require('./infrastructure/services/CartCleanupService');
const { EnsureDefaultCategoryImagesUseCase } = require('./application/use-cases/system/EnsureDefaultCategoryImages');
const { StartCartCleanupUseCase } = require('./application/use-cases/system/StartCartCleanup');

class Container {
  constructor() {
    this.registry = new Map();
    this.factories = new Map();
  }

  register(name, value) {
    this.registry.set(name, value);
    return this;
  }

  registerFactory(name, factory) {
    this.factories.set(name, factory);
    return this;
  }

  resolve(name) {
    if (this.factories.has(name)) {
      const instance = this.factories.get(name)(this);
      this.registry.set(name, instance);
      this.factories.delete(name);
      return instance;
    }

    if (!this.registry.has(name)) {
      throw new Error(`Container dependency "${name}" is not registered`);
    }

    return this.registry.get(name);
  }
}

function createContainer() {
  const cacheConfig = getCacheConfig();
  const queueConfig = getQueueConfig();
  const metricsConfig = getMetricsConfig();
  const storageConfig = getStorageConfig();

  return new Container()
    .register('pool', pool)
    .register('logger', logger)
    .register('errorHandler', { errorHandler })
    .register('getVersionPayload', getVersionPayload)
    .register('normalizeCustomOptions', normalizeCustomOptions)
    .register('cacheConfig', cacheConfig)
    .register('queueConfig', queueConfig)
    .register('metricsConfig', metricsConfig)
    .register('storageConfig', storageConfig)
    .registerFactory('fileStorage', (container) => {
      const currentStorageConfig = container.resolve('storageConfig');
      return new LocalFileStorage({
        uploadsDir: currentStorageConfig.uploadsDir,
        publicPrefix: currentStorageConfig.publicPrefix,
      });
    })
    .registerFactory('metricsService', (container) => new MetricsService({
      prefix: container.resolve('metricsConfig').prefix,
      collectDefaultMetrics: container.resolve('metricsConfig').collectDefaultMetrics,
    }))
    .registerFactory('cacheStore', (container) => {
      const currentLogger = container.resolve('logger');
      const currentCacheConfig = container.resolve('cacheConfig');

      if (currentCacheConfig.driver === 'redis') {
        try {
          const redisStore = new RedisCache(currentCacheConfig.redis);
          currentLogger.info('[Cache] Using Redis cache store', {
            host: currentCacheConfig.redis.host,
            port: currentCacheConfig.redis.port,
            db: currentCacheConfig.redis.db,
          });
          return redisStore;
        } catch (error) {
          currentLogger.warn('[Cache] Falling back to InMemoryCache', {
            reason: error instanceof Error ? error.message : String(error),
          });
        }
      }

      currentLogger.info('[Cache] Using InMemoryCache');
      return new InMemoryCache();
    })
    .registerFactory('cacheService', (container) => new CacheService(container.resolve('cacheStore')))
    .registerFactory(
      'getHealthStatusUseCase',
      (container) => new GetHealthStatusUseCase({
        pool: container.resolve('pool'),
        cacheStore: container.resolve('cacheStore'),
        queueManager: container.resolve('queueManager'),
        getVersionPayload: container.resolve('getVersionPayload'),
      })
    )
    .registerFactory('queueManager', (container) => {
      const currentQueueConfig = container.resolve('queueConfig');
      const currentLogger = container.resolve('logger');

      if (currentQueueConfig.driver === 'bullmq') {
        currentLogger.info('[Queue] Using BullMQ queue manager', {
          queueName: currentQueueConfig.queueName,
          host: currentQueueConfig.redis.host,
          port: currentQueueConfig.redis.port,
          db: currentQueueConfig.redis.db,
        });

        return new BullMQQueueManager({
          config: currentQueueConfig,
          logger: currentLogger,
        });
      }

      currentLogger.info('[Queue] Using inline queue manager');
      return new InlineQueueManager({
        logger: currentLogger,
      });
    })
    .registerFactory('eventBus', (container) => {
      const bus = new EventBus({
        queueManager: container.resolve('queueManager'),
        metricsService: container.resolve('metricsService'),
      });
      const orderCreatedWorker = container.resolve('orderCreatedWorker');
      const orderStatusUpdatedWorker = container.resolve('orderStatusUpdatedWorker');
      bus.subscribeQueued(
        OrderCreatedWorker.eventName,
        orderCreatedWorker.process.bind(orderCreatedWorker)
      );
      bus.subscribeQueued(
        OrderStatusUpdatedWorker.eventName,
        orderStatusUpdatedWorker.process.bind(orderStatusUpdatedWorker)
      );
      return bus;
    })
    .registerFactory('orderRepository', (container) => new PgOrderRepository(container.resolve('pool')))
    .registerFactory('productRepository', (container) => new PgProductRepository(container.resolve('pool')))
    .registerFactory('settingsRepository', (container) => new PgSettingsRepository(container.resolve('pool')))
    .registerFactory('pageRepository', (container) => new PgPageRepository(container.resolve('pool')))
    .registerFactory('categoryRepository', (container) => new PgCategoryRepository(container.resolve('pool')))
    .registerFactory('customerRepository', (container) => new PgCustomerRepository(container.resolve('pool')))
    .registerFactory('cartRepository', (container) => new PgCartRepository(container.resolve('pool')))
    .registerFactory('blacklistRepository', (container) => new PgBlacklistRepository(container.resolve('pool')))
    .registerFactory('analyticsRepository', (container) => new PgAnalyticsRepository(container.resolve('pool')))
    .registerFactory('userRepository', (container) => new PgUserRepository(container.resolve('pool')))
    .registerFactory('authSessionRepository', (container) => new PgAuthSessionRepository(container.resolve('pool')))
    .registerFactory('adminAuditLogRepository', (container) => new PgAdminAuditLogRepository(container.resolve('pool')))
    .registerFactory('authTokenService', () => new AuthTokenService())
    .registerFactory(
      'adminAuditService',
      (container) => new AdminAuditService({
        adminAuditLogRepository: container.resolve('adminAuditLogRepository'),
        logger: container.resolve('logger'),
      })
    )
    .registerFactory(
      'authSessionService',
      (container) => new AuthSessionService({
        authSessionRepository: container.resolve('authSessionRepository'),
      })
    )
    .registerFactory(
      'uploadCleanupService',
      (container) => new UploadCleanupService({
        pool: container.resolve('pool'),
        fileStorage: container.resolve('fileStorage'),
      })
    )
    .registerFactory(
      'whatsAppMessagingService',
      (container) => new WhatsAppMessagingService({
        settingsRepository: container.resolve('settingsRepository'),
        logger: container.resolve('logger'),
      })
    )
    .registerFactory(
      'orderWebhookService',
      (container) => new OrderWebhookService({
        settingsRepository: container.resolve('settingsRepository'),
        logger: container.resolve('logger'),
        whatsAppMessagingService: container.resolve('whatsAppMessagingService'),
      })
    )
    .registerFactory(
      'orderCreatedWorker',
      (container) => new OrderCreatedWorker({
        orderWebhookService: container.resolve('orderWebhookService'),
        logger: container.resolve('logger'),
      })
    )
    .registerFactory(
      'orderStatusUpdatedWorker',
      (container) => new OrderStatusUpdatedWorker({
        orderWebhookService: container.resolve('orderWebhookService'),
        logger: container.resolve('logger'),
      })
    )
    .registerFactory(
      'whatsAppRecoveryService',
      (container) => new WhatsAppRecoveryService({
        whatsAppMessagingService: container.resolve('whatsAppMessagingService'),
      })
    )
    .registerFactory('turnstileVerifier', () => new TurnstileVerifier())
    .register('normalizeSelectedOptions', normalizeSelectedOptions)
    .registerFactory(
      'validateOrderSecurityUseCase',
      (container) => new ValidateOrderSecurityUseCase({
        settingsRepository: container.resolve('settingsRepository'),
        blacklistRepository: container.resolve('blacklistRepository'),
        orderRepository: container.resolve('orderRepository'),
        turnstileVerifier: container.resolve('turnstileVerifier'),
      })
    )
    .registerFactory(
      'sendFacebookCapiEventUseCase',
      (container) => new SendFacebookCapiEventUseCase({
        settingsRepository: container.resolve('settingsRepository'),
        logger: container.resolve('logger'),
      })
    )
    .registerFactory(
      'sendWhatsAppNotificationUseCase',
      (container) => new SendWhatsAppNotificationUseCase({
        whatsAppMessagingService: container.resolve('whatsAppMessagingService'),
      })
    )
    .registerFactory(
      'updateGreenApiCredentialsUseCase',
      (container) => new UpdateGreenApiCredentialsUseCase({
        settingsRepository: container.resolve('settingsRepository'),
      })
    )
    .registerFactory(
      'testOrderWebhookUseCase',
      (container) => new TestOrderWebhookUseCase({
        orderWebhookService: container.resolve('orderWebhookService'),
      })
    )
    .registerFactory(
      'pageIntegrityService',
      (container) => new PageIntegrityService({
        pool: container.resolve('pool'),
      })
    )
    .registerFactory(
      'schemaMigrationService',
      (container) => new SchemaMigrationService({
        pool: container.resolve('pool'),
      })
    )
    .registerFactory(
      'categoryDefaultsService',
      (container) => new CategoryDefaultsService({
        pool: container.resolve('pool'),
      })
    )
    .registerFactory(
      'cartCleanupService',
      (container) => new CartCleanupService({
        pool: container.resolve('pool'),
        logger: container.resolve('logger'),
      })
    )
    .registerFactory(
      'shippingSettingsService',
      (container) => new ShippingSettingsService({
        settingsRepository: container.resolve('settingsRepository'),
      })
    )
    .registerFactory(
      'createOrderShipmentUseCase',
      (container) => new CreateOrderShipmentUseCase({
        orderRepository: container.resolve('orderRepository'),
        shippingSettingsService: container.resolve('shippingSettingsService'),
      })
    )
    .registerFactory(
      'handleFileUploadUseCase',
      (container) => new HandleFileUploadUseCase({
        fileStorage: container.resolve('fileStorage'),
      })
    )
    .registerFactory(
      'getOrdersUseCase',
      (container) => new GetOrdersUseCase({
        orderRepository: container.resolve('orderRepository'),
      })
    )
    .registerFactory(
      'getOrderItemsUseCase',
      (container) => new GetOrderItemsUseCase({
        orderRepository: container.resolve('orderRepository'),
      })
    )
    .registerFactory(
      'createOrderUseCase',
      (container) => new CreateOrderUseCase({
        orderRepository: container.resolve('orderRepository'),
        normalizeSelectedOptions: container.resolve('normalizeSelectedOptions'),
        eventBus: container.resolve('eventBus'),
      })
    )
    .registerFactory(
      'updateOrderStatusUseCase',
      (container) => new UpdateOrderStatusUseCase({
        orderRepository: container.resolve('orderRepository'),
        eventBus: container.resolve('eventBus'),
      })
    )
    .registerFactory(
      'setupTwoFactorUseCase',
      (container) => new SetupTwoFactorUseCase({
        userRepository: container.resolve('userRepository'),
        settingsRepository: container.resolve('settingsRepository'),
      })
    )
    .registerFactory(
      'verifyTwoFactorUseCase',
      (container) => new VerifyTwoFactorUseCase({
        userRepository: container.resolve('userRepository'),
      })
    )
    .registerFactory(
      'disableTwoFactorUseCase',
      (container) => new DisableTwoFactorUseCase({
        userRepository: container.resolve('userRepository'),
      })
    )
    .registerFactory(
      'recoverPasswordUseCase',
      (container) => new RecoverPasswordUseCase({
        userRepository: container.resolve('userRepository'),
        whatsAppRecoveryService: container.resolve('whatsAppRecoveryService'),
      })
    )
    .registerFactory(
      'resetPasswordUseCase',
      (container) => new ResetPasswordUseCase({
        userRepository: container.resolve('userRepository'),
      })
    )
    .registerFactory(
      'registerUseCase',
      (container) => new RegisterUseCase({
        userRepository: container.resolve('userRepository'),
        authTokenService: container.resolve('authTokenService'),
        authSessionService: container.resolve('authSessionService'),
      })
    )
    .registerFactory(
      'loginUseCase',
      (container) => new LoginUseCase({
        userRepository: container.resolve('userRepository'),
        authTokenService: container.resolve('authTokenService'),
        authSessionService: container.resolve('authSessionService'),
      })
    )
    .registerFactory(
      'refreshSessionUseCase',
      (container) => new RefreshSessionUseCase({
        userRepository: container.resolve('userRepository'),
        authTokenService: container.resolve('authTokenService'),
        authSessionService: container.resolve('authSessionService'),
      })
    )
    .registerFactory(
      'logoutUseCase',
      (container) => new LogoutUseCase({
        authSessionService: container.resolve('authSessionService'),
      })
    )
    .registerFactory(
      'getSetupStatusUseCase',
      (container) => new GetSetupStatusUseCase({
        userRepository: container.resolve('userRepository'),
      })
    )
    .registerFactory(
      'getCurrentUserUseCase',
      (container) => new GetCurrentUserUseCase({
        userRepository: container.resolve('userRepository'),
      })
    )
    .registerFactory(
      'getProfileUseCase',
      (container) => new GetProfileUseCase({
        userRepository: container.resolve('userRepository'),
      })
    )
    .registerFactory(
      'updateProfileUseCase',
      (container) => new UpdateProfileUseCase({
        userRepository: container.resolve('userRepository'),
      })
    )
    .registerFactory(
      'changePasswordUseCase',
      (container) => new ChangePasswordUseCase({
        userRepository: container.resolve('userRepository'),
      })
    )
    .registerFactory(
      'getBlacklistUseCase',
      (container) => new GetBlacklistUseCase({
        blacklistRepository: container.resolve('blacklistRepository'),
      })
    )
    .registerFactory(
      'addToBlacklistUseCase',
      (container) => new AddToBlacklistUseCase({
        blacklistRepository: container.resolve('blacklistRepository'),
      })
    )
    .registerFactory(
      'removeFromBlacklistUseCase',
      (container) => new RemoveFromBlacklistUseCase({
        blacklistRepository: container.resolve('blacklistRepository'),
      })
    )
    .registerFactory(
      'getAnalyticsUseCase',
      (container) => new GetAnalyticsUseCase({
        analyticsRepository: container.resolve('analyticsRepository'),
      })
    )
    .registerFactory(
      'getAdminAuditLogUseCase',
      (container) => new GetAdminAuditLogUseCase({
        analyticsRepository: container.resolve('analyticsRepository'),
      })
    )
    .registerFactory(
      'getCustomersUseCase',
      (container) => new GetCustomersUseCase({
        customerRepository: container.resolve('customerRepository'),
      })
    )
    .registerFactory(
      'createOrUpdateCustomerUseCase',
      (container) => new CreateOrUpdateCustomerUseCase({
        customerRepository: container.resolve('customerRepository'),
      })
    )
    .registerFactory(
      'getCartItemsUseCase',
      (container) => new GetCartItemsUseCase({
        cartRepository: container.resolve('cartRepository'),
      })
    )
    .registerFactory(
      'addOrUpdateCartItemUseCase',
      (container) => new AddOrUpdateCartItemUseCase({
        cartRepository: container.resolve('cartRepository'),
        normalizeSelectedOptions: container.resolve('normalizeSelectedOptions'),
      })
    )
    .registerFactory(
      'updateCartItemQuantityUseCase',
      (container) => new UpdateCartItemQuantityUseCase({
        cartRepository: container.resolve('cartRepository'),
      })
    )
    .registerFactory(
      'deleteCartItemUseCase',
      (container) => new DeleteCartItemUseCase({
        cartRepository: container.resolve('cartRepository'),
      })
    )
    .registerFactory(
      'clearCartUseCase',
      (container) => new ClearCartUseCase({
        cartRepository: container.resolve('cartRepository'),
      })
    )
    .registerFactory(
      'getCategoriesUseCase',
      (container) => new GetCategoriesUseCase({
        categoryRepository: container.resolve('categoryRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'createCategoryUseCase',
      (container) => new CreateCategoryUseCase({
        categoryRepository: container.resolve('categoryRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'updateCategoryUseCase',
      (container) => new UpdateCategoryUseCase({
        categoryRepository: container.resolve('categoryRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'deleteCategoryUseCase',
      (container) => new DeleteCategoryUseCase({
        categoryRepository: container.resolve('categoryRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'getAllPagesUseCase',
      (container) => new GetAllPagesUseCase({
        pageRepository: container.resolve('pageRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'getPublishedPagesUseCase',
      (container) => new GetPublishedPagesUseCase({
        pageRepository: container.resolve('pageRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'getPageBySlugUseCase',
      (container) => new GetPageBySlugUseCase({
        pageRepository: container.resolve('pageRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'ensurePagesSlugIntegrityUseCase',
      (container) => new EnsurePagesSlugIntegrityUseCase({
        pageIntegrityService: container.resolve('pageIntegrityService'),
      })
    )
    .registerFactory(
      'ensureStartupSchemaUseCase',
      (container) => new EnsureStartupSchemaUseCase({
        schemaMigrationService: container.resolve('schemaMigrationService'),
      })
    )
    .registerFactory(
      'ensureDefaultCategoryImagesUseCase',
      (container) => new EnsureDefaultCategoryImagesUseCase({
        categoryDefaultsService: container.resolve('categoryDefaultsService'),
      })
    )
    .registerFactory(
      'startCartCleanupUseCase',
      (container) => new StartCartCleanupUseCase({
        cartCleanupService: container.resolve('cartCleanupService'),
      })
    )
    .registerFactory(
      'createPageUseCase',
      (container) => new CreatePageUseCase({
        pageRepository: container.resolve('pageRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'updatePageUseCase',
      (container) => new UpdatePageUseCase({
        pageRepository: container.resolve('pageRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'deletePageUseCase',
      (container) => new DeletePageUseCase({
        pageRepository: container.resolve('pageRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'getSettingsUseCase',
      (container) => new GetSettingsUseCase({
        settingsRepository: container.resolve('settingsRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'saveSettingsUseCase',
      (container) => new SaveSettingsUseCase({
        settingsRepository: container.resolve('settingsRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'listProductsUseCase',
      (container) => new ListProductsUseCase({
        productRepository: container.resolve('productRepository'),
      })
    )
    .registerFactory(
      'createProductUseCase',
      (container) => new CreateProductUseCase({
        productRepository: container.resolve('productRepository'),
        normalizeCustomOptions: container.resolve('normalizeCustomOptions'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'updateProductUseCase',
      (container) => new UpdateProductUseCase({
        productRepository: container.resolve('productRepository'),
        normalizeCustomOptions: container.resolve('normalizeCustomOptions'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'deleteProductUseCase',
      (container) => new DeleteProductUseCase({
        productRepository: container.resolve('productRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'getProductImagesUseCase',
      (container) => new GetProductImagesUseCase({
        productRepository: container.resolve('productRepository'),
      })
    )
    .registerFactory(
      'addProductImageUseCase',
      (container) => new AddProductImageUseCase({
        productRepository: container.resolve('productRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'reorderProductImagesUseCase',
      (container) => new ReorderProductImagesUseCase({
        productRepository: container.resolve('productRepository'),
        cacheService: container.resolve('cacheService'),
      })
    )
    .registerFactory(
      'deleteProductImageUseCase',
      (container) => new DeleteProductImageUseCase({
        productRepository: container.resolve('productRepository'),
        cacheService: container.resolve('cacheService'),
      })
    );
}

module.exports = {
  createContainer,
};
