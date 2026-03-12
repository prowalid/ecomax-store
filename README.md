# Express Trade Kit

منصة متجر إلكتروني موجهة للسوق الجزائري، مبنية كمنتج واحد قابل للتطوير، ثم إخراجه كصور Docker وتشغيله كمتاجر عملاء معزولة على نفس السيرفر.

## المسار المعتمد

- المصدر الرسمي للكود وملفات `deploy` هو هذا المستودع فقط.
- صور التشغيل الرسمية تحفظ في `GHCR`.
- متاجر العملاء داخل `/opt/client-stores/*` هي بيئات تشغيل، وليست مصدرًا للتطوير.

اقرأ هذا أولًا:
- [deploy/SOURCE_OF_TRUTH_AND_RELEASE_RULES.md](/root/express-trade-kit/deploy/SOURCE_OF_TRUTH_AND_RELEASE_RULES.md)

## بروتوكول العمل الإلزامي

1. تعديل داخل repo.
2. اختبار على `stepdz` فقط.
3. بعد الموافقة: `commit -> push -> GHCR release -> deploy`.

لا يجوز القفز مباشرة إلى GHCR قبل إتمام خطوة الاختبار والموافقة.

## تشغيل التطوير محليًا

المتطلبات:
- Node.js
- npm
- PostgreSQL

إعداد البيئة:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

تثبيت الاعتماديات:
```bash
npm install
cd server && npm install && cd ..
```

تشغيل المشروع:
```bash
cd server && npm run dev
```

في طرفية ثانية:
```bash
npm run dev
```

## البنية التشغيلية الحالية

المشروع يعتمد الآن على:
- `GHCR` لصور `api` و`web`
- `edge proxy` مركزي واحد على السيرفر
- `client stack` مستقل لكل عميل
- `SSL` تلقائي لكل دومين

الملفات الأساسية المعتمدة:
- [deploy/GOLDEN_IMAGE_V1_REGISTRY_RUNBOOK.md](/root/express-trade-kit/deploy/GOLDEN_IMAGE_V1_REGISTRY_RUNBOOK.md)
- [deploy/MULTI_CLIENT_SAME_SERVER_RUNBOOK.md](/root/express-trade-kit/deploy/MULTI_CLIENT_SAME_SERVER_RUNBOOK.md)
- [deploy/NEW_CLIENT_STORE_DEPLOYMENT_AR.md](/root/express-trade-kit/deploy/NEW_CLIENT_STORE_DEPLOYMENT_AR.md)
- [deploy/PROJECT_CONTINUITY_AND_RELEASE_FLOW.md](/root/express-trade-kit/deploy/PROJECT_CONTINUITY_AND_RELEASE_FLOW.md)
- [deploy/docker-compose.edge-proxy.yml](/root/express-trade-kit/deploy/docker-compose.edge-proxy.yml)
- [deploy/docker-compose.client-stack.yml](/root/express-trade-kit/deploy/docker-compose.client-stack.yml)
- [deploy/client-multi.env.template](/root/express-trade-kit/deploy/client-multi.env.template)
- [deploy/scripts/install_edge_proxy.sh](/root/express-trade-kit/deploy/scripts/install_edge_proxy.sh)
- [deploy/scripts/create_client_store.sh](/root/express-trade-kit/deploy/scripts/create_client_store.sh)

## إنشاء متجر عميل جديد

مرة واحدة فقط على السيرفر:
```bash
bash deploy/scripts/install_edge_proxy.sh
```

ثم لكل عميل جديد:
```bash
bash deploy/scripts/create_client_store.sh --slug client-a --domain client-a.com --up
```

## بناء release جديدة

من داخل المشروع:
```bash
docker build -f server/Dockerfile -t ghcr.io/walid733/express-trade-kit-api:v1.0.2 ./server
docker build -f Dockerfile.web -t ghcr.io/walid733/express-trade-kit-web:v1.0.2 .
```

ثم ارفع الصور إلى `GHCR` وحدث `.env.registry` للعميل إلى الوسم الجديد.
