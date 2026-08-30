/* BLIS Navigator — final English coverage and late-render pass. */
(function(){
'use strict';
const T={
'cmp_albis · Професионални почистващи препарати и хигиенни консумативи - Albis.bg':'cmp_albis · Professional cleaning products and hygiene supplies - Albis.bg',
'Новинарски споменавания':'News mentions',
'cmp_pachico · ПаЧико: Професионална хигиена и дезинфекция':'cmp_pachico · PaChiko: Professional hygiene and disinfection',
'official_site · Пивоварна Болярка':'official_site · Bolyarka Brewery',
'Good morning, Болярка!':'Good morning, Bolyarka!',
'Good afternoon, Болярка!':'Good afternoon, Bolyarka!',
'Good evening, Болярка!':'Good evening, Bolyarka!',
'Видимост':'Visibility',
'Сигнали':'Signals'
};
window.BLIS_EN_TRANSLATIONS=Object.assign({},window.BLIS_EN_TRANSLATIONS||{},T);
function rescan(){try{window.BLISI18N?.apply(document)}catch(_){}}
function schedule(){[250,700,1250,1900,2800,4200].forEach(ms=>setTimeout(rescan,ms));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
let timer=0;
const observer=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(rescan,60)});
if(document.documentElement)observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder','alt','value']});
setTimeout(()=>observer.disconnect(),7000);
})();
