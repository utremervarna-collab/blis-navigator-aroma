/* BLIS Navigator 3.0 — visual owner stability v2.
   Keeps the simplified five-page experience visually complete even when a legacy visual owner
   finishes later than the route transition. No synthetic business metrics are introduced. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_STABILITY_V1)return;
window.__BLIS_NAVIGATOR_3_STABILITY_V1=true;

const A=v=>Array.isArray(v)?v:[];
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const signalRows=()=>{try{const x=window.BLISIntelligenceStreamV3?.getUsefulSignals?.();if(Array.isArray(x))return x.filter(Boolean)}catch(_){}return A(window.D?.signals).filter(Boolean)};
const text=s=>String(s?.title||s?.text||s?.description||s?.detail||'Значим сигнал').trim();
const utility=s=>{let n=Number(s?.utility);if(!Number.isFinite(n))try{n=Number(window.BLISIntelligenceStreamV3?.utilityScore?.(s))}catch(_){}return Number.isFinite(n)?Math.max(0,Math.min(100,n)):45};
const kind=s=>{if(s?.kind)return String(s.kind).toLowerCase();if(s?.sentiment==='negative'||['critical','high'].includes(s?.severity))return'риск';if(s?.sentiment==='positive')return'възможност';if(s?.scope==='competitor'||s?.topic==='competition')return'конкурент';return'наблюдение'};
function chromeCss(){if(document.getElementById('navigator3BulgarianChromeCss'))return;const s=document.createElement('style');s.id='navigator3BulgarianChromeCss';s.textContent='.bch3-lang{display:none!important}.brandsub{white-space:normal}';document.head.appendChild(s)}
function enforceBulgarianChrome(){chromeCss();document.documentElement.lang='bg';window.BLIS_LANGUAGE='bg';document.documentElement.dataset.navigatorLanguage='bg-only';document.querySelectorAll('.bch3-lang').forEach(x=>x.remove());const sub=document.querySelector('.brandsub');if(sub)sub.textContent='Система за бизнес анализ и наблюдение';const live=document.querySelector('.blis-system-primary b');if(live&&/^BLIS\s+LIVE$/i.test(live.textContent.trim()))live.textContent='BLIS АКТУАЛНО'}
function hash(s){let h=2166136261>>>0;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function blips(){return signalRows().slice(0,14).map((s,i)=>{const h=hash(text(s)+'|'+i),a=(h%360)*Math.PI/180,r=.18+((h>>>8)%58)/100*.66,x=50+Math.cos(a)*r*39,y=50+Math.sin(a)*r*39,sz=8+utility(s)*.09,k=kind(s),cls=k==='риск'?'risk':k==='възможност'?'good':k==='конкурент'?'comp':'info';return`<button type="button" class="n3-live-blip ${cls}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px" title="${E(text(s))}" aria-label="${E(text(s))}"></button>`}).join('')}
function radarFallback(){const shell=document.querySelector('#social [data-n3-radar-shell]');if(!shell||shell.querySelector('.dv-radar-wrap'))return;const box=document.createElement('div');box.className='dv-radar-wrap';box.setAttribute('data-digital-radar','1');box.setAttribute('data-blis-visual','signals-observation');box.innerHTML=`<div class="dv-radar-glow"></div><div class="dv-radar-grid"><div class="dv-sweep"></div>${blips()}<span class="dv-radar-core"></span></div>`;shell.prepend(box)}
function ensureOverview(){if(document.querySelector('#overview .vs-gauge-card,#overview .vs-gauge-svg'))return;try{window.BLISVisualSuiteV1?.render?.('overview')}catch(e){console.warn('Navigator 3 overview visual recovery',e)}}
function ensureSocial(){if(!document.querySelector('#social.page.active'))return;try{if(!document.querySelector('#social [data-n3-radar-shell] .dv-radar-wrap'))window.BLISDigitalRadar?.render?.()}catch(e){console.warn('Navigator 3 radar recovery',e)}radarFallback()}
function ensureMarket(){if(!document.querySelector('#market.page.active'))return;if(document.querySelector('#market .pm-stage,#market .pm-canvas'))return;try{window.BLISPerceptionMap?.render?.()}catch(e){console.warn('Navigator 3 market visual recovery',e)}setTimeout(()=>{try{window.BLISMarketSystemV1?.mount?.()}catch(_){}},35)}
function ensureCompetition(){if(!document.querySelector('#competition.page.active')||document.querySelector('#competition .vs-comp-axis'))return;try{window.BLISVisualSuiteV1?.render?.('competition')}catch(e){console.warn('Navigator 3 competition visual recovery',e)}}
function ensureHistory(){if(!document.querySelector('#history.page.active')||document.querySelector('#history .n3-dev-chart'))return;try{window.BLISNavigator3ArchitectureV1?.render?.()}catch(e){console.warn('Navigator 3 development visual recovery',e)}}
function ensure(id){enforceBulgarianChrome();if(id==='overview')ensureOverview();else if(id==='social')ensureSocial();else if(id==='market')ensureMarket();else if(id==='competition')ensureCompetition();else if(id==='history')ensureHistory();document.documentElement.dataset.navigatorVisualStability='v2'}
function active(){return document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview'}
function schedule(id=active()){ensure(id);setTimeout(()=>ensure(id),70);setTimeout(()=>ensure(id),220);setTimeout(()=>ensure(id),520)}
window.addEventListener('blis:routechange',e=>schedule(e.detail?.page||active()));
window.addEventListener('blis:clientdata',()=>schedule(active()));
window.addEventListener('blis:intelligence',()=>schedule(active()));
const mo=new MutationObserver(()=>{if(document.querySelector('.bch3-lang'))enforceBulgarianChrome()});
function boot(){enforceBulgarianChrome();mo.observe(document.querySelector('.topbar')||document.body,{childList:true,subtree:true});schedule(active())}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BLISNavigator3StabilityV1={ensure,schedule,enforceBulgarianChrome};
})();
