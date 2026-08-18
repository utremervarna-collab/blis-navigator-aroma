/* BLIS Navigator — Varna Towers profile/UI extension. */
(function(){
  'use strict';
  const profile={accent:'#315b78',soft:'#edf4f8',mono:'VT',descriptor:'Бизнес център и смесен комплекс във Варна.',summary:'Varna Towers е многофункционален комплекс на бул. „Владислав Варненчик“ 256, който в актуалното си публично представяне е позициониран основно като бизнес център с Class A офиси и бизнес площи. BLIS наблюдава офисната и търговската оферта, публичната репутация, дигиталната видимост, наемателския микс, локационните сигнали, медийната среда и конкурентните бизнес центрове във Варна.',facts:[['81 506 m²','Обща застроена площ'],['47 604 m²','Обща отдаваема площ'],['600','Подземни паркоместа'],['70% / 8%','Офиси+складове / магазини']],portfolio:['Class A офиси и бизнес площи','Търговски площи','Площи и условия за срещи и мероприятия','Ресторанти и обслужващи услуги','Спортни и тренировъчни центрове','Автомобилни шоуруми и услуги'],assets:['Официален сайт с интерактивни етажи и площи','LinkedIn корпоративен профил','Google Business / Maps присъствие','Официален списък на наематели и услуги','Ключова локация на бул. „Владислав Варненчик“','Разпознаваеми корпоративни наематели'],history:['Комплексът функционира основно като офисен център според актуалното публично представяне','12.03.2025 · официално е публикувано откриването на multi-brand showroom на Honda, Subaru и Moto Morini','Публичната офертна структура включва 18 537 m² офис и 29 067 m² търговска отдаваема площ','Локацията е между центъра на Варна и Международно летище Варна'],links:[['Официален сайт','https://www.varnatowers.bg/'],['Сградата и площите','https://www.varnatowers.bg/sgradata'],['Наематели','https://www.varnatowers.bg/naemateli'],['Локация','https://www.varnatowers.bg/lokacia'],['LinkedIn','https://www.linkedin.com/company/varna-towers'],['Контакти','https://www.varnatowers.bg/kontakti']],notes:['Официално заявена офис/складова запълняемост: 70%','Официално заявена запълняемост на търговската част: 8%','Google Business: 3.9/5 от 349 публични отзива към началното измерване','Публичните Google резултати показват несъответствие в статуса на локацията, което е включено като активно предупреждение']};
  const oldDossier=typeof window.dossier==='function'?window.dossier:null;
  window.dossier=function(){try{if(typeof slug!=='undefined'&&slug==='varna-towers')return profile}catch(e){}return oldDossier?oldDossier():profile};
  const names={gross_build_area_m2:'Обща застроена площ',gross_lease_area_m2:'Обща отдаваема площ',office_gla_m2:'Офис отдаваема площ',retail_gla_m2:'Търговска отдаваема площ',leased_area_m2:'Отдадена площ',parking_spaces:'Подземни паркоместа',office_warehouse_occupancy_pct:'Запълняемост офиси + складове',retail_occupancy_pct:'Запълняемост търговска част',bus_lines:'Автобусни линии',city_center_minutes:'Време до центъра',airport_minutes:'Време до летището',tenant_list_active:'Публичен списък на наемателите',services_list_active:'Публичен списък на услугите'};
  const oldMetric=typeof window.metricName==='function'?window.metricName:null;
  window.metricName=function(k){return names[k]||(oldMetric?oldMetric(k):String(k||'').replaceAll('_',' '))};
  const oldComp=typeof window.compLogo==='function'?window.compLogo:null;
  window.compLogo=function(name){const n=String(name||'').toLowerCase();if(n.includes('varna towers'))return'https://www.google.com/s2/favicons?domain=varnatowers.bg&sz=128';if(n.includes('business park'))return'https://www.google.com/s2/favicons?domain=bpv.bg&sz=128';if(n.includes('varna 115'))return'https://www.google.com/s2/favicons?domain=varna115.com&sz=128';return oldComp?oldComp(name):''};
  const oldDownload=typeof window.download==='function'?window.download:null;
  window.download=function(type,format){let isVT=false;try{isVT=typeof slug!=='undefined'&&slug==='varna-towers'}catch(e){}if(!isVT)return oldDownload?oldDownload(type,format):undefined;const data=window.__VARNA_TOWERS_DATA||{},d=data.dashboard||{},fmt=String(format||'json').toLowerCase();let body='',mime='application/json;charset=utf-8',ext='json';if(fmt==='csv'){mime='text/csv;charset=utf-8';ext='csv';if(type==='competitive'||type==='benchmark'){body='Марка,Индекс,Рейтинг,Отзиви\n'+(d.competitors||[]).map(x=>`"${x.name}",${x.score},${x.rating},${x.ratings}`).join('\n')}else{body='Показател,Стойност\n'+(d.metrics||[]).map(x=>`"${x.label}","${x.value}"`).join('\n')}}else if(fmt==='html'||fmt==='pdf'){mime='text/html;charset=utf-8';ext='html';body=`<!doctype html><meta charset="utf-8"><title>BLIS – Varna Towers</title><style>body{font:14px Arial;max-width:900px;margin:40px;color:#123}h1{color:#173a55}.m{padding:10px 0;border-bottom:1px solid #ddd}</style><h1>BLIS анализ – Varna Towers</h1><p>Начална публична аналитична база • 18.08.2026</p><h2>BLIS индекс: ${d.blis_index}</h2>${(d.metrics||[]).map(x=>`<div class="m"><b>${x.label}</b> — ${x.value}</div>`).join('')}<h2>Конкуренти</h2>${(d.competitors||[]).map(x=>`<div class="m"><b>${x.name}</b> — ${x.score}</div>`).join('')}<p>При нужда от PDF използвайте Print → Save as PDF.</p>`}else body=JSON.stringify(d,null,2);const b=new Blob([body],{type:mime}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=`varna-towers_${type||'summary'}_2026-08-18.${ext}`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)};
  function isVT(){try{return (typeof slug!=='undefined'&&slug==='varna-towers')||document.body.dataset.client==='varna-towers'}catch(e){return document.body.dataset.client==='varna-towers'}}
  let heroData='';
  let heroPromise=null;
  function loadHero(){
    if(heroData)return Promise.resolve(heroData);
    if(!heroPromise){
      heroPromise=fetch('/varna-towers-profile-hero-header-v7.js?v=20260818-vt-header8',{cache:'no-store'})
        .then(r=>{if(!r.ok)throw new Error('Varna Towers hero '+r.status);return r.text()})
        .then(t=>{heroData='data:image/jpeg;base64,'+t.trim();return heroData})
        .catch(()=>{heroPromise=null;return''});
    }
    return heroPromise;
  }
  function applyHero(){
    if(!isVT())return;
    const bg=document.querySelector('.topbar .client-photo-bg');
    if(!bg)return;
    loadHero().then(src=>{
      if(!src||!isVT())return;
      bg.style.setProperty('background-image',`url("${src}")`,'important');
      bg.style.setProperty('background-position','center center','important');
      bg.style.setProperty('background-size','cover','important');
      bg.style.setProperty('background-repeat','no-repeat','important');
      bg.style.setProperty('opacity','1','important');
      bg.style.setProperty('transform','none','important');
    });
  }
  function refreshHero(){
    requestAnimationFrame(()=>{
      applyHero();
      setTimeout(applyHero,120);
      setTimeout(applyHero,420);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refreshHero,{once:true});else refreshHero();
  window.addEventListener('load',refreshHero,{once:true});
  window.addEventListener('blis:clientdata',refreshHero);
  document.addEventListener('click',e=>{if(e.target.closest('[data-client-key="varna-towers"]'))setTimeout(refreshHero,80)});
})();
