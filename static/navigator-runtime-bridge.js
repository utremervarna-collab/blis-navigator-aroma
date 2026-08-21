/* BLIS Navigator — deterministic production runtime bridge. */
(function(){
'use strict';

if(!document.getElementById('blisPrepaintGuard')){
  const guard=document.createElement('style');
  guard.id='blisPrepaintGuard';
  guard.textContent='.page{visibility:hidden!important}.page.active{min-height:560px!important}';
  document.head.appendChild(guard);
}

/* dashboard.html still contains a static navigator-final-v16.js include.
   Block that copy; a fresh cache-busted final layer is loaded only after all
   legacy scripts and the V15 owner have finished. */
window.__BLIS_FINAL_V16='deferred';

const clients=new Set(['aroma','bolyarka','astor-garden','varna-towers']);
const initialClient=()=>{
  try{const q=new URLSearchParams(location.search).get('client');if(q&&clients.has(q))return q}catch(_){}
  return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null;
};

const legacyLoad=window.load;
if(typeof legacyLoad==='function'){
  window.load=async function(){
    const wanted=initialClient();
    if(wanted){try{slug=wanted}catch(_){}const sel=document.getElementById('clientSel');if(sel)sel.value=wanted}
    return legacyLoad.apply(this,arguments);
  };
}

window.renderAll=function(){
  try{
    try{window.D=D;window.S=S;window.Q=Q;window.A=A;window.H=H}catch(_){}
    const x=typeof dossier==='function'?dossier():null;
    if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
    if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
    const note=document.getElementById('clientNote');if(note)note.textContent=window.D?.note||x?.descriptor||'';
    const sync=document.getElementById('lastSync');if(sync)sync.textContent=window.D?.data_updated?new Date(window.D.data_updated).toLocaleString('bg-BG'):'активна синхронизация';
    window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:typeof slug!=='undefined'?slug:null}}));
  }catch(e){console.error('BLIS bridge render state failed',e)}
};

function loadScript(id,src){
  return new Promise((resolve,reject)=>{
    const old=document.getElementById(id);
    if(old){resolve(old);return}
    const s=document.createElement('script');s.id=id;s.src=src;s.async=false;
    s.onload=()=>resolve(s);s.onerror=()=>reject(new Error('Failed to load '+src));
    document.head.appendChild(s);
  });
}

