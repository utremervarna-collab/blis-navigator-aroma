/* BLIS Navigator — client-value guard v1.
   Client-facing pages show decisions, meaningful change, risk/opportunity and
   interpretable comparisons. Raw telemetry and source-health facts remain out
   of the analytical pages. Event-driven only: no polling and no new observer. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_VALUE_GUARD_V1)return;window.__BLIS_CLIENT_VALUE_GUARD_V1=true;

const TECH=/\b(?:visible_reactions_search|recent_public_posts|website_active|profile_active|reachable|direct_booking|review_count|follower_count|followers|term_signal_count|category_count|source_key|metric_key|observed_at|sitemap_[a-z0-9_]+|public_platform_profiles|cmp_[a-z0-9_]+)\b/i;
const RAWKEY=/\b[a-z][a-z0-9]+(?:_[a-z0-9]+){1,}\b/i;
const ABS_AUDIENCE=/(?:linkedin|facebook|instagram|youtube|tiktok).{0,80}(?:аудитория|последовател|абонат).{0,40}\b\d[\d\s.,]*/i;
const AVAILABILITY=/(?:официалният\s+)?сайт(?:ът)?(?:\s+и\s+електронният\s+магазин)?\s+(?:е|са)\s+(?:достъпен|достъпни|активен|активни|наличен|налични|работещ|работещи)/i;
const OUTAGE=/(?:недостъп|прекъс|не\s+работ|грешк|проблем|отказ|спрян|спря|down|error|outage)/i;
const COMPARATIVE=/(?:%|→|↗|↘|спрямо|ръст|спад|увелич|намал|промян|по-вис|по-нис|предход|конкурент|средн|бенчмарк|benchmark|за\s+периода|тенденц)/i;
const DIAGNOSTIC=/(?:исторически\s+наблюдения|качество\s+на\s+доказателствата\s*:\s*\d+\s*\/\s*\d+|концентрация\s+в\s+топ\s+източника|времева\s+покриваемост|snapshots?|измервания\s*\d*|конфигурирани\s+източници|sources_with_data|fresh_sources_48h)/i;
const GENERIC_SOURCE=/^(?:публичен|наблюдаван)\s+източник$/i;
const KEEP_CONTEXT=new Set(['sources','settings','help']);
const SMALL='[data-signal-id],.n3-live-item,.n3-change,.n3b-card,.ov3-change,.ov3-signal,.vs-mini,.vs-side-card,.dv-kpi,.dv-source-card,.metric-intel-row,.metric-row,.change-item,.signal-item,.source-card,.st,.del,.ev,.row,article';

function pageOf(el){return el?.closest?.('.page')?.id||''}
function hide(el,reason){if(!el||el.dataset.blisClientValueHidden==='1')return;el.dataset.blisClientValueHidden='1';el.dataset.blisClientValueReason=reason||'low-value'}
function smallBlock(el){
  let b=el.closest?.(SMALL);if(b&&b.closest('.page'))return b;
  let p=el;for(let i=0;i<3&&p;i++,p=p.parentElement){if(!p.closest?.('.page'))break;const t=(p.innerText||'').trim();if(t.length>0&&t.length<440&&p.children.length<=8)return p}
  return null;
}
function leaf(el){return el&&el.children.length===0}
function cleanPunctuation(s){return String(s||'').replace(/\s*·\s*·\s*/g,' · ').replace(/\s{2,}/g,' ').replace(/^\s*·\s*|\s*·\s*$/g,'').trim()}

