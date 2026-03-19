# OpenAPI Specification

هذا المجلد يحتوي على التوثيق الفني المعياري (OpenAPI/Swagger) لواجهة التطبيق البرمجية الخاصة بـ Express Trade Kit.

## بنية المجلد
- `openapi.json`: الملف الأساسي الذي يحتوي على مسارات API المستقرة. تم تنظيمه بحيث يسهل إضافة مسارات أعمق لاحقًا.
- واجهة `Swagger UI` متاحة بشكل تلقائي ومباشر للمطورين على الرابط `/api/docs`.
- النسخة الخام من الـ spec متاحة أيضًا على `/api/openapi.json`.

## كيفية التحديث لاحقًا
1. افتح الملف `openapi.json` وقم بتعديل أو إضافة المسارات المطلوبة.
2. اتبع نفس نمط هيكلة [OpenAPI 3.0](https://swagger.io/specification/). 
   - يمكنك إضافة `paths` جديدة أسفل هيكل `"paths": { ... }`
   - يمكنك إضافة هياكل البيانات `schemas` تحت `"components"`.
3. لا يتطلب تفعيل التغييرات سوى إعادة تشغيل خادم `Node.js` ليتمكن `swagger-ui-express` من تقديم النسخة المحدثة.

## ما الذي يغطيه التوصيف الحالي

النسخة الحالية تغطي المسارات الأكثر استقرارًا في المشروع:

- `health`
- `auth`
- `orders`
- `products`
- `categories`
- `settings`

ويمكن توسيعها لاحقًا إلى:

- `customers`
- `pages`
- `cart`
- `integrations`
- `analytics`
- `blacklist`
