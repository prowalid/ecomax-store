# 🔍 تقرير جاهزية المشروع للإنتاج
## Express Trade Kit — Production Readiness Audit

---

## الملخص التنفيذي

المشروع في **مرحلة MVP متقدمة** وبه أساس صلب (JWT Auth, Zod Validation, Rate Limiting, Parameterized SQL). لكنه **غير جاهز حالياً للإنتاج الآمن** بدون معالجة الثغرات الحرجة أدناه.

| التصنيف | 🟢 جاهز | 🟡 يحتاج تعزيز | 🔴 حرج |
|---|---|---|---|
| **المصادقة (Auth)** | ✅ JWT + bcrypt(12) | ⚠️ لا توجد صلاحيات فرعية (RBAC) | — |
| **حماية الطرق (Routes)** | ✅ فصل Public/Protected واضح | — | — |
| **التحقق (Validation)** | ✅ Zod على Orders + Products | ⚠️ غائب عن Categories, Customers, Settings, Pages | — |
| **حماية SQL** | ✅ Parameterized Queries ($1) | ✅ pg-format للـ bulk ops | — |
| **Rate Limiting** | ✅ Auth, Orders, Cart, Discounts, CAPI | ⚠️ غائب عن Products GET, Categories, Settings | — |
| **رفع الملفات (Upload)** | — | — | 🔴 بدون فلتر نوع/حجم |
| **الخوذة الأمنية (Helmet)** | — | — | 🔴 غير مثبتة |
| **HTTPS** | — | — | 🔴 HTTP فقط حالياً |
| **قاعدة البيانات** | ✅ Pool + Error handler | ⚠️ بدون SSL | — |
| **إدارة الأخطاء** | ✅ Global Error Handler | ⚠️ تسريب stack traces في Dev | — |
| **البنية الأمامية** | ✅ Token في localStorage | ⚠️ حساس لـ XSS | — |

---

## 🔴 ثغرات حرجة (يجب إصلاحها قبل الإنتاج)

