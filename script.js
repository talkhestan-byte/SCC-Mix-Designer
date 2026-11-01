// ===== تعریف الک‌های استاندارد (میلی‌متر) =====
const sieves = [0.075, 0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 9.5, 12.5, 19];

// ===== متغیر سراسری برای نگهداری نمودار =====
let myChart = null;

// ===== ساخت خودکار جدول دانه‌بندی در زمان لود شدن صفحه =====
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('sieveTableBody');
    sieves.forEach(sieve => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sieve}</td>
            <td><input type="number" class="sand-pass" data-sieve="${sieve}" value="0" min="0" max="100" step="0.1"></td>
            <td><input type="number" class="gravel-pass" data-sieve="${sieve}" value="0" min="0" max="100" step="0.1"></td>
        `;
        tbody.appendChild(tr);
    });

    // مقداردهی اولیه نمونه (برای اینکه کاربر با جدول خالی مواجه نشود)
    document.querySelectorAll('.sand-pass').forEach(inp => {
        const s = parseFloat(inp.dataset.sieve);
        if (s < 0.075) inp.value = 0;
        else if (s < 0.3) inp.value = 5;
        else if (s < 1.18) inp.value = 30;
        else if (s < 4.75) inp.value = 85;
        else inp.value = 100;
    });
    
    document.querySelectorAll('.gravel-pass').forEach(inp => {
        const s = parseFloat(inp.dataset.sieve);
        if (s < 4.75) inp.value = 0;
        else if (s < 9.5) inp.value = 40;
        else if (s < 12.5) inp.value = 80;
        else inp.value = 100;
    });
    
    // به‌روزرسانی زنده مقدار اسلایدر
    document.getElementById('sandRatio').addEventListener('input', (e) => {
        document.getElementById('sandRatioVal').innerText = e.target.value;
    });
});

// ===== تابع محاسبه درصد عبوری منحنی فولر-تامسون =====
// P = (d^n - 0.075^n) / (D^n - 0.075^n) * 100
function fullerThompson(D, d, n) {
    if (d <= 0.075) return 0;
    if (d >= D) return 100;
    const num = Math.pow(d, n) - Math.pow(0.075, n);
    const den = Math.pow(D, n) - Math.pow(0.075, n);
    return (num / den) * 100;
}

// ===== منطق اصلی فرم =====
document.getElementById('mixDesignForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const maxAggSize = parseFloat(document.getElementById('maxAggSize').value);
    const rebarDensity = document.getElementById('rebarDensity').value;
    const sandRatio = parseFloat(document.getElementById('sandRatio').value) / 100; // درصد شن
    
    // انتخاب توان n بر اساس جدول ۶-۵
    let n = 0.25;
    if (rebarDensity === 'high' || rebarDensity === 'veryHigh') n = 0.15;
    else if (rebarDensity === 'medium') n = 0.25;
    else n = 0.35;

    // ===== ۱. محاسبه منحنی مطلوب فولر-تامسون =====
    const xLabels = sieves.map(s => s.toString());
    const idealCurve = sieves.map(s => fullerThompson(maxAggSize, s, n));

    // ===== ۲. محاسبه منحنی ترکیبی کاربر =====
    const sandInputs = document.querySelectorAll('.sand-pass');
    const gravelInputs = document.querySelectorAll('.gravel-pass');
    
    const userCurve = [];
    sieves.forEach((sieve, index) => {
        const sandPass = parseFloat(sandInputs[index].value) || 0;
        const gravelPass = parseFloat(gravelInputs[index].value) || 0;
        
        // فرمول ترکیب: ((۱ - درصد شن) * عبوری ماسه) + (درصد شن * عبوری شن)
        const combined = ((1 - sandRatio) * sandPass) + (sandRatio * gravelPass);
        userCurve.push(combined);
    });

    // ===== ۳. رسم نمودار با Chart.js =====
    const ctx = document.getElementById('gradingChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [
                {
                    label: `منحنی ایده‌آل (فولر-تامسون n=${n})`,
                    data: idealCurve,
                    borderColor: '#e74c3c',
                    backgroundColor: 'transparent',
                    borderDash: [6, 4],
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.1
                },
                {
                    label: 'منحنی ترکیبی سنگدانه‌های شما',
                    data: userCurve,
                    borderColor: '#2980b9',
                    backgroundColor: 'rgba(41, 128, 185, 0.15)',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: '#2980b9',
                    tension: 0.1,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'اندازه الک (میلی‌متر)',
                        font: { family: 'Vazirmatn', size: 11 }
                    },
                    ticks: { font: { family: 'Vazirmatn', size: 10 } }
                },
                y: {
                    title: {
                        display: true,
                        text: 'درصد عبوری تجمعی (%)',
                        font: { family: 'Vazirmatn', size: 11 }
                    },
                    min: 0,
                    max: 100,
                    ticks: { font: { family: 'Vazirmatn', size: 10 } }
                }
            },
            plugins: {
                legend: {
                    labels: { font: { family: 'Vazirmatn', size: 11 } }
                }
            }
        }
    });

    // نمایش بخش نمودار
    document.getElementById('chartSection').classList.remove('hidden');
    document.getElementById('chartSection').scrollIntoView({ behavior: 'smooth' });

    // ===== ۴. پیام وضعیت تطبیق =====
    let totalError = 0;
    let count = 0;
    userCurve.forEach((val, i) => {
        if (idealCurve[i] > 5 && idealCurve[i] < 95) {
            totalError += Math.abs(val - idealCurve[i]);
            count++;
        }
    });
    
    const avgError = count > 0 ? totalError / count : 0;
    const statusEl = document.getElementById('chartStatus');
    
    if (avgError < 5) {
        statusEl.innerHTML = `✅ تطبیق عالی! (میانگین خطا: ${avgError.toFixed(1)}%)`;
        statusEl.style.color = '#27ae60';
    } else if (avgError < 10) {
        statusEl.innerHTML = `⚠️ تطبیق قابل قبول (میانگین خطا: ${avgError.toFixed(1)}%) - با تغییر اسلایدر می‌توانید بهتر کنید.`;
        statusEl.style.color = '#e67e22';
    } else {
        statusEl.innerHTML = `❌ عدم تطبیق مناسب (میانگین خطا: ${avgError.toFixed(1)}%) - نسبت شن/ماسه یا دانه‌بندی را اصلاح کنید.`;
        statusEl.style.color = '#e74c3c';
    }
});
