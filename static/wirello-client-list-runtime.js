/* BLIS Navigator — expose Wirello MASTER DEMO in the normal client selector. */
(function(){
  'use strict';
  const realFetch=window.fetch.bind(window);
  const demo={slug:'wirello',name:'Wirello Market',sector:'Omnichannel retail / FMCG',note:'MASTER DEMO • Synthetic demonstration data'};
  const jsonResponse=data=>new Response(JSON.stringify(data),{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
  window.fetch=function(input,init){
    let u;try{u=new URL(typeof input==='string'?input:input.url,location.origin)}catch(e){return realFetch(input,init)}
    if(u.pathname!=='/api/clients')return realFetch(input,init);
    return realFetch(input,init).then(async r=>{
      let a=[];try{a=await r.clone().json()}catch(e){}
      if(!Array.isArray(a))a=[];
      a=a.filter(x=>x&&x.slug!=='wirello');
      a.push(demo);
      return jsonResponse(a);
    }).catch(()=>jsonResponse([demo]));
  };
  function addOption(){
    const menu=document.querySelector('.client-switch-menu');
    if(menu&&!menu.querySelector('[data-client-key="wirello"]')){
      const b=document.createElement('button');
      b.type='button';b.className='client-option';b.dataset.clientKey='wirello';b.setAttribute('role','option');b.setAttribute('aria-selected','false');
      b.innerHTML='<span class="client-option-mark" style="background:#0f7568">WM</span><span><b>Wirello Market</b><small>Omnichannel retail • MASTER DEMO</small></span><span class="client-option-check"></span>';
      menu.appendChild(b);
    }
  }
  addOption();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addOption,{once:true});
})();