const arr=x=>Array.isArray(x)?x:[];
const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const stamp=o=>{const r=o?.time||o?.observed_at||o?.observedAt||o?.timestamp||o?.created_at||o?.createdAt||o?.date||o?.updated_at||o?.updatedAt;const t=r?new Date(r).getTime():NaN;return Number.isFinite(t)?t:null};
const day=t=>new Date(t).toISOString().slice(0,10);
function daily(rows){const m=new Map();for(const r of rows){if(!r.t||num(r.v)===null)continue;const k=day(r.t),p=m.get(k);if(!p||r.t>=p.t)m.set(k,{t:r.t,v:num(r.v),key:r.key||''})}return [...m.values()].sort((a,b)=>a.t-b.t)}
function digitalIndexRows(){const out=[];for(const s of arr(window.H)){const t=stamp(s),v=num(arr(s?.payload?.indices).find(x=>String(x.key||'')==='digital')?.value);if(t&&v!==null)out.push({t,v,key:'digital'})}const cv=num(arr(window.D?.indices).find(x=>String(x.key||'')==='digital')?.value);if(cv!==null)out.push({t:stamp(window.D)||Date.now(),v:cv,key:'digital'});return daily(out)}
const SPECS={search:/search|serp|branded_search/i,web:/website_active|profile_active|site_active/i,external:/backlink|external|referral|news_mentions/i,online:/ecommerce_active|cart_active|direct_booking|pricing_visible/i};
function channelRows(kind){const re=SPECS[kind]||SPECS.search,groups=new Map();for(const o of arr(window.A)){const k=String(o.metric||o.metric_key||'');if(!re.test(k))continue;const t=stamp(o),v=num(o.value);if(!t||v===null)continue;if(!groups.has(k))groups.set(k,[]);groups.get(k).push({t,v,key:k})}let best=[];for(const rows of groups.values()){const d=daily(rows);if(d.length>best.length)best=d}return best.length?best:digitalIndexRows()}
function chartFrame(rows,height=185){rows=daily(rows);if(!rows.length)return null;const w=920,h=height,L=32,R=22,T=20,B=34,vals=rows.map(x=>x.v),mn=Math.min(...vals),mx=Math.max(...vals),span=Math.max(mx-mn,Math.max(1,Math.abs(mx||1)*.05)),lo=mn-span*.28,hi=mx+span*.28,rng=Math.max(.001,hi-lo),t0=rows[0].t,t1=rows.at(-1).t||t0+1,X=t=>L+(w-L-R)*(t-t0)/Math.max(1,t1-t0),Y=v=>T+(h-T-B)*(1-(v-lo)/rng),pts=rows.map(x=>[X(x.t),Y(x.v)]);return{rows,w,h,L,R,T,B,pts,X,Y}}
function labelsSVG(f){const step=Math.max(1,Math.ceil(f.rows.length/5));return f.rows.map((x,i)=>(i===0||i===f.rows.length-1||i%step===0)?`<text x="${f.pts[i][0]}" y="${f.h-8}" text-anchor="middle">${new Date(x.t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}</text>`:'').join('')}
function onePoint(rows,label){const r=rows[0];return `<div class="blis-v17-one"><strong>${Number(r.v).toLocaleString('bg-BG',{maximumFractionDigits:1})}</strong><span>${label} · ${new Date(r.t).toLocaleDateString('bg-BG')}</span></div>`}
function searchChart(rows,color){if(rows.length===1)return onePoint(rows,'Търсене');const f=chartFrame(rows);if(!f)return'';let d=`M ${f.pts[0][0]} ${f.pts[0][1]}`;for(let i=1;i<f.pts.length;i++)d+=` H ${f.pts[i][0]} V ${f.pts[i][1]}`;const dots=f.pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4"><title>${f.rows[i].v}</title></circle>`).join('');return `<svg class="blis-v17-chart step" viewBox="0 0 ${f.w} ${f.h}" preserveAspectRatio="none"><g class="grid"><line x1="${f.L}" y1="${f.T}" x2="${f.w-f.R}" y2="${f.T}"/><line x1="${f.L}" y1="${f.h-f.B+4}" x2="${f.w-f.R}" y2="${f.h-f.B+4}"/></g><path class="main" d="${d}" stroke="${color}"/>${dots}${labelsSVG(f)}</svg>`}
function webChart(rows,color){if(rows.length===1)return onePoint(rows,'Собствен уеб');const f=chartFrame(rows);if(!f)return'';const bw=Math.max(12,Math.min(54,(f.w-f.L-f.R)/(f.rows.length*1.7))),base=f.h-f.B+4,bars=f.pts.map((p,i)=>`<g><rect x="${p[0]-bw/2}" y="${p[1]}" width="${bw}" height="${Math.max(2,base-p[1])}" rx="6" fill="${color}" opacity="${.48+(i/f.pts.length)*.42}"/><circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#fff" stroke="${color}" stroke-width="3"><title>${f.rows[i].v}</title></circle></g>`).join('');return `<svg class="blis-v17-chart bars" viewBox="0 0 ${f.w} ${f.h}" preserveAspectRatio="none"><line class="baseline" x1="${f.L}" y1="${base}" x2="${f.w-f.R}" y2="${base}"/>${bars}${labelsSVG(f)}</svg>`}
function externalChart(rows,color){if(rows.length===1)return onePoint(rows,'Външно присъствие');const f=chartFrame(rows);if(!f)return'';let d=`M ${f.pts[0][0]} ${f.pts[0][1]}`;for(let i=0;i<f.pts.length-1;i++){const p0=f.pts[i-1]||f.pts[i],p1=f.pts[i],p2=f.pts[i+1],p3=f.pts[i+2]||p2,c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;d+=` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`}const base=f.h-f.B+4,area=`${d} L ${f.pts.at(-1)[0]} ${base} L ${f.pts[0][0]} ${base} Z`,gid='blisv17g'+Math.random().toString(36).slice(2);return `<svg class="blis-v17-chart area" viewBox="0 0 ${f.w} ${f.h}" preserveAspectRatio="none"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".34"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#${gid})"/><path class="main" d="${d}" stroke="${color}"/>${f.pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4"><title>${f.rows[i].v}</title></circle>`).join('')}${labelsSVG(f)}</svg>`}
function onlineChart(rows,color){if(rows.length===1)return onePoint(rows,'Онлайн действие');const f=chartFrame(rows);if(!f)return'';const base=f.h-f.B+4,stems=f.pts.map((p,i)=>`<g><line x1="${p[0]}" y1="${base}" x2="${p[0]}" y2="${p[1]}"/><circle cx="${p[0]}" cy="${p[1]}" r="8" fill="${color}" opacity=".18"/><circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${color}"><title>${f.rows[i].v}</title></circle></g>`).join('');return `<svg class="blis-v17-chart lollipop" viewBox="0 0 ${f.w} ${f.h}" preserveAspectRatio="none"><line class="baseline" x1="${f.L}" y1="${base}" x2="${f.w-f.R}" y2="${base}"/>${stems}${labelsSVG(f)}</svg>`}
function renderVisibilityChart(kind,rows,color){if(!rows.length)return'<div class="blis-v17-one"><strong>—</strong><span>Очаква се историческа точка</span></div>';if(kind==='web')return webChart(rows,color);if(kind==='external')return externalChart(rows,color);if(kind==='online')return onlineChart(rows,color);return searchChart(rows,color)}

