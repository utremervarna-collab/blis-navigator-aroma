/* BLIS Navigator — canonical visual client switcher v3.
   app.js owns data loading. This module never wraps routes. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_UI_V3)return;window.__BLIS_CLIENT_UI_V3=true;
const clients={
  aroma:{name:'Aroma Cosmetics',full:'Aroma Cosmetics',type:'Козметика',mark:'A'},
  bolyarka:{name:'Болярка',full:'Болярка ВТ АД',type:'Пивоварна компания',mark:'БЛ'},
  'astor-garden':{name:'Astor Garden',full:'Astor Garden Hotel',type:'Хотелиерство',mark:'AG'},
  'varna-towers':{name:'Varna Towers',full:'Varna Towers',type:'Бизнес център / недвижими имоти',mark:'VT'},
  mollox:{name:'MOLLOX',full:'MOLLOX България',type:'Професионална хигиена',mark:'MX'},
  wirello:{name:'Wirello Market',full:'Wirello Market',type:'Търговска верига / модерен ритейл',mark:'WM'},
  everbet:{name:'Everbet',full:'Everbet',type:'Онлайн казино и спортни залози',mark:'EB'}
};
const valid=k=>!!clients[k];
const greeting=()=>{const h=new Date().getHours();return h>=5&&h<12?'Добро утро':h>=12&&h<18?'Добър ден':'Добър вечер'};
function current(){
  try{const q=new URLSearchParams(location.search).get('client');if(valid(q))return q}catch(_){}
  try{if(valid(window.slug))return window.slug}catch(_){}
  const b=document.body?.dataset?.client;if(valid(b))return b;
  const s=document.getElementById('clientSel')?.value;if(valid(s))return s;
  return 'aroma';
}
function paint(key){
  if(!valid(key))key='aroma';const c=clients[key];
  document.body.dataset.client=key;window.BLIS_INITIAL_CLIENT=key;
  document.querySelectorAll('.client-brand-name').forEach(x=>x.textContent=c.full);
  document.querySelectorAll('.client-brand-type').forEach(x=>x.textContent=c.type);
  document.querySelectorAll('.client-brand-mark').forEach(x=>x.textContent=c.mark);
  document.querySelectorAll('.client-option[data-client-key]').forEach(x=>{const on=x.dataset.clientKey===key;x.classList.toggle('active',on);x.setAttribute('aria-selected',on?'true':'false');const ck=x.querySelector('.client-option-check');if(ck)ck.textContent=on?'✓':''});
  const title=document.querySelector('.topbar .title h1');if(title)title.textContent=`${greeting()}, ${c.name}!`;
  document.body.classList.add('greeting-ready');document.title=`BLIS Navigator — ${c.name}`;
}
function close(){const w=document.querySelector('.client-switch'),b=document.querySelector('.client-switch-button');w?.classList.remove('open');b?.setAttribute('aria-expanded','false')}
function toggle(){const w=document.querySelector('.client-switch'),b=document.querySelector('.client-switch-button');if(!w||!b)return;const on=!w.classList.contains('open');w.classList.toggle('open',on);b.setAttribute('aria-expanded',on?'true':'false')}
function select(key){
  if(!valid(key))return;close();
  try{localStorage.setItem('blis-client-ui',key)}catch(_){}
  try{document.cookie=`blis_admin_client=${encodeURIComponent(key)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`}catch(_){}
  const page=document.querySelector('.page.active')?.id||'overview';
  const u=new URL(location.href);u.pathname='/dashboard.html';u.search='';u.searchParams.set('client',key);u.searchParams.set('page',page);history.replaceState({client:key,page},'',u.pathname+u.search);
  window.BLIS_INITIAL_CLIENT=key;try{window.slug=key}catch(_){}
  const sel=document.getElementById('clientSel');if(sel)sel.value=key;paint(key);
  if(sel)sel.dispatchEvent(new Event('change',{bubbles:true}));else if(typeof window.load==='function')window.load();
}
function click(e){const o=e.target.closest?.('.client-option[data-client-key]');if(o){e.preventDefault();e.stopPropagation();select(o.dataset.clientKey);return}const b=e.target.closest?.('.client-switch-button');if(b){e.preventDefault();e.stopPropagation();toggle();return}const w=document.querySelector('.client-switch');if(w&&!w.contains(e.target))close()}
function init(){const k=current(),sel=document.getElementById('clientSel');if(sel)sel.value=k;paint(k);document.addEventListener('click',click,true);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});window.addEventListener('blis:clientdata',e=>{const k=e?.detail?.client||current();if(valid(k))paint(k)});const w=document.querySelector('.client-switch');if(w){w.style.position='relative';w.style.zIndex='200'}const m=document.querySelector('.client-switch-menu');if(m)m.style.zIndex='1000'}
window.BLISClientUIV3={select,paint,current};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
