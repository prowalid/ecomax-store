# دليل إنشاء متجر جديد لعميل جديد

هذا الملف مخصص للاستعمال العملي المتكرر عند كل طلب جديد.

## الفكرة الصحيحة
لأنكم ستشغّلون عدة متاجر على نفس السيرفر:
- لا تنشئ لكل عميل `Caddy` خاصًا به
- لا تمنحه منافذ `80/443` مباشرة
- لا تعتمد على ملف compose قديم أحادي العميل

المسار الصحيح الآن:
1. Proxy مركزي واحد فقط
2. Stack مستقل لكل عميل
3. سكربت يولد ملفات العميل تلقائيًا

## 0. تثبيت الـ edge proxy مرة واحدة فقط
نفذ مرة واحدة على السيرفر:

```bash
bash deploy/scripts/install_edge_proxy.sh
```

هذا ينشئ:
- `/opt/edge-proxy`
- مجلد site configs
- شبكة Docker مشتركة باسم `etk-edge`
- `Caddy` مركزي على `80/443`

## 1. تجهيز الدومين
قبل أي تشغيل:
1. أنشئ `A Record`
2. وجّهه إلى IP الخادم
3. انتظر انتشار الـ DNS

المثال:
- `store-client.com -> SERVER_IP`

## 2. إنشاء متجر العميل آليًا
شغّل:

```bash
bash deploy/scripts/create_client_store.sh --slug store-client --domain store-client.com --up
```

هذا ينشئ تلقائيًا:
- `/opt/client-stores/store-client`
- `.env.registry`
- `docker-compose.yml`
- `init.sql`
- site config للـ domain داخل `/opt/edge-proxy/sites/`

## 3. إذا أردت ضبط صور إصدار أو أسرار مخصصة
يمكنك تمريرها مباشرة عند الإنشاء:

```bash
bash deploy/scripts/create_client_store.sh \
  --slug store-client \
  --domain store-client.com \
  --api-image ghcr.io/walid733/express-trade-kit-api:v1.0.1 \
  --web-image ghcr.io/walid733/express-trade-kit-web:v1.0.1 \
  --up
```

أو تعدل بعد الإنشاء في:

```bash
nano /opt/client-stores/store-client/.env.registry
```

## 4. التحقق الأولي
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
1. ادخل إلى مجلد العميل
2. غيّر وسم الصور في `.env.registry`
2. ثم نفذ:

```bash
cd /opt/client-stores/store-client
docker compose -p store-client --env-file .env.registry pull
docker compose -p store-client --env-file .env.registry up -d
```

## 8. rollback
إذا ظهرت مشكلة:
1. أعد وسم الإصدار السابق داخل `.env.registry`
2. ثم شغّل:

```bash
cd /opt/client-stores/store-client
docker compose -p store-client --env-file .env.registry up -d
```

## 9. ملاحظات مهمة
- اعمل لكل عميل مجلدًا مستقلًا مثل `/opt/client-stores/client-name`
- لا تخلط ملفات عميل مع عميل آخر في نفس المجلد
- الـ proxy المركزي فقط هو من يملك `80/443`
- لا تستعمل `latest` للتسليم الرسمي
- استعمل دائمًا وسمًا واضحًا مثل `v1.0.1`
- لا تنقل قاعدة بيانات عميل إلى عميل آخر
- كل عميل يجب أن يبقى على بياناته وvolumes الخاصة به

## 10. النسخة الحالية المعتمدة
- `ghcr.io/walid733/express-trade-kit-api:v1.0.1`
- `ghcr.io/walid733/express-trade-kit-web:v1.0.1`
