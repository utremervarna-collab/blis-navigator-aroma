/* BLIS Navigator — global interactive calculation methods + enriched leading signals */
(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const methods=[
    {icon:'◎',title:'Източници',lead:'Социални мрежи, медии, сайтове, ревюта и търсене',body:'BLIS събира публично достъпни сигнали от активните източници за конкретния клиент. Следят се публикации, споменавания, видимост, реакции, оценки, съдържание и промени в информационната среда.'},
    {icon:'▦',title:'Дневни измервания',lead:'Реални snapshot стойности за всеки календарен ден',body:'Системата запазва валидните измервания по дати. Дневната динамика се изгражда от действително записани стойности, а не от визуално генерирани междинни точки.'},
    {icon:'◔',title:'Нормализация',lead:'Обща скала 0–100 за сравнимост',body:'Показатели с различни единици и обеми се преобразуват към единна скала. Това позволява сравнение между направления, периоди и конкуренти без смесване на несъвместими стойности.'},
    {icon:'⚖',title:'Тегла по индекси',lead:'Различна тежест според типа показател',body:'Компонентите не участват механично с еднаква тежест. Социалните, дигиталните, репутационните, съдържателните и конкурентните сигнали се включват според логиката на съответния индекс.'},
    {icon:'↗',title:'Динамика',lead:'Дневни и периодни промени',body:'Следи се посоката и размерът на промяната: ден спрямо ден, в избрания период и спрямо наличната история. Равната стойност остава равна и не се създава изкуствено движение.'},
    {icon:'!',title:'Сигнали',lead:'Ръст, спад, отклонения и аномалии',body:'Водещите сигнали извеждат измененията, които заслужават внимание: ускорение, спад, нетипично отклонение, нова тема, репутационен риск или конкурентна активност.'},
    {icon:'✓',title:'Валидиране',lead:'Проверка между източници и филтриране на шум',body:'Където е възможно, наблюденията се съпоставят между повече от един източник. Невалидни, липсващи или очевидно шумови измервания не се представят като надеждна промяна.'}
  ];

  function detail(i){
    const m=methods[i]||methods[0];
    return `<div class="blis-method-detail-icon">${m.icon}</div><div><small>МЕТОД ${String(i+1).padStart(2,'0')}</small><h4>${m.title}</h4><b>${m.lead}</b><p>${m.body}</p></div>`;
  }
  function moduleHTML(){
    return `<div class="blis-method-shell"><div class="blis-method-visual" aria-hidden="true"><div class="blis-method-orbit"><span></span><span></span><span></span><i>⌁</i></div><div class="blis-method-center"><small>BLIS</small><strong>7</strong><em>метода</em></div></div><div class="blis-method-nav">${methods.map((m,i)=>`<button type="button" class="blis-method-point ${i===0?'active':''}" data-blis-method="${i}"><span>${m.icon}</span><b>${i+1}. ${m.title}</b></button>`).join('')}</div><div class="blis-method-detail" id="blisMethodDetail">${detail(0)}</div></div>`;
  }
  function bind(card){
    card.querySelectorAll('[data-blis-method]').forEach(btn=>btn.addEventListener('click',()=>{
      const i=Number(btn.dataset.blisMethod)||0;
      card.querySelectorAll('[data-blis-method]').forEach(x=>x.classList.toggle('active',x===btn));
      const d=card.querySelector('#blisMethodDetail'); if(d)d.innerHTML=detail(i);
    }));
  }
  function enhanceMethods(){
    const cards=[...document.querySelectorAll('#overviewPremium .ov-card')];
    const card=cards.find(c=>/Метод на изчисление|Методи на изчисление/.test(c.querySelector('h3')?.textContent||''));
    if(!card||card.dataset.blisMethodsReady==='1')return;
    card.dataset.blisMethodsReady='1'; card.classList.add('blis-method-card');
    card.innerHTML=`<div class="ov-head"><div><h3>Методи на изчисление</h3><div class="ov-panel-sub">Какво и как се следи</div></div><span class="ov-pill">ИНТЕРАКТИВНО</span></div>${moduleHTML()}`;
    bind(card);
  }

  const normKey=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/linkedin|линкд\s*ин/g,'linkedin').replace(/facebook|фейсбук/g,'facebook').replace(/instagram|инстаграм/g,'instagram').replace(/youtube|ютуб/g,'youtube').replace(/[^a-zа-я0-9]+/g,' ').trim();
  const topicKey=(title,text)=>{
    const n=normKey(`${title} ${text}`);
    for(const k of ['linkedin','facebook','instagram','youtube','новинар','google news','сайт','електронн магазин','ecommerce','репутац','конкурент','дигитал','публикац','аудитория'])if(n.includes(k))return k;
    return normKey(title).split(' ').slice(0,4).join(' ');
  };
  function signalItems(){
    const d=(typeof D!=='undefined'&&D)?D:{};
    const src=(typeof S!=='undefined'&&Array.isArray(S))?S:[];
    const out=[];
    const seenTopics=new Set();
    const add=(title,text,tag)=>{
      title=String(title||'').trim(); text=String(text||'').trim();
      if(!title||out.length>=7)return;
      const key=topicKey(title,text);
      if(key&&seenTopics.has(key))return;
      if(key)seenTopics.add(key);
      out.push({title,text,tag});
    };
    (Array.isArray(d.signals)?d.signals:[]).forEach(x=>add(x.title||x.label,x.text||x.description||x.detail||'Промяна в наблюдаваната среда',x.priority||({positive:'Положителен',watch:'За наблюдение',negative:'Риск'}[x.level])||'Сигнал'));
    (Array.isArray(d.metrics)?d.metrics:[]).forEach(x=>add(x.label,`Текущо измерване: ${x.value??'—'}`,'Измерване'));
    (Array.isArray(d.indices)?d.indices:[]).forEach(x=>add(x.label||x.name,`Текуща стойност: ${x.value??'—'}/100${x.description?` · ${x.description}`:''}`,'Индекс'));
    src.forEach(x=>add(x.label||x.name||x.key,x.method||'Активен публичен източник','Източник'));
    return out.slice(0,7);
  }
  function bindSignalToggle(card){
    const btn=card.querySelector('[data-leading-toggle]');
    if(!btn||btn.dataset.bound==='1')return;
    btn.dataset.bound='1';
    btn.addEventListener('click',()=>{
      const expanded=card.classList.toggle('is-expanded');
      btn.textContent=expanded?'Покажи по-малко ↑':'Покажи всички ↓';
      btn.setAttribute('aria-expanded',expanded?'true':'false');
    });
  }
  function enhanceLeadingSignals(){
    const card=document.querySelector('#overviewPremium .ov-leading-signals');
    const box=card?.querySelector('.ov-lead-grid');
    if(!card||!box)return;
    const items=signalItems();
    if(!items.length)return;
    const signature=JSON.stringify(items.map(x=>[x.title,x.text,x.tag]));
    if(box.dataset.signalSignature!==signature){
      box.dataset.signalSignature=signature;
      box.innerHTML=items.map((x,i)=>`<div class="ov-lead-item ${i>2?'ov-lead-extra':''}"><span class="ov-lead-num">${i+1}</span><div class="ov-lead-copy"><b>${esc(x.title)}</b><small>${esc(x.text)}</small></div><span class="ov-lead-tag">${esc(x.tag)}</span></div>`).join('');
      card.classList.remove('is-expanded');
      let toggle=card.querySelector('[data-leading-toggle]');
      if(items.length>3){
        if(!toggle){toggle=document.createElement('button');toggle.type='button';toggle.className='ov-leading-toggle';toggle.dataset.leadingToggle='1';card.appendChild(toggle)}
        toggle.textContent='Покажи всички ↓'; toggle.setAttribute('aria-expanded','false');
      }else if(toggle)toggle.remove();
    }
    bindSignalToggle(card);
  }

  function enhance(){enhanceMethods();enhanceLeadingSignals()}
  const mo=new MutationObserver(()=>requestAnimationFrame(enhance));
  function init(){const host=document.getElementById('overviewPremium');if(host)mo.observe(host,{childList:true,subtree:true});enhance();setInterval(enhance,1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();