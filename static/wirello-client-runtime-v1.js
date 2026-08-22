/* Wirello Market — first-class synthetic demo client for BLIS Navigator.
   One owner for demo data + branding. No route ownership, no repeated DOM patching. */
(function(){
'use strict';
if(window.__WIRELLO_CLIENT_V1)return; window.__WIRELLO_CLIENT_V1=true;

const nativeFetch=window.fetch.bind(window);
const nativeSetTimeout=window.setTimeout.bind(window);
const nativeSetInterval=window.setInterval.bind(window);

/* Performance guard for known legacy architecture duplication. It only suppresses
   the 90/240ms duplicate renderActive retries and slows the nav maintenance loop. */
window.setTimeout=function(fn,ms,...args){
  const src=typeof fn==='function'?Function.prototype.toString.call(fn):'';
  if((ms===90||ms===240)&&src.includes('renderActive')) return 0;
  return nativeSetTimeout(fn,ms,...args);
};
window.setInterval=function(fn,ms,...args){
  const src=typeof fn==='function'?Function.prototype.toString.call(fn):'';
  if(ms===1000&&src.includes('nav()')&&src.includes('installRouter')) ms=5000;
  return nativeSetInterval(fn,ms,...args);
};

window.BLIS_INITIAL_CLIENT='wirello';
window.BLIS_CLIENT_SCOPE='wirello';
try{document.body.dataset.client='wirello'}catch(_){ }

const CLIENT={slug:'wirello',name:'Wirello Market',sector:'Omnichannel retail / FMCG',note:'MASTER DEMO • Synthetic demonstration data'};
const isoAgo=m=>new Date(Date.now()-m*60000).toISOString();
const json=data=>Promise.resolve(new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}}));
const clamp=v=>Math.max(0,Math.min(100,v));
const round1=v=>Math.round(v*10)/10;

const SOURCES=[
 {key:'official_site',label:'Wirello Market — Website & E-commerce',method:'synthetic demo source • website, e-commerce, categories and content',reliability:.98},
 {key:'wirello_app',label:'Wirello App',method:'synthetic demo source • mobile commerce, loyalty and delivery',reliability:.96},
 {key:'facebook',label:'Facebook — Wirello Market',method:'synthetic demo source • owned social content and public interaction',reliability:.91},
 {key:'instagram',label:'Instagram — Wirello Market',method:'synthetic demo source • reels, posts, stories and audience activity',reliability:.91},
 {key:'tiktok',label:'TikTok — Wirello Market',method:'synthetic demo source • short-form video performance and mentions',reliability:.89},
 {key:'youtube',label:'YouTube — Wirello Market',method:'synthetic demo source • video publishing and audience signals',reliability:.88},
 {key:'linkedin',label:'LinkedIn — Wirello Market',method:'synthetic demo source • corporate communication and employer visibility',reliability:.88},
 {key:'google_search',label:'Search Visibility Monitor',method:'synthetic demo source • branded and category discoverability',reliability:.94},
 {key:'search_trends',label:'Search Interest Monitor',method:'synthetic demo source • relative search-interest movements',reliability:.92},
 {key:'reviews_national',label:'National Review Stream',method:'synthetic demo source • store reviews and ratings',reliability:.93},
 {key:'reviews_delivery',label:'Delivery Review Stream',method:'synthetic demo source • delivery ratings and service topics',reliability:.92},
 {key:'media_monitor',label:'Media & News Monitor',method:'synthetic demo source • media mentions and editorial context',reliability:.92},
 {key:'consumer_forums',label:'Consumer Discussion Monitor',method:'synthetic demo source • recurring consumer themes and complaints',reliability:.84},
 {key:'wirello_plus',label:'Wirello+ Loyalty Signals',method:'synthetic demo source • loyalty-program adoption and activity',reliability:.97},
 {key:'wirello_select',label:'Wirello Select Product Signals',method:'synthetic demo source • private-label interest and product feedback',reliability:.96},
 {key:'cmp_vestamart',label:'VestaMart Monitor',method:'synthetic competitor source • campaigns, delivery and visibility',reliability:.90},
 {key:'cmp_nordela',label:'Nordela Market Monitor',method:'synthetic competitor source • promotions, content and reviews',reliability:.90},
 {key:'cmp_urbanbasket',label:'UrbanBasket Monitor',method:'synthetic competitor source • social and convenience-retail activity',reliability:.89},
 {key:'cmp_fresco',label:'Fresco Point Monitor',method:'synthetic competitor source • healthy-positioning and category activity',reliability:.89},
 {key:'price_monitor',label:'Retail Price Signal Monitor',method:'synthetic sector source • category and value-perception movements',reliability:.91},
 {key:'promo_monitor',label:'Promotion Activity Monitor',method:'synthetic sector source • promotion intensity and timing',reliability:.90},
 {key:'category_monitor',label:'FMCG Category Monitor',method:'synthetic sector source • category momentum and emerging topics',reliability:.92},
 {key:'delivery_monitor',label:'Last-mile Delivery Monitor',method:'synthetic sector source • delivery expectations and competitor moves',reliability:.90},
 {key:'source_health',label:'BLIS Source Health',method:'synthetic operational source • source availability and scan health',reliability:.99}
];

