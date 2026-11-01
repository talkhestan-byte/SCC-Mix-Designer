// ==========================================
// ۱. تعریف داده‌های سراسری (State)
// ==========================================
const state = {
  currentStep: 0,
  totalSteps: 9,
  data: {
    projectName: '', elementType: 'ستون', elementThickness: 'medium',
    horizontalDistance: 'medium', maxAggSize: 19, rebarDensity: 'medium',
    fc: 30, stdDevMethod: 'auto', workshopRank: 'medium', manualRank: 'medium',
    fcm: 0, stdDev: 0, slumpClass: 'SF2',
    aggCount: 2, aggregates: [], 
    aggRatios: [50, 50, 0, 0], n_lower: 0.25, n_upper: 0.35, n_power: 0.30, fullerRow: '2',
    bulkDensities: [1600, 1600, 1600, 1600], voidsPercent: 35,
    rs_a: 3, sccType: 'powder', cementType: '425', fractureType: 'C', airPercent: 1.5,
    wc: 0, water: 0, powder: 0, cement: 0, filler: 0, coarseAgg: 0, fineAgg: 0
  }
};

// ==========================================
// ۲. تعریف ساختار ۹ گام
// ==========================================
const steps = [
  { id: 'step1', title: '۱. شناسنامه' },
  { id: 'step2', title: '۲. جدول دانه‌بندی' },
  { id: 'step3', title: '۳. تطبیق منحنی' },
  { id: 'step4', title: '۴. فضای خالی' },
  { id: 'step5', title: '۵. شکل دانه' },
  { id: 'step6', title: '۶. حجم خمیر' },
  { id: 'step7', title: '۷. آب/سیمان' },
  { id: 'step8', title: '۸. پودر و هوا' },
  { id: 'step9', title: '۹. خروجی' }
];

// ==========================================
// ۳. توابع کمکی
// ==========================================
let currentChart = null;
const sieves = [0.075, 0.15, 0.3, 0.6, 1.18, 2.36, 4.75, 9.5, 12.5, 19];

function fullerThompson(D, d, n) {
  if (d <= 0.075) return 0;
  if (d >= D) return 100;
  return ((Math.pow(d, n) - Math.pow(0.075, n)) / (Math.pow(D, n) - Math.pow(0.075, n))) * 100;
}

