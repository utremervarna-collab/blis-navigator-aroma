/* BLIS Navigator — Temporal UI synchronizer. Idempotent/event-driven v2. */
(function(){
  'use strict';
  const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const fmt=v=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
  const getSeries=k=>{try{return window.BLISCurves?.series(k)||[]}catch(e){return[]}};
  const diff=k=>{const s=getSeries(k);if(s.length<2)return null;return Math.round((s[s.length-1].value-s[s.length-2].value)*10)/10};
  const setText=(el,v)=>{if(el&&el.textContent!==v)el.textContent=v};
  const setHTML=(el,v)=>{if(el&&el.innerHTML!==v)el.innerHTML=v};

  function patchKpis(){
    document.querySelectorAll('#overviewPremium [data-index]').forEach(card=>{
      const key=card.getAttribute('data-index')||'blis',d=diff(key),series=getSeries(key);
      const delta=card.querySelector('.ov-delta');
      if(delta&&d!=null){
        setText(delta,`${d>0?'↑':d<0?'↓':'–'} ${Math.abs(d).toLocaleString('bg-BG',{maximumFractionDigits:1})}`);
        delta.classList.toggle('down',d<0);delta.classList.toggle('flat',d===0);
      }
      const foot=card.querySelector('.ov-kpi-foot');
      if(foot&&series.length)setText(foot,`текуща стойност · ${series.length} дневни точки`);
    });
  }

  function patchDigitalComparison(){
    const host=document.querySelector('#overviewPremium .clarity-digital');if(!host)return;
    const s=getSeries('digital');if(s.length<2)return;
    const last=s[s.length-1].value,prev=s[s.length-2].value,d=Math.round((last-prev)*10)/10;
    const metrics=host.querySelectorAll('.clarity-metric strong');
    if(metrics[0])setHTML(metrics[0],`${fmt(last)}<em>/100</em>`);
    if(metrics[1])setHTML(metrics[1],`${fmt(prev)}<em>/100</em>`);
    const change=host.querySelector('.clarity-change');
    if(change){
      change.classList.remove('up','down','neutral');change.classList.add(d>0?'up':d<0?'down':'neutral');
      const strong=change.querySelector('strong');if(strong)setHTML(strong,`${d>0?'+':''}${fmt(d)}<em> пункта</em>`);
    }
  }

  function patchDigitalModule(){
    const root=document.getElementById('digitalBody');if(!root)return;
    const cards=[...root.querySelectorAll('.dm-kpi')];
    const map=[['Дигитална видимост','digital'],['Търсене на марката','content'],['Видимост в търсачки','presence'],['Външно присъствие','blis']];
    map.forEach(([label,key])=>{
      const card=cards.find(x=>(x.querySelector('.dm-kpi-top')?.textContent||'').includes(label));if(!card)return;
      const d=diff(key),delta=card.querySelector('.dm-delta');
      if(delta&&d!=null)setText(delta,`${d>0?'↑':d<0?'↓':'→'} ${Math.abs(d).toLocaleString('bg-BG',{maximumFractionDigits:1})}`);
      const foot=card.querySelector('.dm-foot');if(foot)setText(foot,'спрямо предходния ден');
    });
    const rowKeys=['content','digital','blis','presence','reputation'];
    root.querySelectorAll('.dm-table tbody tr').forEach((tr,i)=>{
      const key=rowKeys[i];if(!key)return;const s=getSeries(key);if(!s.length)return;
      const valueCell=tr.children[1],changeCell=tr.children[2],last=s[s.length-1].value,d=diff(key);
      if(valueCell)setHTML(valueCell,`<b>${fmt(last)}</b>/100`);
      if(changeCell&&d!=null){setText(changeCell,`${d>0?'↑':d<0?'↓':'→'} ${Math.abs(d).toLocaleString('bg-BG',{maximumFractionDigits:1})}`);changeCell.className=d>0?'dm-up':d<0?'dm-down':'dm-flat'}
    });
    const d=diff('digital'),score=root.querySelector('.dm-score');
    if(score&&d!=null){
      const h=score.querySelector('h4'),p=score.querySelector('p');
      setText(h,d>0?'Положителна динамика':d<0?'Отрицателна динамика':'Стабилна динамика');
      setText(p,d>0?'Дигиталната видимост се подобрява спрямо предходния ден.':d<0?'Дигиталната видимост отслабва спрямо предходния ден и изисква наблюдение.':'Дигиталната видимост е стабилна спрямо предходния ден.');
    }
  }

  function patchOverviewCopy(){
    const cards=[...document.querySelectorAll('#overviewPremium .ov-card')];
    for(const card of cards){
      const h=card.querySelector('h3');
      if((h?.textContent||'').includes('Тенденция на BLIS индекса')){
        const sub=card.querySelector('.ov-panel-sub');setText(sub,'Дневна динамика, различна за клиента и показателя');break;
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
      const html=window.BLISCurves.draw('blis',{color:'#1766e8',width:820,height:260});setHTML(trend,html);
    }
    const vals=target.querySelectorAll('.ref-grid4 .ref-val');
    if(vals[0])setText(vals[0],String(s.length));if(vals[1])setText(vals[1],fmt(s[s.length-1].value));
    const title=target.querySelector('.ref-card .ref-head h3');if(title&&/ИСТОРИЧЕСКА ДИНАМИКА/.test(title.textContent||''))setText(title,'ИСТОРИЧЕСКА ДИНАМИКА НА BLIS ИНДЕКСА');
  }

  function patch(){patchKpis();patchDigitalComparison();patchOverviewCopy();patchDigitalModule()}
  function wrapRefGo(){
    const old=window.refGo;if(typeof old!=='function'||old.__temporalUI)return false;
    const wrapped=function(id){const r=old.apply(this,arguments);requestAnimationFrame(()=>{patch();if(id==='history')patchHistory()});return r};
    wrapped.__temporalUI=true;wrapped.__previous=old;window.refGo=wrapped;return true;
  }

  function init(){
    let scheduled=false;
    const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;patch()})};
    wrapRefGo();patch();
    const ov=document.getElementById('overviewPremium');if(ov)new MutationObserver(schedule).observe(ov,{childList:true,subtree:true});
    [120,450,900].forEach(ms=>setTimeout(()=>{wrapRefGo();patch()},ms));
    window.addEventListener('blis:clientdata',schedule);
    window.addEventListener('blis:periodchange',schedule);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