const COMPETITORS=[
 {name:'VestaMart',score:78.2,trend:1.9,website:1,ecommerce:1,pricing:1,social:1,categories:94,content:86,news:78,rating:4.31,ratings:21340,activity:84,visibility:84,search:85,sentiment:77,attitudes:76,perception:78},
 {name:'Wirello Market',score:74.9,trend:2.8,website:1,ecommerce:1,pricing:1,social:1,categories:92,content:83,news:76,rating:4.42,ratings:18470,activity:79,visibility:82.1,search:81,sentiment:75.8,attitudes:76.4,perception:77.2},
 {name:'Nordela Market',score:72.7,trend:1.2,website:1,ecommerce:1,pricing:1,social:1,categories:88,content:75,news:68,rating:4.28,ratings:14320,activity:71,visibility:72,search:74,sentiment:73,attitudes:72,perception:72},
 {name:'UrbanBasket',score:69.8,trend:3.8,website:1,ecommerce:1,pricing:1,social:1,categories:71,content:88,news:54,rating:4.47,ratings:8240,activity:82,visibility:64,search:68,sentiment:78,attitudes:76,perception:75},
 {name:'Fresco Point',score:67.4,trend:2.5,website:1,ecommerce:0,pricing:1,social:1,categories:76,content:80,news:51,rating:4.51,ratings:6590,activity:74,visibility:61,search:65,sentiment:80,attitudes:79,perception:78}
];

const SIGNALS=[
 {id:'sig-001',time:isoAgo(8),direction:'from',title:'Wirello Select ускорява положителния интерес',description:'Положителните продуктови споменавания са +31% спрямо предходните 30 дни.',severity:'medium',confidence:94,category:'market',source:'wirello_select',status:'new',evidence:28},
 {id:'sig-002',time:isoAgo(17),direction:'about',title:'Нарастват оплакванията за чакане на касите',description:'Темата се повтаря в четири магазина и преминава прага за репутационно наблюдение.',severity:'high',confidence:93,category:'reputation',source:'reviews_national',status:'new',evidence:37},
 {id:'sig-003',time:isoAgo(31),direction:'about',title:'VestaMart активира безплатна доставка над 45 €',description:'Предложението е засечено в сайт, social и delivery комуникация.',severity:'high',confidence:97,category:'competition',source:'cmp_vestamart',status:'reviewed',evidence:14},
 {id:'sig-004',time:isoAgo(49),direction:'from',title:'TikTok видео е 4,6× над собствената база',description:'Видео за Wirello Select генерира необичайно висок органичен интерес.',severity:'medium',confidence:96,category:'social',source:'tiktok',status:'reviewed',evidence:19},
 {id:'sig-005',time:isoAgo(81),direction:'from',title:'Временният технически спад на сайта е отстранен',description:'По-високото време за зареждане се нормализира след 21 минути.',severity:'low',confidence:99,category:'digital',source:'official_site',status:'resolved',evidence:8},
 {id:'sig-006',time:isoAgo(129),direction:'about',title:'Брандовите търсения нарастват устойчиво',description:'Търсенията за Wirello Market и Wirello Select са +18,4% спрямо 30-дневната база.',severity:'medium',confidence:92,category:'digital',source:'search_trends',status:'reviewed',evidence:21},
 {id:'sig-007',time:isoAgo(187),direction:'about',title:'„Цена/стойност“ става водеща потребителска тема',description:'Темата увеличава дела си в отзивите и потребителските дискусии.',severity:'medium',confidence:89,category:'market',source:'consumer_forums',status:'new',evidence:31},
 {id:'sig-008',time:isoAgo(244),direction:'from',title:'Instagram Reels поддържат ръст трета седмица',description:'Три последователни Reels публикации са над 90-дневната собствена база.',severity:'low',confidence:93,category:'social',source:'instagram',status:'reviewed',evidence:13},
 {id:'sig-009',time:isoAgo(331),direction:'about',title:'Оценката за онлайн доставка се подобрява',description:'Средната оценка достига 4,55/5, а оплакванията за закъснение намаляват.',severity:'low',confidence:91,category:'reputation',source:'reviews_delivery',status:'resolved',evidence:24},
 {id:'sig-010',time:isoAgo(420),direction:'about',title:'Fresco Point засилва fresh/healthy позиционирането',description:'Нараства честотата на комуникацията около fresh и ready-to-eat категории.',severity:'medium',confidence:90,category:'competition',source:'cmp_fresco',status:'reviewed',evidence:12},
 {id:'sig-011',time:isoAgo(599),direction:'from',title:'Wirello+ увеличава активните взаимодействия',description:'Активността в програмата за лоялност е +8,6% спрямо предходния период.',severity:'low',confidence:96,category:'market',source:'wirello_plus',status:'reviewed',evidence:26},
 {id:'sig-012',time:isoAgo(808),direction:'from',title:'LinkedIn е под собствената 60-дневна база',description:'Корпоративното съдържание има по-нисък коефициент на взаимодействие.',severity:'medium',confidence:86,category:'social',source:'linkedin',status:'new',evidence:9}
];

