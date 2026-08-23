/* BLIS Navigator — MOLLOX isolated client QA guard. */
(function(){
'use strict';
if(window.__BLISMolloxQAV1)return;window.__BLISMolloxQAV1=true;
const isMollox=()=>document.body?.dataset?.client==='mollox'||window.BLIS_CLIENT_SCOPE==='mollox'||window.BLIS_INITIAL_CLIENT==='mollox'||(()=>{try{return typeof slug!=='undefined'&&slug==='mollox'}catch(_){return false}})();
if(!isMollox())return;
const VERIFIED={
  facts:[['5','Регионални дистрибутора'],['8','Private Label продуктови типа'],['4','Основни индустрии'],['ISO 9001 / 14001','Публично заявени стандарти']],
  descriptor:'Професионални решения за чистота и хигиена за бизнес среда.'
};
function context(){
  window.BLIS_INITIAL_CLIENT='mollox';window.BLIS_CLIENT_SCOPE='mollox';document.body.dataset.client='mollox';
  try{if(typeof slug!=='undefined')slug='mollox'}catch(_){}
  const s=document.getElementById('clientSel');if(s)s.value='mollox';
  document.documentElement.style.setProperty('--client-accent','#7b1028');
  document.documentElement.style.setProperty('--client-soft','#f8eef1');
}
function exactText(root,from,to){
  if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const a=[];while(w.nextNode())a.push(w.currentNode);
  a.forEach(n=>{const t=String(n.nodeValue||'');if(t.trim()===from)n.nodeValue=t.replace(from,to)});
}
function fixMarket(){
  const m=document.getElementById('market');if(!m)return;
  const nav=document.querySelector('#nav [data-page="market"] .navtxt');if(nav)nav.textContent='Нагласи';
  const h=m.querySelector('.pm-hero h2');if(h)h.textContent='Нагласи';
  const p=m.querySelector('.pm-hero p');if(p)p.textContent='Проверими теми, сигнали и връзки, които оформят нагласите към MOLLOX България.';
  const badge=m.querySelector('.pm-client-badge');if(badge){const mark=badge.querySelector('.pm-client-mark');if(mark)mark.textContent='MX';const b=badge.querySelector('b');if(b)b.textContent='MOLLOX България';const sm=badge.querySelector('small');if(sm)sm.textContent='Професионална хигиена';}
  exactText(m,'Aroma Cosmetics','MOLLOX България');exactText(m,'AROMA','MOLLOX');
}
function fixReputation(){
  const r=document.getElementById('reputation');if(!r)return;
  r.querySelectorAll('.rp-exact-label').forEach(x=>{x.textContent='MOLLOX България';x.dataset.client='mollox'});
  exactText(r,'Aroma Cosmetics','MOLLOX България');exactText(r,'AROMA','MOLLOX');
  try{window.BLISReputationExactArtV62?.apply?.();window.BLISReputationExactArtV61?.apply?.();window.BLISReputationExactArtV60?.apply?.()}catch(_){}
}
function fixProfile(){
  const p=document.getElementById('profile');if(!p)return;
  exactText(p,'Aroma Cosmetics','MOLLOX България');exactText(p,'AROMA','MOLLOX');
  // Remove two legacy demo facts if the old dossier renderer produced them.
  p.querySelectorAll('*').forEach(el=>{const t=(el.textContent||'').trim();if(t==='10+ години' || t==='15+')el.textContent=t==='10+ години'?'5':'8'});
  const labels=[...p.querySelectorAll('*')];
  labels.forEach(el=>{const t=(el.textContent||'').trim();if(t==='Присъствие в България')el.textContent='Регионални дистрибутора';if(t==='Продуктови категории')el.textContent='Private Label продуктови типа'});
}
function fixGeneric(){
  const active=document.querySelector('.page.active');if(!active)return;
  exactText(active,'Aroma Cosmetics','MOLLOX България');exactText(active,'AROMA','MOLLOX');
}
function audit(){context();fixGeneric();fixMarket();fixReputation();fixProfile();const jump=document.getElementById('clientJump');if(jump)jump.style.display='none';}
function schedule(){[0,80,260,700].forEach(ms=>setTimeout(audit,ms))}
const root=document.querySelector('.shell')||document.body;const ob=new MutationObserver(()=>schedule());ob.observe(root,{subtree:true,childList:true,characterData:true});
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,[data-page]'))schedule()},true);
window.addEventListener('blis:clientdata',schedule);window.addEventListener('blis:periodchange',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.BLISMolloxQA={audit,schedule,verified:VERIFIED};
})();