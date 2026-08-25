/* BLIS Navigator — production owner registry v2.
   Approved modules have one renderer and the router is the only render coordinator. */
(function(){
'use strict';
if(window.__BLIS_MODULE_LOCK_V1)return;window.__BLIS_MODULE_LOCK_V1=true;

const MANIFEST=Object.freeze({
  live:Object.freeze({version:'architecture-v15-20260825-owner2',owner:'BLISArchitectureV15'}),
  social:Object.freeze({version:'architecture-v15-20260825-owner2',owner:'BLISArchitectureV15'}),
  digital:Object.freeze({version:'digital-radar-20260819-radar2',owner:'BLISDigitalRadar'}),
  reputation:Object.freeze({version:'reputation-master+3d-v40',owner:'BLISReputation'})
});
window.BLIS_LOCKED_MODULES=MANIFEST;
document.documentElement.dataset.blisModuleLock='v2';

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
function markOwner(id){const page=document.getElementById(id),spec=MANIFEST[id];if(page&&spec){page.dataset.blisProductionOwner=spec.owner;page.dataset.blisProductionVersion=spec.version}}
const REGISTRY=Object.freeze({
  manifest:MANIFEST,
  owns:function(id){return Object.prototype.hasOwnProperty.call(MANIFEST,id)},
  render:function(id){
    if(!this.owns(id))throw new Error('No locked production owner for route: '+id);
    let result;
    if(id==='live'||id==='social'){
      if(!window.BLISArchitectureV15?.render)throw new Error('BLISArchitectureV15 is unavailable');
      result=window.BLISArchitectureV15.render(id);
    }else if(id==='digital'){
      if(!window.BLISDigitalRadar?.render)throw new Error('BLISDigitalRadar is unavailable');
      result=window.BLISDigitalRadar.render();
    }else if(id==='reputation'){
      if(!window.BLISReputation?.render)throw new Error('BLISReputation is unavailable');
      removeLegacyReputation();result=window.BLISReputation.render();requestAnimationFrame(function(){window.BLISReputationTotem3DV39?.mount?.();removeLegacyReputation()});
    }
    markOwner(id);return result;
  }
});
window.BLISProductionOwners=REGISTRY;
function settle(){installCSS();normalizeNav();removeLegacyReputation()}
function lockGlobal(name,value){
  if(value==null)return;
  try{Object.defineProperty(window,name,{configurable:false,enumerable:true,get:function(){return value},set:function(){console.warn('BLIS locked module blocked overwrite:',name)}})}catch(_){try{window[name]=value}catch(__){}}
}
function blockLegacyGlobal(name){
  try{Object.defineProperty(window,name,{configurable:false,enumerable:false,get:function(){return undefined},set:function(){console.warn('BLIS retired renderer blocked:',name)}})}catch(_){try{window[name]=undefined}catch(__){}}
}
function seal(){
  lockGlobal('BLISProductionOwners',REGISTRY);
  lockGlobal('BLISArchitectureV15',window.BLISArchitectureV15);
  lockGlobal('BLISDigitalRadar',window.BLISDigitalRadar);
  lockGlobal('BLISReputation',window.BLISReputation);
  blockLegacyGlobal('BLISLiveMount');
  blockLegacyGlobal('BLISSocialSignalsRender');
  if(window.__BLIS_CANONICAL_REFGO)lockGlobal('refGo',window.__BLIS_CANONICAL_REFGO);
}
function init(){
  installCSS();removeLegacyReputation();normalizeNav();seal();settle();
  const nav=document.getElementById('nav');if(nav)new MutationObserver(function(){normalizeNav()}).observe(nav,{childList:true,subtree:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
