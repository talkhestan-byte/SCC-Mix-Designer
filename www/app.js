// ==========================================
// ۱. تعریف داده‌های سراسری (State)
// ==========================================
const state = {
  currentStep: 0, totalSteps: 9,
  data: {
    projectName: '', elementType: 'ستون', elementThickness: 'medium',
    horizontalDistance: 'medium', maxAggSize: 19, rebarDensity: 'medium',
    fc: 30, stdDevMethod: 'auto', workshopRank: 'ب', manualRank: 'ب',
    fcm: 0, stdDev: 0, slumpClass: 'SF2',
    aggCount: 2, aggregates: [], aggRatios: [50, 50, 0, 0],
    n_lower: 0.25, n_upper: 0.35, n_power: 0.30, fullerRow: '2',
    bulkDensities: [1600, 1600, 1600, 1600], voidsPercent: 35,
    rs_a: 3, vpasteSpacing: 0, vpasteFilling: 0, finalVpaste: 0, sccType: 'powder',
    cementType: '425', fractureType: 'C', airPercent: 1.5,
    wc: 0, water: 0, powder: 0, cement: 0, filler: 0, coarseAgg: 0, fineAgg: 0
  }
};

const steps = [
  { id: 'step1', title: '۱. اطلاعات اولیه' },
  { id: 'step2', title: '۲. مشخصات سنگدانه' },
  { id: 'step3', title: '۳. سهم‌بندی و منحنی' },
  { id: 'step4', title: '۴. فضای خالی' },
  { id: 'step5', title: '۵. شکل دانه' },
  { id: 'step6', title: '۶. حجم خمیر' },
  { id: 'step7', title: '۷. آب/سیمان' },
  { id: 'step8', title: '۸. پودر و هوا' },
  { id: 'step9', title: '۹. خروجی' }
];

let currentChart = null;
const sieves = [37.5, 25, 19, 12.5, 9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15, 0.075];
const sieveLabels = ["1.1/2", "1", "3/4", "1/2", "3/8", "#4", "#8", "#16", "#30", "#50", "#100", "#200"];

