/* BLIS Navigator — canonical client switcher.
   Single responsibility: client selection and atomic hand-off to the canonical data loader.
   Hidden legacy clients remain directly addressable for owner sessions but never leak into
   the normal client catalogue. Black Sea Center uses a locked single-client scope. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_UI_V3)return;
window.__BLIS_CLIENT_UI_V3=true;

const clients={
  kub:{bg:'Корпорация КУБ',en:'KUB Corporation',typeBg:'Кризисен мониторинг · Баба Алино',typeEn:'Crisis monitoring · Baba Alino',visible:true},
  aroma:{bg:'Aroma Cosmetics',en:'Aroma Cosmetics',typeBg:'Козметика',typeEn:'Beauty & personal care',visible:true},
  bolyarka:{bg:'Болярка ВТ АД',en:'BOLYARKA',typeBg:'Пивоварна компания',typeEn:'Brewery',visible:true},
  'astor-garden':{bg:'Astor Garden Hotel',en:'Astor Garden Hotel',typeBg:'Хотелиерство',typeEn:'Hospitality',visible:false},
  'varna-towers':{bg:'Varna Towers',en:'Varna Towers',typeBg:'Недвижими имоти',typeEn:'Real estate',visible:false},
  mollox:{bg:'MOLLOX България',en:'MOLLOX Bulgaria',typeBg:'Професионална хигиена',typeEn:'Professional hygiene',visible:true},
  wirello:{bg:'Wirello Market',en:'Wirello Market',typeBg:'Модерен ритейл',typeEn:'Retail',visible:true},
  everbet:{bg:'Everbet',en:'Everbet',typeBg:'Онлайн игри и спортни залози',typeEn:'Online gaming',visible:false},
  'black-sea-center':{bg:'Black Sea Center',en:'Black Sea Center',typeBg:'Бизнес и търговски комплекс',typeEn:'Business & retail complex',visible:false}
};
const defaultVisibleOrder=['kub','mollox','aroma','bolyarka','wirello'];
const valid=k=>!!clients[k];
const lockedBSC=()=>new URLSearchParams(location.search).get('client')==='black-sea-center'||document.body?.dataset?.client==='black-sea-center'||window.BLIS_INITIAL_CLIENT==='black-sea-center';
const visibleOrder=()=>lockedBSC()?['black-sea-center']:defaultVisibleOrder.slice();
let wired=!!window.__BLIS_CLIENT_SWITCH_WIRED_V5;
let switchToken=0;

function isEnglish(){try{if(new URLSearchParams(location.search).get('lang')==='en')return true}catch(_){}return String(document.documentElement.lang||'').toLowerCase().startsWith('en')}
function label(k){const c=clients[k];return !c?'':(isEnglish()?c.en:c.bg)}
function type(k){const c=clients[k];return !c?'':(isEnglish()?c.typeEn:c.typeBg)}
function current(){try{const q=new URLSearchParams(location.search).get('client');if(valid(q))return q}catch(_){}const b=document.body?.dataset?.client;if(valid(b))return b;try{if(valid(window.slug))return window.slug}catch(_){}const s=document.getElementById('clientSel')?.value;if(valid(s))return s;if(valid(window.BLIS_INITIAL_CLIENT))return window.BLIS_INITIAL_CLIENT;return 'aroma'}
function activePage(){return document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview'}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]))}
function selectOrder(){if(lockedBSC())return ['black-sea-center'];const order=visibleOrder();const active=current();if(valid(active)&&!order.includes(active))order.unshift(active);return order}
function ensureSelect(){const sel=document.getElementById('clientSel');if(!sel)return;sel.innerHTML='';for(const k of selectOrder()){const o=document.createElement('option');o.value=k;o.textContent=label(k);sel.appendChild(o)}if(lockedBSC())sel.disabled=true;else sel.disabled=false}
function ensureMenu(){const menu=document.querySelector('.client-switch-menu');if(!menu)return;const active=current();menu.innerHTML=visibleOrder().map(k=>`<button type="button" class="client-option${k===active?' active':''}" data-client-key="${k}" role="option" aria-selected="${k===active?'true':'false'}"><span><b>${esc(label(k))}</b><small>${esc(type(k))}</small></span><span class="client-option-check" aria-hidden="true">${k===active?'✓':''}</span></button>`).join('');if(lockedBSC()){menu.style.display='none';const btn=document.querySelector('.client-switch-button');if(btn){btn.style.pointerEvents='none';btn.setAttribute('aria-expanded','false')}}else{menu.style.display=''}}
function removeLegacyIdentity(){document.querySelectorAll('.client-brand-mark,.client-option-mark').forEach(n=>n.remove())}
function paint(key=current()){if(!valid(key))key='aroma';removeLegacyIdentity();if(document.body)document.body.dataset.client=key;document.querySelectorAll('.client-brand-name').forEach(n=>n.textContent=label(key));document.querySelectorAll('.client-brand-type').forEach(n=>n.textContent=type(key));document.querySelectorAll('.client-option[data-client-key]').forEach(n=>{const on=n.dataset.clientKey===key;n.classList.toggle('active',on);n.setAttribute('aria-selected',on?'true':'false');const ck=n.querySelector('.client-option-check');if(ck)ck.textContent=on?'✓':''});document.title=`BLIS Navigator - ${label(key)}`}
function close(){const w=document.querySelector('.client-switch'),b=document.querySelector('.client-switch-button');w?.classList.remove('open');b?.setAttribute('aria-expanded','false')}
function toggle(){if(lockedBSC())return;const w=document.querySelector('.client-switch'),b=document.querySelector('.client-switch-button');if(!w||!b)return;const on=!w.classList.contains('open');w.classList.toggle('open',on);b.setAttribute('aria-expanded',on?'true':'false')}
async function handoffData(key,sel,token){const dashboard=fetch(`/api/clients/${encodeURIComponent(key)}/dashboard`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`dashboard ${r.status}`);return r.json()});let appLoad=Promise.resolve();if(sel&&typeof sel.onchange==='function'){appLoad=Promise.resolve(sel.onchange.call(sel,{target:sel,currentTarget:sel,type:'change'}))}else if(sel){sel.dispatchEvent(new Event('change',{bubbles:true}));appLoad=new Promise(resolve=>setTimeout(resolve,350))}else if(typeof window.load==='function'){appLoad=Promise.resolve(window.load())}const [dashResult,loadResult]=await Promise.allSettled([dashboard,appLoad]);if(token!==switchToken)return false;if(loadResult.status==='rejected')throw loadResult.reason;if(dashResult.status==='rejected')throw dashResult.reason;window.D=dashResult.value;return true}
async function select(key){if(!valid(key)||(lockedBSC()&&key!=='black-sea-center'))return;close();if(key==='kub'){try{localStorage.setItem('blis-client-ui','kub')}catch(_){}location.href='/kub-crisis.html';return}const token=++switchToken;if(document.body)document.body.dataset.blisLoading='true';try{localStorage.setItem('blis-client-ui',key)}catch(_){}try{document.cookie=`blis_admin_client=${encodeURIComponent(key)}; Path=/; Max-Age=2592000; SameSite=Lax; Secure`}catch(_){}const page=activePage();const u=new URL(location.href);u.pathname='/dashboard.html';u.searchParams.set('client',key);u.searchParams.set('page',page);history.replaceState({client:key,page},'',u.pathname+u.search+u.hash);window.BLIS_INITIAL_CLIENT=key;try{window.slug=key}catch(_){}const sel=document.getElementById('clientSel');if(sel){ensureSelect();sel.value=key}paint(key);(window.BLISClientBrandingV5||window.BLISClientBrandingV4||window.BLISClientBrandingV3)?.paint?.();try{const ok=await handoffData(key,sel,token);if(!ok)return;if(document.body)document.body.dataset.client=key;window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:key,data:window.D}}))}catch(err){console.error('BLIS client switch failed',err)}finally{if(token===switchToken&&document.body)document.body.dataset.blisLoading='false'}}
function click(e){const o=e.target.closest?.('.client-option[data-client-key]');if(o){e.preventDefault();e.stopPropagation();void select(o.dataset.clientKey);return}const b=e.target.closest?.('.client-switch-button');if(b){e.preventDefault();e.stopPropagation();toggle();return}const w=document.querySelector('.client-switch');if(w&&!w.contains(e.target))close()}
function init(){if(current()==='kub'){location.replace('/kub-crisis.html');return}ensureSelect();ensureMenu();const k=current(),sel=document.getElementById('clientSel');if(sel)sel.value=k;paint(k);const wrap=document.querySelector('.client-switch');if(wrap){wrap.style.position='relative';wrap.style.zIndex='200'}const menu=document.querySelector('.client-switch-menu');if(menu)menu.style.zIndex='1000';if(!wired){wired=true;window.__BLIS_CLIENT_SWITCH_WIRED_V5=true;document.addEventListener('click',click,true);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});window.addEventListener('popstate',()=>{ensureSelect();ensureMenu();paint(current())});['blis:clientdata','blis:production-ready'].forEach(ev=>window.addEventListener(ev,()=>{ensureSelect();ensureMenu();paint(current())}))}}
window.BLIS_CLIENT_REGISTRY=Object.freeze(clients);
window.BLIS_VISIBLE_CLIENTS=Object.freeze(defaultVisibleOrder.slice());
window.BLISClientUIV5={select,paint,current,visibleClients:visibleOrder(),clients};window.BLISClientUIV4=window.BLISClientUIV5;window.BLISClientUIV3=window.BLISClientUIV5;
// The script is loaded at the end of dashboard.html, so the switcher DOM already exists.
// Initialise immediately to replace the legacy static fallback before the first user interaction.
init();
})();