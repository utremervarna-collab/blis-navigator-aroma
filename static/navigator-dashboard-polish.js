/* BLIS Navigator dashboard polish — terminology and lightweight post-render normalization. */
(function(){
  const replacements = new Map([
    ['Потребителски интерес','Пазарни сигнали'],
    ['ПОТРЕБИТЕЛСКИ ИНТЕРЕС','ПАЗАРНИ СИГНАЛИ'],
    ['Дял от вниманието','Дял от публичната видимост'],
    ['ДЯЛ ОТ ВНИМАНИЕТО','ДЯЛ ОТ ПУБЛИЧНАТА ВИДИМОСТ']
  ]);

  function normalizeText(root=document){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
      acceptNode(node){
        const p=node.parentElement;
        if(!p || /^(SCRIPT|STYLE|NOSCRIPT)$/i.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node=>{
      let t=node.nodeValue;
      replacements.forEach((to,from)=>{ if(t && t.includes(from)) t=t.split(from).join(to); });
      if(t!==node.nodeValue) node.nodeValue=t;
    });
  }

  function normalizeMetricValues(root=document){
    root.querySelectorAll('.ref-val').forEach(el=>{
      const raw=(el.textContent || '').replace(/\s+/g,' ').trim();
      el.setAttribute('aria-label',raw);
      const core=raw.replace('/100','').trim();
      const empty=!core || core==='—' || core==='–' || core==='-';
      el.dataset.empty=empty?'true':'false';
      if(empty){
        const normalized='<span>—</span>';
        if(el.innerHTML!==normalized) el.innerHTML=normalized;
        const card=el.closest('.ref-kpi');
        if(card && !card.querySelector('.ref-metric-note')){
          const note=document.createElement('div');
          note.className='ref-metric-note';
          note.textContent='Натрупва се сравнима база';
          el.insertAdjacentElement('afterend',note);
        }
      }
    });
  }

  function normalizeBranding(){
    const brand=document.querySelector('.side .brand');
    if(!brand) return;
    const name=brand.querySelector('.brandname');
    const sub=brand.querySelector('.brandsub');
    const wantedName='BLIS<sup>™</sup><span class="navigator-word">NAVIGATOR 2.0</span>';
    const wantedSub='Brand Lab Intelligence System';
    if(name && name.innerHTML!==wantedName) name.innerHTML=wantedName;
    if(sub && sub.textContent!==wantedSub) sub.textContent=wantedSub;
  }

  function markActivePage(){
    const active=document.querySelector('.page.active');
    if(active && active.id) document.body.dataset.navigatorPage=active.id;
  }

  function polish(root=document){
    normalizeText(root);
    normalizeMetricValues(root);
    normalizeBranding();
    markActivePage();
  }

  function init(){
    polish(document);
    const shell=document.querySelector('.shell');
    if(shell){
      let scheduled=false;
      const observer=new MutationObserver(()=>{
        if(scheduled) return;
        scheduled=true;
        requestAnimationFrame(()=>{scheduled=false;polish(document);});
      });
      observer.observe(shell,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    }
    document.addEventListener('click',e=>{
      if(e.target.closest('#nav button')) requestAnimationFrame(()=>polish(document));
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
