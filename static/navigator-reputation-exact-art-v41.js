/* BLIS Navigator — exact uploaded Aroma reputation artwork v41. */
(function(){
'use strict';
if(window.__BLISReputationExactArtV41)return;window.__BLISReputationExactArtV41=true;
const PARTS=[1,2,3,4].map(n=>`/reputation-aroma-exact-v2-0${n}.b64?v=20260819-exact41`);
let srcPromise=null;
function client(){return String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||new URLSearchParams(location.search).get('client')||'aroma')}
async function source(){
 if(srcPromise)return srcPromise;
 srcPromise=Promise.all(PARTS.map(u=>fetch(u,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('art '+r.status);return r.text()})))
   .then(a=>'data:image/webp;base64,'+a.join('').replace(/\s+/g,''));
 return srcPromise;
}
async function apply(){
 const t=document.querySelector('#reputationBody .rp-totem');if(!t)return;
 if(client()!=='aroma'){
   t.classList.remove('rp-exact-aroma');
   t.querySelector('.rp-exact-art')?.remove();
   return;
 }
 t.classList.add('rp-exact-aroma');
 let img=t.querySelector('.rp-exact-art');
 if(!img){img=document.createElement('img');img.className='rp-exact-art';img.alt='Aroma Cosmetics';img.decoding='async';img.draggable=false;t.appendChild(img)}
 if(!img.src){try{img.src=await source()}catch(e){console.error('BLIS exact reputation artwork:',e)}}
}
window.BLISReputationExactArtV41={apply};
})();
