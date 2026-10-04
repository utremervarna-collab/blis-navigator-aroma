/* TOP Rent A Car · dedicated Market Command Center */
(function(){
'use strict';
if(window.__TOP_RENT_COMMAND_V1)return;window.__TOP_RENT_COMMAND_V1=true;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function isTop(){return (document.body?.dataset?.client||window.slug)==='top-rent-a-car'}
function render(){
  const old=document.getElementById('topRentCommandCenter');if(!isTop()){old?.remove();return}
  const root=document.getElementById('overview');if(!root)return;
  const D=window.D||{};const cc=D.market_command_center||{};const locs=Array.isArray(D.location_matrix)?D.location_matrix:[];
  const pills=(cc.pillars||['Търсене','Цени','Конкуренти','Туристически поток','Репутация','Прогноза']).map(x=>'<div class="trcc-pill">'+esc(x)+'</div>').join('');
  const qs=(cc.decision_questions||[]).map(x=>'<div class="trcc-q">'+esc(x)+'</div>').join('');
  const lm=locs.map(x=>'<div class="trcc-loc"><b>'+esc(x.market)+'</b><span>'+esc(x.type)+'<br>'+esc(x.priority)+'<br>'+esc(x.signals)+'</span></div>').join('');
  const updated=D.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'активно наблюдение';
  const html='<section id="topRentCommandCenter" class="trcc">'+
    '<div class="trcc-head"><div><div class="trcc-kicker">BLIS™ MOBILITY INTELLIGENCE</div><div class="trcc-title">TOP Rent A Car · Market Command Center</div><p class="trcc-sub">Един екран за търсене, ценова позиция, конкурентни движения, туристически поток, репутация и следващо търговско действие.</p></div><div class="trcc-live">Последно измерване<b>'+esc(updated)+'</b></div></div>'+
    '<div class="trcc-pills">'+pills+'</div>'+
    '<div class="trcc-grid"><div class="trcc-card"><h3>Въпроси за решение</h3><div class="trcc-questions">'+qs+'</div><div class="trcc-guard">'+esc(cc.price_guard||'Ценовото сравнение се публикува само при съпоставими оферти.')+'</div></div>'+
    '<div class="trcc-card"><h3>Географски радар</h3><div class="trcc-locs">'+lm+'</div></div></div></section>';
  let el=old;if(!el){el=document.createElement('div');root.prepend(el)}
  el.outerHTML=html;
}
window.addEventListener('blis:clientdata',()=>setTimeout(render,30));
window.addEventListener('blis:routechange',()=>setTimeout(render,30));
window.addEventListener('popstate',()=>setTimeout(render,30));
document.addEventListener('click',e=>{if(e.target.closest?.('.client-option'))setTimeout(render,180)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(render,100),{once:true});else setTimeout(render,100);
})();
