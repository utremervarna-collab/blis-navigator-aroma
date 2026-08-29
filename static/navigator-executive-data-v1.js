/* BLIS Navigator — Executive Data v1.
   Един доказателствен поток за клиентските Executive страници.
   Не създава новини или изводи: използва API сигналите, клиентските сигнали и реалните snapshots. */
(function(){
'use strict';
if(window.__BLIS_EXECUTIVE_DATA_V1)return;window.__BLIS_EXECUTIVE_DATA_V1=true;

const A=v=>Array.isArray(v)?v:[];
const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const stamp=x=>{
  const raw=x?.published_at||x?.detected_at||x?.created_at||x?.observed_at||x?.time||x?.timestamp||x?.date||x?.payload?.created_at||x?.payload?.observed_at||x?.payload?.time||x?.payload?.timestamp||x?.payload?.date;
  const t=Date.parse(raw||'');
  return Number.isFinite(t)?t:0;
};
const iso=t=>t?new Date(t).toISOString():'';
const text=s=>String(s?.title||s?.text||s?.description||s?.detail||'').trim();

function classify(s){
  if(s?.kind)return s.kind;
  const sev=String(s?.severity||'').toLowerCase();
  if(s?.sentiment==='negative'||sev==='critical'||sev==='high'||s?.topic==='regulatory')return'риск';
  if(s?.sentiment==='positive'||s?.topic==='commercial'||s?.topic==='product')return'възможност';
  if(s?.scope==='competitor'||s?.topic==='competition')return'конкурент';
  return'наблюдение';
}
function normalizedSignal(s,i){
  if(!s||typeof s!=='object')return null;
  const title=text(s);
  if(!title)return null;
  return {
    ...s,
    id:s.id||`client-signal-${i}`,
    title:s.title||title,
    text:s.text||s.description||s.detail||title,
    kind:classify(s),
    utility:N(s.utility)??N(s.relevance)??0,
    evidence_count:Math.max(1,N(s.evidence_count)||1),
    published_at:s.published_at||s.detected_at||s.created_at||s.observed_at||s.time||s.timestamp||s.date||''
  };
}
function clientSignals(){return A(window.D?.signals).map(normalizedSignal).filter(Boolean)}

function snapIndex(row,key){
  const p=row?.payload||row||{};
  if(key==='blis')return N(p.blis_index??p.blis);
  const hit=A(p.indices).find(x=>String(x?.key||'').toLowerCase()===key);
  return N(hit?.value);
}
function historyTurningPoints(){
  const rows=A(window.BLISPeriod?.snapshots?.()||window.H).map(r=>({row:r,t:stamp(r),blis:snapIndex(r,'blis')})).filter(x=>x.t&&x.blis!=null).sort((a,b)=>a.t-b.t);
  if(rows.length<2)return[];
  const out=[];
  for(let i=1;i<rows.length;i++){
    const prev=rows[i-1],cur=rows[i],delta=Math.round((cur.blis-prev.blis)*10)/10;
    if(Math.abs(delta)<3)continue;
    const direction=delta>0?'се повиши':'се понижи';
    out.push({
      id:`history-turn-${cur.t}`,
      topic:'history',scope:'brand',kind:'наблюдение',sentiment:'neutral',
      title:`BLIS индексът ${direction} с ${Math.abs(delta).toLocaleString('bg-BG',{maximumFractionDigits:1})} т.`,
      text:`Измерена промяна от ${prev.blis.toLocaleString('bg-BG',{maximumFractionDigits:1})} до ${cur.blis.toLocaleString('bg-BG',{maximumFractionDigits:1})}.`,
      utility:0,evidence_count:1,source:'Историческа база',published_at:iso(cur.t),detected_at:iso(cur.t),
      measured_change:true,metric:'blis_index',delta
    });
  }
  return out.slice(-8);
}
function dedupe(rows){
  const seen=new Set(),out=[];
  A(rows).forEach((s,i)=>{
    const n=normalizedSignal(s,i);if(!n)return;
    const day=stamp(n)?new Date(stamp(n)).toISOString().slice(0,10):'';
    const key=`${String(n.topic||'').toLowerCase()}|${text(n).toLowerCase().replace(/\s+/g,' ').slice(0,150)}|${day}`;
    if(seen.has(key))return;seen.add(key);out.push(n);
  });
  return out.sort((a,b)=>{
    const ua=N(a.utility)||0,ub=N(b.utility)||0;
    return ub-ua||stamp(b)-stamp(a);
  });
}
function install(){
  const stream=window.BLISIntelligenceStreamV3;
  if(!stream||stream.__executiveDataV1)return false;
  const original=typeof stream.getUsefulSignals==='function'?stream.getUsefulSignals.bind(stream):()=>[];
  stream.getUsefulSignals=function(){
    let api=[];try{api=A(original())}catch(_){}
    return dedupe([...api,...clientSignals(),...historyTurningPoints()]);
  };
  stream.getExecutiveSignals=stream.getUsefulSignals;
  stream.getHistoryTurningPoints=historyTurningPoints;
  stream.__executiveDataV1=true;
  window.BLISExecutiveDataV1={signals:stream.getUsefulSignals,historyTurningPoints};
  window.dispatchEvent(new CustomEvent('blis:executive-data'));
  return true;
}
function boot(){
  if(install())return;
  let n=0;const timer=setInterval(()=>{n++;if(install()||n>40)clearInterval(timer)},75);
}
window.addEventListener('blis:clientdata',()=>setTimeout(()=>window.dispatchEvent(new CustomEvent('blis:executive-data')),80));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
