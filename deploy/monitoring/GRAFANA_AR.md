# Grafana Monitoring

هذا القسم يشرح تشغيل Grafana فوق Prometheus الحالي داخل بيئة المراقبة.

## التشغيل

شغّل stack المراقبة من:

```bash
docker compose -f deploy/docker-compose.monitoring.yml up -d
```

## الوصول

- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3002`
- بيانات الدخول الافتراضية:
  - `admin`
  - `admin`

## ما الذي تم provisioning له

- datasource واحدة إلى Prometheus
- dashboard رئيسية:
  - `Express Trade Kit API Overview`
- dashboard ثانية:
  - `Express Trade Kit Queue and Events`

## ما الذي تراقبه الداشبوردات

- حجم الطلبات حسب `method`
- توزيع `status_code`
- `p95` latency
- `in-flight requests`
- `domain events queued/published`
- `up{job="etk_api"}`

## ملاحظة مهمة

إشارات `health/ready` الحالية تظهر عبر `up` و`/api/health` في التشغيل، بينما القياسات Prometheus المتاحة تغطي الطلبات والأحداث بشكل مباشر.
