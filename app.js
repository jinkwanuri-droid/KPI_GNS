document.addEventListener("DOMContentLoaded", function() {
    var overlay = document.getElementById('loadingOverlay');
    if(overlay) {
        for(let i=0; i<65; i++) {
            let dust = document.createElement('div');
            dust.className = 'dust-ptcl';
            let size = Math.random() * 4 + 1.5;
            dust.style.width = size + 'px'; dust.style.height = size + 'px';
            dust.style.left = Math.random() * 100 + 'vw'; dust.style.top = Math.random() * 100 + 'vh';
            dust.style.animationDuration = (Math.random() * 6 + 4) + 's';
            dust.style.animationDelay = (Math.random() * -10) + 's';
            overlay.appendChild(dust);
        }
    }
    loadDataFromSheets();
});

window.addEventListener('scroll',function(){
    var tb=document.getElementById('topbar');
    if(window.scrollY>20) tb.classList.add('scrolled');
    else tb.classList.remove('scrolled');
},{passive:true});

document.addEventListener('click',function(e){ 
    var w=document.getElementById('fmWrapper'); 
    var fmOptions = document.getElementById('fmOptions');
    if(w && !w.contains(e.target) && fmOptions) fmOptions.classList.remove('open'); 
});

function hideLoadingOverlay(){
    var el=document.getElementById('loadingOverlay');
    if(el){el.style.opacity='0';setTimeout(function(){el.style.display='none';},600);}
}

function showEnterBtn(){
    var sa=document.getElementById('loadingStatusArea'), bw=document.getElementById('ovEnterBtnWrap');
    if(sa){sa.style.opacity='0';sa.style.visibility='hidden';}
    if(bw)bw.classList.add('show');
}

function setProgress(p,m){
    var el = document.getElementById('ovProgress');
    if(el) el.style.width=p+'%';
    if(m){ var msgEl = document.getElementById('ovMsg'); if(msgEl) msgEl.textContent=m; }
}

function updateNavSlider(){
    var a=document.querySelector('.nav-item.active'), s=document.getElementById('navSlider');
    if(a&&s){s.style.width=a.offsetWidth+'px';s.style.left=a.offsetLeft+'px';}
}

function showView(v,el){
    document.querySelectorAll('.view-section').forEach(function(s){s.classList.remove('active');});
    document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
    document.getElementById('view-'+v).classList.add('active');
    el.classList.add('active');
    updateNavSlider();
    var floatingFilter = document.getElementById('globalMemberSelectWrap');
    if(v === 'members' || v === 'kpieval') floatingFilter.classList.add('show');
    else { floatingFilter.classList.remove('show'); document.getElementById('fmOptions').classList.remove('open'); }
    if(v==='members') renderWorkingTab(WP_MEMBER || GLOBAL_MEMBER);
    else if(v==='kpieval') renderEvalTab();
    else renderDashboardTab();
}

function renderAllViews(){
    if(document.getElementById('view-dashboard').classList.contains('active')) renderDashboardTab();
    else if(document.getElementById('view-members').classList.contains('active')) renderWorkingTab(WP_MEMBER);
    else if(document.getElementById('view-kpieval').classList.contains('active')) renderEvalTab();
}

function renderCustomDropdown(){
    var h='';
    MEMBERS.forEach(function(n){ h += '<div class="fm-option-item" style="background:'+MC[n]+';" onclick="selectGlobalMember(\''+n+'\')">'+getShortName(n)+'</div>'; });
    document.getElementById('fmOptions').innerHTML=h;
    updateCustomSelectTrigger();
}

function toggleDropdown(){ document.getElementById('fmOptions').classList.toggle('open'); }

function selectGlobalMember(v){
    GLOBAL_MEMBER = v; WP_MEMBER = v;
    document.getElementById('fmOptions').classList.remove('open');
    updateCustomSelectTrigger();
    var activeView = document.querySelector('.view-section.active').id;
    if(activeView === 'view-kpieval') renderEvalTab();
    else if(activeView === 'view-members') renderWorkingTab(WP_MEMBER);
}

function updateCustomSelectTrigger(){
    if(!GLOBAL_MEMBER) return;
    var fmTrig = document.getElementById('fmTriggerAvatar');
    if(fmTrig) { fmTrig.style.background = MC[GLOBAL_MEMBER] || '#00428E'; fmTrig.innerText = getShortName(GLOBAL_MEMBER); }
}

