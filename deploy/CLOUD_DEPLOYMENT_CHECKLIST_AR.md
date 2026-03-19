# قائمة الجاهزية للرفع إلى الكلاود

هذا الملف هو نقطة البداية العملية قبل رفع `Express Trade Kit` إلى بيئة سحابية أو قبل تفعيل إصدار رسمي جديد عبر `CD`.

## 1. الملفات المرجعية الأساسية

ابدأ من هذه الملفات قبل أي رفع:

- [ARCHITECTURE_TRANSFORMATION_STATUS_AR.md](/root/express-trade-kit/docs/ARCHITECTURE_TRANSFORMATION_STATUS_AR.md)
- [CD_GITHUB_RUNBOOK_AR.md](/root/express-trade-kit/deploy/CD_GITHUB_RUNBOOK_AR.md)
- [SECRETS_AND_OPERATIONS_RUNBOOK_AR.md](/root/express-trade-kit/deploy/SECRETS_AND_OPERATIONS_RUNBOOK_AR.md)
- [docker-compose.client-stack.yml](/root/express-trade-kit/deploy/docker-compose.client-stack.yml)
- [client-multi.env.template](/root/express-trade-kit/deploy/client-multi.env.template)
- [releases.json](/root/express-trade-kit/deploy/releases.json)

## 2. تحقق من الجاهزية قبل الإصدار

يجب أن تكون هذه الخطوات ناجحة محليًا أو في `CI`:

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`
- `docker build -f server/Dockerfile -t etk-api-ci .`
- `docker build -f Dockerfile.web -t etk-web-ci .`

## 3. تحقق من ملف الإصدار

قبل أي `CD` رسمي:

- أضف الإصدار الجديد إلى [releases.json](/root/express-trade-kit/deploy/releases.json)
- اجعل `latest.stable` يطابق الإصدار الجديد
- تأكد أن `api_image` و`web_image` يطابقان tag الإصدار نفسه

## 4. تحقق من البيئة الإنتاجية

في ملف البيئة الخاص بالعميل يجب التأكد من:

- `ETK_API_IMAGE`
- `ETK_WEB_IMAGE`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `METRICS_TOKEN`
- `QUEUE_DRIVER=bullmq`
- `RATE_LIMIT_STORE=redis`
- `CACHE_DRIVER=redis`
- `STORAGE_DRIVER`
- `STORAGE_PUBLIC_PREFIX`
- `LOG_LEVEL`

## 5. تحقق من GitHub قبل تفعيل CD

الأسرار المطلوبة:

- `STEPDZ_SERVER_HOST`
- `STEPDZ_SERVER_USER`
- `STEPDZ_SSH_PRIVATE_KEY`

المتغيرات الاختيارية:

- `STEPDZ_PROJECT_NAME`
- `STEPDZ_CLIENT_DIR`

## 6. تحقق بعد النشر

بعد النشر يجب أن يمر على الأقل هذا الفحص:

- `/api/health`
- `/api/health/ready`
- `/api/health/version`
- `/api/openapi.json`
- `/api/docs`
- `/api/metrics` باستخدام `METRICS_TOKEN`

واستخدم أيضًا:

```bash
bash deploy/scripts/verify_client_stack.sh --slug stepdz
```

## 7. المراقبة بعد الرفع

إذا كانت stack المراقبة مفعلة:

- شغّل [docker-compose.monitoring.yml](/root/express-trade-kit/deploy/docker-compose.monitoring.yml)
- راجع [GRAFANA_AR.md](/root/express-trade-kit/deploy/monitoring/GRAFANA_AR.md)
- تحقق من dashboard الخاصة بالـ API والـ queue

## 8. قاعدة قرار سريعة

لا ترفع إلى الكلاود إذا كان واحد من الآتي غير محقق:

- الاختبارات لا تمر
- `typecheck` يفشل
- `releases.json` غير محدث
- `METRICS_TOKEN` فارغ في الإنتاج
- Secrets `CD` غير مضبوطة
- التحقق بعد النشر غير واضح أو غير موثق
