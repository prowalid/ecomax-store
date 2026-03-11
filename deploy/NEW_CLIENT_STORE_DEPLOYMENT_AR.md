# دليل إنشاء متجر جديد لعميل جديد

هذا الملف مخصص للاستعمال العملي المتكرر عند كل طلب جديد.

## الملفات المطلوبة
انسخ إلى الخادم الجديد:
- [docker-compose.golden-image.registry.yml](/root/express-trade-kit/docker-compose.golden-image.registry.yml)
- [client-release.env.template](/root/express-trade-kit/deploy/client-release.env.template)

## 1. تجهيز الدومين
قبل أي تشغيل:
1. أنشئ `A Record`
2. وجّهه إلى IP الخادم
3. انتظر انتشار الـ DNS

المثال:
- `store-client.com -> SERVER_IP`

## 2. تجهيز ملف البيئة
على الخادم:

```bash
cp deploy/client-release.env.template .env.registry
```

ثم عدّل:
- `APP_DOMAIN`
- `CORS_ORIGINS`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`

مثال:

```env
APP_DOMAIN=store-client.com
CORS_ORIGINS=https://store-client.com
POSTGRES_PASSWORD=strong_db_password_here
JWT_SECRET=very_long_random_secret_here
ETK_API_IMAGE=ghcr.io/walid733/express-trade-kit-api:v1.0.0
ETK_WEB_IMAGE=ghcr.io/walid733/express-trade-kit-web:v1.0.0
```

## 3. تشغيل المتجر
```bash
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml pull
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml up -d
```

## 4. التحقق الأولي
```bash
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml ps
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml logs api --tail=100
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml logs web --tail=100
```

المفروض أن تعمل هذه الروابط:
- `https://store-client.com`
- `https://store-client.com/api/health`
- `https://store-client.com/admin/setup`

## 5. إنشاء أول مدير
على المتصفح:
1. افتح `/admin/setup`
2. أنشئ أول حساب مدير
3. سجّل الدخول

## 6. تسليم المتجر للعميل
بعد الدخول:
1. اضبط اسم المتجر
2. اضبط الشعارين و`favicon`
3. اضبط وصف المتجر و`meta title`
4. أضف المنتجات
5. اختبر الطلب
6. اضبط واتساب وPixel وWebhook إذا لزم

## 7. تحديث المتجر لاحقًا
لتحديث العميل إلى إصدار جديد:
1. غيّر وسم الصور في `.env.registry`
2. ثم نفذ:

```bash
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml pull
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml up -d
```

## 8. rollback
إذا ظهرت مشكلة:
1. أعد وسم الإصدار السابق داخل `.env.registry`
2. ثم شغّل:

```bash
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml up -d
```

## 9. ملاحظات مهمة
- لا تستعمل `latest` للتسليم الرسمي
- استعمل دائمًا وسمًا واضحًا مثل `v1.0.0`
- لا تنقل قاعدة بيانات عميل إلى عميل آخر
- كل عميل يجب أن يبقى على بياناته وvolumes الخاصة به

## 10. النسخة الحالية المعتمدة
- `ghcr.io/walid733/express-trade-kit-api:v1.0.0`
- `ghcr.io/walid733/express-trade-kit-web:v1.0.0`
