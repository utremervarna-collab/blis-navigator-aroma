/* BLIS Navigator — V3 content ownership stability guard.
   Keeps one V3 block per page and prevents late legacy renderers from
   reintroducing filler, technical telemetry or duplicate analytical copy. */
(function(){
'use strict';
if(window.__BLIS_CI3_STABILITY)return;window.__BLIS_CI3_STABILITY=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;
const PREF={overview:'#overviewPremium',monitoring:'#n15Signals',environment:'#marketBody',competition:'#competitionBody',history:'#historyBody'};
const TECH=/(?:linkedin|facebook|instagram|youtube|tiktok).{0,100}(?:аудитория|последовател|абонат|followers|subscribers).{0,45}\d|(?:официалният\s+)?сайт(?:ът)?(?:\s+и\s+електронният\s+магазин)?\s+(?:е|са)\s+(?:достъпен|достъпни|активен|активни|работещ|работещи)|\b(?:website_active|profile_active|reachable|follower_count|source_key|metric_key|observed_at|sources_with_data|fresh_sources_48h|snapshots?)\b|историческ(?:а|и)\s+(?:база|наблюдения)|\bизмервания\b|конфигурирани\s+източници/i;
const CONTEXT=/(?:%|спрямо|ръст|спад|увелич|намал|промян|конкурент|бенчмарк|тенденц|недостъп|проблем|прекъс|грешк|outage)/i;
const SMALL='.st,.row,.ev,.del,.n3-row,.n3-live-item,.n3-change,.n3b-card,.market1-theme,.dv-kpi,.dv-source-card,.metric-intel-row,.metric-row,.change-item,.signal-item,.source-card,article';
function dedupe(){for(const [id,sel] of Object.entries(PREF)){const all=[...document.querySelectorAll(`[data-ci3="${id}"]`)];if(all.length<2)continue;const p=document.querySelector(sel);let keep=p?all.find(x=>p.contains(x)):null;keep=keep||all.at(-1);all.forEach(x=>{if(x!==keep)x.remove()})}}
function clean(){
  document.querySelectorAll('.civ2,[data-n3b],.n3-live-strip,.n3-market-summary,.n3-competition-changes,#market .market1-answer,#market .market1-themes').forEach(x=>x.setAttribute('data-ci3-superseded','1'));
  const market=document.getElementById('market');if(market)market.querySelectorAll(SMALL).forEach(el=>{if(el.closest('.ci3'))return;const t=(el.innerText||'').replace(/\s+/g,' ').trim();if(!t||t.length>700)return;if(/BLIS\s+индекс/i.test(t)||(/водеща\s+тема/i.test(t)&&/(други\s+сигнали|тема\s+за\s+наблюдение)/i.test(t))||(TECH.test(t)&&!CONTEXT.test(t)))el.setAttribute('data-ci3-low-value','1')});
  const history=document.getElementById('history');if(history)history.querySelectorAll(SMALL).forEach(el=>{if(el.closest('.ci3'))return;const t=(el.innerText||'').replace(/\s+/g,' ').trim();if(!t||t.length>700)return;if(TECH.test(t)&&!CONTEXT.test(t))el.setAttribute('data-ci3-low-value','1')});
  const social=document.getElementById('social');if(social)social.querySelectorAll(SMALL).forEach(el=>{if(el.closest('.ci3'))return;const t=(el.innerText||'').replace(/\s+/g,' ').trim();if(t&&t.length<700&&TECH.test(t)&&!CONTEXT.test(t))el.setAttribute('data-ci3-low-value','1')});
  dedupe();
}
let timers=[];function schedule(){timers.forEach(clearTimeout);timers=[40,180,520,1200,2600].map(ms=>setTimeout(clean,ms))}
for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,schedule);
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option,.datebox,[data-page],[data-n3-page]'))schedule()},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();window.addEventListener('load',schedule,{once:true});
window.BLISCI3Stability={clean,schedule,dedupe};
})();
