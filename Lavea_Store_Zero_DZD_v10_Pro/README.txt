LAVÉA STORE PRO v6 — Motion + Admin + Product Pages + Landing Pages + Pixels

1) التشغيل محلياً — Windows
- ثبّت Node.js 18 أو أحدث.
- افتح هذا المجلد في CMD/PowerShell.
- نفّذ: npm install
- ثم: npm start
- افتح: http://localhost:3000
- لوحة التحكم: http://localhost:3000/admin
- كلمة المرور الافتراضية محلياً: Lavea@2026

2) الصور من لوحة التحكم
- المنتجات > إضافة/تعديل منتج > اختيار صورة من الملفات.
- اختر JPG/PNG/WebP/GIF/AVIF.
- الصورة تُرفع إلى images/uploads ويُحفظ مسارها مع المنتج.
- يمكنك أيضاً رفع صورة Hero من إعدادات المتجر.

3) Product Page و Landing Page
- الضغط على بطاقة المنتج يفتح ?product=slug.
- لكل منتج Landing Page عبر ?landing=slug.
- من لوحة التحكم تستطيع تعديل عنوان ووصف الـLanding وتفعيل/تعطيلها.

4) التوصيل
- لوحة التحكم > التوصيل.
- سعر افتراضي للمنزل.
- سعر افتراضي للمكتب.
- سعر منفصل لكل ولاية.
- تفعيل/تعطيل أي ولاية.
- الطلب يسجل نوع التوصيل (home/office) والسعر والإجمالي.

5) Pixels
من لوحة التحكم > Pixels & Marketing ضع:
- Meta Pixel ID
- TikTok Pixel ID
- Google Analytics ID

الأحداث المجهزة في الواجهة:
- PageView
- ViewContent
- AddToCart
- InitiateCheckout
- Purchase

ملاحظة أمنية: لا تضع Meta CAPI Access Token أو TikTok Events API Access Token في JavaScript أو داخل GitHub. إذا أردت Events API server-side، ضع التوكنات كـ Environment Variables في الاستضافة.

6) GitHub
GitHub Pages مناسب للواجهة static فقط. هذه النسخة تحتاج Node/API لأن الطلبات ولوحة الإدارة ورفع الصور تعمل على الخادم.

الطريقة الأسهل:
A) أنشئ Repository جديد على GitHub.
B) ارفع محتويات lavea-store إلى repository.
C) على Render أو Railway اربط الـrepository.
D) Build: npm install
E) Start: npm start
F) أضف Environment Variable:
   ADMIN_PASSWORD=ضع_كلمة_مرور_قوية_هنا
G) بعد النشر افتح رابط الخدمة ثم /admin.

إذا أردت GitHub Pages فقط:
- يمكن نشر الواجهة، لكن لا تعتمد على /api أو لوحة الإدارة المركزية أو رفع الصور من GitHub Pages.
- الحل الصحيح للمتجر الكامل: GitHub للـsource + Render/Railway/Supabase أو VPS للـbackend/database.

7) قبل الإطلاق الحقيقي
- غيّر ADMIN_PASSWORD.
- أضف Domain مخصص.
- فعّل HTTPS.
- ضع قاعدة بيانات حقيقية بدل JSON عندما يزيد عدد الطلبات.
- أضف Meta Pixel وTikTok Pixel IDs.
- اختبر AddToCart وInitiateCheckout وPurchase من Events Manager.
- لا تضع أي Access Token سري في ملفات frontend.


--- Lavéa v12 ---
تم تحديث لوحة الإدارة لتكون Mobile-first مع مركز إشعارات، بحث وفلاتر للطلبات والمنتجات، بطاقات طلبات متجاوبة، تنبيهات المخزون المنخفض، إشعارات المتصفح، وتحسينات UX وإغلاق القوائم تلقائياً على الهاتف.
