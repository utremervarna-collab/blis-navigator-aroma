/* BLIS Navigator — Competition visual repair v1.
   Replaces the misleading clustered 2D field with one honest comparison axis. */
(function(){
'use strict';
if(window.__BLIS_COMPETITION_LAYOUT_FIX_V1)return;window.__BLIS_COMPETITION_LAYOUT_FIX_V1=true;
const N=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
const fmt=v=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
const norm=s=>String(s||'').trim().toLowerCase();
function active(){return document.getElementById('competition')?.classList.contains('active')||new URLSearchParams(location.search).get('page')==='competition'}
function clientName(){return window.D?.name||document.querySelector('.client-brand-name')?.textContent||''}
function scoreOf(x){
  for(const k of ['score','value','competitive_score','competition_score','index','visibility']){const n=N(x?.[k]);if(n!=null)return n}
  const deny=new Set(['trend','rank','confidence','evidence_count']);
  const vals=Object.entries(x||{}).filter(([k])=>!deny.has(k)).map(([,v])=>N(v)).filter(v=>v!=null&&v>=0&&v<=100);
  return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:null;
}
function rows(){
  const raw=Array.isArray(window.D?.competitors)?window.D.competitors:[];
  const dn=norm(clientName());
  const out=raw.map((x,i)=>({name:x?.name||x?.label||`Конкурент ${i+1}`,score:scoreOf(x),trend:N(x?.trend)})).filter(x=>x.score!=null).sort((a,b)=>b.score-a.score).slice(0,8);
  let own=out.findIndex(x=>{const n=norm(x.name);return n===dn||(n&&dn&&(dn.startsWith(n)||n.startsWith(dn)))});
  return out.map((x,i)=>({...x,rank:i+1,isClient:i===own}));
}
function css(){if(document.getElementById('blisCmpLadderCss'))return;const s=document.createElement('style');s.id='blisCmpLadderCss';s.textContent=`
.cmp-ladder{margin:12px 16px 16px;border:1px solid #e7edf3;border-radius:14px;background:linear-gradient(180deg,#fbfdff,#fff);padding:14px 14px 10px}.cmp-ladder-axis,.cmp-ladder-row{display:grid;grid-template-columns:38px minmax(150px,220px) minmax(220px,1fr);gap:12px;align-items:center}.cmp-ladder-axis{margin-bottom:6px}.cmp-ladder-axis-track{display:flex;justify-content:space-between;color:#94a2b1;font-size:7px}.cmp-ladder-row{min-height:48px;border-top:1px solid #edf1f5;padding:6px 0;border-radius:10px}.cmp-ladder-row:first-of-type{border-top:0}.cmp-ladder-row.client{background:#f3f8fe}.cmp-ladder-rank{width:28px;height:28px;border-radius:9px;background:#edf2f7;color:#4e6680;display:grid;place-items:center;font-size:9px;font-weight:900}.cmp-ladder-row.client .cmp-ladder-rank{background:#1f65b7;color:#fff}.cmp-ladder-name{min-width:0;color:#34516d;font-size:9px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cmp-ladder-name small{display:block;margin-top:2px;color:#1f65b7;font-size:7px;font-weight:850}.cmp-ladder-track{position:relative;height:24px;border-radius:999px;background:linear-gradient(90deg,#eef3f7,#f7f9fb);box-shadow:inset 0 0 0 1px #edf1f5}.cmp-ladder-track:before{content:'';position:absolute;left:8px;right:8px;top:50%;height:1px;background:#d9e2ea}.cmp-ladder-marker{position:absolute;top:50%;transform:translate(-50%,-50%);width:16px;height:16px;border:3px solid #fff;border-radius:50%;background:#6c89a8;box-shadow:0 3px 10px rgba(42,70,100,.20);cursor:pointer}.cmp-ladder-marker:hover,.cmp-ladder-marker.active{transform:translate(-50%,-50%) scale(1.22);z-index:3}.cmp-ladder-row.client .cmp-ladder-marker{width:20px;height:20px;background:#1f65b7;box-shadow:0 4px 12px rgba(31,101,183,.28)}.cmp-ladder-caption{margin:8px 0 0;color:#8594a5;font-size:7px;line-height:1.45}.cmp-ladder-empty{padding:24px;text-align:center;color:#77889a;font-size:9px}@media(max-width:760px){.cmp-ladder{margin:10px 10px 14px;padding:10px}.cmp-ladder-axis,.cmp-ladder-row{grid-template-columns:32px minmax(100px,135px) minmax(150px,1fr);gap:8px}.cmp-ladder-name{font-size:8px}}
`;document.head.appendChild(s)}
function ladder(r){
  if(!r.length)return'<div class="cmp-ladder-empty">Няма достатъчно сравнима конкурентна база.</div>';
  const vals=r.map(x=>x.score),mn=Math.min(...vals),mx=Math.max(...vals),mid=(mn+mx)/2,span=Math.max(mx-mn,20),lo=mid-span/2,hi=mid+span/2;
  const pos=v=>6+Math.max(0,Math.min(1,(v-lo)/(hi-lo)))*88;
  return `<div class="cmp-ladder"><div class="cmp-ladder-axis"><span></span><span></span><div class="cmp-ladder-axis-track"><span>по-слаба позиция</span><span>по-силна позиция</span></div></div>${r.map(x=>`<div class="cmp-ladder-row ${x.isClient?'client':''}"><span class="cmp-ladder-rank">${x.rank}</span><div class="cmp-ladder-name">${E(x.name)}${x.isClient?'<small>Вашият бранд</small>':''}</div><div class="cmp-ladder-track"><button type="button" class="cmp-ladder-marker" style="left:${pos(x.score)}%" data-cmp-ladder-tip="${E(x.name)} · позиция ${x.rank} · сравнителен резултат ${fmt(x.score)}/100${x.trend==null?'':` · промяна ${x.trend>0?'+':''}${fmt(x.trend)}`}"></button></div></div>`).join('')}<p class="cmp-ladder-caption">Позициите са показани върху адаптивна сравнителна скала за текущия конкурентен набор; точната стойност се вижда при избор.</p></div>`;
}
function render(){
  if(!active())return false;css();
  const visual=document.querySelector('#competitionBody .exec-visual[data-exec="competition"]');
  if(!visual)return false;
  const r=rows(),head=visual.querySelector('.exec-visual-head');
  if(head){const b=head.querySelector('b'),p=head.querySelector('p');if(b)b.textContent='Конкурентно класиране';if(p)p.textContent='Ясна относителна позиция на една ос; точната стойност е достъпна при избор.'}
  visual.querySelector('.exec-field')?.remove();
  visual.querySelector('.cmp-ladder')?.remove();
  visual.querySelector('.exec-empty')?.remove();
  const note=visual.querySelector('[data-exec-note]');
  if(note)note.insertAdjacentHTML('beforebegin',ladder(r));else visual.insertAdjacentHTML('beforeend',ladder(r)+'<div class="exec-note" data-exec-note>Изберете конкурент, за да видите точния контекст.</div>');
  return true;
}
function later(){[40,140,320,700,1200].forEach(ms=>setTimeout(render,ms))}
document.addEventListener('click',e=>{const t=e.target.closest?.('[data-cmp-ladder-tip]');if(!t)return;const visual=t.closest('.exec-visual'),note=visual?.querySelector('[data-exec-note]');visual?.querySelectorAll('.cmp-ladder-marker.active').forEach(x=>x.classList.remove('active'));t.classList.add('active');if(note)note.textContent=t.dataset.cmpLadderTip},true);
window.addEventListener('blis:routechange',e=>{if(e.detail?.page==='competition')later()});
window.addEventListener('blis:clientdata',later);window.addEventListener('blis:intelligence',later);window.addEventListener('blis:periodchange',later);window.addEventListener('blis:production-ready',later);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',later,{once:true});else later();
})();
