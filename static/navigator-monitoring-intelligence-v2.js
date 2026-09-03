/* BLIS Navigator — Monitoring Intelligence V2
   Turns Monitoring into a decision-useful observation page: no decorative
   intelligence labels, no misleading flat trend, and no raw follower/site
   telemetry. All added values are derived from current significant signals. */
(function(){
'use strict';
if(window.__BLIS_MONITORING_INTELLIGENCE_V2)return;
window.__BLIS_MONITORING_INTELLIGENCE_V2=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;

const A=v=>Array.isArray(v)?v:[];
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=s=>String(s??'').toLowerCase().replace(/\s+/g,' ').trim();
const D=()=>window.D||{};
const period=()=>Math.max(1,Number(window.BLISPeriod?.days)||30);
const client=()=>{try{return window.BLISClientUIV3?.current?.()||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||D().slug||'aroma'}catch(_){return D().slug||'aroma'}};
const lowValue=/(?:website_active|profile_active|reachable|direct_booking|follower_count|followers|source_key|metric_key|observed_at|snapshots?)|(?:официалният\s+)?сайт(?:ът)?(?:\s+и\s+електронният\s+магазин)?\s+(?:е|са)\s+(?:достъпен|достъпни|активен|активни|работещ|работещи)|(?:linkedin|facebook|instagram|youtube|tiktok).{0,80}(?:аудитория|последовател|абонат).{0,40}\d/i;
const comparative=/(?:%|спрямо|ръст|спад|увелич|намал|промян|тенденц|конкурент|бенчмарк)/i;
const attentionRe=/(?:critical|high|negative|риск|криз|негатив|жалб|проблем|санкц|регулац|спад|наруш|съд|дело|атака)/i;

function text(s){return String(s?.title||s?.text||s?.description||s?.detail||s?.label||'').replace(/\s+/g,' ').trim()}
function stamp(s){const raw=s?.published_at||s?.detected_at||s?.observed_at||s?.created_at||s?.time||s?.date||'';const t=Date.parse(raw);return Number.isFinite(t)?t:null}
function source(s){return String(s?.source_label||s?.source_name||s?.publisher||s?.source||'').replace(/\s+/g,' ').trim()||'Неуточнен източник'}
function key(s){return String(s?.fingerprint||s?.id||s?.url||s?.link||`${text(s)}|${source(s)}|${stamp(s)||''}`).toLowerCase()}
function useful(s){const t=text(s);if(!t)return false;if(lowValue.test(t)&&!comparative.test(t))return false;return true}
function isAttention(s){return ['critical','high'].includes(N(s?.severity))||N(s?.sentiment)==='negative'||/risk|риск/.test(N(s?.kind))||attentionRe.test([s?.topic,s?.category,text(s)].filter(Boolean).join(' '))}
function isCompetitor(s){return N(s?.scope)==='competitor'||/compet|конкур/.test([s?.topic,s?.category,s?.kind].filter(Boolean).join(' ').toLowerCase())}
function topicOf(s){const raw=String(s?.topic||s?.category||'').replace(/[_-]+/g,' ').trim();if(raw&&!/^(signal|signals|monitoring|news|other|друго|други)$/i.test(raw))return raw;const h=N([text(s),s?.scope].filter(Boolean).join(' '));if(isCompetitor(s))return'Конкуренти';if(/репутац|review|rating|отзив|довер|жалб/.test(h))return'Репутация';if(/регулац|институц|съд|закон|наредб/.test(h))return'Регулации';if(/цена|пазар|търсене|продажб|категор/.test(h))return'Пазар';if(/кампан|реклам|медия|публикац/.test(h))return'Комуникация';if(/продукт|услуг|портфоли/.test(h))return'Продукти';return'Други'}
function fmtDate(t){if(!t)return'—';return new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}
function rel(t){if(!t)return'няма времева точка';const m=Math.max(0,Math.round((Date.now()-t)/60000));if(m<60)return m<2?'преди малко':`преди ${m} мин.`;const h=Math.round(m/60);if(h<48)return`преди ${h} ч.`;const d=Math.round(h/24);if(d<30)return`преди ${d} дни`;return new Date(t).toLocaleDateString('bg-BG')}

let cache={client:'',at:0,rows:[]},busy=null;
async function rows(force=false){
  const c=String(client());
  if(!force&&cache.client===c&&Date.now()-cache.at<75000)return cache.rows;
  if(busy)return busy;
  busy=(async()=>{
    const all=[];
    try{const x=window.BLISIntelligenceStreamV3?.getUsefulSignals?.();if(Array.isArray(x))all.push(...x)}catch(_){}
    all.push(...A(D().signals));
    if(c&&c!=='kub')try{const r=await fetch(`/api/signals?client=${encodeURIComponent(c)}&limit=500&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});if(r.ok){const j=await r.json();all.push(...A(j?.signals))}}catch(_){}
    const seen=new Set(),cut=Date.now()-period()*864e5;
    const out=all.filter(useful).filter(s=>{const k=key(s);if(!k||seen.has(k))return false;seen.add(k);const t=stamp(s);return !t||t>=cut}).sort((a,b)=>(stamp(b)||0)-(stamp(a)||0));
    cache={client:c,at:Date.now(),rows:out};return out;
  })();
  try{return await busy}finally{busy=null}
}

function renameLegacy(root){
  const map=[
    [/^Интелигентен\s+радар$/i,'Радар'],
    [/^Канално\s+присъствие\s+в\s+радара$/i,'Източници на сигналите']
  ];
  root.querySelectorAll('h1,h2,h3,h4,h5,b,strong,span,p,small').forEach(el=>{
    if(el.children.length)return;const t=(el.textContent||'').replace(/\s+/g,' ').trim();if(!t)return;
    for(const [re,to] of map)if(re.test(t)){el.textContent=to;el.dataset.mon2Renamed='1';break}
  });
  root.querySelectorAll('h2,h3,h4,h5,b,strong,span').forEach(el=>{
    if(el.children.length)return;const t=(el.textContent||'').replace(/\s+/g,' ').trim();if(!/^Измерена\s+динамика$/i.test(t))return;
    const box=el.closest('.sm-card,.dv-card,.n3-card,.card,.panel,.widget,.chart-card,.radar-card,.metric-card');
    if(box&&box.id!=='socialBody'&&!box.classList.contains('mon2'))box.dataset.mon2LegacyDynamics='1';
    else{el.textContent='История на индекса';el.dataset.mon2Renamed='1'}
  });
}

function buckets(xs,n=6){
  const end=Date.now(),start=end-period()*864e5,span=(end-start)/n,b=Array.from({length:n},(_,i)=>({start:start+i*span,end:start+(i+1)*span,count:0}));
  xs.forEach(s=>{const t=stamp(s);if(!t||t<start||t>end)return;const i=Math.min(n-1,Math.max(0,Math.floor((t-start)/span)));b[i].count++});
  return b;
}
function topicStats(xs){const m=new Map();xs.forEach(s=>{const t=topicOf(s);m.set(t,(m.get(t)||0)+1)});return [...m.entries()].sort((a,b)=>b[1]-a[1])}
function sourceStats(xs){const m=new Map();xs.forEach(s=>{const q=source(s);m.set(q,(m.get(q)||0)+1)});return [...m.entries()].sort((a,b)=>b[1]-a[1])}
function freshness(last){if(!last)return 0;const h=(Date.now()-last)/36e5;if(h<=24)return 100;if(h<=72)return 82;if(h<=168)return 64;if(h<=336)return 42;if(h<=720)return 20;return 8}
function profile(xs,b,topics,sources){
  const total=xs.length||1,last=stamp(xs[0]),nonEmpty=b.filter(x=>x.count>0).length,att=xs.filter(isAttention).length,comp=xs.filter(isCompetitor).length,top=topics[0]?.[1]||0,uniq=sources.length;
  return [
    ['Свежест',freshness(last)],
    ['Непрекъснатост',Math.round(nonEmpty/b.length*100)],
    ['Разнообразие',Math.round(Math.min(1,uniq/Math.min(6,total))*100)],
    ['За внимание',Math.round(att/total*100)],
    ['Конкурентен дял',Math.round(comp/total*100)],
    ['Тематична концентрация',Math.round(top/total*100)]
  ]
}
function radarSVG(vals){
  const w=360,h=300,cx=180,cy=145,R=105,n=vals.length,pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]};
  const grids=[.25,.5,.75,1].map(q=>`<polygon points="${vals.map((_,i)=>pt(i,R*q).join(',')).join(' ')}" fill="none" stroke="#dce7f0" stroke-width="1"/>`).join('');
  const axes=vals.map((_,i)=>{const p=pt(i,R);return`<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#e1e9f0"/>`}).join('');
  const poly=vals.map((x,i)=>pt(i,R*Math.max(0,Math.min(100,x[1]))/100).join(',')).join(' ');
  const labels=vals.map((x,i)=>{const p=pt(i,R+28),anchor=p[0]<cx-10?'end':p[0]>cx+10?'start':'middle';return`<text x="${p[0]}" y="${p[1]}" text-anchor="${anchor}" dominant-baseline="middle">${E(x[0])}</text>`}).join('');
  const dots=vals.map((x,i)=>{const p=pt(i,R*Math.max(0,Math.min(100,x[1]))/100);return`<circle cx="${p[0]}" cy="${p[1]}" r="3.5"><title>${E(x[0])}: ${x[1]}/100</title></circle>`}).join('');
  return`<svg class="mon2-radar" viewBox="0 0 ${w} ${h}" aria-label="Профил на наблюдението">${grids}${axes}<polygon class="mon2-radar-area" points="${poly}"/>${dots}${labels}</svg>`
}
function activityHTML(b){
  const max=Math.max(1,...b.map(x=>x.count)),timed=b.reduce((a,x)=>a+x.count,0);
  if(!timed)return'<div class="mon2-empty">За избрания период няма достатъчно сигнали с надеждна времева точка. Navigator няма да чертае изкуствена права линия.</div>';
  return`<div class="mon2-bars">${b.map(x=>`<div class="mon2-bar-col"><b>${x.count}</b><div><i style="height:${Math.max(5,x.count/max*100)}%"></i></div><small>${E(fmtDate(x.start))}</small></div>`).join('')}</div>`
}
function sourceHTML(stats,total){
  if(!stats.length)return'<div class="mon2-empty">Няма достатъчно идентифицирани източници за разпределение.</div>';
  const max=Math.max(1,...stats.slice(0,6).map(x=>x[1]));
  return`<div class="mon2-source-list">${stats.slice(0,6).map(([s,n])=>`<div class="mon2-source"><div><b>${E(s)}</b><small>${n} ${n===1?'сигнал':'сигнала'} · ${Math.round(n/Math.max(1,total)*100)}%</small></div><span><i style="width:${Math.max(4,n/max*100)}%"></i></span></div>`).join('')}</div>`
}
function insights(xs,b,topics,sources){
  if(!xs.length)return['Няма значима промяна над прага за показване през избрания период.'];
  const total=xs.length,att=xs.filter(isAttention).length,comp=xs.filter(isCompetitor).length,top=topics[0],prev=b.slice(0,3).reduce((a,x)=>a+x.count,0),recent=b.slice(3).reduce((a,x)=>a+x.count,0),out=[];
  if(att/total>=.3)out.push(`${att} от ${total} значими сигнала попадат в групата „за внимание“ — това е съществен дял от наблюдението.`);
  else if(att)out.push(`${att} ${att===1?'сигнал изисква':'сигнала изискват'} внимание, но не доминират текущия поток.`);
  if(comp/total>=.25)out.push(`Конкурентните развития формират ${Math.round(comp/total*100)}% от значимите сигнали за периода.`);
  if(top&&top[0]!=='Други'&&top[1]/total>=.35)out.push(`Наблюдението е концентрирано около „${top[0]}“ — ${top[1]} от ${total} сигнала.`);
  if(sources.length<=1&&total>2)out.push('Сигналите идват от ограничен брой източници; изводът трябва да се третира като по-слабо потвърден.');
  if(recent!==prev)out.push(`Втората половина на периода съдържа ${recent} значими сигнала спрямо ${prev} в първата половина.`);
  if(!out.length)out.push('Потокът е сравнително равномерно разпределен и няма един доминиращ фактор над прага за акцент.');
  return out.slice(0,3)
}
function card(label,value,foot,cls=''){return`<div class="mon2-kpi ${cls}"><span>${E(label)}</span><strong>${E(value)}</strong><small>${E(foot)}</small></div>`}

function css(){if(document.getElementById('mon2CSS'))return;const s=document.createElement('style');s.id='mon2CSS';s.textContent=`
#social [data-mon2-legacy-dynamics="1"]{display:none!important}
#social [data-mon2-renamed="1"]{letter-spacing:normal!important}
#social .mon2{margin:14px 0 18px;border:1px solid #d9e4ee;border-radius:18px;background:linear-gradient(145deg,#fff,#f8fbfe);box-shadow:0 12px 32px rgba(31,65,99,.055);overflow:hidden}
#social .mon2-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:17px 18px 12px}#social .mon2-kicker{display:block;color:#7f93a6;font-size:7px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}#social .mon2-head h3{margin:4px 0 0;color:#244968;font-size:20px;letter-spacing:-.03em}#social .mon2-head p{margin:5px 0 0;color:#768b9e;font-size:8.5px;line-height:1.5}#social .mon2-period{border:1px solid #d7e4ef;border-radius:999px;background:#fff;padding:7px 10px;color:#54728d;font-size:8px;font-weight:850;white-space:nowrap}
#social .mon2-kpis{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;padding:0 16px 14px}#social .mon2-kpi{min-width:0;border:1px solid #e1e8ef;border-radius:12px;background:#fff;padding:10px 11px}#social .mon2-kpi span{display:block;color:#8293a3;font-size:7px;font-weight:850;text-transform:uppercase;letter-spacing:.04em}#social .mon2-kpi strong{display:block;margin-top:5px;color:#28506f;font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#social .mon2-kpi small{display:block;margin-top:4px;color:#8897a5;font-size:7px;line-height:1.35}#social .mon2-kpi.att strong{color:#b85b54}#social .mon2-kpi.comp strong{color:#6a55a5}
#social .mon2-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px 14px}#social .mon2-panel{border:1px solid #e0e8ef;border-radius:14px;background:#fff;padding:13px 14px;min-width:0}#social .mon2-panel h4{margin:0;color:#31536f;font-size:11px}#social .mon2-panel>p{margin:4px 0 10px;color:#8293a2;font-size:7.5px;line-height:1.45}
#social .mon2-bars{height:155px;display:grid;grid-template-columns:repeat(6,1fr);gap:8px;align-items:end;border-bottom:1px solid #e5ebf1;padding:7px 3px 0}#social .mon2-bar-col{text-align:center;min-width:0}#social .mon2-bar-col>b{display:block;color:#49657c;font-size:8px;margin-bottom:4px}#social .mon2-bar-col>div{height:105px;display:flex;align-items:flex-end;justify-content:center;background:#f5f8fb;border-radius:7px 7px 0 0;overflow:hidden}#social .mon2-bar-col i{display:block;width:58%;border-radius:6px 6px 0 0;background:linear-gradient(180deg,#4f96c9,#276da4);min-height:5px}#social .mon2-bar-col small{display:block;margin-top:5px;color:#8a99a7;font-size:6.5px}
#social .mon2-source-list{display:grid;gap:8px}#social .mon2-source{display:grid;grid-template-columns:150px minmax(0,1fr);gap:9px;align-items:center}#social .mon2-source b{display:block;color:#48647c;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#social .mon2-source small{display:block;margin-top:2px;color:#8a98a5;font-size:6.5px}#social .mon2-source span{height:7px;border-radius:999px;background:#edf2f6;overflow:hidden}#social .mon2-source i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#9bc4e3,#3f81b3)}
#social .mon2-profile{display:grid;grid-template-columns:minmax(320px,.85fr) minmax(0,1.15fr);gap:12px;padding:0 16px 16px}#social .mon2-radar-wrap{border:1px solid #e0e8ef;border-radius:14px;background:#fff;padding:11px 12px}#social .mon2-radar-wrap h4,#social .mon2-insights h4{margin:0;color:#31536f;font-size:11px}#social .mon2-radar-wrap p,#social .mon2-insights>p{margin:4px 0 6px;color:#8293a2;font-size:7.5px;line-height:1.45}#social .mon2-radar{width:100%;height:270px;display:block}#social .mon2-radar text{fill:#6e8498;font-size:8px;font-weight:750}#social .mon2-radar-area{fill:rgba(49,118,172,.16);stroke:#3176ac;stroke-width:2}#social .mon2-radar circle{fill:#fff;stroke:#3176ac;stroke-width:2}
#social .mon2-insights{border:1px solid #e0e8ef;border-radius:14px;background:#fff;padding:12px 13px}#social .mon2-insight-list{display:grid;gap:8px;margin-top:9px}#social .mon2-insight{border-left:3px solid #4b86b5;border-radius:0 9px 9px 0;background:#f7fafc;padding:9px 10px;color:#526d84;font-size:8.5px;line-height:1.5}#social .mon2-foot{margin:0 16px 15px;border-radius:10px;background:#f4f8fb;padding:8px 10px;color:#71869a;font-size:7px;line-height:1.45}#social .mon2-empty{display:grid;place-items:center;min-height:120px;border:1px dashed #dbe5ed;border-radius:10px;background:#fafcfd;padding:14px;text-align:center;color:#778b9e;font-size:8px;line-height:1.5}
@media(max-width:1050px){#social .mon2-kpis{grid-template-columns:repeat(3,1fr)}#social .mon2-profile{grid-template-columns:1fr}}@media(max-width:760px){#social .mon2-grid{grid-template-columns:1fr}#social .mon2-kpis{grid-template-columns:repeat(2,1fr)}#social .mon2-source{grid-template-columns:120px 1fr}#social .mon2-radar{height:245px}}
`;document.head.appendChild(s)}

async function render(){
  const root=document.getElementById('social');if(!root)return;css();renameLegacy(root);
  if(!root.classList.contains('active'))return;
  const host=document.getElementById('socialBody')||root,all=await rows(),b=buckets(all),topics=topicStats(all),sources=sourceStats(all),att=all.filter(isAttention),comp=all.filter(isCompetitor),last=all.map(stamp).filter(Boolean).sort((a,b)=>b-a)[0]||null,top=topics.find(x=>x[0]!=='Други')||topics[0],prof=profile(all,b,topics,sources),ins=insights(all,b,topics,sources),timed=b.reduce((a,x)=>a+x.count,0);
  document.getElementById('mon2')?.remove();
  const section=document.createElement('section');section.id='mon2';section.className='mon2';
  section.innerHTML=`<div class="mon2-head"><div><span class="mon2-kicker">МОНИТОРИНГ · ДОПЪЛНИТЕЛЕН КОНТЕКСТ</span><h3>Пулс на наблюдението</h3><p>Какво реално се случва в наблюдавания поток — интензитет, източници, теми, конкурентни развития и сигнали за внимание.</p></div><span class="mon2-period">${period()} дни</span></div><div class="mon2-kpis">${card('Значими сигнали',String(all.length),'само след филтъра за полезност')}${card('За внимание',String(att.length),all.length?`${Math.round(att.length/all.length*100)}% от значимите сигнали`:'няма активен дял','att')}${card('Конкурентни',String(comp.length),all.length?`${Math.round(comp.length/all.length*100)}% от текущия поток`:'няма текущи сигнали','comp')}${card('Източници',String(sources.length),'различими публични източници')}${card('Последен сигнал',last?rel(last):'—',last?fmtDate(last):'няма надеждна времева точка')}${card('Водеща тема',top?.[0]||'—',top?`${top[1]} ${top[1]===1?'сигнал':'сигнала'}`:'няма тематична концентрация')}</div><div class="mon2-grid"><div class="mon2-panel"><h4>Активност във времето</h4><p>Реален брой значими сигнали в шест последователни части на избрания период. Не се генерира изкуствена линия, когато няма движение.</p>${activityHTML(b)}${timed?`<p style="margin-top:8px">Времево позиционирани сигнали: <b>${timed}</b> от ${all.length}.</p>`:''}</div><div class="mon2-panel"><h4>Източници на сигналите</h4><p>Къде възниква наблюдаваната информация. Показват се само източници, които стоят зад значими сигнали.</p>${sourceHTML(sources,all.length)}</div></div><div class="mon2-profile"><div class="mon2-radar-wrap"><h4>Профил на наблюдението</h4><p>Относителен профил 0–100. По-висока стойност означава повече от съответната характеристика, а не непременно „по-добро“ състояние.</p>${radarSVG(prof)}</div><div class="mon2-insights"><h4>Какво показва наблюдението</h4><p>Автоматично обобщение само от наличните значими сигнали за периода.</p><div class="mon2-insight-list">${ins.map(x=>`<div class="mon2-insight">${E(x)}</div>`).join('')}</div></div></div><div class="mon2-foot">Профилът използва текущите значими сигнали, тяхната времева точка, тема, източник и конкурентна принадлежност. Абсолютни follower числа, нормална достъпност на сайт и друга техническа телеметрия не участват като самостоятелни клиентски изводи.</div>`;
  const radarHead=[...host.querySelectorAll('h2,h3,h4,h5,b,strong')].find(x=>(x.textContent||'').replace(/\s+/g,' ').trim()==='Радар');
  const radarBox=radarHead?.closest('.sm-card,.dv-card,.n3-card,.card,.panel,.widget,.radar-card,.vs-visual');
  if(radarBox&&radarBox.parentNode)radarBox.insertAdjacentElement('afterend',section);else host.appendChild(section);
  document.documentElement.dataset.monitoringIntelligence='v2';
}

let timers=[];
function schedule(force=false){timers.forEach(clearTimeout);timers=[40,160,420,900,1700,3000].map((ms,i)=>setTimeout(()=>{const r=document.getElementById('social');if(r)renameLegacy(r);if(r?.classList.contains('active'))render(i===timers.length-1&&force)},ms))}
for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,()=>schedule(ev==='blis:clientdata'));
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option,.datebox,[data-page],[data-n3-page]'))setTimeout(()=>schedule(true),20)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>schedule(true),{once:true});else schedule(true);
window.addEventListener('load',()=>setTimeout(()=>schedule(true),80),{once:true});
window.BLISMonitoringIntelligenceV2={render,schedule,rows,renameLegacy};
})();
