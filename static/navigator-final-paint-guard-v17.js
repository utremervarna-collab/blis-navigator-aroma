/* BLIS Navigator — final paint guard V17. Prevents legacy flashes and blank competition state. */
(function(){
'use strict';
if(window.__BLISPaintGuardV17)return;window.__BLISPaintGuardV17=true;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function css(){if($('#blisPaintGuardV17CSS'))return;const s=document.createElement('style');s.id='blisPaintGuardV17CSS';s.textContent=`
#reputationBody:not(.blis-v17-ready),#marketBody:not(.blis-v17-ready),#competitionBody:not(.blis-v17-ready){visibility:hidden!important;opacity:0!important}
#reputationBody.blis-v17-ready,#marketBody.blis-v17-ready,#competitionBody.blis-v17-ready{visibility:visible!important;opacity:1!important;transition:opacity .12s ease!important}

/* Competition — stable signals summary with a simple static visual. */
#competition #competitionBody .cmp-static-signals{padding-bottom:18px!important}
#competition #competitionBody .cmp-static-signals>h3{font-size:0!important;margin-bottom:12px!important;color:#18362f!important}
#competition #competitionBody .cmp-static-signals>h3:after{content:'Сигнали за периода';font-size:17px!important;line-height:1.2!important;letter-spacing:-.015em!important;color:#18362f!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowmetrics{gap:10px!important;margin:8px 0 12px!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowmetric{padding:13px 14px!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowmetric span{font-size:10px!important;line-height:1.35!important;margin-bottom:5px!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowmetric b{font-size:19px!important;line-height:1.15!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowbox{display:block!important;height:108px!important;margin:4px 0 0!important;padding:13px 12px!important;border:1px solid #dfe9e5!important;border-radius:13px!important;background:linear-gradient(180deg,#fbfefd,#f4faf7)!important;overflow:hidden!important;box-shadow:inset 0 0 22px rgba(22,163,106,.035)!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowwave,
#competition #competitionBody .cmp-static-signals .blis-flow-river{display:block!important;width:100%!important;height:100%!important;overflow:visible!important}
#competition #competitionBody .cmp-static-signals .cmpv11-wave-base{stroke:#c5d9d2!important;stroke-width:7!important;opacity:.42!important}
#competition #competitionBody .cmp-static-signals .cmpv11-wave-live{stroke:#16a36a!important;stroke-width:4!important;stroke-dasharray:none!important;opacity:.82!important;animation:none!important;filter:none!important}
#competition #competitionBody .cmp-static-signals .v16-flow .base{stroke:#c5d9d2!important;stroke-width:7!important;opacity:.34!important}
#competition #competitionBody .cmp-static-signals .v16-flow .live{stroke:#16a36a!important;stroke-width:4!important;stroke-dasharray:none!important;opacity:.82!important;animation:none!important;filter:none!important}
#competition #competitionBody .cmp-static-signals .cmpv11-wave-dot,
#competition #competitionBody .cmp-static-signals .v16-flow circle{display:none!important;animation:none!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowempty,
#competition #competitionBody .cmp-static-signals .v16-empty{font-size:11px!important;color:#7e8f88!important}

/* Competition — Environment Dynamics: 2x readable typography and stable chart. */
#competition #competitionBody .cmpv10-layout>section.cmpv10-card{padding:30px!important;overflow:visible!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head{margin-bottom:20px!important;align-items:flex-start!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head h3{font-size:40px!important;line-height:1.08!important;letter-spacing:-.035em!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head p{font-size:22px!important;line-height:1.4!important;margin-top:9px!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-period{font-size:20px!important;line-height:1.3!important;padding-top:6px!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small){grid-template-columns:300px minmax(0,1fr) 150px!important;gap:24px!important;padding:24px 0 10px!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-label b{font-size:26px!important;line-height:1.25!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-label small{font-size:20px!important;line-height:1.45!important;margin-top:9px!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-viz{height:220px!important;min-height:220px!important;overflow:visible!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-viz svg{overflow:visible!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-current b{font-size:46px!important;line-height:1.05!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-current small{font-size:19px!important;line-height:1.35!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-note{font-size:19px!important;line-height:1.5!important;margin-top:20px!important;padding-top:18px!important}
#competition #competitionBody .cmpv10-layout>section .cmpv11-active-trace,
#competition #competitionBody .cmpv10-layout>section .cmpv11-active-dot{display:none!important;animation:none!important}
#competition #competitionBody .cmpv17-single-point{position:relative!important;border-radius:12px!important;background:linear-gradient(180deg,#fbfdff,#f7faff)!important}
#competition #competitionBody .cmpv17-single-point svg{width:100%!important;height:100%!important;display:block!important}
#competition #competitionBody .cmpv17-no-history{height:220px;display:grid;place-items:center;text-align:center;font-size:18px;line-height:1.45;color:#8190a5}
@media(max-width:1200px){#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small){grid-template-columns:240px minmax(0,1fr) 120px!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head h3{font-size:34px!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head p{font-size:18px!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-period{font-size:17px!important}}
@media(max-width:700px){#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small){grid-template-columns:1fr!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head{display:block!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head h3{font-size:30px!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head p{font-size:17px!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-period{font-size:16px!important;display:block!important;margin-top:10px!important}}
`;document.head.appendChild(s)}
function menuNames(){const n=$('#nav [data-page="social"] .navtxt'),v=$('#nav [data-page="digital"] .navtxt');if(n&&n.textContent!=='Сигнали')n.textContent='Сигнали';if(v&&v.textContent!=='Видимост')v.textContent='Видимост'}
function copy(){menuNames();const active=$('.page.active')?.id;if(active==='social'){const root=$('#social .n15');if(root){const k=$('.n15-title .n15-k',root),h=$('.n15-title h2',root),p=$('.n15-title p',root),dirs=$$('.n15-dir strong',root);if(k)k.textContent='DIGITAL INTELLIGENCE';if(h)h.textContent='Digital Intelligence';if(p)p.textContent='Проверими сигнали от марката и за марката в наблюдаваната дигитална среда.';if(dirs[0])dirs[0].textContent='Сигнали от марката';if(dirs[1])dirs[1].textContent='Сигнали за марката'}const a=$('#blisActiveModule'),d=$('#blisSystemDetail');if(a)a.textContent='Digital Intelligence';if(d)d.textContent='Сигнали от марката и за марката в наблюдаваната дигитална среда.'}$$('#overview .n15-statpill span').forEach(x=>{if((x.textContent||'').trim()==='Сигнали')x.textContent='Digital Intelligence'})}
function rep(){const r=$('#reputationBody');if(!r)return;const exact=$('.rp-exact-art[data-loaded="1"]',r);if(exact)r.classList.add('blis-v17-ready')}
function market(){const r=$('#marketBody');if(!r)return;const final=$('.pm-main',r),hist=$('#n15AttHistory',r);if(final&&hist&&(hist.querySelector('.v16-chart,.v16-empty,.v16-one')))r.classList.add('blis-v17-ready')}
function repairDynamics(r){const series=$('.cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small)',r);const viz=series?$('.cmpv10-viz',series):null;if(!viz)return;const svg=$('svg',viz);const paths=svg?[...svg.querySelectorAll('path')].filter(p=>!p.classList.contains('cmpv11-active-trace')):[];const base=paths.find(p=>(p.getAttribute('stroke')||'').toLowerCase()==='#2468e7')||paths[0];const d=(base?.getAttribute('d')||'').trim();const drawable=d.length>8&&/[MLC]/.test(d);if(drawable){viz.classList.remove('cmpv17-single-point');return}const current=($('.cmpv10-current b',series)?.textContent||'').trim();if(!current||current==='—'){if(!viz.querySelector('.cmpv17-no-history'))viz.innerHTML='<div class="cmpv17-no-history">Няма достатъчно сравнителна история за диаграма.</div>';return}viz.classList.add('cmpv17-single-point');viz.innerHTML='<svg viewBox="0 0 760 220" preserveAspectRatio="none" aria-label="Едно реално измерване"><defs><linearGradient id="cmpv17single" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dbe7fb"/><stop offset=".5" stop-color="#9fbeeF"/><stop offset="1" stop-color="#dbe7fb"/></linearGradient></defs><line x1="24" y1="110" x2="736" y2="110" stroke="url(#cmpv17single)" stroke-width="5" stroke-linecap="round"/><line x1="380" y1="62" x2="380" y2="158" stroke="#d8e3f6" stroke-width="2" stroke-dasharray="5 8"/><circle cx="380" cy="110" r="12" fill="#2468e7" stroke="#fff" stroke-width="5"/><circle cx="380" cy="110" r="21" fill="none" stroke="#2468e7" stroke-width="2" opacity=".16"/></svg>'}
function competition(){const r=$('#competitionBody');if(!r)return;const race=$('.cmpv5',r),layout=$('.cmpv10-layout',r),metrics=$('.cmpv11-flowmetrics',r),panel=metrics?.closest('.cmpv5-panel');if(panel)panel.classList.add('cmp-static-signals');repairDynamics(r);if(race&&layout&&(metrics||$('.cmpv11-flowbox',r))){r.classList.add('blis-v17-ready');document.body.classList.add('blis-competition-ready');r.style.removeProperty('visibility')}}
function tick(){copy();rep();market();competition()}
function start(){css();tick();const nav=$('#nav');if(nav&&!window.__BLISMenuNameObserver){window.__BLISMenuNameObserver=new MutationObserver(menuNames);window.__BLISMenuNameObserver.observe(nav,{subtree:true,childList:true,characterData:true})}setInterval(tick,120);document.addEventListener('click',e=>{const b=e.target.closest?.('#nav [data-page]');if(!b)return;const id=b.dataset.page;if(id==='reputation')$('#reputationBody')?.classList.remove('blis-v17-ready');if(id==='market')$('#marketBody')?.classList.remove('blis-v17-ready');if(id==='competition')$('#competitionBody')?.classList.remove('blis-v17-ready')},true);window.addEventListener('blis:clientdata',()=>{['reputationBody','marketBody','competitionBody'].forEach(id=>document.getElementById(id)?.classList.remove('blis-v17-ready'));setTimeout(tick,40)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();