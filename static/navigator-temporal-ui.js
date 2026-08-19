/* BLIS Navigator — Temporal UI synchronizer.
   Keeps deltas, comparison cards and History aligned with BLISCurves v3. */
(function(){
  'use strict';
  const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const fmt=v=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
  const getSeries=k=>{try{return window.BLISCurves?.series(k)||[]}catch(e){return[]}};
  const diff=k=>{const s=getSeries(k);if(s.length<2)return null;return Math.round((s[s.length-1].value-s[s.length-2].value)*10)/10};

  function patchKpis(){
    document.querySelectorAll('#overviewPremium [data-index]').forEach(card=>{
      const key=card.getAttribute('data-index')||'blis',d=diff(key),series=getSeries(key);
      const delta=card.querySelector('.ov-delta');
      if(delta&&d!=null){
        delta.textContent=`${d>0?'↑':d<0?'↓':'–'} ${Math.abs(d).toLocaleString('bg-BG',{maximumFractionDigits:1})}`;
        delta.classList.toggle('down',d<0);delta.classList.toggle('flat',d===0);
      }
      const foot=card.querySelector('.ov-kpi-foot');
      if(foot&&series.length)foot.textContent=`текуща стойност · ${series.length} дневни точки`;
    });
  }

  function patchDigitalComparison(){
    const host=document.querySelector('#overviewPremium .clarity-digital');
    if(!host)return;
    const s=getSeries('digital');if(s.length<2)return;
    const last=s[s.length-1].value,prev=s[s.length-2].value,d=Math.round((last-prev)*10)/10;
    const metrics=host.querySelectorAll('.clarity-metric strong');
    if(metrics[0])metrics[0].innerHTML=`${fmt(last)}<em>/100</em>`;
    if(metrics[1])metrics[1].innerHTML=`${fmt(prev)}<em>/100</em>`;
    const change=host.querySelector('.clarity-change');
    if(change){
      change.classList.remove('up','down','neutral');change.classList.add(d>0?'up':d<0?'down':'neutral');
      const strong=change.querySelector('strong');if(strong)strong.innerHTML=`${d>0?'+':''}${fmt(d)}<em> пункта</em>`;
    }
  }

  function patchOverviewCopy(){
    const cards=[...document.querySelectorAll('#overviewPremium .ov-card')];
    for(const card of cards){
      const h=card.querySelector('h3');
      if((h?.textContent||'').includes('Тенденция на BLIS индекса')){
        const sub=card.querySelector('.ov-panel-sub');
        if(sub)sub.textContent='Дневна динамика, различна за клиента и показателя';
        break;
      }
    }
  }

  function patchHistory(){
    const target=document.getElementById('historyBody')||document.querySelector('#history');
    if(!target||!window.BLISCurves)return;
    const s=getSeries('blis');if(!s.length)return;
    const trend=target.querySelector('.ref-trend');
    if(trend){
      trend.style.height='300px';trend.style.minHeight='300px';trend.style.overflow='visible';
      trend.innerHTML=window.BLISCurves.draw('blis',{color:'#1766e8',width:820,height:260});
    }
    const vals=target.querySelectorAll('.ref-grid4 .ref-val');
    if(vals[0])vals[0].textContent=String(s.length);
    if(vals[1])vals[1].textContent=fmt(s[s.length-1].value);
    const title=target.querySelector('.ref-card .ref-head h3');
    if(title&&/ИСТОРИЧЕСКА ДИНАМИКА/.test(title.textContent||''))title.textContent='ИСТОРИЧЕСКА ДИНАМИКА НА BLIS ИНДЕКСА';
  }

  function patch(){patchKpis();patchDigitalComparison();patchOverviewCopy()}
  function wrapRefGo(){
    const old=window.refGo;if(typeof old!=='function'||old.__temporalUI)return false;
    const wrapped=function(id){const r=old.apply(this,arguments);requestAnimationFrame(()=>{patch();if(id==='history')patchHistory()});return r};
    wrapped.__temporalUI=true;wrapped.__previous=old;window.refGo=wrapped;return true;
  }

  function init(){
    wrapRefGo();patch();
    const ov=document.getElementById('overviewPremium');
    if(ov)new MutationObserver(()=>requestAnimationFrame(patch)).observe(ov,{childList:true,subtree:true});
    let tries=0;const t=setInterval(()=>{tries++;wrapRefGo();patch();if(document.getElementById('history')?.classList.contains('active'))patchHistory();if(tries>30)clearInterval(t)},400);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
