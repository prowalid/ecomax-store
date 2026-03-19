# Golden Image V1 Registry Runbook

## الهدف
تحويل المشروع إلى نسخة قابلة للتسليم كصور Docker versioned، ثم تشغيل عدة متاجر عملاء معزولة على نفس السيرفر عبر:
- `GHCR`
- `Edge Proxy` مركزي
- `Client Stack` مستقل لكل عميل

بدون الحاجة إلى إعادة بناء المشروع من المصدر عند كل عميل جديد.

## الفكرة الصحيحة
النسخة النهائية تتكون من:
- صورة `api`
- صورة `web`
- Proxy مركزي واحد فقط على السيرفر
- Stack مستقل لكل عميل
- قاعدة بيانات وvolumes مستقلة لكل متجر

لا يتم تصدير قاعدة بياناتك الحالية مع النسخة.

## الملفات المعتمدة
- [deploy/NEW_CLIENT_STORE_DEPLOYMENT_AR.md](/root/express-trade-kit/deploy/NEW_CLIENT_STORE_DEPLOYMENT_AR.md)
- [deploy/PROJECT_CONTINUITY_AND_RELEASE_FLOW.md](/root/express-trade-kit/deploy/PROJECT_CONTINUITY_AND_RELEASE_FLOW.md)
- [deploy/MULTI_CLIENT_SAME_SERVER_RUNBOOK.md](/root/express-trade-kit/deploy/MULTI_CLIENT_SAME_SERVER_RUNBOOK.md)
- [deploy/docker-compose.edge-proxy.yml](/root/express-trade-kit/deploy/docker-compose.edge-proxy.yml)
- [deploy/docker-compose.client-stack.yml](/root/express-trade-kit/deploy/docker-compose.client-stack.yml)
- [deploy/client-multi.env.template](/root/express-trade-kit/deploy/client-multi.env.template)
- [deploy/scripts/install_edge_proxy.sh](/root/express-trade-kit/deploy/scripts/install_edge_proxy.sh)
- [deploy/scripts/create_client_store.sh](/root/express-trade-kit/deploy/scripts/create_client_store.sh)

## 1. بناء صور النسخة
من خادم البناء أو جهاز الإصدار:

```bash
docker build -f server/Dockerfile -t ghcr.io/prowalid/ecomax-store-api:v1.0.2 ./server
docker build -f Dockerfile.web -t ghcr.io/prowalid/ecomax-store-web:v1.0.2 .
```

إذا أردت وسمًا إضافيًا للإصدار الحالي:

```bash
docker tag ghcr.io/prowalid/ecomax-store-api:v1.0.2 ghcr.io/prowalid/ecomax-store-api:latest
docker tag ghcr.io/prowalid/ecomax-store-web:v1.0.2 ghcr.io/prowalid/ecomax-store-web:latest
```

## 2. رفع الصور إلى Registry
مثال على `GHCR`:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u prowalid --password-stdin
docker push ghcr.io/prowalid/ecomax-store-api:v1.0.2
docker push ghcr.io/prowalid/ecomax-store-web:v1.0.2
docker push ghcr.io/prowalid/ecomax-store-api:latest
docker push ghcr.io/prowalid/ecomax-store-web:latest
```

يمكنك استعمال Docker Hub أو Private Registry بدل GHCR.

## 3. تجهيز السيرفر المركزي
المطلوب على الخادم:
1. Docker
2. Docker Compose Plugin
3. دومين يشير إلى IP الخادم
4. فتح المنفذين `80` و`443`

## 4. تثبيت الـ edge proxy مرة واحدة

```bash
bash deploy/scripts/install_edge_proxy.sh
```

هذا يثبت:
- `Caddy` مركزي على `80/443`
- شبكة Docker مشتركة باسم `etk-edge`
- مجلد site configs مستقل

## 5. إنشاء متجر عميل جديد

```bash
bash deploy/scripts/create_client_store.sh --slug client-a --domain store-a.com --up
```

هذا يولد تلقائيًا:
- مجلد العميل داخل `/opt/client-stores/client-a`
- `.env.registry`
- `docker-compose.yml`
- `init.sql`
- site config داخل `/opt/edge-proxy/sites/client-a.caddy`

## 6. كيف يعمل SSL تلقائيًا
الـ proxy المركزي يستقبل:
- `store-a.com`
- `store-b.com`
- `store-c.com`

ثم ينشئ SSL تلقائيًا لكل دومين ويوجه الطلب إلى stack العميل الصحيح.

## 7. تحديث الإصدار المعتمد للعملاء الجدد
عند إصدار جديد مثل `v1.1.0`:
- ابن الصور
- ادفعها إلى `GHCR`
- ثم استعمل الوسم الجديد داخل سكربت إنشاء العملاء أو عدله داخل `.env.registry`

مثال:

```bash
bash deploy/scripts/create_client_store.sh \
  --slug client-b \
  --domain store-b.com \
  --api-image ghcr.io/prowalid/ecomax-store-api:v1.0.2 \
  --web-image ghcr.io/prowalid/ecomax-store-web:v1.0.2 \
  --up
```

## 8. تحديث عميل موجود

```bash
cd /opt/client-stores/client-a
docker compose -p client-a --env-file .env.registry pull
docker compose -p client-a --env-file .env.registry up -d
```

## 9. rollback
أعد الوسم السابق داخل `.env.registry` ثم:

```bash
docker compose -p client-a --env-file .env.registry up -d
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
- لا تمنح كل عميل منافذ `80/443` خاصة به
- لا تشغّل أكثر من متجر عميل على نفس volumes

## 14. أفضل ممارسة للتسليم
لكل عميل:
1. دومين مستقل
2. ملف env مستقل
3. compose project مستقل
4. Volumes مستقلة
5. قاعدة بيانات مستقلة
6. وسوم release واضحة

بهذا تصبح `Golden Image V1` قابلة للتكرار والتسليم بثبات.
