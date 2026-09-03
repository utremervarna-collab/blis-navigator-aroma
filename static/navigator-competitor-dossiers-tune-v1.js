/* BLIS Navigator — Competitor Dossier Tuning V1
   Normalizes editorial watchpoints and guarantees an honest source-backed
   fallback profile for newly configured competitors. No invented facts. */
(function(){
'use strict';
if(window.__BLIS_COMPETITOR_DOSSIERS_TUNE_V1)return;window.__BLIS_COMPETITOR_DOSSIERS_TUNE_V1=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;
const A=x=>Array.isArray(x)?x:[];
const N=s=>String(s??'').toLowerCase().replace(/[^a-zа-я0-9]+/gi,' ').replace(/\s+/g,' ').trim();
const D=()=>window.D||{};
const db=()=>window.BLISCompetitorDossiersV2||null;
const slug=()=>String(D().slug||D().client_slug||new URLSearchParams(location.search).get('client')||'').trim();
const nameOf=x=>String(typeof x==='string'?x:(x?.name||x?.label||x?.title||x?.brand||'')).replace(/\s+/g,' ').trim();
function variants(name){const n=N(name),parts=n.split(' ').filter(x=>x.length>2);return [n,...parts.filter(x=>x.length>4)]}
function matchProfile(name,cs){const q=N(name);return A(db()?.profiles).find(p=>{if(p.clients?.length&&cs&&!p.clients.includes(cs))return false;return [p.name,...A(p.aliases)].some(a=>{const n=N(a);return n&&q&&(n===q||n.includes(q)||q.includes(n))})})||null}
function matchingSources(name){const vv=variants(name);return A(D().sources).filter(s=>{const hay=N([s?.key,s?.label,s?.name,s?.method,s?.url].filter(Boolean).join(' '));return vv.some(v=>v.length>3&&hay.includes(v))||(/^cmp_/i.test(String(s?.key||''))&&vv.some(v=>N(s?.label||'').includes(v)))}).slice(0,6)}
function tuneKnown(){const x=matchProfile('Kamenitza','bolyarka');if(x&&Array.isArray(x.watch))x.watch=x.watch.map(v=>/опаковъчни\s+формати/i.test(v)?'Нови продуктови разновидности и значими портфолио движения':v)}
function addFallbacks(){const base=db();if(!base||!Array.isArray(base.profiles))return;const cs=slug();if(!cs||cs==='kub')return;for(const row of A(D().competitors)){const name=nameOf(row);if(!name||matchProfile(name,cs))continue;const sources=matchingSources(name);const sourceLinks=sources.filter(s=>/^https?:\/\//i.test(String(s?.url||''))).map(s=>[String(s?.label||s?.name||'Конфигуриран публичен източник'),String(s.url)]);const official=sourceLinks[0]?.[1]||'';base.profiles.push({clients:[cs],name,aliases:[name],verifiedAt:base.verifiedAt||'03.09.2026',synthetic:false,fallback:true,official,type:'Конкурентен профил · базова проверима информация',summary:`${name} е конфигуриран конкурент в Navigator. Пълното публично досие още не е завършено; затова тук се показват само наличните конфигурирани източници и потвърдените текущи конкурентни сигнали.`,facts:sources.length?[`За ${name} има ${sources.length} конфигуриран${sources.length===1?' публичен източник':'и публични източника'} в текущия клиентски профил.`]:[],offerings:[],segments:[],positioning:[],watch:['Нови публични действия и съобщения','Промени в комуникационната активност','Доказуеми движения, които могат да променят относителната конкурентна позиция'],sources:sourceLinks})}}
function apply(){tuneKnown();addFallbacks();document.documentElement.dataset.competitorDossiers='source-backed-v2'}
let timers=[];function schedule(){timers.forEach(clearTimeout);timers=[0,80,260,700,1500].map(ms=>setTimeout(apply,ms))}
for(const ev of ['blis:clientdata','blis:routechange','blis:intelligence'])window.addEventListener(ev,schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('load',schedule,{once:true});
window.BLISCompetitorDossiersTuneV1={apply,schedule,matchProfile,matchingSources};
})();
