# بنية المتجر كمنتج احترافي

هذه الوثيقة لا تصف بنية مشروع التطوير فقط، بل تصف **بنية المتجر نفسه كمنتج تجاري** بعد اكتمال التحول المعماري الأساسي للمشروع.

الهدف منها هو أن تكون مرجعًا صريحًا لأي:

- وكيل فحص
- مهندس منتج
- مطور واجهات
- مطور خادم
- مالك منتج

حتى تكون الصورة واضحة حول:

- ما هو المتجر الحالي فعليًا
- ما هي وحداته التجارية
- ما الذي يملكه اليوم
- ما الذي ينقصه ليصبح متجرًا احترافيًا جاهزًا للسوق بثقة أعلى
- وكيف يجب أن تتطور بنية الملفات والواجهات والخصائص لاحقًا

---

## 1. تعريف المنتج

المنتج الحالي هو:

- منصة متجر إلكتروني موجهة أساسًا للسوق الجزائري
- تحتوي على:
  - واجهة متجر للعميل النهائي
  - لوحة إدارة للتاجر
  - خادم API خاص بالتجارة والطلبات والإعدادات
  - بنية تشغيل متعددة المتاجر

المنتج ليس مجرد `Storefront` فقط، بل هو:

```text
Storefront + Merchant Admin + Commerce Core + Growth Integrations + Operations
```

---

## 2. الرؤية الصحيحة للمتجر

المتجر الاحترافي لا يُقيّم فقط على:

- هل الصفحات تعمل؟
- هل CRUD موجود؟

بل على:

- هل العميل يستطيع أن يشتري بسهولة؟
- هل التاجر يستطيع أن يدير متجره بدون ارتباك؟
- هل العمليات التجارية موثوقة؟
- هل النمو التسويقي مدعوم؟
- هل الأعطال قابلة للملاحظة والاسترداد؟

بالتالي البنية الصحيحة للمتجر يجب أن تبنى على 5 محاور:

1. `Customer Experience`
2. `Merchant Experience`
3. `Commerce Reliability`
4. `Growth Readiness`
5. `Operational Trust`

---

## 3. الطبقات الوظيفية للمتجر

### 3.1 واجهة العميل `Storefront`

هذه هي الطبقة التي يراها الزبون النهائي، وتشمل:

- الصفحة الرئيسية
- صفحات المنتجات
- صفحات التصنيفات
- صفحات المحتوى الثابت
- السلة
- صفحة الطلب / checkout
- رسائل ما بعد الطلب

الهدف من هذه الطبقة:

- تحويل الزيارة إلى طلب
- بناء الثقة
- تسهيل التصفح
- تسريع اتخاذ القرار

### 3.2 لوحة التاجر `Merchant Admin`

هذه هي الطبقة التي يستخدمها صاحب المتجر أو المدير، وتشمل:

- Dashboard
- Orders
- Products
- Categories
- Customers
- Pages
- Appearance
- Marketing
- Shipping
- Settings
- Security
- Analytics
- Notifications
- Blacklist

الهدف من هذه الطبقة:

- إدارة المتجر يوميًا
- تقليل الاحتكاك الإداري
- تسريع إنجاز الأعمال المتكررة
- تقديم صورة واضحة عن وضع المتجر

### 3.3 قلب التجارة `Commerce Core`

هذه هي الطبقة التي تدير السلوك التجاري نفسه:

- catalog
- pricing
- cart
- checkout
- order creation
- order lifecycle
- stock-sensitive operations
- customer identity
- shipping state

الهدف من هذه الطبقة:

- ضمان صحة التجارة نفسها
- منع الأخطاء التجارية الخطيرة
- حماية الطلب من التكرار أو التناقض

### 3.4 طبقة النمو `Growth Layer`

هذه الطبقة لا تعني “التشغيل الأساسي”، بل تعني القدرة على البيع والنمو:

- Facebook Pixel / CAPI
- WhatsApp notifications
- webhook integrations
- marketing settings
- content landing pages
- campaign support
- future coupon / discount systems
- future upsell / cross-sell

### 3.5 طبقة الثقة التشغيلية `Operations Layer`

هذه الطبقة مسؤولة عن:

