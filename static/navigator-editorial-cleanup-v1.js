/* BLIS Navigator — Editorial Cleanup V1
   Global content hygiene for standard client dashboards.
   Keeps useful analytical content; removes legacy telemetry, normal-status
   filler, generic themes and exact duplicates. No MutationObserver. */
(function(){
'use strict';
if(window.__BLIS_EDITORIAL_CLEANUP_V1)return;window.__BLIS_EDITORIAL_CLEANUP_V1=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;

const KEEP=new Set(['sources','settings','help']);
const PROTECTED='.ci3,.compnews-v1,#n3c2Drawer,#n3c2Backdrop,.n3c2-section,.n3c2-hero';
const CARD='article,.row,.st,.ev,.del,.signal-item,.change-item,.source-card,.n3-row,.n3-live-item,.n3-change,.ov3-change,.ov3-signal,.n3b-card,.market1-theme,.dv-kpi,.dv-source-card,.metric-row,.metric-intel-row,.vs-mini,.vs-side-card,.card,.panel';
const COMP=/(?:%|→|↗|↘|спрямо|ръст|спад|увелич|намал|промян|по-вис|по-нис|предход|конкурент|бенчмарк|benchmark|тенденц|за\s+периода|недостъп|прекъс|грешк|outage|риск|възможност)/i;
const ABS_SOC=/(?:linkedin|facebook|instagram|youtube|tiktok).{0,110}(?:аудитория|последовател|абонат|followers?|subscribers?).{0,45}\b\d[\d\s.,]*/i;
const NORMAL_SITE=/(?:официалният\s+)?сайт(?:ът)?(?:\s+и\s+електронният\s+магазин)?\s+(?:е|са)\s+(?:достъпен|достъпни|активен|активни|наличен|налични|работещ|работещи)/i;
const TELEMETRY=/\b(?:visible_reactions_search|recent_public_posts|website_active|profile_active|reachable|direct_booking|review_count|follower_count|followers|term_signal_count|category_count|source_key|metric_key|observed_at|sitemap_[a-z0-9_]+|public_platform_profiles|sources_with_data|fresh_sources_48h|snapshots?|price_markers|brand_mentions_on_result|cmp_[a-z0-9_]+)\b/i;
const DIAGNOSTIC=/(?:историческ(?:а|и)\s+(?:база|наблюдения)|качество\s+на\s+доказателствата\s*:\s*\d+\s*\/\s*\d+|концентрация\s+в\s+топ\s+източника|времева\s+покриваемост|конфигурирани\s+източници|\bизмервания\b)/i;
const FILLER=/(?:проверено\s+автоматично\s+от\s+BLIS|публично\s+наблюдаем\s+фирмен\s+профил|водеща\s+тема\s*[:·-]?\s*други\s+сигнали|други\s+сигнали\s*тема\s+за\s+наблюдение|^\s*тема\s+за\s+наблюдение\s*$)/i;
const EMPTY_MARKET=/(?:пазарен\s+анализ).{0,200}(?:няма\s+отделен\s+аналитичен\s+сигнал\s+за\s+този\s+модул)/i;
const LEGACY_OVERVIEW=/(?:последни\s+значими\s+сигнали).{0,900}(?:официалният\s+сайт|linkedin\s+аудитория|публично\s+наблюдаем\s+фирмен\s+профил|проверено\s+автоматично\s+от\s+BLIS)/i;

function txt(el){return String(el?.innerText||el?.textContent||'').replace(/\s+/g,' ').trim()}
function norm(s){return String(s||'').toLowerCase().replace(/\d{1,2}[.:]\d{2}/g,'').replace(/\s+/g,' ').trim()}
function page(el){return el?.closest?.('.page')||null}
function protectedNode(el){return !!el?.closest?.(PROTECTED)}
function mark(el,reason){if(!el||protectedNode(el))return;el.dataset.editorialRemove='1';el.dataset.editorialReason=reason||'low-value'}
function meaningfulContext(t){return COMP.test(t)}
function reason(t){
  if(!t)return'';
  if(FILLER.test(t))return'filler';
  if(TELEMETRY.test(t))return'raw-telemetry';
  if(ABS_SOC.test(t)&&!meaningfulContext(t))return'absolute-social-count';
  if(NORMAL_SITE.test(t)&&!meaningfulContext(t))return'normal-site-status';
  if(DIAGNOSTIC.test(t)&&!/(?:ръст|спад|промян|спрямо|тенденц)/i.test(t))return'internal-diagnostic';
  return'';
}
function blockFor(el){
  let n=el;
  for(let i=0;i<5&&n;i++,n=n.parentElement){
    if(!n.closest?.('.page'))break;
    if(protectedNode(n))return null;
    const t=txt(n);
    if(n.matches?.(CARD)&&t.length<=900)return n;
    if(n.tagName==='LI'&&t.length<=700)return n;
  }
  return null;
}
function cleanLowValue(root){
  root.querySelectorAll('article,.row,.st,.ev,.del,.signal-item,.change-item,.source-card,.n3-row,.n3-live-item,.n3-change,.ov3-change,.ov3-signal,.n3b-card,.market1-theme,.dv-kpi,.dv-source-card,.metric-row,.metric-intel-row,.vs-mini,.vs-side-card,li,p,small,span,b,strong').forEach(el=>{
    const pg=page(el);if(!pg||KEEP.has(pg.id)||protectedNode(el))return;
    const t=txt(el);if(!t||t.length>900)return;
    const r=reason(t);if(!r)return;
    const b=blockFor(el);if(b)mark(b,r);else if(!el.children.length)mark(el,r);
  });
}
function cleanLegacySections(root){
  root.querySelectorAll('.page section,.page .panel,.page .card,.page>div').forEach(el=>{
    const pg=page(el);if(!pg||KEEP.has(pg.id)||protectedNode(el))return;
    const t=txt(el);if(!t||t.length>1600)return;
    if(EMPTY_MARKET.test(t)){mark(el,'empty-market-analysis');return}
    if(pg.id==='overview'&&LEGACY_OVERVIEW.test(t)){mark(el,'legacy-overview-signals');return}
    if(/водеща\s+тема/i.test(t)&&/(други\s+сигнали|тема\s+за\s+наблюдение)/i.test(t))mark(el,'generic-theme');
  });
}
function dedupe(root){
  root.querySelectorAll('.page').forEach(pg=>{
    if(KEEP.has(pg.id))return;
    const seen=new Map();
    pg.querySelectorAll(CARD).forEach(el=>{
      if(protectedNode(el)||el.dataset.editorialRemove==='1')return;
      const t=txt(el);if(t.length<35||t.length>650)return;
      const k=norm(t);if(k.length<30)return;
      if(seen.has(k))mark(el,'duplicate-copy');else seen.set(k,el);
    });
  });
}
function collapse(root){
  root.querySelectorAll('.page section,.page .panel,.page .card').forEach(el=>{
    if(protectedNode(el)||el.dataset.editorialRemove==='1')return;
    const children=[...el.children].filter(x=>x.dataset.editorialRemove!=='1'&&getComputedStyle(x).display!=='none');
    if(children.length===0&&txt(el).length<5)mark(el,'empty-after-cleanup');
  });
}
function css(){if(document.getElementById('blisEditorialCleanupCSS'))return;const s=document.createElement('style');s.id='blisEditorialCleanupCSS';s.textContent=`
[data-editorial-remove="1"],[data-ci3-low-value="1"],[data-ci3-superseded="1"],[data-compnews-remove="1"]{display:none!important}
`;document.head.appendChild(s)}
function clean(){css();const root=document.querySelector('.shell')||document;cleanLowValue(root);cleanLegacySections(root);dedupe(root);collapse(root);document.documentElement.dataset.editorialModel='decision-useful-v1'}
let timers=[];function schedule(){timers.forEach(clearTimeout);timers=[0,60,180,500,1200,2600,4500].map(ms=>setTimeout(clean,ms))}
for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,schedule);
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option,.datebox,[data-page],[data-n3-page]'))schedule()},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('load',schedule,{once:true});
window.BLISEditorialCleanupV1={clean,schedule};
})();
