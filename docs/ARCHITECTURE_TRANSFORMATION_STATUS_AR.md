# حالة التحول المعماري للمشروع

هذا الملف يوثق الحالة الفعلية الحالية للبنية المعمارية في مشروع `Express Trade Kit` بعد تنفيذ التحول التدريجي إلى بنية أوضح وأقرب إلى `Clean Architecture` بشكل عملي.

## 1. الخلاصة التنفيذية

المشروع لم يعد يعتمد على النمط القديم:

- `routes -> controllers -> SQL مباشر + utils`

بل أصبح أقرب فعليًا إلى:

- `presentation`
- `application`
- `domain`
- `infrastructure`

ومع هذا التحول أصبحت المنظومة تشمل أيضًا:

- `Redis`
- `Queue workers`
- `Storage abstraction`
- `Metrics`
- `OpenAPI`
- `Structured logging`
- `Idempotency`
- `Health / Live / Ready`
- `Backup / Restore / Verify`
- `Secrets rotation`
- `Runtime validation`

## 2. مخطط البنية الحالية

هذا القسم يصف البنية الحالية للمشروع كما هي مطبقة فعليًا الآن، وليس كتصور مستقبلي فقط.

### 2.1 الطبقات الرئيسية

الخادم يعمل الآن وفق الطبقات التالية:

1. `presentation`
2. `application`
3. `domain`
4. `infrastructure`

والتدفق الأساسي للطلب أصبح:

```text
HTTP Request
-> presentation/routes
-> presentation/middleware + validators
-> presentation/controllers
-> application/use-cases
-> domain (entities / value objects / rules / contracts)
-> infrastructure (repositories / cache / queue / storage / external services)
-> DTO
-> HTTP Response
```

### 2.2 بنية طبقة HTTP

طبقة HTTP لم تعد موزعة بين جذور قديمة وطبقات انتقالية، بل أصبحت متمركزة فعليًا داخل:

- [server/src/presentation/routes](/root/express-trade-kit/server/src/presentation/routes)
- [server/src/presentation/controllers](/root/express-trade-kit/server/src/presentation/controllers)
- [server/src/presentation/middleware](/root/express-trade-kit/server/src/presentation/middleware)
- [server/src/presentation/validators](/root/express-trade-kit/server/src/presentation/validators)

وهذا يشمل الآن:

- `auth`
- `products`
- `orders`
- `openapi`
- `health`
- `metrics`
- `categories`
- `pages`
- `customers`
- `cart`
- `settings`
- `upload`
- `integrations`
- `analytics`
- `blacklist`

### 2.3 بنية طبقة التطبيق

طبقة `application` تحتوي حاليًا على:

- `use cases` لكل المجالات الأساسية
- `DTOs` لتحويل الخرج من الدومين/البنية التحتية إلى شكل HTTP مناسب
- `application services` مثل `CacheService`, `EventBus`, `ShippingSettingsService`
- `event handlers` المرتبطة بأحداث الطلبات

وظيفتها الأساسية هي:

- تنسيق خطوات التنفيذ
- استدعاء الدومين والبنية التحتية
- نشر الأحداث
- عزل منطق الأعمال عن HTTP

### 2.4 بنية طبقة الدومين

طبقة `domain` تحتوي حاليًا على:

- `entities`
- `value objects`
- `domain errors`
- `repository contracts`
- `domain events`
- `business rules`

وهي تمثل القواعد المركزية للمشروع، خصوصًا في:

- الطلبات
- المنتجات
- العملاء
- الصفحات
- التصنيفات
- المستخدمين والمصادقة

### 2.5 بنية طبقة البنية التحتية

طبقة `infrastructure` تحتوي حاليًا على:

- `Pg*Repository` للوصول إلى PostgreSQL
- `RedisCache` و`InMemoryCache`
- `BullMQQueueManager` و`InlineQueueManager`
- `queue workers`
- `LocalFileStorage`
- خدمات التكامل الخارجي
- خدمات startup / cleanup / migration / metrics

### 2.6 بنية التشغيل الحالية

بنية التشغيل الفعلية حاليًا هي:

