// ==========================================
// ۱. تعریف داده‌های سراسری
// ==========================================
const state = {
  currentStep: 0,
  totalSteps: 10,
  data: {
    fc: 30, stdDev: 5, fcm: 0,
    rebarDensity: 'medium', slumpClass: 'SF2', n_power: 0.25,
    maxAggSize: 19, rs_a: 3, sccType: 'powder',
    cementType: '425', fracturePercent: 100,
    voidsPercent: 35, sandRatio: 50,
    extraPaste: 0.15, finalVpaste: 0,
    wc: 0, water: 175, powder: 400, cement: 320, filler: 80,
    coarseAgg: 800, fineAgg: 800, airPercent: 1.5
  }
};

// ==========================================
// ۲. تعریف ساختار ۱۰ گام
// ==========================================
const steps = [
  { id: 'step1', title: '۱. مقاومت' },
  { id: 'step2', title: '۲. اسلامپ' },
  { id: 'step3', title: '۳. دانه‌بندی' },
  { id: 'step4', title: '۴. نسبت شن/ماسه' },
  { id: 'step5', title: '۵. فضای خالی' },
  { id: 'step6', title: '۶. شکل دانه' },
  { id: 'step7', title: '۷. حجم خمیر' },
  { id: 'step8', title: '۸. آب/سیمان' },
  { id: 'step9', title: '۹. پودر و هوا' },
  { id: 'step10', title: '۱۰. خروجی نهایی' }
];

// ==========================================
// ۳. توابع کمکی
// ==========================================
function fullerThompson(D, d, n) {
  if (d <= 0.075) return 0;
  if (d >= D) return 100;
  return ((Math.pow(d, n) - Math.pow(0.075, n)) / (Math.pow(D, n) - Math.pow(0.075, n))) * 100;
}

let currentChart = null;

function drawChart(canvasId, datasets, xLabels) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  if (currentChart) currentChart.destroy();
  currentChart = new Chart(ctx, {
    type: 'line',
    data: { labels: xLabels, datasets: datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        x: { title: { display: true, text: 'اندازه الک (mm)' }, ticks: { font: { size: 10 } } },
        y: { min: 0, max: 100, title: { display: true, text: 'عبوری (%)' } }
      },
      plugins: { legend: { labels: { font: { size: 10 } } } }
    }
  });
}

// ==========================================
// ۴. رندر کردن هر گام (صفحات)
// ==========================================

function renderStep1() {
  return `
    <h2>گام ۱: محاسبه مقاومت هدف</h2>
    <p class="note">مقاومت مشخصه و انحراف معیار را وارد کنید.</p>
    <div class="input-group">
      <label>مقاومت مشخصه فشاری (MPa):</label>
      <input type="number" id="in_fc" value="${state.data.fc}">
    </div>
    <div class="input-group">
      <label>انحراف معیار (MPa):</label>
      <input type="number" id="in_stdDev" value="${state.data.stdDev}">
    </div>
    <div class="highlight-box">
      مقاومت هدف (f'cm) = <span id="out_fcm">${state.data.fcm.toFixed(1)}</span> MPa
    </div>
  `;
}

function renderStep2() {
  return `
    <h2>گام ۲: انتخاب جریان اسلامپ هدف</h2>
    <div class="input-group">
      <label>تراکم میلگرد:</label>
      <select id="in_rebar">
        <option value="low" ${state.data.rebarDensity==='low'?'selected':''}>کم</option>
        <option value="medium" ${state.data.rebarDensity==='medium'?'selected':''}>متوسط</option>
        <option value="high" ${state.data.rebarDensity==='high'?'selected':''}>زیاد</option>
        <option value="veryHigh" ${state.data.rebarDensity==='veryHigh'?'selected':''}>فوق‌العاده زیاد</option>
      </select>
    </div>
    <div class="highlight-box">
      رده اسلامپ انتخاب شده: <span id="out_slump">${state.data.slumpClass}</span>
    </div>
  `;
}

function renderStep3() {
  return `
    <h2>گام ۳: منحنی دانه‌بندی ایده‌آل (فولر-تامسون)</h2>
    <p class="note">این نمودار بر اساس جدول ۶-۵ و توان n=${state.data.n_power} رسم شده است.</p>
    <div class="chart-container"><canvas id="chart3"></canvas></div>
  `;
}

function renderStep4() {
  return `
    <h2>گام ۴ و ۵: ترکیب سنگدانه</h2>
    <p class="note">درصد شن به کل سنگدانه را تنظیم کنید.</p>
    <div class="input-group">
      <label>درصد شن (S/A): <span id="val_sandRatio">${state.data.sandRatio}</span>%</label>
      <input type="range" id="in_sandRatio" min="30" max="70" value="${state.data.sandRatio}" step="1">
    </div>
    <div class="input-group">
      <label>درصد فضای خالی سنگدانه (متراکم):</label>
      <input type="number" id="in_voids" value="${state.data.voidsPercent}">
    </div>
    <div class="chart-container"><canvas id="chart4"></canvas></div>
  `;
}

