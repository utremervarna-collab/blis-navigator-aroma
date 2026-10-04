/* TOP Rent A Car · публичен пазарен команден център */
(function(){
'use strict';
if(window.__TOP_RENT_COMMAND_V1)return;window.__TOP_RENT_COMMAND_V1=true;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function isTop(){return (document.body?.dataset?.client||window.slug)==='top-rent-a-car'}
function renderOps(D){
  const p=D.price_intelligence||{},d=D.demand_intelligence||{},f=D.fleet_allocation||{};
  const prices=(p.published_top_signals||[]).slice(0,7).map(x=>'<div class="trcc-row"><span>'+esc(x.label)+'</span><b>'+esc(x.value)+'</b></div>').join('');
  const scenarios=(p.standard_scenarios||[]).slice(0,12).map(x=>'<div class="trcc-scenario"><b>'+esc(x.iata)+' · '+esc(x.days)+' дни</b><span>'+esc(x.class)+'</span></div>').join('');
  const demands=(d.markets||[]).slice(0,6).map(x=>'<div class="trcc-demand"><div class="trcc-demand-top"><b>'+esc(x.market)+'</b><span class="trcc-chip">7д: '+esc(x.h7)+'</span></div><span>'+esc(x.fleet_signal)+'</span></div>').join('');
  const actions=(f.current_actions||[]).slice(0,4).map(x=>'<div class="trcc-action"><b>'+esc(x.from)+' → '+esc(x.to)+' · '+esc(x.action)+'</b><span>'+esc(x.condition)+'</span></div>').join('');
  return '<div class="trcc-ops">'+
    '<div class="trcc-op"><h3>Ценова позиция</h3>'+prices+'<h4 class="trcc-minihead">Сценарии</h4><div class="trcc-scenarios">'+scenarios+'</div></div>'+
    '<div class="trcc-op"><h3>Прогноза · 7 / 14 / 30 дни</h3>'+demands+'</div>'+
    '<div class="trcc-op"><h3>Разпределение на автопарка</h3>'+actions+'</div>'+
  '</div>';
}
function render(){
  const old=document.getElementById('topRentCommandCenter');if(!isTop()){old?.remove();return}
  const root=document.getElementById('overview');if(!root)return;
  const D=window.D||{};const cc=D.market_command_center||{};const locs=Array.isArray(D.location_matrix)?D.location_matrix:[];
  const pills=(cc.pillars||['Търсене','Цени','Конкуренти','Туристически поток','Репутация','Прогноза']).map(x=>'<div class="trcc-pill">'+esc(x)+'</div>').join('');
  const qs=(cc.decision_questions||[]).map(x=>'<div class="trcc-q">'+esc(x)+'</div>').join('');
  const lm=locs.map(x=>'<div class="trcc-loc"><b>'+esc(x.market)+'</b><span>'+esc(x.type)+'<br>'+esc(x.priority)+'<br>'+esc(x.signals)+'</span></div>').join('');
  const updated=D.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'активно наблюдение';
  const html='<section id="topRentCommandCenter" class="trcc">'+
    '<div class="trcc-head"><div><div class="trcc-kicker">BLIS™ · ПАЗАРНА ИНТЕЛИГЕНТНОСТ</div><div class="trcc-title">TOP Rent A Car · Пазарен команден център</div></div><div class="trcc-live">Последно измерване<b>'+esc(updated)+'</b></div></div>'+
    '<div class="trcc-pills">'+pills+'</div>'+
    '<div class="trcc-grid"><div class="trcc-card"><h3>Въпроси за решение</h3><div class="trcc-questions">'+qs+'</div><div class="trcc-guard">'+esc(cc.price_guard||'Ценовото сравнение се публикува само при съпоставими оферти.')+'</div></div>'+
    '<div class="trcc-card"><h3>Географски радар</h3><div class="trcc-locs">'+lm+'</div></div></div>'+
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
