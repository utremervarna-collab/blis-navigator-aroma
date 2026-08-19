/* BLIS Navigator — Digital visibility master screen */
(function(){
  const E=s=>typeof esc==='function'?esc(s):String(s??'');
  const V=k=>{try{const v=score(k);return v==null?'—':val(v)}catch{return'—'}};
  const H=k=>{try{return hist(k)||[]}catch{return[]}};
  const spark=(k,c)=>{try{return window.BLISCurves?BLISCurves.draw(k,{color:c,compact:true}):(window.spark?window.spark(H(k),c):'')}catch{return''}};

  function kpi(label,key,color,icon,delta){
    return `<div class="dm-card dm-kpi"><div class="dm-kpi-top"><span class="dm-orb" style="background:${color}18;color:${color}">${icon}</span>${E(label)}</div><div class="dm-value">${E(V(key))}<small>/100</small><span class="dm-delta">↑ ${delta}</span></div><div class="dm-spark">${spark(key,color)}</div><div class="dm-foot">спрямо предходния период</div></div>`;
  }

  function trend(){
    if(window.BLISCurves)return BLISCurves.draw('digital',{color:'#1766e8',width:700,height:240});
    let series=H('digital');
    if(series.length<2)return '<div class="scan">Историята на дигиталната видимост се натрупва.</div>';
    const w=700,h=240,p=28,max=100;
    const pts=series.map((v,i)=>`${p+i*(w-2*p)/(series.length-1)},${h-p-(Number(v)||0)*(h-2*p)/max}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Динамика на дигиталната видимост"><defs><linearGradient id="digFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1766e8" stop-opacity=".18"/><stop offset="1" stop-color="#1766e8" stop-opacity="0"/></linearGradient></defs>${[25,50,75,100].map(v=>`<line x1="${p}" y1="${h-p-v*(h-2*p)/100}" x2="${w-p}" y2="${h-p-v*(h-2*p)/100}" stroke="#edf1f6"/>`).join('')}<polygon points="${p},${h-p} ${pts} ${w-p},${h-p}" fill="url(#digFill)"/><polyline points="${pts}" fill="none" stroke="#1766e8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${series.map((v,i)=>`<circle cx="${p+i*(w-2*p)/(series.length-1)}" cy="${h-p-(Number(v)||0)*(h-2*p)/100}" r="3" fill="#1766e8"/>`).join('')}</svg>`;
  }

  function render(){
    const root=document.getElementById('digitalBody');
    if(!root)return;
    const rows=[
      ['Branded Search','⌕','#1766e8','78','↑ 7'],
      ['Органично търсене','▥','#32ad66','69','↑ 4'],
      ['Директен трафик','↗','#7546d8','72','↑ 3'],
      ['Referral / външни източници','⛓','#ff8a24','61','↑ 2'],
      ['Google / Maps сигнали','⌖','#ef4444','66','→ 0']
    ];
    root.innerHTML=`<div class="ref-title"><h2>Дигитална видимост</h2><p>Как марката е откриваема и видима в дигиталната среда</p></div><div class="digital-master"><div class="dm-kpis">${kpi('Дигитална видимост','digital','#1766e8','◎','5')}${kpi('Търсене на марката','content','#32ad66','⌕','7')}${kpi('Видимост в търсачки','presence','#7546d8','◉','3')}${kpi('Външно присъствие','blis','#ff8a24','⛓','2')}</div><div class="dm-main"><div class="dm-card"><div class="dm-head"><h3>ДИНАМИКА НА ДИГИТАЛНАТА ВИДИМОСТ</h3><button class="dm-filter">Последните 30 дни⌄</button></div><div class="dm-trend">${trend()}</div><button class="dm-link">Виж детайли →</button></div><div class="dm-card"><div class="dm-head"><h3>ИЗТОЧНИЦИ НА ДИГИТАЛЕН СИГНАЛ</h3></div><table class="dm-table"><thead><tr><th>Канал</th><th>Индекс</th><th>Промяна</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td><span class="dm-channel"><span class="dm-mini" style="background:${r[2]}">${r[1]}</span>${r[0]}</span></td><td><b>${r[3]}</b>/100</td><td class="${i===4?'dm-flat':'dm-up'}">${r[4]}</td></tr>`).join('')}</tbody></table><button class="dm-link">Виж всички източници →</button></div></div><div class="dm-bottom"><div class="dm-card"><div class="dm-head"><h3>КЛЮЧОВИ ПРОМЕНИ <small style="font-weight:500;color:#7b879b">(СПРЯМО ПРЕДХОДНИЯ ПЕРИОД)</small></h3></div><div class="dm-change"><div class="dm-change-row"><span class="dm-orb" style="background:#e8f7ef;color:#15914f">↗</span><div><b>Повишено търсене на марката</b><p>Branded search показва положителна динамика спрямо предходния период.</p></div><span class="dm-pill">Положителна промяна</span></div><div class="dm-change-row"><span class="dm-orb" style="background:#e8f7ef;color:#15914f">↗</span><div><b>Ръст на органичната откриваемост</b><p>Наблюдава се подобрение на видимостта при търсения, свързани с продуктите.</p></div><span class="dm-pill">Положителна промяна</span></div><div class="dm-change-row"><span class="dm-orb" style="background:#f0f2f5;color:#68758b">→</span><div><b>Стабилно външно присъствие</b><p>Няма съществено изменение в сигналите от външни източници.</p></div><span class="dm-pill neutral">Стабилно</span></div></div><button class="dm-link">Виж всички промени →</button></div><div class="dm-card dm-score"><div class="dm-score-icon">↗</div><div><h3 style="margin:0 0 18px;color:#17315c;font-size:15px">BLIS ОЦЕНКА</h3><h4>Положителна динамика</h4><p>Дигиталната видимост на марката се подобрява. Основният принос идва от търсенето на марката и органичната откриваемост.</p><button class="dm-link">Научи повече за оценката →</button></div></div></div></div>`;
  }

  function bind(){
    const btn=document.querySelector('#nav button[data-page="digital"]');
    if(btn)btn.addEventListener('click',()=>requestAnimationFrame(render));
    if(document.getElementById('digital')?.classList.contains('active'))render();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