function fullerThompson(D, d, n) {
  if (d <= 0.075) return 0;
  if (d >= D) return 100;
  return ((Math.pow(d, n) - Math.pow(0.075, n)) / (Math.pow(D, n) - Math.pow(0.075, n))) * 100;
}
function renderStep1() {
  return `
    <h2>اطلاعات و خواسته‌های اولیه</h2>
    <div class="input-row"><label>نام طرح / پروژه:</label><input type="text" id="in_projectName" value="${state.data.projectName}" placeholder="نام پروژه"></div>
    <div class="input-row"><label>نوع المان:</label>
      <select id="in_elementType">
        <option value="ستون" ${state.data.elementType==='ستون'?'selected':''}>ستون</option>
        <option value="دیوار" ${state.data.elementType==='دیوار'?'selected':''}>دیوار</option>
        <option value="تیر" ${state.data.elementType==='تیر'?'selected':''}>تیر</option>
        <option value="دال" ${state.data.elementType==='دال'?'selected':''}>دال</option>
        <option value="شالوده" ${state.data.elementType==='شالوده'?'selected':''}>شالوده</option>
      </select>
    </div>
    <div class="input-row"><label>ضخامت قطعه:</label>
      <select id="in_elementThickness">
        <option value="thin" ${state.data.elementThickness==='thin'?'selected':''}>نازک</option>
        <option value="medium" ${state.data.elementThickness==='medium'?'selected':''}>متوسط</option>
        <option value="thick" ${state.data.elementThickness==='thick'?'selected':''}>ضخیم</option>
      </select>
    </div>
    <div class="input-row"><label>طول حرکت افقی بتن:</label>
      <select id="in_horizontalDistance">
        <option value="low" ${state.data.horizontalDistance==='low'?'selected':''}>کم</option>
        <option value="medium" ${state.data.horizontalDistance==='medium'?'selected':''}>متوسط</option>
        <option value="high" ${state.data.horizontalDistance==='high'?'selected':''}>زیاد</option>
      </select>
    </div>
    <div class="input-row"><label>حداکثر اندازه اسمی سنگدانه (mm):</label>
      <select id="in_maxAggSize">
        <option value="9.5" ${state.data.maxAggSize==9.5?'selected':''}>9.5</option>
        <option value="12.5" ${state.data.maxAggSize==12.5?'selected':''}>12.5</option>
        <option value="19" ${state.data.maxAggSize==19?'selected':''}>19</option>
        <option value="25" ${state.data.maxAggSize==25?'selected':''}>25</option>
      </select>
    </div>
    <div class="input-row"><label>تراکم میلگرد:</label>
      <select id="in_rebarDensity">
        <option value="low" ${state.data.rebarDensity==='low'?'selected':''}>کم</option>
        <option value="medium" ${state.data.rebarDensity==='medium'?'selected':''}>متوسط</option>
        <option value="high" ${state.data.rebarDensity==='high'?'selected':''}>زیاد</option>
        <option value="veryHigh" ${state.data.rebarDensity==='veryHigh'?'selected':''}>فوق‌العاده زیاد</option>
      </select>
    </div>
    <h3>مشخصات مقاومت</h3>
    <div class="input-row"><label>مقاومت مشخصه فشاری (MPa):</label><input type="number" id="in_fc" value="${state.data.fc}" min="15" max="50"></div>
    <div class="input-row"><label>روش تعیین انحراف معیار:</label>
      <select id="in_stdMethod">
        <option value="auto" ${state.data.stdDevMethod==='auto'?'selected':''}>خودکار</option>
        <option value="manual" ${state.data.stdDevMethod==='manual'?'selected':''}>دستی</option>
      </select>
    </div>
    <div id="autoBox" style="display: ${state.data.stdDevMethod === 'auto' ? 'block' : 'none'};">
      <div class="input-row"><label>رتبه کارگاه:</label>
        <select id="in_workshopRank">
          <option value="الف" ${state.data.workshopRank==='الف'?'selected':''}>الف (S=4)</option>
          <option value="ب" ${state.data.workshopRank==='ب'?'selected':''}>ب (S=5)</option>
          <option value="ج" ${state.data.workshopRank==='ج'?'selected':''}>ج (S=6)</option>
        </select>
      </div>
      <div class="highlight-box" style="font-size:0.85rem; text-align:right;">
        <div>رابطه ۱: f'cm = f'c + 1.34S + 1.5 = <span id="out_formula1">0</span></div>
        <div>رابطه ۲: f'cm = f'c + 2.33S - 4 = <span id="out_formula2">0</span></div>
      </div>
    </div>
    <div id="manualBox" style="display: ${state.data.stdDevMethod === 'manual' ? 'block' : 'none'};">
      <div class="input-row"><label>رتبه کارگاه:</label>
        <select id="in_manualRank">
          <option value="الف" ${state.data.manualRank==='الف'?'selected':''}>الف</option>
          <option value="ب" ${state.data.manualRank==='ب'?'selected':''}>ب</option>
          <option value="ج" ${state.data.manualRank==='ج'?'selected':''}>ج</option>
        </select>
      </div>
      <div class="highlight-box" style="font-size:0.85rem;">مقدار S: <span id="out_manual_s_display">0</span></div>
    </div>
    <div class="input-row" style="margin-top:15px; background:#fffbeb; padding:10px; border-radius:8px; border:1px solid #fcd34d;">
      <label style="color:#b45309;">مقاومت هدف نهایی (f'cm) - ورودی:</label>
      <input type="number" id="in_fcm_final" value="${state.data.fcm || 0}" step="0.1">
    </div>
    <div class="highlight-box" style="background:#e0f2fe; border-color:#0284c7; color:#075985; margin-top:10px;">رده اسلامپ: <span id="out_slumpClass">SF2</span></div>
  `;
                               }
