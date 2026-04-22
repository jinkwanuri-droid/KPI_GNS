Chart.defaults.animation.duration = 400;
Chart.defaults.font.family = "'Pretendard Variable',Pretendard,sans-serif";
Chart.register(ChartDataLabels);
Chart.Tooltip.positioners.cursor = function(el,ep){return ep?{x:ep.x,y:ep.y}:false;};
Chart.defaults.plugins.tooltip.position = 'cursor';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15,23,42,0.92)';
Chart.defaults.plugins.tooltip.titleColor = '#94a3b8';
Chart.defaults.plugins.tooltip.bodyColor = '#f8fafc';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(99,102,241,0.2)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.plugins.tooltip.padding = 10;
Chart.register({
    id:'verticalLine',
    beforeDatasetsDraw:function(c){
        var ctx=c.ctx;
        c.data.datasets.forEach(function(ds,i){
            if(ds.isSchedule){
                var m=c.getDatasetMeta(i);
                if(m&&m.data){
                    m.data.forEach(function(pt,idx){
                        if(ds.data[idx]===null)return;
                        if(!pt||isNaN(pt.x)||isNaN(pt.y))return;
                        ctx.save();ctx.beginPath();ctx.moveTo(pt.x,pt.y);ctx.lineTo(pt.x,c.scales.y.bottom);
                        ctx.lineWidth=1;ctx.strokeStyle='rgba(203,213,225,0.8)';ctx.stroke();
                        ctx.beginPath();ctx.arc(pt.x,pt.y,4.5,0,2*Math.PI);
                        ctx.fillStyle='#ef4444';ctx.fill();
                        ctx.lineWidth=1;ctx.strokeStyle='#fff';ctx.stroke();
                        ctx.restore();
                    });
                }
            }
        });
    }
});
const customRadarBgPlugin = {
    id: 'customRadarBg',
    beforeDraw: (chart) => {
        if (chart.config.type !== 'radar') return;
        if (!chart.scales || !chart.scales.r) return;
        const r = chart.scales.r;
        if (!r._pointLabels || r._pointLabels.length === 0) return;
        try {
            const maxVal = r.max || 1.2;
            const pts = [];
            for(let i=0; i<r._pointLabels.length; i++){ pts.push(r.getPointPositionForValue(i, maxVal)); }
            if(pts.length < 3) return;
            const ctx = chart.ctx;
            ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y); ctx.lineTo(pts[1].x, pts[1].y); ctx.lineTo(pts[2].x, pts[2].y);
            if(pts.length > 3) ctx.lineTo(pts[3].x, pts[3].y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(59, 130, 246, 0.05)'; ctx.fill();
            if(pts.length > 3) {
                ctx.beginPath(); ctx.moveTo(pts[3].x, pts[3].y); ctx.lineTo(pts[4].x, pts[4].y);
                if(pts.length > 5) ctx.lineTo(pts[5].x, pts[5].y);
                ctx.lineTo(pts[0].x, pts[0].y); ctx.closePath();
                ctx.fillStyle = 'rgba(236, 72, 153, 0.05)'; ctx.fill();
            }
        } catch(e) { }
    }
};
Chart.register(customRadarBgPlugin);

// --- Dashboard 탭 (프로젝트 전체) ---
function renderDashboardTab(){
    var all=filtered();if(!all.length)return;
    var tm=all.reduce(function(s,r){return s+r.min;},0),mos=getMos(all),pd=all.filter(function(r){return r.project==='경남 서부의료원';}),pmos=getMos(pd),adt=new Set(all.map(function(r){return r.date;})).size;
    document.getElementById('ovTotalHour').innerText=fH(tm)+'h';document.getElementById('ovTotalMember').innerText=MEMBERS.length+'명';document.getElementById('ovTotalMonth').innerText=mos.length+'개월';document.getElementById('ovActiveDays').innerText=adt+'일';
    safeRender(function(){renderProjectProgress();});
    safeRender(function(){renderOvProjectRatio(all);});
    var gd=document.getElementById('topKpiGrid');gd.innerHTML='';
    var gtm=pd.reduce(function(s,r){return s+r.min;},0);
    MEMBERS.forEach(function(n){
        var md=all.filter(function(r){return r.name===n;}),tt=md.reduce(function(s,r){return s+r.min;},0),pf=md.find(function(r){return r.name===n;}),po=pf?pf.pos:'',mP=0,oP=0,cP=0;
        md.forEach(function(r){if(r.project==='경남 서부의료원')mP+=r.min;else if(r.project==='타 프로젝트')oP+=r.min;else cP+=r.min;});
        var pct=gtm>0?Math.round(mP/gtm*100):0,p1=tt>0?(mP/tt*100):0,p2=tt>0?(oP/tt*100):0,p3=tt>0?(cP/tt*100):0,mc=document.createElement('div');
        mc.className='card kpi-card';mc.style.border='1px solid '+hRgba(MC[n]||'#00428E',0.5);mc.style.position='relative';mc.style.overflow='hidden';
        var bg=PROFILE_IMG[n]? '<img src="'+PROFILE_IMG[n]+'" style="position:absolute;right:5%;top:-20px;width:110px;height:150px;object-fit:cover;object-position:center top;opacity:0.35;z-index:0;filter:grayscale(100%);-webkit-mask-image:radial-gradient(ellipse 65% 65% at 50% 50%,black 40%,transparent 70%);mask-image:radial-gradient(ellipse 65% 65% at 50% 50%,black 40%,transparent 70%);">':'';
        mc.innerHTML=bg+'<div style="position:relative;z-index:1;display:flex;flex-direction:column;height:100%;justify-content:center;"><div class="member-kpi-header"><div><div style="font-size:18px;font-weight:900;color:#1e293b;">'+n+'</div><div style="font-size:11px;color:#94a3b8;">'+po+'</div></div></div><div style="color:'+MC[n]+';font-size:28px;font-weight:800;margin-top:4px;">'+fH(mP)+'h <span style="font-size:13px;color:#64748b;font-weight:600;">| 총 '+fH(tt)+'h</span></div><div style="height:1px;background:rgba(226,232,240,0.8);margin:10px 0;"></div><div style="font-size:11px;color:#64748b;font-weight:600;">GNWMC 팀원 내 기여도</div><div style="margin-top:4px;display:flex;align-items:center;gap:8px;"><div style="flex:1;height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;"><div style="height:100%;background:'+MC[n]+';width:'+pct+'%;border-radius:4px;"></div></div><span style="font-size:11px;font-weight:700;color:'+MC[n]+';">'+pct+'%</span></div><div style="margin-top:12px;font-size:11px;color:#64748b;font-weight:600;">전체시간 대비 서부의료원 비율</div><div style="margin-top:4px;display:flex;align-items:center;gap:8px;"><div style="flex:1;display:flex;height:8px;border-radius:4px;overflow:hidden;"><div style="width:'+p1+'%;background:#00428E;"></div><div style="width:'+p2+'%;background:#3b82f6;"></div><div style="width:'+p3+'%;background:#cbd5e1;"></div></div><span style="font-size:11px;font-weight:700;color:#64748b;">'+p1.toFixed(0)+'%</span></div></div>';
        gd.appendChild(mc);
    });
    if(pd.length>0){
        safeRender(function(){renderCostTrendChart(pmos);});
        safeRender(function(){renderDashStage(pd);});
        safeRender(function(){renderDashCompare(pd);});
        safeRender(function(){renderDashDonut(pd);});
        safeRender(function(){renderDashTimeline(pd,pmos);});
        safeRender(function(){renderHeatmapOnly('2024');});
        safeRender(function(){renderDashOvertimeBars(pd);});
        safeRender(function(){renderDashOvertimeDonut(pd);});
        safeRender(function(){renderDashMonthlyOt(pd,pmos);});
        var da=Array.from(new Set(pd.map(function(r){return r.date;}))).sort();
        safeRender(function(){renderAdvancedMetrics(pd,da,'#00428E','pj');});
    }
}
function renderProjectProgress() {
    var wrap = document.getElementById('projectProgressWrap'); if(!wrap) return;
    var milestones = [ { key: '설계공모', date: '2024-03-01' }, { key: '착수보고회', date: '2024-05-15' }, { key: '계획설계 적정성', date: '2024-09-30' }, { key: '건축교통통합심의', date: '2024-11-30' }, { key: '중간설계 적정성', date: '2025-01-31' }, { key: '건축허가', date: '2025-02-20' }, { key: '프로젝트 종료', date: '2025-12-31' } ];
    if (SCHEDULE_DATA && SCHEDULE_DATA.length > 0) {
        SCHEDULE_DATA.forEach(function(s) {
            var t = s.title || s.name || s['일정'] || s['내용'] || ''; var d = s.date ? s.date.slice(0,10) : ''; if(!d) return;
            if(t.includes('설계공모')) milestones[0].date = d; if(t.includes('착수보고')) milestones[1].date = d; if(t.includes('계획설계 적정성')) milestones[2].date = d; if(t.includes('통합심의') || t.includes('건축교통')) milestones[3].date = d; if(t.includes('중간설계 적정성')) milestones[4].date = d; if(t.includes('건축허가')) milestones[5].date = d; if(t.includes('종료')) milestones[6].date = d;
        });
    }
    milestones.sort(function(a,b){ return new Date(a.date) - new Date(b.date); });
    var st = new Date(milestones[0].date).getTime(), ed = new Date(milestones[milestones.length-1].date).getTime(), now = new Date().getTime(), total = ed - st, current = now - st, pct = 0;
    if(total > 0) pct = Math.max(0, Math.min(100, (current / total) * 100));
    var dotHtml = milestones.map(function(m) {
        var mTime = new Date(m.date).getTime(), mPct = total > 0 ? Math.max(0, Math.min(100, ((mTime - st) / total) * 100)) : 0;
        var dotColor = mPct <= pct ? '#1e3a8a' : '#fff';
        return '<div class="pj-prog-dot" style="left: '+mPct+'%; background: '+dotColor+';"><div class="pj-prog-tooltip">' + m.key + '<br><span style="color:#93c5fd;font-size:7.5px;">(' + m.date + ') [' + mPct.toFixed(1) + '%]</span></div></div>';
    }).join('');
    var html = '<div class="pj-progress-wrap"><div class="pj-prog-header"><div><div class="pj-prog-title" style="font-size:14px; font-weight:700; color:#475569; text-transform:none; letter-spacing:0;">Project Progress</div><div class="pj-prog-pct">' + pct.toFixed(1) + '% <span style="font-size:16px;font-weight:700;color:#64748b;">to complete</span></div></div><div style="font-size:11px; color:#94a3b8; font-weight:700; display:flex; align-items:center; gap:4px; margin-bottom:4px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>Today</div></div><div class="pj-prog-bar-bg"><div class="pj-prog-bar-fill" style="width: '+pct+'%;"></div>' + dotHtml + '</div></div>';
    wrap.innerHTML = html;
}

