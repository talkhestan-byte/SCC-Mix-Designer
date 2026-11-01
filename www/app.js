// ==========================================
// ۱. تعریف داده‌های سراسری (State)
// ==========================================
const state = {
  currentStep: 0,
  totalSteps: 10,
  data: {
    // گام ۱
    projectName: '',
    elementType: 'ستون',
    maxAggSize: 19,
    rebarDensity: 'medium',
    fc: 30,
    stdDevMethod: 'auto', // 'auto' یا 'manual'
    workshopRank: 'medium',
    manualRank: 'medium',
    fcm: 0,
    stdDev: 0,
    stdDevAuto1: 0,
    stdDevAuto2: 0,
    
    // سایر گام‌ها (مقادیر پیش‌فرض)
    slumpClass: 'SF2',
    n_power: 0.25,
    rs_a: 3,
    sccType: 'powder',
    cementType: '425',
    fractureType: 'C',
    voidsPercent: 35,
    sandRatio: 50,
    airPercent: 1.5,
    wc: 0,
    water: 0,
    powder: 0,
    cement: 0,
    filler: 0,
    coarseAgg: 0,
    fineAgg: 0
  }
};

// ==========================================
// ۲. تعریف ساختار ۱۰ گام
// ==========================================
const steps = [
  { id: 'step1', title: '۱. شناسنامه' },
  { id: 'step2', title: '۲. اسلامپ' },
  { id: 'step3', title: '۳. دانه‌بندی' },
  { id: 'step4', title: '۴. نسبت شن/ماسه' },
  { id: 'step5', title: '۵. فضای خالی' },
  { id: 'step6', title: '۶. شکل دانه' },
  { id: 'step7', title: '۷. حجم خمیر' },
  { id: 'step8', title: '۸. آب/سیمان' },
  { id: 'step9', title: '۹. پودر و هوا' },
  { id: 'step10', title: '۱۰. خروجی' }
];

// ==========================================
// ۳. توابع کمکی
// ==========================================
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
// ۴. توابع رندر برای هر گام
// ==========================================

