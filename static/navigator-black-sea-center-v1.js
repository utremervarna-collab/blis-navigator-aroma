/* BLIS Navigator - Black Sea Center locked client shell support v3. */
(function(){
'use strict';
if(window.__BLIS_BLACK_SEA_CENTER_V3)return;
window.__BLIS_BLACK_SEA_CENTER_V3=true;
window.__BLIS_BLACK_SEA_CENTER_V2=true;
window.__BLIS_BLACK_SEA_CENTER_V1=true;
const KEY='black-sea-center';
const NAME='Black Sea Center';
const TYPE='Търговски и бизнес комплекс / офис площи';
const DESC='Офис площи, търговска среда, локационна видимост и пазарни сигнали';
const LOGO='/client-logos/black-sea-center.png';
const NAV={overview:'Общ изглед',social:'Мониторинг',market:'Среда',competition:'Конкуренти',history:'Развитие/Доклади',hub:'Intelligence HUB',calendar:'Календар'};
const COMPETITORS=[
 {name:'Varna Towers',kind:'Бизнес и офис комплекс'},
 {name:'Business Park Varna',kind:'Офис и бизнес парк'},
 {name:'Delta Planet Mall',kind:'Търговски и градски комплекс'},
 {name:'Grand Mall Varna',kind:'Търговски комплекс'}
];
let raf=0;
const current=()=>{try{return new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||''}catch(_){return document.body?.dataset?.client||''}};
const isBSC=()=>current()===KEY;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function activePage(){return document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview'}
function ensureLockedClient(){
 const sel=document.getElementById('clientSel');
 if(sel){
  const only=sel.options.length===1&&sel.options[0]?.value===KEY;
  if(!only)sel.innerHTML=`<option value="${KEY}">${NAME}</option>`;
  if(sel.value!==KEY)sel.value=KEY;
  if(!sel.disabled)sel.disabled=true;
  if(sel.getAttribute('aria-label')!==NAME)sel.setAttribute('aria-label',NAME);
 }
 const menu=document.querySelector('.client-switch-menu');if(menu&&menu.style.display!=='none')menu.style.display='none';
 const wrap=document.querySelector('.client-switch');if(wrap?.classList.contains('open'))wrap.classList.remove('open');
 const btn=document.querySelector('.client-switch-button');if(btn){if(btn.style.pointerEvents!=='none')btn.style.pointerEvents='none';if(btn.getAttribute('aria-expanded')!=='false')btn.setAttribute('aria-expanded','false');if(btn.getAttribute('aria-disabled')!=='true')btn.setAttribute('aria-disabled','true')}
}
function applyLogo(){
 document.querySelectorAll('.bch3-logo').forEach(slot=>{
   if(slot.dataset.clientKey!==KEY)slot.dataset.clientKey=KEY;
   slot.style.setProperty('--bch-accent','#234f9d');
   let img=slot.querySelector('img[data-bsc-logo]');
   if(!img){slot.querySelectorAll('img').forEach(n=>n.remove());img=document.createElement('img');img.dataset.bscLogo='1';img.alt=NAME;img.src=LOGO+'?v=20260907-bsc3';slot.appendChild(img)}
   const mark=slot.querySelector('.bch3-mark');if(mark&&mark.textContent!=='BSC')mark.textContent='BSC';
 });
}
function renameNavigation(){
 for(const [id,label] of Object.entries(NAV))document.querySelectorAll(`#nav [data-n3-page="${id}"],#nav [data-page="${id}"]`).forEach(btn=>{const n=btn.querySelector('.navtxt')||btn.querySelector('span:last-child');if(n&&n.textContent!==label)n.textContent=label});
 const page=activePage(),ctx=document.querySelector('.bch3-context-title');if(ctx&&NAV[page]&&ctx.textContent!==NAV[page])ctx.textContent=NAV[page];
}
function renameKeyFactors(){
 if(activePage()!=='market'&&activePage()!=='environment')return;
 const market=document.getElementById('market');if(!market)return;
 market.querySelectorAll('h1,h2,h3,h4,p,span,b,strong,small').forEach(el=>{
   if(el.children.length)return;
   const t=(el.textContent||'').trim();
   if(/^(Интерактивна карта на възприятията|Карта на възприятията|Интерактивна мрежа|3D мрежа на възприятията|Ключови фактори в информационната среда)$/i.test(t)&&t!=='Ключови фактори')el.textContent='Ключови фактори';
 });
 const active=document.getElementById('blisActiveModule');if(active&&/Интерактивна|Карта|Ключови фактори в информационната среда/i.test(active.textContent||'')&&active.textContent!=='Ключови фактори')active.textContent='Ключови фактори';
}
function ensureCompetitors(){
 if(activePage()!=='competition')return;
 const root=document.getElementById('competitionBody')||document.getElementById('competition');if(!root)return;
 let block=root.querySelector('[data-bsc-competitors]');
 if(!block){block=document.createElement('section');block.dataset.bscCompetitors='1';block.className='bsc-competitors';root.prepend(block)}
 if(block.dataset.rendered==='1')return;
 block.dataset.rendered='1';
 block.innerHTML=`<div class="bsc-comp-head"><div><small>НАБЛЮДАВАНИ КОНКУРЕНТИ</small><h3>Конкурентна среда на Black Sea Center</h3></div><span>4 активни профила</span></div><div class="bsc-comp-grid">${COMPETITORS.map(c=>`<article><b>${esc(c.name)}</b><p>${esc(c.kind)}</p><small>Публичен мониторинг и конкурентни сигнали</small></article>`).join('')}</div>`;
 if(!document.getElementById('bscCompetitorsCss')){const s=document.createElement('style');s.id='bscCompetitorsCss';s.textContent=`.bsc-competitors{margin:0 0 12px;padding:14px;border:1px solid #dfe7ee;border-radius:14px;background:#fff}.bsc-comp-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.bsc-comp-head small{color:#8294a5;font-size:7px;font-weight:900;letter-spacing:.06em}.bsc-comp-head h3{margin:4px 0 0;color:#31516e;font-size:13px}.bsc-comp-head span{border:1px solid #dce6ee;border-radius:999px;padding:6px 9px;color:#60788e;font-size:8px}.bsc-comp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}.bsc-comp-grid article{border:1px solid #e4eaf0;border-radius:10px;padding:10px;background:#fbfdff}.bsc-comp-grid b{display:block;color:#34536e;font-size:10px}.bsc-comp-grid p{margin:4px 0;color:#6f8294;font-size:8px}.bsc-comp-grid small{color:#8797a6;font-size:7px}@media(max-width:900px){.bsc-comp-grid{grid-template-columns:1fr 1fr}}`;document.head.appendChild(s)}
}
function paint(){
 if(!isBSC())return;
 if(document.body&&document.body.dataset.client!==KEY)document.body.dataset.client=KEY;
 try{window.slug=KEY;window.BLIS_INITIAL_CLIENT=KEY}catch(_){}
 if(document.title!==`BLIS Navigator - ${NAME}`)document.title=`BLIS Navigator - ${NAME}`;
 ensureLockedClient();
 document.querySelectorAll('.client-brand-name,.bch3-name').forEach(n=>{if(n.textContent!==NAME)n.textContent=NAME});
 document.querySelectorAll('.client-brand-type').forEach(n=>{if(n.textContent!==TYPE)n.textContent=TYPE});
 document.querySelectorAll('.bch3-desc').forEach(n=>{if(n.textContent!==DESC)n.textContent=DESC});
 applyLogo();renameNavigation();renameKeyFactors();ensureCompetitors();
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;paint()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{schedule();setTimeout(schedule,120)},{once:true});else{schedule();setTimeout(schedule,120)}
['blis:production-ready','blis:clientdata','blis:routechange','blis:navigator-route','popstate'].forEach(ev=>window.addEventListener(ev,schedule));
})();