```text
Internet
-> Edge Proxy / Caddy
-> Web Container
-> API Container
-> PostgreSQL
-> Redis
```

والخادم نفسه يعتمد تشغيليًا على:

- `Redis` للكاش والـ queue
- `BullMQ` كـ queue driver في `stepdz`
- `Prometheus-style metrics`
- `health/live/ready/version`
- `backup / restore / verify`

### 2.7 خلاصة بنيوية مختصرة

يمكن وصف المشروع الآن على المستوى البنيوي بهذه الصيغة:

```text
presentation = HTTP boundary
application = orchestration
domain = business model and rules
infrastructure = technical implementations
```

## 3. ما الذي اكتمل

### 3.1 طبقة `Application`

منطق الأعمال الأساسي انتقل إلى `use cases` فعلية داخل:

- [server/src/application/use-cases](/root/express-trade-kit/server/src/application/use-cases)

والمسارات الأساسية التي تعمل الآن عبر هذه الطبقة تشمل:

- `orders`
- `products`
- `settings`
- `pages`
- `categories`
- `customers`
- `cart`
- `auth`
- `integrations`
- `shipping`
- `upload`
- `analytics`
- `blacklist`

### 3.2 طبقة `Infrastructure`

الوصول إلى التخزين والخدمات الخارجية أصبح معزولًا داخل:

- [server/src/infrastructure/repositories](/root/express-trade-kit/server/src/infrastructure/repositories)
- [server/src/infrastructure/services](/root/express-trade-kit/server/src/infrastructure/services)
- [server/src/infrastructure/cache](/root/express-trade-kit/server/src/infrastructure/cache)
- [server/src/infrastructure/queue](/root/express-trade-kit/server/src/infrastructure/queue)
- [server/src/infrastructure/storage](/root/express-trade-kit/server/src/infrastructure/storage)

وهذا يشمل:

- PostgreSQL repositories
- Redis cache
- queue managers and workers
- file storage abstraction
- schema migrations with `up/down`
- database safety constraints and performance indexes
- webhook / WhatsApp services
- cleanup / migration / startup services

### 3.3 طبقة `Domain`

طبقة الدومين اكتملت عمليًا للمجالات الأساسية.

#### Value Objects

- [Money.js](/root/express-trade-kit/server/src/domain/value-objects/Money.js)
- [Phone.js](/root/express-trade-kit/server/src/domain/value-objects/Phone.js)
- [Slug.js](/root/express-trade-kit/server/src/domain/value-objects/Slug.js)
- [Password.js](/root/express-trade-kit/server/src/domain/value-objects/Password.js)
- [OrderStatus.js](/root/express-trade-kit/server/src/domain/value-objects/OrderStatus.js)

#### Entities

- [Product.js](/root/express-trade-kit/server/src/domain/entities/Product.js)
- [Order.js](/root/express-trade-kit/server/src/domain/entities/Order.js)
- [OrderItem.js](/root/express-trade-kit/server/src/domain/entities/OrderItem.js)
- [Customer.js](/root/express-trade-kit/server/src/domain/entities/Customer.js)
- [User.js](/root/express-trade-kit/server/src/domain/entities/User.js)
- [Category.js](/root/express-trade-kit/server/src/domain/entities/Category.js)
- [Page.js](/root/express-trade-kit/server/src/domain/entities/Page.js)

#### Domain Errors

داخل:

- [server/src/domain/errors](/root/express-trade-kit/server/src/domain/errors)

#### Repository Contracts

داخل:

- [server/src/domain/repositories](/root/express-trade-kit/server/src/domain/repositories)

## 4. طبقة `Presentation`

طبقة `presentation` لم تعد facade شكلية فقط، بل أصبحت المصدر الفعلي لطبقة HTTP.

### 4.1 Routes + Controllers

المصدر الفعلي الآن داخل:

- [server/src/presentation/routes](/root/express-trade-kit/server/src/presentation/routes)
- [server/src/presentation/controllers](/root/express-trade-kit/server/src/presentation/controllers)

وهذا يشمل فعليًا:

