/* BLIS Navigator - Black Sea Center fast Key Factors network.
   Client-specific first paint using already verified profile data.
   It renders immediately while the canonical interactive globe initializes. */
(function(){
'use strict';
if(window.__BLIS_BSC_FAST_NETWORK_V1)return;window.__BLIS_BSC_FAST_NETWORK_V1=true;
const KEY='black-sea-center';
const isBSC=()=>{try{return new URLSearchParams(location.search).get('client')===KEY||document.body?.dataset?.client===KEY||window.BLIS_INITIAL_CLIENT===KEY}catch(_){return false}};
if(!isBSC())return;
const FACTORS=[
 {id:'mentions',label:'Публични споменавания',value:'7 / 30 дни',x:50,y:17},
 {id:'news',label:'Медийни публикации',value:'2 / 30 дни',x:76,y:27},
 {id:'space',label:'Prime Real Estate',value:'65 000 кв.м',x:84,y:52},
 {id:'parking',label:'Паркоместа',value:'600+',x:72,y:76},
 {id:'offices',label:'Офис площи',value:'етажи 3 и 4',x:47,y:84},
 {id:'fitness',label:'Pulse Fitness & Spa',value:'5 000 кв.м',x:24,y:72},
 {id:'kids',label:'Детски център',value:'2 500 кв.м',x:16,y:46},
 {id:'tenant',label:'Потвърден търговски обект',value:'BabyPlanet',x:27,y:24}
];
const LINKS=[[0,1],[0,7],[1,2],[2,3],[2,4],[4,5],[5,6],[6,7],[7,0],[0,2],[0,4],[0,6]];
function css(){if(document.getElementById('bscFastNetworkCss'))return;const s=document.createElement('style');s.id='bscFastNetworkCss';s.textContent=`
.bsc-fast-network{border:1px solid #dfe7ee;border-radius:16px;background:linear-gradient(180deg,#fff,#f8fbff);padding:12px 14px 14px;box-shadow:0 8px 24px rgba(28,60,92,.04)}
.bsc-fast-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:8px}.bsc-fast-head h2{margin:0;color:#173e62;font-size:24px;letter-spacing:-.03em}.bsc-fast-head p{margin:4px 0 0;color:#74899d;font-size:9px}.bsc-fast-badge{border:1px solid #dbe5ed;border-radius:999px;padding:6px 9px;color:#4b6f8c;font-size:8px;font-weight:850;white-space:nowrap;background:#fff}
.bsc-fast-stage{position:relative;height:440px;overflow:hidden;border:1px solid #e2e9ef;border-radius:14px;background:radial-gradient(circle at 50% 50%,rgba(58,110,173,.08),rgba(58,110,173,.018) 40%,transparent 68%),linear-gradient(180deg,#fbfdff,#f7fbff)}
.bsc-fast-stage:before,.bsc-fast-stage:after{content:"";position:absolute;left:50%;top:50%;border:1px solid rgba(60,110,160,.14);border-radius:50%;transform:translate(-50%,-50%)}.bsc-fast-stage:before{width:58%;height:72%}.bsc-fast-stage:after{width:82%;height:52%}
.bsc-fast-links{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}.bsc-fast-links line{stroke:rgba(64,115,165,.24);stroke-width:1.1}
.bsc-fast-node{position:absolute;transform:translate(-50%,-50%);min-width:126px;max-width:160px;border:1px solid #dfe7ee;border-radius:11px;background:rgba(255,255,255,.96);padding:8px 10px;box-shadow:0 5px 14px rgba(34,66,99,.06);text-align:left;transition:transform .16s ease,box-shadow .16s ease;z-index:2}.bsc-fast-node:hover{transform:translate(-50%,-50%) scale(1.04);box-shadow:0 8px 20px rgba(34,66,99,.10)}.bsc-fast-node b{display:block;color:#31516e;font-size:8.5px;line-height:1.3}.bsc-fast-node small{display:block;margin-top:4px;color:#73889b;font-size:8px}.bsc-fast-node.main{border-color:#b7cce0;box-shadow:0 8px 24px rgba(42,91,137,.10)}
.bsc-fast-note{margin-top:8px;color:#7b8e9f;font-size:8px;line-height:1.4}
@media(max-width:800px){.bsc-fast-stage{height:520px}.bsc-fast-node{min-width:104px;max-width:118px;padding:7px 8px}.bsc-fast-head h2{font-size:21px}}
`;document.head.appendChild(s)}
function path(){const raw=document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview';return raw==='environment'?'market':raw}
function render(){
 if(!isBSC()||path()!=='market')return;
 const root=document.getElementById('marketBody');if(!root)return;
 if(root.querySelector('.pm-stage,.bsc-fast-network'))return;
 css();
 const lines=LINKS.map(([a,b])=>`<line x1="${FACTORS[a].x}%" y1="${FACTORS[a].y}%" x2="${FACTORS[b].x}%" y2="${FACTORS[b].y}%"></line>`).join('');
 const nodes=FACTORS.map((n,i)=>`<button class="bsc-fast-node${i===0?' main':''}" style="left:${n.x}%;top:${n.y}%" type="button"><b>${n.label}</b><small>${n.value}</small></button>`).join('');
 root.innerHTML=`<section class="bsc-fast-network" data-bsc-fast-network="1"><div class="bsc-fast-head"><div><h2>Ключови фактори</h2><p>Първоначална картина от потвърдените данни за Black Sea Center.</p></div><span class="bsc-fast-badge">30-дневна база</span></div><div class="bsc-fast-stage"><svg class="bsc-fast-links" preserveAspectRatio="none">${lines}</svg>${nodes}</div><div class="bsc-fast-note">Този бърз първи изглед използва вече потвърдените данни в профила. Интерактивният глобус се зарежда върху същата база, когато основният визуален модул е готов.</div></section>`;
}
function schedule(){render();setTimeout(render,25);setTimeout(render,90);setTimeout(render,220)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
['blis:routechange','blis:navigator-route','blis:clientdata','blis:production-ready','popstate'].forEach(ev=>window.addEventListener(ev,schedule));
document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-page="market"],#nav [data-n3-page="market"]'))setTimeout(render,0)},true);
})();