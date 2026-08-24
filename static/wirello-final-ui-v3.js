/* Wirello Market — final UI owner v3.
   Owns the Wirello overview after V15 and fixes desktop shell geometry/navigation.
   No global SVG rewriting and no dense daily point markers. */
(function(){
'use strict';
if(window.__WIRELLO_FINAL_UI_V3)return;window.__WIRELLO_FINAL_UI_V3=true;

const isWirello=()=>document.body?.dataset?.client==='wirello'||window.BLIS_INITIAL_CLIENT==='wirello'||new URLSearchParams(location.search).get('client')==='wirello';
const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=v=>N(v)===null?'—':N(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
const stamp=x=>{const raw=x?.time||x?.observed_at||x?.observedAt||x?.timestamp||x?.created_at||x?.createdAt||x?.date||x?.updated_at||x?.updatedAt;const t=raw?new Date(raw).getTime():NaN;return Number.isFinite(t)?t:null};
const data=()=>({d:window.D||window.__WIRELLO_DATA?.dashboard||{},s:Array.isArray(window.S)?window.S:(window.__WIRELLO_DATA?.sources||[]),a:Array.isArray(window.A)?window.A:(window.__WIRELLO_DATA?.activity||[]),h:Array.isArray(window.H)?window.H:(window.__WIRELLO_DATA?.history||[]),q:window.Q||{}});

function index(key,fallback){
 const {d}=data();
 if(key==='blis')return N(d.blis_index??d.blis)??fallback;
 const hit=(Array.isArray(d.indices)?d.indices:[]).find(x=>String(x.key||'')===key);
 return N(hit?.value)??fallback;
}
function latest(){
 const {a,s}=data();let best=null,bt=-1;
 for(const x of a){const t=stamp(x)||0;if(t>bt){best=x;bt=t}}
 const sk=best?.source||best?.source_key||'';
 const src=s.find(x=>String(x.key||x.source_key||'')===String(sk));
 return {t:bt>0?bt:null,label:src?.label||src?.name||'BLIS Source Health'};
}
function hist(){
 const out=[],seen=new Map();
 for(const x of data().h){const t=stamp(x),v=N(x?.payload?.blis_index??x?.payload?.blis);if(!t||v===null)continue;const day=new Date(t).toISOString().slice(0,10);seen.set(day,{t,v})}
 seen.forEach(x=>out.push(x));out.sort((a,b)=>a.t-b.t);return out.slice(-180);
}
function dmy(t){return new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})}
function fullDate(t){return new Date(t).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})}
function chart(rows){
 if(rows.length<2)return '<div class="wov3-empty">Няма достатъчно исторически стойности.</div>';
 const w=1000,h=220,l=26,r=22,t=18,b=34,vals=rows.map(x=>x.v),mn=Math.min(...vals),mx=Math.max(...vals),spread=Math.max(1,mx-mn),lo=mn-spread*.28,hi=mx+spread*.28,rng=Math.max(1,hi-lo);
 const X=i=>l+(w-l-r)*(i/(rows.length-1)),Y=v=>t+(h-t-b)*(1-(v-lo)/rng),pts=rows.map((x,i)=>[X(i),Y(x.v)]);
 let path=`M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
 for(let i=0;i<pts.length-1;i++){
  const p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
  const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
  path+=` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
 }
 const area=`${path} L ${pts.at(-1)[0].toFixed(2)} ${h-b} L ${pts[0][0].toFixed(2)} ${h-b} Z`;
 const ids=[0,Math.round((rows.length-1)*.2),Math.round((rows.length-1)*.4),Math.round((rows.length-1)*.6),Math.round((rows.length-1)*.8),rows.length-1];
 const labels=[...new Set(ids)].map(i=>`<text x="${X(i).toFixed(2)}" y="${h-8}" text-anchor="middle">${E(dmy(rows[i].t))}</text>`).join('');
 return `<svg class="wov3-chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="BLIS динамика"><defs><linearGradient id="wov3Area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1766e8" stop-opacity=".20"/><stop offset="1" stop-color="#1766e8" stop-opacity=".02"/></linearGradient><linearGradient id="wov3Line" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#14a89a"/><stop offset="1" stop-color="#1766e8"/></linearGradient></defs><g class="wov3-grid"><line x1="${l}" y1="${t+16}" x2="${w-r}" y2="${t+16}"/><line x1="${l}" y1="${(t+h-b)/2}" x2="${w-r}" y2="${(t+h-b)/2}"/><line x1="${l}" y1="${h-b}" x2="${w-r}" y2="${h-b}"/></g><path class="wov3-area" d="${area}"/><path class="wov3-line" d="${path}"/>${labels}</svg>`;
}
function iconFor(id){const m={overview:'▦',live:'◉',social:'⌁',digital:'◎',reputation:'◇',market:'◌',competition:'⚑',reports:'▤',history:'◷',profile:'♙',settings:'⚙',help:'?'};return m[id]||'•'}
function fixNav(){
 const nav=document.getElementById('nav');if(!nav)return;
 nav.querySelectorAll('button[data-page]').forEach(b=>{const i=b.querySelector('.navico');if(i&&!i.textContent.trim()&&!i.querySelector('svg'))i.textContent=iconFor(b.dataset.page)});
}
function installStyle(){
 if(document.getElementById('wirello-final-ui-v3-style'))return;
 const s=document.createElement('style');s.id='wirello-final-ui-v3-style';s.textContent=`
 body[data-client="wirello"]{overflow-x:hidden!important}
 body[data-client="wirello"] .main{width:calc(100vw - 224px)!important;max-width:calc(100vw - 224px)!important;min-width:0!important;overflow-x:hidden!important}
 body[data-client="wirello"] .shell,body[data-client="wirello"] .page,body[data-client="wirello"] .n15{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
 body[data-client="wirello"] #nav .navico{font-size:14px!important;line-height:1!important;color:currentColor!important}
 body[data-client="wirello"] #nav button{height:auto!important;min-height:42px!important;align-items:center!important}
 body[data-client="wirello"] #nav .navtxt{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;line-height:1.15!important}
 body[data-client="wirello"] .n15-smoothchart .n15-chartdot,body[data-client="wirello"] .wirello-stable-curve .blis-curve-point{display:none!important}
 body[data-client="wirello"] #n15Overview{width:100%!important;max-width:100%!important;min-width:0!important;overflow:hidden!important}
 .wov3{width:100%;max-width:100%;min-width:0;color:#142033;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;overflow:hidden}
 .wov3 *{box-sizing:border-box}.wov3-card{min-width:0;background:#fff;border:1px solid #e3eaf2;border-radius:18px;box-shadow:0 14px 36px rgba(21,38,67,.055)}
 .wov3-top{display:grid;grid-template-columns:minmax(0,1.22fr) minmax(320px,.78fr);gap:16px;width:100%;min-width:0;align-items:stretch}
 .wov3-blis{position:relative;min-height:390px;overflow:hidden;background:radial-gradient(circle at 50% 38%,rgba(56,168,255,.16),transparent 31%),linear-gradient(155deg,#fbfdff,#f4f9ff)}
 .wov3-core{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%);width:250px;height:250px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 36% 28%,#fff 0 12%,#f5faff 36%,#e9f3ff 100%);border:1px solid #d8e5f5;box-shadow:0 25px 65px rgba(29,99,203,.20),inset 0 0 0 12px rgba(255,255,255,.76)}
 .wov3-core span{font-size:10px;font-weight:900;letter-spacing:.15em;color:#6f7f93}.wov3-core strong{font:600 82px/.94 Georgia,serif;color:#1766e8;letter-spacing:-.055em}.wov3-core strong small{font:700 14px Inter,system-ui;color:#8492a5}.wov3-core em{margin-top:9px;font-style:normal;font-size:10px;font-weight:850;color:#0d8c5d}
 .wov3-pill{position:absolute;min-width:164px;padding:12px 14px;border-radius:15px;background:rgba(255,255,255,.95);border:1px solid #e1e9f2;text-align:center;box-shadow:0 10px 26px rgba(28,55,92,.06)}.wov3-pill span{display:block;font-size:8px;color:#8591a2}.wov3-pill b{display:block;margin-top:4px;font-size:11px;color:#111827}.wov3-p1{left:28px;top:26px}.wov3-p2{right:28px;top:26px}.wov3-p3{left:28px;bottom:28px}.wov3-p4{right:28px;bottom:28px}
 .wov3-summary{padding:22px;display:flex;flex-direction:column;min-height:390px}.wov3-k{font-size:8px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:#8490a1}.wov3-summary h3{margin:5px 0 14px;font-size:18px}.wov3-summarygrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:10px;flex:1;min-height:0}.wov3-summaryitem{min-width:0;display:flex;flex-direction:column;justify-content:center;padding:15px 18px;border-radius:14px;background:#f8fbff;border:1px solid #e7edf5}.wov3-summaryitem span{font-size:9px;color:#7c899b}.wov3-summaryitem strong{display:block;margin-top:6px;font:600 25px Georgia,serif;color:#183b65;white-space:nowrap}.wov3-summaryitem small{display:block;margin-top:5px;font-size:8px;color:#7c8997;line-height:1.35}
 .wov3-trend{margin-top:16px;padding:20px 22px 14px;overflow:hidden}.wov3-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:6px}.wov3-head h3{margin:0;font-size:17px}.wov3-head span{font-size:9px;color:#7f8b9b;white-space:nowrap}.wov3-chartwrap{height:220px;width:100%;overflow:hidden}.wov3-chart{display:block;width:100%;height:100%}.wov3-grid line{stroke:#e4ebf4;stroke-width:1}.wov3-area{fill:url(#wov3Area)}.wov3-line{fill:none;stroke:url(#wov3Line);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}.wov3-chart text{font-size:9px;font-weight:650;fill:#78879a}.wov3-empty{height:200px;display:grid;place-items:center;color:#8290a2;font-size:10px}
 .wov3-bottom{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:16px}.wov3-mini{padding:18px 20px;min-height:120px}.wov3-mini span{display:block;font-size:8px;font-weight:850;letter-spacing:.09em;text-transform:uppercase;color:#8490a1}.wov3-mini strong{display:block;margin-top:8px;font:600 23px Georgia,serif;color:#14233c}.wov3-mini p{margin:7px 0 0;font-size:9px;line-height:1.45;color:#8190a3}
 @media(max-width:1180px){.wov3-top{grid-template-columns:minmax(0,1fr) minmax(300px,.72fr)}.wov3-pill{min-width:140px}.wov3-core{width:220px;height:220px}.wov3-core strong{font-size:70px}}
 @media(max-width:980px){.wov3-top{grid-template-columns:1fr}.wov3-bottom{grid-template-columns:1fr}.wov3-summary{min-height:320px}}
 @media(max-width:820px){body[data-client="wirello"] .main{width:100vw!important;max-width:100vw!important}.wov3-blis{min-height:430px}.wov3-summarygrid{grid-template-columns:1fr}.wov3-head{align-items:flex-start;flex-direction:column}.wov3-head span{white-space:normal}}
 `;document.head.appendChild(s);
}

