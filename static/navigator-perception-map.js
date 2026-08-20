(() => {
  'use strict';

  const REF_CSS='/navigator-perception-reference-v10.css?v=20260820-ref14';
  const STYLE_ID='pmSideModulesV14';

  function marketActive(){return !!document.getElementById('market')?.classList.contains('active')}
  function qs(s,r=document){return r.querySelector(s)}
  function qsa(s,r=document){return [...r.querySelectorAll(s)]}

  function ensureReferenceStyles(){
    let l=document.getElementById('pmReferenceV10Css');
    if(!l){l=document.createElement('link');l.id='pmReferenceV10Css';l.rel='stylesheet';document.head.appendChild(l)}
    if(l.getAttribute('href')!==REF_CSS)l.setAttribute('href',REF_CSS);
  }

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
#market .pm-main{grid-template-columns:minmax(0,1fr) 352px!important;gap:14px!important}
#market .pm-drawer{padding:0!important;overflow:auto!important;background:#fff!important;border:1px solid #e4eaf2!important;border-radius:14px!important}
#market .pm-v13-titlebar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;height:52px;padding:0 16px;background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border-bottom:1px solid #edf1f5}
#market .pm-v13-titlebar b{font-size:15px;line-height:1;color:#101828;font-weight:800;letter-spacing:-.02em}
#market .pm-v13-titlebar button{width:28px;height:28px;border:0;border-radius:7px;background:transparent;color:#667085;font-size:20px;cursor:pointer}
#market .pm-v13-body{padding:0 16px 14px}
#market .pm-v13-summary{display:grid;grid-template-columns:42px minmax(0,1fr);gap:11px;align-items:center;padding:16px 0 13px;border-bottom:1px solid #edf1f5}
#market .pm-v13-icon{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--ref-blue,#1677ff);color:#fff;font-size:14px;font-weight:900;box-shadow:0 6px 14px rgba(22,119,255,.18)}
#market .pm-v13-category{font-size:8px;line-height:1.2;color:#11845b;font-weight:850;letter-spacing:.07em;text-transform:uppercase;margin-bottom:4px}
#market .pm-v13-summary h3{margin:0;font-size:14px;line-height:1.2;color:#101828;font-weight:790}
#market .pm-v13-source{margin-top:4px;font-size:8.5px;color:#98a2b3}
#market .pm-v13-metrics{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px 0 4px}
#market .pm-v13-metric{padding:10px 11px;border:1px solid #edf1f5;border-radius:10px;background:#f8fafc;min-width:0}
#market .pm-v13-metric span{display:block;font-size:8px;color:#98a2b3;margin-bottom:4px}
#market .pm-v13-metric b{display:block;font-size:10px;line-height:1.25;color:#344054;font-weight:780;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#market .pm-v13-section{padding:14px 0;border-top:1px solid #edf1f5}
#market .pm-v13-section:first-of-type{border-top:0}
#market .pm-v13-section h4{margin:0 0 8px;font-size:9px;line-height:1.2;color:#344054;font-weight:820;text-transform:none}
#market .pm-v13-section p{margin:0;font-size:9.7px;line-height:1.55;color:#475467}
#market .pm-v13-sentbar{display:grid;grid-template-columns:1fr 1fr 1fr;height:6px;border-radius:999px;overflow:hidden;background:#eef2f6;margin:8px 0 7px}
#market .pm-v13-sentbar i:nth-child(1){background:#33b679}#market .pm-v13-sentbar i:nth-child(2){background:#d9e1ea}#market .pm-v13-sentbar i:nth-child(3){background:#e76f76}
#market .pm-v13-muted{font-size:8.7px!important;color:#98a2b3!important}
#market .pm-v13-related{display:grid;gap:0}
#market .pm-v13-related button{width:100%;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;align-items:center;padding:9px 1px;border:0;border-bottom:1px solid #f1f3f6;background:#fff;color:#475467;font-size:9px;text-align:left;cursor:pointer}
#market .pm-v13-related button:after{content:'›';font-size:14px;color:#b2bcc8}
#market .pm-v13-source-row{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:8px;align-items:center;padding:8px 0;border-bottom:1px solid #f2f4f7}
#market .pm-v13-source-row i{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#eef4ff;color:#2563eb;font-style:normal;font-size:8px;font-weight:850}
#market .pm-v13-source-row span{font-size:9px;color:#344054;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#market .pm-v13-source-row b{font-size:8px;color:#98a2b3;font-weight:700}
#market .pm-v13-examples{display:grid;gap:7px}
#market .pm-v13-example{padding:9px 10px;border:1px solid #e8edf4;border-radius:9px;background:#f8fafc}
#market .pm-v13-example b{display:block;font-size:9px;line-height:1.35;color:#344054;font-weight:720}
#market .pm-v13-example small{display:block;margin-top:4px;font-size:7.8px;color:#98a2b3}
#market .pm-v13-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:12px 0 0}
#market .pm-v13-actions button{min-height:36px;margin:0!important;padding:7px 9px!important;border:1px solid #dfe6ef!important;border-radius:8px!important;background:#fff!important;color:#344054!important;font-size:8.8px!important;font-weight:720!important;text-align:center!important}
#market .pm-v13-actions button:first-child{background:#f8fafc!important}
#market .pm-detail-grid,#market .pm-drawer-section,#market .pm-drawer-head{display:none!important}

#market .pm-lower{grid-template-columns:1.35fr 1fr 1fr!important;gap:12px!important;margin-top:12px!important}
#market .pm-lower .pm-card{min-height:188px!important;padding:15px!important;border-radius:13px!important}
#market .pm-lower h3{font-size:13px!important;font-weight:800!important;letter-spacing:-.015em!important;margin:0!important}
#market .pm-v13-history-summary{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin:9px 0 8px}
#market .pm-v13-history-summary>div{padding:8px;border:1px solid #edf1f5;border-radius:8px;background:#f8fafc}
#market .pm-v13-history-summary span{display:block;font-size:7.5px;color:#98a2b3;margin-bottom:3px}
#market .pm-v13-history-summary b{display:block;font-size:9px;color:#344054;font-weight:780;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#market .pm-change{display:grid!important;grid-template-columns:28px minmax(0,1fr)!important;gap:8px!important;align-items:center!important;padding:8px!important;margin:6px 0!important;border:0!important;border-radius:9px!important;background:#f8fafc!important}
#market .pm-change i{width:28px!important;height:28px!important;border-radius:50%!important;background:#fff!important;display:grid!important;place-items:center!important;border:1px solid #e7ecf2!important}
#market .pm-change.up{background:#f3faf6!important}#market .pm-change.down{background:#fff5f5!important}
#market .pm-theme-cloud{display:flex!important;flex-wrap:wrap!important;gap:7px!important;margin-top:10px!important}
#market .pm-theme-cloud button{padding:6px 9px!important;border:1px solid #e2e8f0!important;border-radius:8px!important;background:#f8fafc!important;color:#475467!important;font-size:8.8px!important;font-weight:680!important}
#market .pm-v13-topic-foot{margin-top:10px;padding-top:9px;border-top:1px solid #edf1f5;font-size:8px;color:#98a2b3}
@media(max-width:1180px){#market .pm-main{grid-template-columns:1fr!important}#market .pm-drawer{max-height:none!important}#market .pm-lower{grid-template-columns:1fr 1fr!important}}
@media(max-width:760px){#market .pm-lower{grid-template-columns:1fr!important}#market .pm-v13-actions{grid-template-columns:1fr!important}}
`;
    document.head.appendChild(s);
  }

  function setCopy(){
    const nav=qs('#nav [data-page="market"]');
    const label=nav?.querySelector('.navtxt')||nav?.querySelector('span:last-child');
    if(label)label.textContent='Мрежа на нагласите';
    const h=qs('#market .pm-hero h2'),p=qs('#market .pm-hero p');
    if(h)h.textContent='Мрежа на бранд нагласите';
    if(p)p.textContent='Проследяване на измеримите сигнали и нагласи към бранда в реално време.';
    const active=qs('#blisActiveModule'),detail=qs('#blisSystemDetail');
    if(active&&marketActive())active.textContent='Мрежа на нагласите';
    if(detail&&marketActive())detail.textContent='Индекси, измервания и потвърдени връзки между сигналите и нагласите';
    if(document.body.dataset.client==='wirello'){
      const badge=qs('#market .pm-client-badge');
      if(badge){
        const mark=qs('.pm-client-mark',badge),name=qs('b',badge),type=qs('small',badge);
        if(mark)mark.textContent='WM';
        if(name)name.textContent='Wirello Market';
        if(type)type.textContent='Omnichannel retail';
      }
    }
  }

  function valFromGrid(name){
    const cells=qsa('#pmDrawer .pm-detail-grid>div');
    const hit=cells.find(x=>(x.querySelector('span')?.textContent||'').trim().toLowerCase()===name.toLowerCase());
    return hit?.querySelector('b')?.textContent?.trim()||'—';
  }

  function sourceIcon(src){
    const t=String(src||'').toLowerCase();
    if(t.includes('linkedin'))return'in';
    if(t.includes('facebook'))return'f';
    if(t.includes('instagram'))return'◎';
    if(t.includes('youtube'))return'▶';
    if(t.includes('google'))return'G';
    return'•';
  }

  function decorateDrawer(){
    const d=document.getElementById('pmDrawer');if(!d||!d.children.length)return;
    if(d.dataset.v13==='ready')return;

    const rawHead=qs('.pm-drawer-head',d);
    const title=rawHead?.querySelector('h3')?.textContent?.trim()||'Избран сигнал';
    const source=rawHead?.querySelector('small')?.textContent?.trim()||valFromGrid('Източник');
    const category=rawHead?.querySelector('.pm-category')?.textContent?.trim()||'Сигнал';
    const value=valFromGrid('Стойност');
    const change=valFromGrid('Промяна');
    const period=valFromGrid('Период');
    const how=qsa('.pm-drawer-section',d).find(x=>/Как се чете|Ключова тема/i.test(x.querySelector('h4')?.textContent||''));
    const desc=how?.querySelector('p')?.textContent?.trim()||'Проверим фактор от текущата информационна среда.';
    const relatedSec=qsa('.pm-drawer-section',d).find(x=>/Свързани/i.test(x.querySelector('h4')?.textContent||''));
    const related=relatedSec?.querySelector('.pm-related');
    const actions=qs('.pm-actions',d);

    const shell=document.createElement('div');shell.className='pm-v13-shell';
    const bar=document.createElement('div');bar.className='pm-v13-titlebar';bar.innerHTML='<b>Детайли за сигнал</b><button type="button" aria-label="Затвори">×</button>';
    bar.querySelector('button').addEventListener('click',()=>{d.style.display='none';d.closest('.pm-main')?.classList.add('drawer-closed')});
    const body=document.createElement('div');body.className='pm-v13-body';

    const summary=document.createElement('div');summary.className='pm-v13-summary';
    summary.innerHTML=`<span class="pm-v13-icon">◎</span><div><div class="pm-v13-category">${category}</div><h3>${title}</h3><div class="pm-v13-source">${source}</div></div>`;
    const metrics=document.createElement('div');metrics.className='pm-v13-metrics';
    metrics.innerHTML=`<div class="pm-v13-metric"><span>Стойност</span><b>${value}</b></div><div class="pm-v13-metric"><span>Промяна</span><b>${change}</b></div><div class="pm-v13-metric"><span>Източник</span><b>${source}</b></div><div class="pm-v13-metric"><span>Период</span><b>${period}</b></div>`;

    const topic=document.createElement('section');topic.className='pm-v13-section';topic.innerHTML=`<h4>Ключова тема</h4><p>${desc}</p>`;
    const sentiment=document.createElement('section');sentiment.className='pm-v13-section';sentiment.innerHTML='<h4>Настроение</h4><div class="pm-v13-sentbar"><i></i><i></i><i></i></div><p class="pm-v13-muted">Няма достатъчно измерими данни за надеждно разпределение на настроението.</p>';

    const rel=document.createElement('section');rel.className='pm-v13-section';rel.innerHTML='<h4>Свързани подтеми</h4>';
    if(related){related.classList.add('pm-v13-related');rel.appendChild(related)}else rel.insertAdjacentHTML('beforeend','<p class="pm-v13-muted">Няма допълнителни връзки в текущия набор.</p>');

    const src=document.createElement('section');src.className='pm-v13-section';src.innerHTML=`<h4>Източници</h4><div class="pm-v13-source-row"><i>${sourceIcon(source)}</i><span>${source}</span><b>активен</b></div>`;

    const examples=document.createElement('section');examples.className='pm-v13-section';examples.innerHTML='<h4>Примери за сигнали</h4>';
    const exWrap=document.createElement('div');exWrap.className='pm-v13-examples';
    const signalNodes=qsa('#market .pm-node.kind-signal').slice(0,3);
    if(signalNodes.length){signalNodes.forEach(n=>{const t=n.querySelector('b')?.textContent?.trim()||'Сигнал';const meta=n.querySelector('small')?.textContent?.trim()||'';const a=document.createElement('article');a.className='pm-v13-example';a.innerHTML=`<b>${t}</b><small>${meta}</small>`;exWrap.appendChild(a)})}
    else exWrap.innerHTML='<p class="pm-v13-muted">Няма текстови сигнали за показване.</p>';
    examples.appendChild(exWrap);

    body.append(summary,metrics,topic,sentiment,rel,src,examples);
    if(actions){actions.classList.add('pm-v13-actions');body.appendChild(actions)}
    shell.append(bar,body);
    d.prepend(shell);
    d.dataset.v13='ready';
  }

  function decorateLower(){
    const history=qs('#market .pm-history');
    if(history&&!qs('.pm-v13-history-summary',history)){
      const active=qs('#market .pm-kpi.active')||qs('#market .pm-kpi');
      const value=active?.querySelector('.pm-kpi-value')?.textContent?.trim()||'—';
      const delta=active?.querySelector('.pm-kpi-delta')?.textContent?.trim()||'—';
      const period=qs('#market [data-pm-period]')?.selectedOptions?.[0]?.textContent?.trim()||'—';
      const s=document.createElement('div');s.className='pm-v13-history-summary';s.innerHTML=`<div><span>Текуща стойност</span><b>${value}</b></div><div><span>Промяна</span><b>${delta}</b></div><div><span>Период</span><b>${period}</b></div>`;
      qs('.pm-lower-head',history)?.after(s);
    }
    const heads=qsa('#market .pm-lower h3');
    if(heads[0])heads[0].textContent='Динамика на индекса';
    if(heads[1])heads[1].textContent='Ключови промени';
    if(heads[2])heads[2].textContent='Топ теми';
    qsa('#market .pm-change').forEach(x=>{if(!x.classList.contains('up')&&!x.classList.contains('down'))x.classList.add('flat')});
    const themes=qs('#market .pm-theme-cloud');
    const card=themes?.closest('.pm-card');
    if(card&&!qs('.pm-v13-topic-foot',card)){const f=document.createElement('div');f.className='pm-v13-topic-foot';const c=themes.querySelectorAll('button').length;f.textContent=c?`${c} измерими теми в текущия набор`:'Няма достатъчно измерими теми.';card.appendChild(f)}
  }

  function decorate(){if(!marketActive())return;ensureReferenceStyles();ensureStyles();setCopy();decorateDrawer();decorateLower()}
  function afterCoreRender(){
    requestAnimationFrame(()=>{window.BLISPerceptionGlobe?.apply?.();decorate()});
    setTimeout(()=>{window.BLISPerceptionGlobe?.apply?.();decorate()},90);
    setTimeout(()=>{window.BLISPerceptionGlobe?.apply?.();decorate()},260);
  }
  function mount(){
    if(!marketActive()||!window.BLISPerceptionMap)return;
    window.BLISPerceptionMap.mount?.();
    afterCoreRender();
  }

  function wrapRoute(name){
    const fn=window[name];if(typeof fn!=='function'||fn.__pmV14)return;
    const w=function(id){const r=fn.apply(this,arguments);if(id==='market')requestAnimationFrame(mount);return r};w.__pmV14=true;w.__pmBase=fn;window[name]=w;
  }

  function install(){ensureReferenceStyles();ensureStyles();wrapRoute('refGo');wrapRoute('go');setCopy();if(marketActive())mount()}

  document.addEventListener('click',e=>{
    if(e.target.closest?.('#nav [data-page="market"]'))setTimeout(mount,0);
    if(e.target.closest?.('#market .pm-node,#market [data-related],#market [data-theme],#market [data-kpi]'))setTimeout(()=>{const d=document.getElementById('pmDrawer');if(d)d.dataset.v13='';decorate()},0);
  },true);
  document.addEventListener('change',e=>{
    if(e.target.matches?.('#market [data-pm-period],#market [data-pm-type],#market [data-pm-source]'))setTimeout(()=>{const d=document.getElementById('pmDrawer');if(d)d.dataset.v13='';afterCoreRender()},0);
    if(e.target?.id==='clientSel'&&marketActive())setTimeout(mount,120);
  },true);
  window.addEventListener('blis:clientdata',()=>{setCopy();if(marketActive())setTimeout(mount,40)});

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',()=>{if(marketActive())setTimeout(mount,80)},{once:true});
  window.BLISPerceptionBridge={mount,refresh:decorate};
})();