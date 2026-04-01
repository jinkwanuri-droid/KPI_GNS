// =========================================================
// 1. 차트 기본 설정 및 커스텀 플러그인
// =========================================================
Chart.defaults.animation.duration = 350;
Chart.defaults.animation.easing = 'easeOutQuad';
Chart.defaults.transitions.active.animation.duration = 200;

// 전체 평균 점선 플러그인
const avgLinePlugin = {
  id: 'avgLinePlugin',
  beforeDraw: (chart) => {
    if (chart.config.options.plugins.avgLinePlugin && chart.config.options.plugins.avgLinePlugin.active) {
      const avgData = chart.config.data.datasets.find(ds => ds.label === '전체 평균');
      if (!avgData || !avgData.data.length) return;
      const avgVal = avgData.data[0];
      const { ctx, chartArea: { left, right }, scales: { y } } = chart;
      const yPos = y.getPixelForValue(avgVal);
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(156, 163, 175, 0.8)';
      ctx.moveTo(left, yPos);
      ctx.lineTo(right, yPos);
      ctx.stroke();
      ctx.restore();
    }
  }
};

// 4분면 십자선 플러그인
const quadPlugin = {
  id: 'quadPlugin',
  beforeDraw: (chart) => {
    if (chart.config.options.plugins.quadPlugin && chart.config.options.plugins.quadPlugin.active) {
      const { ctx, chartArea: { top, bottom, left, right }, scales: { x, y } } = chart;
      const midX = x.getPixelForValue((x.max + x.min) / 2);
      const midY = y.getPixelForValue((y.max + y.min) / 2);
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.moveTo(midX, top);
      ctx.lineTo(midX, bottom);
      ctx.moveTo(left, midY);
      ctx.lineTo(right, midY);
      ctx.stroke();
      ctx.restore();
    }
  }
};

Chart.register(ChartDataLabels, avgLinePlugin, quadPlugin);

// =========================================================
// 2. 전역 변수 및 상수
// =========================================================
const I_CLOC = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const I_UP   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`;
const I_DOWN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
const I_BULB = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`;
const I_TROP = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;
const I_RULE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3l-5.6 5.6a2 2 0 0 1-2.8 0L2.7 10.7a2 2 0 0 1 0-2.8l5.6-5.6a2 2 0 0 1 2.8 0l10.2 10.2a2 2 0 0 1 0 2.8z"/><path d="M14.5 9.5L12 7"/><path d="M10.5 13.5L8 11"/><path d="M6.5 17.5L4 15"/></svg>`;

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQ_RuJcGEMFYmDswuKkg6D8bUCaWg1-twtmqPKikraPuq1Sp-RYTSjbbUDXRILpf7b/exec';

let MEMBERS = [];
let MC = {};
let INITIALS = {};
let SCHEDULE_DATA = [];

// 해안건축 테마 블루 반영
const DYNAMIC_COLORS = ['#00458c','#007dc5','#14b8a6','#f97316','#ec4899','#8b5cf6','#f59e0b','#10b981','#2563eb'];
const CAT_ORDER = ['기획설계','계획설계','기본설계','실시설계'];
const CAT_COLORS = ['#ec4899','#00458c','#f97316','#007dc5'];
const SUB_PAL = ['#00458c','#f97316','#007dc5','#ec4899','#14b8a6','#f59e0b','#8b5cf6','#ef4444','#84cc16','#06b6d4'];
const RANK_C = ['#00458c','#f97316','#007dc5','#ec4899','#14b8a6'];
const RADAR_LABELS = ['적극성','생산성','전문성','창의성','협업능력'];
const RADAR_COLORS_ARR = ['#00458c','#f97316','#007dc5','#ec4899','#14b8a6'];
const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

let EVAL_DATA = [];
let RAW = [];
let G = { heatYear:null, selectedMember:null, dpHeatYear:null, cvHlMember:null, dpActiveMonth:null };
let CH = {};
let H = { dashSub:null, dpSub:null };
let G_evalMember = '';

window.filterStartIndex = 0;
window.filterEndIndex = 11;
window.lastClickedIndex = 0;

const filterYears = [2024, 2025, 2026];
const filterQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
const totalNodes = filterYears.length * filterQuarters.length;
let percentPositions = [];

// =========================================================
// 3. 유틸리티 함수
// =========================================================
const formatNum = (val) => {
  return typeof val === 'number' ? val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : val;
};

const mToH = (m) => parseFloat((m / 60).toFixed(1));
const formatHour = (m) => formatNum(mToH(m));

const grpMin = (arr, key) => {
  return arr.reduce((m, r) => {
    m[r[key]] = (m[r[key]] || 0) + r.min;
    return m;
  }, {});
};

const getMos = (data) => {
  const set = new Set(data.map(r => r.date.slice(0, 7)));
  return Array.from(set).sort();
};

function destroyChart(id) {
  if (CH[id]) {
    CH[id].destroy();
    delete CH[id];
  }
}

function hexRgba(hex, a) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  } catch (err) {
    return hex;
  }
}

function getWeekStr(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
}

function getQFromDate(dateStr) {
  const m = parseInt(dateStr.slice(5, 7));
  return `${dateStr.slice(0, 4)}-Q${Math.ceil(m / 3)}`;
}

function isFocusedWork(cat, sub) {
  const cleanCat = (cat || '').replace(/\s+/g, '');
  const cleanSub = (sub || '').replace(/\s+/g, '');
  const rules = {
    '기획설계': ['컨셉디자인', '배치계획', '평면계획', '입면계획', '단면계획', '모형/3D모델링', '사업성검토', '사전조사/분석/검토'],
    '계획설계': ['컨셉디자인', '배치계획', '평면계획', '입면계획', '단면계획', '모형/3D모델링', '사전조사/분석/검토'],
    '기본설계': ['개요/기본도면', '공통도면', '재료마감/상세도', '구조계획도', '시방서/공사비산정', '컨셉디자인', '사전조사/분석/검토'],
    '실시설계': ['개요/실시도면', '공통도면', '마감도/상세도', '구조도면', '시방서/내역서', '사전조사/분석/검토']
  };

  if (rules[cleanCat]) {
    const mapped = rules[cleanCat].map(r => r.replace(/\s+/g, ''));
    return mapped.indexOf(cleanSub) > -1;
  }
  return false;
}

function filtered() {
  return RAW.filter((r) => {
    const parts = r.date.split('-');
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    const q = Math.ceil(m / 3) - 1;
    const yearOffset = y - 2024;
    if (yearOffset < 0 || yearOffset > 2) return false;
    const idx = yearOffset * 4 + q;
    return idx >= window.filterStartIndex && idx <= window.filterEndIndex;
  });
}

function filteredEvalQs() {
  const set = new Set(EVAL_DATA.map(d => d.q));
  const all = Array.from(set).sort();
  return all.filter((qStr) => {
    const parts = qStr.split('-');
    const y = parseInt(parts[0]);
    const q = parseInt(parts[1].replace('Q', '')) - 1;
    const yearOffset = y - 2024;
    if (yearOffset < 0 || yearOffset > 2) return false;
    const idx = yearOffset * 4 + q;
    return idx >= window.filterStartIndex && idx <= window.filterEndIndex;
  });
}

// =========================================================
// 4. 로딩 및 구글 시트 연동
// =========================================================
function setLoadingProgress(pct, msg) {
  const bar = document.getElementById('ovProgress');
  const msgEl = document.getElementById('ovMsg');
  if (bar) bar.style.width = `${pct}%`;
  if (msgEl) msgEl.textContent = msg;
}

function hideLoadingOverlay() {
  const el = document.getElementById('loadingOverlay');
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => { el.style.display = 'none'; }, 500);
  }
}

function showOverlayError(msg) {
  const ovEl = document.getElementById('loadingOverlay');
  if (ovEl) {
    const sp = ovEl.querySelector('.ov-spinner');
    const retryBtn = document.getElementById('ovRetryBtn');
    const msgEl = document.getElementById('ovMsg');
    if (sp) sp.style.display = 'none';
    if (msgEl) msgEl.innerHTML = `<span style="color:#ffcdd2;font-weight:700;">❌ ${msg}</span>`;
    if (retryBtn) retryBtn.style.display = 'block';
  }
}

