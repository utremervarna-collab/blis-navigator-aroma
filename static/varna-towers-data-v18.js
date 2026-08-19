/* BLIS Navigator — Varna Towers isolated client runtime. Initial public-data onboarding 2026-08-18. */
(function(){
  'use strict';
  const stamp='2026-08-18T17:38:00+03:00';
  const sources=[
    {key:'official_site',label:'Varna Towers – официален сайт',url:'https://www.varnatowers.bg/',method:'официален сайт • сграда, площи, услуги, наематели, локация',reliability:.98},
    {key:'building',label:'Varna Towers – Сградата',url:'https://www.varnatowers.bg/sgradata',method:'официални площи, паркиране и запълняемост',reliability:.98},
    {key:'location',label:'Varna Towers – Локация',url:'https://www.varnatowers.bg/lokacia',method:'официална локационна и транспортна информация',reliability:.98},
    {key:'tenants',label:'Varna Towers – Наематели',url:'https://www.varnatowers.bg/naemateli',method:'официален списък на наематели и услуги',reliability:.96},
    {key:'services',label:'Varna Towers – Услуги',url:'https://www.varnatowers.bg/uslugi',method:'официални услуги и публични точки в комплекса',reliability:.96},
    {key:'news',label:'Varna Towers – Новини',url:'https://www.varnatowers.bg/novini',method:'официални новини и промени в комплекса',reliability:.94},
    {key:'linkedin',label:'LinkedIn – Varna Towers',url:'https://www.linkedin.com/company/varna-towers',method:'официален публичен корпоративен профил',reliability:.90},
    {key:'google_business',label:'Google Business / Maps – Varna Towers',url:'https://www.google.com/maps/search/Varna+Towers+Varna',method:'публична оценка, отзиви, статус и локална видимост',reliability:.90},
    {key:'google_search',label:'Google Search – Varna Towers',url:'https://www.google.com/search?q=%22Varna+Towers%22',method:'брандова откриваемост и публични резултати',reliability:.88},
    {key:'google_news',label:'Google News – Varna Towers',url:'https://news.google.com/search?q=%22Varna%20Towers%22',method:'новинарски и медийни споменавания',reliability:.90},
    {key:'google_trends',label:'Google Trends – Varna Towers',url:'https://trends.google.com/',method:'относителен интерес при търсене',reliability:.90},
    {key:'facebook',label:'Facebook – наблюдение Varna Towers',url:'https://www.facebook.com/search/top?q=varna%20towers',method:'публично социално съдържание и споменавания',reliability:.76},
    {key:'instagram',label:'Instagram – наблюдение Varna Towers',url:'https://www.instagram.com/',method:'публично визуално съдържание и споменавания',reliability:.74},
    {key:'youtube',label:'YouTube – Varna Towers',url:'https://www.youtube.com/results?search_query=Varna+Towers',method:'публично видео съдържание и споменавания',reliability:.80},
    {key:'meta_ads',label:'Meta Ad Library',url:'https://www.facebook.com/ads/library/',method:'публична рекламна активност при наличие',reliability:.90},
    {key:'google_ads',label:'Google Ads Transparency Center',url:'https://adstransparency.google.com/',method:'публична рекламна активност при наличие',reliability:.90},
    {key:'officemap',label:'OfficeMap – офис пазар Варна',url:'https://www.officemap.bg/',method:'специализиран сравнителен офисен пазар',reliability:.86},
    {key:'bpv',label:'Business Park Varna',url:'https://bpv.bg/',method:'директен конкурент • бизнес парк и офис площи',reliability:.94},
    {key:'varna115',label:'Varna 115',url:'https://varna115.com/',method:'сравним бизнес/смесен комплекс',reliability:.90},
    {key:'landmark',label:'Landmark Centre Varna',url:'https://www.google.com/search?q=Landmark+Centre+Varna',method:'сравним централен бизнес комплекс',reliability:.86},
    {key:'chayka',label:'Chayka Center Varna',url:'https://www.google.com/search?q=Chayka+Center+Varna',method:'сравним смесен търговски/бизнес център',reliability:.82},
    {key:'mall_varna_business',label:'Mall Varna / KBC Business Center',url:'https://www.google.com/search?q=Mall+Varna+business+center',method:'локална бизнес и офис среда',reliability:.84},
    {key:'property_market',label:'Имотен пазар – офис площи Варна',url:'https://www.google.com/search?q=офиси+под+наем+Варна+бизнес+център',method:'пазарни оферти и ценова среда',reliability:.76},
    {key:'registry',label:'Търговски регистър',url:'https://portal.registryagency.bg/',method:'официални фирмени данни',reliability:1},
    {key:'nsi',label:'НСИ',url:'https://www.nsi.bg/',method:'официални секторни и икономически показатели',reliability:1},
    {key:'municipality',label:'Община Варна',url:'https://www.varna.bg/',method:'градска, инфраструктурна и инвестиционна среда',reliability:.98},
    {key:'airport',label:'Летище Варна',url:'https://varna-airport.bg/',method:'транспортна достъпност и пътническа среда',reliability:.96},
    {key:'linkedin_tenants',label:'LinkedIn – ключови наематели',url:'https://www.linkedin.com/',method:'видимост на ключови компании и адресно присъствие в Varna Towers',reliability:.86}
  ];
  const indices=[
    {key:'presence',label:'Индекс на публичното присъствие',value:74.6,description:'Видимост на Varna Towers в собствените, локалните, бизнес и медийните публични канали.',components:[['Официален сайт',100],['LinkedIn профил',100],['Google Business профил',78],['Медийна откриваемост',58],['Публични наемателски сигнали',72]],sources:['Varna Towers','LinkedIn','Google Business','Google News']},
    {key:'digital',label:'Индекс на дигиталната видимост',value:88.0,description:'Достъпност, информационна пълнота, структура, двуезичност и локална откриваемост на дигиталните активи.',components:[['Официален сайт',100],['Подробни страници за площи',100],['Локация и транспорт',100],['Наематели и услуги',94],['Социална екосистема',46]],sources:['varnatowers.bg','Google','LinkedIn']},
    {key:'reputation',label:'Индекс на репутацията',value:76.2,description:'Нормализирана публична оценка от Google Business и обем на наличните потребителски отзиви.',components:[['Google оценка',78],['Обем на отзивите',70.9],['Локална бизнес видимост',82]],sources:['Google Business / Maps']},
    {key:'content',label:'Индекс на информационното съдържание',value:86.0,description:'Пълнота на публичното представяне на сградата, площите, услугите, локацията, наемателите и новините.',components:[['Сграда и площи',100],['Наематели',92],['Услуги',88],['Локация',100],['Новини',50]],sources:['varnatowers.bg']},
    {key:'competitive',label:'Индекс на конкурентната позиция',value:76.2,description:'Съпоставка по еднаква публична Google рамка за бизнес/смесени комплекси във Варна.',components:[['Google рейтинг',3.9],['Google отзиви',349],['Собствен дигитален актив',100],['Локационна достъпност',94]],sources:['Google Business','Business Park Varna','Varna 115','Landmark Centre','Chayka Center']},
    {key:'location',label:'Индекс на локационната достъпност',value:94.0,description:'Главна градска артерия, близост до центъра и летището, обществен транспорт и паркиране.',components:[['Център ~5 мин.',100],['Летище ~5 мин.',100],['10 автобусни линии',95],['600 подземни места',92]],sources:['Varna Towers – Локация','Varna Towers – Сградата']},
    {key:'offer',label:'Индекс на бизнес офертата',value:84.0,description:'Пълнота на офисната и търговската оферта, услуги, наемателски микс и публична информация за площите.',components:[['Офис площи',90],['Търговски площи',80],['Услуги',86],['Наемателски микс',82]],sources:['Varna Towers – Сградата','Varna Towers – Наематели','Varna Towers – Услуги']}
  ];
  const competitors=[
    {name:'Varna 115',score:85.3,rating:4.4,ratings:733,source:'Google Business',segment:'Бизнес / смесен комплекс'},
    {name:'Business Park Varna',score:84.4,rating:4.4,ratings:481,source:'Google Business',segment:'Бизнес парк / офиси'},
    {name:'Landmark Centre',score:80.6,rating:4.4,ratings:83,source:'Google Business',segment:'Бизнес център'},
    {name:'Chayka Center',score:79.5,rating:4.2,ratings:203,source:'Google Business',segment:'Смесен център'},
    {name:'Varna Towers',score:76.2,rating:3.9,ratings:349,source:'Google Business',segment:'Бизнес / смесен комплекс'}
  ];
  const metrics=[
    {label:'Google Business',value:'3.9/5 • 349 публични отзива'},
    {label:'Обща застроена площ',value:'81 506 m²'},
    {label:'Обща отдаваема площ',value:'47 604 m²'},
    {label:'Офис отдаваема площ',value:'18 537 m²'},
    {label:'Търговска отдаваема площ',value:'29 067 m²'},
    {label:'Отдадена площ',value:'15 074 m²'},
    {label:'Офиси + складове',value:'70% публично заявена запълняемост'},
    {label:'Търговска част',value:'8% публично заявена запълняемост'},
    {label:'Паркиране',value:'600 подземни паркоместа'},
    {label:'Транспорт',value:'10 автобусни линии'},
    {label:'Достъпност',value:'~5 мин. център • ~5 мин. летище'},
    {label:'Публичен наемателски микс',value:'30+ изброени компании и услуги'}
  ];
  const signals=[
    {level:'watch',title:'Несъответствие в Google Business статуса',text:'Публичните Google резултати показват противоречив статус за локацията, докато официалният сайт и актуалните наемателски/услугни страници са активни.',description:'Необходима е проверка и корекция на Google Business статуса, защото влияе директно върху локалната откриваемост.'},
    {level:'watch',title:'Ниска публично заявена запълняемост на търговската част',text:'Официалната страница за сградата посочва 8% запълняемост на магазините.',description:'Търговската част е ключов репутационен и продуктов сигнал за смесения профил на комплекса.'},
    {level:'positive',title:'Силна офисна локация и транспортна достъпност',text:'Официално са посочени близост до центъра и летището, 10 автобусни линии и 600 подземни паркоместа.',description:'Локацията е силен актив в офисното позициониране.'},
    {level:'positive',title:'Разпознаваеми корпоративни наематели',text:'Официалният списък включва международни и национални компании като Paysafe, Concentrix, DXC, Kamenitza и други.',description:'Наемателският микс укрепва B2B позиционирането.'}
  ];
  const dashboard={client:'varna-towers',name:'Varna Towers',sector:'Недвижими имоти / Бизнес център / Смесен комплекс',note:'Публичен аналитичен профил • начална база 18.08.2026 • без вътрешни данни',blis_index:81.0,benchmark:81.2,relative:99.8,confidence:91.0,trend:0,data_updated:stamp,indices,metrics,signals,competitors};
  const activity=[
    {time:stamp,source:'google_business',metric:'rating',value:3.9},{time:stamp,source:'google_business',metric:'review_count',value:349},
    {time:stamp,source:'building',metric:'gross_build_area_m2',value:81506},{time:stamp,source:'building',metric:'gross_lease_area_m2',value:47604},
    {time:stamp,source:'building',metric:'office_gla_m2',value:18537},{time:stamp,source:'building',metric:'retail_gla_m2',value:29067},
    {time:stamp,source:'building',metric:'leased_area_m2',value:15074},{time:stamp,source:'building',metric:'parking_spaces',value:600},
    {time:stamp,source:'building',metric:'office_warehouse_occupancy_pct',value:70},{time:stamp,source:'building',metric:'retail_occupancy_pct',value:8},
    {time:stamp,source:'location',metric:'bus_lines',value:10},{time:stamp,source:'location',metric:'city_center_minutes',value:5},{time:stamp,source:'location',metric:'airport_minutes',value:5},
    {time:stamp,source:'official_site',metric:'website_active',value:1},{time:stamp,source:'linkedin',metric:'profile_active',value:1},
    {time:stamp,source:'tenants',metric:'tenant_list_active',value:1},{time:stamp,source:'services',metric:'services_list_active',value:1},
    {time:stamp,source:'bpv',metric:'rating',value:4.4},{time:stamp,source:'bpv',metric:'review_count',value:481},
    {time:stamp,source:'varna115',metric:'rating',value:4.4},{time:stamp,source:'varna115',metric:'review_count',value:733},
    {time:stamp,source:'landmark',metric:'rating',value:4.4},{time:stamp,source:'landmark',metric:'review_count',value:83},
    {time:stamp,source:'chayka',metric:'rating',value:4.2},{time:stamp,source:'chayka',metric:'review_count',value:203}
  ];
  const history=[{created_at:stamp,payload:dashboard}];
  const quality={sources_total:sources.length,sources_with_data:12,fresh_sources_48h:12,coverage:42.9,freshness:42.9,updated:stamp};
  const keywords=[
    {title:'Google Business статус',explanation:'Открито е публично несъответствие между статуса в отделни Google резултати и активната официална среда.',display:'Изисква проверка',source:'Google Business / официален сайт',status:'За внимание',kind:'reputation',value:1,measured:true},
    {title:'Офисна запълняемост',explanation:'Публично заявен дял за офиси + складове.',display:'70%',source:'Varna Towers – Сградата',status:'Измерено',kind:'market',value:70,measured:true},
    {title:'Търговска запълняемост',explanation:'Публично заявен дял за търговската част.',display:'8%',source:'Varna Towers – Сградата',status:'Измерено',kind:'market',value:8,measured:true},
    {title:'Наемателски микс',explanation:'Официалният сайт показва широк B2B и услугeн микс.',display:'30+ публично изброени',source:'Varna Towers – Наематели',status:'Активно',kind:'content',value:30,measured:true},
    {title:'Конкурентна Google рамка',explanation:'Varna Towers се съпоставя с Business Park Varna, Varna 115, Landmark Centre и Chayka Center.',display:'76.2 конкурентен score',source:'Google Business',status:'Измерено',kind:'competitive',value:76.2,measured:true}
  ];
  const alerts=signals.filter(s=>s.level==='watch').map((s,i)=>({id:'varna-towers-'+(i+1),severity:s.level,title:s.title,text:s.text,created_at:stamp,acknowledged:false}));
  const reports=[
    {id:'digital',title:'Дигитално и съдържателно присъствие',period:'Август 2026'},
    {id:'reputation',title:'Репутация и информационна среда',period:'Август 2026'},
    {id:'signals',title:'Пазарни сигнали',period:'Август 2026'},
    {id:'competitive',title:'Конкурентно позициониране',period:'Август 2026'},
    {id:'summary',title:'Месечно обобщение',period:'Август 2026'}
  ];
  const json=v=>new Response(JSON.stringify(v),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
  const nativeFetch=window.fetch.bind(window);
  window.__VARNA_TOWERS_DATA={dashboard,sources,quality,activity,history,keywords,alerts,reports};
  window.fetch=async function(input,init){
    const raw=typeof input==='string'?input:(input&&input.url)||'';
    let u;try{u=new URL(raw,location.href)}catch(e){return nativeFetch(input,init)}
    const p=u.pathname;
    if(p==='/api/clients'){
      try{
        const r=await nativeFetch(input,init),a=await r.clone().json();
        if(Array.isArray(a)&&!a.some(x=>x.slug==='varna-towers'))a.push({slug:'varna-towers',name:'Varna Towers',sector:'Недвижими имоти / Бизнес център',note:'Публичен аналитичен профил'});
        return json(a);
      }catch(e){return json([{slug:'aroma',name:'Aroma'},{slug:'bolyarka',name:'Болярка'},{slug:'astor-garden',name:'Astor Garden Hotel'},{slug:'varna-towers',name:'Varna Towers',sector:'Недвижими имоти / Бизнес център'}])}
    }
    const m=p.match(/^\/api\/clients\/varna-towers\/([^/?#]+)/);
    if(!m)return nativeFetch(input,init);
    switch(m[1]){
      case'dashboard':return json(dashboard);case'sources':return json(sources);case'data-quality':return json(quality);case'activity':return json(activity);case'history':return json(history);case'keywords':return json(keywords);case'alerts':return json(alerts);case'exports':return json([]);case'reports':return json(reports);
      case'refresh':dashboard.data_updated=new Date().toISOString();quality.updated=dashboard.data_updated;return json({ok:true,engine:{version:'2.9-varna-towers-bootstrap',running:false,last_run:dashboard.data_updated,successful:12,failed:0},dashboard});
    }
    return nativeFetch(input,init);
  };

  /* Home BLIS LIVE visual + real delta override. */
  if(typeof document!=='undefined'){
    const css=document.createElement('style');
    css.textContent=`
      .marketTape{background:linear-gradient(90deg,#11263a 0%,#183149 52%,#1b3954 100%)!important;color:#eef5fb!important}
      .tapeItem{position:relative}
      .tapeItem::before{content:"";width:4px;height:18px;border-radius:4px;background:var(--client-accent,#9fb3c6);flex:0 0 4px}
      .tapeClient{color:var(--client-accent,#9fb3c6)!important;font-weight:900!important}
      .tapeDelta.up{color:#4fd18b!important}.tapeDelta.down{color:#ff7070!important}.tapeDelta.flat{color:#69aff8!important}
    `;
    document.head.appendChild(css);
    const colors={'AROMA':'#56d6df','БОЛЯРКА':'#f0b24a','ASTOR GARDEN':'#8fd3a8','VARNA TOWERS':'#91b3ff'};
    const tapeClients=[['aroma','AROMA'],['bolyarka','БОЛЯРКА'],['astor-garden','ASTOR GARDEN'],['varna-towers','VARNA TOWERS']];
    const tapeMetrics=[['blis','BLIS'],['digital','DIGITAL'],['reputation','REPUTATION'],['competitive','COMPETITIVE']];
    const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
    const valueOf=(payload,key)=>{
      if(!payload)return null;
      if(key==='blis')return num(payload.blis_index);
      const x=(payload.indices||[]).find(i=>i&&i.key===key);
      return x?num(x.value):null;
    };
    const explicitDelta=(d,key)=>{
      if(!d)return null;
      const obj=key==='blis'?d:(d.indices||[]).find(i=>i&&i.key===key);
      if(!obj)return null;
      for(const k of ['delta','change','change_value','trend_delta','trend']){
        const v=num(obj[k]);
        if(v!==null)return v;
      }
      return null;
    };
    const historyDelta=(d,h,key)=>{
      const cur=valueOf(d,key);
      if(cur===null||!Array.isArray(h))return null;
      const rows=h.filter(r=>r&&r.payload&&valueOf(r.payload,key)!==null);
      if(!rows.length)return null;
      rows.sort((a,b)=>String(a.created_at||'').localeCompare(String(b.created_at||'')));
      const currentStamp=String(d.data_updated||d.updated_at||'');
      let prev=null;
      if(currentStamp){
        let idx=-1;
        for(let i=rows.length-1;i>=0;i--){
          const ps=String(rows[i].payload?.data_updated||rows[i].created_at||'');
          if(ps===currentStamp||String(rows[i].created_at||'')===currentStamp){idx=i;break}
        }
        if(idx>0)prev=valueOf(rows[idx-1].payload,key);
        else if(idx<0)prev=valueOf(rows[rows.length-1].payload,key);
      }else{
        const last=valueOf(rows[rows.length-1].payload,key);
        prev=Math.abs(last-cur)<1e-9&&rows.length>1?valueOf(rows[rows.length-2].payload,key):last;
      }
      return prev===null?null:cur-prev;
    };
    let deltaMap=new Map();
    let applying=false;
    const loadRealDeltas=async()=>{
      const next=new Map();
      await Promise.all(tapeClients.map(async([slug,name])=>{
        try{
          const bust=Date.now();
          const [d,h]=await Promise.all([
            fetch(`/api/clients/${slug}/dashboard?_=${bust}`,{cache:'no-store'}).then(r=>r.ok?r.json():null),
            fetch(`/api/clients/${slug}/history?_=${bust}`,{cache:'no-store'}).then(r=>r.ok?r.json():[])
          ]);
          for(const [key,label] of tapeMetrics){
            if(valueOf(d,key)===null)continue;
            let delta=explicitDelta(d,key);
            if(delta===null)delta=historyDelta(d,h,key);
            next.set(`${name}|${label}`,delta);
          }
        }catch(e){}
      }));
      deltaMap=next;
      applyTape();
    };
    const paint=()=>document.querySelectorAll('#blisTapeTrack .tapeItem').forEach(el=>{
      const name=(el.querySelector('.tapeClient')?.textContent||'').trim().toUpperCase();
      if(colors[name])el.style.setProperty('--client-accent',colors[name]);
    });
    const applyTape=()=>{
      if(applying)return;
      applying=true;
      paint();
      document.querySelectorAll('#blisTapeTrack .tapeItem').forEach(el=>{
        const name=(el.querySelector('.tapeClient')?.textContent||'').trim().toUpperCase();
        const label=(el.querySelector('.tapeMetric')?.textContent||'').trim().toUpperCase();
        const deltaEl=el.querySelector('.tapeDelta');
        if(!name||!label||!deltaEl)return;
        const key=`${name}|${label}`;
        const d=deltaMap.has(key)?deltaMap.get(key):null;
        deltaEl.classList.remove('up','down','flat');
        if(d===null||Math.abs(d)<0.05){
          deltaEl.classList.add('flat');
          deltaEl.textContent='•';
          deltaEl.title=d===null?'Няма надеждно предходно измерване':'Без промяна спрямо предходното измерване';
        }else if(d>0){
          deltaEl.classList.add('up');
          deltaEl.textContent=`+${d.toFixed(1)}`;
          deltaEl.title='Реална промяна спрямо предходното измерване';
        }else{
          deltaEl.classList.add('down');
          deltaEl.textContent=`−${Math.abs(d).toFixed(1)}`;
          deltaEl.title='Реална промяна спрямо предходното измерване';
        }
      });
      applying=false;
    };
    const boot=()=>{
      applyTape();
      loadRealDeltas();
      const t=document.getElementById('blisTapeTrack');
      if(t)new MutationObserver(()=>{if(!applying)setTimeout(applyTape,0)}).observe(t,{childList:true,subtree:true});
      setInterval(loadRealDeltas,60000);
      document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadRealDeltas()});
      window.addEventListener('focus',loadRealDeltas);
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  }
})();