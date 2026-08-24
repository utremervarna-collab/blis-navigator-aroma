/* BLIS Navigator — Social Signals interaction controller v8. Event driven only. */
(function(){
'use strict';
if(window.__BLISSocialInteractiveV8)return;window.__BLISSocialInteractiveV8=true;
const GREEN='#2daf65';
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const shortDate=s=>{const p=String(s||'').slice(0,10).split('-');return p.length===3?`${p[2]}.${p[1]}`:String(s||'')};
function styles(){if(document.getElementById('smInteractiveStylesV8'))return;const s=document.createElement('style');s.id='smInteractiveStylesV8';s.textContent=`
#socialBody .sm-kpi[data-sm-destination]{cursor:pointer;position:relative;transition:border-color .16s ease,transform .16s ease,box-shadow .16s ease}
#socialBody .sm-kpi[data-sm-destination]:hover{border-color:#b9cceb;transform:translateY(-1px);box-shadow:0 8px 22px rgba(23,49,92,.08)}
#socialBody .sm-kpi-link{display:block;margin-top:8px;color:#1766e8;font-size:10px;font-weight:700}
#socialBody #socialTrend .sm-chart{height:205px!important;min-height:205px!important;overflow:hidden!important;padding:0!important}
#socialBody #socialTrend .sm-chart svg{width:100%;height:100%;display:block}
#socialBody #socialTrend .sm-chart-dates{display:flex;justify-content:space-between;gap:8px;margin:7px 12px 0 28px;color:#74839a;font-size:9px;white-space:nowrap}
#socialBody #socialTrend .blis-click-point{cursor:pointer}
#socialBody .sm-anchor-flash{animation:smAnchorFlash .9s ease}@keyframes smAnchorFlash{0%{box-shadow:0 0 0 3px rgba(23,102,232,.20)}100%{box-shadow:none}}
`;document.head.appendChild(s)}
const KPI_MAP=[{type:'part',id:'socialTrend',hint:'Виж динамиката →'},{type:'part',id:'socialTrend',hint:'Виж динамиката →'},{type:'part',id:'socialChannels',hint:'Виж каналите →'},{type:'part',id:'socialPosts',hint:'Виж публикациите →'},{type:'page',page:'signals',hint:'Виж сигналите →'}];
function markSections(root){for(const c of root.querySelectorAll('.sm-card')){const h=(c.querySelector('.sm-card-head h3')?.textContent||'').trim();if(h==='СОЦИАЛНА ДИНАМИКА')c.id='socialTrend';else if(h==='КАНАЛИ И ПРИНОС')c.id='socialChannels';else if(h==='ПОСЛЕДНИ ПУБЛИКАЦИИ ПО КАНАЛИ')c.id='socialPosts'}}
function makeKpisInteractive(root){[...root.querySelectorAll('.sm-kpis .sm-kpi')].forEach((card,i)=>{const m=KPI_MAP[i];if(!m)return;card.dataset.smDestination=m.type==='page'?`page:${m.page}`:`part:${m.id}`;card.setAttribute('role','button');card.setAttribute('tabindex','0');if(!card.querySelector('.sm-kpi-link'))card.insertAdjacentHTML('beforeend',`<span class="sm-kpi-link">${esc(m.hint)}</span>`)})}
function dateStrip(series){if(!series.length)return'';const max=7,idx=[];if(series.length<=max){for(let i=0;i<series.length;i++)idx.push(i)}else{for(let i=0;i<max;i++)idx.push(Math.round(i*(series.length-1)/(max-1)))}return `<div class="sm-chart-dates">${idx.map(i=>`<span>${esc(shortDate(series[i]?.date))}</span>`).join('')}</div>`}
function restoreCurve(root){if(!window.BLISCurves?.draw||!window.BLISCurves?.series)return;const card=root.querySelector('#socialTrend'),host=card?.querySelector('.sm-chart');if(!host)return;const series=window.BLISCurves.series('presence')||[];if(series.length<2)return;host.innerHTML=window.BLISCurves.draw('presence',{color:GREEN,width:760,height:190});const svg=host.querySelector('svg[data-curve-key="presence"]');if(svg){svg.querySelectorAll('text[text-anchor="middle"]').forEach(x=>x.remove());[...svg.querySelectorAll('circle')].forEach((dot,i)=>{const row=series[i];if(!row)return;dot.classList.add('blis-click-point');dot.dataset.chartDate=row.date||'';dot.dataset.chartValue=String(row.value??'');dot.setAttribute('r','3.6')})}card.querySelector('.sm-chart-dates')?.remove();host.insertAdjacentHTML('afterend',dateStrip(series))}
function patch(){const root=document.getElementById('socialBody');if(!root||!root.children.length)return false;styles();markSections(root);makeKpisInteractive(root);restoreCurve(root);return true}
function gotoPart(id){const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.remove('sm-anchor-flash');void el.offsetWidth;el.classList.add('sm-anchor-flash')}
function activate(dest){if(!dest)return;if(dest.startsWith('part:'))gotoPart(dest.slice(5));else if(dest.startsWith('page:'))window.refGo?.(dest.slice(5))}
document.addEventListener('click',e=>{const kpi=e.target.closest?.('#socialBody .sm-kpi[data-sm-destination]');if(kpi)activate(kpi.dataset.smDestination);if(e.target.closest?.('#nav button[data-page="social"]'))setTimeout(()=>requestAnimationFrame(patch),0)},true);
document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const kpi=e.target.closest?.('#socialBody .sm-kpi[data-sm-destination]');if(kpi){e.preventDefault();activate(kpi.dataset.smDestination)}});
function schedule(){requestAnimationFrame(patch)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('blis:clientdata',schedule);window.addEventListener('blis:periodchange',schedule);
window.BLISSocialInteractivePatch=patch;
})();