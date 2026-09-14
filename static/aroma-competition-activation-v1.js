/* BLIS Navigator — Aroma competition activation V1
   Restores the existing V11 category strip interaction for Aroma only. */
(function(){
'use strict';
if(window.__BLIS_AROMA_COMPETITION_ACTIVATION_V1)return;
window.__BLIS_AROMA_COMPETITION_ACTIVATION_V1=true;

const N=s=>String(s??'').toLowerCase().trim();
function currentClient(){
  try{return N(window.BLISClientUIV3?.current?.()||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.D?.slug||'aroma')}
  catch(_){return N(window.D?.slug||'aroma')}
}
function isAroma(){return currentClient()==='aroma'}

function css(){
  if(document.getElementById('aromaCompetitionActivationV1CSS'))return;
  const st=document.createElement('style');
  st.id='aromaCompetitionActivationV1CSS';
  st.textContent=`
/* Keep V12 behaviour for every other profile; reactivate only Aroma. */
html:not(.blis-aroma-competition-active) #competition .cmpv9-bar{display:none!important}
html.blis-aroma-competition-active #competition .cmpv9-bar{display:flex!important;visibility:visible!important;opacity:1!important}
html.blis-aroma-competition-active #competition .cmpv11-row,
html.blis-aroma-competition-active #competition .cmpv11-chip{pointer-events:auto!important;cursor:pointer!important}
html.blis-aroma-competition-active #competition .cmpv11-row.active{background:#edf4ff!important;color:#205fc9!important;font-weight:820!important}
`;
  document.head.appendChild(st);
}

function apply(){
  css();
  const aroma=isAroma();
  document.documentElement.classList.toggle('blis-aroma-competition-active',aroma);
  if(!aroma)return;
  const root=document.querySelector('#competitionBody>.cmpv5')||document.getElementById('competitionBody')||document.getElementById('competition');
  if(!root)return;
  root.querySelectorAll('.cmpv9-bar').forEach(bar=>{
    bar.style.setProperty('display','flex','important');
    bar.style.setProperty('visibility','visible','important');
    bar.style.setProperty('opacity','1','important');
    bar.removeAttribute('hidden');
    bar.setAttribute('aria-hidden','false');
  });
  root.querySelectorAll('.cmpv11-row,.cmpv11-chip').forEach(el=>{
    el.style.setProperty('pointer-events','auto','important');
    el.style.setProperty('cursor','pointer','important');
    el.removeAttribute('aria-disabled');
    if(el.tagName==='BUTTON')el.disabled=false;
  });
}

let timer=0,observer=null;
function schedule(){clearTimeout(timer);timer=setTimeout(apply,55)}
function start(){
  css();apply();
  const host=document.getElementById('competitionBody')||document.body;
  observer=new MutationObserver(schedule);
  observer.observe(host,{subtree:true,childList:true});
  document.addEventListener('click',e=>{
    if(!isAroma())return;
    if(e.target.closest?.('[data-page="competition"],.cmpv5-seg button,[data-v11cat],[data-v11row]'))setTimeout(apply,80);
  },true);
  window.addEventListener('blis:clientdata',()=>setTimeout(apply,90));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.BLISAromaCompetitionActivationV1={apply};
})();
