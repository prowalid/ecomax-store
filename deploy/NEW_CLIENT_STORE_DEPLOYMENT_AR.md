# الدليل النهائي لخادم التوزيع وإنشاء متاجر العملاء

هذا هو الدليل العملي الذي تعتمد عليه لتجهيز خادم توزيع متاجر، إنشاء كل متجر عميل بشكل معزول، معرفة ملفاته، ترقيته، وأخذ نسخة احتياطية له.

الفكرة الأساسية:
- يوجد خادم توزيع واحد فقط.
- يوجد `edge proxy` واحد فقط يستقبل كل الدومينات على `80/443`.
- كل عميل يحصل على متجر مستقل داخل مجلد مستقل، وحاويات مستقلة، وبيانات مستقلة.
- لا يوجد تطوير على خادم التوزيع. هذا الخادم للتشغيل والبيع فقط.

## 1. ما الذي ستحصل عليه لكل عميل

عند إنشاء متجر عميل جديد بالـ `slug` مثل `veloria` ستحصل على:
- مجلد العميل: `/opt/client-stores/veloria`
- ملف البيئة: `/opt/client-stores/veloria/.env.registry`
- ملف التشغيل: `/opt/client-stores/veloria/docker-compose.yml`
- ملف تهيئة القاعدة الجديدة: `/opt/client-stores/veloria/init.sql`
- ملف Caddy الداخلي للمتجر: `/opt/client-stores/veloria/Caddyfile.client`
- ملف ربط الدومين في الـ proxy المركزي: `/opt/edge-proxy/sites/veloria.caddy`

وستحصل أيضًا على Volumes مستقلة باسم العميل:
- `veloria_postgres_data`
- `veloria_api_logs`
- `veloria_api_uploads`
- `veloria_api_backups`

هذا هو معنى العزل. كل متجر له ملفاته وبياناته الخاصة.

## 2. كيف تميّز متجر عميل عن متجر آخر

المفتاح هو `slug`.

مثال:
- عميل 1: `veloria`
- عميل 2: `stepdz`
- عميل 3: `clientx`

هذا الـ `slug` يظهر في كل شيء:
- اسم مجلد العميل
- اسم مشروع Docker
- أسماء الـ volumes
- ملف الدومين داخل `/opt/edge-proxy/sites/`

أوامر مفيدة لمعرفة المتاجر الموجودة:

```bash
ls /opt/client-stores
```

أوامر مفيدة لمعرفة الحاويات الجارية:

```bash
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

مثال قراءة متجر معين:
- إذا رأيت `veloria-api-1` فهذا API متجر `veloria`
- إذا رأيت `stepdz-db-1` فهذا DB متجر `stepdz`

## 3. تجهيز خادم توزيع جديد من الصفر

نفذ هذه الخطوات مرة واحدة فقط على الخادم الجديد.

### 3.1 تحديث النظام وتثبيت الأدوات الأساسية

```bash
apt update && apt -y upgrade
apt install -y curl wget git jq openssl ufw
```

السبب:
- `curl` و`wget`: للتنزيل
- `git`: لجلب ملفات التشغيل
- `jq`: مفيد في بعض الفحوصات
- `openssl`: لتوليد أسرار آمنة
- `ufw`: جدار ناري بسيط وواضح

### 3.2 تثبيت Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

السبب:
- المشروع كله يعمل فوق Docker
- هذا يضمن تشغيل المتاجر بشكل معزول ومنظم

### 3.3 تفعيل الجدار الناري

```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

السبب:
- `22` للإدارة عبر SSH
- `80/443` لاستقبال المتاجر
- لا حاجة لفتح منافذ أخرى للعامة

### 3.4 جلب ملفات التشغيل فقط

```bash
mkdir -p /opt/etk-infrastructure
cd /opt/etk-infrastructure

git clone --depth 1 --filter=blob:none --sparse https://YOUR_GITHUB_TOKEN@github.com/prowalid/ecomax-store.git .
git sparse-checkout set deploy server/src/db
```

السبب:
- لا تحتاج كامل بيئة التطوير على خادم التوزيع
- ما تحتاجه هنا فقط:
  - سكربتات التوزيع
  - ملفات الـ compose
  - `init.sql`

مهم:
- بعد الانتهاء من الإعداد، اعمل `revoke` للتوكن إذا كنت استخدمته بهذه الطريقة

### 3.5 تسجيل الدخول إلى GHCR

```bash
printf '%s' 'YOUR_GITHUB_TOKEN' | docker login ghcr.io -u prowalid --password-stdin
```

السبب:
- الصور الرسمية في GHCR
- ولا يمكن سحبها من Registry خاص بدون login

### 3.6 تثبيت الـ edge proxy المركزي مرة واحدة فقط

```bash
bash deploy/scripts/install_edge_proxy.sh
```

السبب:
- هذا ينشئ `Caddy` مركزي واحد فقط
- هو الوحيد الذي يستقبل كل الدومينات
- كل متجر لاحقًا يدخل خلفه

