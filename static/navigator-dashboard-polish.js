/* BLIS Navigator dashboard polish — terminology and lightweight post-render normalization. */
(function(){
  const MARKET_LABEL = 'Пазарни сигнали';

  function exactText(el, from, to){
    if(!el) return;
    if((el.textContent || '').trim() === from) el.textContent = to;
  }

  function normalizeTerminology(root=document){
    const marketNav = document.querySelector('#nav button[data-page="market"] span:last-child');
    if(marketNav) marketNav.textContent = MARKET_LABEL;

    root.querySelectorAll('.ref-kpi-top,.ref-title h2,.ref-eyebrow,.ref-head h3').forEach(el=>{
      exactText(el,'Потребителски интерес',MARKET_LABEL);
      exactText(el,'ПОТРЕБИТЕЛСКИ ИНТЕРЕС',MARKET_LABEL.toUpperCase());
    });
  }

  function normalizeMetricValues(root=document){
    root.querySelectorAll('.ref-val').forEach(el=>{
      el.setAttribute('aria-label',(el.textContent || '').replace(/\s+/g,' ').trim());
    });
  }

  function markActivePage(){
    const active = document.querySelector('.page.active');
    if(active && active.id) document.body.dataset.navigatorPage = active.id;
  }

  function polish(root=document){
    normalizeTerminology(root);
    normalizeMetricValues(root);
    markActivePage();
  }

  function init(){
    polish(document);

    const shell = document.querySelector('.shell');
    if(shell){
      const observer = new MutationObserver(mutations=>{
        for(const m of mutations){
          if(m.type === 'childList' || (m.type === 'attributes' && m.attributeName === 'class')){
            polish(document);
            break;
          }
        }
      });
      observer.observe(shell,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    }

    document.addEventListener('click',e=>{
      if(e.target.closest('#nav button')) requestAnimationFrame(()=>polish(document));
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