- health
- ready/live/version
- metrics
- monitoring
- backups
- restore
- release safety
- secrets
- runtime validation
- auditability المستقبلية

---

## 4. الوحدات التجارية الأساسية للمتجر

### 4.1 الكتالوج `Catalog`

يشمل:

- المنتجات
- التصنيفات
- صور المنتجات
- خيارات المنتجات
- حالة التفعيل
- الأسعار
- السعر قبل الخصم

الملفات الحالية المرتبطة به:

- [Products.tsx](/root/express-trade-kit/src/pages/admin/Products.tsx)
- [Categories.tsx](/root/express-trade-kit/src/pages/admin/Categories.tsx)
- [ProductPage.tsx](/root/express-trade-kit/src/pages/store/ProductPage.tsx)
- [useProducts.ts](/root/express-trade-kit/src/hooks/useProducts.ts)
- [useCategories.ts](/root/express-trade-kit/src/hooks/useCategories.ts)
- [ProductsController.js](/root/express-trade-kit/server/src/presentation/controllers/ProductsController.js)
- [CategoriesController.js](/root/express-trade-kit/server/src/presentation/controllers/CategoriesController.js)
- [CreateProduct.js](/root/express-trade-kit/server/src/application/use-cases/products/CreateProduct.js)
- [UpdateProduct.js](/root/express-trade-kit/server/src/application/use-cases/products/UpdateProduct.js)
- [CreateCategory.js](/root/express-trade-kit/server/src/application/use-cases/categories/CreateCategory.js)

### 4.2 الطلبات `Orders`

يشمل:

- إنشاء الطلب
- عناصر الطلب
- بيانات العميل
- حالات الطلب
- تحديث حالة الطلب
- التتبع الإداري للطلب

الملفات الحالية المرتبطة به:

- [Orders.tsx](/root/express-trade-kit/src/pages/admin/Orders.tsx)
- [useOrders.ts](/root/express-trade-kit/src/hooks/useOrders.ts)
- [CheckoutPage.tsx](/root/express-trade-kit/src/pages/store/CheckoutPage.tsx)
- [OrdersController.js](/root/express-trade-kit/server/src/presentation/controllers/OrdersController.js)
- [CreateOrder.js](/root/express-trade-kit/server/src/application/use-cases/orders/CreateOrder.js)
- [UpdateOrderStatus.js](/root/express-trade-kit/server/src/application/use-cases/orders/UpdateOrderStatus.js)
- [Order.js](/root/express-trade-kit/server/src/domain/entities/Order.js)
- [orderStatusRules.js](/root/express-trade-kit/server/src/domain/orders/orderStatusRules.js)

### 4.3 السلة `Cart`

يشمل:

- إضافة منتج
- تعديل الكمية
- حذف منتج
- جلسة العميل
- استرجاع السلة

الملفات الحالية:

- [useCart.ts](/root/express-trade-kit/src/hooks/useCart.ts)
- [CartDrawer.tsx](/root/express-trade-kit/src/components/store/CartDrawer.tsx)
- [CartController.js](/root/express-trade-kit/server/src/presentation/controllers/CartController.js)
- [AddOrUpdateCartItem.js](/root/express-trade-kit/server/src/application/use-cases/cart/AddOrUpdateCartItem.js)

### 4.4 الهوية والمصادقة `Identity`

يشمل:

- إعداد المدير
- تسجيل الدخول
- الجلسات
- تحديث الملف الشخصي
- كلمة المرور
- المصادقة الثنائية

الملفات الحالية:

- [AdminLogin.tsx](/root/express-trade-kit/src/pages/admin/AdminLogin.tsx)
- [AdminSetup.tsx](/root/express-trade-kit/src/pages/admin/AdminSetup.tsx)
- [useAuth.tsx](/root/express-trade-kit/src/hooks/useAuth.tsx)
- [AuthController.js](/root/express-trade-kit/server/src/presentation/controllers/AuthController.js)
- [Login.js](/root/express-trade-kit/server/src/application/use-cases/auth/Login.js)
- [Register.js](/root/express-trade-kit/server/src/application/use-cases/auth/Register.js)

### 4.5 المحتوى `Content`

يشمل:

- الصفحات الثابتة
- صفحات الهبوط
- header / footer content
- رسائل المتجر العامة