async function loadDataFromSheets() {
  const ovEl = document.getElementById('loadingOverlay');
  if (ovEl) {
    ovEl.style.display = 'flex';
    ovEl.style.opacity = '1';
    ovEl.style.pointerEvents = 'auto';
    const sp = ovEl.querySelector('.ov-spinner'); 
    if (sp) sp.style.display = 'block';
    const progressWrap = document.getElementById('ovProgressWrap'); 
    if (progressWrap) progressWrap.style.display = 'block';
    const retryBtn = document.getElementById('ovRetryBtn'); 
    if (retryBtn) retryBtn.style.display = 'none';
    const enterBtn = document.getElementById('ovEnterBtn'); 
    if (enterBtn) enterBtn.style.display = 'none';
    const msgEl = document.getElementById('ovMsg');
    if (msgEl) {
      msgEl.textContent = '데이터 연결 중...';
      msgEl.style.color = 'rgba(255,255,255,0.7)';
    }
  }

  try {
    setLoadingProgress(15, '구글 시트 연결 중...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    const fetchUrl = `${APPS_SCRIPT_URL}?action=all&t=${Date.now()}`;
    let response;

    try {
      response = await fetch(fetchUrl, { method: 'GET', redirect: 'follow', signal: controller.signal });
      clearTimeout(timeoutId);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      throw new Error(`API 연결 실패: ${fetchErr.message}`);
    }

    if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);

    setLoadingProgress(45, '데이터 수신 중...');
    let json;
    try {
      const text = await response.text();
      json = JSON.parse(text);
    } catch (e) {
      throw new Error(`JSON 파싱 실패: ${e.message}`);
    }

    if (!json || json.status !== 'ok') {
      const errorMsg = json && json.message ? json.message : '데이터 오류';
      throw new Error(errorMsg);
    }

    setLoadingProgress(65, '데이터 변환 중...');
    SCHEDULE_DATA = json.schedule || [];

    EVAL_DATA = (json.eval || []).map((row) => {
      const year = String(row['연도'] || '').trim();
      const qtr = String(row['분기'] || '').trim();
      const qtrF = qtr.startsWith('Q') ? qtr : `Q${qtr}`;
      return {
        q: `${year}-${qtrF}`,
        year: year,
        qtr: qtrF,
        name: String(row['성명'] || '').trim(),
        vals: [
          parseFloat(row['적극성']) || 0,
          parseFloat(row['생산성']) || 0,
          parseFloat(row['전문성']) || 0,
          parseFloat(row['창의성']) || 0,
          parseFloat(row['협업능력']) || 0
        ]
      };
    }).filter(d => d.name && d.q);

    RAW = (json.work || []).filter((row) => row.name && row.date && row.min > 0).map((row) => {
      return {
        name: String(row.name || '').trim(),
        pos: String(row.pos || '').trim(),
        date: String(row.date || '').slice(0, 10),
        cat: String(row.cat || '미분류').trim(),
        sub: String(row.sub || '기타').trim(),
        min: parseInt(row.min) || 0,
        week: getWeekStr(String(row.date || '').slice(0, 10))
      };
    });

    const targetOrder = ['윤진관', '이혜인B', '정인태', '김효언'];
    const memberNames = [];
    RAW.forEach(r => memberNames.push(r.name));
    EVAL_DATA.forEach(e => memberNames.push(e.name));

    const memberSet = new Set(memberNames);
    MEMBERS = Array.from(memberSet).filter(n => n);

    MEMBERS.sort((a, b) => {
      const idxA = targetOrder.indexOf(a);
      const idxB = targetOrder.indexOf(b);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
    });

    MEMBERS.forEach((name, idx) => {
      MC[name] = DYNAMIC_COLORS[idx % DYNAMIC_COLORS.length];
      INITIALS[name] = name.length >= 3 ? name.substring(1, 3) : name;
    });

    if (!G_evalMember && MEMBERS.length > 0) G_evalMember = MEMBERS[0];

    const now = new Date();
    const lastUpdatedEl = document.getElementById('lastUpdated');
    if(lastUpdatedEl) {
      lastUpdatedEl.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} 업데이트`;
    }

    setLoadingProgress(85, '🎨 대시보드 렌더링 중...');

    buildTopMemberFilter();
    initSlider();
    initDashboard();

    setLoadingProgress(100, '데이터 로딩 완료!');
    if (ovEl) {
      const sp = ovEl.querySelector('.ov-spinner');
      if (sp) sp.style.display = 'none';
      const progressWrap = document.getElementById('ovProgressWrap');
      if (progressWrap) progressWrap.style.display = 'none';
      const enterBtn = document.getElementById('ovEnterBtn');
      if (enterBtn) enterBtn.style.display = 'block';
    }
  } catch (err) {
    console.error('데이터 로드 실패:', err);
    showOverlayError(err.message);
  }
}

// =========================================================
// 5. 상단 우측 멤버 드롭다운
// =========================================================
function buildTopMemberFilter() {
  const menu = document.getElementById('topMemberMenu');
  if (!menu) return;

  let html = `
    <div class="member-dropdown-item" onclick="selectGlobalMember(null)">
      <div class="member-avatar-xs" style="background:#888;">ALL</div>
      <span>전체 팀원</span>
    </div>
  `;

  MEMBERS.forEach(name => {
    html += `
      <div class="member-dropdown-item" onclick="selectGlobalMember('${name}')">
        <div class="member-avatar-xs" style="background:${MC[name]};">${INITIALS[name]}</div>
        <span>${name}</span>
      </div>
    `;
  });
  menu.innerHTML = html;
}

function toggleMemberDropdown() {
  document.getElementById('topMemberMenu').classList.toggle('show');
}

window.addEventListener('click', (e) => {
  const wrap = document.getElementById('topMemberDropdownWrap');
  if (wrap && !wrap.contains(e.target)) {
    const menu = document.getElementById('topMemberMenu');
    if (menu) menu.classList.remove('show');
  }
});

function selectGlobalMember(name) {
  G.selectedMember = name;
  if (name) G_evalMember = name;

  const currentAvatar = document.getElementById('topMemberAvatar');
  const currentName = document.getElementById('topMemberName');

  if (name) {
    currentAvatar.style.background = MC[name];
    currentAvatar.textContent = INITIALS[name];
    currentName.textContent = name;
  } else {
    currentAvatar.style.background = '#888';
    currentAvatar.textContent = 'ALL';
    currentName.textContent = '전체 팀원';
  }

  const menu = document.getElementById('topMemberMenu');
  if(menu) menu.classList.remove('show');

  const activeView = document.querySelector('.view-section.active').id;

  if (activeView === 'view-dashboard') {
    if (name) {
      showView('members', document.querySelectorAll('.top-nav-item')[1]);
    } else {
      renderAll();
    }
  } else if (activeView === 'view-members') {
    if (name) {
      document.getElementById('memberListView').style.display = 'none';
      document.getElementById('memberDetailView').style.display = 'block';
      renderDetailPanel(name);
    } else {
      document.getElementById('memberDetailView').style.display = 'none';
      document.getElementById('memberListView').style.display = 'block';
      renderMembers();
    }
  } else if (activeView === 'view-kpieval') {
    if (name) {
      renderEvalTab();
    } else {
      showView('members', document.querySelectorAll('.top-nav-item')[1]);
    }
  }
}

// =========================================================
// 6. 기간 슬라이더
// =========================================================
function initSlider() {
  const nodesContainer = document.getElementById('nodesContainer');
  const quarterRow = document.getElementById('quarterRow');
  const yearRow = document.getElementById('yearRow');

  if (nodesContainer) nodesContainer.innerHTML = '';
  if (quarterRow) quarterRow.innerHTML = '';
  if (yearRow) yearRow.innerHTML = '';

  const gapNormal = 1;
  const gapYear = 1.6;
  let currentPos = 0;
  let positions = [];

  for (let i = 0; i < totalNodes; i++) {
    positions.push(currentPos);
    if (i < totalNodes - 1) {
      if (i % 4 === 3) currentPos += gapYear;
      else currentPos += gapNormal;
    }
  }

  percentPositions = positions.map(p => (p / currentPos) * 100);

  filterYears.forEach((year, index) => {
    const yLabel = document.createElement('div');
    yLabel.className = 'year-label';
    yLabel.innerText = year;
    yLabel.onclick = () => selectYear(year);
    yLabel.style.left = `${(percentPositions[index * 4] + percentPositions[index * 4 + 3]) / 2}%`;
    if (yearRow) yearRow.appendChild(yLabel);
  });

  for (let i = 0; i < totalNodes; i++) {
    const pct = percentPositions[i];

    const node = document.createElement('div');
    node.className = 'node';
    node.style.left = `${pct}%`;
    node.onclick = (e) => handleNodeClick(i, e);
    if (nodesContainer) nodesContainer.appendChild(node);

    const qLabel = document.createElement('div');
    qLabel.className = 'quarter-label';
    qLabel.innerText = (i % 4) + 1;
    qLabel.style.left = `${pct}%`;
    qLabel.onclick = (e) => handleNodeClick(i, e);
    if (quarterRow) quarterRow.appendChild(qLabel);
  }
  updateUI();
}

function handleNodeClick(index, event) {
  if (event && event.shiftKey && window.lastClickedIndex !== undefined) {
    window.filterStartIndex = Math.min(window.lastClickedIndex, index);
    window.filterEndIndex = Math.max(window.lastClickedIndex, index);
  } else {
    window.filterStartIndex = index;
    window.filterEndIndex = index;
    window.lastClickedIndex = index;
  }
  updateUI();
}

function selectYear(year) {
  const yearIndex = filterYears.indexOf(year);
  if (yearIndex !== -1) {
    window.filterStartIndex = yearIndex * 4;
    window.filterEndIndex = window.filterStartIndex + 3;
    window.lastClickedIndex = window.filterStartIndex;
    updateUI();
  }
}

function resetFilter() {
  window.filterStartIndex = 0;
  window.filterEndIndex = totalNodes - 1;
  window.lastClickedIndex = 0;
  H.dashSub = null;
  H.dpSub = null;
  G.cvHlMember = null;
  G.dpActiveMonth = null;
  updateUI();
}

function updateUI() {
  const nodes = document.querySelectorAll('.node');
  const qLabels = document.querySelectorAll('.quarter-label');
  const yLabels = document.querySelectorAll('.year-label');
  const trackActive = document.getElementById('trackActive');

  if (nodes.length === 0) return;

  nodes.forEach((node, i) => {
    node.className = 'node';
    qLabels[i].className = 'quarter-label';
    if (i >= window.filterStartIndex && i <= window.filterEndIndex) {
      node.classList.add('active');
      qLabels[i].classList.add('active');
      if (i === window.filterStartIndex || i === window.filterEndIndex) {
        node.classList.add('endpoint');
      }
    }
  });

  yLabels.forEach((label, i) => {
    const yearStart = i * 4;
    const yearEnd = yearStart + 3;
    if (window.filterStartIndex <= yearEnd && window.filterEndIndex >= yearStart) {
      label.classList.add('active');
    } else {
      label.classList.remove('active');
    }
  });

  if (trackActive) {
    trackActive.style.left = `${percentPositions[window.filterStartIndex]}%`;
    trackActive.style.width = `${percentPositions[window.filterEndIndex] - percentPositions[window.filterStartIndex]}%`;
  }

  const count = window.filterEndIndex - window.filterStartIndex + 1;
  let labelText = '';
  if (count === 1) {
    labelText = `${filterYears[Math.floor(window.filterStartIndex / 4)]} ${filterQuarters[window.filterStartIndex % 4]}`;
  } else if (count === totalNodes) {
    labelText = '전체 기간';
  } else {
    labelText = `${filterYears[Math.floor(window.filterStartIndex / 4)]} ${filterQuarters[window.filterStartIndex % 4]} ➔ ${filterYears[Math.floor(window.filterEndIndex / 4)]} ${filterQuarters[window.filterEndIndex % 4]}`;
  }

  const st = document.getElementById('summaryText');
  if (st) st.innerText = labelText;

  const sc = document.getElementById('summaryCount');
  if (sc) sc.innerText = `${count}개 분기`;

  const badge = document.getElementById('filterBadge');
  if (badge) badge.textContent = labelText;

  if (typeof RAW !== 'undefined' && RAW.length > 0) {
    renderAll();
    renderEvalTab();
    const vm = document.getElementById('view-members');
    if (vm && vm.classList.contains('active')) {
      if (G.selectedMember) renderDetailPanel(G.selectedMember);
      else renderMembers();
    }
  }
}

function initDashboard() {
  renderAll();
  renderEvalTab();
}

function renderAll() {
  renderKPI();
  renderLine();
  renderStage();
  renderCompare();
  renderDonut();
  renderTop5();
  renderHeat();
  renderTimeline();
  renderCVAnalysis();
}

// =========================================================
// 7. 초과 근무일 수 차트 (리스트 연동)
// =========================================================
function drawOvertimeChart(wrapId, d) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;

  const dateMap = {};
  d.forEach(r => {
    dateMap[r.date] = (dateMap[r.date] || 0) + r.min;
  });

  let c9_10 = 0, c10_11 = 0, c11_12 = 0, c12_plus = 0;
  for (let date in dateMap) {
    const min = dateMap[date];
    if (min >= 540 && min < 600) c9_10++;
    else if (min >= 600 && min < 660) c10_11++;
    else if (min >= 660 && min < 720) c11_12++;
    else if (min >= 720) c12_plus++;
  }

  const canvasId = `${wrapId}_canvas`;
  const listId = `${wrapId}_list`;

  wrap.innerHTML = `
    <div class="card-section-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> 초과 근무일 수
      <span style="font-size:11px; font-weight:normal; color:#888; margin-left:6px;">(막대 클릭 시 상세 리스트)</span>
    </div>
    <div style="flex:1; min-height:160px; position:relative; margin-top:10px;">
      <canvas id="${canvasId}"></canvas>
    </div>
    <div id="${listId}" class="overtime-list-wrap"></div>
  `;

  if (CH[wrapId]) {
    CH[wrapId].destroy();
    delete CH[wrapId];
  }

  const canvasEl = document.getElementById(canvasId);
  if (!canvasEl) return;

  const ctx = canvasEl.getContext('2d');
  CH[wrapId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['9~10h', '10~11h', '11~12h', '12h 이상'],
      datasets: [{
        data: [c9_10, c10_11, c11_12, c12_plus],
        backgroundColor: ['#fde047', '#f97316', '#ef4444', '#b91c1c'],
        borderRadius: 4,
        barThickness: 24
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(61,61,92,.95)',
          callbacks: { label: c => `${c.raw}일` }
        },
        datalabels: {
          display: true,
          color: '#3d3d5c',
          anchor: 'end',
          align: 'right',
          font: { weight: 'bold', size: 11 },
          formatter: v => v > 0 ? `${v}일` : ''
        }
      },
      scales: {
        x: { grid: { color: '#f0f1f5' }, ticks: { font: { size: 10 }, stepSize: 1, precision: 0 }, grace: '10%' },
        y: { grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' }, color: '#555' } }
      },
      onClick: (e, els) => {
        if (!els.length) return;
        const idx = els[0].index;
        const ranges = [[540, 600], [600, 660], [660, 720], [720, 9999]];
        const [minM, maxM] = ranges[idx];
        const labels = ['9~10h', '10~11h', '11~12h', '12h 이상'];

        const targetDates = Object.keys(dateMap).filter(date => {
          return dateMap[date] >= minM && dateMap[date] < maxM;
        }).sort((a, b) => b.localeCompare(a));

        let html = `<div style="font-weight:bold; margin-bottom:8px; color:#00458c;">📌 [${labels[idx]}] 상세 내역 (${targetDates.length}일)</div>`;

        if (targetDates.length === 0) {
          html += `<div style="color:#aaa; text-align:center; padding:10px;">해당하는 날짜가 없습니다.</div>`;
        } else {
          html += targetDates.map(date => {
            const dayData = d.filter(r => r.date === date);
            const subMap = grpMin(dayData, 'sub');
            const sortedSubs = Object.entries(subMap).sort((a, b) => b[1] - a[1]);
            const mainTask = sortedSubs[0] ? sortedSubs[0][0] : '-';
            const extraCnt = sortedSubs.length > 1 ? ` 외 ${sortedSubs.length - 1}건` : '';
            return `
              <div class="overtime-list-item">
                <span style="color:#555; font-weight:700;">${date}</span>
                <span style="color:#888; flex:1; text-align:right; margin-right:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${mainTask}${extraCnt}</span>
                <span style="color:#ef4444; font-weight:800; width:40px; text-align:right;">${formatHour(dateMap[date])}h</span>
              </div>`;
          }).join('');
        }
        document.getElementById(listId).innerHTML = html;
      }
    }
  });
}

// =========================================================
// 8. 섀넌 HHI 다양성 및 CV 분석 차트
// =========================================================
function renderCVAnalysis() {
  const all = filtered();
  if (!all || all.length === 0) return;

  const dates = Array.from(new Set(all.map(r => r.date))).sort();

  const calcCV = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    if (mean === 0) return 0;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean;
  };

  const dailyTotalMins = {};
  all.forEach(r => {
    dailyTotalMins[r.date] = (dailyTotalMins[r.date] || 0) + r.min;
  });

  const cvData = dates.map((d, idx) => {
    let windowVals = [];
    for (let i = 0; i < 7; i++) {
      if (idx - i >= 0) windowVals.push(dailyTotalMins[dates[idx - i]] || 0);
    }
    const allZero = windowVals.every(v => v === 0);
    return { x: d, y: allZero ? null : calcCV(windowVals) };
  });

  let validCVs = [];
  cvData.forEach(pt => {
    if (pt.y !== null) validCVs.push(pt.y);
  });

  const avgOverallCV = validCVs.length > 0 ? (validCVs.reduce((a, b) => a + b, 0) / validCVs.length) : 0;

  const scheduleDataArray = [];
  const scheduleEvtsArray = [];
  dates.forEach(dStr => {
    const evts = SCHEDULE_DATA.filter(s => s.date === dStr);
    if (evts.length > 0) {
      scheduleDataArray.push({ x: dStr, y: 1.0 });
      scheduleEvtsArray.push(evts);
    }
  });

  const scatterDatasets = [
    { type: 'line', tension: 0.4, fill: false, label: '전체 변동성', data: cvData, borderColor: '#00458c', backgroundColor: hexRgba('#00458c', 0.7), borderWidth: 2, pointRadius: 0, order: 2 },
    { type: 'line', label: '전체 CV 평균선', data: [{ x: dates[0], y: avgOverallCV }, { x: dates[dates.length - 1], y: avgOverallCV }], borderColor: 'rgba(200, 200, 200, 0.8)', borderWidth: 1, borderDash: [5, 5], fill: false, pointRadius: 0, order: 3 },
    { type: 'line', label: '주요일정', data: scheduleDataArray, customEvts: scheduleEvtsArray, yAxisID: 'ySch', showLine: false, pointStyle: 'circle', pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 9, order: -1 }
  ];

  destroyChart('cvScatter');
  const scatCanvas = document.getElementById('cvTimeScatterChart');
  if (scatCanvas) {
    CH.cvScatter = new Chart(scatCanvas.getContext('2d'), {
      data: { datasets: scatterDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false },
          tooltip: {
            backgroundColor: 'rgba(61,61,92,.95)',
            callbacks: {
              label: (c) => {
                if (c.dataset.label === '주요일정') return c.dataset.customEvts[c.dataIndex].map(e => e.title);
                if (c.dataset.label === '전체 CV 평균선') return null;
                return `전체 변동성: ${c.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: { type: 'category', ticks: { maxTicksLimit: 15, font: { size: 10 } }, grid: { display: false } },
          y: { title: { display: true, text: 'CV값(변동성)', font: { size: 10 } }, min: 0, suggestedMax: Math.max(avgOverallCV * 3, 0.8), ticks: { font: { size: 10 } }, grid: { color: '#eef5fb' } },
          ySch: { display: false, min: 0, max: 1.02, position: 'right' }
        }
      }
    });
  }

  const weeks = Array.from(new Set(all.map(r => r.week))).sort();
  const weekBubbleData = weeks.map(w => {
    const dWk = all.filter(r => r.week === w);
    if (dWk.length === 0) return null;

    const totMin = dWk.reduce((s, r) => s + r.min, 0);
    const sMap = grpMin(dWk, 'sub');

    let hhiSum = 0;
    let shannon = 0;

    Object.values(sMap).forEach(v => {
      const p = v / totMin;
      hhiSum += p * p;
      if (p > 0) shannon -= p * Math.log(p);
    });

    const dailyT = {};
    dWk.forEach(r => {
      dailyT[r.date] = (dailyT[r.date] || 0) + r.min;
    });

    const vals = [0, 0, 0, 0, 0];
    Object.values(dailyT).forEach((m, idx) => {
      if (idx < 5) vals[idx] = m;
    });

    return {
      x: 1 - hhiSum,
      y: shannon,
      r: Math.max((calcCV(vals) || 0.1) * 15, 5),
      cvRaw: calcCV(vals) || 0.1,
      wk: w,
      time: formatHour(totMin)
    };
  }).filter(x => x !== null);

  destroyChart('cvBubble');
  const bubCanvas = document.getElementById('shannonHhiBubbleChart');
  if (bubCanvas) {
    CH.cvBubble = new Chart(bubCanvas.getContext('2d'), {
      type: 'bubble',
      data: {
        datasets: [{
          label: '전체 다양성',
          data: weekBubbleData,
          backgroundColor: hexRgba('#00458c', 0.6),
          borderColor: '#00458c',
          borderWidth: 1.5,
          hoverRadius: 2,
          order: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          datalabels: { display: false },
          quadPlugin: { active: true },
          tooltip: {
            backgroundColor: 'rgba(61,61,92,.95)',
            callbacks: {
              label: (c) => [
                `전체 (${c.raw.wk.split('-')[1]})`,
                `다양성(1-HHI): ${c.raw.x.toFixed(2)}`,
                `Shannon: ${c.raw.y.toFixed(2)}`,
                `CV: ${c.raw.cvRaw.toFixed(2)}`
              ]
            }
          }
        },
        scales: {
          x: { title: { display: true, text: '집중도(HHI) (독점→)', font: { size: 10 } }, min: 0, max: 1.0, ticks: { font: { size: 10 } }, grid: { color: '#eef5fb' } },
          y: { title: { display: true, text: '다양성(SHANNON INDEX) (복잡→)', font: { size: 10 } }, min: 0, suggestedMax: 4.5, ticks: { font: { size: 10 } }, grid: { color: '#eef5fb' } }
        }
      }
    });
  }
}

