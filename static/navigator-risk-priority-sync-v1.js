/* BLIS Navigator — Risk Priority sync v1.
   Uses the exact same canonical signal stream as Important Signals.
   No copied signal dataset: Risk Priority is a client-impact view over the same objects. */
(function(){
'use strict';
if(window.__BLIS_RISK_PRIORITY_SYNC_V1)return;window.__BLIS_RISK_PRIORITY_SYNC_V1=true;

const A=v=>Array.isArray(v)?v:[];
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
const en=()=>String(window.BLIS_LANGUAGE||document.documentElement.lang||'').toLowerCase().startsWith('en');
const L=(bg,enText)=>en()?enText:bg;
const translated=s=>{s=String(s??'');if(!en())return s;try{return window.BLISI18N?.t?.(s)||s}catch(_){return s}};

function canonicalSignals(){
  try{
    const rows=window.BLISIntelligenceStreamV3?.getUsefulSignals?.();
    if(Array.isArray(rows)&&rows.length)return rows.filter(Boolean).slice(0,18);
  }catch(_){ }
  return A(window.D?.signals).filter(Boolean).slice(0,18);
}
function kind(s){
  const explicit=String(s?.client_perspective_kind||s?.kind||'').toLowerCase();
  if(explicit)return explicit;
  if(s?.sentiment==='negative'||['critical','high'].includes(String(s?.severity||'').toLowerCase()))return'риск';
  if(s?.sentiment==='positive')return'възможност';
  if(String(s?.scope||'').toLowerCase()==='competitor'||String(s?.topic||'').toLowerCase()==='competition')return'конкурент';
  return'наблюдение';
}
function title(s){return String(s?.title||s?.text||s?.description||s?.detail||L('Значима промяна','Significant change')).trim()}
function utility(s){
  let v=N(s?.utility);
  if(v==null)try{v=N(window.BLISIntelligenceStreamV3?.utilityScore?.(s))}catch(_){ }
  return Math.max(0,Math.min(100,v||0));
}
function rank(s){const k=kind(s),base=k==='риск'?400:k==='конкурент'?300:k==='наблюдение'?200:100;return base+utility(s)}
function badge(k){
  if(k==='риск'||k==='risk')return{cls:'risk',text:L('Риск','Risk')};
  if(k==='конкурент'||k==='competitor')return{cls:'pressure',text:L('Конкурентен натиск','Competitive pressure')};
  if(k==='възможност'||k==='opportunity')return{cls:'good',text:L('Възможност','Opportunity')};
  return{cls:'watch',text:L('Наблюдение','Monitor')};
}
function meta(s){
  const parts=[];
  const source=s?.source||s?.source_key||s?.sourceKey||'';if(source)parts.push(String(source));
  const ev=N(s?.evidence_count);if(ev!=null)parts.push(`${ev} ${L('доказателства','evidence')}`);
  const u=utility(s);if(u>0)parts.push(`${L('значимост','utility')} ${Math.round(u)}/100`);
  return parts.join(' · ');
}
function css(){
  if(document.getElementById('blisRiskPrioritySyncCSS'))return;
  const st=document.createElement('style');st.id='blisRiskPrioritySyncCSS';st.textContent=`
  .blis-risk-priority{margin-top:14px!important;padding:18px 18px 14px!important}
  .blis-risk-priority-head{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-bottom:12px}
  .blis-risk-priority-head span{display:block;color:#6c8399;font-size:8px;font-weight:850;text-transform:uppercase;letter-spacing:.08em}
  .blis-risk-priority-head b{display:block;margin-top:5px;color:#173754;font-size:17px;line-height:1.25}
  .blis-risk-priority-head p{margin:0;max-width:650px;color:#7b8da0;font-size:9px;line-height:1.5;text-align:right}
  .blis-risk-priority-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .blis-risk-priority-item{appearance:none;border:1px solid #dde7f0;border-left:4px solid #9cafc1;background:#fff;border-radius:11px;padding:11px 12px;text-align:left;cursor:pointer;min-width:0}
  .blis-risk-priority-item.risk{border-left-color:#c75a54;background:linear-gradient(90deg,rgba(199,90,84,.065),#fff 35%)}
  .blis-risk-priority-item.pressure{border-left-color:#d49a3b;background:linear-gradient(90deg,rgba(212,154,59,.07),#fff 35%)}
  .blis-risk-priority-item.good{border-left-color:#3d956e}.blis-risk-priority-item.watch{border-left-color:#8ca0b4}
  .blis-risk-priority-item .rp-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px}
  .blis-risk-priority-item .rp-tag{font-size:7px;font-weight:850;text-transform:uppercase;letter-spacing:.06em;color:#667e94}
  .blis-risk-priority-item .rp-score{font-size:8px;font-weight:800;color:#8a9aab}
  .blis-risk-priority-item strong{display:block;color:#29465f;font-size:10px;line-height:1.4;white-space:normal}
  .blis-risk-priority-item small{display:block;margin-top:5px;color:#8997a7;font-size:7px;line-height:1.35}
  @media(max-width:900px){.blis-risk-priority-list{grid-template-columns:1fr}.blis-risk-priority-head{align-items:flex-start;flex-direction:column}.blis-risk-priority-head p{text-align:left}}
  `;document.head.appendChild(st);
}
function render(){
  const active=document.querySelector('.page.active')?.id;
  if(active!=='opportunities')return;
  const host=document.getElementById('opportunitiesBody')||document.getElementById('opportunities');if(!host)return;
  const rows=canonicalSignals();
  const map=host.querySelector('.sv2-riskmap');
  if(map){
    const q2=map.querySelector('.sv2-q.q2');if(q2)q2.textContent=L('Рисков приоритет','Risk priority');
  }
  const side=host.querySelector('.sv2-side');
  if(side){
    const boxes=side.querySelectorAll(':scope>div');
    if(boxes[1]){const s=boxes[1].querySelector('span');if(s)s.textContent=L('Рисков приоритет','Risk priority');const v=boxes[1].querySelector('strong');if(v)v.textContent=String(rows.filter(x=>['риск','risk','конкурент','competitor'].includes(kind(x))).length)}
  }
  host.querySelector('[data-blis-risk-priority]')?.remove();
  const parent=host.querySelector('.sv2');if(!parent)return;
  const section=document.createElement('section');section.className='sv2-card blis-risk-priority';section.dataset.blisRiskPriority='1';
  const sorted=rows.map((s,i)=>({s,i})).sort((a,b)=>rank(b.s)-rank(a.s)||a.i-b.i);
  const items=sorted.map(({s})=>{const k=kind(s),b=badge(k),u=utility(s),m=meta(s);return`<button type="button" class="blis-risk-priority-item ${b.cls}" data-risk-priority-signal="${E(title(s))}"><span class="rp-top"><span class="rp-tag">${E(b.text)}</span><span class="rp-score">${u?Math.round(u)+'/100':'—'}</span></span><strong>${E(translated(title(s)))}</strong>${m?`<small>${E(translated(m))}</small>`:''}</button>`}).join('');
  section.innerHTML=`<div class="blis-risk-priority-head"><div><span>${L('СЪЩИЯТ СИГНАЛЕН ПОТОК','SAME SIGNAL STREAM')}</span><b>${L('Рисков приоритет','Risk priority')}</b></div><p>${L('Същите потвърдени сигнали от „Важни сигнали“, подредени според ефекта им за клиента.','The same confirmed signals from Important Signals, ordered by their impact on the client.')}</p></div><div class="blis-risk-priority-list">${items||`<div class="sv2-answer">${L('Няма потвърдени сигнали за текущия период.','No confirmed signals for the current period.')}</div>`}</div>`;
  const cards=parent.querySelectorAll(':scope>section.sv2-card');const anchor=cards[cards.length-1];
  if(anchor)anchor.insertAdjacentElement('afterend',section);else parent.appendChild(section);
}
function burst(){requestAnimationFrame(render);setTimeout(render,80);setTimeout(render,260)}
css();
for(const ev of ['blis:routechange','blis:navigator-route','blis:clientdata','blis:periodchange','blis:intelligence','blis:client-perspective-ready'])window.addEventListener(ev,burst);
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-risk-priority-signal]');if(!b)return;const note=document.querySelector('#opportunitiesBody [data-router-risk-note],#opportunitiesBody [data-sv2-risknote]');if(note)note.textContent=b.dataset.riskPrioritySignal},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',burst,{once:true});else burst();
window.BLISRiskPrioritySyncV1={render,signals:canonicalSignals};
})();