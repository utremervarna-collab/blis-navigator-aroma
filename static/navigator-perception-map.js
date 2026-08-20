(() => {
  'use strict';

  const REF_CSS='/navigator-perception-reference-v10.css?v=20260820-ref11';
  const PANEL_STYLE_ID='pmPanelV12Style';
  let tangentRaf=0;

  function ensureReferenceStyles(){
    let l=document.getElementById('pmReferenceV10Css');
    if(l){if(l.getAttribute('href')!==REF_CSS)l.setAttribute('href',REF_CSS);return;}
    l=document.createElement('link');
    l.id='pmReferenceV10Css';l.rel='stylesheet';l.href=REF_CSS;
    document.head.appendChild(l);
  }

  function ensurePanelV12Styles(){
    if(document.getElementById(PANEL_STYLE_ID))return;
    const s=document.createElement('style');s.id=PANEL_STYLE_ID;
    s.textContent=`
#market .pm-ref-period-range{margin-left:auto;display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 10px;border:1px solid #e1e7ef;border-radius:9px;background:#fff;color:#475467;box-shadow:0 1px 2px rgba(16,24,40,.02)}
#market .pm-ref-period-range>span{font-size:12px;color:var(--ref-blue,#1677ff)}
#market .pm-ref-period-range select{appearance:none;border:0;outline:0;background:transparent;color:#344054;font-size:9.5px;font-weight:720;padding:0 16px 0 0;cursor:pointer}
#market .pm-ref-period-range:after{content:'⌄';font-size:10px;color:#98a2b3;margin-left:-13px;pointer-events:none}
#market .pm-filterbar label[data-ref-label]:before{content:attr(data-ref-label) ': ';display:inline!important;font-size:9px!important;color:#667085!important;font-weight:700!important;margin-right:4px!important;white-space:nowrap!important}
#market .pm-ref-identity-meta strong.up{color:#11845b!important}#market .pm-ref-identity-meta strong.down{color:#c2414b!important}#market .pm-ref-identity-meta strong.flat{color:#667085!important}
#market .pm-ref-section{border-top:1px solid #f1f3f6;padding-top:13px!important}
#market .pm-ref-sentiment{border-top:0!important;padding-top:0!important}
#market .pm-ref-source-row span i.source-facebook{background:#eef4ff!important;color:#2563eb!important}#market .pm-ref-source-row span i.source-linkedin{background:#eef6ff!important;color:#0a66c2!important}#market .pm-ref-source-row span i.source-instagram{background:#fff1f7!important;color:#c13584!important}#market .pm-ref-source-row span i.source-google{background:#f3f6fb!important;color:#4285f4!important}#market .pm-ref-source-row span i.source-youtube{background:#fff0f0!important;color:#e62117!important}
#market .pm-ref-history-summary{display:grid;grid-template-columns:1.1fr .9fr .8fr;gap:8px;margin:1px 0 8px;padding:7px 8px;border:1px solid #edf1f5;border-radius:8px;background:#fbfcfe}
#market .pm-ref-history-summary>div{min-width:0}#market .pm-ref-history-summary span{display:block;font-size:7px;color:#98a2b3;margin-bottom:2px}#market .pm-ref-history-summary b,#market .pm-ref-history-summary strong,#market .pm-ref-history-summary em{display:block;font-size:9px;line-height:1.2;color:#344054;font-style:normal;font-weight:760;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#market .pm-ref-history-summary strong.up{color:#11845b}#market .pm-ref-history-summary strong.down{color:#c2414b}#market .pm-ref-history-summary strong.flat{color:#667085}
#market .pm-change.up i:before,#market .pm-change.down i:before,#market .pm-change.flat i:before{display:grid;place-items:center;width:100%;height:100%;font-size:10px;font-weight:900}#market .pm-change.up i:before{content:'↑';color:#11845b}#market .pm-change.down i:before{content:'↓';color:#c2414b}#market .pm-change.flat i:before{content:'→';color:#667085}
#market .pm-ref-topic-footer{margin-top:9px;padding-top:8px;border-top:1px solid #f0f3f6;font-size:7.8px;color:#98a2b3;line-height:1.35}
@media(max-width:760px){#market .pm-ref-period-range{display:none!important}#market .pm-filterbar label[data-ref-label]:before{display:none!important}#market .pm-ref-history-summary{grid-template-columns:1fr 1fr!important}#market .pm-ref-history-summary>div:last-child{display:none!important}}
`;
    document.head.appendChild(s);
  }

  function labelMarket(){
    const b=document.querySelector('#nav [data-page="market"]');
    if(!b)return;
    const label=b.querySelector('.navtxt')||b.querySelector('span:last-child');
    if(label&&label.textContent!=='Карта на възприятията')label.textContent='Карта на възприятията';
  }

  function polishBrand(){
    const brand=document.querySelector('.brandname');
    const sub=document.querySelector('.brandsub');
    if(brand&&brand.textContent!=='BLIS Navigator')brand.textContent='BLIS Navigator';
    if(sub)sub.setAttribute('aria-hidden','true');
  }

  function fixedFilter(label,value,cls){
    const el=document.createElement('label');
    el.className='pm-ref-fixed-filter '+cls;el.dataset.refLabel=label;
    el.innerHTML=`<span>${label}</span><select disabled aria-label="${label}"><option>${value}</option></select>`;
    return el;
  }

  function enhanceHeroPeriod(){
    const hero=document.querySelector('#market .pm-hero');
    const master=document.querySelector('#market [data-pm-period]');
    if(!hero||!master)return;
    let wrap=hero.querySelector('.pm-ref-period-range');
    if(!wrap){
      wrap=document.createElement('label');wrap.className='pm-ref-period-range';
      wrap.innerHTML='<span>▣</span><select aria-label="Период"></select>';
      hero.appendChild(wrap);
      wrap.querySelector('select').addEventListener('change',e=>{master.value=e.target.value;master.dispatchEvent(new Event('change',{bubbles:true}))});
    }
    const clone=wrap.querySelector('select');
    const sig=[...master.options].map(o=>`${o.value}:${o.textContent}`).join('|');
    if(clone.dataset.sig!==sig){clone.innerHTML=[...master.options].map(o=>`<option value="${o.value}">${o.textContent}</option>`).join('');clone.dataset.sig=sig}
    clone.value=master.value;
  }

  function enhanceToolbar(){
    const bar=document.querySelector('#market.page.active .pm-filterbar')||document.querySelector('#market .pm-filterbar');
    const stage=document.querySelector('#market.page.active .pm-stage.network')||document.querySelector('#market .pm-stage.network');
    if(!bar||!stage)return;

    if(!bar.querySelector('.pm-ref-filter-trigger')){
      const btn=document.createElement('button');
      btn.type='button';btn.className='pm-ref-filter-trigger';btn.innerHTML='<span>▽</span> Филтри';btn.title='Филтриране на видимите сигнали';
      btn.addEventListener('click',()=>bar.classList.toggle('pm-ref-expanded'));
      bar.prepend(btn);
    }
    if(!bar.querySelector('.pm-ref-country'))bar.appendChild(fixedFilter('Държава','България','pm-ref-country'));
    if(!bar.querySelector('.pm-ref-language'))bar.appendChild(fixedFilter('Език','Всички','pm-ref-language'));

    const src=bar.querySelector('[data-pm-source]')?.closest('label');
    const period=bar.querySelector('[data-pm-period]')?.closest('label');
    const type=bar.querySelector('[data-pm-type]')?.closest('label');
    if(src)src.dataset.refLabel='Източник';if(period)period.dataset.refLabel='Период';if(type)type.dataset.refLabel='Тип';
    const trigger=bar.querySelector('.pm-ref-filter-trigger');
    const country=bar.querySelector('.pm-ref-country');
    const language=bar.querySelector('.pm-ref-language');
    [trigger,src,period,country,language,type].filter(Boolean).forEach(el=>bar.appendChild(el));

    const tools=document.querySelector('#market .pm-tools');
    if(tools&&tools.parentElement!==stage){
      tools.classList.add('pm-ref-stage-tools');
      const plus=tools.querySelector('[data-zoom="+"]');
      const minus=tools.querySelector('[data-zoom="-"]');
      const reset=tools.querySelector('[data-zoom="reset"]');
      [plus,minus,reset].filter(Boolean).forEach(x=>tools.appendChild(x));
      stage.appendChild(tools);
    }
    enhanceHeroPeriod();
  }

  function sparklineFor(card){
    if(card.querySelector('.pm-ref-spark'))return;
    const delta=card.querySelector('.pm-kpi-delta');
    const cls=delta?.className||'';
    const pts=cls.includes('up')?'2,17 13,15 24,16 35,12 46,14 57,9 68,11 79,6':cls.includes('down')?'2,7 13,9 24,8 35,12 46,10 57,15 68,13 79,18':'2,12 13,12 24,12 35,12 46,12 57,12 68,12 79,12';
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','pm-ref-spark');svg.setAttribute('viewBox','0 0 82 22');svg.setAttribute('aria-hidden','true');
    svg.innerHTML=`<polyline points="${pts}"/>`;
    card.appendChild(svg);
  }

  function enhanceKpis(){document.querySelectorAll('#market .pm-kpi').forEach(sparklineFor)}

  function dataContext(){
    const g=globalThis;
    const d=(typeof g.D==='object'&&g.D)||{};
    const a=Array.isArray(g.A)?g.A:[];
    const s=Array.isArray(g.S)?g.S:[];
    return{d,a,s};
  }

  function sourceName(key){const {s}=dataContext();return s.find(x=>x?.key===key)?.label||String(key||'Източник')}
  function sourceRows(){
    const {a}=dataContext(),counts=new Map();
    a.forEach(o=>{const k=o?.source;if(k)counts.set(k,(counts.get(k)||0)+1)});
    return [...counts.entries()].sort((x,y)=>y[1]-x[1]).slice(0,4).map(([key,count])=>({label:sourceName(key),count}));
  }
  function sourceBadge(label){
    const t=String(label||'').toLowerCase();
    if(t.includes('facebook'))return{txt:'f',cls:'source-facebook'};
    if(t.includes('linkedin'))return{txt:'in',cls:'source-linkedin'};
    if(t.includes('instagram'))return{txt:'◎',cls:'source-instagram'};
    if(t.includes('youtube'))return{txt:'▶',cls:'source-youtube'};
    if(t.includes('google'))return{txt:'G',cls:'source-google'};
    if(t.includes('tripadvisor'))return{txt:'TA',cls:''};
    if(t.includes('booking'))return{txt:'B',cls:''};
    return{txt:'•',cls:''};
  }
  function signalExamples(){
    const {d}=dataContext();
    return (Array.isArray(d?.signals)?d.signals:[]).map(x=>({title:String(x?.title||x?.label||'').trim(),detail:String(x?.description||x?.detail||'').trim(),time:x?.time||x?.created_at||x?.createdAt||null})).filter(x=>x.title||x.detail).slice(0,3);
  }
  function sentiment(){
    const {d,a}=dataContext(),bag=[];
    const walk=(obj,depth=0)=>{if(!obj||typeof obj!=='object'||depth>3)return;Object.entries(obj).forEach(([k,v])=>{const key=String(k).toLowerCase();if(typeof v==='number'&&Number.isFinite(v))bag.push([key,v]);else if(v&&typeof v==='object'&&!Array.isArray(v))walk(v,depth+1)})};
    walk(d);a.slice(-30).forEach(x=>walk(x,0));
    const pick=re=>bag.find(([k])=>re.test(k))?.[1];
    let p=pick(/positive|positive_pct|sentiment_positive|pozitiv/),n=pick(/neutral|neutral_pct|sentiment_neutral/),neg=pick(/negative|negative_pct|sentiment_negative|negativ/);
    if([p,n,neg].every(Number.isFinite)){const sum=p+n+neg;if(sum>0){p=p/sum*100;n=n/sum*100;neg=neg/sum*100;return{p,n,neg}}}
    return null;
  }

  function trendClass(text){const t=String(text||'').trim().toLowerCase();if(t.startsWith('+')||/покач|раст|нагоре/.test(t))return'up';if(t.startsWith('-')||/спад|надолу/.test(t))return'down';return'flat'}

  function enhanceDrawer(){
    const d=document.getElementById('pmDrawer');if(!d||!d.children.length)return;
    const main=d.closest('.pm-main');d.style.display='';main?.classList.remove('drawer-closed');
    d.querySelectorAll('.pm-ref-injected').forEach(x=>x.remove());
    const head=d.querySelector('.pm-drawer-head');if(!head)return;

    const source=head.querySelector('small')?.textContent?.trim()||'';
    const category=head.querySelector('.pm-category')?.textContent?.trim()||'';
    const selected=document.querySelector('#market .pm-node.selected');
    const value=selected?.querySelector('small')?.childNodes?.[0]?.textContent?.trim()||selected?.querySelector('small')?.textContent?.trim()||'—';
    const trend=selected?.querySelector('em')?.textContent?.trim()||'без промяна';
    const kind=selected?.querySelector('.pm-kind')?.textContent?.trim()||'';
    const desc=[...d.querySelectorAll('.pm-drawer-section')].find(s=>/Как се чете|Ключова тема/i.test(s.querySelector('h4')?.textContent||''))?.querySelector('p')?.textContent?.trim()||'Проверим фактор от текущата информационна среда.';

    const titlebar=document.createElement('div');titlebar.className='pm-ref-injected pm-ref-drawer-titlebar';
    titlebar.innerHTML='<b>Детайли за сигнал</b><button type="button" aria-label="Затвори панела">×</button>';
    titlebar.querySelector('button').addEventListener('click',()=>{d.style.display='none';main?.classList.add('drawer-closed')});d.prepend(titlebar);

    head.classList.add('pm-ref-identity');
    if(!head.querySelector('.pm-ref-signal-icon')){const icon=document.createElement('span');icon.className='pm-ref-signal-icon';icon.textContent=kind==='ИНДЕКС'?'◎':kind==='СИГНАЛ'?'◆':'●';head.prepend(icon)}
    else head.querySelector('.pm-ref-signal-icon').textContent=kind==='ИНДЕКС'?'◎':kind==='СИГНАЛ'?'◆':'●';
    const identityMeta=document.createElement('div');identityMeta.className='pm-ref-injected pm-ref-identity-meta';
    identityMeta.innerHTML=`<span>${value}</span><strong class="${trendClass(trend)}">${trend}</strong><i>${category||source}</i>`;head.after(identityMeta);

    const detailGrid=d.querySelector('.pm-detail-grid');if(detailGrid)detailGrid.classList.add('pm-ref-hidden-grid');
    const how=[...d.querySelectorAll('.pm-drawer-section')].find(s=>/Как се чете|Ключова тема/i.test(s.querySelector('h4')?.textContent||''));
    if(how){how.querySelector('h4').textContent='Ключова тема';how.querySelector('p').textContent=desc}

    const sent=sentiment(),sentimentBlock=document.createElement('section');sentimentBlock.className='pm-ref-injected pm-ref-section pm-ref-sentiment';
    sentimentBlock.innerHTML=sent?`<h4>Настроение</h4><div class="pm-ref-sentbar"><i style="width:${sent.p.toFixed(1)}%"></i><i style="width:${sent.n.toFixed(1)}%"></i><i style="width:${sent.neg.toFixed(1)}%"></i></div><div class="pm-ref-sentlegend"><span>${Math.round(sent.p)}% Позитивно</span><span>${Math.round(sent.n)}% Неутрално</span><span>${Math.round(sent.neg)}% Негативно</span></div>`:`<h4>Настроение</h4><div class="pm-ref-sentbar empty"><i></i></div><p class="pm-ref-emptycopy">Няма достатъчно измерими данни за разпределение на настроението.</p>`;
    (how||identityMeta).after(sentimentBlock);

    const relSection=[...d.querySelectorAll('.pm-drawer-section')].find(s=>/Свързани елементи|Свързани подтеми/i.test(s.querySelector('h4')?.textContent||''));
    if(relSection){relSection.classList.add('pm-ref-related-section');relSection.querySelector('h4').textContent='Свързани подтеми'}

    const sources=sourceRows(),sourceBlock=document.createElement('section');sourceBlock.className='pm-ref-injected pm-ref-section pm-ref-sources';
    sourceBlock.innerHTML=`<h4>Източници</h4>${sources.length?sources.map(r=>{const badge=sourceBadge(r.label);return`<div class="pm-ref-source-row"><span><i class="${badge.cls}">${badge.txt}</i>${r.label}</span><b>${r.count}</b><small>наблюдения</small></div>`}).join(''):'<p class="pm-ref-emptycopy">Няма активни източници в текущия набор.</p>'}`;(relSection||sentimentBlock).after(sourceBlock);

    const examples=signalExamples(),exBlock=document.createElement('section');exBlock.className='pm-ref-injected pm-ref-section pm-ref-examples';
    exBlock.innerHTML=`<h4>Примери за сигнали</h4>${examples.length?examples.map(x=>`<article><p>${(x.detail||x.title).replace(/[<>]/g,'')}</p><small>${x.title&&x.detail?x.title:source}${x.time?' · '+new Date(x.time).toLocaleDateString('bg-BG'):''}</small></article>`).join(''):'<p class="pm-ref-emptycopy">Няма текстови сигнали за показване.</p>'}`;sourceBlock.after(exBlock);

    const actions=d.querySelector('.pm-actions');if(actions){
      actions.classList.add('pm-ref-actions');const buttons=[...actions.querySelectorAll('button')];buttons.forEach(b=>b.classList.add('pm-ref-action-button'));
      if(buttons[0])buttons[0].textContent=/всички/i.test(buttons[0].textContent)?'Всички връзки':'Само свързаните';
    }
  }

  function enhanceLowerPanels(){
    const history=document.querySelector('#market .pm-history');
    if(history){
      let summary=history.querySelector('.pm-ref-history-summary');if(!summary){summary=document.createElement('div');summary.className='pm-ref-history-summary';const anchor=history.querySelector('.pm-lower-head');anchor?.after(summary)}
      const active=document.querySelector('#market .pm-kpi.active')||document.querySelector('#market .pm-kpi');
      const value=active?.querySelector('.pm-kpi-value')?.textContent?.trim()||'—';
      const delta=active?.querySelector('.pm-kpi-delta')?.textContent?.trim()||'—';
      const period=document.querySelector('#market [data-pm-period]')?.selectedOptions?.[0]?.textContent?.trim()||'—';
      summary.innerHTML=`<div><span>Текуща стойност</span><b>${value}</b></div><div><span>Промяна</span><strong class="${trendClass(delta)}">${delta}</strong></div><div><span>Период</span><em>${period}</em></div>`;
    }
    const changes=document.querySelectorAll('#market .pm-change');changes.forEach(x=>{if(!x.classList.contains('up')&&!x.classList.contains('down')&&!x.classList.contains('flat'))x.classList.add('flat')});
    const themes=document.querySelector('#market .pm-theme-cloud');
    const card=themes?.closest('.pm-card');if(card){let f=card.querySelector('.pm-ref-topic-footer');if(!f){f=document.createElement('div');f.className='pm-ref-topic-footer';card.appendChild(f)}const count=themes.querySelectorAll('button').length;f.textContent=count?`${count} измерими теми в текущия набор`:'Няма достатъчно измерими теми в текущия набор.'}
  }

  function normalizeMapHead(){
    const maphead=document.querySelector('#market .pm-maphead');
    if(!maphead)return;
    let group=maphead.querySelector(':scope > div');
    if(!group){group=document.createElement('div');maphead.prepend(group)}
    const titles=[...group.querySelectorAll(':scope > b')];
    const badges=[...group.querySelectorAll(':scope > small')];
    let title=titles[0];if(!title){title=document.createElement('b');group.prepend(title)}
    let badge=badges[0];if(!badge){badge=document.createElement('small');group.appendChild(badge)}
    titles.slice(1).forEach(el=>el.remove());
    badges.slice(1).forEach(el=>el.remove());
    title.textContent='Интерактивна карта на възприятието';
    badge.textContent='● В реално време';
    [...maphead.querySelectorAll(':scope > b,:scope > small')].forEach(el=>el.remove());
    [...maphead.querySelectorAll(':scope > div')].slice(1).forEach(extra=>{
      const hasHeader=extra.querySelector('b,small');
      if(hasHeader)extra.remove();
    });
  }

  function enhanceStructure(){
    if(!document.getElementById('market')?.classList.contains('active'))return;
    const hero=document.querySelector('#market .pm-hero');if(hero){const h=hero.querySelector('h2'),p=hero.querySelector('p');if(h)h.textContent='Карта на потребителското възприятие';if(p)p.textContent='Проследяване на потребителските сигнали и възприятия за бранда в реално време.'}
    normalizeMapHead();
    const lowers=[...document.querySelectorAll('#market .pm-lower .pm-card h3')];if(lowers[0])lowers[0].textContent='Динамика на индекса';if(lowers[1])lowers[1].textContent='Ключови промени';if(lowers[2])lowers[2].textContent='Топ теми';
    enhanceToolbar();enhanceKpis();enhanceDrawer();enhanceLowerPanels();
  }

  function tangentFrame(){
    tangentRaf=0;if(!document.getElementById('market')?.classList.contains('active'))return;
    const stage=document.querySelector('#market .pm-stage.network.pm-globe-v3');if(!stage)return;
    stage.querySelectorAll('.pm-node').forEach(n=>{const x=parseFloat(n.style.left),y=parseFloat(n.style.top);if(!Number.isFinite(x)||!Number.isFinite(y))return;const dx=Math.max(-1,Math.min(1,(x-50)/38)),dy=Math.max(-1,Math.min(1,(y-50)/42)),factor=n.classList.contains('selected')?.28:1;n.style.setProperty('--label-yaw',`${(dx*8*factor).toFixed(2)}deg`);n.style.setProperty('--label-pitch',`${(-dy*4.5*factor).toFixed(2)}deg`);n.style.setProperty('--label-roll',`${(dx*dy*2.4*factor).toFixed(2)}deg`);n.style.setProperty('--label-edge',Math.min(1,Math.abs(dx)).toFixed(3))});
    tangentRaf=requestAnimationFrame(tangentFrame);
  }
  function startTangentLoop(){if(!tangentRaf)tangentRaf=requestAnimationFrame(tangentFrame)}

  function mountMarket(){
    labelMarket();polishBrand();ensureReferenceStyles();ensurePanelV12Styles();if(!window.BLISPerceptionMap)return;
    if(document.getElementById('market')?.classList.contains('active')){window.BLISPerceptionMap.mount?.();window.BLISPerceptionGlobe?.apply?.();[0,80,220,500].forEach(ms=>setTimeout(enhanceStructure,ms));startTangentLoop()}
  }
  function wrapRoute(name){const fn=window[name];if(typeof fn!=='function'||fn.__pmBridgeV12)return;const wrapped=function(id){const result=fn.apply(this,arguments);if(id==='market')requestAnimationFrame(mountMarket);else setTimeout(()=>{labelMarket();polishBrand()},0);return result};wrapped.__pmBridgeV12=true;wrapped.__pmBase=fn;window[name]=wrapped}
  function ensure(){wrapRoute('refGo');wrapRoute('go');labelMarket();polishBrand();ensureReferenceStyles();ensurePanelV12Styles();mountMarket()}

  document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-page="market"]'))setTimeout(mountMarket,0);if(e.target.closest?.('.client-option')&&document.getElementById('market')?.classList.contains('active'))setTimeout(mountMarket,120);if(e.target.closest?.('#market .pm-node,#market [data-related],#market [data-theme],#market [data-kpi]'))setTimeout(()=>{enhanceStructure();enhanceDrawer();enhanceLowerPanels()},0)});
  document.addEventListener('change',e=>{if(e.target?.id==='clientSel'&&document.getElementById('market')?.classList.contains('active'))setTimeout(mountMarket,80);if(e.target.matches?.('#market [data-pm-period],#market [data-pm-type],#market [data-pm-source]'))setTimeout(enhanceStructure,40)});

  if(window.BLISPerceptionMap)window.dispatchEvent(new CustomEvent('blis:perception-core-ready'));else console.error('BLIS Perception core is not loaded before the route bridge');
  [0,180,500,900,1500,2600].forEach(ms=>setTimeout(ensure,ms));
  window.BLISPerceptionBridge={mount:mountMarket,refresh:ensure};
})();