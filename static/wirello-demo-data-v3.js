/* Wirello Market — full synthetic demo dataset V3.
   Purpose: every current Navigator module has realistic, internally consistent data. */
(function(){
'use strict';
if(new URLSearchParams(location.search).get('client')!=='wirello')return;
if(window.__WIRELLO_DATA_V3)return;window.__WIRELLO_DATA_V3=true;

const previousFetch=window.fetch.bind(window);
const DAY=86400000;
const ago=(m)=>new Date(Date.now()-m*60000).toISOString();
const atDays=(d,h=9)=>{const x=new Date(Date.now()-d*DAY);x.setHours(h,0,0,0);return x.toISOString()};
const rnd=(v,d=1)=>Number(v.toFixed(d));
const clamp=v=>Math.max(0,Math.min(100,v));
const response=data=>Promise.resolve(new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}}));

const SOURCES=[
 {key:'official_site',label:'Wirello Market — Website & E-commerce',method:'официален сайт • e-commerce • категории • съдържание',reliability:.99},
 {key:'wirello_app',label:'Wirello App',method:'mobile commerce • доставка • персонални оферти',reliability:.98},
 {key:'wirello_plus',label:'Wirello+ Loyalty',method:'loyalty adoption • активност • кампании',reliability:.98},
 {key:'wirello_select',label:'Wirello Select',method:'private label • продуктови сигнали • интерес',reliability:.97},
 {key:'facebook',label:'Facebook — Wirello Market',method:'официален социален канал',reliability:.93},
 {key:'instagram',label:'Instagram — Wirello Market',method:'официален социален канал',reliability:.93},
 {key:'tiktok',label:'TikTok — Wirello Market',method:'официален социален канал',reliability:.91},
 {key:'youtube',label:'YouTube — Wirello Market',method:'официален социален канал',reliability:.91},
 {key:'linkedin',label:'LinkedIn — Wirello Market',method:'официален корпоративен канал',reliability:.92},
 {key:'google_search',label:'Search Visibility Monitor',method:'brand/category search visibility',reliability:.95},
 {key:'search_trends',label:'Search Interest Monitor',method:'relative branded and category interest',reliability:.94},
 {key:'reviews_national',label:'National Store Review Stream',method:'store ratings • reviews • recurring topics',reliability:.94},
 {key:'reviews_delivery',label:'Delivery Review Stream',method:'delivery ratings • service topics',reliability:.93},
 {key:'media_monitor',label:'Media & News Monitor',method:'news mentions • editorial context',reliability:.94},
 {key:'consumer_forums',label:'Consumer Discussion Monitor',method:'public discussion • recurring themes',reliability:.86},
 {key:'cmp_vestamart',label:'VestaMart Competitive Monitor',method:'competitor campaigns • visibility • delivery',reliability:.93},
 {key:'cmp_nordela',label:'Nordela Market Competitive Monitor',method:'competitor promotions • reviews • content',reliability:.92},
 {key:'cmp_urbanbasket',label:'UrbanBasket Competitive Monitor',method:'competitor social • convenience retail',reliability:.90},
 {key:'cmp_fresco',label:'Fresco Point Competitive Monitor',method:'competitor fresh/healthy positioning',reliability:.90},
 {key:'price_monitor',label:'Retail Price Signal Monitor',method:'category value perception • price signals',reliability:.92},
 {key:'promo_monitor',label:'Promotion Activity Monitor',method:'sector promotion intensity • timing',reliability:.91},
 {key:'category_monitor',label:'FMCG Category Monitor',method:'category momentum • emerging topics',reliability:.93},
 {key:'delivery_monitor',label:'Last-mile Delivery Monitor',method:'delivery promise • fees • competitor moves',reliability:.90},
 {key:'local_listings',label:'Local Store Listings Monitor',method:'store discoverability • local presence',reliability:.92},
 {key:'source_health',label:'BLIS Source Health',method:'source availability • scan health',reliability:.99}
];

