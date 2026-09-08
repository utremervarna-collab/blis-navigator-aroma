/* KUB EN/RU final split-fragment cleanup. */
(function(){
'use strict';
if(!/^\/kub-(?:crisis\.html|private|live|client|mobile(?:\.html)?)$/i.test(location.pathname))return;
const q=new URLSearchParams(location.search);let saved='';try{saved=(localStorage.getItem('blis.language.v1')||'').toLowerCase()}catch(_){ }
const req=(q.get('lang')||'').toLowerCase();const lang=['bg','en','ru'].includes(req)?req:(['bg','en','ru'].includes(saved)?saved:'bg');if(lang==='bg')return;
window.__KUB_FINAL_FRAGMENTS=lang;
const EN={
'Покритие: новини':'Coverage: news','Покритие:':'Coverage:','новини':'news',
'и публично индексирано web съдържание се събират автоматично.':'and publicly indexed web content are collected automatically.',
'Закрити групи, непублични профили и съдържание, което не се индексира от търсачки, не се представят като пълно покритие без директен API или лицензиран доставчик.':'Closed groups, non-public profiles and content not indexed by search engines are not presented as complete coverage without a direct API or licensed provider.',
'публично индексирано web съдържание':'publicly indexed web content','се събират автоматично.':'are collected automatically.',
'Закрити групи':'Closed groups','непублични профили':'non-public profiles','съдържание, което не се индексира от търсачки':'content not indexed by search engines','пълно покритие':'complete coverage','лицензиран доставчик':'licensed provider',
'КУБ Корпорация':'KUB Corporation','KYB Corporation':'KUB Corporation','KYB / KUB':'KUB / KUB'
};
const RU={
'Покритие: новини':'Охват: новости','Покритие:':'Охват:','новини':'новости',
'и публично индексирано web съдържание се събират автоматично.':'и публично индексируемый web-контент собираются автоматически.',
'Закрити групи, непублични профили и съдържание, което не се индексира от търсачки, не се представят като пълно покритие без директен API или лицензиран доставчик.':'Закрытые группы, непубличные профили и контент, не индексируемый поисковыми системами, не представляются как полный охват без прямого API или лицензированного поставщика.',
'публично индексирано web съдържание':'публично индексируемый web-контент','се събират автоматично.':'собираются автоматически.','Закрити групи':'Закрытые группы','непублични профили':'непубличные профили','съдържание, което не се индексира от търсачки':'контент, не индексируемый поисковыми системами','пълно покритие':'полный охват','лицензиран доставчик':'лицензированный поставщик'
};
const D=lang==='en'?EN:RU,K=Object.keys(D).sort((a,b)=>b.length-a.length);
function tr(s){let o=String(s||'');for(const k of K)if(o.includes(k))o=o.split(k).join(D[k]);return o}
let busy=false;
function apply(root){if(busy)return;busy=true;try{const r=root||document.body;if(!r)return;const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;return p&&!/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(p.tagName)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),a=[];while(w.nextNode())a.push(w.currentNode);for(const n of a){const v=tr(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v}}finally{busy=false}}
function boot(){apply(document.body);[100,350,900,1800,2600].forEach(x=>setTimeout(()=>apply(document.body),x));const mo=new MutationObserver(ms=>{if(busy)return;for(const m of ms){const p=m.target.nodeType===1?m.target:m.target.parentElement;if(p&&p.closest&&p.closest('#sources,#settings,#stakeholders,#evidence')){setTimeout(()=>apply(p.closest('.page')||document.body),30);break}}});mo.observe(document.body,{subtree:true,childList:true,characterData:true});document.addEventListener('click',e=>{if(e.target.closest('#nav'))[40,200,700].forEach(x=>setTimeout(()=>apply(document.body),x))},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
