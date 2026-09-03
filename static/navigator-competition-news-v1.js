/* BLIS Navigator — Competitor Intelligence News V1
   Removes low-value duplicated environment filler and enriches Competition
   with a competitor-news ticker + activity intelligence built only from
   signals already present in the current client data stream. */
(function(){
'use strict';
if(window.__BLIS_COMPETITOR_NEWS_V1)return;window.__BLIS_COMPETITOR_NEWS_V1=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;
const A=v=>Array.isArray(v)?v:[];
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const D=()=>window.D||{};
const period=()=>Number(window.BLISPeriod?.days)||30;
const text=s=>String(s?.title||s?.label||s?.text||s?.description||s?.detail||'').replace(/\s+/g,' ').trim();
const desc=s=>String(s?.description||s?.detail||'').replace(/\s+/g,' ').trim();
const src=s=>String(s?.source_label||s?.source_name||s?.source||s?.publisher||'').trim();
const url=s=>String(s?.url||s?.link||s?.source_url||'').trim();
const ts=s=>{const t=Date.parse(s?.published_at||s?.detected_at||s?.observed_at||s?.time||s?.date||'');return Number.isFinite(t)?t:0};
const dt=t=>t?new Date(t).toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}):'';
function signals(){const out=[];try{const x=window.BLISIntelligenceStreamV3?.getUsefulSignals?.();if(Array.isArray(x))out.push(...x)}catch(_){}out.push(...A(D().signals));const seen=new Set();return out.filter(s=>{const k=(url(s)||text(s)).toLowerCase();if(!k||seen.has(k))return false;seen.add(k);return true})}
function competitors(){let rows=A(D().competitors).map(x=>String(typeof x==='string'?x:(x?.name||x?.label||x?.brand||'')).trim()).filter(Boolean);if(!rows.length){rows=[...document.querySelectorAll('#competition .cmpv11-row,#competition [data-competitor],#competition .competitor-name')].map(x=>(x.dataset?.competitor||x.textContent||'').replace(/\s+/g,' ').trim()).filter(x=>x&&x.length<90)}const own=String(D().name||'').toLowerCase();const seen=new Set();return rows.filter(x=>{const k=x.toLowerCase();if(!k||k===own||seen.has(k))return false;seen.add(k);return true}).slice(0,12)}
function matchCompetitor(s,names){const hay=(' '+text(s)+' '+desc(s)+' '+String(s?.competitor||s?.competitor_name||s?.brand||'')+' ').toLowerCase();let hit=names.find(n=>hay.includes(n.toLowerCase()));if(hit)return hit;const scope=String(s?.scope||'').toLowerCase(),topic=String(s?.topic||'').toLowerCase();if(/compet|конкур/.test(scope+' '+topic))return String(s?.competitor||s?.competitor_name||'').trim()||'Конкурентен сигнал';return''}
function compSignals(){const names=competitors(),cut=Date.now()-period()*864e5;return signals().map(s=>({s,name:matchCompetitor(s,names),time:ts(s)})).filter(x=>x.name&&(!x.time||x.time>=cut)).sort((a,b)=>b.time-a.time)}
function cleanMarket(){const market=document.getElementById('market');if(!market)return;market.querySelectorAll('#civ2-environment,.civ2').forEach(el=>{const t=(el.innerText||'').replace(/\s+/g,' ').trim();if(/Как се променя средата|Развития в информационната среда|Официалният сайт и електронният магазин са достъпни|LinkedIn аудитория/i.test(t))el.setAttribute('data-compnews-remove','1')});market.querySelectorAll('section,div').forEach(el=>{const h=(el.querySelector(':scope > h2,:scope > h3,:scope > header h2,:scope > header h3')?.textContent||'').trim();const t=(el.innerText||'').replace(/\s+/g,' ').trim();if(/^Пазарен анализ$/i.test(h)&&/Няма отделен аналитичен сигнал за този модул/i.test(t))el.setAttribute('data-compnews-remove','1')})}
function css(){if(document.getElementById('compNewsV1CSS'))return;const s=document.createElement('style');s.id='compNewsV1CSS';s.textContent=`
[data-compnews-remove="1"]{display:none!important}
#competition .compnews-v1{margin:12px 0 16px;border:1px solid #d9e3ed;border-radius:18px;background:linear-gradient(150deg,#fff 0%,#f8fbff 58%,#f4f8fd 100%);box-shadow:0 14px 34px rgba(32,65,103,.065);overflow:hidden}
#competition .compnews-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:18px 20px 13px}
#competition .compnews-k{font-size:8px;font-weight:900;letter-spacing:.09em;text-transform:uppercase;color:#7a8fa5}
#competition .compnews-head h3{margin:4px 0 0;color:#183e62;font-size:22px;letter-spacing:-.035em}
#competition .compnews-head p{margin:5px 0 0;color:#788b9e;font-size:9px;line-height:1.5}
#competition .compnews-status{border:1px solid #cfe0ef;border-radius:999px;background:#f7fbff;padding:7px 10px;color:#39698f;font-size:8px;font-weight:850;white-space:nowrap}
#competition .compnews-ticker{position:relative;overflow:hidden;border-top:1px solid #e8eef4;border-bottom:1px solid #e8eef4;background:#0f2944;color:#fff}
#competition .compnews-track{display:flex;width:max-content;align-items:center;animation:compnewsScroll 48s linear infinite}
#competition .compnews-ticker:hover .compnews-track{animation-play-state:paused}
#competition .compnews-item{display:flex;gap:9px;align-items:center;min-width:360px;max-width:520px;padding:12px 18px;border-right:1px solid rgba(255,255,255,.13);color:#fff;text-decoration:none}
#competition .compnews-item strong{flex:0 0 auto;border-radius:999px;background:rgba(255,255,255,.11);padding:4px 7px;font-size:8px;letter-spacing:.02em}
#competition .compnews-item span{font-size:10px;font-weight:720;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#competition .compnews-item small{flex:0 0 auto;color:#a9bfd2;font-size:7px}
#competition .compnews-body{display:grid;grid-template-columns:minmax(0,.82fr) minmax(0,1.18fr);gap:12px;padding:14px 16px 17px}
#competition .compnews-panel{border:1px solid #e0e8ef;border-radius:14px;background:rgba(255,255,255,.94);padding:14px}
#competition .compnews-panel h4{margin:0;color:#284b69;font-size:12px}
#competition .compnews-panel>p{margin:4px 0 10px;color:#8292a2;font-size:8px;line-height:1.45}
#competition .compnews-activity{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
#competition .compnews-brand{border:1px solid #e5ebf1;border-radius:10px;background:#fbfdff;padding:9px 10px}
#competition .compnews-brand b{display:block;color:#36536d;font-size:9px;line-height:1.3}
#competition .compnews-brand strong{display:block;margin-top:6px;color:#1e6499;font-size:18px}
#competition .compnews-brand small{display:block;margin-top:3px;color:#8696a5;font-size:7px;line-height:1.35}
#competition .compnews-list{display:grid;gap:7px}
#competition .compnews-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;border-top:1px solid #edf1f5;padding:9px 1px}
#competition .compnews-card:first-child{border-top:0;padding-top:0}
#competition .compnews-card b{display:block;color:#31516d;font-size:9.5px;line-height:1.35}
#competition .compnews-card p{margin:4px 0 0;color:#73879a;font-size:8px;line-height:1.45}
#competition .compnews-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:5px;color:#8a99a8;font-size:7px}
#competition .compnews-card a{align-self:center;border:1px solid #d7e3ed;border-radius:999px;background:#fff;padding:6px 8px;color:#2e6c98;font-size:7px;font-weight:850;text-decoration:none;white-space:nowrap}
#competition .compnews-empty{border:1px dashed #d9e3ec;border-radius:11px;background:#fbfcfe;padding:13px;color:#768a9d;font-size:8.5px;line-height:1.5}
@keyframes compnewsScroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media(max-width:980px){#competition .compnews-body{grid-template-columns:1fr}#competition .compnews-head{flex-direction:column}#competition .compnews-activity{grid-template-columns:1fr 1fr}}
@media(max-width:620px){#competition .compnews-activity{grid-template-columns:1fr}#competition .compnews-item{min-width:300px}.compnews-card{grid-template-columns:1fr!important}}
`;document.head.appendChild(s)}
function ticker(rows){if(!rows.length)return`<div class="compnews-empty" style="margin:0;border:0;border-radius:0;background:#f9fbfd">Няма нова потвърдена конкурентна публикация в наличния поток за избрания период.</div>`;const item=x=>{const s=x.s,u=url(s),tag=x.name||'Конкурент',title=text(s),meta=src(s)||dt(x.time);const inner=`<strong>${E(tag)}</strong><span>${E(title)}</span>${meta?`<small>${E(meta)}</small>`:''}`;return u&&/^https?:\/\//i.test(u)?`<a class="compnews-item" href="${E(u)}" target="_blank" rel="noopener">${inner}</a>`:`<div class="compnews-item">${inner}</div>`};const base=rows.slice(0,12).map(item).join('');return`<div class="compnews-ticker"><div class="compnews-track">${base}${base}</div></div>`}
function activity(rows,names){const by=new Map(names.map(n=>[n,[]]));for(const x of rows){if(!by.has(x.name))by.set(x.name,[]);by.get(x.name).push(x)}const cards=[...by.entries()].sort((a,b)=>b[1].length-a[1].length).slice(0,8).map(([name,rs])=>{const latest=rs[0];return`<div class="compnews-brand"><b>${E(name)}</b><strong>${rs.length}</strong><small>${rs.length?`сигнала / публикации${latest?.time?` · последно ${E(dt(latest.time))}`:''}`:'без нов потвърден сигнал'}</small></div>`}).join('');return cards||`<div class="compnews-empty">Няма конфигуриран конкурентен списък за този клиент.</div>`}
function latest(rows){if(!rows.length)return`<div class="compnews-empty">Няма потвърдено конкурентно развитие в наличната база. Тук няма да се показват измислени или непроверими новини.</div>`;return rows.slice(0,7).map(x=>{const s=x.s,u=url(s),d=desc(s),meta=[x.name,src(s),dt(x.time)].filter(Boolean);return`<div class="compnews-card"><div><b>${E(text(s))}</b>${d&&d!==text(s)?`<p>${E(d.slice(0,220))}</p>`:''}<div class="compnews-meta">${meta.map(m=>`<span>${E(m)}</span>`).join('')}</div></div>${u&&/^https?:\/\//i.test(u)?`<a href="${E(u)}" target="_blank" rel="noopener">ИЗТОЧНИК ↗</a>`:''}</div>`}).join('')}
function render(){css();cleanMarket();const host=document.getElementById('competitionBody');if(!host)return;const rows=compSignals(),names=competitors();let root=document.getElementById('compnews-v1');if(root)root.remove();const html=`<section id="compnews-v1" class="compnews-v1"><div class="compnews-head"><div><span class="compnews-k">COMPETITIVE INTELLIGENCE</span><h3>Какво правят конкурентите сега</h3><p>Новини, публични действия и значими движения от конкурентите в наблюдавания период. Един сигнал се показва веднъж и води към източника.</p></div><div class="compnews-status">${rows.length} конкурентни сигнала · ${names.length} наблюдавани конкурента</div></div>${ticker(rows)}<div class="compnews-body"><div class="compnews-panel"><h4>Активност по конкуренти</h4><p>Брой налични конкурентни сигнали за избрания период. Това не е пазарен дял.</p><div class="compnews-activity">${activity(rows,names)}</div></div><div class="compnews-panel"><h4>Последни конкурентни развития</h4><p>Най-новите потвърдени публикации и действия, които могат да променят конкурентната среда.</p><div class="compnews-list">${latest(rows)}</div></div></div></section>`;host.insertAdjacentHTML('afterbegin',html)}
let timer=0;function schedule(ms=100){clearTimeout(timer);timer=setTimeout(render,ms)}
for(const ev of ['blis:clientdata','blis:intelligence','blis:periodchange','blis:routechange'])window.addEventListener(ev,()=>schedule(120));
document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="competition"],[data-n3-page="competition"],#nav button,.client-option,.datebox'))schedule(180)},true);
function boot(){css();cleanMarket();schedule(250);setTimeout(()=>schedule(0),900);setTimeout(cleanMarket,2200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.BLISCompetitionNewsV1={render,cleanMarket,competitors,compSignals};
})();