function rewriteUsefulEmptyStates(root){
  const repl=[
    [/^Няма активирано ранно предупреждение\.?$/i,'Няма активен риск над прага за действие.'],
    [/^Все още няма устойчив тематичен клъстер\.?$/i,'Не е открита повтаряща се тема с достатъчна значимост.'],
    [/^Няма достатъчно източници\.?$/i,'Няма достатъчно надеждни данни за извод.'],
    [/^Историческа база\s*·.*$/i,'Спрямо предходното измерване']
  ];
  root.querySelectorAll('span,small,p,b,strong,div').forEach(el=>{
    if(!leaf(el))return;const t=(el.textContent||'').trim();if(!t)return;
    for(const [re,to] of repl)if(re.test(t)){el.textContent=to;break}
  });
}
function removeInternalScores(root){
  root.querySelectorAll('span,small,p,b,strong,div').forEach(el=>{
    if(!leaf(el))return;let t=(el.textContent||'').trim();if(!t)return;
    if(GENERIC_SOURCE.test(t)){el.dataset.blisClientValueHidden='1';return}
    if(/значимост\s+\d+(?:[,.]\d+)?/i.test(t)){t=cleanPunctuation(t.replace(/(?:·\s*)?значимост\s+\d+(?:[,.]\d+)?/ig,''));if(t)el.textContent=t;else el.dataset.blisClientValueHidden='1'}
  });
}
function simplifyRadarLegend(root){
  root.querySelectorAll('.n3-radar-legend-item b').forEach(x=>x.dataset.blisClientValueHidden='1');
}
function sanitizeBlocks(root){
  const seen=new Set();
  root.querySelectorAll('div,section,article,li,tr').forEach(el=>{
    if(seen.has(el)||el.dataset.blisClientValueHidden==='1')return;
    const pg=pageOf(el);if(KEEP_CONTEXT.has(pg))return;
    const txt=(el.innerText||'').replace(/\s+/g,' ').trim();if(!txt||txt.length>520)return;
    let reason='';
    if(TECH.test(txt)||(RAWKEY.test(txt)&&/(?:linkedin|facebook|instagram|youtube|meta_ads|metric|source)/i.test(txt)))reason='raw-telemetry';
    else if(ABS_AUDIENCE.test(txt)&&!COMPARATIVE.test(txt))reason='absolute-audience';
    else if(AVAILABILITY.test(txt)&&!OUTAGE.test(txt)&&!COMPARATIVE.test(txt))reason='availability-only';
    else if(DIAGNOSTIC.test(txt))reason='internal-diagnostic';
    if(!reason)return;
    const b=smallBlock(el)||el;
    const bt=(b.innerText||'').replace(/\s+/g,' ').trim();
    // Do not sacrifice a larger analytical block because one nested caption is technical.
    if(b!==el&&bt.length>500)return;
    hide(b,reason);seen.add(b);
  });
}
function cleanupLonelyContainers(root){
  root.querySelectorAll('.n3-live-list,.n3-change-list,.vs-mini-grid,[class*="grid"]').forEach(g=>{
    const visible=[...g.children].filter(x=>x.dataset.blisClientValueHidden!=='1');
    if(!visible.length&&g.children.length)hide(g,'empty-after-client-value-filter');
  });
}
function installCSS(){if(document.getElementById('blisClientValueGuardCss'))return;const s=document.createElement('style');s.id='blisClientValueGuardCss';s.textContent=`
[data-blis-client-value-hidden="1"]{display:none!important}
.n3-radar-legend-item b[data-blis-client-value-hidden="1"]{display:none!important}
.page [data-blis-client-value-reframed="1"]{color:#506a81!important}
`;document.head.appendChild(s)}
function sanitize(root=document){
  installCSS();
  const scope=root?.querySelectorAll?root:document;
  rewriteUsefulEmptyStates(scope);removeInternalScores(scope);simplifyRadarLegend(scope);sanitizeBlocks(scope);cleanupLonelyContainers(scope);
  document.documentElement.dataset.clientValueModel='decision-relevance-v1';
}
let timers=[];function schedule(){timers.forEach(clearTimeout);timers=[0,80,220,600,1400,3000].map(ms=>setTimeout(()=>sanitize(document.querySelector('.shell')||document),ms))}
for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,schedule);
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option,.datebox,[data-n3-page],[data-page]'))setTimeout(schedule,20)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('load',()=>setTimeout(schedule,50),{once:true});
window.BLISClientValueGuardV1={sanitize,schedule};
})();
