(function(){
  const asset='https://raw.githubusercontent.com/utremervarna-collab/blis-navigator-aroma/main/static/hero-bolyarka-micro.txt';
  let data='';
  async function load(){
    if(data)return data;
    try{
      const txt=(await fetch(asset+'?v=20260817-fixed',{cache:'no-store',mode:'cors'}).then(r=>{if(!r.ok)throw new Error(r.status);return r.text()})).trim();
      data='data:image/webp;base64,'+txt;
      return data;
    }catch(e){return ''}
  }
  async function apply(){
    let key='';
    try{key=(typeof slug!=='undefined'&&slug)||document.body.dataset.client||''}catch(e){key=document.body.dataset.client||''}
    if(key!=='bolyarka')return;
    const bg=document.querySelector('.topbar .client-photo-bg');
    if(!bg)return;
    const src=await load();
    if(src)bg.style.backgroundImage='url("'+src+'")';
  }
  const obs=new MutationObserver(()=>apply());
  obs.observe(document.body,{attributes:true,attributeFilter:['data-client'],subtree:false});
  document.addEventListener('click',()=>setTimeout(apply,80),true);
  window.addEventListener('load',apply);
  setTimeout(apply,250);
  setTimeout(apply,900);
})();