// =========================================================
// 9. 대시보드 메인 차트들 (Project 탭)
// =========================================================
function renderKPI() {
  const all = filtered();
  const totalMin = all.reduce((s, r) => s + r.min, 0);
  const mos = getMos(all);

  const grid = document.getElementById('topKpiGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const mTots = MEMBERS.map(n => ({ n, v: all.filter(r => r.name === n).reduce((s, r) => s + r.min, 0) }));

  let maxV = 1;
  mTots.forEach(m => { if (m.v > maxV) maxV = m.v; });

  let barsHTML = '';
  mTots.forEach(m => {
    barsHTML += `
      <div class="compare-row">
        <span class="compare-name" title="${m.n}">${m.n}</span>
        <div class="compare-bar-wrap">
          <div class="compare-bar-fill" style="width:${Math.round(m.v / maxV * 100)}%;background:${MC[m.n]};"></div>
        </div>
        <span class="compare-val">${formatHour(m.v)}h</span>
      </div>`;
  });

  const totalCard = document.createElement('div');
  totalCard.className = 'card kpi-card';
  totalCard.innerHTML = `
    <div class="card-section-title">${I_CLOC} 총 투입시간</div>
    <div class="card-value">${formatHour(totalMin)}h</div>
    <div class="card-sub">선택기간 중 ${mos.length}개월 | ${MEMBERS.length}명 참여</div>
    <div style="margin-top:12px;">${barsHTML}</div>`;
  grid.appendChild(totalCard);

  MEMBERS.forEach(name => {
    const d = all.filter(r => r.name === name);
    const tot = d.reduce((s, r) => s + r.min, 0);
    const pct = totalMin > 0 ? Math.round(tot / totalMin * 100) : 0;

    let found = null;
    for (let i = 0; i < RAW.length; i++) {
      if (RAW[i].name === name) { found = RAW[i]; break; }
    }
    const pos = found ? found.pos : '';
    const color = MC[name];

    const subList = Object.entries(grpMin(d, 'sub')).sort((a, b) => b[1] - a[1]);
    const maxSub = subList.length > 0 ? subList[0][0] : '-';
    const minSub = subList.length > 0 ? subList[subList.length - 1][0] : '-';

    const memberCard = document.createElement('div');
    memberCard.className = 'card kpi-card';
    memberCard.innerHTML = `
      <style>.kpi-card-${name}::before{background:linear-gradient(90deg,${color},${color}99)!important;}</style>
      <div class="member-kpi-header">
        <div class="member-kpi-label"><span style="font-size:14px;font-weight:800;color:#3d3d5c;">${name}</span> <span style="font-size:12px;color:#aaa;font-weight:normal;">${pos}</span></div>
        <div class="member-kpi-photo" style="background:${color};">${INITIALS[name]}</div>
      </div>
      <div class="card-value" style="color:${color};">${formatHour(tot)}h</div>
      <div class="card-sub">기여율 ${pct}%</div>
      <div class="progress-wrap">
        <div class="progress-label"><span>기여율</span><span>${pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="background:linear-gradient(90deg,${color},${color}99);width:${pct}%"></div></div>
      </div>
      <div style="margin-top:14px; padding-top:10px; border-top:1px solid #f0f1f5; font-size:11px; color:#666;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px; align-items:center;"><span>${I_UP} 최다 수행</span><strong style="color:#3d3d5c;">${maxSub}</strong></div>
        <div style="display:flex; justify-content:space-between; align-items:center;"><span>${I_DOWN} 최소 수행</span><strong style="color:#3d3d5c;">${minSub}</strong></div>
      </div>`;
    memberCard.classList.add(`kpi-card-${name}`);
    grid.appendChild(memberCard);
  });
}

function renderLine() {
  const all = filtered();
  const mos = getMos(all);
  const labels = mos.map(m => m.replace(/(\d{4})-(\d{2})/, '$1/$2'));
  destroyChart('line');
  const canvas = document.getElementById('lineChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dss = MEMBERS.map(name => {
    const moMap = {};
    all.filter(r => r.name === name).forEach(r => {
      const mo = r.date.slice(0, 7);
      moMap[mo] = (moMap[mo] || 0) + r.min;
    });
    const color = MC[name];
    const grad = ctx.createLinearGradient(0, 0, 0, 200);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '05');
    return {
      label: name,
      data: mos.map(m => mToH(moMap[m] || 0)),
      borderColor: color,
      backgroundColor: grad,
      borderWidth: 1.5,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: color,
      pointRadius: 3,
      pointHoverRadius: 5
    };
  });

  const leg = document.getElementById('lineLegend');
  if (leg) {
    leg.innerHTML = MEMBERS.map(n => `<div class="legend-item"><div class="legend-dot" style="background:${MC[n]}"></div>${n}</div>`).join('');
  }

  CH.line = new Chart(ctx, {
    type: 'line',
    data: { labels: labels, datasets: dss },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#3d3d5c', callbacks: { label: c => `${c.dataset.label}: ${formatNum(c.parsed.y)}h` } },
        datalabels: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: '#eef5fb' }, ticks: { font: { size: 10 }, callback: v => `${formatNum(v)}h` } }
      }
    }
  });
}

function renderStage() {
  const all = filtered();
  const catMap = grpMin(all, 'cat');
  const totalMin = all.reduce((s, r) => s + r.min, 0);
  const cats = CAT_ORDER.filter(c => catMap[c] > 0);
  const pcts = cats.map(c => totalMin > 0 ? Math.round((catMap[c] || 0) / totalMin * 100) : 0);
  const hours = cats.map(c => mToH(catMap[c] || 0));

  destroyChart('stage');
  const canvas = document.getElementById('stageChart');
  if (!canvas) return;

  CH.stage = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: [''],
      datasets: cats.map((cat, i) => {
        return {
          label: cat,
          data: [pcts[i]],
          backgroundColor: CAT_COLORS[CAT_ORDER.indexOf(cat)],
          borderRadius: 0
        };
      })
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10, padding: 6 } },
        tooltip: { backgroundColor: '#3d3d5c', callbacks: { label: c => `${c.dataset.label}: ${c.parsed.x}% / ${formatNum(hours[c.datasetIndex])}h` } },
        datalabels: {
          color: '#fff',
          font: { size: 10, weight: '700' },
          textAlign: 'center',
          formatter: (val, ctx) => {
            if (val < 8) return '';
            const i = ctx.datasetIndex;
            return `${cats[i]}\n${formatNum(hours[i])}h\n(${val}%)`;
          },
          anchor: 'center',
          align: 'center'
        }
      },
      scales: {
        x: { stacked: true, max: 100, grid: { display: false }, ticks: { font: { size: 10 }, callback: v => `${v}%` } },
        y: { stacked: true, grid: { display: false }, ticks: { display: false } }
      }
    }
  });
}

function renderCompare() {
  const all = filtered();
  const cats = CAT_ORDER.filter(c => all.some(r => r.cat === c));

  const dss = MEMBERS.map(name => {
    const cm = grpMin(all.filter(r => r.name === name), 'cat');
    const c = MC[name];
    return {
      label: name,
      data: cats.map(c2 => mToH(cm[c2] || 0)),
      backgroundColor: c + 'bb',
      borderRadius: 5
    };
  });

  destroyChart('compare');
  const canvas = document.getElementById('compareChart');
  if (!canvas) return;

  CH.compare = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels: cats, datasets: dss },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { font: { size: 10 }, boxWidth: 10 } },
        tooltip: { backgroundColor: '#3d3d5c', callbacks: { label: c => `${c.dataset.label}: ${formatNum(c.parsed.y)}h` } },
        datalabels: { display: true, color: '#888', font: { size: 9, weight: 'bold' }, formatter: v => v > 0 ? formatNum(v) : '', anchor: 'end', align: 'end' }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: '#eef5fb' }, ticks: { font: { size: 10 }, callback: v => `${formatNum(v)}h` } }
      }
    }
  });
}

