/* KUB 24/7 monitoring freshness guard. Visible client status only; no layout changes. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
if(window.__KUB_MONITORING_HEALTH_V1)return;window.__KUB_MONITORING_HEALTH_V1=true;
const MAX_FRESH_MS=3*60*1000;
function ensureBadge(){
  const filters=document.querySelector('#monitoring .filters');
  if(!filters)return null;
  let el=document.getElementById('kubMonitoringHealthV1');
  if(!el){
    el=document.createElement('span');el.id='kubMonitoringHealthV1';el.className='filter';
    el.style.marginLeft='auto';el.style.cursor='default';el.style.fontWeight='700';filters.appendChild(el);
  }
  return el;
}
function ageLabel(ms){
  if(ms<60000)return 'преди < 1 мин';
  const m=Math.floor(ms/60000);return 'преди '+m+' мин';
}
function setState(kind,text){
  const el=ensureBadge();if(!el)return;
  el.textContent=text;
  if(kind==='ok'){el.style.color='';el.style.borderColor='';el.style.background='';}
  else if(kind==='warn'){el.style.color='#9a5b00';el.style.borderColor='#e4c48f';el.style.background='#fffaf1';}
  else{el.style.color='#a33';el.style.borderColor='#e0aaaa';el.style.background='#fff6f6';}
}
async function check(){
  try{
    const r=await fetch('/api/signals?client=kub&limit=1&_='+Date.now(),{cache:'no-store'});
    if(!r.ok)throw new Error(String(r.status));
    const d=await r.json();const t=Date.parse(d.updated_at||'');
    if(!Number.isFinite(t)){setState('warn','МОНИТОРИНГ · няма timestamp');return;}
    const age=Math.max(0,Date.now()-t);
    if(age<=MAX_FRESH_MS)setState('ok','LIVE 24/7 · '+ageLabel(age));
    else setState('warn','МОНИТОРИНГЪТ Е ЗАБАВЕН · '+ageLabel(age));
  }catch(e){setState('bad','МОНИТОРИНГ · НЯМА ВРЪЗКА');}
}
function boot(){check();setInterval(check,30000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
