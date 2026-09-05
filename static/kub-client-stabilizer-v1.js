/* KUB client stabilizer v1: hardens navigation, monitoring fallback and client isolation on all KUB routes. */
(function(){
'use strict';
const path=(location.pathname||'').toLowerCase();
if(!/^\/kub-(?:crisis\.html|private|live|client)$/.test(path))return;
if(window.__KUB_CLIENT_STABILIZER_V1)return;window.__KUB_CLIENT_STABILIZER_V1=true;

const TITLES={overview:'Кризисен преглед',monitoring:'Мониторинг',environment:'Среда / Наративи',reputation:'Репутация',risks:'Рискове',stakeholders:'Заинтересовани страни',evidence:'Доказателства',timeline:'Хронология',reports:'Развитие / Доклади',sources:'Източници',settings:'Настройки на наблюдението'};
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

function activate(id){
  const target=document.getElementById(id);
  if(!target||!target.classList.contains('page'))return;
  document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p===target));
  document.querySelectorAll('#nav button[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===id));
  const title=document.getElementById('pageTitle');if(title)title.textContent=TITLES[id]||'Корпорация КУБ';
  try{history.replaceState(null,'',location.pathname+location.search+'#'+id)}catch(_){ }
  window.scrollTo({top:0,behavior:'instant'});
}

function bindNav(){
  const nav=document.getElementById('nav');if(!nav)return;
  nav.addEventListener('click',e=>{
    const b=e.target.closest('button[data-page]');if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();activate(b.dataset.page);
  },true);
  nav.querySelectorAll('button[data-page]').forEach(b=>{
    b.disabled=false;b.style.pointerEvents='auto';b.removeAttribute('aria-disabled');
  });
  const hash=(location.hash||'').slice(1);if(hash&&document.getElementById(hash))activate(hash);
  else if(!document.querySelector('.page.active'))activate('overview');
}

function isolate(){
  document.querySelectorAll('.sidefoot a').forEach(a=>{const h=(a.getAttribute('href')||'').toLowerCase();if(h.includes('dashboard.html'))a.remove();});
  const sf=document.querySelector('.sidefoot');if(sf)sf.textContent='Корпорация КУБ · специализиран кризисен профил';
}

function clearLoading(){
  document.querySelectorAll('body *').forEach(el=>{
    if(el.children.length===0&&/^\s*loading\.{0,3}\s*$/i.test(el.textContent||''))el.remove();
  });
}

function renderRows(rows){
  const feed=document.querySelector('#monitoring .feed');if(!feed)return;
  const list=(Array.isArray(rows)?rows:[]).slice().sort((a,b)=>new Date(b.published_at||b.detected_at||0)-new Date(a.published_at||a.detected_at||0)).slice(0,100);
  if(!list.length){feed.innerHTML='<div class="callout">В момента няма получени KUB сигнали от API. Системата ще опита отново автоматично.</div>';return;}
  feed.innerHTML=list.map(r=>{
    const dt=new Date(r.published_at||r.detected_at||r.created_at||0);const when=isNaN(dt)?'':dt.toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    const url=String(r.url||'');const link=/^https?:\/\//i.test(url)?`<a href="${esc(url)}" target="_blank" rel="noopener">ИЗТОЧНИК ↗</a>`:'';
    return `<article class="item"><time>${esc(when)}</time><div><h3>${esc(r.title||'Сигнал')}</h3><p>${esc(r.text||r.summary||'')}</p><div class="meta"><span>${esc(r.source||'източник')}</span><span>${esc(r.severity||'')}</span></div></div>${link}</article>`;
  }).join('');
}

async function monitoringFallback(){
  const feed=document.querySelector('#monitoring .feed');if(!feed)return;
  const looksBroken=!feed.children.length||/loading/i.test(feed.textContent||'');
  if(!looksBroken)return;
  try{
    const r=await fetch('/api/signals?client=kub&limit=500&_='+Date.now(),{cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json'}});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const d=await r.json();renderRows(Array.isArray(d)?d:(d.signals||d.items||[]));
  }catch(_){feed.innerHTML='<div class="callout">Няма връзка с текущия KUB сигнален поток. Автоматичният повторен опит остава активен.</div>';}
}

function ensureDynamics(){
  const card=[...document.querySelectorAll('#overview .card,.card')].find(el=>/Кризисна динамика/i.test((el.querySelector('.sectionTitle,h2,h3')||{}).textContent||''));
  if(card&&card.dataset.kubInteractive==='v5')return;
  const s=document.createElement('script');s.src='/kub-crisis-dynamics-v1.js?v=20260905-stable1-'+Date.now();s.defer=true;document.body.appendChild(s);
}

function boot(){bindNav();isolate();clearLoading();monitoringFallback();ensureDynamics();setTimeout(()=>{bindNav();isolate();clearLoading();monitoringFallback();ensureDynamics();},900);setTimeout(()=>{bindNav();isolate();clearLoading();monitoringFallback();ensureDynamics();},2600);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
