// ======================
// dashboard-unified.js
// ======================

// رابط Web App الذي يستقبل POST للتحقق من كلمة المرور (استبدل بالرابط الفعلي لديك)
const PASSWORD_CHECK_URL = 'https://script.google.com/macros/s/AKfycbw8WP1PDLGh45pD-50As-LmwGPqKdpSIOxxvlDHQk66DlJ5NyamHrSUFFTlZs5yCAmppw/exec';

// المعرف الذي له صلاحية رؤية الحقل
const ADMIN_MARKETER_ID = 'TTTTTT11';
const ADMIN_AUTH_KEY = 'admin_verified_' + ADMIN_MARKETER_ID;

// دالة تحقق عبر POST (آمنة نسبياً - لا تظهر كلمة المرور في URL)
async function verifyPasswordPOST(marketerId, password) {
  try {
    const res = await fetch(PASSWORD_CHECK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketerId: marketerId, password: password })
    });

    if (!res.ok) {
      console.error('HTTP error', res.status);
      return false;
    }

    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.error('Network error', err);
    return false;
  }
}

// عرض/إخفاء الحقل بناءً على حالة التحقق (تُستدعى بعد التحقق أو عند التحميل)
function renderDiscountSection() {
  const container = document.getElementById('discount-container');
  if (!container) return;

  const marketerId = localStorage.getItem('stored_marketer_id') || null;
  const verified = sessionStorage.getItem(ADMIN_AUTH_KEY) === '1';

  if (marketerId === ADMIN_MARKETER_ID && verified) {
    container.style.display = 'block';
  } else {
    container.style.display = 'none';
  }
}

// حدث الضغط على زر البحث/التحقق
async function onDiscountSearchClickSecure() {
  const marketerId = localStorage.getItem('stored_marketer_id') || '';
  if (!marketerId) {
    alert('المعرّف غير موجود. الرجاء تسجيل الدخول أو وضع المعرّف أولاً.');
    return;
  }

  // إذا لم نتحقق سابقاً في هذه الجلسة، نطلب كلمة المرور
  if (sessionStorage.getItem(ADMIN_AUTH_KEY) !== '1') {
    const pwd = prompt('أدخل كلمة المرور للتحقق:');
    if (!pwd) return;

    const ok = await verifyPasswordPOST(marketerId, pwd);
    if (!ok) {
      alert('كلمة المرور خاطئة.');
      return;
    }

    // نجاح التحقق: حفظ حالة الجلسة وإظهار الحقل
    sessionStorage.setItem(ADMIN_AUTH_KEY, '1');
    renderDiscountSection();
    alert('تم التحقق. يمكنك الآن إدخال كود التخفيض.');
    return;
  }

  // لو تم التحقق مسبقاً: تعامل مع الكود المدخل
  const code = document.getElementById('discount-input').value.trim();
  if (!code) {
    alert('أدخل كود التخفيض أولاً.');
    return;
  }

  // هنا نفّذ ما تريده بالكود (مثال: إرسال للخادم أو نسخ)
  alert('تم إدخال الكود: ' + code);
}

// تهيئة: ثبت الحدث عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // تأكد من رندر أولي (لو الجلسة محفوظة)
  renderDiscountSection();

  const btn = document.getElementById('discount-search-btn');
  if (btn) btn.addEventListener('click', onDiscountSearchClickSecure);
});




