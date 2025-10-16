// --- في ملف dashboard.js ---

/**
 * دالة لفتح الدايلوج (الـ Modal) وتحميل محتوى dialog.html فيه.
 */
function openCoursesDialog() {
    // 1. استخلاص معرف المسوق من رابط لوحة التحكم
    const urlParams = new URLSearchParams(window.location.search);
    const marketerId = urlParams.get('marketer_id') || urlParams.get('id');
    
    // 2. بناء رابط ملف الدايلوج مع تمرير المعرف
    let dialogUrl = 'dialog.html'; 
    if (marketerId) {
        dialogUrl += `?id=${marketerId}`; 
    }
    
    // 3. تحديد عناصر الـ Modal
    const modal = document.getElementById('coursesModalOverlay');
    const iframe = document.getElementById('dialogIframe');
    
    // 4. تعيين مصدر الـ iframe وإظهار الـ Modal
    iframe.src = dialogUrl;
    modal.style.display = 'flex';
}

/**
 * دالة لإغلاق الـ Modal
 */
function closeCoursesDialog() {
    const modal = document.getElementById('coursesModalOverlay');
    modal.style.display = 'none';
    // تفريغ مصدر الـ iframe
    document.getElementById('dialogIframe').src = '';
}

// 5. تهيئة زر الإغلاق عند تحميل لوحة التحكم (مستمع الحدث)
document.addEventListener('DOMContentLoaded', () => {
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        // ربط زر الإغلاق في الـ Modal بالدالة
        closeModalBtn.addEventListener('click', closeCoursesDialog);
    }
    
    // لإغلاق الـ Modal عند الضغط على مفتاح ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.getElementById('coursesModalOverlay').style.display === 'flex') {
            closeCoursesDialog();
        }
    });
});






// dashboard.js

// الاستيراد من ملف balance_logic.js
// تأكد أن المسار './balance_logic.js' صحيح (يجب أن يكون الملفان في نفس المجلد)
import { initBalanceDisplay } from './balance_logic.js'; 

// دالة تهيئة لوحة التحكم الرئيسية
function initializeDashboard() {
    // 1. جلب ID المسوّق من الرابط (Marketer ID Logic)
    const urlParams = new URLSearchParams(window.location.search);
    
    // ملاحظة: نبحث عن 'id' في رابط لوحة التحكم (dashboard.html?id=...)
    // وإذا لم نجده، نستخدم 'marketer_id' كمعامل احتياطي
    const marketerIdFromURL = urlParams.get('id') || urlParams.get('marketer_id');

    // إذا لم يتم العثور على ID في الرابط، استخدم قيمة تجريبية لضمان عمل الصفحة
    const defaultMarketerId = 'FVAPOW40'; 
    const finalMarketerId = marketerIdFromURL || defaultMarketerId; 

    // 2. عرض الـ ID في الهيدر (افترضنا وجود عنصر بالـ ID: marketer-id-display)
    const idDisplayElement = document.getElementById('marketer-id-display');
    if (idDisplayElement) {
        idDisplayElement.innerHTML = `معرّفك: <span class="id-highlight">${finalMarketerId}</span>`;
    }

    // 3. استدعاء دالة جلب وعرض الرصيد الجديدة
    initBalanceDisplay(finalMarketerId);
    
    // 4. محاكاة إظهار لوحة التحكم بعد جلب كل البيانات
    setTimeout(() => {
        const statusMsg = document.getElementById('statusMessage');
        const dashboard = document.getElementById('dashboardContent');
        if (statusMsg) statusMsg.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
    }, 1500); 
    
    // 5. استدعاء أي وظائف تهيئة أخرى لديك (مثل المخططات البيانية)
    if (typeof initPlaceholderChart === 'function') {
        initPlaceholderChart(); 
    }
}

// استدعاء وظيفة التهيئة عند تحميل الصفحة بالكامل
window.addEventListener('load', initializeDashboard);
