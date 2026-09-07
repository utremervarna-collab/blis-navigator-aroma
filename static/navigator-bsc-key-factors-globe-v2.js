/* BLIS Navigator - Black Sea Center Key Factors globe v2.
   Client-specific verified-data owner for Environment/Market.
   Renders a real interactive globe immediately and never shows synthetic zero values. */
(function(){
'use strict';
if(window.__BLIS_BSC_KEY_FACTORS_GLOBE_V2)return;window.__BLIS_BSC_KEY_FACTORS_GLOBE_V2=true;
const KEY='black-sea-center';
const isBSC=()=>{try{return new URLSearchParams(location.search).get('client')===KEY||document.body?.dataset?.client===KEY||window.BLIS_INITIAL_CLIENT===KEY}catch(_){return false}};
if(!isBSC())return;
const F=[
 {id:'mentions',label:'Публични споменавания',value:'7 за 30 дни',cat:'search',gx:0.00,gy:-0.78,gz:0.62},
 {id:'news',label:'Медийни публикации',value:'2 за 30 дни',cat:'content',gx:0.62,gy:-0.48,gz:0.62},
 {id:'space',label:'Prime Real Estate',value:'65 000 кв.м',cat:'behavior',gx:0.88,gy:0.02,gz:0.34},
 {id:'parking',label:'Паркоместа',value:'600+',cat:'behavior',gx:0.62,gy:0.58,gz:0.48},
 {id:'offices',label:'Офис площи',value:'етажи 3 и 4',cat:'content',gx:0.00,gy:0.82,gz:0.56},
 {id:'fitness',label:'Pulse Fitness & Spa',value:'5 000 кв.м',cat:'social',gx:-0.64,gy:0.56,gz:0.52},
 {id:'kids',label:'Детски център',value:'2 500 кв.м',cat:'social',gx:-0.88,gy:0.02,gz:0.30},
 {id:'tenant',label:'Потвърден търговски обект',value:'BabyPlanet',cat:'reviews',gx:-0.60,gy:-0.52,gz:0.58}
];
const L=[['mentions','news'],['mentions','tenant'],['mentions','space'],['mentions','offices'],['news','space'],['space','parking'],['space','offices'],['offices','fitness'],['fitness','kids'],['kids','tenant'],['tenant','mentions']];
const color={search:'#2979ff',social:'#7b61ff',reviews:'#f3a43b',content:'#20a77a',behavior:'#df5f8b'};
let painting=false;
function route(){const r=document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';return r==='environment'?'market':r}
function css(){if(document.getElementById('bscGlobeV2Css'))return;const s=document.createElement('style');s.id='bscGlobeV2Css';s.textContent=`
#marketBody .bsc-globe-v2{border:1px solid #dfe7ee;border-radius:16px;background:#fff;padding:12px 14px 14px;box-shadow:0 8px 24px rgba(28,60,92,.04)}
#marketBody .bsc-g-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px}#marketBody .bsc-g-head h2{margin:0;color:#173e62;font-size:24px;letter-spacing:-.03em}#marketBody .bsc-g-head p{margin:4px 0 0;color:#74899d;font-size:9px}#marketBody .bsc-g-badge{border:1px solid #dbe5ed;border-radius:999px;padding:6px 9px;color:#4b6f8c;font-size:8px;font-weight:850;background:#fff;white-space:nowrap}
#marketBody .bsc-g-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 0 9px}#marketBody .bsc-g-kpi{border:1px solid #e1e8ee;border-radius:11px;padding:8px 10px;background:#fbfdff}#marketBody .bsc-g-kpi span{display:block;color:#8394a3;font-size:7px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}#marketBody .bsc-g-kpi b{display:block;margin-top:4px;color:#31516e;font-size:14px}
#marketBody .pm-stage.bsc-stage{height:470px;min-height:470px;position:relative;overflow:hidden;border:1px solid #e2e9ef;border-radius:15px;background:radial-gradient(circle at 50% 48%,rgba(54,110,170,.10),rgba(54,110,170,.02) 42%,transparent 70%),linear-gradient(180deg,#fbfdff,#f7fbff);cursor:grab}#marketBody .pm-stage.bsc-stage.pm-globe-drag{cursor:grabbing}
#marketBody .bsc-stage .pm-canvas{position:absolute;inset:0}#marketBody .bsc-stage .pm-links{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}#marketBody .bsc-stage .pm-link{fill:none;stroke:rgba(58,106,152,.28);stroke-width:1.15}
#marketBody .bsc-stage .pm-node{position:absolute;transform:translate(-50%,-50%) scale(var(--gscale,1));transform-origin:center;min-width:122px;max-width:158px;border:1px solid #dce6ee;border-radius:11px;background:rgba(255,255,255,.96);padding:8px 10px;box-shadow:0 5px 16px rgba(34,66,99,.08);text-align:left;transition:box-shadow .15s ease;will-change:left,top,transform,opacity}#marketBody .bsc-stage .pm-node:hover{box-shadow:0 10px 24px rgba(34,66,99,.13)}#marketBody .bsc-stage .pm-node b{display:block;color:#31516e;font-size:8.5px;line-height:1.3}#marketBody .bsc-stage .pm-node small{display:block;margin-top:4px;color:#6f8598;font-size:8px}#marketBody .bsc-stage .pm-node i{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:5px;background:var(--node)}
#marketBody .bsc-g-foot{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px}#marketBody .bsc-g-card{border:1px solid #e2e8ee;border-radius:11px;background:#fbfdff;padding:9px 10px}#marketBody .bsc-g-card b{display:block;color:#38566f;font-size:8px}#marketBody .bsc-g-card small{display:block;margin-top:4px;color:#7b8e9f;font-size:7.5px;line-height:1.4}
@media(max-width:900px){#marketBody .bsc-g-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#marketBody .bsc-g-foot{grid-template-columns:1fr}#marketBody .pm-stage.bsc-stage{height:540px;min-height:540px}}
`;document.head.appendChild(s)}
function node(n){return `<button type="button" class="pm-node" data-node="${n.id}" data-gx="${n.gx}" data-gy="${n.gy}" data-gz="${n.gz}" style="left:50%;top:50%;--node:${color[n.cat]}"><b><i></i>${n.label}</b><small>${n.value}</small></button>`}
function links(){return L.map(([a,b])=>`<path class="pm-link" data-a="${a}" data-b="${b}" d="M500 295 Q500 250 500 295"></path>`).join('')}
function paint(){
 if(painting||!isBSC()||route()!=='market')return;const root=document.getElementById('marketBody');if(!root)return;
 painting=true;try{
  css();
  root.innerHTML=`<section class="bsc-globe-v2"><div class="bsc-g-head"><div><h2>Ключови фактори</h2><p>Проверими фактори и връзки за Black Sea Center, базирани на наличните данни в клиентския профил.</p></div><span class="bsc-g-badge">30-дневна база</span></div><div class="bsc-g-kpis"><div class="bsc-g-kpi"><span>Публични споменавания</span><b>7</b></div><div class="bsc-g-kpi"><span>Медийни публикации</span><b>2</b></div><div class="bsc-g-kpi"><span>Prime Real Estate</span><b>65 000 кв.м</b></div><div class="bsc-g-kpi"><span>Паркоместа</span><b>600+</b></div></div><div class="pm-stage network depth bsc-stage"><div class="pm-canvas"><svg class="pm-links" viewBox="0 0 1000 590" preserveAspectRatio="none">${links()}</svg>${F.map(node).join('')}</div></div><div class="bsc-g-foot"><div class="bsc-g-card"><b>Офис площи</b><small>Публично предлагани площи на етажи 3 и 4.</small></div><div class="bsc-g-card"><b>Лайфстайл и услуги</b><small>Pulse Fitness & Spa 5 000 кв.м, детски център 2 500 кв.м и потвърден търговски обект BabyPlanet.</small></div></div></section>`;
  setTimeout(()=>{try{window.BLISPerceptionGlobe?.apply?.()}catch(_){}},0);
  setTimeout(()=>{try{window.BLISPerceptionGlobe?.apply?.()}catch(_){}},120);
 }finally{painting=false}
}
function schedule(){paint();setTimeout(paint,40);setTimeout(paint,180);setTimeout(paint,500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
['blis:routechange','blis:navigator-route','blis:clientdata','blis:production-ready','blis:intelligence','popstate'].forEach(ev=>window.addEventListener(ev,schedule));
document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-page="market"],#nav [data-n3-page="market"]'))setTimeout(paint,0)},true);
const rootObserver=new MutationObserver(()=>{if(painting||route()!=='market')return;const r=document.getElementById('marketBody');if(r&&!r.querySelector('.bsc-globe-v2'))requestAnimationFrame(paint)});
setTimeout(()=>{const r=document.getElementById('marketBody');if(r)rootObserver.observe(r,{childList:true})},600);
})();