(()=>{
'use strict';
const CLIENTS={
  aroma:{name:'Aroma Cosmetics',type:'Козметика',mark:'A',accent:'#1677ff',soft:'#eef6ff',topics:['Hydra Balance','Fresh Skin','Hair Care','Natural Care','Sensitive Skin'],terms:['хидратация','аромат','цена','опаковка','ежедневна грижа']},
  bolyarka:{name:'Болярка ВТ АД',type:'Пивоварна компания',mark:'БЛ',accent:'#a61f2b',soft:'#fff2f3',topics:['Болярка','Fort','Балканско','Дом на бирата','Традиция'],terms:['вкус','цена','наливна бира','традиция','събития']},
  'astor-garden':{name:'Astor Garden Hotel',type:'Хотелиерство',mark:'AG',accent:'#0b6f73',soft:'#ecfafa',topics:['SPA','Закуска','Локация','Стаи','Обслужване'],terms:['спокойствие','чистота','закуска','SPA','персонал']},
  'varna-towers':{name:'Varna Towers',type:'Бизнес център / недвижими имоти',mark:'VT',accent:'#315b78',soft:'#eef4f8',topics:['Офиси','Локация','Достъп','Паркиране','Бизнес среда'],terms:['офис площи','локация','паркинг','достъп','бизнес']}
};
const CATS=[
  {id:'search',label:'Търсене',color:'#2979ff'},
  {id:'social',label:'Социални сигнали',color:'#7b61ff'},
  {id:'reviews',label:'Отзиви',color:'#f3a43b'},
  {id:'content',label:'Съдържание',color:'#20a77a'},
  {id:'behavior',label:'Поведение',color:'#df5f8b'}
];
const BASE_NODES=[
  {id:'n1',cat:'search',x:20,y:11,title:'Директни търсения',metric:'+18%',sent:78,trend:'+8.4%',source:'Google Search',date:'днес',method:'динамика на бранд търсения'},
  {id:'n2',cat:'search',x:46,y:7,title:'Продуктов интерес',metric:'+12%',sent:76,trend:'+5.1%',source:'Search signals',date:'днес',method:'агрегирани ключови теми'},
  {id:'n3',cat:'social',x:28,y:28,title:'Взаимодействия',metric:'184',sent:71,trend:'+9.7%',source:'Социални канали',date:'днес',method:'видими взаимодействия'},
  {id:'n4',cat:'social',x:60,y:24,title:'Споменавания',metric:'+24',sent:68,trend:'+6.2%',source:'Social listening',date:'днес',method:'публични споменавания'},
  {id:'n5',cat:'reviews',x:43,y:45,title:'Качество и резултат',metric:'4.4 / 5',sent:84,trend:'+0.2',source:'Публични отзиви',date:'последни 30 дни',method:'тематичен клъстер от оценки'},
  {id:'n6',cat:'reviews',x:70,y:42,title:'Цена / стойност',metric:'72%',sent:62,trend:'-1.3%',source:'Reviews',date:'последни 30 дни',method:'тематична честота и тоналност'},
  {id:'n7',cat:'content',x:23,y:62,title:'Съдържателен интерес',metric:'+15%',sent:75,trend:'+4.8%',source:'Owned content',date:'днес',method:'видима активност и реакция'},
  {id:'n8',cat:'content',x:55,y:64,title:'Повтаряща се тема',metric:'нова',sent:66,trend:'+11%',source:'Content signals',date:'тази седмица',method:'честота на ключови теми'},
  {id:'n9',cat:'behavior',x:35,y:82,title:'Връщаемост',metric:'+7.8%',sent:80,trend:'+3.1%',source:'Behavioral signals',date:'последни 30 дни',method:'повторяемост на активността'},
  {id:'n10',cat:'behavior',x:68,y:80,title:'Намерение',metric:'69%',sent:73,trend:'+2.6%',source:'Intent signals',date:'последни 30 дни',method:'комбинирани поведенчески сигнали'}
];
const LINKS=[['n1','n2'],['n1','n3'],['n2','n5'],['n3','n4'],['n3','n5'],['n4','n6'],['n5','n7'],['n5','n8'],['n6','n8'],['n7','n9'],['n8','n10'],['n9','n10'],['n5','n10']];
let state={client:'aroma',filter:'all',view:'map',zoom:1,selected:'n5',kpi:'index'};
let root=null,toastTimer=null;
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function currentClient(){const sel=document.getElementById('clientSel');const v=sel&&sel.value?sel.value:(document.body.dataset.client||window.BLIS_INITIAL_CLIENT||'aroma');return CLIENTS[v]?v:'aroma'}
function client(){return CLIENTS[state.client]||CLIENTS.aroma}
function nodeData(){const c=client();return BASE_NODES.map((n,i)=>({...n,title:i===4?c.topics[0]+' · качество':i===7?c.terms[0]+' · растяща тема':n.title,topic:c.topics[i%c.topics.length]}))}
function spark(vals){const pts=vals.map((v,i)=>`${i*(100/(vals.length-1))},${24-v}`).join(' ');return `<svg viewBox="0 0 100 24" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="var(--pm-accent)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`}
function ensurePage(){
  if(!document.getElementById('perception')){
    const section=document.createElement('section');section.id='perception';section.className='page';section.innerHTML='<div id="perceptionBody"></div>';
    const market=document.getElementById('market'); if(market&&market.parentNode) market.parentNode.insertBefore(section,market.nextSibling); else document.querySelector('.shell')?.appendChild(section);
  }
  const nav=document.getElementById('nav'); if(nav&&!nav.querySelector('[data-page="perception"]')){
    const b=document.createElement('button');b.dataset.page='perception';b.innerHTML='<span class="navico"><svg viewBox="0 0 24 24"><path d="M3 17c3-7 6-10 9-10s6 3 9 10"/><path d="M4 13c3-4 5-6 8-6s5 2 8 6"/><circle cx="12" cy="12" r="2.2"/></svg></span><span class="navtxt">Карта на възприятията</span>';
    const marketBtn=nav.querySelector('[data-page="market"]'); if(marketBtn) marketBtn.after(b); else nav.appendChild(b);
    b.addEventListener('click',()=>openPage());
  }
}
function openPage(){
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.getElementById('perception')?.classList.add('active');
  document.querySelectorAll('#nav button').forEach(x=>x.classList.toggle('active',x.dataset.page==='perception'));
  const m=document.getElementById('blisActiveModule');if(m)m.textContent='Карта на възприятията';
  const d=document.getElementById('blisSystemDetail');if(d)d.textContent='Свързване на потребителски сигнали, теми, оценки и поведение';
  render();window.scrollTo({top:0,behavior:'smooth'});
}
function theme(){const c=client();document.documentElement.style.setProperty('--client-accent',c.accent);document.documentElement.style.setProperty('--client-soft',c.soft)}
function render(){
  root=document.getElementById('perceptionBody');if(!root)return;state.client=currentClient();theme();const c=client();const nodes=nodeData();
  root.innerHTML=`<div class="pm-wrap">
    <div class="pm-hero"><div><h2>Карта на възприятията</h2><p>Интерактивен изглед към сигналите, които в момента формират възприятието за ${esc(c.name)}. Избирай метрика, тема или връзка, за да видиш контекста.</p></div><div class="pm-client-badge"><span class="pm-client-mark">${esc(c.mark)}</span><span><b>${esc(c.name)}</b><small>${esc(c.type)} · клиентски профил</small></span></div></div>
    <div class="pm-kpis">
      ${kpi('index','Индекс на възприятието','74.8','+3.6%',[12,11,13,10,9,8,6])}
      ${kpi('trend','Тренд','↑ Положителен','+5.2%',[16,14,13,12,9,7,5])}
      ${kpi('activity','Активност','68.4','+8.1%',[15,13,14,10,12,8,6])}
      ${kpi('engagement','Взаимодействие','71.2','+4.7%',[18,15,16,13,10,8,7])}
      ${kpi('rating','Оценка','4.4 / 5','+0.2',[12,12,11,10,10,8,7])}
      ${kpi('change','Промяна','+6.3%','спрямо период',[17,16,13,14,10,9,5])}
    </div>
    <div class="pm-main">
      <div class="pm-card pm-mapcard">
        <div class="pm-toolbar"><div class="pm-toolbar-left"><span class="pm-toolbar-title">Интерактивна карта</span><div class="pm-filters"><button class="pm-chip active" data-filter="all">Всички</button>${CATS.map(x=>`<button class="pm-chip" data-filter="${x.id}">${x.label}</button>`).join('')}</div></div><div class="pm-toolbar-right"><button class="pm-view active" data-view="map">Карта</button><button class="pm-view" data-view="network">Мрежа</button><button class="pm-zoom" data-zoom="-">−</button><button class="pm-zoom" data-zoom="+">+</button><button class="pm-zoom" data-zoom="reset">100%</button></div></div>
        <div class="pm-stage"><div class="pm-canvas"><div class="pm-lanes">${CATS.map(x=>`<div class="pm-lane" style="--lane:${x.color}">${x.label}</div>`).join('')}</div><svg class="pm-links" viewBox="0 0 1000 548" preserveAspectRatio="none">${renderLinks(nodes)}</svg>${nodes.map(renderNode).join('')}</div></div>
      </div>
      <aside class="pm-card pm-drawer" id="pmDrawer"></aside>
    </div>
    <div class="pm-lower">
      <div class="pm-card"><h3>Динамика на възприятието</h3><div class="pm-timeline">${timeline()}</div></div>
      <div class="pm-card"><h3>Какво се променя</h3><div class="pm-change"><i></i><div><b>${esc(c.terms[0])} набира сила</b><small>повече свързани сигнали през периода</small></div></div><div class="pm-change"><i></i><div><b>${esc(c.topics[1])} остава стабилна тема</b><small>без съществена промяна в тоналността</small></div></div><div class="pm-change"><i></i><div><b>Ценова чувствителност</b><small>леко отслабване спрямо предходния период</small></div></div></div>
      <div class="pm-card"><h3>Водещи теми</h3><div class="pm-theme-cloud">${c.terms.map((t,i)=>`<button data-theme="${i}">${esc(t)}</button>`).join('')}${c.topics.slice(0,3).map((t,i)=>`<button data-topic="${i}">${esc(t)}</button>`).join('')}</div></div>
    </div>
  </div><div class="pm-toast" id="pmToast"></div>`;
  bind();applyState();selectNode(state.selected,false);
}
function kpi(id,label,value,delta,vals){return `<button class="pm-kpi${state.kpi===id?' active':''}" data-kpi="${id}"><span class="pm-kpi-label">${label}</span><div class="pm-kpi-value">${value}</div><span class="pm-kpi-delta">${delta}</span><div class="pm-spark">${spark(vals)}</div></button>`}
function renderNode(n){const cat=CATS.find(x=>x.id===n.cat);return `<button class="pm-node${n.id===state.selected?' selected pulse':''}" data-node="${n.id}" data-cat="${n.cat}" style="left:${n.x}%;top:${n.y}%;--node:${cat.color}"><b><span class="pm-dot"></span>${esc(n.title)}</b><small>${esc(n.metric)} · ${esc(n.trend)}</small></button>`}
function renderLinks(nodes){const by=Object.fromEntries(nodes.map(n=>[n.id,n]));return LINKS.map(([a,b])=>{const A=by[a],B=by[b],x1=140+A.x*8.2,y1=25+A.y*5,x2=140+B.x*8.2,y2=25+B.y*5,mid=(x1+x2)/2;return `<path class="pm-link" data-a="${a}" data-b="${b}" d="M${x1} ${y1} C${mid} ${y1},${mid} ${y2},${x2} ${y2}"/>`}).join('')}
function timeline(){return `<svg viewBox="0 0 620 105" preserveAspectRatio="none"><defs><linearGradient id="pmg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--pm-accent)" stop-opacity=".17"/><stop offset="1" stop-color="var(--pm-accent)" stop-opacity="0"/></linearGradient></defs><path d="M0 86 C55 72 76 77 115 65 S188 73 225 50 S295 58 335 42 S410 48 455 29 S525 37 620 14 L620 105 L0 105Z" fill="url(#pmg)"/><path d="M0 86 C55 72 76 77 115 65 S188 73 225 50 S295 58 335 42 S410 48 455 29 S525 37 620 14" fill="none" stroke="var(--pm-accent)" stroke-width="2.2"/><line x1="455" y1="0" x2="455" y2="105" stroke="#98a2b3" stroke-dasharray="3 3"/><circle cx="455" cy="29" r="4" fill="var(--pm-accent)"/></svg>`}
function bind(){
  root.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;applyState()});
  root.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;applyState()});
  root.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{const z=b.dataset.zoom;state.zoom=z==='reset'?1:Math.max(.8,Math.min(1.5,state.zoom+(z==='+'?.1:-.1)));applyState()});
  root.querySelectorAll('[data-node]').forEach(b=>{b.onclick=()=>selectNode(b.dataset.node,true);b.onmouseenter=()=>highlight(b.dataset.node);b.onmouseleave=()=>highlight(state.selected)});
  root.querySelectorAll('[data-kpi]').forEach(b=>b.onclick=()=>{state.kpi=b.dataset.kpi;root.querySelectorAll('[data-kpi]').forEach(x=>x.classList.toggle('active',x===b));const map={activity:'social',engagement:'social',rating:'reviews',change:'behavior',trend:'all',index:'all'};state.filter=map[state.kpi]||'all';applyState();showToast('Картата е филтрирана по избраната метрика.')});
  root.querySelectorAll('[data-theme],[data-topic]').forEach(b=>b.onclick=()=>{state.filter='all';applyState();const candidates=nodeData().filter(n=>n.id==='n5'||n.id==='n8'||n.id==='n2');selectNode(candidates[Math.floor(Math.random()*candidates.length)].id,true)});
}
function applyState(){if(!root)return;root.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.filter));root.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));const stage=root.querySelector('.pm-stage');stage?.classList.toggle('network',state.view==='network');const canvas=root.querySelector('.pm-canvas');if(canvas)canvas.style.transform=`scale(${state.zoom})`;root.querySelectorAll('.pm-node').forEach(n=>n.classList.toggle('dim',state.filter!=='all'&&n.dataset.cat!==state.filter));const reset=root.querySelector('[data-zoom="reset"]');if(reset)reset.textContent=Math.round(state.zoom*100)+'%'}
function selectNode(id,toast){state.selected=id;root?.querySelectorAll('.pm-node').forEach(n=>{const on=n.dataset.node===id;n.classList.toggle('selected',on);n.classList.toggle('pulse',on)});highlight(id);renderDrawer(id);if(toast)showToast('Отворен е детайлен анализ на сигнала.')}
function highlight(id){root?.querySelectorAll('.pm-link').forEach(p=>p.classList.toggle('hot',p.dataset.a===id||p.dataset.b===id))}
function renderDrawer(id){const n=nodeData().find(x=>x.id===id)||nodeData()[0],c=client(),cat=CATS.find(x=>x.id===n.cat),drawer=document.getElementById('pmDrawer');if(!drawer)return;const related=LINKS.filter(x=>x.includes(id)).flat().filter(x=>x!==id).slice(0,4).map(x=>nodeData().find(n=>n.id===x)?.title).filter(Boolean);drawer.innerHTML=`<div class="pm-drawer-head"><div><div class="pm-category">${cat.label}</div><h3>${esc(n.title)}</h3></div><button class="pm-drawer-close" title="Затвори детайла">×</button></div><div class="pm-detail-grid"><div class="pm-detail"><span>Стойност</span><b>${esc(n.metric)}</b></div><div class="pm-detail"><span>Промяна</span><b>${esc(n.trend)}</b></div><div class="pm-detail"><span>Източник</span><b>${esc(n.source)}</b></div><div class="pm-detail"><span>Период</span><b>${esc(n.date)}</b></div></div><div class="pm-sentiment"><div class="pm-sentiment-label"><span>Позитивност / благоприятност</span><b>${n.sent}%</b></div><div class="pm-sentiment-bar"><i style="width:${n.sent}%"></i></div></div><div class="pm-drawer-section"><h4>Свързани подтеми</h4><div class="pm-tags">${related.map(x=>`<button>${esc(x)}</button>`).join('')||c.terms.slice(0,3).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div><div class="pm-drawer-section"><h4>Метод на измерване</h4><div class="pm-example">${esc(n.method)}</div></div><div class="pm-drawer-section"><h4>Източници</h4><div class="pm-source-row"><span>${esc(n.source)}</span><b>основен</b></div><div class="pm-source-row"><span>BLIS signal layer</span><b>свързан</b></div></div><div class="pm-drawer-section"><h4>Примерни сигнали</h4><div class="pm-example"><b>${esc(c.name)}</b> · засилена връзка с темата „${esc(n.topic)}“.</div><div class="pm-example">Промяната е видима и в свързаните сигнали от картата.</div></div><div class="pm-actions"><button class="pm-action" id="pmAlert">Създай аларма</button><button class="pm-action primary" id="pmOpenAnalysis">Отвори анализ</button></div>`;
  drawer.querySelector('.pm-drawer-close').onclick=()=>{drawer.style.opacity='.45';showToast('Детайлният панел е свит. Избери друг сигнал за нов анализ.')};
  drawer.querySelector('#pmAlert').onclick=e=>{const key=`blis-pm-alert-${state.client}-${id}`,saved=localStorage.getItem(key)==='1';localStorage.setItem(key,saved?'0':'1');e.currentTarget.classList.toggle('saved',!saved);e.currentTarget.textContent=!saved?'Алармата е активна':'Създай аларма';showToast(!saved?'Алармата е активирана за този сигнал.':'Алармата е изключена.')};
  const alertKey=`blis-pm-alert-${state.client}-${id}`;if(localStorage.getItem(alertKey)==='1'){const a=drawer.querySelector('#pmAlert');a.classList.add('saved');a.textContent='Алармата е активна'}
  drawer.querySelector('#pmOpenAnalysis').onclick=()=>{const target=n.cat==='reviews'?'reputation':n.cat==='social'?'social':n.cat==='search'?'digital':'market';document.querySelector(`#nav [data-page="${target}"]`)?.click();showToast('Отворен е свързаният аналитичен модул.')};
}
function showToast(msg){const t=document.getElementById('pmToast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1900)}
function syncClient(){const next=currentClient();if(next!==state.client){state.client=next;state.selected='n5';if(document.getElementById('perception')?.classList.contains('active'))render();else theme()}}
function init(){ensurePage();state.client=currentClient();theme();render();document.addEventListener('change',e=>{if(e.target?.id==='clientSel')setTimeout(syncClient,0)});document.addEventListener('click',e=>{if(e.target.closest?.('.client-option'))setTimeout(syncClient,50)});new MutationObserver(syncClient).observe(document.body,{attributes:true,attributeFilter:['data-client']});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,80));else setTimeout(init,80);
})();