- `openapi`
- `health`
- `metrics`
- `upload`
- `orders`
- `products`
- `auth`
- `settings`
- `pages`
- `categories`
- `customers`
- `cart`
- `integrations`
- `analytics`
- `blacklist`

والجذور القديمة الخاصة بـ `routes / controllers / middleware / validators` لم تعد تحتوي ملفات تشغيلية فعلية، بعد اكتمال نقل المصدر الحقيقي إلى `presentation/*`.

### 4.2 Middleware + Validators

المصدر الفعلي أصبح أيضًا داخل:

- [server/src/presentation/middleware](/root/express-trade-kit/server/src/presentation/middleware)
- [server/src/presentation/validators](/root/express-trade-kit/server/src/presentation/validators)

وهذا يعني أن:

- `auth`
- `rateLimit`
- `security`
- `requestContext`
- `errorHandler`
- `metrics`
- `validate`

وكذلك schemas الخاصة بـ:

- `auth`
- `orders`
- `products`
- `pages`
- `categories`
- `customers`
- `settings`

أصبحت أيضًا ضمن طبقة `presentation` بدل بقائها في الجذر القديم.

بالمعنى العملي:

- [server/src/presentation/routes](/root/express-trade-kit/server/src/presentation/routes)
- [server/src/presentation/controllers](/root/express-trade-kit/server/src/presentation/controllers)
- [server/src/presentation/middleware](/root/express-trade-kit/server/src/presentation/middleware)
- [server/src/presentation/validators](/root/express-trade-kit/server/src/presentation/validators)

هي الآن المصدر الوحيد لطبقة HTTP داخل الخادم.

### 4.3 OpenAPI Contract

أصبحت طبقة `presentation` تحتوي أيضًا على توصيف API معياري يمكن تقديمه للمطورين وأدوات الفحص.

الملفات الأساسية:

- [openapi.json](/root/express-trade-kit/server/src/presentation/openapi/openapi.json)
- [README.md](/root/express-trade-kit/server/src/presentation/openapi/README.md)
- [OpenApiController.js](/root/express-trade-kit/server/src/presentation/controllers/OpenApiController.js)
- [openapi.routes.js](/root/express-trade-kit/server/src/presentation/routes/openapi.routes.js)

الوصول الحالي:

- `/api/openapi.json` للنسخة الخام
- `/api/docs` لواجهة `Swagger UI`

والتغطية الحالية تشمل المسارات الأكثر استقرارًا:

- `health`
- `auth`
- `orders`
- `products`
- `categories`
- `settings`

## 5. الـ Queue والـ Events

تم إدخال `Event Bus` فعلي، ثم تفعيل `queue workers` حقيقية.

الملفات الأساسية:

- [EventBus.js](/root/express-trade-kit/server/src/application/services/EventBus.js)
- [InlineQueueManager.js](/root/express-trade-kit/server/src/infrastructure/queue/InlineQueueManager.js)
- [BullMQQueueManager.js](/root/express-trade-kit/server/src/infrastructure/queue/BullMQQueueManager.js)
- [OrderCreatedWorker.js](/root/express-trade-kit/server/src/infrastructure/queue/workers/OrderCreatedWorker.js)
- [OrderStatusUpdatedWorker.js](/root/express-trade-kit/server/src/infrastructure/queue/workers/OrderStatusUpdatedWorker.js)
- [queue.js](/root/express-trade-kit/server/src/config/queue.js)

الوضع الحالي:

- `inline queue` تعمل افتراضيًا
- `BullMQ` مفعلة على `stepdz`
- أحداث الطلبات الجانبية دخلت هذا المسار

## 6. التخزين والرفع

تم إدخال `storage abstraction` واضحة بدل ربط الرفع والتنظيف مباشرة بالمسارات المحلية.

الملفات الأساسية:

- [storage.js](/root/express-trade-kit/server/src/config/storage.js)
- [LocalFileStorage.js](/root/express-trade-kit/server/src/infrastructure/storage/LocalFileStorage.js)
- [HandleFileUpload.js](/root/express-trade-kit/server/src/application/use-cases/upload/HandleFileUpload.js)
- [UploadCleanupService.js](/root/express-trade-kit/server/src/infrastructure/services/UploadCleanupService.js)

