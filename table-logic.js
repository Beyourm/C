// ----------------------------------------------------
// --- الثوابت والإعدادات ---
// ----------------------------------------------------

// 🛑 تم تحديث الرابط بناءً على طلبك
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxbYeuziWHe6ODINemry6n3XNfXTpDrZ2jxo1GXG9bAjm6AAhiCyogt3p1Y48qvJ1kppQ/exec'; 
const BASE_REGISTRATION_URL = 'https://skillia.netlify.app/courses.html'; 

const statusMessage = document.getElementById('statusMessage');
const dashboardContent = document.getElementById('dashboardContent');
const marketerIdDisplay = document.getElementById('marketer-id-display');
const referralsCount = document.getElementById('referrals-count');
const activeReferralsCount = document.getElementById('active-referrals-count');
const referralLinkText = document.getElementById('referral-link-text');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const referralsTableContainer = document.getElementById('referrals-table-container'); // أصبح حاوية البطاقات
const urlParams = new URLSearchParams(window.location.search);
const searchInput = document.getElementById('searchInput');
const toastNotification = document.getElementById('toastNotification'); 

let currentReferralsList = []; 
let toastTimeout; 

const marketerId = urlParams.get('marketer_id'); 

// الأعمدة التي نحتاجها لعرض البطاقة
const referralColumns = ['تاريخ_التسجيل', 'fullname', 'phone', 'email', 'الحالة'];
const referralHeaders = ['التاريخ', 'اسم المسجّل', 'الهاتف', 'البريد الإلكتروني', 'حالة التسجيل'];

// 🚀 تعريف أسماء الحقول لعرضها داخل البطاقات
const cardFields = [
    { key: 'تاريخ_التسجيل', label: 'التاريخ', icon: 'fas fa-calendar-alt' },
    { key: 'phone', label: 'الهاتف', icon: 'fab fa-whatsapp' },
    { key: 'email', label: 'البريد', icon: 'fas fa-envelope' },
];


// ----------------------------------------------------
// --- دوال المساعدة العامة ---
// ----------------------------------------------------

function updateStatus(message, type = 'loading') {
    statusMessage.classList.remove('loading', 'success', 'error');
    statusMessage.classList.add(type);
    statusMessage.style.display = 'block';
    
    if (type === 'loading') {
        statusMessage.innerHTML = `<span class="spinner"></span> ${message}`;
        dashboardContent.style.display = 'none';
    } else {
        statusMessage.innerHTML = message;
    }
}

function showToast(message) {
    toastNotification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    toastNotification.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 2000);
}

/**
 * دالة الحصول على تنسيق الحالة.
 */
function getStatusHtml(statusValue) {
    const normalizedValue = String(statusValue).trim().toUpperCase();
    
    if (normalizedValue === 'Y') {
        return { name: 'تم الدفع', value: '<span class="card-status status-active">🟢 تم الدفع </span>', class: 'status-Y' };
    } else if (normalizedValue === 'N') {
        return { name: 'لم يدفع', value: '<span class="card-status status-inactive">🔴 لم يدفع </span>', class: 'status-N' };
    }
    return { name: 'قيد الانتظار', value: '<span class="card-status" style="color: #ffc107;">⛔ قيد الانتظار </span>', class: 'status-pending' };
}

function updateMetaTags(data) {
    if (data.personal_data && data.personal_data.length > 0) {
        const marketerName = data.personal_data[0].fullname || 'غير معروف';
        const descriptionTag = document.querySelector('meta[property="og:description"]');
        const titleTag = document.querySelector('meta[property="og:title"]');
        
        if (titleTag) {
            titleTag.setAttribute('content', `لوحة تحكم المسوِّق - ${marketerName}`);
        }
        if (descriptionTag) {
            descriptionTag.setAttribute('content', `أهلاً بالمسوِّق ${marketerName}. راجع إحصائيات إحالتك الحالية.`);
        }
        document.title = `لوحة تحكم: ${marketerName}`;
    }
}


// ----------------------------------------------------
// --- دوال عرض البطاقات والبيانات ---
// ----------------------------------------------------

/**
 * 🚀 دالة بناء البطاقات بدلاً من الجدول.
 */
function buildReferralsCards(referrals) {
    
    if (!referrals || referrals.length === 0) {
        const isFiltering = searchInput.value.length > 0;
        referralsTableContainer.innerHTML = isFiltering 
            ? '<p class="no-data">لم يتم العثور على أي نتائج تطابق البحث.</p>'
            : '<p class="no-data">لم يسجل أي شخص عبر رابطك بعد.</p>';
            
        downloadBtn.style.display = 'none';
        searchInput.disabled = true; 
        return;
    }
    
    searchInput.disabled = false; 
    downloadBtn.style.display = 'flex'; 
    
    let htmlContent = '';

    referrals.forEach(referral => {
        const status = getStatusHtml(referral['الحالة']);
        
        let detailsHtml = cardFields.map(field => {
            const value = referral[field.key] || '---';
            const direction = field.key === 'phone' || field.key === 'email' ? 'ltr' : 'rtl';
            
            return `
                <p>
                    <i class="${field.icon}"></i>
                    <span class="label">${field.label}:</span>
                    <span class="value" style="direction:${direction};">${value}</span>
                </p>`;
        }).join('');
        
        htmlContent += `
            <div class="referral-card ${status.class}">
                <div class="card-header">
                    <h3 class="card-name">${referral.fullname || 'اسم غير متوفر'}</h3>
                    ${status.value}
                </div>
                <div class="card-details">
                    ${detailsHtml}
                </div>
            </div>
        `;
    });
    
    referralsTableContainer.innerHTML = htmlContent;
}