function renderStep2() {
  let headerAggs = '';
  for (let i = 0; i < state.data.aggCount; i++) {
    const agg = state.data.aggregates[i] || { name: `سنگدانه ${i+1}` };
    headerAggs += `<th><input type="text" class="agg-name" data-agg="${i}" value="${agg.name}" style="width:70px; padding:4px; font-size:0.75rem;"></th>`;
  }
  let rows = '';
  sieves.forEach((s) => {
    let cells = '';
    for (let i = 0; i < state.data.aggCount; i++) {
      const agg = state.data.aggregates[i] || { passes: {} };
      const val = agg.passes[s] !== undefined ? agg.passes[s] : 0;
      cells += `<td><input type="number" class="pass-input" data-agg="${i}" data-sieve="${s}" value="${val}" step="0.1"></td>`;
    }
    rows += `<tr><td style="font-weight:bold; background:#f1f5f9;">${s}</td>${cells}</tr>`;
  });
  let ssdCells = '', absCells = '';
  for (let i = 0; i < state.data.aggCount; i++) {
    const agg = state.data.aggregates[i] || { ssd: 2650, absorption: 1.5 };
    ssdCells += `<td><input type="number" class="ssd-input" data-agg="${i}" value="${agg.ssd}" step="10"></td>`;
    absCells += `<td><input type="number" class="abs-input" data-agg="${i}" value="${agg.absorption}" step="0.1"></td>`;
  }
  return `
    <h2>مشخصات سنگدانه‌ها</h2>
    <div class="input-row"><label>تعداد سنگدانه‌ها:</label>
      <select id="in_aggCount">
        <option value="1" ${state.data.aggCount==1?'selected':''}>۱</option>
        <option value="2" ${state.data.aggCount==2?'selected':''}>۲</option>
        <option value="3" ${state.data.aggCount==3?'selected':''}>۳</option>
        <option value="4" ${state.data.aggCount==4?'selected':''}>۴</option>
      </select>
    </div>
    <div style="overflow-x:auto;">
      <table class="grading-table">
        <thead><tr><th>الک (mm)</th>${headerAggs}</tr></thead>
        <tbody>${rows}<tr style="background:#e0f2fe;"><td style="font-weight:bold;">چگالی SSD</td>${ssdCells}</tr><tr style="background:#e0f2fe;"><td style="font-weight:bold;">جذب آب (%)</td>${absCells}</tr></tbody>
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
      <div class="input-row">
        <label>${agg.name}:</label>
        <input type="number" class="agg-ratio-input" data-agg="${i}" min="0" max="100" value="${ratio}" step="1" style="max-width:80px;">
        <span style="font-weight:bold; color:#1a2a6c; margin-right:5px;">%</span>
      </div>`;
  }
  return `
    <h2>سهم‌بندی و انتخاب منحنی</h2>
    <div class="input-row"><label>انتخاب کاربری (ردیف جدول ۶-۵):</label>
      <select id="in_fullerRow">
        <option value="1" ${state.data.fullerRow==='1'?'selected':''}>ردیف ۱</option>
        <option value="2" ${state.data.fullerRow==='2'?'selected':''}>ردیف ۲</option>
        <option value="3" ${state.data.fullerRow==='3'?'selected':''}>ردیف ۳</option>
        <option value="4" ${state.data.fullerRow==='4'?'selected':''}>ردیف ۴</option>
        <option value="5" ${state.data.fullerRow==='5'?'selected':''}>ردیف ۵</option>
      </select>
    </div>
    <div class="highlight-box" style="font-size:0.9rem;">محدوده n: <strong id="out_n_range">0.25 تا 0.35</strong></div>
    <div style="background:#f8fafc; padding:10px; border-radius:8px; margin-bottom:10px;">
      ${ratioInputs}
      <div id="ratio-error" style="color:#e74c3c; font-weight:bold; font-size:0.85rem; margin-top:5px; display:none;">⚠️ جمع درصدها باید ۱۰۰ باشد.</div>
    </div>
    <div class="chart-container"><canvas id="chartStep3"></canvas></div>
    <p id="chartStatus" style="text-align:center; font-weight:bold; margin-top:10px;"></p>
  `;
}
function renderStep4() {
  let bulkInputs = '';
  for (let i = 0; i < state.data.aggCount; i++) {
    const agg = state.data.aggregates[i] || { name: `سنگدانه ${i+1}` };
    const bulk = state.data.bulkDensities[i] || 1600;
    bulkInputs += `<div class="input-row"><label>${agg.name} - وزن مخصوص انبوهی (kg/m³):</label><input type="number" class="bulk-input" data-agg="${i}" value="${bulk}" step="10"></div>`;
  }
  return `
    <h2>فضای خالی سنگدانه</h2>
    ${bulkInputs}
    <div class="highlight-box" style="font-size:0.9rem;">میانگین S = <span id="out_avgSSD">0</span> kg/m³</div>
    <div class="highlight-box" style="font-size:0.9rem;">میانگین M = <span id="out_avgBulk">0</span> kg/m³</div>
    <div class="highlight-box">درصد فضای خالی = <span id="out_voidsPercent">0.0</span> %</div>
  `;
}

