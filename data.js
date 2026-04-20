// data.js

// --- 1. 전역 상수 설정 ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQ_RuJcGEMFYmDswuKkg6D8bUCaWg1-twtmqPKikraPuq1Sp-RYTSjbbUDXRILpf7b/exec';
const GITHUB_BASE = 'https://jinkwanuri-droid.github.io/KPI_GNS/';
const PROFILE_IMG = {'윤진관':'./img/jk.yoon.jpg','김효언':'./img/he.kim.jpg','정인태':'./img/intae.jeoung.jpg','이혜인B':'./img/hi.lee2.jpg'};
const DYNAMIC_COLORS = ['#00428E','#7545fb','#14b8a6','#eb5f8c','#f59e0b','#f97316','#ec4899','#8b5cf6'];
const CAT_ORDER = ['기획설계','계획설계','기본설계','실시설계'];
const CAT_COLORS = ['#3b82f6','#0ea5e9','#0284c7','#0369a1'];
const SUB_PAL = ['#00428E','#4A90E2','#0ea5e9','#38bdf8','#818cf8','#6366f1','#a855f7','#f43f5e','#f97316','#facc15','#4ade80','#14b8a6'];
const OT_COLORS = ['#818cf8','#6366f1','#4A90E2','#00428E'];
const RADAR_LABELS = ['적극성','생산성','전문성','창의성','협업능력'];
const MONTH_KO = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const OVERTIME_RANGES = ['9~10h','10~11h','11~12h','12h 이상'];
const INSIGHT_RADAR_LABELS = ['정시업무(1-OT)','Shannon(파편화도)','HHI(몰입도)','CV(안정성)','Hurst(주도성)','Jaccard(확장성)'];

const emojiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

const INSIGHT_METRICS_INFO = [
    { key: 'ot', name: '정시업무(1-OT)', target: '1.0 (야근無)', eval: function(v){ if(v>=0.8) return {s: '좋음', c: '#10b981', i: '👍', t: '1.0(야근無)에 근접한 아주 양호한 상태입니다. 물리적인 시간 투입은 매우 안정적입니다.'}; if(v>=0.5) return {s: '보통', c: '#f59e0b', i: '⚠️', t: '야근이 종종 발생하고 있습니다. 업무량 및 에너지 관리가 필요합니다.'}; return {s: '주의', c: '#ef4444', i: '🚨', t: '상시 초과근무가 심각하게 발생하고 있습니다. 물리적 번아웃 위험이 큽니다.'}; } },
    { key: 'shannon', name: 'Shannon(파편화도)', target: '0.5~0.7 (균형)', eval: function(v){ if(v>=0.5 && v<=0.8) return {s: '좋음', c: '#10b981', i: '👍', t: '0.5~0.7이 목표인데 적절히 도달했습니다. 업무 흐름이 자주 끊기지 않고 한 가지 일에 깊게 몰입하는 질적 시간이 확보되고 있습니다.'}; if(v<0.5) return {s: '주의', c: '#ef4444', i: '🚨', t: '한 두 가지의 특정 업무에 극단적으로 몰려 있습니다.'}; return {s: '주의', c: '#f59e0b', i: '⚠️', t: '0.5~0.7이 목표인데 다소 높습니다. 업무가 너무 잘게 쪼개져 몰입 효율이 떨어집니다.'}; } },
    { key: 'hhi', name: 'HHI(몰입도)', target: '0.4 이상 (몰입)', eval: function(v){ if(v>=0.4) return {s: '좋음', c: '#10b981', i: '👍', t: '0.4 이상으로 핵심 과업에 에너지가 단단히 집중 투입되고 있습니다.'}; return {s: '주의', c: '#ef4444', i: '🚨', t: '0.4 이상이 목표인데 현재 너무 낮습니다. 에너지가 너무 많은 프로젝트에 잘게 쪼개져 투입되고 있음을 의미합니다.'}; } },
    { key: 'cv', name: 'CV 안정성', target: '1.0 (안정)', eval: function(v){ if(v>=0.7) return {s: '좋음', c: '#10b981', i: '👍', t: '매일 투입하는 시간의 양이 매우 일정합니다. 성실하고 예측 가능한 양적 투입이 이뤄지고 있습니다.'}; if(v>=0.4) return {s: '보통', c: '#f59e0b', i: '⚠️', t: '주 단위나 특정 요일별로 투입 시간 편차가 다소 존재합니다.'}; return {s: '주의', c: '#ef4444', i: '🚨', t: '출근과 휴무 격차가 극심하거나 아주 불규칙한 양적 투입이 이뤄지고 있습니다.'}; } },
    { key: 'hurst', name: 'Hurst(주도성)', target: '0.6 이상 (주도)', eval: function(v){ if(v>=0.6) return {s: '좋음', c: '#10b981', i: '👍', t: '0.6 이상으로 주도성이 높습니다. 수동적으로 시키는 일만 하는 게 아니라, 본인의 리듬대로 업무를 질적으로 컨트롤하고 있습니다.'}; return {s: '주의', c: '#f59e0b', i: '⚠️', t: '수치가 낮아 자신의 리듬을 잃기 쉽고, 외부 요인에 휩쓸려 방어적으로 일할 우려가 있습니다.'}; } },
    { key: 'jaccard', name: 'Jaccard(확장성)', target: '0.3 이상 (확장)', eval: function(v){ if(v>=0.3 && v<=0.7) return {s: '좋음', c: '#10b981', i: '👍', t: '기존 업무와 새 업무의 조화를 측정합니다. 0.5 근처로 최적의 성장을 보이며, 새로운 업무 범위로 무난히 확장하고 있습니다.'}; if(v<0.3) return {s: '보통', c: '#94a3b8', i: 'ℹ️', t: '기존에 하던 익숙한 일만 고수하며 새로운 직무 확장이 일어나지 않는 정체 상태입니다.'}; return {s: '보통', c: '#94a3b8', i: 'ℹ️', t: '기존 업무가 아예 없어지고 매번 새로운 일만 하여 다소 혼란스러울 수 있는 상태입니다.'}; } }
];

