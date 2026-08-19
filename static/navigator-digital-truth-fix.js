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
  function patch(){
    if(hasMetric())return;
    const root=document.getElementById('digitalBody');if(!root)return;
    const radar=root.querySelector('.dv-radar-sector.external b');if(radar)radar.textContent='—';
    const kpi=root.querySelector('.dv-kpi.external .dv-kpi-body strong');if(kpi)kpi.innerHTML='—';
    const detailTitle=root.querySelector('#dvDetail h3');
    if(detailTitle&&/Външна видимост/.test(detailTitle.textContent||'')){
      const score=root.querySelector('#dvDetail .dv-detail-title strong');if(score)score.textContent='—';
      const rows=[...root.querySelectorAll('#dvDetail .dv-detail-metrics>div')];
      const main=rows.find(x=>(x.textContent||'').includes('Основна стойност'))?.querySelector('b');if(main)main.textContent='—';
    }
  }
  document.addEventListener('click',e=>{if(e.target?.closest?.('#digitalBody [data-sector="external"]'))setTimeout(patch,0)},true);
  const target=document.getElementById('digitalBody');if(target)new MutationObserver(()=>requestAnimationFrame(patch)).observe(target,{childList:true,subtree:true});
  let n=0;const t=setInterval(()=>{n++;patch();if(n>35)clearInterval(t)},140);
})();
