/* BLIS Navigator — native English owner for Competition in EN mode.
   Renders the Competition screen in English at source; no post-DOM translation required. */
(function(){
'use strict';
if(window.__BLIS_COMPETITION_EN_NATIVE_V1)return;window.__BLIS_COMPETITION_EN_NATIVE_V1=true;
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
const A=v=>Array.isArray(v)?v:[];
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,Number(v)||0));
const isEN=()=>{
  if(String(window.BLIS_LANGUAGE||'').toLowerCase()==='en')return true;
  if(String(document.documentElement.lang||'').toLowerCase().startsWith('en'))return true;
  try{return localStorage.getItem('blis.language.v1')==='en'}catch(_){return false}
};
const F=(v,d=1)=>v==null?'—':Number(v).toLocaleString('en-US',{maximumFractionDigits:d});
const D=()=>window.D||{};
const days=()=>window.BLISPeriod?.days||30;
const currentClient=()=>D().name||document.querySelector('.client-brand-name')?.textContent||'Your brand';
const host=()=>document.getElementById('competitionBody')||document.getElementById('competition');
function compRows(){
  const dn=String(currentClient()).trim().toLowerCase();
  let rows=A(D().competitors).map((x,i)=>({
    raw:x,
    name:x?.name||x?.label||`Competitor ${i+1}`,
    score:N(x?.score??x?.value),
    trend:N(x?.trend),
    client:Boolean(x?.isClient||x?.is_client||x?.client)
  })).filter(x=>x.score!=null).sort((a,b)=>b.score-a.score).slice(0,10);
  const own=rows.findIndex(x=>x.client||String(x.name).trim().toLowerCase()===dn||dn.startsWith(String(x.name).trim().toLowerCase())||String(x.name).trim().toLowerCase().startsWith(dn));
  return rows.map((x,i)=>({...x,rank:i+1,isClient:i===own||x.client}));
}
function ensureCss(originalCompetition){
  if(document.getElementById('blisVisualSuiteV1Css'))return;
  try{originalCompetition?.()}catch(_){ }
}
function renderCompetitionEN(originalCompetition){
  if(!isEN())return false;
  const h=host();if(!h)return false;
  ensureCss(originalCompetition);
  const rows=compRows(),own=rows.find(x=>x.isClient),lead=rows[0];
  const vals=rows.map(x=>x.score),lo=vals.length?Math.min(...vals):0,hi=vals.length?Math.max(...vals):100,span=Math.max(1,hi-lo),min=lo-span*.12,max=hi+span*.12;
  const html=rows.length?rows.map(x=>{
    const pct=clamp((x.score-min)/(max-min)*100,2,98);
    const context=x.isClient?'Your brand':x.trend==null?'no measurable change':`${x.trend>0?'+':''}${F(x.trend)} vs previous period`;
    const tip=`${x.name} · position ${x.rank} · score ${F(x.score)}`;
    return `<div class="vs-comp-row ${x.isClient?'client':''}" data-comp-tip="${E(tip)}"><span class="vs-rank">${x.rank}</span><div class="vs-comp-name"><b>${E(x.name)}</b><small>${E(context)}</small></div><div class="vs-track"><i style="width:${pct}%"></i><u style="left:${pct}%"></u></div><span class="vs-comp-score">${F(x.score,0)}</span></div>`;
  }).join(''):`<div class="vs-note">There is not enough comparable competitive data.</div>`;
  const ans=!rows.length?'There is not enough comparable data for a reliable ranking.':!own?'Comparable data is available, but the client is not reliably identified in the current set.':own.rank===1?'The brand leads the current comparison set.':`The brand ranks ${own.rank} of ${rows.length}.`;
  const next=window.BLISSystemStructure?.next?.('competition')||'';
  h.innerHTML=`<div class="vs-page"><div class="vs-head"><div><span class="vs-num">6.</span><h2>Competition</h2><p>Competitive compass</p></div><span class="vs-period">${days()} days</span></div><div class="vs-answer"><span>Short answer</span><b>${E(ans)}</b></div><section class="vs-visual"><div class="vs-vhead"><div><span>Key visualization</span><b>Competitive position</b></div><em>Interactive</em></div><div class="vs-comp-core"><div class="vs-comp-axis">${html}</div><div class="vs-comp-scale"><span>lower score</span><span>higher score</span></div><div class="vs-comp-note" data-comp-note>Select a company for brief context.</div></div></section><div class="vs-mini-grid"><div class="vs-mini"><span>Position</span><strong>${own?`${own.rank}/${rows.length}`:'—'}</strong></div><div class="vs-mini"><span>Leader</span><b>${E(lead?.name||'—')}</b></div><div class="vs-mini ${own&&lead&&own.score<lead.score?'warn':'good'}"><span>Gap to leader</span><strong>${own&&lead?F(own.score-lead.score):'—'}</strong></div></div>${next}</div>`;
  try{window.BLISSystemStructure?.bind?.(h)}catch(_){ }
  document.body?.classList.add('blis-competition-ready');
  return true;
}
function patch(){
  const suite=window.BLISVisualSuiteV1;
  if(!suite||typeof suite.render!=='function')return false;
  if(suite.__competitionEnNativeV1)return true;
  suite.__competitionEnNativeV1=true;
  const originalRender=suite.render.bind(suite);
  const originalCompetition=typeof suite.competition==='function'?suite.competition.bind(suite):null;
  suite.competition=function(){return isEN()?renderCompetitionEN(originalCompetition):originalCompetition?.()};
  suite.render=function(id){if(id==='competition'&&isEN())return renderCompetitionEN(originalCompetition);return originalRender(id)};
  const rerender=()=>{const active=document.querySelector('.page.active')?.id;if(active==='competition'&&isEN())requestAnimationFrame(()=>renderCompetitionEN(originalCompetition))};
  for(const ev of ['blis:routechange','blis:clientdata','blis:periodchange','blis:rendered'])window.addEventListener(ev,rerender);
  rerender();setTimeout(rerender,80);setTimeout(rerender,350);setTimeout(rerender,1000);
  return true;
}
let tries=0;const timer=setInterval(()=>{tries++;if(patch()||tries>80)clearInterval(timer)},25);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{patch()},{once:true});else patch();
})();
