/* BLIS Navigator — persistent verified social posts layer v3. */
(function(){
  'use strict';

  const VERIFIED={
    aroma:{
      LinkedIn:{
        profile:'https://www.linkedin.com/company/aroma-cosmetics-ad',
        checked:'19.08.2026',
        posts:[
          {when:'4 седмици',text:'Aroma Cosmetics представя нов етап в историята на марката и кани аудиторията на „Пътешествието на аромата“.'},
          {when:'1 месец',text:'Покана за събитие на 20 юни във Videnie Immersive Space с подаръци и изненади за посетителите.'},
          {when:'1 месец',text:'Aroma е отличена като финалист в категория „Най-добър производител“ и акцентира върху над 100 години експертност.'}
        ]
      }
    }
  };

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const client=()=>String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.slug||'aroma').toLowerCase();
  const dirty=t=>/class=|data-tracking|data-control|href=|<img|<svg|organization_guest|public_biz|__blis_empty__/i.test(String(t||''));

  function hasCleanAutomaticFeed(){
    const root=document.getElementById('socialBody');
    if(!root)return false;
    return [...root.querySelectorAll('.sm-network-post p')].some(p=>{
      const t=(p.textContent||'').trim();
      return t.length>12&&!dirty(t);
    });
  }

  function persistentHTML(map){
    const networks=Object.entries(map).filter(([,d])=>d?.posts?.length);
    if(!networks.length)return '';
    return `<div class="sm-card sm-network-feeds" id="blisPersistentVerifiedPosts" data-verified-feed="v3" style="margin-top:14px"><div class="sm-card-head"><div><h3>ПОСЛЕДНИ ПУБЛИКАЦИИ ПО КАНАЛИ</h3><p>Последни публично потвърдени публикации от наблюдаваните профили</p></div><span class="sm-pill live">● REAL DATA</span></div><div class="sm-network-feed-grid">${networks.map(([name,data])=>`<section class="sm-network-feed"><div class="sm-network-feed-head"><span class="sm-platform-icon ${name.toLowerCase()}">${name==='LinkedIn'?'in':name.slice(0,1)}</span><b>${esc(name)}</b><small>${data.posts.length} публикации</small><a href="${esc(data.profile)}" target="_blank" rel="noopener noreferrer" style="margin-left:8px;color:#1766e8;text-decoration:none;font-size:10px;font-weight:700">Профил ↗</a></div><div class="sm-network-posts">${data.posts.map(p=>`<a class="sm-network-post" href="${esc(data.profile)}" target="_blank" rel="noopener noreferrer"><div><p>${esc(p.text)}</p><span>${esc(p.when)} · проверено ${esc(data.checked)}</span></div><em>Отвори ↗</em></a>`).join('')}</div></section>`).join('')}</div></div>`;
  }

  function ensurePersistent(){
    const section=document.getElementById('social');
    const body=document.getElementById('socialBody');
    const map=VERIFIED[client()];
    if(!section||!body||!map)return;

    const automatic=body.querySelector('.sm-network-feeds');
    const clean=hasCleanAutomaticFeed();
    let persistent=document.getElementById('blisPersistentVerifiedPosts');

    if(clean){
      if(automatic)automatic.style.display='';
      if(persistent)persistent.style.display='none';
      return;
    }

    if(automatic)automatic.style.display='none';
    if(!persistent){
      body.insertAdjacentHTML('afterend',persistentHTML(map));
      persistent=document.getElementById('blisPersistentVerifiedPosts');
    }
    if(persistent)persistent.style.display='';
  }

  function init(){
    [0,60,150,350,700,1200,2000,3500].forEach(ms=>setTimeout(ensurePersistent,ms));
    const social=document.getElementById('social');
    if(social)new MutationObserver(()=>setTimeout(ensurePersistent,25)).observe(social,{childList:true,subtree:true});
    setInterval(()=>{if(document.getElementById('social')?.classList.contains('active'))ensurePersistent()},400);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
