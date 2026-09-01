/* BLIS Navigator 3.0 — клиентски доказателства и свързани изводи v1.
   Показва проверимата информационна основа зад видимите изводи, без вътрешни формули.
   Използва само данните на активния клиент: източници, история и текущи сигнали. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_EVIDENCE_V1)return;
window.__BLIS_NAVIGATOR_3_EVIDENCE_V1=true;

const PAGE_TOPIC={
  social:()=>true,
  market:s=>['commercial','product','regulatory'].includes(s.topic),
  digital:s=>['brand_mention','commercial','product'].includes(s.topic),
  reputation:s=>s.topic==='reputation'||s.sentiment==='negative',
  competition:s=>s.topic==='competition'||s.scope==='competitor',
  opportunities:()=>true
};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const page=()=>document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';
const client=()=>window.D?.name||document.querySelector('.bch3-name')?.textContent||'клиента';
const sources=()=>Array.isArray(window.S)?window.S.filter(x=>x&&x.label):[];
const historyRows=()=>Array.isArray(window.H)?window.H:[];
const signals=()=>{try{return window.BLISIntelligenceStreamV3?.getUsefulSignals?.()||[]}catch(_){return[]}};
const date=s=>{const t=new Date(s||0);return Number.isNaN(t.getTime())?'без дата':t.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})};
const sourceName=s=>String(s?.source||s?.source_label||'').trim()||(()=>{try{return new URL(s?.url||'').hostname.replace(/^www\./,'')}catch(_){return''}})()||'публичен източник';

function css(){
  if(document.getElementById('navigator3EvidenceCss'))return;
  const s=document.createElement('style');s.id='navigator3EvidenceCss';s.textContent=`
  .n3e-overview{margin:0 0 14px;border:1px solid #dce7f1;border-radius:16px;background:#fff;box-shadow:0 8px 26px rgba(26,58,91,.045);padding:14px 15px;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}.n3e-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.n3e-kicker{font-size:7px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#7890a6}.n3e-head h3{margin:4px 0 0;color:#193d5f;font-size:16px}.n3e-head p{margin:5px 0 0;color:#71869a;font-size:9px;line-height:1.5;max-width:760px}.n3e-go{border:1px solid #d7e4ef;border-radius:9px;background:#f7fbff;color:#255e94;padding:8px 10px;font-size:8px;font-weight:850;cursor:pointer;white-space:nowrap}.n3e-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:11px}.n3e-item{border:1px solid #e6edf3;border-radius:11px;background:#fbfdff;padding:10px 11px;min-width:0}.n3e-item span{display:block;font-size:7px;font-weight:850;color:#8295a8;text-transform:uppercase}.n3e-item b{display:block;margin-top:4px;color:#31516f;font-size:9px;line-height:1.4}.n3e-item small{display:block;margin-top:5px;color:#8493a3;font-size:7.5px;line-height:1.35}.n3e-empty{margin-top:10px;border:1px dashed #dbe5ed;border-radius:10px;background:#fbfcfe;padding:12px;color:#75889b;font-size:9px;line-height:1.5}.n3e-evidence-btn{margin-left:6px;border:0;background:transparent;color:#2367a7;font-size:8px;font-weight:850;cursor:pointer;text-decoration:underline;text-underline-offset:2px}.n3e-drawer-block{padding:13px 0;border-top:1px solid #edf1f5}.n3e-drawer-block:first-child{border-top:0}.n3e-drawer-block>span{display:block;color:#8292a2;font-size:7px;text-transform:uppercase;letter-spacing:.07em;font-weight:900}.n3e-drawer-block>p{margin:6px 0 0;color:#4c647a;font-size:9.5px;line-height:1.6}.n3e-proof{margin-top:9px;border:1px solid #e5ebf1;border-radius:10px;background:#fbfcfe;padding:10px}.n3e-proof b{display:block;color:#35536f;font-size:9px;line-height:1.4}.n3e-proof small{display:block;margin-top:4px;color:#7e8fa0;font-size:7.5px;line-height:1.4}.n3e-proof a{display:inline-block;margin-top:6px;color:#2165aa;font-size:8px;font-weight:850;text-decoration:none}.n3e-source-list{display:grid;gap:6px;margin-top:8px}.n3e-source{border-left:3px solid #d8e5ef;background:#f8fbfd;border-radius:0 8px 8px 0;padding:7px 9px;color:#526b81;font-size:8px;line-height:1.4}.n3e-status{display:inline-flex;align-items:center;gap:5px;margin-top:7px;border-radius:999px;background:#eef7f2;color:#2b7656;padding:5px 8px;font-size:7.5px;font-weight:850}.n3e-status i{width:6px;height:6px;border-radius:50%;background:#36a56d}.n3e-signal-proof{width:100%;margin-top:7px;border:1px solid #dce6ef;border-radius:8px;background:#f8fbfe;color:#2c6599;padding:7px 9px;font-size:8px;font-weight:850;text-align:left;cursor:pointer}@media(max-width:800px){.n3e-grid{grid-template-columns:1fr}.n3e-head{flex-direction:column}.n3e-go{align-self:flex-start}}
  `;document.head.appendChild(s);
}

function relatedSignals(id){
  const rows=signals();const f=PAGE_TOPIC[id];return (f?rows.filter(f):rows).slice(0,5);
}
function proofSummary(id){
  const ss=sources(),hh=historyRows(),rr=relatedSignals(id);
  const parts=[];
  if(rr.length)parts.push(`${rr.length} актуални значими сигнала`);
  if(ss.length)parts.push(`${ss.length} наблюдавани източника`);
  if(hh.length)parts.push(`${hh.length} исторически записа`);
  return parts.length?parts.join(' · '):'Няма достатъчно налична информация за отделен списък с доказателства.';
}
function sourceHTML(limit=5){
  const ss=sources().slice(0,limit);
  if(!ss.length)return '<p>Няма публикуван списък с източници за този клиентски профил.</p>';
  return `<div class="n3e-source-list">${ss.map(x=>`<div class="n3e-source"><b>${esc(x.label)}</b>${x.method?`<br>${esc(x.method)}`:''}</div>`).join('')}</div>`;
}
function signalHTML(rows){
  if(!rows.length)return '<p>В текущия поток няма отделен сигнал, който самостоятелно да обяснява този показател. Стойността трябва да се чете като обобщение на наличната информация за периода.</p>';
  return rows.slice(0,3).map(s=>`<div class="n3e-proof"><b>${esc(s.title||s.text||'Публичен сигнал')}</b><small>${esc(sourceName(s))} · ${esc(date(s.published_at||s.detected_at))}${Number(s.evidence_count||0)>1?` · ${Number(s.evidence_count)} потвърждения`:''}</small>${/^https?:\/\//i.test(String(s.url||''))?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Първоизточник ↗</a>`:''}</div>`).join('');
}
function appendMetricEvidence(){
  const drawer=document.getElementById('nv3MetricDrawer'),body=drawer?.querySelector('[data-nv3-drawer-body]');if(!drawer||!body||!drawer.classList.contains('open'))return;
  body.querySelectorAll('[data-n3e-metric-evidence]').forEach(x=>x.remove());
  const id=page(),rr=relatedSignals(id),block=document.createElement('div');block.className='n3e-drawer-block';block.dataset.n3eMetricEvidence='1';
  block.innerHTML=`<span>Информационна основа</span><p>${esc(proofSummary(id))}</p><div class="n3e-status"><i></i>Показваме само налични данни за ${esc(client())}</div>${signalHTML(rr)}<div class="n3e-drawer-block"><span>Наблюдавани източници</span>${sourceHTML(4)}</div>`;
  body.appendChild(block);
}
function overview(){
  if(page()!=='overview')return;const host=document.getElementById('overviewPremium')||document.getElementById('overview');if(!host||host.querySelector('[data-n3e-overview]'))return;
  const rows=signals().slice(0,3);const box=document.createElement('section');box.className='n3e-overview';box.dataset.n3eOverview='1';
  box.innerHTML=`<div class="n3e-head"><div><span class="n3e-kicker">Какво се промени</span><h3>Най-важното за текущия период</h3><p>Кратък преглед на последните значими промени за ${esc(client())}. Това е входът към останалите страници на анализа.</p></div><button type="button" class="n3e-go" data-n3e-go="social">Всички важни сигнали →</button></div>${rows.length?`<div class="n3e-grid">${rows.map(s=>`<div class="n3e-item"><span>${esc(s.kind==='риск'?'Риск':s.kind==='възможност'?'Възможност':s.kind==='конкурент'?'Конкурентно движение':'Значим сигнал')}</span><b>${esc(s.title||s.text||'Публичен сигнал')}</b><small>${esc(sourceName(s))} · Значимост ${Number(s.utility||0)}/100</small></div>`).join('')}</div>`:`<div class="n3e-empty">Няма нови сигнали над прага за клиентска значимост. Това не означава липса на наблюдение, а липса на достатъчно силна нова промяна.</div>`}`;
  const anchor=host.querySelector('.nv3-guide')||host.querySelector('.nv3-story');if(anchor)anchor.insertAdjacentElement('afterend',box);else host.prepend(box);
}
function signalButtons(){
  document.querySelectorAll('.iv3-card').forEach(card=>{if(card.dataset.n3eProof==='1')return;card.dataset.n3eProof='1';const foot=card.querySelector('.iv3-foot');if(!foot)return;const b=document.createElement('button');b.type='button';b.className='iv3-action';b.dataset.n3eSignal=card.dataset.id||'';b.textContent='Доказателства';foot.appendChild(b)});
}
function openSignal(id){
  const s=signals().find(x=>String(x.id||'')===String(id||''));if(!s)return;let drawer=document.getElementById('n3eSignalDrawer');if(!drawer){document.body.insertAdjacentHTML('beforeend','<div id="n3eSignalBackdrop" class="nv3-drawer-backdrop"></div><aside id="n3eSignalDrawer" class="nv3-drawer" aria-hidden="true"><div class="nv3-drawer-head"><div><span>Доказателства</span><h3 data-n3e-title>Сигнал</h3></div><button type="button" class="nv3-drawer-close" data-n3e-close aria-label="Затвори">×</button></div><div class="nv3-drawer-body" data-n3e-body></div></aside>');drawer=document.getElementById('n3eSignalDrawer')}
  drawer.querySelector('[data-n3e-title]').textContent=s.title||s.text||'Публичен сигнал';const names=Array.isArray(s.evidence_sources)?s.evidence_sources.filter(Boolean):[];drawer.querySelector('[data-n3e-body]').innerHTML=`<div class="n3e-drawer-block"><span>Защо е показан</span><p>Сигналът е част от текущия значим поток за ${esc(client())}. Показаната значимост е помощ за приоритизация, а не прогноза.</p></div><div class="n3e-drawer-block"><span>Първоизточник</span><p>${esc(sourceName(s))} · ${esc(date(s.published_at||s.detected_at))}</p>${/^https?:\/\//i.test(String(s.url||''))?`<div class="n3e-proof"><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Отвори първоизточника ↗</a></div>`:''}</div><div class="n3e-drawer-block"><span>Независими потвърждения</span><p>${Number(s.evidence_count||1)} ${Number(s.evidence_count||1)===1?'налично доказателство':'налични доказателства'}.</p>${names.length?`<div class="n3e-source-list">${names.map(n=>`<div class="n3e-source">${esc(n)}</div>`).join('')}</div>`:''}</div>`;drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');document.getElementById('n3eSignalBackdrop')?.classList.add('open');
}
function closeSignal(){document.getElementById('n3eSignalDrawer')?.classList.remove('open');document.getElementById('n3eSignalDrawer')?.setAttribute('aria-hidden','true');document.getElementById('n3eSignalBackdrop')?.classList.remove('open')}
function decorate(){css();overview();signalButtons();document.documentElement.dataset.navigatorEvidence='client-source-v1'}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorate()})}

document.addEventListener('click',e=>{const g=e.target.closest?.('[data-n3e-go]');if(g){e.preventDefault();window.refGo?.(g.dataset.n3eGo);return}const m=e.target.closest?.('[data-nv3-metric]');if(m)setTimeout(appendMetricEvidence,0);const s=e.target.closest?.('[data-n3e-signal]');if(s){e.preventDefault();openSignal(s.dataset.n3eSignal);return}if(e.target.closest?.('[data-n3e-close]')||e.target.id==='n3eSignalBackdrop'){e.preventDefault();closeSignal()}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSignal()});
window.addEventListener('blis:routechange',schedule);window.addEventListener('blis:clientdata',()=>setTimeout(schedule,80));window.addEventListener('blis:intelligence',()=>setTimeout(schedule,80));
const mo=new MutationObserver(schedule);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{css();mo.observe(document.querySelector('.shell')||document.body,{childList:true,subtree:true});schedule()},{once:true});else{css();mo.observe(document.querySelector('.shell')||document.body,{childList:true,subtree:true});schedule()}
window.BLISNavigator3EvidenceV1={decorate,relatedSignals,appendMetricEvidence};
})();
