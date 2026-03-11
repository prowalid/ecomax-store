# Golden Image V1 Runbook

## الهدف
تشغيل نسخة مستقلة بالكامل من المشروع لعميل واحد على:
- `https://client-domain.com`
- `https://client-domain.com/api`

باستخدام:
- `Docker Compose`
- `PostgreSQL`
- `Express API`
- `Caddy` مع `SSL` تلقائي

## محتوى V1
- متجر كامل + لوحة تحكم
- قاعدة بيانات جديدة مستقلة
- First run عبر `Admin Setup`
- `/api` على نفس الدومين
- رفع صور
- Logging
- Volumes للبيانات الأساسية

## ما يجب توفره قبل التشغيل
1. سيرفر Linux مع Docker و Docker Compose plugin
2. دومين يشير إلى IP السيرفر
3. المنفذان `80/443` مفتوحان
4. ملف بيئة مبني من:
   - `deploy/golden-image.env.example`

## خطوات التشغيل
1. انسخ ملف البيئة:
```bash
cp deploy/golden-image.env.example .env.golden
```

2. عدّل القيم:
- `APP_DOMAIN`
- `CORS_ORIGINS`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- أي أسرار تكاملات تحتاجها

3. شغّل الستاك:
```bash
docker compose --env-file .env.golden -f docker-compose.golden-image.yml up -d --build
```

4. تحقق من الصحة:
```bash
docker compose --env-file .env.golden -f docker-compose.golden-image.yml ps
docker compose --env-file .env.golden -f docker-compose.golden-image.yml logs api --tail=100
```

5. افتح:
- `https://client-domain.com`
- `https://client-domain.com/api/health`
- `https://client-domain.com/admin/setup`

## أول تشغيل
- بما أن قاعدة البيانات جديدة، فلن يوجد أي مدير
- أول دخول إلى `/admin` يجب أن يقود إلى `/admin/setup`
- بعد إنشاء المدير الأول ينغلق مسار التسجيل ويبدأ المتجر العمل كنسخة عميل مستقلة

## ما يتم حفظه في Volumes
- `postgres_data`: قاعدة البيانات
- `api_uploads`: الصور المرفوعة
- `api_logs`: لوجات الخادم
- `api_backups`: نسخ احتياطية
- `caddy_data` و`caddy_config`: شهادات Caddy وإعداداته

## التحقق النهائي
- الواجهة تفتح عبر `HTTPS`
- `/api/health` يرجع `status: ok`
- `Admin Setup` يعمل
- رفع الصور يعمل
- إنشاء طلب يعمل
- واتساب/Pixel/Webhook تعمل بعد ضبط أسرارها

## rollback
```bash
docker compose --env-file .env.golden -f docker-compose.golden-image.yml down
```

لا تحذف الـ volumes إلا إذا كنت تريد تهيئة جديدة كلياً.

## إعادة تهيئة كاملة
```bash
docker compose --env-file .env.golden -f docker-compose.golden-image.yml down -v
```

هذا يمسح:
- قاعدة البيانات
- الصور
- الشهادات
- اللوجات

استخدمه فقط لبيئة تجريبية جديدة.
