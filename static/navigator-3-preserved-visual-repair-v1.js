/* BLIS Navigator 3.0 — preserved visual repair v1.
   Repairs ownership/timing around the approved visual modules without replacing them.
   Production main is not affected until the feature branch is explicitly promoted. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_PRESERVED_VISUAL_REPAIR_V1)return;
window.__BLIS_NAVIGATOR_3_PRESERVED_VISUAL_REPAIR_V1=true;

let socialTimer=0,observer=null;

function active(){return document.querySelector('.page.active')?.id||''}
function visible(el){if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}

function css(){
  if(document.getElementById('navigator3PreservedVisualRepairCss'))return;
  const s=document.createElement('style');
  s.id='navigator3PreservedVisualRepairCss';
  s.textContent=`
  /* Overview 3.0 owns the approved Overview Client Home visual in #overviewPremium.
     The old executive wall below it is deliberately removed from the client journey. */
  html[data-navigator-version="3.0-preserved-visuals-5plus2"] #overview > #overviewBody{display:none!important}
  html[data-navigator-version="3.0-preserved-visuals-5plus2"] [data-blis-language-switch],
  html[data-navigator-version="3.0-preserved-visuals-5plus2"] .bch3-lang,
  html[data-navigator-version="3.0-preserved-visuals-5plus2"] #langToggle,
  html[data-navigator-version="3.0-preserved-visuals-5plus2"] .lang-toggle,
  html[data-navigator-version="3.0-preserved-visuals-5plus2"] .language-toggle{display:none!important}
  `;
  document.head.appendChild(s);
}

function forceBulgarian(){
  document.documentElement.lang='bg';
  document.documentElement.dataset.navigatorLanguage='bg-only';
  window.BLIS_LANGUAGE='bg';
  const selectors=['[data-blis-language-switch]','.bch3-lang','#langToggle','.lang-toggle','.language-toggle'];
  document.querySelectorAll(selectors.join(',')).forEach(n=>n.remove());
  document.querySelectorAll('button,a').forEach(n=>{
    const t=(n.textContent||'').replace(/\s+/g,' ').trim().toUpperCase();
    if((t==='EN'||t==='BG | EN'||t==='BG/EN')&&(n.closest('.topbar')||n.closest('#blisUniversalClientContext')))n.remove();
  });
}

function cleanOverview(){
  const page=document.getElementById('overview');
  const premium=document.getElementById('overviewPremium');
  if(!page||!premium)return;
  const legacy=document.getElementById('overviewBody');
  if(legacy)legacy.setAttribute('aria-hidden','true');
  const gauge=premium.querySelector('.ovh-gauge svg');
  if(gauge){
    premium.dataset.n3VisualOwner='overview-client-home-v1';
    gauge.closest('.ovh-gauge')?.setAttribute('data-blis-visual','overview-index');
  }
}

function socialHost(){return document.getElementById('socialBody')||document.getElementById('social')}
function ensureDigitalMount(){
  const h=socialHost();if(!h)return null;
  const mount=h.querySelector('[data-n3-digital-mount]');if(!mount)return null;
  let body=document.getElementById('digitalBody');
  if(!body){body=document.createElement('div');body.id='digitalBody'}
  if(body.parentElement!==mount)mount.appendChild(body);
  return body;
}

function repairSocial(attempt=0){
  clearTimeout(socialTimer);
  if(active()!=='social')return;
  const body=ensureDigitalMount();
  if(!body){if(attempt<10)socialTimer=setTimeout(()=>repairSocial(attempt+1),70);return}
  let radar=body.querySelector('.dv-radar-wrap .dv-radar-grid');
  if(!radar){
    try{window.BLISDigitalRadar?.render?.()}catch(e){console.error('Navigator 3 preserved Radar repair',e)}
    radar=body.querySelector('.dv-radar-wrap .dv-radar-grid');
  }
  if(radar){
    body.dataset.n3VisualOwner='digital-radar';
    body.querySelector('.dv-radar-wrap')?.setAttribute('data-blis-visual','signals-observation');
    const h=socialHost();
    const kpis=h?.querySelector('.dv-kpis');if(kpis)kpis.setAttribute('aria-hidden','true');
    /* If the canonical Radar became available only after the first architecture pass,
       run the architecture once more so its live signal dots are attached to this Radar. */
    if(!body.dataset.n3RepairRerendered){
      body.dataset.n3RepairRerendered='1';
      setTimeout(()=>{if(active()==='social')try{window.BLISNavigator3ArchitectureV1?.render?.()}catch(e){console.error(e)}},20);
    }
    return;
  }
  if(attempt<10)socialTimer=setTimeout(()=>repairSocial(attempt+1),90);
  else document.documentElement.dataset.navigatorRadarRepair='failed';
}

function repair(){
  css();forceBulgarian();cleanOverview();
  if(active()==='social')repairSocial(0);
  document.documentElement.dataset.navigatorPreservedVisualRepair='v1';
}
function schedule(){setTimeout(repair,0);setTimeout(repair,80);setTimeout(repair,260)}

for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange','blis:production-ready'])window.addEventListener(ev,schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
observer=new MutationObserver(()=>{
  forceBulgarian();
  if(active()==='overview')cleanOverview();
});
setTimeout(()=>{try{observer.observe(document.body,{childList:true,subtree:true})}catch(_){}},0);
window.BLISNavigator3PreservedVisualRepairV1={repair,repairSocial,cleanOverview,forceBulgarian};
})();
