/* BLIS Navigator — verified public social post fallback.
   Shows only manually verified public posts when the automatic collector has no clean records. */
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
      },
      Facebook:{
        profile:'https://www.facebook.com/aroma.official/',
        checked:'19.08.2026',
        posts:[]
      }
    }
  };

  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const client=()=>String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.slug||'aroma');

  function feedName(section){
    return section?.querySelector('.sm-network-feed-head b')?.textContent?.trim()||'';
  }

  function renderPosts(section,data){
    if(!section||!data?.posts?.length)return false;
    const host=section.querySelector('.sm-network-posts');
    if(!host)return false;
    const count=section.querySelector('.sm-network-feed-head small');
    if(count)count.textContent=data.posts.length+' публикации';
    host.innerHTML=data.posts.map(p=>`<a class="sm-network-post" href="${esc(data.profile)}" target="_blank" rel="noopener noreferrer" data-verified-public-post="1"><div><p>${esc(p.text)}</p><span>${esc(p.when)} · публично потвърдено ${esc(data.checked)}</span></div><em>Отвори ↗</em></a>`).join('');
    return true;
  }

  function addProfileLink(section,data){
    if(!section||!data?.profile||section.querySelector('[data-social-profile-link]'))return;
    const head=section.querySelector('.sm-network-feed-head');
    if(!head)return;
    const a=document.createElement('a');
    a.dataset.socialProfileLink='1';
    a.href=data.profile;a.target='_blank';a.rel='noopener noreferrer';
    a.textContent='Профил ↗';
    a.style.cssText='margin-left:8px;color:#1766e8;text-decoration:none;font-size:10px;font-weight:700';
    head.appendChild(a);
  }

  function apply(){
    const root=document.getElementById('socialBody');
    if(!root)return;
    const map=VERIFIED[client()];
    if(!map)return;
    root.querySelectorAll('.sm-network-feed').forEach(section=>{
      const name=feedName(section),data=map[name];
      if(!data)return;
      addProfileLink(section,data);
      const hasClean=[...section.querySelectorAll('.sm-network-post p')].some(p=>{
        const t=(p.textContent||'').trim();
        return t.length>12&&!/class=|data-tracking|href=|<img|__blis_empty__/i.test(t);
      });
      if(!hasClean&&data.posts?.length)renderPosts(section,data);
    });
  }

  let timer=0;
  const schedule=()=>{clearTimeout(timer);timer=setTimeout(apply,80)};
  function init(){
    schedule();
    const root=document.getElementById('socialBody');
    if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});
    setInterval(()=>{if(document.getElementById('social')?.classList.contains('active'))apply()},1500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();