const COMPETITORS=[
 {name:'VestaMart',score:78.2,trend:4.3,confidence:94,visibility:88,search:86,website:1,rating:4.37,sentiment:74,attitudes:75,perception:76,social:1,content:86,news:61,ecommerce:1,pricing:1,categories:27,activity:86,ratings:23640},
 {name:'Wirello Market',score:74.9,trend:2.9,confidence:95,visibility:84,search:82,website:1,rating:4.42,sentiment:78,attitudes:77,perception:79,social:1,content:82,news:46,ecommerce:1,pricing:1,categories:24,activity:79,ratings:18470},
 {name:'Nordela Market',score:72.7,trend:1.5,confidence:92,visibility:79,search:77,website:1,rating:4.31,sentiment:72,attitudes:71,perception:72,social:1,content:74,news:37,ecommerce:1,pricing:1,categories:26,activity:71,ratings:15120},
 {name:'UrbanBasket',score:69.8,trend:3.7,confidence:91,visibility:76,search:71,website:1,rating:4.48,sentiment:76,attitudes:74,perception:75,social:1,content:79,news:29,ecommerce:1,pricing:1,categories:18,activity:83,ratings:9320},
 {name:'Fresco Point',score:67.4,trend:2.6,confidence:90,visibility:69,search:66,website:1,rating:4.55,sentiment:80,attitudes:78,perception:79,social:1,content:72,news:24,ecommerce:1,pricing:1,categories:16,activity:74,ratings:7180}
];

const SIGNALS=[
 {id:'s01',time:ago(7),direction:'from',category:'social',source:'instagram',title:'Weekend Fresh Reels над собствената база',description:'Reels форматът е +38% над 30-дневната база по видими взаимодействия.',severity:'low',confidence:96,evidence:19,status:'reviewed'},
 {id:'s02',time:ago(13),direction:'from',category:'social',source:'facebook',title:'Нова кампания Wirello Select',description:'Кампанията за private label е активна едновременно във Facebook, Instagram и e-commerce.',severity:'medium',confidence:98,evidence:31,status:'new'},
 {id:'s03',time:ago(19),direction:'about',category:'reputation',source:'reviews_national',title:'Повече коментари за чакане на касите',description:'Темата е +41% спрямо предходните 30 дни и се среща в четири магазина.',severity:'high',confidence:93,evidence:57,status:'new'},
 {id:'s04',time:ago(28),direction:'about',category:'competition',source:'cmp_vestamart',title:'VestaMart активира безплатна доставка над 45 лв.',description:'Новото предложение се появява в сайт, social и delivery комуникация.',severity:'high',confidence:97,evidence:12,status:'reviewed'},
 {id:'s05',time:ago(39),direction:'from',category:'digital',source:'official_site',title:'E-commerce conversion path е оптимизиран',description:'Checkout flow е съкратен с една стъпка и mobile performance остава стабилен.',severity:'low',confidence:99,evidence:8,status:'resolved'},
 {id:'s06',time:ago(52),direction:'from',category:'social',source:'tiktok',title:'TikTok видео за Wirello Select достига 4.6× нормалния интерес',description:'Кратко product-discovery видео е най-силното органично съдържание за месеца.',severity:'medium',confidence:96,evidence:24,status:'reviewed'},
 {id:'s07',time:ago(71),direction:'about',category:'market',source:'consumer_forums',title:'Цена и стойност става водеща потребителска тема',description:'Честотата на дискусиите по тема цена/стойност е +22% за периода.',severity:'medium',confidence:88,evidence:138,status:'new'},
 {id:'s08',time:ago(94),direction:'about',category:'media',source:'media_monitor',title:'46 медийни споменавания за 30 дни',description:'Медийният контекст е предимно неутрален към позитивен, с фокус върху retail и private label.',severity:'low',confidence:94,evidence:46,status:'reviewed'},
 {id:'s09',time:ago(118),direction:'from',category:'market',source:'wirello_plus',title:'Wirello+ активността расте',description:'Активните loyalty взаимодействия са +8.6% спрямо предходния период.',severity:'low',confidence:95,evidence:22,status:'reviewed'},
 {id:'s10',time:ago(147),direction:'about',category:'digital',source:'search_trends',title:'Branded search interest е +18.4%',description:'Wirello Market и Wirello Select са над 90-дневната си относителна база.',severity:'medium',confidence:91,evidence:17,status:'reviewed'},
 {id:'s11',time:ago(181),direction:'about',category:'competition',source:'cmp_urbanbasket',title:'UrbanBasket увеличава short-form video активността',description:'Публикационната честота е с 29% по-висока спрямо предходния месец.',severity:'medium',confidence:90,evidence:16,status:'reviewed'},
 {id:'s12',time:ago(224),direction:'about',category:'competition',source:'cmp_fresco',title:'Fresco Point засилва healthy / fresh позиционирането',description:'Healthy category share във видимото съдържание достига най-висока стойност за шест месеца.',severity:'medium',confidence:89,evidence:13,status:'reviewed'},
 {id:'s13',time:ago(266),direction:'about',category:'reputation',source:'reviews_delivery',title:'Delivery rating се повишава до 4.55/5',description:'Средната оценка се възстановява след временен спад в началото на месеца.',severity:'low',confidence:92,evidence:6290,status:'resolved'},
 {id:'s14',time:ago(303),direction:'from',category:'social',source:'linkedin',title:'Employer content е под историческата база',description:'LinkedIn engagement rate е 1.4%, под 60-дневната медиана от 1.8%.',severity:'medium',confidence:86,evidence:9,status:'new'},
 {id:'s15',time:ago(345),direction:'about',category:'competition',source:'cmp_nordela',title:'Nordela Market стартира „Седмица на дома“',description:'Промоционалната активност в Home & Living се увеличава с 18%.',severity:'medium',confidence:92,evidence:11,status:'reviewed'},
 {id:'s16',time:ago(402),direction:'from',category:'digital',source:'wirello_app',title:'Wirello App delivery usage нараства',description:'Делът на поръчките през приложението е +6.2% спрямо юли.',severity:'low',confidence:95,evidence:18,status:'reviewed'},
 {id:'s17',time:ago(473),direction:'about',category:'reputation',source:'reviews_national',title:'Позитивните отзиви са 76%',description:'Най-често позитивно се споменават свежите категории, промоциите и Wirello Select.',severity:'low',confidence:93,evidence:18470,status:'reviewed'},
 {id:'s18',time:ago(551),direction:'about',category:'competition',source:'cmp_vestamart',title:'VestaMart увеличава promo intensity',description:'Конкурентният promo index достига 84/100 за текущия период.',severity:'high',confidence:95,evidence:21,status:'new'}
];

