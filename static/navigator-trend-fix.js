/* BLIS Navigator — daily trend correction. Keeps the approved white/corporate UI. */
(function(){
  const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const clamp=v=>Math.max(0,Math.min(100,v));
  const dayOf=s=>{const t=s?.created_at||s?.observed_at||s?.time||s?.timestamp; if(!t)return''; const d=new Date(t); return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10)};
  const idx=(p,k)=>{const x=(p?.indices||[]).find(i=>i.key===k);return x?N(x.value):null};
  const recompute=p=>{
    const keys=['presence','digital','reputation','content','competitive'];
    const vals=keys.map(k=>idx(p,k)).filter(v=>v!=null);
    if(vals.length>=3) return clamp(vals.reduce((a,b)=>a+b,0)/vals.length);
    return N(p?.blis_index);
  };
  function daily(){
    let list=[]; try{list=Array.isArray(H)?H.slice():[]}catch(e){return[]}
    const byDay=new Map();
    list.sort((a,b)=>new Date(a?.created_at||a?.observed_at||a?.time||0)-new Date(b?.created_at||b?.observed_at||b?.time||0)).forEach(s=>{
      const d=dayOf(s); if(!d)return;
      const p=s?.payload||{}; const v=recompute(p); if(v==null)return;
      byDay.set(d,{date:d,value:Math.round(v*10)/10});
    });
    return [...byDay.values()].slice(-30);
  }
  function smoothPath(points){
    if(points.length<2)return'';
    let d=`M ${points[0][0]} ${points[0][1]}`;
    for(let i=0;i<points.length-1;i++){
      const [x0,y0]=points[i],[x1,y1]=points[i+1],mx=(x0+x1)/2;
      d+=` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
    }
    return d;
  }
  function draw(){
    const host=document.querySelector('#overviewPremium .ov-trend');
    if(!host)return;
    const s=daily(); if(s.length<2)return;
    const a=s.map(x=>x.value),w=620,h=220,l=34,r=18,t=16,b=34;
    const x=i=>l+i*(w-l-r)/(a.length-1), y=v=>t+(100-clamp(v))*(h-t-b)/100;
    const pts=a.map((v,i)=>[x(i),y(v)]), line=smoothPath(pts), area=`M ${x(0)} ${h-b} L ${pts.map(p=>p.join(' ')).join(' L ')} L ${x(a.length-1)} ${h-b} Z`;
    const step=Math.max(1,Math.ceil(s.length/7));
    host.innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="ovAreaDaily" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b79f3" stop-opacity=".18"/><stop offset="1" stop-color="#2b79f3" stop-opacity="0"/></linearGradient></defs>${[0,25,50,75,100].map(v=>`<line class="ov-chart-grid" x1="${l}" y1="${y(v)}" x2="${w-r}" y2="${y(v)}"/><text class="ov-chart-label" x="2" y="${y(v)+3}">${v}</text>`).join('')}<path d="${area}" fill="url(#ovAreaDaily)"/><path d="${line}" class="ov-chart-line daily-curve"/>${a.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#2674f2"><title>${s[i].date}: ${v}/100</title></circle>`).join('')}${s.map((p,i)=>(i%step===0||i===s.length-1)?`<text class="ov-chart-label" x="${x(i)}" y="${h-8}" text-anchor="middle">${p.date.slice(5).split('-').reverse().join('.')}</text>`:'').join('')}</svg><div class="ov-method-note">${s.length} дневни стойности, преизчислени от компонентните индекси за съответния ден.</div>`;
  }
  let raf=0; const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>setTimeout(draw,30));};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  const root=document.getElementById('overviewPremium'); if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest('#nav button,[data-page="overview"]'))schedule();});
  window.BLISDrawDailyTrend=draw;
})();