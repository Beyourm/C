
const isLoggedIn = localStorage.getItem(MARKETER_SESSION_KEY);
if (!isLoggedIn) {
    window.location.href = "index.html"; // إعادة التوجيه مباشرة
}

// logout.js
// ======================================================================
// 🧾 دالة تسجيل الخروج للمسوقين - متوافقة مع المفاتيح المستخدمة في النظام
// ======================================================================

// المفاتيح المستخدمة في التطبيق
const DEVICE_SERIAL_KEY = 'marketer_device_serial';
const MARKETER_SESSION_KEY = 'marketer_session_data';
const OTP_PENDING_KEY = 'otp_pending_login';

// ----------------------------------------------------------------------
// 🎯 دالة تنفيذ تسجيل الخروج
// ----------------------------------------------------------------------
function logoutUser() {
  // تأكيد المستخدم قبل تسجيل الخروج
  const confirmLogout = confirm("هل أنت متأكد أنك تريد تسجيل الخروج؟");
  if (!confirmLogout) return;

  // حذف البيانات من Local Storage
  localStorage.removeItem(DEVICE_SERIAL_KEY);
  localStorage.removeItem(MARKETER_SESSION_KEY);
  localStorage.removeItem(OTP_PENDING_KEY);
  localStorage.removeItem('stored_marketer_id');
  // يمكن حذف كل شيء إذا أردت مسح تام:
  // localStorage.clear();

  // عرض تنبيه بسيط أو يمكنك استبداله برسالة جميلة في الواجهة
  alert("تم تسجيل الخروج بنجاح 👋");

  // إعادة التوجيه إلى صفحة تسجيل الدخول
  window.location.href = "index.html"; // عدّل إذا كانت صفحة الدخول باسم آخر
}

// ----------------------------------------------------------------------
// 🧩 ربط الزر بالدالة (إذا وُجد في الصفحة)
// ----------------------------------------------------------------------
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", logoutUser);
}
