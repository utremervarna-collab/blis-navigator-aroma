/* BLIS Navigator — runtime compatibility bridge.
   Keeps app.js as the data/API loader while preventing its legacy renderer
   from writing into the current Navigator DOM. Wirello MASTER DEMO is hydrated
   here as an authoritative synthetic client so no module can fall back to zero. */
(function(){
  'use strict';
  const clients=new Set(['wirello','aroma','bolyarka','astor-garden','varna-towers']);
  const initialClient=()=>{
    try{
      const q=new URLSearchParams(location.search).get('client');
      if(q&&clients.has(q))return q;
    }catch(e){}
    return window.BLIS_INITIAL_CLIENT&&clients.has(window.BLIS_INITIAL_CLIENT)?window.BLIS_INITIAL_CLIENT:null;
  };

  const isoAgo=min=>new Date(Date.now()-min*60000).toISOString();
  const wirelloSignals=[
    {id:'sig-001',time:isoAgo(9),title:'Wirello Select ускорява положителния интерес',description:'Положителните продуктови споменавания са +31% спрямо предходния период.',severity:'medium',confidence:94,category:'market',source:'wirello_select',status:'new',evidence:18},
    {id:'sig-002',time:isoAgo(18),title:'Нарастват оплакванията за чакане на касите',description:'Темата се повтаря в четири магазина и преминава прага за репутационен риск.',severity:'high',confidence:91,category:'reputation',source:'reviews_national',status:'new',evidence:27},
    {id:'sig-003',time:isoAgo(37),title:'VestaMart активира безплатна доставка',description:'Конкурентното предложение е засечено едновременно в сайт, social и delivery комуникация.',severity:'high',confidence:97,category:'competition',source:'cmp_vestamart',status:'reviewed',evidence:9},
    {id:'sig-004',time:isoAgo(54),title:'TikTok видео е 4.6× над обичайния интерес',description:'Видео за Wirello Select генерира необичайно висок органичен интерес и позитивни коментари.',severity:'medium',confidence:96,category:'social',source:'tiktok',status:'reviewed',evidence:12},
    {id:'sig-005',time:isoAgo(83),title:'Дигиталната скорост се нормализира',description:'Временният ръст на времето за зареждане е приключил след 21 минути.',severity:'low',confidence:99,category:'digital',source:'official_site',status:'resolved',evidence:6},
    {id:'sig-006',time:isoAgo(132),title:'Ръст на брандовите търсения',description:'Търсенията за Wirello Market и Wirello Select са над 30-дневната историческа база.',severity:'medium',confidence:90,category:'digital',source:'search_trends',status:'reviewed',evidence:14}
  ];

  const wirelloSources=[
    {key:'official_site',label:'Wirello Market — Website & E-commerce',method:'synthetic demo source • website, e-commerce and content',reliability:.98},
    {key:'wirello_app',label:'Wirello App',method:'synthetic demo source • mobile commerce, loyalty and delivery',reliability:.96},
    {key:'facebook',label:'Facebook — Wirello Market',method:'synthetic demo source • owned social content',reliability:.88},
    {key:'instagram',label:'Instagram — Wirello Market',method:'synthetic demo source • reels and audience activity',reliability:.88},
    {key:'tiktok',label:'TikTok — Wirello Market',method:'synthetic demo source • short-form video performance',reliability:.86},
    {key:'youtube',label:'YouTube — Wirello Market',method:'synthetic demo source • video publishing',reliability:.86},
    {key:'linkedin',label:'LinkedIn — Wirello Market',method:'synthetic demo source • corporate communication',reliability:.86},
    {key:'google_search',label:'Search Visibility Monitor',method:'synthetic demo source • branded discoverability',reliability:.92},
    {key:'search_trends',label:'Search Interest Monitor',method:'synthetic demo source • relative search interest',reliability:.90},
    {key:'reviews_national',label:'National Review Stream',method:'synthetic demo source • store reviews and ratings',reliability:.91},
    {key:'reviews_delivery',label:'Delivery Review Stream',method:'synthetic demo source • delivery ratings',reliability:.90},
    {key:'media_monitor',label:'Media & News Monitor',method:'synthetic demo source • media mentions',reliability:.90},
    {key:'wirello_plus',label:'Wirello+ Loyalty Signals',method:'synthetic demo source • loyalty adoption',reliability:.96},
    {key:'wirello_select',label:'Wirello Select Product Signals',method:'synthetic demo source • private-label interest',reliability:.95},
    {key:'cmp_vestamart',label:'VestaMart Monitor',method:'synthetic competitor source • campaigns and delivery',reliability:.88},
    {key:'cmp_nordela',label:'Nordela Market Monitor',method:'synthetic competitor source • promotions and reviews',reliability:.88},
    {key:'cmp_urbanbasket',label:'UrbanBasket Monitor',method:'synthetic competitor source • social activity',reliability:.86},
    {key:'cmp_fresco',label:'Fresco Point Monitor',method:'synthetic competitor source • category activity',reliability:.86}
  ];

  const wirelloActivity=[
    {source:'source_health',metric:'sources_active',value:18,time:isoAgo(6)},
    {source:'official_site',metric:'website_active',value:1,time:isoAgo(8)},
    {source:'official_site',metric:'ecommerce_active',value:1,time:isoAgo(8)},
    {source:'official_site',metric:'cart_active',value:1,time:isoAgo(8)},
    {source:'official_site',metric:'pricing_visible',value:1,time:isoAgo(8)},
    {source:'official_site',metric:'category_count',value:24,time:isoAgo(9)},
    {source:'facebook',metric:'followers',value:128400,time:isoAgo(12)},
    {source:'facebook',metric:'visible_posts_90d',value:94,time:isoAgo(14)},
    {source:'facebook',metric:'engagement_rate',value:3.7,time:isoAgo(15)},
    {source:'instagram',metric:'followers',value:86300,time:isoAgo(16)},
    {source:'instagram',metric:'visible_posts_90d',value:76,time:isoAgo(18)},
    {source:'instagram',metric:'engagement_rate',value:5.1,time:isoAgo(20)},
    {source:'tiktok',metric:'followers',value:54200,time:isoAgo(22)},
    {source:'tiktok',metric:'video_interest_multiplier',value:4.6,time:isoAgo(23)},
    {source:'youtube',metric:'followers',value:18700,time:isoAgo(31)},
    {source:'linkedin',metric:'followers',value:11900,time:isoAgo(34)},
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
    {source:'cmp_vestamart',metric:'campaign_intensity',value:84,time:isoAgo(38)},
    {source:'cmp_nordela',metric:'campaign_intensity',value:67,time:isoAgo(73)},
    {source:'cmp_urbanbasket',metric:'social_activity_index',value:79,time:isoAgo(96)},
    {source:'cmp_fresco',metric:'healthy_positioning_index',value:82,time:isoAgo(118)}
  ];

  const historyRows=[
    ['2026-08-01',70.8,69.2,65.1,79.1,72.4,70.5],
    ['2026-08-03',71.2,69.8,65.5,79.4,72.9,70.7],
    ['2026-08-05',71.5,70.3,66.0,79.8,73.4,70.9],
    ['2026-08-07',71.9,70.7,66.4,80.1,73.8,71.0],
    ['2026-08-09',72.3,71.1,66.8,80.4,74.2,71.2],
    ['2026-08-11',72.0,70.8,67.0,80.7,74.0,71.1],
    ['2026-08-13',72.6,71.4,67.4,81.0,74.8,71.3],
    ['2026-08-15',73.1,72.0,67.9,81.3,75.5,71.2],
    ['2026-08-16',73.4,72.4,68.2,81.5,75.9,71.1],
    ['2026-08-17',73.7,72.9,68.5,81.7,76.3,71.0],
    ['2026-08-18',74.0,73.3,68.7,81.8,76.6,71.0],
    ['2026-08-20',74.6,74.0,69.0,82.0,77.0,71.0]
  ];
  const wirelloHistory=historyRows.map(x=>({created_at:x[0]+'T09:00:00Z',payload:{blis_index:x[1],indices:[{key:'presence',value:x[2]},{key:'digital',value:x[3]},{key:'reputation',value:x[4]},{key:'content',value:x[5]},{key:'competitive',value:x[6]}]}}));
  const wirelloDashboard={
    slug:'wirello',name:'Wirello Market',sector:'Omnichannel retail / FMCG',note:'MASTER DEMO • Synthetic demonstration data',
    data_updated:new Date().toISOString(),blis_index:74.6,trend:2.8,confidence:93.4,
    indices:[
      {key:'presence',label:'Социален индекс',value:74.0,trend:3.1,confidence:92},
      {key:'digital',label:'Дигитална видимост',value:69.0,trend:4.4,confidence:94},
      {key:'reputation',label:'Репутационен индекс',value:82.0,trend:1.7,confidence:91},
      {key:'content',label:'Пазарни сигнали',value:77.0,trend:5.2,confidence:89},
      {key:'competitive',label:'Конкурентна позиция',value:71.0,trend:-1.4,confidence:90}
    ],
    signals:wirelloSignals,
    competitors:[
      {name:'Wirello Market',score:74.6,trend:2.8},
      {name:'VestaMart',score:76.4,trend:4.1},
      {name:'Nordela Market',score:72.1,trend:1.2},
      {name:'UrbanBasket',score:68.8,trend:3.8},
      {name:'Fresco Point',score:66.9,trend:2.5}
    ]
  };
  const wirelloQuality={configured_sources:18,sources_total:18,sources_with_data:17,coverage:94.4,confidence:93.4,freshness:'updated today',synthetic:true};
  const wirelloPack={dashboard:wirelloDashboard,sources:wirelloSources,quality:wirelloQuality,activity:wirelloActivity,history:wirelloHistory,signals:wirelloSignals};
  window.__WIRELLO_DATA=wirelloPack;

  function ensureWirelloSelector(){
    const sel=document.getElementById('clientSel');
    if(sel&&!sel.querySelector('option[value="wirello"]')){
      const o=document.createElement('option');o.value='wirello';o.textContent='Wirello Market';sel.prepend(o);
    }
    if(sel)sel.value='wirello';
    const menu=document.querySelector('.client-switch-menu');
    if(menu&&!menu.querySelector('[data-client-key="wirello"]')){
      const b=document.createElement('button');b.type='button';b.className='client-option active';b.dataset.clientKey='wirello';b.setAttribute('role','option');b.setAttribute('aria-selected','true');
      b.innerHTML='<span class="client-option-mark" style="background:#0f7568">WM</span><span><b>Wirello Market</b><small>Omnichannel retail • MASTER DEMO</small></span><span class="client-option-check">✓</span>';
      menu.prepend(b);
    }
  }

  function applyWirelloChrome(){
    if(initialClient()!=='wirello')return;
    document.body.dataset.client='wirello';
    document.documentElement.style.setProperty('--client','#0f7568');
    document.documentElement.style.setProperty('--clientSoft','#edf8f5');
    ensureWirelloSelector();
    const name=document.querySelector('.client-brand-name');if(name)name.textContent='Wirello Market';
    const type=document.querySelector('.client-brand-type');if(type)type.textContent='Omnichannel retail';
    const status=document.querySelector('.client-brand-status');if(status)status.textContent='MASTER DEMO • synthetic data';
    const mark=document.querySelector('.client-brand-mark');if(mark)mark.textContent='WM';
    const h=document.querySelector('.topbar .title h1');if(h&&!/Wirello/.test(h.textContent||''))h.textContent='Wirello Market';
    const nav=document.querySelector('#nav [data-page="market"]');
    const label=nav?.querySelector('.navtxt')||nav?.querySelector('span:last-child');if(label)label.textContent='Мрежа на нагласите';
  }

  function hydrateWirello(){
    if(initialClient()!=='wirello')return false;
    try{
      slug='wirello';
      D={...wirelloDashboard,data_updated:new Date().toISOString()};
      S=wirelloSources.slice();Q={...wirelloQuality};A=wirelloActivity.slice();H=wirelloHistory.slice();
      window.BLIS_INITIAL_CLIENT='wirello';
      applyWirelloChrome();
      return true;
    }catch(e){console.error('Wirello MASTER DEMO hydration failed',e);return false}
  }

  const legacyLoad=window.load;
  if(typeof legacyLoad==='function'){
    window.load=async function(){
      const wanted=initialClient();
      if(wanted==='wirello'){
        hydrateWirello();
        try{window.renderAll?.()}catch(e){}
        requestAnimationFrame(()=>window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:'wirello',source:'wirello-master-demo'}})));
        setTimeout(()=>window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:'wirello',source:'wirello-master-demo'}})),180);
        return D;
      }
      if(wanted){
        try{slug=wanted}catch(e){}
        const sel=document.getElementById('clientSel');if(sel)sel.value=wanted;
      }
      return legacyLoad();
    };
  }

  window.renderAll=function(){
    try{
      if(initialClient()==='wirello'&&(!D||D.slug!=='wirello'||Number(D.blis_index)<=0))hydrateWirello();
      const x=typeof dossier==='function'?dossier():null;
      if(x?.accent)document.documentElement.style.setProperty('--client',x.accent);
      if(x?.soft)document.documentElement.style.setProperty('--clientSoft',x.soft);
      const note=document.getElementById('clientNote');if(note)note.textContent=D?.note||x?.descriptor||'';
      const sync=document.getElementById('lastSync');if(sync)sync.textContent=D?.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'няма синхронизация';
      applyWirelloChrome();
    }catch(e){console.error('BLIS bridge render state failed',e)}
  };

  if(initialClient()==='wirello'){
    hydrateWirello();
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{hydrateWirello();applyWirelloChrome()},{once:true});
    window.addEventListener('load',()=>{hydrateWirello();applyWirelloChrome();window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:'wirello',source:'wirello-master-demo'}}))},{once:true});
  }
})();