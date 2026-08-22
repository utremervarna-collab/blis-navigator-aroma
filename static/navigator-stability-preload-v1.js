/* BLIS Navigator — stability preload v1.
   Stops legacy repaint timers before they are registered, keeps final nav terminology stable,
   and prevents readiness guards from blanking whole modules while optional visuals settle. */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV1)return;window.__BLISStabilityPreloadV1=true;

const nativeSetInterval=window.setInterval.bind(window);
const nativeSetTimeout=window.setTimeout.bind(window);
const fnText=fn=>{try{return typeof fn==='function'?Function.prototype.toString.call(fn):String(fn||'')}catch(_){return''}};

function isLegacyRepaintInterval(fn,delay){
 const d=Number(delay)||0,name=typeof fn==='function'?(fn.name||''):'',src=fnText(fn);
 if(d===120&&(name==='tick'||/copy\(\);\s*rep\(\);\s*market\(\);\s*competition\(\)/.test(src)))return true;
 if(d===700&&(name==='patchAll'||/patchOverview\(\).*patchLive\(\).*patchCompetition\(\)/s.test(src)))return true;
 if(d===1000&&/marketInsights\(\)/.test(src)&&/installRouter\(\)/.test(src))return true;
 if(d===1000&&name==='tick'&&/mount\(\)/.test(src)&&/att-v2-clock/.test(src))return true;
 return false;
}
window.setInterval=function(fn,delay,...args){
 if(isLegacyRepaintInterval(fn,delay))return 0;
 return nativeSetInterval(fn,delay,...args);
};

window.setTimeout=function(fn,delay,...args){
 const d=Number(delay)||0,name=typeof fn==='function'?(fn.name||''):'',src=fnText(fn);
 /* Architecture V15 used two extra full rerenders after every route change. */
 if((d===90||d===240)&&name==='renderActive')return 0;
 /* Its Competition mutation observer scheduled another full enhancement pass. */
 if(d===90&&name==='competitionTune')return 0;
 /* navigator-reference also scheduled a second full boot 700 ms after load. */
 if(d===700&&name==='boot'&&/ensurePages\(\)/.test(src)&&/refGo\('overview'\)/.test(src))return 0;
 return nativeSetTimeout(fn,delay,...args);
};

const FINAL_NAV=[
 ['overview','Общ преглед'],['live','Live Monitoring'],['social','Сигнали'],['digital','Видимост'],
 ['reputation','Репутация'],['market','Нагласи'],['competition','Конкуренти'],['reports','Месечни доклади'],
 ['history','История'],['profile','Клиентски профил'],['settings','Настройки'],['help','Помощ']
];
const finalIds=new Set(FINAL_NAV.map(x=>x[0]));
let navObserver=null,navBusy=false;
function stabilizeNav(){
 const nav=document.getElementById('nav');if(!nav||navBusy)return;
 navBusy=true;
 try{
   nav.querySelectorAll('button[data-page]').forEach(b=>{if(!finalIds.has(b.dataset.page))b.remove()});
   const byId=new Map([...nav.querySelectorAll('button[data-page]')].map(b=>[b.dataset.page,b]));
   FINAL_NAV.forEach(([id,label])=>{
     const b=byId.get(id);if(!b)return;
     const t=b.querySelector('.navtxt')||b.querySelector('span:last-child');
     if(t&&t.textContent!==label)t.textContent=label;
   });
   const order=[...nav.querySelectorAll('button[data-page]')].map(b=>b.dataset.page);
   nav.dataset.blisStable=order.length===FINAL_NAV.length&&FINAL_NAV.every((x,i)=>order[i]===x[0])?'1':'0';
 }finally{navBusy=false}
}
function watchNav(){
 const nav=document.getElementById('nav');if(!nav)return;
 stabilizeNav();
 if(navObserver)return;
 navObserver=new MutationObserver(stabilizeNav);
 navObserver.observe(nav,{childList:true,subtree:true,characterData:true});
}

function keepBodiesPainted(){
 ['reputationBody','marketBody','competitionBody'].forEach(id=>{
   const el=document.getElementById(id);if(!el)return;
   el.style.setProperty('visibility','visible','important');
   el.style.setProperty('opacity','1','important');
 });
}
function boot(){
 const st=document.createElement('style');st.id='blisStabilityPreloadCSS';st.textContent=`
   #nav[data-blis-stable="0"]{opacity:0!important}
   #nav[data-blis-stable="1"]{opacity:1!important}
   #nav{transition:none!important}
 `;document.head.appendChild(st);
 watchNav();keepBodiesPainted();
 document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-page]'))requestAnimationFrame(()=>{stabilizeNav();keepBodiesPainted()})},true);
 window.addEventListener('blis:clientdata',()=>requestAnimationFrame(()=>{stabilizeNav();keepBodiesPainted()}));
 window.addEventListener('blis:periodchange',()=>requestAnimationFrame(keepBodiesPainted));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