### 3.7 سحب النسخة الرسمية التي تريد اعتمادها

```bash
docker pull ghcr.io/prowalid/ecomax-store-api:v1.0.19
docker pull ghcr.io/prowalid/ecomax-store-web:v1.0.19
```

السبب:
- لتضمن أن الصور موجودة محليًا
- ولتعمل المتاجر الجديدة بسرعة

## 4. إنشاء متجر عميل جديد

قبل الإنشاء:
- اجعل دومين العميل موجّهًا إلى IP الخادم
- مثال: `veloriarose.com -> IP_SERVER`

ثم أنشئ المتجر:

```bash
cd /opt/etk-infrastructure

bash deploy/scripts/create_client_store.sh \
  --slug veloria \
  --domain veloriarose.com \
  --api-image ghcr.io/prowalid/ecomax-store-api:v1.0.19 \
  --web-image ghcr.io/prowalid/ecomax-store-web:v1.0.19 \
  --up
```

شرح المعاني:
- `--slug veloria`: الاسم الداخلي الثابت لهذا العميل
- `--domain veloriarose.com`: دومين العميل الحقيقي
- `--api-image` و`--web-image`: الإصدار الرسمي الذي تريد تسليمه
- `--up`: شغّل المتجر فورًا بعد إنشائه

## 5. كيف تعرف أن المتجر اشتغل بنجاح

افحص الحاويات:

```bash
docker compose -p veloria --env-file /opt/client-stores/veloria/.env.registry -f /opt/client-stores/veloria/docker-compose.yml ps
```

يفترض أن ترى:
- `db` = healthy
- `api` = healthy
- `web` = up

ثم افتح:
- `https://veloriarose.com`
- `https://veloriarose.com/admin/setup`

إذا ظهر لك `Setup Admin` فهذا يعني أن المتجر جديد فعلاً وجاهز للتسليم.

## 6. ماذا يفعل العميل بعد الاستلام

العميل لا يحتاج أوامر سيرفر.

هو فقط:
1. يفتح `/admin/setup`
2. ينشئ المدير الأول
3. يدخل لوحة التحكم
4. يضبط:
   - اسم المتجر
   - الشعار
   - الألوان
   - المنتجات
   - الشحن
   - الإشعارات

## 7. كيف ترقي متجرًا موجودًا إلى نسخة أحدث

مثال: تريد ترقية متجر `veloria` من `v1.0.19` إلى `v1.0.20`

### 7.1 اسحب الصور الجديدة

```bash
docker pull ghcr.io/prowalid/ecomax-store-api:v1.0.20
docker pull ghcr.io/prowalid/ecomax-store-web:v1.0.20
```

### 7.2 عدّل ملف البيئة الخاص بالعميل

```bash
sed -i 's#^ETK_API_IMAGE=.*#ETK_API_IMAGE=ghcr.io/prowalid/ecomax-store-api:v1.0.20#' /opt/client-stores/veloria/.env.registry
sed -i 's#^ETK_WEB_IMAGE=.*#ETK_WEB_IMAGE=ghcr.io/prowalid/ecomax-store-web:v1.0.20#' /opt/client-stores/veloria/.env.registry
```

### 7.3 أعد تشغيل `api/web`

```bash
docker compose -p veloria --env-file /opt/client-stores/veloria/.env.registry -f /opt/client-stores/veloria/docker-compose.yml up -d --force-recreate api web
```

### 7.4 تحقق

```bash
docker compose -p veloria --env-file /opt/client-stores/veloria/.env.registry -f /opt/client-stores/veloria/docker-compose.yml ps
grep -E '^ETK_(API|WEB)_IMAGE=' /opt/client-stores/veloria/.env.registry
```

## 8. كيف تعمل rollback إذا حدثت مشكلة بعد الترقية

إذا كانت النسخة الجديدة فيها مشكلة:

### 8.1 أعد الإصدار السابق في `.env.registry`

مثال:

```bash
sed -i 's#^ETK_API_IMAGE=.*#ETK_API_IMAGE=ghcr.io/prowalid/ecomax-store-api:v1.0.19#' /opt/client-stores/veloria/.env.registry
sed -i 's#^ETK_WEB_IMAGE=.*#ETK_WEB_IMAGE=ghcr.io/prowalid/ecomax-store-web:v1.0.19#' /opt/client-stores/veloria/.env.registry
```

### 8.2 أعد تشغيل `api/web`

```bash
docker compose -p veloria --env-file /opt/client-stores/veloria/.env.registry -f /opt/client-stores/veloria/docker-compose.yml up -d --force-recreate api web
```

هذا يعيد المتجر سريعًا للنسخة السابقة بدون لمس بياناته.

## 9. كيف تأخذ نسخة احتياطية من قاعدة بيانات متجر

مثال على متجر `veloria`:

### 9.1 أنشئ مجلد نسخ احتياطي على الخادم

