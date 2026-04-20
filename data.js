// data.js
var RAW = [];
var MEMBERS = ['홍길동', '김철수'];
var SCHEDULE_DATA = [];
var COST_DATA = [];
var EVAL_DATA = [];
var MC = { '홍길동': '#00428E', '김철수': '#3b82f6' };
var PROFILE_IMG = {};
var GLOBAL_MEMBER = '홍길동';
var WP_MEMBER = '홍길동';

// 필터 및 렌더링 설정 변수
var filterYears = ['2023', '2024'];
var filterQuarters = ['1Q', '2Q', '3Q', '4Q'];
var totalNodes = 8;
var percentPositions = [];
var CAT_ORDER = ['설계', '기획', '행정'];
var CAT_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];
var SUB_PAL = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];
var OVERTIME_RANGES = ['9~10h', '10~11h', '11~12h', '12h 이상'];
var OT_COLORS = ['#fde047', '#facc15', '#eab308', '#ca8a04'];
var RADAR_LABELS = ['전문성', '소통', '책임감', '팀워크', '창의성'];
var INSIGHT_RADAR_LABELS = ['1-OT', 'Shannon', 'HHI', 'CV', 'Hurst', 'Jaccard'];
var MONTH_KO = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
var emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
var INSIGHT_METRICS_INFO = [];

window.filterStartIndex = 0;
window.filterEndIndex = 7;
window.lastClickedIndex = 0;
window.isCostCumulative = false;

var hlTimeline = null, hlStage = null, hlOvertimeDonut = null, hlMonthlyOt = null;
var hlDonutWork = null, hlPjRatio = null, hlWpSub = null, hlHeroDonut = null;
var hlHeatBin = null, hlWpOt = null;
var CH = {};

// 유틸리티 함수
function dC(id) { if(CH[id]) { CH[id].destroy(); delete CH[id]; } }
function getShortName(n) { return n ? n.substring(0, 1) : ''; }
function fH(min) { return (min / 60).toFixed(1); }
function mToH(min) { return min / 60; }
function fmt(min) { return (min / 60).toFixed(1); }
function hRgba(hex, alpha) { return hex; } 
function filtered() { return RAW; } 
function getMos(arr) { return ['2024-01', '2024-02']; }
function grp(arr, key) { 
    return arr.reduce((acc, curr) => { 
        acc[curr[key]] = (acc[curr[key]] || 0) + curr.min; 
        return acc; 
    }, {}); 
}
function safeRender(fn) { try { fn(); } catch(e) { console.warn(e); } }
function calcStandaloneMetrics(d) { return {ot: 1, shannon: 1, hhi: 1, cv: 1, hurst: 1, jaccard: 1}; }
function filteredEvalQs() { return ['2024 1Q']; }
function getQ(date) { return '2024 1Q'; }
function getAvatar(n, size, fz) { return '<div class="fm-avatar" style="background:#00428E;">'+getShortName(n)+'</div>'; }

// 화면 초기 구동을 위한 임시 데이터 로더
function loadDataFromSheets() {
    if(RAW.length === 0) {
        RAW = [
            { name: '홍길동', date: '2024-01-05', min: 480, project: '경남 서부의료원', cat: '설계', sub: '도면작성' },
            { name: '김철수', date: '2024-01-10', min: 600, project: '경남 서부의료원', cat: '기획', sub: '기획회의' }
        ];
    }
    initSlider();
    renderAllViews();
}
