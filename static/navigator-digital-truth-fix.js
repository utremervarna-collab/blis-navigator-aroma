/* BLIS Navigator — Digital Visibility truth guard v2: missing metrics are em dash, event driven only. */
(function(){
'use strict';
if(window.__BLISDigitalTruthGuardV2)return;window.__BLISDigitalTruthGuardV2=true;
const EXT=['external_visibility','external_presence','referral_visibility','backlink_visibility'];
const A=x=>Array.isArray(x)?x:[];
function hasMetric(){const d=window.D||{};for(const pool of [A(d.metrics),A(d.indices)])for(const x of pool){const k=String(x?.key||x?.metric||x?.name||'').toLowerCase();if(EXT.includes(k)&&Number.isFinite(Number(x?.value)))return true}return false}
function dash(el){if(!el||(el.textContent||'').trim()==='—')return false;el.textContent='—';return true}
function patch(){if(hasMetric())return false;const root=document.getElementById('digitalBody');if(!root)return false;let changed=false;changed=dash(root.querySelector('.dv-radar-sector.external b'))||changed;changed=dash(root.querySelector('.dv-kpi.external .dv-kpi-body strong'))||changed;const detailTitle=root.querySelector('#dvDetail h3');if(detailTitle&&/Външна видимост/.test(detailTitle.textContent||'')){changed=dash(root.querySelector('#dvDetail .dv-detail-title strong'))||changed;const rows=[...root.querySelectorAll('#dvDetail .dv-detail-metrics>div')];changed=dash(rows.find(x=>(x.textContent||'').includes('Основна стойност'))?.querySelector('b'))||changed}return changed}
function schedule(){requestAnimationFrame(patch)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
document.addEventListener('click',e=>{if(e.target.closest?.('#digitalBody [data-sector="external"],#nav button[data-page="digital"]'))setTimeout(schedule,0)},true);
window.addEventListener('blis:clientdata',schedule);window.addEventListener('blis:periodchange',schedule);
window.BLISDigitalTruthPatch=patch;
})();