/* BLIS Navigator — verified social posts in normal document flow v4. */
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

  function apply(){
    const root=document.getElementById('socialBody');
    const map=VERIFIED[client()];
    if(!root||!map)return;

    root.querySelectorAll('.sm-network-feed').forEach(section=>{
      const name=section.querySelector('.sm-network-feed-head b')?.textContent?.trim()||'';
      const data=map[name];
      if(!data?.posts?.length)return;
      const host=section.querySelector('.sm-network-posts');
      if(!host)return;

      const clean=[...host.querySelectorAll('.sm-network-post p')].some(p=>{
        const t=(p.textContent||'').trim();
        return t.length>12&&!dirty(t);
      });
      if(clean)return;

      const count=section.querySelector('.sm-network-feed-head small');
      if(count)count.textContent=data.posts.length+' публикации';
      host.innerHTML=data.posts.map(p=>`<a class="sm-network-post" href="${esc(data.profile)}" target="_blank" rel="noopener noreferrer" data-verified-public-post="1"><div><p>${esc(p.text)}</p><span>${esc(p.when)} · проверено ${esc(data.checked)}</span></div><em>Отвори ↗</em></a>`).join('');

      const head=section.querySelector('.sm-network-feed-head');
      if(head&&!head.querySelector('[data-social-profile-link]')){
        const a=document.createElement('a');
        a.dataset.socialProfileLink='1';
        a.href=data.profile;
        a.target='_blank';
        a.rel='noopener noreferrer';
        a.textContent='Профил ↗';
        a.style.cssText='margin-left:8px;color:#1766e8;text-decoration:none;font-size:10px;font-weight:700';
        head.appendChild(a);
      }
    });
  }

  function applySeries(){
    [0,60,180,450,900,1600,2800].forEach(ms=>setTimeout(apply,ms));
  }

  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#nav button[data-page="social"]'))applySeries();
    if(e.target?.closest?.('.client-option[data-client-key]'))setTimeout(applySeries,120);
  },true);
  window.addEventListener('popstate',()=>setTimeout(applySeries,80));

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applySeries,{once:true});
  else applySeries();
})();
