/* BLIS Navigator - Signal Collector v1. Additive external-signal panel. */
(function(){
  'use strict';
  if(window.__BLIS_SIGNAL_COLLECTOR_V1)return;
  window.__BLIS_SIGNAL_COLLECTOR_V1=true;

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const arr=x=>Array.isArray(x)?x:[];
  const client=()=>String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.slug||new URLSearchParams(location.search).get('client')||'aroma').toLowerCase();
  const fmtTime=s=>{const d=new Date(s||0);if(isNaN(d))return'няма проверка';const mins=Math.max(0,Math.round((Date.now()-d.getTime())/60000));if(mins<2)return'току-що';if(mins<60)return`преди ${mins} мин.`;const h=Math.round(mins/60);if(h<24)return`преди ${h} ч.`;return d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})};
  const sourceLabel=s=>({news:'Медия',social:'Социален сигнал',web:'Публичен уеб'}[s]||'Външен източник');
  const topicLabel=s=>({regulatory:'Регулаторен',reputation:'Репутация',competition:'Конкуренция',product:'Продукт',commercial:'Търговски',brand_mention:'Споменаване'}[s]||'Сигнал');
  const severityLabel=s=>({critical:'Критичен',high:'Висок',medium:'Среден',low:'Нисък'}[s]||'Нисък');

  function styles(){
    if(document.getElementById('blisSignalCollectorStyles'))return;
    const el=document.createElement('style');
    el.id='blisSignalCollectorStyles';
    el.textContent=`
      .bsc-panel{margin:0 0 18px;border:1px solid #dfe7f2;border-radius:18px;background:linear-gradient(180deg,#fff 0%,#fbfcff 100%);box-shadow:0 10px 28px rgba(35,58,92,.055);overflow:hidden}
      .bsc-head{display:flex;align-items:center;gap:12px;padding:18px 20px 14px;border-bottom:1px solid #edf1f6}.bsc-title{min-width:0}.bsc-title b{display:block;color:#15335d;font-size:15px}.bsc-title span{display:block;margin-top:3px;color:#8290a4;font-size:10px}.bsc-live{margin-left:auto;display:flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid #dce8e2;border-radius:999px;background:#f7fbf9;color:#248b59;font-size:9px;font-weight:800;white-space:nowrap}.bsc-live i{width:6px;height:6px;border-radius:50%;background:#2fb26c;box-shadow:0 0 0 4px rgba(47,178,108,.10)}
      .bsc-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-bottom:1px solid #edf1f6}.bsc-kpi{padding:13px 18px;border-right:1px solid #edf1f6}.bsc-kpi:last-child{border-right:0}.bsc-kpi span{display:block;color:#8a97aa;font-size:9px}.bsc-kpi b{display:block;margin-top:4px;color:#17345e;font-size:18px;line-height:1}.bsc-kpi small{display:block;margin-top:4px;color:#8a97aa;font-size:8px}
      .bsc-toolbar{display:flex;align-items:center;gap:8px;padding:12px 18px}.bsc-filter{border:1px solid #e2e8f1;background:#fff;color:#667790;border-radius:999px;padding:6px 10px;font-size:9px;font-weight:700;cursor:pointer}.bsc-filter.active{border-color:#c9d8ee;background:#f2f6fc;color:#174c93}.bsc-updated{margin-left:auto;color:#8a97aa;font-size:9px}
      .bsc-list{display:grid;gap:8px;padding:0 18px 18px}.bsc-row{display:grid;grid-template-columns:10px minmax(0,1fr) auto;gap:11px;align-items:start;padding:12px 13px;border:1px solid #e9eef5;border-radius:13px;background:#fff;text-decoration:none;transition:.15s ease}.bsc-row:hover{border-color:#ccd9ea;transform:translateY(-1px);box-shadow:0 6px 16px rgba(35,58,92,.05)}.bsc-dot{width:8px;height:8px;margin-top:5px;border-radius:50%;background:#8ba0bb}.bsc-row[data-sev="medium"] .bsc-dot{background:#e6a53a}.bsc-row[data-sev="high"] .bsc-dot{background:#e36b4d}.bsc-row[data-sev="critical"] .bsc-dot{background:#cf3e4b;box-shadow:0 0 0 4px rgba(207,62,75,.09)}
      .bsc-copy{min-width:0}.bsc-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:4px}.bsc-meta span{color:#708199;font-size:8px;font-weight:700}.bsc-meta em{font-style:normal;padding:2px 6px;border-radius:999px;background:#f3f6fa;color:#65758d;font-size:8px;font-weight:700}.bsc-copy strong{display:block;color:#243e63;font-size:11px;line-height:1.35}.bsc-copy p{margin:4px 0 0;color:#7b899d;font-size:9px;line-height:1.45;white-space:normal;overflow-wrap:anywhere}.bsc-open{align-self:center;color:#1766e8;font-size:9px;font-weight:800;white-space:nowrap}.bsc-empty{padding:26px 20px 30px;text-align:center;color:#8190a4;font-size:10px;line-height:1.5}.bsc-empty b{display:block;margin-bottom:4px;color:#405875;font-size:12px}
      @media(max-width:900px){.bsc-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.bsc-kpi:nth-child(2){border-right:0}.bsc-kpi:nth-child(-n+2){border-bottom:1px solid #edf1f6}.bsc-toolbar{overflow:auto}.bsc-row{grid-template-columns:9px minmax(0,1fr)}.bsc-open{display:none}}
    `;
    document.head.appendChild(el);
  }

  function ensurePanel(){
    const root=document.getElementById('socialBody');
    if(!root)return null;
    let panel=root.querySelector('.bsc-panel');
    if(panel)return panel;
    panel=document.createElement('section');
    panel.className='bsc-panel';
    panel.setAttribute('data-blis-signal-collector','v1');
    panel.innerHTML=`<div class="bsc-head"><div class="bsc-title"><b>Външни сигнали</b><span>Автоматично откриване на нови публични споменавания за бранда</span></div><div class="bsc-live"><i></i> SIGNAL COLLECTOR · 10 MIN</div></div><div class="bsc-kpis"></div><div class="bsc-toolbar"><button class="bsc-filter active" data-filter="all">Всички</button><button class="bsc-filter" data-filter="news">Медии</button><button class="bsc-filter" data-filter="social">Социални</button><button class="bsc-filter" data-filter="web">Уеб</button><span class="bsc-updated">зареждане...</span></div><div class="bsc-list"><div class="bsc-empty">Зареждат се външните сигнали...</div></div>`;
    root.prepend(panel);
    panel.querySelectorAll('.bsc-filter').forEach(btn=>btn.addEventListener('click',()=>{
      panel.querySelectorAll('.bsc-filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');renderRows(panel,window.__BLIS_SIGNAL_ROWS||[],btn.dataset.filter||'all');
    }));
    return panel;
  }

  function renderRows(panel,rows,filter){
    const list=panel.querySelector('.bsc-list');if(!list)return;
    const filtered=filter==='all'?rows:rows.filter(x=>x.source_type===filter);
    if(!filtered.length){list.innerHTML=`<div class="bsc-empty"><b>Няма нови външни сигнали</b>Колекторът продължава да проверява публичната информационна среда.</div>`;return}
    list.innerHTML=filtered.slice(0,12).map(s=>{
      const title=String(s.title||s.text||'Публичен сигнал').trim();
      const text=String(s.text||'').trim();
      const snippet=text&&text!==title?(text.length>230?text.slice(0,229)+'…':text):'';
      const href=/^https?:\/\//i.test(String(s.url||''))?String(s.url):'#';
      return `<a class="bsc-row" data-sev="${esc(s.severity||'low')}" href="${esc(href)}" target="_blank" rel="noopener noreferrer"><i class="bsc-dot"></i><div class="bsc-copy"><div class="bsc-meta"><em>${esc(topicLabel(s.topic))}</em><span>${esc(sourceLabel(s.source_type))}</span><span>${esc(s.source||'публичен източник')}</span><span>${esc(fmtTime(s.detected_at))}</span></div><strong>${esc(title)}</strong>${snippet?`<p>${esc(snippet)}</p>`:''}</div><span class="bsc-open">Отвори ↗</span></a>`;
    }).join('');
  }

  function render(panel,data){
    const rows=arr(data?.signals);
    window.__BLIS_SIGNAL_ROWS=rows;
    const external=rows.length;
    const high=rows.filter(x=>x.severity==='critical'||x.severity==='high').length;
    const sources=new Set(rows.map(x=>x.source).filter(Boolean)).size;
    const newest=rows.map(x=>new Date(x.detected_at||0).getTime()).filter(Number.isFinite).sort((a,b)=>b-a)[0]||0;
    panel.querySelector('.bsc-kpis').innerHTML=`<div class="bsc-kpi"><span>Открити сигнали</span><b>${external}</b><small>текущ външен поток</small></div><div class="bsc-kpi"><span>Висок риск</span><b>${high}</b><small>за незабавен преглед</small></div><div class="bsc-kpi"><span>Източници</span><b>${sources}</b><small>уникални публични източници</small></div><div class="bsc-kpi"><span>Последен сигнал</span><b style="font-size:13px">${esc(newest?fmtTime(new Date(newest).toISOString()):'—')}</b><small>време на откриване</small></div>`;
    panel.querySelector('.bsc-updated').textContent='проверено '+fmtTime(data?.updated_at);
    const filter=panel.querySelector('.bsc-filter.active')?.dataset.filter||'all';
    renderRows(panel,rows,filter);
  }

  let busy=false,lastClient='';
  async function refresh(){
    const page=document.getElementById('social');
    const root=document.getElementById('socialBody');
    if(!root||!page?.classList.contains('active')||busy)return;
    styles();const panel=ensurePanel();if(!panel)return;
    const slug=client();lastClient=slug;busy=true;
    try{
      const r=await fetch(`/api/signals?client=${encodeURIComponent(slug)}&scope=external&limit=100`,{cache:'no-store'});
      if(!r.ok)throw new Error('signal api '+r.status);
      const data=await r.json();
      if(slug!==client())return;
      render(panel,data);
    }catch(e){
      const u=panel.querySelector('.bsc-updated');if(u)u.textContent='колекторът се свързва...';
    }finally{busy=false}
  }

  function init(){
    styles();
    setTimeout(refresh,500);
    window.addEventListener('blis:clientdata',()=>setTimeout(refresh,250));
    window.addEventListener('popstate',()=>setTimeout(refresh,250));
    document.addEventListener('click',e=>{if(e.target?.closest?.('[data-page="social"],a[href*="page=social"]'))setTimeout(refresh,300)});
    const root=document.getElementById('socialBody');if(root)new MutationObserver(()=>{if(document.getElementById('social')?.classList.contains('active')&&!root.querySelector('.bsc-panel'))setTimeout(refresh,80)}).observe(root,{childList:true,subtree:false});
    setInterval(()=>{if(client()!==lastClient||document.getElementById('social')?.classList.contains('active'))refresh()},30000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