function initSlider(){
    var nc=document.getElementById('nodesContainer'), yr=document.getElementById('yearRow');
    if(!nc || !yr) return;
    nc.innerHTML=''; yr.innerHTML='';
    var cp=0, pa=[];
    for(var i=0; i<totalNodes; i++){ pa.push(cp); if(i<totalNodes-1) cp += (i%4===3 ? 1.6 : 1); }
    percentPositions=pa.map(function(p){return(p/cp)*100;});
    
    filterYears.forEach(function(y,i){
        var el=document.createElement('div'); el.className='year-label'; el.innerText=y;
        el.onclick=function(){ window.filterStartIndex=i*4; window.filterEndIndex=i*4+3; updateFilterUI(); };
        el.style.left=((percentPositions[i*4]+percentPositions[i*4+3])/2)+'%'; yr.appendChild(el);
    });
    
    for(var i=0; i<totalNodes; i++){
        (function(ix){
            var n=document.createElement('div'); n.className='node'; n.style.left=percentPositions[ix]+'%';
            n.onclick=function(e){ if(e.shiftKey){ window.filterStartIndex=Math.min(window.lastClickedIndex,ix); window.filterEndIndex=Math.max(window.lastClickedIndex,ix); } else{ window.filterStartIndex=window.filterEndIndex=window.lastClickedIndex=ix; } updateFilterUI(); };
            nc.appendChild(n);
        })(i);
    }
    updateFilterUI();
}

function resetFilter(){
    window.filterStartIndex=0; window.filterEndIndex=totalNodes-1;
    hlTimeline = null; hlStage = null; hlOvertimeDonut = null; hlMonthlyOt = null;
    hlDonutWork = null; hlPjRatio = null; hlWpSub = null; hlHeroDonut = null; hlHeatBin = null; hlWpOt = null;
    updateFilterUI();
}

function updateFilterUI(){
    document.querySelectorAll('.node').forEach(function(n,i){
        n.className='node';
        if(i>=window.filterStartIndex && i<=window.filterEndIndex){ n.classList.add('active'); if(i===window.filterStartIndex || i===window.filterEndIndex) n.classList.add('endpoint'); }
    });
    if(percentPositions.length>0){
        var track = document.getElementById('trackActive');
        if(track) { track.style.left=percentPositions[window.filterStartIndex]+'%'; track.style.width=(percentPositions[window.filterEndIndex]-percentPositions[window.filterStartIndex])+'%'; }
    }
    var sy=filterYears[Math.floor(window.filterStartIndex/4)], sq=filterQuarters[window.filterStartIndex%4], ey=filterYears[Math.floor(window.filterEndIndex/4)], eq=filterQuarters[window.filterEndIndex%4], cnt=window.filterEndIndex-window.filterStartIndex+1;
    var lbl=cnt===1 ? (sy+' '+sq) : (cnt===totalNodes ? '전체 기간' : (sy+' '+sq+' ~ '+ey+' '+eq));
    var summaryEl = document.getElementById('summaryText');
    if(summaryEl) summaryEl.innerText=lbl;
    if(RAW && RAW.length>0) renderAllViews();
}

window.toggleCostMode = function() {
    window.isCostCumulative = document.getElementById('costToggleBtn').checked;
    if(window.isCostCumulative) {
        document.getElementById('costToggleLbl2').style.color = '#00428E'; document.getElementById('costToggleLbl1').style.color = '#94a3b8';
    } else {
        document.getElementById('costToggleLbl2').style.color = '#94a3b8'; document.getElementById('costToggleLbl1').style.color = '#00428E';
    }
    renderCostTrendChart(window.lastCostMos);
};

window.toggleAdvancedDetails = function(pf) {
    var detailDiv = document.getElementById(pf + 'AdvancedDetails'), btnText = document.getElementById(pf + 'AdvancedToggleText');
    if(!detailDiv || !btnText) return;
    if (detailDiv.style.display === 'none') {
        detailDiv.style.display = 'block'; btnText.innerHTML = '세부정보 차트 닫기 ▲';
        setTimeout(function(){ ['OtChart','ShannonChart','HhiChart','CvChart','HurstChart','JaccardChart'].forEach(function(k){ if(CH[pf + k]) CH[pf + k].resize(); }); }, 50);
    } else { detailDiv.style.display = 'none'; btnText.innerHTML = '세부정보 차트 보기 ▼'; }
};

