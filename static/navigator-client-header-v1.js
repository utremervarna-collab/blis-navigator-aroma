/* BLIS Navigator — canonical client profile header v2.
   Real brand artwork only. No initials, generated marks or favicon substitutes.
   Logos are preloaded before display so a failed remote asset never leaves a broken image.
   This component owns only global client chrome; it never renders analytical pages. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_HEADER_V2)return;window.__BLIS_CLIENT_HEADER_V2=true;

const PROFILES={
  aroma:{
    name:'Aroma Cosmetics',type:'Козметика',
    logos:['https://gbs.rs/slike/Aroma-Cosmetics-Logo-Black.png'],
    logoClass:'wide aroma-logo',artwork:'AROMA Cosmetics'
  },
  bolyarka:{
    name:'Болярка ВТ АД',type:'Пивоварна компания',
    logos:['https://boliarka.bg/wp-content/uploads/2019/02/logo_2019.png'],
    logoClass:'bolyarka-logo',artwork:'Болярка'
  },
  'astor-garden':{
    name:'Astor Garden Hotel',type:'Хотелиерство',
    logos:['https://tooroom.pro/uploads/__sized__/hotel/2023/05/29/astor-garden-hotel-logo-1685393173-thumbnail-400x400.png'],
    logoClass:'astor-logo',artwork:'Astor Garden Hotel'
  },
  'varna-towers':{
    name:'Varna Towers',type:'Бизнес център / недвижими имоти',
    /* No fabricated logo. The clean isolated master asset is not yet present in the project. */
    logos:[],logoClass:'',artwork:'Varna Towers'
  },
  mollox:{
    name:'MOLLOX България',type:'Професионална хигиена',
    logos:['https://mollox.bg/wp-content/uploads/2018/05/logo-mollox.png'],
    logoClass:'mollox-logo',artwork:'MOLLOX'
  },
  everbet:{
    name:'Everbet',type:'Онлайн казино и спортни залози',
    logos:['https://everbet.bg/assets/icons/logo-left-column-light.svg','https://everbet.bg/assets/icons/logo-left-column-dark.svg'],
    logoClass:'wide everbet-logo',artwork:'Everbet'
  },
  wirello:{name:'Wirello Market',type:'Демо профил',logos:[],logoClass:'',artwork:'Wirello Market'}
};

