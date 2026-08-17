/* BLIS Navigator — photographic client hero loader */
(function(){
  const assets={
    aroma:'/hero-aroma-micro.txt',
    bolyarka:'/hero-bolyarka-micro.txt',
    'astor-garden':'/hero-astor-micro.txt'
  };
  const cache={};
  function ensureStructure(){
    const top=document.querySelector('.topbar'); if(!top)return null;
    if(!document.getElementById('blisHeroPhotoStyle')){
      const st=document.createElement('style');st.id='blisHeroPhotoStyle';st.textContent=`
        .topbar{position:relative!important;overflow:hidden!important;isolation:isolate!important;background:#fff!important}
        .topbar:before{display:none!important}
        .client-photo-bg{position:absolute;inset:0;z-index:0;background-position:center center;background-size:cover;background-repeat:no-repeat;opacity:1;transition:background-image .28s ease,opacity .28s ease}
        .client-photo-veil{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.98) 0%,rgba(255,255,255,.94) 28%,rgba(255,255,255,.72) 49%,rgba(255,255,255,.38) 72%,rgba(255,255,255,.18) 100%)}
        .topbar .title,.topbar .toptools{position:relative!important;z-index:3!important}
        body[data-client="bolyarka"] .client-photo-veil{background:linear-gradient(90deg,rgba(255,251,247,.98) 0%,rgba(255,250,244,.91) 30%,rgba(255,247,236,.63) 52%,rgba(255,245,232,.26) 100%)}
        body[data-client="astor-garden"] .client-photo-veil{background:linear-gradient(90deg,rgba(255,255,255,.98) 0%,rgba(255,255,255,.92) 28%,rgba(246,252,250,.63) 52%,rgba(239,249,247,.24) 100%)}
        @media(max-width:1100px){.client-photo-veil{background:linear-gradient(90deg,rgba(255,255,255,.98) 0%,rgba(255,255,255,.91) 52%,rgba(255,255,255,.45) 100%)}}
      `;document.head.appendChild(st);
    }
    let bg=top.querySelector('.client-photo-bg');if(!bg){bg=document.createElement('div');bg.className='client-photo-bg';top.prepend(bg)}
    let veil=top.querySelector('.client-photo-veil');if(!veil){veil=document.createElement('div');veil.className='client-photo-veil';bg.after(veil)}
    return bg;
  }
  async function imageFor(key){
    if(cache[key])return cache[key];
    const url=assets[key]||assets.aroma;
    const txt=(await fetch(url,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('hero '+r.status);return r.text()})).trim();
    return cache[key]='data:image/webp;base64,'+txt;
  }
  async function apply(){
    const bg=ensureStructure();if(!bg)return;
    const key=document.body.dataset.client||'aroma';
    bg.style.opacity='.35';
    try{const src=await imageFor(key);if((document.body.dataset.client||'aroma')!==key)return;bg.style.backgroundImage=`url("${src}")`;requestAnimationFrame(()=>bg.style.opacity='1')}catch(e){console.warn('BLIS hero image',e);bg.style.opacity='0'}
  }
  function init(){apply();new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-client'))apply()}).observe(document.body,{attributes:true,attributeFilter:['data-client']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
