/* BLIS Navigator — verified social posts compatibility layer v2. */
(function(){
  'use strict';

  const VERIFIED={
    aroma:{
      LinkedIn:{
        profile:'https://www.linkedin.com/company/aroma-cosmetics-ad',
        checked:'19.08.2026',
        posts:[
          {when:'последните 4 седмици',text:'Днес отворихме заедно нова глава в историята на Арома…'},
          {when:'последния месец',text:'Очакваме те на 20 юни във Videnie Immersive Space…'},
          {when:'последния месец',text:'Да бъдеш финалист в категория „Най-добър производител“ е не само чест…'}
        ]
      }
    }
  };

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const client=()=>String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.slug||'aroma').toLowerCase();
  const dirty=t=>/class=|data-tracking|data-control|href=|<img|<svg|organization_guest|public_biz|__blis_empty__/i.test(String(t||''));

  function apply(){
    const root=document.getElementById('socialBody');
    const map=VERIFIED[client()];
    if(!root||!map)return;

    root.querySelectorAll('.sm-network-feed').forEach(section=>{
      const name=section.querySelector('.sm-network-feed-head b')?.textContent?.trim();
      const data=map[name];
      if(!data||!data.posts?.length)return;
      const host=section.querySelector('.sm-network-posts');
      if(!host)return;

      const existing=[...host.querySelectorAll('.sm-network-post p')].map(p=>(p.textContent||'').trim()).filter(t=>t.length>12&&!dirty(t));
      if(existing.length)return;

      const count=section.querySelector('.sm-network-feed-head small');
      if(count)count.textContent=data.posts.length+' публикации';
      host.innerHTML=data.posts.map(p=>`<a class="sm-network-post" href="${esc(data.profile)}" target="_blank" rel="noopener noreferrer" data-verified-public-post="1"><div><p>${esc(p.text)}</p><span>${esc(p.when)} · публично потвърдено ${esc(data.checked)}</span></div><em>Отвори ↗</em></a>`).join('');

      const head=section.querySelector('.sm-network-feed-head');
      if(head&&!head.querySelector('[data-social-profile-link]')){
        const a=document.createElement('a');
        a.dataset.socialProfileLink='1';a.href=data.profile;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Профил ↗';
        a.style.cssText='margin-left:8px;color:#1766e8;text-decoration:none;font-size:10px;font-weight:700';
        head.appendChild(a);
      }
    });
  }

  let timer=0;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(apply,40)};
  function init(){
    [0,80,250,600,1200,2500].forEach(ms=>setTimeout(apply,ms));
    const root=document.getElementById('socialBody');
    if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    setInterval(()=>{if(document.getElementById('social')?.classList.contains('active'))apply()},1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
