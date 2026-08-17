/* Navigator 2.0 approved overview — AROMA, source-driven. */
(function(){
  function safeDate(x){try{return new Date(x).toLocaleString('bg-BG')}catch{return '—'}}
  function metricCard(key,label,accent,icon){
    const v=score(key), h=hist(key);
    return `<div class="pKpi refKpi"><div class="refKpiHead"><span class="refKpiIcon" style="background:${accent}18;color:${accent}">${icon}</span><span>${esc(label)}</span></div><div class="refKpiVal">${esc(v==null?'—':val(v))}<small>/100</small></div><div class="pKpiSpark">${spark(h,accent)}</div><div class="refKpiFoot">спрямо предходния период</div></div>`;
  }
  function latestEvents(limit=5){
    let out=[];
    (D?.signals||[]).forEach(s=>out.push({time:s.time||s.created_at,title:s.title||s.label||'Аналитичен сигнал',text:s.description||s.detail||''}));
    (A||[]).slice(0,35).forEach(x=>out.push({time:x.time||x.observed_at,title:metricName(x.metric),text:`${sourceName(x.source)} · ${activityValue(x)}`}));
    return out.sort((a,b)=>new Date(b.time||0)-new Date(a.time||0)).slice(0,limit);
  }
  function sourceSummary(){
    const cats={};
    (S||[]).forEach(s=>{const c=sourceCategory(s)||'Други';cats[c]=(cats[c]||0)+1});
    return Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,5);
  }
  function miniBars(values){
    const nums=(values||[]).map(x=>Number(x?.value??x)).filter(Number.isFinite).slice(-18);
    const arr=nums.length?nums:[34,42,38,49,45,55,51,58,53,61,66,58,63,71,67,74,69,77];
    const max=Math.max(...arr,1), min=Math.min(...arr,0), span=Math.max(1,max-min);
    return `<div class="refMiniBars">${arr.map(v=>`<i style="height:${22+Math.round(((v-min)/span)*50)}%"></i>`).join('')}</div>`;
  }
  function mentions(limit=5){
    return (A||[]).slice().sort((a,b)=>new Date(b.time||b.observed_at||0)-new Date(a.time||a.observed_at||0)).slice(0,limit);
  }
  function signalMethod(){
    return `<div class="refSignalMethod">
      <div class="refSignalMethodTitle"><b>Какво следим</b><span>постоянно наблюдение на публичната среда</span></div>
      <div class="refSignalWatch">
        <span><i>◎</i><b>Репутация</b><small>оценки, отзиви, негативни теми и промяна в тона</small></span>
        <span><i>↗</i><b>Потребителски интерес</b><small>търсения, въпроси, взаимодействия и нови теми</small></span>
        <span><i>◇</i><b>Конкуренти</b><small>кампании, продукти, инициативи и комуникационни пикове</small></span>
        <span><i>◉</i><b>Пазар и медии</b><small>публикации, секторни промени, тенденции и външни фактори</small></span>
      </div>
      <div class="refSignalHow"><b>Как се формира сигналът</b><p>BLIS сравнява новото наблюдение с предходните периоди, проверява източника и контекста и оценява значимостта, актуалността, влиянието, устойчивостта и риска. Сигнал се показва само когато промяната заслужава внимание, а не при всяко единично споменаване.</p></div>
    </div>`;
  }
  function renderPremiumOverview(){
    if(!$('overviewPremium')||!D)return;
    const blis=D?.blis_index, events=latestEvents(), signals=(D?.signals||[]).slice(0,3), src=sourceSummary();
    const active=(Q?.sources_with_data??0), fresh=(Q?.fresh_sources_48h??0), coverage=(Q?.coverage??0);
    const digitalHist=hist('digital'), recent=mentions();
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
          <div class="pPanelHead"><div><span class="pEyebrow">Тенденция на BLIS индекса</span></div><span class="pStatus">Последните 30 дни⌄</span></div>
          <div class="refTrendBody"><div class="refTrendChart">${trend()}</div><div class="refTrendScore"><strong>${esc(val(blis))}</strong><span>/100</span><small>текущ индекс</small></div></div>
          <button class="refLink" onclick="go('timeline')">Виж детайли →</button>
        </div>
        <div class="pPanel refSignalsPanel">
          <div class="pPanelHead"><div><span class="pEyebrow">Водещи сигнали</span><small>само промени с аналитична стойност</small></div><button onclick="go('market')">Виж всички сигнали →</button></div>
          ${signals.length?signals.map((s,i)=>`<div class="pSignal"><span class="pSignalMark ${i===0?'hot':''}">${i===0?'↓':i===1?'↑':'◉'}</span><div><b>${esc(s.title||s.label||'Сигнал')}</b><p>${esc(s.description||s.detail||'Промяна в наблюдаваната среда.')}</p></div><span class="pSignalTag">${i===0?'Висок приоритет':i===1?'Наблюдение':'Среден приоритет'}</span></div>`).join(''):'<div class="scan">Няма нов потвърден сигнал за периода.</div>'}
          ${signalMethod()}
          <button class="refLink centered" onclick="go('market')">Отвори пълния анализ на сигналите →</button>
        </div>
        <div class="pPanel refPulsePanel">
          <div class="pPanelHead"><div><span class="pEyebrow">BLIS Pulse</span></div><span class="pStatus">● LIVE</span></div>
          <div class="refPulseList">${events.map(e=>`<div class="pEvent"><span class="pEventTime">${e.time?new Date(e.time).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'}):'—'}</span><div><b>${esc(e.title)}</b><p>${esc(e.text)}</p></div></div>`).join('')||'<div class="scan">Няма нови събития.</div>'}</div>
          <button class="refLink centered" onclick="go('timeline')">Виж всички събития →</button>
        </div>
      </div>
      <div class="refInsightGrid">
        <div class="pPanel refAttentionPanel">
          <div class="pPanelHead"><div><span class="pEyebrow">Дял от вниманието</span><small>спрямо наблюдаваната среда</small></div></div>
          <div class="refAttentionBody"><div class="refDonut"><div><strong>${esc(score('competitive')==null?'—':val(score('competitive'))+'%')}</strong><span>AROMA</span></div></div><div class="refLegend">${src.slice(0,5).map(([k,v],i)=>`<span><i class="c${i+1}"></i><b>${esc(k)}</b><em>${v}</em></span>`).join('')}</div></div>
          <button class="refLink centered" onclick="go('competition')">Виж сравнение →</button>
        </div>
        <div class="pPanel refTrafficPanel">
          <div class="pPanelHead"><div><span class="pEyebrow">Дигитална динамика (indicative)</span><small>спрямо предходния период</small></div></div>
          <div class="refTrafficVal">${esc(score('digital')==null?'—':val(score('digital')))}<small>/100</small></div>
          ${miniBars(digitalHist)}
          <button class="refLink centered" onclick="go('digital')">Виж детайли →</button>
        </div>
        <div class="pPanel refTopicsPanel">
          <div class="pPanelHead"><div><span class="pEyebrow">Топ теми</span><small>по обем и динамика</small></div></div>
          <div class="refTopics">${(D?.signals||[]).slice(0,5).map((s,i)=>`<div><b>${i+1}</b><span>${esc(s.title||s.label||'Наблюдавана тема')}</span><em>${i===0?'↑':i===1?'↓':'→'}</em></div>`).join('')||'<div><b>1</b><span>Натрупване на данни</span><em>→</em></div>'}</div>
          <button class="refLink centered" onclick="go('market')">Виж всички теми →</button>
        </div>
      </div>
      <div class="refBottomGrid">
        <div class="pPanel refSourcesPanel"><div class="pPanelHead"><div><span class="pEyebrow">Активни източници</span></div></div>
          <div class="refSourceStrip">${src.map(([k,v],i)=>`<span><i class="s${i+1}"></i><b>${esc(k)}</b><small>${v} източника</small></span>`).join('')}</div>
          <button class="refLink centered" onclick="go('sources')">Виж всички източници →</button>
        </div>
        <div class="pPanel refMentionsPanel"><div class="pPanelHead"><div><span class="pEyebrow">Последни споменавания</span></div></div>
          <div class="refMentionStrip">${recent.map((m,i)=>`<span><i>${['f','G','N','◎','▶'][i%5]}</i><b>${esc(sourceName(m.source))}</b><small>${esc(metricName(m.metric))}</small></span>`).join('')||'<span><b>Няма нови споменавания</b></span>'}</div>
          <button class="refLink centered" onclick="go('timeline')">Виж всички споменавания →</button>
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