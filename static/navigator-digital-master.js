/* BLIS Navigator — Digital Visibility Radar / Search Experience */
(function(){
  'use strict';
  const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const A=x=>Array.isArray(x)?x:[];
  const F=v=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
  const state=()=>({D:(typeof D!=='undefined'&&D)||{},S:(typeof S!=='undefined'&&S)||[],A:(typeof A!=='undefined'&&A)||[],H:(typeof H!=='undefined'&&H)||[]});
  let activeSector='search';

  const COLORS={overall:'#11a8b7',search:'#2daf65',web:'#1766e8',external:'#ff9819',discover:'#7546d8',channels:'#12b8b0'};
  const ICONS={
    search:'<path d="M10.7 17.4a6.7 6.7 0 1 1 4.7-11.4 6.7 6.7 0 0 1-4.7 11.4Z"/><path d="m15.6 15.6 4.2 4.2"/>',
    web:'<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.2 2.1 3.4 4.8 3.4 8S14.2 17.9 12 20c-2.2-2.1-3.4-4.8-3.4-8S9.8 6.1 12 4Z"/>',
    external:'<path d="M9.5 14.5 14.5 9.5M7.2 16.8l-1 1a3 3 0 0 1-4.2-4.2l4-4a3 3 0 0 1 4.2 0M16.8 7.2l1-1A3 3 0 1 1 22 10.4l-4 4a3 3 0 0 1-4.2 0"/>',
    discover:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
    channels:'<circle cx="8" cy="9" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M2.5 20c.8-4.1 2.8-6.2 5.5-6.2s4.7 2.1 5.5 6.2M14 13.6c3.1-.5 5.4 1.3 6.2 4.4"/>',
    scan:'<path d="M4 18V9M10 18V5M16 18v-8M3 20h18"/>'
  };
  const icon=(k)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]||ICONS.scan}</svg>`;

  function clientName(){return (document.querySelector('.client-brand-name')?.textContent||document.querySelector('.topbar h1')?.textContent||'Клиент').trim()}
  function metric(D,aliases){
    const names=A(aliases).map(x=>String(x).toLowerCase());
    for(const pool of [A(D.metrics),A(D.indices)]){
      for(const x of pool){const k=String(x?.key||x?.metric||x?.name||'').toLowerCase();if(names.includes(k)&&N(x?.value)!=null)return N(x.value)}
    }
    try{for(const k of names){if(typeof score==='function'){const v=N(score(k));if(v!=null)return v}}}catch(e){}
    return null;
  }
  function snapValue(s,aliases){
    const p=s?.payload||s||{},names=A(aliases).map(x=>String(x).toLowerCase());
    for(const x of A(p.indices)){const k=String(x?.key||x?.name||'').toLowerCase();if(names.includes(k)&&N(x?.value)!=null)return N(x.value)}
    for(const x of A(p.metrics)){const k=String(x?.key||x?.metric||x?.name||'').toLowerCase();if(names.includes(k)&&N(x?.value)!=null)return N(x.value)}
    return null;
  }
  function measuredSeries(H,aliases){
    const byDay=new Map();
    for(const x of A(H)){
      const v=snapValue(x,aliases);if(v==null)continue;
      const p=x?.payload||{},t=x?.time||x?.created_at||x?.observed_at||x?.date||p?.time||p?.date;
      const d=t?new Date(t):null;if(!d||isNaN(d))continue;
      const day=d.toISOString().slice(0,10);byDay.set(day,{date:day,value:v});
    }
    return [...byDay.values()].sort((a,b)=>a.date.localeCompare(b.date)).slice(-30);
  }
  function delta(rows){if(rows.length<2)return null;return Math.round((rows[rows.length-1].value-rows[rows.length-2].value)*10)/10}
  function dateBG(s){const p=String(s||'').split('-');return p.length===3?`${p[2]}.${p[1]}`:String(s||'')}
  function miniTrend(rows,color,w=300,h=112){
    if(rows.length<2)return '<div class="dv-trend-empty">Натрупва се измерена история.</div>';
    const l=8,r=8,t=10,b=22,vals=rows.map(x=>x.value),mn=Math.min(...vals),mx=Math.max(...vals),spread=Math.max(1,mx-mn),min=Math.max(0,mn-spread*.3-1),max=Math.min(100,mx+spread*.3+1),span=Math.max(1,max-min);
    const X=i=>l+(w-l-r)*i/(rows.length-1),Y=v=>t+(h-t-b)*(1-(v-min)/span),pts=rows.map((x,i)=>[X(i),Y(x.value)]),d=pts.map((p,i)=>`${i?'L':'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Измерена динамика"><g stroke="#e7edf4" stroke-width="1"><line x1="${l}" y1="${t}" x2="${w-r}" y2="${t}"/><line x1="${l}" y1="${(t+h-b)/2}" x2="${w-r}" y2="${(t+h-b)/2}"/><line x1="${l}" y1="${h-b}" x2="${w-r}" y2="${h-b}"/></g><path d="${d}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${pts.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.1" fill="${color}" stroke="#fff" stroke-width="1.3"><title>${E(dateBG(rows[i].date))} · ${E(F(rows[i].value))}/100</title></circle>`).join('')}<text x="${l}" y="${h-4}" font-size="9" fill="#8190a5">${E(dateBG(rows[0].date))}</text><text x="${w-r}" y="${h-4}" text-anchor="end" font-size="9" fill="#8190a5">${E(dateBG(rows[rows.length-1].date))}</text></svg>`;
  }

  function sourceText(s){return [s?.key,s?.label,s?.name,s?.url,s?.method,s?.type].filter(Boolean).join(' ').toLowerCase()}
  function sourceCategory(s){
    const q=sourceText(s);
    if(/maps|map|карти|location|local/.test(q))return'channels';
    if(/instagram|facebook|linkedin|youtube|tiktok|twitter|social|социал/.test(q))return'channels';
    if(/backlink|referral|external|directory|media|news|article|новин|меди|линк/.test(q))return'external';
    if(/google|bing|serp|search|търс/.test(q))return'search';
    if(/website|site|domain|web|сайт|официал/.test(q))return'web';
    return'discover';
  }
  function hostOf(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch(e){return String(u||'').replace(/^https?:\/\//,'').split('/')[0]}}
  function sourceLabel(s){return String(s?.label||s?.name||s?.key||hostOf(s?.url)||'Дигитален източник')}
  function sourceCards(S){
    const groups={web:[],channels:[],external:[],search:[],discover:[]};
    for(const s of A(S)){const c=sourceCategory(s);groups[c].push(s)}
    const selected=[];
    for(const k of ['web','channels','external','search','discover'])if(groups[k].length)selected.push(groups[k][0]);
    if(selected.length<5)for(const s of A(S))if(!selected.includes(s)){selected.push(s);if(selected.length>=5)break}
    return selected.slice(0,5);
  }
  function categoryCount(S,id){return A(S).filter(s=>sourceCategory(s)===id).length}
  function hash32(s){let h=2166136261>>>0;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  function blips(S){
    return sourceCards(S).map((s,i)=>{const h=hash32(sourceLabel(s)+'|'+i),a=(h%360)*Math.PI/180,r=.18+((h>>>8)%55)/100*.72,x=50+Math.cos(a)*r*42,y=50+Math.sin(a)*r*42;return `<button class="dv-blip" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%" title="${E(sourceLabel(s))}" data-source-query="${E(sourceLabel(s))}" aria-label="${E(sourceLabel(s))}"><i></i></button>`}).join('');
  }

  function sectorData(D,H,S){
    const defs={
      search:{id:'search',label:'Търсене',color:COLORS.search,icon:'search',aliases:['search_visibility','branded_search','brand_search','search_index','content','interest'],history:['content','interest'],desc:'Показва доколко марката се открива при търсене и как се развива видимостта ѝ във времето.'},
      web:{id:'web',label:'Уеб присъствие',color:COLORS.web,icon:'web',aliases:['website_visibility','web_presence','web_visibility','digital','digital_index'],history:['digital','digital_index'],desc:'Обобщава видимостта на официалния сайт и измеримото присъствие на собствените дигитални активи.'},
      external:{id:'external',label:'Външна видимост',color:COLORS.external,icon:'external',aliases:['external_visibility','external_presence','referral_visibility','backlink_visibility'],history:['external_visibility','external_presence'],desc:'Следи измеримите сигнали от външни сайтове, препратки, медии и други независими източници.'},
      discover:{id:'discover',label:'Откриваемост',color:COLORS.discover,icon:'discover',aliases:['discoverability','findability','presence','social_presence'],history:['presence','social_presence'],desc:'Показва доколко марката може да бъде намерена през различни публични дигитални точки на контакт.'},
      channels:{id:'channels',label:'Канално присъствие',color:COLORS.channels,icon:'channels',aliases:['channel_presence','channel_visibility','presence','social_presence'],history:['presence','social_presence'],desc:'Показва ширината на наблюдаваното присъствие през социални, локални и други активни канали.'}
    };
    for(const x of Object.values(defs)){x.value=metric(D,x.aliases);x.rows=measuredSeries(H,x.history);x.delta=delta(x.rows);x.sources=categoryCount(S,x.id)}
    return defs;
  }
  function quality(v){if(v==null)return'Натрупване на измерима база';if(v>=80)return'Много висока видимост';if(v>=65)return'Силна видимост';if(v>=50)return'Умерена видимост';return'Ограничена видимост'}
  function deltaHTML(d){if(d==null)return'<span class="dv-neutral">— няма сравнима дневна стойност</span>';return `<span class="${d>0?'dv-up':d<0?'dv-down':'dv-neutral'}">${d>0?'↑':d<0?'↓':'→'} ${E(F(Math.abs(d)))} т. спрямо предходния ден</span>`}

  function searchCard(s){
    const c=sourceCategory(s),url=String(s?.url||''),label=sourceLabel(s),sub=hostOf(url)||String(s?.method||'Наблюдаван източник');
    return `<button class="dv-source-card" type="button" data-source-text="${E(sourceText(s))}" data-source-query="${E(label)}" ${url?`data-source-url="${E(url)}"`:''}><span class="dv-source-icon ${c}">${icon(c==='discover'?'discover':c)}</span><span><b>${E(label)}</b><small>${E(sub)}</small></span><em>${url?'↗':'•'}</em></button>`;
  }
  function chips(){return [['search','Търсене'],['web','Уебсайт'],['channels','Карти / профили'],['external','Външни източници'],['discover','Откриваемост']].map(([id,l])=>`<button type="button" class="dv-chip" data-sector="${id}">${icon(id)}${E(l)}</button>`).join('')}
  function radarSector(x,cls){return `<button type="button" class="dv-radar-sector ${cls}" data-sector="${x.id}" style="--sector:${x.color}"><span>${icon(x.icon)}${E(x.label)}</span><b>${E(F(x.value))}${x.value==null?'':' /100'}</b></button>`}

  function renderDetail(x){
    const host=document.getElementById('dvDetail');if(!host||!x)return;
    host.style.setProperty('--accent',x.color);
    host.innerHTML=`<div class="dv-detail-kicker">Избран сектор</div><div class="dv-detail-title"><span class="dv-detail-icon">${icon(x.icon)}</span><div><h3>${E(x.label)}</h3><small>${E(quality(x.value))}</small></div><strong>${E(F(x.value))}${x.value==null?'':' / 100'}</strong></div><p class="dv-detail-copy">${E(x.desc)}</p><div class="dv-detail-metrics"><div><span>${icon(x.icon)} Основна стойност</span><b>${E(F(x.value))}${x.value==null?'':' /100'}</b></div><div><span>◷ Дневни измервания</span><b>${x.rows.length}</b></div><div><span>◎ Промяна</span><b>${x.delta==null?'—':`${x.delta>0?'+':''}${F(x.delta)} т.`}</b></div><div><span>⌁ Наблюдавани източници</span><b>${x.sources}</b></div></div><div class="dv-detail-trend"><div class="dv-detail-trend-head"><b>Измерена динамика</b><span>последните налични дни</span></div>${miniTrend(x.rows,x.color)}</div><button class="dv-detail-action" type="button" data-detail-action="sources">Виж свързаните източници <span>›</span></button>`;
  }

  function render(){
    const root=document.getElementById('digitalBody');if(!root)return;
    const {D,S,H}=state(),name=clientName(),sectors=sectorData(D,H,S),overall=metric(D,['digital','digital_index','visibility']),overallRows=measuredSeries(H,['digital','digital_index']),overallDelta=delta(overallRows),cards=sourceCards(S);
    const summary=overall==null?`${name}: дигиталната видимост се измерва чрез наблюдаваните публични източници и натрупва история.`:`${name} има ${overall>=80?'много висока':overall>=65?'силна':overall>=50?'умерена':'ограничена'} обща дигитална видимост (${F(overall)}/100). Радарът показва къде марката се открива най-ясно и къде има дефицит на измерими сигнали.`;
    root.innerHTML=`<div class="ref-title dv-title"><h2>Дигитална видимост</h2><p>Интерактивно сканиране на това къде и колко ясно се открива марката в дигиталната среда</p></div><div class="dv-shell"><div class="dv-searchbar"><span class="dv-search-icon">${icon('search')}</span><input id="dvSearchInput" value="${E(name)}" aria-label="Търсене в наблюдаваните дигитални източници"><button id="dvSearchButton" type="button"><span>✦</span> Интелигентно търсене</button></div><div class="dv-summary">${E(summary)}</div><div class="dv-chips">${chips()}</div><div class="dv-stage"><aside class="dv-source-rail"><div class="dv-rail-head"><b>Открити точки</b><span>${cards.length} показани</span></div><div id="dvSourceCards" class="dv-source-list">${cards.length?cards.map(searchCard).join(''):'<div class="dv-source-empty">Няма конфигурирани дигитални източници за този клиент.</div>'}</div></aside><section class="dv-radar-column"><div class="dv-radar-wrap" id="dvRadar"><div class="dv-radar-glow"></div><div class="dv-radar-grid"><div class="dv-sweep"></div>${blips(S)}<span class="dv-radar-core"></span></div>${radarSector(sectors.search,'search')}${radarSector(sectors.web,'web')}${radarSector(sectors.external,'external')}${radarSector(sectors.discover,'discover')}${radarSector(sectors.channels,'channels')}</div><div class="dv-radar-hint">◎ Кликнете върху сектор, за да видите детайли</div></section><aside id="dvDetail" class="dv-detail"></aside></div><div class="dv-kpis"><button type="button" class="dv-kpi overall" data-sector="overall"><div class="dv-kpi-head"><span>${icon('scan')}</span><b>Обща дигитална видимост</b><em>›</em></div><div class="dv-kpi-body"><strong>${E(F(overall))}<small>${overall==null?'':'/100'}</small></strong><div>${deltaHTML(overallDelta)}</div></div><div class="dv-kpi-spark">${miniTrend(overallRows,COLORS.overall,220,58)}</div></button><button type="button" class="dv-kpi search" data-sector="search"><div class="dv-kpi-head"><span>${icon('search')}</span><b>Видимост в търсене</b><em>›</em></div><div class="dv-kpi-body"><strong>${E(F(sectors.search.value))}<small>${sectors.search.value==null?'':'/100'}</small></strong><div>${deltaHTML(sectors.search.delta)}</div></div><div class="dv-kpi-spark">${miniTrend(sectors.search.rows,COLORS.search,220,58)}</div></button><button type="button" class="dv-kpi external" data-sector="external"><div class="dv-kpi-head"><span>${icon('external')}</span><b>Външно присъствие</b><em>›</em></div><div class="dv-kpi-body"><strong>${E(F(sectors.external.value))}<small>${sectors.external.value==null?'':'/100'}</small></strong><div>${deltaHTML(sectors.external.delta)}</div></div><div class="dv-kpi-spark">${miniTrend(sectors.external.rows,COLORS.external,220,58)}</div></button><button type="button" class="dv-kpi discover" data-sector="discover"><div class="dv-kpi-head"><span>${icon('discover')}</span><b>Откриваемост на бранда</b><em>›</em></div><div class="dv-kpi-body"><strong>${E(F(sectors.discover.value))}<small>${sectors.discover.value==null?'':'/100'}</small></strong><div>${deltaHTML(sectors.discover.delta)}</div></div><div class="dv-kpi-spark">${miniTrend(sectors.discover.rows,COLORS.discover,220,58)}</div></button></div></div>`;
    root._dvSectors=sectors;root._dvOverall={id:'overall',label:'Обща дигитална видимост',color:COLORS.overall,icon:'scan',value:overall,rows:overallRows,delta:overallDelta,sources:S.length,desc:'Обобщава текущото измеримо дигитално присъствие на марката през активните наблюдавани източници.'};
    selectSector(activeSector==='overall'?'overall':activeSector,false);
  }

  function sectorObj(id){const root=document.getElementById('digitalBody');return id==='overall'?root?._dvOverall:root?._dvSectors?.[id]}
  function selectSector(id,scroll=false){
    const x=sectorObj(id);if(!x)return;activeSector=id;
    document.querySelectorAll('#digitalBody [data-sector]').forEach(el=>el.classList.toggle('active',el.dataset.sector===id));
    renderDetail(x);
    if(scroll)document.getElementById('dvDetail')?.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function runSearch(){
    const input=document.getElementById('dvSearchInput'),q=String(input?.value||'').trim().toLowerCase(),radar=document.getElementById('dvRadar');
    radar?.classList.remove('is-scanning');void radar?.offsetWidth;radar?.classList.add('is-scanning');setTimeout(()=>radar?.classList.remove('is-scanning'),1250);
    const cards=[...document.querySelectorAll('#dvSourceCards .dv-source-card')];let shown=0;
    cards.forEach(c=>{const text=(c.dataset.sourceText||'').toLowerCase(),show=!q||q===clientName().toLowerCase()||text.includes(q);c.hidden=!show;if(show)shown++});
    const head=document.querySelector('.dv-rail-head span');if(head)head.textContent=`${shown} показани`;
  }

  document.addEventListener('click',e=>{
    const sector=e.target?.closest?.('#digitalBody [data-sector]');if(sector){const id=sector.dataset.sector;if(id)selectSector(id,sector.classList.contains('dv-kpi'));return}
    if(e.target?.closest?.('#dvSearchButton')){runSearch();return}
    const source=e.target?.closest?.('#digitalBody .dv-source-card,#digitalBody .dv-blip');if(source){const url=source.dataset.sourceUrl;if(url){window.open(url,'_blank','noopener')}else{const q=source.dataset.sourceQuery;if(q){const input=document.getElementById('dvSearchInput');if(input){input.value=q;runSearch()}}}return}
    if(e.target?.closest?.('[data-detail-action="sources"]')){document.querySelector('.dv-source-rail')?.scrollIntoView({behavior:'smooth',block:'nearest'})}
  });
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='dvSearchInput'){e.preventDefault();runSearch()}});

  function bind(){
    const btn=document.querySelector('#nav button[data-page="digital"]');if(btn)btn.addEventListener('click',()=>setTimeout(render,40));
    const sel=document.getElementById('clientSel');if(sel)sel.addEventListener('change',()=>setTimeout(()=>{if(document.getElementById('digital')?.classList.contains('active'))render()},180));
    if(document.getElementById('digital')?.classList.contains('active'))render();
  }
  window.BLISDigitalRadar={render,selectSector};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
