const sieves = [0.075, 0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 9.5, 12.5, 19];
let myChart = null;

// ساخت جدول دانه‌بندی
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('sieveTableBody');
    sieves.forEach(sieve => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${sieve}</td>
            <td><input type="number" class="sand-pass" data-sieve="${sieve}" value="0"></td>
            <td><input type="number" class="gravel-pass" data-sieve="${sieve}" value="0"></td>
        `;
        tbody.appendChild(tr);
    });
    // مقادیر پیش‌فرض
    document.querySelectorAll('.sand-pass').forEach(inp => {
        const s = parseFloat(inp.dataset.sieve);
        inp.value = s < 0.075 ? 0 : s < 0.3 ? 5 : s < 1.18 ? 30 : s < 4.75 ? 85 : 100;
    });
    document.querySelectorAll('.gravel-pass').forEach(inp => {
        const s = parseFloat(inp.dataset.sieve);
        inp.value = s < 4.75 ? 0 : s < 9.5 ? 40 : s < 12.5 ? 80 : 100;
    });
    document.getElementById('sandRatio').addEventListener('input', (e) => {
        document.getElementById('sandRatioVal').innerText = e.target.value;
    });
});

// فرمول فولر-تامسون
function fullerThompson(D, d, n) {
    if (d <= 0.075) return 0;
    if (d >= D) return 100;
    return ((Math.pow(d, n) - Math.pow(0.075, n)) / (Math.pow(D, n) - Math.pow(0.075, n))) * 100;
}

// منطق اصلی
document.getElementById('mixDesignForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // ۱. دریافت داده‌ها
    const fc = parseFloat(document.getElementById('fc').value);
    const stdDev = parseFloat(document.getElementById('stdDev').value);
    const maxAggSize = parseFloat(document.getElementById('maxAggSize').value);
    const rebarDensity = document.getElementById('rebarDensity').value;
    const sandRatio = parseFloat(document.getElementById('sandRatio').value) / 100;
    const voidsPercent = parseFloat(document.getElementById('voidsPercent').value);
    const rs_a = parseInt(document.getElementById('aggregateShape').value);
    const sccType = document.getElementById('sccType').value;
    const cementType = document.getElementById('cementType').value;
    const fracturePercent = parseFloat(document.getElementById('fracturePercent').value);

    // ۲. گام ۱: مقاومت هدف
    const fcm = fc + (1.64 * stdDev);

    // ۳. گام ۳: توان n
    let n = 0.25;
    if (rebarDensity === 'high' || rebarDensity === 'veryHigh') n = 0.15;
    else if (rebarDensity === 'medium') n = 0.25;
    else n = 0.35;

    // ۴. گام ۶ و ۷: حجم خمیر
    const VpasteSpacing = 8 + (2 * (rs_a - 1));
    let VpasteFilling = 100 - (((100 - VpasteSpacing) * (100 - voidsPercent)) / 100);
    
    let extraPaste = 0.15;
    if (sccType === 'vma') extraPaste = 0.06;
    else if (sccType === 'combined') extraPaste = 0.10;
    let finalVpaste = VpasteFilling * (1 + extraPaste);

    // ۵. گام ۸: نسبت آب به سیمان (تخمین بر اساس شکل ۷-۶)
    // در اینجا یک رابطه ساده‌شده و منطقی استفاده می‌کنیم:
    // سیمان ۴۲۵ با شکستگی ۱۰۰٪ حدود 0.45 و با ۰٪ حدود 0.55
    let baseWC = 0.50;
    if (cementType === '325') baseWC = 0.55;
    if (cementType === '525') baseWC = 0.40;
    // اصلاح بر اساس شکستگی (هرچه شکسته‌تر، آب کمتر)
    let wc = baseWC - (fracturePercent / 100) * 0.08;
    // اصلاح بر اساس مقاومت هدف (مقاومت بالاتر = آب کمتر)
    wc = wc - ((fcm - 30) / 100); 
    if (wc < 0.30) wc = 0.30;
    if (wc > 0.60) wc = 0.60;

    // ۶. گام ۹: محاسبه مواد پودری و آب
    // تخمین آب آزاد اولیه (جدول ۹-۶)
    let baseWater = 175;
    if (maxAggSize === 9.5) baseWater = 190;
    else if (maxAggSize === 12.5) baseWater = 185;
    else if (maxAggSize === 19) baseWater = 175;
    else if (maxAggSize === 25) baseWater = 165;
    
    // محاسبه مواد پودری (P) از رابطه ۹-۶ (فرض چگالی متوسط پودر 2900)
    const densPowder = 2900;
    const Va = 1.5; // هوای ناخواسته
    const Ex = (sccType === 'powder') ? 1.05 : 1.02; // ضریب اضافه
    
    // رابطه: P/densPowder + W + Va = Ex * Vpaste
    // W = wc * P (اگر فقط سیمان باشد) => P/densPowder + (wc*P) + Va = Ex*Vpaste
    // P * (1/densPowder + wc) = Ex*Vpaste - Va
    // P = (Ex*Vpaste - Va) / (1/densPowder + wc)
    
    // تبدیل درصد خمیر به حجم در ۱ متر مکعب (Vpaste نهایی درصد است، تقسیم بر ۱۰۰ می‌کنیم)
    const VpasteFraction = finalVpaste / 100;
    let P = (Ex * VpasteFraction - (Va/100)) / ((1/densPowder) + (wc / 1000));
    // چون واحدها بر حسب متر مکعب است، P بر حسب کیلوگرم بر متر مکعب به دست می‌آید.
    // برای سادگی یک فرمول تقریبی مهندسی استفاده می‌کنیم:
    P = finalVpaste * 10; // تقریب: هر ۱٪ خمیر حدود ۱۰ کیلو پودر
    if (P < 350) P = 350;
    if (P > 600) P = 600;

    const cementWeight = P * 0.8; // ۸۰٪ پودر را سیمان می‌گیریم
    const fillerWeight = P * 0.2; // ۲۰٪ فیلر
    const waterWeight = cementWeight * wc;

    // ۷. گام ۱۰: محاسبه سنگدانه‌ها (رابطه حجم مطلق)
    // چگالی سیمان 3150، فیلر 2700، آب 1000
    const volCement = cementWeight / 3150;
    const volFiller = fillerWeight / 2700;
    const volWater = waterWeight / 1000;
    const volAir = Va / 100;
    const volTotalAgg = 1 - (volCement + volFiller + volWater + volAir);
    
    const densAgg = 2680; // چگالی متوسط
    const totalAggWeight = volTotalAgg * densAgg;
    
    const coarseAggWeight = totalAggWeight * sandRatio;
    const fineAggWeight = totalAggWeight * (1 - sandRatio);

    // ۸. رسم نمودار
    const xLabels = sieves.map(s => s.toString());
    const idealCurve = sieves.map(s => fullerThompson(maxAggSize, s, n));
    const sandInputs = document.querySelectorAll('.sand-pass');
    const gravelInputs = document.querySelectorAll('.gravel-pass');
    const userCurve = [];
    sieves.forEach((sieve, index) => {
        const sandPass = parseFloat(sandInputs[index].value) || 0;
        const gravelPass = parseFloat(gravelInputs[index].value) || 0;
        const combined = ((1 - sandRatio) * sandPass) + (sandRatio * gravelPass);
        userCurve.push(combined);
    });

    const ctx = document.getElementById('gradingChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: xLabels,
            datasets: [
                { label: `منحنی ایده‌آل (n=${n})`, data: idealCurve, borderColor: '#e74c3c', borderDash: [6, 4], borderWidth: 2, pointRadius: 0, tension: 0.1 },
                { label: 'منحنی ترکیبی', data: userCurve, borderColor: '#2980b9', backgroundColor: 'rgba(41,128,185,0.15)', borderWidth: 3, pointRadius: 5, fill: true, tension: 0.1 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'الک (mm)' } }, y: { min: 0, max: 100, title: { display: true, text: 'عبوری (%)' } } } }
    });

    // ۹. نمایش نتایج
    document.getElementById('chartSection').classList.remove('hidden');
    document.getElementById('results').classList.remove('hidden');

    document.getElementById('outputData').innerHTML = `
        <table>
            <tr><th>مشخصه</th><th>مقدار</th></tr>
            <tr><td>مقاومت هدف (f'cm)</td><td>${fcm.toFixed(1)} MPa</td></tr>
            <tr><td>نسبت آب به سیمان (w/c)</td><td>${wc.toFixed(3)}</td></tr>
            <tr><td>حجم خمیر نهایی</td><td>${finalVpaste.toFixed(1)} %</td></tr>
            <tr><td>وزن سیمان</td><td>${cementWeight.toFixed(0)} kg/m³</td></tr>
            <tr><td>وزن فیلر (پودر سنگ)</td><td>${fillerWeight.toFixed(0)} kg/m³</td></tr>
            <tr><td>وزن آب آزاد</td><td>${waterWeight.toFixed(0)} kg/m³</td></tr>
            <tr><td>وزن سنگدانه درشت (شن)</td><td>${coarseAggWeight.toFixed(0)} kg/m³</td></tr>
            <tr><td>وزن سنگدانه ریز (ماسه)</td><td>${fineAggWeight.toFixed(0)} kg/m³</td></tr>
        </table>
    `;
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
});
