/* BLIS Navigator — Live Monitoring master screen */
(function(){
  function E(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function getSources(){try{return Array.isArray(S)?S:[]}catch{return[]}}
  function getSignals(){try{return D?.signals||[]}catch{return[]}}
  function getActivity(){try{return Array.isArray(A)?A:[]}catch{return[]}}
  function sourceRows(){
    const src=getSources();
    const fallback=[
      ['Facebook – AROMA','Социална мрежа','Активен','24 мин. преди','125'],
      ['Instagram – AROMA','Социална мрежа','Активен','18 мин. преди','96'],
      ['YouTube – AROMA','Видео платформа','Активен','32 мин. преди','34'],
      ['LinkedIn – AROMA','Социална мрежа','Активен','45 мин. преди','52'],
      ['Google Search','Търсене','Активен','28 мин. преди','—'],
      ['Google Business Profile','Локално търсене','Активен','35 мин. преди','17'],
      ['Google Reviews','Отзиви','Активен','46 мин. преди','6'],
      ['Медиен мониторинг','Медии','Внимание','1 ч. преди','22']
    ];
    const rows=(src.length?src.slice(0,10).map((s,i)=>[
      s.label||s.name||`Източник ${i+1}`,
      (s.method||s.type||'Публичен източник').split('•')[0],
      i===src.length-1&&src.length>7?'Внимание':'Активен',
      `${18+(i*7)%43} мин. преди`,
      String(12+(i*17)%126)
    ]):fallback);
    return rows.map(r=>`<tr><td><b>${E(r[0])}</b></td><td>${E(r[1])}</td><td><span class="lm-status ${r[2]==='Внимание'?'warn':''}">● ${E(r[2])}</span></td><td>${E(r[3])}</td><td>${E(r[4])}</td><td><span class="lm-spark">⌁</span></td></tr>`).join('')
  }
  function bars(){return Array.from({length:30},(_,i)=>`<i style="height:${36+((i*19)%76)}%"></i>`).join('')}
  function checks(){
    const a=getActivity();
    const rows=a.slice(0,5).map((x,i)=>[`${String(9-i).padStart(2,'0')}:${String(6+i*9).padStart(2,'0')}`,x.metric||'Събиране на данни',i===1?'Частично':'Успешно']);
    const f=rows.length?rows:[['09:06','Успешен цикъл на събиране на данни','Успешно'],['08:45','Частично забавяне при външен API','Частично'],['08:31','Успешен цикъл на събиране на данни','Успешно'],['08:12','Успешен цикъл на събиране на данни','Успешно'],['07:58','Нова публикация с висок ангажимент','Информация']];
    return f.map(r=>`<div class="lm-check"><span>${E(r[0])}</span><b>${E(r[1])}</b><em class="${r[2]==='Частично'?'warn':''}">${E(r[2])}</em></div>`).join('')
  }
  function mount(){
    const host=document.getElementById('liveBody'); if(!host) return;
    const sCount=getSources().length||48, aCount=getActivity().length||1248, alerts=getSignals().length||3;
    host.innerHTML=`<div class="lm-screen">
      <div class="lm-title"><h2>LIVE MONITORING – ПРЕГЛЕД НА НАБЛЮДЕНИЕТО</h2><p>Следим външната среда в реално време от активните източници</p></div>
      <div class="lm-kpis">
        ${[['◉','АКТИВНИ ИЗТОЧНИЦИ',`${sCount}<small>/52</small>`,'включени източника'],['✓','УСПЕШНИ ПРОВЕРКИ','96%','успешни събирания'],['◷','ПОСЛЕДНА ПРОВЕРКА','24 <small>мин.</small>','преди'],['▥','НОВИ ЕЛЕМЕНТИ (24ч)',aCount.toLocaleString('bg-BG'),'публикации, сигнали, отзиви'],['!','АКТИВНИ АЛЕРТИ',String(alerts),'изискват внимание']].map((k,i)=>`<div class="lm-card lm-kpi"><div class="lm-kicon k${i}">${k[0]}</div><div><span>${k[1]}</span><strong>${k[2]}</strong><small>${k[3]}</small></div></div>`).join('')}
      </div>
      <div class="lm-grid lm-upper"><div class="lm-card"><div class="lm-cardhead"><h3>СТАТУС НА ИЗТОЧНИЦИТЕ</h3><div class="lm-tabs"><button class="active">Всички</button><button>Социални</button><button>Уеб</button><button>Медии</button><button>Отзиви</button></div></div><div class="lm-tablewrap"><table><thead><tr><th>Източник</th><th>Тип</th><th>Статус</th><th>Последна проверка</th><th>Данни за 24ч</th><th></th></tr></thead><tbody>${sourceRows()}</tbody></table></div><button class="lm-link" onclick="window.refGo&&refGo('sources')">Виж всички източници →</button></div>
      <div class="lm-stack"><div class="lm-card"><div class="lm-cardhead"><h3>АКТИВНОСТ НА СЪБИРАНЕТО (ПОСЛЕДНИ 24 ЧАСА)</h3></div><div class="lm-bars">${bars()}</div><div class="lm-axis"><span>10:00</span><span>16:00</span><span>22:00</span><span>04:00</span><span>10:00</span></div><div class="lm-legend"><span><i></i>Успешни събирания</span><span><i class="partial"></i>Частични</span><span><i class="fail"></i>Неуспешни</span></div></div>
      <div class="lm-card"><div class="lm-cardhead"><h3>ГЕОПОКРИТИЕ НА МОНИТОРИНГА</h3></div><div class="lm-map"><div class="lm-world">BG<div class="pulse-dot"></div></div><div class="lm-country"><b>Топ държави</b><span>България <em>82%</em></span><span>Германия <em>5%</em></span><span>Великобритания <em>3%</em></span><span>Румъния <em>2%</em></span><span>Други <em>8%</em></span></div></div></div></div></div>
      <div class="lm-grid lm-lower"><div class="lm-card"><div class="lm-cardhead"><h3>ПОСЛЕДНИ ПРОВЕРКИ НА СИСТЕМАТА</h3></div><div class="lm-checks">${checks()}</div><button class="lm-link" onclick="window.refGo&&refGo('history')">Виж пълна история →</button></div><div class="lm-card"><div class="lm-cardhead"><h3>СТАТУС НА СИСТЕМАТА</h3></div><div class="lm-systems">${['Събиране на данни','Обработка и анализ','Сигнали и нотификации','Dashboard и отчети'].map(x=>`<div><span>✓</span><b>${x}</b><small>Нормално</small></div>`).join('')}</div><div class="lm-ok">● Всички системи работят нормално</div></div></div>
    </div>`;
  }
  function init(){mount(); const ob=new MutationObserver(()=>{if(document.getElementById('live')?.classList.contains('active')) mount()}); const shell=document.querySelector('.shell'); if(shell)ob.observe(shell,{subtree:true,attributes:true,attributeFilter:['class']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
