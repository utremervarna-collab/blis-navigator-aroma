/* BLIS Navigator 3.0 — readable small-type floor.
   Raises only genuinely small visible copy while preserving icons, metrics and layout hierarchy. */
(function(){
'use strict';
if(window.__BLIS_NAVIGATOR_READABLE_TYPE_V1)return;
window.__BLIS_NAVIGATOR_READABLE_TYPE_V1=true;

const CLASS_NAME='blis-readable-small-type';
const STYLE_ID='blisReadableSmallTypeV1';
const ROOT_SELECTOR='.side,.shell,.modal,.nv3-drawer';
const MIN_SIZE=11;
const SKIP_CLASS=/(?:^|[-_])(icon|glyph|mark|dot|orb|arrow|chevron|logo|brandname|navsym|stream|motion|visual|track|bar|close|zoom)(?:$|[-_])/i;

function installStyle(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    .${CLASS_NAME}{font-size:${MIN_SIZE}px!important;line-height:1.45!important}
    #nav .n3-nav-label.${CLASS_NAME}{font-size:${MIN_SIZE}px!important;line-height:1.35!important}
    .ovh-event>span{min-width:0!important;max-width:100%!important}
    .ovh-event b{min-width:0!important;max-width:100%!important}
    .client-switch-button.blis-client-switch-no-mark{grid-template-columns:minmax(0,1fr) 16px!important}
    .client-switch-button.blis-client-switch-no-mark .client-brand-copy{width:auto!important;min-width:0!important}
    .client-switch-button.blis-client-switch-no-mark .client-switch-chevron{width:auto!important;min-width:16px!important}
    @media(max-width:620px){.${CLASS_NAME}{line-height:1.5!important}}
  `;
  document.head.appendChild(style);
}

function ownText(el){
  return Array.from(el.childNodes).some(node=>node.nodeType===3&&String(node.nodeValue||'').trim().length>1);
}

function shouldRaise(el){
  const isTextElement=el instanceof HTMLElement||(typeof SVGTextElement!=='undefined'&&el instanceof SVGTextElement);
  if(!isTextElement||!ownText(el))return false;
  if(el.closest('[hidden],[aria-hidden="true"],script,style,noscript'))return false;
  if(!(typeof SVGTextElement!=='undefined'&&el instanceof SVGTextElement)&&el.closest('svg,canvas'))return false;
  if(SKIP_CLASS.test(el.getAttribute('class')||''))return false;
  const text=String(el.textContent||'').trim();
  if(text.length<2)return false;
  const size=Number.parseFloat(getComputedStyle(el).fontSize||'0');
  return Number.isFinite(size)&&size>=5&&size<MIN_SIZE;
}

function applyReadableType(root=document){
  installStyle();
  document.querySelectorAll('.client-switch-button').forEach(button=>{
    button.classList.toggle('blis-client-switch-no-mark',!button.querySelector('.client-brand-mark'));
  });
  const scope=root instanceof Element?root:document;
  const nodes=[];
  if(scope instanceof Element&&scope.matches(ROOT_SELECTOR))nodes.push(scope);
  scope.querySelectorAll?.(ROOT_SELECTOR).forEach(container=>nodes.push(container));
  nodes.forEach(container=>{
    const raise=el=>{
      if(!shouldRaise(el))return;
      el.classList.add(CLASS_NAME);
      el.style.setProperty('font-size',`${MIN_SIZE}px`,'important');
      el.style.setProperty('line-height','1.45','important');
    };
    raise(container);
    container.querySelectorAll('*').forEach(raise);
  });
  document.documentElement.dataset.navigatorTypography='readable-small-type-v1';
}

let queued=false;
function schedule(root){
  if(queued)return;
  queued=true;
  requestAnimationFrame(()=>{queued=false;applyReadableType(root instanceof Element?root:document)});
}

const observer=new MutationObserver(records=>{
  if(records.some(record=>record.addedNodes.length))schedule(document);
});

function start(){
  applyReadableType();
  observer.observe(document.body,{subtree:true,childList:true});
  for(const event of ['blis:production-ready','blis:routechange','blis:navigator-route','blis:clientdata','popstate']){
    window.addEventListener(event,()=>schedule(document));
  }
  setTimeout(()=>applyReadableType(),250);
  setTimeout(()=>applyReadableType(),900);
}

window.BLISNavigatorReadableTypeV1={apply:applyReadableType,schedule};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
