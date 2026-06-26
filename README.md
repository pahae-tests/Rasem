# رسم — متجر الرسومات الفنية

منصة تجارة إلكترونية كاملة لبيع الرسومات الفنية المرسومة يدوياً. مبنية بـ Next.js، TailwindCSS، وMySQL.

---

## المتطلبات

- Node.js >= 16
- MySQL >= 5.7 أو MariaDB >= 10.3

---

## التثبيت والتشغيل

### 1. استنساخ أو فك ضغط المشروع

```bash
cd rasem
```

### 2. تثبيت الاعتماديات

```bash
npm install
```

### 3. إعداد قاعدة البيانات

افتح MySQL وشغّل:

```sql
source database.sql
```

أو عبر الطرفية:

```bash
mysql -u root -p < database.sql
```

### 4. إعداد متغيرات البيئة

```bash
cp .env.example .env.local
```

ثم عدّل `.env.local` بمعلومات قاعدة بياناتك:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rasem_db

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
```

### 5. تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح على: http://localhost:3000

---

## بيانات الدخول الافتراضية للمدير

- **البريد:** admin@rasem.ma
- **كلمة المرور:** Admin@123

---

## هيكل المشروع

```
rasem/
├── components/
│   ├── admin/          # مكونات لوحة الإدارة
│   ├── layout/         # Navbar, Footer, Layout
│   └── ui/             # مكونات مشتركة
├── hooks/
│   └── useAuth.js      # سياق المصادقة
├── lib/
│   ├── auth.js         # JWT helpers
│   ├── db.js           # MySQL pool
│   ├── mail.js         # إرسال البريد
│   ├── parse-form.js   # Busboy parser
│   ├── pdf.js          # توليد PDF
│   └── validate.js     # validators
├── pages/
│   ├── api/            # جميع API Routes
│   ├── admin/          # لوحة الإدارة
│   ├── auth/           # صفحات المصادقة
│   └── ...             # صفحات الموقع
├── styles/
│   └── globals.css
├── database.sql        # Schema كامل
├── .env.example
└── package.json
```

---

## الميزات

### للزوار والعملاء
- استعراض وبحث وتصفية وترتيب الرسومات
- صفحة تفصيلية لكل رسم مع معرض الصور
- تسجيل حساب وتسجيل دخول
- إضافة للمفضلة
- طلب مباشر مع إدخال عنوان التوصيل
- تتبع الطلبات وإلغائها (قيد الانتظار فقط)
- تقييم الرسومات (للمشترين فقط)
- تعديل الملف الشخصي

### لوحة الإدارة
- داشبورد مع إحصائيات ورسوم بيانية
- إدارة الرسومات (إضافة/تعديل/حذف) مع رفع الصور
- إدارة الطلبات مع تغيير الحالة
- إرسال إيميل تأكيد/إلغاء تلقائي
- توليد فاتورة PDF عند التأكيد
- إدارة المستخدمين

---

## التقنيات المستخدمة

| التقنية | الاستخدام |
|---------|-----------|
| Next.js 13 (Pages Router) | Frontend + API Routes |
| TailwindCSS | التصميم |
| MySQL2 | قاعدة البيانات |
| JWT + bcryptjs | المصادقة |
| Busboy | رفع الملفات |
| jsPDF | توليد PDF |
| Recharts | الرسوم البيانية |
| Cairo Font | الخط العربي |
