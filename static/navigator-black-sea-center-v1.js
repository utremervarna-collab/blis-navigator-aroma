/* BLIS Navigator - Black Sea Center locked client shell support v3. */
(function(){
'use strict';
if(window.__BLIS_BLACK_SEA_CENTER_V3)return;
window.__BLIS_BLACK_SEA_CENTER_V3=true;
window.__BLIS_BLACK_SEA_CENTER_V2=true;
window.__BLIS_BLACK_SEA_CENTER_V1=true;
const KEY='black-sea-center';
const NAME='Black Sea Center';
const TYPE='Бизнес и офис комплекс / офис площи под наем';
const DESC='Офис площи под наем, корпоративни наематели, конкурентна среда и пазарни сигнали';
const LOGO='/client-logos/black-sea-center.png';
const NAV={overview:'Общ изглед',social:'Мониторинг',market:'Среда',competition:'Конкуренти',history:'Развитие/Доклади',hub:'Intelligence HUB',calendar:'Календар'};
const COMPETITORS=[
 {name:'Varna Towers',kind:'Class A офисен и бизнес комплекс'},
 {name:'Business Park Varna',kind:'Пряк офисен конкурент'},
 {name:'Landmark Centre Varna',kind:'Пряк Class A офисен конкурент'},
 {name:'Комфорт Бизнес Център',kind:'Пряк офисен конкурент'}
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
 const head=market.querySelector('.market1-head h2');if(head&&head.textContent!=='Среда')head.textContent='Среда';
 market.querySelectorAll('h1,h2,h3,h4,p,span,b,strong,small').forEach(el=>{
   if(el.children.length)return;
   const t=(el.textContent||'').trim();
   if(/^(Интерактивна карта на възприятията|Карта на възприятията|Интерактивна мрежа|3D мрежа на възприятията|Ключови фактори в информационната среда)$/i.test(t)&&t!=='Ключови фактори')el.textContent='Ключови фактори';
 });
 const nav=document.querySelector('#nav [data-n3-page="market"] .navtxt,#nav [data-page="market"] .navtxt');if(nav&&nav.textContent!=='Среда')nav.textContent='Среда';
 const active=document.getElementById('blisActiveModule');if(active&&active.textContent!=='Среда')active.textContent='Среда';
}
function ensureCompetitors(){
 if(activePage()!=='competition')return;
 const root=document.getElementById('competitionBody')||document.getElementById('competition');if(!root)return;
 let block=root.querySelector('[data-bsc-competitors]');
 if(!block){block=document.createElement('section');block.dataset.bscCompetitors='1';block.className='bsc-competitors';root.prepend(block)}
 const data=Array.isArray(window.D?.competitors)?window.D.competitors:[];
 const rowFor=name=>data.find(r=>String(r?.name||'').trim().toLowerCase()===name.toLowerCase())||{};
 const rows=COMPETITORS.map(c=>{const r=rowFor(c.name);return {...c,m30:Number(r.live_mentions_30d||0),m90:Number(r.live_mentions_90d||0)}});
 const sig=JSON.stringify(rows.map(r=>[r.name,r.m30,r.m90]));if(block.dataset.signature===sig)return;block.dataset.signature=sig;
 block.innerHTML=`<div class="bsc-comp-head"><div><small>НАБЛЮДАВАНИ КОНКУРЕНТИ</small><h3>Офисна конкурентна среда на Black Sea Center</h3></div><span>4 наблюдавани конкурента</span></div><div class="bsc-comp-grid">${rows.map(c=>`<article><b>${esc(c.name)}</b><p>${esc(c.kind)}</p><div class="bsc-comp-metrics"><span><strong>${c.m30}</strong><small>споменавания · 30 дни</small></span><span><strong>${c.m90}</strong><small>споменавания · 90 дни</small></span></div><small>Публичен мониторинг; без изкуствен ранг при липса на съпоставим индекс.</small></article>`).join('')}</div>`;
 if(!document.getElementById('bscCompetitorsCss')){const s=document.createElement('style');s.id='bscCompetitorsCss';s.textContent=`
body[data-client="black-sea-center"] #competitionBody .vs-page>.vs-answer,
body[data-client="black-sea-center"] #competitionBody .vs-page>.vs-visual,
body[data-client="black-sea-center"] #competitionBody .vs-page>.vs-mini-grid{display:none!important}
body[data-client="black-sea-center"] #competitionBody .vs-head h2{font-size:28px!important}
.bsc-competitors{margin:0 0 12px;padding:14px;border:1px solid #dfe7ee;border-radius:14px;background:#fff}.bsc-comp-head{display:flex;justify-content:space-between;gap:12px;align-items:center}.bsc-comp-head small{color:#8294a5;font-size:7px;font-weight:900;letter-spacing:.06em}.bsc-comp-head h3{margin:4px 0 0;color:#31516e;font-size:13px}.bsc-comp-head>span{border:1px solid #dce6ee;border-radius:999px;padding:6px 9px;color:#60788e;font-size:8px}.bsc-comp-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:10px}.bsc-comp-grid article{border:1px solid #e4eaf0;border-radius:10px;padding:10px;background:#fbfdff}.bsc-comp-grid b{display:block;color:#34536e;font-size:10px}.bsc-comp-grid p{margin:4px 0;color:#6f8294;font-size:8px}.bsc-comp-grid>article>small{display:block;margin-top:8px;color:#8797a6;font-size:7px;line-height:1.4}.bsc-comp-metrics{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px}.bsc-comp-metrics>span{border:1px solid #e7edf3;border-radius:8px;background:#fff;padding:7px}.bsc-comp-metrics strong{display:block;color:#234f9d;font-size:13px}.bsc-comp-metrics small{display:block;margin-top:2px;color:#8a99a8;font-size:6.5px;line-height:1.25}@media(max-width:900px){.bsc-comp-grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.bsc-comp-grid{grid-template-columns:1fr}.bsc-comp-head{align-items:flex-start;flex-direction:column}}
`;document.head.appendChild(s)}
 const vh=root.querySelector('.vs-head h2');if(vh&&vh.textContent!=='Конкуренти')vh.textContent='Конкуренти';
 const vp=root.querySelector('.vs-head p');if(vp&&vp.textContent!=='Офисна конкурентна среда и публична активност')vp.textContent='Офисна конкурентна среда и публична активност';
}
function paint(){
 if(!isBSC())return;
 if(document.body&&document.body.dataset.client!==KEY)document.body.dataset.client=KEY;
 try{window.slug=KEY;window.BLIS_INITIAL_CLIENT=KEY}catch(_){}
 if(document.title!==`BLIS Navigator - ${NAME}`)document.title=`BLIS Navigator - ${NAME}`;
 ensureLockedClient();
 const home=document.querySelector('.dashboard-home-link');if(home)home.remove();
 document.querySelectorAll('.client-brand-name,.bch3-name').forEach(n=>{if(n.textContent!==NAME)n.textContent=NAME});
 document.querySelectorAll('.client-brand-type').forEach(n=>{if(n.textContent!==TYPE)n.textContent=TYPE});
 document.querySelectorAll('.bch3-desc').forEach(n=>{if(n.textContent!==DESC)n.textContent=DESC});
 applyLogo();renameNavigation();renameKeyFactors();ensureCompetitors();
}
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;paint()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{schedule();setTimeout(schedule,120)},{once:true});else{schedule();setTimeout(schedule,120)}
['blis:production-ready','blis:clientdata','blis:routechange','blis:navigator-route','popstate'].forEach(ev=>window.addEventListener(ev,schedule));
let observer=null;function watch(){if(observer||!document.body)return;observer=new MutationObserver(()=>{if(isBSC())schedule()});observer.observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})();
