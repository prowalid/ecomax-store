# قواعد المصدر والإصدار (مرجع إلزامي)

هذا الملف هو المرجع التنفيذي الإلزامي لأي وكيل أو مطور يعمل على المشروع.  
أي خطوة تخالف هذا الملف تعتبر خطأ تشغيليًا.

## 1) التعاريف الأساسية

- `GitHub` = مصدر الحقيقة الوحيد للكود وملفات `deploy`.
- `GHCR` = مخزن صور التشغيل الرسمية فقط.
- `/opt/client-stores/*` = بيئات تشغيل عملاء (ليست مصدر تطوير).
- `stepdz` = بيئة اختبار واعتماد قبل الإصدار الرسمي.

## 2) قاعدة المصدر الوحيد

أي تعديل يبدأ من repo فقط:

```text
/root/express-trade-kit
```

ممنوع اعتبار أي ملف داخل `/opt` كمرجع للكود.

## 3) المساران الرسميان فقط

### A) مسار الاختبار (Test mode)

الغرض: تجربة التعديلات على `stepdz` فقط بدون إصدار رسمي.

الأمر الرسمي:

```bash
bash deploy/scripts/test_stepdz.sh
```

النتيجة المتوقعة:
- صور اختبار محلية (`stepdz-test`).
- تحديث `stepdz` فقط.
- لا يوجد `git push` ولا `docker push`.

### B) مسار الإصدار (Release mode)

الغرض: إصدار رسمي جديد ورفعه إلى GHCR.

الأمر الرسمي:

```bash
bash deploy/scripts/release_version.sh --version vX.Y.Z
```

النتيجة المتوقعة:
- بناء صور `api/web` بإصدار رسمي.
- رفع `version + latest` إلى GHCR.
- تحديث `stepdz` إلى الإصدار الرسمي نفسه.
- رفض التنفيذ تلقائيًا إذا:
  - الفرع ليس `main`.
  - `HEAD` المحلي لا يطابق `origin/main`.
  - الإصدار `vX.Y.Z` موجود مسبقًا في GHCR.

## 4) التسلسل الإلزامي الصحيح

```text
repo change -> stepdz test -> owner approval -> git commit/push -> release script -> verify
```

ممنوع عكس الترتيب.

## 5) أوامر Git الإلزامية قبل أي Release

نفّذ حرفيًا:

```bash
git branch --show-current
git fetch origin
git pull --rebase origin main
git status
```

الشروط:
- الفرع الحالي = `main`.
- لا توجد تعارضات.
- لا توجد ملفات غير مفهومة.

## 6) الالتزام (Commit) بطريقة صحيحة

مسموح:

```bash
git add <file1> <file2> <file3>
git commit -m "type(scope): short message"
git push origin main
```

ممنوع:
- `git add .`
- `git add -A`
- أي commit عشوائي يضم ملفات بيئة أو ملفات لا تخص المهمة.

## 7) تحقق إلزامي قبل تشغيل Release Script

تحقق أن المحلي مطابق للمرفوع:

```bash
git rev-parse HEAD
git rev-parse origin/main
```

الشرط:
- القيمتان يجب أن تتطابقا قبل `release_version.sh`.

إذا لم تتطابقا: لا تبدأ الإصدار.

ملاحظة:
- سكربت `release_version.sh` يطبق هذه التحققّات تلقائيًا أيضًا كحاجز حماية إضافي.

## 8) تعريف واضح للحالتين

### Test mode

- `ETK_WEB_IMAGE=...:stepdz-test` أو `ETK_API_IMAGE=...:stepdz-test`
- حالة اختبار فقط.
- ممنوع وصفها كنسخة رسمية.

### Release mode

- `ETK_WEB_IMAGE=...:vX.Y.Z`
- `ETK_API_IMAGE=...:vX.Y.Z`
- حالة إصدار رسمي.

## 9) ممنوعات تشغيلية صريحة

- ممنوع البناء اليدوي للإصدار الرسمي بأوامر Docker بدل السكربت الرسمي.
- ممنوع تعديل `/opt/client-stores/stepdz/.env.registry` يدويًا في مسار الإصدار الرسمي.
- ممنوع إعادة استخدام tag رسمي قديم لإصدار جديد.
- ممنوع إعلان "تم التثبيت" قبل اكتمال التحقق النهائي.
- ممنوع اعتماد `/opt/client-stores/*` كمصدر تطوير.

## 10) متى نحتاج Release جديد في GHCR

نحتاج Release جديد إذا تغير:
- كود `web`.
- كود `api`.
- أي شيء يؤثر داخل صورة Docker.

لا نحتاج Release جديد إذا كان التغيير فقط:
- توثيق.
- سكربتات تشغيل لا تدخل صورة `api/web`.
- ملفات `Caddy` أو ملفات نشر خارج الصور.

## 11) التحقق الإلزامي بعد الاختبار أو الإصدار

نفّذ:

```bash
git status
git rev-parse --short HEAD
docker compose -p stepdz --env-file /opt/client-stores/stepdz/.env.registry -f /opt/client-stores/stepdz/docker-compose.yml ps
grep -E '^ETK_(API|WEB)_IMAGE=' /opt/client-stores/stepdz/.env.registry
```

النتيجة المطلوبة:
- الحاويات `api/web/db` في حالة `Up` و`Healthy` (حيث ينطبق).
- الصور في `.env.registry` تطابق ما تم الإعلان عنه.

## 12) تعريف "تم الإنجاز" (Definition of Done)

لا يحق لأي وكيل قول "تم" إلا إذا تحققت كل النقاط:

1. الكود الصحيح موجود في repo.
2. تم `commit` و`push` على `main` (في مسار الإصدار).
3. تم تشغيل السكربت الرسمي الصحيح حسب المسار.
4. التحقق النهائي يثبت الإصدار/الاختبار الفعلي على `stepdz`.

## 13) أوامر مرجعية سريعة

### اختبار فقط

```bash
bash deploy/scripts/test_stepdz.sh
```

### إصدار رسمي

```bash
bash deploy/scripts/release_version.sh --version v1.0.7
```

### فحص الحالة

```bash
docker compose -p stepdz --env-file /opt/client-stores/stepdz/.env.registry -f /opt/client-stores/stepdz/docker-compose.yml ps
grep -E '^ETK_(API|WEB)_IMAGE=' /opt/client-stores/stepdz/.env.registry
```

## 14) مسؤولية الوكيل

مسؤولية الوكيل ليست "تنفيذ أوامر فقط"، بل:
- الالتزام الحرفي بالمسار.
- منع خلط Test مع Release.
- منع أي خطوة قد تلوث الإصدار الرسمي أو تربك بيئة التشغيل.
