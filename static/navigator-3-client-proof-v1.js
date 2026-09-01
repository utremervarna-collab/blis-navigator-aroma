/* BLIS Navigator 3.0 — клиентски доказателства за всяка страница v1.
   Дава директен достъп до фактите зад текущата страница и пази видимия интерфейс на български. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_CLIENT_PROOF_V1)return;
window.__BLIS_NAVIGATOR_3_CLIENT_PROOF_V1=true;

const ORDER=['overview','social','market','digital','reputation','competition','opportunities','history','reports'];
const LABEL={overview:'Общ преглед',social:'Важни сигнали',market:'Пазар и нагласи',digital:'Дигитална видимост',reputation:'Репутация',competition:'Конкуренция',opportunities:'Риск и възможности',history:'История',reports:'Доклади'};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const page=()=>document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';
const client=()=>window.D?.name||document.querySelector('.bch3-name')?.textContent||'клиента';
const sources=()=>Array.isArray(window.S)?window.S.filter(x=>x&&x.label):[];
const historyRows=()=>Array.isArray(window.H)?window.H:[];
const allSignals=()=>{try{return window.BLISIntelligenceStreamV3?.getUsefulSignals?.()||[]}catch(_){return[]}};
const related=id=>{try{const x=window.BLISNavigator3EvidenceV1?.relatedSignals?.(id);if(Array.isArray(x))return x}catch(_){}return allSignals().slice(0,5)};
const sourceName=s=>String(s?.source||s?.source_label||'').trim()||(()=>{try{return new URL(s?.url||'').hostname.replace(/^www\./,'')}catch(_){return''}})()||'публичен източник';
const date=s=>{const d=new Date(s||0);return Number.isNaN(d.getTime())?'без дата':d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})};

function css(){if(document.getElementById('navigator3ClientProofCss'))return;const s=document.createElement('style');s.id='navigator3ClientProofCss';s.textContent=`
.n3p-open{border:1px solid #d8e4ee!important;background:#f7fbff!important;color:#285f93!important}.n3p-meta{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:0 0 13px}.n3p-stat{border:1px solid #e4ebf1;border-radius:10px;background:#fbfdff;padding:9px 10px}.n3p-stat span{display:block;color:#8394a5;font-size:7px;text-transform:uppercase;letter-spacing:.05em;font-weight:900}.n3p-stat b{display:block;margin-top:4px;color:#31516e;font-size:14px}.n3p-block{padding:13px 0;border-top:1px solid #edf1f5}.n3p-block:first-child{border-top:0}.n3p-block>span{display:block;color:#8494a4;font-size:7px;text-transform:uppercase;letter-spacing:.07em;font-weight:900}.n3p-block>p{margin:6px 0 0;color:#50677d;font-size:9.5px;line-height:1.6}.n3p-proof{margin-top:8px;border:1px solid #e4ebf1;border-radius:10px;background:#fbfcfe;padding:10px}.n3p-proof b{display:block;color:#35536f;font-size:9px;line-height:1.45}.n3p-proof small{display:block;margin-top:4px;color:#8191a1;font-size:7.5px;line-height:1.4}.n3p-proof a{display:inline-block;margin-top:6px;color:#2465a5;font-size:8px;font-weight:850;text-decoration:none}.n3p-source{margin-top:6px;border-left:3px solid #d8e5ef;background:#f8fbfd;border-radius:0 8px 8px 0;padding:7px 9px;color:#526b81;font-size:8px;line-height:1.4}.n3p-source a{color:#2465a5;text-decoration:none;font-weight:800}.n3p-empty{margin-top:8px;border:1px dashed #dce5ed;border-radius:9px;background:#fbfcfe;padding:11px;color:#74879a;font-size:8.5px;line-height:1.5}.n3p-note{margin-top:11px;border-left:3px solid #d5e2ed;background:#f7fafc;border-radius:0 9px 9px 0;padding:9px 10px;color:#657c91;font-size:8px;line-height:1.5}@media(max-width:620px){.n3p-meta{grid-template-columns:1fr}}
`;document.head.appendChild(s)}

function enforceBulgarian(){
  document.documentElement.lang='bg';window.BLIS_LANGUAGE='bg';document.documentElement.dataset.navigatorLanguage='bg-only';
  const sub=document.querySelector('.brandsub');if(sub)sub.textContent='Система за бизнес анализ и наблюдение';
  document.querySelectorAll('.bch3-lang').forEach(x=>x.remove());
  document.querySelectorAll('.vs-vhead em,.sv2-ch em').forEach(x=>{if(/^LIVE$/i.test(x.textContent.trim()))x.textContent='АКТУАЛНО'});
  document.querySelectorAll('.vs-vhead b,.sv2-ch b').forEach(x=>{if(/^Decision Map$/i.test(x.textContent.trim()))x.textContent='Карта на решенията'});
  const live=document.querySelector('.blis-system-primary b');if(live&&/^BLIS\s+LIVE$/i.test(live.textContent.trim()))live.textContent='BLIS АКТУАЛНО';
}
function addButton(){
  const story=document.querySelector('.page.active .nv3-story');if(!story)return;const actions=story.querySelector('.nv3-story-actions');if(!actions||actions.querySelector('[data-n3p-open]'))return;
  const b=document.createElement('button');b.type='button';b.className='n3p-open';b.dataset.n3pOpen='1';b.textContent='Доказателства за страницата';actions.insertBefore(b,actions.firstChild);
}
function drawer(){let d=document.getElementById('n3pDrawer');if(d)return d;document.body.insertAdjacentHTML('beforeend','<div id="n3pBackdrop" class="nv3-drawer-backdrop"></div><aside id="n3pDrawer" class="nv3-drawer" aria-hidden="true"><div class="nv3-drawer-head"><div><span>Фактология и източници</span><h3 data-n3p-title>Доказателства</h3></div><button type="button" class="nv3-drawer-close" data-n3p-close aria-label="Затвори">×</button></div><div class="nv3-drawer-body" data-n3p-body></div></aside>');return document.getElementById('n3pDrawer')}
function open(){
  const id=page(),d=drawer(),body=d.querySelector('[data-n3p-body]'),rr=related(id).slice(0,5),ss=sources().slice(0,8),hh=historyRows();
  d.querySelector('[data-n3p-title]').textContent=`${LABEL[id]||'Страница'} · доказателства`;
  const proof=rr.length?rr.map(s=>`<div class="n3p-proof"><b>${esc(s.title||s.text||'Значим публичен сигнал')}</b><small>${esc(sourceName(s))} · ${esc(date(s.published_at||s.detected_at))}${Number(s.evidence_count||0)>1?` · ${Number(s.evidence_count)} потвърждения`:''}</small>${/^https?:\/\//i.test(String(s.url||''))?`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Първоизточник ↗</a>`:''}</div>`).join(''):`<div class="n3p-empty">Няма отделен актуален сигнал, който самостоятелно да обяснява тази страница. Показаните стойности трябва да се четат като обобщение на наличната информация за периода.</div>`;
  const src=ss.length?ss.map(x=>`<div class="n3p-source"><b>${esc(x.label)}</b>${x.method?`<br>${esc(x.method)}`:''}${/^https?:\/\//i.test(String(x.url||''))?`<br><a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">Отвори източника ↗</a>`:''}</div>`).join(''):`<div class="n3p-empty">Няма публикуван списък с източници за този клиентски профил.</div>`;
  body.innerHTML=`<div class="n3p-meta"><div class="n3p-stat"><span>Значими сигнали</span><b>${rr.length}</b></div><div class="n3p-stat"><span>Наблюдавани източници</span><b>${sources().length}</b></div><div class="n3p-stat"><span>Исторически записи</span><b>${hh.length}</b></div></div><div class="n3p-block"><span>Какво стои зад тази страница</span><p>Показваме наличната фактология за ${esc(client())}, която е свързана с текущия аналитичен контекст. Тук няма формули за изчисление — само проверими сигнали, източници и налична история.</p>${proof}</div><div class="n3p-block"><span>Информационни източници</span>${src}</div><div class="n3p-note">Липсата на отделен сигнал не се интерпретира като положително или отрицателно събитие. Navigator показва само това, което наличната информация подкрепя.</div>`;
  d.classList.add('open');d.setAttribute('aria-hidden','false');document.getElementById('n3pBackdrop')?.classList.add('open');
}
function close(){document.getElementById('n3pDrawer')?.classList.remove('open');document.getElementById('n3pDrawer')?.setAttribute('aria-hidden','true');document.getElementById('n3pBackdrop')?.classList.remove('open')}
function decorate(){css();enforceBulgarian();addButton();document.documentElement.dataset.navigatorProof='page-proof-v1'}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;decorate()})}

document.addEventListener('click',e=>{if(e.target.closest?.('[data-n3p-open]')){e.preventDefault();e.stopPropagation();open();return}if(e.target.closest?.('[data-n3p-close]')||e.target.id==='n3pBackdrop'){e.preventDefault();close()}},true);document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});window.addEventListener('blis:routechange',()=>setTimeout(schedule,40));window.addEventListener('blis:clientdata',()=>setTimeout(schedule,80));window.addEventListener('blis:intelligence',()=>setTimeout(schedule,80));
const mo=new MutationObserver(schedule);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{css();mo.observe(document.querySelector('.shell')||document.body,{childList:true,subtree:true,characterData:true});schedule()},{once:true});else{css();mo.observe(document.querySelector('.shell')||document.body,{childList:true,subtree:true,characterData:true});schedule()}
window.BLISNavigator3ClientProofV1={decorate,open,enforceBulgarian};
})();
