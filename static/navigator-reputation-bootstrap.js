/* BLIS Navigator — robust Reputation boot controller, mirroring Digital Visibility architecture. */
(function(){
'use strict';
if(window.__BLISReputationBoot)return;window.__BLISReputationBoot=true;

function loadPolishStyle(){
  let l=document.querySelector('link[data-blis-reputation-polish]');
  if(!l){l=document.createElement('link');l.rel='stylesheet';l.dataset.blisReputationPolish='1';document.head.appendChild(l)}
  l.href='/navigator-reputation-polish.css?v=20260819-reputation29';
}
function loadRefineStyle(){
  let l=document.querySelector('link[data-blis-reputation-refine30]');
  if(!l){l=document.createElement('link');l.rel='stylesheet';l.dataset.blisReputationRefine30='1';document.head.appendChild(l)}
  l.href='/navigator-reputation-refine-v30.css?v=20260819-reputation31';
}
function loadRealDataPatch(){
  if(document.querySelector('script[data-blis-reputation-real29]'))return;
  const s=document.createElement('script');
  s.src='/navigator-reputation-data-v29.js?v=20260819-reputation29';
  s.dataset.blisReputationReal29='1';
  s.onload=()=>setTimeout(()=>window.BLISReputationRealDataV29?.sync?.(),40);
  document.head.appendChild(s);
}
function loadRefinePatch(){
  if(document.querySelector('script[data-blis-reputation-refine30]'))return;
  const s=document.createElement('script');
  s.src='/navigator-reputation-refine-v30.js?v=20260819-reputation31';
  s.dataset.blisReputationRefine30='1';
  s.onload=()=>setTimeout(()=>window.BLISReputationRefineV30?.apply?.(),80);
  document.head.appendChild(s);
}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null}
function currentDashboard(){try{return typeof D!=='undefined'&&D?D:{}}catch(e){return{}}}
function metric(keys){
  const d=currentDashboard(),wanted=keys.map(x=>String(x).toLowerCase());
  for(const pool of [Array.isArray(d.indices)?d.indices:[],Array.isArray(d.metrics)?d.metrics:[]]){
    for(const x of pool){
      const k=String(x?.key||x?.metric||x?.name||'').toLowerCase();
      if(wanted.includes(k)){const v=num(x?.value);if(v!==null)return v}
    }
  }
  return null;
}
function kpiByLabel(label){return [...document.querySelectorAll('#reputationBody .rp-kpi')].find(x=>x.querySelector(':scope>span')?.textContent?.trim()===label)||null}
function polishTruth(){
  const root=document.getElementById('reputationBody');
  if(!root||!document.getElementById('reputation')?.classList.contains('active'))return;
  const stability=kpiByLabel('Устойчивост');
  if(stability&&!root.dataset.rpHydrated){
    const v=metric(['stability','reputation_stability','stability_index','reputation_stability_index']);
    const strong=stability.querySelector('strong'),foot=stability.querySelector(':scope>small');
    if(v===null){stability.dataset.rpTruth='missing';if(strong)strong.innerHTML='<span class="rp-na">—</span>';if(foot)foot.textContent='Няма отделно измерен показател за устойчивост'}
    else{stability.dataset.rpTruth='measured';if(strong)strong.innerHTML=`${v.toLocaleString('bg-BG',{maximumFractionDigits:1})}<small>/100</small>`;if(foot)foot.textContent='Измерен показател за устойчивост'}
  }
  const pressure=kpiByLabel('Репутационен риск')||kpiByLabel('Репутационен натиск');
  if(pressure&&!root.dataset.rpHydrated){
    const v=metric(['reputation_pressure','risk_index','reputation_risk']);
    const d=currentDashboard(),hasSignals=Array.isArray(d.signals),strong=pressure.querySelector('strong'),foot=pressure.querySelector(':scope>small');
    if(v===null&&!hasSignals){pressure.dataset.rpTruth='missing';if(strong)strong.innerHTML='<span class="rp-na">—</span>';if(foot)foot.textContent='Няма измерен рисков индекс или набор от сигнали'}
  }
}
function hydrateSoon(delay=70){setTimeout(()=>window.BLISReputationRealDataV29?.sync?.(),delay)}
function refineSoon(delay=120){setTimeout(()=>window.BLISReputationRefineV30?.apply?.(),delay)}
function renderSoon(delay=40){setTimeout(()=>{try{if(document.getElementById('reputation')?.classList.contains('active')){window.BLISReputation?.render?.();setTimeout(polishTruth,25);hydrateSoon(70);refineSoon(150);if(!window.BLISReputation?._refreshed){window.BLISReputation._refreshed=true;setTimeout(()=>window.BLISReputation?.refresh?.(),80)}}}catch(e){console.error('BLIS Reputation render failed',e)}},delay)}
function wrapRefGo(){const old=window.refGo;if(typeof old!=='function'||old.__reputationBoot)return false;const wrapped=function(id){const r=old.apply(this,arguments);if(id==='reputation'){renderSoon(20);renderSoon(140);renderSoon(360)}return r};wrapped.__reputationBoot=true;wrapped.__previous=old;window.refGo=wrapped;return true}
function clientRefresh(){try{window.BLISReputation._refreshed=false;window.BLISReputation?.onClient?.();renderSoon(80);renderSoon(260);hydrateSoon(340);refineSoon(430)}catch(e){}}
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="reputation"]')){renderSoon(20);renderSoon(160);renderSoon(420)}},true);
document.getElementById('clientSel')?.addEventListener('change',()=>setTimeout(clientRefresh,130));
function init(){
  loadPolishStyle();
  loadRefineStyle();
  loadRealDataPatch();
  loadRefinePatch();
  wrapRefGo();
  if(document.getElementById('reputation')?.classList.contains('active'))renderSoon(10);
  let n=0;const t=setInterval(()=>{n++;wrapRefGo();const page=document.getElementById('reputation');if(page?.classList.contains('active')&&!page.querySelector('.rp-screen'))renderSoon(20);if(page?.classList.contains('active')){polishTruth();window.BLISReputationRealDataV29?.sync?.();window.BLISReputationRefineV30?.apply?.()}if(n>45)clearInterval(t)},180);
  const body=document.body;if(body)new MutationObserver(ms=>{if(ms.some(m=>m.type==='attributes'&&m.attributeName==='data-client'))clientRefresh()}).observe(body,{attributes:true,attributeFilter:['data-client']});
  const root=document.getElementById('reputationBody');if(root)new MutationObserver(()=>{if(document.getElementById('reputation')?.classList.contains('active')){setTimeout(polishTruth,0);hydrateSoon(100);refineSoon(180)}}).observe(root,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
