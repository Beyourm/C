// ⛔⛔⛔ هام: تم تحديث هذا بالرابط الجديد بعد نشر Google Apps Script ⛔⛔⛔
const APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxvaDty4OhXdnR3poYEuwj9W53esn2923XYpKZc7LTKf_M17Z576YGP_EkjB9bt-hN8pA/exec";

let COURSES = []; // قائمة الدورات الآن ديناميكية


// ====== الدوال الأساسية ======

/**
 * 1. استخلاص معرّف المسوِّق من رابط URL الحالي
 * @returns {string} معرّف المسوِّق أو القيمة الافتراضية TTTTTT11
 */
function getMarketerIdFromUrl() {
    const fallbackId = 'TTTTTT11';
    const urlParams = new URLSearchParams(window.location.search);
    
    return urlParams.get('marketer_id') || urlParams.get('id') || fallbackId;
}

const marketerId = getMarketerIdFromUrl();


/**
 * 2. دالة لجلب الدورات من Google Sheets API
 */
async function fetchCourses() {
    const listContainer = document.getElementById('courseList');
    listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color:#555;">جارٍ تحميل الدورات...</div>';
    listContainer.style.display = 'block'; // إظهار رسالة التحميل

    try {
        const response = await fetch(APP_SCRIPT_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // التأكد من وجود مصفوفة الدورات
        if (data && data.courses && Array.isArray(data.courses)) {
            COURSES = data.courses; // تعيين القائمة العالمية
            renderCourseList(); // عرض الدورات المجلوبة
        } else {
            throw new Error("تنسيق بيانات غير صالح من الخادم.");
        }
    } catch (error) {
        console.error("Error fetching courses:", error);
        listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color:#ef4444;">❌ فشل تحميل الدورات. تحقق من رابط Apps Script.</div>';
    }
}


/**
 * 3. بناء وإضافة عناصر الدورات إلى قائمة القائمة
 */
function renderCourseList() {
    const listContainer = document.getElementById('courseList');
    listContainer.innerHTML = ''; // تنظيف القائمة

    if (COURSES.length === 0) {
         listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color:#555;">لا توجد دورات متاحة حالياً.</div>';
         return;
    }

    COURSES.forEach(course => {
        const item = document.createElement('div');
        item.className = 'course-item';
        
        // بناء المحتوى
        // يتم عرض اسم الدورة ورسومها
        item.innerHTML = `
          <span>${course.name}</span>
          <span class="levies-text">الرسوم: ${course.levies}</span>
        `;
        
        // نستخدم course.slug الذي هو في الواقع قيمة العمود A (id)
        item.setAttribute('onclick', `copyLink('${course.slug}')`); 
        listContainer.appendChild(item);
    });
}

/**
 * 4. تبديل حالة عرض وإخفاء قائمة الدورات
 */
function toggleList() {
    const list = document.getElementById('courseList');
    const arrow = document.getElementById('arrow');
    const isVisible = list.style.display === 'block';
    
    list.style.display = isVisible ? 'none' : 'block';
    arrow.classList.toggle('rotate');

    // إذا تم فتح القائمة، تأكد من جلب الدورات إذا لم يتم جلبها مسبقًا
    if (!isVisible && COURSES.length === 0) {
        fetchCourses();
    }
}


/**
 * 5. الدالة المعدلة لنسخ الرابط مع إضافة معرّف المسوِّق
 * @param {string} courseSlug - الـ slug الخاص بالدورة (قيمة العمود A/id)
 */
function copyLink(courseSlug) {
    // 🔗 هذا هو الرابط الأساسي لصفحة الدورة الصحيحة
    const baseUrl = "https://skillia.netlify.app/course.html"; 
    
    // بناء رابط الدورة بالتنسيق الصحيح: ?id=SLUG&marketer_id=CODE
    let fullLink = baseUrl + "?id=" + courseSlug;

    // إضافة معرّف المسوِّق كبارامتر ثانٍ باستخدام علامة العطف '&'
    fullLink += "&marketer_id=" + marketerId;
    
    navigator.clipboard.writeText(fullLink).then(() => {
        const msg = document.getElementById('message');
        msg.style.display = 'block';
        msg.innerHTML = `تم نسخ رابط الدورة <span style="font-weight: bold; color: #1d4ed8;">${courseSlug.toUpperCase()}</span> بنجاح!<br> تم إضافة كودك: <span style="font-weight: bold;">${marketerId}</span> ✅`;
        setTimeout(() => msg.style.display = 'none', 3000);
    });
}

/**
 * 6. إغلاق النافذة المنبثقة
 */
function closeDialog() {
    document.getElementById('dialogOverlay').style.display = 'none';
}


/**
 * 7. دالة التهيئة الرئيسية التي يتم استدعاؤها عند تحميل الصفحة
 */
function initializeDialog() {
    // 1. تحديث رأس الدايلوج لعرض كود المسوِّق
    const header = document.querySelector('.dialog-header');
    header.innerHTML = `🎓اختر الدورة المراد التسوق لها (كودك: <span style="color:#2563eb;">${marketerId}</span>)`;
    
    // 2. عرض الدايلوج
    document.getElementById('dialogOverlay').style.display = 'flex';

    // 3. ربط زر الإغلاق وزر التبديل باستخدام Event Listeners
    document.getElementById('closeButton').addEventListener('click', closeDialog);
    
    // 4. ربط زر التبديل (عند الضغط عليه لأول مرة، سيقوم بتحميل الدورات)
    document.getElementById('toggleButton').addEventListener('click', toggleList);

    // 5. محاولة جلب الدورات عند التهيئة (يمكن إزالة هذا السطر والاعتماد فقط على toggleList)
    //fetchCourses();
}





//هنا ينتهي ملف js
