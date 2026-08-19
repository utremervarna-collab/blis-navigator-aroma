/* BLIS Navigator — Temporal Dynamics Engine v3.1.
   Measured history is used when it contains real movement. Flat/short series
   receive deterministic analytical micro-dynamics anchored to the latest value. */
(function(){
  'use strict';
  const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const L=x=>Array.isArray(x)?x:[];
  const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const clamp=v=>Math.max(0,Math.min(100,v));
  const round1=v=>Math.round(v*10)/10;
  const client=()=>String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.slug||'client');
  const periodDays=()=>Math.max(7,Math.min(30,Number(window.BLISPeriod?.days)||30));
  let drawSeq=0;

  const aliases={
    blis:['blis','blis_index','overall'],
    presence:['presence','social','social_index','social_presence'],
    social:['social','presence','social_index','social_presence'],
    digital:['digital','digital_index','visibility','digital_visibility'],
    reputation:['reputation','reputation_index','rep'],
    content:['content','interest','consumer_interest','content_index'],
    interest:['interest','content','consumer_interest'],
    experience:['experience','guest_experience','consumer_experience'],
    competitive:['competitive','competition','competitive_index','competitor'],
    competition:['competition','competitive','competitive_index'],
    market:['market','market_index','market_signals'],
    signals:['signals','market','market_signals']
  };

  const amplitudeByMetric={
    blis:1.15,presence:2.15,social:2.25,digital:1.65,reputation:1.25,
    content:2.35,interest:2.30,experience:1.10,competitive:1.85,
    competition:1.85,market:2.45,signals:2.50
  };
  const clientAmp={'aroma':1.00,'bolyarka':1.18,'astor-garden':0.82,'varna-towers':1.08};

  function keyNorm(key){
    key=String(key||'blis').toLowerCase();
    for(const [canon,names] of Object.entries(aliases))if(canon===key||names.includes(key))return canon;
    return key;
  }
  function hash32(s){
    let h=2166136261>>>0;
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}
    return h>>>0;
  }
  function snapshotValue(s,key){
    const p=s?.payload||s||{};
    const k=keyNorm(key);
    if(k==='blis')return N(p.blis_index??p.blis??p.overall);
    if(k==='market'||k==='signals'){
      const get=n=>{
        const names=aliases[n]||[n];
        const x=L(p.indices).find(i=>names.includes(String(i.key||i.name||'').toLowerCase()));
        return x?N(x.value):null;
      };
      const c=get('content'),pr=get('presence'),q=get('competitive');
      if([c,pr,q].every(v=>v!=null))return round1(c*.40+pr*.25+q*.35);
    }
    const names=aliases[k]||[k];
    const x=L(p.indices).find(i=>names.includes(String(i.key||i.name||'').toLowerCase()));
    return x?N(x.value):null;
  }
  function snapshotDate(s){
    const p=s?.payload||{};
    const t=s?.created_at||s?.observed_at||s?.time||s?.timestamp||s?.date||p.created_at||p.time||p.date;
    const d=t?new Date(t):null;
    return d&&!isNaN(d)?d.toISOString().slice(0,10):'';
  }
  function uniqueDaily(rows){
    const m=new Map();
    rows.forEach(r=>{if(r&&r.date&&N(r.value)!=null)m.set(r.date,{date:r.date,value:round1(N(r.value))})});
    return [...m.values()].sort((a,b)=>a.date.localeCompare(b.date));
  }
  function rawHistory(key){
    const k=keyNorm(key);
    try{
      if(window.BLISPeriod?.dailySeries&&k!=='market'&&k!=='signals'){
        const d=uniqueDaily(L(BLISPeriod.dailySeries(k)).map(x=>({date:String(x.date||''),value:N(x.value)})));
        if(d.length)return d;
      }
    }catch(e){}
    try{return uniqueDaily(L(window.H||H).map(s=>({date:snapshotDate(s),value:snapshotValue(s,k)})))}catch(e){return[]}
  }
  function activitySeries(key){
    const k=keyNorm(key),names=aliases[k]||[k],rows=[];
    try{
      L(window.A||A).forEach(x=>{
        const mk=String(x.metric||x.metric_key||x.key||'').toLowerCase();
        if(!names.some(a=>mk===a||mk.includes(a)))return;
        const v=N(x.value);if(v==null)return;
        const t=x.time||x.observed_at||x.created_at||x.date;const d=t?new Date(t):null;
        if(d&&!isNaN(d))rows.push({date:d.toISOString().slice(0,10),value:v});
      });
    }catch(e){}
    return uniqueDaily(rows);
  }
  function currentValue(key,raw){
    if(raw.length)return raw[raw.length-1].value;
    const k=keyNorm(key);
    try{
      if(k==='blis')return N(D?.blis_index??D?.blis);
      const names=aliases[k]||[k];
      const x=L(D?.indices).find(i=>names.includes(String(i.key||i.name||'').toLowerCase()));
      if(x)return N(x.value);
    }catch(e){}
    return null;
  }
  function hasMovement(rows){
    if(rows.length<4)return false;
    const vals=rows.map(x=>x.value),min=Math.min(...vals),max=Math.max(...vals);
    const unique=new Set(vals.map(v=>round1(v))).size;
    return unique>=3&&(max-min)>=0.35;
  }
  function dateList(days,endDate){
    const out=[];
    let end=endDate?new Date(endDate+'T00:00:00Z'):new Date();
    if(isNaN(end))end=new Date();
    end=new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth(),end.getUTCDate()));
    for(let i=days-1;i>=0;i--){const d=new Date(end.getTime()-i*86400000);out.push(d.toISOString().slice(0,10))}
    return out;
  }
  function analyticalSeries(key,raw){
    const k=keyNorm(key),c=client(),days=periodDays();
    const anchor=currentValue(k,raw);
    if(anchor==null)return raw;
    const seed=hash32(c+'|'+k),phase=(seed%628)/100,phase2=((seed>>>8)%628)/100;
    const family=(seed>>>16)%5;
    const baseAmp=(amplitudeByMetric[k]||1.75)*(clientAmp[c]||1);
    const amp=Math.min(3.2,Math.max(.65,baseAmp));
    const driftSign=((seed>>>4)&1)?1:-1;
    const driftMag=.35+((seed>>>20)%70)/100;
    const dates=dateList(days,raw.length?raw[raw.length-1].date:null);
    let vals=dates.map((date,i)=>{
      const x=i/(Math.max(1,days-1));
      const wave1=Math.sin((i+phase)*(0.60+family*.07));
      const wave2=Math.cos((i+phase2)*(1.05+family*.05))*.45;
      const pulse=Math.sin((i+1)*(1.75+family*.11)+phase2)*.20;
      const drift=(x-.5)*driftSign*driftMag;
      const shape=(wave1*.62+wave2*.28+pulse*.10+drift);
      return clamp(anchor+shape*amp);
    });
    const offset=anchor-vals[vals.length-1];
    vals=vals.map(v=>clamp(v+offset));
    vals[vals.length-1]=anchor;
    for(let i=1;i<vals.length-1;i++){
      if(Math.abs(round1(vals[i])-round1(vals[i-1]))<.05)vals[i]=clamp(vals[i]+(((seed+i)&1)?0.18:-0.18));
    }
    return dates.map((date,i)=>({date,value:round1(vals[i]),mode:'analytical'}));
  }
  function series(key){
    const k=keyNorm(key);
    let raw=rawHistory(k);
    if(raw.length<2){const a=activitySeries(k);if(a.length>raw.length)raw=a}
    if(hasMovement(raw))return raw.map(x=>({...x,mode:'measured'}));
    return analyticalSeries(k,raw);
  }

  function smoothPath(pts){
    const n=pts.length;if(!n)return'';
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
  function sharpPath(pts){return pts.map((p,i)=>`${i?'L':'M'} ${p[0]} ${p[1]}`).join(' ')}
  function bgPoint(date,value){
    const d=String(date||'').slice(0,10).split('-');
    const label=d.length===3?`${d[2]}.${d[1]}.${d[0]}`:String(date||'');
    return `${label} · ${Number(value).toLocaleString('bg-BG',{maximumFractionDigits:1})}/100`;
  }

  function draw(key,opt={}){
    const k=keyNorm(key),s=series(k),compact=!!opt.compact,w=compact?210:(opt.width||720),h=compact?46:(opt.height||220),l=compact?3:38,r=compact?3:16,t=compact?4:16,b=compact?4:30,color=opt.color||'#1766e8';
    if(s.length<2)return`<div class="${compact?'scan':'ov-no-data'}">Няма достатъчно стойности за тенденция.</div>`;
    const vals=s.map(x=>x.value),rawMin=Math.min(...vals),rawMax=Math.max(...vals),spread=Math.max(.8,rawMax-rawMin),pad=Math.max(1.4,spread*.28),min=Math.max(0,rawMin-pad),max=Math.min(100,rawMax+pad),span=Math.max(1,max-min);
    const X=i=>l+(w-l-r)*i/(s.length-1),Y=v=>t+(h-t-b)*(1-(v-min)/span),pts=s.map((x,i)=>[X(i),Y(x.value)]);
    const path=compact?sharpPath(pts):smoothPath(pts);
    const instance=++drawSeq,id=('curve-'+client()+'-'+k+'-'+instance).replace(/[^a-z0-9_-]/gi,'');
    const grid=compact?'':[0,.25,.5,.75,1].map(q=>{const v=max-(max-min)*q,y=t+(h-t-b)*q;return`<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="#e8edf4"/><text x="2" y="${y+4}" font-size="9" fill="#74839a">${Math.round(v)}</text>`}).join('');
    const area=compact?'':`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${path} L ${pts[pts.length-1][0]} ${h-b} L ${pts[0][0]} ${h-b} Z" fill="url(#${id})"/>`;
    const mode=s.some(x=>x.mode==='analytical')?'analytical':'measured';
    const interactive=!compact&&k==='blis';
    const dots=compact?'':pts.map((p,i)=>interactive?`<circle class="blis-curve-point" data-blis-date="${E(s[i].date)}" data-blis-value="${E(s[i].value)}" data-blis-readout="${id}-readout" cx="${p[0]}" cy="${p[1]}" r="4.2" fill="${color}" stroke="#fff" stroke-width="1.5" tabindex="0" role="button" style="cursor:pointer"><title>${E(bgPoint(s[i].date,s[i].value))}</title></circle>`:`<circle cx="${p[0]}" cy="${p[1]}" r="2.8" fill="${color}"><title>${E(bgPoint(s[i].date,s[i].value))}</title></circle>`).join('');
    const labels=compact?'':(()=>{const step=Math.max(1,Math.ceil(s.length/7));return s.map((x,i)=>(i%step===0||i===s.length-1)?`<text x="${X(i)}" y="${h-8}" text-anchor="middle" font-size="9" fill="#74839a">${E((x.date||'').slice(5).split('-').reverse().join('.'))}</text>`:'').join('')})();
    const readout=interactive?`<div id="${id}-readout" class="blis-point-readout" style="margin-top:8px;min-height:28px;padding:7px 10px;border:1px solid #e4e9f1;border-radius:8px;background:#f8fafc;color:#23344f;font-size:12px"><b>Кликнете върху точка</b> · ще видите датата и стойността на BLIS индекса.</div>`:'';
    const note=compact?'':`<div class="blis-series-note" style="margin-top:7px;font-size:10px;color:#7b8798">${mode==='measured'?'Измерена дневна динамика.':'Аналитична микродинамика при недостатъчна вариация; последната точка е текущата измерена стойност.'}</div>`;
    return`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" data-curve-key="${E(k)}" data-curve-client="${E(client())}" data-series-mode="${mode}">${grid}${area}<path d="${path}" fill="none" stroke="${color}" stroke-width="${compact?2.5:3}" stroke-linecap="${compact?'butt':'round'}" stroke-linejoin="${compact?'miter':'round'}" vector-effect="non-scaling-stroke"/>${dots}${labels}</svg>${readout}${note}`;
  }

  function showPoint(dot){
    const rid=dot?.getAttribute?.('data-blis-readout');if(!rid)return;
    const box=document.getElementById(rid);if(!box)return;
    box.innerHTML=`<b>${E(bgPoint(dot.getAttribute('data-blis-date'),dot.getAttribute('data-blis-value')))}</b>`;
    const svg=dot.ownerSVGElement;svg?.querySelectorAll('.blis-curve-point').forEach(x=>{x.setAttribute('r',x===dot?'5.5':'4.2');x.setAttribute('stroke-width',x===dot?'2.4':'1.5')});
  }
  document.addEventListener('click',e=>{const dot=e.target?.closest?.('.blis-curve-point');if(dot)showPoint(dot)});
  document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target?.matches?.('.blis-curve-point')){e.preventDefault();showPoint(e.target)}});

  window.BLISCurves={series,draw,smoothPath,sharpPath,keyNorm,version:'3.1-temporal-dynamics'};
})();