الملفات الحالية:

- [Pages.tsx](/root/express-trade-kit/src/pages/admin/Pages.tsx)
- [DynamicPage.tsx](/root/express-trade-kit/src/pages/store/DynamicPage.tsx)
- [usePages.ts](/root/express-trade-kit/src/hooks/usePages.ts)
- [PagesController.js](/root/express-trade-kit/server/src/presentation/controllers/PagesController.js)

### 4.6 المظهر `Appearance`

يشمل:

- الألوان
- الشرائح
- العناوين
- الصور العامة
- هوية المتجر البصرية

الملفات الحالية:

- [Appearance.tsx](/root/express-trade-kit/src/pages/admin/Appearance.tsx)
- [useAppearanceSettings.ts](/root/express-trade-kit/src/hooks/useAppearanceSettings.ts)
- [storeTheme.ts](/root/express-trade-kit/src/lib/storeTheme.ts)
- [bootstrapAppearance.ts](/root/express-trade-kit/src/lib/bootstrapAppearance.ts)
- [AppearanceCssBridge.tsx](/root/express-trade-kit/src/components/appearance/AppearanceCssBridge.tsx)

### 4.7 التسويق والتتبع `Marketing`

يشمل:

- Facebook Pixel
- CAPI
- webhook
- WhatsApp
- إعدادات التسويق
- أحداث التتبع

الملفات الحالية:

- [Marketing.tsx](/root/express-trade-kit/src/pages/admin/Marketing.tsx)
- [useMarketingSettings.ts](/root/express-trade-kit/src/hooks/useMarketingSettings.ts)
- [facebook-pixel.ts](/root/express-trade-kit/src/lib/facebook-pixel.ts)
- [useTracking.ts](/root/express-trade-kit/src/hooks/useTracking.ts)
- [IntegrationsController.js](/root/express-trade-kit/server/src/presentation/controllers/IntegrationsController.js)
- [SendFacebookCapiEvent.js](/root/express-trade-kit/server/src/application/use-cases/integrations/SendFacebookCapiEvent.js)

### 4.8 الشحن `Shipping`

يشمل:

- إعدادات الشحن
- إنشاء شحنة
- الربط مع مزود الشحن

الملفات الحالية:

- [Shipping.tsx](/root/express-trade-kit/src/pages/admin/Shipping.tsx)
- [ShippingSettingsService.js](/root/express-trade-kit/server/src/application/services/ShippingSettingsService.js)
- [CreateOrderShipment.js](/root/express-trade-kit/server/src/application/use-cases/shipping/CreateOrderShipment.js)
- [yalidineProvider.js](/root/express-trade-kit/server/src/services/shipping/providers/yalidineProvider.js)

---

## 5. بنية الملفات الحالية للمتجر من جهة الواجهة

### 5.1 صفحات العميل

```text
src/pages/store/
  StorePage.tsx
  ProductPage.tsx
  CheckoutPage.tsx
  DynamicPage.tsx
  StoreNotFound.tsx
```

هذه البنية جيدة كبداية، لكنها ما زالت منظمة “حسب الصفحات” أكثر من كونها منظمة “حسب مجالات المنتج”.

### 5.2 صفحات الإدارة

```text
src/pages/admin/
  Dashboard.tsx
  Orders.tsx
  Products.tsx
  Categories.tsx
  Customers.tsx
  Shipping.tsx
  Marketing.tsx
  Analytics.tsx
  Notifications.tsx
  Pages.tsx
  Appearance.tsx
  Security.tsx
  Settings.tsx
  Profile.tsx
  AdminSetup.tsx
  AdminLogin.tsx
  PasswordRecovery.tsx
  Blacklist.tsx
```

هذه تغطي الإدارة الأساسية بشكل جيد جدًا.

### 5.3 مكونات الإدارة

```text
src/components/admin/
  appearance/
  dashboard/
  orders/
  products/
  ...
```

الوضع الحالي:

- يوجد فصل جيد نسبيًا لبعض المجالات
- لكنه غير مكتمل بعد على كل الوحدات
- بعض المناطق ما زالت تعتمد أكثر على صفحات كبيرة بدل وحدات أصغر

### 5.4 Hooks الواجهة

