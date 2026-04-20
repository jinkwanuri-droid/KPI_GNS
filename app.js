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
    var sy=filterYears[Math.floor(window.filterStartIndex/4)], sq=filterQuarters[window.filterStartIndex%4], ey=filterYears[Math.floor(window.filterEndIndex/4)], eq=filterQuarters[window.filterEndIndex%4], cnt=window.filterEndIndex-
