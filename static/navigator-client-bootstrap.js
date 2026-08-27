/* BLIS Navigator — establish the selected client before legacy app.js boots. */
(function(){
  'use strict';
  const allowed=new Set(['aroma','bolyarka','astor-garden','varna-towers','mollox','wirello']);
  function selectedClient(){
    try{
      const q=new URLSearchParams(location.search).get('client');
      if(q&&allowed.has(q))return q;
    }catch(e){}
    try{
      const saved=localStorage.getItem('blis-client-ui');
      if(saved&&allowed.has(saved))return saved;
    }catch(e){}
    return 'aroma';
  }
  const selected=selectedClient();
  window.BLIS_INITIAL_CLIENT=selected;
  try{localStorage.setItem('blis-client-ui',selected)}catch(e){}
  try{document.body.dataset.client=selected}catch(e){}
  const nativeFetch=window.fetch.bind(window);
  window.fetch=function(input,init){
    let url='';
    try{url=typeof input==='string'?input:(input&&input.url)||''}catch(e){}
    let parsed;
    try{parsed=new URL(url,location.origin)}catch(e){return nativeFetch(input,init)}
    if(parsed.origin===location.origin&&parsed.pathname==='/api/clients'){
      return nativeFetch(input,init).then(async response=>{
        if(!response.ok)return response;
        try{
          const data=await response.clone().json();
          if(!Array.isArray(data))return response;
          const ordered=data.slice().sort((a,b)=>{
            const av=a&&a.slug===selected?0:1;
            const bv=b&&b.slug===selected?0:1;
            return av-bv;
          });
          const headers=new Headers(response.headers);
          headers.delete('content-length');
          headers.delete('content-encoding');
          headers.set('content-type','application/json; charset=utf-8');
          return new Response(JSON.stringify(ordered),{
            status:response.status,
            statusText:response.statusText,
            headers
          });
        }catch(e){return response}
      });
    }
    return nativeFetch(input,init);
  };
})();
