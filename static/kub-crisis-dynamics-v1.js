/* BLIS KUB Crisis Dynamics v1
   Live, evidence-backed crisis curve from the KUB signal API.
   - last 30 days, one point per day
   - clickable signal points / peaks
   - escalation indicator from trailing 24h vs previous 24h
   - visual accents for newest monitoring signals
*/
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
if(window.__KUB_CRISIS_DYNAMICS_V1)return;window.__KUB_CRISIS_DYNAMICS_V1=true;

const API='/api/signals?client=kub&limit=500';
const ACTIVE_MS=5000,HIDDEN_MS=15000,DAYS=30;
let timer=0,inFlight=false,lastRows=[];
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const stamp=r=>{const d=new Date(r.published_at||r.detected_at||0);return Number.isNaN(d.getTime())?0:d.getTime()};
const fmtDate=t=>new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'});
const fmtShort=t=>new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'});
const sevRank=s=>({critical:4,high:3,medium:2,low:1}[String(s||'').toLowerCase()]||0);

function injectCSS(){
 if(document.getElementById('kubDynamicsCSS'))return;
 const s=document.createElement('style');s.id='kubDynamicsCSS';s.textContent=`
 #overview .kubDynCard{position:relative;overflow:visible}
 #overview .kubDynCard .chartWrap{height:238px;position:relative;overflow:visible;margin-top:8px}
 #overview .kubDynSvg{width:100%;height:100%;display:block;overflow:visible}
 #overview .kubDynLine{fill:none;stroke:#bd8733;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
 #overview .kubDynArea{fill:url(#kubDynArea)}
 #overview .kubDynGrid{stroke:#e7ecf1;stroke-width:1}
 #overview .kubDynAxisText{fill:#7a8996;font-size:9px}
 #overview .kubDynPoint{cursor:pointer;transition:r .16s ease,opacity .16s ease;filter:drop-shadow(0 2px 3px rgba(87,69,38,.18))}
 #overview .kubDynPoint:hover{r:7.2;opacity:1}
 #overview .kubDynPoint.peak{fill:#b94b4b;stroke:#fff;stroke-width:2.2}
 #overview .kubDynPoint.regular{fill:#bd8733;stroke:#fff;stroke-width:1.7}
 #overview .kubDynHalo{fill:#b94b4b;opacity:.16;transform-box:fill-box;transform-origin:center;animation:kubDynPulse 1.8s ease-out infinite;pointer-events:none}
 @keyframes kubDynPulse{0%{opacity:.28;transform:scale(.65)}80%,100%{opacity:0;transform:scale(2.1)}}
 #kubDynStatus{display:inline-flex;align-items:center;gap:6px;font-weight:800;color:#6f4e17}
 #kubDynStatus.escalating{color:#a13e3e}
 #kubDynStatus.escalating:before{content:'';width:7px;height:7px;border-radius:50%;background:#b94b4b;box-shadow:0 0 0 0 rgba(185,75,75,.35);animation:kubStatusPulse 1.6s infinite}
 @keyframes kubStatusPulse{70%{box-shadow:0 0 0 7px rgba(185,75,75,0)}100%{box-shadow:0 0 0 0 rgba(185,75,75,0)}}
 .kubDynPopover{position:absolute;z-index:40;width:min(340px,calc(100% - 18px));background:#fff;border:1px solid #d9e1e8;border-radius:14px;padding:13px 14px;box-shadow:0 18px 45px rgba(45,64,82,.19);font-size:10px;line-height:1.45;color:#526475}
 .kubDynPopover[hidden]{display:none}
 .kubDynPopover b{display:block;color:#24384d;font-size:12px;margin:2px 0 6px}
 .kubDynPopover .date{font-size:9px;font-weight:900;letter-spacing:.45px;color:#a66f22;text-transform:uppercase}
 .kubDynPopover .count{display:inline-block;margin:0 0 8px;padding:4px 7px;border-radius:999px;background:#fff2f2;color:#a84545;font-size:8.5px;font-weight:900}
 .kubDynPopover .event{padding:8px 0;border-top:1px solid #edf1f4}
 .kubDynPopover .event:first-of-type{border-top:0}
 .kubDynPopover .event strong{display:block;color:#334b60;font-size:10px;margin-bottom:2px}
 .kubDynPopover .event span{font-size:9px;color:#7a8996}
 .kubDynPopover a{color:#96661c;text-decoration:none;font-weight:800}
 .kubDynClose{position:absolute;right:8px;top:7px;border:0;background:#eef2f5;color:#637482;border-radius:8px;width:24px;height:24px;cursor:pointer}
 #feed .item.kubSignalAccent{position:relative;overflow:hidden;transition:transform .16s ease,box-shadow .16s ease,border-color .16s ease}
 #feed .item.kubSignalAccent:before{content:'';position:absolute;left:0;top:0;bottom:0;width:5px;border-radius:14px 0 0 14px;background:#4b789f}
 #feed .item.kubSigCritical{background:linear-gradient(105deg,rgba(185,75,75,.115) 0%,rgba(255,255,255,.98) 25%);border-color:#e8c6c6}
 #feed .item.kubSigCritical:before{background:linear-gradient(180deg,#c95656,#8f2f2f)}
 #feed .item.kubSigInstitution{background:linear-gradient(105deg,rgba(189,135,51,.105) 0%,rgba(255,255,255,.98) 25%)}
 #feed .item.kubSigInstitution:before{background:linear-gradient(180deg,#d2a24f,#a66f22)}
 #feed .item.kubSigUtilities{background:linear-gradient(105deg,rgba(111,84,160,.10) 0%,rgba(255,255,255,.98) 25%)}
 #feed .item.kubSigUtilities:before{background:linear-gradient(180deg,#886db6,#674d93)}
 #feed .item.kubSigMedia:before{background:linear-gradient(180deg,#5a8eb3,#3e6c8e)}
 #feed .item.kubFreshSignal{box-shadow:0 10px 25px rgba(61,82,101,.10)}
 #feed .item.kubFreshSignal:hover{transform:translateY(-1px);box-shadow:0 14px 30px rgba(61,82,101,.14)}
 .kubNewBadge{display:inline-flex!important;align-items:center;gap:4px;background:#fff0f0!important;color:#a84545!important;border:1px solid #f0caca;font-weight:900!important}
 .kubNewBadge:before{content:'';width:5px;height:5px;border-radius:50%;background:#b94b4b;animation:kubStatusPulse 1.6s infinite}
 `;document.head.appendChild(s);
}

