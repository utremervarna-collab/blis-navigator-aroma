(() => {
  'use strict';

  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  const rot = { x: -10, y: 18, drag: false, sx: 0, sy: 0, bx: 0, by: 0, stage: null, pointerId: null, raf: 0 };

  function injectStyles(){
    if(document.getElementById('pmGlobeV3Styles')) return;
    const s=document.createElement('style');
    s.id='pmGlobeV3Styles';
    s.textContent=`
      .pm-stage.network.pm-globe-v3{cursor:grab;background:radial-gradient(circle at 50% 47%,rgba(239,247,255,.92) 0,rgba(255,255,255,.98) 44%,#fbfcfe 78%)!important;overflow:hidden!important}
      .pm-stage.network.pm-globe-v3.pm-globe-drag{cursor:grabbing!important;user-select:none!important}
      .pm-stage.network.pm-globe-v3 .pm-lanes{display:none!important}
      .pm-stage.network.pm-globe-v3:before{opacity:.08!important}
      .pm-stage.network.pm-globe-v3:after{content:'ПЛЪЗНИ, ЗА ДА ЗАВЪРТИШ'!important;position:absolute!important;right:18px!important;bottom:14px!important;left:auto!important;top:auto!important;width:auto!important;height:auto!important;background:none!important;color:#667085!important;font-size:9px!important;font-weight:800!important;letter-spacing:.09em!important;opacity:.92!important;z-index:90!important}
      .pm-stage.network.pm-globe-v3 .pm-canvas{transform:scale(var(--pm-scale,1))!important;transform-origin:50% 50%!important;transform-style:flat!important}
      .pm-globe-shell-v3{position:absolute;left:50%;top:50%;width:72%;height:84%;transform:translate(-50%,-50%);border:1px solid rgba(54,119,191,.30);border-radius:50%;background:radial-gradient(circle at 35% 28%,rgba(255,255,255,.98),rgba(230,242,255,.52) 42%,rgba(209,230,250,.18) 68%,rgba(255,255,255,.04) 78%);box-shadow:inset -34px -24px 72px rgba(50,90,130,.08),0 24px 62px rgba(16,24,40,.06);pointer-events:none;z-index:0;overflow:hidden}
      .pm-globe-shell-v3 .meridian,.pm-globe-shell-v3 .parallel{position:absolute;border:1px solid rgba(79,135,194,.16);border-radius:50%;inset:0;will-change:transform}
      .pm-globe-shell-v3 .m1{transform:scaleX(.25)} .pm-globe-shell-v3 .m2{transform:scaleX(.50)} .pm-globe-shell-v3 .m3{transform:scaleX(.75)}
      .pm-globe-shell-v3 .p1{transform:scaleY(.26)} .pm-globe-shell-v3 .p2{transform:scaleY(.52)} .pm-globe-shell-v3 .p3{transform:scaleY(.76)}
      .pm-stage.network.pm-globe-v3 .pm-links{z-index:2!important;pointer-events:none!important}
      .pm-stage.network.pm-globe-v3 .pm-link{stroke:#aebfd2!important;stroke-width:1.15!important;opacity:.42!important;vector-effect:non-scaling-stroke}
      .pm-stage.network.pm-globe-v3 .pm-link.hot{stroke:var(--pm-accent)!important;stroke-width:2.15!important;opacity:.98!important;stroke-dasharray:none!important}
      .pm-stage.network.pm-globe-v3 .pm-node{min-width:108px!important;max-width:148px!important;border-radius:999px!important;padding:8px 11px!important;background:rgba(255,255,255,.97)!important;box-shadow:0 8px 22px rgba(16,24,40,.09)!important;transform:translate(-50%,-50%) scale(var(--gscale,1))!important;transform-origin:50% 50%!important;will-change:left,top,transform,opacity;transition:left .14s ease-out,top .14s ease-out,transform .14s ease-out,opacity .14s ease-out!important}
      .pm-stage.network.pm-globe-v3.pm-globe-drag .pm-node{transition:none!important}
      .pm-stage.network.pm-globe-v3.pm-globe-drag .pm-link{transition:none!important}
      .pm-stage.network.pm-globe-v3 .pm-node .pm-kind{display:none!important}
      .pm-stage.network.pm-globe-v3 .pm-node b{font-size:10px!important;line-height:1.15!important}
      .pm-stage.network.pm-globe-v3 .pm-node small{font-size:9px!important;line-height:1.15!important}
      .pm-stage.network.pm-globe-v3 .pm-node.globe-back{filter:saturate(.72)}
      .pm-stage.network.pm-globe-v3 .pm-node.selected{box-shadow:0 0 0 3px rgba(45,124,212,.13),0 14px 34px rgba(16,24,40,.16)!important}
    `;
    document.head.appendChild(s);
  }

  const activeStage=()=>document.querySelector('#market.page.active .pm-stage.network')||document.querySelector('#market .pm-stage.network');

  function degree(stage){
    const d={};
    stage.querySelectorAll('.pm-node').forEach(n=>d[n.dataset.node]=0);
    stage.querySelectorAll('.pm-link').forEach(l=>{
      if(l.dataset.a in d)d[l.dataset.a]++;
      if(l.dataset.b in d)d[l.dataset.b]++;
    });
    return d;
  }

  function seed(stage){
    const nodes=[...stage.querySelectorAll('.pm-node')];
    const sig=nodes.map(n=>n.dataset.node||'').join('|');
    if(stage.dataset.globeV3Sig===sig && nodes.every(n=>n.dataset.gx))return;
    stage.dataset.globeV3Sig=sig;
    const d=degree(stage);
    nodes.sort((a,b)=>(d[b.dataset.node]||0)-(d[a.dataset.node]||0));
    nodes.forEach((n,i)=>{
      let x,y,z;
      if(i===0){ x=0; y=0; z=.98; }
      else{
        const k=i-1, count=Math.max(1,nodes.length-1);
        y=1-2*((k+.5)/count);
        const r=Math.sqrt(Math.max(0,1-y*y));
        const a=k*GOLDEN+.44;
        x=Math.cos(a)*r;
        z=Math.sin(a)*r;
      }
      n.dataset.gx=x; n.dataset.gy=y; n.dataset.gz=z;
    });
  }

  function rotatePoint(x,y,z,rx,ry){
    const ax=rx*Math.PI/180, ay=ry*Math.PI/180;
    const cy=Math.cos(ay), sy=Math.sin(ay), cx=Math.cos(ax), sx=Math.sin(ax);
    const x1=x*cy+z*sy, z1=-x*sy+z*cy;
    return {x:x1,y:y*cx-z1*sx,z:y*sx+z1*cx};
  }

  function ensureShell(stage){
    const canvas=stage.querySelector('.pm-canvas');
    if(!canvas)return null;
    let shell=canvas.querySelector('.pm-globe-shell-v3');
    if(!shell){
      shell=document.createElement('div');
      shell.className='pm-globe-shell-v3';
      shell.innerHTML='<i class="meridian m1"></i><i class="meridian m2"></i><i class="meridian m3"></i><i class="parallel p1"></i><i class="parallel p2"></i><i class="parallel p3"></i>';
      canvas.prepend(shell);
    }
    return shell;
  }

  function draw(stage){
    if(!stage||!stage.isConnected)return;
    injectStyles();
    stage.classList.add('network','depth','pm-globe-v3');
    seed(stage);
    ensureShell(stage);
    const pos={};
    stage.querySelectorAll('.pm-node').forEach(n=>{
      const p=rotatePoint(+n.dataset.gx||0,+n.dataset.gy||0,+n.dataset.gz||0,rot.x,rot.y);
      const perspective=.88+(p.z+1)*.075;
      const left=50+p.x*34*perspective;
      const top=50+p.y*39*perspective;
      const scale=.72+(p.z+1)*.17;
      const opacity=.38+(p.z+1)*.30;
      n.style.left=left.toFixed(3)+'%';
      n.style.top=top.toFixed(3)+'%';
      n.style.setProperty('--gscale',scale.toFixed(3));
      n.style.opacity=Math.min(1,opacity).toFixed(3);
      n.style.zIndex=20+Math.round((p.z+1)*40);
      n.classList.toggle('globe-front',p.z>=0);
      n.classList.toggle('globe-back',p.z<0);
      pos[n.dataset.node]={x:left*10,y:top*5.9,z:p.z};
    });

    stage.querySelectorAll('.pm-link').forEach(path=>{
      const a=pos[path.dataset.a], b=pos[path.dataset.b];
      if(!a||!b)return;
      const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y;
      const len=Math.max(1,Math.hypot(dx,dy));
      const nx=-dy/len,ny=dx/len;
      const zAvg=(a.z+b.z)/2;
      const curve=18+Math.min(54,len*.055)+(zAvg+1)*7;
      path.setAttribute('d',`M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${(mx+nx*curve).toFixed(1)} ${(my+ny*curve).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      path.style.opacity=(.25+(zAvg+1)*.16).toFixed(3);
    });
  }

  function schedule(stage=activeStage()){
    if(!stage)return;
    rot.stage=stage;
    if(rot.raf)return;
    rot.raf=requestAnimationFrame(()=>{rot.raf=0;draw(stage)});
  }

  function startDrag(e){
    const stage=e.target.closest?.('.pm-stage.network');
    if(!stage||e.button!==0||e.target.closest('.pm-node'))return;
    rot.drag=true;rot.stage=stage;rot.pointerId=e.pointerId;
    rot.sx=e.clientX;rot.sy=e.clientY;rot.bx=rot.x;rot.by=rot.y;
    stage.classList.add('pm-globe-drag');
    try{stage.setPointerCapture?.(e.pointerId)}catch(_){ }
    e.preventDefault();
  }

  function moveDrag(e){
    if(!rot.drag||!rot.stage)return;
    rot.y=rot.by+(e.clientX-rot.sx)*.32;
    rot.x=Math.max(-62,Math.min(62,rot.bx-(e.clientY-rot.sy)*.26));
    schedule(rot.stage);
  }

  function stopDrag(e){
    if(!rot.drag)return;
    const stage=rot.stage;
    rot.drag=false;
    if(stage){
      stage.classList.remove('pm-globe-drag');
      try{if(rot.pointerId!==null)stage.releasePointerCapture?.(rot.pointerId)}catch(_){ }
      draw(stage);
    }
    rot.stage=null;rot.pointerId=null;
  }

  document.addEventListener('pointerdown',startDrag,true);
  document.addEventListener('pointermove',moveDrag,true);
  document.addEventListener('pointerup',stopDrag,true);
  document.addEventListener('pointercancel',stopDrag,true);
  document.addEventListener('change',e=>{if(e.target.matches?.('[data-pm-period],[data-pm-type],[data-pm-source]'))setTimeout(()=>schedule(),60)},true);
  document.addEventListener('click',e=>{if(e.target.closest?.('[data-zoom],#nav [data-page="market"],.client-option'))setTimeout(()=>schedule(),80)},true);

  injectStyles();
  setTimeout(()=>schedule(),100);
  setTimeout(()=>schedule(),500);
  window.BLISPerceptionGlobe={apply:()=>schedule(),reset(){rot.x=-10;rot.y=18;schedule()}};
})();