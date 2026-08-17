/* BLIS Navigator — real 7/30/90 day period filtering */
(function(){
  const VALID=[7,30,90];
  const DAY=86400000;
  let days=Number(localStorage.getItem('blis_period_days'))||30;
  if(!VALID.includes(days)) days=30;
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const timeOf=x=>{const t=x?.created_at||x?.observed_at||x?.time||x?.timestamp;const d=t?new Date(t):null;return d&&Number.isFinite(d.getTime())?d.getTime():null};
  const cutoff=()=>Date.now()-days*DAY;
  const inPeriod=x=>{const t=timeOf(x);return t==null?true:t>=cutoff()};
  const snapshotValue=(s,k)=>{const p=s?.payload||{};if(k==='blis')return num(p.blis_index);const hit=(p.indices||[]).find(i=>i.key===k);return hit?num(hit.value):null};
  const snapshots=()=>Array.isArray(window.H)?H.filter(inPeriod).sort((a,b)=>(timeOf(a)||0)-(timeOf(b)||0)):[];
  const history=k=>snapshots().map(s=>snapshotValue(s,k)).filter(v=>v!=null);
  const average=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  const scoreFor=k=>{const a=history(k);return a.length?Math.round(average(a)*10)/10:null};
  const activities=()=>Array.isArray(window.A)?A.filter(inPeriod):[];
  const signals=()=>{const arr=Array.isArray(window.D?.signals)?D.signals:[];return arr.filter(inPeriod)};
  const competitors=()=>{
    const snaps=snapshots();
    const buckets=new Map();
    snaps.forEach(s=>{const arr=s?.payload?.competitors||[];arr.forEach(c=>{const name=String(c.name||'').trim();const v=num(c.score);if(!name||v==null)return;if(!buckets.has(name))buckets.set(name,[]);buckets.get(name).push(v)})});
    if(buckets.size){return [...buckets.entries()].map(([name,vals])=>({name,score:Math.round(average(vals)*10)/10})).sort((a,b)=>b.score-a.score)}
    return Array.isArray(window.D?.competitors)?D.competitors:[];
  };
  const rangeLabel=()=>`Последните ${days} дни`;
  const api={get days(){return days},snapshots,history,score:scoreFor,activities,signals,competitors,rangeLabel,set(n){n=Number(n);if(!VALID.includes(n)||n===days)return;days=n;localStorage.setItem('blis_period_days',String(days));syncButton();window.dispatchEvent(new CustomEvent('blis:periodchange',{detail:{days}}));}};
  window.BLISPeriod=api;

  const oldHist=window.hist;
  const oldScore=window.score;
  window.hist=function(k){const a=history(k);return a.length?a:(typeof oldHist==='function'?oldHist(k):[])};
  window.score=function(k){const v=scoreFor(k);return v!=null?v:(typeof oldScore==='function'?oldScore(k):null)};

  function syncButton(){const b=document.querySelector('.datebox');if(b)b.innerHTML=`▣&nbsp; ${rangeLabel()} ⌄`}
  function menu(){
    let m=document.getElementById('blisPeriodMenu');
    if(m)return m;
    m=document.createElement('div');m.id='blisPeriodMenu';m.style.cssText='position:fixed;z-index:9999;display:none;min-width:170px;padding:6px;background:#fff;border:1px solid #dfe7f1;border-radius:10px;box-shadow:0 12px 30px rgba(15,35,65,.14);font:600 12px Montserrat,Arial,sans-serif';
    m.innerHTML=VALID.map(n=>`<button type="button" data-days="${n}" style="display:block;width:100%;border:0;background:transparent;padding:9px 10px;border-radius:7px;text-align:left;cursor:pointer;color:#17345c">Последните ${n} дни</button>`).join('');
    m.addEventListener('click',e=>{const b=e.target.closest('[data-days]');if(!b)return;api.set(b.dataset.days);m.style.display='none'});
    document.body.appendChild(m);return m;
  }
  function initSelector(){const b=document.querySelector('.datebox');if(!b)return;syncButton();b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const m=menu(),r=b.getBoundingClientRect();m.style.left=Math.max(8,r.right-170)+'px';m.style.top=(r.bottom+6)+'px';m.style.display=m.style.display==='block'?'none':'block'});document.addEventListener('click',()=>{const m=document.getElementById('blisPeriodMenu');if(m)m.style.display='none'})}
  function init(){initSelector();window.dispatchEvent(new CustomEvent('blis:periodchange',{detail:{days}}));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