function chartCard(){
 return [...document.querySelectorAll('#overview .card')].find(c=>/Кризисна динамика/.test((c.querySelector('.sectionTitle')||{}).textContent||''))||null;
}
function topicFor(r){
 const t=(String(r.title||'')+' '+String(r.text||'')).toLowerCase();
 if(/вик|водоснабд|спир.*вод|без вода|водата/.test(t))return 'Водоснабдяване / ВиК';
 if(/електро|ток|енерго|захранван/.test(t))return 'Електрозахранване';
 if(/съд|дело|жалб|административн/.test(t))return 'Съдебни действия';
 if(/запечат|събар|премах|незаконн.*сград|строител/.test(t))return 'Запечатване / премахване на обекти';
 if(/парламент|народното събрание|депутат|възраждане|деклараци/.test(t))return 'Политическа и институционална ескалация';
 if(/прокурат|разслед|полици|данс/.test(t))return 'Разследване / контролни органи';
 const mp={regulatory:'Институционален натиск',reputation:'Репутационен натиск',competition:'Конкурентна среда',brand_mention:'Медийно отразяване'};
 return mp[String(r.topic||'').toLowerCase()]||'Медийно отразяване';
}
function buildBuckets(rows){
 const now=new Date(),end=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1),start=new Date(end);start.setDate(start.getDate()-DAYS);
 const buckets=[];for(let i=0;i<DAYS;i++){const a=new Date(start);a.setDate(start.getDate()+i);const b=new Date(a);b.setDate(a.getDate()+1);buckets.push({start:+a,end:+b,rows:[],count:0,topic:''})}
 for(const r of rows||[]){const t=stamp(r);if(!t||t<+start||t>=+end)continue;const idx=Math.floor((new Date(t).setHours(0,0,0,0)-(+start))/86400000);if(idx>=0&&idx<buckets.length)buckets[idx].rows.push(r)}
 for(const b of buckets){
  b.rows.sort((a,c)=>sevRank(c.severity)-sevRank(a.severity)||stamp(c)-stamp(a));b.count=b.rows.length;
  const tally={};for(const r of b.rows){const k=topicFor(r);tally[k]=(tally[k]||0)+1}b.topic=Object.keys(tally).sort((a,c)=>tally[c]-tally[a])[0]||'Няма нов потвърден сигнал';
 }
 return buckets;
}
function isPeak(b,i){
 if(!b[i]||b[i].count<=0)return false;const prev=i?b[i-1].count:0,next=i<b.length-1?b[i+1].count:0;
 return b[i].count>=prev&&b[i].count>=next&&(b[i].count>prev||b[i].count>next);
}
function escalation(rows){
 const now=Date.now(),a=rows.filter(r=>{const t=stamp(r);return t>now-86400000&&t<=now}).length,b=rows.filter(r=>{const t=stamp(r);return t>now-172800000&&t<=now-86400000}).length;
 if(a>=Math.max(3,b+2)&&a>b*1.2)return {label:`ЕСКАЛАЦИЯ ↑ · ${a} сигнала / 24 ч.`,cls:'escalating'};
 if(a>0&&b>0&&a<b*.65)return {label:`ОТСЛАБВАНЕ · ${a} сигнала / 24 ч.`,cls:''};
 return {label:`ТЕКУЩА АКТИВНОСТ · ${a} сигнала / 24 ч.`,cls:''};
}
function popupHTML(b){
 const events=b.rows.slice(0,3).map(r=>`<div class="event"><strong>${esc(clean(r.title)||'Сигнал')}</strong><span>${esc(r.source||'източник')} · ${esc(new Date(stamp(r)).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'}))}</span>${r.url?`<br><a href="${esc(r.url)}" target="_blank" rel="noopener">ИЗТОЧНИК ↗</a>`:''}</div>`).join('');
 return `<button class="kubDynClose" type="button">×</button><div class="date">${esc(fmtDate(b.start))}</div><b>${esc(b.topic)}</b><span class="count">${b.count} потвърдени сигнала</span>${events||'<div class="event">Няма потвърден сигнал за този ден.</div>'}`;
}
function renderDynamics(rows){
 const card=chartCard();if(!card)return;card.classList.add('kubDynCard');
 const legend=card.querySelector('.legend'),wrap=card.querySelector('.chartWrap');if(!wrap)return;
 const buckets=buildBuckets(rows),max=Math.max(1,...buckets.map(b=>b.count));
 if(legend){const e=escalation(rows);legend.innerHTML=`<span><i style="background:#bd8733"></i>потвърдени публикации / сигнали по дни</span><span>LIVE · последни ${DAYS} дни · клик върху точка за тема и източници</span><span id="kubDynStatus" class="${e.cls}">${esc(e.label)}</span>`}
 const W=720,H=220,L=28,R=15,T=16,B=38,plotW=W-L-R,base=H-B,plotH=base-T;
 const pts=buckets.map((b,i)=>({x:L+(plotW*i/(buckets.length-1)),y:base-(b.count/max)*plotH,b,i}));
 const line=pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' '),area=`M ${L} ${base} L `+pts.map(p=>`${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')+` L ${W-R} ${base} Z`;
 const ticks=[0,7,14,21,29].map(i=>`<text class="kubDynAxisText" x="${pts[i].x}" y="211" text-anchor="${i===0?'start':i===29?'end':'middle'}">${fmtShort(buckets[i].start)}</text>`).join('');
 const dots=pts.filter(p=>p.b.count>0).map(p=>{const peak=isPeak(buckets,p.i),latest=p.i===buckets.length-1;return `${latest?`<circle class="kubDynHalo" cx="${p.x}" cy="${p.y}" r="8"></circle>`:''}<circle tabindex="0" role="button" aria-label="${esc(fmtDate(p.b.start)+' · '+p.b.topic)}" class="kubDynPoint ${peak?'peak':'regular'}" data-kub-point="${p.i}" cx="${p.x}" cy="${p.y}" r="${peak?5.8:3.8}"></circle>`}).join('');
 wrap.innerHTML=`<svg class="kubDynSvg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="kubDynArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4b65e" stop-opacity=".30"/><stop offset="1" stop-color="#e4b65e" stop-opacity="0"/></linearGradient></defs><line class="kubDynGrid" x1="${L}" x2="${W-R}" y1="${base}" y2="${base}"/><line class="kubDynGrid" x1="${L}" x2="${W-R}" y1="${T+plotH*.66}" y2="${T+plotH*.66}"/><line class="kubDynGrid" x1="${L}" x2="${W-R}" y1="${T+plotH*.33}" y2="${T+plotH*.33}"/><path class="kubDynArea" d="${area}"/><polyline class="kubDynLine" points="${line}"/>${dots}${ticks}</svg><div class="kubDynPopover" hidden></div>`;
 const pop=wrap.querySelector('.kubDynPopover');
 function openPoint(el,ev){const i=+el.dataset.kubPoint,b=buckets[i];if(!b)return;pop.innerHTML=popupHTML(b);pop.hidden=false;const rect=wrap.getBoundingClientRect(),x=ev&&ev.clientX?ev.clientX-rect.left:rect.width*.52,y=ev&&ev.clientY?ev.clientY-rect.top:55;const pw=Math.min(340,Math.max(240,rect.width-18));pop.style.width=pw+'px';pop.style.left=Math.max(8,Math.min(x-pw/2,rect.width-pw-8))+'px';pop.style.top=Math.max(8,Math.min(y+12,rect.height-155))+'px';const c=pop.querySelector('.kubDynClose');if(c)c.onclick=()=>{pop.hidden=true};}
 wrap.querySelectorAll('[data-kub-point]').forEach(el=>{el.addEventListener('click',e=>openPoint(el,e));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openPoint(el,e)}})});
}

