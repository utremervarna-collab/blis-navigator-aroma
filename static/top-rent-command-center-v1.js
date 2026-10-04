/* TOP Rent A Car · публичен пазарен команден център */
(function(){
'use strict';
if(window.__TOP_RENT_COMMAND_V1)return;window.__TOP_RENT_COMMAND_V1=true;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function isTop(){return (document.body?.dataset?.client||window.slug)==='top-rent-a-car'}
function renderOps(D){
  const p=D.price_intelligence||{},d=D.demand_intelligence||{},f=D.fleet_allocation||{};
  const priceRows=(p.price_position||[]).map(x=>'<div class="trcc-row"><span>'+esc(x.market)+'</span><b>'+esc(x.state)+'</b></div>').join('');
  const forecast=(d.markets||[]).map(x=>'<div class="trcc-demand"><div class="trcc-demand-top"><b>'+esc(x.market)+'</b><span class="trcc-chip">7 дни: '+esc(x.h7)+'</span></div><span>'+esc(x.fleet_signal||'')+'</span></div>').join('');
  const actions=(f.current_actions||[]).slice(0,3).map(x=>'<div class="trcc-action"><b>'+esc(x.from)+' → '+esc(x.to)+'</b><span>'+esc(x.action)+'</span></div>').join('');
  return '<div class="trcc-ops">'+
    '<div class="trcc-op"><h3>Ценова позиция</h3>'+priceRows+'</div>'+
    '<div class="trcc-op"><h3>Прогноза за търсенето</h3>'+forecast+'</div>'+
    '<div class="trcc-op"><h3>Автопарк</h3>'+actions+'</div>'+
  '</div>';
}
function render(){
  const old=document.getElementById('topRentCommandCenter');if(!isTop()){old?.remove();return}
  const root=document.getElementById('overview');if(!root)return;
  const D=window.D||{};const locs=Array.isArray(D.location_matrix)?D.location_matrix:[];
  const lm=locs.map(x=>'<div class="trcc-loc"><b>'+esc(x.market)+'</b><span>'+esc(x.type)+'<br>'+esc(x.priority)+'</span></div>').join('');
  const updated=D.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'активно';
  const html='<section id="topRentCommandCenter" class="trcc">'+
    '<div class="trcc-head"><div><div class="trcc-kicker">BLIS™ NAVIGATOR</div><div class="trcc-title">TOP Rent A Car</div></div><div class="trcc-live">Последно обновяване<b>'+esc(updated)+'</b></div></div>'+
    '<div class="trcc-grid"><div class="trcc-card"><h3>Пазари</h3><div class="trcc-locs">'+lm+'</div></div></div>'+
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