const CURRENT={slug:'wirello',name:'Wirello Market',sector:CLIENT.sector,note:CLIENT.note,data_updated:new Date().toISOString(),blis_index:78.1,trend:2.6,
 indices:[
  {key:'presence',label:'Социален индекс',value:78.4,trend:3.1,confidence:94},
  {key:'digital',label:'Дигитална видимост',value:82.1,trend:4.4,confidence:95},
  {key:'reputation',label:'Репутационен индекс',value:79.6,trend:1.7,confidence:93},
  {key:'content',label:'Пазарни сигнали',value:76.8,trend:5.2,confidence:91},
  {key:'competitive',label:'Конкурентна позиция',value:74.9,trend:2.8,confidence:92},
  {key:'media',label:'Медийна видимост',value:72.4,trend:2.1,confidence:91},
  {key:'consumer_opinion',label:'Потребителски мнения',value:75.8,trend:1.9,confidence:90},
  {key:'reputation_pressure',label:'Репутационен натиск',value:28.3,trend:-2.4,confidence:92}
 ],signals:SIGNALS,competitors:COMPETITORS};

function history(days=180){
 const out=[], now=new Date(); now.setHours(9,0,0,0);
 for(let i=days-1;i>=0;i--){
  const d=new Date(now); d.setDate(d.getDate()-i); const age=days-1-i;
  const base=71.2+age*(6.9/(days-1))+Math.sin(age/10)*1.15+Math.sin(age/27)*.55;
  const bl=round1(clamp(base));
  const presence=round1(clamp(bl+.5+Math.sin(age/8)*1.4));
  const digital=round1(clamp(bl+3.4+Math.sin(age/13)*1.2));
  const reputation=round1(clamp(bl+1.5+Math.sin(age/17)*.9));
  const content=round1(clamp(bl-1.1+Math.sin(age/7)*1.6));
  const competitive=round1(clamp(bl-3.0+Math.sin(age/11)*1.2));
  const comps=COMPETITORS.map((c,idx)=>({name:c.name,score:round1(clamp(c.score-(days-1-age)*(c.trend/Math.max(30,days))+Math.sin((age+idx*4)/(8+idx))*0.8))}));
  out.push({created_at:d.toISOString(),payload:{blis_index:bl,indices:[{key:'presence',value:presence},{key:'digital',value:digital},{key:'reputation',value:reputation},{key:'content',value:content},{key:'competitive',value:competitive}],competitors:comps}});
 }
 const last=out[out.length-1].payload; last.blis_index=78.1;
 Object.assign(last.indices.find(x=>x.key==='presence'),{value:78.4});
 Object.assign(last.indices.find(x=>x.key==='digital'),{value:82.1});
 Object.assign(last.indices.find(x=>x.key==='reputation'),{value:79.6});
 Object.assign(last.indices.find(x=>x.key==='content'),{value:76.8});
 Object.assign(last.indices.find(x=>x.key==='competitive'),{value:74.9});
 last.competitors=COMPETITORS.map(x=>({name:x.name,score:x.score}));
 return out;
}
const HISTORY=history();

