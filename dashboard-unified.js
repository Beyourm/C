// ======================
// dashboard-unified.js
// ======================

// رابط Web App الجديد للتحقق من كلمة المرور
const PASSWORD_CHECK_URL = 'https://script.google.com/macros/s/AKfycbw8WP1PDLGh45pD-50As-LmwGPqKdpSIOxxvlDHQk66DlJ5NyamHrSUFFTlZs5yCAmppw/exec';

// معرف المسوق المسؤول
const ADMIN_MARKETER_ID = 'TTTTTT11';
const ADMIN_AUTH_KEY = 'admin_verified_' + ADMIN_MARKETER_ID;

// ==== دالة تحقق كلمة المرور عبر POST ====
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

// ==== عرض الحقل المخفي إذا تم التحقق ====
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

// ==== عند الضغط على أيقونة البحث ====
async function onDiscountSearchClickSecure() {
  const marketerId = localStorage.getItem('stored_marketer_id') || '';
  if (!marketerId) {
    alert('المعرّف غير موجود. الرجاء تسجيل الدخول أو وضع المعرّف أولاً.');
    return;
  }

  // تحقق أول مرة فقط
  if (sessionStorage.getItem(ADMIN_AUTH_KEY) !== '1') {
    const pwd = prompt('أدخل كلمة المرور للتحقق:');
    if (!pwd) return;

    const ok = await verifyPasswordPOST(marketerId, pwd);
    if (!ok) {
      alert('كلمة المرور خاطئة.');
      return;
    }

    // تم التحقق بنجاح
    sessionStorage.setItem(ADMIN_AUTH_KEY, '1');
    renderDiscountSection();
    alert('تم التحقق. يمكنك الآن إدخال كود التخفيض.');
    return;
  }

  // بعد التحقق: قم بالإجراء المطلوب بالكود
  const code = document.getElementById('discount-input').value.trim();
  if (!code) {
    alert('أدخل كود التخفيض أولاً.');
    return;
  }
  alert('تم إدخال الكود: ' + code);
}

// ==== تهيئة الصفحة عند التحميل ====
document.addEventListener('DOMContentLoaded', () => {
  renderDiscountSection();
  const btn = document.getElementById('discount-search-btn');
  if (btn) btn.addEventListener('click', onDiscountSearchClickSecure);
});
