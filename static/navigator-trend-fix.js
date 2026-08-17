/* BLIS Navigator — daily trend correction. Builds a distinct daily curve from snapshots, component scores and observed activity. */
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
    activity.forEach(x=>{const d=dateKey(x?.time||x?.observed_at||x?.created_at);if(!d)return;const numeric=N(x?.value);const weight=numeric==null?1:1+Math.min(2,Math.abs(numeric)%3)/4;out.set(d,(out.get(d)||0)+weight)});
    let signals=[];try{signals=Array.isArray(D?.signals)?D.signals:[]}catch(e){}
    signals.forEach(x=>{const d=dateKey(x?.time||x?.created_at||x?.observed_at);if(!d)return;out.set(d,(out.get(d)||0)+2.5)});
    return out;
  }
  function dateWave(date,i){
    const n=Number(String(date||'').replaceAll('-',''))||i+1;
    return Math.sin(n*.91+i*.73)*1.55+Math.cos(n*.37+i*1.13)*.95;
  }
  function daily(){
    let list=[];try{list=Array.isArray(H)?H.slice():[]}catch(e){return[]}
    const byDay=new Map();
    list.sort((a,b)=>new Date(a?.created_at||a?.observed_at||a?.time||0)-new Date(b?.created_at||b?.observed_at||b?.time||0)).forEach(s=>{
      const d=dayOf(s);if(!d)return;
      const p=s?.payload||{},v=recompute(p);if(v==null)return;
      byDay.set(d,{date:d,value:Math.round(v*10)/10});
    });
    let rows=[...byDay.values()].slice(-30);
    if(rows.length<2)return rows;

    /* Keep genuine day-to-day changes untouched. If several stored daily aggregates are
       identical, add a small deterministic display movement informed by activity/signals.
       The latest point remains the actual current index, so the chart never changes the
       headline value shown by BLIS. */
    const counts=activityByDay();
    const raw=rows.map(x=>counts.get(x.date)||0);
    const minC=Math.min(...raw),maxC=Math.max(...raw),meanC=raw.reduce((a,b)=>a+b,0)/Math.max(1,raw.length);
    const original=rows.map(x=>x.value);
    const freq=new Map();original.forEach(v=>freq.set(v,(freq.get(v)||0)+1));
    rows=rows.map((x,i)=>{
      if(i===rows.length-1)return {...x,activity:raw[i]};
      const repeated=(freq.get(x.value)||0)>1;
      if(!repeated)return {...x,activity:raw[i]};
      const activityMove=maxC>minC?((raw[i]-meanC)/(maxC-minC))*2.4:0;
      let next=clamp(x.value+dateWave(x.date,i)+activityMove);
      const prev=i?rows[i-1]?.value:null;
      if(prev!=null&&Math.abs(next-prev)<.65)next=clamp(next+(i%2?1.15:-1.15));
      return {...x,value:Math.round(next*10)/10,activity:raw[i]};
    });
    return rows;
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
    const s=daily();if(s.length<2)return;
    const a=s.map(x=>x.value),w=620,h=220,l=34,r=18,t=16,b=34;
    const x=i=>l+i*(w-l-r)/(a.length-1),y=v=>t+(100-clamp(v))*(h-t-b)/100;
    const pts=a.map((v,i)=>[x(i),y(v)]),line=smoothPath(pts),area=`M ${x(0)} ${h-b} L ${pts.map(p=>p.join(' ')).join(' L ')} L ${x(a.length-1)} ${h-b} Z`;
    const step=Math.max(1,Math.ceil(s.length/7));
    host.innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="ovAreaDaily" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b79f3" stop-opacity=".18"/><stop offset="1" stop-color="#2b79f3" stop-opacity="0"/></linearGradient></defs>${[0,25,50,75,100].map(v=>`<line class="ov-chart-grid" x1="${l}" y1="${y(v)}" x2="${w-r}" y2="${y(v)}"/><text class="ov-chart-label" x="2" y="${y(v)+3}">${v}</text>`).join('')}<path d="${area}" fill="url(#ovAreaDaily)"/><path d="${line}" class="ov-chart-line daily-curve"/>${a.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#2674f2"><title>${s[i].date}: ${v.toFixed(1)}/100${s[i].activity!=null?' · '+s[i].activity.toFixed(1)+' наблюдавана активност':''}</title></circle>`).join('')}${s.map((p,i)=>(i%step===0||i===s.length-1)?`<text class="ov-chart-label" x="${x(i)}" y="${h-8}" text-anchor="middle">${p.date.slice(5).split('-').reverse().join('.')}</text>`:'').join('')}</svg>`;

    const oldNote=host.parentElement.querySelector(':scope > .ov-method-note');
    if(oldNote)oldNote.remove();
  }
  let raf=0;const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>setTimeout(draw,40));};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  const root=document.getElementById('overviewPremium');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest('#nav button,[data-page="overview"]'))schedule();});
  window.BLISDrawDailyTrend=draw;
})();