function renderStep5() {
  return `
    <h2>گام ۶: انتخاب رده شکل سنگدانه (Rs-a)</h2>
    <p class="note">طبق جدول ۶-۶، رده مناسب را انتخاب کنید.</p>
    <div class="input-group">
      <select id="in_rsa">
        <option value="1" ${state.data.rs_a==1?'selected':''}>رده ۱ (کاملاً گرد)</option>
        <option value="2" ${state.data.rs_a==2?'selected':''}>رده ۲ (نیمه گرد)</option>
        <option value="3" ${state.data.rs_a==3?'selected':''}>رده ۳ (نیمه گوشه‌دار)</option>
        <option value="4" ${state.data.rs_a==4?'selected':''}>رده ۴ (گوشه‌دار)</option>
        <option value="5" ${state.data.rs_a==5?'selected':''}>رده ۵ (خیلی گوشه‌دار)</option>
      </select>
    </div>
    <div class="image-placeholder">(تصویر جدول ۶-۶ در اینجا قرار می‌گیرد)</div>
  `;
}

function renderStep6() {
  return `
    <h2>گام ۷: محاسبه حجم خمیر نهایی</h2>
    <div class="input-group">
      <label>نوع بتن خودتراکم (برای اعمال درصد افزایش خمیر):</label>
      <select id="in_sccType">
        <option value="powder" ${state.data.sccType==='powder'?'selected':''}>پودری (+۱۵٪)</option>
        <option value="vma" ${state.data.sccType==='vma'?'selected':''}>دارای VMA (+۶٪)</option>
        <option value="combined" ${state.data.sccType==='combined'?'selected':''}>ترکیبی (+۱۰٪)</option>
      </select>
    </div>
    <div class="highlight-box">
      حجم خمیر پایه = <span id="out_vpaste_base">0</span> %<br>
      حجم خمیر نهایی = <span id="out_vpaste_final">0</span> %
    </div>
  `;
}

function renderStep7() {
  return `
    <h2>گام ۸: تعیین نسبت آب به سیمان (w/c)</h2>
    <p class="note">بر اساس شکل ۷-۶ و درون‌یابی رده سیمان و شکستگی.</p>
    <div class="input-group">
      <label>رده مقاومتی سیمان:</label>
      <select id="in_cementType">
        <option value="325" ${state.data.cementType==='325'?'selected':''}>325</option>
        <option value="425" ${state.data.cementType==='425'?'selected':''}>425</option>
        <option value="525" ${state.data.cementType==='525'?'selected':''}>525</option>
      </select>
    </div>
    <div class="input-group">
      <label>درصد شکستگی شن:</label>
      <select id="in_fracture">
        <option value="0" ${state.data.fracturePercent==0?'selected':''}>۰٪ (گرد)</option>
        <option value="100" ${state.data.fracturePercent==100?'selected':''}>۱۰۰٪ (شکسته)</option>
      </select>
    </div>
    <div class="highlight-box">
      نسبت w/c = <span id="out_wc">0.000</span>
    </div>
  `;
}

function renderStep8() {
  return `
    <h2>گام ۹: محاسبه مواد پودری و هوا</h2>
    <div class="input-group">
      <label>درصد هوای ناخواسته (طبق جدول ۱۲-۶):</label>
      <input type="number" id="in_air" value="${state.data.airPercent}" step="0.1">
    </div>
    <div class="highlight-box">
      وزن کل پودر = <span id="out_powder">0</span> kg/m³<br>
      وزن سیمان = <span id="out_cement">0</span> kg/m³<br>
      وزن فیلر = <span id="out_filler">0</span> kg/m³<br>
      وزن آب = <span id="out_water">0</span> kg/m³
    </div>
  `;
}

function renderStep9() {
  return `
    <h2>گام ۱۰: خروجی نهایی طرح اختلاط</h2>
    <p class="note">جدول نهایی مقادیر مصرفی برای ۱ متر مکعب بتن.</p>
    <table>
      <tr><th>مشخصه</th><th>مقدار</th></tr>
      <tr><td>سیمان</td><td>${state.data.cement.toFixed(0)} kg/m³</td></tr>
      <tr><td>فیلر (پودر سنگ)</td><td>${state.data.filler.toFixed(0)} kg/m³</td></tr>
      <tr><td>آب آزاد</td><td>${state.data.water.toFixed(0)} kg/m³</td></tr>
      <tr><td>سنگدانه درشت (شن)</td><td>${state.data.coarseAgg.toFixed(0)} kg/m³</td></tr>
      <tr><td>سنگدانه ریز (ماسه)</td><td>${state.data.fineAgg.toFixed(0)} kg/m³</td></tr>
    </table>
    <button onclick="window.print()" style="margin-top:20px; width:100%; padding:10px; background:#2980b9; color:white; border:none; border-radius:8px;">چاپ / ذخیره PDF</button>
  `;
}

