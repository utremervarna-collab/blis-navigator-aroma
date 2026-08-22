/* BLIS Navigator — Wirello Market demo polish v2.
   Keeps the canonical Navigator renderers untouched and only enriches the synthetic demo data. */
(function(){
  'use strict';
  const q=new URLSearchParams(location.search);
  if(q.get('client')!=='wirello' && window.BLIS_CLIENT_SCOPE!=='wirello' && window.BLIS_INITIAL_CLIENT!=='wirello') return;

  const upstream=window.fetch.bind(window);
  const isoAgo=min=>new Date(Date.now()-min*60000).toISOString();
  const clamp=v=>Math.max(0,Math.min(100,v));
  const round1=v=>Math.round(v*10)/10;
  const json=(data,base)=>new Response(JSON.stringify(data),{
    status:base?.status||200,
    statusText:base?.statusText||'OK',
    headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}
  });

  const CLIENT={
    slug:'wirello',name:'Wirello Market',sector:'Омниканален ритейл / FMCG',
    note:'ДЕМО ПРОФИЛ • Изцяло синтетични демонстрационни данни'
  };

  const SOURCES=[
    {key:'official_site',label:'Wirello Market — официален сайт и e-commerce',method:'Синтетичен демо източник • сайт, категории, продуктови страници и електронна търговия',reliability:.98},
    {key:'wirello_app',label:'Wirello App',method:'Синтетичен демо източник • мобилна търговия, доставка и потребителска активност',reliability:.96},
    {key:'facebook',label:'Facebook — Wirello Market',method:'Синтетичен демо източник • публикации, аудитория и публични взаимодействия',reliability:.91},
    {key:'instagram',label:'Instagram — Wirello Market',method:'Синтетичен демо източник • публикации, Reels, Stories и взаимодействия',reliability:.91},
    {key:'tiktok',label:'TikTok — Wirello Market',method:'Синтетичен демо източник • кратко видео, органичен интерес и споменавания',reliability:.88},
    {key:'youtube',label:'YouTube — Wirello Market',method:'Синтетичен демо източник • видео съдържание и видима активност',reliability:.88},
    {key:'linkedin',label:'LinkedIn — Wirello Market',method:'Синтетичен демо източник • корпоративна и работодателска комуникация',reliability:.87},
    {key:'google_search',label:'Мониторинг на търсенето',method:'Синтетичен демо източник • брандова и категорийна откриваемост',reliability:.94},
    {key:'search_trends',label:'Динамика на бранд интереса',method:'Синтетичен демо източник • относителни промени в интереса към марката и категориите',reliability:.92},
    {key:'reviews_national',label:'Национален поток от отзиви',method:'Синтетичен демо източник • оценки и теми от физическите магазини',reliability:.93},
    {key:'reviews_delivery',label:'Отзиви за онлайн доставка',method:'Синтетичен демо източник • оценки, време за доставка и обслужване',reliability:.92},
    {key:'media_monitor',label:'Медии и новини',method:'Синтетичен демо източник • публикации, контекст и честота на споменаване',reliability:.92},
    {key:'consumer_forums',label:'Потребителски дискусии',method:'Синтетичен демо източник • повтарящи се теми, въпроси и оплаквания',reliability:.84},
    {key:'wirello_plus',label:'Wirello+ — сигнали за лоялност',method:'Синтетичен демо източник • активност в програмата за лоялност',reliability:.97},
    {key:'wirello_select',label:'Wirello Select — продуктови сигнали',method:'Синтетичен демо източник • интерес към собствената марка и продуктова обратна връзка',reliability:.96},
    {key:'cmp_vestamart',label:'VestaMart — конкурентен мониторинг',method:'Синтетичен конкурентен източник • кампании, доставка, видимост и репутация',reliability:.90},
    {key:'cmp_nordela',label:'Nordela Market — конкурентен мониторинг',method:'Синтетичен конкурентен източник • промоции, съдържание и отзиви',reliability:.90},
    {key:'cmp_urbanbasket',label:'UrbanBasket — конкурентен мониторинг',method:'Синтетичен конкурентен източник • социална активност и convenience предложения',reliability:.89},
    {key:'cmp_fresco',label:'Fresco Point — конкурентен мониторинг',method:'Синтетичен конкурентен източник • fresh/healthy позициониране и категорийна активност',reliability:.89},
    {key:'price_monitor',label:'Ценови сигнали в ритейл сектора',method:'Синтетичен секторен източник • ценова чувствителност и възприятие за стойност',reliability:.91},
    {key:'promo_monitor',label:'Промоционална активност в сектора',method:'Синтетичен секторен източник • интензитет и синхрон на промоционалните периоди',reliability:.90},
    {key:'category_monitor',label:'FMCG категориен мониторинг',method:'Синтетичен секторен източник • динамика на категории и възникващи теми',reliability:.92},
    {key:'delivery_monitor',label:'Последна миля и доставка',method:'Синтетичен секторен източник • очаквания към доставката и конкурентни промени',reliability:.90},
    {key:'source_health',label:'BLIS Source Health',method:'Оперативен демо източник • работоспособност и свежест на наблюдаваните потоци',reliability:.99}
  ];

  const SIGNALS=[
    {id:'sig-001',time:isoAgo(7),title:'Wirello Select ускорява положителния интерес',description:'Положителните продуктови споменавания са +31% спрямо предходните 30 дни. Ръстът се вижда едновременно в отзиви, социални канали и търсене.',severity:'medium',priority:'Възможност',confidence:94,category:'market',source:'wirello_select',status:'new',evidence:28},
    {id:'sig-002',time:isoAgo(16),title:'Нарастват оплакванията за чакане на касите',description:'Темата се повтаря в четири магазина и преминава прага за репутационно наблюдение. Делът на негативните споменавания по темата е +22% за седмица.',severity:'high',priority:'Висок',confidence:93,category:'reputation',source:'reviews_national',status:'new',evidence:37},
    {id:'sig-003',time:isoAgo(29),title:'VestaMart активира безплатна доставка над 45 €',description:'Предложението е засечено едновременно в сайта, социалните канали и комуникацията за доставка. Очакван натиск върху ценовото възприятие в онлайн канала.',severity:'high',priority:'Висок',confidence:97,category:'competition',source:'cmp_vestamart',status:'reviewed',evidence:14},
    {id:'sig-004',time:isoAgo(48),title:'TikTok видео е 4,6× над собствената база',description:'Видео за Wirello Select генерира необичайно висок органичен интерес и положителни коментари без платено усилване.',severity:'medium',priority:'Възможност',confidence:96,category:'social',source:'tiktok',status:'reviewed',evidence:19},
    {id:'sig-005',time:isoAgo(79),title:'Временен технически спад на сайта е отстранен',description:'Засечено е по-високо време за зареждане, което се нормализира след 21 минути. Няма продължаващ технически риск.',severity:'low',priority:'Наблюдение',confidence:99,category:'digital',source:'official_site',status:'resolved',evidence:8},
    {id:'sig-006',time:isoAgo(128),title:'Брандовите търсения нарастват устойчиво',description:'Търсенията за Wirello Market и Wirello Select са +18,4% спрямо 30-дневната база.',severity:'medium',priority:'Възможност',confidence:92,category:'digital',source:'search_trends',status:'reviewed',evidence:21},
    {id:'sig-007',time:isoAgo(186),title:'„Цена/стойност“ става водеща потребителска тема',description:'Темата увеличава дела си в отзивите и потребителските дискусии. Сигналът е секторен, не само специфичен за Wirello.',severity:'medium',priority:'Среден',confidence:89,category:'market',source:'consumer_forums',status:'new',evidence:31},
    {id:'sig-008',time:isoAgo(242),title:'Instagram Reels поддържат ръст трета седмица',description:'Три последователни Reels публикации са над 90-дневната собствена база по взаимодействия.',severity:'low',priority:'Възможност',confidence:93,category:'social',source:'instagram',status:'reviewed',evidence:13},
    {id:'sig-009',time:isoAgo(329),title:'Оценката за онлайн доставка се подобрява',description:'Средната оценка достига 4,55/5 след спад в предходния период. Оплакванията за закъснение намаляват с 12%.',severity:'low',priority:'Положителен',confidence:91,category:'reputation',source:'reviews_delivery',status:'resolved',evidence:24},
    {id:'sig-010',time:isoAgo(417),title:'Fresco Point засилва fresh/healthy позиционирането',description:'Нараства честотата на комуникацията около свежи, функционални и ready-to-eat категории.',severity:'medium',priority:'Среден',confidence:90,category:'competition',source:'cmp_fresco',status:'reviewed',evidence:12},
    {id:'sig-011',time:isoAgo(597),title:'Wirello+ увеличава активните взаимодействия',description:'Активността в програмата за лоялност е +8,6% спрямо предходния 30-дневен период.',severity:'low',priority:'Положителен',confidence:96,category:'market',source:'wirello_plus',status:'reviewed',evidence:26},
    {id:'sig-012',time:isoAgo(806),title:'LinkedIn е под собствената 60-дневна база',description:'Корпоративното съдържание има по-нисък коефициент на взаимодействие, без промяна в общия ръст на аудиторията.',severity:'medium',priority:'Среден',confidence:86,category:'social',source:'linkedin',status:'new',evidence:9}
  ];

  const COMPETITORS=[
    {name:'VestaMart',score:76.4,trend:1.9,website:1,ecommerce:1,pricing:1,social:1,categories:94,content:86,news:78,rating:4.31,ratings:21340,activity:84,visibility:76,search:85},
    {name:'Wirello Market',score:74.6,trend:2.8,website:1,ecommerce:1,pricing:1,social:1,categories:92,content:83,news:76,rating:4.42,ratings:18470,activity:79,visibility:69,search:81},
    {name:'Nordela Market',score:72.1,trend:1.2,website:1,ecommerce:1,pricing:1,social:1,categories:88,content:75,news:68,rating:4.28,ratings:14320,activity:71,visibility:72,search:74},
    {name:'UrbanBasket',score:68.8,trend:3.8,website:1,ecommerce:1,pricing:1,social:1,categories:71,content:88,news:54,rating:4.47,ratings:8240,activity:82,visibility:64,search:68},
    {name:'Fresco Point',score:66.9,trend:2.5,website:1,ecommerce:0,pricing:1,social:1,categories:76,content:80,news:51,rating:4.51,ratings:6590,activity:74,visibility:61,search:65}
  ];

  function wave(day,period,amp,phase=0){return Math.sin((day+phase)/period)*amp}
  function makeHistory(days=400){
    const out=[];
    const today=new Date(); today.setUTCHours(9,0,0,0);
    for(let back=days-1;back>=0;back--){
      const d=new Date(today.getTime()-back*86400000);
      const p=(days-1-back)/(days-1);
      const n=days-1-back;
      const dip1=Math.exp(-Math.pow((n-days*.61)/(days*.028),2))*2.8;
      const dip2=Math.exp(-Math.pow((n-days*.86)/(days*.018),2))*1.7;
      let blis=67.2+7.4*p+wave(n,8.7,1.05)+wave(n,28.0,.55)-dip1-dip2;
      let presence=65.0+9.0*p+wave(n,7.4,1.15)+wave(n,24,.45)-dip1*.35;
      let digital=61.0+8.0*p+wave(n,10.5,.95,3)+wave(n,31,.4)-dip2*.5;
      let reputation=76.0+6.0*p+wave(n,13,.75,2)-dip1*.55;
      let content=68.0+9.0*p+wave(n,6.8,1.35,1)+wave(n,22,.55)-dip2*.25;
      let competitive=69.0+2.0*p+wave(n,15,.8,4)-dip1*.3;
      if(back===0){blis=74.6;presence=74.0;digital=69.0;reputation=82.0;content=77.0;competitive=71.0}
      const own=round1(blis), vesta=round1(clamp(73.2+3.2*p+wave(n,11,.85,2))), nord=round1(clamp(69.7+2.4*p+wave(n,14,.65,1))), urban=round1(clamp(64.4+4.4*p+wave(n,9,.9,5))), fresco=round1(clamp(63.8+3.1*p+wave(n,17,.7,2)));
      out.push({created_at:d.toISOString(),payload:{
        blis_index:round1(clamp(blis)),
        indices:[
          {key:'presence',value:round1(clamp(presence))},
          {key:'digital',value:round1(clamp(digital))},
          {key:'reputation',value:round1(clamp(reputation))},
          {key:'content',value:round1(clamp(content))},
          {key:'competitive',value:round1(clamp(competitive))}
        ],
        competitors:[
          {name:'Wirello Market',score:back===0?74.6:own},
          {name:'VestaMart',score:back===0?76.4:vesta},
          {name:'Nordela Market',score:back===0?72.1:nord},
          {name:'UrbanBasket',score:back===0?68.8:urban},
          {name:'Fresco Point',score:back===0?66.9:fresco}
        ]
      }});
    }
    return out;
  }
  const HISTORY=makeHistory();

  const KEYWORDS=[
    {title:'Wirello Select',keyword:'wirello select',display:'+31%',value:31,explanation:'Положителните продуктови споменавания на собствената марка са +31% спрямо предходните 30 дни. Надеждност на сигнала: 94%.'},
    {title:'Цена и стойност',keyword:'цена стойност',display:'+23%',value:23,explanation:'Темата увеличава дела си в отзивите и потребителските дискусии и вече е водещ секторен сигнал.'},
    {title:'Брандово търсене',keyword:'wirello market',display:'+18,4%',value:18.4,explanation:'Относителният интерес към Wirello Market и Wirello Select се увеличава спрямо 30-дневната база.'},
    {title:'Wirello+',keyword:'wirello plus',display:'+8,6%',value:8.6,explanation:'Нараства активността в програмата за лоялност и взаимодействието с персонализирани предложения.'},
    {title:'TikTok органичен интерес',keyword:'tiktok',display:'4,6×',value:4.6,explanation:'Една публикация е 4,6 пъти над собствената 90-дневна база по органичен интерес.'},
    {title:'Онлайн доставка',keyword:'delivery',display:'-12%',value:-12,explanation:'Споменаванията за закъснение при доставка намаляват с 12% след подобрение в последните две седмици.'}
  ];

  const REPORTS=[
    {id:'summary',title:'Месечен аналитичен обзор — Wirello Market',period:'Август 2026'},
    {id:'reputation',title:'Репутационен анализ — Wirello Market',period:'Август 2026'},
    {id:'competitive',title:'Конкурентна среда — Wirello Market',period:'Август 2026'},
    {id:'signals',title:'Пазарни сигнали — Wirello Market',period:'Август 2026'},
    {id:'digital',title:'Дигитална видимост — Wirello Market',period:'Август 2026'},
    {id:'social',title:'Социални сигнали — Wirello Market',period:'Август 2026'},
    {id:'weekly',title:'Седмичен BLIS Pulse — Wirello Market',period:'17–23 август 2026'}
  ];
  const EXPORTS=[
    {id:'exp-01',title:'Седмичен BLIS Pulse',format:'PDF',created_at:isoAgo(1440)},
    {id:'exp-02',title:'Конкурентна среда',format:'PDF',created_at:isoAgo(2940)},
    {id:'exp-03',title:'Пазарни сигнали',format:'CSV',created_at:isoAgo(4320)},
    {id:'exp-04',title:'Дигитална видимост',format:'PDF',created_at:isoAgo(10080)}
  ];

  const EXTRA_ACTIVITY=[
    {source:'source_health',metric:'source_health_pct',value:99.3,time:isoAgo(5)},
    {source:'official_site',metric:'indexed_pages',value:18640,time:isoAgo(9)},
    {source:'official_site',metric:'core_web_score',value:83,time:isoAgo(10)},
    {source:'wirello_plus',metric:'loyalty_growth_pct',value:8.6,time:isoAgo(17)},
    {source:'wirello_select',metric:'private_label_mentions',value:684,time:isoAgo(25)},
    {source:'wirello_select',metric:'positive_share_pct',value:78,time:isoAgo(25)},
    {source:'google_search',metric:'branded_visibility',value:81,time:isoAgo(27)},
    {source:'search_trends',metric:'branded_interest_change_pct',value:18.4,time:isoAgo(28)},
    {source:'reviews_national',metric:'positive_reviews_pct',value:76,time:isoAgo(42)},
    {source:'reviews_national',metric:'checkout_wait_mentions',value:57,time:isoAgo(44)},
    {source:'consumer_forums',metric:'price_value_mentions',value:138,time:isoAgo(51)},
    {source:'cmp_vestamart',metric:'campaign_intensity',value:84,time:isoAgo(30)},
    {source:'cmp_nordela',metric:'campaign_intensity',value:67,time:isoAgo(73)},
    {source:'cmp_urbanbasket',metric:'social_activity_index',value:79,time:isoAgo(96)},
    {source:'cmp_fresco',metric:'healthy_positioning_index',value:82,time:isoAgo(118)},
    {source:'price_monitor',metric:'value_sensitivity_index',value:73,time:isoAgo(133)},
    {source:'promo_monitor',metric:'sector_promo_intensity',value:81,time:isoAgo(154)},
    {source:'category_monitor',metric:'category_momentum',value:76,time:isoAgo(172)},
    {source:'delivery_monitor',metric:'delivery_expectation_index',value:79,time:isoAgo(191)}
  ];

  const METRIC_LABELS={
    engagement_rate:'Коефициент на взаимодействие',reels_above_baseline:'Reels над историческата база',
    video_interest_multiplier:'Множител на органичния интерес',indexed_pages:'Индексирани страници',
    core_web_score:'Техническо качество на сайта',latency_ms:'Време за зареждане',app_active:'Мобилно приложение',
    delivery_active:'Онлайн доставка',loyalty_active:'Програма за лоялност',loyalty_growth_pct:'Ръст на активността в Wirello+',
    private_label_mentions:'Споменавания на Wirello Select',positive_share_pct:'Дял положителни споменавания',
    branded_visibility:'Видимост при бранд търсения',branded_interest_change_pct:'Промяна в бранд търсенията',
    positive_reviews_pct:'Дял положителни отзиви',checkout_wait_mentions:'Споменавания за чакане на каси',
    price_value_mentions:'Споменавания „цена/стойност“',free_delivery_active:'Безплатна доставка',
    campaign_intensity:'Интензитет на кампаниите',social_activity_index:'Активност в социалните канали',
    healthy_positioning_index:'Fresh/healthy позициониране',value_sensitivity_index:'Ценова чувствителност',
    sector_promo_intensity:'Промоционална активност в сектора',category_momentum:'Динамика на категориите',
    delivery_expectation_index:'Очаквания към доставката',source_health_pct:'Работоспособност на източниците'
  };

  function polishedDashboard(base){
    return Object.assign({},base||{},CLIENT,{
      data_updated:new Date().toISOString(),blis_index:74.6,trend:2.8,
      indices:[
        {key:'presence',label:'Социален индекс',value:74.0,trend:3.1,confidence:94},
        {key:'digital',label:'Дигитална видимост',value:69.0,trend:4.4,confidence:95},
        {key:'reputation',label:'Репутационен индекс',value:82.0,trend:1.7,confidence:93},
        {key:'content',label:'Пазарни сигнали',value:77.0,trend:5.2,confidence:91},
        {key:'competitive',label:'Конкурентна позиция',value:71.0,trend:-1.4,confidence:92}
      ],
      signals:SIGNALS,competitors:COMPETITORS
    });
  }

  window.fetch=async function(input,init){
    let u;
    try{u=new URL(typeof input==='string'?input:input.url,location.origin)}catch(_){return upstream(input,init)}
    const p=u.pathname;
    const base=await upstream(input,init);
    if(p==='/api/clients'){
      try{
        const rows=await base.clone().json();
        if(Array.isArray(rows)) return json(rows.map(x=>x?.slug==='wirello'?Object.assign({},x,CLIENT):x),base);
      }catch(_){ }
      return base;
    }
    if(!p.startsWith('/api/clients/wirello/')) return base;
    const endpoint=p.split('/').pop();
    let data=null;
    try{data=await base.clone().json()}catch(_){data=null}
    if(endpoint==='dashboard') return json(polishedDashboard(data),base);
    if(endpoint==='sources') return json(SOURCES,base);
    if(endpoint==='history') return json(HISTORY,base);
    if(endpoint==='data-quality') return json({configured_sources:SOURCES.length,sources_with_data:24,coverage:96,confidence:94.2,freshness:'обновено днес',synthetic:true},base);
    if(endpoint==='activity'){
      const rows=Array.isArray(data)?data.slice():[];
      const seen=new Set(rows.map(x=>`${x.source}|${x.metric}`));
      EXTRA_ACTIVITY.forEach(x=>{if(!seen.has(`${x.source}|${x.metric}`)) rows.push(x)});
      rows.sort((a,b)=>new Date(b.time||0)-new Date(a.time||0));
      return json(rows,base);
    }
    if(endpoint==='keywords') return json(KEYWORDS,base);
    if(endpoint==='alerts') return json(SIGNALS,base);
    if(endpoint==='reports') return json(REPORTS,base);
    if(endpoint==='exports') return json(EXPORTS,base);
    if(endpoint==='refresh') return json({ok:true,engine:{version:'wirello-demo-v2',running:true,last_run:new Date().toISOString(),next_run:new Date(Date.now()+86400000).toISOString(),successful:24,failed:0},dashboard:polishedDashboard(data?.dashboard)},base);
    return base;
  };

  function patchMetricLabels(){
    try{
      if(typeof metricName==='function' && !metricName.__wirelloPolished){
        const original=metricName;
        const wrapped=function(k){return METRIC_LABELS[k]||original(k)};
        wrapped.__wirelloPolished=true;
        metricName=wrapped;
      }
    }catch(_){ }
  }

  function patchChrome(){
    try{
      document.body.dataset.client='wirello';
      document.documentElement.style.setProperty('--client','#0f7568');
      document.documentElement.style.setProperty('--clientSoft','#edf8f5');
      const h=document.querySelector('.topbar .title h1'); if(h)h.textContent='Wirello Market';
      const name=document.querySelector('.client-brand-name'); if(name)name.textContent='Wirello Market';
      const type=document.querySelector('.client-brand-type'); if(type)type.textContent='Омниканален ритейл / FMCG';
      const status=document.querySelector('.client-brand-status'); if(status)status.textContent='ДЕМО ПРОФИЛ • синтетични данни';
      const labels={overview:'Общ преглед',live:'Live Monitoring',social:'Сигнали',digital:'Видимост',reputation:'Репутация',market:'Нагласи',competition:'Конкуренти',reports:'Месечни доклади',history:'История',profile:'Клиентски профил',settings:'Настройки',help:'Помощ'};
      document.querySelectorAll('#nav button[data-page]').forEach(b=>{const t=b.querySelector('.navtxt');if(t&&labels[b.dataset.page])t.textContent=labels[b.dataset.page]});
      patchMetricLabels();
    }catch(_){ }
  }

  document.addEventListener('DOMContentLoaded',()=>{
    patchChrome();
    let n=0;const t=setInterval(()=>{patchChrome();if(++n>=12)clearInterval(t)},250);
  });
  window.addEventListener('blis:clientdata',patchChrome);
  window.addEventListener('blis:periodchange',patchChrome);
})();