function renderStep5() {
  return `
    <h2>شکل دانه</h2>
    <div class="input-row"><label>رده شکل سنگدانه (Rs-a):</label>
      <select id="in_rsa">
        <option value="1" ${state.data.rs_a==1?'selected':''}>رده ۱ (گرد)</option>
        <option value="2" ${state.data.rs_a==2?'selected':''}>رده ۲</option>
        <option value="3" ${state.data.rs_a==3?'selected':''}>رده ۳</option>
        <option value="4" ${state.data.rs_a==4?'selected':''}>رده ۴</option>
        <option value="5" ${state.data.rs_a==5?'selected':''}>رده ۵ (گوشه‌دار)</option>
      </select>
    </div>
    <div class="highlight-box">رده انتخاب شده: <strong id="out_rsa_display">${state.data.rs_a}</strong></div>
  `;
}

function renderStep6() {
  return `
    <h2>حجم خمیر</h2>
    <div class="input-row"><label>نوع بتن خودتراکم:</label>
      <select id="in_sccType">
        <option value="powder" ${state.data.sccType==='powder'?'selected':''}>پودری (+۱۵٪)</option>
        <option value="vma" ${state.data.sccType==='vma'?'selected':''}>VMA (+۶٪)</option>
        <option value="combined" ${state.data.sccType==='combined'?'selected':''}>ترکیبی (+۱۰٪)</option>
      </select>
    </div>
    <div class="highlight-box" style="font-size:0.9rem;">Vpaste-spacing = <span id="out_vpaste_spacing">0.0</span> %</div>
    <div class="highlight-box" style="font-size:0.9rem;">Vpaste-filling = <span id="out_vpaste_filling">0.0</span> %</div>
    <div class="highlight-box">حجم خمیر نهایی = <span id="out_vpaste_final">0.0</span> %</div>
  `;
}
function renderStep7() { return `<h2>گام ۷: آب/سیمان</h2><p>در حال ساخت...</p>`; }
function renderStep8() { return `<h2>گام ۸: پودر و هوا</h2><p>در حال ساخت...</p>`; }
function renderStep9() { return `<h2>گام ۹: خروجی</h2><p>در حال ساخت...</p>`; }

const renderFunctions = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7, renderStep8, renderStep9];

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

function goToStep(index) { state.currentStep = index; updateUI(); }

