/* BLIS Navigator evidence integrity v8. Conservative client-safe cleanup. */
(function(){
'use strict';
if(window.__BLIS_EVIDENCE_INTEGRITY_V8)return;window.__BLIS_EVIDENCE_INTEGRITY_V8=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const follower=/^\s*\d[\d\s.,]*\s*(?:последовател(?:и|я)?|followers?)\s*$/i;
function scrubFollowers(){
  const leaves=[...document.querySelectorAll('span,b,strong,small,p,div')].filter(e=>e.children.length===0);
  for(const e of leaves){
    const t=(e.textContent||'').trim();
    if(!follower.test(t))continue;
    const card=e.closest('.signal-card,.metric-card,.kpi-card,.iv3-card,[class*="signal-card"],[class*="metric-card"]');
    if(card) card.remove(); else e.remove();
  }
}
async function replacePerception(){
  const env=document.getElementById('environment');if(!env||env.querySelector('[data-env8]'))return;
  const heading=[...env.querySelectorAll('h1,h2,h3,h4')].find(e=>/Интерактивна карта на възприятията/i.test((e.textContent||'').trim()));
  if(!heading)return;
  const k=new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||'aroma';
  let activity=[],sources=[];
  try{const [ar,sr]=await Promise.all([fetch(`/api/clients/${encodeURIComponent(k)}/activity`,{cache:'no-store'}),fetch(`/api/clients/${encodeURIComponent(k)}/sources`,{cache:'no-store'})]);if(ar.ok)activity=await ar.json();if(sr.ok)sources=await sr.json()}catch(_){ }
  const cutoff=Date.now()-45*864e5,labels=new Map((Array.isArray(sources)?sources:[]).map(s=>[String(s.key||''),String(s.label||s.key||'Източник')]));
  const counts=new Map;
  for(const o of (Array.isArray(activity)?activity:[])){
    const mk=String(o.metric_key||'');if(/follower|последовател/i.test(mk))continue;
    const t=Date.parse(o.observed_at||'');if(!Number.isFinite(t)||t<cutoff)continue;
    const sk=String(o.source_key||'other');counts.set(sk,(counts.get(sk)||0)+1);
  }
  const top=[...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,6);
  const html=`<section data-env8 style="margin:14px 0;border:1px solid #d9e5ef;border-radius:18px;background:#fff;padding:18px"><h3 style="margin:0 0 5px;color:#173c60;font-size:17px">Ключови фактори в информационната среда</h3><p style="margin:0 0 14px;color:#718399;font-size:10px">Източниците, които реално формират измерената картина за последните 45 дни.</p><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px">${top.length?top.map(([sk,v])=>`<div style="border:1px solid #e4ebf2;border-radius:13px;padding:13px"><b style="display:block;color:#294d6d;font-size:11px">${esc(labels.get(sk)||sk)}</b><strong style="display:block;margin-top:7px;color:#1f69a8;font-size:17px">${v}</strong><span style="display:block;margin-top:4px;color:#7b8c9e;font-size:9px">валидни измервания</span></div>`).join(''):'<div style="border:1px solid #e4ebf2;border-radius:13px;padding:13px;color:#718399;font-size:10px">Натрупва се измерена база.</div>'}</div></section>`;
  const target=heading.closest('.card,.panel,section')||heading.parentElement;
  if(target&&target!==env)target.insertAdjacentHTML('afterend',html),target.remove();
}
function run(){scrubFollowers();replacePerception();}
window.addEventListener('blis:routechange',()=>setTimeout(run,150));
window.addEventListener('blis:clientdata',()=>setTimeout(run,150));
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option'))setTimeout(run,250)},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
setTimeout(run,800);setTimeout(run,2200);
})();