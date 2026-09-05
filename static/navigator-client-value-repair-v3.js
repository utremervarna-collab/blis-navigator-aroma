/* BLIS Navigator client-value repair v3. Replaces misleading zero/placeholder UI with real API history for every client. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_VALUE_REPAIR_V3)return;window.__BLIS_CLIENT_VALUE_REPAIR_V3=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;
const A=v=>Array.isArray(v)?v:[],N=v=>Number.isFinite(Number(v))?Number(v):null;
const client=()=>{try{return window.BLISClientUIV3?.current?.()||document.body?.dataset?.client||new URLSearchParams(location.search).get('client')||window.BLIS_INITIAL_CLIENT||'aroma'}catch(_){return'aroma'}};
const stamp=x=>{const v=x?.created_at||x?.observed_at||x?.time||x?.date;const t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const ix=(p,k='blis')=>{p=p?.payload||p||{};if(k==='blis')return N(p.blis_index);return N(A(p.indices).find(x=>x.key===k)?.value)};
let cache={k:'',p:null,d:null,h:[],s:[]};
async function load(force=false){const k=client();if(!force&&cache.k===k&&cache.d)return cache;if(cache.p&&cache.k===k)return cache.p;cache.k=k;cache.p=Promise.all([
 fetch(`/api/clients/${encodeURIComponent(k)}/dashboard`,{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({})),
 fetch(`/api/clients/${encodeURIComponent(k)}/history`,{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch(`/api/signals?client=${encodeURIComponent(k)}&limit=500&_=${Date.now()}`,{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}))
]).then(([d,h,g])=>{cache={k,p:null,d,h:A(h),s:[...A(d.signals),...A(g.signals)]};return cache});return cache.p}
function hist(d){return d.h.map(x=>({t:stamp(x),v:ix(x)})).filter(x=>x.t&&x.v!=null).sort((a,b)=>a.t-b.t)}
function comp(d){const h=hist(d),now=ix(d.d);if(now==null||!h.length)return{now,old:null,delta:null,h};const target=Date.now()-30*864e5;const old=h.reduce((b,x)=>Math.abs(x.t-target)<Math.abs(b.t-target)?x:b,h[0]);return{now,old:old.v,delta:now-old.v,h}}
function fmt(v){return v==null?'':Math.abs(v).toLocaleString('bg-BG',{maximumFractionDigits:1})}
function leafs(root){return [...root.querySelectorAll('*')].filter(x=>!x.children.length)}
function byText(root,re){return leafs(root).filter(x=>re.test((x.textContent||'').trim()))}
function closestCard(el){return el?.closest('.card,.metric-card,.side-card,.hero-side-card,.change-card,.signal-card,.kpi-card,[class*="card"]')||el?.parentElement?.parentElement||el?.parentElement}
function setDeltaCard(root,c){const labels=byText(root,/^ИЗМЕНЕНИЕ ЗА ПЕРИОДА$/i);for(const l of labels){const card=closestCard(l);if(!card)continue;const nums=leafs(card).filter(x=>/^[-+]?\d+(?:[,.]\d+)?$/.test((x.textContent||'').trim())&&x!==l);if(c.delta==null){if(nums[0])nums[0].textContent='—';const t=byText(card,/Без съществена промяна|Без промяна/i)[0];if(t)t.textContent='Няма надеждна сравнима точка';continue;}if(nums[0])nums[0].textContent=(c.delta>0?'+':c.delta<0?'−':'')+fmt(c.delta);const t=byText(card,/Без съществена промяна|Без промяна|Няма надеждна сравнима точка/i)[0];if(t)t.textContent=Math.abs(c.delta)<0.4?'Стабилно':c.delta>0?'Подобрение спрямо предходния период':'Отслабване спрямо предходния период';drawSpark(card,c.h)} }
function setDirection(root,c){for(const l of byText(root,/^ПОСОКА$/i)){const card=closestCard(l);if(!card)continue;const arrow=leafs(card).find(x=>/^[→↑↓↗↘]$/.test((x.textContent||'').trim()));if(arrow&&c.delta!=null)arrow.textContent=Math.abs(c.delta)<0.4?'→':c.delta>0?'↗':'↘';const t=leafs(card).find(x=>/Без съществена промяна|Без промяна/i.test(x.textContent||''));if(t&&c.delta!=null)t.textContent=Math.abs(c.delta)<0.4?'Стабилна посока':c.delta>0?'Положителна посока':'Отрицателна посока'} }
function drawSpark(card,h){if(h.length<2)return;const svg=card.querySelector('svg');if(!svg)return;const vals=h.slice(-12).map(x=>x.v);const min=Math.min(...vals),max=Math.max(...vals),span=Math.max(1,max-min),w=220,hg=45;const pts=vals.map((v,i)=>`${(i/(vals.length-1))*w},${hg-4-((v-min)/span)*(hg-8)}`).join(' ');svg.setAttribute('viewBox',`0 0 ${w} ${hg}`);svg.innerHTML=`<polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;}
function cleanSignals(root,d){const placeholders=byText(root,/^публичен източник\s*\/100$/i);for(const p of placeholders){const card=closestCard(p);if(card)card.remove();else p.remove()}
 const section=byText(root,/^Най-важното за текущия период$/i)[0]?.closest('section,.card,[class*="panel"],[class*="section"]');if(!section)return;const real=d.s.filter(x=>String(x?.title||x?.label||'').trim()&&!/^history$/i.test(String(x?.title||x?.label||'').trim()));if(real.length){const empty=[...section.querySelectorAll('.signal-card,[class*="signal"]')].filter(x=>/публичен източник\s*\/100/i.test(x.textContent||''));empty.forEach(x=>x.remove())}}
function cleanTechnical(root){for(const x of byText(root,/^(history|data_quality)$/i)){const card=closestCard(x);if(card&&card.textContent.trim().length<160)card.remove();else x.textContent=''} }
async function repair(force=false){const root=document.getElementById('overview');if(!root)return;const d=await load(force),c=comp(d);setDeltaCard(root,c);setDirection(root,c);cleanSignals(root,d);cleanTechnical(document);document.documentElement.dataset.clientValueRepair='v3'}
function schedule(force=false){[80,350,900,1800].forEach(ms=>setTimeout(()=>repair(force),ms))}
window.addEventListener('blis:routechange',e=>{if(e.detail?.page==='overview')schedule(false)});window.addEventListener('blis:clientdata',()=>schedule(true));window.addEventListener('blis:intelligence',()=>schedule(true));document.addEventListener('click',e=>{if(e.target.closest?.('.client-option,#nav button'))setTimeout(()=>schedule(true),120)},true);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>schedule(true),{once:true});else schedule(true);
})();