const DASHBOARD={
 slug:'wirello',name:'Wirello Market',sector:'Omnichannel retail / FMCG',note:'MASTER DEMO • Synthetic demonstration data',data_updated:new Date().toISOString(),blis_index:78.1,trend:3.2,
 indices:[
  {key:'presence',label:'Социален индекс',value:78.4,trend:3.7,confidence:94},
  {key:'digital',label:'Дигитална видимост',value:82.1,trend:4.8,confidence:96},
  {key:'reputation',label:'Репутационен индекс',value:79.6,trend:1.9,confidence:94},
  {key:'content',label:'Пазарни сигнали',value:76.8,trend:4.6,confidence:92},
  {key:'interest',label:'Интерес',value:79.2,trend:3.9,confidence:91},
  {key:'competitive',label:'Конкурентна позиция',value:74.9,trend:2.9,confidence:94},
  {key:'media',label:'Медийна видимост',value:72.4,trend:2.1,confidence:92},
  {key:'consumer_opinion',label:'Потребителски мнения',value:75.8,trend:1.6,confidence:90},
  {key:'reputation_pressure',label:'Репутационен натиск',value:28.3,trend:-2.4,confidence:91}
 ],
 metrics:[
  {key:'rating',value:4.42},{key:'review_count',value:18470},{key:'news_mentions_30d',value:46},{key:'reputation_balance',value:68.4},{key:'reputation_pressure',value:28.3}
 ],
 signals:SIGNALS,competitors:COMPETITORS
};

