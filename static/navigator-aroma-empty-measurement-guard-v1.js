/* BLIS Navigator — Aroma empty measurement guard v1.
   Client-facing integrity guard: technical post slots and BLIS empty sentinels
   are never shown as measurements. Does not create replacement data. */
(function(){
'use strict';
if(window.__BLIS_AROMA_EMPTY_MEASUREMENT_GUARD_V1)return;
window.__BLIS_AROMA_EMPTY_MEASUREMENT_GUARD_V1=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;

const client=()=>String(new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'').trim();
const empty=/^(?:__BLIS_EMPTY__|__EMPTY__|null|undefined|n\/a)$/i;
const technical=/^post\s*\d+\s*(?:published|url|text|link|title)$/i;
let busy=false;

function isAroma(){return client()==='aroma'}
function cleanPanel(panel){
  if(!panel)return;
  panel.querySelectorAll('.amp-item').forEach(row=>{
    const label=(row.querySelector('b')?.textContent||'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').trim();
    const value=(row.querySelector('strong')?.textContent||'').trim();
    if(technical.test(label)||empty.test(value)||/__BLIS_EMPTY__/i.test(row.textContent||''))row.remove();
  });
  const grid=panel.querySelector('.amp-grid');
  if(!grid)return;
  const count=grid.querySelectorAll('.amp-item').length;
  const counter=panel.querySelector('header>small');
  if(counter)counter.textContent=count?`${count} налични измервания`:'0 налични измервания';
  if(!count&&!grid.querySelector('.aroma-measurements-empty')){
    grid.innerHTML='<div class="aroma-measurements-empty" style="grid-column:1/-1;padding:16px 18px;font-size:11px;line-height:1.5;color:#71869a">Няма ново публично измерване за показване в избрания период. Историческата база остава налична и не се замества с технически стойности.</div>';
  }
}
function clean(){
  if(busy||!isAroma())return;busy=true;
  try{
    document.querySelectorAll('#overview .aroma-measured-panel').forEach(cleanPanel);
    document.querySelectorAll('#overview span,#overview small,#overview b,#overview strong,#overview p,#overview div').forEach(el=>{
      if(el.children.length)return;
      const t=(el.textContent||'').trim();
      if(!empty.test(t))return;
      const row=el.closest('.amp-item,.metric-row,.row,.item,article');
      if(row)row.remove();else el.remove();
    });
    if(document.body)document.body.dataset.aromaEmptyMeasurements='clean';
  }finally{busy=false}
}
function schedule(){requestAnimationFrame(clean);setTimeout(clean,120);setTimeout(clean,500)}
window.addEventListener('blis:clientdata',schedule);
window.addEventListener('blis:routechange',schedule);
window.addEventListener('blis:production-ready',schedule);
const mo=new MutationObserver(()=>{if(!busy&&isAroma())requestAnimationFrame(clean)});
function start(){if(!isAroma())return;mo.observe(document.getElementById('overview')||document.body,{childList:true,subtree:true});schedule()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();