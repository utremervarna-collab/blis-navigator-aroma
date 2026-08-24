/* BLIS Navigator — Attitudes terminology/QA bridge v4. Event driven only. */
(function(){
'use strict';
if(window.__BLIS_ATTITUDES_V4)return;window.__BLIS_ATTITUDES_V4=true;

const pairs=[
 ['Карта на потребителското възприятие','Нагласи'],['Карта на възприятията','Нагласи'],['Мрежа на нагласите','Нагласи'],
 ['3D мрежа на възприятията','НАГЛАСИ В РЕАЛНО ВРЕМЕ'],['3D мрежа на нагласите','НАГЛАСИ В РЕАЛНО ВРЕМЕ'],
 ['Индекс на възприятието','Индекс на нагласите'],['потребителските сигнали и възприятия','проверимите сигнали и нагласи'],
 ['възприятия за бранда','нагласи към бранда'],['Динамика на индекса','Динамика на нагласите'],
 ['Натрупва се база','Текущи измервания'],['Натрупва се достатъчна база','Текущи измервания'],
 ['Няма достатъчна измерима база.','Текущи измервания'],['няма сравнима история','текуща стойност']
];
function mollox(){try{return document.body?.dataset?.client==='mollox'||window.BLIS_CLIENT_SCOPE==='mollox'||window.BLIS_INITIAL_CLIENT==='mollox'||window.BLIS_CURRENT_SLUG==='mollox'||(typeof slug!=='undefined'&&slug==='mollox')}catch(_){return false}}
function ctx(){return{d:window.D||{},a:Array.isArray(window.A)?window.A:[],s:Array.isArray(window.S)?window.S:[]}}
function replaceText(root){if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||/SCRIPT|STYLE|TEXTAREA|INPUT|OPTION/.test(p.tagName))return NodeFilter.FILTER_REJECT;return pairs.some(([a])=>(n.nodeValue||'').includes(a))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(n=>{let t=n.nodeValue||'';pairs.forEach(([a,b])=>t=t.split(a).join(b));n.nodeValue=t})}
function ensureVisible(){const page=document.getElementById('market'),body=document.getElementById('marketBody');if(!page?.classList.contains('active')||!body)return;page.style.setProperty('visibility','visible','important');page.style.setProperty('opacity','1','important');body.style.setProperty('display','block','important');body.style.setProperty('visibility','visible','important');body.style.setProperty('opacity','1','important');body.style.setProperty('width','100%','important');const wrap=body.querySelector('.pm-wrap');if(wrap){wrap.style.setProperty('display','block','important');wrap.style.setProperty('visibility','visible','important');wrap.style.setProperty('opacity','1','important')}}
function fixMollox(market){if(!mollox()||!market)return;document.documentElement.style.setProperty('--client-accent','#7b1028');document.documentElement.style.setProperty('--client-soft','#f8eef1');const badge=market.querySelector('.pm-client-badge');if(badge){const mk=badge.querySelector('.pm-client-mark');if(mk)mk.textContent='MX';const b=badge.querySelector('b');if(b)b.textContent='MOLLOX България';const sm=badge.querySelector('small');if(sm)sm.textContent='Професионална хигиена'}const p=market.querySelector('.pm-hero p');if(p)p.textContent='Проверими теми, сигнали и връзки, които оформят нагласите към MOLLOX България.'}
function mount(){const market=document.getElementById('market');if(!market?.classList.contains('active'))return;ensureVisible();const nav=document.querySelector('#nav [data-page="market"] .navtxt');if(nav)nav.textContent='Нагласи';const h=market.querySelector('.pm-hero h2');if(h)h.textContent='Нагласи';const p=market.querySelector('.pm-hero p');if(p&&!mollox())p.textContent='Проверими теми, сигнали и връзки, които оформят нагласите към марката.';const mh=market.querySelector('.pm-maphead b');if(mh)mh.textContent='НАГЛАСИ В РЕАЛНО ВРЕМЕ';const ms=market.querySelector('.pm-maphead small');if(ms){const n=market.querySelectorAll('.pm-node').length;ms.textContent=`${n} активни елемента в картата`};const sys=document.getElementById('blisActiveModule');if(sys)sys.textContent='Нагласи';const detail=document.getElementById('blisSystemDetail');if(detail)detail.textContent='Проверими теми, връзки, динамика и източници';replaceText(market);fixMollox(market);const {a}=ctx();market.querySelectorAll('.pm-empty').forEach(x=>{if(/Натрупва|Няма достатъчна/i.test(x.textContent||''))x.textContent=`${a.length} текущи измервания`});ensureVisible()}
function schedule(){requestAnimationFrame(mount)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('blis:clientdata',schedule);
window.addEventListener('blis:periodchange',schedule);
document.addEventListener('click',e=>{if(e.target.closest?.('[data-page="market"],#market [data-pm-period],#market [data-pm-type],#market [data-pm-source]'))setTimeout(schedule,0)},true);
window.BLISAttitudesMasterV2={mount};
})();