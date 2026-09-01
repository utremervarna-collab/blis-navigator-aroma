/* BLIS Navigator 3.0 — клиентски бриф v1.
   Кратък фактологичен вход към свързания анализ: състояние, промяна, репутация,
   конкурентна позиция и текущи рискове/възможности. Само налични данни за активния клиент. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_3_CLIENT_BRIEF_V1)return;
window.__BLIS_NAVIGATOR_3_CLIENT_BRIEF_V1=true;

const A=x=>Array.isArray(x)?x:[];
const N=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const F=(v,d=1)=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:d});
const D=()=>window.D||{};
const H=()=>A(window.H);
const sigs=()=>{try{return window.BLISIntelligenceStreamV3?.getUsefulSignals?.()||[]}catch(_){return[]}};
const client=()=>D().name||document.querySelector('.bch3-name')?.textContent||'Клиент';
function idx(keys){for(const k of keys){const hit=A(D().indices).find(x=>String(x?.key||'').toLowerCase()===k);const v=N(hit?.value);if(v!=null)return v}return null}
function historyScore(){const out=[];H().forEach(r=>{const v=N((r?.payload||{}).blis_index),t=Date.parse(r?.created_at||r?.observed_at||r?.time||'');if(v!=null&&Number.isFinite(t))out.push({t,v})});return out.sort((a,b)=>a.t-b.t)}
function change(){try{const s=window.BLISPeriod?.dailySeries?.('blis')||[];if(s.length>1){const a=N(s.at(-2)?.value),b=N(s.at(-1)?.value);if(a!=null&&b!=null)return b-a}}catch(_){}const h=historyScore();return h.length>1?h.at(-1).v-h.at(-2).v:null}
function kind(s){if(s?.kind)return s.kind;if(s?.sentiment==='negative'||['critical','high'].includes(s?.severity))return'риск';if(s?.sentiment==='positive')return'възможност';if(s?.scope==='competitor'||s?.topic==='competition')return'конкурент';return'наблюдение'}
function competitorPosition(){
  const rows=A(D().competitors).map((x,i)=>({name:String(x?.name||x?.label||`Конкурент ${i+1}`),score:N(x?.score??x?.value),client:Boolean(x?.isClient||x?.is_client||x?.client)})).filter(x=>x.score!=null).sort((a,b)=>b.score-a.score);
  if(!rows.length)return null;const dn=client().trim().toLowerCase();let at=rows.findIndex(x=>x.client||x.name.trim().toLowerCase()===dn||dn.startsWith(x.name.trim().toLowerCase())||x.name.trim().toLowerCase().startsWith(dn));if(at<0)return{position:null,total:rows.length,leader:rows[0].name};return{position:at+1,total:rows.length,leader:rows[0].name,gap:rows[at].score-rows[0].score}
}
function state(score){return score==null?'Няма достатъчно данни за обща оценка.':score>=80?'Общото състояние е силно.':score>=65?'Общото състояние е стабилно.':score>=50?'Картината е смесена и има зони за внимание.':'Общото състояние изисква внимание.'}
function deltaText(d){return d==null?'Няма достатъчно сравнима история.':Math.abs(d)<.05?'Няма съществена промяна спрямо предходното измерване.':d>0?`Последното измерване е с ${F(Math.abs(d))} т. по-високо.`:`Последното измерване е с ${F(Math.abs(d))} т. по-ниско.`}
function css(){if(document.getElementById('navigator3ClientBriefCss'))return;const s=document.createElement('style');s.id='navigator3ClientBriefCss';s.textContent=`
.n3b{margin:0 0 14px;border:1px solid #dce6ef;border-radius:16px;background:linear-gradient(180deg,#fff,#fbfdff);box-shadow:0 9px 28px rgba(25,58,91,.045);padding:15px;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif}.n3b-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.n3b-head span{display:block;color:#7d91a4;font-size:7px;text-transform:uppercase;letter-spacing:.08em;font-weight:900}.n3b-head h3{margin:4px 0 0;color:#183d60;font-size:17px}.n3b-head p{margin:5px 0 0;color:#71869a;font-size:9px;line-height:1.5}.n3b-period{border:1px solid #dce7f0;border-radius:999px;background:#f8fbfe;color:#60788e;padding:6px 9px;font-size:7.5px;font-weight:850;white-space:nowrap}.n3b-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:12px}.n3b-card{border:1px solid #e4eaf1;border-radius:12px;background:#fff;padding:11px;min-width:0;text-align:left;cursor:pointer;transition:.14s ease}.n3b-card:hover{border-color:#bfd4e7;box-shadow:0 6px 18px rgba(31,84,132,.07);transform:translateY(-1px)}.n3b-card span{display:block;color:#8495a6;font-size:7px;text-transform:uppercase;letter-spacing:.05em;font-weight:900}.n3b-card strong{display:block;margin-top:5px;color:#234a6e;font-size:15px;line-height:1.15}.n3b-card b{display:block;margin-top:6px;color:#35536f;font-size:8.5px;line-height:1.4}.n3b-card small{display:block;margin-top:5px;color:#7f90a1;font-size:7.5px;line-height:1.4}.n3b-card.risk{border-top:3px solid #c85d56}.n3b-card.good{border-top:3px solid #3c956e}.n3b-card.warn{border-top:3px solid #d0a04b}.n3b-card.info{border-top:3px solid #3b7eb9}.n3b-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:10px;padding-top:10px;border-top:1px solid #edf1f5;color:#76899b;font-size:8px}.n3b-foot b{color:#34546f}.n3b-foot button{border:0;background:transparent;color:#2163a3;font-size:8px;font-weight:850;cursor:pointer}@media(max-width:1100px){.n3b-list{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:720px){.n3b-list{grid-template-columns:1fr}.n3b-head,.n3b-foot{flex-direction:column;align-items:flex-start}}
`;document.head.appendChild(s)}
function render(){
  if(document.querySelector('.page.active')?.id!=='overview')return;const host=document.getElementById('overviewPremium')||document.getElementById('overview');if(!host)return;host.querySelector('[data-n3b]')?.remove();
  const score=N(D().blis_index),d=change(),rep=idx(['reputation','reputation_index']),rows=sigs(),top=rows[0],risks=rows.filter(x=>kind(x)==='риск').length,opps=rows.filter(x=>kind(x)==='възможност').length,comp=competitorPosition(),days=window.BLISPeriod?.days||30;
  const topTitle=top?String(top.title||top.text||'Значим сигнал').trim():'Няма нов сигнал над прага';
  const cards=[
    {page:'overview',cls:'info',k:'Общо състояние',v:score==null?'—':F(score,0),b:state(score),s:deltaText(d)},
    {page:'social',cls:kind(top)==='риск'?'risk':kind(top)==='възможност'?'good':'info',k:'Най-важна промяна',v:top?`${Number(top.utility||0)}/100`:'—',b:topTitle,s:top?'Значимост на сигнала':'Няма нова достатъчно силна промяна'},
    {page:'reputation',cls:rep!=null&&rep<55?'risk':rep!=null&&rep>=75?'good':'warn',k:'Репутация',v:rep==null?'—':F(rep,0),b:rep==null?'Няма достатъчно база.':rep>=75?'Силно репутационно състояние.':rep>=55?'Стабилно, с теми за наблюдение.':'Изисква внимание.',s:'Отворете страницата за конкретните теми'},
    {page:'competition',cls:comp?.position===1?'good':'info',k:'Конкурентна позиция',v:comp?.position?`${comp.position}/${comp.total}`:'—',b:comp?.position?`Позиция в наблюдавания набор.`:'Няма надеждно идентифицирана позиция.',s:comp?.leader?`Текущ лидер: ${comp.leader}`:'Сравнимата база още се натрупва'},
    {page:'opportunities',cls:risks?'risk':opps?'good':'info',k:'Решения',v:`${risks} / ${opps}`,b:`${risks} рискови · ${opps} възможности`,s:'Отворете картата за приоритетите'}
  ];
  const box=document.createElement('section');box.className='n3b';box.dataset.n3b='1';box.innerHTML=`<div class="n3b-head"><div><span>Клиентски бриф</span><h3>Какво трябва да знаете сега</h3><p>${E(client())} · петте факта, които свързват текущото състояние с останалите страници на анализа.</p></div><div class="n3b-period">Последните ${Number(days)} дни</div></div><div class="n3b-list">${cards.map(c=>`<button type="button" class="n3b-card ${c.cls}" data-n3b-page="${c.page}"><span>${E(c.k)}</span><strong>${E(c.v)}</strong><b>${E(c.b)}</b><small>${E(c.s)}</small></button>`).join('')}</div><div class="n3b-foot"><span><b>Четете отляво надясно:</b> състояние → промяна → репутация → конкуренция → решения.</span><button type="button" data-n3b-page="social">Продължи към Важни сигнали →</button></div>`;
  const anchor=host.querySelector('[data-n3e-overview]')||host.querySelector('.nv3-story');if(anchor)anchor.insertAdjacentElement('afterend',box);else host.prepend(box);document.documentElement.dataset.navigatorBrief='client-brief-v1';
}
let pending=false;function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;render()})}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-n3b-page]');if(!b)return;e.preventDefault();window.refGo?.(b.dataset.n3bPage)},true);window.addEventListener('blis:routechange',()=>setTimeout(schedule,50));window.addEventListener('blis:clientdata',()=>setTimeout(schedule,90));window.addEventListener('blis:intelligence',()=>setTimeout(schedule,90));
const mo=new MutationObserver(()=>{if(document.querySelector('.page.active')?.id==='overview'&&!document.querySelector('[data-n3b]'))schedule()});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{css();mo.observe(document.getElementById('overview')||document.body,{childList:true,subtree:true});schedule()},{once:true});else{css();mo.observe(document.getElementById('overview')||document.body,{childList:true,subtree:true});schedule()}
window.BLISNavigator3ClientBriefV1={render};
})();