function renderDonut(hl) {
  const all = filtered();
  const subMap = grpMin(all, 'sub');
  const totalMin = all.reduce((s, r) => s + r.min, 0);

  const top = Object.entries(subMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const labels = top.map(x => x[0]);
  const data = top.map(x => mToH(x[1]));
  const colors = labels.map((_, i) => SUB_PAL[i % SUB_PAL.length]);

  const dc = document.getElementById('donutCenter');
  if (dc) dc.textContent = `${formatHour(totalMin)}h`;

  const legendEl = document.getElementById('donutLegendLeft');
  if (legendEl) {
    legendEl.innerHTML = '';
    labels.forEach((l, i) => {
      const pct = totalMin > 0 ? Math.round((subMap[l] || 0) / totalMin * 100) : 0;
      const isHL = hl === l;
      const isDim = hl && hl !== l;
      const div = document.createElement('div');
      div.className = `donut-legend-item${isHL ? ' highlighted' : ''}${isDim ? ' dimmed' : ''}`;
      div.innerHTML = `<div class="donut-legend-dot" style="background:${colors[i]};"></div><span>${l} <span style="color:#aaa;">${formatNum(data[i])}h(${pct}%)</span></span>`;
      div.addEventListener('click', () => dashClickSub(l));
      legendEl.appendChild(div);
    });
  }

  destroyChart('donut');
  const canvas = document.getElementById('donutChart');
  if (!canvas) return;

  const bgColors = hl ? labels.map((l, i) => l === hl ? colors[i] : colors[i] + '44') : colors;

  CH.donut = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: bgColors,
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '52%',
      layout: { padding: 35 },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(61,61,92,.95)', callbacks: { label: c => `${c.label}: ${formatNum(c.parsed)}h` } },
        datalabels: {
          display: ctx => ctx.dataIndex < 5,
          color: ctx => hl && labels[ctx.dataIndex] !== hl ? 'rgba(120,120,120,0.3)' : '#3d3d5c',
          font: { size: 10, weight: '700' },
          formatter: (val, ctx) => {
            const pct = mToH(totalMin) > 0 ? Math.round(val / mToH(totalMin) * 100) : 0;
            return `${labels[ctx.dataIndex]}\n${formatNum(val)}h (${pct}%)`;
          },
          anchor: 'end',
          align: 'end',
          offset: 4,
          textAlign: 'center'
        }
      },
      onClick: (e, els) => {
        if (els.length) dashClickSub(labels[els[0].index]);
      }
    }
  });
}

function dashClickSub(sub) {
  H.dashSub = H.dashSub === sub ? null : sub;
  renderDonut(H.dashSub);
  renderTop5(H.dashSub);
  if (G.selectedMember) {
    H.dpSub = H.dashSub;
    renderDpStackedHighlight();
  }
}

function renderTop5(hl) {
  const all = filtered();
  const subMap = grpMin(all, 'sub');
  const totalMin = all.reduce((s, r) => s + r.min, 0);
  const top5 = Object.entries(subMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const list = document.getElementById('top5List');
  if (!list) return;
  list.innerHTML = '';

  top5.forEach((item, i) => {
    const sub = item[0];
    const min = item[1];
    const pct = totalMin > 0 ? Math.round(min / totalMin * 100) : 0;
    const rc = RANK_C[i % RANK_C.length];
    const isHL = hl === sub;
    const isDim = hl && hl !== sub;
    const li = document.createElement('li');
    li.className = `top5-rank-item${isHL ? ' highlighted' : ''}${isDim ? ' dimmed' : ''}`;
    li.innerHTML = `<div class="top5-rank-badge" style="background:${rc};">${i + 1}</div><span class="top5-rank-name" style="color:${isHL ? rc : '#3d3d5c'};">${sub}</span><span class="top5-rank-time">${formatHour(min)}h</span><span class="top5-rank-pct" style="color:${rc};">${pct}%</span>`;
    li.addEventListener('click', () => dashClickSub(sub));
    list.appendChild(li);
  });
}

function renderHeat() {
  const all = filtered();
  const yearsSet = new Set(all.map(r => r.date.slice(0, 4)));
  const years = Array.from(yearsSet).sort();
  if (!years.length) return;

  if (!G.heatYear || !years.includes(G.heatYear)) G.heatYear = years[years.length - 1];

  const wrap = document.getElementById('heatYearTabs');
  if (!wrap) return;
  wrap.innerHTML = '';

  years.forEach(y => {
    const b = document.createElement('button');
    b.className = `tab-btn-sm${y === G.heatYear ? ' active' : ''}`;
    b.textContent = `${y}년`;
    b.onclick = () => {
      G.heatYear = y;
      wrap.querySelectorAll('.tab-btn-sm').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      drawHeat(all, y, 'heatTable', '#00458c');
    };
    wrap.appendChild(b);
  });
  drawHeat(all, G.heatYear, 'heatTable', '#00458c');
}

function drawHeat(data, year, tableId, color) {
  const table = document.getElementById(tableId);
  const tip = document.getElementById('tooltip');
  if (!table) return;
  table.innerHTML = '';

  const dailyMap = {};
  data.filter(r => r.date.startsWith(`${year}-`)).forEach(r => {
    dailyMap[r.date] = (dailyMap[r.date] || 0) + r.min;
  });

  const mat = [];
  for (let i = 0; i < 5; i++) {
    mat.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }
  const hasMo = [false, false, false, false, false, false, false, false, false, false, false, false];
  const hasOver = [];
  for (let i = 0; i < 5; i++) {
    hasOver.push([false, false, false, false, false, false, false, false, false, false, false, false]);
  }

  let maxV = 0;

  for (let date in dailyMap) {
    const sum = dailyMap[date];
    const p = date.split('-');
    const mo = parseInt(p[1]) - 1;
    const day = parseInt(p[2]);
    const wk = Math.ceil((day + new Date(parseInt(year), mo, 1).getDay()) / 7) - 1;
    if (wk >= 0 && wk < 5) {
      mat[wk][mo] += sum;
      hasMo[mo] = true;
      if (sum > 720) hasOver[wk][mo] = true;
    }
  }

  mat.forEach(row => {
    row.forEach(v => {
      if (v > maxV) maxV = v;
    });
  });
  if (!maxV) maxV = 1;

  const thead = document.createElement('thead');
  const hRow = document.createElement('tr');
  const th0 = document.createElement('th');
  th0.style.width = '26px';
  hRow.appendChild(th0);

  MONTH_KO.forEach((lbl, mi) => {
    const th = document.createElement('th');
    th.textContent = lbl;
    th.style.cssText = `font-size:9px;font-weight:${hasMo[mi] ? '700' : '400'};color:${hasMo[mi] ? color : '#ddd'}; width:calc(100%/13);`;
    hRow.appendChild(th);
  });

  thead.appendChild(hRow);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  for (let w = 0; w < 5; w++) {
    const tr = document.createElement('tr');
    const td0 = document.createElement('td');
    td0.className = 'week-label';
    td0.textContent = `${w + 1}주`;
    tr.appendChild(td0);

    for (let mo = 0; mo < 12; mo++) {
      const td = document.createElement('td');
      td.style.padding = '1px';
      const cell = document.createElement('div');
      cell.className = 'hm-cell';
      const v = mat[w][mo];
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.fontSize = '8px';
      cell.style.fontWeight = 'bold';

      if (!hasMo[mo]) {
        cell.style.cssText += 'background:#f4f4fb;opacity:.3;cursor:default;';
      } else if (v <= 0) {
        cell.style.background = '#eef5fb';
        cell.style.border = '1px solid #dbeafe';
      } else {
        const ratio = v / maxV;
        cell.style.background = hexRgba(color, (0.15 + ratio * 0.85));
        cell.style.color = ratio > 0.4 ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.4)';
        cell.textContent = formatHour(v);
        if (hasOver[w][mo]) cell.style.boxShadow = 'inset 0 0 0 1px #ff8585';

        (function (m2, w2, v2) {
          cell.addEventListener('mouseenter', () => {
            if (tip) {
              tip.style.display = 'block';
              tip.innerHTML = `<strong>${year}년 ${MONTH_KO[m2]} ${w2 + 1}주차</strong><br>${formatHour(v2)}h`;
            }
          });
          cell.addEventListener('mousemove', e => {
            if (tip) {
              tip.style.left = `${e.clientX + 12}px`;
              tip.style.top = `${e.clientY - 28}px`;
            }
          });
          cell.addEventListener('mouseleave', () => {
            if (tip) tip.style.display = 'none';
          });
        })(mo, w, v);
      }
      td.appendChild(cell);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
}

function renderTimeline() {
  const all = filtered();
  const mos = getMos(all);
  const labels = mos.map(m => m.replace(/(\d{4})-(\d{2})/, '$1/$2'));
  destroyChart('timeline');
  const canvas = document.getElementById('timelineChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const dss = MEMBERS.map(name => {
    const moMap = {};
    all.filter(r => r.name === name).forEach(r => {
      const mo = r.date.slice(0, 7);
      moMap[mo] = (moMap[mo] || 0) + r.min;
    });
    const c = MC[name];
    const grad = ctx.createLinearGradient(0, 0, 0, 300);
    grad.addColorStop(0, c + '88');
    grad.addColorStop(1, c + '00');
    return {
      type: 'line',
      label: name,
      data: mos.map(m => mToH(moMap[m] || 0)),
      borderColor: c,
      backgroundColor: grad,
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: c,
      pointRadius: 3,
      pointHoverRadius: 5
    };
  });

  const tl = document.getElementById('timelineLegend');
  if (tl) {
    tl.innerHTML = MEMBERS.map(n => `<div class="legend-item"><div class="legend-dot" style="background:${MC[n]}"></div>${n}</div>`).join('');
  }

  CH.timeline = new Chart(ctx, {
    type: 'line',
    data: { labels: labels, datasets: dss },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: '#3d3d5c', callbacks: { label: c => `${c.dataset.label}: ${formatNum(c.parsed.y)}h` } },
        datalabels: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: '#eef5fb' }, ticks: { font: { size: 10 }, callback: v => `${formatNum(v)}h` } }
      }
    }
  });
}

function showView(view, navEl) {
  document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.top-nav-item').forEach(n => n.classList.remove('active'));

  const targetView = document.getElementById(`view-${view}`);
  if (targetView) targetView.classList.add('active');
  if (navEl) navEl.classList.add('active');

  if (view === 'kpieval') {
    if (G.selectedMember) renderEvalTab();
    else {
      selectGlobalMember(MEMBERS[0]);
      renderEvalTab();
    }
  }

  if (view === 'members') {
    if (G.selectedMember) {
      document.getElementById('memberListView').style.display = 'none';
      document.getElementById('memberDetailView').style.display = 'block';
      renderDetailPanel(G.selectedMember);
    } else {
      document.getElementById('memberDetailView').style.display = 'none';
      document.getElementById('memberListView').style.display = 'block';
      renderMembers();
    }
  }
}

// =========================================================
// 10. 팀원별 업무시간 (Working) 탭
// =========================================================
function getRepCardHTML(name, d, tot, pct, mos, pos, color) {
  const catMap = grpMin(d, 'cat');
  const maxCat = Math.max(...Object.values(catMap), 1);
  const avgMo = mos.length > 0 ? formatNum(mToH(tot) / mos.length) : 0;

  const moMap = {};
  d.forEach(r => {
    const mo = r.date.slice(0, 7);
    moMap[mo] = (moMap[mo] || 0) + r.min;
  });
  const pkM = Object.entries(moMap).sort((a, b) => b[1] - a[1])[0];

  const dateMap = grpMin(d, 'date');
  const pkD = Object.entries(dateMap).sort((a, b) => b[1] - a[1])[0];

  const subMap = grpMin(d, 'sub');
  const top3Subs = Object.entries(subMap).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const stageBarsHTML = CAT_ORDER.filter(c => catMap[c] > 0).map(c => {
    return `
      <div class="stage-row" style="margin-bottom:6px;">
        <span class="stage-name">${c.replace('설계', '')}</span>
        <div class="stage-track">
          <div class="stage-fill" style="width:${Math.round((catMap[c] || 0) / maxCat * 100)}%;background:${CAT_COLORS[CAT_ORDER.indexOf(c)]};"></div>
        </div>
        <span class="stage-val">${formatHour(catMap[c] || 0)}h</span>
      </div>`;
  }).join('');

  return `
    <div style="position:absolute;top:0;left:0;right:0;height:8px;background:${color};border-radius:18px 18px 0 0;"></div>
    <div class="eval-profile-top">
      <div class="eval-profile-avatar" style="background:${color};"><span style="font-size:22px;font-weight:800;">${INITIALS[name]}</span></div>
      <div style="flex:1;">
        <div class="eval-profile-name">${name}</div>
        <div class="eval-profile-pos">${pos}</div>
        <span class="eval-profile-badge" style="background:${color}18;color:${color};">${mos[0] || '-'} ~ ${mos[mos.length - 1] || '-'}</span>
      </div>
    </div>
    <div class="eval-score-big">
      <div class="eval-score-big-num" style="color:${color};font-size:42px;">${formatHour(tot)}<span style="font-size:20px;">h</span></div>
      <div class="eval-score-big-label">선택 기간 총 투입시간</div>
      <span class="eval-score-grade" style="background:#eef5fb;color:#00458c;font-size:12px;">전체 프로젝트 기여도 ${pct}%</span>
    </div>
    <div style="font-size:11px;font-weight:700;color:#9999bb;margin-bottom:10px;text-transform:uppercase;display:flex;align-items:center;gap:4px;">${I_BULB} 투입 요약</div>
    <div class="stats-grid" style="grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;">
      <div style="background:#f8f8ff; border-radius:10px; padding:16px 10px; text-align:center;">
        <div style="font-size:16px; font-weight:800; color:#3d3d5c; margin-bottom:4px;">${mos.length}개월</div>
        <div style="font-size:11px; color:#aaa; font-weight:600;">참여월</div>
      </div>
      <div style="background:#f8f8ff; border-radius:10px; padding:16px 10px; text-align:center;">
        <div style="font-size:16px; font-weight:800; color:#3d3d5c; margin-bottom:4px;">${avgMo}h</div>
        <div style="font-size:11px; color:#aaa; font-weight:600;">월 평균 투입</div>
      </div>
      <div style="background:#f8f8ff; border-radius:10px; padding:16px 10px; text-align:center;">
        <div style="font-size:10px; font-weight:normal; color:#3d3d5c; margin-bottom:4px; line-height:1.4;">${pkM ? pkM[0] : '-'}<br><span style="font-size:18px; font-weight:800;">(${pkM ? formatHour(pkM[1]) : 0}h)</span></div>
        <div style="font-size:11px; color:#aaa; font-weight:600;">최다 투입월</div>
      </div>
      <div style="background:#f8f8ff; border-radius:10px; padding:16px 10px; text-align:center;">
        <div style="font-size:10px; font-weight:normal; color:#3d3d5c; margin-bottom:4px; line-height:1.4;">${pkD ? pkD[0] : '-'}<br><span style="font-size:18px; font-weight:800;">(${pkD ? formatHour(pkD[1]) : 0}h)</span></div>
        <div style="font-size:11px; color:#aaa; font-weight:600;">최다 투입일</div>
      </div>
    </div>
    <div style="font-size:11px;font-weight:700;color:#9999bb;margin-bottom:8px;text-transform:uppercase;display:flex;align-items:center;gap:4px;">${I_TROP} 분류별 업무시간 TOP 3</div>
    <div class="new-top3-grid" style="margin-bottom:20px;">
      ${top3Subs.map((s, i) => `
        <div style="background:${['#fef9c3', '#f1f5f9', '#ffedd5'][i]}; border:1.5px solid ${['#fde047', '#e2e8f0', '#fed7aa'][i]}44; border-radius:8px; padding:12px 4px; text-align:center; display:flex; flex-direction:column; justify-content:center; height:90px;">
          <div style="font-size:18pt; margin-bottom:6px; line-height:1;">${['🥇', '🥈', '🥉'][i]}</div>
          <div style="font-size:11px; font-weight:700; color:#3d3d5c; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; margin-bottom:4px;">${s[0]}</div>
          <div style="font-size:13px; font-weight:900; color:${['#d97706', '#475569', '#c2410c'][i]};">${formatHour(s[1])}h</div>
        </div>`).join('')}
    </div>
    <div style="font-size:11px;font-weight:700;color:#9999bb;margin-bottom:8px;text-transform:uppercase;display:flex;align-items:center;gap:4px;">${I_RULE} 단계별 투입 비중</div>
    <div class="stage-bars-container" style="margin-bottom:20px;">${stageBarsHTML}</div>
  `;
}

