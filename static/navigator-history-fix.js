/* BLIS Navigator — dedicated history chart fix. Keeps the detail view independent from generic curve rendering. */
(function(){
  'use strict';
  const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=v=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});

  function snapshotRows(){
    const rows=[];
    try{
      if(window.BLISPeriod?.dailySeries){
        (BLISPeriod.dailySeries('blis')||[]).forEach(x=>{
          const v=N(x?.value),d=String(x?.date||'').slice(0,10);
          if(v!=null&&/^\d{4}-\d{2}-\d{2}$/.test(d))rows.push({date:d,value:v});
        });
      }
    }catch(e){}
    if(rows.length<2){
      try{
        (window.H||H||[]).forEach(s=>{
          const p=s?.payload||{};
          const v=N(p.blis_index??p.blis);
          const raw=s?.created_at||s?.observed_at||s?.time||s?.timestamp||s?.date||p?.created_at||p?.date;
          const d=raw?new Date(raw):null;
          if(v!=null&&d&&!isNaN(d))rows.push({date:d.toISOString().slice(0,10),value:v});
        });
      }catch(e){}
    }
    const byDay=new Map();
    rows.forEach(r=>byDay.set(r.date,{date:r.date,value:r.value}));
    return [...byDay.values()].sort((a,b)=>a.date.localeCompare(b.date));
  }

  function smoothPath(pts){
    const n=pts.length;
    if(!n)return'';
    if(n===1)return`M ${pts[0][0]} ${pts[0][1]}`;
    if(n===2){const a=pts[0],b=pts[1],dx=b[0]-a[0];return`M ${a[0]} ${a[1]} C ${a[0]+dx/3} ${a[1]}, ${b[0]-dx/3} ${b[1]}, ${b[0]} ${b[1]}`}
    const d=new Array(n-1),m=new Array(n).fill(0);
    for(let i=0;i<n-1;i++){const dx=pts[i+1][0]-pts[i][0];d[i]=dx?((pts[i+1][1]-pts[i][1])/dx):0}
    m[0]=d[0];m[n-1]=d[n-2];
    for(let i=1;i<n-1;i++){const a=d[i-1],b=d[i];m[i]=(a===0||b===0||a*b<=0)?0:(a+b)/2}
    for(let i=0;i<n-1;i++){
      if(d[i]===0){m[i]=0;m[i+1]=0;continue}
      const a=m[i]/d[i],b=m[i+1]/d[i],q=a*a+b*b;
      if(q>9){const tau=3/Math.sqrt(q);m[i]=tau*a*d[i];m[i+1]=tau*b*d[i]}
    }
    let path=`M ${pts[0][0]} ${pts[0][1]}`;
    for(let i=0;i<n-1;i++){
      const p0=pts[i],p1=pts[i+1],dx=p1[0]-p0[0];
      path+=` C ${p0[0]+dx/3} ${p0[1]+m[i]*dx/3}, ${p1[0]-dx/3} ${p1[1]-m[i+1]*dx/3}, ${p1[0]} ${p1[1]}`;
    }
    return path;
  }

  function chart(rows){
    if(rows.length<2)return'<div class="scan" style="margin:70px 0">Историята на BLIS индекса се натрупва. Нужни са поне две реални дневни измервания.</div>';
    const w=820,h=260,l=46,r=24,t=20,b=42;
    const dates=rows.map(x=>new Date(x.date+'T00:00:00Z').getTime());
    const minT=Math.min(...dates),maxT=Math.max(...dates),spanT=Math.max(86400000,maxT-minT);
    const X=i=>l+(w-l-r)*(dates[i]-minT)/spanT;
    const Y=v=>t+(h-t-b)*(1-Math.max(0,Math.min(100,v))/100);
    const pts=rows.map((x,i)=>[X(i),Y(x.value)]),path=smoothPath(pts);
    const grid=[0,25,50,75,100].map(v=>`<line x1="${l}" y1="${Y(v)}" x2="${w-r}" y2="${Y(v)}" stroke="#e7ecf3" stroke-width="1"/><text x="8" y="${Y(v)+4}" font-size="10" fill="#718096">${v}</text>`).join('');
    const step=Math.max(1,Math.ceil(rows.length/6));
    const labels=rows.map((x,i)=>(i%step===0||i===rows.length-1)?`<text x="${X(i)}" y="${h-12}" text-anchor="middle" font-size="10" fill="#718096">${E(x.date.slice(5).split('-').reverse().join('.'))}</text>`:'').join('');
    const dots=rows.map((x,i)=>`<circle cx="${X(i)}" cy="${Y(x.value)}" r="3.2" fill="#1766e8" stroke="#fff" stroke-width="1.5"><title>${E(x.date)}: ${fmt(x.value)}/100</title></circle>`).join('');
    const area=`${path} L ${pts[pts.length-1][0]} ${h-b} L ${pts[0][0]} ${h-b} Z`;
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:260px;overflow:visible" data-history-chart="blis-fixed"><defs><linearGradient id="blisHistoryAreaFixed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1766e8" stop-opacity=".16"/><stop offset="1" stop-color="#1766e8" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#blisHistoryAreaFixed)"/><path d="${path}" fill="none" stroke="#1766e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${dots}${labels}</svg><div class="ref-callout" style="margin-top:10px">${rows.length} реални дневни точки · фиксирана скала 0–100 · разстоянието по хоризонталата следва реалните календарни дати.</div>`;
  }

  function historyHTML(){
    const rows=snapshotRows();
    const current=rows.length?rows[rows.length-1].value:(()=>{try{return N(D?.blis_index)}catch(e){return null}})();
    const measurements=(()=>{try{return (A||[]).length}catch(e){return 0}})();
    const coverage=(()=>{try{return Q?.coverage??'—'}catch(e){return'—'}})();
    return `<div class="ref-title"><h2>История</h2><p>Как се променят индексите, сигналите и наблюдаваната среда във времето</p></div><div class="ref-grid4"><div class="ref-card ref-kpi"><div class="ref-eyebrow">Записани периоди</div><div class="ref-val">${rows.length}</div></div><div class="ref-card ref-kpi"><div class="ref-eyebrow">BLIS индекс</div><div class="ref-val">${fmt(current)}</div></div><div class="ref-card ref-kpi"><div class="ref-eyebrow">Измервания</div><div class="ref-val">${measurements}</div></div><div class="ref-card ref-kpi"><div class="ref-eyebrow">Информационно покритие</div><div class="ref-val">${coverage}${coverage==='—'?'':'%'}</div></div></div><div class="ref-card" style="margin-top:11px;overflow:hidden"><div class="ref-head"><div><h3>ИСТОРИЧЕСКА ДИНАМИКА НА BLIS ИНДЕКСА</h3><p style="margin:4px 0 0;color:#718096;font-size:12px">Реални дневни стойности по календарна дата</p></div></div><div class="ref-trend" style="height:280px;min-height:280px;overflow:visible">${chart(rows)}</div></div>`;
  }

  function install(){
    const previous=window.refGo;
    if(typeof previous!=='function'||previous.__historyFixed)return false;
    function fixedRefGo(id){
      if(id!=='history')return previous.apply(this,arguments);
      previous.apply(this,arguments);
      const target=document.getElementById('historyBody')||document.getElementById('history');
      if(target)target.innerHTML=historyHTML();
      window.scrollTo({top:0,behavior:'smooth'});
    }
    fixedRefGo.__historyFixed=true;
    fixedRefGo.__previous=previous;
    window.refGo=fixedRefGo;
    return true;
  }

  if(!install()){
    let tries=0;
    const timer=setInterval(()=>{tries++;if(install()||tries>20)clearInterval(timer)},100);
  }
})();
