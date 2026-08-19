/* BLIS Navigator — metric-specific curve engine. Real history only; no synthetic fallback series. */
(function(){
  const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const L=x=>Array.isArray(x)?x:[];
  const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const client=()=>String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'client');
  const aliases={
    blis:['blis','blis_index'],presence:['presence','social','social_index'],digital:['digital','digital_index'],reputation:['reputation','reputation_index'],content:['content','interest','consumer_interest'],competitive:['competitive','competition','competitive_index'],market:['market','market_index']
  };
  function snapshotValue(s,key){
    const p=s?.payload||s||{};
    if(key==='blis')return N(p.blis_index??p.blis);
    if(key==='market'){
      const get=k=>{const x=L(p.indices).find(i=>String(i.key||i.name||'').toLowerCase()===k);return x?N(x.value):null};
      const c=get('content'),pr=get('presence'),q=get('competitive');
      return [c,pr,q].every(v=>v!=null)?Math.round((c*.40+pr*.25+q*.35)*10)/10:null;
    }
    const names=aliases[key]||[key];
    const x=L(p.indices).find(i=>names.includes(String(i.key||i.name||'').toLowerCase()));
    return x?N(x.value):null;
  }
  function snapshotDate(s){const p=s?.payload||{};const t=s?.created_at||s?.observed_at||s?.time||s?.timestamp||s?.date||p.created_at||p.time||p.date;const d=t?new Date(t):null;return d&&!isNaN(d)?d.toISOString().slice(0,10):''}
  function uniqueDaily(rows){const m=new Map();rows.forEach(r=>{if(r&&r.date&&N(r.value)!=null)m.set(r.date,{date:r.date,value:N(r.value)})});return [...m.values()].sort((a,b)=>a.date.localeCompare(b.date))}
  function historySeries(key){
    try{
      if(window.BLISPeriod?.dailySeries&&key!=='market'){
        const d=uniqueDaily(L(BLISPeriod.dailySeries(key)).map(x=>({date:String(x.date||''),value:N(x.value)})));
        if(d.length)return d;
      }
    }catch(e){}
    try{return uniqueDaily(L(H).map(s=>({date:snapshotDate(s),value:snapshotValue(s,key)})))}catch(e){return[]}
  }
  function activitySeries(key){
    const names=aliases[key]||[key], rows=[];
    try{L(A).forEach(x=>{const mk=String(x.metric||x.key||'').toLowerCase();if(!names.some(a=>mk===a||mk.includes(a)))return;const v=N(x.value);if(v==null)return;const t=x.time||x.observed_at||x.created_at||x.date;const d=t?new Date(t):null;if(d&&!isNaN(d))rows.push({date:d.toISOString().slice(0,10),value:v})})}catch(e){}
    return uniqueDaily(rows);
  }
  function series(key){const h=historySeries(key);if(h.length>=2)return h;const a=activitySeries(key);return a.length>=2?a:h}
  function smoothPath(pts){
    if(!pts.length)return'';
    if(pts.length===1)return`M ${pts[0][0]} ${pts[0][1]}`;
    if(pts.length===2){const [a,b]=pts,dx=b[0]-a[0];return`M ${a[0]} ${a[1]} C ${a[0]+dx/3} ${a[1]}, ${b[0]-dx/3} ${b[1]}, ${b[0]} ${b[1]}`}
    const n=pts.length,d=[],m=new Array(n).fill(0);
    for(let i=0;i<n-1;i++){
      const dx=pts[i+1][0]-pts[i][0];
      d[i]=dx?((pts[i+1][1]-pts[i][1])/dx):0;
    }
    m[0]=d[0];
    m[n-1]=d[n-2];
    for(let i=1;i<n-1;i++){
      const a=d[i-1],b=d[i];
      m[i]=(a===0||b===0||a*b<=0)?0:(a+b)/2;
    }
    for(let i=0;i<n-1;i++){
      if(d[i]===0){m[i]=0;m[i+1]=0;continue}
      const a=m[i]/d[i],b=m[i+1]/d[i],q=a*a+b*b;
      if(q>9){const tau=3/Math.sqrt(q);m[i]=tau*a*d[i];m[i+1]=tau*b*d[i]}
    }
    let path=`M ${pts[0][0]} ${pts[0][1]}`;
    for(let i=0;i<n-1;i++){
      const p0=pts[i],p1=pts[i+1],dx=p1[0]-p0[0],c1x=p0[0]+dx/3,c2x=p1[0]-dx/3,c1y=p0[1]+m[i]*dx/3,c2y=p1[1]-m[i+1]*dx/3;
      path+=` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p1[0]} ${p1[1]}`;
    }
    return path;
  }
  function draw(key,opt={}){
    const s=series(key),compact=!!opt.compact,w=compact?210:(opt.width||720),h=compact?46:(opt.height||220),l=compact?3:38,r=compact?3:16,t=compact?4:16,b=compact?4:30,color=opt.color||'#1766e8';
    if(s.length<2)return`<div class="${compact?'scan':'ov-no-data'}">${s.length===1?'Нужно е още едно сравнимо измерване.':'Историята за тази метрика се натрупва.'}</div>`;
    const vals=s.map(x=>x.value),rawMin=Math.min(...vals),rawMax=Math.max(...vals),spread=Math.max(1,rawMax-rawMin),pad=Math.max(2,spread*.24),min=Math.max(0,rawMin-pad),max=Math.min(100,rawMax+pad),span=Math.max(1,max-min);
    const X=i=>l+(w-l-r)*i/(s.length-1),Y=v=>t+(h-t-b)*(1-(v-min)/span),pts=s.map((x,i)=>[X(i),Y(x.value)]),path=smoothPath(pts),id=('curve-'+client()+'-'+key).replace(/[^a-z0-9_-]/gi,'');
    const grid=compact?'':[0,.25,.5,.75,1].map(q=>{const v=max-(max-min)*q,y=t+(h-t-b)*q;return`<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="#e8edf4"/><text x="2" y="${y+4}" font-size="9" fill="#74839a">${Math.round(v)}</text>`}).join('');
    const area=compact?'':`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${path} L ${pts[pts.length-1][0]} ${h-b} L ${pts[0][0]} ${h-b} Z" fill="url(#${id})"/>`;
    const dots=compact?'':pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="2.8" fill="${color}"><title>${E(s[i].date)}: ${s[i].value.toFixed(Number.isInteger(s[i].value)?0:1)}/100</title></circle>`).join('');
    const labels=compact?'':(()=>{const step=Math.max(1,Math.ceil(s.length/7));return s.map((x,i)=>(i%step===0||i===s.length-1)?`<text x="${X(i)}" y="${h-8}" text-anchor="middle" font-size="9" fill="#74839a">${E((x.date||'').slice(5).split('-').reverse().join('.'))}</text>`:'').join('')})();
    return`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" data-curve-key="${E(key)}" data-curve-client="${E(client())}">${grid}${area}<path d="${path}" fill="none" stroke="${color}" stroke-width="${compact?2.5:3}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${dots}${labels}</svg>`;
  }
  window.BLISCurves={series,draw,smoothPath};
})();