```text
src/hooks/
  useAuth.tsx
  useOrders.ts
  useProducts.ts
  useCategories.ts
  useCart.ts
  usePages.ts
  useCustomers.ts
  useAppearanceSettings.ts
  useMarketingSettings.ts
  useStoreSettings.ts
  useTracking.ts
  useVersionInfo.ts
```

هذه البنية جيدة وظيفيًا، لكن على المدى المتوسط يستحسن أن تتطور إلى بنية feature-based أو domain-oriented.

### 5.5 مكتبات الواجهة

```text
src/lib/
  api.ts
  storeTheme.ts
  facebook-pixel.ts
  whatsapp.ts
  appearanceCache.ts
  bootstrapAppearance.ts
  productOptions.ts
  productDescription.ts
  trackingProfile.ts
```

هذه منطقة حساسة جدًا لأنها غالبًا ستتحول إلى قلب “المنطق المشترك” للمتجر.

---

## 6. بنية الملفات الحالية من جهة الخادم

من منظور المتجر كمنتج، أهم شيء أن الخادم اليوم أصبح مفصولًا بالفعل حسب طبقات واضحة:

```text
server/src/
  presentation/
  application/
  domain/
  infrastructure/
```

وهذا ممتاز كأساس منتجي.

لكن من زاوية “بنية المتجر كمنتج”، يمكن إعادة قراءته بهذه الصورة:

```text
presentation = واجهة API
application = حالات الاستخدام التجارية
domain = القواعد والكيانات التجارية
infrastructure = تنفيذ التخزين، الكاش، الـ queue، والخدمات الخارجية
```

---

## 7. البنية المقترحة التالية للمتجر نفسه

لجعل المتجر احترافيًا أكثر، أفضل تنظيم مستقبلي للواجهة ليس فقط `pages/hooks/components`، بل تنظيم حسب مجالات المنتج:

```text
src/features/
  storefront/
    home/
    product/
    category/
    cart/
    checkout/
    content/
  admin/
    auth/
    dashboard/
    orders/
    catalog/
      products/
      categories/
      images/
    customers/
    content/
      pages/
    appearance/
    marketing/
    shipping/
    settings/
    analytics/
  shared/
    api/
    ui/
    tracking/
    theme/
    utils/
```

هذه ليست ضرورة فورية، لكنها البنية الأنظف عندما نبدأ مرحلة **احتراف المنتج**.

---

## 8. المميزات الموجودة فعليًا اليوم

### 8.1 من جهة العميل

الموجود فعليًا:

- صفحة متجر رئيسية
- صفحة منتج
- سلة
- checkout
- صفحات محتوى ديناميكية
- تصفح التصنيفات
- تتبع أساسي
- ثيمات ومظهر مخصص

### 8.2 من جهة الإدارة

الموجود فعليًا:

- إدارة المنتجات
- إدارة الصور
- إدارة التصنيفات
- إدارة الطلبات
- إدارة الصفحات
- تخصيص المظهر
- إعدادات عامة وتسويقية
- إدارة الأمن والحساب
- تحليلات
- إشعارات وتكاملات

### 8.3 من جهة التجارة

الموجود فعليًا:

- order creation
- order status lifecycle
- cart persistence
- customer creation/update
- product catalog
- category structure
- page publishing

### 8.4 من جهة التشغيل

الموجود فعليًا:

- metrics
- health/live/ready/version
- queue workers
- redis cache
- structured logging
- idempotency
- database safety constraints
- performance indexes
- database pool tuning
- CSP / security headers baseline
- backups / restore / verify
- CI / CD scaffolding
- OpenAPI
- Grafana assets
- load testing baseline

---

## 9. ما الذي يجعل المتجر “احترافيًا” فعلًا

### 9.1 تجربة العميل

المتجر الاحترافي يجب أن يحقق:

- وضوحًا بصريًا عاليًا
- سرعة تحميل
- رحلة شراء قصيرة
- وضوح الثقة
- وضوح السعر والخصم والتوفر
- قابلية استخدام ممتازة على الهاتف

المطلوب تطويره لاحقًا:

- تحسين صفحة المنتج أكثر
- تحسين checkout mobile-first
- توضيح مزايا الشحن والاسترجاع
- تحسين البحث والفلترة
- تحسين تجربة empty states

