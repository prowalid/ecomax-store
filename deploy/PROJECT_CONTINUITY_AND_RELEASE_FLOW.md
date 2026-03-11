# استمرارية المشروع ومسار التطوير والإصدارات

قبل أي عمل، اقرأ هذا الملف أولًا:
- [deploy/SOURCE_OF_TRUTH_AND_RELEASE_RULES.md](/root/express-trade-kit/deploy/SOURCE_OF_TRUTH_AND_RELEASE_RULES.md)

هذا الملف يشرح ماذا تفعل إذا فقدتم سيرفر التطوير الحالي، وكيف تعيدون إنشاء بيئة تطوير جديدة وتتابعون بناء:
- `V2`
- `V3`
- `V4`

بدون فقدان المسار أو الخلط بين:
- الكود
- صور الإصدارات
- ملفات النشر

## 1. ما هي مصادر الحقيقة في المشروع

عندكم الآن 3 مصادر رئيسية:

### 1. GitHub
هذا هو المصدر الرسمي للكود.

يحتوي على:
- الشيفرة المصدرية
- مكونات الواجهة والخادم
- ملفات Docker
- ملفات `docker-compose`
- ملفات التوثيق والتشغيل

المستودع:
- `https://github.com/walid733/express-trade-kit`

هذا هو المكان الذي يجب أن تبدأ منه دائمًا عند إنشاء بيئة تطوير جديدة.

### 2. GHCR
هذا هو مكان حفظ صور الإصدارات الجاهزة للتشغيل.

يحتوي على:
- صورة `api`
- صورة `web`

أمثلة حالية:
- `ghcr.io/walid733/express-trade-kit-api:v1.0.2`
- `ghcr.io/walid733/express-trade-kit-web:v1.0.2`

هذا ليس مكان التطوير، بل مكان الإصدارات الجاهزة.

### 3. ملفات التوثيق داخل المستودع
أهم الملفات التشغيلية:
- [deploy/GOLDEN_IMAGE_V1_REGISTRY_RUNBOOK.md](/root/express-trade-kit/deploy/GOLDEN_IMAGE_V1_REGISTRY_RUNBOOK.md)
- [deploy/NEW_CLIENT_STORE_DEPLOYMENT_AR.md](/root/express-trade-kit/deploy/NEW_CLIENT_STORE_DEPLOYMENT_AR.md)
- [deploy/MULTI_CLIENT_SAME_SERVER_RUNBOOK.md](/root/express-trade-kit/deploy/MULTI_CLIENT_SAME_SERVER_RUNBOOK.md)
- [deploy/docker-compose.edge-proxy.yml](/root/express-trade-kit/deploy/docker-compose.edge-proxy.yml)
- [deploy/docker-compose.client-stack.yml](/root/express-trade-kit/deploy/docker-compose.client-stack.yml)
- [deploy/client-multi.env.template](/root/express-trade-kit/deploy/client-multi.env.template)

هذه الملفات جزء من الكود نفسه ويجب أن تبقى مرفوعة دائمًا إلى GitHub.

## 2. إذا فقدنا سيرفر التطوير الحالي

لا تحتاج إلى استرجاع السيرفر نفسه.

الذي تفعله:
1. تجهز سيرفر أو جهاز تطوير جديد
2. تنزل المشروع من GitHub
3. تثبت dependencies
4. تنشئ ملفات البيئة المحلية
5. تتابع التطوير
6. تبني صور إصدار جديدة
7. ترفعها إلى `GHCR`

بمعنى:
- GitHub يحفظ المشروع
- GHCR يحفظ الإصدارات
- السيرفر الحالي ليس هو الأصل

## 3. ماذا تحتاج على سيرفر تطوير جديد

### متطلبات أساسية
- `git`
- `nodejs`
- `npm`
- `docker`
- `docker compose`
- PostgreSQL محلي أو عبر Docker

### مجلد العمل المقترح
مثال:

```bash
mkdir -p /root/workspace
cd /root/workspace
git clone https://github.com/walid733/express-trade-kit.git
cd express-trade-kit
```

## 4. كيف تعيد إنشاء بيئة التطوير

### 4.1 تنزيل المشروع
```bash
git clone https://github.com/walid733/express-trade-kit.git
cd express-trade-kit
git checkout main
```

### 4.2 تثبيت الاعتماديات
الواجهة:
```bash
npm install
```

الخادم:
```bash
cd server
npm install
cd ..
```

### 4.3 إعداد ملفات البيئة المحلية

الواجهة:
```bash
cp .env.example .env
```

الخادم:
```bash
cp server/.env.example server/.env
```

ثم تعدل القيم حسب بيئة التطوير.

مهم:
- `.env`
- `server/.env`
- `.env.golden`

هذه ملفات محلية ولا يجب اعتبارها جزءًا من الكود الرسمي.

## 5. أين نطور فعليًا

التطوير يتم دائمًا من:
- ملفات المشروع المحلية بعد `git clone`

وليس من:
- `GHCR`

لأن صور `GHCR` ليست مكان تحرير، بل build جاهز.

إذًا:
- التطوير = GitHub repo cloned locally
- الإصدار = Docker images in GHCR

## 6. كيف تتأكد أنك على المسار الصحيح قبل أي تطوير

قبل البدء في أي نسخة جديدة:

```bash
git status
git pull origin main
git branch
```

المطلوب:
- أن تبدأ من `main` النظيف
- أو تنشئ فرعًا جديدًا للعمل

مثال:
```bash
git checkout -b release/v1.1.0
```

أو:
```bash
git checkout -b feature/improve-checkout-flow
```

