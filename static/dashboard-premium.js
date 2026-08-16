/* Approved Navigator 2.0 overview — source-driven AROMA client dashboard. */
(function(){
  function safeDate(x){try{return new Date(x).toLocaleString('bg-BG')}catch{return '—'}}
  function metricCard(key,label,accent,icon){
    const v=score(key), h=hist(key);
    return `<div class="pKpi refKpi"><div class="refKpiHead"><span class="refKpiIcon" style="background:${accent}18;color:${accent}">${icon}</span><span>${esc(label)}</span></div><div class="refKpiVal">${esc(v==null?'—':val(v))}<small>/100</small></div><div class="pKpiSpark">${spark(h,accent)}</div><div class="refKpiFoot">спрямо предходния период</div></div>`;
  }
  function latestEvents(limit=5){
    let out=[];
    (D?.signals||[]).forEach(s=>out.push({time:s.time||s.created_at,title:s.title||s.label||'Аналитичен сигнал',text:s.description||s.detail||''}));
    (A||[]).slice(0,30).forEach(x=>out.push({time:x.time||x.observed_at,title:metricName(x.metric),text:`${sourceName(x.source)} · ${activityValue(x)}`}));
    return out.sort((a,b)=>new Date(b.time||0)-new Date(a.time||0)).slice(0,limit);
  }
  function sourceSummary(){
    const cats={};
    (S||[]).forEach(s=>{const c=sourceCategory(s)||'Други';cats[c]=(cats[c]||0)+1});
    return Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,5);
  }
  function renderPremiumOverview(){
    if(!$('overviewPremium')||!D)return;
    const blis=D?.blis_index, events=latestEvents(), signals=(D?.signals||[]).slice(0,3), src=sourceSummary();
    const active=(Q?.sources_with_data??0), fresh=(Q?.fresh_sources_48h??0), coverage=(Q?.coverage??0);
    $('overviewPremium').innerHTML=`
      <div class="refKpiGrid">
        ${metricCard('blis','BLIS общ индекс','#1766e8','↗')}
        ${metricCard('presence','Социален индекс','#32ad66','◎')}
        ${metricCard('digital','Дигитална видимост','#7546d8','◉')}
        ${metricCard('reputation','Репутационен индекс','#ff7a19','◇')}
        ${metricCard('content','Потребителски интерес','#ef4f78','♡')}
      </div>
      <div class="refOverviewMain">
        <div class="pPanel refTrendPanel">
          <div class="pPanelHead"><div><span class="pEyebrow">Тенденция на BLIS индекса</span><h3>Динамика на общото позициониране</h3></div><span class="pStatus">Последните 30 дни</span></div>
          <div class="refTrendBody"><div class="refTrendChart">${trend()}</div><div class="refTrendScore"><strong>${esc(val(blis))}</strong><span>/100</span><small>текущ индекс</small></div></div>
        </div>
        <div class="pPanel refSignalsPanel">
          <div class="pPanelHead"><div><span class="pEyebrow">Ключови сигнали</span><h3>Какво изисква внимание</h3></div><button onclick="go('market')">Виж всички →</button></div>
          ${signals.length?signals.map((s,i)=>`<div class="pSignal"><span class="pSignalMark ${i===0?'hot':''}">${i===0?'!':'↗'}</span><div><b>${esc(s.title||s.label||'Сигнал')}</b><p>${esc(s.description||s.detail||'Промяна в наблюдаваната среда.')}</p></div><span class="pSignalTag">${i===0?'Приоритет':'Наблюдение'}</span></div>`).join(''):'<div class="scan">Няма нов потвърден сигнал за периода.</div>'}
        </div>
        <div class="pPanel refPulsePanel">
          <div class="pPanelHead"><div><span class="pEyebrow">BLIS Pulse</span><h3>Последни промени</h3></div><span class="pStatus">● LIVE</span></div>
          ${events.map(e=>`<div class="pEvent"><span class="pEventIcon">↗</span><div><small>${e.time?safeDate(e.time):'Текущ период'}</small><b>${esc(e.title)}</b><p>${esc(e.text)}</p></div></div>`).join('')||'<div class="scan">Няма нови събития.</div>'}
        </div>
      </div>
      <div class="refBottomGrid">
        <div class="pPanel"><div class="pPanelHead"><div><span class="pEyebrow">Информационна среда</span><h3>Активни източници</h3></div><button onclick="go('sources')">Всички източници →</button></div>
          <div class="refSourceStats"><div><strong>${S.length}</strong><span>общо</span></div><div><strong>${active}</strong><span>с данни</span></div><div><strong>${fresh}</strong><span>свежи ≤48ч</span></div><div><strong>${coverage}%</strong><span>покритие</span></div></div>
          <div class="refSourceList">${src.map(([k,v])=>`<span><b>${esc(k)}</b><em>${v}</em></span>`).join('')}</div>
        </div>
        <div class="pPanel"><div class="pPanelHead"><div><span class="pEyebrow">Топ теми</span><h3>По обем и динамика</h3></div><button onclick="go('market')">Всички теми →</button></div>
          <div class="refTopics">${(D?.signals||[]).slice(0,5).map((s,i)=>`<div><b>${i+1}</b><span>${esc(s.title||s.label||'Наблюдавана тема')}</span><strong>${i===0?'↑':'→'}</strong></div>`).join('')||'<div><b>1</b><span>Натрупване на данни</span><strong>→</strong></div>'}</div>
        </div>
      </div>`;
    document.querySelectorAll('.legacyOverview').forEach(el=>el.style.display='none');
  }
  const previousRenderAll=renderAll;
  renderAll=function(){previousRenderAll();renderPremiumOverview();};
  const previousGo=go;
  go=function(id){previousGo(id);if(id==='overview')renderPremiumOverview();};
  window.renderPremiumOverview=renderPremiumOverview;
  setTimeout(()=>{if(D)renderPremiumOverview()},500);
})();