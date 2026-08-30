/* BLIS Navigator — canonical client branding v3.1.
   Real brand artwork only. Verified local logo bundle first, official remote artwork second.
   No generated marks, initials, favicons or third-party logo substitutes. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_BRANDING_V3)return;window.__BLIS_CLIENT_BRANDING_V3=true;

const P={
 aroma:{name:'Aroma Cosmetics',type:'Козметика',remote:[],cls:'aroma'},
 bolyarka:{name:'Болярка ВТ АД',type:'Пивоварна компания',remote:['https://boliarka.bg/wp-content/uploads/2019/02/logo_2019.png'],cls:'bolyarka'},
 'astor-garden':{name:'Astor Garden Hotel',type:'Хотелиерство',remote:[],cls:'astor'},
 'varna-towers':{name:'Varna Towers',type:'Бизнес център / недвижими имоти',remote:[],cls:'varna-towers'},
 mollox:{name:'MOLLOX България',type:'Професионална хигиена',remote:['https://mollox.bg/assets/img/logo-mollox.png'],cls:'mollox'},
 everbet:{name:'Everbet',type:'Онлайн казино и спортни залози',remote:['https://everbet.bg/assets/icons/logo-left-column-light.svg','https://everbet.bg/assets/icons/logo-left-column-dark.svg'],cls:'everbet'},
 wirello:{name:'Wirello Market',type:'Демо профил',remote:[],cls:'wirello'}
};
const OFFICIAL={
 aroma:['aroma.bg'],
 bolyarka:['boliarka.bg'],
 'astor-garden':['astorgardenhotel.com'],
 'varna-towers':['varnatowers.bg'],
 mollox:['mollox.bg'],
 everbet:['everbet.bg']
};
let manifest={};let manifestPromise=null;
const cache=new Map();
const N=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function current(){try{const q=new URLSearchParams(location.search).get('client');if(P[q])return q}catch(_){}const b=document.body?.dataset?.client;if(P[b])return b;return P[window.BLIS_INITIAL_CLIENT]?window.BLIS_INITIAL_CLIENT:'aroma'}
function score(){return N(window.D?.blis_index)}
function state(v){if(v==null)return['Няма достатъчно данни','neutral'];if(v>=85)return['Много силна позиция','excellent'];if(v>=70)return['Силна позиция','good'];if(v>=55)return['Стабилна позиция','stable'];if(v>=40)return['За наблюдение','watch'];return['Изисква внимание','risk']}
function period(){return Number(window.BLISPeriod?.days)||30}
function lastSync(){const x=document.getElementById('lastSync')?.textContent?.trim();return x&&x!=='—'?x:'днес'}
function officialSource(k,source){if(!source)return false;try{const h=new URL(source,location.origin).hostname.toLowerCase().replace(/^www\./,'');return (OFFICIAL[k]||[]).some(d=>h===d||h.endsWith('.'+d))}catch(_){return false}}
async function loadManifest(){
 if(manifestPromise)return manifestPromise;
 manifestPromise=fetch('/client-logos/manifest.json?v=20260830-local3',{cache:'no-store'})
   .then(r=>r.ok?r.json():null)
   .then(j=>{const raw=j?.logos||{};manifest={};Object.entries(raw).forEach(([k,v])=>{if(P[k]&&v?.path&&officialSource(k,v?.source))manifest[k]=v});return manifest})
   .catch(()=>manifest);
 return manifestPromise;
}
function candidates(k){const local=manifest[k]?.path;return [local,...(P[k]?.remote||[])].filter(Boolean)}
function resolve(k){
 const key=k+'|'+candidates(k).join('|');if(cache.has(key))return cache.get(key);
 const pr=new Promise(resolve=>{const a=candidates(k);let i=0;const next=()=>{if(i>=a.length)return resolve(null);const u=a[i++],im=new Image();im.onload=()=>resolve(u);im.onerror=next;im.src=u};next()});cache.set(key,pr);return pr;
}
function css(){if(document.getElementById('blisBrandingV3Css'))return;const s=document.createElement('style');s.id='blisBrandingV3Css';s.textContent=`
.topbar.blis-client-header{min-height:86px!important;height:auto!important;padding:11px 15px!important;border:1px solid #dbe6ef!important;border-radius:18px!important;background:rgba(255,255,255,.98)!important;box-shadow:0 8px 26px rgba(26,63,101,.05)!important;display:grid!important;grid-template-columns:minmax(310px,1fr) auto auto!important;align-items:center!important;gap:18px!important;margin-bottom:10px!important}
.topbar.blis-client-header .title{margin:0!important;min-width:0!important}.bch3-brand{display:flex;align-items:center;gap:14px;min-width:0}.bch3-logo{width:126px;height:58px;flex:0 0 126px;border:1px solid #e2eaf1;border-radius:13px;background:#fff;display:flex;align-items:center;justify-content:center;padding:7px 10px;overflow:hidden}.bch3-logo.empty{display:none}.bch3-logo img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain!important;filter:none!important;transform:none!important}.bch3-logo img.aroma{max-width:108px}.bch3-logo img.bolyarka{max-width:100px}.bch3-logo img.astor{max-width:86px}.bch3-logo img.varna-towers{max-width:108px}.bch3-logo img.mollox{max-width:102px}.bch3-logo img.everbet{max-width:108px}
.bch3-copy{min-width:0}.bch3-kicker{font-size:8px;font-weight:850;letter-spacing:.09em;text-transform:uppercase;color:#8195a7;margin-bottom:4px}.bch3-name{font-size:22px;line-height:1.08;font-weight:850;letter-spacing:-.035em;color:#173e64;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bch3-type{margin-top:5px;font-size:9px;color:#73889c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bch3-health{display:flex;align-items:center;gap:11px;padding:8px 13px;border-left:1px solid #e4ebf2;border-right:1px solid #e4ebf2;min-width:176px}.bch3-index{font-size:26px;font-weight:900;letter-spacing:-.05em;color:#1f65b7;line-height:1}.bch3-health-copy span{display:block;font-size:7px;text-transform:uppercase;letter-spacing:.07em;color:#8194a6;font-weight:900}.bch3-health-copy b{display:block;margin-top:4px;font-size:9px;color:#355a78}.bch3-health.good b,.bch3-health.excellent b{color:#2f9569}.bch3-health.watch b{color:#b38125}.bch3-health.risk b{color:#c45550}.topbar.blis-client-header .toptools{display:flex!important;align-items:center!important;gap:8px!important;margin:0!important}.topbar.blis-client-header .datebox{height:38px!important;padding:0 13px!important;border:1px solid #d8e4ee!important;border-radius:12px!important;background:#fff!important;color:#486985!important;font-size:9px!important;font-weight:800!important;box-shadow:none!important}.bch3-update{font-size:8px;color:#7d91a4;line-height:1.35;white-space:nowrap}.bch3-update b{color:#42657f}.sync{display:none!important}
.client-brand-mark.blis-real-logo,.client-option-mark.blis-real-logo{background:#fff!important;border:1px solid #e2eaf1!important;color:transparent!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;padding:3px!important}.client-brand-mark.blis-real-logo img,.client-option-mark.blis-real-logo img{display:block!important;max-width:100%!important;max-height:100%!important;width:auto!important;height:auto!important;object-fit:contain!important;filter:none!important;transform:none!important}.client-brand-mark.blis-logo-empty,.client-option-mark.blis-logo-empty{display:none!important}
@media(max-width:980px){.topbar.blis-client-header{grid-template-columns:minmax(230px,1fr) auto!important}.bch3-health{display:none}.bch3-logo{width:102px;flex-basis:102px}.bch3-name{font-size:19px}}@media(max-width:680px){.topbar.blis-client-header{grid-template-columns:1fr!important;gap:9px!important}.bch3-logo{width:88px;height:50px;flex-basis:88px}.bch3-name{font-size:18px}.bch3-update{display:none}}
`;document.head.appendChild(s)}
async function mount(slot,k,cls){if(!slot)return;const u=await resolve(k);if(!slot.isConnected)return;if(!u){slot.classList.add('empty');slot.replaceChildren();return}const im=document.createElement('img');im.src=u;im.alt=P[k]?.name||'';im.className=cls||P[k]?.cls||'';im.decoding='async';im.addEventListener('error',()=>{slot.classList.add('empty');slot.replaceChildren()},{once:true});slot.replaceChildren(im);slot.classList.remove('empty')}
async function brandSmall(slot,k){if(!slot)return;const u=await resolve(k);slot.textContent='';slot.classList.remove('blis-logo-empty','blis-real-logo');if(!u){slot.classList.add('blis-logo-empty');return}const im=document.createElement('img');im.src=u;im.alt=P[k]?.name||'';im.addEventListener('error',()=>{slot.classList.remove('blis-real-logo');slot.classList.add('blis-logo-empty');slot.replaceChildren()},{once:true});slot.classList.add('blis-real-logo');slot.appendChild(im)}
function paintHeader(){css();const k=current(),p=P[k]||P.aroma,bar=document.querySelector('.topbar');if(!bar)return;const v=score(),st=state(v);bar.classList.add('blis-client-header');let title=bar.querySelector('.title');if(!title){title=document.createElement('div');title.className='title';bar.prepend(title)}title.innerHTML=`<div class="bch3-brand"><span class="bch3-logo" data-bch3-logo></span><div class="bch3-copy"><div class="bch3-kicker">Клиентски профил</div><div class="bch3-name">${esc(p.name)}</div><div class="bch3-type">${esc(p.type)}</div></div></div>`;mount(title.querySelector('[data-bch3-logo]'),k,p.cls);let h=bar.querySelector('.bch3-health');if(!h){h=document.createElement('div');h.className='bch3-health';bar.insertBefore(h,bar.querySelector('.toptools')||null)}h.className=`bch3-health ${st[1]}`;h.innerHTML=`<strong class="bch3-index">${v==null?'—':Math.round(v)}</strong><div class="bch3-health-copy"><span>BLIS индекс</span><b>${esc(st[0])}</b></div>`;let tools=bar.querySelector('.toptools');if(!tools){tools=document.createElement('div');tools.className='toptools';bar.appendChild(tools)}const d=tools.querySelector('.datebox');if(d)d.textContent=`Последните ${period()} дни ⌄`;let u=tools.querySelector('.bch3-update');if(!u){u=document.createElement('div');u.className='bch3-update';tools.appendChild(u)}u.innerHTML=`Данни към<br><b>${esc(lastSync())}</b>`}
function paintSwitcher(){const k=current();brandSmall(document.querySelector('.client-brand-mark'),k);document.querySelectorAll('.client-option[data-client-key]').forEach(o=>brandSmall(o.querySelector('.client-option-mark'),o.dataset.clientKey))}
async function paint(){await loadManifest();cache.clear();paintHeader();paintSwitcher();document.documentElement.dataset.clientBranding='local-real-v3-1'}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(paint))}
['blis:clientdata','blis:routechange','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(e=>window.addEventListener(e,schedule));window.addEventListener('popstate',schedule);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.BLISClientBrandingV3={paint,profiles:P,loadManifest};
})();
