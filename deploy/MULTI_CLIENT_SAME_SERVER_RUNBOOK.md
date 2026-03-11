# تشغيل عدة متاجر معزولة على نفس السيرفر

هذا المسار هو البديل الصحيح اقتصاديًا إذا لم تكن تريد سيرفرًا مستقلاً لكل عميل.

## الفكرة

بدل أن يملك كل متجر `80/443` خاصته:
- يوجد `Edge Proxy` مركزي واحد فقط على السيرفر
- كل متجر عميل يعمل داخل stack معزول داخليًا
- الـ proxy المركزي يوجّه الدومين إلى متجر العميل الصحيح

## الملفات الأساسية
- [deploy/docker-compose.edge-proxy.yml](/root/express-trade-kit/deploy/docker-compose.edge-proxy.yml)
- [deploy/Caddyfile.edge](/root/express-trade-kit/deploy/Caddyfile.edge)
- [deploy/docker-compose.client-stack.yml](/root/express-trade-kit/deploy/docker-compose.client-stack.yml)
- [deploy/client-multi.env.template](/root/express-trade-kit/deploy/client-multi.env.template)
- [deploy/scripts/install_edge_proxy.sh](/root/express-trade-kit/deploy/scripts/install_edge_proxy.sh)
- [deploy/scripts/create_client_store.sh](/root/express-trade-kit/deploy/scripts/create_client_store.sh)

## 1. تثبيت الـ proxy المركزي

```bash
bash deploy/scripts/install_edge_proxy.sh
```

هذا ينشئ:
- `/opt/edge-proxy`
- شبكة Docker مشتركة باسم `etk-edge`
- `Caddy` مركزي على `80/443`

## 2. إنشاء متجر عميل جديد

مثال:

```bash
bash deploy/scripts/create_client_store.sh --slug client-a --domain store-a.com --up
```

هذا ينشئ:
- `/opt/client-stores/client-a`
- ملف `.env.registry`
- ملف `docker-compose.yml`
- ملف `init.sql`
- site config داخل `/opt/edge-proxy/sites/client-a.caddy`

ثم يشغل stack العميل إذا استخدمت `--up`.

## 3. النتيجة

يصبح عندك:
- Proxy واحد فقط يستقبل كل الدومينات
- كل عميل داخل compose project مستقل
- كل عميل له `db/api/web/volumes` مستقلة
- SSL تلقائي لكل دومين من خلال Caddy المركزي

## 4. تشغيل عميل ثانٍ

```bash
bash deploy/scripts/create_client_store.sh --slug client-b --domain store-b.com --up
```

وهكذا.

## 5. تحديث عميل معين

ادخل إلى مجلد العميل:

```bash
cd /opt/client-stores/client-a
```

عدّل وسوم الصور داخل `.env.registry` ثم:

```bash
docker compose -p client-a --env-file .env.registry pull
docker compose -p client-a --env-file .env.registry up -d
```

## 6. ملاحظات مهمة

- لكل عميل مجلد مستقل
- لكل عميل دومين مستقل
- لا تستخدم `container_name` ثابتًا في هذا النموذج
- لا تشغل منافذ عامة داخل stack العميل
- الـ proxy المركزي وحده هو من يملك `80/443`

## 7. ما الذي أصبح آليًا

- تثبيت edge proxy
- إنشاء مجلد العميل
- إنشاء env تلقائيًا
- توليد secrets تلقائيًا إذا لم تمررها
- إنشاء site config للـ domain
- تشغيل stack العميل
