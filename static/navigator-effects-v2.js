/* BLIS Navigator — secondary micro motion */
(function(){
  const seen=new WeakSet();
  function numericText(el){const raw=(el.textContent||'').trim().replace(',','.');return /^-?\d+(\.\d+)?$/.test(raw)?Number(raw):null}
  function count(el){
    const target=numericText(el);if(target===null||seen.has(el))return;seen.add(el);
    const decimals=Number.isInteger(target)?0:1,duration=760,start=performance.now();el.classList.add('blis-counting');
    function frame(now){const p=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-p,3),v=target*ease;el.textContent=v.toLocaleString('bg-BG',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});if(p<1)requestAnimationFrame(frame);else{el.textContent=target.toLocaleString('bg-BG',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});setTimeout(()=>el.classList.remove('blis-counting'),220)}}requestAnimationFrame(frame)
  }
  function activate(page){if(!page)return;page.querySelectorAll('.ov-kpi-value strong,.ref-val').forEach(count)}
  function run(){activate(document.querySelector('.page.active'))}
  function init(){run();document.querySelectorAll('.page').forEach(page=>new MutationObserver(()=>{if(page.classList.contains('active'))setTimeout(()=>activate(page),45)}).observe(page,{attributes:true,attributeFilter:['class']}));document.addEventListener('click',e=>{if(e.target.closest('#nav button'))setTimeout(run,70)})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* Shared period selector/filter + client runtime only. Overview is rendered by navigator-overview-master.js. */
(function(){
  function loadScript(src,next){var s=document.createElement('script');s.src=src;s.onload=function(){if(next)next()};document.head.appendChild(s)}
  loadScript('/navigator-period-filter.js?v=20260817-4',function(){
    loadScript('/navigator-period-runtime.js?v=20260817-3',function(){
      loadScript('/navigator-client-runtime-fix.js?v=20260817-2');
    });
  });
})();
