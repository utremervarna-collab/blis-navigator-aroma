/* BLIS Navigator — production cleanup guard v4.
   Final event-driven normalization only. No global MutationObserver and no polling. */
(function(){
'use strict';
if(window.__BLIS_PRODUCTION_CLEANUP_V4)return;window.__BLIS_PRODUCTION_CLEANUP_V4=true;

// The standalone services catalogue owns its own commerce UI. Never strip it there.
if(location.pathname==='/services.html')return;

// All shared-dashboard clients are valid here, including hidden legacy profiles.
// Visibility is controlled exclusively by navigator-client-ui.js; this allowlist must
// never rewrite a valid direct owner route to another client identity.
const CLIENTS=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox','wirello','everbet','black-sea-center']);
const PAGES=new Set(['overview','live','social','digital','reputation','market','competition','reports','history','profile','settings','help']);

function currentClient(){
  const q=new URLSearchParams(location.search).get('client');
  if(CLIENTS.has(q))return q;
  const b=document.body?.dataset?.client;if(CLIENTS.has(b))return b;
  const s=document.getElementById('clientSel')?.value;if(CLIENTS.has(s))return s;
  try{if(CLIENTS.has(window.slug))return window.slug}catch(_){}
  return 'aroma';
}
function normalizeNav(){
  const nav=document.getElementById('nav');if(!nav)return;
  [...nav.querySelectorAll('button[data-page]')].forEach(b=>{if(!PAGES.has(String(b.dataset.page||'')))b.remove()});
  const labels={overview:'Общ преглед',live:'Live Monitoring',social:'Сигнали',digital:'Дигитална видимост',reputation:'Репутация',market:'Нагласи',competition:'Конкуренти',reports:'Месечни доклади',history:'История',profile:'Клиентски профил',settings:'Настройки',help:'Помощ'};
  Object.entries(labels).forEach(([id,label])=>{const b=nav.querySelector(`button[data-page="${id}"]`),t=b?.querySelector('.navtxt')||b?.querySelector('span:last-child');if(t&&t.textContent!==label)t.textContent=label});
}
function normalizeClientState(){
  const c=currentClient();
  document.body.dataset.client=c;window.BLIS_INITIAL_CLIENT=c;
  try{window.slug=c}catch(_){}
  const sel=document.getElementById('clientSel');if(sel&&sel.value!==c)sel.value=c;
}
function removeCommerceLeak(){
  document.querySelectorAll('#commerce,.blis-commerce-launch,[data-blis-commerce-open]').forEach(x=>x.remove());
}
function suppressDenseMarkers(root=document){
  root.querySelectorAll?.('.n15-chartdot,.blis-added-point,.blis-curve-point').forEach(x=>x.remove());
  root.querySelectorAll?.('svg[data-curve-key]').forEach(svg=>{
    const circles=[...svg.querySelectorAll(':scope > circle, g > circle')].filter(c=>!c.closest('defs'));
    if(circles.length>12)circles.forEach(c=>c.remove());
  });
}
function installCSS(){
  if(document.getElementById('blisProductionCleanupCSS'))return;
  const s=document.createElement('style');s.id='blisProductionCleanupCSS';s.textContent=`
    .n15-chartdot,.blis-added-point,.blis-curve-point{display:none!important;pointer-events:none!important}
    #commerce,.blis-commerce-launch,[data-blis-commerce-open]{display:none!important}
    .page{max-width:100%!important;box-sizing:border-box!important}
    .page svg{max-width:100%!important}
    html,body{max-width:100%;overflow-x:hidden}
  `;document.head.appendChild(s);
}
function settle(){installCSS();normalizeNav();normalizeClientState();removeCommerceLeak();suppressDenseMarkers(document)}
function schedule(){requestAnimationFrame(settle)}
function scheduleAfterClientRender(){
  schedule();
  // Commerce legacy renderers queue a second animation frame on clientdata.
  // Re-assert the retired launcher after that bounded render pass, without polling.
  setTimeout(schedule,180);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleAfterClientRender,{once:true});else scheduleAfterClientRender();
window.addEventListener('blis:clientdata',scheduleAfterClientRender);
window.addEventListener('blis:periodchange',schedule);
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button[data-page],.client-option[data-client-key]'))scheduleAfterClientRender()},true);
})();