const ACTIVITY=[];
const push=(source,metric,value,mins)=>ACTIVITY.push({source,metric,value,time:ago(mins)});
[
 ['facebook','followers',128400,12],['facebook','visible_posts_90d',94,13],['facebook','engagement_rate',3.7,14],['facebook','likes',18240,15],['facebook','comments_visible',2180,16],['facebook','shares_visible',1360,17],
 ['instagram','followers',86300,18],['instagram','visible_posts_90d',76,19],['instagram','engagement_rate',5.1,20],['instagram','likes',26400,21],['instagram','comments_visible',2940,22],['instagram','shares_visible',1710,23],
 ['tiktok','followers',54200,24],['tiktok','visible_posts_90d',41,25],['tiktok','engagement_rate',7.8,26],['tiktok','video_interest_multiplier',4.6,27],
 ['youtube','followers',18700,31],['youtube','visible_posts_90d',18,32],['youtube','engagement_rate',2.9,33],
 ['linkedin','followers',11900,34],['linkedin','visible_posts_90d',23,35],['linkedin','engagement_rate',1.4,36],
 ['official_site','website_active',1,8],['official_site','ecommerce_active',1,8],['official_site','cart_active',1,8],['official_site','pricing_visible',1,8],['official_site','product_details',1,8],['official_site','category_count',24,9],['official_site','indexed_pages',18640,10],['official_site','core_web_score',83,11],['official_site','mobile_performance',79,12],
 ['wirello_app','app_active',1,10],['wirello_app','delivery_active',1,10],['wirello_app','app_order_share_pct',31.4,11],
 ['wirello_plus','loyalty_active',1,17],['wirello_plus','loyalty_growth_pct',8.6,17],['wirello_plus','active_members',346000,18],
 ['wirello_select','private_label_mentions',684,25],['wirello_select','positive_share_pct',78,25],['wirello_select','product_interest_index',84,26],
 ['google_search','branded_visibility',81,27],['google_search','search_visibility',82,28],['google_search','local_store_visibility',87,29],
 ['search_trends','branded_interest_change_pct',18.4,30],['search_trends','brand_interest_index',79,31],
 ['media_monitor','news_mentions_30d',46,39],['media_monitor','media_positive_pct',31,40],['media_monitor','media_neutral_pct',61,40],['media_monitor','media_negative_pct',8,40],
 ['reviews_national','rating',4.42,42],['reviews_national','review_count',18470,42],['reviews_national','positive_reviews_pct',76,43],['reviews_national','negative_reviews_pct',11,43],['reviews_national','checkout_wait_mentions',57,44],
 ['reviews_delivery','rating',4.55,47],['reviews_delivery','review_count',6290,47],['reviews_delivery','positive_reviews_pct',81,48],
 ['consumer_forums','price_value_mentions',138,51],['consumer_forums','freshness_mentions',94,52],['consumer_forums','service_mentions',73,53],['consumer_forums','consumer_opinion_index',75.8,54],
 ['price_monitor','value_sensitivity_index',73,133],['promo_monitor','sector_promo_intensity',68,154],['category_monitor','healthy_category_momentum',76,177],['delivery_monitor','free_delivery_competitors',2,199],['source_health','sources_active',24,6],['source_health','sources_limited',1,6]
].forEach(x=>push(...x));

const POSTS={
 facebook:['Седмица на Wirello Select: над 120 продукта със специални предложения.','Fresh Weekend започва в петък — сезонни плодове, зеленчуци и готови решения за вечеря.','Wirello+ членовете получават персонални купони за най-купуваните категории.'],
 instagram:['Weekend Fresh: 5 идеи за бърза вечеря с продукти от Wirello Select.','Новите bakery предложения вече са във всички големи обекти.','Три начина да използваш Wirello+ още при следващото пазаруване.'],
 tiktok:['30 секунди в кухнята: Wirello Select pasta challenge.','Как изглежда една доставка от picking до вратата.','Fresh test: 5 сезонни продукта под 15 лв.'],
 linkedin:['Wirello Market разширява екипа по e-commerce и customer experience.','Нови вътрешни обучения за store managers през август.','Wirello+ премина 340 000 активни членове.']
};
Object.entries(POSTS).forEach(([source,posts])=>posts.forEach((text,i)=>{push(source,`post_${i+1}_text`,text,60+i*47+(source.length*3));push(source,`post_${i+1}_url`,'',61+i*47+(source.length*3))}));