function itemTime(item){
 const v=Number(item.dataset.published||0);if(v)return v;const txt=((item.querySelector('time')||{}).innerText||'').replace(/\s+/g,' ');const m=txt.match(/(\d{2})\.(\d{2})\.(\d{4}).*?(\d{2}):(\d{2})/);return m?new Date(+m[3],+m[2]-1,+m[1],+m[4],+m[5]).getTime():0;
}
function decorateFeed(){
 const f=document.getElementById('feed');if(!f)return;const now=Date.now();[...f.querySelectorAll('.item')].forEach((it,idx)=>{
  it.classList.remove('kubSigCritical','kubSigInstitution','kubSigUtilities','kubSigMedia','kubFreshSignal');it.classList.add('kubSignalAccent');
  const txt=(it.innerText+' '+(it.dataset.type||'')).toLowerCase();if(/критич/.test(txt))it.classList.add('kubSigCritical');else if(/institution|институц|съд|прокурат|община|парламент/.test(txt))it.classList.add('kubSigInstitution');else if(/utilities|вик|вод|ток|електро/.test(txt))it.classList.add('kubSigUtilities');else it.classList.add('kubSigMedia');
  const t=itemTime(it),fresh=t&&now-t>=0&&now-t<=86400000;if(fresh)it.classList.add('kubFreshSignal');
  const meta=it.querySelector('.meta');if(meta&&fresh&&!meta.querySelector('.kubNewBadge')){const b=document.createElement('span');b.className='kubNewBadge';b.textContent=idx===0?'НАЙ-НОВО':'НОВО';meta.prepend(b)}
  if(meta&&!fresh)meta.querySelectorAll('.kubNewBadge').forEach(x=>x.remove());
 });
}
function schedule(ms){clearTimeout(timer);timer=setTimeout(sync,ms==null?(document.hidden?HIDDEN_MS:ACTIVE_MS):ms)}
async function sync(){
 if(inFlight){schedule(1000);return}inFlight=true;const ctl=new AbortController(),to=setTimeout(()=>ctl.abort(),8000);
 try{const r=await fetch(API+'&_='+Date.now(),{cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json'},signal:ctl.signal});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();lastRows=Array.isArray(d.signals)?d.signals:[];renderDynamics(lastRows);decorateFeed();}
 catch(e){console.warn('KUB crisis dynamics',e);if(lastRows.length)renderDynamics(lastRows);decorateFeed();}
 finally{clearTimeout(to);inFlight=false;schedule()}
}
function boot(){injectCSS();decorateFeed();const f=document.getElementById('feed');if(f)new MutationObserver(()=>decorateFeed()).observe(f,{childList:true,subtree:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden){clearTimeout(timer);sync()}});window.addEventListener('focus',()=>{clearTimeout(timer);sync()});sync()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
