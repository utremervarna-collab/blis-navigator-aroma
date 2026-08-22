/* Wirello Market demo — route/render wake-up only.
   The production Navigator keeps ownership of every page renderer. */
(function(){
  'use strict';
  const q=new URLSearchParams(location.search);
  if(q.get('client')!=='wirello' && window.BLIS_CLIENT_SCOPE!=='wirello' && window.BLIS_INITIAL_CLIENT!=='wirello') return;

  function wake(){
    try{
      window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{client:'wirello',reason:'demo-route'}}));
    }catch(_){ }
  }

  document.addEventListener('click',function(e){
    const b=e.target.closest?.('#nav button[data-page]');
    if(!b)return;
    setTimeout(wake,40);
    setTimeout(wake,180);
    setTimeout(wake,520);
  },false);

  window.addEventListener('popstate',()=>{setTimeout(wake,80);setTimeout(wake,320)});
})();
