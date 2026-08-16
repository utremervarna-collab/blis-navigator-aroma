/* Premium BLIS client overview. Keeps all values source-driven and avoids synthetic metrics. */
(function(){
  function safeDate(x){try{return new Date(x).toLocaleString('bg-BG')}catch{return '—'}}
  function latestEvents(limit=6){
    let out=[];
    (D?.signals||[]).forEach(s=>out.push({kind:'signal',time:s.time||s.created_at,title:s.title||s.label||'Аналитичен сигнал',text:s.description||s.detail||'Промяна в наблюдаваната среда.'}));
    (A||[]).slice(0,20).forEach(x=>out.push({kind:/rating|review/i.test(x.metric||'')?'reputation':'measurement',time:x.time||x.observed_at,title:metricName(x.metric),text:`${sourceName(x.source)} · ${activityValue(x)}`}));
    return out.sort((a,b)=>new Date(b.time||0)-new Date(a.time||0)).slice(0,limit);
  }
  function sourceHealth(){
    let measured=Number(Q?.sources_with_data||0), total=S.length||0, fresh=Number(Q?.fresh_sources_48h||0), coverage=Number(Q?.coverage||0);
    return {measured,total,fresh,coverage};
  }
  function sourceBadge(s){
    let c=sourceCategory(s), map={'Социални мрежи':'#7c3aed','Уеб и търсене':'#0f5fe9','Медии':'#0f9fad','Отзиви':'#d9367b','Официални и секторни':'#22a447','Други':'#98a2b3'};
    return `<span class="pSource"><i style="background:${map[c]||'#98a2b3'}"></i>${esc(s.label)}</span>`;
  }
  function kpi(key,label,accent){
    let v=score(key), h=hist(key), state=v==null?'Натрупване':val(v);
    return `<div class="pKpi"><div class="pKpiTop"><span>${esc(label)}</span><i style="background:${accent}"></i></div><strong>${esc(state)}</strong><div class="pKpiSpark">${spark(h,accent)}</div><small>${v==null?'Очакват се достатъчно сравними измервания.':'Текуща стойност от наличните измерени компоненти.'}</small></div>`;
  }
  function renderPremiumOverview(){
    if(!$('overviewPremium')||!D) return;
    let x=dossier(), sh=sourceHealth(), events=latestEvents(), blis=D?.blis_index;
    let signals=(D?.signals||[]).slice(0,4);
    $('overviewPremium').innerHTML=`
      <div class="pClientBanner">
        <div class="pClientId"><div class="pMonogram">${esc(x.mono)}</div><div><span class="pEyebrow">Активен клиентски профил</span><h2>${esc(D?.name||'Клиент')}</h2><p>${esc(x.descriptor||D?.sector||'BLIS intelligence профил')}</p></div></div>
        <div class="pClientMeta"><span><b>${S.length}</b> източника</span><span><b>${A.length}</b> измервания</span><span><b>${H.length}</b> snapshots</span><span class="pLive">● Наблюдение активно</span></div>
      </div>
      <div class="pHeroGrid">
        <div class="pPanel pPrimary">
          <div class="pPanelHead"><div><span class="pEyebrow">BLIS общ индекс</span><h3>Текуща intelligence картина</h3></div><span class="pStatus">${blis==null?'Натрупване на база':'Актуално измерване'}</span></div>
          <div class="pScoreRow"><div class="pScore"><strong>${esc(val(blis))}</strong><span>/100</span></div><div class="pScoreText"><b>${blis==null?'Индексът още не е активиран':'Обобщена оценка на наблюдаваното позициониране'}</b><p>${blis==null?'BLIS няма да изчисли обща стойност, докато няма достатъчно надеждна и съпоставима база.':'Стойността се формира от наличните измерени компоненти и се проследява във времето.'}</p></div></div>
          <div class="pTrend"><div class="pSectionTitle">Историческа динамика</div><div>${trend()}</div></div>
        </div>
        <div class="pPanel pChanges">
          <div class="pPanelHead"><div><span class="pEyebrow">What changed</span><h3>Какво се промени</h3></div><button onclick="go('timeline')">Timeline →</button></div>
          <div class="pEventList">${events.length?events.map((e,i)=>`<div class="pEvent"><span class="pEventIcon ${e.kind}">${e.kind==='reputation'?'♡':e.kind==='signal'?'!':'↗'}</span><div><small>${e.time?safeDate(e.time):'Текущ период'}</small><b>${esc(e.title)}</b><p>${esc(e.text)}</p></div></div>`).join(''):'<div class="scan">Няма нова потвърдена промяна. Наблюдението продължава.</div>'}</div>
        </div>
      </div>
      <div class="pKpiGrid">${kpi('presence','Социален индекс','#7c3aed')}${kpi('digital','Дигитална видимост','#22a447')}${kpi('reputation','Репутация','#d9367b')}${kpi('content','Потребителски интерес','#0f9fad')}${kpi('competitive','Конкурентна позиция','#e58a00')}</div>
      <div class="pMainGrid">
        <div class="pPanel pSignals"><div class="pPanelHead"><div><span class="pEyebrow">Intelligence feed</span><h3>Ключови сигнали</h3></div><button onclick="go('market')">Пазарни сигнали →</button></div>${signals.length?signals.map((s,i)=>`<div class="pSignal"><span class="pSignalMark ${i===0?'hot':''}">${i===0?'!':'↗'}</span><div><b>${esc(s.title||s.label||'Сигнал')}</b><p>${esc(s.description||s.detail||'Потвърдена промяна в наблюдаваната среда.')}</p></div><span class="pSignalTag">${i===0?'Приоритет':'Наблюдение'}</span></div>`).join(''):'<div class="scan">Няма нов потвърден сигнал за периода. Активните източници продължават да се проверяват.</div>'}</div>
        <div class="pPanel pHealth"><div class="pPanelHead"><div><span class="pEyebrow">Data confidence</span><h3>Качество на информационната база</h3></div><button onclick="go('sources')">Източници →</button></div><div class="pHealthGrid"><div><strong>${sh.coverage}%</strong><span>покритие</span></div><div><strong>${sh.measured}</strong><span>с данни</span></div><div><strong>${sh.fresh}</strong><span>свежи ≤48ч</span></div><div><strong>${sh.total}</strong><span>общо</span></div></div><div class="pMeter"><span style="width:${Math.max(0,Math.min(100,sh.coverage))}%"></span></div><p>BLIS отделя наличието на източник от наличието на реално използваеми данни. Липсващите стойности не се заменят с нули или фиктивни оценки.</p></div>
      </div>
      <div class="pPanel pSources"><div class="pPanelHead"><div><span class="pEyebrow">Active source map</span><h3>Наблюдавана информационна среда</h3></div><span class="pStatus">${S.length} активни източника</span></div><div class="pSourceCloud">${S.slice(0,18).map(sourceBadge).join('')||'<span class="subtle">Източниците ще се появят след конфигуриране на профила.</span>'}</div></div>
      <div class="pPulse"><span class="pPulseDot"></span><b>BLIS Pulse</b><p>Системата наблюдава промени по източници, показатели, репутация и конкуренти. Ново събитие се визуализира само когато има проследима информационна основа.</p><button onclick="go('timeline')">Детайлен изглед →</button></div>`;
    document.querySelectorAll('.legacyOverview').forEach(el=>el.style.display='none');
  }
  const previousRenderAll=renderAll;
  renderAll=function(){previousRenderAll();renderPremiumOverview();};
  const previousGo=go;
  go=function(id){previousGo(id);if(id==='overview')renderPremiumOverview();};
  window.renderPremiumOverview=renderPremiumOverview;
  setTimeout(()=>{if(D)renderPremiumOverview()},500);
})();