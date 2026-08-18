(function(){
  const asset='https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/main/static/hero-bolyarka-micro.txt';
  let data='';
  let loading=null;

  async function load(){
    if(data)return data;
    if(loading)return loading;
    loading=fetch(asset+'?v=20260818-hero3',{cache:'no-store',mode:'cors'})
      .then(r=>{if(!r.ok)throw new Error('Bolyarka hero '+r.status);return r.text()})
      .then(txt=>{
        txt=(txt||'').trim();
        if(!txt.startsWith('UklGR'))throw new Error('Invalid Bolyarka WebP payload');
        data='data:image/webp;base64,'+txt;
        return data;
      })
      .catch(e=>{console.warn('BLIS Bolyarka hero',e);loading=null;return ''});
    return loading;
  }

  function activeClient(){
    const bodyKey=(document.body&&document.body.dataset&&document.body.dataset.client)||'';
    if(bodyKey)return bodyKey;
    try{return (typeof slug!=='undefined'&&slug)||''}catch(e){return ''}
  }

  function ensureBackground(){
    const top=document.querySelector('.topbar');
    if(!top)return null;
    let bg=top.querySelector('.client-photo-bg');
    if(!bg){
      bg=document.createElement('div');
      bg.className='client-photo-bg';
      top.prepend(bg);
    }
    if(!top.querySelector('.client-photo-veil')){
      const veil=document.createElement('div');
      veil.className='client-photo-veil';
      bg.after(veil);
    }
    return bg;
  }

  async function apply(){
    if(activeClient()!=='bolyarka')return;
    const bg=ensureBackground();
    if(!bg)return;
    const src=await load();
    if(!src||activeClient()!=='bolyarka')return;
    bg.style.backgroundImage='url("'+src+'")';
    bg.style.backgroundSize='cover';
    bg.style.backgroundPosition='center';
    bg.style.backgroundRepeat='no-repeat';
    bg.style.opacity='1';
  }

  const bodyObserver=new MutationObserver(()=>setTimeout(apply,0));
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:['data-client']});

  document.addEventListener('change',e=>{
    if(e.target&&e.target.id==='clientSel')setTimeout(apply,0);
  },true);
  document.addEventListener('click',()=>setTimeout(apply,120),true);
  window.addEventListener('load',apply);
  setTimeout(apply,100);
  setTimeout(apply,500);
  setTimeout(apply,1200);
})();