function refinementCSS(){if(document.getElementById('blisUserRefinementCSS'))return;const st=document.createElement('style');st.id='blisUserRefinementCSS';st.textContent=`
#overview .n15-bliscore strong{font-size:60px!important;line-height:.95!important;letter-spacing:-.045em!important}#overview .n15-bliscore strong small{font-size:16px!important}#overview .n15-summaryitem strong{font-size:28px!important}
#live .n15-livekpi span{font-size:11px!important;font-weight:800!important;color:#53657b!important}#live .n15-livekpi strong{font-size:31px!important;line-height:1.05!important}
#social .n15-title .n15-k,#social .n15-title p{display:none!important}#social .n15-title h2{font-size:31px!important;letter-spacing:.01em!important;text-transform:uppercase!important;margin-bottom:18px!important}
#digital .n15-title h2{font-size:30px!important}.n15-digpulse .line{stroke-dasharray:26 11!important;animation:blisEcgTravel 1.05s linear infinite!important}.n15-digpulse .v16-ecg-dot{filter:drop-shadow(0 0 9px #48e6ff)!important}
.blis-v17-chart{width:100%;height:185px;display:block;overflow:visible}.blis-v17-chart text{font:700 9px Inter,system-ui,sans-serif;fill:#7c8998}.blis-v17-chart .grid line,.blis-v17-chart .baseline{stroke:#e6edf5;stroke-width:1.2}.blis-v17-chart .main{fill:none;stroke-width:4.5;stroke-linecap:round;stroke-linejoin:round}.blis-v17-chart circle{fill:#fff;stroke:#1766e8;stroke-width:2.5}.blis-v17-chart.bars circle{stroke-width:2.5}.blis-v17-chart.lollipop line:not(.baseline){stroke:#c8d6e8;stroke-width:2}.blis-v17-one{min-height:170px;display:grid;place-items:center;align-content:center;gap:7px}.blis-v17-one strong{font:600 34px Georgia,serif;color:#1766e8}.blis-v17-one span{font:750 9px Inter,system-ui,sans-serif;color:#7c8998}
@keyframes blisEcgTravel{to{stroke-dashoffset:-74}}
`;document.head.appendChild(st)}

