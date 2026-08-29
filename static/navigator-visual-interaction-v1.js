/* BLIS Navigator — visual interaction contract v1.
   Adds interaction to the canonical visual center only. Does not own routes or pages. */
(function(){
'use strict';
if(window.__BLIS_VISUAL_INTERACTION_V1)return;window.__BLIS_VISUAL_INTERACTION_V1=true;

const CONTRACT={
 overview:'#overview .ov5-chart,#overviewPremium .ov5-chart',
 social:'#social .sig2-dynamic',
 market:'#market .pm-mapcard',
 digital:'#digital .dv-stage',
 reputation:'#reputation .rep46-panel.vis-focus,#reputation .rep46-panel:has(.rep46-chart)',
 competition:'#competitionBody .xv2-visual',
 opportunities:'#opportunitiesBody .xv2-visual',
 history:'#historyBody .xv2-visual',
 reports:'#reportsBody .xv2-visual'
};
function css(){
 if(document.getElementById('blisVisualInteractionV1Css'))return;
 const s=document.createElement('style');s.id='blisVisualInteractionV1Css';s.textContent=`
.vis-focus:after{display:none!important}
.vis-context{margin:10px 14px 14px;padding:10px 12px;border:1px solid #dbe6f1;border-radius:11px;background:linear-gradient(90deg,#f3f8fe,#fff);color:#536d86;font-size:9px;line-height:1.5;transition:.16s ease}
.vis-context b{color:#264967;font-weight:850}.vis-context.is-risk{border-color:#efd7d3;background:linear-gradient(90deg,#faece9,#fff);color:#81504d}.vis-context.is-positive{border-color:#d6eadf;background:linear-gradient(90deg,#eaf6f0,#fff);color:#44715d}.vis-context.is-warning{border-color:#eadfbe;background:linear-gradient(90deg,#fbf4e5,#fff);color:#806a39}
.ov5-event,.rep46-chart circle,.xv2-row,.xv2-event{cursor:pointer}.ov5-event:focus-visible,.rep46-chart circle:focus-visible,.xv2-row:focus-visible,.xv2-event:focus-visible,.sig2-dot:focus-visible,.xv2-dot:focus-visible{outline:3px solid rgba(31,101,183,.24);outline-offset:3px}
.xv2-row[data-vis-selected="1"]{border-color:#9ebfe0!important;box-shadow:0 0 0 3px rgba(31,101,183,.08)!important}.xv2-event[data-vis-selected="1"]:before{box-shadow:0 0 0 8px rgba(31,101,183,.12)!important}.sig2-dot[data-vis-selected="1"]{transform:translate(-50%,-50%) scale(1.35)!important;z-index:6}.rep46-chart circle[data-vis-selected="1"]{r:5;stroke:#fff;stroke-width:2}.ov5-event[data-vis-selected="1"] .inner{r:5}
`;
 document.head.appendChild(s);
}
function activePage(){return document.querySelector('.page.active')?.id||new URLSearchParams(location.search).get('page')||'overview'}
function visualFor(id=activePage()){
 const sel=CONTRACT[id];if(!sel)return null;const all=[...document.querySelectorAll(sel)];
 const page=document.getElementById(id);return all.find(x=>page?.contains(x))||all[0]||null;
}
function tone(text){const t=String(text||'').toLowerCase();if(/риск|негатив|пониж|изисква внимание|проблем/.test(t))return'is-risk';if(/положител|възмож|повиш|подобр/.test(t))return'is-positive';if(/наблюд|внимание|следим/.test(t))return'is-warning';return''}
function context(box,text,label='Избрано'){if(!box||!text)return;let n=box.querySelector(':scope > .vis-context');if(!n){n=document.createElement('div');n.className='vis-context';box.appendChild(n)}n.className=`vis-context ${tone(text)}`;n.innerHTML=`<b>${label}:</b> ${String(text).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}`}
function clearSelected(box){box?.querySelectorAll('[data-vis-selected="1"]').forEach(x=>x.removeAttribute('data-vis-selected'))}
function select(el,box){clearSelected(box);el?.setAttribute('data-vis-selected','1')}
function titleOf(el){return el?.getAttribute?.('title')||el?.dataset?.xv2Tip||el?.querySelector?.('title')?.textContent||''}
function bindAccessibility(){
 document.querySelectorAll('.ov5-event,.rep46-chart circle,.xv2-row,.xv2-event').forEach(el=>{if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');if(!el.hasAttribute('role'))el.setAttribute('role','button')});
}
function activateElement(el){
 if(!el)return;const page=activePage(),box=visualFor(page);if(!box||!box.contains(el))return;
 let text='',label='Избрано';
 if(el.matches('.ov5-event')){text=titleOf(el);label='Събитие'}
 else if(el.matches('.sig2-dot')){text=titleOf(el);label='Сигнал'}
 else if(el.matches('.rep46-chart circle')){text=titleOf(el);label='Измерване'}
 else if(el.matches('.xv2-row')){text=el.dataset.xv2Tip||`${el.querySelector('.xv2-name b')?.textContent||'Конкурент'} · позиция ${el.querySelector('.xv2-rank')?.textContent||'—'} · резултат ${el.querySelector('.xv2-score')?.textContent||'—'}`;label='Конкурент'}
 else if(el.matches('.xv2-dot')){text=titleOf(el)||el.getAttribute('aria-label')||'Значим сигнал в матрицата.';label='Сигнал'}
 else if(el.matches('.xv2-event')){text=[el.querySelector('time')?.textContent,el.querySelector('b')?.textContent,el.querySelector('small')?.textContent].filter(Boolean).join(' · ');label='Повратна точка'}
 if(!text)return;select(el,box);context(box,text,label)
}
function audit(){
 const id=activePage(),sel=CONTRACT[id];if(!sel)return {page:id,count:0,status:'unknown'};
 const page=document.getElementById(id),nodes=[...document.querySelectorAll(sel)].filter(x=>!page||page.contains(x));const count=nodes.length,status=count===1?'ok':count===0?'missing':'duplicate';
 document.documentElement.dataset.navigatorVisualHealth=`${id}:${status}`;
 if(status!=='ok')console.warn('[BLIS visual contract]',{page:id,status,count,selector:sel});
 return{page:id,count,status};
}
function refresh(){css();bindAccessibility();setTimeout(audit,0)}
function later(){[60,220,600].forEach(ms=>setTimeout(refresh,ms))}
document.addEventListener('click',e=>{const el=e.target.closest?.('.ov5-event,.sig2-dot,.rep46-chart circle,.xv2-row,.xv2-dot,.xv2-event');activateElement(el)},true);
document.addEventListener('keydown',e=>{if(!['Enter',' '].includes(e.key))return;const el=e.target.closest?.('.ov5-event,.rep46-chart circle,.xv2-row,.xv2-event');if(!el)return;e.preventDefault();activateElement(el)},true);
['blis:routechange','blis:clientdata','blis:periodchange','blis:intelligence','blis:executive-data','blis:production-ready'].forEach(ev=>window.addEventListener(ev,later));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',later,{once:true});else later();
window.BLISVisualInteractionV1={refresh,later,audit,contract:CONTRACT};
})();