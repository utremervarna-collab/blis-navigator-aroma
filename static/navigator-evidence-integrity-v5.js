/* BLIS Navigator evidence integrity v5.
   Client-facing rule: no follower counts as official intelligence metrics,
   no synthetic zero charts, and no empty signal panel when measured evidence exists. */
(function(){
'use strict';
if(window.__BLIS_EVIDENCE_INTEGRITY_V5)return;window.__BLIS_EVIDENCE_INTEGRITY_V5=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number.isFinite(Number(v))?Number(v):null;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const client=()=>{try{return window.BLISClientUIV3?.current?.()||document.body?.dataset?.client||new URLSearchParams(location.search).get('client')||window.BLIS_INITIAL_CLIENT||'aroma'}catch(_){return'aroma'}};
const ts=x=>{const v=x?.published_at||x?.detected_at||x?.observed_at||x?.created_at||x?.time||x?.date,t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const metric=x=>String(x?.metric_key||x?.metric||x?.title||x?.label||'').trim();
const source=x=>String(x?.source_key||x?.source||'').trim();
const followerMetric=/\b(follower(?:_count|s)?|followers_count|linkedin_followers|linkedin_follower_count)\b/i;
const followerText=/(?:^|\s)\d[\d\s.,]*\s*(?:последовател(?:и|я)|followers?)\b/i;
const technical=/^(history|data_quality|reachable|website_active|profile_active|response_ms|public_platform_profiles)$/i;
function isFollower(x){return followerMetric.test(metric(x))||((/linkedin/i.test(source(x))||/linkedin/i.test(String(x?.label||'')))&&followerText.test(String(x?.value??x?.text??x?.title??'')))}
function validObs(x){return x&&!isFollower(x)&&!technical.test(metric(x));}
function scrubFollowers(root=document){
  const leaves=[...root.querySelectorAll('*')].filter(e=>!e.children.length);
  for(const e of leaves){const t=(e.textContent||'').trim();if(!followerText.test(t)&&!followerMetric.test(t))continue;
    const card=e.closest('.signal-card,.metric-card,.kpi-card,.iv3-card,.card,[class*="signal"],[class*="metric"]');
    if(card){card.remove();continue;}e.remove();
  }
}
function historySeries(rows){return A(rows).map(r=>{const p=r?.payload||r||{},v=N(p.blis_index),t=ts(r);return{t,v}}).filter(x=>x.t&&x.v!=null).sort((a,b)=>a.t-b.t)}
function svg(series){if(series.length<2)return'';const vals=series.slice(-30),min=Math.min(...vals.map(x=>x.v)),max=Math.max(...vals.map(x=>x.v));if(Math.abs(max-min)<0.05)return'';const w=520,h=116,span=max-min;const pts=vals.map((x,i)=>`${10+i*(w-20)/Math.max(1,vals.length-1)},${h-14-((x.v-min)/span)*(h-30)}`).join(' ');return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Историческа динамика"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
function dailyObs(rows){const out=[];for(let i=29;i>=0;i--){const a=new Date();a.setHours(0,0,0,0);a.setDate(a.getDate()-i);const b=new Date(a);b.setDate(b.getDate()+1);out.push({label:a.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'}),v:rows.filter(x=>{const t=ts(x);return t&&t>=+a&&t<+b}).length})}return out}
function bars(rows){const max=Math.max(1,...rows.map(x=>x.v));return `<div class="ei5-bars">${rows.map(x=>`<i title="${esc(x.label)}: ${x.v}"><em style="height:${Math.max(3,x.v/max*100)}%"></em></i>`).join('')}</div><div class="ei5-axis"><span>${rows[0]?.label||''}</span><span>${rows.at(-1)?.label||''}</span></div>`}
function css(){if(document.getElementById('ei5css'))return;const s=document.createElement('style');s.id='ei5css';s.textContent=`.ei5{margin:14px 0 18px;border:1px solid #d9e5ef;border-radius:20px;background:#fff;overflow:hidden}.ei5-head{padding:17px 19px;border-bottom:1px solid #e8eef4}.ei5-head small{font-size:10px;font-weight:900;letter-spacing:.05em;color:#2b6da8}.ei5-head h2{margin:4px 0 0;font-size:20px;color:#173c60}.ei5-k{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #e8eef4}.ei5-k>div{padding:14px 18px}.ei5-k>div+div{border-left:1px solid #e8eef4}.ei5-k span{display:block;color:#8192a4;font-size:10px}.ei5-k b{display:block;margin-top:5px;color:#1d527e;font-size:22px}.ei5-g{display:grid;grid-template-columns:1.2fr .8fr}.ei5-box{padding:17px 19px}.ei5-box+.ei5-box{border-left:1px solid #e8eef4}.ei5-box h3{margin:0 0 12px;color:#365773;font-size:11px;text-transform:uppercase}.ei5-chart{height:120px;color:#2f83cf}.ei5-chart svg{width:100%;height:100%}.ei5-bars{height:118px;display:flex;align-items:flex-end;gap:3px}.ei5-bars i{flex:1;height:100%;display:flex;align-items:flex-end;background:#f2f6fa;border-radius:3px;overflow:hidden}.ei5-bars em{display:block;width:100%;background:#6aa6d1}.ei5-axis{display:flex;justify-content:space-between;font-size:9px;color:#8a9aac;margin-top:6px}.ei5-note{color:#687f94;font-size:11px;line-height:1.55}.ei5-note b{color:#244d73}@media(max-width:900px){.ei5-k{grid-template-columns:1fr 1fr}.ei5-g{grid-template-columns:1fr}.ei5-box+.ei5-box{border-left:0;border-top:1px solid #e8eef4}}`;document.head.appendChild(s)}
async function load(){const k=client();const [a,h,s,g,d]=await Promise.all([
 fetch(`/api/clients/${encodeURIComponent(k)}/activity`,{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch(`/api/clients/${encodeURIComponent(k)}/history`,{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch(`/api/clients/${encodeURIComponent(k)}/sources`,{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch(`/api/signals?client=${encodeURIComponent(k)}&limit=1000&_=${Date.now()}`,{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({})),
 fetch(`/api/clients/${encodeURIComponent(k)}/dashboard`,{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}))
 ]);return{k,a:A(a).filter(validObs),h:A(h),s:A(s),sig:A(g?.signals).filter(x=>!isFollower(x)),d};}
function recent(rows,days=30){const cut=Date.now()-days*864e5;return rows.filter(x=>{const t=ts(x);return t&&t>=cut})}
function replaceEmptyCanonical(x){const panels=[...document.querySelectorAll('.ci4')];if(!panels.length)return;const signalCount=x.sig.filter(z=>{const t=ts(z);return t&&t>=Date.now()-30*864e5}).length;if(signalCount>0)return;
 const obs=recent(x.a,30),sources=new Set(obs.map(source).filter(Boolean)),hs=historySeries(x.h),dly=dailyObs(obs),now=N(x.d?.blis_index),old=hs.length?hs.reduce((b,z)=>Math.abs(z.t-(Date.now()-30*864e5))<Math.abs(b.t-(Date.now()-30*864e5))?z:b,hs[0]):null,delta=now!=null&&old?now-old.v:null;
 css();for(const p of panels){const page=p.getAttribute('data-ci4')||'';p.outerHTML=`<section class="ei5" data-ei5="${esc(page)}"><div class="ei5-head"><small>BLIS ИЗМЕРЕНА БАЗА</small><h2>${esc(x.d?.name||x.k)}: налични данни за периода</h2></div><div class="ei5-k"><div><span>Валидни измервания, 30 дни</span><b>${obs.length.toLocaleString('bg-BG')}</b></div><div><span>Източници с измервания</span><b>${sources.size.toLocaleString('bg-BG')}</b></div><div><span>Исторически точки</span><b>${hs.length.toLocaleString('bg-BG')}</b></div><div><span>BLIS промяна</span><b>${delta==null?'няма сравнима база':`${delta>0?'+':''}${delta.toLocaleString('bg-BG',{maximumFractionDigits:1})}`}</b></div></div><div class="ei5-g"><div class="ei5-box"><h3>Измервания по дни</h3>${obs.length?bars(dly):'<div class="ei5-note">Няма нови валидни измервания в избрания период.</div>'}</div><div class="ei5-box"><h3>Какво означава това</h3><div class="ei5-note"><b>Не показваме фалшива нулева линия.</b> Потокът от публични споменавания се валидира отделно. Докато няма валидирани записи, Navigator показва реално натрупаната измерена база, без да представя липсата на валидиран сигнал като нулева активност.</div>${svg(hs)?`<div class="ei5-chart">${svg(hs)}</div>`:''}</div></div></section>`;}}
async function run(){scrubFollowers();const x=await load();scrubFollowers();replaceEmptyCanonical(x);document.documentElement.dataset.evidenceIntegrity='v5'}
let timer;const schedule=()=>{clearTimeout(timer);timer=setTimeout(run,120)};
window.addEventListener('blis:routechange',schedule);window.addEventListener('blis:clientdata',schedule);window.addEventListener('blis:intelligence',schedule);document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option'))setTimeout(schedule,180)},true);
const mo=new MutationObserver(()=>{scrubFollowers();if(document.querySelector('.ci4')&&!document.querySelector('.ei5'))schedule()});if(document.body)mo.observe(document.body,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();