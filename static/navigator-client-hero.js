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
        .topbar{position:relative!important;overflow:hidden!important;isolation:isolate!important;background:#eef3f7!important}
        .topbar:before,.topbar:after{display:none!important}
        .client-photo-bg{position:absolute;inset:0;z-index:0;background-position:center center;background-size:cover;background-repeat:no-repeat;opacity:1;filter:saturate(.96) contrast(1.02);transition:background-image .28s ease,opacity .28s ease,transform .45s ease;transform:scale(1.01)}
        .topbar:hover .client-photo-bg{transform:scale(1.025)}
        .client-photo-veil{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.72) 0%,rgba(255,255,255,.52) 28%,rgba(255,255,255,.20) 52%,rgba(255,255,255,.05) 76%,rgba(255,255,255,0) 100%)}
        .topbar .title,.topbar .toptools{position:relative!important;z-index:3!important}
        body[data-client="aroma"] .client-photo-bg{background-position:center 46%}
        body[data-client="bolyarka"] .client-photo-bg{background-position:center 48%}
        body[data-client="astor-garden"] .client-photo-bg{background-position:center 52%}
        body[data-client="bolyarka"] .client-photo-veil{background:linear-gradient(90deg,rgba(255,250,244,.78) 0%,rgba(255,248,239,.52) 28%,rgba(255,244,230,.18) 54%,rgba(255,245,232,0) 100%)}
        body[data-client="astor-garden"] .client-photo-veil{background:linear-gradient(90deg,rgba(255,255,255,.76) 0%,rgba(249,253,252,.50) 28%,rgba(240,250,248,.16) 54%,rgba(239,249,247,0) 100%)}
        @media(max-width:1100px){.client-photo-veil{background:linear-gradient(90deg,rgba(255,255,255,.82) 0%,rgba(255,255,255,.58) 45%,rgba(255,255,255,.12) 100%)}}
      `;document.head.appendChild(st);
    }
    let bg=top.querySelector('.client-photo-bg');if(!bg){bg=document.createElement('div');bg.className='client-photo-bg';top.prepend(bg)}
    let veil=top.querySelector('.client-photo-veil');if(!veil){veil=document.createElement('div');veil.className='client-photo-veil';bg.after(veil)}
    return bg;
  }
  async function imageFor(key){
    if(cache[key])return cache[key];
    const url=assets[key]||assets.aroma;
    const txt=(await fetch(url+'?v=20260817-photo2',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('hero '+r.status);return r.text()})).trim();
    return cache[key]='data:image/webp;base64,'+txt;
  }
  async function apply(){
    const bg=ensureStructure();if(!bg)return;
    const key=document.body.dataset.client||'aroma';
    bg.style.opacity='.25';
    try{const src=await imageFor(key);if((document.body.dataset.client||'aroma')!==key)return;bg.style.backgroundImage=`url("${src}")`;requestAnimationFrame(()=>bg.style.opacity='1')}catch(e){console.warn('BLIS hero image',e);bg.style.opacity='0'}
  }
  function init(){apply();new MutationObserver(m=>{if(m.some(x=>x.attributeName==='data-client'))apply()}).observe(document.body,{attributes:true,attributeFilter:['data-client']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
