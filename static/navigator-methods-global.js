/* BLIS Navigator — global interactive calculation methods + seventh leading signal */
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

  function enhanceSeventhSignal(){
    const box=document.querySelector('#overviewPremium .ov-leading-signals .ov-lead-grid');
    if(!box||box.dataset.sevenReady==='1')return;
    const arr=(window.D&&Array.isArray(D.signals))?D.signals:[];
    if(arr.length<7){box.dataset.sevenReady='1';return;}
    const x=arr[6];
    const item=document.createElement('div'); item.className='ov-lead-item blis-seventh-signal';
    item.innerHTML=`<span class="ov-lead-num">7</span><div class="ov-lead-copy"><b>${esc(x.title||x.label||'Наблюдаван сигнал')}</b><small>${esc(x.description||x.detail||'Промяна в наблюдаваната среда')}</small></div>${x.priority?`<span class="ov-lead-tag">${esc(x.priority)}</span>`:''}`;
    box.appendChild(item); box.dataset.sevenReady='1';
  }

  function enhance(){enhanceMethods();enhanceSeventhSignal()}
  const mo=new MutationObserver(()=>requestAnimationFrame(enhance));
  function init(){const host=document.getElementById('overviewPremium');if(host)mo.observe(host,{childList:true,subtree:true});enhance();setInterval(enhance,1600)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();