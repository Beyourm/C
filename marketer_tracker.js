// marketer_tracker.js - النسخة النهائية التي تعتمد على الإضافة اليدوية للحقل

// ----------------------------------------------------
// الدالة المساعدة لاستخراج المعرّف من الرابط
// ----------------------------------------------------
function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// ----------------------------------------------------
// 1. التخزين الفوري: يلتقط المعرّف من الرابط ويحفظه في localStorage
// ----------------------------------------------------
(function handleMarketerIdStorage() {
    const marketerId = getParameterByName('marketer_id');

    if (marketerId) {
        // يحفظ القيمة في ذاكرة المتصفح
        localStorage.setItem('stored_marketer_id', marketerId);
        console.log('Marketer ID saved/updated:', marketerId);
    }
})();

// ----------------------------------------------------
// 2. التحديث: ينتظر تحميل الصفحة ويعبئ الحقل الموجود يدوياً
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', function() {
    
    // استرجاع القيمة المخزنة
    const storedMarketerId = localStorage.getItem('stored_marketer_id');
    
    // البحث عن الحقل الذي وضعته يدوياً في HTML
    const hiddenInput = document.getElementById('marketer_id_input'); 

    // التحقق والتحديث: إذا كانت هناك قيمة مخزنة والحقل موجود
    if (storedMarketerId && hiddenInput) {
        hiddenInput.value = storedMarketerId;
        console.log('Hidden field updated successfully to:', storedMarketerId);
    } else if (!hiddenInput) {
        // رسالة تحذير مفيدة لك إذا نسيت إضافة الحقل في النموذج
        console.warn('WARNING: The hidden input field (id="marketer_id_input") is MISSING from the HTML form. Marketer ID will not be sent.');
    }
    // ملاحظة: إذا لم تكن هناك قيمة مخزنة، سيبقى الحقل فارغاً، وهذا صحيح.
});
