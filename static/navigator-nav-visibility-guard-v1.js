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
function navButtons(active){
 return ITEMS.map(x=>'<button type="button" data-n3-page="'+x[0]+'" class="'+(x[0]===active?'active':'')+'"><span class="navico">'+x[1]+'</span><span class="blis-mobile-label">'+x[2]+'</span></button>').join('');
}
function ensureMobileStyle(){
 if(document.getElementById('blisMobileNavStyle'))return;
 const s=document.createElement('style');s.id='blisMobileNavStyle';s.textContent=`
 #blisMobileNav{display:none}
 @media(max-width:820px){
   .side #nav{display:none!important}
   #blisMobileNav{display:block!important;position:sticky;top:0;z-index:35;margin:0 -14px 14px;padding:10px 12px;background:rgba(248,250,253,.98);border-bottom:1px solid #e2e8f0;box-shadow:0 7px 18px rgba(25,45,76,.05);backdrop-filter:blur(8px)}
   #blisMobileNav .blis-mobile-nav-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;color:#64748b;font-size:9px;font-weight:850;letter-spacing:.045em;text-transform:uppercase}
   #blisMobileNav .blis-mobile-nav-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
   #blisMobileNav button{min-height:44px;border:1px solid #dfe6ee;border-radius:10px;background:#fff;color:#53657a;padding:8px 10px;display:flex;align-items:center;gap:8px;text-align:left;font-size:11px;font-weight:750;box-shadow:0 1px 2px rgba(16,24,40,.02)}
   #blisMobileNav button.active{border-color:#cbdcff;background:#eef4ff;color:#1766e8}
   #blisMobileNav .navico{width:22px;height:22px;display:grid;place-items:center;flex:0 0 22px;font-size:13px}
   #blisMobileNav .blis-mobile-label{display:block!important;visibility:visible!important;opacity:1!important;position:static!important;width:auto!important;height:auto!important;max-width:none!important;clip:auto!important;clip-path:none!important;transform:none!important;line-height:1.25!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;font-size:11px!important;font-weight:800!important;color:inherit!important;text-indent:0!important}
   #blisMobileNav button{grid-template-columns:22px minmax(0,1fr)!important}
 }

 `;document.head.appendChild(s);
}
function ensureMobileNav(){
 ensureMobileStyle();
 const shell=document.querySelector('.main .shell');if(!shell)return;
 let m=document.getElementById('blisMobileNav');
 if(!m){m=document.createElement('nav');m.id='blisMobileNav';m.setAttribute('aria-label','Навигация в профила');const top=shell.querySelector('.topbar');if(top)top.insertAdjacentElement('afterend',m);else shell.prepend(m)}
 const active=canon(current());
 m.innerHTML='<div class="blis-mobile-nav-title"><span>Профил</span><strong>'+((document.querySelector('.client-brand-name')?.textContent||'BLIS Navigator'))+'</strong></div><div class="blis-mobile-nav-grid">'+navButtons(active)+'</div>';
}
function paint(){
 const side=document.querySelector('.side'),nav=document.getElementById('nav');
 if(!side||!nav){ensureMobileNav();return false}
 side.style.setProperty('display','flex','important');
 side.style.setProperty('visibility','visible','important');
 nav.style.setProperty('visibility','visible','important');
 nav.style.setProperty('opacity','1','important');
 if(nav.querySelectorAll('[data-n3-page]').length<ITEMS.length){
   const active=canon(current());
   const core=ITEMS.slice(0,5),res=ITEMS.slice(5);
   const group=(label,rows)=>'<div class="n3-nav-group"><div class="n3-nav-label">'+label+'</div>'+rows.map(x=>'<button type="button" data-n3-page="'+x[0]+'" class="'+(x[0]===active?'active':'')+'"><span class="navico">'+x[1]+'</span><span class="navtxt">'+x[2]+'</span></button>').join('')+'</div>';
   nav.innerHTML=group('МОЯТ БРАНД',core)+group('РЕСУРСИ',res);
 }
 ensureMobileNav();
 return true;
}
function go(id){
 id=canon(id);
 if(window.BLISNavigator3ArchitectureV1?.go){window.BLISNavigator3ArchitectureV1.go(id);return}
 const u=new URL(location.href);u.searchParams.set('page',id);location.href=u.pathname+u.search;
}
document.addEventListener('click',e=>{const b=e.target.closest?.('#nav [data-n3-page],#blisMobileNav [data-n3-page]');if(!b)return;e.preventDefault();e.stopPropagation();go(b.dataset.n3Page);setTimeout(paint,30)},true);
function pulse(){paint();[120,400,1000,2200].forEach(ms=>setTimeout(paint,ms))}
window.addEventListener('blis:production-ready',pulse);
window.addEventListener('blis:clientdata',pulse);
window.addEventListener('resize',paint);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',pulse,{once:true});else pulse();
})();