function renderMembers() {
  const all = filtered();
  const totalMin = all.reduce((s, r) => s + r.min, 0);
  const grid = document.getElementById('memberOverviewGrid');
  if (!grid) return;
  grid.innerHTML = '';

  MEMBERS.forEach(name => {
    const color = MC[name];
    const d = all.filter(r => r.name === name);
    const tot = d.reduce((s, r) => s + r.min, 0);

    let found = null;
    for (let i = 0; i < RAW.length; i++) {
      if (RAW[i].name === name) { found = RAW[i]; break; }
    }
    const pos = found ? found.pos : '';

    const mos = getMos(d);
    const pct = totalMin > 0 ? Math.round(tot / totalMin * 100) : 0;
    const card = document.createElement('div');
    card.className = 'eval-profile-card';
    card.style.cursor = 'pointer';
    card.style.border = `1.5px solid ${color}44`;
    card.innerHTML = getRepCardHTML(name, d, tot, pct, mos, pos, color);

    card.onmouseover = () => { card.style.transform = 'translateY(-6px)'; card.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)'; };
    card.onmouseout = () => { card.style.transform = 'none'; card.style.boxShadow = '0 2px 10px rgba(0,0,0,.05)'; };
    card.onclick = () => { selectGlobalMember(name); };

    grid.appendChild(card);
  });
}

function openDetail(name) { selectGlobalMember(name); }
function closeDetail() { selectGlobalMember(null); }

function renderDetailPanel(name) {
  const color = MC[name];
  const all = filtered();
  const totalAllMin = all.reduce((s, r) => s + r.min, 0);
  const d = all.filter(r => r.name === name);
  const tot = d.reduce((s, r) => s + r.min, 0);

  let found = null;
  for (let i = 0; i < RAW.length; i++) {
    if (RAW[i].name === name) { found = RAW[i]; break; }
  }
  const pos = found ? found.pos : '';

  const mos = getMos(d);
  const subMap = grpMin(d, 'sub');
  const allYearsSet = new Set(mos.map(m => m.split('-')[0]));
  const allYears = Array.from(allYearsSet).sort();

  if (!G.dpHeatYear || !allYears.includes(G.dpHeatYear)) G.dpHeatYear = allYears[allYears.length - 1] || '2025';
  const pct = totalAllMin > 0 ? Math.round(tot / totalAllMin * 100) : 0;

  const profileEl = document.getElementById('newDpProfile');
  if (profileEl) {
    profileEl.style.border = `1.5px solid ${color}44`;
    profileEl.innerHTML = getRepCardHTML(name, d, tot, pct, mos, pos, color);
  }

  const allMemberData = RAW.filter(r => r.name === name);
  const filteredQsSet = new Set(d.map(r => getQFromDate(r.date)));
  const filteredQs = Array.from(filteredQsSet).sort();
  const currentQ = filteredQs[filteredQs.length - 1];

  let incHTML = '';
  let decHTML = '';
  if (currentQ) {
    const parts = currentQ.split('-Q');
    const cY = parts[0];
    const cQ = parts[1];
    let pY = parseInt(cY);
    let pQ = parseInt(cQ) - 1;
    if (pQ === 0) { pY -= 1; pQ = 4; }
    const prevQ = `${pY}-Q${pQ}`;

    const curMins = {};
    const prevMins = {};
    allMemberData.forEach(r => {
      const q = getQFromDate(r.date);
      if (q === currentQ) curMins[r.sub] = (curMins[r.sub] || 0) + r.min;
      if (q === prevQ) prevMins[r.sub] = (prevMins[r.sub] || 0) + r.min;
    });

    const diffs = [];
    const keys1 = Object.keys(curMins);
    const keys2 = Object.keys(prevMins);
    const allSubsArr = keys1.concat(keys2);
    const allSubs = new Set(allSubsArr);

    allSubs.forEach(s => {
      const curH = mToH(curMins[s] || 0);
      const prevH = mToH(prevMins[s] || 0);
      diffs.push({ sub: s, cur: curH, prev: prevH, diff: curH - prevH });
    });

    const inc = diffs.filter(x => x.diff > 0).sort((a, b) => b.diff - a.diff).slice(0, 3);
    const dec = diffs.filter(x => x.diff < 0).sort((a, b) => a.diff - b.diff).slice(0, 3);

    const buildMiniList = (arr, isInc) => {
      if (arr.length === 0) return `<div style="font-size:11px;color:#aaa;text-align:center;padding:10px;">데이터 없음</div>`;
      return arr.map(x => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f0f1f5;">
          <span style="font-size:11px; font-weight:700; color:#3d3d5c; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:120px;">${x.sub}</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:10px; color:#aaa;">${x.prev.toFixed(1)}h → ${x.cur.toFixed(1)}h</span>
            <span style="font-size:11px; font-weight:800; color:${isInc ? '#ef4444' : '#3b82f6'};">${isInc ? '▲' : '▼'} ${Math.abs(x.diff).toFixed(1)}h</span>
          </div>
        </div>`).join('');
    };

    incHTML = buildMiniList(inc, true);
    decHTML = buildMiniList(dec, false);
  }

  const dpIncDecWrap = document.getElementById('dpIncDecWrap');
  if (dpIncDecWrap) {
    dpIncDecWrap.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:0;">
        <div style="background:#fffaf8; border:1px solid #fecaca; border-radius:10px; padding:12px;">
          <div style="font-size:11px;font-weight:800;color:#ef4444;margin-bottom:8px;">📈 전분기 대비 증가 TOP3</div>
          ${incHTML}
        </div>
        <div style="background:#f0f9ff; border:1px solid #bfdbfe; border-radius:10px; padding:12px;">
          <div style="font-size:11px;font-weight:800;color:#3b82f6;margin-bottom:8px;">📉 전분기 대비 감소 TOP3</div>
          ${decHTML}
        </div>
      </div>`;
  }

  const catMap = grpMin(d, 'cat');
  const cats2 = CAT_ORDER.filter(c => catMap[c] > 0);
  const catData = cats2.map(c => mToH(catMap[c] || 0));
  const catColors = cats2.map(c => CAT_COLORS[CAT_ORDER.indexOf(c)]);
  const catTotal = catData.reduce((a, b) => a + b, 0);

  const dc = document.getElementById('dpDonutCenter');
  if (dc) dc.innerHTML = `<div style="font-size:16px;font-weight:800;color:#3d3d5c;">${formatHour(tot)}h</div><div style="font-size:10px;color:#aaa;">총 투입</div>`;

  destroyChart('dpDonut');
  const dpCanvas = document.getElementById('dpDonut');
  if (dpCanvas) {
    CH.dpDonut = new Chart(dpCanvas.getContext('2d'), {
      type: 'doughnut',
      data: { labels: cats2, datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '65%', layout: { padding: 30 },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(61,61,92,.95)', callbacks: { label: c => `${c.label}: ${formatNum(c.parsed)}h` } },
          datalabels: {
            display: true, color: '#3d3d5c', font: { size: 10, weight: '700' },
            formatter: (val, ctx) => {
              const p = Math.round(val / catTotal * 100);
              return p > 5 ? `${cats2[ctx.dataIndex]}\n${p}%` : '';
            },
            anchor: 'end', align: 'end', offset: 2, textAlign: 'center'
          }
        }
      }
    });
  }

  renderDpCvChart(name, d);
  renderDpStacked(d, mos, subMap, color);
  renderPatternAnalysis(d, mos);

  let focusMin = 0; let distMin = 0;
  d.forEach(r => {
    if (isFocusedWork(r.cat, r.sub)) focusMin += r.min;
    else distMin += r.min;
  });
  const totalFocusDist = focusMin + distMin;
  const focusPct = totalFocusDist > 0 ? (focusMin / totalFocusDist * 100) : 0;
  const distPct = totalFocusDist > 0 ? (distMin / totalFocusDist * 100) : 0;

  destroyChart('dpFocusBar');
  const fBar = document.getElementById('dpFocusBar');
  if (fBar) {
    CH.dpFocusBar = new Chart(fBar.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['업무 비율'],
        datasets: [
          { label: '집중업무', data: [focusPct], backgroundColor: '#00458c', barThickness: 30 },
          { label: '분산업무', data: [distPct], backgroundColor: '#d1d5db', barThickness: 30 }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { stacked: true, max: 100, display: false },
          y: { stacked: true, display: false }
        },
        plugins: {
          legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 10 } },
          tooltip: {
            backgroundColor: 'rgba(61,61,92,.95)',
            callbacks: { label: c => `${c.dataset.label}: ${c.raw.toFixed(1)}% (${c.datasetIndex === 0 ? formatHour(focusMin) : formatHour(distMin)}h)` }
          },
          datalabels: {
            color: '#fff', font: { weight: 'bold', size: 12 },
            formatter: val => val > 5 ? `${val.toFixed(1)}%` : ''
          }
        }
      }
    });
  }

  const hytw = document.getElementById('dpHeatTabs');
  if (hytw) {
    hytw.innerHTML = '';
    allYears.forEach(y => {
      const b = document.createElement('button');
      b.className = `tab-btn-sm${y === G.dpHeatYear ? ' active' : ''}`;
      b.textContent = `${y}년`;
      b.onclick = () => {
        G.dpHeatYear = y;
        hytw.querySelectorAll('.tab-btn-sm').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        drawHeat(d, y, 'dpHeatTable', color);
      };
      hytw.appendChild(b);
    });
  }
  drawHeat(d, G.dpHeatYear, 'dpHeatTable', color);
  drawOvertimeChart('dpOvertimeCardWrap', d);
}

function renderDpCvChart(name, d) {
  if (!d || d.length === 0) return;
  const datesSet = new Set(d.map(r => r.date));
  const dates = Array.from(datesSet).sort();

  const calcCV = (values) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    if (mean === 0) return 0;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean;
  };

  const dailyMins = {};
  d.forEach(r => { dailyMins[r.date] = (dailyMins[r.date] || 0) + r.min; });

  const data = dates.map((dt, idx) => {
    let windowVals = [];
    for (let i = 0; i < 7; i++) {
      if (idx - i >= 0) windowVals.push(dailyMins[dates[idx - i]] || 0);
    }
    return { x: dt, y: calcCV(windowVals) };
  });

  destroyChart('dpCv');
  const cvCanvas = document.getElementById('dpCvChart');
  if (cvCanvas) {
    CH.dpCv = new Chart(cvCanvas.getContext('2d'), {
      type: 'line',
      data: {
        datasets: [{
          label: 'CV (변동성)',
          data: data,
          borderColor: MC[name],
          backgroundColor: hexRgba(MC[name], 0.2),
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(61,61,92,.95)', callbacks: { label: c => `CV: ${c.parsed.y.toFixed(2)}` } },
          datalabels: { display: false }
        },
        scales: {
          x: { grid: { display: false }, ticks: { maxTicksLimit: 10, font: { size: 9 } } },
          y: { grid: { color: '#eef5fb' }, ticks: { font: { size: 9 } }, min: 0 }
        }
      }
    });
  }
}