// --- 2. 전역 상태 변수 ---
var MEMBERS=[], MC={}, INITIALS={}, SCHEDULE_DATA=[], EVAL_DATA=[], RAW=[], COST_DATA=[], CH={};
var GLOBAL_MEMBER=null, WP_MEMBER=null;
var hlTimeline=null, hlStage=null, hlOvertimeDonut=null, hlMonthlyOt=null, hlDonutWork=null, hlPjRatio=null, hlWpSub=null, hlHeroDonut=null, hlHeatBin=null, hlWpOt=null;

window.filterStartIndex=0; window.filterEndIndex=11; window.lastClickedIndex=0;
var filterYears=[2024,2025,2026], filterQuarters=['Q1','Q2','Q3','Q4'], totalNodes=12, percentPositions=[];
window.currentWorkingAiData = null;
window.currentAiData = null;
window.isCostCumulative = true;
window.lastCostMos = [];

// --- 3. 공통 유틸 함수 ---
function safeRender(fn){ try{fn();} catch(e){console.error("Chart Render Error:", e);} }
function fmt(v){ return typeof v==='number'?v.toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1}):v; }
function mToH(m){ return parseFloat((m/60).toFixed(1)); }
function fH(m){ return fmt(mToH(m)); }
function grp(a,k){ return a.reduce(function(m,r){m[r[k]]=(m[r[k]]||0)+r.min;return m;},{}); }
function getMos(d){ return Array.from(new Set(d.map(function(r){return r.date.slice(0,7);}))).sort(); }
function getQ(ds){ var m=parseInt(ds.slice(5,7)); return ds.slice(0,4)+'-Q'+Math.ceil(m/3); }
function dC(id){ if(CH[id]){CH[id].destroy();delete CH[id];} }
function hRgba(h,a){ try{return'rgba('+parseInt(h.slice(1,3),16)+','+parseInt(h.slice(3,5),16)+','+parseInt(h.slice(5,7),16)+','+a+')';}catch(e){return h;} }
function getAvatar(n,s,fs){ return '<div class="avatar-base" style="width:'+(s||24)+'px;height:'+(s||24)+'px;font-size:'+(fs||10)+'px;background:'+(MC[n]||'#00428E')+';border:2px solid '+(MC[n]||'#00428E')+';">'+(INITIALS[n]||'A')+'</div>'; }
function getWeekInfo(ds){ var d=new Date(ds),y=d.getFullYear(),m=d.getMonth()+1,dt=d.getDate(),wn=Math.ceil(dt/7),ym=y+'-'+String(m).padStart(2,'0'),bn=Math.ceil(wn/2); return{label1:[ym,'W'+String(wn).padStart(2,'0')],key1:ym+'-W'+String(wn).padStart(2,'0'),label2:[ym,'W'+(bn*2-1)+'-'+(bn*2)],key2:ym+'-B'+bn}; }
function getShortName(n) { if(!n) return ''; if(n === '이혜인B') return '혜인'; if(n.length >= 3) return n.substring(1,3); return n; }

