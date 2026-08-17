/* BLIS Navigator — photographic client hero loader */
(function(){
  const base='https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/main/static/';
  const assets={
    aroma:base+'hero-aroma-micro.txt',
    bolyarka:base+'hero-bolyarka-micro.txt',
    'astor-garden':base+'hero-astor-micro.txt'
  };
  const cache={};

  function ensureStructure(){
    const top=document.querySelector('.topbar');
    if(!top)return null;
    if(!document.getElementById('blisHeroPhotoStyle')){
      const st=document.createElement('style');
      st.id='blisHeroPhotoStyle';
      st.textContent=`
        .topbar{position:relative;overflow:hidden;isolation:isolate}
        .topbar .client-photo-bg{position:absolute;inset:0;z-index:-2;background-position:center;background-size:cover;background-repeat:no-repeat;opacity:.92;transition:background-image .22s ease,opacity .22s ease}
        .topbar .client-photo-veil{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(7,20,35,.82) 0%,rgba(7,20,35,.52) 42%,rgba(7,20,35,.20) 100%);pointer-events:none}
        body[data-client="aroma"] .topbar .client-photo-veil{background:linear-gradient(90deg,rgba(255,255,255,.92) 0%,rgba(255,255,255,.66) 44%,rgba(255,255,255,.22) 100%)}
        body[data-client="astor-garden"] .topbar .client-photo-veil{background:linear-gradient(90deg,rgba(5,28,36,.76) 0%,rgba(5,28,36,.43) 46%,rgba(5,28,36,.14) 100%)}
      `;
      document.head.appendChild(st);
    }
    let bg=top.querySelector('.client-photo-bg');
    if(!bg){bg=document.createElement('div');bg.className='client-photo-bg';top.prepend(bg)}
    let veil=top.querySelector('.client-photo-veil');
    if(!veil){veil=document.createElement('div');veil.className='client-photo-veil';bg.after(veil)}
    return bg;
  }

  async function imageFor(key){
    if(cache[key])return cache[key];
    const url=assets[key]||assets.aroma;
    const txt=(await fetch(url+'?v=20260817-restore2',{cache:'no-store',mode:'cors'}).then(r=>{
      if(!r.ok)throw new Error('hero '+r.status);
      return r.text();
    })).replace(/\s+/g,'');
    if(!txt)throw new Error('empty hero asset');
    return cache[key]='data:image/webp;base64,'+txt;
  }

  async function apply(){
    const bg=ensureStructure();
    if(!bg)return;
    const key=document.body.dataset.client||'aroma';
    try{
      const src=await imageFor(key);
      bg.style.backgroundImage=`url("${src}")`;
      bg.dataset.heroClient=key;
      bg.style.opacity='1';
    }catch(err){
      console.error('BLIS client hero:',err);
    }
  }

  function init(){
    apply();
    new MutationObserver(m=>{
      if(m.some(x=>x.attributeName==='data-client'))apply();
    }).observe(document.body,{attributes:true,attributeFilter:['data-client']});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
