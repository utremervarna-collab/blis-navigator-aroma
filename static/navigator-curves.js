/* BLIS Navigator — Measured Curve Engine v4.0.
   Production rule: never invent intermediate dynamics. Curves use only recorded
   history/activity. If fewer than two real points exist, Navigator says so. */
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
function snapshotDate(s){
  const p=s?.payload||{};
  const raw=s?.created_at||s?.observed_at||s?.time||s?.timestamp||s?.date||p.created_at||p.observed_at||p.time||p.date||p.data_updated||p.updated_at;
  const d=raw?new Date(raw):null;
  return d&&!isNaN(d)?d.toISOString().slice(0,10):'';
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
function uniqueDaily(rows){
  const m=new Map();
  for(const r of rows){if(!r?.date||N(r.value)==null)continue;m.set(r.date,{date:r.date,value:R(r.value),mode:'measured'})}
  return [...m.values()].sort((a,b)=>a.date.localeCompare(b.date));
}
function historySeries(key){
  try{return uniqueDaily(L(window.H||H).map(s=>({date:snapshotDate(s),value:indexValue(s,key)})))}catch(_){return[]}
}
function activitySeries(key){
  const k=keyNorm(key),names=aliases[k]||[k],rows=[];
  try{
    L(window.A||A).forEach(x=>{
      const mk=String(x?.metric||x?.metric_key||x?.key||'').toLowerCase();
      if(!names.some(a=>mk===a||mk.includes(a)))return;
      const v=N(x?.value);if(v==null)return;
      const raw=x?.time||x?.observed_at||x?.created_at||x?.date;const d=raw?new Date(raw):null;
      if(d&&!isNaN(d))rows.push({date:d.toISOString().slice(0,10),value:v});
    });
  }catch(_){}
  return uniqueDaily(rows);
}
function periodFilter(rows){
  const days=Math.max(0,Number(window.BLISPeriod?.days)||30);if(!days||!rows.length)return rows;
  const end=new Date(rows.at(-1).date+'T23:59:59Z').getTime(),cut=end-(days-1)*86400000;
  const out=rows.filter(x=>new Date(x.date+'T00:00:00Z').getTime()>=cut);
  return out.length>=2?out:rows.slice(-Math.min(rows.length,days));
}
function series(key){
  let h=historySeries(key),a=activitySeries(key);
  let rows=h.length>=a.length?h:a;
  if(h.length&&a.length){rows=uniqueDaily([...h,...a])}
  return periodFilter(rows);
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
function labelDate(date){const a=String(date||'').split('-');return a.length===3?`${a[2]}.${a[1]}`:String(date||'')}
function draw(key,opt={}){
  const k=keyNorm(key),s=series(k),compact=!!opt.compact;
  if(s.length<2)return`<div class="${compact?'scan':'ov-no-data'}">Няма достатъчно реални исторически измервания за тенденция.</div>`;
  const w=compact?210:(opt.width||720),h=compact?46:(opt.height||220),l=compact?3:38,r=compact?3:16,t=compact?4:16,b=compact?4:30,color=opt.color||'#1766e8';
  const vals=s.map(x=>x.value),rawMin=Math.min(...vals),rawMax=Math.max(...vals),spread=Math.max(.8,rawMax-rawMin),pad=Math.max(1.4,spread*.28),min=Math.max(0,rawMin-pad),max=Math.min(100,rawMax+pad),span=Math.max(1,max-min);
  const X=i=>l+(w-l-r)*i/(s.length-1),Y=v=>t+(h-t-b)*(1-(v-min)/span),pts=s.map((x,i)=>[X(i),Y(x.value)]),path=compact?sharpPath(pts):smoothPath(pts),id=`curve-${++seq}`;
  const grid=compact?'':[0,.25,.5,.75,1].map(q=>{const v=max-(max-min)*q,y=t+(h-t-b)*q;return`<line x1="${l}" y1="${y}" x2="${w-r}" y2="${y}" stroke="#e8edf4"/><text x="2" y="${y+4}" font-size="9" fill="#74839a">${Math.round(v)}</text>`}).join('');
  const area=compact?'':`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".16"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${path} L ${pts.at(-1)[0]} ${h-b} L ${pts[0][0]} ${h-b} Z" fill="url(#${id})"/>`;
  const labelStep=Math.max(1,Math.ceil(s.length/6));
  const labels=compact?'':s.map((x,i)=>(i===0||i===s.length-1||i%labelStep===0)?`<text x="${X(i)}" y="${h-8}" text-anchor="middle" font-size="9" fill="#74839a">${E(labelDate(x.date))}</text>`:'').join('');
  return `<div class="blis-curve-wrap" data-curve-key="${E(k)}"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Измерена динамика ${E(k)}">${grid}${area}<path d="${path}" fill="none" stroke="${color}" stroke-width="${compact?2.2:3.5}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${labels}</svg>${compact?'':`<div class="blis-series-note" style="margin-top:7px;font-size:10px;color:#7b8798">Измерена историческа динамика · ${s.length} реални дневни точки.</div>`}</div>`;
}
window.BLISCurves={series,draw,smoothPath,sharpPath,keyNorm,version:'4.0-measured-only'};
})();