const compSeries={
 cmp_vestamart:[['campaign_intensity',84],['search_visibility',86],['rating',4.37],['ratings',23640],['social_activity',86],['news_mentions',61],['delivery_offer_strength',92]],
 cmp_nordela:[['campaign_intensity',67],['search_visibility',77],['rating',4.31],['ratings',15120],['social_activity',71],['news_mentions',37],['delivery_offer_strength',69]],
 cmp_urbanbasket:[['campaign_intensity',74],['search_visibility',71],['rating',4.48],['ratings',9320],['social_activity',83],['news_mentions',29],['delivery_offer_strength',81]],
 cmp_fresco:[['campaign_intensity',63],['search_visibility',66],['rating',4.55],['ratings',7180],['social_activity',74],['news_mentions',24],['delivery_offer_strength',58]]
};
Object.entries(compSeries).forEach(([source,metrics],si)=>{for(let d=1;d<=29;d+=4){metrics.forEach(([metric,base],mi)=>{const noise=((d+mi*3+si*5)%9)-4;push(source,metric,metric==='rating'?rnd(base+noise*.01,2):Math.max(1,Math.round(base+noise)),d*1440+si*37+mi)})}});

// Additional reputation / attitudes observations spread through the month.
for(let d=1;d<=30;d+=2){
 push('reviews_national','rating',rnd(4.36+Math.sin(d/4)*.04+d*.0015,2),d*1440+50);
 push('reviews_national','review_count',18120+d*12,d*1440+52);
 push('consumer_forums','consumer_opinion_index',rnd(73.8+Math.sin(d/5)*1.8+d*.06,1),d*1440+55);
 push('media_monitor','news_mentions_daily',Math.max(0,Math.round(1.3+Math.sin(d/3)*1.1)),d*1440+57);
}

function dailyValue(day,total,start,end,amp,phase){const p=day/(total-1);return start+(end-start)*p+Math.sin(day/11+phase)*amp+Math.sin(day/29+phase*.7)*amp*.45;}
const HISTORY=[];
for(let i=0;i<365;i++){
 const date=new Date(Date.now()-(364-i)*DAY);date.setHours(9,0,0,0);
 const bl=rnd(clamp(dailyValue(i,365,68.1,78.1,1.15,.4)),1);
 const presence=rnd(clamp(dailyValue(i,365,69.0,78.4,1.3,.9)),1);
 const digital=rnd(clamp(dailyValue(i,365,70.5,82.1,1.0,1.2)),1);
 const reputation=rnd(clamp(dailyValue(i,365,76.2,79.6,.8,2.0)),1);
 const content=rnd(clamp(dailyValue(i,365,67.4,76.8,1.5,2.8)),1);
 const interest=rnd(clamp(dailyValue(i,365,69.5,79.2,1.7,1.7)),1);
 const competitive=rnd(clamp(dailyValue(i,365,70.3,74.9,1.0,2.5)),1);
 const media=rnd(clamp(dailyValue(i,365,65.0,72.4,1.8,1.1)),1);
 const opinion=rnd(clamp(dailyValue(i,365,71.4,75.8,1.1,2.3)),1);
 const risk=rnd(clamp(dailyValue(i,365,34.0,28.3,2.3,2.6)),1);
 const competitors=COMPETITORS.map((c,ci)=>{const starts=[71.0,70.3,69.2,64.3,63.8],ends=[78.2,74.9,72.7,69.8,67.4];return {name:c.name,score:rnd(clamp(dailyValue(i,365,starts[ci],ends[ci],.8+ci*.12,.7+ci)),1)}});
 HISTORY.push({created_at:date.toISOString(),payload:{blis_index:bl,indices:[{key:'presence',value:presence},{key:'digital',value:digital},{key:'reputation',value:reputation},{key:'content',value:content},{key:'interest',value:interest},{key:'competitive',value:competitive},{key:'media',value:media},{key:'consumer_opinion',value:opinion},{key:'reputation_pressure',value:risk}],competitors}});
}
// Pin the latest daily snapshot to the exact headline values.
HISTORY[HISTORY.length-1]={created_at:atDays(0,9),payload:{blis_index:78.1,indices:DASHBOARD.indices.map(x=>({key:x.key,value:x.value})),competitors:COMPETITORS.map(x=>({name:x.name,score:x.score}))}};