## 7. الكاش والقراءات

تم إدخال طبقة `cache` فعلية مع `Redis` وإبطال صحيح للمفاتيح.

الملفات الأساسية:

- [CacheService.js](/root/express-trade-kit/server/src/application/services/CacheService.js)
- [InMemoryCache.js](/root/express-trade-kit/server/src/infrastructure/cache/InMemoryCache.js)
- [RedisCache.js](/root/express-trade-kit/server/src/infrastructure/cache/RedisCache.js)

كما تم إصلاح مشكلة حقيقية كانت تؤثر على:

- `settings`
- `products`
- `pages`
- `categories`

وكان سببها `prefix invalidation` داخل Redis.

## 8. المراقبة والتشغيل

### 8.1 Health

أصبح لدينا:

- `/api/health`
- `/api/health/live`
- `/api/health/ready`
- `/api/health/version`

مع فحوصات فعلية لـ:

- database
- cache
- queue

### 8.2 Metrics

أصبحت لدينا:

- `/api/metrics`

ومقاييس فعلية لـ:

- HTTP request count
- request latency
- in-flight requests
- published / queued domain events

الملفات الأساسية:

- [metrics.js](/root/express-trade-kit/server/src/config/metrics.js)
- [MetricsService.js](/root/express-trade-kit/server/src/infrastructure/services/MetricsService.js)
- [server/src/presentation/middleware/metrics.js](/root/express-trade-kit/server/src/presentation/middleware/metrics.js)
- [docker-compose.monitoring.yml](/root/express-trade-kit/deploy/docker-compose.monitoring.yml)
- [prometheus.yml](/root/express-trade-kit/deploy/monitoring/prometheus.yml)
- [alerts.yml](/root/express-trade-kit/deploy/monitoring/alerts.yml)

### 8.3 Grafana Dashboards

أصبحت بيئة المراقبة تتضمن أيضًا `Grafana` جاهزة فوق `Prometheus`.

الملفات الأساسية:

- [docker-compose.monitoring.yml](/root/express-trade-kit/deploy/docker-compose.monitoring.yml)
- [GRAFANA_AR.md](/root/express-trade-kit/deploy/monitoring/GRAFANA_AR.md)
- [datasource.yml](/root/express-trade-kit/deploy/monitoring/grafana/provisioning/datasources/datasource.yml)
- [dashboards.yml](/root/express-trade-kit/deploy/monitoring/grafana/provisioning/dashboards/dashboards.yml)
- [api-overview.json](/root/express-trade-kit/deploy/monitoring/grafana/dashboards/api-overview.json)
- [queue-events.json](/root/express-trade-kit/deploy/monitoring/grafana/dashboards/queue-events.json)

والداشبوردات الحالية تراقب:

- HTTP request count
- request latency و`p95`
- in-flight requests
- domain events queued / published
- حالة `up` الخاصة بالـ API

### 8.4 حماية metrics

تم تفعيل حماية `metrics` عبر:

- `METRICS_TOKEN`

وأصبحت `/api/metrics` على `stepdz`:

- `401` بدون token
- `200` مع `Authorization: Bearer <token>`

### 8.5 Logging + Request Context

تم إدخال `structured logging` فعلية مع `requestId` واضح لكل طلب.

الملفات الأساسية:

- [logger.js](/root/express-trade-kit/server/src/utils/logger.js)
- [requestContext.js](/root/express-trade-kit/server/src/presentation/middleware/requestContext.js)
- [requestLogging.js](/root/express-trade-kit/server/src/presentation/middleware/requestLogging.js)

والنتيجة:

- كل طلب HTTP يحمل `x-request-id`
- السجلات أصبحت أسهل تتبعًا داخل التشغيل الفعلي
- الأخطاء والاستجابات المهمة صارت أصلح للمراجعة التشغيلية

### 8.6 Rate Limiting + Idempotency

تم تفعيل `rate limiting` و`idempotency` بشكل عملي على المسارات الحساسة.