function renderDpStacked(d, mos, subMap, color) {
  const subList = Object.entries(subMap).sort((a, b) => b[1] - a[1]).map(x => x[0]);
  const moSubMap = {};
  d.forEach(r => {
    const mo = r.date.slice(0, 7);
    if (!moSubMap[mo]) moSubMap[mo] = {};
    moSubMap[mo][r.sub] = (moSubMap[mo][r.sub] || 0) + r.min;
  });

  const legendWrap = document.getElementById('dpStackedLegend');
  if (legendWrap) {
    legendWrap.innerHTML = subList.map((sub, i) => {
      const isHL = H.dpSub === sub;
      const isDim = H.dpSub && H.dpSub !== sub;
      const c = SUB_PAL[i % SUB_PAL.length];
      return `
        <div style="display:flex; align-items:center; gap:4px; font-size:11px; cursor:pointer; transition:all 0.2s; ${isHL ? `font-weight:800; color:${c};` : isDim ? 'opacity:0.4;' : 'color:#555;'}" onclick="dpClickSub('${sub}')">
          <div style="width:10px; height:10px; border-radius:3px; background:${c};"></div>${sub}
        </div>`;
    }).join('');
  }

  const scheduleDataArray = mos.map(m => SCHEDULE_DATA.filter(s => s.date.startsWith(m)).length > 0 ? 1.05 : null);
  const scheduleEvtsArray = mos.map(m => SCHEDULE_DATA.filter(s => s.date.startsWith(m)));

  const datasets = subList.map((sub, i) => {
    const bgColors = mos.map(m => {
      const baseC = H.dpSub === null ? SUB_PAL[i % SUB_PAL.length] : (sub === H.dpSub ? SUB_PAL[i % SUB_PAL.length] : `${SUB_PAL[i % SUB_PAL.length]}33`);
      return (G.dpActiveMonth && m !== G.dpActiveMonth) ? hexRgba(baseC, 0.15) : baseC;
    });
    return { type: 'bar', label: sub, data: mos.map(m => mToH((moSubMap[m] && moSubMap[m][sub]) || 0)), backgroundColor: bgColors, borderRadius: 2, stack: 's' };
  });

  datasets.push({ type: 'line', label: '주요일정', data: scheduleDataArray, customEvts: scheduleEvtsArray, yAxisID: 'ySch', showLine: false, pointStyle: 'circle', pointBackgroundColor: '#ef4444', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 9 });

  destroyChart('dpStackedBar');
  const dsBar = document.getElementById('dpStackedBar');
  if (!dsBar) return;

  CH.dpStackedBar = new Chart(dsBar.getContext('2d'), {
    data: {
      labels: mos.map(m => m.replace(/(\d{4})-(\d{2})/, '$1/$2')),
      datasets: datasets
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(61,61,92,.95)', callbacks: { label: c => c.dataset.label === '주요일정' ? c.dataset.customEvts[c.dataIndex].map(e => `${e.date}: ${e.title}`) : `${c.dataset.label}: ${formatNum(c.parsed.y)}h` } },
        datalabels: {
          display: ctx => ctx.dataset.label !== '주요일정',
          formatter: (val, ctx) => {
            const m = mos[ctx.dataIndex];
            if (G.dpActiveMonth && m !== G.dpActiveMonth) return '';
            if (H.dpSub === null) {
              const dsTotals = ctx.chart.data.datasets.filter(ds => ds.label !== '주요일정').map(ds => ds.data[ctx.dataIndex]);
              let lastValIndex = -1;
              for (let i = dsTotals.length - 1; i >= 0; i--) {
                if (dsTotals[i] > 0) { lastValIndex = i; break; }
              }
              return ctx.datasetIndex === lastValIndex && dsTotals.reduce((a, b) => a + b, 0) > 0 ? formatNum(dsTotals.reduce((a, b) => a + b, 0)) : '';
            } else {
              return (ctx.dataset.label === H.dpSub && val > 0) ? formatNum(val) : '';
            }
          },
          anchor: ctx => H.dpSub === null ? 'end' : 'center',
          align: ctx => H.dpSub === null ? 'top' : 'center',
          color: ctx => H.dpSub === null ? '#3d3d5c' : '#fff',
          font: ctx => ({ weight: H.dpSub === null ? 'normal' : '800', size: 11 })
        }
      },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { stacked: true, grace: '45%', grid: { color: '#f0f1f5' }, ticks: { font: { size: 10 }, callback: v => `${formatNum(v)}h` } },
        ySch: { display: false, min: 0, max: 1.15, position: 'right' }
      },
      onClick: (e, els) => {
        if (els.length && datasets[els[0].datasetIndex].label !== '주요일정') dpClickSub(datasets[els[0].datasetIndex].label);
      }
    }
  });
}

function dpClickSub(sub) {
  H.dpSub = H.dpSub === sub ? null : sub;
  H.dashSub = H.dpSub;
  renderDonut(H.dashSub);
  renderDpStackedHighlight();
}

function renderDpStackedHighlight() {
  const name = G.selectedMember;
  if (!name) return;
  const d = filtered().filter(r => r.name === name);
  const mos = getMos(d);
  renderDpStacked(d, mos, grpMin(d, 'sub'), MC[name]);
}

function renderPatternAnalysis(d, mos) {
  let switchByMonth = {};
  let prevSub = null;
  d.forEach(r => {
    const mo = r.date.slice(0, 7);
    if (!switchByMonth[mo]) switchByMonth[mo] = 0;
    if (prevSub !== null && prevSub !== r.sub) switchByMonth[mo]++;
    prevSub = r.sub;
  });
  const switchData = mos.map(m => switchByMonth[m] || 0);

  let allSwitches = [];
  MEMBERS.forEach(mName => {
    const md = filtered().filter(r => r.name === mName);
    let sByMo = {};
    let pr = null;
    md.forEach(r => {
      const mo = r.date.slice(0, 7);
      if (!sByMo[mo]) sByMo[mo] = 0;
      if (pr !== null && pr !== r.sub) sByMo[mo]++;
      pr = r.sub;
    });
    Object.values(sByMo).forEach(v => allSwitches.push(v));
  });

  const avgData = mos.map(() => allSwitches.length ? allSwitches.reduce((a, b) => a + b, 0) / allSwitches.length : 0);
  const bgColors = mos.map(m => (G.dpActiveMonth && m !== G.dpActiveMonth) ? hexRgba('#00458c', 0.15) : '#00458c');

  destroyChart('dpSwitchBar');
  const swCanvas = document.getElementById('dpSwitchBar');
  if (swCanvas) {
    CH.dpSwitchBar = new Chart(swCanvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: mos.map(m => m.replace(/(\d{4})-(\d{2})/, '$1/$2')),
        datasets: [
          { label: '업무 전환 횟수', data: switchData, backgroundColor: bgColors, borderRadius: 4, order: 2 },
          { type: 'line', label: '전체 평균', data: avgData, borderColor: 'transparent', pointBackgroundColor: 'transparent', pointBorderColor: 'transparent', pointHoverBackgroundColor: 'rgba(156, 163, 175, 0.4)', pointHoverBorderColor: '#9ca3af', pointRadius: 15, pointHoverRadius: 15, fill: false, order: 1 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          avgLinePlugin: { active: true },
          datalabels: {
            display: ctx => ctx.dataset.label === '업무 전환 횟수' && (!G.dpActiveMonth || mos[ctx.dataIndex] === G.dpActiveMonth),
            formatter: v => `${v}회`,
            color: '#555', anchor: 'end', align: 'top', font: { size: 10, weight: 'normal' }
          },
          tooltip: {
            backgroundColor: 'rgba(61,61,92,.95)',
            filter: item => item.dataset.label === '전체 평균',
            callbacks: { label: c => `팀원전체 평균 : ${c.raw.toFixed(1)}회` }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 9 } } },
          y: { grace: '20%', grid: { color: '#e2e8f0' }, ticks: { font: { size: 9 } }, beginAtZero: true }
        }
      }
    });
  }

  const weeksSet = new Set(d.map(r => r.week));
  const weeks = Array.from(weeksSet).sort();

  const bubbleData = weeks.map(w => {
    const rWk = d.filter(r => r.week === w);
    if (rWk.length === 0) return null;

    const totMin = rWk.reduce((s, x) => s + x.min, 0);
    const sMap = grpMin(rWk, 'sub');
    let hhiSum = 0; let shannon = 0;

    Object.values(sMap).forEach(v => {
      const p = v / totMin;
      hhiSum += p * p;
      if (p > 0) shannon -= p * Math.log(p);
    });

    const moStr = rWk[0].date.slice(0, 7);
    const mColor = DYNAMIC_COLORS[(parseInt(moStr.split('-')[1], 10) - 1) % DYNAMIC_COLORS.length];

    return { x: 1 - hhiSum, y: shannon, r: Math.max(Math.pow(mToH(totMin), 1.2) * 0.1, 3), wk: w, moStr: moStr, time: formatHour(totMin), baseColor: mColor };
  }).filter(x => x !== null);

  destroyChart('dpDiversityBubble');
  const dbCanvas = document.getElementById('dpDiversityBubble');

  if (dbCanvas) {
    CH.dpDiversityBubble = new Chart(dbCanvas.getContext('2d'), {
      type: 'bubble',
      data: {
        datasets: [{
          label: '주별 다양성',
          data: bubbleData,
          backgroundColor: ctx => ctx.raw ? ((G.dpActiveMonth && ctx.raw.moStr !== G.dpActiveMonth) ? hexRgba(ctx.raw.baseColor, 0.1) : hexRgba(ctx.raw.baseColor, 0.7)) : undefined,
          borderColor: ctx => ctx.raw ? ((G.dpActiveMonth && ctx.raw.moStr !== G.dpActiveMonth) ? hexRgba(ctx.raw.baseColor, 0.2) : ctx.raw.baseColor) : undefined
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          quadPlugin: { active: true },
          tooltip: {
            backgroundColor: 'rgba(61,61,92,.95)',
            callbacks: {
              label: c => [
                `${c.raw.moStr} (${c.raw.wk.split('-')[1]})`,
                `다양성 지수(1-HHI): ${c.raw.x.toFixed(2)}`,
                `Shannon: ${c.raw.y.toFixed(2)}`,
                `총 투입: ${c.raw.time}h`
              ]
            }
          },
          datalabels: { display: false }
        },
        scales: {
          x: { title: { display: true, text: '집중도(HHI) (독점→)', font: { size: 10 } }, max: 1.0, ticks: { font: { size: 10 } } },
          y: { title: { display: true, text: '다양성(SHANNON INDEX) (복잡→)', font: { size: 10 } }, ticks: { font: { size: 10 } } }
        },
        onClick: (e, els) => {
          if (els.length) {
            const clickedMo = bubbleData[els[0].index].moStr;
            G.dpActiveMonth = (G.dpActiveMonth === clickedMo) ? null : clickedMo;
          } else {
            G.dpActiveMonth = null;
          }
          renderDpStackedHighlight();
          CH.dpDiversityBubble.update();
          renderPatternAnalysis(d, mos);
        }
      }
    });
  }

  const workDatesSet = new Set(d.map(r => r.date));
  const workDates = Array.from(workDatesSet).sort();
  const continuityResults = [];

  Object.keys(grpMin(d, 'sub')).forEach(s => {
    let currentStreak = 0; let currentStart = ''; let maxS = 0; let tmpStart = ''; let tmpEnd = '';
    workDates.forEach(wd => {
      if (d.some(r => r.date === wd && r.sub === s)) {
        if (currentStreak === 0) currentStart = wd;
        currentStreak++;
        if (currentStreak > maxS) { maxS = currentStreak; tmpStart = currentStart; tmpEnd = wd; }
      } else {
        currentStreak = 0;
      }
    });
    if (maxS > 0) continuityResults.push({ sub: s, streak: maxS, start: tmpStart, end: tmpEnd });
  });

  const wrap = document.getElementById('dpContinuityWrap');
  if (wrap) {
    wrap.innerHTML = `<div style="display:flex; flex-direction:column; gap:8px; height:100%; justify-content:center;">${
      continuityResults.sort((a, b) => b.streak - a.streak).slice(0, 5).map((c, i) => `
        <div style="background:#fff; border:1px solid #eef0f8; border-radius:10px; padding:10px 14px; display:flex; align-items:center; gap:10px;">
          <div style="font-size:18px;">${['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</div>
          <div style="flex:1;">
            <div style="font-size:12px; font-weight:800; color:#3d3d5c;">${c.sub}</div>
            <div style="font-size:10px; color:#888; margin-top:2px;">${c.start} ~ ${c.end}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px; font-weight:900; color:${['#f59e0b', '#94a3b8', '#cd7c3b', '#64748b', '#64748b'][i]};">${c.streak}<span style="font-size:10px; color:#aaa; font-weight:normal; margin-left:2px;">일 연속</span></div>
          </div>
        </div>
      `).join('')
    }</div>`;
  }
}

// =========================================================
// 11. KPI 역량평가 (Personal KPI) 탭
// =========================================================
function renderEvalTab() {
  renderEvalProfile();
  renderEvalDonut(null);
  renderEvalTrendChart();
  renderEvalRadarDual();
  renderEvalTrendTable();
  drawOvertimeChart('evalOvertimeCardWrap', filtered().filter(r => r.name === G_evalMember));
  renderCorrelationChartInit();
}

function renderEvalDonut(hl) {
  const name = G_evalMember;
  const all = filtered().filter(r => r.name === name);
  const subMap = grpMin(all, 'sub');
  const totalMin = all.reduce((s, r) => s + r.min, 0);

  const top = Object.entries(subMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const labels = top.map(x => x[0]);
  const data = top.map(x => mToH(x[1]));
  const colors = labels.map((_, i) => SUB_PAL[i % SUB_PAL.length]);

  const centerEl = document.getElementById('evalDonutCenter');
  if (centerEl) centerEl.textContent = `${formatHour(totalMin)}h`;

  const top3wrap = document.getElementById('evalTop2Row');
  if (top3wrap) {
    top3wrap.innerHTML = top.slice(0, 3).map((item, i) => {
      const sub = item[0];
      const min = item[1];
      return `
        <div class="eval-top3-box-card" style="background:${['#fef9ee', '#f8fafc', '#fdf6f0'][i]};border:1.5px solid ${['#fde68a', '#e2e8f0', '#fed7aa'][i]}44;">
          <div style="font-size:18px;margin-bottom:4px;">${['🥇', '🥈', '🥉'][i]}</div>
          <div style="font-size:12px;font-weight:700;color:#3d3d5c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;">${sub}</div>
          <div style="font-size:14px;font-weight:900;color:${i === 0 ? '#f59e0b' : i === 1 ? '#64748b' : '#cd7c3b'};margin-top:2px;">${formatHour(min)}h</div>
          <div style="font-size:10px;color:#aaa;">${totalMin > 0 ? Math.round(min / totalMin * 100) : 0}% 비중</div>
        </div>`;
    }).join('');
  }

  destroyChart('evalDonut');
  const edc = document.getElementById('evalDonutChart');
  if (!edc) return;

  CH.evalDonut = new Chart(edc.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: hl ? labels.map((l, i) => l === hl ? colors[i] : `${colors[i]}44`) : colors,
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '48%', layout: { padding: 40 },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(61,61,92,.95)', callbacks: { label: c => `${c.label}: ${formatNum(c.parsed)}h` } },
        datalabels: {
          display: ctx => ctx.dataIndex < 5,
          color: ctx => hl && labels[ctx.dataIndex] !== hl ? 'rgba(120,120,120,0.3)' : '#3d3d5c',
          font: { size: 10, weight: '700' },
          formatter: (val, ctx) => `${labels[ctx.dataIndex]}\n${formatNum(val)}h (${mToH(totalMin) > 0 ? Math.round(val / mToH(totalMin) * 100) : 0}%)`,
          anchor: 'end', align: 'end', offset: 4, textAlign: 'center'
        }
      },
      onClick: (e, els) => {
        if (els.length) {
          const l = labels[els[0].index];
          renderEvalDonut(hl === l ? null : l);
        }
      }
    }
  });
}

