# خطة موازية لتحسين SEO و Discovery

هذه الوثيقة بدأت كخطة تنفيذية موازية، ثم أصبحت مرجعًا مختصرًا لما أُنجز فعليًا في مسار:

- `GPT`
- `Claude`

الهدف منها الآن هو توثيق ما أُغلق من فجوات `SEO` و`Discovery` بدون تعارض في الملفات أو المسؤوليات.

---

## 1. المبادئ العامة

هذه الخطة مبنية على 3 قواعد:

1. لا نعيد هيكلة المشروع من الصفر
2. نغلق الفجوات الأعلى أثرًا على البيع وSEO أولًا
3. نقسم العمل بحيث يكون لكل طرف نطاق ملفات مختلف قدر الإمكان

---

## 2. الأولويات المستخرجة من الفحص

### 2.1 أولوية حرجة

- `Product slugs` بدل UUID-only links
- `lang="ar"` و`dir="rtl"` على مستوى HTML
- `dynamic meta tags` لكل:
  - الصفحة الرئيسية
  - صفحات التصنيفات
  - صفحات المنتجات
  - صفحات المحتوى

### 2.2 أولوية مهمة

- `server-side pagination`
  - products
  - orders
  - customers
- `search debounce`
- تحسين `SEO/discovery URLs`

### 2.3 أولوية تحسين

- `Skeleton loading`
- `og:image` ديناميكية
- تحسين تجربة نتائج البحث والتصنيفات

---

## 3. التقسيم بين GPT و Claude

التقسيم هنا مقصود لتقليل التعارض:

- `GPT` يأخذ المسار الذي يلمس الخادم + عقد البيانات + routing التجاري
- `Claude` يأخذ المسار الذي يلمس الواجهة + metadata presentation + loading UX

---

## 4. مهام GPT

### 4.1 Product Slugs

المطلوب:

- إضافة `slug` للمنتجات على مستوى قاعدة البيانات إذا لم تكن موجودة
- توليد slug تلقائي عند إنشاء المنتج
- تحديث المنتج بحيث يحدّث slug عند الحاجة وفق سياسة واضحة
- دعم جلب المنتج بالـ slug بجانب `id` خلال فترة انتقالية آمنة
- تحويل روابط المنتجات من:
  - `/product/:id`
  - إلى:
  - `/product/:slug`

الملفات المتوقعة:

- `server/src/db/*`
- `server/src/domain/entities/Product.js`
- `server/src/application/use-cases/products/*`
- `server/src/infrastructure/repositories/PgProductRepository.js`
- `server/src/presentation/controllers/ProductsController.js`
- `src/hooks/useProducts.ts`
- `src/pages/store/ProductPage.tsx`
- `src/components/store/ProductCard.tsx`
- `src/App.tsx`

معايير القبول:

- كل منتج جديد له `slug`
- الروابط الجديدة قابلة للقراءة
- الروابط القديمة لا تكسر المتجر مباشرة إذا كان هناك انتقال مرحلي
- صفحة المنتج تعمل بالـ slug

### 4.2 Server-side Pagination

المطلوب:

- إضافة pagination فعلية إلى:
  - `GET /api/products`
  - `GET /api/orders`
  - `GET /api/customers`
- دعم:
  - `page`
  - `limit`
  - وإرجاع metadata مثل:
    - `page`
    - `limit`
    - `total`
    - `totalPages`
- عدم كسر الاستعمال الحالي دفعة واحدة
- إذا احتجنا مرحلة توافق:
  - يمكن إرجاع `{ items, pagination }`
  - مع تحديث المستهلكين المرتبطين

الملفات المتوقعة:

- `server/src/application/use-cases/*`
- `server/src/infrastructure/repositories/*`
- `server/src/presentation/controllers/*`
- `server/src/presentation/openapi/openapi.json` إذا لزم

معايير القبول:

- لا تعود endpoints تعيد كل البيانات دفعة واحدة
- دعم واضح للفرز والفلترة مع pagination
- اختبارات integration تغطي الشكل الجديد

### 4.3 تحسين عقد البحث والاكتشاف

المطلوب:

- تثبيت عقد API الحالي للاكتشاف:
  - `search`
  - `category_id`
  - `sort`
  - `in_stock`
  - `on_sale`
- ضمان أن pagination تعمل معها معًا
- مراجعة cache keys حتى تبقى صحيحة مع query params

معايير القبول:

- لا يوجد خلط بين نتائج الصفحات المختلفة
- الكاش تبقى صحيحة حسب query

---

## 5. مهام Claude

### 5.1 SEO Presentation Layer

المطلوب:

- تصحيح [index.html](/root/express-trade-kit/index.html)
  - `lang="ar"`
  - `dir="rtl"` إذا كان مناسبًا على هذا المستوى
- تحسين metadata presentation في الواجهة:
  - title
  - description
  - `og:title`
  - `og:description`
  - `og:image`
  - `twitter:title`
  - `twitter:description`
  - `twitter:image`
- جعل metadata ديناميكية حسب:
  - الرئيسية
  - صفحة التصنيف
  - صفحة المنتج
  - الصفحة الديناميكية

نطاق الملفات المتوقع:

- `index.html`
- `src/components/store/StoreLayout.tsx`
- `src/pages/store/ProductPage.tsx`
- `src/pages/store/DynamicPage.tsx`
- أي helpers صغيرة في `src/lib/`

