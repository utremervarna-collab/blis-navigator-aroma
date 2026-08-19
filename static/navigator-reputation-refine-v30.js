/* BLIS Navigator — Reputation refinement v30. */
(function(){
'use strict';
if(window.__BLISReputationRefineV30)return;window.__BLISReputationRefineV30=true;
const ARR=v=>Array.isArray(v)?v:[];
const NUM=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const F=(v,d=1)=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:d});
const NAMES={aroma:'Aroma Cosmetics',bolyarka:'Болярка','astor-garden':'Astor Garden','varna-towers':'Varna Towers'};
let busy=false,timer=0;
function slugNow(){try{return (typeof slug!=='undefined'&&slug)||window.BLIS_INITIAL_CLIENT||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||'aroma'}catch(e){return'aroma'}}
function ownSource(s){const q=String(s?.key||s?.source_key||'').toLowerCase();return !/^(cmp_|competitor_)|competitor|конкурент|сравним/.test(q)}
async function getJSON(u){try{const r=await fetch(u,{cache:'no-store'});return r.ok?await r.json():null}catch(e){return null}}
function findKpi(label){return [...document.querySelectorAll('#reputationBody .rp-kpi')].find(x=>x.querySelector(':scope>span')?.textContent?.trim()===label)||null}
function setKpi(el,label,value,unit,foot){if(!el)return;const lab=el.querySelector(':scope>span'),strong=el.querySelector('strong'),small=el.querySelector(':scope>small');if(lab)lab.textContent=label;if(strong)strong.innerHTML=value==null?'<span class="rp-na">—</span>':`${F(value,value%1?1:0)}${unit?`<small>${unit}</small>`:''}`;if(small)small.textContent=foot||'';}
function seriesFromHistory(h){const byDay=new Map();for(const row of ARR(h)){const p=row?.payload||row||{};let v=null;for(const pool of [ARR(p.indices),ARR(p.metrics)])for(const x of pool){const k=String(x?.key||x?.metric||x?.name||'').toLowerCase();if((k==='reputation'||k==='reputation_index')&&NUM(x?.value)!=null){v=NUM(x.value);break}}if(v==null)continue;const raw=row?.created_at||p?.data_updated||p?.updated_at||p?.date||'';const t=Date.parse(raw);if(!Number.isFinite(t))continue;byDay.set(new Date(t).toISOString().slice(0,10),{t,value:v})}return [...byDay.values()].sort((a,b)=>a.t-b.t)}
function lastChange(rows){if(rows.length<2)return null;const cur=rows.at(-1).value;for(let i=rows.length-2;i>=0;i--){const d=cur-rows[i].value;if(Math.abs(d)>=.05)return Math.round(d*10)/10}return 0}
function riskCount(d){return ARR(d?.signals).filter(x=>/high|critical|warn|watch|risk|red|medium/i.test(String(x?.level||x?.severity||x?.status||''))||/риск|негатив|проблем|заплах|внимание|оплакван/i.test(`${x?.title||x?.label||''} ${x?.description||x?.detail||x?.text||''}`)).length}
function directIndex(d,keys){const wanted=keys.map(x=>x.toLowerCase());for(const pool of [ARR(d?.indices),ARR(d?.metrics)])for(const x of pool){const k=String(x?.key||x?.metric||x?.name||'').toLowerCase();if(wanted.includes(k)){const v=NUM(x?.value);if(v!=null)return v}}return null}
function setIdentity(client){const name=NAMES[client]||'Клиент';const em=document.querySelector('#reputationBody .rp-emblem');if(em){const mono=em.querySelector('span'),b=em.querySelector('b');if(mono){mono.textContent='';mono.style.display='none'}if(b){b.textContent=name;b.style.display='block'}}const sub=document.querySelector('#reputationBody .rp-head p');if(sub)sub.textContent=`Публичното възприятие и репутационната среда на ${name} — само от измерими и проверими данни.`;}
function setDimText(id,title,sub,status){const el=document.querySelector(`#reputationBody [data-rp-dim="${id}"]`);if(!el)return;const b=el.querySelector('.rp-dim-copy>b'),sm=el.querySelector('.rp-dim-copy>small'),em=el.querySelector('.rp-dim-copy>em');if(b)b.textContent=title;if(sm)sm.textContent=sub;if(em){const dot=em.querySelector('i')||document.createElement('i');em.textContent='';em.appendChild(dot);em.append(document.createTextNode(status));}}
function renamePanels(change,topicCount){const dyn=document.querySelector('#reputationBody .rp-dynamics header h3');if(dyn)dyn.textContent='Промяна във времето';const dynP=document.querySelector('#reputationBody .rp-dynamics header p');if(dynP)dynP.textContent='Реална историческа промяна на репутационния индекс';const dynV=document.querySelector('#reputationBody .rp-dynamics header>b');if(dynV)dynV.textContent=change==null?'—':`${change>0?'+':''}${F(change)} т.`;
const topics=document.querySelector('#rpTopics header h3');if(topics)topics.textContent='Публични теми';const topicsP=document.querySelector('#rpTopics header p');if(topicsP)topicsP.textContent=`${topicCount} измерени теми от активните публични данни`;const link=document.querySelector('#rpTopics .rp-panel-link');if(link)link.childNodes[0].nodeValue='Всички публични теми ';}
async function apply(){if(busy||!document.getElementById('reputation')?.classList.contains('active'))return;busy=true;try{const c=slugNow(),q='?_='+Date.now();const [d,s,h,k]=await Promise.all([getJSON(`/api/clients/${encodeURIComponent(c)}/dashboard${q}`),getJSON(`/api/clients/${encodeURIComponent(c)}/sources${q}`),getJSON(`/api/clients/${encodeURIComponent(c)}/history${q}`),getJSON(`/api/clients/${encodeURIComponent(c)}/keywords${q}`)]);if(!document.getElementById('reputation')?.classList.contains('active'))return;setIdentity(c);
setDimText('opinions','Публични мнения','Измерими потребителски сигнали в публичната среда','Наблюдавани публични мнения и сигнали');
setDimText('risk','Рискови сигнали','Активни сигнали с потенциален репутационен риск','Реално наблюдавани рискови сигнали');
const sourceCount=ARR(s).filter(ownSource).length;
const balance=findKpi('Репутационен баланс')||findKpi('Източниково покритие');setKpi(balance,'Източниково покритие',sourceCount,' източника','Активни наблюдавани източници в клиентския профил');
const risk=directIndex(d||{},['reputation_pressure','risk_index','reputation_risk']);const rCount=Array.isArray(d?.signals)?riskCount(d):null;
const pressure=findKpi('Репутационен натиск')||findKpi('Репутационен риск');setKpi(pressure,'Репутационен риск',risk!=null?risk:rCount,risk!=null?'/100':(rCount!=null?' сигнала':''),risk!=null?'Измерен репутационен рисков индекс':rCount!=null?'Активни реални рискови сигнали':'Няма измерен набор от рискови сигнали');
const rows=seriesFromHistory(h),change=lastChange(rows),topicCount=ARR(k).filter(x=>NUM(x?.value)!=null||x?.display).length;renamePanels(change,topicCount);
const pub=findKpi('Публични оценки');if(pub&&pub.querySelector('strong .rp-na')){const strong=pub.querySelector('strong');if(strong)strong.innerHTML='<span class="rp-na">—</span>';}
document.querySelectorAll('#reputationBody *').forEach(el=>{if(el.childNodes.length===1&&el.firstChild?.nodeType===3&&/натиск/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/репутационен натиск/ig,'Репутационен риск').replace(/натиск/ig,'риск')});
document.getElementById('reputationBody')?.setAttribute('data-rp-refined','30');
}finally{busy=false}}
function schedule(ms=60){clearTimeout(timer);timer=setTimeout(apply,ms)}
function init(){const root=document.getElementById('reputationBody');if(root)new MutationObserver(()=>{if(!busy) schedule(90)}).observe(root,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page="reputation"]'))schedule(140)},true);document.getElementById('clientSel')?.addEventListener('change',()=>schedule(220));if(document.getElementById('reputation')?.classList.contains('active'))schedule(120);setInterval(()=>{if(document.getElementById('reputation')?.classList.contains('active'))schedule(0)},2500)}
window.BLISReputationRefineV30={apply,schedule};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
