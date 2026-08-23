/* BLIS Navigator — MOLLOX isolated client QA guard. */
(function(){
'use strict';
if(window.__BLISMolloxQAV1)return;window.__BLISMolloxQAV1=true;
const isMollox=()=>document.body?.dataset?.client==='mollox'||window.BLIS_CLIENT_SCOPE==='mollox'||window.BLIS_INITIAL_CLIENT==='mollox'||(()=>{try{return typeof slug!=='undefined'&&slug==='mollox'}catch(_){return false}})();
if(!isMollox())return;
const VERIFIED={
  facts:[['5','Регионални дистрибутора'],['8','Private Label продуктови типа'],['4','Основни индустрии'],['ISO 9001 / 14001','Публично заявени стандарти']],
  descriptor:'Професионални решения за чистота и хигиена за бизнес среда.'
};
function loadLayout(){
  let l=document.getElementById('molloxLayoutFixV2');
  if(!l){l=document.createElement('link');l.id='molloxLayoutFixV2';l.rel='stylesheet';l.href='/mollox-layout-fix-v2.css?v=20260823-layout2';document.head.appendChild(l)}
}
function context(){
  loadLayout();
  window.BLIS_INITIAL_CLIENT='mollox';window.BLIS_CLIENT_SCOPE='mollox';document.body.dataset.client='mollox';
  try{if(typeof slug!=='undefined')slug='mollox'}catch(_){}
  const s=document.getElementById('clientSel');if(s)s.value='mollox';
  document.documentElement.style.setProperty('--client-accent','#7b1028');
  document.documentElement.style.setProperty('--client-soft','#f8eef1');
}
function exactText(root,from,to){
  if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const a=[];while(w.nextNode())a.push(w.currentNode);
  a.forEach(n=>{const t=String(n.nodeValue||'');if(t.trim()===from)n.nodeValue=t.replace(from,to)});
}
function fixMarket(){
  const m=document.getElementById('market');if(!m)return;
  const nav=document.querySelector('#nav [data-page="market"] .navtxt');if(nav)nav.textContent='Нагласи';
  const h=m.querySelector('.pm-hero h2');if(h)h.textContent='Нагласи';
  const p=m.querySelector('.pm-hero p');if(p)p.textContent='Проверими теми, сигнали и връзки, които оформят нагласите към MOLLOX България.';
  const badge=m.querySelector('.pm-client-badge');if(badge){const mark=badge.querySelector('.pm-client-mark');if(mark)mark.textContent='MX';const b=badge.querySelector('b');if(b)b.textContent='MOLLOX България';const sm=badge.querySelector('small');if(sm)sm.textContent='Професионална хигиена';}
  exactText(m,'Aroma Cosmetics','MOLLOX България');exactText(m,'AROMA','MOLLOX');
}
function fixReputation(){
  const r=document.getElementById('reputation');if(!r)return;
  r.querySelectorAll('.rp-exact-label').forEach(x=>{x.textContent='MOLLOX България';x.dataset.client='mollox'});
  exactText(r,'Aroma Cosmetics','MOLLOX България');exactText(r,'AROMA','MOLLOX');
  try{window.BLISReputationExactArtV62?.apply?.();window.BLISReputationExactArtV61?.apply?.();window.BLISReputationExactArtV60?.apply?.()}catch(_){}
}
function fixProfile(){
  const p=document.getElementById('profile');if(!p)return;
  exactText(p,'Aroma Cosmetics','MOLLOX България');exactText(p,'AROMA','MOLLOX');
  p.querySelectorAll('*').forEach(el=>{const t=(el.textContent||'').trim();if(t==='10+ години' || t==='15+')el.textContent=t==='10+ години'?'5':'8'});
  const labels=[...p.querySelectorAll('*')];
  labels.forEach(el=>{const t=(el.textContent||'').trim();if(t==='Присъствие в България')el.textContent='Регионални дистрибутора';if(t==='Продуктови категории')el.textContent='Private Label продуктови типа'});
}
function competitionEvents(){
  const sources=Array.isArray(window.S)?window.S:[];
  const observations=Array.isArray(window.A)?window.A:[];
  const signals=Array.isArray(window.D?.signals)?window.D.signals:[];
  const compKeys=new Set(sources.filter(s=>/competitor|cmp_|hagleitner|hygimarket|euroshine|katrin|bepure/i.test(String(s?.key||'')+' '+String(s?.label||''))).map(s=>String(s?.key||'')));
  const out=[];
  const stamp=x=>{const v=x?.observed_at||x?.observedAt||x?.time||x?.timestamp||x?.created_at||x?.createdAt;const t=v?new Date(v).getTime():NaN;return Number.isFinite(t)?t:null};
  observations.forEach(o=>{const k=String(o?.source||o?.source_key||o?.sourceKey||'');const t=stamp(o);if(t&&(compKeys.has(k)||/competitor|cmp_/i.test(k)))out.push(t)});
  signals.forEach(s=>{const text=`${s?.category||''} ${s?.type||''} ${s?.title||''} ${s?.description||''}`;const t=stamp(s);if(t&&/compet|конкур/i.test(text))out.push(t)});
  return out.sort((a,b)=>a-b);
}
function sourceReliability(){
  const sources=Array.isArray(window.S)?window.S:[];
  const vals=sources.filter(s=>/competitor|cmp_|hagleitner|hygimarket|euroshine|katrin|bepure/i.test(String(s?.key||'')+' '+String(s?.label||''))).map(s=>Number(s?.reliability)).filter(Number.isFinite).map(v=>v<=1?v*100:v);
  return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
}
function flowGraphic(events){
  if(!events.length)return '<div class="mollox-flow-empty">Няма достатъчно реални конкурентни сигнали за графика.</div>';
  const period=Number((document.querySelector('.cmpv5-seg button.active')?.textContent||'30').match(/\d+/)?.[0]||30);
  const n=12,start=Date.now()-period*864e5,step=period*864e5/n,b=Array(n).fill(0);
  events.filter(t=>t>=start).forEach(t=>{let i=Math.floor((t-start)/step);i=Math.max(0,Math.min(n-1,i));b[i]++});
  if(!b.some(Boolean))return '<div class="mollox-flow-empty">Няма конкурентни сигнали в избрания период.</div>';
  const W=760,H=128,L=18,R=18,T=14,B=22,max=Math.max(...b,1),x=i=>L+(W-L-R)*(i/(n-1)),y=v=>T+(H-T-B)*(1-v/max);
  const pts=b.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const dots=b.map((v,i)=>v?`<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5"><title>${v} сигнала</title></circle>`:'').join('');
  return `<svg class="mollox-flow-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Реални конкурентни сигнали по период"><line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" class="axis"/><polyline points="${pts}" class="line"/>${dots}</svg>`;
}
function cleanTechnicalCompetitionText(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(n=>{
    let t=String(n.nodeValue||'');
    if(/^\s*reachable\s*:\s*1\s*$/i.test(t))t='Източникът е достъпен';
    else if(/^\s*score\s*:\s*[\d.,]+\s*$/i.test(t))t='';
    else t=t.replace(/term[_ ]signal[_ ]count\s*:\s*(\d+)/ig,'$1 засечени тематични сигнала');
    n.nodeValue=t;
  });
}
function fixCompetition(){
  const c=document.getElementById('competition');if(!c)return;
  let st=document.getElementById('molloxCompetitionQACSS');
  if(!st){st=document.createElement('style');st.id='molloxCompetitionQACSS';st.textContent=`
#competition .mollox-data-note{margin:10px 0 0;padding:9px 11px;border:1px solid #e2e8f0;border-radius:9px;background:#f8fafc;color:#667085;font-size:8.5px;line-height:1.45}
#competition .mollox-flow-v1{height:128px;margin:4px 0 12px;border:1px solid #dfe9e5;border-radius:16px;background:linear-gradient(180deg,#fbfefd,#f5fbf8);overflow:hidden;padding:8px 10px}
#competition .mollox-flow-svg{display:block;width:100%;height:100%}#competition .mollox-flow-svg .axis{stroke:#dbe7e3;stroke-width:1}#competition .mollox-flow-svg .line{fill:none;stroke:#16a36a;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}#competition .mollox-flow-svg circle{fill:#fff;stroke:#16a36a;stroke-width:2}
#competition .mollox-flow-empty{height:100%;display:grid;place-items:center;text-align:center;color:#8a96a6;font-size:9px;padding:12px}
#competition .cmpv12-static-flow{display:none!important}#competition .cmpv12-flow-panel{overflow:hidden!important}#competition .cmpv12-flow-panel *{max-width:100%}
`;
    document.head.appendChild(st);
  }
  const matrix=c.querySelector('.cmpv11-matrix');
  if(matrix){
    const rows=[...matrix.querySelectorAll('.cmpv11-row')];
    rows.forEach(row=>{
      let cur=row.nextElementSibling,cells=[];
      while(cur&&!cur.classList.contains('cmpv11-row')){if(cur.classList.contains('cmpv11-cell'))cells.push(cur);cur=cur.nextElementSibling}
      const hasReal=cells.some(cell=>{const t=(cell.querySelector('small')?.textContent||'').trim();return t&&t!=='—'});
      if(row.dataset.v11row!=='position'&&!hasReal){row.style.display='none';cells.forEach(x=>x.style.display='none')}else{row.style.display='';cells.forEach(x=>x.style.display='')}
    });
    if(!matrix.parentElement.querySelector('.mollox-data-note')){const note=document.createElement('div');note.className='mollox-data-note';note.textContent='Показват се само категории с реална сравнима измерима база. Категории без потвърдени данни не се оценяват.';matrix.insertAdjacentElement('afterend',note)}
  }
  const panel=[...c.querySelectorAll('.cmpv5-side .cmpv5-panel')].find(p=>/ПОТОК ОТ СИГНАЛИ/i.test(p.querySelector('h3')?.textContent||''));
  if(panel){
    panel.querySelectorAll('img.cmpv12-static-flow').forEach(x=>x.remove());
    let host=panel.querySelector('.mollox-flow-v1');if(!host){host=document.createElement('div');host.className='mollox-flow-v1';const metrics=panel.querySelector('.cmpv11-flowmetrics');if(metrics)metrics.insertAdjacentElement('afterend',host);else panel.appendChild(host)}
    const ev=competitionEvents();host.innerHTML=flowGraphic(ev);
    const rel=sourceReliability();
    panel.querySelectorAll('.cmpv11-flowmetric').forEach(m=>{const label=m.querySelector('span'),val=m.querySelector('b');if(!label||!val)return;const l=(label.textContent||'').trim();if(/Промяна/i.test(l)){val.textContent='—';m.title='Промяна ще се показва след натрупване на две последователни реални измервания.'}else if(/Потвърденост|Надеждност/i.test(l)){label.textContent='Надеждност на източниците';val.textContent=rel===null?'—':rel.toLocaleString('bg-BG',{maximumFractionDigits:0})+'%'}else if(/Сигнал|Активност/i.test(l)){val.textContent=String(ev.length)}});
    cleanTechnicalCompetitionText(panel);
  }
}
function fixGeneric(){
  const active=document.querySelector('.page.active');if(!active)return;
  exactText(active,'Aroma Cosmetics','MOLLOX България');exactText(active,'AROMA','MOLLOX');
}
function audit(){context();fixGeneric();fixMarket();fixReputation();fixProfile();fixCompetition();const jump=document.getElementById('clientJump');if(jump)jump.style.display='none';}
function schedule(){[0,80,260,700].forEach(ms=>setTimeout(audit,ms))}
loadLayout();
const root=document.querySelector('.shell')||document.body;const ob=new MutationObserver(()=>schedule());ob.observe(root,{subtree:true,childList:true,characterData:true});
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,[data-page]'))schedule()},true);
window.addEventListener('blis:clientdata',schedule);window.addEventListener('blis:periodchange',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.BLISMolloxQA={audit,schedule,verified:VERIFIED,fixCompetition};
})();