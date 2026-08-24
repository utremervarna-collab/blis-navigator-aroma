/* BLIS Navigator — canonical client pipeline v1. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_PIPELINE_V1)return;window.__BLIS_CLIENT_PIPELINE_V1=true;
const CLIENTS={
  aroma:{name:'Aroma Cosmetics',full:'Aroma Cosmetics',type:'Козметика',mark:'A'},
  bolyarka:{name:'Болярка',full:'Болярка ВТ АД',type:'Пивоварна компания',mark:'БЛ'},
  'astor-garden':{name:'Astor Garden',full:'Astor Garden Hotel',type:'Хотелиерство',mark:'AG'},
  'varna-towers':{name:'Varna Towers',full:'Varna Towers',type:'Бизнес център / недвижими имоти',mark:'VT'},
  mollox:{name:'MOLLOX',full:'MOLLOX България',type:'Професионална хигиена',mark:'MX'}
};
const valid=k=>!!CLIENTS[k];
const current=()=>{try{const q=new URLSearchParams(location.search).get('client');if(valid(q))return q}catch(_){};try{if(valid(window.slug))return window.slug}catch(_){};const b=document.body?.dataset?.client;if(valid(b))return b;return 'aroma'};
function paint(k){if(!valid(k))return;const c=CLIENTS[k];document.body.dataset.client=k;window.BLIS_INITIAL_CLIENT=k;try{window.slug=k}catch(_){};const sel=document.getElementById('clientSel');if(sel)sel.value=k;document.querySelectorAll('.client-brand-name').forEach(x=>x.textContent=c.full);document.querySelectorAll('.client-brand-type').forEach(x=>x.textContent=c.type);document.querySelectorAll('.client-brand-mark').forEach(x=>x.textContent=c.mark);document.querySelectorAll('.client-option[data-client-key]').forEach(x=>{const on=x.dataset.clientKey===k;x.classList.toggle('active',on);x.setAttribute('aria-selected',on?'true':'false')});document.title=`BLIS Navigator — ${c.name}`}
function select(k){if(!valid(k))return;const u=new URL(location.href);u.pathname='/dashboard.html';u.searchParams.set('client',k);const active=document.querySelector('.page.active')?.id||'overview';u.searchParams.set('page',active);history.replaceState(null,'',u.pathname+u.search);paint(k);const sel=document.getElementById('clientSel');if(sel){sel.value=k;sel.dispatchEvent(new Event('change',{bubbles:true}))}else if(typeof window.load==='function')window.load()}
function boot(){paint(current());document.addEventListener('click',e=>{const o=e.target.closest?.('.client-option[data-client-key]');if(o){e.preventDefault();e.stopPropagation();select(o.dataset.clientKey)}},true);window.addEventListener('blis:clientdata',e=>{const k=e?.detail?.client||current();if(valid(k))paint(k)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BLISClientPipelineV1={select,paint,current};
})();