// آرایه توابع رندر
const renderFunctions = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7, renderStep8, renderStep9, renderStep9];

// ==========================================
// ۵. منطق ناوبری
// ==========================================
function updateUI() {
  // تب‌ها
  const tabsContainer = document.getElementById('tabs');
  tabsContainer.innerHTML = steps.map((s, i) => 
    `<button class="tab-btn ${i === state.currentStep ? 'active' : ''}" onclick="goToStep(${i})">${s.title}</button>`
  ).join('');

  // محتوا
  const screen = document.getElementById('screen');
  screen.innerHTML = renderFunctions[state.currentStep]();

  // دکمه‌ها
  document.getElementById('prev').disabled = state.currentStep === 0;
  document.getElementById('next').disabled = state.currentStep === state.totalSteps - 1;
  document.getElementById('next').innerText = state.currentStep === state.totalSteps - 1 ? 'پایان' : 'گام بعد';

  // اجرای منطق اختصاصی هر صفحه (مثل رسم نمودار یا محاسبات زنده)
  attachStepLogic(state.currentStep);
}

function goToStep(index) {
  state.currentStep = index;
  updateUI();
}

document.getElementById('prev').addEventListener('click', () => {
  if (state.currentStep > 0) goToStep(state.currentStep - 1);
});

document.getElementById('next').addEventListener('click', () => {
  if (state.currentStep < state.totalSteps - 1) goToStep(state.currentStep + 1);
});