const ACTIVITY=[
 {source:'facebook',metric:'followers',value:128400,time:isoAgo(12)},{source:'facebook',metric:'visible_posts_90d',value:94,time:isoAgo(14)},{source:'facebook',metric:'engagement_rate',value:3.7,time:isoAgo(15)},
 {source:'facebook',metric:'likes',value:8420,time:isoAgo(16)},{source:'facebook',metric:'comments_visible',value:1180,time:isoAgo(16)},{source:'facebook',metric:'shares_visible',value:740,time:isoAgo(16)},
 {source:'facebook',metric:'post_1_text',value:'Седмица на свежите предложения във Wirello Market — селекция от сезонни плодове, зеленчуци и готови решения.',time:isoAgo(60)},
 {source:'instagram',metric:'followers',value:86300,time:isoAgo(18)},{source:'instagram',metric:'visible_posts_90d',value:76,time:isoAgo(19)},{source:'instagram',metric:'engagement_rate',value:5.1,time:isoAgo(20)},
 {source:'instagram',metric:'post_1_text',value:'Wirello Select: нови продукти за бърза вечеря с фокус върху качество и удобство.',time:isoAgo(90)},
 {source:'tiktok',metric:'followers',value:54200,time:isoAgo(22)},{source:'tiktok',metric:'visible_posts_90d',value:41,time:isoAgo(24)},{source:'tiktok',metric:'video_interest_multiplier',value:4.6,time:isoAgo(25)},
 {source:'tiktok',metric:'post_1_text',value:'30 секунди зад кулисите: как подреждаме fresh зоната преди отваряне.',time:isoAgo(110)},
 {source:'youtube',metric:'followers',value:18700,time:isoAgo(31)},{source:'youtube',metric:'visible_posts_90d',value:18,time:isoAgo(32)},
 {source:'linkedin',metric:'followers',value:11900,time:isoAgo(34)},{source:'linkedin',metric:'engagement_rate',value:1.4,time:isoAgo(35)},
 {source:'official_site',metric:'website_active',value:1,time:isoAgo(8)},{source:'official_site',metric:'ecommerce_active',value:1,time:isoAgo(8)},{source:'official_site',metric:'cart_active',value:1,time:isoAgo(8)},{source:'official_site',metric:'pricing_visible',value:1,time:isoAgo(8)},{source:'official_site',metric:'product_details',value:1,time:isoAgo(8)},{source:'official_site',metric:'category_count',value:24,time:isoAgo(9)},{source:'official_site',metric:'indexed_pages',value:18640,time:isoAgo(10)},{source:'official_site',metric:'core_web_score',value:83,time:isoAgo(10)},
 {source:'wirello_app',metric:'app_active',value:1,time:isoAgo(11)},{source:'wirello_app',metric:'delivery_active',value:1,time:isoAgo(11)},
 {source:'wirello_plus',metric:'loyalty_active',value:1,time:isoAgo(17)},{source:'wirello_plus',metric:'loyalty_growth_pct',value:8.6,time:isoAgo(17)},
 {source:'wirello_select',metric:'private_label_mentions',value:684,time:isoAgo(25)},{source:'wirello_select',metric:'positive_share_pct',value:78,time:isoAgo(25)},
 {source:'google_search',metric:'branded_visibility',value:81,time:isoAgo(27)},{source:'search_trends',metric:'branded_interest_change_pct',value:18.4,time:isoAgo(28)},
 {source:'media_monitor',metric:'news_mentions_30d',value:46,time:isoAgo(39)},
 {source:'reviews_national',metric:'rating',value:4.42,time:isoAgo(42)},{source:'reviews_national',metric:'review_count',value:18470,time:isoAgo(42)},{source:'reviews_national',metric:'positive_reviews_pct',value:76,time:isoAgo(42)},{source:'reviews_national',metric:'checkout_wait_mentions',value:57,time:isoAgo(44)},
 {source:'reviews_delivery',metric:'rating',value:4.55,time:isoAgo(47)},{source:'reviews_delivery',metric:'review_count',value:6290,time:isoAgo(47)},
 {source:'consumer_forums',metric:'price_value_mentions',value:138,time:isoAgo(51)},
 {source:'cmp_vestamart',metric:'campaign_intensity',value:84,time:isoAgo(38)},{source:'cmp_vestamart',metric:'free_delivery_active',value:1,time:isoAgo(37)},
 {source:'cmp_nordela',metric:'campaign_intensity',value:67,time:isoAgo(73)},{source:'cmp_urbanbasket',metric:'social_activity_index',value:79,time:isoAgo(96)},{source:'cmp_fresco',metric:'healthy_positioning_index',value:82,time:isoAgo(118)},
 {source:'price_monitor',metric:'value_sensitivity_index',value:73,time:isoAgo(133)},{source:'promo_monitor',metric:'sector_promo_intensity',value:68,time:isoAgo(154)},{source:'category_monitor',metric:'healthy_category_momentum',value:76,time:isoAgo(177)},{source:'delivery_monitor',metric:'free_delivery_competitors',value:2,time:isoAgo(199)},
 {source:'source_health',metric:'sources_active',value:24,time:isoAgo(6)}
];
for(let day=0;day<30;day+=2){
 const mins=day*1440+180;
 ACTIVITY.push({source:'cmp_vestamart',metric:day%4?'campaign_intensity':'pricing_visibility',value:round1(72+Math.sin(day/3)*9),time:isoAgo(mins)});
 ACTIVITY.push({source:'cmp_nordela',metric:day%6?'content_activity':'review_momentum',value:round1(61+Math.cos(day/4)*8),time:isoAgo(mins+37)});
 if(day%4===0)ACTIVITY.push({source:'cmp_urbanbasket',metric:'social_activity_index',value:round1(72+Math.sin(day/5)*10),time:isoAgo(mins+64)});
 if(day%6===0)ACTIVITY.push({source:'cmp_fresco',metric:'healthy_positioning_index',value:round1(76+Math.cos(day/5)*6),time:isoAgo(mins+91)});
}