## 7. المسار الصحيح لتطوير V2 أو V3 أو V4

### الخطوة 1
اسحب آخر نسخة من GitHub:
```bash
git checkout main
git pull origin main
```

### الخطوة 2
أنشئ فرعًا واضحًا:
```bash
git checkout -b release/v2.0.0
```

### الخطوة 3
نفذ التطوير والاختبارات

### الخطوة 4
اعمل commits نظيفة وواضحة:
```bash
git add -A
git commit -m "feat: improve storefront and admin for v2"
```

### الخطوة 5
ادفع الكود إلى GitHub:
```bash
git push origin release/v2.0.0
```

### الخطوة 6
بعد اعتماد النسخة:
- merge إلى `main`
- أو واصل على `main` إذا كان هذا أسلوبكم المعتمد

## 8. كيف نبني إصدارًا جديدًا من المشروع

مثال على `v1.1.0`:

```bash
docker build -f server/Dockerfile -t ghcr.io/walid733/express-trade-kit-api:v1.1.0 ./server
docker build -f Dockerfile.web -t ghcr.io/walid733/express-trade-kit-web:v1.1.0 .
```

ثم:

```bash
docker push ghcr.io/walid733/express-trade-kit-api:v1.1.0
docker push ghcr.io/walid733/express-trade-kit-web:v1.1.0
```

وإذا أردت تحديث `latest`:

```bash
docker tag ghcr.io/walid733/express-trade-kit-api:v1.1.0 ghcr.io/walid733/express-trade-kit-api:latest
docker tag ghcr.io/walid733/express-trade-kit-web:v1.1.0 ghcr.io/walid733/express-trade-kit-web:latest
docker push ghcr.io/walid733/express-trade-kit-api:latest
docker push ghcr.io/walid733/express-trade-kit-web:latest
```

## 9. كيف نعيد استعمال الإصدار الجديد لعميل جديد

على خادم العميل لا تحتاج الكود كاملًا.

يكفي:
- [deploy/docker-compose.edge-proxy.yml](/root/express-trade-kit/deploy/docker-compose.edge-proxy.yml)
- [deploy/docker-compose.client-stack.yml](/root/express-trade-kit/deploy/docker-compose.client-stack.yml)
- [deploy/client-multi.env.template](/root/express-trade-kit/deploy/client-multi.env.template)

ثم تغيّر في `.env.registry` فقط:
- `APP_DOMAIN`
- `CORS_ORIGINS`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `ETK_API_IMAGE`
- `ETK_WEB_IMAGE`

مثال:
```env
ETK_API_IMAGE=ghcr.io/walid733/express-trade-kit-api:v1.1.0
ETK_WEB_IMAGE=ghcr.io/walid733/express-trade-kit-web:v1.1.0
```

إذا كان الهدف تشغيل عدة عملاء على نفس السيرفر:
- استعمل:
  - [deploy/docker-compose.edge-proxy.yml](/root/express-trade-kit/deploy/docker-compose.edge-proxy.yml)
  - [deploy/docker-compose.client-stack.yml](/root/express-trade-kit/deploy/docker-compose.client-stack.yml)
  - [deploy/MULTI_CLIENT_SAME_SERVER_RUNBOOK.md](/root/express-trade-kit/deploy/MULTI_CLIENT_SAME_SERVER_RUNBOOK.md)

## 10. كيف لا نفقد المسار مرة أخرى

القاعدة الأساسية:

### أولًا
كل تطوير مهم يجب أن ينتهي بـ:
- `commit`
- `push` إلى GitHub

### ثانيًا
كل إصدار قابل للتشغيل يجب أن ينتهي بـ:
- `docker build`
- `docker push` إلى `GHCR`

### ثالثًا
كل تغيير في التشغيل أو التسليم يجب أن ينتهي بـ:
- تحديث ملف توثيق مناسب داخل `deploy/`

إذا لم تفعل هذه الثلاثة، سيبدأ عدم التطابق من جديد.

## 11. القاعدة العملية المختصرة

اعتمد هذه الجملة دائمًا:

- `GitHub = source of truth`
- `GHCR = release artifacts`
- `deploy/*.md = operating memory`

## 12. ما الذي يجب عدم فعله

- لا تطور مباشرة من image موجودة في `GHCR`
- لا تعتبر السيرفر الحالي هو المصدر الوحيد للمشروع
- لا تبن صورة جديدة قبل أن يكون الكود محفوظًا بوضوح
- لا تترك تعديلات كبيرة محليًا بدون `commit/push`
- لا تعتمد على الذاكرة وحدها في تشغيل العملاء الجدد

## 13. ما الذي يجب فعله عند كل إصدار جديد

Checklist سريعة:

1. `git pull origin main`
2. نفذ التطوير
3. اختبر
4. `git add -A`
5. `git commit`
6. `git push origin ...`
7. build images with new tag
8. push images to GHCR
9. update deployment docs if needed
10. use the new image tags for new clients

## 14. الوضع الحالي للمشروع

الحالة الحالية الآن:
- GitHub يحتوي baseline متوافق مع `Golden Image V1`
- GHCR يحتوي:
- `ghcr.io/walid733/express-trade-kit-api:v1.0.2`
- `ghcr.io/walid733/express-trade-kit-web:v1.0.2`
- ملفات التشغيل والتوثيق موجودة داخل المستودع

هذا يعني أنكم الآن قادرون على:
- إنشاء بيئة تطوير جديدة من الصفر
- متابعة V2/V3/V4
- إصدار صور جديدة
- وتسليم عملاء جدد دون فقدان المسار