// --- گام ۱: شناسنامه ---
function renderStep1() {
  return `
    <h2>گام ۱: شناسنامه طرح و مقاومت</h2>
    
    <div class="input-group">
      <label>نام طرح / پروژه:</label>
      <input type="text" id="in_projectName" value="${state.data.projectName}" placeholder="مثلاً: پروژه مسکونی نیاوران">
    </div>

    <h3 style="font-size:0.95rem; color:#123e59; margin-top:15px; margin-bottom:10px;">مشخصات المان و قطعه</h3>
    <div class="input-group">
      <label>نوع المان:</label>
      <select id="in_elementType">
        <option value="ستون" ${state.data.elementType==='ستون'?'selected':''}>ستون</option>
        <option value="دیوار" ${state.data.elementType==='دیوار'?'selected':''}>دیوار</option>
        <option value="تیر" ${state.data.elementType==='تیر'?'selected':''}>تیر</option>
        <option value="دال" ${state.data.elementType==='دال'?'selected':''}>دال</option>
        <option value="شالوده" ${state.data.elementType==='شالوده'?'selected':''}>شالوده</option>
      </select>
    </div>
    <div class="input-group">
      <label>حداکثر اندازه اسمی سنگدانه (mm):</label>
      <select id="in_maxAggSize">
        <option value="9.5" ${state.data.maxAggSize==9.5?'selected':''}>9.5</option>
        <option value="12.5" ${state.data.maxAggSize==12.5?'selected':''}>12.5</option>
        <option value="19" ${state.data.maxAggSize==19?'selected':''}>19</option>
        <option value="25" ${state.data.maxAggSize==25?'selected':''}>25</option>
      </select>
    </div>
    <div class="input-group">
      <label>تراکم میلگرد:</label>
      <select id="in_rebarDensity">
        <option value="low" ${state.data.rebarDensity==='low'?'selected':''}>کم</option>
        <option value="medium" ${state.data.rebarDensity==='medium'?'selected':''}>متوسط</option>
        <option value="high" ${state.data.rebarDensity==='high'?'selected':''}>زیاد</option>
        <option value="veryHigh" ${state.data.rebarDensity==='veryHigh'?'selected':''}>فوق‌العاده زیاد</option>
      </select>
    </div>

    <h3 style="font-size:0.95rem; color:#123e59; margin-top:15px; margin-bottom:10px;">مشخصات مقاومت</h3>
    <div class="input-group">
      <label>مقاومت مشخصه فشاری (MPa):</label>
      <input type="number" id="in_fc" value="${state.data.fc}" min="15" max="50">
    </div>

    <div class="input-group" style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
      <label style="margin:0; font-weight:bold; width:100%;">روش تعیین انحراف معیار:</label>
      <label style="display:flex; align-items:center; gap:5px; font-weight:normal; font-size:0.85rem;">
        <input type="radio" name="stdMethod" value="auto" ${state.data.stdDevMethod==='auto'?'checked':''}> خودکار (رتبه کارگاه)
      </label>
      <label style="display:flex; align-items:center; gap:5px; font-weight:normal; font-size:0.85rem;">
        <input type="radio" name="stdMethod" value="manual" ${state.data.stdDevMethod==='manual'?'checked':''}> دستی
      </label>
    </div>

    <!-- جعبه حالت خودکار -->
    <div id="autoBox" style="display: ${state.data.stdDevMethod === 'auto' ? 'block' : 'none'}; background:#f8fafc; padding:10px; border-radius:8px; margin-bottom:10px;">
      <label style="font-size:0.85rem; font-weight:bold;">رتبه کارگاه:</label>
      <select id="in_workshopRank" style="margin-bottom:10px;">
        <option value="good" ${state.data.workshopRank==='good'?'selected':''}>خوب (S = 4)</option>
        <option value="medium" ${state.data.workshopRank==='medium'?'selected':''}>متوسط (S = 5)</option>
        <option value="weak" ${state.data.workshopRank==='weak'?'selected':''}>ضعیف (S = 6)</option>
      </select>
      <div style="font-size:0.85rem; line-height:1.6; background:#fff; padding:8px; border-radius:6px; border:1px solid #e2e8f0;">
        <div>رابطه ۱ (f'cm = f'c + 1.34S + 1.5): <strong id="out_formula1">0</strong></div>
        <div>رابطه ۲ (f'cm = f'c + 2.33S - 4): <strong id="out_formula2">0</strong></div>
      </div>
    </div>

    <!-- جعبه حالت دستی -->
    <div id="manualBox" style="display: ${state.data.stdDevMethod === 'manual' ? 'block' : 'none'}; background:#f8fafc; padding:10px; border-radius:8px; margin-bottom:10px;">
      <label style="font-size:0.85rem; font-weight:bold;">رتبه کارگاه:</label>
      <select id="in_manualRank" style="margin-bottom:10px;">
        <option value="good" ${state.data.manualRank==='good'?'selected':''}>خوب</option>
        <option value="medium" ${state.data.manualRank==='medium'?'selected':''}>متوسط</option>
        <option value="weak" ${state.data.manualRank==='weak'?'selected':''}>ضعیف</option>
      </select>
      
      <div style="font-size:0.85rem; margin-bottom:10px;">
        مقدار S متناظر با رتبه انتخاب شده: <strong id="out_manual_s_display" style="color:#e74c3c; font-size:1rem;">0</strong>
      </div>

      <p class="note" style="margin-bottom:10px;">اگر مایلید مقادیر دستی را وارد کنید:</p>
      <div class="input-group">
        <label>مقاومت مشخصه (f'c) - اختیاری:</label>
        <input type="number" id="in_manualFc" placeholder="در صورت خالی بودن، از f'c بالایی استفاده می‌شود" step="0.1">
      </div>
      <div class="input-group">
        <label>انحراف معیار (S) - اختیاری:</label>
        <input type="number" id="in_manualS" placeholder="در صورت خالی بودن، از S رتبه کارگاه استفاده می‌شود" step="0.1">
      </div>
    </div>

    <div class="highlight-box">
      مقاومت هدف نهایی (f'cm) = <span id="out_fcm_final">0.0</span> MPa
    </div>
  `;
}

// --- گام‌های ۲ تا ۱۰ (فعلاً خالی) ---
function renderStep2() { return `<h2>گام ۲</h2><p>در حال ساخت...</p>`; }
function renderStep3() { return `<h2>گام ۳</h2><p>در حال ساخت...</p>`; }
function renderStep4() { return `<h2>گام ۴</h2><p>در حال ساخت...</p>`; }
function renderStep5() { return `<h2>گام ۵</h2><p>در حال ساخت...</p>`; }
function renderStep6() { return `<h2>گام ۶</h2><p>در حال ساخت...</p>`; }
function renderStep7() { return `<h2>گام ۷</h2><p>در حال ساخت...</p>`; }
function renderStep8() { return `<h2>گام ۸</h2><p>در حال ساخت...</p>`; }
function renderStep9() { return `<h2>گام ۹</h2><p>در حال ساخت...</p>`; }
function renderStep10() { return `<h2>گام ۱۰</h2><p>در حال ساخت...</p>`; }

// آرایه توابع رندر
const renderFunctions = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7, renderStep8, renderStep9, renderStep10];

