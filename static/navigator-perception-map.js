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
  {id:'n1',cat:'search',x:22,y:12,title:'Директни търсения',metric:'+18%',sent:78,trend:'+8.4%',source:'Google Search',date:'днес',method:'динамика на бранд търсения'},
  {id:'n2',cat:'search',x:51,y:7,title:'Продуктов интерес',metric:'+12%',sent:76,trend:'+5.1%',source:'Search signals',date:'днес',method:'агрегирани ключови теми'},
  {id:'n3',cat:'social',x:29,y:29,title:'Взаимодействия',metric:'184',sent:71,trend:'+9.7%',source:'Социални канали',date:'днес',method:'видими взаимодействия'},
  {id:'n4',cat:'social',x:64,y:24,title:'Споменавания',metric:'+24',sent:68,trend:'+6.2%',source:'Social listening',date:'днес',method:'публични споменавания'},
  {id:'n5',cat:'reviews',x:47,y:45,title:'Качество и резултат',metric:'4.4 / 5',sent:84,trend:'+0.2',source:'Публични отзиви',date:'последни 30 дни',method:'тематичен клъстер от оценки'},
  {id:'n6',cat:'reviews',x:72,y:43,title:'Цена / стойност',metric:'72%',sent:62,trend:'-1.3%',source:'Reviews',date:'последни 30 дни',method:'тематична честота и тоналност'},
  {id:'n7',cat:'content',x:25,y:64,title:'Съдържателен интерес',metric:'+15%',sent:75,trend:'+4.8%',source:'Owned content',date:'днес',method:'видима активност и реакция'},
  {id:'n8',cat:'content',x:58,y:65,title:'Повтаряща се тема',metric:'нова',sent:66,trend:'+11%',source:'Content signals',date:'тази седмица',method:'честота на ключови теми'},
  {id:'n9',cat:'behavior',x:37,y:82,title:'Връщаемост',metric:'+7.8%',sent:80,trend:'+3.1%',source:'Behavioral signals',date:'последни 30 дни',method:'повторяемост на активността'},
  {id:'n10',cat:'behavior',x:70,y:81,title:'Намерение',metric:'69%',sent:73,trend:'+2.6%',source:'Intent signals',date:'последни 30 дни',method:'комбинирани поведенчески сигнали'}
];
const LINKS=[['n1','n2'],['n1','n3'],['n2','n5'],['n3','n4'],['n3','n5'],['n4','n6'],['n5','n7'],['n5','n8'],['n6','n8'],['n7','n9'],['n8','n10'],['n9','n10'],['n5','n10']];

let state={filter:'all',view:'map',zoom:1,selected:'n5',kpi:'index',alert:false};
let toastTimer=null;
let installed=false;