### 9.2 تجربة التاجر

المتجر الاحترافي يجب أن يجعل التاجر قادرًا على:

- إضافة منتج بسرعة
- رفع صور بسهولة
- تعديل حالة الطلب بسرعة
- فهم الأداء التجاري بسرعة
- عدم فقدان البيانات أو الشك في نجاح الحفظ

المطلوب لاحقًا:

- bulk operations أكثر
- واجهات أوضح للـ inventory
- feedback أوضح في الحفظ
- onboarding داخلي أفضل

### 9.3 الثقة التجارية

المقصود هنا:

- الطلب لا يتكرر بلا قصد
- البيانات لا تضيع
- حالة الطلب لا تصبح متناقضة
- الأسعار لا تنكسر
- الصور لا تتلف
- الجلسات لا تتعطل بسهولة

ما تم تقويته فعليًا في هذه المرحلة:

- `idempotency` في إنشاء الطلب
- معاملات ذرية في مسار الطلب الحرج
- `FOR UPDATE` لحجز المخزون عند إنشاء الطلب
- قيود قاعدة بيانات تمنع جزءًا من البيانات التجارية الفاسدة
- فهارس أفضل للمسارات التجارية الأكثر استخدامًا

### 9.4 الجاهزية للنمو

المقصود هنا:

- حملات تسويقية قابلة للتتبع
- Meta integration موثوقة
- WhatsApp usable
- صفحات هبوط قابلة للبناء
- مستقبل الخصومات والكوبونات حاضر في الخطة

---

## 10. الفجوات التجارية الحالية

رغم أن الوظائف تعمل جيدًا، ما يزال هناك فرق بين:

- “متجر يعمل”
- و“متجر جاهز للسوق بثقة عالية”

الفجوات الأهم حاليًا:

### 10.1 QA تجارية حقيقية

ما نحتاجه:

- التحقق من كل تدفق طلب حقيقي
- التحقق من الحفظ المتكرر
- التحقق من استخدام الإدارة اليومي
- التحقق من بيانات أكبر

### 10.2 Product UX

ما نحتاجه:

- صقل أكثر للواجهة
- تحسين onboarding
- تحسين الرسائل
- تحسين حالات الفشل والنجاح

### 10.3 Catalog at Scale

ما نحتاجه:

- اختبار مع 50-200 منتج
- اختبار مع بيانات صور أكثر
- تقييم أداء الإدارة مع الحجم

ما أصبح موجودًا الآن كخطوة أولى:

- `load test baseline` للمسارات:
  - `GET /api/products`
  - `GET /api/categories`
  - `POST /api/orders`
- alerts أوضح لارتفاع:
  - `5xx`
  - `latency`
  - `in-flight requests`

### 10.4 Search / Discovery

لا يوجد بعد محرك بحث/تصفية احترافي فعلي.

وهذا مهم جدًا تجاريًا.

### 10.5 Promotions / Discounts

هذه طبقة مهمة جدًا تجاريًا ولم تصبح بعد قلبًا متكاملًا في المنتج.

### 10.6 Audit / Merchant Trust

التاجر المحترف يحتاج لاحقًا:

- trace أوضح للتعديلات
- سجل أحداث مهم
- من غيّر ماذا ومتى

### 10.7 ما يزال ناقصًا رغم هذه الدفعة

رغم التحسينات الأخيرة، ما يزال ينقص المتجر لاحقًا:

- `search / discovery` أقوى
- `promotions / discounts` كنواة تجارية كاملة
- `audit trail` للتعديلات الإدارية
- `object storage` بدل الاعتماد المحلي فقط
- `merchant UX` أهدأ وأكثر وضوحًا في العمليات اليومية

---

## 11. تقييم الجاهزية الحالية للمتجر

### 11.1 كمتجر أولي فعلي

التقييم:

- جيد
- قابل للتشغيل
- مناسب لأول إطلاق محدود أو soft launch

### 11.2 كمنتج جاهز للبيع المنظم

التقييم:

- قريب من الجاهزية
- لكنه يحتاج QA تجارية ومنتجية أكثر

### 11.3 كمنتج جاهز للتوسع الواسع