// ==========================================
// ۴. توابع رندر
// ==========================================

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
      <label>ضخامت قطعه:</label>
      <select id="in_elementThickness">
        <option value="thin" ${state.data.elementThickness==='thin'?'selected':''}>نازک</option>
        <option value="medium" ${state.data.elementThickness==='medium'?'selected':''}>متوسط</option>
        <option value="thick" ${state.data.elementThickness==='thick'?'selected':''}>ضخیم</option>
      </select>
    </div>
    <div class="input-group">
      <label>طول حرکت افقی بتن:</label>
      <select id="in_horizontalDistance">
        <option value="low" ${state.data.horizontalDistance==='low'?'selected':''}>کم</option>
        <option value="medium" ${state.data.horizontalDistance==='medium'?'selected':''}>متوسط</option>
        <option value="high" ${state.data.horizontalDistance==='high'?'selected':''}>زیاد</option>
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
        <input type="radio" name="stdMethod" value="auto" ${state.data.stdDevMethod==='auto'?'checked':''}> خودکار
      </label>
      <label style="display:flex; align-items:center; gap:5px; font-weight:normal; font-size:0.85rem;">
        <input type="radio" name="stdMethod" value="manual" ${state.data.stdDevMethod==='manual'?'checked':''}> دستی
      </label>
    </div>
    <div id="autoBox" style="display: ${state.data.stdDevMethod === 'auto' ? 'block' : 'none'}; background:#f8fafc; padding:10px; border-radius:8px; margin-bottom:10px;">
      <label style="font-size:0.85rem; font-weight:bold;">رتبه کارگاه:</label>
      <select id="in_workshopRank" style="margin-bottom:10px;">
        <option value="good" ${state.data.workshopRank==='good'?'selected':''}>خوب (S=4)</option>
        <option value="medium" ${state.data.workshopRank==='medium'?'selected':''}>متوسط (S=5)</option>
        <option value="weak" ${state.data.workshopRank==='weak'?'selected':''}>ضعیف (S=6)</option>
      </select>
      <div style="font-size:0.85rem; background:#fff; padding:8px; border-radius:6px;">
        <div>رابطه ۱: <strong id="out_formula1">0</strong></div>
        <div>رابطه ۲: <strong id="out_formula2">0</strong></div>
      </div>
    </div>
    <div id="manualBox" style="display: ${state.data.stdDevMethod === 'manual' ? 'block' : 'none'}; background:#f8fafc; padding:10px; border-radius:8px; margin-bottom:10px;">
      <label style="font-size:0.85rem; font-weight:bold;">رتبه کارگاه:</label>
      <select id="in_manualRank" style="margin-bottom:10px;">
        <option value="good" ${state.data.manualRank==='good'?'selected':''}>خوب</option>
        <option value="medium" ${state.data.manualRank==='medium'?'selected':''}>متوسط</option>
        <option value="weak" ${state.data.manualRank==='weak'?'selected':''}>ضعیف</option>
      </select>
      <div style="font-size:0.85rem; margin-bottom:10px;">مقدار S: <strong id="out_manual_s_display">0</strong></div>
      <div class="input-group"><label>مقاومت مشخصه (اختیاری):</label><input type="number" id="in_manualFc" step="0.1"></div>
      <div class="input-group"><label>انحراف معیار (اختیاری):</label><input type="number" id="in_manualS" step="0.1"></div>
    </div>
    <div class="highlight-box">مقاومت هدف نهایی (f'cm) = <span id="out_fcm_final">0.0</span> MPa</div>
    <div class="highlight-box" style="background:#e0f2fe; border-color:#0284c7; color:#075985; margin-top:10px;">رده اسلامپ: <span id="out_slumpClass">SF2</span></div>
  `;
}

function renderStep2() {
  let headerSieves = sieves.map(s => `<th>${s}</th>`).join('');
  let aggRows = '';
  for (let i = 0; i < state.data.aggCount; i++) {
    const agg = state.data.aggregates[i] || { name: `سنگدانه ${i+1}`, ssd: 2650, absorption: 1.5, passes: {} };
    let passCells = sieves.map(s => {
      const val = agg.passes[s] !== undefined ? agg.passes[s] : 0;
      return `<td><input type="number" class="pass-input" data-agg="${i}" data-sieve="${s}" value="${val}" step="0.1"></td>`;
    }).join('');
    aggRows += `<tr><td style="white-space:nowrap;"><input type="text" class="agg-name" data-agg="${i}" value="${agg.name}" style="width:80px;"></td>${passCells}</tr>`;
  }
  let ssdCells = '', absCells = '';
  for (let i = 0; i < state.data.aggCount; i++) {
    const agg = state.data.aggregates[i] || { ssd: 2650, absorption: 1.5 };
    ssdCells += `<td><input type="number" class="ssd-input" data-agg="${i}" value="${agg.ssd}" style="width:60px;" step="10"></td>`;
    absCells += `<td><input type="number" class="abs-input" data-agg="${i}" value="${agg.absorption}" style="width:50px;" step="0.1"></td>`;
  }
  return `
    <h2>گام ۲: جدول دانه‌بندی سنگدانه‌ها</h2>
    <div class="input-group">
      <label>تعداد سنگدانه‌ها:</label>
      <select id="in_aggCount">
        <option value="1" ${state.data.aggCount==1?'selected':''}>۱ سنگدانه</option>
        <option value="2" ${state.data.aggCount==2?'selected':''}>۲ سنگدانه</option>
        <option value="3" ${state.data.aggCount==3?'selected':''}>۳ سنگدانه</option>
        <option value="4" ${state.data.aggCount==4?'selected':''}>۴ سنگدانه</option>
      </select>
    </div>
    <div style="overflow-x:auto;">
      <table class="grading-table" style="font-size:0.75rem; min-width:600px;">
        <thead><tr><th>نام</th>${headerSieves}</tr></thead>
        <tbody>
          ${aggRows}
          <tr style="background:#f1f5f9;"><td style="font-weight:bold;">چگالی SSD (kg/m³)</td>${ssdCells}</tr>
          <tr style="background:#f1f5f9;"><td style="font-weight:bold;">جذب آب (%)</td>${absCells}</tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderStep3() {
  let ratioInputs = '';
  for (let i = 0; i < state.data.aggCount; i++) {
    const agg = state.data.aggregates[i] || { name: `سنگدانه ${i+1}` };
    const ratio = state.data.aggRatios[i] || 0;
    ratioInputs += `
      <div class="input-group" style="display:flex; align-items:center; gap:10px;">
        <label style="width:100px; margin:0;">${agg.name}:</label>
        <input type="range" class="agg-ratio-slider" data-agg="${i}" min="0" max="100" value="${ratio}" style="flex:1;">
        <span id="ratio-val-${i}" style="width:40px; text-align:left;">${ratio}%</span>
      </div>`;
  }
  return `
    <h2>گام ۳: تطبیق منحنی دانه‌بندی با فولر-تامسون</h2>
    <div class="input-group">
      <label>انتخاب کاربری (ردیف جدول ۶-۵):</label>
      <select id="in_fullerRow">
        <option value="1" ${state.data.fullerRow==='1'?'selected':''}>ردیف ۱: جریان ۵۰۰-۵۵۰</option>
        <option value="2" ${state.data.fullerRow==='2'?'selected':''}>ردیف ۲: جریان ۵۶۰-۶۵۰</option>
        <option value="3" ${state.data.fullerRow==='3'?'selected':''}>ردیف ۳: جریان بیشتر از ۶۶۰ (تیر و دال متوسط)</option>
        <option value="4" ${state.data.fullerRow==='4'?'selected':''}>ردیف ۴: جریان بیشتر از ۶۶۰ (تیر و دال زیاد)</option>
        <option value="5" ${state.data.fullerRow==='5'?'selected':''}>ردیف ۵: بتن ریز بافت</option>
      </select>
    </div>
    <div class="highlight-box" style="background:#f8fafc; border-color:#cbd5e1; color:#334155; font-size:0.9rem;">محدوده توان n مجاز: <strong id="out_n_range">0.25 تا 0.35</strong></div>
    <div style="background:#f8fafc; padding:10px; border-radius:8px; margin-bottom:15px;">${ratioInputs}</div>
    <div class="chart-container" style="height:300px;"><canvas id="chartStep3"></canvas></div>
    <p id="chartStatus" style="text-align:center; font-weight:bold; margin-top:10px;"></p>
  `;
}

function renderStep4() {
  let bulkInputs = '';
  for (let i = 0; i < state.data.aggCount; i++) {
    const agg = state.data.aggregates[i] || { name: `سنگدانه ${i+1}` };
    const bulk = state.data.bulkDensities[i] || 1600;
    bulkInputs += `<div class="input-group"><label>${agg.name} - وزن مخصوص انبوهی متراکم (M) - kg/m³:</label><input type="number" class="bulk-input" data-agg="${i}" value="${bulk}" step="10"></div>`;
  }
  return `
    <h2>گام ۴: محاسبه درصد فضای خالی سنگدانه</h2>
    <p class="note">وزن مخصوص انبوهی متراکم هر سنگدانه را جداگانه وارد کنید (ASTM C29).</p>
    ${bulkInputs}
    <div class="highlight-box" style="background:#f8fafc; border-color:#cbd5e1; color:#334155;">میانگین وزنی چگالی SSD (S) = <span id="out_avgSSD">0</span> kg/m³</div>
    <div class="highlight-box" style="background:#f8fafc; border-color:#cbd5e1; color:#334155;">میانگین وزنی وزن مخصوص انبوهی (M) = <span id="out_avgBulk">0</span> kg/m³</div>
    <div class="highlight-box">درصد فضای خالی (تخلخل) = <span id="out_voidsPercent">0.0</span> %</div>
  `;
}

function renderStep5() { return `<h2>گام ۵: شکل دانه</h2><p>در حال ساخت...</p>`; }
function renderStep6() { return `<h2>گام ۶: حجم خمیر</h2><p>در حال ساخت...</p>`; }
function renderStep7() { return `<h2>گام ۷: آب/سیمان</h2><p>در حال ساخت...</p>`; }
function renderStep8() { return `<h2>گام ۸: پودر و هوا</h2><p>در حال ساخت...</p>`; }
function renderStep9() { return `<h2>گام ۹: خروجی</h2><p>در حال ساخت...</p>`; }

const renderFunctions = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7, renderStep8, renderStep9];
// ==========================================
// ۵. منطق ناوبری
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
  
  // ===== گام ۱ =====
  if (stepIndex === 0) {
    const projectNameInput = document.getElementById('in_projectName');
    const elementTypeSelect = document.getElementById('in_elementType');
    const thicknessSelect = document.getElementById('in_elementThickness');
    const distanceSelect = document.getElementById('in_horizontalDistance');
    const maxAggSizeSelect = document.getElementById('in_maxAggSize');
    const rebarSelect = document.getElementById('in_rebarDensity');
    const fcInput = document.getElementById('in_fc');
    const autoBox = document.getElementById('autoBox');
    const manualBox = document.getElementById('manualBox');
    const stdMethodRadios = document.querySelectorAll('input[name="stdMethod"]');

    const getSFromRank = (rank) => rank === 'good' ? 4 : (rank === 'weak' ? 6 : 5);

    const calculate = () => {
      state.data.projectName = projectNameInput.value;
      state.data.elementType = elementTypeSelect.value;
      state.data.elementThickness = thicknessSelect.value;
      state.data.horizontalDistance = distanceSelect.value;
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
        document.getElementById('out_formula1').innerText = fcm1.toFixed(1);
        document.getElementById('out_formula2').innerText = fcm2.toFixed(1);
        state.data.fcm = Math.max(fcm1, fcm2);
      } else {
        const rankSelect = document.getElementById('in_manualRank');
        state.data.manualRank = rankSelect.value;
        const sFromRank = getSFromRank(state.data.manualRank);
        document.getElementById('out_manual_s_display').innerText = sFromRank;
        const manualFc = parseFloat(document.getElementById('in_manualFc').value);
        const manualS = parseFloat(document.getElementById('in_manualS').value);
        const finalFc = (!isNaN(manualFc) && manualFc > 0) ? manualFc : state.data.fc;
        const finalS = (!isNaN(manualS) && manualS > 0) ? manualS : sFromRank;
        state.data.stdDev = finalS;
        state.data.fcm = finalFc + (1.64 * finalS);
      }
      document.getElementById('out_fcm_final').innerText = state.data.fcm.toFixed(1);

      const rebar = state.data.rebarDensity, thickness = state.data.elementThickness, distance = state.data.horizontalDistance;
      let slump = 'SF1';
      if (rebar === 'veryHigh' || (thickness === 'thin' && rebar === 'high')) slump = 'SF3';
      else if (rebar === 'high' || (thickness === 'thin' && rebar === 'medium')) slump = 'SF2';
      else if (rebar === 'medium' || distance === 'high') slump = 'SF2';
      state.data.slumpClass = slump;
      document.getElementById('out_slumpClass').innerText = slump;
    };

    stdMethodRadios.forEach(radio => radio.addEventListener('change', (e) => {
      state.data.stdDevMethod = e.target.value;
      autoBox.style.display = state.data.stdDevMethod === 'auto' ? 'block' : 'none';
      manualBox.style.display = state.data.stdDevMethod === 'manual' ? 'block' : 'none';
      calculate();
    }));

    [projectNameInput, fcInput, document.getElementById('in_manualFc'), document.getElementById('in_manualS')].forEach(el => el.addEventListener('input', calculate));
    [elementTypeSelect, thicknessSelect, distanceSelect, maxAggSizeSelect, rebarSelect, document.getElementById('in_workshopRank'), document.getElementById('in_manualRank')].forEach(el => el.addEventListener('change', calculate));
    calculate();
  }
  
  // ===== گام ۲ =====
  if (stepIndex === 1) {
    if (state.data.aggregates.length === 0) {
      for (let i = 0; i < 4; i++) state.data.aggregates.push({ name: `سنگدانه ${i+1}`, ssd: 2650, absorption: 1.5, passes: {} });
    }
    document.getElementById('in_aggCount').addEventListener('change', (e) => {
      state.data.aggCount = parseInt(e.target.value);
      document.getElementById('screen').innerHTML = renderStep2();
      attachStepLogic(1);
    });
    const saveData = () => {
      document.querySelectorAll('.agg-name').forEach((inp, i) => { if (state.data.aggregates[i]) state.data.aggregates[i].name = inp.value; });
      document.querySelectorAll('.ssd-input').forEach((inp, i) => { if (state.data.aggregates[i]) state.data.aggregates[i].ssd = parseFloat(inp.value) || 2650; });
      document.querySelectorAll('.abs-input').forEach((inp, i) => { if (state.data.aggregates[i]) state.data.aggregates[i].absorption = parseFloat(inp.value) || 1.5; });
      document.querySelectorAll('.pass-input').forEach(inp => {
        const aggIndex = parseInt(inp.dataset.agg), sieve = parseFloat(inp.dataset.sieve);
        if (state.data.aggregates[aggIndex]) state.data.aggregates[aggIndex].passes[sieve] = parseFloat(inp.value) || 0;
      });
    };
    document.querySelectorAll('.pass-input, .agg-name, .ssd-input, .abs-input').forEach(inp => inp.addEventListener('input', saveData));
    saveData();
  }

  // ===== گام ۳ =====
  if (stepIndex === 2) {
    const rowSelect = document.getElementById('in_fullerRow');
    const getNRange = (row) => {
      switch(row) {
        case '1': return { lower: 0.3, upper: 0.4 };
        case '2': return { lower: 0.25, upper: 0.35 };
        case '3': return { lower: 0.2, upper: 0.3 };
        case '4': return { lower: 0.15, upper: 0.25 };
        case '5': return { lower: 0.1, upper: 0.2 };
        default: return { lower: 0.25, upper: 0.35 };
      }
    };
    const drawChartStep3 = () => {
      const range = getNRange(rowSelect.value);
      state.data.n_lower = range.lower; state.data.n_upper = range.upper;
      state.data.n_power = (range.lower + range.upper) / 2;
      document.getElementById('out_n_range').innerText = `${range.lower} تا ${range.upper}`;

      document.querySelectorAll('.agg-ratio-slider').forEach(inp => {
        const idx = parseInt(inp.dataset.agg);
        state.data.aggRatios[idx] = parseFloat(inp.value) || 0;
        document.getElementById(`ratio-val-${idx}`).innerText = state.data.aggRatios[idx] + '%';
      });

      const xLabels = sieves.map(s => s.toString());
      const userCurve = sieves.map(s => {
        let combined = 0, totalRatio = 0;
        for (let i = 0; i < state.data.aggCount; i++) {
          const ratio = state.data.aggRatios[i] || 0;
          combined += (ratio / 100) * (state.data.aggregates[i].passes[s] || 0);
          totalRatio += ratio;
        }
        return totalRatio > 0 ? (combined / totalRatio) * 100 : 0;
      });

      const idealLower = sieves.map(s => fullerThompson(state.data.maxAggSize, s, range.lower));
      const idealUpper = sieves.map(s => fullerThompson(state.data.maxAggSize, s, range.upper));

      const ctx = document.getElementById('chartStep3').getContext('2d');
      if (currentChart) currentChart.destroy();
      currentChart = new Chart(ctx, {
        type: 'line',
        data: { labels: xLabels, datasets: [
          { label: `کران پایین (n=${range.lower})`, data: idealLower, borderColor: '#e74c3c', borderDash: [5, 5], borderWidth: 2, pointRadius: 0 },
          { label: `کران بالا (n=${range.upper})`, data: idealUpper, borderColor: '#e74c3c', borderDash: [5, 5], borderWidth: 2, pointRadius: 0 },
          { label: 'منحنی ترکیبی', data: userCurve, borderColor: '#2980b9', backgroundColor: 'rgba(41, 128, 185, 0.1)', borderWidth: 3, pointRadius: 4, fill: true }
        ]},
        options: { responsive: true, maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'الک (mm)' } }, y: { min: 0, max: 100, title: { display: true, text: 'عبوری (%)' } } }, plugins: { legend: { labels: { font: { size: 10 } } } } }
      });

      let insideCount = 0, totalCount = 0;
      userCurve.forEach((val, i) => {
        if (idealLower[i] > 5 && idealLower[i] < 95) { totalCount++; if (val >= idealLower[i] - 5 && val <= idealUpper[i] + 5) insideCount++; }
      });
      const matchRatio = totalCount > 0 ? (insideCount / totalCount) * 100 : 0;
      const statusEl = document.getElementById('chartStatus');
      if (matchRatio > 80) { statusEl.innerHTML = `✅ تطبیق مناسب (${matchRatio.toFixed(0)}%)`; statusEl.style.color = '#27ae60'; }
      else if (matchRatio > 50) { statusEl.innerHTML = `⚠️ تطبیق نسبی (${matchRatio.toFixed(0)}%)`; statusEl.style.color = '#e67e22'; }
      else { statusEl.innerHTML = `❌ تطبیق ضعیف (${matchRatio.toFixed(0)}%)`; statusEl.style.color = '#e74c3c'; }
    };
    rowSelect.addEventListener('change', drawChartStep3);
    document.querySelectorAll('.agg-ratio-slider').forEach(inp => inp.addEventListener('input', drawChartStep3));
    drawChartStep3();
  }

  // ===== گام ۴ =====
  if (stepIndex === 3) {
    const calculateVoids = () => {
      let weightedSSD = 0, weightedBulk = 0, totalRatio = 0;
      document.querySelectorAll('.bulk-input').forEach(inp => {
        const idx = parseInt(inp.dataset.agg);
        state.data.bulkDensities[idx] = parseFloat(inp.value) || 1600;
      });
      for (let i = 0; i < state.data.aggCount; i++) {
        const ratio = state.data.aggRatios[i] || 0;
        if (ratio > 0) {
          weightedSSD += state.data.aggregates[i].ssd * ratio;
          weightedBulk += state.data.bulkDensities[i] * ratio;
          totalRatio += ratio;
        }
      }
      const avgSSD = totalRatio > 0 ? (weightedSSD / totalRatio) : 2650;
      const avgBulk = totalRatio > 0 ? (weightedBulk / totalRatio) : 1600;
      document.getElementById('out_avgSSD').innerText = avgSSD.toFixed(0);
      document.getElementById('out_avgBulk').innerText = avgBulk.toFixed(0);
      
      const S = avgSSD;
      const M = avgBulk;
      const W = 998;
      const voids = 100 * ((S * W) - M) / (S * W);
      state.data.voidsPercent = Math.max(20, Math.min(50, voids));
      document.getElementById('out_voidsPercent').innerText = state.data.voidsPercent.toFixed(1);
    };
    document.querySelectorAll('.bulk-input').forEach(inp => inp.addEventListener('input', calculateVoids));
    calculateVoids();
  }
}

// ==========================================
// ۷. شروع برنامه
// ==========================================
updateUI();
