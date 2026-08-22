/* BLIS Navigator — Digital Visibility truth guard: missing metrics are shown as em dash, never synthetic zero. */
(function(){
  'use strict';
  if(window.__BLISDigitalTruthGuard)return;
  window.__BLISDigitalTruthGuard=true;

  const EXT=['external_visibility','external_presence','referral_visibility','backlink_visibility'];
  const A=x=>Array.isArray(x)?x:[];
  function hasMetric(){
    const d=(typeof D!=='undefined'&&D)||{};
    for(const pool of [A(d.metrics),A(d.indices)])for(const x of pool){
      const k=String(x?.key||x?.metric||x?.name||'').toLowerCase();
      if(EXT.includes(k)&&Number.isFinite(Number(x?.value)))return true;
    }
    return false;
  }
  function dashText(el){
    if(!el)return false;
    if((el.textContent||'').trim()==='—')return false;
    el.textContent='—';return true;
  }
  function dashHTML(el){
    if(!el)return false;
    if((el.textContent||'').trim()==='—'&&el.children.length===0)return false;
    el.textContent='—';return true;
  }
  function patch(){
    if(hasMetric())return false;
    const root=document.getElementById('digitalBody');if(!root)return false;
    let changed=false;
    changed=dashText(root.querySelector('.dv-radar-sector.external b'))||changed;
    changed=dashHTML(root.querySelector('.dv-kpi.external .dv-kpi-body strong'))||changed;
    const detailTitle=root.querySelector('#dvDetail h3');
    if(detailTitle&&/Външна видимост/.test(detailTitle.textContent||'')){
      changed=dashText(root.querySelector('#dvDetail .dv-detail-title strong'))||changed;
      const rows=[...root.querySelectorAll('#dvDetail .dv-detail-metrics>div')];
      const main=rows.find(x=>(x.textContent||'').includes('Основна стойност'))?.querySelector('b');
      changed=dashText(main)||changed;
    }
    return changed;
  }
  document.addEventListener('click',e=>{if(e.target?.closest?.('#digitalBody [data-sector="external"]'))setTimeout(patch,0)},true);
  const target=document.getElementById('digitalBody');
  if(target){
    let scheduled=false;
    new MutationObserver(()=>{
      if(scheduled)return;scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;patch()});
    }).observe(target,{childList:true,subtree:true});
  }
  patch();
  window.BLISDigitalTruthPatch=patch;
})();
