/* BLIS Navigator — real 7/30/90 day period filtering with history coverage */
(function(){
  const VALID=[7,30,90],DAY=86400000;
  let days=Number(localStorage.getItem('blis_period_days'))||30;if(!VALID.includes(days))days=30;
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const timeOf=x=>{const t=x?.created_at||x?.observed_at||x?.time||x?.timestamp;const d=t?new Date(t):null;return d&&Number.isFinite(d.getTime())?d.getTime():null};
  const allSnapshots=()=>{try{return Array.isArray(H)?H:[]}catch(e){return[]}};
  const allActivities=()=>{try{return Array.isArray(A)?A:[]}catch(e){return[]}};
  const dashboardData=()=>{try{return D||null}catch(e){return null}};
  const sortedAll=()=>allSnapshots().slice().sort((a,b)=>(timeOf(a)||0)-(timeOf(b)||0));
  const coverageDays=()=>{const a=sortedAll().map(timeOf).filter(v=>v!=null);if(a.length<2)return 0;return Math.max(0,(a[a.length-1]-a[0])/DAY)};
  const cutoff=()=>Date.now()-days*DAY;
  const inPeriod=x=>{const t=timeOf(x);return t==null?false:t>=cutoff()};
  const snapshots=()=>sortedAll().filter(inPeriod);
  const snapshotValue=(s,k)=>{const p=s?.payload||{};if(k==='blis')return num(p.blis_index);const hit=(p.indices||[]).find(i=>i.key===k);return hit?num(hit.value):null};
  const history=k=>snapshots().map(s=>snapshotValue(s,k)).filter(v=>v!=null);
  const average=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
  const coverage=()=>{const c=coverageDays();const needed=days===7?Math.min(3,days*.4):days*.7;return{days:c,selected:days,enough:c>=needed,snapshots:snapshots().length,total:allSnapshots().length}};
  const scoreFor=k=>{const c=coverage(),a=history(k);if(!c.enough||a.length<2)return null;return Math.round(average(a)*10)/10};
  const currentScore=k=>{const d=dashboardData();if(k==='blis')return num(d?.blis_index);const x=(d?.indices||[]).find(i=>i.key===k);return x?num(x.value):null};
  const activities=()=>allActivities().filter(inPeriod);
  const signals=()=>{const d=dashboardData(),arr=Array.isArray(d?.signals)?d.signals:[];return arr.filter(x=>{const t=timeOf(x);return t==null?true:t>=cutoff()})};
  const competitors=()=>{const snaps=snapshots(),buckets=new Map();snaps.forEach(s=>(s?.payload?.competitors||[]).forEach(c=>{const name=String(c.name||'').trim(),v=num(c.score);if(!name||v==null)return;if(!buckets.has(name))buckets.set(name,[]);buckets.get(name).push(v)}));if(coverage().enough&&buckets.size)return[...buckets.entries()].map(([name,vals])=>({name,score:Math.round(average(vals)*10)/10})).sort((a,b)=>b.score-a.score);const d=dashboardData();return Array.isArray(d?.competitors)?d.competitors:[]};
  const rangeLabel=()=>`Последните ${days} дни`;
  const api={get days(){return days},snapshots,history,score:scoreFor,currentScore,activities,signals,competitors,coverage,rangeLabel,set(n){n=Number(n);if(!VALID.includes(n))return;days=n;localStorage.setItem('blis_period_days',String(days));syncButton();window.dispatchEvent(new CustomEvent('blis:periodchange',{detail:{days,coverage:coverage()}}));}};
  window.BLISPeriod=api;
  function syncButton(){const b=document.querySelector('.datebox');if(b)b.innerHTML=`▣&nbsp; ${rangeLabel()} ⌄`}
  function menu(){let m=document.getElementById('blisPeriodMenu');if(m)return m;m=document.createElement('div');m.id='blisPeriodMenu';m.style.cssText='position:fixed;z-index:9999;display:none;min-width:180px;padding:6px;background:#fff;border:1px solid #dfe7f1;border-radius:10px;box-shadow:0 12px 30px rgba(15,35,65,.14);font:600 12px Montserrat,Arial,sans-serif';m.innerHTML=VALID.map(n=>`<button type="button" data-days="${n}" style="display:block;width:100%;border:0;background:transparent;padding:9px 10px;border-radius:7px;text-align:left;cursor:pointer;color:#17345c">Последните ${n} дни</button>`).join('');m.addEventListener('click',e=>{const b=e.target.closest('[data-days]');if(!b)return;api.set(b.dataset.days);m.style.display='none'});document.body.appendChild(m);return m}
  function initSelector(){const b=document.querySelector('.datebox');if(!b)return;syncButton();b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const m=menu(),r=b.getBoundingClientRect();m.style.left=Math.max(8,r.right-180)+'px';m.style.top=(r.bottom+6)+'px';m.style.display=m.style.display==='block'?'none':'block'});document.addEventListener('click',()=>{const m=document.getElementById('blisPeriodMenu');if(m)m.style.display='none'})}
  function init(){initSelector();window.dispatchEvent(new CustomEvent('blis:periodchange',{detail:{days,coverage:coverage()}}))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
