/* BLIS Navigator — single presentation-language runtime. No route or analytical ownership. */
(function(){
'use strict';
const STORE='blis.language.v1';
const CYR=/[А-Яа-яЁёЀ-ӿ]/;
const params=new URLSearchParams(location.search);
const requested=(params.get('lang')||'').toLowerCase();
let stored='';try{stored=(localStorage.getItem(STORE)||'').toLowerCase()}catch(_){ }
const lang=(requested==='en'||requested==='bg')?requested:(stored==='en'?'en':'bg');
try{localStorage.setItem(STORE,lang)}catch(_){ }
document.documentElement.lang=lang;
document.documentElement.dataset.blisLang=lang;
window.BLIS_LANGUAGE=lang;

const ATTRS=['title','aria-label','placeholder','alt','value'];
let observer=null;
let scheduled=false;
const pending=new Set();

function liveMap(){return window.BLIS_EN_TRANSLATIONS||{}}
function liveRules(){return window.BLIS_EN_RULES||[]}
function preserveSpace(src,dst){
  const lead=(src.match(/^\s*/)||[''])[0],trail=(src.match(/\s*$/)||[''])[0];
  return lead+dst+trail;
}
function contextual(el,raw){
  const t=raw.trim();
  if(t==='Изход'){
    if(el?.closest?.('.blis-system-step,.blis-stage,.system-step,[data-stage],[data-step]'))return 'Output';
    if(el?.closest?.('#blisClientLogout,.logout,.signout,[data-logout]'))return 'Log out';
    return 'Log out';
  }
  if(t==='Резултат'&&el?.closest?.('.commerce,.service,.package,[data-blis-commerce],[data-service]'))return 'Deliverables';
  if(t==='От'&&el?.closest?.('.price,.commerce,.service,.package,[data-price]'))return 'From';
  return '';
}
function translateString(raw,el){
  if(lang!=='en'||!raw||!CYR.test(raw))return raw;
  const trimmed=raw.trim();if(!trimmed)return raw;
  const ctx=contextual(el,raw);if(ctx)return preserveSpace(raw,ctx);
  const map=liveMap();
  if(Object.prototype.hasOwnProperty.call(map,trimmed))return preserveSpace(raw,map[trimmed]);
  for(const [re,repl] of liveRules()){if(re.test(trimmed)){re.lastIndex=0;return preserveSpace(raw,trimmed.replace(re,repl));}}
  let out=trimmed;
  const composites=[
    ['Август 2026','August 2026'],['август 2026','August 2026'],
    ['Клиентски профил','Client profile'],['BLIS индекс','BLIS Index'],['BLIS Индекс','BLIS Index'],
    ['Последните 30 дни','Last 30 days'],['Последните 7 дни','Last 7 days'],['Последните 90 дни','Last 90 days'],
    ['Пазар и нагласи','Market & Sentiment'],['Риск и възможности','Risks & Opportunities'],['Дигитална видимост','Digital Visibility'],
    ['Пазарни сигнали','Market Signals'],['Конкурентно позициониране','Competitive positioning'],['Месечно обобщение','Monthly summary'],
    ['Репутация и информационна среда','Reputation & Information Environment'],['Дигитално и съдържателно присъствие','Digital & Content Presence'],
    ['мин. четене','min read']
  ];
  for(const [a,b] of composites)out=out.split(a).join(b);
  return out!==trimmed?preserveSpace(raw,out):raw;
}
function translateTextNode(n){
  if(!n||n.nodeType!==3)return;
  const p=n.parentElement;if(!p||/SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TEXTAREA/.test(p.tagName))return;
  const v=n.nodeValue||'',next=translateString(v,p);if(next!==v)n.nodeValue=next;
}
function translateAttrs(el){
  if(!el||el.nodeType!==1)return;
  for(const a of ATTRS){
    const v=el.getAttribute?.(a);if(!v||!CYR.test(v))continue;
    const n=translateString(v,el);if(n!==v)el.setAttribute(a,n);
  }
}
function walk(root){
  if(lang!=='en'||!root)return;
  if(root.nodeType===3){translateTextNode(root);return}
  if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
  if(root.nodeType===1)translateAttrs(root);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,{acceptNode(n){
    if(n.nodeType===1&&/SCRIPT|STYLE|NOSCRIPT|TEMPLATE/.test(n.tagName))return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;
  }});
  let n;while((n=w.nextNode())){if(n.nodeType===3)translateTextNode(n);else translateAttrs(n)}
}
function translateMeta(){
  if(lang!=='en')return;
  const title=translateString(document.title,document.documentElement);if(title!==document.title)document.title=title;
  for(const m of document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]')){
    const v=m.getAttribute('content')||'';const n=translateString(v,m);if(n!==v)m.setAttribute('content',n);
  }
}
function sameOriginURL(href){try{const u=new URL(href,location.href);return u.origin===location.origin?u:null}catch(_){return null}}
function propagateLink(a){
  if(!a||a.tagName!=='A')return;
  const href=a.getAttribute('href')||'';if(!href||href.startsWith('#')||/^(mailto:|tel:|javascript:)/i.test(href))return;
  const u=sameOriginURL(href);if(!u)return;
  if(lang==='en')u.searchParams.set('lang','en');else u.searchParams.delete('lang');
  const next=u.pathname+u.search+u.hash;if(next!==href&&(!/^https?:/i.test(href)||u.origin===location.origin))a.setAttribute('href',next);
}
function propagateLinks(root=document){
  if(root?.tagName==='A')propagateLink(root);
  root?.querySelectorAll?.('a[href]').forEach(propagateLink);
}
function patchFetch(){
  if(window.__blisI18NFetchPatched)return;window.__blisI18NFetchPatched=true;
  const orig=window.fetch;if(typeof orig!=='function')return;
  window.fetch=function(input,init){
    if(lang!=='en')return orig.apply(this,arguments);
    try{
      const raw=typeof input==='string'?input:input?.url;
      if(raw){const u=new URL(raw,location.href);if(u.origin===location.origin&&u.pathname.startsWith('/api/')){
        u.searchParams.set('lang','en');
        if(typeof input==='string')input=u.pathname+u.search+u.hash;
        else if(input instanceof Request)input=new Request(u.toString(),input);
      }}
    }catch(_){ }
    return orig.call(this,input,init);
  };
}
function switchTarget(){return lang==='en'?'bg':'en'}
function changeLanguage(next){
  try{localStorage.setItem(STORE,next)}catch(_){ }
  const u=new URL(location.href);u.searchParams.set('lang',next);location.href=u.pathname+u.search+u.hash;
}
function addSwitch(){
  let btn=document.querySelector('[data-blis-language-switch]');
  if(!btn){
    btn=document.createElement('button');btn.type='button';btn.dataset.blisLanguageSwitch='1';btn.className='blis-lang-switch';
    const isHome=location.pathname==='/'||location.pathname==='/index.html';
    const candidates=isHome?['.top .actions','.topin .actions','.topin','.toptools','.public-topin','.ih-topin','header nav','header','.brand']:['.toptools','.actions','.public-topin','.ih-topin','.topin','header nav','header','.brand'];
    let host=null;for(const s of candidates){host=document.querySelector(s);if(host)break}
    if(host){host.appendChild(btn)}else if(document.body){const row=document.createElement('div');row.className='blis-lang-row';row.appendChild(btn);document.body.insertBefore(row,document.body.firstChild)}
  }
  btn.type='button';btn.dataset.blisLanguageSwitch='1';btn.classList.add('blis-lang-switch');
  btn.textContent=lang==='en'?'BG':'EN';
  btn.setAttribute('aria-label',lang==='en'?'Switch to Bulgarian':'Превключи на английски');
  btn.title=lang==='en'?'Switch to Bulgarian':'Превключи на английски';
  if(!btn.dataset.blisLanguageBound){btn.dataset.blisLanguageBound='1';btn.addEventListener('click',()=>changeLanguage(switchTarget()))}
}
function addStyle(){
  if(document.getElementById('blisI18NStyle'))return;
  const s=document.createElement('style');s.id='blisI18NStyle';s.textContent=`
  .blis-lang-switch{appearance:none;border:1px solid rgba(26,55,80,.20);background:#fff;color:#17324c;border-radius:8px;min-width:46px;height:36px;padding:0 11px;font:800 10px/1 Inter,Segoe UI,Arial,sans-serif;letter-spacing:.08em;cursor:pointer;box-shadow:none;flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center}
  .blis-lang-switch:hover{border-color:rgba(26,55,80,.38);background:#f7fafc}.blis-lang-row{width:min(1180px,calc(100% - 32px));margin:12px auto 0;display:flex;justify-content:flex-end}
  .top .actions>.blis-lang-switch{order:-1}.brand>.blis-lang-switch{margin:12px auto 0;width:auto}
  @media(max-width:720px){.top .actions>.blis-lang-switch{min-width:42px;height:34px;padding:0 9px}}
  `;document.head.appendChild(s);
}
function scanBulgarian(){
  if(lang!=='en'||!document.body)return [];
  const out=[];const ignoreBrand=/^(Болярка(?: ВТ АД)?|Болярка Светло)$/i;
  const visible=el=>{try{const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity||1)>.01&&r.width>0&&r.height>0}catch(_){return false}};
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;if(!p||/SCRIPT|STYLE|NOSCRIPT|TEMPLATE/.test(p.tagName)||!visible(p))return NodeFilter.FILTER_REJECT;const t=(n.nodeValue||'').replace(/\s+/g,' ').trim();return t&&CYR.test(t)&&!ignoreBrand.test(t)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
  while(w.nextNode()){const t=(w.currentNode.nodeValue||'').replace(/\s+/g,' ').trim();if(t&&!out.includes(t))out.push(t)}
  document.documentElement.dataset.blisI18nResidual=String(out.length);
  window.__BLIS_I18N_RESIDUAL=out;
  return out;
}
function apply(root=document){
  if(lang==='en'){walk(root);translateMeta()}propagateLinks(root);addSwitch();
}
function flush(){
  scheduled=false;
  const roots=[...pending];pending.clear();
  for(const r of roots)apply(r);
  if(observer)observer.takeRecords();
  setTimeout(scanBulgarian,60);
}
function schedule(root=document){pending.add(root?.nodeType?root:document);if(!scheduled){scheduled=true;requestAnimationFrame(flush)}}
function observe(){
  if(observer)return;
  observer=new MutationObserver(ms=>{
    for(const m of ms){if(m.type==='characterData')pending.add(m.target);else {pending.add(m.target);m.addedNodes?.forEach(n=>pending.add(n))}}
    if(!scheduled){scheduled=true;requestAnimationFrame(flush)}
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS.concat(['href'])});
}
patchFetch();addStyle();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply(document);observe();setTimeout(()=>schedule(document),80);setTimeout(()=>schedule(document),350);setTimeout(()=>schedule(document),900);setTimeout(scanBulgarian,1200)},{once:true});
else{apply(document);observe();setTimeout(()=>schedule(document),80);setTimeout(()=>schedule(document),350);setTimeout(()=>schedule(document),900);setTimeout(scanBulgarian,1200)}
for(const ev of ['blis:clientdata','blis:periodchange','blis:routechange','blis:navigator-route','blis:rendered','blis:i18n-catalog'])window.addEventListener(ev,()=>{schedule(document);setTimeout(()=>schedule(document),90);setTimeout(()=>schedule(document),260)});
window.BLISI18N={lang,t:(s,el)=>translateString(s,el),apply:schedule,scanBulgarian,setLanguage:changeLanguage,getCatalog:liveMap};
})();
