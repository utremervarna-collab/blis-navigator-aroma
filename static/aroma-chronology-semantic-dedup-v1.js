/* BLIS Navigator — Aroma chronology semantic dedupe V1
   Collapses the same source-backed story when collectors resolve it through
   more than one URL/fingerprint. Aroma-only; does not create or alter data. */
(function(){
'use strict';
if(window.__BLIS_AROMA_CHRONOLOGY_SEMANTIC_DEDUP_V1)return;
window.__BLIS_AROMA_CHRONOLOGY_SEMANTIC_DEDUP_V1=true;

const N=s=>String(s??'').toLowerCase().replace(/\s+/g,' ').trim();
function currentClient(){
  try{return N(window.BLISClientUIV3?.current?.()||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.D?.slug||'aroma')}
  catch(_){return N(window.D?.slug||'aroma')}
}
function cleanPanel(panel){
  if(currentClient()!=='aroma'||!panel)return;
  const seen=new Set();let kept=0;
  [...panel.querySelectorAll('.aroma-chronology-item')].forEach(row=>{
    const title=N(row.querySelector('.aroma-chronology-main strong')?.textContent);
    const brand=N(row.querySelector('.aroma-chronology-brand')?.textContent);
    const key=`${brand}|${title}`;
    if(title&&seen.has(key)){row.remove();return}
    if(title)seen.add(key);
    kept++;
  });
  const status=panel.querySelector('.aroma-chronology-status');
  if(status&&/^\d+\s+проверени\b/i.test(status.textContent||'')){
    status.textContent=String(status.textContent).replace(/^\d+(?=\s+проверени\b)/i,String(kept));
  }
}
function apply(){
  document.querySelectorAll('#aromaCompetitorChronology,#aromaBrandChronology').forEach(cleanPanel);
}
let timer=0;
function schedule(){clearTimeout(timer);timer=setTimeout(apply,35)}
function start(){
  apply();
  const mo=new MutationObserver(schedule);
  mo.observe(document.body,{subtree:true,childList:true});
  window.addEventListener('blis:periodchange',schedule);
  window.addEventListener('blis:clientdata',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.BLISAromaChronologySemanticDedupV1={apply};
})();
