/* BLIS Navigator — locked-module guard v1.
   Approved modules have one owner and cannot be overwritten at runtime. */
(function(){
'use strict';
if(window.__BLIS_MODULE_LOCK_V1)return;window.__BLIS_MODULE_LOCK_V1=true;

const MANIFEST=Object.freeze({
  live:Object.freeze({version:'architecture-v15-production-stable1',owner:'BLISArchitectureV15'}),
  social:Object.freeze({version:'architecture-v15-production-stable1',owner:'BLISArchitectureV15'}),
  digital:Object.freeze({version:'architecture-v15-production-stable1',owner:'BLISArchitectureV15'}),
  reputation:Object.freeze({version:'reputation-master+3d-v40',owner:'BLISReputation'})
});
window.BLIS_LOCKED_MODULES=MANIFEST;
document.documentElement.dataset.blisModuleLock='v1';

function installCSS(){
  if(document.getElementById('blisLockedModuleCSS'))return;
  const s=document.createElement('style');s.id='blisLockedModuleCSS';s.textContent=`
    .page{visibility:hidden!important}
    .page.active{visibility:visible!important;display:block!important;min-height:560px!important}
    .page:not(.active){display:none!important}
    #reputationBody .rp-exact-art,#reputationBody .rp-exact-mask,#reputationBody .rp-exact-label{display:none!important}
  `;document.head.appendChild(s);
}
function removeLegacyReputation(){
  document.querySelectorAll('#reputationBody .rp-exact-art,#reputationBody .rp-exact-mask,#reputationBody .rp-exact-label').forEach(function(n){n.remove()});
  document.querySelectorAll('#reputationBody .rp-totem').forEach(function(t){t.classList.remove('rp-exact-aroma','rp-exact-template');t.removeAttribute('data-exact-client')});
}
function normalizeNav(){
  const labels={overview:'Общ преглед',live:'Live Monitoring',social:'Сигнали',digital:'Дигитална видимост',reputation:'Репутация',market:'Нагласи',competition:'Конкуренти',reports:'Месечни доклади',history:'История',profile:'Клиентски профил',settings:'Настройки',help:'Помощ'};
  const nav=document.getElementById('nav');if(!nav)return;
  Object.entries(labels).forEach(function(pair){const b=nav.querySelector(`[data-page="${pair[0]}"]`),t=b?.querySelector('.navtxt')||b?.querySelector('span:last-child');if(t&&t.textContent!==pair[1])t.textContent=pair[1]});
}
function renderLocked(id){
  try{
    if((id==='live'||id==='social'||id==='digital')&&window.BLISArchitectureV15?.render)return window.BLISArchitectureV15.render(id);
    if(id==='reputation'&&window.BLISReputation?.render){removeLegacyReputation();const r=window.BLISReputation.render();requestAnimationFrame(function(){window.BLISReputationTotem3DV39?.mount?.();removeLegacyReputation()});return r;}
  }catch(e){console.error('BLIS locked renderer',id,e)}
}
function active(){return document.querySelector('.page.active')?.id||'overview'}
function settle(){installCSS();normalizeNav();removeLegacyReputation()}
function lockGlobal(name,value){
  if(value==null)return;
  try{Object.defineProperty(window,name,{configurable:false,enumerable:true,get:function(){return value},set:function(){console.warn('BLIS locked module blocked overwrite:',name)}})}catch(_){try{window[name]=value}catch(__){}}
}
function seal(){
  lockGlobal('BLISArchitectureV15',window.BLISArchitectureV15);
  lockGlobal('BLISDigitalRadar',window.BLISDigitalRadar);
  lockGlobal('BLISReputation',window.BLISReputation);
  if(window.__BLIS_CANONICAL_REFGO)lockGlobal('refGo',window.__BLIS_CANONICAL_REFGO);
}
function init(){
  installCSS();removeLegacyReputation();normalizeNav();seal();settle();
  const nav=document.getElementById('nav');if(nav)new MutationObserver(function(){normalizeNav()}).observe(nav,{childList:true,subtree:true,characterData:true});
  window.addEventListener('blis:clientdata',function(){requestAnimationFrame(settle)});
  window.addEventListener('blis:periodchange',function(){requestAnimationFrame(settle)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
