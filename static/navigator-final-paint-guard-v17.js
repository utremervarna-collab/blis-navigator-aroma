/* BLIS Navigator — final paint guard V17. Prevents legacy flashes and blank competition state. */
(function(){
'use strict';
if(window.__BLISPaintGuardV17)return;window.__BLISPaintGuardV17=true;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function css(){if($('#blisPaintGuardV17CSS'))return;const s=document.createElement('style');s.id='blisPaintGuardV17CSS';s.textContent=`
#reputationBody:not(.blis-v17-ready),#marketBody:not(.blis-v17-ready),#competitionBody:not(.blis-v17-ready){visibility:hidden!important;opacity:0!important}
#reputationBody.blis-v17-ready,#marketBody.blis-v17-ready,#competitionBody.blis-v17-ready{visibility:visible!important;opacity:1!important;transition:opacity .12s ease!important}

/* Competition — period signals with a static 3D flow visual. */
#competition #competitionBody .cmp-static-signals{padding-bottom:18px!important}
#competition #competitionBody .cmp-static-signals>h3{font-size:0!important;margin-bottom:12px!important;color:#18362f!important}
#competition #competitionBody .cmp-static-signals>h3:after{content:'Сигнали за периода';font-size:17px!important;line-height:1.2!important;letter-spacing:-.015em!important;color:#18362f!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowmetrics{gap:10px!important;margin:8px 0 12px!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowmetric{padding:13px 14px!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowmetric span{font-size:10px!important;line-height:1.35!important;margin-bottom:5px!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowmetric b{font-size:19px!important;line-height:1.15!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowbox{display:block!important;height:128px!important;margin:4px 0 0!important;padding:0!important;border:1px solid #dfe9e5!important;border-radius:16px!important;background:#f8fbfa url('/competition-signals-flow.svg?v=20260822') center center/cover no-repeat!important;overflow:hidden!important;box-shadow:0 8px 24px rgba(22,74,89,.06)!important}
#competition #competitionBody .cmp-static-signals .cmpv11-flowwave,
#competition #competitionBody .cmp-static-signals .blis-flow-river,
#competition #competitionBody .cmp-static-signals .cmpv11-wave-base,
#competition #competitionBody .cmp-static-signals .cmpv11-wave-live,
#competition #competitionBody .cmp-static-signals .cmpv11-wave-dot,
#competition #competitionBody .cmp-static-signals .v16-flow,
#competition #competitionBody .cmp-static-signals .cmpv11-flowempty,
#competition #competitionBody .cmp-static-signals .v16-empty{display:none!important;animation:none!important}

/* Competition — Environment Dynamics: readable, stable, never squeezed. */
#competition #competitionBody .cmpv10-layout>section.cmpv10-card{padding:22px!important;overflow:hidden!important;min-width:0!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head{margin-bottom:14px!important;align-items:flex-start!important;gap:14px!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head h3{font-size:24px!important;line-height:1.12!important;letter-spacing:-.025em!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head p{font-size:13px!important;line-height:1.42!important;margin-top:5px!important;max-width:520px!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-period{font-size:11px!important;line-height:1.3!important;white-space:nowrap!important;padding-top:4px!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small){grid-template-columns:220px minmax(250px,1fr) 110px!important;gap:16px!important;padding:16px 0 7px!important;align-items:center!important;min-width:0!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-label{min-width:0!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-label b{font-size:15px!important;line-height:1.3!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-label small{font-size:11px!important;line-height:1.48!important;margin-top:5px!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-viz{height:176px!important;min-width:250px!important;overflow:hidden!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-viz svg{width:100%!important;height:100%!important;display:block!important;overflow:hidden!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-current{min-width:0!important;text-align:right!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-current b{font-size:27px!important;line-height:1.08!important;white-space:nowrap!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-current small{font-size:10px!important;line-height:1.35!important}
#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-note{font-size:10.5px!important;line-height:1.5!important;margin-top:13px!important;padding-top:11px!important}
#competition #competitionBody .cmpv10-layout>section .cmpv11-active-trace,
#competition #competitionBody .cmpv10-layout>section .cmpv11-active-dot{display:none!important;animation:none!important}
@media(max-width:1350px){#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small){grid-template-columns:190px minmax(220px,1fr) 96px!important;gap:13px!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head h3{font-size:22px!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head p{font-size:12px!important}}
@media(max-width:1050px){#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small){grid-template-columns:1fr!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-series:not(.small) .cmpv10-viz{min-width:0!important;height:150px!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-current{text-align:left!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-head{display:block!important}#competition #competitionBody .cmpv10-layout>section.cmpv10-card .cmpv10-period{display:block!important;margin-top:8px!important}}
`;document.head.appendChild(s)}
function menuNames(){const n=$('#nav [data-page="social"] .navtxt'),v=$('#nav [data-page="digital"] .navtxt');if(n&&n.textContent!=='Сигнали')n.textContent='Сигнали';if(v&&v.textContent!=='Видимост')v.textContent='Видимост'}
function copy(){menuNames();const active=$('.page.active')?.id;if(active==='social'){const root=$('#social .n15');if(root){const k=$('.n15-title .n15-k',root),h=$('.n15-title h2',root),p=$('.n15-title p',root),dirs=$$('.n15-dir strong',root);if(k)k.textContent='DIGITAL INTELLIGENCE';if(h)h.textContent='Digital Intelligence';if(p)p.textContent='Проверими сигнали от марката и за марката в наблюдаваната дигитална среда.';if(dirs[0])dirs[0].textContent='Сигнали от марката';if(dirs[1])dirs[1].textContent='Сигнали за марката'}const a=$('#blisActiveModule'),d=$('#blisSystemDetail');if(a)a.textContent='Digital Intelligence';if(d)d.textContent='Сигнали от марката и за марката в наблюдаваната дигитална среда.'}$$('#overview .n15-statpill span').forEach(x=>{if((x.textContent||'').trim()==='Сигнали')x.textContent='Digital Intelligence'})}
function rep(){const r=$('#reputationBody');if(!r)return;const exact=$('.rp-exact-art[data-loaded="1"]',r);if(exact)r.classList.add('blis-v17-ready')}
function market(){const r=$('#marketBody');if(!r)return;const final=$('.pm-main',r),hist=$('#n15AttHistory',r);if(final&&hist&&(hist.querySelector('.v16-chart,.v16-empty,.v16-one')))r.classList.add('blis-v17-ready')}
function competition(){const r=$('#competitionBody');if(!r)return;const race=$('.cmpv5',r),layout=$('.cmpv10-layout',r),metrics=$('.cmpv11-flowmetrics',r),panel=metrics?.closest('.cmpv5-panel');if(panel)panel.classList.add('cmp-static-signals');if(race&&layout&&(metrics||$('.cmpv11-flowbox',r))){r.classList.add('blis-v17-ready');document.body.classList.add('blis-competition-ready');r.style.removeProperty('visibility')}}
function tick(){copy();rep();market();competition()}
function start(){css();tick();const nav=$('#nav');if(nav&&!window.__BLISMenuNameObserver){window.__BLISMenuNameObserver=new MutationObserver(menuNames);window.__BLISMenuNameObserver.observe(nav,{subtree:true,childList:true,characterData:true})}setInterval(tick,120);document.addEventListener('click',e=>{const b=e.target.closest?.('#nav [data-page]');if(!b)return;const id=b.dataset.page;if(id==='reputation')$('#reputationBody')?.classList.remove('blis-v17-ready');if(id==='market')$('#marketBody')?.classList.remove('blis-v17-ready');if(id==='competition')$('#competitionBody')?.classList.remove('blis-v17-ready')},true);window.addEventListener('blis:clientdata',()=>{['reputationBody','marketBody','competitionBody'].forEach(id=>document.getElementById(id)?.classList.remove('blis-v17-ready'));setTimeout(tick,40)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();