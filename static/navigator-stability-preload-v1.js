/* BLIS Navigator — stability compatibility preload v20.
   Event-driven compatibility plus visible five-step analytical flow in Overview. */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV20)return;window.__BLISStabilityPreloadV20=true;
window.BLISStabilityStats={mode:'event-driven',blockedIntervals:0,blockedTimeouts:0,blockedNavRebuilds:0,blockedNavLabelWrites:0,blockedMarketTextWrites:0,blockedCompetitionTimeouts:0,navRepairs:0,marketRepairs:0};
document.documentElement.dataset.blisStability='event-driven';

const style=document.createElement('style');
style.id='blisOverviewProcessFlowStyle';
style.textContent=`
#overviewPremium .ov-screen{position:relative}
.blis-overview-process{position:relative;overflow:hidden;border:1px solid #1c3550;border-radius:17px;padding:24px 28px 20px;background:radial-gradient(circle at 82% 18%,rgba(42,132,239,.13),transparent 29%),radial-gradient(circle at 12% 92%,rgba(223,156,42,.11),transparent 28%),linear-gradient(135deg,#07111f 0%,#0b1b2d 52%,#071321 100%);box-shadow:0 14px 34px rgba(10,30,55,.13);color:#fff;isolation:isolate}
.blis-overview-process:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(125deg,transparent 0 34px,rgba(72,150,244,.045) 35px,transparent 36px 70px);animation:bopGrid 12s linear infinite;pointer-events:none}
.blis-overview-process .bop-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:22px;position:relative;z-index:2}
.blis-overview-process .bop-kicker{font-size:8px;font-weight:850;letter-spacing:.16em;text-transform:uppercase;color:#dca13a;margin-bottom:5px}
.blis-overview-process h3{margin:0;font:500 22px/1.05 Georgia,serif;color:#f6f9fc}.blis-overview-process h3 em{font-style:normal;color:#dfa23a}
.blis-overview-process .bop-caption{font-size:9px;color:#8fa2b8;max-width:440px;line-height:1.55;text-align:right}
.blis-overview-process .bop-track{display:grid;grid-template-columns:112px 1fr 112px 1fr 112px 1fr 112px 1fr 112px;align-items:start;gap:0;position:relative;z-index:2;min-width:880px}
.blis-overview-process .bop-step{text-align:center;position:relative;transition:opacity .35s ease,transform .35s ease}
.blis-overview-process .bop-circle{width:82px;height:82px;margin:0 auto 12px;border-radius:50%;display:grid;place-items:center;position:relative;border:1px solid rgba(94,124,157,.58);background:radial-gradient(circle,rgba(18,40,64,.96) 0 55%,rgba(5,17,31,.98) 72%);color:#8295aa;box-shadow:inset 0 0 22px rgba(37,109,184,.04);transition:.36s cubic-bezier(.2,.8,.2,1)}
.blis-overview-process .bop-circle:before,.blis-overview-process .bop-circle:after{content:"";position:absolute;border-radius:50%;inset:-7px;border:1px solid transparent;opacity:0;transition:.36s ease}
.blis-overview-process .bop-circle:after{inset:-14px}
.blis-overview-process .bop-num{font:700 22px/1 Georgia,serif}
.blis-overview-process .bop-label{display:block;font-size:12px;font-weight:800;color:#d6e0eb;transition:.36s cubic-bezier(.2,.8,.2,1);transform-origin:center}
.blis-overview-process .bop-desc{display:block;margin-top:5px;font-size:8.2px;line-height:1.4;color:#71859c;transition:.36s ease}
.blis-overview-process .bop-step.done .bop-circle{border-color:rgba(217,151,39,.48);color:#c98e2f}.blis-overview-process .bop-step.done .bop-label{color:#c9d5e1}
.blis-overview-process .bop-step.active{transform:translateY(-3px)}
.blis-overview-process .bop-step.active .bop-circle{transform:scale(1.12);color:#f3bd5f;border-color:#edb34f;background:radial-gradient(circle,rgba(102,68,14,.40),rgba(6,19,34,.98) 67%);box-shadow:0 0 22px rgba(232,166,58,.48),0 0 48px rgba(45,141,244,.22),inset 0 0 24px rgba(228,164,55,.12)}
.blis-overview-process .bop-step.active .bop-circle:before{opacity:1;border-color:rgba(238,181,84,.62);box-shadow:0 0 22px rgba(232,166,58,.26);animation:bopHalo 1.25s ease-in-out infinite}
.blis-overview-process .bop-step.active .bop-circle:after{opacity:.7;border-color:rgba(55,153,255,.34);animation:bopHalo 1.25s .16s ease-in-out infinite}
.blis-overview-process .bop-step.active .bop-label{transform:scale(1.13);color:#fff;text-shadow:0 0 16px rgba(233,169,61,.33)}
.blis-overview-process .bop-step.active .bop-desc{color:#aebdcb}
.blis-overview-process .bop-connector{height:82px;position:relative}
.blis-overview-process .bop-connector:before{content:"";position:absolute;left:-10px;right:-10px;top:40px;height:2px;background:linear-gradient(90deg,rgba(88,116,147,.28),rgba(61,143,232,.25));box-shadow:0 0 0 rgba(0,0,0,0)}
.blis-overview-process .bop-connector.done:before{background:linear-gradient(90deg,rgba(224,158,45,.72),rgba(224,158,45,.46));box-shadow:0 0 10px rgba(224,158,45,.10)}
.blis-overview-process .bop-connector.flowing:before{background:linear-gradient(90deg,rgba(230,167,59,.95),rgba(62,158,255,.64));box-shadow:0 0 13px rgba(78,162,255,.18)}
.blis-overview-process .bop-pulse{position:absolute;top:32px;left:-10px;width:17px;height:17px;border-radius:50%;opacity:0;background:#ffd073;box-shadow:0 0 12px 5px rgba(241,183,73,.58),0 0 28px 10px rgba(58,151,250,.20);z-index:3}
.blis-overview-process .bop-pulse:after{content:"";position:absolute;right:8px;top:7px;width:42px;height:3px;background:linear-gradient(90deg,transparent,#ffd073);filter:blur(.2px)}
.blis-overview-process .bop-connector.flowing .bop-pulse{opacity:1;animation:bopTravel .95s cubic-bezier(.2,.72,.25,1) forwards}
.blis-overview-process .bop-footer{display:flex;align-items:center;justify-content:center;gap:9px;margin-top:16px;font-size:8px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#6f879f;position:relative;z-index:2}.blis-overview-process .bop-footer i{width:5px;height:5px;border-radius:50%;background:#3a9cf5;box-shadow:0 0 10px rgba(58,156,245,.72);animation:bopStatus 1.7s ease-in-out infinite}
@keyframes bopTravel{0%{left:-10px;transform:scale(.72);opacity:0}12%{opacity:1}82%{opacity:1}100%{left:calc(100% - 6px);transform:scale(1.1);opacity:0}}
@keyframes bopHalo{0%,100%{transform:scale(.96);opacity:.40}50%{transform:scale(1.08);opacity:1}}
@keyframes bopStatus{0%,100%{opacity:.35;transform:scale(.82)}50%{opacity:1;transform:scale(1.18)}}
@keyframes bopGrid{from{transform:translateX(-16px)}to{transform:translateX(16px)}}
.blis-overview-process .bop-viewport{overflow-x:auto;overflow-y:hidden;scrollbar-width:none}.blis-overview-process .bop-viewport::-webkit-scrollbar{display:none}
@media(max-width:900px){.blis-overview-process{padding:20px 18px 18px}.blis-overview-process .bop-head{align-items:flex-start;flex-direction:column}.blis-overview-process .bop-caption{text-align:left}.blis-overview-process .bop-track{min-width:820px}}
@media(prefers-reduced-motion:reduce){.blis-overview-process:before,.blis-overview-process .bop-circle:before,.blis-overview-process .bop-circle:after,.blis-overview-process .bop-pulse,.blis-overview-process .bop-footer i{animation:none!important}}
`;
document.head.appendChild(style);

