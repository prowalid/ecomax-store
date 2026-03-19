# دليل الأسرار والتشغيل

هذا الملف يشرح الحد الأدنى العملي لإدارة الأسرار والتشغيل بعد التحسينات الأخيرة.

## 1. الأسرار الأساسية

يجب ضبط هذه القيم لكل عميل:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `METRICS_TOKEN`
- `GREEN_API_TOKEN` عند استخدام التكامل
- `FACEBOOK_ACCESS_TOKEN` عند استخدام CAPI

## 2. التوليد الأولي

إنشاء متجر جديد عبر:

```bash
deploy/scripts/create_client_store.sh --slug veloria --domain veloria.com --up
```

السكربت يولد تلقائيًا:

- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `METRICS_TOKEN`

## 3. تدوير الأسرار

تدوير JWT:

```bash
deploy/scripts/rotate_client_secrets.sh --slug veloria --rotate-jwt --apply
```

تدوير metrics token:

```bash
deploy/scripts/rotate_client_secrets.sh --slug veloria --rotate-metrics --apply
```

تدوير الاثنين:

```bash
deploy/scripts/rotate_client_secrets.sh --slug veloria --rotate-jwt --rotate-metrics --apply
```

## 4. النسخ الاحتياطي

```bash
deploy/scripts/backup_client_store.sh --slug veloria
```

ينتج:

- نسخة قاعدة البيانات
- نسخة الملفات المرفوعة
- snapshot من ملف البيئة

## 5. الاستعادة

```bash
deploy/scripts/restore_client_store.sh --slug veloria --db-backup /opt/backups/veloria/veloria-db-XXXX.sql.gz --uploads-backup /opt/backups/veloria/veloria-uploads-XXXX.tar.gz
```

## 6. التحقق التشغيلي

```bash
deploy/scripts/verify_client_stack.sh --slug veloria
```

التحقق يشمل:

- حالة الحاويات
- `/api/health`
- `/api/health/ready`
- `/api/metrics` إذا كان `METRICS_TOKEN` مضبوطًا

## 7. ملاحظات مهمة

- `METRICS_TOKEN` يجب ألا يبقى فارغًا في بيئة الإنتاج
- تغيير `JWT_SECRET` يبطل الجلسات الحالية
- يجب أخذ backup قبل أي restore أو rotation كبيرة
