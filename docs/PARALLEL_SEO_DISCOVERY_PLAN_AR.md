# خطة موازية لتحسين SEO و Discovery

هذه الوثيقة تحوّل ملاحظات الفحص الأخيرة إلى مهام تنفيذية عملية ومقسمة بين مسارين متوازيين:

- `GPT`
- `Claude`

الهدف هو تسريع التطوير بدون تعارض في الملفات أو المسؤوليات.

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

## 7. ترتيب التنفيذ

### 7.1 يبدأ GPT بـ

1. `product slug`
2. `product route`
3. `products pagination`
4. ثم `orders/customers pagination`

### 7.2 يبدأ Claude بالتوازي بـ

1. `index.html lang/dir`
2. `dynamic metadata`
3. `search debounce`
4. `skeleton loading`

---

## 8. تعريف النجاح

نعتبر هذه الدفعة ناجحة عندما يتحقق الآتي:

- المنتج له رابط readable
- صفحات المنتج والتصنيف أصبحت أنظف للسيو
- metadata تتغير حسب الصفحة
- البحث لا يعمل على كل ضغطة مباشرة بدون تهدئة
- `/api/products` لا تعيد كل المنتجات دفعة واحدة
- قابلية التوسع تتحسن بدون كسر المتجر الحالي

---

## 9. الرسالة الجاهزة إلى Claude

يمكنك إرسال النص التالي مباشرة إلى الوكيل المساعد:

```text
اعمل فقط على مسار Claude المحدد في:
docs/PARALLEL_SEO_DISCOVERY_PLAN_AR.md

المطلوب منك الآن:

1. إصلاح طبقة SEO presentation:
   - index.html يجب أن يعلن العربية بشكل صحيح
   - metadata ديناميكية للرئيسية، صفحة المنتج، صفحة التصنيف، والصفحات الديناميكية
   - og:image و twitter:image يجب ألا تبقى ثابتة على الشعار دائمًا

2. تحسين Search UX:
   - أضف debounce للبحث
   - حسّن واجهة /shop و /category/... بصريًا بدون تغيير API
   - لا تغيّر العقود الخلفية

3. أضف Skeleton loading أنظف للمتجر

مهم:
- لا تلمس server/src/*
- لا تغيّر pagination أو slugs أو repositories
- لا تعكس تغييرات غيرك
- إذا اضطررت لتعديل StorePage أو ProductPage فليكن فقط على مستوى العرض وmetadata

في النهاية اذكر:
- الملفات التي عدلتها
- ما الذي تحقق
- وما الذي لم تلمسه عمداً
```

---

## 10. ما سأفعله أنا الآن

مسار `GPT` القادم:

1. `product slug`
2. route transition إلى `/product/:slug`
3. `products pagination`
4. ثم تقييم إن كنا نكمل `orders/customers pagination` في نفس الدفعة أو التالية
