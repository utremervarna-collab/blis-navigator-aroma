/* TOP Rent A Car · публичен пазарен команден център */
(function(){
'use strict';
if(window.__TOP_RENT_COMMAND_V1)return;window.__TOP_RENT_COMMAND_V1=true;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function isTop(){
  try{
    const q=new URLSearchParams(location.search);
    return String(
      q.get('client')||
      document.body?.dataset?.client||
      window.BLIS_INITIAL_CLIENT||
      window.D?.slug||
      window.slug||
      ''
    ).toLowerCase()==='top-rent-a-car'
  }catch(_){
    return String(document.body?.dataset?.client||window.D?.slug||window.slug||'').toLowerCase()==='top-rent-a-car'
  }
}
function renderOps(D){
  const e=D.executive_overview||{};
  const position=(e.position||[]).map(x=>'<div class="trcc-kpi"><span>'+esc(x.label)+'</span><b>'+esc(x.value)+esc(x.suffix||'')+'</b></div>').join('');
  const s=e.signals_90d||{};
  const signalStats=
    '<div class="trcc-kpi"><span>Споменавания · 90 дни</span><b>'+esc(s.brand??0)+'</b></div>'+
    '<div class="trcc-kpi"><span>Конкурентни споменавания · 90 дни</span><b>'+esc(s.competitor??0)+'</b></div>'+
    '<div class="trcc-kpi"><span>Позитивни сигнали</span><b>'+esc(s.positive??0)+'</b></div>'+
    '<div class="trcc-kpi"><span>Негативни сигнали</span><b>'+esc(s.negative??0)+'</b></div>';
  const outlook=(e.outlook||[]).map(x=>'<div class="trcc-exec-row"><span>'+esc(x.label)+'</span><b>'+esc(x.state)+'</b></div>').join('');
  const scope=(e.company_profile||[]).map(x=>'<div class="trcc-scope-row">'+esc(x)+'</div>').join('');
  const important=(D.signals||[]).slice(0,3).map(x=>'<div class="trcc-signal"><b>'+esc(x.title||'Сигнал')+'</b><span>'+esc(x.source||'')+'</span></div>').join('');
  return '<div class="trcc-exec">'+
    '<div class="trcc-summary">'+esc(e.summary||'')+'</div>'+
    '<div class="trcc-kpis">'+position+signalStats+'</div>'+
    '<div class="trcc-exec-grid">'+
      '<div class="trcc-exec-card"><h3>Текуща картина</h3>'+outlook+'</div>'+
      '<div class="trcc-exec-card"><h3>За TOP Rent A Car</h3>'+scope+'</div>'+
      '<div class="trcc-exec-card"><h3>Последни важни сигнали</h3>'+(important||'<div class="trcc-scope-row">Няма нов значим сигнал.</div>')+'</div>'+
    '</div>'+
  '</div>';
}
function render(){
  const old=document.getElementById('topRentCommandCenter');if(!isTop()){old?.remove();return}
  const root=document.getElementById('overviewPremium')||document.getElementById('overviewBody')||document.getElementById('overview');if(!root)return;
  const D=window.D||{};
  const updated=D.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'активно';
  const html='<section id="topRentCommandCenter" class="trcc">'+
    '<div class="trcc-head"><div class="trcc-brand"><div class="trcc-logo"><img src="https://toprentacar.bg/templates/toprentacar/images/logo.svg" alt="TOP Rent A Car" onerror="this.style.display='none';this.parentNode.classList.add('fallback');this.parentNode.textContent='TOP Rent A Car'"></div><div><div class="trcc-kicker">BLIS™ NAVIGATOR</div><div class="trcc-title">TOP Rent A Car</div><div class="trcc-intro">TOP Rent A Car е национална компания за автомобили под наем с широка мрежа от офиси в България и присъствие на ключови летища. Компанията развива краткосрочни наеми, месечни абонаменти и услуги за мобилност, включително присъствие в Румъния. Този общ изглед показва най-важното за текущата публична позиция на марката, репутацията, конкурентната активност и посоката през последните 90 дни.</div></div></div><div class="trcc-live">Последно обновяване<b>'+esc(updated)+'</b></div></div>'+
    renderOps(D)+'</section>';
  let el=old;
  if(!el){
    el=document.createElement('div');
    root.insertBefore(el,root.firstChild);
  }else if(el.parentNode!==root){
    root.insertBefore(el,root.firstChild);
  }
  el.outerHTML=html;
}
window.addEventListener('blis:clientdata',()=>setTimeout(render,30));
window.addEventListener('blis:routechange',()=>setTimeout(render,30));
window.addEventListener('popstate',()=>setTimeout(render,30));
window.addEventListener('blis:production-ready',()=>setTimeout(render,40));
document.addEventListener('click',e=>{if(e.target.closest?.('.client-option'))setTimeout(render,180)},true);
let obsTimer=0;
const observer=new MutationObserver(()=>{
  if(!isTop())return;
  if(document.getElementById('topRentCommandCenter'))return;
  clearTimeout(obsTimer);obsTimer=setTimeout(render,40);
});
observer.observe(document.documentElement,{childList:true,subtree:true});
[80,220,500,1000,1800].forEach(ms=>setTimeout(render,ms));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(render,60),{once:true});else setTimeout(render,60);
})();
