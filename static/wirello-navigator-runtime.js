/* BLIS Navigator — Wirello Market MASTER DEMO client runtime.
   Wirello is intentionally synthetic, but it uses the REAL Navigator shell,
   routes and renderers. This file only supplies a complete demo data layer. */
(function(){
  'use strict';

  const params=new URLSearchParams(location.search);
  if(params.get('client')!=='wirello')return;

  window.BLIS_INITIAL_CLIENT='wirello';
  document.body.dataset.client='wirello';

  const realFetch=window.fetch.bind(window);
  const now=()=>new Date();
  const isoAgo=min=>new Date(Date.now()-min*60000).toISOString();
  const json=data=>Promise.resolve(new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}}));

  const CLIENT={slug:'wirello',name:'Wirello Market',sector:'Omnichannel retail / FMCG',note:'MASTER DEMO • Synthetic demonstration data'};

  const SOURCES=[
    {key:'official_site',label:'Wirello Market — Website & E-commerce',url:'',method:'synthetic demo source • website, e-commerce, categories and content',reliability:.98},
    {key:'wirello_app',label:'Wirello App',url:'',method:'synthetic demo source • mobile commerce, loyalty and delivery',reliability:.96},
    {key:'facebook',label:'Facebook — Wirello Market',url:'',method:'synthetic demo source • owned social content and public interaction',reliability:.88},
    {key:'instagram',label:'Instagram — Wirello Market',url:'',method:'synthetic demo source • reels, posts, stories and audience activity',reliability:.88},
    {key:'tiktok',label:'TikTok — Wirello Market',url:'',method:'synthetic demo source • short-form video performance and mentions',reliability:.86},
    {key:'youtube',label:'YouTube — Wirello Market',url:'',method:'synthetic demo source • video publishing and audience signals',reliability:.86},
    {key:'linkedin',label:'LinkedIn — Wirello Market',url:'',method:'synthetic demo source • corporate communication and employer visibility',reliability:.86},
    {key:'google_search',label:'Search Visibility Monitor',url:'',method:'synthetic demo source • branded and category discoverability',reliability:.92},
    {key:'search_trends',label:'Search Interest Monitor',url:'',method:'synthetic demo source • relative search-interest movements',reliability:.90},
    {key:'reviews_national',label:'National Review Stream',url:'',method:'synthetic demo source • store reviews and ratings',reliability:.91},
    {key:'reviews_delivery',label:'Delivery Review Stream',url:'',method:'synthetic demo source • delivery ratings and service topics',reliability:.90},
    {key:'media_monitor',label:'Media & News Monitor',url:'',method:'synthetic demo source • media mentions and editorial context',reliability:.90},
    {key:'consumer_forums',label:'Consumer Discussion Monitor',url:'',method:'synthetic demo source • recurring consumer themes and complaints',reliability:.80},
    {key:'wirello_plus',label:'Wirello+ Loyalty Signals',url:'',method:'synthetic demo source • loyalty-program adoption and activity',reliability:.96},
    {key:'wirello_select',label:'Wirello Select Product Signals',url:'',method:'synthetic demo source • private-label interest and product feedback',reliability:.95},
    {key:'cmp_vestamart',label:'VestaMart Monitor',url:'',method:'synthetic competitor source • campaigns, delivery and visibility',reliability:.88},
    {key:'cmp_nordela',label:'Nordela Market Monitor',url:'',method:'synthetic competitor source • promotions, content and reviews',reliability:.88},
    {key:'cmp_urbanbasket',label:'UrbanBasket Monitor',url:'',method:'synthetic competitor source • social and convenience-retail activity',reliability:.86},
    {key:'cmp_fresco',label:'Fresco Point Monitor',url:'',method:'synthetic competitor source • healthy-positioning and category activity',reliability:.86},
    {key:'price_monitor',label:'Retail Price Signal Monitor',url:'',method:'synthetic sector source • category and value-perception movements',reliability:.89},
    {key:'promo_monitor',label:'Promotion Activity Monitor',url:'',method:'synthetic sector source • promotion intensity and timing',reliability:.88},
    {key:'category_monitor',label:'FMCG Category Monitor',url:'',method:'synthetic sector source • category momentum and emerging topics',reliability:.90},
    {key:'delivery_monitor',label:'Last-mile Delivery Monitor',url:'',method:'synthetic sector source • delivery expectations and competitor moves',reliability:.87},
    {key:'source_health',label:'BLIS Source Health',url:'',method:'synthetic operational source • source availability and scan health',reliability:.99}
  ];

  const SIGNALS=[
    {id:'sig-001',time:isoAgo(9),title:'Wirello Select ускорява положителния интерес',description:'Честотата на положителните продуктови споменавания е +31% спрямо предходните 30 дни.',severity:'medium',confidence:94,category:'market',source:'wirello_select',status:'new',evidence:18},
    {id:'sig-002',time:isoAgo(18),title:'Нарастват оплакванията за чакане на касите',description:'Темата се повтаря в 4 магазина и вече преминава прага за репутационен риск.',severity:'high',confidence:91,category:'reputation',source:'reviews_national',status:'new',evidence:27},
    {id:'sig-003',time:isoAgo(37),title:'VestaMart активира безплатна доставка',description:'Конкурентното предложение е засечено едновременно в сайт, social и delivery комуникация.',severity:'high',confidence:97,category:'competition',source:'cmp_vestamart',status:'reviewed',evidence:9},
    {id:'sig-004',time:isoAgo(54),title:'TikTok видео надхвърля обичайния интерес 4.6×',description:'Видео за Wirello Select генерира необичайно висок органичен интерес и позитивни коментари.',severity:'medium',confidence:96,category:'social',source:'tiktok',status:'reviewed',evidence:12},
    {id:'sig-005',time:isoAgo(83),title:'Website latency incident — resolved',description:'Временен ръст на времето за зареждане е засечен и се нормализира след 21 минути.',severity:'low',confidence:99,category:'digital',source:'official_site',status:'resolved',evidence:6},
    {id:'sig-006',time:isoAgo(132),title:'Ръст на branded search interest',description:'Търсенията за Wirello Market и Wirello Select са над 30-дневната историческа база.',severity:'medium',confidence:90,category:'digital',source:'search_trends',status:'reviewed',evidence:14},
    {id:'sig-007',time:isoAgo(188),title:'Ценовата чувствителност става водеща потребителска тема',description:'Темата „цена/стойност“ нараства в review и discussion средата.',severity:'medium',confidence:87,category:'market',source:'consumer_forums',status:'new',evidence:22},
    {id:'sig-008',time:isoAgo(246),title:'Instagram Reels поддържат устойчив ръст',description:'Три последователни reels публикации са над собствената 90-дневна база по взаимодействия.',severity:'low',confidence:92,category:'social',source:'instagram',status:'reviewed',evidence:8},
    {id:'sig-009',time:isoAgo(334),title:'Delivery rating се подобрява',description:'Средната оценка за доставка се повишава след спад в предходния период.',severity:'low',confidence:89,category:'reputation',source:'reviews_delivery',status:'resolved',evidence:11},
    {id:'sig-010',time:isoAgo(421),title:'Fresco Point засилва healthy positioning',description:'Увеличена комуникационна активност около healthy / fresh категории.',severity:'medium',confidence:88,category:'competition',source:'cmp_fresco',status:'reviewed',evidence:7},
    {id:'sig-011',time:isoAgo(603),title:'Wirello+ loyalty adoption расте',description:'Нараства делът на активните взаимодействия с loyalty предложенията.',severity:'low',confidence:95,category:'market',source:'wirello_plus',status:'reviewed',evidence:15},
    {id:'sig-012',time:isoAgo(811),title:'LinkedIn engagement е под собствената база',description:'Корпоративното съдържание има по-ниска взаимодействие спрямо предходните 60 дни.',severity:'medium',confidence:84,category:'social',source:'linkedin',status:'new',evidence:5}
  ];

  const DASHBOARD={
    slug:'wirello',name:'Wirello Market',sector:CLIENT.sector,note:CLIENT.note,
    data_updated:new Date().toISOString(),blis_index:74.6,trend:2.8,
    indices:[
      {key:'presence',label:'Социален индекс',value:74.0,trend:3.1,confidence:92},
      {key:'digital',label:'Дигитална видимост',value:69.0,trend:4.4,confidence:94},
      {key:'reputation',label:'Репутационен индекс',value:82.0,trend:1.7,confidence:91},
      {key:'content',label:'Пазарни сигнали',value:77.0,trend:5.2,confidence:89},
      {key:'competitive',label:'Конкурентна позиция',value:71.0,trend:-1.4,confidence:90}
    ],
    signals:SIGNALS,
    competitors:[
      {name:'Wirello Market',score:74.6,trend:2.8},
      {name:'VestaMart',score:76.4,trend:4.1},
      {name:'Nordela Market',score:72.1,trend:1.2},
      {name:'UrbanBasket',score:68.8,trend:3.8},
      {name:'Fresco Point',score:66.9,trend:2.5}
    ]
  };

  const ACTIVITY=[
    {source:'facebook',metric:'followers',value:128400,time:isoAgo(12)},
    {source:'facebook',metric:'visible_posts_90d',value:94,time:isoAgo(14)},
    {source:'facebook',metric:'engagement_rate',value:3.7,time:isoAgo(15)},
    {source:'instagram',metric:'followers',value:86300,time:isoAgo(16)},
    {source:'instagram',metric:'visible_posts_90d',value:76,time:isoAgo(18)},
    {source:'instagram',metric:'reels_above_baseline',value:3,time:isoAgo(19)},
    {source:'instagram',metric:'engagement_rate',value:5.1,time:isoAgo(20)},
    {source:'tiktok',metric:'followers',value:54200,time:isoAgo(22)},
    {source:'tiktok',metric:'video_interest_multiplier',value:4.6,time:isoAgo(23)},
    {source:'tiktok',metric:'visible_posts_90d',value:41,time:isoAgo(24)},
    {source:'youtube',metric:'followers',value:18700,time:isoAgo(31)},
    {source:'youtube',metric:'visible_posts_90d',value:18,time:isoAgo(32)},
    {source:'linkedin',metric:'followers',value:11900,time:isoAgo(34)},
    {source:'linkedin',metric:'engagement_rate',value:1.4,time:isoAgo(35)},
    {source:'official_site',metric:'website_active',value:1,time:isoAgo(8)},
    {source:'official_site',metric:'ecommerce_active',value:1,time:isoAgo(8)},
    {source:'official_site',metric:'cart_active',value:1,time:isoAgo(8)},
    {source:'official_site',metric:'pricing_visible',value:1,time:isoAgo(8)},
    {source:'official_site',metric:'product_details',value:1,time:isoAgo(8)},
    {source:'official_site',metric:'category_count',value:24,time:isoAgo(9)},
    {source:'official_site',metric:'indexed_pages',value:18640,time:isoAgo(10)},
    {source:'official_site',metric:'core_web_score',value:83,time:isoAgo(10)},
    {source:'official_site',metric:'latency_ms',value:612,time:isoAgo(83)},
    {source:'wirello_app',metric:'app_active',value:1,time:isoAgo(11)},
    {source:'wirello_app',metric:'delivery_active',value:1,time:isoAgo(11)},
    {source:'wirello_plus',metric:'loyalty_active',value:1,time:isoAgo(17)},
    {source:'wirello_plus',metric:'loyalty_growth_pct',value:8.6,time:isoAgo(17)},
    {source:'wirello_select',metric:'private_label_mentions',value:684,time:isoAgo(25)},
    {source:'wirello_select',metric:'positive_share_pct',value:78,time:isoAgo(25)},
    {source:'google_search',metric:'branded_visibility',value:81,time:isoAgo(27)},
    {source:'search_trends',metric:'branded_interest_change_pct',value:18.4,time:isoAgo(28)},
    {source:'media_monitor',metric:'news_mentions_30d',value:46,time:isoAgo(39)},
    {source:'reviews_national',metric:'rating',value:4.42,time:isoAgo(42)},
    {source:'reviews_national',metric:'review_count',value:18470,time:isoAgo(42)},
    {source:'reviews_national',metric:'positive_reviews_pct',value:76,time:isoAgo(42)},
    {source:'reviews_national',metric:'checkout_wait_mentions',value:57,time:isoAgo(44)},
    {source:'reviews_delivery',metric:'rating',value:4.55,time:isoAgo(47)},
    {source:'reviews_delivery',metric:'review_count',value:6290,time:isoAgo(47)},
    {source:'consumer_forums',metric:'price_value_mentions',value:138,time:isoAgo(51)},
    {source:'cmp_vestamart',metric:'free_delivery_active',value:1,time:isoAgo(37)},
    {source:'cmp_vestamart',metric:'campaign_intensity',value:84,time:isoAgo(38)},
    {source:'cmp_nordela',metric:'campaign_intensity',value:67,time:isoAgo(73)},
    {source:'cmp_urbanbasket',metric:'social_activity_index',value:79,time:isoAgo(96)},
    {source:'cmp_fresco',metric:'healthy_positioning_index',value:82,time:isoAgo(118)},
    {source:'price_monitor',metric:'value_sensitivity_index',value:73,time:isoAgo(133)},
    {source:'promo_monitor',metric:'sector_promo_intensity',value:68,time:isoAgo(154)},
    {source:'category_monitor',metric:'healthy_category_momentum',value:76,time:isoAgo(177)},
    {source:'delivery_monitor',metric:'free_delivery_competitors',value:2,time:isoAgo(199)},
    {source:'source_health',metric:'sources_active',value:22,time:isoAgo(6)},
    {source:'source_health',metric:'sources_limited',value:1,time:isoAgo(6)},
    {source:'source_health',metric:'sources_recovered',value:1,time:isoAgo(6)}
  ];

  const historyValues=[
    ['2025-09-20',66.2,65,61,75,67,68],['2025-10-20',67.4,66,62,76,68,69],['2025-11-20',68.1,66,63,77,69,69],
    ['2025-12-20',69.6,67,64,78,70,70],['2026-01-20',68.9,66,64,78,69,69],['2026-02-20',69.8,68,65,79,70,69],
    ['2026-03-20',70.7,69,65,79,72,70],['2026-04-20',71.3,70,66,80,73,70],['2026-05-20',72.2,71,66,80,74,72],
    ['2026-06-20',72.9,72,67,81,75,72],['2026-07-20',71.8,71,66,81,73,72],['2026-08-20',74.6,74,69,82,77,71]
  ];
  const HISTORY=historyValues.map(x=>({created_at:x[0]+'T09:00:00Z',payload:{blis_index:x[1],indices:[{key:'presence',value:x[2]},{key:'digital',value:x[3]},{key:'reputation',value:x[4]},{key:'content',value:x[5]},{key:'competitive',value:x[6]}]}}));

  const QUALITY={configured_sources:SOURCES.length,sources_with_data:22,coverage:92,confidence:93.4,freshness:'updated today',synthetic:true};

  const KEYWORDS=[
    {title:'Wirello Select',keyword:'wirello select',display:'+31%',value:31,explanation:'Положителните продуктови споменавания се ускоряват. Confidence 94%.'},
    {title:'Цена / стойност',keyword:'price value',display:'+22%',value:22,explanation:'Темата расте в review и discussion средата.'},
    {title:'Чакане на касите',keyword:'checkout wait',display:'+41%',value:41,explanation:'Повтаряща се негативна тема в четири физически обекта.'},
    {title:'Безплатна доставка',keyword:'free delivery',display:'Ново',value:18,explanation:'VestaMart активира безплатна доставка и увеличава конкурентния натиск.'},
    {title:'Healthy / fresh',keyword:'healthy fresh',display:'+17%',value:17,explanation:'Устойчиво секторно движение и по-силна активност на Fresco Point.'},
    {title:'Wirello+',keyword:'wirello plus',display:'+8.6%',value:8.6,explanation:'Ръст на loyalty adoption и промоционални взаимодействия.'},
    {title:'TikTok',keyword:'tiktok',display:'4.6×',value:4.6,explanation:'Една публикация е значително над собствената историческа база.'},
    {title:'Branded search',keyword:'wirello market',display:'+18.4%',value:18.4,explanation:'Нараства относителният интерес към марката и private label.'}
  ];

  const REPORTS=[
    {id:'summary',title:'Executive Monthly Brief — Wirello Market',period:'Август 2026'},
    {id:'reputation',title:'Reputation Intelligence — Wirello Market',period:'Август 2026'},
    {id:'competitive',title:'Competitive Intelligence — Wirello Market',period:'Август 2026'},
    {id:'signals',title:'Market Signals Brief — Wirello Market',period:'Август 2026'},
    {id:'digital',title:'Digital Intelligence — Wirello Market',period:'Август 2026'},
    {id:'social',title:'Social Intelligence — Wirello Market',period:'Август 2026'},
    {id:'weekly',title:'Weekly BLIS Pulse — Wirello Market',period:'17–23 август 2026'}
  ];

  const EXPORTS=[
    {id:'exp-01',title:'Weekly BLIS Pulse',format:'PDF',created_at:isoAgo(1440)},
    {id:'exp-02',title:'Competitive snapshot',format:'CSV',created_at:isoAgo(2880)},
    {id:'exp-03',title:'Reputation evidence pack',format:'HTML',created_at:isoAgo(4320)}
  ];

  function clientList(base){
    const others=Array.isArray(base)?base.filter(x=>x&&x.slug!=='wirello'):[];
    return [CLIENT,...others];
  }

  window.fetch=function(input,init){
    let u;
    try{u=new URL(typeof input==='string'?input:input.url,location.origin)}catch(e){return realFetch(input,init)}
    const p=u.pathname;
    if(p==='/api/clients'){
      return realFetch(input,init).then(async r=>{try{return new Response(JSON.stringify(clientList(await r.clone().json())),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}catch(e){return new Response(JSON.stringify(clientList([])),{status:200,headers:{'Content-Type':'application/json; charset=utf-8'}})}}).catch(()=>json(clientList([])));
    }
    if(!p.startsWith('/api/clients/wirello/'))return realFetch(input,init);
    const endpoint=p.split('/').pop();
    if(endpoint==='dashboard')return json({...DASHBOARD,data_updated:new Date().toISOString()});
    if(endpoint==='sources')return json(SOURCES);
    if(endpoint==='history')return json(HISTORY);
    if(endpoint==='data-quality')return json(QUALITY);
    if(endpoint==='activity')return json(ACTIVITY);
    if(endpoint==='keywords')return json(KEYWORDS);
    if(endpoint==='alerts')return json(SIGNALS);
    if(endpoint==='reports')return json(REPORTS);
    if(endpoint==='exports')return json(EXPORTS);
    if(endpoint==='refresh')return json({ok:true,engine:{version:'wirello-demo',running:false,last_run:new Date().toISOString(),successful:22,failed:2},dashboard:{...DASHBOARD,data_updated:new Date().toISOString()}});
    return json([]);
  };

  const dossierData={
    accent:'#0f7568',soft:'#edf8f5',mono:'WM',
    descriptor:'Фиктивна национална omnichannel retail мрежа • MASTER DEMO',
    summary:'Wirello Market е изцяло синтетичен демонстрационен клиент, създаден да показва реалната функционалност на BLIS Navigator при богата историческа база. Профилът включва физически магазини, e-commerce, mobile app, delivery, loyalty, private label, social, reputation, competitive и market intelligence.',
    facts:[['38','Физически магазина'],['7','Големи града'],['Wirello+','Loyalty програма'],['Wirello Select','Private label']],
    portfolio:['Храни и напитки','Fresh & ready-to-eat','Home & living','Beauty & personal care','Pet care','Seasonal','Wirello Select'],
    assets:['38 физически магазина','E-commerce платформа','Wirello App','Wirello+ loyalty','Home delivery','Facebook / Instagram / TikTok / YouTube / LinkedIn'],
    history:['2023 · национално omnichannel разширяване','2024 · launch на Wirello+','2025 · разширяване на home delivery','2026 · launch на Wirello Select'],
    links:[],
    notes:['Всички стойности, конкуренти, публикации, ревюта и събития в този профил са synthetic demonstration data.','Демото използва същите Navigator модули и навигация като реалните клиентски профили.','Основният сценарий свързва сигнал → интерпретация → evidence → история → индекс → конкурентен контекст.']
  };

  function ensureSwitcherOption(){
    const menu=document.querySelector('.client-switch-menu');
    if(menu&&!menu.querySelector('[data-client-key="wirello"]')){
      const b=document.createElement('button');
      b.type='button';b.className='client-option';b.dataset.clientKey='wirello';b.setAttribute('role','option');b.setAttribute('aria-selected','false');
      b.innerHTML='<span class="client-option-mark" style="background:#0f7568">WM</span><span><b>Wirello Market</b><small>Omnichannel retail • MASTER DEMO</small></span><span class="client-option-check"></span>';
      menu.insertBefore(b,menu.firstChild);
    }
  }

  function installChrome(){
    document.body.dataset.client='wirello';
    document.documentElement.style.setProperty('--client','#0f7568');
    document.documentElement.style.setProperty('--clientSoft','#edf8f5');
    const status=document.querySelector('.client-brand-status');if(status)status.textContent='MASTER DEMO • synthetic data';
    const name=document.querySelector('.client-brand-name');if(name)name.textContent='Wirello Market';
    const type=document.querySelector('.client-brand-type');if(type)type.textContent='Omnichannel retail';
    const mark=document.querySelector('.client-brand-mark');if(mark)mark.textContent='WM';
    const title=document.querySelector('.topbar .title h1');
    if(title&&!/Wirello/.test(title.textContent||'')){const h=new Date().getHours();const g=h>=5&&h<12?'Добро утро':h>=12&&h<18?'Добър ден':'Добър вечер';title.textContent=g+', Wirello Market!'}
  }

  function installTheme(){
    if(document.getElementById('wirello-runtime-theme'))return;
    const st=document.createElement('style');st.id='wirello-runtime-theme';
    st.textContent='body[data-client="wirello"]{--nav-blue:#0f7568;--client:#0f7568;--clientSoft:#edf8f5}body[data-client="wirello"] .client-option[data-client-key="wirello"]{border-color:#a8d8ce}body[data-client="wirello"] .topbar{background-color:#edf8f5;background-size:cover!important;background-position:center center!important}body[data-client="wirello"] .topbar .title h1{color:#0b3150;text-shadow:0 1px 10px rgba(255,255,255,.9)}body[data-client="wirello"] .client-brand-status{color:#0f7568;font-weight:700}';
    document.head.appendChild(st);
  }

  function installHero(){
    const raw='https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/296a568485cba3f4d2c135d2f642948864ccd5c0/static/wirello-header.b64';
    realFetch(raw,{cache:'force-cache'}).then(r=>r.ok?r.text():'').then(b64=>{
      b64=(b64||'').trim();if(!b64)return;
      const hero='linear-gradient(90deg,rgba(255,255,255,.95) 0%,rgba(255,255,255,.88) 25%,rgba(255,255,255,.44) 47%,rgba(255,255,255,.05) 68%),url("data:image/webp;base64,'+b64+'")';
      const apply=()=>{const top=document.querySelector('.topbar');if(top){top.style.setProperty('background-image',hero,'important');top.style.setProperty('background-size','cover','important');top.style.setProperty('background-position','center center','important')}};
      apply();let n=0;const t=setInterval(()=>{apply();if(++n>16)clearInterval(t)},250);
    }).catch(()=>{});
  }

  function installDossier(){
    try{if(typeof window.dossier==='function')window.dossier=()=>dossierData}catch(e){}
  }

  function installDownload(){
    try{
      window.download=function(type,format){
        const labels={summary:'Executive Monthly Brief',reputation:'Reputation Intelligence',competitive:'Competitive Intelligence',signals:'Market Signals Brief',digital:'Digital Intelligence',social:'Social Intelligence',weekly:'Weekly BLIS Pulse',keywords:'Market Signals Export'};
        const title=(labels[type]||'BLIS Navigator Export')+' — Wirello Market';
        const body='WIRELLO MARKET — MASTER DEMO\nSynthetic demonstration data\n\n'+title+'\nPeriod: August 2026\nBLIS Index: 74.6\nReputation: 82\nDigital Visibility: 69\nMarket Signals: 77\nCompetitive Position: 71\n\nKey signals:\n- Wirello Select positive momentum\n- Checkout waiting-time reputation risk\n- VestaMart free-delivery move\n- TikTok overperformance\n- Website latency incident resolved\n';
        const mime=format==='csv'?'text/csv;charset=utf-8':'text/plain;charset=utf-8';
        const blob=new Blob([body],{type:mime});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='Wirello_Market_'+String(type||'export')+'.'+(format==='csv'?'csv':'txt');document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
      };
    }catch(e){}
  }

  ensureSwitcherOption();
  installTheme();
  installChrome();
  installHero();

  document.addEventListener('DOMContentLoaded',()=>{
    ensureSwitcherOption();installTheme();installDossier();installDownload();installChrome();installHero();
    let n=0;const t=setInterval(()=>{installDossier();installDownload();installChrome();ensureSwitcherOption();if(++n>20)clearInterval(t)},200);
  });
})();