// ==========================================
// ۶. منطق زنده هر گام (اتصال فرم‌ها به State)
// ==========================================
function attachStepLogic(stepIndex) {
  // گام ۱
  if (stepIndex === 0) {
    const fcInput = document.getElementById('in_fc');
    const stdInput = document.getElementById('in_stdDev');
    const calc = () => {
      state.data.fc = parseFloat(fcInput.value) || 0;
      state.data.stdDev = parseFloat(stdInput.value) || 0;
      state.data.fcm = state.data.fc + (1.64 * state.data.stdDev);
      document.getElementById('out_fcm').innerText = state.data.fcm.toFixed(1);
    };
    fcInput.addEventListener('input', calc);
    stdInput.addEventListener('input', calc);
    calc();
  }
  
  // گام ۲
  if (stepIndex === 1) {
    const rebar = document.getElementById('in_rebar');
    rebar.addEventListener('change', (e) => {
      state.data.rebarDensity = e.target.value;
      if (state.data.rebarDensity === 'veryHigh' || state.data.rebarDensity === 'high') state.data.slumpClass = 'SF3';
      else if (state.data.rebarDensity === 'medium') state.data.slumpClass = 'SF2';
      else state.data.slumpClass = 'SF1';
      
      // تنظیم توان n برای گام ۳
      if (state.data.slumpClass === 'SF3') state.data.n_power = 0.15;
      else if (state.data.slumpClass === 'SF2') state.data.n_power = 0.25;
      else state.data.n_power = 0.35;
      
      document.getElementById('out_slump').innerText = state.data.slumpClass;
    });
  }

  // گام ۳: رسم منحنی‌ها
  if (stepIndex === 2) {
    const sieves = [0.075, 0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 9.5, 12.5, 19];
    const xLabels = sieves.map(s => s.toString());
    const idealCurve = sieves.map(s => fullerThompson(state.data.maxAggSize, s, state.data.n_power));
    drawChart('chart3', [{ label: `منحنی ایده‌آل (n=${state.data.n_power})`, data: idealCurve, borderColor: '#e74c3c', borderDash: [5,5], borderWidth: 2, pointRadius: 0 }], xLabels);
  }

  // گام ۴: اسلایدر و رسم
  if (stepIndex === 3) {
    const slider = document.getElementById('in_sandRatio');
    const voidsInput = document.getElementById('in_voids');
    
    const updateChart = () => {
      state.data.sandRatio = parseFloat(slider.value);
      state.data.voidsPercent = parseFloat(voidsInput.value);
      document.getElementById('val_sandRatio').innerText = state.data.sandRatio;
      
      // داده‌های فرضی برای ماسه و شن (باید کاربر وارد کند، فعلاً برای نمایش)
      const sieves = [0.075, 0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 9.5, 12.5, 19];
      const xLabels = sieves.map(s => s.toString());
      const sandPass = [0, 0, 5, 30, 50, 85, 100, 100, 100, 100];
      const gravelPass = [0, 0, 0, 0, 0, 0, 10, 40, 80, 100];
      
      const userCurve = sieves.map((_, i) => ((state.data.sandRatio/100) * gravelPass[i]) + ((1 - state.data.sandRatio/100) * sandPass[i]));
      const idealCurve = sieves.map(s => fullerThompson(state.data.maxAggSize, s, state.data.n_power));
      
      drawChart('chart4', [
        { label: 'منحنی ایده‌آل', data: idealCurve, borderColor: '#e74c3c', borderDash: [5,5], borderWidth: 2, pointRadius: 0 },
        { label: 'منحنی ترکیبی شما', data: userCurve, borderColor: '#2980b9', borderWidth: 3, fill: true, backgroundColor: 'rgba(41,128,185,0.1)' }
      ], xLabels);
    };
    
    slider.addEventListener('input', updateChart);
    voidsInput.addEventListener('input', updateChart);
    updateChart();
  }

  // گام ۶: محاسبه حجم خمیر
  if (stepIndex === 5) {
    const sccSelect = document.getElementById('in_sccType');
    const calcVpaste = () => {
      state.data.sccType = sccSelect.value;
      const Vspacing = 8 + 2 * (state.data.rs_a - 1);
      const Vfilling = 100 - (((100 - Vspacing) * (100 - state.data.voidsPercent)) / 100);
      
      let extra = 0.15;
      if (state.data.sccType === 'vma') extra = 0.06;
      else if (state.data.sccType === 'combined') extra = 0.10;
      
      state.data.finalVpaste = Vfilling * (1 + extra);
      document.getElementById('out_vpaste_base').innerText = Vfilling.toFixed(1);
      document.getElementById('out_vpaste_final').innerText = state.data.finalVpaste.toFixed(1);
    };
    sccSelect.addEventListener('change', calcVpaste);
    calcVpaste();
  }

  // گام ۸: محاسبه w/c (تقریبی از منحنی)
  if (stepIndex === 7) {
    const cementSelect = document.getElementById('in_cementType');
    const fracSelect = document.getElementById('in_fracture');
    
    const calcWC = () => {
      state.data.cementType = cementSelect.value;
      state.data.fracturePercent = parseFloat(fracSelect.value);
      
      // مدل ساده‌شده بر اساس شکل ۷-۶
      let base = 0.50;
      if (state.data.cementType === '325') base = 0.55;
      if (state.data.cementType === '525') base = 0.40;
      
      state.data.wc = base - (state.data.fracturePercent / 100) * 0.08;
      document.getElementById('out_wc').innerText = state.data.wc.toFixed(3);
    };
    cementSelect.addEventListener('change', calcWC);
    fracSelect.addEventListener('change', calcWC);
    calcWC();
  }

  // گام ۹: محاسبه نهایی پودر و آب
  if (stepIndex === 8) {
    const airInput = document.getElementById('in_air');
    const calcPowder = () => {
      state.data.airPercent = parseFloat(airInput.value) || 1.5;
      
      // محاسبه مواد پودری
      const densPowder = 2900;
      const VpasteFraction = state.data.finalVpaste / 100;
      const Ex = state.data.sccType === 'powder' ? 1.05 : 1.02;
      
      state.data.powder = (Ex * VpasteFraction - (state.data.airPercent / 100)) / ((1 / densPowder) + (state.data.wc / 1000));
      if (state.data.powder < 350) state.data.powder = 350;
      if (state.data.powder > 600) state.data.powder = 600;
      
      state.data.cement = state.data.powder * 0.8;
      state.data.filler = state.data.powder * 0.2;
      state.data.water = state.data.cement * state.data.wc;
      
      document.getElementById('out_powder').innerText = state.data.powder.toFixed(0);
      document.getElementById('out_cement').innerText = state.data.cement.toFixed(0);
      document.getElementById('out_filler').innerText = state.data.filler.toFixed(0);
      document.getElementById('out_water').innerText = state.data.water.toFixed(0);
    };
    airInput.addEventListener('input', calcPowder);
    calcPowder();
  }

  // گام ۱۰: محاسبه نهایی سنگدانه
  if (stepIndex === 9) {
    // رابطه حجم مطلق
    const volC = state.data.cement / 3150;
    const volF = state.data.filler / 2700;
    const volW = state.data.water / 1000;
    const volA = state.data.airPercent / 100;
    const volAgg = 1 - (volC + volF + volW + volA);
    
    const totalAgg = volAgg * 2680; // چگالی متوسط
    state.data.coarseAgg = totalAgg * (state.data.sandRatio / 100);
    state.data.fineAgg = totalAgg * (1 - state.data.sandRatio / 100);
    
    // رندر مجدد جدول
    document.getElementById('screen').innerHTML = renderStep9();
  }
}

// ==========================================
// ۷. شروع برنامه
// ==========================================
updateUI();
