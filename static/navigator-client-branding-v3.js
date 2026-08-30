/* BLIS Navigator — canonical client branding v4.
   Name-only client identity. No logos, no business descriptions, no remote artwork. */
(function(){
'use strict';
if(window.__BLIS_CLIENT_BRANDING_V4)return;window.__BLIS_CLIENT_BRANDING_V4=true;

const P={
 aroma:{name:'Aroma Cosmetics'},
 bolyarka:{name:'Болярка ВТ АД'},
 'astor-garden':{name:'Astor Garden Hotel'},
 'varna-towers':{name:'Varna Towers'},
 mollox:{name:'MOLLOX България'},
 everbet:{name:'Everbet'},
 wirello:{name:'Wirello Market'}
};
const N=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function current(){try{const q=new URLSearchParams(location.search).get('client');if(P[q])return q}catch(_){}const b=document.body?.dataset?.client;if(P[b])return b;return P[window.BLIS_INITIAL_CLIENT]?window.BLIS_INITIAL_CLIENT:'aroma'}
function score(){return N(window.D?.blis_index)}
function state(v){if(v==null)return['Няма достатъчно данни','neutral'];if(v>=85)return['Много силна позиция','excellent'];if(v>=70)return['Силна позиция','good'];if(v>=55)return['Стабилна позиция','stable'];if(v>=40)return['За наблюдение','watch'];return['Изисква внимание','risk']}
function period(){return Number(window.BLISPeriod?.days)||30}
function lastSync(){const x=document.getElementById('lastSync')?.textContent?.trim();return x&&x!=='—'?x:'днес'}
function css(){
 if(document.getElementById('blisBrandingV4Css'))return;
 const s=document.createElement('style');s.id='blisBrandingV4Css';s.textContent=`
 .topbar.blis-client-header{min-height:72px!important;height:auto!important;padding:10px 15px!important;border:1px solid #dbe6ef!important;border-radius:18px!important;background:rgba(255,255,255,.98)!important;box-shadow:0 8px 26px rgba(26,63,101,.05)!important;display:grid!important;grid-template-columns:minmax(240px,1fr) auto auto!important;align-items:center!important;gap:18px!important;margin-bottom:10px!important}
 .topbar.blis-client-header .title{margin:0!important;min-width:0!important}.bch4-name{font-size:23px;line-height:1.08;font-weight:850;letter-spacing:-.035em;color:#173e64;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
 .bch4-health{display:flex;align-items:center;gap:11px;padding:8px 13px;border-left:1px solid #e4ebf2;border-right:1px solid #e4ebf2;min-width:176px}.bch4-index{font-size:26px;font-weight:900;letter-spacing:-.05em;color:#1f65b7;line-height:1}.bch4-health-copy span{display:block;font-size:7px;text-transform:uppercase;letter-spacing:.07em;color:#8194a6;font-weight:900}.bch4-health-copy b{display:block;margin-top:4px;font-size:9px;color:#355a78}.bch4-health.good b,.bch4-health.excellent b{color:#2f9569}.bch4-health.watch b{color:#b38125}.bch4-health.risk b{color:#c45550}
 .topbar.blis-client-header .toptools{display:flex!important;align-items:center!important;gap:8px!important;margin:0!important}.topbar.blis-client-header .datebox{height:38px!important;padding:0 13px!important;border:1px solid #d8e4ee!important;border-radius:12px!important;background:#fff!important;color:#486985!important;font-size:9px!important;font-weight:800!important;box-shadow:none!important}.bch4-update{font-size:8px;color:#7d91a4;line-height:1.35;white-space:nowrap}.bch4-update b{color:#42657f}.sync{display:none!important}
 .client-brand-mark,.client-option-mark{display:none!important}.client-brand-type,.client-brand-status,.client-option small{display:none!important}.client-brand-copy{display:block!important}.client-option{grid-template-columns:1fr auto!important}.client-option>span:nth-child(2){min-width:0}.client-option b{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
 @media(max-width:980px){.topbar.blis-client-header{grid-template-columns:minmax(210px,1fr) auto!important}.bch4-health{display:none}.bch4-name{font-size:20px}}@media(max-width:680px){.topbar.blis-client-header{grid-template-columns:1fr!important;gap:9px!important}.bch4-name{font-size:19px}.bch4-update{display:none}}
 `;document.head.appendChild(s)
}
function cleanLegacy(){
 document.querySelectorAll('.bch3-logo,.bch3-type,.bch3-kicker,.bch-logo,.bch-type,.bch-kicker').forEach(n=>n.remove());
 document.querySelectorAll('.client-brand-mark,.client-option-mark').forEach(n=>{n.replaceChildren();n.removeAttribute('style')});
 document.querySelectorAll('.client-brand-type,.client-brand-status,.client-option small').forEach(n=>{n.textContent=''});
}
function paintHeader(){
 css();cleanLegacy();const k=current(),p=P[k]||P.aroma,bar=document.querySelector('.topbar');if(!bar)return;const v=score(),st=state(v);bar.classList.add('blis-client-header');
 let title=bar.querySelector('.title');if(!title){title=document.createElement('div');title.className='title';bar.prepend(title)}title.innerHTML=`<div class="bch4-name">${esc(p.name)}</div>`;
 bar.querySelector('.bch3-health')?.remove();bar.querySelector('.bch-health')?.remove();
 let h=bar.querySelector('.bch4-health');if(!h){h=document.createElement('div');h.className='bch4-health';bar.insertBefore(h,bar.querySelector('.toptools')||null)}h.className=`bch4-health ${st[1]}`;h.innerHTML=`<strong class="bch4-index">${v==null?'—':Math.round(v)}</strong><div class="bch4-health-copy"><span>BLIS индекс</span><b>${esc(st[0])}</b></div>`;
 let tools=bar.querySelector('.toptools');if(!tools){tools=document.createElement('div');tools.className='toptools';bar.appendChild(tools)}const d=tools.querySelector('.datebox');if(d)d.textContent=`Последните ${period()} дни ⌄`;
 tools.querySelector('.bch3-update')?.remove();tools.querySelector('.bch-update')?.remove();let u=tools.querySelector('.bch4-update');if(!u){u=document.createElement('div');u.className='bch4-update';tools.appendChild(u)}u.innerHTML=`Данни към<br><b>${esc(lastSync())}</b>`;
}
function paintSwitcher(){
 cleanLegacy();const k=current(),p=P[k]||P.aroma;
 document.querySelectorAll('.client-brand-name').forEach(n=>n.textContent=p.name);
 document.querySelectorAll('.client-option[data-client-key]').forEach(o=>{const q=P[o.dataset.clientKey];const b=o.querySelector('b');if(b&&q)b.textContent=q.name});
}
function paint(){paintHeader();paintSwitcher();document.documentElement.dataset.clientBranding='name-only-v4'}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(paint))}
['blis:clientdata','blis:routechange','blis:periodchange','blis:intelligence','blis:production-ready'].forEach(e=>window.addEventListener(e,schedule));window.addEventListener('popstate',schedule);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.BLISClientBrandingV4={paint,profiles:P};window.BLISClientBrandingV3=window.BLISClientBrandingV4;
})();