const steps=[
  ['01','Събиране','Публични, медийни и дигитални източници'],
  ['02','Проверка','Достоверност, актуалност и контекст'],
  ['03','Анализ','Тенденции, зависимости и сравнения'],
  ['04','Интерпретация','Какво означават резултатите за клиента'],
  ['05','Препоръки','Рискове, възможности и практически насоки']
];
let flowTimer=null,activeIndex=0;
function buildFlow(){
  const track=[];
  steps.forEach((s,i)=>{
    track.push('<div class="bop-step'+(i===0?' active':'')+'" data-bop-step="'+i+'"><div class="bop-circle"><span class="bop-num">'+s[0]+'</span></div><span class="bop-label">'+s[1]+'</span><span class="bop-desc">'+s[2]+'</span></div>');
    if(i<steps.length-1)track.push('<div class="bop-connector" data-bop-connector="'+i+'"><span class="bop-pulse"></span></div>');
  });
  return '<section class="blis-overview-process"><div class="bop-head"><div><div class="bop-kicker">BLIS ANALYTICAL CYCLE</div><h3>Как работи <em>BLIS™</em></h3></div><div class="bop-caption">Сигналът преминава последователно през петте аналитични стъпки. Активната стъпка се откроява ясно, а импулсът показва движението към следващата.</div></div><div class="bop-viewport"><div class="bop-track">'+track.join('')+'</div></div><div class="bop-footer"><i></i> CONTINUOUS INTELLIGENCE FLOW</div></section>';
}
function mountFlow(){
  const host=document.getElementById('overviewPremium');
  const screen=host&&host.querySelector('.ov-screen');
  if(!screen)return false;
  const old=screen.querySelector(':scope > .blis-overview-hero-motion');if(old)old.remove();
  if(!screen.querySelector(':scope > .blis-overview-process'))screen.insertAdjacentHTML('afterbegin',buildFlow());
  return true;
}
function paintState(index){
  const root=document.querySelector('#overviewPremium .blis-overview-process');if(!root)return;
  root.querySelectorAll('.bop-step').forEach((el,i)=>{el.classList.toggle('active',i===index);el.classList.toggle('done',i<index)});
  root.querySelectorAll('.bop-connector').forEach((el,i)=>{el.classList.remove('flowing');el.classList.toggle('done',i<index)});
}
function runFlow(){
  if(flowTimer)clearTimeout(flowTimer);
  paintState(activeIndex);
  const root=document.querySelector('#overviewPremium .blis-overview-process');if(!root)return;
  const conn=root.querySelector('[data-bop-connector="'+activeIndex+'"]');
  if(activeIndex<steps.length-1&&conn){
    conn.classList.remove('flowing');void conn.offsetWidth;conn.classList.add('flowing');
    flowTimer=setTimeout(function(){activeIndex++;paintState(activeIndex);flowTimer=setTimeout(runFlow,850)},1000);
  }else{
    flowTimer=setTimeout(function(){activeIndex=0;paintState(activeIndex);runFlow()},1200);
  }
}
function schedule(){
  let tries=0;
  const tick=function(){tries++;if(mountFlow()){runFlow();return}if(tries<40)setTimeout(tick,125)};tick();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
const obs=new MutationObserver(function(m){for(const x of m){if(x.target&&((x.target.id==='overviewPremium')||(x.target.closest&&x.target.closest('#overviewPremium')))){requestAnimationFrame(function(){if(mountFlow()&&!flowTimer)runFlow()});break}}});
obs.observe(document.documentElement,{childList:true,subtree:true});
})();
