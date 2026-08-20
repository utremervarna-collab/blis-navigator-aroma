(() => {
  'use strict';

  const STYLE_ID='pmGlobeVisualV3';
  let drag=null;

  function injectStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .pm-stage.network.pm-globe-active{
        background:
          radial-gradient(ellipse at 54% 48%,rgba(22,119,255,.075) 0%,rgba(22,119,255,.028) 30%,rgba(255,255,255,0) 57%),
          linear-gradient(180deg,#fbfdff 0%,#f7faff 100%)!important;
        overflow:hidden!important;
        perspective:1500px!important;
      }
      .pm-stage.network.pm-globe-active:before{
        opacity:.22!important;
        background-image:
          linear-gradient(rgba(209,220,235,.34) 1px,transparent 1px),
          linear-gradient(90deg,rgba(209,220,235,.34) 1px,transparent 1px)!important;
        background-size:54px 54px!important;
        mask-image:radial-gradient(ellipse at 54% 50%,#000 0 51%,transparent 72%)!important;
      }
      .pm-stage.network.pm-globe-active:after{
        content:'3D МРЕЖА · ЗАВЪРТИ С МИШКАТА'!important;
        right:18px!important;bottom:15px!important;left:auto!important;top:auto!important;
        width:auto!important;height:auto!important;background:rgba(255,255,255,.84)!important;
        border:1px solid #dfe7f1!important;border-radius:999px!important;padding:6px 10px!important;
        color:#5b687a!important;font-size:9px!important;font-weight:800!important;letter-spacing:.075em!important;
        opacity:1!important;z-index:90!important;box-shadow:0 4px 12px rgba(16,24,40,.05)!important;
      }
      .pm-stage.network.pm-globe-active .pm-lanes{display:none!important}
      .pm-stage.network.pm-globe-active .pm-canvas{transform-style:preserve-3d!important}
      .pm-stage.network.pm-globe-active .pm-globe-shell-v2{
        left:54%!important;top:50%!important;width:61%!important;height:79%!important;
        border:1.5px solid color-mix(in srgb,var(--pm-accent) 38%,#b9c9dc)!important;
        background:
          radial-gradient(circle at 34% 28%,rgba(255,255,255,.98) 0 7%,rgba(255,255,255,.58) 22%,transparent 42%),
          radial-gradient(ellipse at 54% 55%,color-mix(in srgb,var(--pm-accent) 8%,white) 0%,color-mix(in srgb,var(--pm-accent) 3%,white) 52%,rgba(241,246,252,.82) 76%,rgba(231,239,249,.95) 100%)!important;
        box-shadow:
          inset -34px -22px 68px rgba(49,76,112,.12),
          inset 20px 14px 34px rgba(255,255,255,.74),
          0 22px 54px rgba(44,72,110,.10)!important;
        opacity:1!important;z-index:1!important;
      }
      .pm-stage.network.pm-globe-active .pm-globe-shell-v2 i{display:none!important}
      .pm-globe-grid-v3{
        position:absolute;left:54%;top:50%;width:61%;height:79%;transform:translate(-50%,-50%);
        z-index:2;pointer-events:none;transform-style:preserve-3d;transition:transform .12s linear;
      }
      .pm-globe-grid-v3 svg{width:100%;height:100%;overflow:visible}
      .pm-globe-grid-v3 .outer{fill:none;stroke:color-mix(in srgb,var(--pm-accent) 42%,#aebed1);stroke-width:1.5}
      .pm-globe-grid-v3 .minor{fill:none;stroke:color-mix(in srgb,var(--pm-accent) 20%,#d8e2ee);stroke-width:1;opacity:.82}
      .pm-globe-grid-v3 .major{fill:none;stroke:color-mix(in srgb,var(--pm-accent) 28%,#c4d2e3);stroke-width:1.15;opacity:.92}
      .pm-globe-grid-v3 .back{stroke-dasharray:4 6;opacity:.42}
      .pm-globe-grid-v3 .axis{stroke:color-mix(in srgb,var(--pm-accent) 18%,#d2dce8);stroke-width:1;opacity:.58}
      .pm-globe-halo-v3{
        position:absolute;left:54%;top:50%;width:70%;height:88%;transform:translate(-50%,-50%);
        border-radius:50%;pointer-events:none;z-index:0;
        background:radial-gradient(ellipse at center,color-mix(in srgb,var(--pm-accent) 7%,transparent) 0 36%,transparent 66%);
        filter:blur(1px);
      }
      .pm-globe-badge-v3{
        position:absolute;left:18px;top:16px;z-index:75;display:flex;align-items:center;gap:7px;
        padding:7px 10px;border:1px solid #dce5f0;border-radius:999px;background:rgba(255,255,255,.9);
        color:#516071;font-size:9px;font-weight:800;letter-spacing:.06em;pointer-events:none;
        box-shadow:0 5px 16px rgba(16,24,40,.05)
      }
      .pm-globe-badge-v3 i{width:7px;height:7px;border-radius:50%;background:var(--pm-accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--pm-accent) 12%,transparent)}
      .pm-stage.network.pm-globe-active .pm-links{z-index:4!important}
      .pm-stage.network.pm-globe-active .pm-link{stroke:#aebfd3!important;stroke-width:1.3!important;opacity:.50!important}
      .pm-stage.network.pm-globe-active .pm-link.cross{stroke-dasharray:5 7!important;opacity:.30!important}
      .pm-stage.network.pm-globe-active .pm-link.hot{stroke:var(--pm-accent)!important;stroke-width:2.35!important;opacity:1!important;filter:drop-shadow(0 0 3px color-mix(in srgb,var(--pm-accent) 36%,transparent))}
      .pm-stage.network.pm-globe-active .pm-node{
        min-width:118px!important;max-width:158px!important;padding:9px 11px 10px!important;border-radius:13px!important;
        background:rgba(255,255,255,.94)!important;border:1px solid rgba(198,210,225,.96)!important;
        backdrop-filter:blur(4px);box-shadow:0 8px 20px rgba(42,58,78,.09)!important;
        transform:translate(-50%,-50%) scale(calc(var(--gscale,1) * 1.03))!important;
      }
      .pm-stage.network.pm-globe-active .pm-node.globe-front{box-shadow:0 12px 28px rgba(37,58,86,.15)!important;border-color:color-mix(in srgb,var(--node,var(--pm-accent)) 34%,#d9e1eb)!important}
      .pm-stage.network.pm-globe-active .pm-node.globe-back{filter:saturate(.72) blur(.12px);box-shadow:0 4px 12px rgba(42,58,78,.05)!important}
      .pm-stage.network.pm-globe-active .pm-node .pm-kind{display:block!important;font-size:7px!important;opacity:.58;margin-bottom:2px!important}
      .pm-stage.network.pm-globe-active .pm-node b{font-size:10.5px!important;line-height:1.25!important}
      .pm-stage.network.pm-globe-active .pm-node small{font-size:9px!important;margin-top:3px!important}
      .pm-stage.network.pm-globe-active .pm-node.selected{z-index:88!important;box-shadow:0 0 0 4px color-mix(in srgb,var(--pm-accent) 11%,transparent),0 18px 36px rgba(33,52,79,.20)!important}
      .pm-stage.network.pm-globe-active:not(.depth) .pm-globe-grid-v3,
      .pm-stage.network.pm-globe-active:not(.depth) .pm-globe-shell-v2{opacity:.55!important}
      @media(max-width:900px){.pm-globe-badge-v3{display:none}.pm-stage.network.pm-globe-active .pm-globe-shell-v2,.pm-globe-grid-v3{width:68%!important}}
    `;
    document.head.appendChild(s);
  }

  function ensureVisuals(stage){
    if(!stage||!stage.classList.contains('network')||!stage.classList.contains('pm-globe-active'))return;
    injectStyles();
    const canvas=stage.querySelector('.pm-canvas');
    if(!canvas)return;
    if(!canvas.querySelector('.pm-globe-halo-v3')){
      const halo=document.createElement('div');halo.className='pm-globe-halo-v3';canvas.prepend(halo);
    }
    if(!canvas.querySelector('.pm-globe-grid-v3')){
      const g=document.createElement('div');g.className='pm-globe-grid-v3';
      g.innerHTML=`<svg viewBox="0 0 600 600" aria-hidden="true">
        <ellipse class="outer" cx="300" cy="300" rx="286" ry="286"/>
        <ellipse class="major" cx="300" cy="300" rx="78" ry="284"/>
        <ellipse class="major" cx="300" cy="300" rx="158" ry="284"/>
        <ellipse class="minor back" cx="300" cy="300" rx="228" ry="284"/>
        <ellipse class="major" cx="300" cy="300" rx="284" ry="72"/>
        <ellipse class="major" cx="300" cy="300" rx="284" ry="144"/>
        <ellipse class="minor back" cx="300" cy="300" rx="284" ry="214"/>
        <line class="axis" x1="14" y1="300" x2="586" y2="300"/>
        <line class="axis" x1="300" y1="14" x2="300" y2="586"/>
      </svg>`;
      canvas.prepend(g);
    }
    if(!stage.querySelector('.pm-globe-badge-v3')){
      const b=document.createElement('div');b.className='pm-globe-badge-v3';b.innerHTML='<i></i>ИНТЕРАКТИВНА 3D СФЕРА';stage.appendChild(b);
    }
    stage.querySelectorAll('.pm-node').forEach(n=>{
      const op=parseFloat(n.style.opacity||'1');
      n.classList.toggle('globe-front',op>=.82);
      n.classList.toggle('globe-back',op<.68);
    });
  }

  function activeStage(){return document.querySelector('#market.page.active .pm-stage.network.pm-globe-active')}
  function tick(){const s=activeStage();if(s)ensureVisuals(s)}

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-view="network"],[data-depth],#nav [data-page="market"]')){
      setTimeout(tick,100);setTimeout(tick,420);setTimeout(tick,900);
    }
  },true);

  document.addEventListener('pointerdown',e=>{
    const s=e.target.closest('.pm-stage.network.pm-globe-active.depth');
    if(!s||e.button!==0||e.target.closest('.pm-node'))return;
    const grid=s.querySelector('.pm-globe-grid-v3');
    if(!grid)return;
    drag={stage:s,grid,x:e.clientX,y:e.clientY,rx:0,ry:0};
  },true);
  document.addEventListener('pointermove',e=>{
    if(!drag)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    const ry=Math.max(-18,Math.min(18,dx*.035));
    const rx=Math.max(-12,Math.min(12,-dy*.03));
    drag.grid.style.transform=`translate(-50%,-50%) perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  },true);
  function stop(){if(drag?.grid)drag.grid.style.transform='translate(-50%,-50%)';drag=null}
  document.addEventListener('pointerup',stop,true);document.addEventListener('pointercancel',stop,true);

  injectStyles();
  setInterval(tick,450);
  setTimeout(tick,250);
})();