const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function clientKey(){
  const sel=document.getElementById('clientSel');
  const v=(sel&&sel.value)||document.body.dataset.client||window.BLIS_INITIAL_CLIENT||'aroma';
  return CLIENTS[v]?v:'aroma';
}
function client(){return CLIENTS[clientKey()]||CLIENTS.aroma}
function score(key,fallback){
  try{
    const arr=(typeof D!=='undefined'&&D&&D.indices)||[];
    const hit=arr.find(x=>x.key===key);
    const v=hit&&Number(hit.value);
    return Number.isFinite(v)?v:fallback;
  }catch{return fallback}
}
function nodes(){
  const c=client();
  return BASE_NODES.map((n,i)=>({...n,
    title:i===4?`${c.topics[0]} · качество`:i===7?`${c.terms[0]} · растяща тема`:n.title,
    topic:c.topics[i%c.topics.length]
  }));
}
function patchNav(){
  const b=document.querySelector('#nav [data-page="market"]');
  if(!b)return;
  const label=b.querySelector('.navtxt')||b.querySelector('span:last-child');
  if(label){
    if(label.textContent!=='Карта на възприятията')label.textContent='Карта на възприятията';
  }else{
    const last=b.childNodes[b.childNodes.length-1];
    if(last&&last.textContent!=='Карта на възприятията')last.textContent='Карта на възприятията';
  }
}
function setActive(){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const page=document.getElementById('market');if(page)page.classList.add('active');
  document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page==='market'));
  const m=document.getElementById('blisActiveModule');if(m)m.textContent='Карта на възприятията';
  const d=document.getElementById('blisSystemDetail');if(d)d.textContent='Свързване на потребителски сигнали, теми, оценки и поведение';
}
function openMarket(){
  patchNav();setActive();render();window.scrollTo({top:0,behavior:'smooth'});
}
function spark(vals){
  const pts=vals.map((v,i)=>`${i*(100/(vals.length-1))},${24-v}`).join(' ');
  return `<svg viewBox="0 0 100 24" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="var(--pm-accent)" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
}
function kpi(id,label,value,delta,vals){return `<button class="pm-kpi${state.kpi===id?' active':''}" data-kpi="${id}"><span class="pm-kpi-label">${label}</span><div class="pm-kpi-value">${value}</div><span class="pm-kpi-delta">${delta}</span><div class="pm-spark">${spark(vals)}</div></button>`}
function nodeMarkup(n){
  const cat=CATS.find(x=>x.id===n.cat);
  return `<button class="pm-node${n.id===state.selected?' selected pulse':''}" data-node="${n.id}" data-cat="${n.cat}" style="left:${n.x}%;top:${n.y}%;--node:${cat.color}"><b><span class="pm-dot"></span>${esc(n.title)}</b><small>${esc(n.metric)} · ${esc(n.trend)}</small></button>`;
}
function linksMarkup(data){
  const by=Object.fromEntries(data.map(n=>[n.id,n]));
  return LINKS.map(([a,b])=>{
    const A=by[a],B=by[b],x1=145+A.x*8.15,y1=24+A.y*5.05,x2=145+B.x*8.15,y2=24+B.y*5.05,mid=(x1+x2)/2;
    return `<path class="pm-link" data-a="${a}" data-b="${b}" d="M${x1} ${y1} C${mid} ${y1},${mid} ${y2},${x2} ${y2}"/>`;
  }).join('');
}
function timeline(){
  return `<svg viewBox="0 0 620 105" preserveAspectRatio="none"><defs><linearGradient id="pmg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--pm-accent)" stop-opacity=".17"/><stop offset="1" stop-color="var(--pm-accent)" stop-opacity="0"/></linearGradient></defs><path d="M0 86 C55 72 76 77 115 65 S188 73 225 50 S295 58 335 42 S410 48 455 29 S525 37 620 14 L620 105 L0 105Z" fill="url(#pmg)"/><path d="M0 86 C55 72 76 77 115 65 S188 73 225 50 S295 58 335 42 S410 48 455 29 S525 37 620 14" fill="none" stroke="var(--pm-accent)" stroke-width="2.2"/><g fill="var(--pm-accent)"><circle cx="115" cy="65" r="3"/><circle cx="225" cy="50" r="3"/><circle cx="335" cy="42" r="3"/><circle cx="455" cy="29" r="3"/><circle cx="620" cy="14" r="3"/></g></svg>`;
}
function render(){
  const root=document.getElementById('marketBody');if(!root)return;
  const c=client();
  document.documentElement.style.setProperty('--client-accent',c.accent);
  document.documentElement.style.setProperty('--client-soft',c.soft);
  const data=nodes();
  const perception=score('content',74.8).toFixed(1);
  const activity=score('presence',68.4).toFixed(1);
  const engagement=score('digital',71.2).toFixed(1);
  root.innerHTML=`<div class="pm-wrap">
    <div class="pm-hero"><div><h2>Карта на възприятията</h2><p>Интерактивен изглед към сигналите, които формират възприятието за ${esc(c.name)}. Избери метрика, тема или връзка, за да видиш контекста.</p></div><div class="pm-client-badge"><span class="pm-client-mark">${esc(c.mark)}</span><span><b>${esc(c.name)}</b><small>${esc(c.type)} · активен клиентски профил</small></span></div></div>
    <div class="pm-kpis">
      ${kpi('index','Индекс на възприятието',perception,'+3.6%',[12,11,13,10,9,8,6])}
      ${kpi('trend','Тренд','↑ Положителен','+5.2%',[16,14,13,12,9,7,5])}
      ${kpi('activity','Активност',activity,'+8.1%',[15,13,14,10,12,8,6])}
      ${kpi('engagement','Взаимодействие',engagement,'+4.7%',[18,15,16,13,10,8,7])}
      ${kpi('rating','Оценка','4.4 / 5','+0.2',[12,12,11,10,10,8,7])}
      ${kpi('change','Промяна','+6.3%','спрямо период',[17,16,13,14,10,9,5])}
    </div>
    <div class="pm-main">
      <div class="pm-card pm-mapcard">
        <div class="pm-toolbar"><div class="pm-toolbar-left"><span class="pm-toolbar-title">Интерактивна карта</span><div class="pm-filters"><button class="pm-chip active" data-filter="all">Всички</button>${CATS.map(x=>`<button class="pm-chip" data-filter="${x.id}">${x.label}</button>`).join('')}</div></div><div class="pm-toolbar-right"><button class="pm-view active" data-view="map">Карта</button><button class="pm-view" data-view="network">Мрежа</button><button class="pm-zoom" data-zoom="-">−</button><button class="pm-zoom" data-zoom="+">+</button><button class="pm-zoom" data-zoom="reset">100%</button></div></div>
        <div class="pm-stage"><div class="pm-canvas"><div class="pm-lanes">${CATS.map(x=>`<div class="pm-lane" style="--lane:${x.color}">${x.label}</div>`).join('')}</div><svg class="pm-links" viewBox="0 0 1000 548" preserveAspectRatio="none">${linksMarkup(data)}</svg>${data.map(nodeMarkup).join('')}</div></div>
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
function drawer(n){
  const c=client();const cat=CATS.find(x=>x.id===n.cat);
  const d=document.getElementById('pmDrawer');if(!d)return;
  d.innerHTML=`<div class="pm-drawer-head"><div><div class="pm-category" style="color:${cat.color}">${cat.label}</div><h3>${esc(n.title)}</h3><small>${esc(n.topic)}</small></div><button class="pm-drawer-close" title="Затвори">×</button></div>
    <div class="pm-detail-grid"><div class="pm-detail"><span>Стойност</span><b>${esc(n.metric)}</b></div><div class="pm-detail"><span>Тренд</span><b>${esc(n.trend)}</b></div><div class="pm-detail"><span>Източник</span><b>${esc(n.source)}</b></div><div class="pm-detail"><span>Период</span><b>${esc(n.date)}</b></div></div>
    <div class="pm-sentiment"><div class="pm-sentiment-label"><span>Позитивно възприятие</span><b>${n.sent}%</b></div><div class="pm-sentiment-bar"><i style="width:${n.sent}%"></i></div></div>
    <div class="pm-drawer-section"><h4>Метод на измерване</h4><div class="pm-example">${esc(n.method)}</div></div>
    <div class="pm-drawer-section"><h4>Свързани подтеми</h4><div class="pm-tags">${[c.terms[0],c.terms[1],c.topics[1]].map(x=>`<button>${esc(x)}</button>`).join('')}</div></div>
    <div class="pm-drawer-section"><h4>Източници</h4><div class="pm-source-row"><span>${esc(n.source)}</span><b>основен</b></div><div class="pm-source-row"><span>BLIS historical layer</span><b>сравнение</b></div></div>
    <div class="pm-drawer-section"><h4>Примерни сигнали</h4><div class="pm-example"><b>↑ Положителна динамика.</b> Темата присъства по-често в сравнимия период.</div><div class="pm-example"><b>Свързан контекст.</b> Наблюдава се пресичане с ${esc(c.terms[2])} и ${esc(c.topics[0])}.</div></div>
    <div class="pm-actions"><button class="pm-action${state.alert?' saved':''}" data-alert>${state.alert?'✓ Алармата е активна':'Създай аларма'}</button><button class="pm-action primary" data-analysis>Отвори анализ</button></div>`;
  d.querySelector('.pm-drawer-close').onclick=()=>{d.innerHTML='<div class="pm-empty-drawer"><b>Избери сигнал</b><span>Кликни върху елемент от картата.</span></div>'};
  d.querySelector('[data-alert]').onclick=()=>{state.alert=!state.alert;drawer(n);toast(state.alert?'Алармата е активирана':'Алармата е изключена')};
  d.querySelector('[data-analysis]').onclick=()=>{toast('Отварям свързания анализ');setTimeout(()=>{if(typeof window.refGo==='function')window.refGo('reports')},260)};
}
function selectNode(id,scroll=true){
  state.selected=id;const data=nodes();const n=data.find(x=>x.id===id)||data[0];
  document.querySelectorAll('.pm-node').forEach(el=>{const on=el.dataset.node===n.id;el.classList.toggle('selected',on);el.classList.toggle('pulse',on)});
  document.querySelectorAll('.pm-link').forEach(el=>el.classList.toggle('hot',el.dataset.a===n.id||el.dataset.b===n.id));
  drawer(n);if(scroll)document.getElementById('pmDrawer')?.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function applyState(){
  document.querySelectorAll('.pm-chip').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.filter));
  document.querySelectorAll('.pm-node').forEach(n=>n.classList.toggle('dim',state.filter!=='all'&&n.dataset.cat!==state.filter));
  document.querySelector('.pm-stage')?.classList.toggle('network',state.view==='network');
  document.querySelectorAll('.pm-view').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
  const canvas=document.querySelector('.pm-canvas');if(canvas)canvas.style.transform=`scale(${state.zoom})`;
  const zr=document.querySelector('[data-zoom="reset"]');if(zr)zr.textContent=`${Math.round(state.zoom*100)}%`;
}
function bind(){
  document.querySelectorAll('.pm-chip').forEach(b=>b.onclick=()=>{state.filter=b.dataset.filter;applyState()});
  document.querySelectorAll('.pm-view').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;applyState()});
  document.querySelectorAll('.pm-zoom').forEach(b=>b.onclick=()=>{const z=b.dataset.zoom;if(z==='+')state.zoom=Math.min(1.35,state.zoom+.1);else if(z==='-')state.zoom=Math.max(.75,state.zoom-.1);else state.zoom=1;applyState()});
  document.querySelectorAll('.pm-node').forEach(b=>{
    b.onclick=()=>selectNode(b.dataset.node);
    b.onmouseenter=()=>document.querySelectorAll('.pm-link').forEach(el=>el.classList.toggle('hot',el.dataset.a===b.dataset.node||el.dataset.b===b.dataset.node));
    b.onmouseleave=()=>document.querySelectorAll('.pm-link').forEach(el=>el.classList.toggle('hot',el.dataset.a===state.selected||el.dataset.b===state.selected));
  });
  document.querySelectorAll('.pm-kpi').forEach(b=>b.onclick=()=>{state.kpi=b.dataset.kpi;document.querySelectorAll('.pm-kpi').forEach(x=>x.classList.toggle('active',x===b));toast(`${b.querySelector('.pm-kpi-label').textContent} · активен филтър`)});
  document.querySelectorAll('.pm-theme-cloud button').forEach((b,i)=>b.onclick=()=>{const data=nodes();selectNode(data[(i+4)%data.length].id);toast(`Тема: ${b.textContent}`)});
}
function toast(text){
  const t=document.getElementById('pmToast');if(!t)return;t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800);
}
function installRoutes(){
  if(installed)return;installed=true;
  const oldRef=window.refGo;
  if(typeof oldRef==='function'&&!oldRef.__perceptionMap){
    const wrapped=function(id){if(id==='market'){openMarket();return;}const r=oldRef(id);setTimeout(patchNav,0);return r};
    wrapped.__perceptionMap=true;wrapped.__previous=oldRef;window.refGo=wrapped;
  }
  const oldGo=window.go;
  if(typeof oldGo==='function'&&!oldGo.__perceptionMap){
    const wrappedGo=function(id){if(id==='market'){openMarket();return;}return oldGo(id)};
    wrappedGo.__perceptionMap=true;wrappedGo.__previous=oldGo;window.go=wrappedGo;
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('#nav [data-page="market"]');if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();openMarket();
  },true);
  const nav=document.getElementById('nav');
  if(nav)new MutationObserver(()=>patchNav()).observe(nav,{childList:true,subtree:true});
  patchNav();
}
function boot(){installRoutes();patchNav();if(document.getElementById('market')?.classList.contains('active'))openMarket()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setTimeout(()=>{installed=false;installRoutes();patchNav()},850);
setTimeout(()=>{patchNav();if(document.getElementById('market')?.classList.contains('active'))render()},1250);
})();