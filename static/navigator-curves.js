/* BLIS Navigator — Measured Curve Engine v4.1.
   Production rule: never invent dynamics. Curves use recorded history/activity
   at their real timestamps; incoming information is shown as factual event markers. */
(function(){
'use strict';
if(window.__BLIS_CURVES_V4)return;window.__BLIS_CURVES_V4=true;

const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const L=x=>Array.isArray(x)?x:[];
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const R=v=>Math.round(Number(v)*10)/10;
let seq=0;

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

function keyNorm(key){
  key=String(key||'blis').toLowerCase();
  for(const [canon,names] of Object.entries(aliases))if(canon===key||names.includes(key))return canon;
  return key;
}
function stampOf(s){
  const p=s?.payload||{};
  const raw=s?.created_at||s?.observed_at||s?.time||s?.timestamp||s?.date||p.created_at||p.observed_at||p.time||p.timestamp||p.date||p.data_updated||p.updated_at;
  const d=raw?new Date(raw):null;
  return d&&!isNaN(d)?d.toISOString():'';
}
function indexValue(obj,key){
  const p=obj?.payload||obj||{},k=keyNorm(key);
  if(k==='blis')return N(p.blis_index??p.blis??p.overall);
  const names=aliases[k]||[k];
  const hit=L(p.indices).find(i=>names.includes(String(i?.key||i?.name||i?.metric||'').toLowerCase()));
  if(hit&&N(hit.value)!=null)return N(hit.value);
  if(k==='market'||k==='signals'){
    const find=n=>{const ns=aliases[n]||[n],x=L(p.indices).find(i=>ns.includes(String(i?.key||i?.name||'').toLowerCase()));return x?N(x.value):null};
    const c=find('content'),pr=find('presence'),q=find('competitive');
    if([c,pr,q].every(v=>v!=null))return R(c*.40+pr*.25+q*.35);
  }
  return null;
}
function dedupeMeasured(rows){
  const m=new Map();
  for(const r of rows){
    if(!r?.timestamp||N(r.value)==null)continue;
    const t=new Date(r.timestamp);if(isNaN(t))continue;
    const row={timestamp:t.toISOString(),date:t.toISOString(),value:R(r.value),mode:'measured'};
    m.set(`${row.timestamp}|${row.value}`,row);
  }
  return [...m.values()].sort((a,b)=>a.timestamp.localeCompare(b.timestamp)).slice(-720);
}
function historySeries(key){
  try{return dedupeMeasured(L(window.H||H).map(s=>({timestamp:stampOf(s),value:indexValue(s,key)})))}catch(_){return[]}
}
function activitySeries(key){
  const k=keyNorm(key),names=aliases[k]||[k],rows=[];
  try{
    L(window.A||A).forEach(x=>{
      const mk=String(x?.metric||x?.metric_key||x?.key||'').toLowerCase();
      if(!names.some(a=>mk===a||mk.includes(a)))return;
      const v=N(x?.value);if(v==null)return;
      const raw=x?.time||x?.observed_at||x?.created_at||x?.timestamp||x?.date;const d=raw?new Date(raw):null;
      if(d&&!isNaN(d))rows.push({timestamp:d.toISOString(),value:v});
    });
  }catch(_){}
  return dedupeMeasured(rows);
}
function signalEvents(){
  const out=[],seen=new Set();
  try{
    L(window.A||A).forEach(x=>{
      const mk=String(x?.metric||x?.metric_key||x?.key||'').toLowerCase();
      if(!mk.startsWith('signal_event_'))return;
      let p=x?.value;
      if(typeof p==='string'){try{p=JSON.parse(p)}catch(_){return}}
      if(!p||typeof p!=='object')return;
      const raw=p.detected_at||p.published_at||x?.time||x?.observed_at||x?.created_at||x?.timestamp;
      const d=raw?new Date(raw):null;if(!d||isNaN(d))return;
      const id=String(p.id||p.fingerprint||`${d.toISOString()}|${p.url||''}|${p.title||''}`);if(seen.has(id))return;seen.add(id);
      out.push({id,timestamp:d.toISOString(),title:String(p.title||'Ново информационно събитие'),source:String(p.source||''),topic:String(p.topic||'brand_mention'),sentiment:String(p.sentiment||'neutral'),risk:N(p.risk_score),relevance:N(p.relevance),url:String(p.url||'')});
    });
  }catch(_){}
  return out.sort((a,b)=>a.timestamp.localeCompare(b.timestamp)).slice(-1000);
}
function eventFits(key,e){
  const k=keyNorm(key),topic=String(e?.topic||'');
  if(k==='blis'||k==='signals'||k==='market')return true;
  if(k==='reputation')return topic==='reputation'||topic==='regulatory'||e?.sentiment==='negative'||e?.sentiment==='positive';
  if(k==='competitive'||k==='competition')return topic==='competition';
  if(k==='content'||k==='interest'||k==='experience')return topic==='product'||topic==='commercial'||topic==='brand_mention';
  if(k==='presence'||k==='social'||k==='digital')return topic==='brand_mention'||topic==='commercial';
  return true;
}
function periodBounds(rows,events){
  const all=[...L(rows).map(x=>x.timestamp),...L(events).map(x=>x.timestamp)].filter(Boolean).map(x=>new Date(x).getTime()).filter(Number.isFinite);
  if(!all.length)return null;
  const end=Math.max(...all),days=Math.max(0,Number(window.BLISPeriod?.days)||30);
  return {end,cut:days?end-(days*86400000):0};
}
function periodFilter(rows,events){
  const b=periodBounds(rows,events);if(!b||!b.cut)return rows;
  const out=rows.filter(x=>new Date(x.timestamp).getTime()>=b.cut);
  return out.length?out:rows.slice(-Math.min(rows.length,48));
}
function eventFilter(events,rows){
  const b=periodBounds(rows,events);if(!b||!b.cut)return events;
  return events.filter(x=>new Date(x.timestamp).getTime()>=b.cut);
}
function series(key){
  const k=keyNorm(key),h=historySeries(k),a=activitySeries(k),ev=signalEvents().filter(e=>eventFits(k,e));
  return periodFilter(dedupeMeasured([...h,...a]),ev);
}
function events(key){
  const k=keyNorm(key),rows=dedupeMeasured([...historySeries(k),...activitySeries(k)]),ev=signalEvents().filter(e=>eventFits(k,e));
  return eventFilter(ev,rows);
}
function smoothPath(pts){
  if(!pts.length)return'';if(pts.length===1)return`M ${pts[0][0]} ${pts[0][1]}`;
  let d=`M ${pts[0][0]} ${pts[0][1]}`;
  for(let i=0;i<pts.length-1;i++){
    const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6;
    const c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
    d+=` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}
function sharpPath(pts){return pts.map((p,i)=>`${i?'L':'M'} ${p[0]} ${p[1]}`).join(' ')}
function labelDate(stamp){
  const d=new Date(stamp);if(isNaN(d))return String(stamp||'');
  const now=new Date(),same=d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()&&d.getDate()===now.getDate();
  return same?d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'}):d.toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).replace(',','');
}
function eventStrip(key,ev,opt={}){
  const compact=!!opt.compact,w=compact?210:(opt.width||720),h=compact?46:(opt.height||130),l=compact?3:38,r=compact?3:16,t=compact?4:14,b=compact?4:28;
  if(!ev.length)return`<div class="${compact?'scan':'ov-no-data'}">Няма потвърдени измервания или информационни събития за избрания период.</div>`;
  const times=ev.map(e=>new Date(e.timestamp).getTime()),min=Math.min(...times),max=Math.max(...times),span=Math.max(1,max-min),X=e=>l+(w-l-r)*(new Date(e.timestamp).getTime()-min)/span;
  const marks=ev.map(e=>{const x=X(e),risk=Math.max(0,Math.min(100,N(e.risk)??0)),hh=compact?Math.max(5,risk*.22):Math.max(10,risk*.55);return`<line x1="${x}" y1="${h-b}" x2="${x}" y2="${h-b-hh}" stroke="#1766e8" stroke-width="${compact?1.5:2}" opacity=".72"><title>${E(`${labelDate(e.timestamp)} · ${e.title}${e.source?' · '+e.source:''}`)}</title></line>`}).join('');
  return `<div class="blis-curve-wrap" data-curve-key="${E(keyNorm(key))}"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Реални информационни събития">${marks}<line x1="${l}" y1="${h-b}" x2="${w-r}" y2="${h-b}" stroke="#dce4ee"/></svg>${compact?'':`<div class="blis-series-note" style="margin-top:7px;font-size:10px;color:#7b8798">${ev.length} реални информационни събития · линията ще се появи при второ числово измерване.</div>`}</div>`;
}
function draw(key,opt={}){
  const k=keyNorm(key),s=series(k),ev=events(k),compact=!!opt.compact;
  if(s.length<2)return eventStrip(k,ev,opt);
  const w=compact?210:(opt.width||720),h=compact?46:(opt.height||220),l=compact?3:38,r=compact?3:16,t=compact?4:16,b=compact?4:30,color=opt.color||'#1766e8';
  const vals=s.map(x=>x.value),rawMin=Math.min(...vals),rawMax=Math.max(...vals),spread=Math.max(.8,rawMax-rawMin),pad=Math.max(1.4,spread*.28),min=Math.max(0,rawMin-pad),max=Math.min(100,rawMax+pad),span=Math.max(1,max-min);
  const times=s.map(x=>new Date(x.timestamp).getTime()),minT=Math.min(...times),maxT=Math.max(...times),spanT=Math.max(1,maxT-minT);
  const Xrow=(x,i)=>maxT===minT?l+(w-l-r)*i/Math.max(1,s.length-1):l+(w-l-r)*(new Date(x.timestamp).getTime()-minT)/spanT;
  const Xtime=stamp=>l+(w-l-r)*Math.max(0,Math.min(1,(new Date(stamp).getTime()-minT)/spanT));
  const Y=v=>t+(h-t-b)*(1-(v-min)/span),pts=s.map((x,i)=>[Xrow(x,i),Y(x.value)]),path=compact?sharpPath(pts):smoothPath(pts),id=`curve-${++seq}`;
  const grid=compact?'':[0,.25,.5,.75,1].map(q=>{const v=max-(max-min)*q,y=t+(h-t-b)*q;return`<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="#e8edf4"/><text x="2" y="${y+4}" font-size="9" fill="#74839a">${Math.round(v)}</text>`}).join('');
  const area=compact?'':`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".16"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${path} L ${pts.at(-1)[0]} ${h-b} L ${pts[0][0]} ${h-b} Z" fill="url(#${id})"/>`;
  const labelStep=Math.max(1,Math.ceil(s.length/6));
  const labels=compact?'':s.map((x,i)=>(i===0||i===s.length-1||i%labelStep===0)?`<text x="${Xrow(x,i)}" y="${h-8}" text-anchor="middle" font-size="9" fill="#74839a">${E(labelDate(x.timestamp))}</text>`:'').join('');
  const marks=ev.filter(e=>{const tt=new Date(e.timestamp).getTime();return tt>=minT&&tt<=maxT}).map(e=>{const x=Xtime(e.timestamp);return`<line x1="${x}" y1="${h-b-7}" x2="${x}" y2="${h-b}" stroke="${color}" stroke-width="1.4" opacity=".7"><title>${E(`${labelDate(e.timestamp)} · ${e.title}${e.source?' · '+e.source:''}`)}</title></line><circle cx="${x}" cy="${h-b-8}" r="${compact?1.7:2.3}" fill="${color}" opacity=".82"/>`}).join('');
  return `<div class="blis-curve-wrap" data-curve-key="${E(k)}"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Измерена динамика ${E(k)}">${grid}${area}<path d="${path}" fill="none" stroke="${color}" stroke-width="${compact?2.2:3.5}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${marks}${labels}</svg>${compact?'':`<div class="blis-series-note" style="margin-top:7px;font-size:10px;color:#7b8798">Измерена динамика · ${s.length} реални времеви точки${ev.length?` · ${ev.length} информационни събития`:''}.</div>`}</div>`;
}
window.BLISCurves={series,events,draw,smoothPath,sharpPath,keyNorm,version:'4.1-realtime-measured-events'};
})();