let rendering=false;
function renderOverview(){
 if(!isWirello()||rendering)return;
 const page=document.getElementById('overview');if(!page)return;
 let root=document.getElementById('n15Overview');
 if(!root){root=document.createElement('div');root.id='n15Overview';root.className='n15';page.appendChild(root)}
 const rows=hist(),bl=index('blis',78.1),rep=index('reputation',79.6),cov=Math.round(N(data().q?.coverage)??96),comp=(Array.isArray(data().d?.competitors)?data().d.competitors.length:0)||5,signals=N(data().d?.signal_count??data().d?.signals_count)??37,att=N(data().d?.attitude_measurements)??96,last=latest(),srcCount=data().s.length||24,delta=rows.length>1?rows.at(-1).v-rows[0].v:6.9,first=rows[0]?.t,lastT=last.t;
 const signature=[bl,rep,cov,comp,signals,att,rows.length,lastT].join('|');
 if(root.dataset.wov3===signature&&root.querySelector('#wirelloOverviewV3'))return;
 rendering=true;
 try{
  root.dataset.wov3=signature;
  root.innerHTML=`<div id="wirelloOverviewV3" class="wov3"><div class="wov3-top"><section class="wov3-card wov3-blis"><div class="wov3-pill wov3-p1"><span>Мониторинг</span><b>${srcCount} източника</b></div><div class="wov3-pill wov3-p2"><span>Сигнали</span><b>${fmt(signals)} сигнала</b></div><div class="wov3-core"><span>BLIS ИНДЕКС</span><strong>${fmt(bl)}<small>/100</small></strong><em>${bl>=80?'Много силна позиция':bl>=65?'Стабилна позиция':bl>=50?'Смесена картина':'Изисква внимание'}</em></div><div class="wov3-pill wov3-p3"><span>Репутация</span><b>${fmt(rep)}/100</b></div><div class="wov3-pill wov3-p4"><span>Нагласи</span><b>${fmt(att)} измервания</b></div></section><section class="wov3-card wov3-summary"><span class="wov3-k">СЪСТОЯНИЕ ЗА ПЕРИОДА</span><h3>Ключови данни</h3><div class="wov3-summarygrid"><div class="wov3-summaryitem"><span>Последна актуализация</span><strong>${lastT?new Date(lastT).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit',second:'2-digit'}):'LIVE'}</strong><small>${E(last.label)}</small></div><div class="wov3-summaryitem"><span>Покритие</span><strong>${cov}%</strong><small>активен наблюдаван набор</small></div><div class="wov3-summaryitem"><span>Сигнали</span><strong>${fmt(signals)}</strong><small>за текущия период</small></div><div class="wov3-summaryitem"><span>Конкуренти</span><strong>${comp}</strong><small>сравними профила</small></div></div></section></div><section class="wov3-card wov3-trend"><div class="wov3-head"><h3>BLIS динамика${first?' от '+E(fullDate(first)):''}</h3><span>${rows.length||180} дневни измервания</span></div><div class="wov3-chartwrap">${chart(rows)}</div></section><div class="wov3-bottom"><section class="wov3-card wov3-mini"><span>Какво се промени</span><strong>${delta>=0?'+':''}${fmt(delta)} т.</strong><p>${rows.length>1?`Между ${E(fullDate(rows[0].t))} и ${E(fullDate(rows.at(-1).t))}`:'Историческа база'}</p></section><section class="wov3-card wov3-mini"><span>Покритие на наблюдението</span><strong>100%</strong><p>${srcCount} от ${srcCount} конфигурирани източника участват в демонстрационния набор.</p></section><section class="wov3-card wov3-mini"><span>Последен потвърден сигнал</span><strong>${E(last.label)}</strong><p>${lastT?'актуализирано '+new Date(lastT).toLocaleDateString('bg-BG'):'активно наблюдение'}</p></section></div></div>`;
 }finally{rendering=false}
}
function cleanCharts(){
 if(!isWirello())return;
 document.querySelectorAll('.n15-smoothchart .n15-chartdot,.wirello-stable-curve .blis-curve-point').forEach(x=>x.remove());
}
function ensure(){if(!isWirello())return;installStyle();fixNav();renderOverview();cleanCharts()}
function schedule(){[0,40,120,260,600,1200].forEach(ms=>setTimeout(ensure,ms))}
function init(){if(!isWirello())return;ensure();const ov=document.getElementById('overview');if(ov)new MutationObserver(()=>{if(!rendering)requestAnimationFrame(ensure)}).observe(ov,{subtree:true,childList:true});const nav=document.getElementById('nav');if(nav)new MutationObserver(()=>requestAnimationFrame(fixNav)).observe(nav,{subtree:true,childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.addEventListener('blis:clientdata',schedule);window.addEventListener('resize',schedule);window.addEventListener('popstate',schedule);window.addEventListener('hashchange',schedule);document.addEventListener('click',e=>{if(e.target?.closest?.('#nav button[data-page]'))schedule()},true);
})();
