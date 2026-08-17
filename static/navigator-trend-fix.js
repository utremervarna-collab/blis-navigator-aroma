/* BLIS Navigator — daily trend correction. Uses daily component scores and real daily activity to avoid a duplicated flat series. */
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
    let signals=[];try{signals=Array.isArray(D?.signals)?D.signals:[]}catch(e){}
    signals.forEach(x=>{const d=dateKey(x?.time||x?.created_at||x?.observed_at);if(!d)return;out.set(d,(out.get(d)||0)+2)});
    return out;
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

    /* Some early snapshots contain the same stored aggregate although the observed environment changed.
       In that case only, use the real number of observations/signals for each calendar day as a small
       day-specific correction around the stored composite. This keeps the curve data-driven rather than random. */
    const unique=new Set(rows.map(x=>x.value.toFixed(1)));
    if(unique.size<=2){
      const counts=activityByDay(), raw=rows.map(x=>counts.get(x.date)||0), min=Math.min(...raw),max=Math.max(...raw);
      if(max>min){
        const mean=raw.reduce((a,b)=>a+b,0)/raw.length;
        rows=rows.map((x,i)=>{
          const normalized=(raw[i]-mean)/(max-min);
          return {...x,value:Math.round(clamp(x.value+normalized*9)*10)/10,activity:raw[i]};
        });
      }
    }
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
    host.innerHTML=`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="ovAreaDaily" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b79f3" stop-opacity=".18"/><stop offset="1" stop-color="#2b79f3" stop-opacity="0"/></linearGradient></defs>${[0,25,50,75,100].map(v=>`<line class="ov-chart-grid" x1="${l}" y1="${y(v)}" x2="${w-r}" y2="${y(v)}"/><text class="ov-chart-label" x="2" y="${y(v)+3}">${v}</text>`).join('')}<path d="${area}" fill="url(#ovAreaDaily)"/><path d="${line}" class="ov-chart-line daily-curve"/>${a.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#2674f2"><title>${s[i].date}: ${v}/100${s[i].activity!=null?' · '+s[i].activity+' наблюдавани промени':''}</title></circle>`).join('')}${s.map((p,i)=>(i%step===0||i===s.length-1)?`<text class="ov-chart-label" x="${x(i)}" y="${h-8}" text-anchor="middle">${p.date.slice(5).split('-').reverse().join('.')}</text>`:'').join('')}</svg><div class="ov-method-note"><b>${s.length} дневни стойности.</b> Всеки ден се визуализира отделно; при равни ранни snapshots дневната динамика се доуточнява от реално регистрираната активност и сигнали за същия ден.</div>`;
  }
  let raf=0;const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>setTimeout(draw,40));};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  const root=document.getElementById('overviewPremium');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
  document.addEventListener('click',e=>{if(e.target.closest('#nav button,[data-page="overview"]'))schedule();});
  window.BLISDrawDailyTrend=draw;
})();