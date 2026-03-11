# Deployment Template Readiness

## الهدف
تجهيز المشروع ليعمل كنموذج قابل للتسليم لعميل مستقل على:
- `https://client-domain.com`
- `https://client-domain.com/api`

## ما تم تجهيزه
- الواجهة تعتمد `/api` افتراضياً بدل ربط ثابت بـ `localhost`
- Vite في التطوير يمرر `/api` و`/uploads` إلى الخادم المحلي
- الخادم يدعم `trust proxy` للنشر خلف `Caddy`
- تم توفير أمثلة:
  - `.env.example`
  - `server/.env.example`
  - `deploy/Caddyfile.example`
  - `deploy/systemd/express-trade-kit-api.service`

## بنية النشر المقترحة
- `Caddy` أمام التطبيق
- ملفات الواجهة من `dist`
- API داخلي على `127.0.0.1:3001`
- قاعدة البيانات محلية أو خاصة وغير مكشوفة للعامة
- المتجر والـ API على نفس الدومين عبر `/api`

## خطوات النشر المختصرة لكل عميل
1. إنشاء نسخة مستقلة من المشروع
2. إنشاء قاعدة بيانات مستقلة
3. نسخ `.env.example` و`server/.env.example` وضبط القيم
4. ضبط `CORS_ORIGINS=https://client-domain.com`
5. ضبط `JWT_SECRET` وقيم قاعدة البيانات والأسرار الخارجية
6. تثبيت الاعتمادات وبناء الواجهة: `npm install && npm run build`
7. وضع ملفات المشروع في مسار النشر مثل `/var/www/express-trade-kit/current`
8. نسخ ملف `deploy/systemd/express-trade-kit-api.service` وتفعيل الخدمة
9. نسخ `deploy/Caddyfile.example` وتعديل الدومين ثم تفعيل Caddy
10. ربط `A record` للدومين بالسيرفر
11. التحقق من صدور شهادة `SSL` تلقائياً
12. دخول العميل إلى `AdminSetup`

## Checklist نجاح النشر
- `DNS` يشير إلى السيرفر الصحيح
- `https://client-domain.com` يفتح الواجهة
- `https://client-domain.com/api/health` يرجع `status: ok`
- واجهة الأدمن تفتح
- `AdminSetup` يظهر إذا لم يوجد مدير
- رفع الصور يعمل عبر `/upload`
- الطلبات تعمل عبر `/api/orders`
- لا يوجد أي اعتماد تشغيلي على `localhost` في الواجهة
- قاعدة البيانات غير مكشوفة للعامة
- المنفذان العامان الوحيدان هما `80` و`443`

## ملاحظات مهمة
- لا تفتح منفذ PostgreSQL للعامة
- لا تحفظ أسرار العميل داخل الواجهة
- `SSL` يتم تلقائياً عبر `Caddy` بعد ربط الدومين بشكل صحيح
- إذا احتجت `api.client-domain.com` لاحقاً يمكن تعديل `Caddyfile` بسهولة
- في التطوير المحلي تعمل الواجهة مع `/api` عبر Vite proxy

## الملفات المرجعية لهذا المسار
- `/.env.example`
- `/server/.env.example`
- `/deploy/Caddyfile.example`
- `/deploy/systemd/express-trade-kit-api.service`
