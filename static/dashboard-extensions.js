/* BLIS Navigator dashboard extensions: Timeline + Settings without replacing core app.js. */
(function(){
  function addPages(){
    if(!Array.isArray(pages)) return;
    if(!pages.some(p=>p[0]==='timeline')) pages.splice(6,0,['timeline','◷','Timeline']);
    if(!pages.some(p=>p[0]==='settings')) pages.push(['settings','⚙','Настройки']);
  }
  const oldNav=nav;
  nav=function(){
    addPages();
    const icons={overview:'⌂',social:'◎',digital:'◉',reputation:'♡',market:'↗',competition:'⚑',timeline:'◷',reports:'▤',history:'◴',sources:'▥',profile:'♙',settings:'⚙'};
    $('nav').innerHTML=pages.map((p,i)=>`<button data-page="${p[0]}" class="${i?'':'active'}"><span class="navico navsym">${icons[p[0]]||p[1]}</span><span class="navtxt">${p[2]}</span></button>`).join('');
    document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>go(b.dataset.page));
  };
  const oldGo=go;
  go=function(id){
    oldGo(id);
    if(id==='timeline') renderTimeline();
    if(id==='settings') renderSettings();
  };
  function eventTone(type){
    if(type==='risk') return ['#fff2f2','#c92a2a','!'];
    if(type==='positive') return ['#effaf2','#16813a','↗'];
    if(type==='competitive') return ['#fff8e8','#b66b00','⚑'];
    if(type==='reputation') return ['#fff0f7','#c52f78','♡'];
    return ['#eef5ff','#0f5fe9','●'];
  }
  function timelineEvents(){
    let out=[];
    (D?.signals||[]).forEach((s,i)=>out.push({time:s.time||s.created_at||new Date().toISOString(),title:s.title||s.label||'Аналитичен сигнал',text:s.description||s.detail||'Промяна в наблюдаваната среда.',type:/risk|негатив|оплак/i.test((s.title||'')+' '+(s.description||''))?'risk':/конкур/i.test((s.title||'')+' '+(s.description||''))?'competitive':'positive'}));
    A.slice(0,16).forEach(x=>out.push({time:x.time||x.observed_at||new Date().toISOString(),title:metricName(x.metric),text:`${sourceName(x.source)} · ${activityValue(x)}`,type:/rating|review/i.test(x.metric||'')?'reputation':'data'}));
    (H||[]).slice(-8).forEach(s=>out.push({time:s.created_at||new Date().toISOString(),title:'BLIS snapshot',text:`Записана сравнима историческа стойност${s.payload?.blis_index!=null?`: BLIS ${val(s.payload.blis_index)}`:''}.`,type:'data'}));
    return out.sort((a,b)=>new Date(b.time)-new Date(a.time)).slice(0,30);
  }
  window.renderTimeline=function(){
    let events=timelineEvents();
    $('timelineBody').innerHTML=head('Intelligence Timeline','Хронология на промените: измервания, сигнали, конкурентни проявления, репутационни движения и исторически snapshots.')+`<div class="grid cols12"><div class="card moduleCard c3"><div class="cardLabel">Събития</div><div class="moduleVal">${events.length}</div><div class="subtle">Събрани от текущите измервания и сигнали.</div></div><div class="card moduleCard c3"><div class="cardLabel">Измервания</div><div class="moduleVal">${A.length}</div><div class="subtle">Реални наблюдавани стойности.</div></div><div class="card moduleCard c3"><div class="cardLabel">Snapshots</div><div class="moduleVal">${H.length}</div><div class="subtle">Исторически точки за сравнение.</div></div><div class="card moduleCard c3"><div class="cardLabel">Източници</div><div class="moduleVal">${S.length}</div><div class="subtle">Информационна база на профила.</div></div><div class="card timelinePanel c8"><div class="sectionTitle">Какво се промени</div><div class="timelineList">${events.length?events.map(e=>{let t=eventTone(e.type);return `<div class="timelineEvent"><div class="timelineDot" style="background:${t[0]};color:${t[1]}">${t[2]}</div><div><div class="timelineTime">${new Date(e.time).toLocaleString('bg-BG')}</div><b>${esc(e.title)}</b><p>${esc(e.text)}</p></div></div>`}).join(''):'<div class="scan">Timeline ще се попълва автоматично при нови измервания и потвърдени сигнали.</div>'}</div></div><div class="card moduleCard c4"><div class="sectionTitle">Как се използва Timeline</div><div class="watch" style="grid-template-columns:1fr">${watchCard('#eef5ff','#0f5fe9','◷','Последователност','Показва кога точно е възникнала промяната и как се е развила след това.')}${watchCard('#fff8e8','#b66b00','⚑','Контекст','Свързва конкурентни, пазарни и комуникационни движения в една хронология.')}${watchCard('#fff0f7','#c52f78','♡','Репутация','Показва кога се появява повтаряща се тема или промяна в оценките.')}${watchCard('#effaf2','#16813a','↗','Проверка на ефект','Позволява да се сравни период преди и след значимо действие или външно събитие.')}</div></div></div><div class="pulse"><strong>BLIS Timeline</strong><span>Не е архив на числа, а последователна история на значимите промени в средата на клиента.</span></div>`;
  };
  function settingRow(id,title,text,on){return `<div class="settingRow"><div><b>${title}</b><p>${text}</p></div><button class="switch ${on?'on':''}" data-setting="${id}" aria-pressed="${on}"><span></span></button></div>`}
  window.renderSettings=function(){
    let cfg=JSON.parse(localStorage.getItem('blisSettings')||'{}');
    let get=(k,d=true)=>cfg[k]===undefined?d:!!cfg[k];
    $('settingsBody').innerHTML=head('Настройки','Управление на клиентската визуализация, наблюдението и известията за този браузър.')+`<div class="grid cols12"><div class="card moduleCard c7"><div class="sectionTitle">Наблюдение и известия</div>${settingRow('daily','Дневно обновяване','Показва статус за ежедневния цикъл на наблюдение.',get('daily'))}${settingRow('risks','Рискови сигнали','Маркира потвърдени рискови отклонения в интерфейса.',get('risks'))}${settingRow('competition','Конкурентни сигнали','Показва нови конкурентни проявления в Timeline и конкурентния модул.',get('competition'))}${settingRow('reports','Известия за нов доклад','Показва индикация при нов генериран аналитичен материал.',get('reports'))}</div><div class="card moduleCard c5"><div class="sectionTitle">Интерфейс</div>${settingRow('motion','Динамични елементи','Анимации на radar, progress индикатори и живи статуси.',get('motion'))}${settingRow('compact','Компактен режим','Намалява вертикалните отстояния при работа с много информация.',get('compact',false))}<div class="settingInfo"><b>Клиентско брандиране</b><p>Акцентният цвят се задава автоматично според активния клиентски профил. Данните и аналитичната структура не се променят.</p></div></div><div class="card moduleCard c12"><div class="sectionTitle">Достъп и поверителност</div><div class="privacyGrid"><div><b>Клиентски dashboard</b><p>Този слой е отделен от публичния BLIS Navigator. Публичната начална страница не показва клиентските резултати.</p></div><div><b>Източници</b><p>Всеки измерим показател трябва да може да бъде проследен до източник, период и дата на наблюдението.</p></div><div><b>Липсващи данни</b><p>При липса на надеждна стойност системата показва „—“ или статус за натрупване, вместо да генерира фиктивна оценка.</p></div></div></div></div>`;
    document.querySelectorAll('.switch').forEach(b=>b.onclick=()=>{let k=b.dataset.setting;cfg[k]=!get(k);localStorage.setItem('blisSettings',JSON.stringify(cfg));b.classList.toggle('on',cfg[k]);b.setAttribute('aria-pressed',cfg[k]);document.body.classList.toggle('compact-dashboard',get('compact',false));document.body.classList.toggle('no-motion',!get('motion',true));});
    document.body.classList.toggle('compact-dashboard',get('compact',false));document.body.classList.toggle('no-motion',!get('motion',true));
  };
  const oldRenderAll=renderAll;
  renderAll=function(){oldRenderAll();renderTimeline();renderSettings();};
  addPages();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(nav,0)); else setTimeout(nav,0);
})();