const N=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const logoCache=new Map();
let paintToken=0;
function slug(){
  try{const q=new URLSearchParams(location.search).get('client');if(PROFILES[q])return q}catch(_){}
  const b=document.body?.dataset?.client;if(PROFILES[b])return b;
  if(PROFILES[window.BLIS_INITIAL_CLIENT])return window.BLIS_INITIAL_CLIENT;
  return'aroma';
}
function score(){return N(window.D?.blis_index)}
function state(v){
  if(v==null)return{label:'Няма достатъчно данни',tone:'neutral'};
  if(v>=85)return{label:'Много силна позиция',tone:'excellent'};
  if(v>=70)return{label:'Силна позиция',tone:'good'};
  if(v>=55)return{label:'Стабилна позиция',tone:'stable'};
  if(v>=40)return{label:'За наблюдение',tone:'watch'};
  return{label:'Изисква внимание',tone:'risk'};
}
function period(){return Number(window.BLISPeriod?.days)||30}
function lastSync(){const t=document.getElementById('lastSync')?.textContent?.trim();return t&&t!=='—'?t:'днес'}
function css(){
 if(document.getElementById('blisClientHeaderCssV2'))return;
 const s=document.createElement('style');s.id='blisClientHeaderCssV2';s.textContent=`
 .topbar.blis-client-header{min-height:88px!important;height:auto!important;padding:12px 16px!important;border:1px solid #dbe6ef!important;border-radius:18px!important;background:rgba(255,255,255,.97)!important;box-shadow:0 8px 26px rgba(26,63,101,.055)!important;display:grid!important;grid-template-columns:minmax(280px,1fr) auto auto!important;align-items:center!important;gap:18px!important;margin-bottom:10px!important}
 .topbar.blis-client-header .title{min-width:0!important;margin:0!important}.bch-brand{display:flex;align-items:center;gap:14px;min-width:0}
 .bch-logo{width:118px;height:58px;flex:0 0 118px;border:1px solid #e2eaf1;border-radius:13px;background:#fff;display:flex;align-items:center;justify-content:center;padding:8px 10px;overflow:hidden;box-shadow:0 3px 12px rgba(30,60,90,.035);opacity:0;transition:opacity .18s ease}
 .bch-logo.ready{opacity:1}.bch-logo.no-logo{display:none!important}.bch-logo img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain!important;object-position:center!important;filter:none!important;transform:none!important}
 .bch-logo img.aroma-logo{max-width:102px;max-height:42px}.bch-logo img.bolyarka-logo{max-width:96px;max-height:48px}.bch-logo img.astor-logo{max-width:82px;max-height:48px}.bch-logo img.mollox-logo{max-width:98px;max-height:48px}.bch-logo img.everbet-logo{max-width:104px;max-height:44px}
 .bch-copy{min-width:0}.bch-kicker{font-size:8px;font-weight:850;letter-spacing:.085em;text-transform:uppercase;color:#8296a8;margin-bottom:4px}.bch-name{font-size:22px;line-height:1.08;font-weight:850;letter-spacing:-.035em;color:#173e64;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bch-type{margin-top:5px;font-size:9px;color:#73889c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .bch-health{display:flex;align-items:center;gap:11px;padding:8px 13px;border-left:1px solid #e4ebf2;border-right:1px solid #e4ebf2;min-width:178px}.bch-index{font-size:26px;font-weight:900;letter-spacing:-.05em;color:#1f65b7;line-height:1}.bch-health-copy{line-height:1.15}.bch-health-copy span{display:block;font-size:7px;text-transform:uppercase;letter-spacing:.07em;color:#8194a6;font-weight:900}.bch-health-copy b{display:block;margin-top:4px;font-size:9px;color:#355a78}.bch-health.good .bch-health-copy b,.bch-health.excellent .bch-health-copy b{color:#2f9569}.bch-health.watch .bch-health-copy b{color:#b38125}.bch-health.risk .bch-health-copy b{color:#c45550}
 .topbar.blis-client-header .toptools{display:flex!important;align-items:center!important;gap:8px!important;margin:0!important}.topbar.blis-client-header .datebox{height:38px!important;padding:0 13px!important;border:1px solid #d8e4ee!important;border-radius:12px!important;background:#fff!important;color:#486985!important;font-size:9px!important;font-weight:800!important;box-shadow:none!important}.bch-update{font-size:8px;color:#7d91a4;line-height:1.35;white-space:nowrap}.bch-update b{color:#42657f}.sync{display:none!important}
 @media(max-width:980px){.topbar.blis-client-header{grid-template-columns:minmax(220px,1fr) auto!important}.bch-health{display:none}.bch-logo{width:98px;flex-basis:98px}.bch-name{font-size:19px}}
 @media(max-width:680px){.topbar.blis-client-header{grid-template-columns:1fr!important;gap:10px!important}.bch-logo{width:86px;height:50px;flex-basis:86px}.bch-name{font-size:18px}.topbar.blis-client-header .toptools{justify-content:space-between}.bch-update{display:none}}
 `;document.head.appendChild(s)
}
function resolveLogo(p){
 const key=p.name+'|'+(p.logos||[]).join('|');if(logoCache.has(key))return logoCache.get(key);
 const promise=new Promise(resolve=>{
   const urls=(p.logos||[]).filter(Boolean);let i=0;
   const next=()=>{if(i>=urls.length){resolve(null);return}const url=urls[i++],img=new Image();img.decoding='async';img.onload=()=>resolve(url);img.onerror=next;img.src=url};next();
 });logoCache.set(key,promise);return promise;
}
function skeletonLogo(p){return(p.logos||[]).length?'<span class="bch-logo" data-logo-slot aria-label="'+esc(p.artwork||p.name)+'"></span>':'<span class="bch-logo no-logo" aria-hidden="true"></span>'}
async function mountLogo(slot,p,token){
 if(!slot)return;const url=await resolveLogo(p);if(token!==paintToken||!slot.isConnected)return;
 if(!url){slot.classList.add('no-logo');slot.replaceChildren();return}
 const img=document.createElement('img');img.className=p.logoClass||'';img.alt=p.artwork||p.name;img.decoding='async';img.loading='eager';img.src=url;
 img.addEventListener('error',()=>{slot.classList.remove('ready');slot.classList.add('no-logo');slot.replaceChildren()},{once:true});
 slot.replaceChildren(img);slot.classList.add('ready');
}
function paint(){
 css();const bar=document.querySelector('.topbar');if(!bar)return;const token=++paintToken;
 const k=slug(),p=PROFILES[k]||PROFILES.aroma,v=score(),st=state(v);bar.classList.add('blis-client-header');
 let title=bar.querySelector('.title');if(!title){title=document.createElement('div');title.className='title';bar.prepend(title)}
 title.innerHTML=`<div class="bch-brand">${skeletonLogo(p)}<div class="bch-copy"><div class="bch-kicker">Клиентски профил</div><div class="bch-name">${esc(p.name)}</div><div class="bch-type">${esc(p.type)}</div></div></div>`;
 mountLogo(title.querySelector('[data-logo-slot]'),p,token);
 let health=bar.querySelector('.bch-health');if(!health){health=document.createElement('div');health.className='bch-health';const tools=bar.querySelector('.toptools');bar.insertBefore(health,tools||null)}
 health.className=`bch-health ${st.tone}`;health.innerHTML=`<strong class="bch-index">${v==null?'—':Math.round(v)}</strong><div class="bch-health-copy"><span>BLIS индекс</span><b>${esc(st.label)}</b></div>`;
 let tools=bar.querySelector('.toptools');if(!tools){tools=document.createElement('div');tools.className='toptools';bar.appendChild(tools)}
 const old=tools.querySelector('.datebox');if(old)old.innerHTML=`Последните ${period()} дни ⌄`;
 let upd=tools.querySelector('.bch-update');if(!upd){upd=document.createElement('div');upd.className='bch-update';tools.appendChild(upd)}upd.innerHTML=`Данни към<br><b>${esc(lastSync())}</b>`;
 document.documentElement.dataset.clientHeader='real-brand-v2';
}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(paint))}
['blis:clientdata','blis:routechange','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(ev=>window.addEventListener(ev,schedule));window.addEventListener('popstate',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.BLISClientHeaderV2={paint,profiles:PROFILES};window.BLISClientHeaderV1=window.BLISClientHeaderV2;
})();