// --- 4. 필터 관련 유틸 ---
function filtered(){
    return RAW.filter(function(r){
        var q=getQ(r.date), y=parseInt(q.slice(0,4)), qn=parseInt(q.slice(6,7))-1;
        var i=(y-2024)*4+qn;
        return i>=window.filterStartIndex && i<=window.filterEndIndex;
    });
}
function filteredEvalQs(){
    return Array.from(new Set(EVAL_DATA.map(function(d){return d.q;}))).sort().filter(function(q){
        var y=parseInt(q.slice(0,4)), qn=parseInt(q.slice(6,7))-1;
        var i=(y-2024)*4+qn;
        return i>=window.filterStartIndex && i<=window.filterEndIndex;
    });
}

// --- 5. 분석용 함수 ---
function calcStandaloneMetrics(currR) {
    if(!currR || currR.length === 0) return {ot:0, shannon:0, hhi:0, cv:0, hurst:0.5, jaccard:0};
    var t = currR.reduce((s,r)=>s+r.min,0) || 1;
    var sm = grp(currR, 'sub');
    var hi=0, sn=0;
    var keys = Object.keys(sm);
    keys.forEach(k => { var p = sm[k]/t; hi += p*p; if(p>0) sn -= p*Math.log(p); });
    if(keys.length>1) sn = sn/Math.log(keys.length); else sn=0;
    
    var personDays = {};
    currR.forEach(r => { var k = r.date + '|' + r.name; personDays[k] = (personDays[k] || 0) + r.min; });
    var totalPersonDays = Object.keys(personDays).length;
    var os = 0;
    Object.values(personDays).forEach(m => { var h_val = Math.max(0, (m / 60) - 8); if (h_val > 0) { os += (Math.exp(3 * (h_val / 4)) - 1) / (Math.exp(3) - 1); } });
    var oi = totalPersonDays > 0 ? os / totalPersonDays : 0;
    
    var dt = grp(currR, 'date');
    var vl = Object.values(dt);
    var cv=0, hs=0.5;
    if(vl.length > 0) {
        var m2 = vl.reduce((a,b)=>a+b,0)/vl.length;
        if(m2>0) cv = Math.sqrt(vl.reduce((a,b)=>a+Math.pow(b-m2,2),0)/vl.length)/m2;
        if(vl.length>=3 && m2>0){
            var cm=[], cs=0;
            vl.forEach(v => { cs+=(v-m2); cm.push(cs); });
            var R = Math.max.apply(null, cm) - Math.min.apply(null, cm);
            var S = Math.sqrt(vl.reduce((a,v)=>a+Math.pow(v-m2,2),0)/vl.length) || 1;
            if(R>0) hs = Math.min(Math.max(Math.log(R/S)/Math.log(vl.length/2), 0.01), 0.99);
        }
    }
    var cn = Math.max(0, 1 - (cv/2.0));
    
    var jc = 0;
    var dts = Array.from(new Set(currR.map(r=>r.date))).sort();
    if(dts.length >= 2) {
        var mid = Math.floor(dts.length / 2);
        var p1 = currR.filter(r => r.date <= dts[mid]);
        var p2 = currR.filter(r => r.date > dts[mid]);
        var s1 = new Set(Object.keys(grp(p1, 'sub')));
        var s2 = new Set(Object.keys(grp(p2, 'sub')));
        var it=0; s2.forEach(x => { if(s1.has(x)) it++; });
        var un = new Set([...s1, ...s2]).size;
        jc = un===0 ? 0 : it/un;
    }
    return {ot: oi, shannon: sn, hhi: hi, cv: cn, hurst: hs, jaccard: jc};
}