const QUALITY={configured_sources:SOURCES.length,sources_with_data:24,coverage:96,confidence:94.2,reliability:93,freshness:'обновено днес',synthetic:true};
const KEYWORDS=[
 {title:'Wirello Select',keyword:'wirello select',display:'+31%',value:31,explanation:'Положителните продуктови споменавания са над предходния 30-дневен период.'},
 {title:'Цена и стойност',keyword:'price value',display:'+22%',value:22,explanation:'Темата расте в review и consumer discussion средата.'},
 {title:'Чакане на касите',keyword:'checkout wait',display:'+41%',value:41,explanation:'Негативната тема се среща в четири магазина и изисква наблюдение.'},
 {title:'Безплатна доставка',keyword:'free delivery',display:'Ново',value:18,explanation:'VestaMart увеличава конкурентния натиск с нов delivery offer.'},
 {title:'Fresh / healthy',keyword:'fresh healthy',display:'+17%',value:17,explanation:'Категорията расте в секторното съдържание и при Fresco Point.'},
 {title:'Wirello+',keyword:'wirello plus',display:'+8.6%',value:8.6,explanation:'Loyalty активността продължава да се увеличава.'},
 {title:'TikTok',keyword:'tiktok',display:'4.6×',value:4.6,explanation:'Една публикация е значително над собствената историческа база.'},
 {title:'Брандово търсене',keyword:'wirello market',display:'+18.4%',value:18.4,explanation:'Нараства относителният интерес към марката и private label.'},
 {title:'Доставка',keyword:'delivery',display:'+12%',value:12,explanation:'Повишен интерес към срок, цена и удобство на доставката.'},
 {title:'Свежест',keyword:'freshness',display:'+9%',value:9,explanation:'Свежестта остава най-често позитивно споменаван атрибут.'}
];
const REPORTS=[
 {id:'monthly',title:'Месечен аналитичен обзор — Wirello Market',period:'Август 2026'},
 {id:'reputation',title:'Репутационен анализ — Wirello Market',period:'Август 2026'},
 {id:'competitive',title:'Конкурентен анализ — Wirello Market',period:'Август 2026'},
 {id:'signals',title:'Анализ на сигналите — Wirello Market',period:'Август 2026'},
 {id:'digital',title:'Digital Intelligence — Wirello Market',period:'Август 2026'},
 {id:'social',title:'Social Intelligence — Wirello Market',period:'Август 2026'},
 {id:'attitudes',title:'Нагласи и потребителски теми — Wirello Market',period:'Август 2026'},
 {id:'weekly',title:'Седмичен BLIS Pulse — Wirello Market',period:'17–23 август 2026'}
];
const EXPORTS=[
 {id:'e1',title:'Седмичен BLIS Pulse',format:'PDF',created_at:ago(1440)},
 {id:'e2',title:'Конкурентен snapshot',format:'CSV',created_at:ago(2880)},
 {id:'e3',title:'Reputation evidence pack',format:'HTML',created_at:ago(4320)},
 {id:'e4',title:'Digital Intelligence snapshot',format:'PDF',created_at:ago(5760)}
];

window.fetch=function(input,init){
 let u;try{u=new URL(typeof input==='string'?input:input.url,location.origin)}catch(e){return previousFetch(input,init)}
 const p=u.pathname;if(!p.startsWith('/api/clients/wirello/'))return previousFetch(input,init);
 const ep=p.split('/').pop();
 if(ep==='dashboard')return response({...DASHBOARD,data_updated:new Date().toISOString()});
 if(ep==='sources')return response(SOURCES);
 if(ep==='history')return response(HISTORY);
 if(ep==='data-quality')return response(QUALITY);
 if(ep==='activity')return response(ACTIVITY);
 if(ep==='keywords')return response(KEYWORDS);
 if(ep==='alerts')return response(SIGNALS);
 if(ep==='reports')return response(REPORTS);
 if(ep==='exports')return response(EXPORTS);
 if(ep==='refresh')return response({ok:true,engine:{version:'wirello-demo-v3',running:false,last_run:new Date().toISOString(),successful:24,failed:1},dashboard:{...DASHBOARD,data_updated:new Date().toISOString()}});
 return previousFetch(input,init);
};

window.WIRELLO_DEMO_V3={dashboard:DASHBOARD,sources:SOURCES,activity:ACTIVITY,history:HISTORY,signals:SIGNALS,keywords:KEYWORDS,reports:REPORTS};
})();
