# خطة العمل المتوازي لتقوية المتجر

هذه الوثيقة تقسم الأعمال الحالية إلى مسارين متوازيين واضحين حتى يتم التنفيذ بالتزامن بدون تعارض في الملفات أو المسؤوليات.

الهدف منها:

- تسريع التنفيذ
- منع التضارب بين التعديلات
- توضيح الملكية لكل جزء
- إعطاء الوكيل الآخر ملفًا واحدًا واضحًا للعمل منه

---

## 1. الهدف الحالي

المرحلة الحالية ليست إعادة هيكلة معمارية جديدة، بل **تقوية موثوقية المتجر نفسه** قبل رفع الثقة التجارية به أكثر.

الأعمال ذات الأولوية الآن هي:

1. `Database constraints`
2. `Performance indexes`
3. `DB pool tuning`
4. `Security hardening`
5. `Load testing`

---

## 2. مبدأ التقسيم

تم تقسيم الأعمال بحيث:

- مسار `gpt` يعمل على **الخادم وقاعدة البيانات**
- مسار `gemini` يعمل على **الاختبار والقياس والتوثيق التشغيلي**

وبذلك لا يحدث تعارض مباشر في نفس الملفات.

---

## 3. تقسيم العمل

### 3.1 مسار `gpt`

هذا الجزء أملكه أنا: `gpt`

نطاق العمل:

- تقوية قاعدة البيانات
- إضافة القيود
- إضافة الفهارس
- تحسين إعدادات pool
- تشديد الأمان في الخادم

الملفات المسموح لي بالعمل عليها:

- [init.sql](/root/express-trade-kit/server/src/db/init.sql)
- [server/src/db/migrations](/root/express-trade-kit/server/src/db/migrations)
- [db.js](/root/express-trade-kit/server/src/config/db.js)
- [app.js](/root/express-trade-kit/server/src/app.js)
- [server/src/presentation/middleware/security.js](/root/express-trade-kit/server/src/presentation/middleware/security.js)
- أي اختبارات خادم مرتبطة مباشرة بهذه التعديلات داخل [src/test/server](/root/express-trade-kit/src/test/server)

المهام الدقيقة:

1. إضافة `CHECK constraints` مناسبة للجداول:
   - `products`
   - `orders`
   - `order_items`
   - `cart_items`
   - `customers`
2. إضافة `indexes` محسنة للمسارات الأكثر استخدامًا:
   - المنتجات
   - الطلبات
   - العملاء
   - الصفحات
3. تحسين [db.js](/root/express-trade-kit/server/src/config/db.js) بإعدادات pool عملية:
   - `max`
   - `idleTimeoutMillis`
   - `connectionTimeoutMillis`
   - إعداد SSL الإنتاجي إذا لزم
4. تحسين الأمان في [app.js](/root/express-trade-kit/server/src/app.js):
   - تفعيل `CSP` بشكل مناسب بدل تعطيلها كليًا
   - الحفاظ على توافق Facebook Pixel والرفع والصور
5. إضافة أو تعديل اختبارات تؤكد:
   - أن القيود لا تكسر التدفقات الصحيحة
   - وأن بيانات فاسدة تُرفض عند الحاجة

### 3.2 مسار `gemini`

هذا الجزء مخصص للوكيل الآخر: `gemini`

نطاق العمل:

- قياس الأداء
- اختبار الضغط
- تحسين التنبيهات
- توثيق التحقق التشغيلي

الملفات المسموح له بالعمل عليها:

- [deploy/monitoring/alerts.yml](/root/express-trade-kit/deploy/monitoring/alerts.yml)
- [deploy/monitoring](/root/express-trade-kit/deploy/monitoring)
- [deploy/GRAFANA_AR.md](/root/express-trade-kit/deploy/monitoring/GRAFANA_AR.md)
- [deploy/CLOUD_DEPLOYMENT_CHECKLIST_AR.md](/root/express-trade-kit/deploy/CLOUD_DEPLOYMENT_CHECKLIST_AR.md)
- ملفات جديدة داخل:
  - [tests/load](/root/express-trade-kit/tests/load)
  - أو [src/test/load](/root/express-trade-kit/src/test/load)