التقييم:

- ليس بعد

والسبب ليس ضعف المعمارية، بل:

- الحاجة إلى نضج أعلى في سلوك المنتج التجاري نفسه

---

## 12. ما الذي يجب تطويره بعد الآن

هذه هي خريطة التطوير القادمة من منظور المنتج:

### 12.1 المرحلة الأولى: Market Validation

الهدف:

- إثبات أن المتجر يعمل كتجربة بيع حقيقية

العمل:

- QA checklist تجارية
- E2E لسيناريوهات الأعمال
- بيانات تجريبية أقرب للواقع
- إصلاح المشاكل السلوكية والـ UX

### 12.2 المرحلة الثانية: Merchant Confidence

الهدف:

- جعل التاجر يثق أن المتجر يحفظ ويعمل كما يتوقع

العمل:

- feedback أوضح
- إدارة منتجات أفضل
- حالات فارغة ورسائل خطأ أفضل
- تقليل التعقيد

### 12.3 المرحلة الثالثة: Growth Readiness

الهدف:

- دعم البيع والنمو التسويقي بشكل أفضل

العمل:

- coupons / discounts
- landing pages أقوى
- better tracking
- conversion support
- recommended products / upsell

### 12.4 المرحلة الرابعة: Scale Readiness

الهدف:

- تحمل حجم أكبر من المنتجات والعملاء

العمل:

- media pipeline أفضل
- object storage
- image optimization
- search
- analytics أعمق

---

## 13. بنية ملفات مقترحة للوصول إلى متجر احترافي

هذه ليست فرضية نظرية، بل بنية مقترحة مستقبلية للوصول إلى مستوى أعلى من الاحترافية:

```text
src/
  features/
    storefront/
      home/
        components/
        hooks/
        api/
        types/
      product/
        components/
        hooks/
        api/
        types/
      cart/
      checkout/
      content/
      search/
    admin/
      auth/
      dashboard/
      orders/
      products/
      categories/
      customers/
      pages/
      appearance/
      marketing/
      shipping/
      settings/
      analytics/
    shared/
      ui/
      api/
      tracking/
      theme/
      utils/
      types/
```

ومقابل ذلك على الخادم:

```text
server/src/
  application/use-cases/
    catalog/
    checkout/
    orders/
    customers/
    content/
    marketing/
    shipping/
    admin/
  domain/
    catalog/
    orders/
    customers/
    pricing/
    promotions/
    shipping/
  infrastructure/
    repositories/
    cache/
    queue/
    storage/
    integrations/
```

---

## 14. ملاحظات فحص مهمة

إذا كان وكيل الفحص يقيم “احترافية المتجر كمنتج”، فعليه النظر إلى:

### 14.1 ما هو جيد اليوم

- فصل معماري قوي
- إدارة واضحة
- متجر عميل فعلي
- تدفقات تجارية أساسية موجودة
- تشغيل ومراقبة قوية نسبيًا
- أداء أفضل من السابق

### 14.2 ما يحتاج إثباتًا عمليًا

- سلامة تدفق الطلب end-to-end
- ثبات UX مع الاستخدام الحقيقي
- سلوك الإدارة مع بيانات أكبر
- استقرار الـ checkout
- تحمل الأخطاء التجارية اليومية

### 14.3 ما يحتاج تطويرًا تجاريًا

- search
- promotions
- merchandising
- merchant onboarding
- content-to-conversion strategy
- richer analytics

---

## 15. الخلاصة النهائية

المشروع اليوم لم يعد فقط “مشروع تطوير مرتب”، بل صار:

- متجرًا فعليًا له واجهة عميل
- ولوحة تاجر
- وقلب تجارة
- وبنية تشغيل محترمة

لكن للوصول إلى **متجر احترافي يثق به السوق**، يجب أن يتحول التركيز من:

- `Architecture correctness`

إلى:

- `Commerce reliability`
- `Merchant confidence`
- `Customer conversion quality`
- `Operational trust`

بالمعنى الصريح:

```text
انتهت تقريبًا مرحلة بناء "مشروع جيد"
وبدأت مرحلة بناء "متجر ممتاز"
```

وهذه الوثيقة هي مرجع هذه المرحلة الجديدة.
