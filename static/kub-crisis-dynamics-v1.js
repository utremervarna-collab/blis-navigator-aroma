/* BLIS KUB Crisis Dynamics v2 — resilient production interaction */
(function(){
'use strict';
if(window.__KUB_CRISIS_DYNAMICS_V2)return;
window.__KUB_CRISIS_DYNAMICS_V2=true;

const API='/api/signals?client=kub&limit=500';
const DAYS=30;
let lastRows=[];
let syncTimer=0;

const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const ts=r=>{const d=new Date(r.published_at||r.detected_at||r.created_at||r.date||0);return isNaN(d)?0:+d};
const fmt=t=>new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'});
const short=t=>new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'});

function isKubPage(){
 const u=(location.pathname+' '+location.search).toLowerCase();
 if(u.includes('kub'))return true;
 const body=(document.body&&document.body.innerText||'').slice(0,12000).toLowerCase();
 return body.includes('корпорация куб')||body.includes('баба алино');
}

function addCss(){
 if(document.getElementById('kubDynV2Css'))return;
 const s=document.createElement('style');s.id='kubDynV2Css';s.textContent=`
 .kubDynV2Card{position:relative!important;overflow:visible!important}
 .kubDynV2Wrap{height:250px!important;position:relative!important;overflow:visible!important;touch-action:manipulation}
 .kubDynV2Svg{width:100%;height:100%;display:block;overflow:visible}
 .kubDynV2Grid{stroke:#e6ebef;stroke-width:1}
 .kubDynV2Area{fill:rgba(189,135,51,.13)}
 .kubDynV2Line{fill:none;stroke:#bd8733;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
 .kubDynV2Point{cursor:pointer;pointer-events:all;outline:none;filter:drop-shadow(0 2px 3px rgba(0,0,0,.12))}
 .kubDynV2Point.regular{fill:#bd8733;stroke:#fff;stroke-width:2}
 .kubDynV2Point.peak{fill:#b94b4b;stroke:#fff;stroke-width:2.4}
 .kubDynV2Point:hover,.kubDynV2Point:focus{stroke:#24384d;stroke-width:3}
 .kubDynV2Hit{fill:transparent;cursor:pointer;pointer-events:all}
 .kubDynV2Axis{fill:#7a8996;font-size:10px}
 .kubDynV2Pop{position:absolute;z-index:9999;min-width:250px;max-width:360px;background:#fff;border:1px solid #d8e0e6;border-radius:14px;padding:14px 15px;box-shadow:0 18px 45px rgba(34,54,72,.22);font-size:11px;line-height:1.45;color:#526475}
 .kubDynV2Pop[hidden]{display:none!important}
 .kubDynV2Pop .d{font-size:9px;font-weight:900;letter-spacing:.4px;color:#a66f22;text-transform:uppercase}
 .kubDynV2Pop h4{font-size:13px;color:#24384d;margin:4px 28px 7px 0}
 .kubDynV2Pop .cnt{display:inline-block;background:#fff1f1;color:#a84545;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:900;margin-bottom:7px}
 .kubDynV2Pop .ev{padding:7px 0;border-top:1px solid #edf1f4}
 .kubDynV2Pop .ev strong{display:block;color:#334b60;font-size:10px}
 .kubDynV2Pop a{color:#96661c;font-weight:800;text-decoration:none}
 .kubDynV2Close{position:absolute;right:8px;top:8px;width:25px;height:25px;border:0;border-radius:8px;background:#eef2f5;color:#566b7b;cursor:pointer}
 .kubDynV2Hint{font-size:10px;color:#7a8996;margin-top:7px;font-weight:700}
 `;document.head.appendChild(s);
}

function findCard(){
 const all=[...document.querySelectorAll('.card,section,article,div')];
 return all.find(el=>{
  const title=el.querySelector&&el.querySelector('.sectionTitle,h2,h3');
  return title&&/Кризисна динамика/i.test(title.textContent||'');
 })||null;
}

function getWrap(card){
 let wrap=card.querySelector('.chartWrap,.chart-wrap,[data-chart],.chart');
 if(!wrap){
  const svg=card.querySelector('svg');
  if(svg)wrap=svg.parentElement;
 }
 if(!wrap){
  wrap=document.createElement('div');
  wrap.className='chartWrap';
  const title=card.querySelector('.sectionTitle,h2,h3');
  (title?title.parentNode:card).appendChild(wrap);
 }
 wrap.classList.add('kubDynV2Wrap');
 return wrap;
}

function topic(r){
 const t=(String(r.title||'')+' '+String(r.text||r.summary||'')).toLowerCase();
 if(/вик|водоснабд|без вода|водата/.test(t))return 'Водоснабдяване / ВиК';
 if(/електро|ток|енерго|захранван/.test(t))return 'Електрозахранване';
 if(/съд|дело|жалб|административн/.test(t))return 'Съдебни действия';
 if(/събар|премах|незаконн|строител|запечат/.test(t))return 'Строителни / административни действия';
 if(/парламент|депутат|деклараци|възраждане/.test(t))return 'Политическа / институционална ескалация';
 if(/прокурат|разслед|полици|данс/.test(t))return 'Разследване / контролни органи';
 return 'Медийно и публично отразяване';
}

function buckets(rows){
 const now=new Date();const end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);const start=new Date(end);start.setDate(start.getDate()-DAYS);
 const out=[];for(let i=0;i<DAYS;i++){const a=new Date(start);a.setDate(start.getDate()+i);out.push({start:+a,rows:[],count:0,topic:'Няма нов потвърден сигнал'});}
 rows.forEach(r=>{const t=ts(r);if(!t||t<+start||t>=+end)return;const d=new Date(t);d.setHours(0,0,0,0);const i=Math.floor((+d-(+start))/86400000);if(i>=0&&i<DAYS)out[i].rows.push(r);});
 out.forEach(b=>{b.rows.sort((a,z)=>ts(z)-ts(a));b.count=b.rows.length;const m={};b.rows.forEach(r=>{const k=topic(r);m[k]=(m[k]||0)+1;});b.topic=Object.keys(m).sort((a,z)=>m[z]-m[a])[0]||b.topic;});
 return out;
}

function peak(bs,i){if(!bs[i]||bs[i].count<1)return false;const p=i?bs[i-1].count:0,n=i<bs.length-1?bs[i+1].count:0;return bs[i].count>=p&&bs[i].count>=n&&(bs[i].count>p||bs[i].count>n);}

function popHtml(b){
 const ev=b.rows.slice(0,3).map(r=>`<div class="ev"><strong>${esc(clean(r.title||r.text||'Сигнал'))}</strong><span>${esc(r.source||r.domain||'източник')}</span>${r.url?`<br><a href="${esc(r.url)}" target="_blank" rel="noopener">ИЗТОЧНИК ↗</a>`:''}</div>`).join('');
 return `<button class="kubDynV2Close" type="button" aria-label="Затвори">×</button><div class="d">${esc(fmt(b.start))}</div><h4>${esc(b.topic)}</h4><span class="cnt">${b.count} потвърдени сигнала</span>${ev||'<div class="ev">Няма потвърдени сигнали.</div>'}`;
}

function render(rows){
 if(!isKubPage())return false;
 const card=findCard();if(!card)return false;
 card.classList.add('kubDynV2Card');
 const wrap=getWrap(card),bs=buckets(rows),max=Math.max(1,...bs.map(x=>x.count));
 const W=760,H=220,L=28,R=18,T=14,B=36,base=H-B,pw=W-L-R,ph=base-T;
 const pts=bs.map((b,i)=>({x:L+pw*i/(DAYS-1),y:base-(b.count/max)*ph,b,i}));
 const line=pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
 const area=`M ${L} ${base} L `+pts.map(p=>`${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')+` L ${W-R} ${base} Z`;
 const dots=pts.filter(p=>p.b.count>0).map(p=>{const pk=peak(bs,p.i);return `<circle class="kubDynV2Hit" data-kub-v2="${p.i}" cx="${p.x}" cy="${p.y}" r="15"></circle><circle tabindex="0" role="button" class="kubDynV2Point ${pk?'peak':'regular'}" data-kub-v2="${p.i}" cx="${p.x}" cy="${p.y}" r="${pk?6.5:4.5}"><title>${esc(fmt(p.b.start)+' · '+p.b.topic+' · '+p.b.count+' сигнала')}</title></circle>`}).join('');
 const ticks=[0,7,14,21,29].map(i=>`<text class="kubDynV2Axis" x="${pts[i].x}" y="214" text-anchor="${i===0?'start':i===29?'end':'middle'}">${short(bs[i].start)}</text>`).join('');
 wrap.innerHTML=`<svg class="kubDynV2Svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><line class="kubDynV2Grid" x1="${L}" x2="${W-R}" y1="${base}" y2="${base}"/><line class="kubDynV2Grid" x1="${L}" x2="${W-R}" y1="${T+ph*.5}" y2="${T+ph*.5}"/><path class="kubDynV2Area" d="${area}"/><polyline class="kubDynV2Line" points="${line}"/>${dots}${ticks}</svg><div class="kubDynV2Pop" hidden></div>`;
 const pop=wrap.querySelector('.kubDynV2Pop');
 function open(el,e){const b=bs[+el.dataset.kubV2];if(!b)return;pop.innerHTML=popHtml(b);pop.hidden=false;const rr=wrap.getBoundingClientRect();const x=e&&e.clientX?e.clientX-rr.left:rr.width/2;const w=Math.min(350,Math.max(250,rr.width-20));pop.style.width=w+'px';pop.style.left=Math.max(8,Math.min(x-w/2,rr.width-w-8))+'px';pop.style.top='24px';const c=pop.querySelector('.kubDynV2Close');if(c)c.onclick=()=>pop.hidden=true;}
 wrap.querySelectorAll('[data-kub-v2]').forEach(el=>{el.addEventListener('click',e=>{e.stopPropagation();open(el,e)});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open(el,e)}});});
 let hint=card.querySelector('.kubDynV2Hint');if(!hint){hint=document.createElement('div');hint.className='kubDynV2Hint';wrap.insertAdjacentElement('afterend',hint);}hint.textContent='Клик върху точка или пик показва дата, тема, сигнали и източници.';
 card.dataset.kubInteractive='true';
 return true;
}

async function sync(){
 if(!isKubPage()){syncTimer=setTimeout(sync,3000);return;}
 try{const r=await fetch(API+'&_='+Date.now(),{cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json'}});if(r.ok){const d=await r.json();lastRows=Array.isArray(d)?d:(Array.isArray(d.signals)?d.signals:(Array.isArray(d.items)?d.items:[]));}}
 catch(e){console.warn('KUB dynamics fetch',e);}
 render(lastRows);
 clearTimeout(syncTimer);syncTimer=setTimeout(sync,5000);
}

function boot(){addCss();sync();const mo=new MutationObserver(()=>{if(isKubPage()){const c=findCard();if(c&&!c.dataset.kubInteractive)render(lastRows);}});mo.observe(document.documentElement,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
