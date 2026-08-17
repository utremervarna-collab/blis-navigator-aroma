/* BLIS Navigator — real daily trend correction. Uses only recorded daily snapshot values and draws a smooth time-scaled curve through them. */
(function(){
  const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const clamp=v=>Math.max(0,Math.min(100,v));
  const dateKey=t=>{if(!t)return'';const d=new Date(t);return Number.isNaN(d.getTime())?'':d.toISOString().slice(0,10)};
  const dayOf=s=>dateKey(s?.created_at||s?.observed_at||s?.time||s?.timestamp);
  const idx=(p,k)=>{const x=(p?.indices||[]).find(i=>i.key===k);return x?N(x.value):null};
  const recompute=p=>{
    const weights={presence:.20,digital:.24,reputation:.22,content:.18,competitive:.16};
    let sum=0,w=0;
    Object.entries(weights).forEach(([k,weight])=>{const v=idx(p,k);if(v!=null){sum+=v*weight;w+=weight}});
    if(w>=.55)return clamp(sum/w);
    return N(p?.blis_index);
  };

  function activityByDay(){
    const out=new Map();
    let activity=[];try{activity=Array.isArray(A)?A:[]}catch(e){}
    activity.forEach(x=>{const d=dateKey(x?.time||x?.observed_at||x?.created_at);if(!d)return;out.set(d,(out.get(d)||0)+1)});
    return out;
  }

  function daily(){
    let list=[];try{list=Array.isArray(H)?H.slice():[]}catch(e){return[]}
    const byDay=new Map();
    list.sort((a,b)=>new Date(a?.created_at||a?.observed_at||a?.time||0)-new Date(b?.created_at||b?.observed_at||b?.time||0)).forEach(s=>{
      const d=dayOf(s);if(!d)return;
      const p=s?.payload||{},v=recompute(p);if(v==null)return;
      /* Last valid snapshot for each calendar day is the daily value. No synthetic movement. */
      byDay.set(d,{date:d,value:Math.round(clamp(v)*10)/10});
    });
    const counts=activityByDay();
    return [...byDay.values()].slice(-30).map(x=>({...x,activity:counts.get(x.date)||0}));
  }

  function smoothPath(points){
    if(points.length<2)return'';
    if(points.length===2){
      const [a,b]=points,m=(a[0]+b[0])/2;
      return `M ${a[0]} ${a[1]} C ${m} ${a[1]}, ${m} ${b[1]}, ${b[0]} ${b[1]}`;
    }
    let d=`M ${points[0][0]} ${points[0][1]}`;
    for(let i=0;i<points.length-1;i++){
      const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
      const c1x=p1[0]+(p2[0]-p0[0])/6;
      const c1y=p1[1]+(p2[1]-p0[1])/6;
      const c2x=p2[0]-(p3[0]-p1[0])/6;
      const c2y=p2[1]-(p3[1]-p1[1])/6;
      d+=` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }

  function draw(){
    const host=document.querySelector('#overviewPremium .ov-trend');
    if(!host)return;
    const s=daily();if(s.length<2)return;
    const a=s.map(x=>x.value),w=620,h=246,l=34,r=18,t=16,b=52;
    const times=s.map(x=>new Date(x.date+'T00:00:00Z').getTime());
    const minT=Math.min(...times),maxT=Math.max(...times),span=Math.max(86400000,maxT-minT);
    const x=i=>l+(times[i]-minT)*(w-l-r)/span;
    const y=v=>t+(100-clamp(v))*(h-t-b)/100;
    const pts=a.map((v,i)=>[x(i),y(v)]),line=smoothPath(pts);
    const area=`M ${pts[0][0]} ${h-b} L ${pts.map(p=>p.join(' ')).join(' L ')} L ${pts[pts.length-1][0]} ${h-b} Z`;
    const labelEvery=Math.max(1,Math.ceil(s.length/6));
    host.innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Реална дневна динамика на BLIS индекса"><defs><linearGradient id="ovAreaDaily" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b79f3" stop-opacity=".16"/><stop offset="1" stop-color="#2b79f3" stop-opacity="0"/></linearGradient></defs>${[0,25,50,75,100].map(v=>`<line class="ov-chart-grid" x1="${l}" y1="${y(v)}" x2="${w-r}" y2="${y(v)}"/><text class="ov-chart-label" x="2" y="${y(v)+3}">${v}</text>`).join('')}<path d="${area}" fill="url(#ovAreaDaily)"/><path d="${line}" class="ov-chart-line daily-curve"/>${a.map((v,i)=>`<circle class="ov-daily-point" cx="${x(i)}" cy="${y(v)}" r="3" fill="#2674f2"><title>${s[i].date}: ${v.toFixed(1)}/100${s[i].activity?' · '+s[i].activity+' реални измервания':''}</title></circle>`).join('')}${s.map((p,i)=>(i%labelEvery===0||i===s.length-1)?`<text class="ov-chart-label ov-date-label" x="${x(i)}" y="${h-17}" text-anchor="middle">${p.date.slice(5).split('-').reverse().join('.')}</text>`:'').join('')}</svg>`;

    const oldNote=host.parentElement.querySelector(':scope > .ov-method-note');
    if(oldNote)oldNote.remove();
  }

  let raf=0;
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>setTimeout(draw,40));};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  const root=document.getElementById('overviewPremium');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest('#nav button,[data-page="overview"]'))schedule();});
  window.BLISDrawDailyTrend=draw;
})();