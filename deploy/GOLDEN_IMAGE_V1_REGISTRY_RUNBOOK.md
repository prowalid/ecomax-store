# Golden Image V1 Registry Runbook

## الهدف
تحويل المشروع إلى نسخة قابلة للتسليم كصور Docker versioned، ثم تثبيتها على أي خادم عميل مع:
- `https://client-domain.com`
- `https://client-domain.com/api`

بدون الحاجة إلى وجود الكود المصدري كاملًا على خادم العميل.

## الفكرة الصحيحة
النسخة النهائية تتكون من:
- صورة `api`
- صورة `web`
- ملف تشغيل `docker-compose.golden-image.registry.yml`
- ملف بيئة عميل
- قاعدة بيانات جديدة مستقلة لكل عميل

لا يتم تصدير قاعدة بياناتك الحالية مع النسخة.

## الملفات المعتمدة
- [docker-compose.golden-image.registry.yml](/root/express-trade-kit/docker-compose.golden-image.registry.yml)
- [deploy/golden-image.registry.env.example](/root/express-trade-kit/deploy/golden-image.registry.env.example)
- [deploy/client-release.env.template](/root/express-trade-kit/deploy/client-release.env.template)
- [deploy/NEW_CLIENT_STORE_DEPLOYMENT_AR.md](/root/express-trade-kit/deploy/NEW_CLIENT_STORE_DEPLOYMENT_AR.md)
- [deploy/Caddyfile.docker](/root/express-trade-kit/deploy/Caddyfile.docker)
- [server/src/db/init.sql](/root/express-trade-kit/server/src/db/init.sql)

## 1. بناء صور النسخة
من خادم البناء أو جهاز الإصدار:

```bash
docker build -f server/Dockerfile -t ghcr.io/walid733/express-trade-kit-api:v1.0.0 ./server
docker build -f Dockerfile.web -t ghcr.io/walid733/express-trade-kit-web:v1.0.0 .
```

إذا أردت وسمًا إضافيًا للإصدار الحالي:

```bash
docker tag ghcr.io/walid733/express-trade-kit-api:v1.0.0 ghcr.io/walid733/express-trade-kit-api:latest
docker tag ghcr.io/walid733/express-trade-kit-web:v1.0.0 ghcr.io/walid733/express-trade-kit-web:latest
```

## 2. رفع الصور إلى Registry
مثال على `GHCR`:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u walid733 --password-stdin
docker push ghcr.io/walid733/express-trade-kit-api:v1.0.0
docker push ghcr.io/walid733/express-trade-kit-web:v1.0.0
docker push ghcr.io/walid733/express-trade-kit-api:latest
docker push ghcr.io/walid733/express-trade-kit-web:latest
```

يمكنك استعمال Docker Hub أو Private Registry بدل GHCR.

## 3. تجهيز خادم العميل
المطلوب على الخادم:
1. Docker
2. Docker Compose Plugin
3. دومين يشير إلى IP الخادم
4. فتح المنفذين `80` و`443`

## 4. الملفات التي تنقل إلى خادم العميل
يكفي نقل:
- `docker-compose.golden-image.registry.yml`
- `deploy/golden-image.registry.env.example`

ثم إنشاء ملف env خاص بالعميل.

## 5. تجهيز ملف البيئة للعميل
على خادم العميل:

```bash
cp deploy/golden-image.registry.env.example .env.registry
```

ثم عدّل القيم التالية:
- `APP_DOMAIN`
- `CORS_ORIGINS`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `ETK_API_IMAGE`
- `ETK_WEB_IMAGE`
- وأي أسرار تكاملات تحتاجها

مثال:

```env
APP_DOMAIN=store-client.com
CORS_ORIGINS=https://store-client.com
POSTGRES_DB=expresstrade
POSTGRES_USER=etk_user
POSTGRES_PASSWORD=super_strong_db_password
JWT_SECRET=very_long_random_secret_here
ETK_API_IMAGE=ghcr.io/walid733/express-trade-kit-api:v1.0.0
ETK_WEB_IMAGE=ghcr.io/walid733/express-trade-kit-web:v1.0.0
```

## 6. تشغيل النسخة على دومين العميل
على خادم العميل:

```bash
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml pull
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml up -d
```

## 7. كيف يعمل SSL تلقائيًا
خدمة `web` تستعمل `Caddy` عبر [deploy/Caddyfile.docker](/root/express-trade-kit/deploy/Caddyfile.docker).

بمجرد أن:
- يكون `APP_DOMAIN` صحيحًا
- الدومين موجّهًا إلى IP الخادم
- `80/443` مفتوحين

سيقوم `Caddy` بإنشاء وتجديد شهادة SSL تلقائيًا.

## 8. التحقق بعد التشغيل
تحقق من الحاويات:

```bash
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml ps
```

تحقق من اللوجات:

```bash
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml logs api --tail=100
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml logs web --tail=100
```

تحقق من المسارات:
- `https://client-domain.com`
- `https://client-domain.com/api/health`
- `https://client-domain.com/admin/setup`

## 9. أول تشغيل للعميل
- قاعدة البيانات ستكون جديدة
- المتجر سيفتح على setup نظيف
- العميل ينشئ أول حساب مدير
- بعد ذلك يبدأ التخصيص وإضافة المنتجات

## 10. التحديث إلى إصدار جديد
غيّر فقط وسم الصور في `.env.registry`:

```env
ETK_API_IMAGE=ghcr.io/walid733/express-trade-kit-api:v1.0.1
ETK_WEB_IMAGE=ghcr.io/walid733/express-trade-kit-web:v1.0.1
```

ثم:

```bash
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml pull
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml up -d
```

## 11. rollback
ارجع إلى وسم سابق:

```env
ETK_API_IMAGE=ghcr.io/walid733/express-trade-kit-api:v1.0.0
ETK_WEB_IMAGE=ghcr.io/walid733/express-trade-kit-web:v1.0.0
```

ثم:

```bash
docker compose --env-file .env.registry -f docker-compose.golden-image.registry.yml up -d
```

## 12. ماذا يبقى محفوظًا بعد التحديث
لأن البيانات في volumes منفصلة، يبقى محفوظًا:
- قاعدة البيانات
- الصور المرفوعة
- اللوجات
- الشهادات

ولا يتغير إلا التطبيق نفسه.

## 13. ما الذي يجب عدم فعله
- لا ترفع قاعدة بيانات عميل داخل الصورة
- لا تحفظ أسرار العملاء داخل Dockerfile
- لا تعتمد على `latest` وحده في التسليمات الرسمية
- لا تشغّل أكثر من متجر عميل على نفس volumes

## 14. أفضل ممارسة للتسليم
لكل عميل:
1. دومين مستقل
2. ملف env مستقل
3. Volumes مستقلة
4. قاعدة بيانات مستقلة
5. وسوم release واضحة

بهذا تصبح `Golden Image V1` قابلة للتكرار والتسليم بثبات.
