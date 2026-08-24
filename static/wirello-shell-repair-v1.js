/* Wirello Market — shell geometry repair v1.
   Last-layer, Wirello-only correction for sidebar clipping, client card geometry,
   navigation alignment and main content offset. Keeps the canonical 224px sidebar. */
(function(){
'use strict';
if(window.__WIRELLO_SHELL_REPAIR_V1)return;window.__WIRELLO_SHELL_REPAIR_V1=true;
const isWirello=()=>document.body?.dataset?.client==='wirello'||window.BLIS_INITIAL_CLIENT==='wirello'||new URLSearchParams(location.search).get('client')==='wirello';
const imp=(el,p,v)=>el&&el.style.setProperty(p,v,'important');
let fixing=false;
function css(){
 if(!isWirello()||document.getElementById('wirello-shell-repair-v1-style'))return;
 const s=document.createElement('style');s.id='wirello-shell-repair-v1-style';s.textContent=`
 html,body[data-client="wirello"]{margin:0!important;padding:0!important;overflow-x:hidden!important}
 body[data-client="wirello"] .app{display:grid!important;grid-template-columns:224px minmax(0,1fr)!important;width:100%!important;max-width:100%!important;min-height:100vh!important;margin:0!important;padding:0!important;transform:none!important;left:auto!important}
 body[data-client="wirello"] .side{position:fixed!important;left:0!important;right:auto!important;top:0!important;bottom:0!important;width:224px!important;min-width:224px!important;max-width:224px!important;height:100vh!important;margin:0!important;padding:0!important;transform:none!important;translate:none!important;overflow:hidden!important;clip-path:none!important;box-sizing:border-box!important}
 body[data-client="wirello"] .side>.brand{width:100%!important;max-width:100%!important;margin:0!important;padding:20px 18px 16px!important;transform:none!important;translate:none!important;overflow:visible!important;box-sizing:border-box!important}
 body[data-client="wirello"] .side .brandname,body[data-client="wirello"] .side .brandsub{margin-left:0!important;padding-left:0!important;transform:none!important;translate:none!important;max-width:100%!important;overflow:visible!important}
 body[data-client="wirello"] .side .brandname{white-space:nowrap!important}
 body[data-client="wirello"] .side .brandsub{font-size:8.5px!important;line-height:1.35!important;letter-spacing:.09em!important;white-space:normal!important}
 body[data-client="wirello"] .side .clientbox{position:relative!important;left:auto!important;right:auto!important;width:calc(100% - 20px)!important;max-width:204px!important;min-width:0!important;margin:12px 10px 8px!important;padding:0!important;transform:none!important;translate:none!important;overflow:visible!important;box-sizing:border-box!important}
 body[data-client="wirello"] .client-switch,body[data-client="wirello"] .client-switch-button{left:auto!important;right:auto!important;width:100%!important;max-width:100%!important;min-width:0!important;transform:none!important;translate:none!important;box-sizing:border-box!important}
 body[data-client="wirello"] .client-switch-button{min-height:70px!important;padding:8px!important;grid-template-columns:34px minmax(0,1fr) 14px!important;gap:7px!important;overflow:hidden!important}
 body[data-client="wirello"] .client-brand-mark{width:34px!important;height:34px!important;min-width:34px!important;font-size:10px!important;transform:none!important}
 body[data-client="wirello"] .client-brand-copy{min-width:0!important;max-width:100%!important;overflow:hidden!important}
 body[data-client="wirello"] .client-brand-name{font-size:11px!important;line-height:1.15!important;letter-spacing:-.02em!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
 body[data-client="wirello"] .client-brand-type{font-size:7.8px!important;line-height:1.2!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
 body[data-client="wirello"] .client-brand-status{font-size:7px!important;line-height:1.2!important;gap:4px!important;white-space:normal!important;overflow:visible!important}
 body[data-client="wirello"] .client-brand-status:before{width:4px!important;height:4px!important;min-width:4px!important;box-shadow:none!important}
 body[data-client="wirello"] .client-switch-chevron{width:14px!important;min-width:14px!important;transform:none!important}
 body[data-client="wirello"] #nav{width:100%!important;max-width:100%!important;margin:0!important;padding:6px 8px 10px!important;transform:none!important;translate:none!important;overflow-x:hidden!important;box-sizing:border-box!important}
 body[data-client="wirello"] #nav button{left:auto!important;right:auto!important;width:100%!important;max-width:100%!important;margin:0!important;padding:0 9px!important;gap:8px!important;transform:none!important;translate:none!important;overflow:hidden!important;box-sizing:border-box!important}
 body[data-client="wirello"] #nav .navico{width:20px!important;min-width:20px!important;height:20px!important;transform:none!important;translate:none!important}
 body[data-client="wirello"] #nav .navtxt{display:block!important;min-width:0!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;transform:none!important;translate:none!important}
 body[data-client="wirello"] .dashboard-home-link{left:auto!important;width:auto!important;max-width:calc(100% - 20px)!important;margin:8px 10px 11px!important;transform:none!important;translate:none!important;overflow:hidden!important;box-sizing:border-box!important}
 body[data-client="wirello"] .main{grid-column:2!important;grid-row:1!important;min-width:0!important;width:auto!important;max-width:none!important;margin:0!important;padding:0!important;left:auto!important;right:auto!important;transform:none!important;translate:none!important;overflow:visible!important}
 body[data-client="wirello"] .shell{width:100%!important;max-width:none!important;min-width:0!important;margin:0!important;padding-left:28px!important;padding-right:28px!important;transform:none!important;translate:none!important;box-sizing:border-box!important}
 @media(max-width:820px){body[data-client="wirello"] .app{display:block!important}body[data-client="wirello"] .side{position:relative!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important}body[data-client="wirello"] .main{display:block!important}body[data-client="wirello"] .side .clientbox{max-width:none!important}}
 `;document.head.appendChild(s);
}
function fix(){
 if(!isWirello()||fixing)return;fixing=true;
 try{
  css();
  const side=document.querySelector('.side'),brand=side?.querySelector('.brand'),client=side?.querySelector('.clientbox'),nav=document.getElementById('nav'),main=document.querySelector('.main'),shell=document.querySelector('.shell');
  if(side){imp(side,'left','0');imp(side,'width','224px');imp(side,'min-width','224px');imp(side,'max-width','224px');imp(side,'margin','0');imp(side,'transform','none');side.scrollLeft=0}
  if(brand){imp(brand,'margin','0');imp(brand,'width','100%');imp(brand,'transform','none')}
  if(client){imp(client,'left','auto');imp(client,'width','calc(100% - 20px)');imp(client,'max-width','204px');imp(client,'margin','12px 10px 8px');imp(client,'transform','none')}
  if(nav){imp(nav,'width','100%');imp(nav,'margin','0');imp(nav,'transform','none');nav.scrollLeft=0;nav.querySelectorAll('button').forEach(b=>{imp(b,'width','100%');imp(b,'margin','0');imp(b,'transform','none')})}
  if(main){imp(main,'grid-column','2');imp(main,'margin','0');imp(main,'transform','none')}
  if(shell){imp(shell,'margin','0');imp(shell,'transform','none')}
  document.documentElement.scrollLeft=0;document.body.scrollLeft=0;
 }finally{fixing=false}
}
function schedule(){[0,30,90,180,420,900,1600].forEach(ms=>setTimeout(fix,ms))}
function init(){if(!isWirello())return;css();schedule();const side=document.querySelector('.side');if(side)new MutationObserver(()=>{if(!fixing)requestAnimationFrame(fix)}).observe(side,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
document.addEventListener('click',e=>{if(e.target?.closest?.('#nav,.client-switch,.dashboard-home-link'))schedule()},true);
window.addEventListener('resize',schedule);
window.addEventListener('blis:clientdata',schedule);
window.addEventListener('popstate',schedule);
window.addEventListener('hashchange',schedule);
})();