### 1. رفع الملفات بدون أي حماية
**الملف:** [upload.js](file:///root/express-trade-kit/server/src/routes/upload.js)

```javascript
// الحالي: لا يوجد فلتر نوع أو حد حجم!
const upload = multer({ storage });
```

**المخاطر:** يمكن لأي مستخدم مصادق رفع ملفات `.exe`, `.php`, `.sh` أو ملفات بحجم غير محدود.

**الإصلاح المطلوب:**
```javascript
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(ext && mime ? null : new Error('Only images allowed'), ext && mime);
  }
});
```

---

### 2. غياب Helmet (HTTP Security Headers)
**الملف:** [index.js](file:///root/express-trade-kit/server/src/index.js)

الخادم يضيف يدوياً 3 headers فقط (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`).
**مفقود:** `Strict-Transport-Security`, `Content-Security-Policy`, `X-XSS-Protection`, `X-Download-Options`, `X-DNS-Prefetch-Control`.

**الإصلاح:**
```bash
npm install helmet
```
```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

### 3. الموقع يعمل على HTTP بدون HTTPS
**المخاطر:** كل البيانات (كلمات المرور، التوكنات، بيانات العملاء) تُرسل بشكل مكشوف بين المتصفح والخادم.

**الإصلاح:**
- استخدم Reverse Proxy (Nginx/Caddy) مع شهادة SSL (Let's Encrypt مجانية).
- أو استخدم Cloudflare كـ Proxy.

---

### 4. `CORS_ORIGINS` فارغ = يقبل كل الأصول
**الملف:** [index.js](file:///root/express-trade-kit/server/src/index.js#L24-L27)

```javascript
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',')...;
// إذا كان فارغاً (كما هو حالياً في .env) → corsOrigins.length === 0 → يقبل الكل!
```

**الإصلاح:** أضف في `server/.env`:
```
CORS_ORIGINS=http://91.99.239.223:8080,https://yourdomain.com
```

---

## 🟡 مشاكل متوسطة الخطورة

### 5. غياب Zod Validation على عدة مسارات

| المسار | الحالة |
|---|---|
| `POST /api/categories` | ❌ بدون تحقق |
| `PATCH /api/categories/:id` | ❌ بدون تحقق |
| `POST /api/customers` | ❌ بدون تحقق |
| `PUT /api/settings/:key` | ❌ بدون تحقق |
| `POST /api/pages` | ❌ بدون تحقق |
| `PATCH /api/pages/:id` | ❌ بدون تحقق |
| `POST /api/discounts` | ❌ بدون تحقق |
| `PATCH /api/discounts/:id` | ❌ بدون تحقق |
| `POST /api/auth/login` | ❌ تحقق يدوي فقط |
| `POST /api/auth/register` | ❌ تحقق يدوي فقط |

---

### 6. Rate Limiting بالذاكرة فقط (In-Memory)
**الملف:** [rateLimit.js](file:///root/express-trade-kit/server/src/middleware/rateLimit.js)

- يُفقد عند إعادة تشغيل الخادم
- لا يعمل مع خوادم متعددة (multi-instance)
- يتراكم في الذاكرة ولا يتم تنظيفه (`Map` لا يحذف entries القديمة)

**الإصلاح:** استبدله بـ `express-rate-limit` + Redis store في بيئة الإنتاج.

---

### 7. JWT Token يُخزن في localStorage
**الملف:** [api.ts](file:///root/express-trade-kit/src/lib/api.ts#L8)

> `localStorage.getItem('auth_token')`

**المخاطر:** أي ثغرة XSS تتيح سرقة التوكن بالكامل.

**الحل المثالي:** `httpOnly` Cookie مع `SameSite=Strict`. لكن هذا يحتاج تغيير في بنية الخادم والعميل معاً.
**الحل الوسط المقبول:** تقصير مدة صلاحية التوكن من `7d` إلى `24h` + Refresh Token mechanism.

---

### 8. صلاحية التوكن طويلة جداً (7 أيام)
**الملف:** [authController.js](file:///root/express-trade-kit/server/src/controllers/authController.js#L37-L41)

```javascript
{ expiresIn: '7d' }
```

إذا سُرق التوكن، يبقى صالحاً لأسبوع كامل ولا توجد آلية لإبطاله (Token Revocation).

---

### 9. قاعدة البيانات بدون SSL
**الملف:** [db.js](file:///root/express-trade-kit/server/src/config/db.js)

اتصال PG Pool بدون `ssl: { rejectUnauthorized: false }`.
هذا مقبول فقط إذا كان DB وServer على نفس الجهاز (كما هو حالياً localhost).

---

### 10. `NODE_ENV` غير معين في `.env`
**الملف:** [server/.env](file:///root/express-trade-kit/server/.env)

لا يوجد `NODE_ENV=production`.
بدونه، الـ Error Handler يُسرّب رسائل الأخطاء التفصيلية (stack traces) إلى المستخدم.

---

## 🟢 نقاط القوة الموجودة

| الميزة | التفاصيل |
|---|---|
| ✅ **SQL Injection محمية** | كل الاستعلامات تستخدم `$1, $2...` placeholders |
| ✅ **Bcrypt بقوة 12** | تشفير كلمات المرور بمستوى إنتاجي ممتاز |
| ✅ **تسجيل مقفل** | `/register` يرفض بعد إنشاء أول أدمن |
| ✅ **Rate Limit على المسارات الحساسة** | Auth (30/10min), Orders (20/5min), Cart (120/min), Discounts (40/min) |
| ✅ **معاملات قاعدة بيانات (Transactions)** | الطلبات تستخدم `BEGIN/COMMIT/ROLLBACK` مع `FOR UPDATE` |
| ✅ **إدارة المخزون ذكية** | تعيد المخزون عند الإلغاء/الإرجاع تلقائياً |
| ✅ **Zod Schemas** | Orders و Products محمية بالكامل |
| ✅ **حساب السعر من الخادم** | `createOrder` يعيد حساب `subtotal` و `total` من قاعدة البيانات (لا يثق بالعميل) |
| ✅ **Global Error Handler** | يخفي التفاصيل في production mode |
| ✅ **Security Headers (جزئية)** | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` |

---

## 📋 خطة الإصلاح (مرتبة حسب الأولوية)

| # | المهمة | الأولوية | الجهد المقدر |
|---|---|---|---|
| 1 | فلتر نوع وحجم الملفات في Upload | 🔴 حرج | 15 دقيقة |
| 2 | تثبيت Helmet | 🔴 حرج | 5 دقائق |
| 3 | تعيين `CORS_ORIGINS` | 🔴 حرج | 2 دقائق |
| 4 | تعيين `NODE_ENV=production` | 🔴 حرج | 1 دقيقة |
| 5 | HTTPS (Nginx + Let's Encrypt) | 🔴 حرج | 30 دقيقة |
| 6 | إضافة Zod Schemas للمسارات الناقصة | 🟡 متوسط | 45 دقيقة |
| 7 | تقصير صلاحية JWT إلى 24h | 🟡 متوسط | 5 دقائق |
| 8 | Memory Leak في Rate Limiter (تنظيف Map) | 🟡 متوسط | 20 دقيقة |
| 9 | SSL لاتصال قاعدة البيانات | 🟢 منخفض | 5 دقائق |
| 10 | نقل Token إلى httpOnly Cookie | 🟢 منخفض | 2 ساعة |

---

> [!IMPORTANT]
> المهام 1-5 يجب تنفيذها **قبل** نشر المشروع للعملاء.
> المهام 6-8 يُفضل تنفيذها في أقرب وقت.
> المهام 9-10 تحسينات مستقبلية.