الملفات الأساسية:

- [rateLimit.js](/root/express-trade-kit/server/src/presentation/middleware/rateLimit.js)
- [idempotency.js](/root/express-trade-kit/server/src/presentation/middleware/idempotency.js)
- [orders.routes.js](/root/express-trade-kit/server/src/presentation/routes/orders.routes.js)
- [auth.routes.js](/root/express-trade-kit/server/src/presentation/routes/auth.routes.js)

الوضع الحالي:

- `auth login` محمي بمحددات أوضح
- `create order` محمي من إعادة التنفيذ غير المقصود عبر `Idempotency-Key`
- `cart` و`integrations` لديهما مفاتيح `rate limiting` أدق من السابق

### 8.7 Resilience + Audit Trail + Input Sanitization

تمت إضافة طبقة صلابة إضافية للمسارات الإدارية والتكاملات الخارجية.

الملفات الأساسية:

- [CircuitBreaker.js](/root/express-trade-kit/server/src/infrastructure/services/CircuitBreaker.js)
- [OrderWebhookService.js](/root/express-trade-kit/server/src/infrastructure/services/OrderWebhookService.js)
- [WhatsAppMessagingService.js](/root/express-trade-kit/server/src/infrastructure/services/WhatsAppMessagingService.js)
- [AdminAuditService.js](/root/express-trade-kit/server/src/application/services/AdminAuditService.js)
- [PgAdminAuditLogRepository.js](/root/express-trade-kit/server/src/infrastructure/repositories/PgAdminAuditLogRepository.js)
- [004_admin_audit_log.up.sql](/root/express-trade-kit/server/src/db/migrations/004_admin_audit_log.up.sql)
- [sanitize.js](/root/express-trade-kit/server/src/presentation/middleware/sanitize.js)

الوضع الحالي:

- `webhook / WhatsApp` أصبحا أقل قابلية لتعطيل المتجر عند فشل المزود الخارجي
- التعديلات الإدارية الحساسة أصبحت تُسجل داخل `admin_audit_log`
- سجل التدقيق أصبح قابلًا للعرض من الإدارة عبر مسار `analytics`
- نصوص الإدخال القادمة من HTTP تمر الآن عبر طبقة `sanitization` أوضح قبل دخولها إلى منطق الأعمال

## 9. الهاردننغ التشغيلي

تم تقوية طبقة النشر والتشغيل عبر:

- resource limits
- graceful stop
- startup validation
- database pool tuning
- security headers / CSP baseline
- database safety constraints
- performance indexes
- backup / restore / verify scripts
- secrets rotation
- `CI/CD workflows`

الملفات الأساسية:

- [docker-compose.client-stack.yml](/root/express-trade-kit/deploy/docker-compose.client-stack.yml)
- [backup_client_store.sh](/root/express-trade-kit/deploy/scripts/backup_client_store.sh)
- [restore_client_store.sh](/root/express-trade-kit/deploy/scripts/restore_client_store.sh)
- [verify_client_stack.sh](/root/express-trade-kit/deploy/scripts/verify_client_stack.sh)
- [rotate_client_secrets.sh](/root/express-trade-kit/deploy/scripts/rotate_client_secrets.sh)
- [runtime.js](/root/express-trade-kit/server/src/config/runtime.js)
- [db.js](/root/express-trade-kit/server/src/config/db.js)
- [003_store_reliability_hardening.up.sql](/root/express-trade-kit/server/src/db/migrations/003_store_reliability_hardening.up.sql)
- [003_store_reliability_hardening.down.sql](/root/express-trade-kit/server/src/db/migrations/003_store_reliability_hardening.down.sql)
- [SECRETS_AND_OPERATIONS_RUNBOOK_AR.md](/root/express-trade-kit/deploy/SECRETS_AND_OPERATIONS_RUNBOOK_AR.md)
- [ci.yml](/root/express-trade-kit/.github/workflows/ci.yml)
- [cd.yml](/root/express-trade-kit/.github/workflows/cd.yml)

### 9.1 CI/CD