// ==========================================
// ۵. منطق ناوبری (تب‌ها و دکمه‌ها)
// ==========================================
function updateUI() {
  const tabsContainer = document.getElementById('tabs');
  tabsContainer.innerHTML = steps.map((s, i) => 
    `<button class="tab-btn ${i === state.currentStep ? 'active' : ''}" onclick="goToStep(${i})">${s.title}</button>`
  ).join('');

  const screen = document.getElementById('screen');
  screen.innerHTML = renderFunctions[state.currentStep]();

  document.getElementById('prev').disabled = state.currentStep === 0;
  document.getElementById('next').disabled = state.currentStep === state.totalSteps - 1;
  document.getElementById('next').innerText = state.currentStep === state.totalSteps - 1 ? 'پایان' : 'گام بعد';

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
// ۶. منطق زنده هر گام
// ==========================================
function attachStepLogic(stepIndex) {
  if (stepIndex === 0) {
    // ===== منطق گام ۱ =====
    const projectNameInput = document.getElementById('in_projectName');
    const elementTypeSelect = document.getElementById('in_elementType');
    const maxAggSizeSelect = document.getElementById('in_maxAggSize');
    const rebarSelect = document.getElementById('in_rebarDensity');
    const fcInput = document.getElementById('in_fc');
    const autoBox = document.getElementById('autoBox');
    const manualBox = document.getElementById('manualBox');
    const stdMethodRadios = document.querySelectorAll('input[name="stdMethod"]');

    const getSFromRank = (rank) => {
      if (rank === 'good') return 4;
      if (rank === 'weak') return 6;
      return 5;
    };

    const calculate = () => {
      state.data.projectName = projectNameInput.value;
      state.data.elementType = elementTypeSelect.value;
      state.data.maxAggSize = parseFloat(maxAggSizeSelect.value);
      state.data.rebarDensity = rebarSelect.value;
      state.data.fc = parseFloat(fcInput.value) || 0;

      if (state.data.stdDevMethod === 'auto') {
        const rankSelect = document.getElementById('in_workshopRank');
        state.data.workshopRank = rankSelect.value;
        const s = getSFromRank(state.data.workshopRank);
        state.data.stdDev = s;

        const fc = state.data.fc;
        const fcm1 = fc + (1.34 * s) + 1.5;
        const constant = (fc <= 20) ? 3 : 4;
        const fcm2 = fc + (2.33 * s) - constant;
        
        state.data.stdDevAuto1 = fcm1;
        state.data.stdDevAuto2 = fcm2;
        
        document.getElementById('out_formula1').innerText = fcm1.toFixed(1);
        document.getElementById('out_formula2').innerText = fcm2.toFixed(1);
        
        state.data.fcm = Math.max(fcm1, fcm2);
      } else {
        const rankSelect = document.getElementById('in_manualRank');
        state.data.manualRank = rankSelect.value;
        const sFromRank = getSFromRank(state.data.manualRank);
        
        document.getElementById('out_manual_s_display').innerText = sFromRank;

        const manualFcInput = document.getElementById('in_manualFc');
        const manualSInput = document.getElementById('in_manualS');
        
        const manualFc = parseFloat(manualFcInput.value);
        const manualS = parseFloat(manualSInput.value);

        const finalFc = (!isNaN(manualFc) && manualFc > 0) ? manualFc : state.data.fc;
        const finalS = (!isNaN(manualS) && manualS > 0) ? manualS : sFromRank;
        
        state.data.stdDev = finalS;
        state.data.fcm = finalFc + (1.64 * finalS);
      }

      document.getElementById('out_fcm_final').innerText = state.data.fcm.toFixed(1);
    };

    stdMethodRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.data.stdDevMethod = e.target.value;
        if (state.data.stdDevMethod === 'auto') {
          autoBox.style.display = 'block';
          manualBox.style.display = 'none';
        } else {
          autoBox.style.display = 'none';
          manualBox.style.display = 'block';
        }
        calculate();
      });
    });

    projectNameInput.addEventListener('input', calculate);
    elementTypeSelect.addEventListener('change', calculate);
    maxAggSizeSelect.addEventListener('change', calculate);
    rebarSelect.addEventListener('change', calculate);
    fcInput.addEventListener('input', calculate);
    document.getElementById('in_workshopRank').addEventListener('change', calculate);
    document.getElementById('in_manualRank').addEventListener('change', calculate);
    document.getElementById('in_manualFc').addEventListener('input', calculate);
    document.getElementById('in_manualS').addEventListener('input', calculate);

    calculate();
  }
  
  // گام‌های ۲ تا ۱۰ بعداً اینجا اضافه می‌شوند
}

// ==========================================
// ۷. شروع برنامه
// ==========================================
updateUI();
