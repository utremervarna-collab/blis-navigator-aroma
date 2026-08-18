/* BLIS Navigator — actionable warning center for Live Monitoring */
(function(){
  const ROUTES={sources:'sources',reputation:'reputation',market:'market',competition:'competition',social:'social',digital:'digital',signals:'signals'};
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const signalTime=s=>{const raw=s?.created_at||s?.observed_at||s?.timestamp||s?.time||s?.date||s?.updated_at||s?.updatedAt;if(!raw)return null;const d=new Date(raw);return Number.isNaN(d.getTime())?null:d};
  const rawSignals=()=>{try{if(window.BLISPeriod?.signals)return window.BLISPeriod.signals();return Array.isArray(D?.signals)?D.signals:[]}catch{return[]}};
  const textOf=s=>`${s?.title||s?.label||''} ${s?.description||s?.detail||s?.message||''} ${s?.type||s?.category||''} ${s?.source||s?.source_name||''}`.toLowerCase();
  function classify(s){
    const t=textOf(s);
    if(/403|timeout|api|source|crawl|scrap|източник|проверка|обнов|достъп|грешк/.test(t))return{route:'sources',kind:'Източник',action:'Отвори източника'};
    if(/репутац|review|rating|negative|negative sentiment|негатив|оплак|отзив|sentiment/.test(t))return{route:'reputation',kind:'Репутация',action:'Виж репутационния сигнал'};
    if(/competitor|конкурент|загорка|каменица|шуменско/.test(t))return{route:'competition',kind:'Конкурент',action:'Виж конкурентния анализ'};
    if(/social|facebook|instagram|linkedin|youtube|tiktok|социал/.test(t))return{route:'social',kind:'Социални канали',action:'Виж социалния сигнал'};
    if(/seo|website|site|digital|search visibility|уеб|сайт|дигитал/.test(t))return{route:'digital',kind:'Дигитална видимост',action:'Виж дигиталния сигнал'};
    if(/interest|mention|trend|market|search volume|интерес|споменаван|тенденц|пазар/.test(t))return{route:'market',kind:'Пазарни сигнали',action:'Разгледай сигнала'};
    return{route:'signals',kind:'Сигнал',action:'Разгледай сигнала'};
  }
  function priority(s){
    const raw=String(s?.severity||s?.priority||s?.level||'').toLowerCase(),t=textOf(s);
    if(/critical|high|urgent|крит|висок|спеш/.test(raw)||/криза|critical|рязък спад|силен негатив/.test(t))return{key:'high',label:'Висок приоритет'};
    if(/medium|moderate|сред/.test(raw)||/ръст|спад|аномал|забав/.test(t))return{key:'medium',label:'Среден приоритет'};
    return{key:'info',label:'Информация'};
  }
  function normalizedAlerts(){return rawSignals().map((s,i)=>{const c=classify(s),p=priority(s),d=signalTime(s);return{id:String(s?.id||s?.key||`signal-${i}`),title:s?.title||s?.label||s?.name||'Наблюдаван сигнал',description:s?.description||s?.detail||s?.message||'Отклонение, регистрирано от активното наблюдение.',source:s?.source_name||s?.source||s?.origin||'',value:s?.delta||s?.change||s?.value||'',time:d,route:c.route,kind:c.kind,action:c.action,priority:p.key,priorityLabel:p.label,raw:s}})}
  function ensureStyle(){if(document.getElementById('blisAlertCenterStyle'))return;const st=document.createElement('style');st.id='blisAlertCenterStyle';st.textContent=`
    .blis-alert-center{margin:-3px 0 16px;padding:15px 16px;border:1px solid #dce6f2;border-radius:12px;background:linear-gradient(180deg,#fff,#f9fbfe);box-shadow:0 6px 18px rgba(22,45,84,.06);color:#173263}.blis-alert-center-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:8px}.blis-alert-center-head b{font-size:13px}.blis-alert-center-head span{display:block;margin-top:4px;font-size:9px;color:#71809a}.blis-alert-close{border:0;background:transparent;color:#6e7c91;font-size:18px;cursor:pointer}.blis-alert-list{display:grid;gap:8px}.blis-alert-item{display:grid;grid-template-columns:110px minmax(0,1fr) auto;gap:13px;align-items:center;padding:11px 12px;border:1px solid #e3eaf3;border-radius:10px;background:#fff}.blis-alert-priority{font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}.blis-alert-priority.high{color:#c0394a}.blis-alert-priority.medium{color:#b87509}.blis-alert-priority.info{color:#1766e8}.blis-alert-copy b{display:block;font-size:10px;color:#173263}.blis-alert-copy p{margin:4px 0 0;font-size:9px;line-height:1.45;color:#65748b}.blis-alert-meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;font-size:8px;color:#8290a4}.blis-alert-action{border:1px solid #cfdced;background:#fff;color:#1766e8;border-radius:8px;padding:8px 10px;font-size:9px;font-weight:800;cursor:pointer;white-space:nowrap}.blis-alert-action:hover{background:#f1f6ff}.blis-alert-empty{padding:12px;border:1px dashed #d7e1ed;border-radius:9px;font-size:10px;color:#66758d}.blis-alert-focus{margin:0 0 14px;padding:12px 14px;border:1px solid #dce6f2;border-left:4px solid #1766e8;border-radius:10px;background:#f8fbff;box-shadow:0 4px 14px rgba(22,45,84,.05)}.blis-alert-focus.high{border-left-color:#c0394a}.blis-alert-focus.medium{border-left-color:#b87509}.blis-alert-focus-head{display:flex;justify-content:space-between;gap:12px}.blis-alert-focus-head b{font-size:11px;color:#173263}.blis-alert-focus-head button{border:0;background:transparent;color:#6e7c91;cursor:pointer}.blis-alert-focus p{margin:5px 0 0;font-size:9px;color:#65748b;line-height:1.45}.blis-alert-focus small{display:block;margin-top:6px;color:#8390a3;font-size:8px}@media(max-width:900px){.blis-alert-item{grid-template-columns:1fr}.blis-alert-action{justify-self:start}}
  `;document.head.appendChild(st)}
  function metaHtml(a){const parts=[];if(a.source)parts.push(`Източник: ${esc(a.source)}`);if(a.value!==''&&a.value!=null)parts.push(`Промяна: ${esc(a.value)}`);if(a.time)parts.push(a.time.toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}));parts.push(a.kind);return parts.map(x=>`<span>${x}</span>`).join('')}
  function alertRow(a){return `<div class="blis-alert-item" data-alert-id="${esc(a.id)}"><div class="blis-alert-priority ${a.priority}">${esc(a.priorityLabel)}</div><div class="blis-alert-copy"><b>${esc(a.title)}</b><p>${esc(a.description)}</p><div class="blis-alert-meta">${metaHtml(a)}</div></div><button type="button" class="blis-alert-action" data-alert-open="${esc(a.id)}">${esc(a.action)} →</button></div>`}
  function openCenter(){
    ensureStyle();
    document.getElementById('lmKpiDetail')?.remove();
    let box=document.getElementById('blisAlertCenter');
    if(!box){const k=document.querySelector('#live .lm-kpis');if(!k)return;box=document.createElement('div');box.id='blisAlertCenter';box.className='blis-alert-center';k.insertAdjacentElement('afterend',box)}
    const alerts=normalizedAlerts();
    box.innerHTML=`<div class="blis-alert-center-head"><div><b>АКТИВНИ ПРЕДУПРЕЖДЕНИЯ · ${alerts.length}</b><span>Отклонения и сигнали, които изискват проверка или внимание</span></div><button type="button" class="blis-alert-close" aria-label="Затвори">×</button></div>${alerts.length?`<div class="blis-alert-list">${alerts.map(alertRow).join('')}</div>`:'<div class="blis-alert-empty">Няма активни предупреждения за избрания период.</div>'}`;
    document.querySelectorAll('#live .lm-kpi').forEach(x=>x.classList.toggle('is-selected',x.dataset.lmKpi==='warnings'));
  }
  function closeCenter(){document.getElementById('blisAlertCenter')?.remove();document.querySelectorAll('#live .lm-kpi').forEach(x=>x.classList.remove('is-selected'))}
  function targetHost(route){return document.querySelector(`#${route} > div`)||document.getElementById(`${route}Body`)||document.getElementById(route)}
  function focusAlert(a){
    closeCenter();
    try{if(typeof window.refGo==='function')window.refGo(a.route);else document.querySelector(`#nav button[data-page="${a.route}"]`)?.click()}catch(e){}
    setTimeout(()=>{
      const host=targetHost(a.route);if(!host)return;
      host.querySelector('.blis-alert-focus')?.remove();
      const note=document.createElement('div');note.className=`blis-alert-focus ${a.priority}`;note.innerHTML=`<div class="blis-alert-focus-head"><b>${esc(a.priorityLabel)} · ${esc(a.title)}</b><button type="button" aria-label="Затвори">×</button></div><p>${esc(a.description)}</p><small>${metaHtml(a).replaceAll('<span>','').replaceAll('</span>',' · ')}</small>`;host.prepend(note);note.querySelector('button')?.addEventListener('click',()=>note.remove());note.scrollIntoView({behavior:'smooth',block:'start'});
      window.BLIS_ACTIVE_ALERT=a;
      window.dispatchEvent(new CustomEvent('blis:alertopen',{detail:a}));
    },250)
  }
  function syncCount(){const alerts=normalizedAlerts(),card=document.querySelector('#live .lm-kpi[data-lm-kpi="warnings"]');if(card){const strong=card.querySelector('strong'),small=card.querySelector('small');if(strong)strong.textContent=String(alerts.length);if(small)small.textContent=alerts.length?'изискват проверка или внимание':'няма текущи отклонения'}if(document.getElementById('blisAlertCenter'))openCenter()}
  function bind(){
    ensureStyle();syncCount();
    document.addEventListener('click',e=>{
      const warningCard=e.target.closest('#live .lm-kpi[data-lm-kpi="warnings"]');
      if(warningCard){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openCenter();return}
      if(e.target.closest('.blis-alert-close')){e.preventDefault();closeCenter();return}
      const btn=e.target.closest('[data-alert-open]');if(btn){e.preventDefault();const a=normalizedAlerts().find(x=>x.id===btn.dataset.alertOpen);if(a)focusAlert(a)}
    },true);
    window.addEventListener('blis:periodchange',()=>setTimeout(syncCount,60));
    window.addEventListener('blis:clientdata',()=>setTimeout(syncCount,100));
    document.addEventListener('click',e=>{if(e.target.closest('#nav button[data-page="live"]'))setTimeout(syncCount,150)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  window.BLISAlertCenter={open:openCenter,alerts:normalizedAlerts,focus:focusAlert};
})();