أصبحت هناك طبقتان واضحتان للتشغيل الآلي داخل GitHub Actions:

- `CI`
  - typecheck
  - build
  - tests
  - docker build verification
- `CD`
  - release build
  - push images to `GHCR`
  - optional deploy to `stepdz`
  - readiness verification after deploy

وتم تصميم `CD` بحيث:

- تتحقق من `deploy/releases.json` قبل النشر
- تبني صور `api/web` بالإصدار المحدد
- ترفع `version + latest` إلى `GHCR`
- تحدّث `stepdz` عبر `SSH`
- وتسترجع ملف البيئة تلقائيًا إذا فشل الإقلاع

## 10. ما الذي أُزيل أو نُظّف

تم التخلص من قدر كبير من الملفات القديمة التي كانت تمثل دينًا معماريًا أو طبقات مبهمة، مثل:

- `authCookies`
- `authTokens`
- `authSessions`
- `shippingSettings` القديمة
- `cartCleanup` القديمة
- `categoryDefaults` القديمة
- `pagesIntegrity` القديمة
- `schemaMigrations` القديمة

وتم استبدالها بخدمات أو use cases أو repositories أوضح.

كما تم إنهاء طبقات التوافق القديمة في HTTP نفسها، ولم تعد هناك ملفات فعلية في الجذور القديمة لـ:

- `server/src/routes`
- `server/src/controllers`
- `server/src/middleware`
- `server/src/validators`

## 11. الاختبارات

الحالة الحالية المثبتة:

- `50` ملف اختبار ناجح
- `114` اختبار ناجح

وهذا يشمل:

- `domain`
- `use cases`
- `services`
- `controllers`
- `integration`
- `E2E smoke`
- `load test baseline`
- `queue`
- `metrics`
- `runtime validation`
- `storage`
- `security headers`
- `rate limiting`
- `idempotency`
- `input sanitization`
- `audit trail`
- `resilience for external integrations`

كما تم تثبيت اختبارات `integration` نفسها لتعمل داخل الذاكرة عبر `app.handle()` بدل الاعتماد على `listen()` وفتح منفذ محلي، حتى تبقى مستقرة داخل البيئات المقيدة أيضًا.

كما تمت إضافة اختبارات `E2E` فعلية عبر `Playwright` داخل:

- [src/test/e2e](/root/express-trade-kit/src/test/e2e)

وتغطي حاليًا:

- تحميل الصفحة الرئيسية للمتجر
- فتح صفحة تسجيل دخول الإدارة
- تسجيل الدخول الكامل للإدارة عند توفير `E2E_ADMIN_PHONE` و`E2E_ADMIN_PASSWORD`

## 12. بيئة التجربة `stepdz`

تم تثبيت هذه الحالة فعليًا على:

- `https://stepdz.com`

وتم التحقق من:

- الطلبات
- المصادقة
- المظهر
- الإعدادات
- الصفحات
- التصنيفات
- الكاش
- health
- metrics
- BullMQ workers
- readiness
- secrets-protected metrics

## 13. التقييم الصريح

هل المشروع صار نسخة حرفية من المخطط النظري؟

- لا، ليس حرفيًا 100%

هل أصبح قريبًا جدًا من الروح والبنية المستهدفة؟

- نعم، بدرجة كبيرة ومقنعة عمليًا

والسبب:

- تم تنفيذ الجوهر المعماري الفعلي
- مع التكيف مع المشروع الحالي بدل إعادة كتابته من الصفر

## 14. الوضع الحالي

يمكن وصف المشروع الآن بأنه:

- أقوى بنيويًا
- أقل تشابكًا
- أوضح في المسؤوليات
- قابل للاختبار بدرجة أعلى
- مجهز إنتاجيًا بشكل أفضل
- موثق بعقد API أوضح
- قابل للمراقبة التشغيلية بصورة أعمق
- وقابل للتوسع والصيانة لسنوات بشكل أكثر واقعية من الوضع الأصلي

هذا الملف هو المرجع المختصر للحالة الحالية بعد تنفيذ الجزء الأكبر من التحول المعماري بما يناسب المشروع فعليًا.