// --- 6. 구글 시트 데이터 로드 ---
function loadDataFromSheets(){
    if(typeof setProgress !== 'undefined') setProgress(20,'서버 연결 중...');
    fetch(APPS_SCRIPT_URL+'?action=all&t='+Date.now()).then(function(r){
        if(typeof setProgress !== 'undefined') setProgress(50,'데이터 파싱 중...');
        return r.json();
    }).then(function(j){
        if(typeof setProgress !== 'undefined') setProgress(75,'차트 렌더링 중...');
        SCHEDULE_DATA = j.schedule || j['tb_일정'] || [];
        COST_DATA = j.cost || [];
        
        var rawEval = j.eval || j['tb_평가'] || j.evaluation || j.data || [];
        EVAL_DATA = rawEval.map(function(r){
            var yStr = String(r.year || r['# 연도'] || r['연도'] || '').trim();
            var qStr = String(r.qtr || r['분기'] || '').trim();
            var finalQ = r.q ? r.q : (yStr + '-' + (qStr.startsWith('Q') ? qStr : 'Q' + qStr));
            var nameStr = String(r.name || r['성명'] || '').trim();
            return {
                q: finalQ,
                name: nameStr,
                vals: [ parseFloat(r['적극성'])||0, parseFloat(r['생산성'])||0, parseFloat(r['전문성'])||0, parseFloat(r['창의성'])||0, parseFloat(r['협업능력'])||0 ]
            };
        }).filter(function(d){ return d.name && d.q.length > 3 && d.q.indexOf('undefined') === -1; });
        
        var rawWork = j.work || j['tb_업무일지'] || j['tb_업무'] || [];
        RAW = rawWork.filter(function(r){ return r.name && r.date && r.min > 0; }).map(function(r){
            var p = String(r.project || r['프로젝트'] || r['PJ Code'] || r.pjCode || '').trim();
            var pt = '공통업무';
            if(p.includes('24188') || p.includes('서부의료원')) pt = '경남 서부의료원';
            else if(/^[0-9]+$/.test(p) && p !== '') pt = '타 프로젝트';
            return {
                name: String(r.name).trim(), pos: String(r.pos || '').trim(), date: String(r.date).slice(0,10),
                cat: String(r.cat || '미분류').trim(), sub: String(r.sub || '기타').trim(), project: pt, min: parseInt(r.min) || 0
            };
        });
        
        var to=['윤진관','이혜인B','정인태','김효언'];
        MEMBERS=Array.from(new Set(RAW.map(function(r){return r.name;}).concat(EVAL_DATA.map(function(e){return e.name;}))))
            .filter(function(n){return n && n !== 'undefined' && n.trim() !== '';})
            .sort(function(a,b){ var ia=to.indexOf(a),ib=to.indexOf(b); return (ia!==-1?ia:99) - (ib!==-1?ib:99); });
            
        MEMBERS.forEach(function(n,i){ MC[n]=DYNAMIC_COLORS[i%DYNAMIC_COLORS.length]; INITIALS[n]=n.length>=3?n.substring(1,3):n; });
        GLOBAL_MEMBER = MEMBERS[0]; WP_MEMBER = MEMBERS[0];
        
        if(typeof setProgress !== 'undefined') setProgress(100,'완료!');
        if(typeof initSlider !== 'undefined') initSlider();
        if(typeof renderCustomDropdown !== 'undefined') renderCustomDropdown();
        if(typeof updateNavSlider !== 'undefined') updateNavSlider();
        
        var ldText = document.getElementById('loadingDescText');
        if(ldText) { ldText.textContent='데이터 분석 완료'; ldText.style.color='#2563eb'; }
        if(typeof showEnterBtn !== 'undefined') showEnterBtn();
    }).catch(function(e){
        var msg = document.getElementById('ovMsg');
        if(msg) msg.innerHTML='<span style="color:#ef4444;font-weight:700;">❌ 연결 실패</span>';
        if(typeof showEnterBtn !== 'undefined') showEnterBtn();
    });
}

