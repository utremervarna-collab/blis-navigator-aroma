/* BLIS Navigator — client dataset + Bolyarka hero consistency fix */
(function(){
  const VALID=['aroma','bolyarka','astor-garden'];
  const bolyarkaAsset='https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/main/static/hero-bolyarka-micro.txt';
  let heroCache='';
  const queryClient=()=>{try{const q=new URLSearchParams(location.search).get('client');return VALID.includes(q)?q:null}catch(e){return null}};

  async function forceDataset(){
    const key=queryClient();
    if(!key)return;
    const sel=document.getElementById('clientSel');
    if(sel)sel.value=key;
    try{slug=key}catch(e){}
    try{
      if(typeof load==='function'){
        await load();
        window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:key}}));
      }
    }catch(e){console.warn('BLIS client dataset reload',e)}
  }

  async function bolyarkaHero(){
    if(heroCache)return heroCache;
    const txt=(await fetch(bolyarkaAsset+'?v=20260817-clientfix1',{cache:'no-store',mode:'cors'}).then(r=>{if(!r.ok)throw new Error('hero '+r.status);return r.text()})).trim();
    heroCache='data:image/webp;base64,'+txt;
    return heroCache;
  }
  async function syncHero(){
    if(document.body.dataset.client!=='bolyarka')return;
    const bg=document.querySelector('.client-photo-bg');
    if(!bg)return;
    try{
      const src=await bolyarkaHero();
      if(document.body.dataset.client!=='bolyarka')return;
      bg.style.backgroundImage='url("'+src+'")';
      bg.style.backgroundPosition='34% 50%';
      bg.style.backgroundSize='cover';
      bg.style.opacity='1';
    }catch(e){console.warn('BLIS Bolyarka hero',e)}
  }

  function init(){
    forceDataset().then(()=>setTimeout(syncHero,80));
    setTimeout(forceDataset,650);
    setTimeout(syncHero,850);
    new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-client'))setTimeout(syncHero,30)}).observe(document.body,{attributes:true,attributeFilter:['data-client']});
    window.addEventListener('blis:clientdata',()=>setTimeout(syncHero,30));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