const KEYWORDS=[
 {title:'Wirello Select',keyword:'wirello select',display:'+31%',value:31,explanation:'Положителните продуктови споменавания се ускоряват.'},
 {title:'Цена / стойност',keyword:'price value',display:'+22%',value:22,explanation:'Темата расте в review и discussion средата.'},
 {title:'Чакане на касите',keyword:'checkout wait',display:'+41%',value:41,explanation:'Повтаряща се негативна тема в четири физически обекта.'},
 {title:'Безплатна доставка',keyword:'free delivery',display:'Ново',value:18,explanation:'VestaMart активира безплатна доставка и увеличава конкурентния натиск.'},
 {title:'Healthy / fresh',keyword:'healthy fresh',display:'+17%',value:17,explanation:'Устойчиво секторно движение и по-силна активност на Fresco Point.'},
 {title:'Wirello+',keyword:'wirello plus',display:'+8,6%',value:8.6,explanation:'Ръст на loyalty adoption и промоционални взаимодействия.'},
 {title:'TikTok',keyword:'tiktok',display:'4,6×',value:4.6,explanation:'Една публикация е значително над собствената историческа база.'},
 {title:'Branded search',keyword:'wirello market',display:'+18,4%',value:18.4,explanation:'Нараства относителният интерес към марката и private label.'}
];
const REPORTS=[
 {id:'summary',title:'Месечен аналитичен обзор — Wirello Market',period:'Август 2026'},
 {id:'reputation',title:'Reputation Intelligence — Wirello Market',period:'Август 2026'},
 {id:'competitive',title:'Competitive Intelligence — Wirello Market',period:'Август 2026'},
 {id:'signals',title:'Анализ на сигналите — Wirello Market',period:'Август 2026'},
 {id:'digital',title:'Digital Intelligence — Wirello Market',period:'Август 2026'},
 {id:'social',title:'Social Intelligence — Wirello Market',period:'Август 2026'},
 {id:'attitudes',title:'Нагласи и потребителски теми — Wirello Market',period:'Август 2026'},
 {id:'weekly',title:'Weekly BLIS Pulse — Wirello Market',period:'17–23 август 2026'}
];
const EXPORTS=[{id:'exp-01',title:'Weekly BLIS Pulse',format:'PDF',created_at:isoAgo(1440)},{id:'exp-02',title:'Competitive snapshot',format:'CSV',created_at:isoAgo(2880)},{id:'exp-03',title:'Reputation evidence pack',format:'HTML',created_at:isoAgo(4320)}];
const QUALITY={configured_sources:SOURCES.length,sources_with_data:24,coverage:96,confidence:94.2,freshness:'updated today',synthetic:true};