let lastVisibilitySig='';
function applyUserRefinements(){
  refinementCSS();
  const socialNav=document.querySelector('#nav [data-page="social"] .navtxt');if(socialNav)socialNav.textContent='Сигнали';
  const digitalNav=document.querySelector('#nav [data-page="digital"] .navtxt');if(digitalNav)digitalNav.textContent='Видимост';
  const sr=document.getElementById('n15Signals');if(sr){const h=sr.querySelector('.n15-title h2');if(h)h.textContent='DIGITAL INTELLIGENCE';const dirs=sr.querySelectorAll('.n15-dir strong');if(dirs[0])dirs[0].textContent='Сигнали от марката';if(dirs[1])dirs[1].textContent='Сигнали за марката'}
  const dr=document.getElementById('n15Digital');if(dr){const h=dr.querySelector('.n15-title h2');if(h)h.textContent='Видимост';const active=dr.querySelector('.n15-digcard.active')?.dataset.dig||'search',card=dr.querySelector('.n15-digcard.active'),color=getComputedStyle(card||dr).getPropertyValue('--c').trim()||'#1766e8',rows=channelRows(active),sig=active+'|'+rows.map(x=>day(x.t)+':'+x.v).join(',');const box=dr.querySelector('.n15-digchart');if(box&&sig!==lastVisibilitySig){box.innerHTML=renderVisibilityChart(active,rows,color);lastVisibilitySig=sig}const hs=dr.querySelector('.n15-digchartcard .head span');if(hs)hs.textContent=active==='search'?'стъпкова динамика на търсенето':active==='web'?'дневна активност по колони':active==='external'?'плавна динамика на външното присъствие':'точки на онлайн действие';}
  const activePage=document.querySelector('.page.active')?.id,sys=document.getElementById('blisActiveModule'),detail=document.getElementById('blisSystemDetail');if(activePage==='social'){if(sys)sys.textContent='Сигнали';if(detail)detail.textContent='DIGITAL INTELLIGENCE'}else if(activePage==='digital'){if(sys)sys.textContent='Видимост';if(detail)detail.textContent='Дигитална откриваемост и канали'}
}

function startRefinements(){applyUserRefinements();[120,420,900,2100].forEach(ms=>setTimeout(applyUserRefinements,ms));window.addEventListener('blis:clientdata',()=>[100,500].forEach(ms=>setTimeout(applyUserRefinements,ms)));window.addEventListener('blis:periodchange',()=>[80,300].forEach(ms=>setTimeout(applyUserRefinements,ms)));document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.n15-digcard'))[80,220,520].forEach(ms=>setTimeout(applyUserRefinements,ms))},true);setInterval(applyUserRefinements,1500)}

let started=false;
async function startFinalStack(){
  if(started)return;started=true;
  const v='20260821-1426';
  const files=[
    ['blisGlobalLiveScript','/navigator-global-live.js?v='+v],
    ['blisUITerminologyScript','/navigator-ui-terminology.js?v='+v],
    ['blisAttitudesMasterV2Script','/navigator-attitudes-master-v2.js?v='+v],
    ['blisCompetitionMasterV5Script','/navigator-competition-master-v5.js?v='+v],
    ['blisCompetitionMotionV6Script','/navigator-competition-motion-fix-v6.js?v='+v],
    ['blisCompetitionIntelligenceV9Script','/navigator-competition-intelligence-v9.js?v='+v],
    ['blisCompetitionEnvironmentV10Script','/navigator-competition-environment-v10.js?v='+v],
    ['blisCompetitionPageV11Script','/navigator-competition-page-v11.js?v='+v],
    ['blisCompetitionPageV12Script','/navigator-competition-page-v12.js?v='+v],
    ['blisArchitectureV15Script','/navigator-architecture-v15.js?v='+v]
  ];
  try{
    for(const [id,src] of files)await loadScript(id,src);
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    if(window.__BLIS_FINAL_V16==='deferred')delete window.__BLIS_FINAL_V16;
    await loadScript('blisFinalV16Runtime','/navigator-final-v16.js?v='+v);
    window.dispatchEvent(new CustomEvent('blis:finalstackready'));
    startRefinements();
  }catch(e){
    console.error('BLIS final stack failed',e);
    document.body.classList.add('blis-final-load-error');
  }
}

/* Critical ordering fix: wait until all static legacy modules in dashboard.html
   have finished. They render only while the page is hidden, so they can no longer
   flash for 1–4 seconds before the final interface. */
if(document.readyState==='complete')setTimeout(startFinalStack,0);
else window.addEventListener('load',()=>setTimeout(startFinalStack,0),{once:true});
})();