- أي توثيق مرتبط باختبارات الضغط والتحقق التشغيلي

المهام الدقيقة:

1. إضافة `load test` واقعي للمسارات التالية:
   - `GET /api/products`
   - `GET /api/categories`
   - `POST /api/orders`
2. اختيار أداة مناسبة مثل:
   - `artillery`
   - أو أي أداة بسيطة لا تعقد المشروع
3. إعداد ملفات load test قابلة للتشغيل محليًا وواضحة
4. تحسين [alerts.yml](/root/express-trade-kit/deploy/monitoring/alerts.yml) فقط ضمن المقاييس الموجودة حاليًا فعلًا
   - ارتفاع 5xx
   - ارتفاع latency
   - كثرة الطلبات المتزامنة
   - backlog للـ queue إذا كانت metric موجودة
5. إضافة توثيق واضح يشرح:
   - كيف يتم تشغيل load test
   - ما هي الحدود المقبولة
   - ما الذي نراقبه أثناء الاختبار

---

## 4. حدود عدم التعارض

حتى لا يحدث تضارب:

### `gpt` لا يلمس

- [deploy/monitoring/alerts.yml](/root/express-trade-kit/deploy/monitoring/alerts.yml)
- [deploy/monitoring](/root/express-trade-kit/deploy/monitoring)
- أي ملفات `load testing`

### `gemini` لا يلمس

- [server/src/db/init.sql](/root/express-trade-kit/server/src/db/init.sql)
- [server/src/db/migrations](/root/express-trade-kit/server/src/db/migrations)
- [server/src/config/db.js](/root/express-trade-kit/server/src/config/db.js)
- [server/src/app.js](/root/express-trade-kit/server/src/app.js)
- أي repositories أو use cases أو middleware خادم إلا إذا كان التعديل توثيقيًا بحتًا خارج هذا النطاق

---

## 5. ترتيب الدمج

ترتيب الدمج الصحيح بعد التنفيذ:

1. دمج مسار `gpt`
2. تشغيل اختبارات الخادم
3. دمج مسار `gemini`
4. تشغيل:
   - `npm test`
   - `npm run typecheck`
   - أي load test تمت إضافته

---

## 6. تعريف النجاح

نعتبر هذه الدفعة ناجحة إذا تحقق التالي:

- قاعدة البيانات أصبحت ترفض القيم التجارية الفاسدة الأساسية
- الاستعلامات الشائعة أصبحت مدعومة بفهرسة أفضل
- إعدادات الاتصال بقاعدة البيانات أصبحت أنضج
- الأمان في `helmet/CSP` صار أقوى بدون كسر الواجهة
- لدينا load test قابل للتشغيل
- لدينا alerts أوضح للمشاكل الحقيقية

---

## 7. المهمة الجاهزة لتسليم `gemini`

يمكن تسليم الوكيل الآخر هذه التعليمات مباشرة:

```text
اعمل فقط على المسار المخصص لك في الملف:
docs/PARALLEL_STORE_HARDENING_PLAN_AR.md

أنت تملك مسار gemini فقط.

المطلوب منك:
1. إضافة load test عملي للمسارات:
   - GET /api/products
   - GET /api/categories
   - POST /api/orders
2. تحسين deploy/monitoring/alerts.yml فقط ضمن المقاييس الموجودة فعليًا في المشروع.
3. إضافة توثيق واضح لتشغيل load test وقراءة النتائج.

مهم جدًا:
- لا تعدل ملفات قاعدة البيانات أو app.js أو db.js
- لا تلمس server/src/db/*
- لا تلمس server/src/config/db.js
- لا تلمس server/src/app.js
- لا تعكس تغييرات غيرك
- اذكر الملفات التي عدلتها في النهاية
```

---

## 8. اسم الملف المعتمد

اسم الملف الذي يجب تقديمه للوكيل الآخر هو:

`docs/PARALLEL_STORE_HARDENING_PLAN_AR.md`