window.__WIRELLO_DATA={client:CLIENT,dashboard:CURRENT,sources:SOURCES,quality:QUALITY,activity:ACTIVITY,history:HISTORY,keywords:KEYWORDS,reports:REPORTS,exports:EXPORTS};

window.fetch=function(input,init){
 let u; try{u=new URL(typeof input==='string'?input:input.url,location.origin)}catch(_){return nativeFetch(input,init)}
 const p=u.pathname;
 if(p==='/api/clients') return json([CLIENT]);
 if(!p.startsWith('/api/clients/wirello/')) return nativeFetch(input,init);
 const ep=p.split('/').pop();
 if(ep==='dashboard') return json({...CURRENT,data_updated:new Date().toISOString()});
 if(ep==='sources') return json(SOURCES);
 if(ep==='data-quality') return json(QUALITY);
 if(ep==='activity') return json(ACTIVITY);
 if(ep==='history') return json(HISTORY);
 if(ep==='keywords') return json(KEYWORDS);
 if(ep==='alerts') return json(SIGNALS);
 if(ep==='reports') return json(REPORTS);
 if(ep==='exports') return json(EXPORTS);
 if(ep==='refresh') return json({ok:true,engine:{version:'wirello-demo-v1',running:false,last_run:new Date().toISOString(),successful:24,failed:0},dashboard:{...CURRENT,data_updated:new Date().toISOString()}});
 return json([]);
};

function applyBrand(){
 document.body.dataset.client='wirello';
 document.documentElement.style.setProperty('--client','#0f7568');
 document.documentElement.style.setProperty('--clientSoft','#edf8f5');
 document.querySelectorAll('.client-brand-name').forEach(x=>x.textContent='Wirello Market');
 document.querySelectorAll('.client-brand-type').forEach(x=>x.textContent='Omnichannel retail / FMCG');
 document.querySelectorAll('.client-brand-mark').forEach(x=>x.textContent='WM');
 const status=document.querySelector('.client-brand-status'); if(status)status.textContent='MASTER DEMO • synthetic data';
}
function applyHero(){
 nativeFetch('/wirello-hero-1600x533.b64?v=20260822',{cache:'force-cache'}).then(r=>r.ok?r.text():'').then(b64=>{
  b64=(b64||'').trim(); if(!b64)return;
  const top=document.querySelector('.topbar'); if(!top)return;
  top.style.setProperty('background-image','linear-gradient(90deg,rgba(255,255,255,.97) 0%,rgba(255,255,255,.90) 30%,rgba(255,255,255,.42) 52%,rgba(255,255,255,.02) 74%),url("data:image/webp;base64,'+b64+'")','important');
  top.style.setProperty('background-size','cover','important');
  top.style.setProperty('background-position','center right','important');
  top.style.setProperty('background-repeat','no-repeat','important');
 }).catch(()=>{});
}
function installTheme(){
 if(document.getElementById('wirello-client-v1-style'))return;
 const s=document.createElement('style'); s.id='wirello-client-v1-style';
 s.textContent='body[data-client="wirello"]{--nav-blue:#0f7568;--client:#0f7568;--clientSoft:#edf8f5}body[data-client="wirello"] .topbar .title h1{color:#0b3150;text-shadow:0 1px 10px rgba(255,255,255,.95)}body[data-client="wirello"] .client-brand-status{color:#0f7568;font-weight:700}';
 document.head.appendChild(s);
}
function installDownload(){
 window.download=function(type,format){
  const title=(REPORTS.find(x=>x.id===type)?.title||'BLIS Navigator Export');
  const body='WIRELLO MARKET — MASTER DEMO\nSynthetic demonstration data\n\n'+title+'\nPeriod: August 2026\nBLIS Index: 78.1\nDigital Visibility: 82.1\nReputation: 79.6\nMarket Signals: 76.8\nCompetitive Position: 74.9\n\nKey signals:\n- Wirello Select positive momentum\n- Checkout waiting-time reputation risk\n- VestaMart free-delivery move\n- TikTok overperformance\n';
  const ext=format==='csv'?'csv':format==='html'?'html':'txt';
  const mime=format==='csv'?'text/csv;charset=utf-8':format==='html'?'text/html;charset=utf-8':'text/plain;charset=utf-8';
  const blob=new Blob([body],{type:mime}),a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='Wirello_Market_'+String(type||'export')+'.'+ext; document.body.appendChild(a); a.click(); nativeSetTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
 };
}
function init(){installTheme();applyBrand();applyHero();installDownload()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
