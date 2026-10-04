/* TOP Rent A Car · публичен пазарен команден център */
(function(){
'use strict';
if(window.__TOP_RENT_COMMAND_V1)return;window.__TOP_RENT_COMMAND_V1=true;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function isTop(){return (document.body?.dataset?.client||window.slug)==='top-rent-a-car'}
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
  const root=document.getElementById('overview');if(!root)return;
  const D=window.D||{};
  const updated=D.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'активно';
  const html='<section id="topRentCommandCenter" class="trcc">'+
    '<div class="trcc-head"><div class="trcc-brand"><div class="trcc-logo"><img src="https://www.pirinultra.com/assets/media/partners/top_rent_a_car.jpg" alt="TOP Rent A Car"></div><div><div class="trcc-kicker">BLIS™ NAVIGATOR</div><div class="trcc-title">TOP Rent A Car</div></div></div><div class="trcc-live">Последно обновяване<b>'+esc(updated)+'</b></div></div>'+
    renderOps(D)+'</section>';
  let el=old;if(!el){el=document.createElement('div');root.prepend(el)}
  el.outerHTML=html;
}
window.addEventListener('blis:clientdata',()=>setTimeout(render,30));
window.addEventListener('blis:routechange',()=>setTimeout(render,30));
window.addEventListener('popstate',()=>setTimeout(render,30));
document.addEventListener('click',e=>{if(e.target.closest?.('.client-option'))setTimeout(render,180)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(render,100),{once:true});else setTimeout(render,100);
})();
