/* BLIS Navigator evidence integrity v6. Client-facing evidence only. */
(function(){
'use strict';
if(window.__BLIS_EVIDENCE_INTEGRITY_V6)return;window.__BLIS_EVIDENCE_INTEGRITY_V6=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;
const A=v=>Array.isArray(v)?v:[], N=v=>Number.isFinite(Number(v))?Number(v):null;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const client=()=>{try{return window.BLISClientUIV3?.current?.()||document.body?.dataset?.client||new URLSearchParams(location.search).get('client')||window.BLIS_INITIAL_CLIENT||'aroma'}catch(_){return'aroma'}};
const ts=x=>{const v=x?.published_at||x?.detected_at||x?.observed_at||x?.created_at||x?.time||x?.date,t=Date.parse(v||'');return Number.isFinite(t)?t:null};
const metric=x=>String(x?.metric_key||x?.metric||x?.title||x?.label||'').trim();
const source=x=>String(x?.source_key||x?.source||'').trim();
const followerMetric=/\b(follower(?:_count|s)?|followers_count|linkedin_followers|linkedin_follower_count)\b/i;
const followerText=/\b\d[\d\s.,]*\s*(?:последовател(?:и|я)|followers?)\b/i;
const technical=/^(history|data_quality|reachable|website_active|profile_active|response_ms|public_platform_profiles)$/i;
function isFollower(x){return followerMetric.test(metric(x))||followerText.test(String(x?.value??x?.text??x?.title??''));}
function validObs(x){return x&&!isFollower(x)&&!technical.test(metric(x));}
function scrub(){
  [...document.querySelectorAll('*')].filter(e=>!e.children.length).forEach(e=>{
    const t=(e.textContent||'').trim();
    if(followerText.test(t)||followerMetric.test(t)){
      const card=e.closest('.signal-card,.metric-card,.kpi-card,.iv3-card,.card,[class*="signal"],[class*="metric"]');
      (card||e).remove();return;
    }
    if(/Няма потвърдени|непотвърден/i.test(t)){
      const card=e.closest('.signal-card,.metric-card,.kpi-card,.iv3-card,.card,[class*="signal"],[class*="metric"]');
      if(card&&!card.closest('.ci4'))card.remove();
    }
  });
}
function hist(rows){return A(rows).map(r=>{const p=r?.payload||r||{},v=N(p.blis_index),t=ts(r);return{t,v}}).filter(x=>x.t&&x.v!=null).sort((a,b)=>a.t-b.t)}
function recent(rows,days){const cut=Date.now()-days*864e5;return rows.filter(x=>{const t=ts(x);return t&&t>=cut})}
function daily(rows,days=45){const out=[];for(let i=days-1;i>=0;i--){const a=new Date();a.setHours(0,0,0,0);a.setDate(a.getDate()-i);const b=new Date(a);b.setDate(b.getDate()+1);out.push({label:a.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'}),v:rows.filter(x=>{const t=ts(x);return t&&t>=+a&&t<+b}).length})}return out}
function bars(rows){const mx=Math.max(1,...rows.map(x=>x.v));return `<div class="ei6-bars">${rows.map(x=>`<i title="${esc(x.label)}: ${x.v}"><em style="height:${Math.max(4,x.v/mx*100)}%"></em></i>`).join('')}</div><div class="ei6-axis"><span>${rows[0]?.label||''}</span><span>${rows.at(-1)?.label||''}</span></div>`}
function curve(rows){if(rows.length<2)return'';const vals=rows.slice(-40),min=Math.min(...vals.map(x=>x.v)),max=Math.max(...vals.map(x=>x.v));if(Math.abs(max-min)<0.05)return'';const w=520,h=116,span=max-min,pts=vals.map((x,i)=>`${10+i*(w-20)/Math.max(1,vals.length-1)},${h-14-((x.v-min)/span)*(h-30)}`).join(' ');return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
function css(){if(document.getElementById('ei6css'))return;const s=document.createElement('style');s.id='ei6css';s.textContent=`.ei6{margin:14px 0 18px;border:1px solid #d9e5ef;border-radius:20px;background:#fff;overflow:hidden}.ei6-h{padding:17px 19px;border-bottom:1px solid #e8eef4}.ei6-h small{font-size:10px;font-weight:900;letter-spacing:.05em;color:#2b6da8}.ei6-h h2{margin:4px 0 0;font-size:20px;color:#173c60}.ei6-k{display:grid;grid-template-columns:repeat(4,1fr);border-bottom:1px solid #e8eef4}.ei6-k>div{padding:14px 18px}.ei6-k>div+div{border-left:1px solid #e8eef4}.ei6-k span{display:block;color:#8192a4;font-size:10px}.ei6-k b{display:block;margin-top:5px;color:#1d527e;font-size:22px}.ei6-k em{display:block;margin-top:3px;font-size:9px;color:#73879a;font-style:normal}.ei6-g{display:grid;grid-template-columns:1.25fr .75fr}.ei6-box{padding:17px 19px}.ei6-box+.ei6-box{border-left:1px solid #e8eef4}.ei6-box h3{margin:0 0 12px;color:#365773;font-size:11px;text-transform:uppercase}.ei6-bars{height:126px;display:flex;align-items:flex-end;gap:3px}.ei6-bars i{flex:1;height:100%;display:flex;align-items:flex-end;background:#f2f6fa;border-radius:3px;overflow:hidden}.ei6-bars em{display:block;width:100%;background:#6aa6d1}.ei6-axis{display:flex;justify-content:space-between;font-size:9px;color:#8a9aac;margin-top:6px}.ei6-chart{height:126px;color:#2f83cf}.ei6-chart svg{width:100%;height:100%}.ei6-note{color:#687f94;font-size:11px;line-height:1.55}.ei6-note b{color:#244d73}@media(max-width:900px){.ei6-k{grid-template-columns:1fr 1fr}.ei6-g{grid-template-columns:1fr}.ei6-box+.ei6-box{border-left:0;border-top:1px solid #e8eef4}}`;document.head.appendChild(s)}
async function load(){const k=client();const [a,h,s,g,d]=await Promise.all([
 fetch(`/api/clients/${encodeURIComponent(k)}/activity`,{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch(`/api/clients/${encodeURIComponent(k)}/history`,{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch(`/api/clients/${encodeURIComponent(k)}/sources`,{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch(`/api/signals?client=${encodeURIComponent(k)}&limit=1000&_=${Date.now()}`,{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({})),
 fetch(`/api/clients/${encodeURIComponent(k)}/dashboard`,{cache:'no-store'}).then(r=>r.ok?r.json():{}).catch(()=>({}))
 ]);return{k,a:A(a).filter(validObs),h:A(h),s:A(s),sig:A(g?.signals).filter(x=>!isFollower(x)),d};}
function competitorCount(d){const a=A(d?.competitors);if(a.length)return a.length;const b=A(d?.competition);return b.length}
function renderEvidence(x){
 const panels=[...document.querySelectorAll('.ci4')];if(!panels.length)return;
 const obs=recent(x.a,45),srcKeys=new Set(obs.map(source).filter(Boolean)),hs=hist(x.h),dly=daily(obs,45),comp=competitorCount(x.d),now=N(x.d?.blis_index),target=Date.now()-30*864e5,old=hs.length?hs.reduce((b,z)=>Math.abs(z.t-target)<Math.abs(b.t-target)?z:b,hs[0]):null,delta=now!=null&&old?now-old.v:null;
 const signal45=recent(x.sig,45);
 const signalText=signal45.length?signal45.length.toLocaleString('bg-BG'):'Мониторинг активен';
 const signalSub=signal45.length?'класифицирани публични записа':'текущият поток се обогатява от измерената база';
 css();
 for(const p of panels){const page=p.getAttribute('data-ci4')||'';p.outerHTML=`<section class="ei6" data-ei6="${esc(page)}"><div class="ei6-h"><small>BLIS CONTINUOUS INTELLIGENCE</small><h2>${esc(x.d?.name||x.k)}: реално натрупана база за последните 45 дни</h2></div><div class="ei6-k"><div><span>Публичен мониторинг</span><b>${esc(signalText)}</b><em>${esc(signalSub)}</em></div><div><span>Валидни измервания</span><b>${obs.length.toLocaleString('bg-BG')}</b><em>без follower метрики и технически записи</em></div><div><span>Източници с измервания</span><b>${srcKeys.size.toLocaleString('bg-BG')}</b><em>реално използвани през периода</em></div><div><span>Исторически точки</span><b>${hs.length.toLocaleString('bg-BG')}</b><em>${delta==null?'натрупва се сравнима база':`BLIS промяна ${delta>0?'+':''}${delta.toLocaleString('bg-BG',{maximumFractionDigits:1})}`}</em></div></div><div class="ei6-g"><div class="ei6-box"><h3>Реална активност по дни</h3>${obs.length?bars(dly):'<div class="ei6-note">За този период няма ново измерване, затова не се рисува нулева диаграма.</div>'}</div><div class="ei6-box"><h3>Покритие и контекст</h3><div class="ei6-note"><b>${srcKeys.size} източника</b> са дали измерими данни през периода. ${comp?`Наблюдаваният конкурентен набор включва <b>${comp}</b> конкурента.`:''} LinkedIn follower count не участва в нито една клиентска метрика.</div>${curve(hs)?`<div class="ei6-chart">${curve(hs)}</div>`:''}</div></div></section>`}
}
async function run(){scrub();const x=await load();scrub();renderEvidence(x);scrub();document.documentElement.dataset.evidenceIntegrity='v6'}
let timer;function schedule(){clearTimeout(timer);timer=setTimeout(run,120)}
window.addEventListener('blis:routechange',schedule);window.addEventListener('blis:clientdata',schedule);window.addEventListener('blis:intelligence',schedule);document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option'))setTimeout(schedule,160)},true);
const mo=new MutationObserver(()=>{scrub();if(document.querySelector('.ci4'))schedule()});if(document.body)mo.observe(document.body,{childList:true,subtree:true});
setInterval(()=>{if(document.visibilityState==='visible')run()},12000);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();