window.ovTogglePjR = function(b){ hlPjRatio = hlPjRatio===b ? null : b; renderOvProjectRatio(filtered()); };
window.dTogStage = function(c){ hlStage = hlStage===c ? null : c; var p = filtered().filter(function(r){return r.project==='경남 서부의료원';}); renderDashStage(p); renderDashCompare(p); };
window.dTogDonut = function(k){ hlDonutWork = hlDonutWork===k ? null : k; renderDashDonut(filtered().filter(function(r){return r.project==='경남 서부의료원';})); };
window.dTogTimeline = function(n){ hlTimeline = hlTimeline===n ? null : n; var p = filtered().filter(function(r){return r.project==='경남 서부의료원';}); renderDashTimeline(p, getMos(p)); renderDashCompare(p); };
window.dTogMonthlyOt = function(b){ hlMonthlyOt = hlMonthlyOt===b ? null : b; var p = filtered().filter(function(r){return r.project==='경남 서부의료원';}); renderDashMonthlyOt(p, getMos(p)); renderDashOvertimeBars(p); };
window.dTogOtDonut = function(n){ hlOvertimeDonut = hlOvertimeDonut===n ? null : n; renderDashOvertimeDonut(filtered().filter(function(r){return r.project==='경남 서부의료원';})); };
window.dTogHeroDonut = function(k){ hlHeroDonut = hlHeroDonut===k ? null : k; var d = WP_MEMBER ? filtered().filter(function(r){return r.name===WP_MEMBER;}) : filtered(); renderWpHeroDonut(d, d.reduce(function(s,r){return s+r.min;},0), MC[WP_MEMBER]); };
window.dTogWpSub = function(s){ hlWpSub = hlWpSub===s ? null : s; var d = WP_MEMBER ? filtered().filter(function(r){return r.name===WP_MEMBER;}) : filtered(); safeRender(function(){renderWpStackedBar(d, getMos(d));}); safeRender(function(){renderWpDonutSub(d, d.reduce(function(x,y){return x+y.min;},0));}); };
window.dTogWpOt = function(label) { hlWpOt = hlWpOt === label ? null : label; var d = WP_MEMBER ? filtered().filter(function(r){return r.name === WP_MEMBER;}) : filtered(); safeRender(function(){ renderWpOvertimeDetail(d); }); };
window.toggleHeatBin = function(bn, yr, tid){ hlHeatBin = (hlHeatBin===bn) ? null : bn; if(tid==='wpHeatTable') renderWpHeatmapYear(yr); else renderHeatmapOnly(yr); };

window.renderHeatmapOnly = function(yr){ 
    var p = filtered().filter(function(r){return r.project==='경남 서부의료원';}); 
    var ay = Array.from(new Set(p.map(function(r){return r.date.slice(0,4);}))).sort(); 
    if(ay.length===0) ay = ['2024']; var ty = yr && ay.includes(yr) ? yr : ay[ay.length-1]; 
    var heatTabs = document.getElementById('heatYearTabs');
    if(heatTabs) { heatTabs.innerHTML = ay.map(function(y){ return '<button class="tab-btn-sm '+(y===ty?'active':'')+'" onclick="renderHeatmapOnly(\''+y+'\')">'+y+'</button>'; }).join(''); }
    buildHeatmapHTML(p, ty, '#00428E', 'heatTable');
};

window.renderWpHeatmapYear = function(yr){ 
    var d = WP_MEMBER ? filtered().filter(function(r){return r.name===WP_MEMBER;}) : filtered(); 
    var ay = Array.from(new Set(d.map(function(r){return r.date.slice(0,4);}))).sort(); 
    if(ay.length===0) ay = ['2024']; var ty = yr && ay.includes(yr) ? yr : ay[ay.length-1]; 
    var wpHeatTabs = document.getElementById('wpHeatTabs');
    if(wpHeatTabs) { wpHeatTabs.innerHTML = ay.map(function(y){ return '<button class="tab-btn-sm '+(y===ty?'active':'')+'" onclick="renderWpHeatmapYear(\''+y+'\')">'+y+'</button>'; }).join(''); }
    buildHeatmapHTML(d, ty, MC[WP_MEMBER]||'#00428E', 'wpHeatTable');
};

// AI 모달 열기/닫기
window.openAiModal = function(type) {
    var overlay = document.getElementById('aiModalOverlay');
    var body = document.getElementById('aiModalBody');
    var srcHtml = '';
    if(type === 'wp') { srcHtml = document.getElementById('wpAiCommentBox').innerHTML; }
    else if(type === 'kpi') { srcHtml = document.getElementById('aiCommentBox').innerHTML; }
    
    if(overlay && body) {
        body.innerHTML = srcHtml;
        overlay.classList.add('show');
    }
};

window.closeAiModal = function() {
    var overlay = document.getElementById('aiModalOverlay');
    if(overlay) overlay.classList.remove('show');
};

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if(e.key === 'Escape') closeAiModal();
});