/**
 * دالة فلترة / بحث البطاقات.
 * (المنطق هو نفسه، فقط نستخدم دالة buildReferralsCards)
 */
function filterReferrals() {
    const q = searchInput.value.toLowerCase();
    
    const filteredList = currentReferralsList.filter(referral => {
        const fullName = String(referral.fullname || '').toLowerCase();
        const phone = String(referral.phone || '').toLowerCase();
        const email = String(referral.email || '').toLowerCase();
        
        return fullName.includes(q) || phone.includes(q) || email.includes(q);
    });
    
    buildReferralsCards(filteredList);
}

/**
 * دالة تنزيل CSV. (لا تتغير)
 */
function downloadCSV(data, marketerId) {
    if (!data || data.length === 0) return;
    let csv = referralHeaders.join(',') + '\n';
    data.forEach(row => {
        let rowData = referralColumns.map(key => {
            let value = row[key] || '';
            value = String(value).replace(/"/g, '""');
            if (value.includes(',')) {
                value = `"${value}"`;
            }
            return value;
        });
        csv += rowData.join(',') + '\n';
    });

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `referrals_${marketerId}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function displayData(data) {
    dashboardContent.style.display = 'block';
    
    const updateTime = new Date().toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
    updateStatus(`<i class="fas fa-check-circle"></i> تم التحديث بنجاح ✅ <span style="font-size:14px; margin-right: 15px;">| 📅 آخر تحديث: ${updateTime}</span>`, 'success');
    setTimeout(() => { statusMessage.style.display = 'none'; }, 2000); 

    currentReferralsList = data.referrals_list || [];

    const activeCount = currentReferralsList.filter(r => String(r['الحالة']).trim().toUpperCase() === 'Y').length;
    activeReferralsCount.textContent = activeCount;

    updateMetaTags(data);
    
    if (data.personal_data && data.personal_data.length > 0) {
        const marketerName = data.personal_data[0].fullname || 'غير معروف';
        document.querySelector('header h1').innerHTML = `لوحة تحكم المسوِّق – ${marketerName}`;
        marketerIdDisplay.innerHTML = `مرحبًا ${marketerName} 👋<br>معرّفك: <span class="id-highlight">${data.marketer_id}</span>`;
    } else {
         marketerIdDisplay.innerHTML = `معرّفك: <span class="id-highlight">${data.marketer_id}</span>`;
    }

    referralsCount.textContent = data.referrals_count || 0;
    const fullReferralLink = `${BASE_REGISTRATION_URL}?marketer_id=${data.marketer_id}`;
    referralLinkText.textContent = fullReferralLink;
    
    // بناء البطاقات
    buildReferralsCards(currentReferralsList);
    
    downloadBtn.onclick = () => downloadCSV(currentReferralsList, data.marketer_id);
}


async function fetchData(marketerId) {
    updateStatus('جارٍ جلب البيانات...'); 
    
    const fetchUrl = `${APPS_SCRIPT_URL}?marketerId=${marketerId}`;

    try {
        const response = await fetch(fetchUrl);
        const data = await response.json();

        if (data.status === 'success') {
            displayData(data);
        } else {
            const errorMsg = data.message || 'لم نتمكن من جلب بياناتك. تأكد من صحة المعرف وحالة النشر.';
            updateStatus(`❌ ${errorMsg}`, 'error');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        updateStatus('❌ حدث خطأ في الاتصال بالشبكة أو الخادم. الرجاء المحاولة مجدداً.', 'error');
    }
}


// ----------------------------------------------------
// --- تنفيذ الكود والـ Event Listeners ---
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // إتاحة الدوال للوصول إليها عبر HTML (مثل oninput="filterReferrals()")
    window.filterReferrals = filterReferrals;

    if (marketerId) {
        fetchData(marketerId.toUpperCase());
    } else {
        updateStatus('⚠️ لا يوجد معرف مسوِّق في الرابط. الرجاء استخدام رابط يحتوي على: ?marketer_id=XXXXXX', 'error');
        marketerIdDisplay.innerHTML = `الرجاء إضافة المعرّف في الرابط.`;
    }
    
    copyBtn.addEventListener('click', async () => {
        const link = referralLinkText.textContent;
        try {
            await navigator.clipboard.writeText(link);
            showToast('تم نسخ الرابط إلى الحافظة!'); 
        } catch (err) {
            console.error('فشل النسخ:', err);
            showToast('❌ فشل النسخ، الرجاء المحاولة مجدداً.');
        }
    });
});
