/* BLIS Navigator — Attitudes Master V2. Keeps the approved globe and current terminology. */
(function(){
'use strict';
let timer=0,observer=null,busy=false;
const pairs=[
 ['Карта на потребителското възприятие','Нагласи'],
 ['Карта на възприятията','Нагласи'],
 ['Мрежа на нагласите','Нагласи'],
 ['3D мрежа на възприятията','НАГЛАСИ В РЕАЛНО ВРЕМЕ'],
 ['3D мрежа на нагласите','НАГЛАСИ В РЕАЛНО ВРЕМЕ'],
 ['Индекс на възприятието','Индекс на нагласите'],
 ['потребителските сигнали и възприятия','проверимите сигнали и нагласи'],
 ['възприятия за бранда','нагласи към бранда'],
 ['Динамика на индекса','Динамика на нагласите'],
 ['Натрупва се база','Текущи измервания'],
 ['Натрупва се достатъчна база','Текущи измервания'],
 ['Няма достатъчна измерима база.','Текущи измервания'],
 ['няма сравнима история','текуща стойност']
];
function ctx(){let d={},a=[],s=[];try{if(typeof window!=='undefined'&&window.D)d=window.D;else if(typeof D!=='undefined'&&D)d=D}catch(_){}try{if(typeof window!=='undefined'&&Array.isArray(window.A))a=window.A;else if(typeof A!=='undefined'&&Array.isArray(A))a=A}catch(_){}try{if(typeof window!=='undefined'&&Array.isArray(window.S))s=window.S;else if(typeof S!=='undefined'&&Array.isArray(S))s=S}catch(_){}return{d,a,s}}
function latest(){const {d,a}=ctx(),t=[];(d?.signals||[]).forEach(x=>{const v=new Date(x.time||x.created_at||x.createdAt||0).getTime();if(v)t.push(v)});a.forEach(x=>{const v=new Date(x.time||x.observed_at||x.created_at||x.timestamp||0).getTime();if(v)t.push(v)});return t.length?Math.max(...t):null}
function elapsed(t){if(!t)return'LIVE';let s=Math.max(0,Math.floor((Date.now()-t)/1000)),h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);s%=60;return[h,m,s].map(v=>String(v).padStart(2,'0')).join(':')}
function css(){if(document.getElementById('attMasterV2CSS'))return;const st=document.createElement('style');st.id='attMasterV2CSS';st.textContent=`
#market .att-v2-live{display:flex;align-items:center;gap:8px;height:36px;padding:0 11px;border:1px solid #dce7e3;border-radius:9px;background:#f8fcfa;margin-left:8px;white-space:nowrap}#market .att-v2-live i{width:8px;height:8px;border-radius:50%;background:#14a56c;animation:attPulse 1.35s infinite}#market .att-v2-clock{font-size:10px;font-weight:850;color:#0d765c;font-variant-numeric:tabular-nums}#market .att-v2-meta{font-size:7px;color:#84909f}#market .pm-maphead>div:first-of-type:before{content:'НАГЛАСИ В РЕАЛНО ВРЕМЕ'!important}#market .pm-maphead>div:first-of-type:after{content:'●  LIVE'!important}body.pm-market-active #blisActiveModule{white-space:nowrap}@keyframes attPulse{0%{box-shadow:0 0 0 0 rgba(20,165,108,.32)}70%{box-shadow:0 0 0 8px rgba(20,165,108,0)}100%{box-shadow:0 0 0 0 rgba(20,165,108,0)}}@media(max-width:900px){#market .att-v2-meta{display:none}}
`;document.head.appendChild(st)}
function replaceText(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||/SCRIPT|STYLE|TEXTAREA|INPUT|OPTION/.test(p.tagName))return NodeFilter.FILTER_REJECT;return pairs.some(([a])=>(n.nodeValue||'').includes(a))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(n=>{let t=n.nodeValue||'';pairs.forEach(([a,b])=>t=t.split(a).join(b));n.nodeValue=t})}
function mount(){if(busy)return;busy=true;try{css();const market=document.getElementById('market');if(!market)return;const nav=document.querySelector('#nav [data-page="market"] .navtxt');if(nav)nav.textContent='Нагласи';const h=market.querySelector('.pm-hero h2');if(h)h.textContent='Нагласи';const p=market.querySelector('.pm-hero p');if(p)p.textContent='Проверими теми, сигнали и връзки, които оформят нагласите към марката.';const mh=market.querySelector('.pm-maphead b');if(mh)mh.textContent='НАГЛАСИ В РЕАЛНО ВРЕМЕ';const ms=market.querySelector('.pm-maphead small');if(ms){const n=market.querySelectorAll('.pm-node').length;ms.textContent=`${n} активни елемента в сферичната карта`}const sys=document.getElementById('blisActiveModule');if(market.classList.contains('active')&&sys)sys.textContent='Нагласи';const detail=document.getElementById('blisSystemDetail');if(market.classList.contains('active')&&detail)detail.textContent='Проверими теми, връзки, динамика и източници';let live=market.querySelector('.att-v2-live');const anchor=market.querySelector('.pm-ref-period-range')||market.querySelector('.pm-hero>div:last-child');if(!live&&anchor){live=document.createElement('div');live.className='att-v2-live';live.innerHTML='<i></i><div><div class="att-v2-clock">LIVE --:--:--</div><div class="att-v2-meta">активни измервания</div></div>';anchor.parentElement?.insertBefore(live,anchor)}replaceText(market);const {a}=ctx();market.querySelectorAll('.pm-empty').forEach(x=>{if(/Натрупва|Няма достатъчна/i.test(x.textContent||''))x.textContent=`${a.length} текущи измервания`})}finally{busy=false}}
function tick(){mount();const live=document.querySelector('#market .att-v2-live');if(!live)return;const c=live.querySelector('.att-v2-clock'),m=live.querySelector('.att-v2-meta'),g=ctx();if(c)c.textContent='LIVE '+new Date().toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit',second:'2-digit'});if(m)m.textContent=`последна активност ${elapsed(latest())} · ${g.s.length} източника`}
function start(){mount();if(timer)clearInterval(timer);timer=setInterval(tick,1000);if(observer)observer.disconnect();const market=document.getElementById('market');if(market){observer=new MutationObserver(()=>{if(!busy)requestAnimationFrame(mount)});observer.observe(market,{subtree:true,childList:true,characterData:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();window.addEventListener('blis:clientdata',()=>setTimeout(start,40));document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="market"],#market'))setTimeout(mount,30)},true);window.BLISAttitudesMasterV2={mount};
})();