function renderEvalTrendChart(hlLabel = null) {
  destroyChart('evalTrendChart');
  const name = G_evalMember;
  const qs = filteredEvalQs();
  if (!qs.length) return;

  const datasets = RADAR_LABELS.map((lbl, i) => {
    const isDimmed = hlLabel !== null && hlLabel !== lbl;
    return {
      label: lbl,
      data: qs.map(q => {
        const ev = EVAL_DATA.find(e => e.q === q && e.name === name);
        return ev ? ev.vals[i] : 0;
      }),
      backgroundColor: isDimmed ? hexRgba(RADAR_COLORS_ARR[i], 0.1) : hexRgba(RADAR_COLORS_ARR[i], 0.85),
      borderColor: isDimmed ? hexRgba(RADAR_COLORS_ARR[i], 0.2) : RADAR_COLORS_ARR[i],
      borderWidth: 1.5, borderRadius: 4, order: 2
    };
  });

  const scheduleDataArray = qs.map(q => SCHEDULE_DATA.filter(s => getQFromDate(s.date) === q).length > 0 ? 5.2 : null);
  const scheduleEvtsArray = qs.map(q => SCHEDULE_DATA.filter(s => getQFromDate(s.date) === q));

  datasets.push({
    type: 'scatter', label: '주요일정', data: scheduleDataArray, customEvts: scheduleEvtsArray,
    backgroundColor: '#ef4444', borderColor: '#fff', borderWidth: 2, pointRadius: 6, pointHoverRadius: 9, order: -1
  });

  const legendEl = document.getElementById('evalTrendLegend');
  if (legendEl) {
    legendEl.innerHTML = RADAR_LABELS.map((lbl, i) => `
      <div class="legend-item" style="opacity:${hlLabel !== null && hlLabel !== lbl ? '0.35' : '1'}; font-weight:${hlLabel === lbl ? '800' : 'normal'};" onclick="renderEvalTrendChart('${hlLabel === lbl ? '' : lbl}')">
        <div class="legend-dot" style="background:${RADAR_COLORS_ARR[i]};width:10px;height:10px;border-radius:3px;"></div>${lbl}
      </div>
    `).join('');
  }

  const etc = document.getElementById('evalTrendChart');
  if (!etc) return;

  CH.evalTrendChart = new Chart(etc.getContext('2d'), {
    type: 'bar',
    data: { labels: qs, datasets: datasets },
    options: {
      indexAxis: 'x', responsive: true, maintainAspectRatio: false, animation: { duration: 500 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(61,61,92,.95)',
          callbacks: {
            label: c => c.dataset.label === '주요일정' ? c.dataset.customEvts[c.dataIndex].map(e => `${e.date}: ${e.title}`) : `${c.dataset.label}: ${c.parsed.y.toFixed(1)}점`
          }
        },
        datalabels: {
          display: ctx => ctx.dataset.label !== '주요일정',
          anchor: 'end', align: 'end',
          color: ctx => (hlLabel !== null && hlLabel !== ctx.dataset.label) ? 'transparent' : '#555',
          font: { size: 9, weight: '700' },
          formatter: v => v > 0 ? v.toFixed(1) : ''
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11, weight: '700' }, color: '#3d3d5c' } },
        y: { min: 0, max: 5.5, grid: { color: '#eef5fb' }, ticks: { font: { size: 10 }, callback: v => v > 5 ? '' : `${v}점` }, title: { display: true, text: '점수', font: { size: 10 } } }
      },
      onClick: (e, els) => {
        if (els.length > 0 && els[0].datasetIndex < RADAR_LABELS.length) {
          const target = RADAR_LABELS[els[0].datasetIndex];
          renderEvalTrendChart(hlLabel === target ? null : target);
        }
      }
    }
  });
}

function renderEvalRadarDual() {
  destroyChart('evalRadarYear');
  destroyChart('evalRadarQtr');

  const name = G_evalMember;
  const color = MC[name];
  const qs = filteredEvalQs();
  const allQsSet = new Set(EVAL_DATA.map(d => d.q));
  const allQs = Array.from(allQsSet);

  const yearAvgs = RADAR_LABELS.map((_, i) => {
    const vals = allQs.map(q => {
      const ev = EVAL_DATA.find(e => e.q === q && e.name === name);
      return ev ? ev.vals[i] : null;
    }).filter(v => v !== null);
    return vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)) : 0;
  });

  const latestQ = qs[qs.length - 1] || '';

  let qtrVals = [0, 0, 0, 0, 0];
  if (latestQ) {
    const latestEv = EVAL_DATA.find(e => e.q === latestQ && e.name === name);
    if (latestEv) qtrVals = latestEv.vals;
  }

  const yearAvgScore = yearAvgs.length ? parseFloat((yearAvgs.reduce((a, b) => a + b, 0) / yearAvgs.length).toFixed(2)) : 0;
  const qtrAvgScore = qtrVals.length ? parseFloat((qtrVals.reduce((a, b) => a + b, 0) / qtrVals.length).toFixed(2)) : 0;

  const scoreColor = s => s >= 4 ? '#22c55e' : s >= 3 ? '#00458c' : '#f97316';

  const yrs = document.getElementById('evalRadarYearScore');
  if (yrs) yrs.innerHTML = `<span style="color:${scoreColor(yearAvgScore)};font-size:16px;font-weight:900;">${yearAvgScore.toFixed(1)}</span><span style="color:#aaa;font-size:11px;"> / 5.0점</span>`;

  const qrs = document.getElementById('evalRadarQtrScore');
  if (qrs) qrs.innerHTML = `<span style="color:${scoreColor(qtrAvgScore)};font-size:16px;font-weight:900;">${qtrAvgScore.toFixed(1)}</span><span style="color:#aaa;font-size:11px;"> / 5.0점</span>`;

  const labelEl = document.getElementById('evalRadarQtrLabel');
  if (labelEl) labelEl.textContent = latestQ || '분기 없음';

  const radarOpts = (label, data, bc) => {
    return {
      type: 'radar',
      data: {
        labels: RADAR_LABELS,
        datasets: [{ label: label, data: data, backgroundColor: `${bc}33`, borderColor: bc, borderWidth: 2.5, pointBackgroundColor: bc, pointRadius: 4, pointHoverRadius: 6 }]
      },
      options: {
        layout: { padding: 16 },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: { min: 0, max: 5, ticks: { display: false, stepSize: 1 }, grid: { color: '#dbeafe' }, angleLines: { color: '#dbeafe' }, pointLabels: { font: { size: 10, weight: '700' }, color: '#3d3d5c', padding: 12 } }
        },
        plugins: {
          legend: { display: false },
          datalabels: { display: true, color: bc, font: { size: 10, weight: '800' }, formatter: v => v > 0 ? v.toFixed(1) : '', align: 'end', anchor: 'end', offset: 3, textStrokeColor: '#fff', textStrokeWidth: 3 },
          tooltip: { backgroundColor: '#3d3d5c', callbacks: { label: c => `${c.label}: ${c.raw}점` } }
        }
      }
    };
  };

  const ery = document.getElementById('evalRadarYear');
  if (ery) CH.evalRadarYear = new Chart(ery.getContext('2d'), radarOpts("PJ 전체 평균", yearAvgs, '#9999bb'));

  const erq = document.getElementById('evalRadarQtr');
  if (erq) CH.evalRadarQtr = new Chart(erq.getContext('2d'), radarOpts(latestQ || '분기 없음', qtrVals, color));
}

function renderEvalTrendTable() {
  const wrap = document.getElementById('evalTrendTableWrap');
  if (!wrap) return;

  const name = G_evalMember;
  const color = MC[name];
  const qs = Array.from(filteredEvalQs()).reverse();

  let html = `<table class="eval-trend-table"><thead><tr><th style="text-align:left;border-radius:8px 0 0 8px;">분기</th>`;
  RADAR_LABELS.forEach((l, i) => {
    html += `<th style="color:${RADAR_COLORS_ARR[i]};">${l}</th>`;
  });
  html += `<th style="border-radius:0 8px 8px 0;color:${color};">평균</th></tr></thead><tbody>`;

  qs.forEach((q, idx) => {
    const ev = EVAL_DATA.find(e => e.q === q && e.name === name);
    const isLatest = idx === 0;
    const prevEv = qs[idx + 1] ? EVAL_DATA.find(e => e.q === qs[idx + 1] && e.name === name) : null;

    html += `<tr class="${isLatest ? 'current-q' : ''}"><td style="font-weight:700;color:${isLatest ? '#00458c' : '#555'};">`;

    if (!ev) {
      html += `${q}</td>`;
      RADAR_LABELS.forEach(() => { html += '<td>-</td>'; });
      html += '<td>-</td></tr>';
      return;
    }

    const avg = (ev.vals.reduce((a, b) => a + b, 0) / ev.vals.length);
    const ac = avg >= 4 ? '#22c55e' : avg >= 3 ? '#00458c' : '#f97316';

    if (isLatest && prevEv) {
      const diff = avg - (prevEv.vals.reduce((a, b) => a + b, 0) / prevEv.vals.length);
      let diffStr = '<span style="font-size:10px;color:#aaa;font-weight:700;margin-left:4px;">(→)</span>';
      if (diff > 0) diffStr = `<span style="font-size:10px;color:#22c55e;font-weight:700;margin-left:4px;">(▲${diff.toFixed(1)})</span>`;
      else if (diff < 0) diffStr = `<span style="font-size:10px;color:#ef4444;font-weight:700;margin-left:4px;">(▼${Math.abs(diff).toFixed(1)})</span>`;
      html += `${q}${diffStr}`;
    } else {
      html += q;
    }

    html += '</td>';

    ev.vals.forEach((v, vi) => {
      let diffBadge = '';
      if (isLatest && prevEv) {
        const d = v - prevEv.vals[vi];
        if (d > 0) diffBadge = `<span style="font-size:9px;color:#22c55e;">▲${d.toFixed(1)}</span>`;
        else if (d < 0) diffBadge = `<span style="font-size:9px;color:#ef4444;">▼${Math.abs(d).toFixed(1)}</span>`;
      }
      const vColor = v >= 4.5 ? '#22c55e' : v >= 3.5 ? '#00458c' : v >= 2.5 ? '#f97316' : '#ef4444';
      html += `<td><span style="color:${vColor};font-weight:700;">${v.toFixed(1)}</span>${diffBadge}</td>`;
    });

    html += `<td><strong style="color:${ac};">${avg.toFixed(1)}</strong></td></tr>`;
  });
  html += '</tbody></table>';
  wrap.innerHTML = html;
}

