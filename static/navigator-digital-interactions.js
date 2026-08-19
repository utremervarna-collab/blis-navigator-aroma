/* BLIS Navigator — Digital Visibility interaction + readability layer */
(function(){
  'use strict';
  if(window.__BLISDigitalInteractionsV1)return;
  window.__BLISDigitalInteractionsV1=true;

  const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function addStyles(){
    if(document.getElementById('dvInteractionStylesV1'))return;
    const s=document.createElement('style');
    s.id='dvInteractionStylesV1';
    s.textContent=`
      /* Paler radar interior, same BLIS palette */
      #digital .dv-radar-grid{background:radial-gradient(circle at 50% 50%,#2c6874 0,#1b5061 23%,#123b55 55%,#0b2943 100%)!important;box-shadow:inset 0 0 0 1px rgba(91,231,226,.24),inset 0 0 28px rgba(31,197,201,.16),0 0 0 10px rgba(10,64,89,.09),0 0 30px rgba(22,188,197,.18)!important}
      #digital .dv-radar-grid:before{opacity:.48!important}
      #digital .dv-radar-grid:after{border-color:rgba(120,238,234,.38)!important;box-shadow:0 0 0 22px rgba(20,203,199,.022),0 0 0 46px rgba(23,102,232,.016)!important}
      #digital .dv-radar-glow{opacity:.62!important}
      #digital .dv-sweep{opacity:.58!important;background:conic-gradient(from 318deg,transparent 0 28deg,rgba(25,244,199,.045) 36deg,rgba(31,255,201,.30) 57deg,rgba(73,255,202,.035) 84deg,transparent 92deg)!important}

      /* Labels stay readable over the radar */
      #digital .dv-radar-sector span{display:inline-flex!important;background:rgba(255,255,255,.88)!important;border:1px solid rgba(255,255,255,.96)!important;border-radius:999px!important;padding:5px 9px!important;color:#102d58!important;text-shadow:none!important;box-shadow:0 4px 12px rgba(3,38,68,.11)!important;backdrop-filter:blur(3px)}
      #digital .dv-radar-sector span svg{filter:none!important}

      /* Larger, clearer score fields */
      #digital .dv-radar-sector b{min-width:72px!important;height:36px!important;padding:0 10px!important;border-radius:20px!important;font-size:14px!important;font-weight:900!important;border:3px solid #fff!important;letter-spacing:.01em!important;box-shadow:0 7px 17px color-mix(in srgb,var(--sector) 24%,transparent)!important}
      #digital .dv-detail-title strong{min-width:88px!important;padding:9px 12px!important;border-radius:9px!important;font-size:14px!important;font-weight:900!important;text-align:center!important;border:1px solid color-mix(in srgb,var(--accent) 20%,white)!important;cursor:pointer}
      #digital .dv-detail-metrics b{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:78px!important;min-height:30px!important;padding:5px 9px!important;border-radius:8px!important;background:color-mix(in srgb,var(--accent) 8%,white)!important;border:1px solid color-mix(in srgb,var(--accent) 14%,white)!important;color:#17315c!important;font-size:12.5px!important;font-weight:900!important;font-variant-numeric:tabular-nums}
      #digital .dv-kpi-body strong{display:inline-flex!important;align-items:baseline!important;justify-content:center!important;min-width:108px!important;padding:9px 11px!important;border-radius:11px!important;background:#f7faff!important;border:1px solid #e1eaf3!important;font-size:32px!important;box-shadow:inset 0 1px 0 #fff;font-variant-numeric:tabular-nums}
      #digital .dv-kpi-body strong small{font-size:12px!important;margin-left:4px!important}

      /* Every detail metric is actionable */
      #digital .dv-detail-metrics>div{cursor:pointer!important;transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease,background .14s ease!important;position:relative}
      #digital .dv-detail-metrics>div:after{content:'›';font-size:17px;font-weight:900;color:var(--accent);opacity:.55;margin-left:2px}
      #digital .dv-detail-metrics>div:hover,#digital .dv-detail-metrics>div:focus-visible{transform:translateX(2px);border-color:color-mix(in srgb,var(--accent) 32%,#dfe7f0)!important;background:color-mix(in srgb,var(--accent) 4%,white)!important;box-shadow:0 6px 16px rgba(20,47,80,.07);outline:0}
      #digital .dv-detail-trend{cursor:pointer;border-radius:10px;transition:box-shadow .14s ease,background .14s ease}
      #digital .dv-detail-trend:hover{background:#fbfdff;box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 12%,transparent)}
      #digital .dv-detail-title strong:hover{box-shadow:0 5px 14px color-mix(in srgb,var(--accent) 16%,transparent)}
      #digital .dv-source-card.dv-source-highlight{border-color:var(--dv-cyan)!important;box-shadow:0 0 0 3px rgba(32,216,213,.13),0 10px 22px rgba(20,47,80,.10)!important;transform:translateX(4px)}
      #digital .dv-focus-flash{animation:dvFocusFlash .9s ease}
      @keyframes dvFocusFlash{0%{box-shadow:0 0 0 4px rgba(32,216,213,.23)}100%{box-shadow:none}}

      #digital .dv-drilldown{margin:10px 0 2px;border:1px solid color-mix(in srgb,var(--accent) 18%,#dfe7f0);border-radius:10px;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 5%,white),#fff);padding:11px;animation:dvDrillIn .18s ease}
      @keyframes dvDrillIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
      #digital .dv-drilldown-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
      #digital .dv-drilldown-head b{color:#17315c;font-size:10.5px}.dv-drilldown-head button{border:0;background:transparent;color:#8090a4;cursor:pointer;font-size:16px}
      #digital .dv-drill-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
      #digital .dv-drill-grid div{border:1px solid #e7edf4;border-radius:8px;background:#fff;padding:8px}
      #digital .dv-drill-grid span{display:block;color:#7b8aa0;font-size:8.5px;margin-bottom:4px}
      #digital .dv-drill-grid strong{display:block;color:#17315c;font-size:13px;font-variant-numeric:tabular-nums}
      #digital .dv-drill-copy{margin:0;color:#65778f;font-size:9px;line-height:1.5}
      @media(max-width:720px){#digital .dv-radar-sector b{min-width:62px!important;height:32px!important;font-size:12px!important}#digital .dv-kpi-body strong{min-width:96px!important;font-size:28px!important}}
    `;
    document.head.appendChild(s);
  }

  function currentSector(){
    return document.querySelector('#digitalBody .dv-radar-sector.active')?.dataset?.sector ||
           document.querySelector('#digitalBody .dv-chip.active')?.dataset?.sector ||
           document.querySelector('#digitalBody .dv-kpi.active')?.dataset?.sector || 'search';
  }

  function detailSnapshot(){
    const rows=[...document.querySelectorAll('#digitalBody .dv-detail-metrics>div')];
    const val=i=>(rows[i]?.querySelector('b')?.textContent||'—').trim();
    return {
      label:(document.querySelector('#dvDetail h3')?.textContent||'Дигитален показател').trim(),
      main:val(0),days:val(1),change:val(2),sources:val(3)
    };
  }

  function drillHost(){
    const metrics=document.querySelector('#digitalBody .dv-detail-metrics');
    if(!metrics)return null;
    let box=document.getElementById('dvMetricDrilldown');
    if(!box){box=document.createElement('div');box.id='dvMetricDrilldown';box.className='dv-drilldown';metrics.insertAdjacentElement('afterend',box)}
    return box;
  }

  function showBreakdown(mode){
    const box=drillHost();if(!box)return;
    const d=detailSnapshot();
    const titles={main:'Разбивка на основната стойност',days:'Дневна история',change:'Промяна на показателя',sources:'Наблюдавани източници'};
    let body='';
    if(mode==='main')body=`<div class="dv-drill-grid"><div><span>Основна стойност</span><strong>${E(d.main)}</strong></div><div><span>Дневни измервания</span><strong>${E(d.days)}</strong></div><div><span>Промяна</span><strong>${E(d.change)}</strong></div><div><span>Източници</span><strong>${E(d.sources)}</strong></div></div>`;
    else if(mode==='days')body=`<p class="dv-drill-copy">Графиката по-долу показва измерената дневна история за сектор „${E(d.label)}“. Налични дневни точки: <b>${E(d.days)}</b>.</p>`;
    else if(mode==='change')body=`<p class="dv-drill-copy">Текущата измерена промяна за „${E(d.label)}“ е <b>${E(d.change)}</b>. Маркиран е трендът непосредствено под метриките.</p>`;
    else body=`<p class="dv-drill-copy">Показват се източниците, свързани със сектор „${E(d.label)}“. Системата отчита <b>${E(d.sources)}</b> наблюдавани източника в тази категория.</p>`;
    box.innerHTML=`<div class="dv-drilldown-head"><b>${E(titles[mode]||titles.main)}</b><button type="button" aria-label="Затвори">×</button></div>${body}`;
    box.querySelector('button')?.addEventListener('click',()=>box.remove(),{once:true});
  }

  function flash(el){if(!el)return;el.classList.remove('dv-focus-flash');void el.offsetWidth;el.classList.add('dv-focus-flash');setTimeout(()=>el.classList.remove('dv-focus-flash'),950)}

  function goTrend(mode){
    showBreakdown(mode);
    const trend=document.querySelector('#digitalBody .dv-detail-trend');
    if(trend){trend.scrollIntoView({behavior:'smooth',block:'center'});flash(trend)}
  }

  function showSources(){
    showBreakdown('sources');
    const sector=currentSector();
    const chip=document.querySelector(`#digitalBody .dv-chip[data-sector="${CSS.escape(sector)}"]`);
    if(chip)chip.click();
    setTimeout(()=>{
      const rail=document.querySelector('#digitalBody .dv-source-rail');
      const cards=[...document.querySelectorAll('#digitalBody .dv-source-card')].filter(x=>!x.hidden);
      cards.forEach(x=>x.classList.add('dv-source-highlight'));
      if(rail){rail.scrollIntoView({behavior:'smooth',block:'center'});flash(rail)}
      setTimeout(()=>cards.forEach(x=>x.classList.remove('dv-source-highlight')),2200);
    },100);
  }

  function activateMetric(index){
    if(index===0)showBreakdown('main');
    else if(index===1)goTrend('days');
    else if(index===2)goTrend('change');
    else showSources();
  }

  function patch(){
    const root=document.getElementById('digitalBody');
    if(!root||!root.children.length)return false;
    addStyles();
    const rows=[...root.querySelectorAll('.dv-detail-metrics>div')];
    const hints=['Виж разбивка','Виж дневната история','Виж промяната','Виж източниците'];
    rows.forEach((row,i)=>{
      row.dataset.dvMetricAction=String(i);row.setAttribute('role','button');row.setAttribute('tabindex','0');row.setAttribute('aria-label',hints[i]||'Виж детайли');row.title=hints[i]||'Виж детайли';
    });
    const titleValue=root.querySelector('.dv-detail-title strong');
    if(titleValue){titleValue.dataset.dvMetricAction='0';titleValue.setAttribute('role','button');titleValue.setAttribute('tabindex','0');titleValue.title='Виж разбивка'}
    const trend=root.querySelector('.dv-detail-trend');
    if(trend){trend.dataset.dvMetricAction='1';trend.setAttribute('role','button');trend.setAttribute('tabindex','0');trend.title='Виж дневната история'}
    return true;
  }

  document.addEventListener('click',e=>{
    const target=e.target?.closest?.('#digitalBody [data-dv-metric-action]');
    if(!target)return;
    e.stopPropagation();
    activateMetric(Number(target.dataset.dvMetricAction)||0);
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter'&&e.key!==' ')return;
    const target=e.target?.closest?.('#digitalBody [data-dv-metric-action]');
    if(!target)return;e.preventDefault();activateMetric(Number(target.dataset.dvMetricAction)||0);
  });

  function init(){
    addStyles();patch();
    const root=document.getElementById('digitalBody');
    if(root)new MutationObserver(()=>requestAnimationFrame(patch)).observe(root,{childList:true,subtree:true});
    let n=0;const t=setInterval(()=>{n++;patch();if(n>25)clearInterval(t)},160);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.BLISDigitalInteractionsPatch=patch;
})();