```bash
mkdir -p /opt/backups/veloria
```

### 9.2 خذ نسخة SQL مضغوطة

```bash
docker exec -t veloria-db-1 pg_dump -U etk_user -d expresstrade | gzip > /opt/backups/veloria/veloria-db-$(date +%F-%H%M).sql.gz
```

النتيجة:
- ملف SQL كامل للمتجر

## 10. كيف تأخذ نسخة احتياطية من صور وملفات رفع العميل

```bash
docker run --rm \
  -v veloria_api_uploads:/source:ro \
  -v /opt/backups/veloria:/backup \
  alpine sh -c "tar -czf /backup/veloria-uploads-$(date +%F-%H%M).tar.gz -C /source ."
```

النتيجة:
- أرشيف يحفظ الصور والملفات المرفوعة داخل المتجر

## 11. كيف تسترجع قاعدة بيانات متجر

يجب تنفيذ هذا فقط إذا كنت متأكدًا أنك تريد استبدال بيانات المتجر الحالية.

### 11.1 انسخ ملف النسخة الاحتياطية إلى الخادم

مثال:
- `/opt/backups/veloria/veloria-db-2026-03-13-1200.sql.gz`

### 11.2 استرجعها داخل قاعدة المتجر

```bash
gunzip -c /opt/backups/veloria/veloria-db-2026-03-13-1200.sql.gz | docker exec -i veloria-db-1 psql -U etk_user -d expresstrade
```

مهم:
- هذا لا يغيّر ملفات الصور
- إذا أردت استرجاع الصور أيضًا، استرجع أرشيف `uploads` بشكل منفصل

## 12. كيف تأخذ نسخة احتياطية لكل المتاجر

يمكنك تكرار العملية لكل مجلد داخل `/opt/client-stores`.

لمعرفة المتاجر:

```bash
ls /opt/client-stores
```

لو ظهرت لك مثلًا:
- `veloria`
- `stepdz`
- `clientx`

فهذا يعني أن عندك 3 متاجر، ولكل متجر:
- DB backup
- uploads backup

## 13. كيف تتابع صحة الخادم يوميًا

هذه أوامر بسيطة لكن مهمة جدًا:

### الحاويات

```bash
docker ps
```

### استهلاك الموارد

```bash
docker stats --no-stream
```

### امتلاء القرص

```bash
df -h
```

### الذاكرة

```bash
free -h
```

### الحاويات المعطلة أو غير الصحية

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}'
```

## 14. ما الذي يجب أن تفعله لتجعل الخادم يصمد

هذه أهم قواعد التشغيل الطويل:

1. لا تطور على خادم التوزيع
- التطوير على خادم التطوير فقط
- التوزيع يستقبل إصدارات جاهزة فقط

2. لا تستخدم `latest` عند تسليم عميل جديد
- استخدم إصدارًا واضحًا مثل `v1.0.19`

3. لا تخلط نسختين مختلفتين
- `api` و`web` يجب أن يكونا على نفس الإصدار

4. لا تشارك دومينًا بين عميلين
- كل عميل له دومينه فقط

5. لا تحذف مجلد العميل فقط إذا أردت حذفه
- يجب أيضًا حذف stack وvolumes الخاصة به

6. خذ backups بانتظام
- قاعدة البيانات مهمة
- وملفات الصور مهمة أيضًا

7. راقب مساحة القرص
- أكثر شيء يسبب انهيارات مفاجئة هو امتلاء القرص

8. إذا كان عندك عدد متاجر كبير، خصص خادمًا منفصلًا للتطوير وخادمًا منفصلًا للتوزيع

## 15. الطريقة الصحيحة لحذف متجر عميل بالكامل

مثال على `veloria`:

```bash
docker compose -p veloria --env-file /opt/client-stores/veloria/.env.registry -f /opt/client-stores/veloria/docker-compose.yml down -v
docker volume rm veloria_postgres_data veloria_api_logs veloria_api_uploads veloria_api_backups
rm -rf /opt/client-stores/veloria
rm -f /opt/edge-proxy/sites/veloria.caddy
docker compose -f /opt/edge-proxy/docker-compose.yml restart
```

مهم:
- هذا حذف كامل ونهائي
- لا تنفذه إلا إذا كنت متأكدًا

## 16. الخلاصة السريعة جدًا

مرة واحدة على الخادم:
- ثبّت Docker
- اجلب ملفات `deploy`
- اعمل `docker login ghcr.io`
- شغّل `install_edge_proxy.sh`

لكل عميل جديد:
- جهّز الدومين
- شغّل `create_client_store.sh`
- افتح `/admin/setup`

لكل ترقية:
- `docker pull`
- عدّل `ETK_API_IMAGE` و`ETK_WEB_IMAGE`
- أعد تشغيل `api/web`

لكل أمان واستقرار:
- backups
- مراقبة الموارد
- عدم التطوير على خادم التوزيع
- استخدام إصدارات واضحة فقط