function renderEvalProfile() {
  const name = G_evalMember;
  const color = MC[name];
  const qs = filteredEvalQs();

  let found = null;
  for (let i = 0; i < RAW.length; i++) {
    if (RAW[i].name === name) { found = RAW[i]; break; }
  }
  const pos = found ? found.pos : '';

  const allQsSet = new Set(EVAL_DATA.map(d => d.q));
  const allQs = Array.from(allQsSet);

  const totalItemAvgs = RADAR_LABELS.map((lbl, i) => {
    let avgVal = 0;
    const vals = allQs.map(q => {
      const ev = EVAL_DATA.find(e => e.q === q && e.name === name);
      return ev ? ev.vals[i] : null;
    }).filter(v => v !== null);
    if (vals.length > 0) {
      avgVal = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
    }
    return { lbl: lbl, avg: avgVal, idx: i };
  });

  const filteredItemAvgs = RADAR_LABELS.map((lbl, i) => {
    let avgVal = 0;
    const vals = qs.map(q => {
      const ev = EVAL_DATA.find(e => e.q === q && e.name === name);
      return ev ? ev.vals[i] : null;
    }).filter(v => v !== null);
    if (vals.length > 0) {
      avgVal = parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2));
    }
    return { lbl: lbl, avg: avgVal, idx: i };
  });

  const overallAvg = filteredItemAvgs.length ? parseFloat((filteredItemAvgs.reduce((s, x) => s + x.avg, 0) / filteredItemAvgs.length).toFixed(1)) : 0;

  const sorted = Array.from(filteredItemAvgs).sort((a, b) => b.avg - a.avg);

  let gd = { grade: 'C', color: '#f97316', bg: '#fff7ed' };
  if (overallAvg > 3.5) gd = { grade: 'S', color: '#f59e0b', bg: '#fef9ee' };
  else if (overallAvg > 3.2) gd = { grade: 'A+', color: '#22c55e', bg: '#f0fdf4' };
  else if (overallAvg > 2.8) gd = { grade: 'A', color: '#00458c', bg: '#eef5fb' };
  else if (overallAvg >= 2.5) gd = { grade: 'B', color: '#007dc5', bg: '#eff6ff' };

  const getTrend = (idx) => {
    if (qs.length < 2) return '';
    const curEv = EVAL_DATA.find(e => e.q === qs[qs.length - 1] && e.name === name);
    const prevEv = EVAL_DATA.find(e => e.q === qs[qs.length - 2] && e.name === name);
    if (!curEv || !prevEv) return '';
    const diff = curEv.vals[idx] - prevEv.vals[idx];
    if (diff > 0) return `<div class="eval-top3-trend" style="color:#22c55e;">▲ +${diff.toFixed(1)}</div>`;
    if (diff < 0) return `<div class="eval-top3-trend" style="color:#ef4444;">▼ ${Math.abs(diff).toFixed(1)}</div>`;
    return `<div class="eval-top3-trend" style="color:#aaa;">→ 유지</div>`;
  };

  const card = document.getElementById('evalProfileCard');
  if (card) {
    card.style.border = `1.5px solid ${color}44`;

    let html = `
      <div style="position:absolute;top:0;left:0;right:0;height:8px;background:${color}; border-radius:18px 18px 0 0;"></div>
      <div class="eval-profile-top">
        <div class="eval-profile-avatar" style="background:${color};"><span style="font-size:22px;font-weight:800;">${INITIALS[name]}</span></div>
        <div style="flex:1;">
          <div class="eval-profile-name">${name}</div>
          <div class="eval-profile-pos">${pos}</div>
          <span class="eval-profile-badge" style="background:${color}18;color:${color};">${qs[0] || '-'} ~ ${qs[qs.length - 1] || '-'}</span>
        </div>
      </div>
      <div class="eval-score-big">
        <div class="eval-score-big-num" style="color:${color};">${overallAvg.toFixed(1)}</div>
        <div class="eval-score-big-label">종합 역량 점수 / 5.0점</div>
        <span class="eval-score-grade" style="background:${gd.bg};color:${gd.color};">등급 ${gd.grade}
          <span class="grade-info-wrap"><span class="grade-info-icon">i</span><span class="grade-tooltip"><strong>S</strong> : 3.5 초과<br><strong>A+</strong> : 3.2 ~ 3.5<br><strong>A</strong> : 2.8 ~ 3.2<br><strong>B</strong> : 2.5 ~ 2.8<br><strong>C</strong> : 2.5 미만</span></span>
        </span>
      </div>
      <div class="eval-scores-list">`;

    filteredItemAvgs.forEach((item, i) => {
      const vColor = item.avg >= 4.5 ? '#22c55e' : item.avg >= 3.5 ? '#00458c' : item.avg >= 2.5 ? '#f97316' : '#ef4444';
      html += `
        <div class="eval-score-item">
          <span class="eval-score-item-label">${item.lbl}</span>
          <div class="eval-score-item-bar-wrap"><div class="eval-score-item-bar" style="width:${Math.round(item.avg / 5 * 100)}%;background:${RADAR_COLORS_ARR[i]};"></div></div>
          <span class="eval-score-item-val" style="color:${vColor};">${item.avg.toFixed(1)}</span>
        </div>`;
    });

    html += `
      </div>
      <div style="font-size:11px;font-weight:700;color:#9999bb;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:4px;">${I_TROP} 기간 평균 TOP 3 강점</div>
      <div class="eval-top3-row">`;

    sorted.slice(0, 3).forEach((item, rank) => {
      const vColor = item.avg >= 4 ? '#22c55e' : item.avg >= 3 ? '#00458c' : '#f97316';
      html += `
        <div class="eval-top3-card" style="background:${['#fef9ee', '#f8fafc', '#fdf6f0'][rank]};border:1.5px solid ${['#f59e0b', '#94a3b8', '#cd7c3b'][rank]}33;">
          <div class="eval-top3-medal">${['🥇', '🥈', '🥉'][rank]}</div>
          <div class="eval-top3-label">${item.lbl}</div>
          <div class="eval-top3-score" style="color:${vColor};">${item.avg.toFixed(1)}</div>
          ${getTrend(item.idx)}
        </div>`;
    });

    html += `</div><div id="evalAvgCompareProfile" style="margin-top:12px;padding:10px;background:#f8f8ff;border-radius:10px;"></div>`;
    card.innerHTML = html;
  }

  let qtrVals = [0, 0, 0, 0, 0];
  if (qs.length > 0) {
    const latestEv = EVAL_DATA.find(e => e.q === qs[qs.length - 1] && e.name === name);
    if (latestEv) qtrVals = latestEv.vals;
  }

  const avgEl = document.getElementById('evalAvgCompareProfile');
  if (avgEl) {
    let html = '<div style="font-size:11px;font-weight:700;color:#9999bb;margin-bottom:6px;">항목별 비교 (최신분기 vs 연도평균)</div>';
    RADAR_LABELS.forEach((lbl, i) => {
      const diff = (qtrVals[i] || 0) - (totalItemAvgs[i].avg || 0);
      let diffStr = '–';
      let diffColor = '#aaa';
      if (diff > 0) { diffStr = `▲+${diff.toFixed(1)}`; diffColor = '#22c55e'; }
      else if (diff < 0) { diffStr = `▼${Math.abs(diff).toFixed(1)}`; diffColor = '#ef4444'; }

      html += `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
          <div style="width:6px;height:6px;border-radius:50%;background:${RADAR_COLORS_ARR[i]};flex-shrink:0;"></div>
          <span style="font-size:11px;color:#555;width:50px;flex-shrink:0;">${lbl}</span>
          <span style="font-size:12px;font-weight:800;color:${color};">${(qtrVals[i] || 0).toFixed(1)}</span>
          <span style="font-size:10px;color:#aaa;">/ 연평균 ${(totalItemAvgs[i].avg || 0).toFixed(1)}</span>
          <span style="font-size:10px;font-weight:700;color:${diffColor};margin-left:auto;">${diffStr}</span>
        </div>`;
    });
    avgEl.innerHTML = html;
  }
}

// =========================================================
// 12. 상관관계 분석 차트
// =========================================================
let activeCorrelationMetric = RADAR_LABELS[0];

function renderCorrelationChartInit() {
  const tabsWrap = document.getElementById('correlationTabs');
  if (tabsWrap) {
    let html = '';
    RADAR_LABELS.forEach(lbl => {
      html += `<button class="tab-btn-sm ${lbl === activeCorrelationMetric ? 'active' : ''}" onclick="updateCorrelationMetric('${lbl}')">${lbl}</button>`;
    });
    tabsWrap.innerHTML = html;
  }
  renderCorrelationChart();
}

function updateCorrelationMetric(lbl) {
  activeCorrelationMetric = lbl;
  renderCorrelationChartInit();
}

function renderCorrelationChart() {
  destroyChart('correlation');
  const name = G_evalMember;
  const d = filtered().filter(r => r.name === name);
  const qs = filteredEvalQs();
  if (!qs.length) return;

  const overallSubMap = grpMin(d, 'sub');
  const topSubs = Object.entries(overallSubMap).sort((a, b) => b[1] - a[1]).slice(0, 7).map(x => x[0]);

  const qMap = {};
  qs.forEach(q => { qMap[q] = {}; });

  d.forEach(r => {
    const q = getQFromDate(r.date);
    if (qMap[q]) {
      if (topSubs.indexOf(r.sub) > -1) {
        qMap[q][r.sub] = (qMap[q][r.sub] || 0) + r.min;
      } else {
        qMap[q]['기타 업무'] = (qMap[q]['기타 업무'] || 0) + r.min;
      }
    }
  });

  const displaySubs = topSubs.concat(['기타 업무']);

  const datasets = displaySubs.map((sub, i) => {
    return {
      type: 'bar',
      label: sub,
      data: qs.map(q => mToH(qMap[q][sub] || 0)),
      backgroundColor: sub === '기타 업무' ? '#d1d5db' : SUB_PAL[i % SUB_PAL.length],
      yAxisID: 'yBar',
      stack: 'stackedBar',
      order: 2
    };
  });

  const mIdx = RADAR_LABELS.indexOf(activeCorrelationMetric);
  const scoreData = qs.map(q => {
    const ev = EVAL_DATA.find(e => e.q === q && e.name === name);
    return ev ? ev.vals[mIdx] : null;
  });

  datasets.push({
    type: 'line',
    label: `${activeCorrelationMetric} 점수`,
    data: scoreData,
    borderColor: '#00458c',
    backgroundColor: '#00458c',
    borderWidth: 3,
    pointRadius: 5,
    pointBackgroundColor: '#fff',
    pointBorderWidth: 2,
    pointHoverRadius: 8,
    yAxisID: 'yLine',
    tension: 0.3,
    order: 1
  });

  const canvas = document.getElementById('correlationChart');
  if (!canvas) return;

  CH.correlation = new Chart(canvas.getContext('2d'), {
    data: { labels: qs, datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 10, usePointStyle: true } },
        tooltip: {
          backgroundColor: 'rgba(61,61,92,.95)',
          callbacks: {
            label: c => c.dataset.type === 'line' ? `⭐ ${c.dataset.label}: ${c.parsed.y.toFixed(1)}점` : `${c.dataset.label}: ${formatNum(c.parsed.y)}h`
          }
        },
        datalabels: {
          display: ctx => ctx.dataset.type === 'line',
          color: '#00458c', anchor: 'bottom', align: 'bottom', offset: 8, font: { weight: 'bold', size: 12 },
          formatter: v => v ? v.toFixed(1) : ''
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11, weight: 'bold' } } },
        yBar: { type: 'linear', display: true, position: 'left', stacked: true, title: { display: true, text: '투입 시간 (h)', font: { size: 10 } }, grid: { color: '#eef5fb' }, ticks: { font: { size: 10 } } },
        yLine: { type: 'linear', display: true, position: 'right', title: { display: true, text: '평가 점수 (0~5)', font: { size: 10 } }, min: 0, max: 5.5, grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' }, color: '#00458c' } }
      }
    }
  });
}

// =========================================================
// 초기 실행 구문
// =========================================================
window.addEventListener('DOMContentLoaded', () => {
  loadDataFromSheets();
});
