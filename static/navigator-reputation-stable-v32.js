/* BLIS Navigator — Reputation stable controller v32. No render loops / no DOM observer cascades. */
(function(){
'use strict';
if(window.__BLISReputationStableV32)return;window.__BLISReputationStableV32=true;
const A=v=>Array.isArray(v)?v:[];
const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const F=(v,d=1)=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:d});
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const NAMES={aroma:'Aroma Cosmetics',bolyarka:'Болярка','astor-garden':'Astor Garden','varna-towers':'Varna Towers'};
let timer=0,runId=0,busy=false,lastClient='';
function slugNow(){try{return (typeof slug!=='undefined'&&slug)||window.BLIS_INITIAL_CLIENT||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||'aroma'}catch(e){return'aroma'}}
async function getJSON(u){try{const r=await fetch(u,{cache:'no-store'});return r.ok?await r.json():null}catch(e){return null}}
function keyOf(x){return String(x?.key||x?.metric||x?.metric_key||x?.name||'').toLowerCase()}
function directIndex(d,keys){const wanted=keys.map(x=>x.toLowerCase());for(const pool of [A(d?.indices),A(d?.metrics)])for(const x of pool){if(wanted.includes(keyOf(x))){const v=N(x?.value);if(v!==null)return v}}return null}
function ownSource(s){const q=String(s?.key||s?.source_key||'').toLowerCase();return !/^(cmp_|competitor_)|competitor|конкурент|сравним/.test(q)}
function ownActivity(x){return ownSource({key:x?.source_key||x?.source})}
function obs(rows,keys,srcRx){const wanted=keys.map(x=>x.toLowerCase());for(const x of A(rows).slice().reverse()){if(!ownActivity(x))continue;const k=keyOf(x),s=String(x?.source_key||x?.source||'');if(srcRx&&!srcRx.test(s))continue;if(wanted.some(w=>k===w||k.endsWith('_'+w)||k.includes(w))){const v=N(x?.value);if(v!==null)return v}}return null}
function parseMetricDisplay(d,rx){for(const x of A(d?.metrics)){const label=String(x?.label||x?.name||'');if(rx.test(label)){const m=String(x?.display??x?.value??'').replace(',','.').match(/-?\d+(?:\.\d+)?/);if(m)return N(m[0])}}return null}
function riskCount(d){if(!Array.isArray(d?.signals))return null;return d.signals.filter(x=>/high|critical|warn|watch|risk|red|medium/i.test(String(x?.level||x?.severity||x?.status||''))||/риск|негатив|проблем|заплах|внимание|оплакван/i.test(`${x?.title||x?.label||''} ${x?.description||x?.detail||x?.text||''}`)).length}
function historySeries(h){const byDay=new Map();for(const row of A(h)){const p=row?.payload||row||{};let v=directIndex(p,['reputation','reputation_index']);if(v===null)continue;const raw=row?.created_at||p?.data_updated||p?.updated_at||p?.date||'';const t=Date.parse(raw);if(!Number.isFinite(t))continue;byDay.set(new Date(t).toISOString().slice(0,10),{t,value:v})}return [...byDay.values()].sort((a,b)=>a.t-b.t)}
function lastChange(rows){if(rows.length<2)return null;const cur=rows.at(-1).value;for(let i=rows.length-2;i>=0;i--){const d=cur-rows[i].value;if(Math.abs(d)>=.05)return Math.round(d*10)/10}return 0}
function stability(rows){if(rows.length<2)return null;const vals=rows.map(x=>x.value);return Math.max(0,Math.min(100,100-(Math.max(...vals)-Math.min(...vals))))}
function ratingNorm(v){if(v===null)return null;if(v<=5)return v/5*100;if(v<=10)return v/10*100;return null}
function q(sel){return document.querySelector(sel)}
function dim(id){return q(`#reputationBody [data-rp-dim="${id}"]`)}
function kpiBy(...labels){return [...document.querySelectorAll('#reputationBody .rp-kpi')].find(x=>labels.includes(x.querySelector(':scope>span')?.textContent?.trim()))||null}
function setIdentity(c){const name=NAMES[c]||c;const em=q('#reputationBody .rp-emblem');if(em){em.dataset.client=c;const mono=em.querySelector('span'),b=em.querySelector('b');if(mono){mono.textContent='';mono.style.display='none'}if(b){b.textContent=name;b.style.display='block'}}const sub=q('#reputationBody .rp-head p');if(sub)sub.textContent=`Публичното възприятие и репутационната среда на ${name} — само от измерими и проверими данни.`}
function setDim(id,title,sub,value,unit,status){const el=dim(id);if(!el)return;const b=el.querySelector('.rp-dim-copy>b'),sm=el.querySelector('.rp-dim-copy>small'),em=el.querySelector('.rp-dim-copy>em'),strong=el.querySelector(':scope>strong');if(b)b.textContent=title;if(sm)sm.textContent=sub;if(strong)strong.innerHTML=value===null?'<span class="rp-na">—</span>':`${E(F(value,value%1?1:0))}${unit?`<small>${E(unit)}</small>`:''}`;if(em){let dot=em.querySelector('i');em.textContent='';if(!dot)dot=document.createElement('i');em.appendChild(dot);em.append(document.createTextNode(status))}}
function setKpi(el,label,value,unit,foot){if(!el)return;const lab=el.querySelector(':scope>span'),strong=el.querySelector('strong'),small=el.querySelector(':scope>small');if(lab)lab.textContent=label;if(strong)strong.innerHTML=value===null?'<span class="rp-na">—</span>':`${E(F(value,value%1?1:0))}${unit?`<small>${E(unit)}</small>`:''}`;if(small)small.textContent=foot}
function renamePanels(change,topicCount){const h=q('#reputationBody .rp-dynamics header h3'),p=q('#reputationBody .rp-dynamics header p'),v=q('#reputationBody .rp-dynamics header>b');if(h)h.textContent='Репутационни изменения';if(p)p.textContent='Реални изменения на репутационния индекс в измерената история';if(v)v.textContent=change===null?'—':`${change>0?'+':''}${F(change)} т.`;const th=q('#rpTopics header h3'),tp=q('#rpTopics header p'),ln=q('#rpTopics .rp-panel-link');if(th)th.textContent='Контекст';if(tp)tp.textContent=`${topicCount} измерени теми и сигнали от публичната среда`;if(ln&&ln.childNodes[0])ln.childNodes[0].nodeValue='Целият контекст '}
async function fetchData(c){const t=Date.now();const base=`/api/clients/${encodeURIComponent(c)}`;const [d,a,h,s,k]=await Promise.all([getJSON(`${base}/dashboard?_=${t}`),getJSON(`${base}/activity?_=${t}`),getJSON(`${base}/history?_=${t}`),getJSON(`${base}/sources?_=${t}`),getJSON(`${base}/keywords?_=${t}`)]);return{d:d||{},a:A(a),h:A(h),s:A(s),k:A(k)}}
function apply(c,data){if(!q('#reputation')?.classList.contains('active'))return;const {d,a,h,s,k}=data;setIdentity(c);
 const social=directIndex(d,['presence','social','social_index','social_presence']);
 const mediaIdx=directIndex(d,['media','media_index','news_index']);
 const mentions=obs(a,['news_mentions_30d','mentions_30d','media_mentions_30d','news30'])??parseMetricDisplay(d,/Новинарска видимост|news mentions/i);
 const rating=obs(a,['average_rating','google_rating','review_rating','rating'],/google|notino|makeup|trust|review|rating|untappd|trip|booking/i);
 const reviewCount=obs(a,['review_count','reviews','rating_count','ratings','total_reviews']);
 const opinion=directIndex(d,['consumer_opinion','consumer_opinion_index','sentiment_index','consumer_sentiment','public_opinion']);
 const riskIdx=directIndex(d,['reputation_pressure','risk_index','reputation_risk']);
 const risks=riskCount(d);
 const repDirect=directIndex(d,['reputation','reputation_index']);
 const components=[social,mediaIdx!==null?mediaIdx:(mentions!==null?Math.min(100,mentions/15*100):null),ratingNorm(rating),opinion].filter(v=>v!==null);
 const rep=repDirect!==null?repDirect:(components.length?components.reduce((x,y)=>x+y,0)/components.length:null);
 const rows=historySeries(h),change=lastChange(rows),stable=stability(rows),sourceCount=A(s).filter(ownSource).length,topicCount=A(k).filter(x=>N(x?.value)!==null||x?.display).length;
 setDim('social','Социална среда','Измеримо публично присъствие в социалните канали',social,'/100',social===null?'Няма отделен измерен социален индекс':'Измерен индекс на публичното присъствие');
 setDim('media','Медии и новини','Медийно присъствие и измерими споменавания',mediaIdx!==null?mediaIdx:mentions,mediaIdx!==null?'/100':(mentions!==null?' / 30 дни':''),mediaIdx!==null?'Измерен медиен индекс':mentions!==null?'Реален брой медийни споменавания':'Няма измерен медиен обем');
 const rv=rating!==null?rating:reviewCount;setDim('reviews','Отзиви и оценки','Оценки и ревюта в публични платформи',rv,rating!==null?(rating<=5?' /5':' /10'):(reviewCount!==null?' оценки':''),rating!==null?'Измерена публична оценка':reviewCount!==null?'Измерен обем публични оценки/отзиви':'Няма надеждно измерване');
 setDim('opinions','Публични мнения','Измерими потребителски сигнали в публичната среда',opinion,opinion!==null?'/100':'',opinion!==null?'Измерен индекс на публичните нагласи':'Няма надеждно измерим индекс на публичните мнения');
 setDim('risk','Рискови сигнали','Активни сигнали с потенциален репутационен риск',riskIdx!==null?riskIdx:risks,riskIdx!==null?'/100':(risks!==null?' сигнала':''),riskIdx!==null?'Измерен репутационен рисков индекс':risks!==null?'Реално наблюдавани рискови сигнали':'Няма измерен набор от рискови сигнали');
 setKpi(kpiBy('Репутационен индекс'),'Репутационен индекс',rep,'/100',repDirect!==null?'Измерен текущ репутационен индекс':`Изчислен от ${components.length} налични измерими компонента`);
 setKpi(kpiBy('Репутационен баланс','Източниково покритие','Активни източници'),'Активни източници',sourceCount,' източника','Активни наблюдавани източници в клиентския профил');
 setKpi(kpiBy('Репутационен натиск','Репутационен риск'),'Репутационен риск',riskIdx!==null?riskIdx:risks,riskIdx!==null?'/100':(risks!==null?' сигнала':''),riskIdx!==null?'Измерен репутационен рисков индекс':risks!==null?'Активни реални рискови сигнали':'Няма измерен набор от рискови сигнали');
 setKpi(kpiBy('Публични оценки'),'Публични оценки',rating!==null?rating:reviewCount,rating!==null?(rating<=5?'/5':'/10'):(reviewCount!==null?' бр.':''),rating!==null?'Измерена средна публична оценка':reviewCount!==null?'Измерен обем оценки/отзиви':'Няма измерен обем оценки');
 setKpi(kpiBy('Устойчивост'),'Устойчивост',stable,stable!==null?'/100':'',stable!==null?'Изчислена от реалната историческа вариация':'Нужни са поне две реални исторически измервания');
 renamePanels(change,topicCount);
 q('#reputationBody')?.setAttribute('data-rp-stable','32');
}
async function run(forceRender=false){if(busy)return;const page=q('#reputation');if(!page?.classList.contains('active'))return;busy=true;const id=++runId,c=slugNow();try{const root=q('#reputationBody');if(forceRender||!root?.querySelector('.rp-screen')||lastClient!==c){window.BLISReputation?.render?.()}lastClient=c;const data=await fetchData(c);if(id===runId)apply(c,data)}finally{busy=false}}
function schedule(ms=60,force=false){clearTimeout(timer);timer=setTimeout(()=>run(force),ms)}
function install(){
 document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="reputation"]'))schedule(90,false);if(e.target?.closest?.('#rpRefresh'))schedule(260,false)},true);
 document.getElementById('clientSel')?.addEventListener('change',()=>schedule(180,true));
 if(document.body)new MutationObserver(ms=>{if(ms.some(m=>m.type==='attributes'&&m.attributeName==='data-client'))schedule(180,true)}).observe(document.body,{attributes:true,attributeFilter:['data-client']});
 if(q('#reputation')?.classList.contains('active'))schedule(80,false);
}
window.BLISReputationStableV32={run,schedule};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
