/* BLIS Navigator — global live clock and data pulse, visible on every module. */
(function(){
  'use strict';
  const ID='blisGlobalLive';
  const STYLE='blisGlobalLiveStyles';
  let timer=0;

  function ensureStyle(){
    if(document.getElementById(STYLE))return;
    const s=document.createElement('style');s.id=STYLE;
    s.textContent=`
.blis-system-bar{display:flex!important;align-items:center!important;gap:12px!important}
.blis-global-live{margin-left:auto;display:flex;align-items:center;gap:10px;min-width:245px;padding:7px 10px;border:1px solid rgba(15,117,104,.16);border-radius:10px;background:rgba(247,251,250,.86);backdrop-filter:blur(8px)}
.blis-global-live-dot{width:8px;height:8px;border-radius:50%;background:#16a36a;box-shadow:0 0 0 0 rgba(22,163,106,.34);animation:blisGlobalPulse 1.45s infinite;flex:0 0 auto}
.blis-global-clock{font-variant-numeric:tabular-nums;white-space:nowrap;font-size:13px;line-height:1;color:#0f7568;font-weight:850;letter-spacing:.035em}
.blis-global-meta{min-width:0;display:grid;gap:2px}
.blis-global-meta b{font-size:8.5px;line-height:1.15;color:#344054;font-weight:780;white-space:nowrap}
.blis-global-meta span{font-size:7.5px;line-height:1.15;color:#7b8794;white-space:nowrap}
.blis-global-pulse{display:flex;align-items:end;gap:2px;height:16px;margin-left:2px}
.blis-global-pulse i{display:block;width:2px;border-radius:4px;background:#0f7568;opacity:.55;animation:blisBar 1.1s ease-in-out infinite alternate}
.blis-global-pulse i:nth-child(1){height:5px;animation-delay:-.4s}.blis-global-pulse i:nth-child(2){height:11px;animation-delay:-.2s}.blis-global-pulse i:nth-child(3){height:7px;animation-delay:-.7s}.blis-global-pulse i:nth-child(4){height:14px;animation-delay:-.1s}.blis-global-pulse i:nth-child(5){height:9px;animation-delay:-.5s}
@keyframes blisGlobalPulse{0%{box-shadow:0 0 0 0 rgba(22,163,106,.34)}70%{box-shadow:0 0 0 7px rgba(22,163,106,0)}100%{box-shadow:0 0 0 0 rgba(22,163,106,0)}}
@keyframes blisBar{from{transform:scaleY(.45);opacity:.35}to{transform:scaleY(1);opacity:.8}}
@media(max-width:1050px){.blis-global-live{min-width:0}.blis-global-meta{display:none}}
@media(max-width:760px){.blis-global-pulse{display:none}.blis-global-live{padding:6px 8px}.blis-global-clock{font-size:11px}}
`;
    document.head.appendChild(s);
  }

  function getGlobals(){
    let d={},a=[],s=[];
    try{if(typeof D!=='undefined'&&D)d=D}catch(_){ }
    try{if(typeof A!=='undefined'&&Array.isArray(A))a=A}catch(_){ }
    try{if(typeof S!=='undefined'&&Array.isArray(S))s=S}catch(_){ }
    return{d,a,s};
  }
  function latestSignalTime(){
    const {d,a}=getGlobals(),times=[];
    (d?.signals||[]).forEach(x=>{const t=new Date(x.time||x.created_at||x.createdAt||0).getTime();if(t)times.push(t)});
    a.forEach(x=>{const t=new Date(x.time||x.observed_at||x.created_at||x.timestamp||0).getTime();if(t)times.push(t)});
    return times.length?Math.max(...times):null;
  }
  function elapsed(t){
    if(!t)return'—';
    let sec=Math.max(0,Math.floor((Date.now()-t)/1000));
    const h=Math.floor(sec/3600);sec%=3600;const m=Math.floor(sec/60);const s=sec%60;
    return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
  }
  function mount(){
    ensureStyle();
    const bar=document.querySelector('.blis-system-bar');if(!bar)return;
    let box=document.getElementById(ID);
    if(!box){
      box=document.createElement('div');box.id=ID;box.className='blis-global-live';box.setAttribute('aria-label','BLIS live status');
      box.innerHTML='<i class="blis-global-live-dot"></i><div class="blis-global-meta"><b id="blisGlobalFresh">последен сигнал —</b><span id="blisGlobalSources">активни източници —</span></div><strong class="blis-global-clock" id="blisGlobalClock">LIVE --:--:--</strong><span class="blis-global-pulse" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
      const stream=bar.querySelector('.blis-stream');bar.insertBefore(box,stream||null);
    }
    update();
  }
  function update(){
    const clock=document.getElementById('blisGlobalClock');
    const fresh=document.getElementById('blisGlobalFresh');
    const sources=document.getElementById('blisGlobalSources');
    if(clock)clock.textContent='LIVE '+new Date().toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if(fresh)fresh.textContent='последен сигнал '+elapsed(latestSignalTime());
    if(sources){const n=getGlobals().s.length;sources.textContent=n?`активни източници ${n}`:'активни източници —'}
  }
  function start(){mount();if(timer)clearInterval(timer);timer=setInterval(()=>{if(!document.getElementById(ID))mount();else update()},1000)}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  window.addEventListener('blis:clientdata',()=>setTimeout(mount,20));
  document.addEventListener('click',e=>{if(e.target.closest?.('#nav,.client-option'))setTimeout(mount,40)},true);
  window.BLISGlobalLive={mount,update};
})();
