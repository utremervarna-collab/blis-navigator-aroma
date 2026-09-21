/* BLIS Navigator — navigation visibility guard.
   Keeps canonical Navigator 3 navigation visible and usable on hidden/direct profiles,
   including Varna Towers on mobile. */
(function(){
'use strict';
if(window.__BLIS_NAV_VIS_GUARD_V1)return;
window.__BLIS_NAV_VIS_GUARD_V1=true;
const ITEMS=[
 ['overview','▦','Общ изглед'],
 ['social','◎','Мониторинг'],
 ['market','◉','Среда'],
 ['competition','⚑','Конкуренти'],
 ['history','◷','Развитие/Доклади'],
 ['hub','✦','Intelligence HUB'],
 ['calendar','▣','Календар']
];
function current(){try{return new URLSearchParams(location.search).get('page')||document.querySelector('.page.active')?.id||'overview'}catch(_){return'overview'}}
function canon(id){const a={signals:'social',live:'social',digital:'social',opportunities:'social',risk:'social',reputation:'market','market-reputation':'market',reports:'history',timeline:'history',development:'history',intelligence:'hub',events:'calendar'};return a[id]||id}
function paint(){
 const side=document.querySelector('.side'),nav=document.getElementById('nav');
 if(!side||!nav)return false;
 side.style.setProperty('display','flex','important');
 side.style.setProperty('visibility','visible','important');
 nav.style.setProperty('display',matchMedia('(max-width:820px)').matches?'grid':'flex','important');
 nav.style.setProperty('visibility','visible','important');
 nav.style.setProperty('opacity','1','important');
 if(nav.querySelectorAll('[data-n3-page]').length<ITEMS.length){
   const active=canon(current());
   const core=ITEMS.slice(0,5),res=ITEMS.slice(5);
   const group=(label,rows)=>'<div class="n3-nav-group"><div class="n3-nav-label">'+label+'</div>'+rows.map(x=>'<button type="button" data-n3-page="'+x[0]+'" class="'+(x[0]===active?'active':'')+'"><span class="navico">'+x[1]+'</span><span class="navtxt">'+x[2]+'</span></button>').join('')+'</div>';
   nav.innerHTML=group('МОЯТ БРАНД',core)+group('РЕСУРСИ',res);
 }
 return true;
}
function go(id){
 id=canon(id);
 if(window.BLISNavigator3ArchitectureV1?.go){window.BLISNavigator3ArchitectureV1.go(id);return}
 const u=new URL(location.href);u.searchParams.set('page',id);location.href=u.pathname+u.search;
}
document.addEventListener('click',e=>{const b=e.target.closest?.('#nav [data-n3-page]');if(!b)return;e.preventDefault();e.stopPropagation();go(b.dataset.n3Page)},true);
function pulse(){paint();[120,400,1000,2200].forEach(ms=>setTimeout(paint,ms))}
window.addEventListener('blis:production-ready',pulse);
window.addEventListener('blis:clientdata',pulse);
window.addEventListener('resize',paint);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pulse,{once:true});else pulse();
})();
