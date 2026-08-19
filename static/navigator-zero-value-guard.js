/* BLIS Navigator — global zero-value display policy.
   Numeric zero is never presented as a KPI/metric score. A zero/missing display becomes an em dash.
   Raw data in the store is not modified. */
(function(){
  'use strict';
  if(window.__BLISZeroValueGuard)return;
  window.__BLISZeroValueGuard=true;

  const ZERO_ONLY=/^[+\-]?0(?:[.,]0+)?(?:\s*(?:%|\/\s*100|т\.?|бр\.?))?$/i;
  const ZERO_PREFIX=/^0(?:[.,]0+)?(?=\s+(?:измерени|измервания|публикации|споменавания|реакции|активни|наблюдавани|източници|точки|канала?|профила?|резултата?))/i;
  const SELECTORS=[
    '.sm-kpi-value',
    '.sm-channel-metrics b',
    '.sm-chart-meta b',
    '.sm-detail-stats b',
    '.sm-network-feed-head small',
    '.sm-pill',
    '.dv-radar-sector b',
    '.dv-detail-title strong',
    '.dv-detail-metrics b',
    '.dv-kpi-body strong',
    '.ov-kpi-value',
    '.ov-kpi strong',
    '.ref-kpi-value',
    '.ref-kpi strong',
    '.metric-value',
    '.stat-value',
    '.score-value',
    '[class*="kpi-value"]',
    '[class*="metric-value"]',
    '[class*="score-value"]',
    '.page [class*="value"]',
    '.page [class*="score"]',
    '.page [class*="metric"] b',
    '.page [class*="metric"] strong',
    '.page [class*="stat"] b',
    '.page [class*="stat"] strong'
  ].join(',');

  function cleanText(el){return String(el?.textContent||'').replace(/\s+/g,' ').trim()}
  function neutralize(el){
    if(!el||el.nodeType!==1)return;
    if(el.closest('.datebox,.sync,.topbar,.client-switch-menu'))return;
    const t=cleanText(el);
    if(!t)return;
    if(ZERO_ONLY.test(t)){
      el.textContent='—';
      el.dataset.blisZeroHidden='1';
      el.setAttribute('aria-label','Няма налична измерена стойност');
      return;
    }
    if(ZERO_PREFIX.test(t)){
      el.textContent=t.replace(ZERO_PREFIX,'—');
      el.dataset.blisZeroHidden='1';
    }
  }

  function neutralizeSvgTitle(el){
    const t=cleanText(el);
    if(!t)return;
    el.textContent=t
      .replace(/([·:])\s*0(?:[.,]0+)?\s*\/\s*100\b/g,'$1 —')
      .replace(/([·:])\s*0(?:[.,]0+)?\s*%\b/g,'$1 —');
  }

  function scan(root=document){
    try{
      if(root.matches?.(SELECTORS))neutralize(root);
      root.querySelectorAll?.(SELECTORS).forEach(neutralize);
      if(root.matches?.('svg title'))neutralizeSvgTitle(root);
      root.querySelectorAll?.('.page svg title').forEach(neutralizeSvgTitle);
    }catch(e){}
  }

  function init(){
    scan(document);
    const host=document.querySelector('.main')||document.body;
    if(host)new MutationObserver(ms=>{
      for(const m of ms){
        if(m.type==='characterData'){const p=m.target.parentElement;if(p)scan(p);continue}
        m.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)});
      }
    }).observe(host,{subtree:true,childList:true,characterData:true});
    setInterval(()=>scan(document.querySelector('.page.active')||document),1200);
  }

  window.BLISZeroValueGuard={scan};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