// ====================================================================
// [수정1] 투입비율 차트 (남/하/회 컬러 복구 및 글자 겹침 완벽 방지)
// ====================================================================
function renderOvProjectRatio(all){
    var wrap = document.getElementById('ovPjRatioWrap');
    if(!wrap) return;

    var m=0,o=0,c=0;
    all.forEach(function(r){if(r.project==='경남 서부의료원')m+=r.min;else if(r.project==='타 프로젝트')o+=r.min;else c+=r.min;});
    var t=m+o+c;
    
    if (t === 0) {
        wrap.innerHTML = '<div style="padding:20px; text-align:center; color:#94a3b8;">선택된 기간에 데이터가 없습니다.</div>';
        return;
    }

    var pm = (m/t*100).toFixed(1);
    var po = (o/t*100).toFixed(1);
    var pc = (c/t*100).toFixed(1);
    
    var pmNum = parseFloat(pm);
    var poNum = parseFloat(po);
    var pcNum = parseFloat(pc);

    wrap.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; padding: 10px 5px; height:100%; justify-content:center;">
        <div style="display:flex; align-items:flex-end; gap:8px;">
            <span style="font-size:28px; font-weight:900; color:#00428E;">${pm}%</span>
            <span style="font-size:14px; font-weight:600; color:#64748b; margin-bottom:6px;">경상남도 서부의료원</span>
        </div>
        <div style="display:flex; min-height:24px; border-radius:12px; overflow:hidden; width:100%; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); background:#f1f5f9;">
            <div style="width:${pm}%; background:#00428E; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:bold; overflow:hidden; white-space:nowrap; transition: width 0.3s ease;">${pmNum >= 10 ? pm+'%' : ''}</div>
            <div style="width:${po}%; background:#3b82f6; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:bold; overflow:hidden; white-space:nowrap; transition: width 0.3s ease;">${poNum >= 10 ? po+'%' : ''}</div>
            <div style="width:${pc}%; background:#cbd5e1; display:flex; align-items:center; justify-content:center; color:#475569; font-size:11px; font-weight:bold; overflow:hidden; white-space:nowrap; transition: width 0.3s ease;">${pcNum >= 10 ? pc+'%' : ''}</div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; padding: 0 5px;">
            <span style="color:#00428E;">서부의료원</span>
            <span style="color:#3b82f6;">타 프로젝트</span>
            <span style="color:#94a3b8;">공통/기타</span>
        </div>
    </div>`;
}

function getMonthsBetween(start, end) {
    var res = []; var curr = new Date(start + '-01'); var endDate = new Date(end + '-01');
    while(curr <= endDate) { var y = curr.getFullYear(); var m = String(curr.getMonth() + 1).padStart(2, '0'); res.push(y + '-' + m); curr.setMonth(curr.getMonth() + 1); }
    return res;
}

// ====================================================================
// [수정2] 인건비 추이 차트 (단월 덮어쓰기 로직 삭제 및 26년 말까지 항시 출력)
// ====================================================================
function renderCostTrendChart(mos) {
    if(typeof dC === 'function') dC('costTrendChart'); 
    window.lastCostMos = mos;
    
    var canvas = document.getElementById('costTrendChart');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');

    var safeCostData = (typeof COST_DATA !== 'undefined' && Array.isArray(COST_DATA)) ? COST_DATA : [];
    if(!mos || !mos.length || safeCostData.length === 0) return;
    
    var globalStart = '2024-03';
    var globalEnd = '2026-12';
    var allFullMonths = getMonthsBetween(globalStart, globalEnd);
    var allMosMap = {};
    allFullMonths.forEach(function(m){ allMosMap[m] = { plan: 0, exec: 0, hasExec: false }; });
    
    // 안전한 데이터 맵핑
    safeCostData.forEach(function(r) {
        var m = r.date;
        if(m && m.length > 7) m = m.substring(0,7);
        if(allMosMap[m] !== undefined) {
            var p = parseFloat(r.plan);
            if(!isNaN(p)) allMosMap[m].plan += (p / 10000);
            
            if(r.exec !== null && r.exec !== undefined && r.exec !== '') {
                var e = parseFloat(r.exec);
                if(!isNaN(e)) {
                    allMosMap[m].exec += (e / 10000);
                    allMosMap[m].hasExec = true;
                }
            }
        }
    });
    
    var lastActualMonth = '';
    allFullMonths.forEach(function(m) {
        if(allMosMap[m] && allMosMap[m].hasExec) lastActualMonth = m;
    });
    
    var globalData = { plan: [], execActual: [], opt: [], pes: [] };
    var cumPlan = 0, cumExec = 0, cumOpt = 0, cumPes = 0;
    var isCum = window.isCostCumulative === true;

    // 전체 프로젝트 기간(26년 12월)까지 누적/단월 및 예측값 완벽 연산
    allFullMonths.forEach(function(m) {
        var mPlan = allMosMap[m].plan;
        var mExec = allMosMap[m].hasExec ? allMosMap[m].exec : null;

        cumPlan += mPlan;
        globalData.plan.push(isCum ? cumPlan : mPlan);

        if (lastActualMonth === '' || m < lastActualMonth) {
            cumExec += (mExec || 0);
            cumOpt = cumExec;
            cumPes = cumExec;
            globalData.execActual.push(isCum ? cumExec : mExec);
            globalData.opt.push(null);
            globalData.pes.push(null);
        } else if (m === lastActualMonth) {
            cumExec += (mExec || 0);
            cumOpt = cumExec;
            cumPes = cumExec;
            var valExec = isCum ? cumExec : mExec;
            globalData.execActual.push(valExec);
            // 예측선이 끊기지 않고 이 지점부터 시작하도록 세팅
            globalData.opt.push(valExec);
            globalData.pes.push(valExec);
        } else {
            var stepOpt = mPlan * 0.9;
            var stepPes = mPlan * 1.1;
            cumOpt += stepOpt;
            cumPes += stepPes;
            globalData.execActual.push(null);
            globalData.opt.push(isCum ? cumOpt : stepOpt);
            globalData.pes.push(isCum ? cumPes : stepPes);
        }
    });
    
    var sIdx = allFullMonths.indexOf(mos[0]);
    if(sIdx === -1) sIdx = 0;
    
    // 슬라이더 조작에 상관없이 예측 차트는 프로젝트 종료일(26년 12월)까지 보여줍니다.
    var eIdx = allFullMonths.length - 1; 
    
    var viewMonths = allFullMonths.slice(sIdx, eIdx + 1);
    var viewPlan = globalData.plan.slice(sIdx, eIdx + 1);
    var viewActual = globalData.execActual.slice(sIdx, eIdx + 1);
    var viewOpt = globalData.opt.slice(sIdx, eIdx + 1);
    var viewPes = globalData.pes.slice(sIdx, eIdx + 1);

    // 최댓값 계산 시 NaN 제외 보호 로직
    var maxArr = [10];
    var addMax = function(arr) { arr.forEach(function(v){ if(typeof v === 'number' && !isNaN(v)) maxArr.push(v); }); };
    addMax(viewPlan); addMax(viewActual); addMax(viewOpt); addMax(viewPes);
    var maxVal = Math.max.apply(null, maxArr);
    if(isNaN(maxVal) || maxVal === -Infinity) maxVal = 100;
    var scheduleTopY = Math.ceil((maxVal * 1.15) / 10) * 10;
    
    var schData = [];
    viewMonths.forEach(function(m) {
        var schedules = (typeof SCHEDULE_DATA !== 'undefined' ? SCHEDULE_DATA : []).filter(function(s) { return s.date && s.date.startsWith(m); });
        if(schedules.length > 0) {
            var st = schedules.map(function(s) { return '• ' + s.date.slice(2,10).replace(/-/g,'.') + '. ' + (s.title||s.name||s['일정']||s['내용']||'').trim(); });
            schData.push({ schTitle: st, yPos: scheduleTopY });
        } else { schData.push(null); }
    });

    var gradActual = ctx.createLinearGradient(0, 0, 0, 400);
    gradActual.addColorStop(0, 'rgba(0, 66, 142, 0.3)'); gradActual.addColorStop(1, 'rgba(0, 66, 142, 0.0)');
    
    if(window.CH && window.CH.costTrendChart) { window.CH.costTrendChart.destroy(); }

    window.CH.costTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: viewMonths,
            datasets: [
                { label: '실행 인건비', data: viewActual, borderColor: '#00428E', backgroundColor: window.isCostCumulative ? gradActual : 'transparent', borderWidth: 2.5, fill: window.isCostCumulative, tension: 0.3, pointRadius: 3, pointHoverRadius: 6, order: 2, spanGaps: false },
                { label: '긍정 시나리오 (0.9x)', data: viewOpt, borderColor: '#10b981', backgroundColor: 'transparent', borderWidth: 2.5, borderDash: [4, 4], fill: false, tension: 0.3, pointRadius: 2, pointHoverRadius: 5, spanGaps: false, order: 3 },
                { label: '부정 시나리오 (1.1x)', data: viewPes, borderColor: '#ef4444', backgroundColor: 'transparent', borderWidth: 2.5, borderDash: [4, 4], fill: false, tension: 0.3, pointRadius: 2, pointHoverRadius: 5, spanGaps: false, order: 4 },
                { label: '계획 인건비', data: viewPlan, borderColor: '#94a3b8', backgroundColor: 'transparent', borderWidth: 2, borderDash: [2, 2], fill: false, tension: 0.3, pointRadius: 2, pointHoverRadius: 4, order: 5 },
                { type:'line', label:'주요일정', data: schData.map(function(x) { return x ? x.yPos : null; }), backgroundColor:'transparent', borderColor:'transparent', showLine:false, pointRadius: function(cx) { return cx.raw !== null ? 4.5 : 0; }, pointHoverRadius: 7, pointBackgroundColor:'#ef4444', pointBorderColor:'#fff', pointBorderWidth: 1.5, isSchedule:true, order:0, spanGaps:false }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false, clip: false, layout: { padding: { top: 40, right: 20, left: 10, bottom: 10 } }, interaction: { mode: 'nearest', intersect: true },
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: function(cx) { if (cx.dataset.isSchedule || cx.raw === null || cx.raw === 0) return false; return true; },
                    align: 'top', anchor: 'top', offset: 6, color: function(cx) { return cx.dataset.borderColor; }, font: { size: 10, weight: 'bold' }, formatter: function(v) { return Number(v||0).toFixed(1); }
                },
                tooltip: {
                    displayColors: false, backgroundColor: 'rgba(15,23,42,0.95)', titleFont: { size: 14, weight: 'bold' }, bodyFont: { size: 12 }, padding: 12, filter: function(item, index) { return index === 0; },
                    callbacks: {
                        title: function(cx) { return cx[0].label; },
                        label: function(cx) {
                            var item = cx; if (item.dataset.isSchedule) return schData[item.dataIndex].schTitle;
                            var idx = item.dataIndex, plan = viewPlan[idx], actual = viewActual[idx], opt = viewOpt[idx], pes = viewPes[idx];
                            var lines = [ "계획 인건비: " + Number(plan||0).toFixed(1) + " 천만" ];
                            if(actual !== null) {
                                lines.push("실행 인건비: " + Number(actual||0).toFixed(1) + " 천만");
                                var diff = (plan||0) - actual;
                                lines.push(diff >= 0 ? "(절감: " + diff.toFixed(1) + " 천만)" : "(초과: " + Math.abs(diff).toFixed(1) + " 천만)");
                            } else {
                                lines.push("긍정 시나리오: " + Number(opt||0).toFixed(1) + " 천만");
                                lines.push("부정 시나리오: " + Number(pes||0).toFixed(1) + " 천만");
                            }
                            return lines;
                        }
                    }
                }
            },
            scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 12, maxRotation: 0 } }, y: { grid: { color: 'rgba(226,232,240,0.5)' }, min: 0, max: scheduleTopY, ticks: { stepSize: 10, callback: function(v) { return Number(v||0).toFixed(1) + '천만'; } } } }
        }
    });

    // 기간 집행 요약은 슬라이더가 위치한 마지막 달 기준으로 산출합니다.
    var targetMonthForSummary = mos[mos.length - 1];
    var sEndIdx = allFullMonths.indexOf(targetMonthForSummary);
    if(sEndIdx === -1) sEndIdx = allFullMonths.length - 1;
    
    var sPlan = globalData.plan[sEndIdx] || 0;
    var sExec = globalData.execActual[sEndIdx];
    var isPred = sExec === null;
    if(isPred) sExec = globalData.pes[sEndIdx] || 0;

    if(typeof renderCostSummary === 'function') {
        renderCostSummary(targetMonthForSummary, sPlan, sExec, isPred);
    }
}

function renderCostSummary(targetMonth, totalPlan, totalExec, isPred) {
    var wrap = document.getElementById('costSummaryArea'); if(!wrap) return;
    
    var finalBudget = 0;
    if (window.COST_DATA) {
        finalBudget = window.COST_DATA.reduce(function(acc, cur) { return acc + (parseFloat(cur.plan) || 0)/10000; }, 0);
    }
    
    var ratio = totalPlan > 0 ? ((totalExec / totalPlan) * 100).toFixed(1) : 0;
    var diff = totalPlan - totalExec;
    
    var statusClass = 'good', statusMsg = '효율적 집행 (우수)', diffColor = '#10b981', barColor = '#10b981';
    if(ratio > 100) { 
        statusClass = 'danger'; statusMsg = '예산 초과'; diffColor = '#ef4444'; barColor = '#ef4444';
    } else if (ratio > 90) { 
        statusClass = 'warn'; statusMsg = '정상 (한계 근접)'; diffColor = '#f59e0b'; barColor = '#f59e0b';
    }

    var titleSuffix = isPred ? ' <span style="color:#8b5cf6; font-size:11px;">(예상치 포함)</span>' : '';
    
    wrap.innerHTML = `
    <div style="font-size:14px; font-weight:800; color:#1e293b; margin-bottom:12px; display:flex; justify-content:space-between; align-items:flex-end;">
        기간 집행 요약 <span style="font-size:11px; color:#64748b; font-weight:600;">(기준: ${targetMonth}${titleSuffix})</span>
    </div>
    
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:15px; margin-bottom: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-size:12px; color:#64748b; font-weight:700; margin-bottom:8px;">계획 대비 실행 비율</div>
        <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:24px; font-weight:900; color:#00428E; margin:0;">${ratio}%</div>
            <div style="padding:4px 8px; border-radius:6px; font-size:11px; font-weight:800; background:${barColor}20; color:${barColor};">${statusMsg}</div>
        </div>
        <div style="height:6px; width:100%; background:#f1f5f9; border-radius:3px; margin-top:12px; overflow:hidden;">
            <div style="height:100%; width:${Math.min(ratio, 100)}%; background:${barColor}; border-radius:3px; transition: width 0.5s ease;"></div>
        </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <div style="font-size:11px; color:#64748b; font-weight:700; margin-bottom:4px;">예산최종금액 (전체)</div>
            <div style="font-size:16px; font-weight:800; color:#0f172a;">${finalBudget.toLocaleString('ko-KR', {minimumFractionDigits:1, maximumFractionDigits:1})} <span style="font-size:11px;font-weight:600;">천만</span></div>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
            <div style="font-size:11px; color:#64748b; font-weight:700; margin-bottom:4px;">계획금액 (당시)</div>
            <div style="font-size:16px; font-weight:800; color:#64748b;">${totalPlan.toLocaleString('ko-KR', {minimumFractionDigits:1, maximumFractionDigits:1})} <span style="font-size:11px;font-weight:600;">천만</span></div>
        </div>
        <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:10px;">
            <div style="font-size:11px; color:#0369a1; font-weight:700; margin-bottom:4px;">실행금액 (당시)</div>
            <div style="font-size:16px; font-weight:800; color:#0284c7;">${totalExec.toLocaleString('ko-KR', {minimumFractionDigits:1, maximumFractionDigits:1})} <span style="font-size:11px;font-weight:600;">천만</span></div>
        </div>
        <div style="background:${diffColor}15; border:1px solid ${diffColor}40; border-radius:8px; padding:10px;">
            <div style="font-size:11px; color:${diffColor}; font-weight:700; margin-bottom:4px;">절감액 (계획-실행)</div>
            <div style="font-size:16px; font-weight:800; color:${diffColor};">${diff > 0 ? '+' : ''}${diff.toLocaleString('ko-KR', {minimumFractionDigits:1, maximumFractionDigits:1})} <span style="font-size:11px;font-weight:600;">천만</span></div>
            <div style="font-size:10px; color:${diffColor}; margin-top:2px;">${statusMsg}</div>
        </div>
    </div>`;
}

function renderDashStage(pd){
    dC('stageChart');var cm=grp(pd,'cat'),t=Object.values(cm).reduce((a,b)=>a+b,0);if(!t)return;
    document.getElementById('dashStageLegendWrap').innerHTML=CAT_ORDER.map(function(c,i){return '<div class="legend-item '+(hlStage!==null&&hlStage!==c?'dimmed':'')+'" onclick="dTogStage(\''+c+'\')"><div class="legend-dot" style="background:'+CAT_COLORS[i]+'"></div><span style="font-size:11px;">'+c+'</span></div>';}).join('');
    CH.stageChart=new Chart(document.getElementById('stageChart').getContext('2d'),{
        type:'doughnut', data:{labels:CAT_ORDER,datasets:[{data:CAT_ORDER.map(c => mToH(cm[c]||0)),backgroundColor:CAT_ORDER.map((c,i) => (hlStage===null||hlStage===c)?CAT_COLORS[i]:'#e2e8f0'),borderWidth:2,borderColor:'#fff'}]},
        options:{ responsive:true,maintainAspectRatio:false,cutout:'65%',clip:false,layout:{padding:30}, interaction: { mode: 'nearest', intersect: true }, plugins:{ legend:{display:false}, datalabels:{display:true,color:'#1e293b',font:{weight:'bold',size:10},anchor:'end',align:'end',textAlign:'center',formatter:function(v,cx){var p=(v/mToH(t)*100);if(p<5)return'';return cx.chart.data.labels[cx.dataIndex]+'\n'+fmt(v)+'h ('+p.toFixed(1)+'%)';}} }, onClick:function(e,els){ if(els.length) dTogStage(CH.stageChart.data.labels[els[0].index]); else dTogStage(null); } }
    });
    document.getElementById('stageCenter').innerText=fH(t)+'h';
}
function renderDashCompare(pd){
    dC('compareChart');if(!pd.length)return;
    var ds=MEMBERS.map(function(n){ return { label: n, data: CAT_ORDER.map(c => mToH(pd.filter(r => r.name===n&&r.cat===c).reduce((s,x)=>s+x.min,0))), backgroundColor: CAT_ORDER.map(c => { if(hlStage!==null && hlStage!==c) return '#e2e8f0'; if(hlTimeline!==null && hlTimeline!==n) return '#e2e8f0'; return MC[n]; }), borderRadius:4, order: 2 }; });
    ds.push({
        type: 'line', label: '실시설계(예상)',
        data: [null, null, null, 1500],
        borderColor: '#8b5cf6', backgroundColor: 'transparent', borderDash: [5,5], borderWidth: 2, pointRadius: 0, order: 1
    });
    document.getElementById('dashCompareLegendWrap').innerHTML=MEMBERS.map(function(n){return '<div class="legend-item '+(hlTimeline!==null&&hlTimeline!==n?'dimmed':'')+'" style="font-size:11px;" onclick="dTogTimeline(\''+n+'\')"><div class="legend-dot" style="background:'+MC[n]+'"></div>'+n+'</div>';}).join('');
    CH.compareChart=new Chart(document.getElementById('compareChart').getContext('2d'),{
        type:'bar', data:{labels:CAT_ORDER,datasets:ds},
        options:{ responsive:true,maintainAspectRatio:false,clip:false,layout:{padding:{top:40}}, interaction: { mode: 'nearest', intersect: true }, plugins:{ legend:{display:false}, datalabels:{ display:function(cx){ if(cx.dataset.type === 'line') return false; var stg = CAT_ORDER[cx.dataIndex]; var mem = cx.dataset.label; if(hlStage!==null && hlStage!==stg) return false; if(hlTimeline!==null && hlTimeline!==mem) return false; return cx.dataset.data[cx.dataIndex] > 0; }, color:'#64748b',font:{size:10,weight:'bold'},anchor:'end',align:'end', formatter:function(v){return v>0?v.toFixed(1):'';} } }, scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(226,232,240,0.5)'},grace:'15%'}}, onClick:function(e,els){ if(els.length && els[0].datasetIndex < MEMBERS.length) { dTogStage(CAT_ORDER[els[0].index]); } else { dTogStage(null); } } }
    });
}
function renderDashDonut(pd){
    dC('donutChart');var sm=grp(pd,'sub'),t=Object.values(sm).reduce((a,b)=>a+b,0),ta=Object.entries(sm).sort((a,b)=>b[1]-a[1]);
    document.getElementById('donutCenter').innerText=fH(t)+'h';
    if(!ta.length){document.getElementById('top5List').innerHTML='<li style="text-align:center;color:#94a3b8;font-size:12px;">데이터 없음</li>';return;}
    document.getElementById('top5List').innerHTML=ta.slice(0,7).map(function(e,i){var k=e[0],v=e[1],idm=hlDonutWork!==null&&hlDonutWork!==k,p=t>0?(v/t*100).toFixed(1):0;return '<li class="top5-rank-item '+(idm?'dimmed':'')+'" onclick="dTogDonut(\''+String(k).replace(/'/g,"\\'")+'\')"><div class="top5-rank-badge" style="background:'+SUB_PAL[i]+'">'+(i+1)+'</div><span class="top5-rank-name">'+k+'</span><span style="font-size:11px;">'+fH(v)+'h ('+p+'%)</span></li>';}).join('');
    var l=ta.slice(0,7).map(e=>String(e[0])), d=ta.slice(0,7).map(e=>mToH(e[1]));
    CH.donutChart=new Chart(document.getElementById('donutChart').getContext('2d'),{
        type:'doughnut', data:{labels:l,datasets:[{data:d,backgroundColor:l.map((lx,i)=>(hlDonutWork===null||hlDonutWork===lx)?SUB_PAL[i]:'#e2e8f0'),borderWidth:2,borderColor:'#fff'}]},
        options:{ responsive:true,maintainAspectRatio:false,cutout:'60%',clip:false,layout:{padding:40}, interaction: { mode: 'nearest', intersect: true }, plugins:{ legend:{display:false}, datalabels:{display:true,color:'#1e293b',font:{size:10,weight:'800'},textAlign:'center',formatter:function(v,cx){var p=(v/mToH(t)*100);if(p<5)return'';return cx.chart.data.labels[cx.dataIndex]+'\n'+fmt(v)+'h ('+p.toFixed(1)+'%)';},anchor:'end',align:'end'} }, onClick:function(e,els){ if(els.length) dTogDonut(CH.donutChart.data.labels[els[0].index]); else dTogDonut(null); } }
    });
}
function renderDashTimeline(pd,mos){
    dC('timelineChart');if(!mos.length)return;
    var ds=MEMBERS.map(function(n){var mm={};pd.filter(r=>r.name===n).forEach(r=>{mm[r.date.slice(0,7)]=(mm[r.date.slice(0,7)]||0)+r.min;});var c=MC[n],ih=hlTimeline===null||hlTimeline===n;return {label:n,data:mos.map(m=>mToH(mm[m]||0)),borderColor:ih?c:'#e2e8f0',backgroundColor:ih?hRgba(c,0.15):'transparent',borderWidth:2,tension:0.3,fill:true,pointRadius:2,pointHoverRadius:5};});
    document.getElementById('timelineLegendWrap').innerHTML=MEMBERS.map(n=>'<div class="legend-item '+(hlTimeline!==null&&hlTimeline!==n?'dimmed':'')+'" onclick="dTogTimeline(\''+n+'\')"><div class="legend-dot" style="background:'+MC[n]+'"></div>'+n+'</div>').join('');
    CH.timelineChart=new Chart(document.getElementById('timelineChart').getContext('2d'),{type:'line',data:{labels:mos,datasets:ds},options:{responsive:true,maintainAspectRatio:false,layout:{padding:15},interaction:{mode:'index',intersect:false},plugins:{legend:{display:false},datalabels:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(226,232,240,0.5)'},min:0}}}});
}
function renderDashOvertimeBars(pd){
    dC('dashOvertimeBarChart');var dm={};pd.forEach(r=>{var k=r.name+'|'+r.date;dm[k]=(dm[k]||0)+r.min;});var c=[0,0,0,0];Object.values(dm).forEach(m=>{if(m>=540&&m<600)c[0]++;else if(m>=600&&m<660)c[1]++;else if(m>=660&&m<720)c[2]++;else if(m>=720)c[3]++;});
    CH.dashOvertimeBarChart=new Chart(document.getElementById('dashOvertimeBarChart').getContext('2d'),{
        type:'bar', data:{labels:OVERTIME_RANGES,datasets:[{data:c,backgroundColor:c.map((_,i)=>(hlMonthlyOt===null||hlMonthlyOt===OVERTIME_RANGES[i])?OT_COLORS[i]:'#e2e8f0'),borderRadius:4}]},
        options:{ indexAxis:'y',responsive:true,maintainAspectRatio:false,clip:false,layout:{padding:{right:40}}, interaction: { mode: 'nearest', intersect: true }, plugins:{legend:{display:false},datalabels:{display:true,color:'#1e293b',font:{weight:'bold'},anchor:'end',align:'right',offset:6,formatter:v=>v>0?v+'일':''}}, scales:{x:{display:false,grace:'15%'},y:{grid:{display:false},ticks:{font:{size:11,weight:'bold'}}}}, onClick:function(e,els){ if(els.length) dTogMonthlyOt(OVERTIME_RANGES[els[0].index]); else dTogMonthlyOt(null); } }
    });
}
function renderDashMonthlyOt(pd,mos){
    dC('dashMonthlyOvertimeChart');
    var bd=['9~10h','10~11h','11~12h','12h 이상'], bda=[[],[],[],[]], pdMap={};
    pd.forEach(r=>{var k=r.name+'|'+r.date; pdMap[k]=(pdMap[k]||0)+r.min;});
    mos.forEach(m=>{ var c=[0,0,0,0]; Object.keys(pdMap).forEach(k=>{ if(k.split('|')[1].startsWith(m)){ var mn=pdMap[k]; if(mn>=540&&mn<600)c[0]++; else if(mn>=600&&mn<660)c[1]++; else if(mn>=660&&mn<720)c[2]++; else if(mn>=720)c[3]++; } }); c.forEach((v,i)=>bda[i].push(v)); });
    document.getElementById('dashMonthlyOtLegendWrap').innerHTML=bd.map((b,i)=>'<div class="legend-item '+(hlMonthlyOt!==null&&hlMonthlyOt!==b?'dimmed':'')+'" onclick="dTogMonthlyOt(\''+b+'\')"><div class="legend-dot" style="background:'+OT_COLORS[i]+'"></div><span style="font-size:12px;">'+b+'</span></div>').join('');
    CH.dashMonthlyOvertimeChart=new Chart(document.getElementById('dashMonthlyOvertimeChart').getContext('2d'),{
        type:'bar', data:{labels:mos,datasets:bd.map((b,i)=>({label:b,data:bda[i],backgroundColor:(hlMonthlyOt===null||hlMonthlyOt===b)?OT_COLORS[i]:'#e2e8f0',stack:'S0',borderRadius:2}))},
        options:{ responsive:true,maintainAspectRatio:false,clip:false,layout:{padding:{top:30}}, interaction: { mode: 'nearest', intersect: true }, plugins:{ legend:{display:false}, datalabels:{ display: function(cx){ if(hlMonthlyOt === null) { var maxIdx = -1; for(var i = 3; i >= 0; i--) { if(cx.chart.data.datasets[i].data[cx.dataIndex] > 0) { maxIdx = i; break; } } return cx.datasetIndex === maxIdx; } else { return cx.dataset.label === hlMonthlyOt && cx.dataset.data[cx.dataIndex] > 0; } }, formatter: function(v, cx) { if(hlMonthlyOt === null) { var sum = 0; cx.chart.data.datasets.forEach(ds=>{ sum += ds.data[cx.dataIndex] || 0; }); return sum > 0 ? sum + '일' : ''; } else { return v > 0 ? v + '일' : ''; } }, color: function(cx) { return hlMonthlyOt === null ? '#1e293b' : '#fff'; }, font: { size: 10, weight: 'bold' }, anchor: function(cx) { return hlMonthlyOt === null ? 'end' : 'center'; }, align: function(cx) { return hlMonthlyOt === null ? 'end' : 'center'; }, offset: function(cx){ return hlMonthlyOt===null ? 4 : 0;} } }, scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,display:false,grace:'20%'}}, onClick:function(e,els){ if(els.length) dTogMonthlyOt(CH.dashMonthlyOvertimeChart.data.datasets[els[0].datasetIndex].label); else dTogMonthlyOt(null); } }
    });
}
function renderDashOvertimeDonut(pd){
    dC('dashOvertimeDonutChart9'); dC('dashOvertimeDonutChart12');
    var dm=[],ds=[];
    MEMBERS.forEach(n=>{ var pdm={}; pd.filter(r=>r.name===n).forEach(r=>{pdm[r.date]=(pdm[r.date]||0)+r.min;}); var o9=0,o12=0; Object.values(pdm).forEach(m=>{if(m>=540)o9++;if(m>=720)o12++;}); if(o9>0)dm.push({name:n,days:o9}); if(o12>0)ds.push({name:n,days:o12}); });
    document.getElementById('dashOvertimeDonutLegendWrap').innerHTML=MEMBERS.map(n=>'<div class="legend-item '+(hlOvertimeDonut!==null&&hlOvertimeDonut!==n?'dimmed':'')+'" onclick="dTogOtDonut(\''+n+'\')"><div class="legend-dot" style="background:'+MC[n]+'"></div>'+n+'</div>').join('');
    function dd(id,da){
        if(!da.length)return;
        CH[id]=new Chart(document.getElementById(id).getContext('2d'),{ type:'doughnut', data:{ labels:da.map(d=>d.name), datasets:[{ data:da.map(d=>d.days), backgroundColor:da.map(d=>(hlOvertimeDonut===null||hlOvertimeDonut===d.name)?MC[d.name]:'#e2e8f0'), borderWidth:2,borderColor:'#fff' }] }, options:{ responsive:true, maintainAspectRatio:false, cutout:'65%', clip:false, layout:{padding:35}, plugins:{ legend:{display:false}, datalabels:{ display:true,color:'#1e293b',font:{weight:'bold',size:10}, formatter:function(v,cx){ var s=cx.dataset.data.reduce((a,b)=>a+b,0),p=s>0?Math.round(v/s*100):0; return v>0?cx.chart.data.labels[cx.dataIndex]+'\n'+v+'일 ('+p+'%)':''; }, anchor:'end',align:'end' } }, onClick:function(e,els){ if(els.length) dTogOtDonut(da[els[0].index].name); else dTogOtDonut(null); } } });
    }
    dd('dashOvertimeDonutChart9',dm); dd('dashOvertimeDonutChart12',ds);
}
// --- Working 탭 렌더링 ---
function renderWorkingTab(nm){
    if(!nm&&MEMBERS.length)nm=MEMBERS[0];
    if(WP_MEMBER!==nm){hlWpSub=null;hlHeroDonut=null;}
    WP_MEMBER=nm; GLOBAL_MEMBER=nm;
    var all = filtered();
    var all_d = nm ? all.filter(r=>r.name===nm) : all;
    var tt = all_d.reduce((s,r)=>s+r.min,0);
    var d = all_d.filter(r=>r.project==='경남 서부의료원');
    var c = MC[nm]||'#00428E', pf = RAW.find(r=>r.name===nm), po = pf?pf.pos:'';
    var bi=document.getElementById('wpProfileImgBg');
    if(PROFILE_IMG[nm]){bi.src=PROFILE_IMG[nm];bi.style.display='block';}else bi.style.display='none';
    document.getElementById('wpProfileName').textContent=nm; document.getElementById('wpProfilePos').textContent=po;
    var pm = d.reduce((s,r)=>s+r.min,0);
    var pp = tt>0?Math.round(pm/tt*100):0;
    var ap = all.filter(r=>r.project==='경남 서부의료원');
    var gm = ap.reduce((s,r)=>s+r.min,0);
    var mp = gm>0?Math.round(pm/gm*100):0;
    document.getElementById('wpContribFill').style.width=pp+'%';document.getElementById('wpContribPct').textContent=pp+'% ('+fH(pm)+'h / '+fH(tt)+'h)';document.getElementById('wpContribFill2').style.width=mp+'%';document.getElementById('wpContribPct2').textContent=mp+'%';
    var sm2=grp(d,'sub'), ta2=Object.entries(sm2).sort((a,b)=>b[1]-a[1]), tk=ta2.length>0?ta2[0][0]:'주요 업무', dtx=Array.from(new Set(d.map(r=>r.date))).sort(), o12=0, o9=0, as=0, ah=0, ac=0, cn=0;
    dtx.forEach(dt=>{
        var dy=d.filter(r=>r.date===dt);if(!dy.length)return;
        var ty=dy.reduce((s,r)=>s+r.min,0); if(ty>=720)o12++;else if(ty>=540)o9++;
        var sm=grp(dy,'sub'), h=0, s=0, ky=Object.keys(sm), N=ky.length;
        ky.forEach(k=>{var p=sm[k]/ty;h+=p*p;if(p>0)s-=p*Math.log(p);}); if(N>1)s=s/Math.log(N);else s=0;
        var wv=[];for(var i=0;i<7;i++){var pd_dt=new Date(new Date(dt).getTime()-i*86400000).toISOString().slice(0,10);wv.push(d.filter(r=>r.date===pd_dt).reduce((a,b)=>a+b.min,0));}
        var m=wv.reduce((a,b)=>a+b,0)/7, cv=m===0?0:Math.sqrt(wv.reduce((a,b)=>a+Math.pow(b-m,2),0)/7)/m;
        as+=s;ah+=h;ac+=cv;cn++;
    });
    if(cn>0){as/=cn;ah/=cn;ac/=cn;}
    var mo=getMos(d), apm=mo.length>0?mToH(pm)/mo.length:0, dm={};
    d.forEach(r=>{dm[r.date]=(dm[r.date]||0)+r.min;});
    var ad=Object.keys(dm).length, da=ad>0?mToH(pm)/ad:0, t1=0, t2=0, t3=0;
    Object.values(dm).forEach(m=>{if(m>=540&&m<660)t1++;else if(m>=660&&m<720)t2++;else if(m>=720)t3++;});
    document.getElementById('wpStatMonths').textContent=mo.length;document.getElementById('wpStatActiveDays').textContent='('+ad+'일)';
    document.getElementById('wpStatTotal').textContent=fH(pm);document.getElementById('wpStatDayAvg').textContent=da.toFixed(1)+'h/일';
    document.getElementById('wpStatOt1').textContent=(t1+t2);document.getElementById('wpStatOt2').textContent=t3;
    var top3Html = '';
    if(ta2.length > 0) {
        top3Html = ta2.slice(0,3).map((e,i) => `<div style="display:flex;justify-content:space-between;font-size:12px;color:#1e293b;font-weight:700;"><span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70px;">${i+1}. ${e[0]}</span><span style="color:#64748b;">${(pm>0?(e[1]/pm*100):0).toFixed(0)}%</span></div>`).join('');
    } else {
        top3Html = '<div style="font-size:11px;color:#94a3b8;">데이터 없음</div>';
    }
    document.getElementById('wpTop3ListOnly').innerHTML = top3Html;
    var catStr = Object.entries(grp(d,'cat')).sort((a,b)=>b[1]-a[1]).map(x => x[0]+'('+(pm>0 ? (x[1]/pm*100).toFixed(0) : 0)+'%)').join(', ');
    window.currentWorkingAiData = { m: nm, tt: pm, apm: apm, o9: o9, o12: o12, tk: tk, as: as, ah: ah, ac: ac, cat: catStr };
    if(window.currentWorkingAiResponse) {
        document.getElementById('wpAiCommentBox').innerHTML = window.currentWorkingAiResponse;
    } else {
        document.getElementById('wpAiCommentBox').innerHTML = '<div class="ai-insight-content" style="color:#64748b;">우측 상단의 <b>분석 요청하기</b> 버튼을 눌러보세요.</div>';
    }
    if(typeof updateCustomSelectTrigger !== 'undefined') updateCustomSelectTrigger();
    var cr = calcStandaloneMetrics(d);
    var teamData = filtered().filter(r=>r.project==='경남 서부의료원');
    var teamCr = calcStandaloneMetrics(teamData);
    var metricKeys = [
        { key: 'ot', val: cr.ot, main: '1-OT', sub: '정시업무' },
        { key: 'shannon', val: cr.shannon || 0, main: 'Shannon', sub: '파편화도' },
        { key: 'hhi', val: cr.hhi || 0, main: 'HHI', sub: '몰입도' },
        { key: 'cv', val: cr.cv || 0, main: 'CV', sub: '안정성' },
        { key: 'hurst', val: cr.hurst || 0, main: 'Hurst', sub: '주도성' },
        { key: 'jaccard', val: cr.jaccard || 0, main: 'Jaccard', sub: '확장성' }
    ];
    var metricsCards = metricKeys.map((m, idx) => {
        var evalObj = INSIGHT_METRICS_INFO[idx].eval(m.val);
        var statusClass = evalObj.s === '좋음' ? 'good' : (evalObj.s === '보통' ? 'warn' : 'danger');
        return `
            <div class="wp-metric-badge">
                <div class="wp-mb-left">
                    <div class="status-dot ${statusClass}"></div>
                    <div class="wp-mb-titles">
                        <div class="wp-mb-maintitle">${m.main}</div>
                        <div class="wp-mb-subtitle">${m.sub}</div>
                    </div>
                </div>
                <span class="val">${m.val.toFixed(2)}</span>
            </div>
        `;
    }).join('');
    document.getElementById('wpHeroMetricsCards').innerHTML = metricsCards;
    dC('wpHeroRadar');
    CH.wpHeroRadar = new Chart(document.getElementById('wpHeroRadar').getContext('2d'), {
        type: 'radar',
        data: {
            labels: INSIGHT_RADAR_LABELS,
            datasets: [
                { data: [cr.ot, cr.shannon, cr.hhi, cr.cv, cr.hurst, cr.jaccard], borderColor: c, backgroundColor: hRgba(c, 0.15), borderWidth: 2, pointBackgroundColor: c, pointRadius: 3, order: 1 },
                { data: [teamCr.ot, teamCr.shannon, teamCr.hhi, teamCr.cv, teamCr.hurst, teamCr.jaccard], borderColor: '#94a3b8', backgroundColor: 'transparent', borderWidth: 1.5, borderDash: [3,3], pointRadius: 0, order: 2 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, clip: false, layout:{padding:25}, plugins: { legend: { display: false }, datalabels: { display: cx=>cx.datasetIndex===0, color: c, font: {size:9, weight:'bold'}, formatter: v=>v.toFixed(2), anchor:'end', align:'end' }, tooltip: { displayColors: false, callbacks: { label: cx => cx.raw.toFixed(2) } } }, scales: { r: { min: 0, max: 1.2, ticks: { display: false }, pointLabels: { font: {size:8, weight:'800'}, color: '#64748b' } } } }
    });
    safeRender(function(){renderWpStackedBar(d,mo);});
    safeRender(function(){renderWpHeatmapYear('2024');});
    safeRender(function(){renderWpDonutSub(d,pm);});
    safeRender(function(){renderWpDonutCat(d,pm);});
    safeRender(function(){renderWpSwitchBar(d,mo,c);});
    var da2=Array.from(new Set(d.map(r=>r.date))).sort();
    safeRender(function(){renderAdvancedMetrics(d,da2,c,'wp');});
    safeRender(function(){renderWpFocusBar(d,mo);});
    safeRender(function(){renderWpOvertimeDetail(d);});
    safeRender(function(){renderWpGini(d,c);});
}
function renderWpStackedBar(d,mos){
    dC('wpStackedBar');
    var sm=grp(d,'sub'),sl=Object.entries(sm).sort((a,b)=>b[1]-a[1]).map(x=>String(x[0])).slice(0,8),mm={};
    d.forEach(r=>{if(!mm[r.date.slice(0,7)])mm[r.date.slice(0,7)]={};mm[r.date.slice(0,7)][r.sub]=(mm[r.date.slice(0,7)][r.sub]||0)+r.min;});
    var lw=document.getElementById('wpStackLegend');
    if(lw)lw.innerHTML=sl.map((s,i)=>'<div class="legend-item '+(hlWpSub!==null&&hlWpSub!==s?'dimmed':'')+'" style="font-size:11px;padding:2px 5px;" onclick="dTogWpSub(\''+s.replace(/'/g,"\\'")+'\')"><div class="legend-dot" style="background:'+SUB_PAL[i]+'"></div>'+s+'</div>').join('');
    CH.wpStackedBar=new Chart(document.getElementById('wpStackedBar').getContext('2d'),{
        data:{ labels:mos, datasets:sl.map((s,i)=>({ type:'bar', label:s, data:mos.map(m=>mToH((mm[m]||{})[s]||0)), backgroundColor:(hlWpSub===null||hlWpSub===s)?SUB_PAL[i]:'#e2e8f0', stack:'s' })) },
        options:{ responsive:true, maintainAspectRatio:false, clip:false, layout:{padding:{top:30}}, interaction: { mode: 'nearest', intersect: true }, plugins:{ legend:{display:false}, tooltip: { mode: 'nearest', intersect: true }, datalabels: { display: function(cx) { if (hlWpSub === null) { var maxIdx = -1; for(var i = cx.chart.data.datasets.length - 1; i >= 0; i--) { if(cx.chart.data.datasets[i].data[cx.dataIndex] > 0) { maxIdx = i; break; } } return cx.datasetIndex === maxIdx; } else { return cx.dataset.label === hlWpSub && cx.dataset.data[cx.dataIndex] > 0; } }, formatter: function(v, cx) { if (hlWpSub === null) { var sum = 0; cx.chart.data.datasets.forEach(ds=>{ sum += ds.data[cx.dataIndex] || 0; }); return sum > 0 ? fmt(sum) + 'h' : ''; } else { return v > 0 ? fmt(v) + 'h' : ''; } }, anchor: 'end', align: 'end', color: '#64748b', font: {size: 10, weight: 'bold'} } }, scales:{ x:{stacked:true,grid:{display:false}}, y:{stacked:true,grid:{color:'rgba(226,232,240,0.5)'}, grace:'15%'} }, onClick:function(e,els){if(els.length)dTogWpSub(CH.wpStackedBar.data.datasets[els[0].datasetIndex].label);else dTogWpSub(null);} }
    });
}
function renderWpDonutSub(d,t){
    dC('wpDonutSub'); var sm=grp(d,'sub'),ta=Object.entries(sm).sort((a,b)=>b[1]-a[1]);
    document.getElementById('wpDonutSubCenter').innerText=fH(t)+'h';
    if(!ta.length){document.getElementById('wpSubRankList').innerHTML='<li style="color:#94a3b8;font-size:12px;text-align:center;">데이터 없음</li>';return;}
    document.getElementById('wpSubRankList').innerHTML=ta.slice(0,7).map((e,i)=>{var k=String(e[0]),v=e[1],p=t>0?(v/t*100).toFixed(1):0;return '<li class="top5-rank-item '+(hlWpSub!==null&&hlWpSub!==k?'dimmed':'')+'" style="cursor:pointer;padding:2px 4px;" onclick="dTogWpSub(\''+k.replace(/'/g,"\\'")+'\')"><div class="top5-rank-badge" style="background:'+SUB_PAL[i]+';width:18px;height:18px;font-size:9px;">'+(i+1)+'</div><span class="top5-rank-name" style="font-size:11px;">'+k+'</span><span style="font-size:10px;color:#94a3b8;white-space:nowrap;">'+p+'%</span></li>';}).join('');
    CH.wpDonutSub=new Chart(document.getElementById('wpDonutSub').getContext('2d'),{
        type:'doughnut', data:{labels:ta.slice(0,7).map(e=>String(e[0])),datasets:[{data:ta.slice(0,7).map(e=>mToH(e[1])),backgroundColor:ta.slice(0,7).map((e,i)=>(hlWpSub===null||hlWpSub===String(e[0]))?SUB_PAL[i]:'#e2e8f0'),borderWidth:2,borderColor:'#fff'}]},
        options:{ responsive:true,maintainAspectRatio:false,cutout:'50%',clip:false,layout:{padding:35}, interaction: { mode: 'nearest', intersect: true }, plugins:{legend:{display:false},datalabels:{display:function(cx){return (cx.dataset.data[cx.dataIndex]/mToH(t)*100)>=5;},color:'#1e293b',font:{size:10,weight:'bold'},anchor:'end',align:'end',textAlign:'center',formatter:function(v,cx){var p=(v/mToH(t)*100).toFixed(0);return ta[cx.dataIndex][0]+'\n'+p+'%';}}}, onClick:function(e,els){if(els.length)dTogWpSub(CH.wpDonutSub.data.labels[els[0].index]);else dTogWpSub(null);} }
    });
}
function renderWpDonutCat(d,t){
    dC('wpDonutCat');var cm=grp(d,'cat'),ca=CAT_ORDER.filter(c=>cm[c]>0);
    document.getElementById('wpCatCenter').innerHTML='<div style="font-size:18px;font-weight:900;color:#1e293b;">'+fH(t)+'h</div><div style="font-size:12px;color:#94a3b8;">분류기준</div>';if(!ca.length)return;
    CH.wpDonutCat=new Chart(document.getElementById('wpDonutCat').getContext('2d'),{
        type:'doughnut', data:{labels:ca,datasets:[{data:ca.map(c=>mToH(cm[c])),backgroundColor:ca.map(c=>CAT_COLORS[CAT_ORDER.indexOf(c)]),borderWidth:2,borderColor:'#fff'}]},
        options:{ responsive:true,maintainAspectRatio:false,cutout:'60%',clip:false,layout:{padding:40}, interaction: { mode: 'nearest', intersect: true }, plugins:{legend:{display:false},datalabels:{display:function(cx){return (cx.dataset.data[cx.dataIndex]/mToH(t)*100)>=5;},color:'#1e293b',font:{size:11,weight:'bold'},anchor:'end',align:'end',textAlign:'center',formatter:function(v,cx){var p=(v/mToH(t)*100).toFixed(0);return ca[cx.dataIndex]+'\n'+p+'%';}}} }
    });
}
function renderWpSwitchBar(d,mos,col){
    dC('wpSwitchBar');var sw={},pv=null;d.forEach(r=>{var m=r.date.slice(0,7);if(!sw[m])sw[m]=0;if(pv!==null&&pv!==r.sub)sw[m]++;pv=r.sub;});
    var teamData = filtered().filter(r=>r.project==='경남 서부의료원');
    var teamSw={}, teamPv={}, act={};
    teamData.forEach(r=>{ var m=r.date.slice(0,7); if(!teamSw[m])teamSw[m]=0; if(!act[m])act[m]=new Set(); act[m].add(r.name); if(teamPv[r.name]!==null && teamPv[r.name]!==r.sub) teamSw[m]++; teamPv[r.name]=r.sub; });
    var barData = mos.map(m=>sw[m]||0);
    var avgData = mos.map(m=> act[m]&&act[m].size>0 ? parseFloat((teamSw[m]/act[m].size).toFixed(1)) : null);
    CH.wpSwitchBar=new Chart(document.getElementById('wpSwitchBar').getContext('2d'),{
        data:{labels:mos,datasets:[
            {type:'bar', label:'개인 전환 횟수', data:barData, backgroundColor:col, borderRadius:6, order:2},
            {type:'line', label:'팀 평균', data:avgData, borderColor:'#94a3b8', backgroundColor:'transparent', borderDash:[3,3], borderWidth:1.5, pointRadius:3, pointBackgroundColor:'#94a3b8', pointBorderColor:'#fff', order:1}
        ]},
        options:{
            responsive:true,maintainAspectRatio:false,clip:false,layout:{padding:{top:30}},
            interaction: { mode: 'index', intersect: false },
            plugins:{
                legend:{ display:true, position:'top', align:'end', labels:{usePointStyle:true, boxWidth:8, font:{size:10, weight:'bold'}} },
                datalabels:{
                    display: cx => cx.raw !== null && cx.raw > 0,
                    color: cx => cx.dataset.type==='bar'?'#fff':'#64748b',
                    font: {weight:'bold',size:10},
                    anchor: cx => {
                        var bVal = barData[cx.dataIndex] || 0;
                        var lVal = avgData[cx.dataIndex] || 0;
                        var diff = Math.abs(bVal - lVal);
                        if(cx.dataset.type === 'bar') return diff < 1.5 ? 'center' : 'end';
                        return diff < 1.5 ? 'end' : 'start';
                    },
                    align: cx => {
                        var bVal = barData[cx.dataIndex] || 0;
                        var lVal = avgData[cx.dataIndex] || 0;
                        var diff = Math.abs(bVal - lVal);
                        if(cx.dataset.type === 'bar') return diff < 1.5 ? 'center' : 'bottom';
                        return 'top';
                    },
                    offset: cx => cx.dataset.type==='bar' ? 2 : 6,
                    formatter: v => v
                }
            },
            scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'rgba(226,232,240,0.5)'}, grace:'20%'}}
        }
    });
}
function renderWpFocusBar(d,mos){
    dC('wpFocusBar');
    var nonFocus = ['회의', '행정', '교육', '휴가', '기타', '관리', '업무지원'];
    var mf={},mt={}; mos.forEach(m=>{mf[m]=0;mt[m]=0;});
    d.forEach(r=>{ var m=r.date.slice(0,7); if(mt[m]===undefined)return; var isFocus = !nonFocus.some(k=>r.sub.includes(k)||r.cat.includes(k)); if(isFocus)mf[m]+=r.min; mt[m]+=r.min; });
    CH.wpFocusBar=new Chart(document.getElementById('wpFocusBar').getContext('2d'),{
        type:'line', data:{ labels:mos, datasets:[ { label:'집중업무 비율(%)', data:mos.map(m=>mt[m]>0?(mf[m]/mt[m]*100):0), borderColor:'#00428E', backgroundColor:hRgba('#00428E',0.1), borderWidth:2, fill:true, tension:0.3, pointRadius:4, pointBackgroundColor:'#00428E' } ] },
        options:{ responsive:true, maintainAspectRatio:false, clip:false, layout:{padding:{top:30}}, plugins:{ legend:{display:false}, datalabels:{display:cx=>mos.length>10?cx.dataIndex%2===0:true, formatter:v=>v.toFixed(1)+'%', align:'top', font:{size:10, weight:'bold'}, color:'#00428E'} }, scales:{ x:{grid:{display:false}}, y:{min: 0, max: 110, grid:{color:'rgba(226,232,240,0.5)'}, ticks:{callback:v=>v > 100 ? '' : v+'%'}} } }
    });
}
function renderWpOvertimeDetail(d){
    dC('wpOtBar'); var dm={}; d.forEach(r=>{dm[r.date]=(dm[r.date]||0)+r.min;});
    var od=Object.entries(dm).filter(e=>e[1]>=540).sort((a,b)=>a[0].localeCompare(b[0]));
    var mo=Array.from(new Set(od.map(e=>e[0].slice(0,7)))).sort();
    var ct={'9~10h':[],'10~11h':[],'11~12h':[],'12h 이상':[]};
    mo.forEach(m=>{ var c1=0,c2=0,c3=0,c4=0; od.forEach(e=>{ if(!e[0].startsWith(m))return; var n=e[1]; if(n<600)c1++; else if(n<660)c2++; else if(n<720)c3++; else c4++; }); ct['9~10h'].push(c1); ct['10~11h'].push(c2); ct['11~12h'].push(c3); ct['12h 이상'].push(c4); });
    var teamData = filtered().filter(r=>r.project==='경남 서부의료원');
    var teamDm = {};
    teamData.forEach(r => { var key = r.name + '|' + r.date; teamDm[key] = (teamDm[key]||0) + r.min; });
    var teamMonthlyOtCount = {}; var teamMonthlyActiveMembers = {};
    Object.entries(teamDm).forEach(e => {
        var name = e[0].split('|')[0]; var date = e[0].split('|')[1]; var m = date.slice(0,7);
        if(!teamMonthlyActiveMembers[m]) teamMonthlyActiveMembers[m] = new Set();
        teamMonthlyActiveMembers[m].add(name);
        if(e[1] >= 540) { teamMonthlyOtCount[m] = (teamMonthlyOtCount[m]||0) + 1; }
    });
    var teamAvgData = mo.map(m => {
        var membersCount = teamMonthlyActiveMembers[m] ? teamMonthlyActiveMembers[m].size : 0;
        if(membersCount === 0) return null;
        var otCount = teamMonthlyOtCount[m] || 0;
        return parseFloat((otCount / membersCount).toFixed(1));
    });
    var bd = ['9~10h','10~11h','11~12h','12h 이상'];
    document.getElementById('wpOtLegendWrap').innerHTML = bd.map((b, i) => '<div class="legend-item ' + (hlWpOt!==null && hlWpOt!==b ? 'dimmed' : '') + '" onclick="dTogWpOt(\''+b+'\')"><div class="legend-dot" style="background:'+OT_COLORS[i]+'"></div><span style="font-size:11px;">'+b+'</span></div>').join('') + '<div class="legend-item"><div class="legend-dot" style="background:transparent; border-top:2px dashed #94a3b8; height:0; width:12px;"></div><span style="font-size:11px;">팀 평균</span></div>';
    CH.wpOtBar=new Chart(document.getElementById('wpOtBar').getContext('2d'),{
        data:{
            labels:mo,
            datasets:[
                {type:'bar', label:'9~10h', data:ct['9~10h'], backgroundColor: (hlWpOt===null||hlWpOt==='9~10h')?OT_COLORS[0]:'#e2e8f0', stack:'S', borderRadius:2, order:2},
                {type:'bar', label:'10~11h', data:ct['10~11h'], backgroundColor: (hlWpOt===null||hlWpOt==='10~11h')?OT_COLORS[1]:'#e2e8f0', stack:'S', borderRadius:2, order:2},
                {type:'bar', label:'11~12h', data:ct['11~12h'], backgroundColor: (hlWpOt===null||hlWpOt==='11~12h')?OT_COLORS[2]:'#e2e8f0', stack:'S', borderRadius:2, order:2},
                {type:'bar', label:'12h 이상', data:ct['12h 이상'], backgroundColor: (hlWpOt===null||hlWpOt==='12h 이상')?OT_COLORS[3]:'#e2e8f0', stack:'S', borderRadius:2, order:2},
                {type:'line', label:'팀 평균', data:teamAvgData, borderColor:'#94a3b8', backgroundColor:'transparent', borderDash:[3,3], borderWidth:1.5, pointRadius:3, pointBackgroundColor:'#94a3b8', pointBorderColor:'#fff', order:1}
            ]
        },
        options:{
            responsive:true, maintainAspectRatio:false, clip:false, layout:{padding:{top:30}},
            interaction: { mode: 'index', intersect: false },
            plugins:{
                legend:{display:false},
                datalabels:{
                    display: function(cx){
                        if(cx.dataset.type === 'line') return cx.raw !== null && cx.raw > 0;
                        if(hlWpOt === null) { var maxIdx = -1; for(var i = 3; i >= 0; i--) { if(cx.chart.data.datasets[i].data[cx.dataIndex] > 0) { maxIdx = i; break; } } return cx.datasetIndex === maxIdx; }
                        else { return cx.dataset.label === hlWpOt && cx.dataset.data[cx.dataIndex] > 0; }
                    },
                    color: cx => cx.dataset.type === 'line' ? '#64748b' : (hlWpOt === null ? '#1e293b' : '#fff'),
                    font: {size:10, weight:'bold'},
                    anchor: cx => cx.dataset.type === 'line' ? 'end' : (hlWpOt === null ? 'end' : 'center'),
                    align: cx => cx.dataset.type === 'line' ? 'top' : (hlWpOt === null ? 'end' : 'center'),
                    offset: cx => cx.dataset.type === 'line' ? 6 : (hlWpOt === null ? 4 : 0),
                    formatter: function(v, cx){
                        if(cx.dataset.type === 'line') return v;
                        if(hlWpOt === null) { var sum=0; for(var i=0; i<=3; i++){ sum += cx.chart.data.datasets[i].data[cx.dataIndex]||0; } return sum>0?sum:''; }
                        else return v>0?v:'';
                    }
                }
            },
            scales:{ x:{stacked:true, grid:{display:false}, ticks:{font:{size:11}}}, y:{stacked:true, display:false, grace:'20%'} },
            onClick: (e,els)=>{ if(els.length && els[0].datasetIndex <= 3) dTogWpOt(CH.wpOtBar.data.datasets[els[0].datasetIndex].label); else dTogWpOt(null); }
        }
    });
}
function renderWpGini(d,c){
    dC('wpGiniChart');var dm={};d.forEach(r=>{dm[r.date]=(dm[r.date]||0)+r.min;});var vl=Object.values(dm).sort((a,b)=>a-b),n=vl.length,gn=0;if(n>1){var sm=vl.reduce((a,b)=>a+b,0),cs=0;vl.forEach(v=>{cs+=v;gn+=cs;});gn=(2*gn/(n*sm))-(n+1)/n;}var lz=[{x:0,y:0}],cmv=0,tv=vl.reduce((a,b)=>a+b,0)||1;vl.forEach((v,i)=>{cmv+=v;lz.push({x:(i+1)/n,y:cmv/tv});});
    CH.wpGiniChart=new Chart(document.getElementById('wpGiniChart').getContext('2d'),{type:'line',data:{datasets:[{label:'로렌츠 커브',data:lz,borderColor:c,backgroundColor:hRgba(c,0.1),borderWidth:2,fill:true,tension:0,pointRadius:0},{label:'완전균등선',data:[{x:0,y:0},{x:1,y:1}],borderColor:'#94a3b8',borderDash:[4,4],borderWidth:1,fill:false,tension:0,pointRadius:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},datalabels:{display:false}},scales:{x:{type:'linear',min:0,max:1,ticks:{maxTicksLimit:5,callback:v=>(v*100).toFixed(0)+'%'}},y:{min:0,max:1,ticks:{maxTicksLimit:5,callback:v=>(v*100).toFixed(0)+'%'}}}}});
    var gl=gn<0.3?'균등 분배':gn<0.5?'보통':gn<0.7?'편중':'심한 편중';
    document.getElementById('wpGiniTxt').innerHTML='지니계수: <b style="color:'+c+';">'+gn.toFixed(3)+'</b> <span style="color:#94a3b8;">('+gl+')</span>';
}
function buildHeatmapHTML(dt,yr,c,tid){
    var dm={};dt.filter(r=>r.date.startsWith(yr+'-')).forEach(r=>{dm[r.date]=(dm[r.date]||0)+r.min;});var mt=Array.from({length:6},()=>new Array(12).fill(0)),hm=new Array(12).fill(false),mx=1;Object.keys(dm).forEach(d=>{var s=dm[d],p=d.split('-'),m=parseInt(p[1])-1,dy=parseInt(p[2]),fd=new Date(parseInt(yr),m,1).getDay(),w=Math.ceil((dy+fd)/7)-1;if(w>=0&&w<6){mt[w][m]+=s;hm[m]=true;if(mt[w][m]>mx)mx=mt[w][m];}});var th='<thead><tr><th style="width:30px;"></th>';MONTH_KO.forEach((l,i)=>{th+='<th style="font-size:11px;font-weight:'+(hm[i]?'800':'500')+';color:'+(hm[i]?c:'#cbd5e1')+';">'+l+'</th>';});th+='</tr></thead><tbody>';for(var w=0;w<6;w++){th+='<tr><td style="font-size:10px;font-weight:700;color:#94a3b8;text-align:right;padding-right:6px;">'+(w+1)+'주</td>';for(var mo=0;mo<12;mo++){if(!hm[mo])th+='<td><div class="hm-cell" style="background:transparent;"></div></td>';else if(mt[w][mo]<=0)th+='<td><div class="hm-cell" style="background:#F0F5FA;opacity:'+(hlHeatBin!==null?0.2:1)+';"></div></td>';else{var vl=mt[w][mo],rt=vl/mx,bn=Math.ceil(rt*5),id=hlHeatBin!==null&&hlHeatBin!==bn,al=0.2+(bn-1)*0.2,tc=al>=0.55?'#fff':'#1e293b';th+='<td><div class="hm-cell" onclick="toggleHeatBin('+bn+',\''+yr+'\',\''+tid+'\')" style="background:'+hRgba(c,al)+';color:'+tc+';opacity:'+(id?0.2:1)+';" title="'+fH(vl)+'h">'+fH(vl)+'</div></td>';}}th+='</tr>';}var el=document.getElementById(tid);if(el)el.innerHTML=th+'</tbody>';
}
function renderAdvancedMetrics(d,da,col,pf){
    try {
        dC(pf+'ShannonChart');dC(pf+'HhiChart');dC(pf+'JaccardChart');dC(pf+'CvChart');dC(pf+'HurstChart');dC(pf+'OtChart');
        if(!d||d.length===0)return;
        var cr = calcStandaloneMetrics(d);
        var cvInsight = [cr.ot, (cr.shannon||0), (cr.hhi||0), (cr.cv||0), (cr.hurst||0), (cr.jaccard||0)];
        var rawCvInsight = [cr.ot, (cr.shannon||0), (cr.hhi||0), cr.cv||0, cr.hurst||0, cr.jaccard||0];
        var teamRawCvInsight = [0,0,0,0,0,0], teamCvInsight = [0,0,0,0,0,0];
        var datasetsArr = [{ label: '선택 기간', data: cvInsight, borderColor: col, backgroundColor: hRgba(col, 0.15), borderWidth: 2, pointBackgroundColor: col, pointBorderColor: '#fff', pointBorderWidth: 1, pointRadius: 3, pointHoverRadius: 5 }];
        if (pf === 'wp' || pf === 'pj') {
            var teamData = filtered().filter(r=>r.project==='경남 서부의료원');
            var teamCr = calcStandaloneMetrics(teamData);
            teamCvInsight = [teamCr.ot, (teamCr.shannon||0), (teamCr.hhi||0), (teamCr.cv||0), (teamCr.hurst||0), (teamCr.jaccard||0)];
            teamRawCvInsight = [teamCr.ot, (teamCr.shannon||0), (teamCr.hhi||0), teamCr.cv||0, teamCr.hurst||0, teamCr.jaccard||0];
            datasetsArr.push({ label: '팀 전체 평균', data: teamCvInsight, borderColor: '#94a3b8', backgroundColor: 'transparent', borderWidth: 1, borderDash: [3, 3], pointRadius: 0, pointHoverRadius: 0 });
        }
        dC(pf + 'InsightRadar');
        if(document.getElementById(pf + 'InsightRadar')) {
            CH[pf + 'InsightRadar'] = new Chart(document.getElementById(pf + 'InsightRadar').getContext('2d'), {
                type: 'radar', data: { labels: INSIGHT_RADAR_LABELS, datasets: datasetsArr },
                options: { responsive: true, maintainAspectRatio: false, clip: false, layout: { padding: 40 }, plugins: { legend: { display: false }, datalabels: { display: cx => cx.datasetIndex === 0, formatter: v => Number(v).toFixed(2), color: col, font: { size: 10, weight: 'bold' }, anchor: 'end', align: 'end' }, tooltip: { callbacks: { label: cx => cx.datasetIndex === 0 ? cx.dataset.label + ': ' + Number(rawCvInsight[cx.dataIndex]).toFixed(2) : cx.dataset.label + ': ' + Number(teamRawCvInsight[cx.dataIndex]).toFixed(2) } } }, scales: { r: { min: 0, max: 1.2, ticks: { display: false }, pointLabels: { font: {size:10, weight:'800'}, color: '#64748b', padding: 15 } } } }
            });
        }
        var tb = document.getElementById(pf + 'InsightTable');
        if(tb) {
            var tableHtml = '<table style="width:100%; border-collapse:collapse; margin-top:5px; table-layout:fixed;">';
            if (pf === 'wp') {
                tableHtml += '<thead><tr style="border-bottom:2px solid #e2e8f0; color:#64748b; font-size:11px;"><th style="padding:6px 2px; text-align:left; width:22%;">지표명</th><th style="padding:6px 2px; text-align:center; width:13%;">현재값</th><th style="padding:6px 2px; text-align:center; width:15%;">진단</th><th style="padding:6px 6px; text-align:left; width:50%;">값 해석 (목표 및 설명)</th></tr></thead><tbody>';
                for (var idx = 0; idx < INSIGHT_METRICS_INFO.length; idx++) {
                    var info = INSIGHT_METRICS_INFO[idx], val = rawCvInsight[idx], evalResult = info.eval(val);
                    tableHtml += '<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:8px 2px; font-weight:800; color:#334155; font-size:11px; vertical-align:top;">' + info.name + '</td><td style="padding:8px 2px; text-align:center; font-weight:900; color:' + col + '; font-size:13px; vertical-align:top;">' + Number(val).toFixed(2) + '</td><td style="padding:8px 2px; text-align:center; vertical-align:top;">  <span style="background:'+evalResult.c+'15; color:'+evalResult.c+'; padding:3px 6px; border-radius:4px; font-size:10px; font-weight:800; display:inline-block;">'+evalResult.i+' '+evalResult.s+'</span></td><td style="padding:8px 6px; font-size:11px; color:#64748b; line-height:1.4; word-break:keep-all; vertical-align:top;">  <span style="color:#4f46e5; font-weight:700;">[목표: '+info.target+']</span><br>' + evalResult.t + '</td></tr>';
                }
            } else {
                tableHtml += '<thead><tr style="border-bottom:2px solid #e2e8f0; color:#64748b; font-size:12px;"><th style="padding:10px 4px; text-align:left; width:22%;">지표명</th><th style="padding:10px 4px; text-align:center; width:15%;">현재값</th><th style="padding:10px 10px; text-align:left; width:63%;">성격 및 진단</th></tr></thead><tbody>';
                for (var idx = 0; idx < INSIGHT_METRICS_INFO.length; idx++) {
                    var info = INSIGHT_METRICS_INFO[idx], val = rawCvInsight[idx], evalResult = info.eval(val);
                    tableHtml += '<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:15px 4px; font-weight:800; color:#334155; font-size:12px; vertical-align:top;">' + info.name + '</td><td style="padding:15px 4px; text-align:center; font-weight:900; color:' + col + '; font-size:14px; vertical-align:top;">' + Number(val).toFixed(2) + '</td><td style="padding:15px 10px; vertical-align:top;">  <div style="font-size:12px; font-weight:800; color:#1e293b; margin-bottom:8px;">' + info.name + ' <span style="font-size:10px; color:#4f46e5; font-weight:700;">[목표: '+info.target+']</span></div>  <div style="display:flex; align-items:flex-start; gap:6px;">    <span style="background:'+evalResult.c+'15; color:'+evalResult.c+'; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:800; flex-shrink:0; margin-top:1px;">'+evalResult.i+' '+evalResult.s+'</span>    <div style="font-size:12px; color:#64748b; line-height:1.5;">' + evalResult.t + '</div>  </div></td></tr>';
                }
            }
            tableHtml += '</tbody></table>'; tb.innerHTML = tableHtml;
        }
        var wm={},bwm={};
        d.forEach(r=>{
            var wi=getWeekInfo(r.date);
            if(!wm[wi.key1])wm[wi.key1]={l:wi.label1,r:[],d:new Set()}; wm[wi.key1].r.push(r);wm[wi.key1].d.add(r.date);
            if(!bwm[wi.key2])bwm[wi.key2]={l:wi.label2,r:[],d:new Set()}; bwm[wi.key2].r.push(r);bwm[wi.key2].d.add(r.date);
        });
        var wk=Object.keys(wm).sort(), bwk=Object.keys(bwm).sort();
        var wl=[], bwl=[], sd=[], hd=[], od=[], cd=[], hud=[], jd=[];
        var ss=new Array(wk.length).fill(null), sh=new Array(wk.length).fill(null), so=new Array(wk.length).fill(null);
        var sc=new Array(bwk.length).fill(null), shu=new Array(bwk.length).fill(null), sj=new Array(bwk.length).fill(null);
        wk.forEach((k,i)=>{
            var g=wm[k]; wl.push(g.l);
            var tot=g.r.reduce((s,r)=>s+r.min,0)||1; var sm=grp(g.r,'sub'), hi=0, sn=0, ky=Object.keys(sm), N=ky.length;
            ky.forEach(sub=>{var p=sm[sub]/tot; hi+=p*p; if(p>0)sn-=p*Math.log(p);}); if(N>1) sn=sn/Math.log(N); else sn=0;
            var weeklyPts = 0, weeklyCount = 0, dailyHours = {};
            g.r.forEach(r=>{ var dk = r.name + '|' + r.date; dailyHours[dk] = (dailyHours[dk]||0) + r.min; });
            Object.values(dailyHours).forEach(mins=>{
                var hrs = mins / 60, pt = 0;
                if(hrs >= 12) { pt = 0.45; weeklyCount++; } else if(hrs >= 11) { pt = 0.32; weeklyCount++; } else if(hrs >= 10) { pt = 0.20; weeklyCount++; } else if(hrs >= 9) { pt = 0.08; weeklyCount++; }
                weeklyPts += pt;
            });
            var F = 1.0;
            if(weeklyCount === 2) F = 1.25; else if(weeklyCount === 3) F = 1.50; else if(weeklyCount >= 4) F = 2.0;
            var x = weeklyPts * F, p = 2 - (2 / (1 + Math.exp(-2.0 * x)));
            sd.push(sn); hd.push(hi); od.push(p);
            var ws=[]; Array.from(g.d).forEach(dt2 => { ws=ws.concat((typeof SCHEDULE_DATA !== 'undefined' ? SCHEDULE_DATA : []).filter(s => s.date&&s.date.slice(0,10)===dt2)); });
            if(ws.length>0){ var st = ws.map(s => '• '+s.date.slice(2,10).replace(/-/g,'.')+'. '+(s.title||s.name||s['일정']||s['내용']||'일정').replace(/[\u1000-\uFFFF]+/g,'').trim()); ss[i]={schTitle:st}; sh[i]={schTitle:st}; so[i]={schTitle:st}; }
        });
        var ps=new Set();
        bwk.forEach((k,i)=>{
            var g=bwm[k]; bwl.push(g.l);
            var dt=grp(g.r,'date'), vl=Object.values(dt), m=vl.length>0 ? vl.reduce((a,b)=>a+b,0)/vl.length : 0;
            var cv=m===0 ? 0 : Math.sqrt(vl.reduce((a,b)=>a+Math.pow(b-m,2),0)/vl.length)/m; var cn=Math.max(0,1-(cv/2.0));
            var hs=0.5, nh=vl.length;
            if(nh>=3 && m>0){ var dv=vl.map(v=>v-m), cm=[], cs=0; dv.forEach(v=>{cs+=v; cm.push(cs);}); var R=Math.max.apply(null,cm)-Math.min.apply(null,cm), S=Math.sqrt(vl.reduce((a,v)=>a+Math.pow(v-m,2),0)/nh)||1; if(R>0) hs=Math.min(Math.max(Math.log(R/S)/Math.log(nh/2),0.01),0.99); }
            var cs2=new Set(Object.keys(grp(g.r,'sub'))), it=0; cs2.forEach(x => {if(ps.has(x))it++;});
            var un=new Set([...ps,...cs2]).size, jc=un===0?0:it/un; ps=cs2; cd.push(cn); hud.push(hs); jd.push(jc);
            var bs=[]; Array.from(g.d).forEach(dt2 => { bs=bs.concat((typeof SCHEDULE_DATA !== 'undefined' ? SCHEDULE_DATA : []).filter(s => s.date&&s.date.slice(0,10)===dt2)); });
            if(bs.length>0){ var st = bs.map(s => '• '+s.date.slice(2,10).replace(/-/g,'.')+'. '+(s.title||s.name||s['일정']||s['내용']||'일정').replace(/[\u1000-\uFFFF]+/g,'').trim()); sc[i]={schTitle:st}; shu[i]={schTitle:st}; sj[i]={schTitle:st}; }
        });
        function dmc(id, l, xl, da, sa, cx) {
            if(!document.getElementById(id)) return;
            try {
                var sa2 = sa.map(x => x===null ? null : 1.1);
                var cfg = { type:'line', label:'주요일정', data:sa2, backgroundColor:'transparent', borderColor:'transparent', showLine:false, pointRadius: cx2 => cx2.raw!==null ? 6 : 0, pointHoverRadius: 8, pointBackgroundColor:'#ef4444', pointBorderColor:'#fff', pointBorderWidth:1.5, isSchedule:true, order:0, spanGaps:false };
                CH[id] = new Chart(document.getElementById(id).getContext('2d'),{
                    type:'line', data:{labels:xl, datasets:[{data:da, label:l, borderColor:cx, backgroundColor:hRgba(cx,0.1), borderWidth:2, fill:true, tension:0.3, pointRadius:0, pointHoverRadius:4, order:1}, cfg]},
                    options:{ responsive:true, maintainAspectRatio:false, layout:{padding:{top:25}}, interaction:{mode:'index',intersect:false}, plugins:{ legend:{display:false}, datalabels:{display:false}, tooltip:{ displayColors:false, filter: (it,i,its) => { var hs=its.some(x=>x.dataset.isSchedule&&x.raw!==null); if(hs)return it.dataset.isSchedule; return !it.dataset.isSchedule; }, callbacks:{ title: cx => cx[0].dataset.isSchedule ? null : (Array.isArray(cx[0].label) ? cx[0].label.join(' ') : cx[0].label), label: cx => cx.dataset.isSchedule ? sa[cx.dataIndex].schTitle : cx.dataset.label+': '+(cx.raw!=null ? Number(cx.raw).toFixed(2) : '0.00') } } }, scales:{ x:{grid:{display:false}, ticks:{maxTicksLimit:10,font:{size:9}}}, y:{ grid:{color:'rgba(226,232,240,0.5)'}, min:0, max: 1.2, ticks: { callback: val => val > 1.01 ? '' : Number(val).toFixed(1) } } } }
                });
            } catch(e) {}
        }
        dmc(pf+'OtChart','정시업무(1-OT)',wl,od,so,'#ef4444'); dmc(pf+'ShannonChart','Shannon',wl,sd,ss,'#14b8a6'); dmc(pf+'HhiChart','HHI',wl,hd,sh,'#f59e0b'); dmc(pf+'CvChart','CV(Norm)',bwl,cd,sc,'#8b5cf6'); dmc(pf+'HurstChart','Hurst',bwl,hud,shu,'#ec4899'); dmc(pf+'JaccardChart','Jaccard',bwl,jd,sj,'#3b82f6');
    } catch(e) {}
}
function renderEvalTab() {
    var m = GLOBAL_MEMBER === 'ALL' ? MEMBERS[0] : GLOBAL_MEMBER;
    if (!m) return;
    var view = document.getElementById('view-kpieval');
    var ed = EVAL_DATA.filter(d=>d.name === m);
    var sortedEd = ed.slice().sort((a,b)=>a.q.localeCompare(b.q));
    var fq = filteredEvalQs();
    var fd = ed.filter(d=>fq.includes(d.q)).sort((a,b)=>a.q.localeCompare(b.q));
    var wd = filtered().filter(r=>r.name === m && r.project === '경남 서부의료원');
    var pf = RAW.find(r=>r.name === m), po = pf ? pf.pos : '';
    var c = MC[m] || '#00428E';
    dC('newKpiTrendChart'); dC('newKpiRadarChart'); dC('newKpiDonutChart'); dC('kpiInsightRadar');
    var hasEval = fd.length > 0;
    var latestQ = hasEval ? fd[fd.length - 1] : { q: '평가 없음', vals: [0,0,0,0,0] };
    var latestScore = latestQ.vals.reduce((a,b)=>a+b,0) / 5;
    var avgVals = ed.length > 0 ? RADAR_LABELS.map((_, i) => ed.reduce((s, d) => s + d.vals[i], 0) / ed.length) : [0,0,0,0,0];
    var avgScore = ed.length > 0 ? avgVals.reduce((a,b)=>a+b,0) / 5 : 0;
    var allEvalAvgVals = EVAL_DATA.length > 0 ? RADAR_LABELS.map((_, i) => EVAL_DATA.reduce((s, d) => s + d.vals[i], 0) / EVAL_DATA.length) : [0,0,0,0,0];
    var t = wd.reduce((s, r) => s + r.min, 0);
    var dm = {}; wd.forEach(r => dm[r.date] = (dm[r.date] || 0) + r.min);
    var o9 = 0, o12 = 0; Object.values(dm).forEach(x => { if(x >= 720) o12++; else if(x >= 540) o9++; });
    var sm = grp(wd, 'sub');
    var topTasksArr = Object.entries(sm).sort((a,b) => b[1]-a[1]).slice(0, 5);
    var topTasksStr = topTasksArr.slice(0,3).map(tk => tk[0]).join(', ');
    var bestQ = null, bestScore = 0;
    if (ed.length > 0) {
        bestQ = ed.reduce((best, curr) => { var currScore = curr.vals.reduce((a,b)=>a+b,0)/5; var bScore = best.vals.reduce((a,b)=>a+b,0)/5; return currScore >= bScore ? curr : best; });
        bestScore = bestQ.vals.reduce((a,b)=>a+b,0)/5;
    }
    var bestTopTasksHtml = '<div style="color:#94a3b8;font-size:11px;">데이터 없음</div>';
    if (bestQ) {
        var bestWd = RAW.filter(r => r.name === m && r.project === '경남 서부의료원' && getQ(r.date) === bestQ.q);
        var bestSm = grp(bestWd, 'sub');
        var bestTotal = Object.values(bestSm).reduce((a,b)=>a+b,0);
        var bestTopTasks = Object.entries(bestSm).sort((a,b) => b[1]-a[1]).slice(0, 3);
        if (bestTopTasks.length > 0) {
            bestTopTasksHtml = bestTopTasks.map((tk, i) => {
                var p = bestTotal > 0 ? (tk[1]/bestTotal*100).toFixed(1) : 0;
                return '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;"><span style="color:#334155; font-weight:700;">' + (i+1) + '. ' + tk[0] + '</span><span style="color:#64748b; font-weight:800;">' + p + '%</span></div>';
            }).join('');
        }
    }
    var scoreDiff = latestScore - avgScore;
    var scoreDiffHtml = !hasEval ? '<span style="color:#94a3b8">-</span>' : (scoreDiff >= 0 ? '<span style="color:#10b981">▲ ' + scoreDiff.toFixed(2) + '</span>' : '<span style="color:#ef4444">▼ ' + Math.abs(scoreDiff).toFixed(2) + '</span>');
    var topTasksHtml = topTasksArr.length === 0 ? '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">데이터 없음</div>' : topTasksArr.map((tk, i) => { var p = t > 0 ? (tk[1]/t*100).toFixed(1) : 0; return '<div style="display:flex; align-items:center; justify-content:space-between; font-size:12px;"><div style="display:flex; align-items:center; gap:6px;"><div style="width:8px; height:8px; border-radius:50%; background:' + SUB_PAL[i] + '"></div><span style="font-weight:700; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:80px;">' + tk[0] + '</span></div><div style="font-weight:800; color:#64748b;">' + p + '%</div></div>'; }).join('');
    var detailListHtml = '<div class="kpi-detail-container">' + RADAR_LABELS.map((label, i) => {
        var val = latestQ.vals[i]; var avg = avgVals[i]; var diff = val - avg;
        var arrow = !hasEval ? '─' : (diff > 0 ? '▲' : diff < 0 ? '▼' : '─');
        var cls = !hasEval ? 'flat' : (diff > 0.05 ? 'up' : diff < -0.05 ? 'down' : 'flat');
        return '<div class="kpi-detail-item"><div class="label">' + label + '</div><div class="values"><div class="score">' + val.toFixed(1) + '</div><div class="kpi-delta ' + cls + '">' + arrow + ' ' + (!hasEval ? '-' : Math.abs(diff).toFixed(1)) + '</div></div></div>';
    }).join('') + '</div>';
    var currData = RAW.filter(r => r.name === m && getQ(r.date) === latestQ.q && r.project === '경남 서부의료원');
    var teamCurrData = RAW.filter(r => getQ(r.date) === latestQ.q && r.project === '경남 서부의료원');
    var cr = calcStandaloneMetrics(currData);
    var teamCr = calcStandaloneMetrics(teamCurrData);
    var cvInsight = [cr.ot, (cr.shannon||0), (cr.hhi||0), (cr.cv||0), (cr.hurst||0), (cr.jaccard||0)];
    var rawCvInsight = [cr.ot, (cr.shannon||0), (cr.hhi||0), cr.cv||0, cr.hurst||0, cr.jaccard||0];
    var teamCvInsight = [teamCr.ot, (teamCr.shannon||0), (teamCr.hhi||0), (teamCr.cv||0), (teamCr.hurst||0), (teamCr.jaccard||0)];
    var teamRawCvInsight = [teamCr.ot, (teamCr.shannon||0), (teamCr.hhi||0), teamCr.cv||0, teamCr.hurst||0, teamCr.jaccard||0];
    window.currentAiData = { m: m, q: latestQ.q, score: latestScore.toFixed(2), vals: latestQ.vals, topTasks: topTasksStr, over9h: o9, over12h: o12, rawCvInsight: rawCvInsight };
    var aiInitText = window.currentAiResponse || '우측 상단의 <b>분석 요청하기</b> 버튼을 눌러보세요.';
    var splitRadarLabels = INSIGHT_RADAR_LABELS.map(l => l.split('(').map((part, index) => index === 1 ? '('+part : part));
    var html = '<div class="kpi-layout">' +
        '<div class="kpi-panel left-panel"><div class="kpi-profile-header">' + getAvatar(m, 50, 18) + '<div><div style="font-size:24px;font-weight:900;color:#1e293b;line-height:1.2;">' + m + '</div><div style="font-size:13px;color:#64748b;font-weight:600;">' + po + '</div></div></div><div class="kpi-big-score"><div class="title">최근 분기 종합 점수 (' + latestQ.q + ')</div><div style="display:flex;align-items:baseline;"><div class="score">' + latestScore.toFixed(2) + '</div><div class="sub">/ 5.0</div></div><div style="font-size:12px;color:#64748b;margin-top:8px;font-weight:600;">개인 평균(' + avgScore.toFixed(2) + ') 대비 ' + scoreDiffHtml + '</div></div><div class="kpi-section-title" style="font-size:14px; margin-bottom:10px;">근무 요약 (GNWMC)</div><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;"><div style="background:rgba(255,255,255,0.6); padding:15px; border-radius:12px; text-align:center;"><div style="font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:4px;">총 투입 시간</div><div style="font-size:18px;font-weight:900;color:#00428E;">' + fH(t) + 'h</div></div><div style="background:rgba(255,255,255,0.6); padding:15px; border-radius:12px; text-align:center;"><div style="font-size:11px;color:#94a3b8;font-weight:700;margin-bottom:4px;">9h+ 연장근무</div><div style="font-size:18px;font-weight:900;color:#f59e0b;">' + o9 + '일</div></div></div><div class="kpi-section-title" style="font-size:14px; margin-bottom:5px;">역량 점수 트렌드</div><div style="height:120px; position:relative; margin-bottom:15px;">' + (sortedEd.length > 0 ? '<canvas id="newKpiTrendChart"></canvas>' : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;font-weight:600;">평가 데이터 없음</div>') + '</div><div class="kpi-section-title" style="margin-bottom:0;">최근 분기 역량 분석</div><div class="kpi-detail-list">' + detailListHtml + '</div></div>' +
        '<div class="kpi-panel center-panel"><div style="text-align:center; flex:0 0 auto;"><h2 style="font-size:24px; font-weight:900; color:#1e293b; letter-spacing:-0.03em;">Multidimensional Analysis</h2><div style="font-size:13px; color:#64748b; font-weight:600; margin-top:4px;">역량 다각도 분석 및 비교</div><div style="display:flex; justify-content:center; gap:15px; margin-top:12px;"><div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#334155;"><div style="width:12px; height:3px; background:' + c + '; border-radius:2px;"></div> 선택 기간</div><div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#94a3b8;"><div style="width:12px; height:3px; background:#94a3b8; border-radius:2px;"></div> 개인 평균</div><div style="display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700; color:#64748b;"><div style="width:12px; height:0; border-top:2px dashed #7dd3fc; border-radius:2px;"></div> 팀 전체 평균</div></div></div><div style="flex:1; position:relative; min-height:280px; display:flex; align-items:center; justify-content:center; padding:15px;"><canvas id="newKpiRadarChart"></canvas></div><div style="flex:0 0 auto; display:flex; flex-direction:column; margin-top:10px;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><div class="kpi-section-title" style="margin:0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px; vertical-align:text-bottom;"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/><path d="m12 8-4 4 4 4 4-4Z"/></svg><span style="color:#6366f1;">AI Insight</span> 종합 평가</div><div style="display:flex; gap:6px; align-items:center;"><button class="icon-btn" onclick="openAiModal(\'kpi\')" title="새창에서 크게 보기"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></button><button id="btnGenerateAI" onclick="generateAiComment()" style="background:linear-gradient(135deg,#4f46e5,#7c3aed); color:#fff; border:none; padding:5px 12px; border-radius:20px; font-size:10px; font-weight:700; cursor:pointer;">분석 요청하기</button></div></div><div style="background:linear-gradient(135deg, rgba(238,242,255,0.7), rgba(224,231,255,0.5)); border-radius:16px; padding:15px; border:1px solid rgba(99,102,241,0.2); max-height:160px; overflow-y:auto;" class="custom-scroll"><div id="aiCommentBox" class="ai-insight-content" style="color:#64748b;">'+aiInitText+'</div></div></div></div>' +
        '<div class="kpi-panel right-panel" style="display:flex; flex-direction:column; justify-content:flex-start; padding:25px 20px;"><div style="flex:0 0 auto; display:flex; flex-direction:column;"><div class="kpi-section-title" style="margin-bottom:10px;">Highest Record</div><div style="background:rgba(255,255,255,0.7); border-radius:16px; padding:18px; border:1px solid rgba(226,232,240,0.8);"><div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:12px; border-bottom:1px dashed rgba(203,213,225,0.6); padding-bottom:10px;"><div style="font-size:14px; font-weight:900; color:#1e293b;">' + (bestQ ? bestQ.q : '-') + '</div><div style="font-size:22px; font-weight:900; color:' + c + ';">' + bestScore.toFixed(2) + '<span style="font-size:12px; color:#94a3b8;"> / 5.0</span></div></div><div style="font-size:11px; color:#94a3b8; font-weight:700; margin-bottom:8px;">해당 분기 주요 업무 TOP 3</div>' + bestTopTasksHtml + '</div></div><div style="flex:0 0 auto; display:flex; flex-direction:column; margin-top:25px;"><div class="kpi-section-title" style="margin-bottom:10px;">주요 업무 비중 <span style="font-size:11px;color:#94a3b8;font-weight:600;margin-left:auto;">(선택 기간)</span></div><div style="display:flex; align-items:center; height:120px; gap:15px;"><div style="width:110px; height:110px; position:relative; flex-shrink:0;"><canvas id="newKpiDonutChart"></canvas></div><div style="flex:1; display:flex; flex-direction:column; gap:5px; justify-content:center;">' + topTasksHtml + '</div></div></div><div style="flex:1; display:flex; flex-direction:column; min-height:220px; margin-top:25px;"><div class="kpi-section-title" style="margin-bottom:0;">Work Insight <span style="font-size:11px;color:#94a3b8;font-weight:600;margin-left:auto;">(' + latestQ.q + ')</span></div><div style="flex:1; position:relative; min-height:180px; display:flex; align-items:center; justify-content:center; padding:15px;"><canvas id="kpiInsightRadar"></canvas></div></div></div></div>';
    view.innerHTML = html;
    setTimeout(() => {
        try {
            if(sortedEd.length > 0) {
                var trendLabels = sortedEd.map(d => d.q), trendData = sortedEd.map(d => d.vals.reduce((a,b)=>a+b,0)/5);
                var ptRadii = trendLabels.map(q => fq.includes(q) ? 5 : 3), ptBgColors = trendLabels.map(q => fq.includes(q) ? c : '#fff');
                var ptBorders = trendLabels.map(q => fq.includes(q) ? '#fff' : c), ptBorderWidths = trendLabels.map(q => fq.includes(q) ? 2 : 1.5);
                CH['newKpiTrendChart'] = new Chart(document.getElementById('newKpiTrendChart').getContext('2d'), {
                    type: 'line',
                    data: { labels: trendLabels, datasets: [{ data: trendData, borderColor: c, backgroundColor: hRgba(c, 0.1), borderWidth: 2, fill: true, tension: 0.4, pointRadius: ptRadii, pointBackgroundColor: ptBgColors, pointBorderColor: ptBorders, pointBorderWidth: ptBorderWidths, pointHoverRadius: 7 }] },
                    options: {
                        responsive: true, maintainAspectRatio: false, clip: false,
                        plugins: {
                            legend: { display: false },
                            datalabels: { display: true, align: 'top', anchor: 'end', offset: 4, color: (cx) => fq.includes(trendLabels[cx.dataIndex]) ? c : '#94a3b8', font: (cx) => ({ size: fq.includes(trendLabels[cx.dataIndex]) ? 12 : 10, weight: fq.includes(trendLabels[cx.dataIndex]) ? '900' : '600' }), formatter: (v) => Number(v).toFixed(1) },
                            tooltip: { callbacks: { title: function(cx) { return cx[0].label + ' 상세 역량'; }, label: function(cx) { var item = sortedEd[cx.dataIndex]; if(!item) return ''; var lines = ['종합 평균: ' + Number(cx.raw).toFixed(2), '----------------']; RADAR_LABELS.forEach((lbl, i) => lines.push(lbl + ': ' + Number(item.vals[i]).toFixed(1))); return lines; } } }
                        },
                        scales: { x: { display: false }, y: { display: false, min: Math.max(0, Math.min(...trendData) - 0.5), max: 5.5 } },
                        layout: { padding: { top: 20, bottom: 10, left: 15, right: 15 } }
                    }
                });
            }
            CH['newKpiRadarChart'] = new Chart(document.getElementById('newKpiRadarChart').getContext('2d'), {
                type: 'radar',
                data: { labels: RADAR_LABELS, datasets: [{ label: '선택 기간 (' + latestQ.q + ')', data: latestQ.vals, borderColor: c, backgroundColor: hRgba(c, 0.15), borderWidth: 2.5, pointBackgroundColor: c, pointBorderColor: '#fff', pointBorderWidth: 1.5, pointRadius: 4, pointHoverRadius: 6, order: 1 }, { label: '팀 전체 평균', data: allEvalAvgVals, borderColor: '#94a3b8', backgroundColor: 'transparent', borderWidth: 1, borderDash: [3, 3], pointRadius: 0, pointHoverRadius: 0, order: 2 }, { label: '개인 평균', data: avgVals, borderColor: '#cbd5e1', backgroundColor: 'rgba(148, 163, 184, 0.08)', borderWidth: 1.5, borderDash: [], pointBackgroundColor: '#cbd5e1', pointRadius: 2, pointHoverRadius: 4, order: 3 }] },
                options: {
                    responsive: true, maintainAspectRatio: false, clip: false, layout:{ padding: 40 },
                    plugins:{
                        legend:{ display:false }, datalabels: { display: false },
                        tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { size: 14 }, bodyFont: { size: 13, weight: 'bold' }, padding: 12, callbacks: { label: function(cx) { return cx.dataset.label + ': ' + Number(cx.raw).toFixed(2); } } }
                    },
                    scales: { r: { min: 0, max: 5, grid: { circular: false, color: 'rgba(203,213,225,0.4)', lineWidth: 1.5 }, angleLines: { display: false }, ticks: { display: false, stepSize: 1 }, pointLabels: { font: { size: 14, weight: '800' }, color: '#475569', padding: 20 } } },
                    elements: { line: { tension: 0.35 } }
                }
            });
            if(topTasksArr.length > 0) {
                CH['newKpiDonutChart'] = new Chart(document.getElementById('newKpiDonutChart').getContext('2d'), {
                    type: 'doughnut',
                    data: { labels: topTasksArr.map(t => t[0]), datasets: [{ data: topTasksArr.map(t => mToH(t[1])), backgroundColor: SUB_PAL.slice(0, topTasksArr.length), borderWidth: 2, borderColor: '#fff' }] },
                    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', clip: false, plugins: { legend: { display: false }, datalabels: { display: false } }, layout: { padding: 5 } }
                });
            }
            CH['kpiInsightRadar'] = new Chart(document.getElementById('kpiInsightRadar').getContext('2d'), {
                type: 'radar',
                data: { labels: splitRadarLabels, datasets: [{ label: latestQ.q, data: cvInsight, borderColor: c, backgroundColor: hRgba(c, 0.15), borderWidth: 2, pointBackgroundColor: c, pointBorderColor: '#fff', pointBorderWidth: 1, pointRadius: 3, pointHoverRadius: 5, order: 1 }, { label: '팀 전체 평균', data: teamCvInsight, borderColor: '#cbd5e1', backgroundColor: 'transparent', borderWidth: 1.5, borderDash: [3, 3], pointRadius: 0, pointHoverRadius: 0, order: 2 }] },
                options: {
                    responsive: true, maintainAspectRatio: false, clip: false, layout:{ padding: 40 },
                    plugins: {
                        legend: { display: false }, datalabels: { display: true, align: 'end', anchor: 'end', color: c, font: {size:10, weight:'bold'}, formatter: v => Number(v).toFixed(2) },
                        tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { size: 12 }, bodyFont: { size: 11, weight: 'bold' }, padding: 10, callbacks: { label: function(cx) { if(cx.datasetIndex===0) return cx.dataset.label + ': ' + Number(rawCvInsight[cx.dataIndex]).toFixed(2); else return cx.dataset.label + ': ' + Number(teamRawCvInsight[cx.dataIndex]).toFixed(2); } } }
                    },
                    scales: { r: { min: 0, max: 1.2, grid: { color: 'rgba(203,213,225,0.4)', lineWidth: 1 }, angleLines: { color: 'rgba(203,213,225,0.4)' }, ticks: { display: false, stepSize: 0.3 }, pointLabels: { font: { size: 10, weight: '800' }, color: '#64748b', padding: 15 } } }
                }
            });
        } catch (e) { console.error("KPI 탭 렌더링 중 오류:", e); }
    }, 50);
}
