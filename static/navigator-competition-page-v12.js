/* BLIS Navigator — Competition Page V12.1. Live signal-flow repair. */
(function(){
'use strict';
let observer=null,scheduled=0;
function css(){
  if(document.getElementById('cmpv12css'))return;
  const st=document.createElement('style');
  st.id='cmpv12css';
  st.textContent=`
/* remove duplicated horizontal comparison navigation */
#competition .cmpv9-bar{display:none!important}
#competition .cmpv5-board{grid-template-columns:minmax(0,1.28fr) minmax(390px,.92fr)!important;gap:16px!important;margin-top:2px!important}
#competition .cmpv11-row{cursor:default!important;pointer-events:none!important}
#competition .cmpv11-row.active{background:transparent!important;color:#526071!important;font-weight:700!important}

/* live signal flow — use the V11 data-driven SVG, never the old static image */
#competition .cmpv12-flow-panel{padding:18px!important;border-color:#dbeae5!important;background:linear-gradient(155deg,#ffffff 0%,#fbfffd 58%,#f3fbf8 100%)!important;box-shadow:0 14px 34px rgba(17,83,65,.07)!important}
#competition .cmpv12-flow-panel>h3{font-size:16px!important;letter-spacing:-.015em!important;color:#18362f!important;margin-bottom:12px!important}
#competition .cmpv11-flowmetrics{gap:10px!important;margin:6px 0 13px!important}
#competition .cmpv11-flowmetric{padding:12px 13px!important;border-color:#dce9e4!important;background:rgba(255,255,255,.88)!important;box-shadow:0 5px 14px rgba(17,83,65,.045)!important}
#competition .cmpv11-flowmetric span{font-size:9px!important;color:#71847e!important;margin-bottom:5px!important}
#competition .cmpv11-flowmetric b{font-size:18px!important;color:#173e34!important}
#competition .cmpv12-flow-panel .cmpv11-flowbox{display:block!important;height:128px!important;margin:4px 0 12px!important;padding:8px 10px!important;overflow:hidden!important;border:1px solid #dfe9e5!important;border-radius:16px!important;background:linear-gradient(180deg,#fbfefd,#f5fbf8)!important;box-shadow:0 8px 24px rgba(22,74,89,.06)!important}
#competition .cmpv12-flow-panel .cmpv11-flowwave{display:block!important;width:100%!important;height:100%!important;overflow:visible!important}
#competition .cmpv12-flow-panel .cmpv11-wave-base{stroke:#d7e8e1!important;stroke-width:3!important}
#competition .cmpv12-flow-panel .cmpv11-wave-live{stroke:#16a36a!important;stroke-width:3.6!important;stroke-dasharray:12 11!important;filter:drop-shadow(0 0 4px rgba(22,163,106,.20));animation:cmpv11dash 2.2s linear infinite!important}
#competition .cmpv12-flow-panel .cmpv11-wave-dot{fill:#16a36a!important;stroke:#fff!important;stroke-width:2!important;filter:drop-shadow(0 0 5px rgba(22,163,106,.38))}
#competition .cmpv12-static-flow{display:none!important}

/* Dynamics: one clear active curve; remove the old secondary mini-series, including the blue flat line */
#competition .cmpv10-layout>section.cmpv10-card .cmpv10-series.small{display:none!important}
#competition .cmpv10-layout>section.cmpv10-card{padding:20px!important}
#competition .cmpv10-layout>section .cmpv10-head h3{font-size:16px!important}
#competition .cmpv10-layout>section .cmpv10-head p{font-size:9px!important}
#competition .cmpv10-layout>section .cmpv10-series:not(.small){grid-template-columns:175px minmax(0,1fr) 92px!important;gap:15px!important;padding:14px 0 4px!important}
#competition .cmpv10-layout>section .cmpv10-series:not(.small) .cmpv10-viz{height:176px!important}
#competition .cmpv10-layout>section .cmpv10-series:not(.small) .cmpv10-label b{font-size:11px!important}
#competition .cmpv10-layout>section .cmpv10-series:not(.small) .cmpv10-label small{font-size:8.5px!important;line-height:1.45!important}
#competition .cmpv10-layout>section .cmpv10-series:not(.small) .cmpv10-current b{font-size:20px!important;color:#205fc9!important}
#competition .cmpv11-active-trace{stroke-width:7!important;stroke-dasharray:7 15!important;opacity:.58!important;filter:drop-shadow(0 0 5px rgba(36,104,231,.32));animation:cmpv12curve 1.25s linear infinite!important}
#competition .cmpv11-active-dot{r:5px;filter:drop-shadow(0 0 6px rgba(36,104,231,.55))}

/* Key signals: major page accent */
#competition .cmpv10-layout{grid-template-columns:minmax(0,1.02fr) minmax(430px,1fr)!important;gap:18px!important;align-items:stretch!important}
#competition .cmpv10-layout>aside.cmpv10-card{min-height:430px!important;padding:26px 27px!important;border:1px solid #cfdbef!important;background:linear-gradient(145deg,#f8fbff 0%,#ffffff 48%,#f5fbff 100%)!important;box-shadow:0 20px 46px rgba(31,80,150,.13)!important;position:relative!important;overflow:hidden!important}
#competition .cmpv10-layout>aside.cmpv10-card:after{content:"";position:absolute;right:-90px;top:-110px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(37,104,232,.10),rgba(37,104,232,0) 68%);pointer-events:none}
#competition .cmpv10-layout>aside .cmpv10-head{position:relative;z-index:1;margin-bottom:10px!important;align-items:center!important}
#competition .cmpv10-layout>aside .cmpv10-head h3{font-size:26px!important;line-height:1.05!important;letter-spacing:-.045em!important;color:#1f5fc4!important}
#competition .cmpv10-layout>aside .cmpv10-head p{font-size:11px!important;color:#72829a!important;margin-top:6px!important}
#competition .cmpv10-layout>aside .cmpv10-kpis{position:relative;z-index:1}
#competition .cmpv10-layout>aside .cmpv10-kpi{grid-template-columns:56px minmax(0,1fr)!important;gap:15px!important;padding:17px 0!important;border-color:#e3eaf4!important}
#competition .cmpv10-layout>aside .cmpv10-ico{width:54px!important;height:54px!important;border-radius:16px!important;font-size:21px!important;background:#eef4ff!important;color:#2568e8!important}
#competition .cmpv10-layout>aside .cmpv10-kpi span:not(.cmpv10-ico){font-size:12px!important;font-weight:720!important;color:#77879b!important;margin-bottom:5px!important}
#competition .cmpv10-layout>aside .cmpv10-kpi b{font-size:23px!important;line-height:1.12!important;font-weight:860!important;letter-spacing:-.025em!important}
#competition .cmpv10-layout>aside .cmpv10-kpi small{font-size:10.5px!important;line-height:1.5!important;color:#8290a3!important;margin-top:5px!important}
#competition .cmpv10-layout>aside .cmpv10-kpi:nth-child(1) b{color:#2568e8!important}
#competition .cmpv10-layout>aside .cmpv10-kpi:nth-child(2) b{color:#129567!important}
#competition .cmpv10-layout>aside .cmpv10-kpi:nth-child(3) b{color:#7b54d7!important}
#competition .cmpv10-layout>aside .cmpv10-kpi:nth-child(4) b{color:#db7a22!important}
#competition .cmpv10-layout>aside .cmpv10-kpi:nth-child(5) b{color:#0b8b9f!important}
#competition .cmpv10-layout>aside .cmpv10-kpi:nth-child(2) .cmpv10-ico{background:#edf9f4!important;color:#129567!important}
#competition .cmpv10-layout>aside .cmpv10-kpi:nth-child(3) .cmpv10-ico{background:#f4effd!important;color:#7b54d7!important}
#competition .cmpv10-layout>aside .cmpv10-kpi:nth-child(4) .cmpv10-ico{background:#fff4e9!important;color:#db7a22!important}
#competition .cmpv10-layout>aside .cmpv10-kpi:nth-child(5) .cmpv10-ico{background:#eaf8fa!important;color:#0b8b9f!important}
#competition .cmpv10-layout>aside .cmpv10-badge{height:30px!important;padding:0 12px!important;border:1px solid #9edbc4!important;border-radius:999px!important;background:#ecfbf4!important;color:#08764d!important;font-size:11px!important;font-weight:900!important;letter-spacing:.06em!important;display:inline-flex!important;align-items:center!important;gap:7px!important;animation:cmpv12live 1.35s ease-out infinite!important}
#competition .cmpv10-layout>aside .cmpv10-badge:before{content:"";width:8px;height:8px;border-radius:50%;background:#16a36a;box-shadow:0 0 0 0 rgba(22,163,106,.48);animation:cmpv12dotpulse 1.35s ease-out infinite}

/* hard cleanup of legacy chart remnants after the V10 layout */
#competition .cmpv5-chart.cmpv10-host>.cmpv10-layout~*,
#competition .cmpv5-chart.cmpv10-host>svg,
#competition .cmpv5-chart.cmpv10-host>.cmpv5-legend,
#competition .cmpv5-chart.cmpv10-host>.cmpv5-charthead,
#competition .cmpv5-chart.cmpv10-host>.cmpv9-chart-empty{display:none!important}

@keyframes cmpv12curve{to{stroke-dashoffset:-66}}
@keyframes cmpv12live{0%{box-shadow:0 0 0 0 rgba(22,163,106,.34)}70%{box-shadow:0 0 0 12px rgba(22,163,106,0)}100%{box-shadow:0 0 0 0 rgba(22,163,106,0)}}
@keyframes cmpv12dotpulse{0%{box-shadow:0 0 0 0 rgba(22,163,106,.50)}70%{box-shadow:0 0 0 8px rgba(22,163,106,0)}100%{box-shadow:0 0 0 0 rgba(22,163,106,0)}}
@media(max-width:1100px){#competition .cmpv5-board,#competition .cmpv10-layout{grid-template-columns:1fr!important}#competition .cmpv10-layout>aside.cmpv10-card{min-height:0!important}}
@media(max-width:700px){#competition .cmpv11-flowmetrics{grid-template-columns:1fr!important}#competition .cmpv12-flow-panel .cmpv11-flowbox{height:112px!important}#competition .cmpv10-layout>aside .cmpv10-kpi b{font-size:19px!important}#competition .cmpv10-layout>section .cmpv10-series:not(.small){grid-template-columns:1fr!important}}
`;
  document.head.appendChild(st);
}
function restoreLiveFlow(panel){
  if(!panel)return;
  panel.querySelectorAll('.cmpv12-static-flow').forEach(x=>x.remove());
  const live=panel.querySelector('.cmpv11-flowbox');
  if(live){
    live.style.removeProperty('display');
    live.removeAttribute('aria-hidden');
  }
}
function enhance(){
  css();
  const root=document.querySelector('#competitionBody>.cmpv5');
  if(!root)return;
  root.querySelectorAll('.cmpv9-bar').forEach(x=>x.setAttribute('aria-hidden','true'));
  const panels=[...root.querySelectorAll('.cmpv5-side .cmpv5-panel')];
  panels.forEach(p=>{
    const h=(p.querySelector('h3')?.textContent||'').trim();
    const isFlow=/ПОТОК ОТ СИГНАЛИ/i.test(h);
    p.classList.toggle('cmpv12-flow-panel',isFlow);
    if(isFlow)restoreLiveFlow(p);
  });
  const host=root.querySelector('.cmpv5-chart.cmpv10-host');
  if(host){
    [...host.children].forEach(ch=>{if(ch.classList?.contains('cmpv10-layout'))return;if(ch.matches?.('svg,.cmpv5-legend,.cmpv5-charthead,.cmpv9-chart-empty'))ch.remove()});
    host.querySelectorAll('.cmpv10-series').forEach(s=>{
      const label=(s.querySelector('.cmpv10-label b')?.textContent||'').trim();
      if(/Активни теми|Активност на сигналите/i.test(label))s.classList.add('small');
    });
  }
}
function schedule(){clearTimeout(scheduled);scheduled=setTimeout(enhance,55)}
function start(){
  css();enhance();
  const host=document.getElementById('competitionBody');
  if(host){observer=new MutationObserver(schedule);observer.observe(host,{childList:true,subtree:true})}
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="competition"],.cmpv5-seg button'))setTimeout(enhance,100)},true);
  window.addEventListener('blis:clientdata',()=>setTimeout(enhance,120));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.BLISCompetitionPageV12={enhance};
})();