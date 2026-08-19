/* BLIS Navigator — Reputation real-data hydration v29.
   Uses only current dashboard/history/activity/source measurements.
   Derived values are calculated transparently from measured inputs. */
(function(){
'use strict';
if(window.__BLISReputationRealDataV29)return;window.__BLISReputationRealDataV29=true;
const ARR=v=>Array.isArray(v)?v:[];
const NUM=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const F=(v,d=1)=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:d});
const E=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const NAME={aroma:'Aroma Cosmetics',bolyarka:'Болярка','astor-garden':'Astor Garden','varna-towers':'Varna Towers'};
let busy=false,timer=0,seq=0;
function slugNow(){try{return (typeof slug!=='undefined'&&slug)||window.BLIS_INITIAL_CLIENT||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||'aroma'}catch(e){return'aroma'}}
function ownRow(x){const s=String(x?.source_key||x?.source||'').toLowerCase();return !/^(cmp_|competitor_)|competitor|сравним|конкурент/.test(s)}
function metricKey(x){return String(x?.metric_key||x?.metric||x?.key||x?.name||'').toLowerCase()}
function directIndex(d,keys){const wanted=keys.map(x=>x.toLowerCase());for(const pool of [ARR(d?.indices),ARR(d?.metrics)])for(const x of pool){const k=metricKey(x);if(wanted.includes(k)){const v=NUM(x?.value);if(v!==null)return v}}return null}
function obs(rows,keys,sourceRx=null){const wanted=keys.map(x=>x.toLowerCase());for(const x of ARR(rows).slice().reverse()){if(!ownRow(x))continue;const k=metricKey(x),s=String(x?.source_key||x?.source||'');if(sourceRx&&!sourceRx.test(s))continue;if(wanted.some(w=>k===w||k.endsWith('_'+w)||k.includes(w))){const v=NUM(x?.value);if(v!==null)return{value:v,source:s,key:k,at:x?.observed_at||x?.time||''}}}return null}
function clamp(v,a=0,b=100){return Math.max(a,Math.min(b,v))}
function mean(xs){const a=xs.filter(x=>NUM(x)!==null).map(Number);return a.length?a.reduce((p,c)=>p+c,0)/a.length:null}
function dashboardMetricDisplay(d,labelRx){for(const x of ARR(d?.metrics)){const label=String(x?.label||x?.name||'');if(labelRx.test(label))return String(x?.display??x?.value??'')}return''}
function parseFirstNumber(s){const m=String(s||'').replace(',','.').match(/-?\d+(?:\.\d+)?/);return m?NUM(m[0]):null}
function riskRows(d){const all=ARR(d?.signals);return all.filter(x=>/high|critical|warn|watch|risk|red|medium/i.test(String(x?.level||x?.severity||x?.status||''))||/риск|негатив|проблем|заплах|внимание|оплакван/i.test(`${x?.title||x?.label||''} ${x?.description||x?.detail||x?.text||''}`))}
function reviewSourceCount(sources){return ARR(sources).filter(s=>{const q=`${s?.key||''} ${s?.label||''} ${s?.method||''}`.toLowerCase();return ownRow({source_key:s?.key})&&/review|rating|оцен|отзив|google business|notino|makeup|trustpilot|tripadvisor|booking|untappd/.test(q)}).length}
function ratingNorm(v){if(v==null)return null;if(v>=0&&v<=5)return clamp(v/5*100);if(v>5&&v<=10)return clamp(v/10*100);return null}
function currentMetrics(data){
 const {d,a,s}=data;
 const social=directIndex(d,['presence','social','social_index','social_presence']);
 const mediaIndex=directIndex(d,['media','media_index','news_index']);
 const mentions=obs(a,['news_mentions_30d','mentions_30d','media_mentions_30d','news30'])?.value ?? parseFirstNumber(dashboardMetricDisplay(d,/Новинарска видимост|news mentions/i));
 const mediaScore=mediaIndex!==null?mediaIndex:(mentions!==null?clamp(mentions/15*100):null);
 const rating=obs(a,['average_rating','google_rating','review_rating','rating'],/google|notino|makeup|trust|review|rating|untappd|trip|booking/i)?.value ?? obs(a,['average_rating','google_rating','review_rating'])?.value;
 const reviewCount=obs(a,['review_count','reviews','rating_count','ratings','total_reviews'])?.value;
 const positive=obs(a,['positive_keyword_hits','positive_mentions','positive_hits'])?.value;
 const negative=obs(a,['negative_keyword_hits','negative_mentions','negative_hits'])?.value;
 const explicitOpinion=directIndex(d,['consumer_opinion','consumer_opinion_index','sentiment_index','consumer_sentiment','public_opinion']);
 let balance=null,opinion=explicitOpinion;
 if(positive!==null||negative!==null){const p=positive||0,n=negative||0,total=p+n;if(total>0){balance=(p-n)/total*100;if(opinion===null)opinion=clamp(50+balance/2)}}
 const rScore=ratingNorm(rating);
 const repDirect=directIndex(d,['reputation','reputation_index']);
 const available=[social,mediaScore,rScore,opinion].filter(v=>v!==null);
 const reputation=repDirect!==null?repDirect:mean(available);
 const risks=Array.isArray(d?.signals)?riskRows(d).length:null;
 const directPressure=directIndex(d,['reputation_pressure','risk_index','reputation_risk']);
 return {social,mediaIndex,mentions,mediaScore,rating,reviewCount,positive,negative,balance,opinion,rScore,reputation,repDirect,risks,directPressure,reviewSources:reviewSourceCount(s),componentCount:available.length};
}
function snapVal(p,keys){const wanted=keys.map(x=>x.toLowerCase());for(const pool of [ARR(p?.indices),ARR(p?.metrics)])for(const x of pool){const k=metricKey(x);if(wanted.includes(k)){const v=NUM(x?.value);if(v!==null)return v}}return null}
function derivedRepSeries(history){const byDay=new Map();for(const row of ARR(history)){const p=row?.payload||row||{};let rep=snapVal(p,['reputation','reputation_index']);const social=snapVal(p,['presence','social','social_index','social_presence']);let media=snapVal(p,['media','media_index','news_index']);if(media===null){const m=parseFirstNumber(dashboardMetricDisplay(p,/Новинарска видимост|news mentions/i));if(m!==null)media=clamp(m/15*100)}if(rep===null)rep=mean([social,media]);if(rep===null)continue;const raw=row?.created_at||p?.data_updated||p?.updated_at||p?.date||'';const t=Date.parse(raw);if(!Number.isFinite(t))continue;const day=new Date(t).toISOString().slice(0,10);byDay.set(day,{date:day,time:t,value:rep})}return [...byDay.values()].sort((x,y)=>x.time-y.time)}
function stabilityFromSeries(rows){if(rows.length<2)return null;const vals=rows.map(x=>x.value),range=Math.max(...vals)-Math.min(...vals);return clamp(100-range)}
function lastDelta(rows){if(rows.length<2)return null;const cur=rows.at(-1).value;for(let i=rows.length-2;i>=0;i--){const d=cur-rows[i].value;if(Math.abs(d)>=.05)return Math.round(d*10)/10}return 0}
async function getJSON(url){try{const r=await fetch(url,{cache:'no-store'});return r.ok?await r.json():null}catch(e){return null}}
async function load(){const c=slugNow(),q='?_='+Date.now();const [d,a,h,s,k]=await Promise.all([getJSON(`/api/clients/${encodeURIComponent(c)}/dashboard${q}`),getJSON(`/api/clients/${encodeURIComponent(c)}/activity${q}`),getJSON(`/api/clients/${encodeURIComponent(c)}/history${q}`),getJSON(`/api/clients/${encodeURIComponent(c)}/sources${q}`),getJSON(`/api/clients/${encodeURIComponent(c)}/keywords${q}`)]);return{client:c,d:d||{},a:ARR(a),h:ARR(h),s:ARR(s),k:ARR(k)}}
function setName(data){const name=NAME[data.client]||String(data.d?.name||'Клиент');const subtitle=document.querySelector('#reputationBody .rp-head p');if(subtitle)subtitle.textContent=`Публичното възприятие и репутационната среда на ${name} — само от измерими и проверими данни.`;const em=document.querySelector('#reputationBody .rp-emblem');if(em){const mono=em.querySelector('span'),b=em.querySelector('b');if(mono)mono.textContent=data.client==='aroma'?'AC':name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();if(b)b.textContent=name}}
function dim(id){return document.querySelector(`#reputationBody [data-rp-dim="${id}"]`)}
function setDim(id,value,unit,status){const el=dim(id);if(!el)return;const strong=el.querySelector(':scope>strong'),st=el.querySelector('.rp-dim-copy em');if(strong)strong.innerHTML=value===null?'<span class="rp-na">—</span>':`${E(F(value,value%1?1:0))}<small>${E(unit||'')}</small>`;if(st){let i=st.querySelector('i');st.textContent='';if(i)st.appendChild(i);else{i=document.createElement('i');st.appendChild(i)}st.append(document.createTextNode(status));}}
function kpi(label){return [...document.querySelectorAll('#reputationBody .rp-kpi')].find(x=>x.querySelector(':scope>span')?.textContent?.trim()===label)||null}
function setKpi(label,value,unit,foot,cls=''){const el=kpi(label);if(!el)return;const strong=el.querySelector('strong'),small=el.querySelector(':scope>small');if(strong)strong.innerHTML=value===null?'<span class="rp-na">—</span>':`${E(F(value,value%1?1:0))}<small>${E(unit||'')}</small>`;if(small)small.textContent=foot;el.dataset.rpReal=cls||'measured';}
function hydrate(data){
 if(!document.getElementById('reputation')?.classList.contains('active'))return;
 const m=currentMetrics(data),rows=derivedRepSeries(data.h),stability=stabilityFromSeries(rows),delta=lastDelta(rows);
 setName(data);
 setDim('social',m.social,'/100',m.social===null?'Няма отделно измерен социален индекс':'Измерен индекс на публичното присъствие');
 setDim('media',m.mediaIndex!==null?m.mediaIndex:m.mentions,m.mediaIndex!==null?'/100':(m.mentions!==null?' / 30 дни':''),m.mediaIndex!==null?'Измерен медиен индекс':(m.mentions!==null?'Реален брой медийни споменавания':'Няма измерен медиен обем'));
 const reviewVal=m.rating!==null?m.rating:(m.reviewCount!==null?m.reviewCount:m.reviewSources);
 const reviewUnit=m.rating!==null?(m.rating<=5?' /5':' /10'):(m.reviewCount!==null?' оценки':' източника');
 const reviewStatus=m.rating!==null?'Измерена публична оценка':m.reviewCount!==null?'Измерен обем публични оценки/отзиви':`${m.reviewSources} наблюдавани източника за оценки`;
 setDim('reviews',reviewVal,reviewUnit,reviewStatus);
 const opinionVal=m.opinion!==null?m.opinion:((m.positive!==null||m.negative!==null)?(m.positive||0)+(m.negative||0):m.reviewCount);
 const opinionUnit=m.opinion!==null?'/100':(opinionVal!==null?' сигнала':'');
 const opinionStatus=m.opinion!==null?'Индекс от измерими публични нагласи':opinionVal!==null?'Реален обем на наблюдавани мнения/сигнали':'Няма надеждно измерим потребителски сигнал';
 setDim('opinions',opinionVal,opinionUnit,opinionStatus);
 setDim('risk',m.directPressure!==null?m.directPressure:m.risks,m.directPressure!==null?'/100':(m.risks!==null?' сигнала':''),m.directPressure!==null?'Измерен репутационен рисков индекс':m.risks!==null?'Реален брой активни рискови сигнали':'Няма измерен набор от сигнали');
 setKpi('Репутационен индекс',m.reputation,'/100',m.repDirect!==null?'Измерен текущ репутационен индекс':`Изчислен от ${m.componentCount} налични измерими компонента`,'derived');
 setKpi('Репутационен баланс',m.balance,m.balance!==null?' т.':'',m.balance!==null?'Баланс на наблюдаваните позитивни и негативни ключови сигнали':'Няма достатъчно измерени позитивни/негативни сигнали',m.balance!==null?'derived':'missing');
 setKpi('Репутационен натиск',m.directPressure!==null?m.directPressure:m.risks,m.directPressure!==null?'/100':(m.risks!==null?' сигнала':''),m.directPressure!==null?'Измерен рисков индекс':m.risks!==null?'Активни реални репутационни сигнали':'Няма измерен набор от сигнали',m.directPressure!==null?'measured':'count');
 const pubVal=m.rating!==null?m.rating:(m.reviewCount!==null?m.reviewCount:m.reviewSources);
 setKpi('Публични оценки',pubVal,m.rating!==null?(m.rating<=5?'/5':'/10'):(m.reviewCount!==null?' бр.':' източника'),m.rating!==null?'Измерена средна публична оценка':m.reviewCount!==null?'Измерен обем оценки/отзиви':'Наблюдавани публични източници за оценки',m.rating!==null?'measured':'count');
 setKpi('Устойчивост',stability,stability!==null?'/100':'',stability!==null?'100 – реалния диапазон на репутационния индекс за наличната история':'Нужни са поне две реални исторически измервания',stability!==null?'derived':'missing');
 const dyn=document.querySelector('#reputationBody .rp-dynamics header>b');if(dyn)dyn.textContent=m.reputation===null?'—':F(m.reputation);
 const mainFoot=kpi('Репутационен индекс')?.querySelector(':scope>small');if(mainFoot&&delta!==null)mainFoot.textContent+=(delta>0?` • +${F(delta)} т.`:delta<0?` • −${F(Math.abs(delta))} т.`:' • без промяна');
 document.getElementById('reputationBody')?.setAttribute('data-rp-hydrated','1');
}
async function sync(){if(busy)return;busy=true;const my=++seq;try{const data=await load();if(my===seq)hydrate(data)}finally{busy=false}}
function schedule(ms=40){clearTimeout(timer);timer=setTimeout(sync,ms)}
function install(){
 const root=document.getElementById('reputationBody');if(root)new MutationObserver(()=>{if(!busy&&document.getElementById('reputation')?.classList.contains('active'))schedule(80)}).observe(root,{childList:true,subtree:true});
 document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="reputation"]'))schedule(120)},true);
 document.getElementById('clientSel')?.addEventListener('change',()=>schedule(180));
 if(document.body)new MutationObserver(ms=>{if(ms.some(m=>m.type==='attributes'&&m.attributeName==='data-client'))schedule(180)}).observe(document.body,{attributes:true,attributeFilter:['data-client']});
 if(document.getElementById('reputation')?.classList.contains('active'))schedule(80);
 setInterval(()=>{if(document.getElementById('reputation')?.classList.contains('active'))schedule(20)},60000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.BLISReputationRealDataV29={sync};
})();
