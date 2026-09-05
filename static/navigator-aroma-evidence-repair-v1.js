/* BLIS Navigator — Aroma evidence repair v1.
   Client-facing repair for the oldest profile: use the existing activity/history/source base,
   remove leaked technical labels and replace misleading zero/flat states with measured context.
   No invented publications, mentions or competitor actions. */
(function(){
'use strict';
if(window.__BLIS_AROMA_EVIDENCE_REPAIR_V1)return;window.__BLIS_AROMA_EVIDENCE_REPAIR_V1=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;

const A=x=>Array.isArray(x)?x:[], E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const current=()=>new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma';
const stamp=x=>{const t=Date.parse(x?.published_at||x?.detected_at||x?.observed_at||x?.created_at||x?.time||x?.date||'');return Number.isFinite(t)?t:null};
const fmt=t=>t?new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'}):'без дата';
const metric=x=>String(x?.metric||x?.metric_key||x?.key||'').toLowerCase();
const source=x=>String(x?.source_label||x?.source_name||x?.publisher||x?.source||'').trim();
const badMetric=/^(?:history|data_quality|source_key|metric_key|profile_active|website_active|reachable|follower_count|followers|snapshot|snapshots)$/i;
const lowValue=/(?:follower_count|followers|profile_active|website_active|reachable|source_key|metric_key|data_quality)|(?:последовател|followers?)\s*$/i;
const meaningful=/(news|mention|media|review|rating|search|visibility|product|campaign|content|compet|price|market|reputation|sentiment|post|publication|публикац|споменав|отзив|оценк|конкур|кампан|продукт|пазар|репутац|видимост)/i;
const names={news_mentions_30d:'Медийни споменавания',news_mentions:'Медийни споменавания',mentions:'Публични споменавания',review_count:'Публични отзиви',rating:'Публична оценка',visible_posts_90d:'Видими публикации',search_visibility:'Видимост в търсене',followers:'Публична аудитория',follower_count:'Публична аудитория'};
let cache=null, loading=null;

async function load(){
  if(cache)return cache;if(loading)return loading;
  loading=Promise.all([
    fetch('/api/clients/aroma/dashboard',{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({})),
    fetch('/api/clients/aroma/sources',{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
    fetch('/api/clients/aroma/data-quality',{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({})),
    fetch('/api/clients/aroma/activity',{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
    fetch('/api/clients/aroma/history',{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
    fetch('/api/signals?client=aroma&limit=500&_='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[])
  ]).then(([d,s,q,a,h,sg])=>cache={dashboard:d||{},sources:A(s),quality:q||{},activity:A(a),history:A(h),signals:A(sg?.signals||sg)}).finally(()=>loading=null);
  return loading;
}

function css(){if(document.getElementById('aromaEvidenceRepairCss'))return;const s=document.createElement('style');s.id='aromaEvidenceRepairCss';s.textContent=`
.aroma-evidence-strip{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0 0 16px;padding:14px;border:1px solid #d9e5ef;border-radius:16px;background:linear-gradient(135deg,#fff,#f7fbfe);box-shadow:0 8px 26px rgba(46,72,96,.05)}
.aroma-evidence-strip .aes{padding:10px 12px;border-right:1px solid #e3ebf2}.aroma-evidence-strip .aes:last-child{border-right:0}.aroma-evidence-strip span{display:block;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.45px;color:#7f91a2}.aroma-evidence-strip b{display:block;margin-top:5px;font-size:23px;color:#1d4668}.aroma-evidence-strip small{display:block;margin-top:3px;font-size:10px;color:#71869a;line-height:1.35}
.aroma-measured-panel{margin:0 0 16px;border:1px solid #dbe6ef;border-radius:17px;background:#fff;overflow:hidden}.aroma-measured-panel header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding:16px 18px 12px;border-bottom:1px solid #e7edf2}.aroma-measured-panel h3{margin:0;font-size:17px;color:#173f61}.aroma-measured-panel p{margin:5px 0 0;font-size:11px;line-height:1.5;color:#72869a}.aroma-measured-panel .amp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0}.aroma-measured-panel .amp-item{padding:13px 18px;border-bottom:1px solid #edf1f5}.aroma-measured-panel .amp-item:nth-child(odd){border-right:1px solid #edf1f5}.aroma-measured-panel .amp-item b{display:block;font-size:12px;color:#284d6c}.aroma-measured-panel .amp-item small{display:block;margin-top:3px;font-size:10px;color:#7c8fa1}.aroma-measured-panel .amp-item strong{display:block;margin-top:5px;font-size:13px;color:#183f61}.aroma-repair-hidden{display:none!important}.aroma-repair-note{font-size:10px!important;color:#7b8fa2!important;font-weight:500!important}
@media(max-width:850px){.aroma-evidence-strip{grid-template-columns:1fr 1fr}.aroma-evidence-strip .aes{border-right:0}.aroma-measured-panel .amp-grid{grid-template-columns:1fr}.aroma-measured-panel .amp-item:nth-child(odd){border-right:0}}
`;document.head.appendChild(s)}

function metricLabel(m){m=String(m||'').trim();if(names[m])return names[m];return m.replace(/^cmp[_-]?/i,'').replace(/[_-]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}
function usefulActivity(x){const m=metric(x),t=[m,source(x),x?.label,x?.title].filter(Boolean).join(' ');return m&&!badMetric.test(m)&&(!lowValue.test(t)||/(change|delta|growth|спрямо|промян|ръст|спад)/i.test(t))&&meaningful.test(t)}
function latestActivity(data){return data.activity.filter(usefulActivity).map(x=>({...x,_t:stamp(x)})).sort((a,b)=>(b._t||0)-(a._t||0));}
function competitors(data){return A(data.dashboard?.competitors).map(x=>x?.name||x?.label).filter(Boolean)}
function competitorActivity(data){const names=competitors(data).map(x=>x.toLowerCase());return latestActivity(data).filter(x=>{const h=[metric(x),source(x),x?.title,x?.label,x?.description].filter(Boolean).join(' ').toLowerCase();return /compet|cmp_|конкур/i.test(h)||names.some(n=>n&&h.includes(n))})}
function periodActivity(data,days=60){const cut=Date.now()-days*864e5;return latestActivity(data).filter(x=>!x._t||x._t>=cut)}
function signalRows(data){return data.signals.map(x=>({...x,_t:stamp(x)})).filter(x=>{const h=[x?.title,x?.label,x?.description,x?.detail,x?.text].filter(Boolean).join(' ');return h&&!/^(?:history|data_quality)$/i.test(h.trim())&&!/(^|\s)823\s+последователи?($|\s)/i.test(h)}).sort((a,b)=>(b._t||0)-(a._t||0))}
function evidence(data){const obs=data.activity.length,src=data.sources.length,snap=data.history.length,cmp=competitors(data).length;return{obs,src,snap,cmp}}

function strip(data){const e=evidence(data);return `<div class="aroma-evidence-strip" data-aroma-repair="strip"><div class="aes"><span>Натрупана база</span><b>${e.obs.toLocaleString('bg-BG')}</b><small>измерени наблюдения в клиентския профил</small></div><div class="aes"><span>Източници</span><b>${e.src}</b><small>конфигурирани публични и секторни източника</small></div><div class="aes"><span>История</span><b>${e.snap}</b><small>записани сравними състояния</small></div><div class="aes"><span>Конкурентен набор</span><b>${e.cmp}</b><small>наблюдавани конкурентни профила</small></div></div>`}
function item(x){const m=metricLabel(metric(x)),s=source(x)||'наблюдаван източник',v=x?.value??x?.display??x?.current_value??'',d=x._t?fmt(x._t):'историческа база';return `<div class="amp-item"><b>${E(m||'Измерено развитие')}</b><small>${E(s)} · ${E(d)}</small>${v!==''?`<strong>${E(v)}</strong>`:''}</div>`}
function measuredPanel(data,page){let rows=periodActivity(data,60),title='Реално натрупани измервания',sub='Последните налични измервания от съществуващата база на Aroma. Това са измервания, не автоматично медийни публикации.';
  if(page==='competition'){rows=competitorActivity(data);title='Конкурентни измервания и движения';sub='Показват се само записи, свързани с наблюдавания конкурентен набор. Липсата на валидирано действие не занулява историческата база.'}
  if(page==='social'){const sr=signalRows(data);if(sr.length){return `<section class="aroma-measured-panel" data-aroma-repair="panel"><header><div><h3>Потвърдени сигнали в наличния поток</h3><p>Сурови технически ключове, абсолютни follower броячи и диагностични записи са изключени.</p></div><small>${sr.length} налични</small></header><div class="amp-grid">${sr.slice(0,8).map(x=>`<div class="amp-item"><b>${E(x.title||x.label||'Сигнал')}</b><small>${E(source(x)||'публичен източник')} · ${E(x._t?fmt(x._t):'')}</small><strong>${E(x.description||x.detail||x.text||'Потвърдено наблюдение')}</strong></div>`).join('')}</div></section>`}}
  const chosen=rows.slice(0,8);return `<section class="aroma-measured-panel" data-aroma-repair="panel"><header><div><h3>${E(title)}</h3><p>${E(sub)}</p></div><small>${rows.length} релевантни записа</small></header>${chosen.length?`<div class="amp-grid">${chosen.map(item).join('')}</div>`:`<div style="padding:16px 18px;font-size:11px;color:#71869a">В наличната база няма запис, който може коректно да бъде представен като ново развитие за този модул. Navigator не го замества с измислено събитие.</div>`}</section>`}

function host(page){const p=document.getElementById(page);if(!p)return null;return p.querySelector(`#${page}Body`)||p.querySelector('[id$="Body"]')||p}
function insertData(data,page){const h=host(page);if(!h||h.querySelector('[data-aroma-repair="strip"]'))return;const first=h.querySelector('.genericHead,.ref-title,.n3-head,.vs-head,.pageHead,.clientHero');if(first){first.insertAdjacentHTML('afterend',strip(data)+measuredPanel(data,page))}else h.insertAdjacentHTML('afterbegin',strip(data)+measuredPanel(data,page))}

function leafs(root){return [...root.querySelectorAll('span,small,p,b,strong,h3,h4,div')].filter(x=>x.children.length===0)}
function hideBlock(el){const b=el.closest('.item,.row,.signal-item,.vs-mini,.vs-side-card,.metric-intel-row,.metric-row,.change-item,.n3-live-item,.n3-change,.card,article');if(b&&b.innerText.length<650)b.classList.add('aroma-repair-hidden');else el.classList.add('aroma-repair-hidden')}
function sanitize(root,data){
  const e=evidence(data);
  leafs(root).forEach(el=>{let t=(el.textContent||'').replace(/\s+/g,' ').trim();if(!t)return;
    if(/^(?:history|data_quality)$/i.test(t)){hideBlock(el);return}
    if(/^\d+[\s.,]*последователи$/i.test(t)){const box=el.closest('.item,.row,.signal-item,.vs-mini,.metric-row,article');const bt=(box?.innerText||'');if(!/(спрямо|ръст|спад|промян|→|↗|↘|%)/i.test(bt))hideBlock(el);return}
    if(/^публичен източник\s*\/\s*100$/i.test(t)){el.textContent='Публичен източник';el.classList.add('aroma-repair-note');return}
    if(/качество на доказателствата\s*:\s*100\s*\/\s*100/i.test(t)&&/общо сигнали\s*0/i.test(root.innerText||'')){el.textContent='Качеството не се оценява при 0 валидирани сигнала.';el.classList.add('aroma-repair-note');return}
    if(/наличните сигнали или разнообразието от източници все още са ограничени/i.test(t)&&e.obs>100){el.textContent=`Историческата база съдържа ${e.obs.toLocaleString('bg-BG')} измерени наблюдения от ${e.src} конфигурирани източника. Изводът за конкретния модул трябва да се базира на релевантната подгрупа, а не на обща липса на данни.`;return}
    if(/недостатъчна доказателствена база за твърд извод/i.test(t)&&e.obs>100){el.textContent='За този конкретен извод няма достатъчно независими потвърждения. Общата историческа база на Aroma е налична и не е нулева.';return}
    if(/няма потвърдено ново конкурентно действие/i.test(t)&&e.cmp>0){const n=competitorActivity(data).length;el.textContent=n?`Налични са ${n} конкурентни измервания в базата. Ново действие се показва само когато е потвърдено като конкретно събитие.`:`Наблюдават се ${e.cmp} конкурентни профила. За избрания период няма запис, който коректно да бъде обявен като ново конкретно действие.`;return}
  });
  root.querySelectorAll('[data-blis-client-value-hidden="1"]').forEach(el=>{if(/history|data_quality|последователи/i.test(el.innerText||''))el.classList.add('aroma-repair-hidden')});
}
function hideMisleadingFlat(root,data){if(data.activity.length<50)return;root.querySelectorAll('.card,.panel,.widget,section').forEach(box=>{const t=(box.innerText||'').replace(/\s+/g,' ').trim();if(t.length>900)return;if(/Активност във времето/i.test(t)&&/0\s+1\s+0\s+0\s+0\s+0/.test(t))box.classList.add('aroma-repair-hidden')});}

async function repair(){if(current()!=='aroma')return;css();const data=await load();['overview','social','market','competition','history','reports'].forEach(p=>insertData(data,p));const shell=document.querySelector('.shell')||document;sanitize(shell,data);hideMisleadingFlat(shell,data);document.documentElement.dataset.aromaEvidenceRepair='v1'}
let timer=null;function schedule(){clearTimeout(timer);timer=setTimeout(repair,120)}
for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,schedule);
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option,.datebox,[data-page]'))schedule()},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{repair();setTimeout(repair,900);setTimeout(repair,2600)},{once:true});else{repair();setTimeout(repair,900);setTimeout(repair,2600)}
})();