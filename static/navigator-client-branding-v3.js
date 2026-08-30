/* BLIS Navigator — canonical client profile header v5.
   Verified official brand artwork only. Local manifest assets are rendered only when their
   provenance is an approved official brand domain. Missing/failed assets fall back to text.
   This component owns client chrome only and never participates in routing or analytical rendering. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_BRANDING_V5)return;window.__BLIS_CLIENT_BRANDING_V5=true;

const P={
  aroma:{name:'Aroma Cosmetics',type:'Козметика'},
  bolyarka:{name:'Болярка ВТ АД',type:'Пивоварна компания'},
  'astor-garden':{name:'Astor Garden Hotel',type:'Хотелиерство'},
  'varna-towers':{name:'Varna Towers',type:'Бизнес център / недвижими имоти'},
  mollox:{name:'MOLLOX България',type:'Професионална хигиена'},
  everbet:{name:'Everbet',type:'Онлайн казино и спортни залози'},
  wirello:{name:'Wirello Market',type:'Демо профил'}
};
const OFFICIAL={
  aroma:['aroma.bg'],
  bolyarka:['boliarka.bg'],
  'astor-garden':['astorgardenhotel.com'],
  'varna-towers':['varnatowers.bg'],
  mollox:['mollox.bg'],
  everbet:['everbet.bg']
};
const BLOCKED=/(?:favicon|apple-touch-icon|fontawesome|fa-(?:brands|solid|regular)|\/fonts?\/|sprite|payment|partner|tenant|vendor)/i;
const cache=new Map();
let manifest={};
let manifestPromise=null;
let paintToken=0;
const N=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function current(){try{const q=new URLSearchParams(location.search).get('client');if(P[q])return q}catch(_){}const b=document.body?.dataset?.client;if(P[b])return b;return P[window.BLIS_INITIAL_CLIENT]?window.BLIS_INITIAL_CLIENT:'aroma'}
function score(){return N(window.D?.blis_index)}
function state(v){if(v==null)return['Няма достатъчно данни','neutral'];if(v>=85)return['Много силна позиция','excellent'];if(v>=70)return['Силна позиция','good'];if(v>=55)return['Стабилна позиция','stable'];if(v>=40)return['За наблюдение','watch'];return['Изисква внимание','risk']}
function period(){const d=N(window.BLISPeriod?.days);return d&&d>0?Math.round(d):null}
function lastSync(){const x=document.getElementById('lastSync')?.textContent?.trim();return x&&x!=='—'?x:'—'}
function officialSource(k,source){if(!source||BLOCKED.test(source))return false;try{const h=new URL(source,location.origin).hostname.toLowerCase().replace(/^www\./,'');return(OFFICIAL[k]||[]).some(d=>h===d||h.endsWith('.'+d))}catch(_){return false}}
function validLocal(path){return typeof path==='string'&&path.startsWith('/client-logos/')&&!path.includes('..')&&!BLOCKED.test(path)}
async function loadManifest(force){
  if(force){manifestPromise=null;manifest={};cache.clear()}
  if(manifestPromise)return manifestPromise;
  manifestPromise=fetch('/client-logos/manifest.json?v=20260830-header-v5',{cache:'no-store'})
    .then(r=>r.ok?r.json():null)
    .then(j=>{const out={};Object.entries(j?.logos||{}).forEach(([k,v])=>{if(P[k]&&k!=='wirello'&&validLocal(v?.path)&&officialSource(k,v?.source))out[k]={path:v.path,source:v.source}});manifest=out;return manifest})
    .catch(()=>manifest);
  return manifestPromise;
}
function resolveLogo(k){
  const path=manifest[k]?.path||'';if(!path)return Promise.resolve(null);
  if(cache.has(path))return cache.get(path);
  const pr=new Promise(resolve=>{const im=new Image();im.decoding='async';im.onload=()=>resolve(path);im.onerror=()=>resolve(null);im.src=path+'?v=20260830-header-v5'});cache.set(path,pr);return pr;
}
function css(){
  if(document.getElementById('blisBrandingV5Css'))return;
  const s=document.createElement('style');s.id='blisBrandingV5Css';s.textContent=`
  .topbar.blis-client-header{min-height:86px!important;height:auto!important;padding:11px 15px!important;border:1px solid #dbe6ef!important;border-radius:18px!important;background:rgba(255,255,255,.98)!important;box-shadow:0 8px 26px rgba(26,63,101,.05)!important;display:grid!important;grid-template-columns:minmax(310px,1fr) auto auto!important;align-items:center!important;gap:18px!important;margin-bottom:10px!important}
  .topbar.blis-client-header .title{margin:0!important;min-width:0!important}.bch5-brand{display:flex;align-items:center;gap:14px;min-width:0}.bch5-logo{width:126px;height:58px;flex:0 0 126px;border:1px solid #e2eaf1;border-radius:13px;background:#fff;display:flex;align-items:center;justify-content:center;padding:7px 10px;overflow:hidden;box-sizing:border-box}.bch5-logo.empty{display:none!important}.bch5-logo img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain!important;object-position:center!important;filter:none!important;transform:none!important}
  .bch5-copy{min-width:0}.bch5-kicker{font-size:8px;font-weight:850;letter-spacing:.09em;text-transform:uppercase;color:#8195a7;margin-bottom:4px}.bch5-name{font-size:22px;line-height:1.08;font-weight:850;letter-spacing:-.035em;color:#173e64;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bch5-type{margin-top:5px;font-size:9px;color:#73889c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bch5-health{display:flex;align-items:center;gap:11px;padding:8px 13px;border-left:1px solid #e4ebf2;border-right:1px solid #e4ebf2;min-width:176px}.bch5-index{font-size:26px;font-weight:900;letter-spacing:-.05em;color:#1f65b7;line-height:1}.bch5-health-copy span{display:block;font-size:7px;text-transform:uppercase;letter-spacing:.07em;color:#8194a6;font-weight:900}.bch5-health-copy b{display:block;margin-top:4px;font-size:9px;color:#355a78}.bch5-health.good b,.bch5-health.excellent b{color:#2f9569}.bch5-health.watch b{color:#b38125}.bch5-health.risk b{color:#c45550}
  .topbar.blis-client-header .toptools{display:flex!important;align-items:center!important;gap:8px!important;margin:0!important}.topbar.blis-client-header .datebox{height:38px!important;padding:0 13px!important;border:1px solid #d8e4ee!important;border-radius:12px!important;background:#fff!important;color:#486985!important;font-size:9px!important;font-weight:800!important;box-shadow:none!important}.bch5-update{font-size:8px;color:#7d91a4;line-height:1.35;white-space:nowrap}.bch5-update b{color:#42657f}.sync{display:none!important}
  .client-brand-mark,.client-option-mark{display:none!important}.client-brand-type,.client-brand-status,.client-option small{display:none!important}.client-brand-copy{display:block!important}.client-option{grid-template-columns:1fr auto!important}.client-option>span:nth-child(2){min-width:0}.client-option b{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  @media(max-width:980px){.topbar.blis-client-header{grid-template-columns:minmax(230px,1fr) auto!important}.bch5-health{display:none}.bch5-logo{width:102px;flex-basis:102px}.bch5-name{font-size:19px}}
  @media(max-width:680px){.topbar.blis-client-header{grid-template-columns:1fr!important;gap:9px!important}.bch5-logo{width:88px;height:50px;flex-basis:88px}.bch5-name{font-size:18px}.bch5-update{display:none}}
  `;document.head.appendChild(s)
}
function cleanLegacy(){
  document.querySelectorAll('.bch4-health,.bch3-health,.bch-health').forEach(n=>n.remove());
  document.querySelectorAll('.bch4-update,.bch3-update,.bch-update').forEach(n=>n.remove());
  document.querySelectorAll('.client-brand-mark,.client-option-mark').forEach(n=>{n.replaceChildren();n.removeAttribute('style')});
  document.querySelectorAll('.client-brand-type,.client-brand-status,.client-option small').forEach(n=>{n.textContent=''});
}
async function mountLogo(slot,k,token){
  if(!slot)return;const u=await resolveLogo(k);if(token!==paintToken||!slot.isConnected)return;
  if(!u){slot.classList.add('empty');slot.replaceChildren();return}
  const im=document.createElement('img');im.src=u+'?v=20260830-header-v5';im.alt=P[k]?.name||'';im.decoding='async';im.loading='eager';
  im.addEventListener('error',()=>{slot.classList.add('empty');slot.replaceChildren()},{once:true});slot.replaceChildren(im);slot.classList.remove('empty')
}
function paintHeader(){
  css();cleanLegacy();const k=current(),p=P[k]||P.aroma,bar=document.querySelector('.topbar');if(!bar)return;const token=++paintToken,v=score(),st=state(v);bar.classList.add('blis-client-header');
  let title=bar.querySelector('.title');if(!title){title=document.createElement('div');title.className='title';bar.prepend(title)}
  title.innerHTML=`<div class="bch5-brand"><span class="bch5-logo empty" data-bch5-logo aria-hidden="true"></span><div class="bch5-copy"><div class="bch5-kicker">Клиентски профил</div><div class="bch5-name">${esc(p.name)}</div><div class="bch5-type">${esc(p.type)}</div></div></div>`;
  mountLogo(title.querySelector('[data-bch5-logo]'),k,token);
  let h=bar.querySelector('.bch5-health');if(!h){h=document.createElement('div');h.className='bch5-health';bar.insertBefore(h,bar.querySelector('.toptools')||null)}h.className=`bch5-health ${st[1]}`;h.innerHTML=`<strong class="bch5-index">${v==null?'—':Math.round(v)}</strong><div class="bch5-health-copy"><span>BLIS индекс</span><b>${esc(st[0])}</b></div>`;
  let tools=bar.querySelector('.toptools');if(!tools){tools=document.createElement('div');tools.className='toptools';bar.appendChild(tools)}const d=tools.querySelector('.datebox'),days=period();if(d&&days)d.textContent=`Последните ${days} дни ⌄`;
  let u=tools.querySelector('.bch5-update');if(!u){u=document.createElement('div');u.className='bch5-update';tools.appendChild(u)}u.innerHTML=`Актуализация<br><b>${esc(lastSync())}</b>`;
}
function paintSwitcher(){
  const k=current(),p=P[k]||P.aroma;document.querySelectorAll('.client-brand-name').forEach(n=>n.textContent=p.name);document.querySelectorAll('.client-option[data-client-key]').forEach(o=>{const q=P[o.dataset.clientKey],b=o.querySelector('b');if(b&&q)b.textContent=q.name});
}
async function paint(){await loadManifest();paintHeader();paintSwitcher();document.documentElement.dataset.clientBranding='verified-logo-v5'}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(paint))}
['blis:clientdata','blis:routechange','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(e=>window.addEventListener(e,schedule));window.addEventListener('popstate',schedule);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.BLISClientBrandingV5={paint,profiles:P,loadManifest};window.BLISClientBrandingV4=window.BLISClientBrandingV5;window.BLISClientBrandingV3=window.BLISClientBrandingV5;
})();