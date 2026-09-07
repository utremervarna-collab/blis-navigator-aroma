/* BLIS Navigator: narrow title lock for the Environment key-factors network. */
(function(){
'use strict';
if(window.__BLIS_KEY_FACTORS_TITLE_LOCK_V1)return;window.__BLIS_KEY_FACTORS_TITLE_LOCK_V1=true;
const OLD=/^(?:Интерактивна карта на възприятията|Карта на възприятията|Ключови фактори в информационната среда)$/i;
function ownText(el,text){
 if(!el)return;
 for(const n of el.childNodes){
  if(n.nodeType===3&&String(n.nodeValue||'').trim()){
   if(String(n.nodeValue||'').trim()!==text)n.nodeValue=text+' ';
   return;
  }
 }
 if((el.textContent||'').trim()!==text)el.insertBefore(document.createTextNode(text+' '),el.firstChild);
}
function apply(){
 const nav=document.querySelector('#nav [data-page="market"],#nav [data-n3-page="market"]');
 if(nav){const l=nav.querySelector('.navtxt')||nav.querySelector('span:last-child');if(l&&l.textContent!=='Ключови фактори')l.textContent='Ключови фактори'}
 const market=document.getElementById('market');
 if(market){market.querySelectorAll('h1,h2,h3,h4').forEach(el=>{if(OLD.test((el.textContent||'').trim()))ownText(el,'Ключови фактори')})}
 const active=document.getElementById('blisActiveModule');
 if(active&&OLD.test((active.textContent||'').trim()))active.textContent='Ключови фактори';
}
function install(){
 apply();
 const market=document.getElementById('market');
 if(!market){setTimeout(install,100);return}
 const mo=new MutationObserver(()=>apply());
 mo.observe(market,{subtree:true,childList:true,characterData:true});
 for(const ev of ['blis:intelligence','blis:routechange','blis:navigator-route','blis:clientdata','popstate'])window.addEventListener(ev,()=>setTimeout(apply,0));
 setTimeout(apply,250);setTimeout(apply,750);setTimeout(apply,1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
