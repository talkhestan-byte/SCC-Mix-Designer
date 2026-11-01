document.getElementById('mixDesignForm').addEventListener('submit', function(e) {
    e.preventDefault(); // جلوگیری از رفرش صفحه

    // دریافت مقادیر از فرم
    const fc = parseFloat(document.getElementById('fc').value);
    const sccType = document.getElementById('sccType').value;
    const rs_a = parseInt(document.getElementById('aggregateShape').value);
    
    // ایجاد یک شیء برای ذخیره نتایج (فعلاً مقادیر ساختگی برای تست)
    // در مراحل بعد این‌ها با فرمول‌های واقعی جایگزین می‌شوند
    const results = {
        targetStrength: fc + 10, // محاسبه مقاومت هدف (نمونه)
        slumpFlowClass: "SF2",   // تعیین رده جریان اسلامپ (نمونه)
        cementWeight: 350,       // وزن سیمان (نمونه)
        waterWeight: 160,        // وزن آب (نمونه)
        fineAggWeight: 800,      // وزن ماسه (نمونه)
        coarseAggWeight: 750,    // وزن شن (نمونه)
    };

    // نمایش نتایج در صفحه
    const resultsSection = document.getElementById('results');
    const outputData = document.getElementById('outputData');

    outputData.innerHTML = `
        <table>
            <tr><th>پارامتر</th><th>مقدار</th></tr>
            <tr><td>مقاومت هدف (MPa)</td><td>${results.targetStrength}</td></tr>
            <tr><td>رده جریان اسلامپ</td><td>${results.slumpFlowClass}</td></tr>
            <tr><td>وزن سیمان (kg/m³)</td><td>${results.cementWeight}</td></tr>
            <tr><td>وزن آب (kg/m³)</td><td>${results.waterWeight}</td></tr>
            <tr><td>وزن سنگدانه ریز (kg/m³)</td><td>${results.fineAggWeight}</td></tr>
            <tr><td>وزن سنگدانه درشت (kg/m³)</td><td>${results.coarseAggWeight}</td></tr>
        </table>
    `;

    resultsSection.classList.remove('hidden');
    
    // اسکرول به بخش نتایج
    resultsSection.scrollIntoView({ behavior: 'smooth' });
});