معايير القبول:

- عند الانتقال بين الصفحات تتغير metadata بوضوح
- `og:image` لا تبقى الشعار دائمًا
- الصفحة العربية لا تعلن نفسها إنجليزية

### 5.2 Search UX Polish

المطلوب:

- إضافة `debounce` للبحث في المتجر
- تحسين واجهة البحث بحيث لا تبدو “غريبة” أو أقرب لأداة داخلية
- جعل `/shop` و`/category/...` أوضح بصريًا كصفحات اكتشاف
- تحسين شريط النتائج/الفلاتر دون تغيير API

نطاق الملفات المتوقع:

- `src/pages/store/StorePage.tsx`
- `src/components/store/*`
- `src/hooks/*` إذا احتاج helper صغير

مهم:

- لا يغير مسار الروابط النهائية للمنتج أو الـAPI
- لا يلمس ملفات الخادم

### 5.3 Skeleton Loading

المطلوب:

- إضافة skeletons أنظف لصفحات:
  - `/shop`
  - التصنيفات
  - المنتج إذا أمكن
- الحفاظ على نفس اللغة البصرية الحالية

نطاق الملفات المتوقع:

- `src/pages/store/*`
- `src/components/store/*`

---

## 6. حدود عدم التعارض

### 6.1 يملكها GPT فقط

- كل ما تحت:
  - `server/src/db`
  - `server/src/application`
  - `server/src/infrastructure/repositories`
  - `server/src/presentation/controllers`
- routing المرتبطة بعقد الـ slug أو pagination

### 6.2 يملكها Claude فقط

- `index.html`
- metadata UI logic
- skeletons
- debounce
- polish لواجهة الاكتشاف

### 6.3 مناطق مشتركة تحتاج انتباهًا

هذه الملفات قد تتأثر من الطرفين، لذلك يجب على `Claude` تجنب تعديلها إلا إذا كان التغيير presentation-only:

- `src/pages/store/StorePage.tsx`
- `src/pages/store/ProductPage.tsx`
- `src/App.tsx`

القاعدة:

- `GPT` يغير behavior التجاري والروابط والعقد
- `Claude` يغير العرض والميتا والـUX فقط

---

## 7. تعريف النجاح

اعتُبرت هذه الدفعة ناجحة بعد تحقق الآتي فعليًا:

- المنتج صار له رابط readable
- صفحات المنتج والتصنيف أصبحت أنظف للسيو
- metadata أصبحت تتغير حسب الصفحة
- البحث لم يعد يعمل على كل ضغطة مباشرة بدون تهدئة
- `/api/products` لم تعد تعيد كل المنتجات دفعة واحدة في مسار الاكتشاف الجديد
- قابلية التوسع تحسنت بدون كسر المتجر الحالي

---

## 8. ما أُنجز فعليًا

### 8.1 مسار GPT

تم إغلاق الآتي فعليًا:

- `product slug` للمنتجات
- دعم الروابط المقروءة للمنتج بدل الاعتماد على `UUID` فقط
- التحول إلى:
  - `/product/:slug`
- توافق انتقالي مع الروابط القديمة قبل التحويل إلى الرابط الصحيح
- `server-side pagination` في:
  - المنتجات
  - الطلبات
  - الزبائن
- تثبيت عقد الاكتشاف للمنتجات مع:
  - `search`
  - `category`
  - `sort`
  - `in_stock`
  - `on_sale`
- تحسين `Search / Discovery` على مستوى العقد الخلفية والـrouting التجاري

### 8.2 مسار Claude

تم إغلاق الآتي فعليًا:

- `lang="ar"` و`dir="rtl"` على مستوى العرض
- `dynamic metadata` للصفحات الأساسية
- `og:image` و`twitter:image` بصورة أوضح من الحالة السابقة
- `search debounce`
- `skeleton loading`
- تحسين واجهة `/shop` و`/category/...`
- تحسينات presentation إضافية في:
  - واجهة الاكتشاف
  - محرر المحتوى
  - هدوء التفاعل البصري

### 8.3 ما أصبح موجودًا على مستوى المنتج

بعد هذه الدفعة أصبح المتجر يملك فعليًا:

- روابط منتجات أوضح وقابلة للمشاركة
- اكتشاف منتجات أنضج:
  - بحث
  - تصنيف
  - فرز
  - فلاتر
- صفحات كتالوج أنظف للسيو من قبل
- metadata أفضل للمنتجات والصفحات
- قابلية توسع أعلى في:
  - المنتجات
  - الطلبات
  - الزبائن

### 8.4 ما بقي لاحقًا خارج هذه الدفعة

المتبقي المهم لاحقًا لم يعد تأسيسيًا، بل تطويرًا إضافيًا مثل:

- SEO أعمق إن أردنا معاينات اجتماعية أقوى أو SSR لاحقًا
- `search / discovery` v3
- `promotions / discounts`
- تحسينات إضافية في صفحات الهبوط والنمو

---

## 9. الحالة الحالية

تعتبر هذه الخطة الآن:

- `منجزة عمليًا`
- ومتحولة من plan execution إلى reference archive

وقد طُبّقت نتائجها على بيئة التجربة `stepdz-test` ضمن دفعات متتابعة قبل الانتقال إلى مرحلة التنظيم النهائي والرفع الرسمي.
