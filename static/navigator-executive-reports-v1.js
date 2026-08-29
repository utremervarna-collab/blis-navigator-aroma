/* BLIS Navigator — Executive Reports utility v1.
   Добавя реалната API библиотека и историята на експорти към Executive Reports.
   Не симулира несъществуващи доклади. */
(function(){
'use strict';
if(window.__BLIS_EXECUTIVE_REPORTS_V1)return;window.__BLIS_EXECUTIVE_REPORTS_V1=true;
const A=v=>Array.isArray(v)?v:[];
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const client=()=>{try{return window.BLISClientUIV3?.current?.()||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||'aroma'}catch(_){return document.body?.dataset?.client||'aroma'}};
const date=v=>{const d=new Date(v||'');return isNaN(d)?'—':d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})};
let cache={client:'',reports:[],exports:[],busy:null};
function css(){if(document.getElementById('execReportsV1css'))return;const s=document.createElement('style');s.id='execReportsV1css';s.textContent=`
.exec-library{margin-top:16px;border:1px solid #e3e9f0;border-radius:18px;background:#fff;overflow:hidden}.exec-library-head{padding:16px 18px;border-bottom:1px solid #edf1f5;display:flex;gap:14px;align-items:flex-start;justify-content:space-between}.exec-library-head span{display:block;color:#8795a5;font-size:9px;text-transform:uppercase;letter-spacing:.055em}.exec-library-head b{display:block;margin-top:4px;color:#1f3f61;font-size:16px}.exec-library-head p{margin:4px 0 0;color:#748398;font-size:9px;line-height:1.5}.exec-library-head em{font-style:normal;border:1px solid #dce5ee;border-radius:999px;padding:6px 9px;color:#60748b;font-size:8px;font-weight:800;white-space:nowrap}.exec-library-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(240px,.75fr)}.exec-library-col{padding:14px 16px}.exec-library-col+ .exec-library-col{border-left:1px solid #edf1f5;background:#fbfcfe}.exec-library-col h4{margin:0 0 9px;color:#4b627c;font-size:9px;text-transform:uppercase;letter-spacing:.045em}.exec-library-row{display:flex;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid #edf1f5}.exec-library-row:last-child{border-bottom:0}.exec-library-row>div{min-width:0;flex:1}.exec-library-row b{display:block;color:#294866;font-size:10px;line-height:1.35}.exec-library-row small{display:block;margin-top:3px;color:#8794a5;font-size:8px}.exec-library-actions{display:flex;gap:5px}.exec-library-actions button{border:1px solid #dce5ee;border-radius:8px;background:#fff;color:#4d6680;padding:6px 8px;font-size:8px;font-weight:800;cursor:pointer}.exec-library-actions button.primary{border-color:#c8d8ec;background:#edf4fd;color:#225f9e}.exec-library-empty{padding:16px 4px;color:#7f8da0;font-size:9px;line-height:1.5}.exec-export{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid #edf1f5}.exec-export:last-child{border-bottom:0}.exec-export b{font-size:9px;color:#39536e}.exec-export span{font-size:8px;color:#8492a4;white-space:nowrap}@media(max-width:850px){.exec-library-grid{grid-template-columns:1fr}.exec-library-col+ .exec-library-col{border-left:0;border-top:1px solid #edf1f5}.exec-library-row{align-items:flex-start;flex-direction:column}.exec-library-actions{width:100%}}
`;document.head.appendChild(s)}
async function data(force=false){const k=client();if(!force&&cache.client===k&&!cache.busy)return cache;if(cache.busy&&cache.client===k)return cache.busy;cache.client=k;cache.busy=Promise.all([
 fetch(`/api/clients/${encodeURIComponent(k)}/reports`,{cache:'no-store',credentials:'same-origin'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
 fetch(`/api/clients/${encodeURIComponent(k)}/exports`,{cache:'no-store',credentials:'same-origin'}).then(r=>r.ok?r.json():[]).catch(()=>[])
]).then(([reports,exports])=>{cache={client:k,reports:A(reports),exports:A(exports),busy:null};return cache});return cache.busy}
function reportRows(rows){if(!rows.length)return'<div class="exec-library-empty">Няма публикуван доклад в API за текущия профил. Navigator не създава фиктивни файлове.</div>';return rows.slice(0,8).map((r,i)=>`<div class="exec-library-row"><div><b>${E(r.title||`Доклад ${i+1}`)}</b><small>${E(r.period||'Текущ период')} · публикуван</small></div><div class="exec-library-actions"><button type="button" data-exec-report-file="${i}" data-format="html">HTML</button><button type="button" class="primary" data-exec-report-file="${i}" data-format="pdf">PDF</button></div></div>`).join('')}
function exportRows(rows){if(!rows.length)return'<div class="exec-library-empty">Все още няма генерирани експорти за този профил.</div>';return rows.slice().sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,6).map(x=>`<div class="exec-export"><b>${E(x.title||x.id||'Експорт')}</b><span>${E(String(x.format||'').toUpperCase()||'FILE')} · ${date(x.created_at)}</span></div>`).join('')}
async function enhance(force=false){
 const page=document.getElementById('reports');if(!page||!page.classList.contains('active'))return;
 const host=document.getElementById('reportsBody')||page;
 if(!host.querySelector('.exec-report'))return;
 css();const d=await data(force);if(!document.getElementById('reports')?.classList.contains('active'))return;
 host.querySelector('[data-exec-library]')?.remove();
 const section=document.createElement('section');section.className='exec-library';section.dataset.execLibrary='1';
 section.innerHTML=`<div class="exec-library-head"><div><span>Реална библиотека</span><b>Публикувани доклади и експорти</b><p>Само файлове и записи, които действително съществуват за текущия клиент.</p></div><em>${d.reports.length} публикувани</em></div><div class="exec-library-grid"><div class="exec-library-col"><h4>Доклади</h4>${reportRows(d.reports)}</div><div class="exec-library-col"><h4>Последни експорти</h4>${exportRows(d.exports)}</div></div>`;
 const visual=host.querySelector('.exec-visual');visual?.insertAdjacentElement('afterend',section);
 section.querySelectorAll('[data-exec-report-file]').forEach(b=>b.addEventListener('click',()=>{const r=d.reports[Number(b.dataset.execReportFile)],typ=r?.id||'summary',format=b.dataset.format||'pdf';location.href=`/api/clients/${encodeURIComponent(client())}/generate?type=${encodeURIComponent(typ)}&format=${encodeURIComponent(format)}`}));
}
function later(force=false){[120,360,800].forEach(ms=>setTimeout(()=>enhance(force),ms))}
window.addEventListener('blis:routechange',e=>{if(e.detail?.page==='reports')later(false)});
window.addEventListener('blis:clientdata',()=>later(true));
window.addEventListener('blis:production-ready',()=>{if(new URLSearchParams(location.search).get('page')==='reports')later(false)});
document.addEventListener('change',e=>{if(e.target?.matches?.('[data-exec-period]'))setTimeout(()=>enhance(false),60)},true);
window.BLISExecutiveReportsV1={enhance,refresh:()=>enhance(true)};
})();
