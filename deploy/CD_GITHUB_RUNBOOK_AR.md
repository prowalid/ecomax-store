# تشغيل `CD` عبر GitHub Actions

هذا الدليل يشرح تشغيل النشر الآلي الرسمي للمشروع بعد اكتمال `CI`.

## 1. متى نستخدم هذا المسار

استخدم `CD` عندما تريد:

- بناء صور رسمية جديدة
- رفعها إلى `GHCR`
- نشرها تلقائيًا على `stepdz`
- التحقق من نجاح النشر بعده مباشرة

## 2. كيف تُطلق الـ workflow

هناك مساران رسميان:

### 2.1 إطلاق يدوي

من GitHub Actions:

- افتح `CD`
- اختر `Run workflow`
- أدخل `release_version` بصيغة `vX.Y.Z`
- اترك `deploy_stepdz = true` إذا أردت النشر مباشرة

### 2.2 إطلاق عبر tag

عند دفع tag مطابق للصيغة:

- `vX.Y.Z`

ستعمل الـ workflow تلقائيًا.

## 3. المتطلبات في GitHub

### 3.1 Secrets المطلوبة

ضع هذه الأسرار في repository أو environment `stepdz`:

- `STEPDZ_SERVER_HOST`
- `STEPDZ_SERVER_USER`
- `STEPDZ_SSH_PRIVATE_KEY`

### 3.2 Variables الاختيارية

يمكن ضبط:

- `STEPDZ_PROJECT_NAME`
- `STEPDZ_CLIENT_DIR`

إذا لم تُضبط، يستخدم المسار الافتراضي:

- `stepdz`
- `/opt/client-stores/stepdz`

## 4. ماذا يفعل `CD`

الworkflow تقوم بالترتيب التالي:

1. تتحقق من رقم الإصدار.
2. تتحقق من `deploy/releases.json`.
3. تشغّل `typecheck` و`tests` وفحوصات `node --check`.
4. تبني صور `api/web`.
5. ترفعها إلى `GHCR`.
6. تنشرها إلى `stepdz` عبر `SSH`.
7. تتحقق من:
   - `/api/health`
   - `/api/health/ready`
   - `/api/health/version`
   - `/api/openapi.json`

## 5. كيف تتأكد من نجاح النشر

عند نجاح النشر سترى:

- `stepdz deployment verified`
- حالة الحاويات `Up` و`Healthy`
- `api_version` يطابق الإصدار المنشور

إذا أردت التحقق يدويًا بعد النشر:

```bash
curl -s https://stepdz.com/api/health
curl -s https://stepdz.com/api/health/version
curl -s https://stepdz.com/api/openapi.json
```

## 6. كيف يعمل rollback

إذا فشل النشر:

- يتم استرجاع نسخة احتياطية من `.env.registry`
- يعاد تشغيل stack بالحالة السابقة
- تُطبع حالة الحاويات وآخر سجلات `api/web` للمراجعة

هذا يعني أن rollback هنا ليس نظريًا:

- ملف البيئة يرجع كما كان
- والحاوية تعود للإصدار السابق

## 7. ما الذي يجب مراجعته إذا فشل الـ workflow

- صحة secrets في GitHub
- أن tag أو `release_version` مطابق للصيغة `vX.Y.Z`
- أن `deploy/releases.json` يحتوي الإصدار المطلوب
- أن صور `GHCR` مبنية ومرفوعة
- أن `stepdz` reachable من runner

## 8. مرجع سريع قبل الرفع

قبل أي release رسمي، راجع أيضًا:

- [CLOUD_DEPLOYMENT_CHECKLIST_AR.md](/root/express-trade-kit/deploy/CLOUD_DEPLOYMENT_CHECKLIST_AR.md)

## 9. ملاحظة مهمة

هذا المسار مخصص للإصدار الرسمي فقط.

إذا أردت تجربة سريعة بدون إصدار رسمي، استخدم:

```bash
bash deploy/scripts/test_stepdz.sh
```
