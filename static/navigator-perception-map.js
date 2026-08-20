(() => {
  'use strict';

  const REF_CSS='/navigator-perception-reference-v10.css?v=20260820-ref10';
  let tangentRaf=0;

  function ensureReferenceStyles(){
    if(document.getElementById('pmReferenceV10Css'))return;
    const l=document.createElement('link');
    l.id='pmReferenceV10Css';l.rel='stylesheet';l.href=REF_CSS;
    document.head.appendChild(l);
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
    el.className='pm-ref-fixed-filter '+cls;
    el.innerHTML=`<span>${label}</span><select disabled aria-label="${label}"><option>${value}</option></select>`;
    return el;
  }

  function enhanceToolbar(){
    const bar=document.querySelector('#market.page.active .pm-filterbar')||document.querySelector('#market .pm-filterbar');
    const stage=document.querySelector('#market.page.active .pm-stage.network')||document.querySelector('#market .pm-stage.network');
    if(!bar||!stage)return;

    if(!bar.querySelector('.pm-ref-filter-trigger')){
      const btn=document.createElement('button');
      btn.type='button';btn.className='pm-ref-filter-trigger';btn.innerHTML='<span>▽</span> Филтри';
      btn.addEventListener('click',()=>bar.classList.toggle('pm-ref-expanded'));
      bar.prepend(btn);
    }
    if(!bar.querySelector('.pm-ref-country'))bar.appendChild(fixedFilter('Държава','България','pm-ref-country'));
    if(!bar.querySelector('.pm-ref-language'))bar.appendChild(fixedFilter('Език','Всички','pm-ref-language'));

    const src=bar.querySelector('[data-pm-source]')?.closest('label');
    const period=bar.querySelector('[data-pm-period]')?.closest('label');
    const type=bar.querySelector('[data-pm-type]')?.closest('label');
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
    const desc=[...d.querySelectorAll('.pm-drawer-section')].find(s=>/Как се чете/i.test(s.querySelector('h4')?.textContent||''))?.querySelector('p')?.textContent?.trim()||'Проверим фактор от текущата информационна среда.';

    const titlebar=document.createElement('div');titlebar.className='pm-ref-injected pm-ref-drawer-titlebar';
    titlebar.innerHTML='<b>Детайли за сигнал</b><button type="button" aria-label="Затвори панела">×</button>';
    titlebar.querySelector('button').addEventListener('click',()=>{d.style.display='none';main?.classList.add('drawer-closed')});d.prepend(titlebar);

    head.classList.add('pm-ref-identity');
    if(!head.querySelector('.pm-ref-signal-icon')){const icon=document.createElement('span');icon.className='pm-ref-signal-icon';icon.textContent='●';head.prepend(icon)}
    const identityMeta=document.createElement('div');identityMeta.className='pm-ref-injected pm-ref-identity-meta';
    identityMeta.innerHTML=`<span>${value}</span><strong>${trend}</strong><i>${category||source}</i>`;head.after(identityMeta);

    const detailGrid=d.querySelector('.pm-detail-grid');if(detailGrid)detailGrid.classList.add('pm-ref-hidden-grid');
    const how=[...d.querySelectorAll('.pm-drawer-section')].find(s=>/Как се чете/i.test(s.querySelector('h4')?.textContent||''));
    if(how){how.querySelector('h4').textContent='Ключова тема';how.querySelector('p').textContent=desc}

    const sent=sentiment(),sentimentBlock=document.createElement('section');sentimentBlock.className='pm-ref-injected pm-ref-section pm-ref-sentiment';
    sentimentBlock.innerHTML=sent?`<h4>Настроение</h4><div class="pm-ref-sentbar"><i style="width:${sent.p.toFixed(1)}%"></i><i style="width:${sent.n.toFixed(1)}%"></i><i style="width:${sent.neg.toFixed(1)}%"></i></div><div class="pm-ref-sentlegend"><span>${Math.round(sent.p)}% Позитивно</span><span>${Math.round(sent.n)}% Неутрално</span><span>${Math.round(sent.neg)}% Негативно</span></div>`:`<h4>Настроение</h4><div class="pm-ref-sentbar empty"><i></i></div><p class="pm-ref-emptycopy">Няма достатъчно измерими данни за разпределение на настроението.</p>`;
    (how||identityMeta).after(sentimentBlock);

    const relSection=[...d.querySelectorAll('.pm-drawer-section')].find(s=>/Свързани елементи/i.test(s.querySelector('h4')?.textContent||''));
    if(relSection){relSection.classList.add('pm-ref-related-section');relSection.querySelector('h4').textContent='Свързани подтеми'}

    const sources=sourceRows(),sourceBlock=document.createElement('section');sourceBlock.className='pm-ref-injected pm-ref-section pm-ref-sources';
    sourceBlock.innerHTML=`<h4>Източници</h4>${sources.length?sources.map((r,i)=>`<div class="pm-ref-source-row"><span><i>${i+1}</i>${r.label}</span><b>${r.count}</b><small>наблюдения</small></div>`).join(''):'<p class="pm-ref-emptycopy">Няма активни източници в текущия набор.</p>'}`;(relSection||sentimentBlock).after(sourceBlock);

    const examples=signalExamples(),exBlock=document.createElement('section');exBlock.className='pm-ref-injected pm-ref-section pm-ref-examples';
    exBlock.innerHTML=`<h4>Примери за сигнали</h4>${examples.length?examples.map(x=>`<article><p>${(x.detail||x.title).replace(/[<>]/g,'')}</p><small>${x.title&&x.detail?x.title:source}${x.time?' · '+new Date(x.time).toLocaleDateString('bg-BG'):''}</small></article>`).join(''):'<p class="pm-ref-emptycopy">Няма текстови сигнали за показване.</p>'}`;sourceBlock.after(exBlock);

    const actions=d.querySelector('.pm-actions');if(actions){actions.classList.add('pm-ref-actions');actions.querySelectorAll('button').forEach(b=>b.classList.add('pm-ref-action-button'))}
  }

  function enhanceStructure(){
    if(!document.getElementById('market')?.classList.contains('active'))return;
    const hero=document.querySelector('#market .pm-hero');if(hero){const h=hero.querySelector('h2'),p=hero.querySelector('p');if(h)h.textContent='Карта на потребителското възприятие';if(p)p.textContent='Проследяване на потребителските сигнали и възприятия за бранда в реално време.'}
    const maphead=document.querySelector('#market .pm-maphead');if(maphead){const b=maphead.querySelector('b'),s=maphead.querySelector('small');if(b)b.textContent='Интерактивна карта на възприятието';if(s)s.textContent='● В реално време'}
    const lowers=[...document.querySelectorAll('#market .pm-lower .pm-card h3')];if(lowers[0])lowers[0].textContent='Динамика на индекса';if(lowers[1])lowers[1].textContent='Ключови промени';if(lowers[2])lowers[2].textContent='Топ теми';
    enhanceToolbar();enhanceKpis();enhanceDrawer();
  }

  function tangentFrame(){
    tangentRaf=0;if(!document.getElementById('market')?.classList.contains('active'))return;
    const stage=document.querySelector('#market .pm-stage.network.pm-globe-v3');if(!stage)return;
    stage.querySelectorAll('.pm-node').forEach(n=>{const x=parseFloat(n.style.left),y=parseFloat(n.style.top);if(!Number.isFinite(x)||!Number.isFinite(y))return;const dx=Math.max(-1,Math.min(1,(x-50)/38)),dy=Math.max(-1,Math.min(1,(y-50)/42)),factor=n.classList.contains('selected')?.28:1;n.style.setProperty('--label-yaw',`${(dx*8*factor).toFixed(2)}deg`);n.style.setProperty('--label-pitch',`${(-dy*4.5*factor).toFixed(2)}deg`);n.style.setProperty('--label-roll',`${(dx*dy*2.4*factor).toFixed(2)}deg`);n.style.setProperty('--label-edge',Math.min(1,Math.abs(dx)).toFixed(3))});
    tangentRaf=requestAnimationFrame(tangentFrame);
  }
  function startTangentLoop(){if(!tangentRaf)tangentRaf=requestAnimationFrame(tangentFrame)}

  function mountMarket(){
    labelMarket();polishBrand();ensureReferenceStyles();if(!window.BLISPerceptionMap)return;
    if(document.getElementById('market')?.classList.contains('active')){window.BLISPerceptionMap.mount?.();window.BLISPerceptionGlobe?.apply?.();[0,80,220,500].forEach(ms=>setTimeout(enhanceStructure,ms));startTangentLoop()}
  }
  function wrapRoute(name){const fn=window[name];if(typeof fn!=='function'||fn.__pmBridgeV10)return;const wrapped=function(id){const result=fn.apply(this,arguments);if(id==='market')requestAnimationFrame(mountMarket);else setTimeout(()=>{labelMarket();polishBrand()},0);return result};wrapped.__pmBridgeV10=true;wrapped.__pmBase=fn;window[name]=wrapped}
  function ensure(){wrapRoute('refGo');wrapRoute('go');labelMarket();polishBrand();ensureReferenceStyles();mountMarket()}

  document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-page="market"]'))setTimeout(mountMarket,0);if(e.target.closest?.('.client-option')&&document.getElementById('market')?.classList.contains('active'))setTimeout(mountMarket,120);if(e.target.closest?.('#market .pm-node,#market [data-related],#market [data-theme],#market [data-kpi]'))setTimeout(()=>{enhanceStructure();enhanceDrawer()},0)});
  document.addEventListener('change',e=>{if(e.target?.id==='clientSel'&&document.getElementById('market')?.classList.contains('active'))setTimeout(mountMarket,80);if(e.target.matches?.('#market [data-pm-period],#market [data-pm-type],#market [data-pm-source]'))setTimeout(enhanceStructure,40)});

  if(window.BLISPerceptionMap)window.dispatchEvent(new CustomEvent('blis:perception-core-ready'));else console.error('BLIS Perception core is not loaded before the route bridge');
  [0,180,500,900,1500,2600].forEach(ms=>setTimeout(ensure,ms));
  window.BLISPerceptionBridge={mount:mountMarket,refresh:ensure};
})();