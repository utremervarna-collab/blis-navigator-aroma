/* BLIS Navigator — client-readable overview mid row */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
  const fmt=v=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
  const getHist=k=>{try{return (hist(k)||[]).map(Number).filter(Number.isFinite)}catch(e){return[]}};
  const comps=()=>{try{return (D?.competitors||[]).filter(x=>n(x.score)!=null).sort((a,b)=>Number(b.score)-Number(a.score))}catch(e){return[]}};
  const signals=()=>{try{return (D?.signals||[]).slice(0,5)}catch(e){return[]}};
  function competitive(){
    const arr=comps();
    if(!arr.length)return `<div class="clarity-empty">Все още няма достатъчно сравними данни за конкурентите.</div>`;
    const client=(D?.name||document.body.dataset.client||'Клиент').toString();
    let ownIndex=arr.findIndex(x=>String(x.name||'').toLowerCase()===client.toLowerCase());
    if(ownIndex<0)ownIndex=0;
    const own=arr[ownIndex];
    const max=Math.max(...arr.map(x=>Number(x.score)||0),1);
    return `<div class="clarity-summary"><div><small>Текуща позиция</small><strong>${ownIndex+1} от ${arr.length}</strong></div><div><small>Оценка</small><strong>${fmt(own?.score)}<em>/100</em></strong></div></div><div class="clarity-bars">${arr.map((x,i)=>`<div class="clarity-bar-row ${i===ownIndex?'is-client':''}"><div class="clarity-bar-label"><b>${esc(x.name||'Конкурент')}</b><span>${fmt(x.score)}/100</span></div><div class="clarity-track"><i style="width:${Math.max(4,(Number(x.score)||0)/max*100)}%"></i></div></div>`).join('')}</div><div class="clarity-explain">Сравнението използва еднакъв набор от публично измерими показатели за всички наблюдавани марки.</div>`;
  }
  function digital(){
    const a=getHist('digital');
    let current=null;try{current=n(score('digital'))}catch(e){}
    if(current==null&&a.length)current=a[a.length-1];
    const previous=a.length>1?a[a.length-2]:null;
    const delta=current!=null&&previous!=null?current-previous:null;
    const dir=delta==null?'neutral':delta>0?'up':delta<0?'down':'neutral';
    const msg=delta==null?'Нужно е още едно измерване, за да се отчете реална промяна.':delta>0?'Дигиталната видимост се подобрява спрямо предходното измерване.':delta<0?'Дигиталната видимост отслабва спрямо предходното измерване.':'Няма промяна спрямо предходното измерване.';
    return `<div class="clarity-digital"><div class="clarity-metric"><small>Сега</small><strong>${fmt(current)}<em>/100</em></strong></div><div class="clarity-arrow">→</div><div class="clarity-metric"><small>Предходно</small><strong>${fmt(previous)}<em>/100</em></strong></div><div class="clarity-change ${dir}"><small>Промяна</small><strong>${delta==null?'—':`${delta>0?'+':''}${delta.toFixed(1)}`}<em> пункта</em></strong></div></div><div class="clarity-message ${dir}">${msg}</div>`;
  }
  function topics(){
    const arr=signals();
    if(!arr.length)return `<div class="clarity-empty">Няма нови регистрирани сигнали за текущия период.</div>`;
    return `<div class="clarity-topics">${arr.map((x,i)=>{const title=x.title||x.label||'Наблюдаван сигнал';const detail=x.description||x.detail||'Промяна в наблюдаваната среда';const priority=(x.priority||'').toString();return `<div class="clarity-topic"><span class="clarity-num">${i+1}</span><div><b>${esc(title)}</b><small>${esc(detail)}</small></div>${priority?`<span class="clarity-tag">${esc(priority)}</span>`:''}</div>`}).join('')}</div><div class="clarity-explain">Показват се само теми, които са породени от реално регистрирани сигнали в наблюдаваните източници.</div>`;
  }
  function render(){
    const cards=document.querySelectorAll('#overview .ov-row-mid > .ov-card');
    if(cards.length<3)return;
    cards[0].innerHTML=`<div class="ov-head"><div><h3>Позиция спрямо конкурентите</h3><div class="ov-panel-sub">Къде се намира марката спрямо основните наблюдавани конкуренти</div></div><button class="ov-link" onclick="refGo('competition')">Виж подробно →</button></div>${competitive()}`;
    cards[1].innerHTML=`<div class="ov-head"><div><h3>Промяна в дигиталната видимост</h3><div class="ov-panel-sub">Сравнение между последните две реални измервания</div></div><button class="ov-link" onclick="refGo('digital')">Виж подробно →</button></div>${digital()}`;
    cards[2].innerHTML=`<div class="ov-head"><div><h3>Водещи сигнали и теми</h3><div class="ov-panel-sub">Какво в момента заслужава внимание</div></div><button class="ov-link" onclick="refGo('market')">Виж всички →</button></div>${topics()}`;
  }
  function signature(){try{return JSON.stringify([D?.name,D?.competitors,D?.signals,H?.length,D?.indices])}catch(e){return''}}
  function init(){let last='';const run=()=>{const s=signature();if(s!==last||!document.querySelector('.clarity-summary,.clarity-empty')){last=s;render()}};run();setInterval(run,1200);const host=document.getElementById('overviewPremium');if(host)new MutationObserver(()=>requestAnimationFrame(run)).observe(host,{childList:true,subtree:false});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