// --- 7. Gemini API 연동 (팀원 분석) ---
async function generateWorkingAiComment() {
    var btn = document.getElementById('btnWpAi');
    var box = document.getElementById('wpAiCommentBox');
    if(!window.currentWorkingAiData) { box.innerHTML = '<span style="color:#ef4444;">분석할 데이터가 부족합니다.</span>'; return; }
    var ad = window.currentWorkingAiData;
    var prompt = `당신은 10년 차 건축설계 프로젝트 팀장입니다. 팀원 '${ad.m}'의 업무 데이터를 보고 아주 짧고 날카로운 피드백을 주세요.
요청사항: 인사말/서론 절대 금지. 아래 3가지 항목만 1~2문장씩 짧고 간결하게 작성할 것. 마크다운 적용할 것.
- 💡 업무 효율성 (근태/몰입도)
- 📈 설계 트렌드 변화
- 🚀 향후 제언
데이터: ${fH(ad.tt||0)}시간 투입, 연장 ${ad.o9||0}일, 심야 ${ad.o12||0}일. 집중업무: ${ad.tk||'-'}. 비중: ${ad.cat||'-'}. HHI: ${(ad.ah||0).toFixed(2)}, Shannon: ${(ad.as||0).toFixed(2)}`;
    
    btn.innerText = "분석 중..."; btn.disabled = true; btn.style.opacity = '0.7';
    box.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; gap:8px; color:#6366f1; height:100%; font-weight:700;"><div class="ov-spinner" style="width:18px;height:18px;border-width:2px;margin:0;"></div>분석 중...</div>';
    
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        const result = await response.json();
        if(result.success) {
            box.innerHTML = result.text.replace(/### (.*?)\n/g, '<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g, '<b style="color:#1e40af;">$1</b>').replace(/\n/g, '<br>');
        } else {
            box.innerHTML = '<span style="color:#ef4444;">오류 발생: ' + (result.error || '알 수 없는 오류') + '</span>';
        }
    } catch (e) {
        box.innerHTML = '<span style="color:#ef4444;">서버 응답 오류 (Vercel 연동 확인 필요)</span>';
    } finally {
        btn.innerText = "다시 분석하기"; btn.disabled = false; btn.style.opacity = '1';
    }
}

// --- 8. Gemini API 연동 (KPI 분석) ---
async function generateAiComment() {
    var btn = document.getElementById('btnGenerateAI');
    var box = document.getElementById('aiCommentBox');
    if(!window.currentAiData) { box.innerHTML = '<span style="color:#ef4444;">분석할 데이터가 부족합니다.</span>'; return; }
    var ad = window.currentAiData;
    var prompt = `당신은 10년 차 건축설계 팀장입니다. 팀원 '${ad.m}'의 평가 데이터를 보고 아주 짧고 날카로운 피드백을 주세요.
요청사항: 인사말, 서론 절대 금지. 아래 3가지 항목만 1~2문장씩 간결하게 작성할 것. 마크다운 적용.
- 🎯 업무 스타일 (지표 기반)
- 📊 점수 상관관계
- 🌱 성장 제언
데이터: 점수 ${ad.score}점, 집중업무: ${ad.topTasks}.
정시업무 ${(ad.rawCvInsight[0]||0).toFixed(2)}, Shannon파편화도 ${(ad.rawCvInsight[1]||0).toFixed(2)}, HHI몰입도 ${(ad.rawCvInsight[2]||0).toFixed(2)}, CV안정성 ${(ad.rawCvInsight[3]||0).toFixed(2)}, Hurst주도성 ${(ad.rawCvInsight[4]||0).toFixed(2)}, Jaccard확장성 ${(ad.rawCvInsight[5]||0).toFixed(2)}`;
    
    btn.innerText = "분석 중..."; btn.disabled = true; btn.style.opacity = '0.7';
    box.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; gap:8px; color:#6366f1; height:100%; font-weight:700;"><div class="ov-spinner" style="width:18px;height:18px;border-width:2px;margin:0;"></div>분석 중...</div>';
    
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        const result = await response.json();
        if(result.success) {
            box.innerHTML = result.text.replace(/### (.*?)\n/g, '<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g, '<b style="color:#1e40af;">$1</b>').replace(/\n/g, '<br>');
        } else {
            box.innerHTML = '<span style="color:#ef4444;">오류 발생: ' + (result.error || '알 수 없는 오류') + '</span>';
        }
    } catch (e) {
        box.innerHTML = '<span style="color:#ef4444;">서버 응답 오류 (Vercel 연동 확인 필요)</span>';
    } finally {
        btn.innerText = "다시 분석하기"; btn.disabled = false; btn.style.opacity = '1';
    }
}