document.getElementById('prev').addEventListener('click', () => {
  if (state.currentStep > 0) goToStep(state.currentStep - 1);
});
document.getElementById('next').addEventListener('click', () => {
  if (state.currentStep < state.totalSteps - 1) goToStep(state.currentStep + 1);
});
// ==========================================
// ۴. منطق زنده
// ==========================================
function attachStepLogic(stepIndex) {
  if (stepIndex === 0) {
    const fcInput = document.getElementById('in_fc');
    const stdMethodSelect = document.getElementById('in_stdMethod');
    const autoBox = document.getElementById('autoBox');
    const manualBox = document.getElementById('manualBox');
    const fcmFinalInput = document.getElementById('in_fcm_final');
    const getSFromRank = (rank) => rank === 'الف' ? 4 : (rank === 'ج' ? 6 : 5);
    
    const updateFcm = () => {
      if (state.data.stdDevMethod === 'auto') {
        const s = getSFromRank(document.getElementById('in_workshopRank').value);
        const fc = parseFloat(fcInput.value) || 0;
        const fcm1 = fc + (1.34 * s) + 1.5;
        const fcm2 = fc + (2.33 * s) - 4;
        document.getElementById('out_formula1').innerText = fcm1.toFixed(1);
        document.getElementById('out_formula2').innerText = fcm2.toFixed(1);
        state.data.fcm = Math.max(fcm1, fcm2);
        fcmFinalInput.value = state.data.fcm.toFixed(1);
      } else {
        const s = getSFromRank(document.getElementById('in_manualRank').value);
        document.getElementById('out_manual_s_display').innerText = s;
        state.data.fcm = parseFloat(fcmFinalInput.value) || 0;
      }
    };
    
    stdMethodSelect.addEventListener('change', (e) => {
      state.data.stdDevMethod = e.target.value;
      autoBox.style.display = state.data.stdDevMethod === 'auto' ? 'block' : 'none';
      manualBox.style.display = state.data.stdDevMethod === 'manual' ? 'block' : 'none';
      updateFcm();
    });
    fcInput.addEventListener('input', updateFcm);
    document.getElementById('in_workshopRank').addEventListener('change', updateFcm);
    document.getElementById('in_manualRank').addEventListener('change', updateFcm);
    fcmFinalInput.addEventListener('input', () => { state.data.fcm = parseFloat(fcmFinalInput.value) || 0; });
    
    document.getElementById('in_projectName').addEventListener('input', e => state.data.projectName = e.target.value);
    document.getElementById('in_elementType').addEventListener('change', e => state.data.elementType = e.target.value);
    document.getElementById('in_maxAggSize').addEventListener('change', e => state.data.maxAggSize = parseFloat(e.target.value));
    
    const updateSlump = () => {
      const rebar = state.data.rebarDensity, thickness = state.data.elementThickness, distance = state.data.horizontalDistance;
      let slump = 'SF1';
      if (rebar === 'veryHigh' || (thickness === 'thin' && rebar === 'high')) slump = 'SF3';
      else if (rebar === 'high' || (thickness === 'thin' && rebar === 'medium')) slump = 'SF2';
      else if (rebar === 'medium' || distance === 'high') slump = 'SF2';
      state.data.slumpClass = slump;
      document.getElementById('out_slumpClass').innerText = slump;
    };
    
    document.getElementById('in_elementThickness').addEventListener('change', e => { state.data.elementThickness = e.target.value; updateSlump(); });
    document.getElementById('in_horizontalDistance').addEventListener('change', e => { state.data.horizontalDistance = e.target.value; updateSlump(); });
    document.getElementById('in_rebarDensity').addEventListener('change', e => { state.data.rebarDensity = e.target.value; updateSlump(); });
    
    updateFcm();
    updateSlump();
  }

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

  if (stepIndex === 2) {
    const rowSelect = document.getElementById('in_fullerRow');
    const errorDiv = document.getElementById('ratio-error');
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
      let totalRatio = 0;
      document.querySelectorAll('.agg-ratio-input').forEach(inp => {
        const idx = parseInt(inp.dataset.agg);
        const val = parseFloat(inp.value) || 0;
        state.data.aggRatios[idx] = val;
        totalRatio += val;
      });
      
      if (Math.abs(totalRatio - 100) > 0.1) {
        errorDiv.style.display = 'block';
        const ctx = document.getElementById('chartStep3').getContext('2d');
        if (currentChart) currentChart.destroy();
        document.getElementById('chartStatus').innerText = '';
        return;
      } else {
        errorDiv.style.display = 'none';
      }
      
      const range = getNRange(rowSelect.value);
      state.data.n_lower = range.lower;
      state.data.n_upper = range.upper;
      state.data.n_power = (range.lower + range.upper) / 2;
      document.getElementById('out_n_range').innerText = `${range.lower} تا ${range.upper}`;
      
      const reversedSieves = [...sieves].reverse();
      const reversedLabels = [...sieveLabels].reverse();
      
      const userCurve = [];
      let reached100 = false;
      reversedSieves.forEach(s => {
        if (reached100) { userCurve.push(null); return; }
        let combined = 0;
        for (let i = 0; i < state.data.aggCount; i++) {
          combined += (state.data.aggRatios[i] / 100) * (state.data.aggregates[i].passes[s] || 0);
        }
        const val = Math.min(100, combined);
        userCurve.push(val);
        if (val >= 99.9) reached100 = true;
      });
      
      const idealLower = [], idealUpper = [];
      let lowerReached100 = false, upperReached100 = false;
      reversedSieves.forEach(s => {
        if (lowerReached100) idealLower.push(null);
        else {
          const val = fullerThompson(state.data.maxAggSize, s, range.lower);
          idealLower.push(val);
          if (val >= 99.9) lowerReached100 = true;
        }
        if (upperReached100) idealUpper.push(null);
        else {
          const val = fullerThompson(state.data.maxAggSize, s, range.upper);
          idealUpper.push(val);
          if (val >= 99.9) upperReached100 = true;
        }
      });
      
      const ctx = document.getElementById('chartStep3').getContext('2d');
      if (currentChart) currentChart.destroy();
      currentChart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [
      { 
        label: `کران پایین (n=${range.lower})`, 
        data: reversedSieves.map((s, i) => ({ x: s, y: idealLower[i] })).filter(p => p.y !== null),
        borderColor: '#e74c3c', 
        borderDash: [5, 5], 
        borderWidth: 2, 
        pointRadius: 0, 
        tension: 0.1 
      },
      { 
        label: `کران بالا (n=${range.upper})`, 
        data: reversedSieves.map((s, i) => ({ x: s, y: idealUpper[i] })).filter(p => p.y !== null),
        borderColor: '#e74c3c', 
        borderDash: [5, 5], 
        borderWidth: 2, 
        pointRadius: 0, 
        tension: 0.1 
      },
      { 
        label: 'منحنی ترکیبی', 
        data: reversedSieves.map((s, i) => ({ x: s, y: userCurve[i] })).filter(p => p.y !== null),
        borderColor: '#2980b9', 
        backgroundColor: 'rgba(41, 128, 185, 0.1)', 
        borderWidth: 3, 
        pointRadius: 0, 
        fill: true, 
        tension: 0.1 
      }
    ]
  },
  options: {
    responsive: true, 
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'logarithmic',
        title: { display: false },
        ticks: {
          callback: function(value) {
            const labelMap = {0.075: '#200', 0.15: '#100', 0.3: '#50', 0.6: '#30', 1.18: '#16', 2.36: '#8', 4.75: '#4', 9.5: '3/8', 12.5: '1/2', 19: '3/4', 25: '1', 37.5: '1.1/2'};
            return labelMap[value] || '';
          },
          font: { size: 9 },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        min: 0,
        max: 100,
        title: { display: true, text: 'درصد عبوری (%)', font: { size: 10 } },
        ticks: { font: { size: 10 } }
      }
    },
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 9 }, boxWidth: 12 } }
    }
  }
});
      let insideCount = 0, totalCount = 0;
      userCurve.forEach((val, i) => {
        if (val !== null && idealLower[i] !== null && idealLower[i] > 5 && idealLower[i] < 95) {
          totalCount++;
          if (val >= idealLower[i] - 5 && val <= idealUpper[i] + 5) insideCount++;
        }
      });
      const matchRatio = totalCount > 0 ? (insideCount / totalCount) * 100 : 0;
      const statusEl = document.getElementById('chartStatus');
      if (matchRatio > 80) { statusEl.innerHTML = `✅ تطبیق مناسب (${matchRatio.toFixed(0)}%)`; statusEl.style.color = '#27ae60'; }
      else if (matchRatio > 50) { statusEl.innerHTML = `⚠️ تطبیق نسبی (${matchRatio.toFixed(0)}%)`; statusEl.style.color = '#e67e22'; }
      else { statusEl.innerHTML = `❌ تطبیق ضعیف (${matchRatio.toFixed(0)}%)`; statusEl.style.color = '#e74c3c'; }
    };
    rowSelect.addEventListener('change', drawChartStep3);
    document.querySelectorAll('.agg-ratio-input').forEach(inp => inp.addEventListener('input', drawChartStep3));
    drawChartStep3();
  }

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
      const S = avgSSD, M = avgBulk, W = 998;
      const voids = 100 * ((S * W) - M) / (S * W);
      state.data.voidsPercent = Math.max(20, Math.min(50, voids));
      document.getElementById('out_voidsPercent').innerText = state.data.voidsPercent.toFixed(1);
    };
    document.querySelectorAll('.bulk-input').forEach(inp => inp.addEventListener('input', calculateVoids));
    calculateVoids();
  }

  if (stepIndex === 4) {
    document.getElementById('in_rsa').addEventListener('change', (e) => {
      state.data.rs_a = parseInt(e.target.value);
      document.getElementById('out_rsa_display').innerText = state.data.rs_a;
    });
  }

  if (stepIndex === 5) {
    const sccTypeSelect = document.getElementById('in_sccType');
    const calculateVpaste = () => {
      state.data.sccType = sccTypeSelect.value;
      const vSpacing = 8 + 2 * (state.data.rs_a - 1);
      state.data.vpasteSpacing = vSpacing;
      const vFilling = 100 - (((100 - vSpacing) * (100 - state.data.voidsPercent)) / 100);
      state.data.vpasteFilling = vFilling;
      let extra = 0.15;
      if (state.data.sccType === 'vma') extra = 0.06;
      else if (state.data.sccType === 'combined') extra = 0.10;
      const finalV = vFilling * (1 + extra);
      state.data.finalVpaste = finalV;
      document.getElementById('out_vpaste_spacing').innerText = vSpacing.toFixed(1);
      document.getElementById('out_vpaste_filling').innerText = vFilling.toFixed(1);
      document.getElementById('out_vpaste_final').innerText = finalV.toFixed(1);
    };
    sccTypeSelect.addEventListener('change', calculateVpaste);
    calculateVpaste();
  }
}

// ==========================================
// ۵. شروع برنامه
// ==========================================
updateUI();
