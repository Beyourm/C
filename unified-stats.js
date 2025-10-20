async function fetchAndStoreStats() {
  const stats = await fetchStats(marketerId); // دالة fetch موجودة عندك
  if(stats) {
    // تخزين الأرقام الثابتة فقط
    const fixedStats = {
      total_registered: stats.total_registered,
      active: stats.active,
      inactive: stats.inactive,
      top3: stats.top3
    };
    localStorage.setItem('dashboardStats', JSON.stringify(fixedStats));

    // تحديث home.html UI كاملة
    updateUI(stats);
  }
}









function loadDashboardFromHome() {
  const fixedStats = JSON.parse(localStorage.getItem('dashboardStats'));
  if(fixedStats) {
    // تحديث البطاقات الثابتة
    document.getElementById('total-members').textContent = fixedStats.total_registered;
    document.getElementById('active-members').textContent = fixedStats.active;
    document.getElementById('inactive-members').textContent = fixedStats.inactive;

    // تحديث Top 3
    const top3List = document.getElementById('top3-list');
    top3List.innerHTML = '';
    fixedStats.top3.forEach((m) => {
      const li = document.createElement('li');
      li.textContent = `${m.name} – ${m.total}$`;
      top3List.appendChild(li);
    });
  }

  // ثم جلب الرصيد الحالي والمركز من السيرفر فقط
  fetchStats(marketerId).then(stats => {
    if(stats) {
      document.getElementById('current-balance').textContent = stats.total_commission + ' $';
      document.getElementById('current-rank').textContent = stats.rank;
    }
  });
}

// عند تحميل الصفحة
loadDashboardFromHome();

