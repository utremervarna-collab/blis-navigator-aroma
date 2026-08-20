(() => {
  'use strict';

  let rotX=-7,rotY=14,dragging=false,startX=0,startY=0,startRX=0,startRY=0,coreHooked=false;
  const GOLDEN=Math.PI*(3-Math.sqrt(5));

  function styleOnce(){
    if(document.getElementById('pmGlobeStyles'))return;
    const s=document.createElement('style');
    s.id='pmGlobeStyles';
    s.textContent=`
      .pm-stage.network{cursor:grab;background:radial-gradient(circle at 52% 48%,color-mix(in srgb,var(--pm-accent) 7%,white) 0,white 31%,#fbfcfe 69%)}
      .pm-stage.network.pm-globe-dragging{cursor:grabbing}
      .pm-stage.network:before{opacity:.16!important;background-image:linear-gradient(#eef2f7 1px,transparent 1px),linear-gradient(90deg,#eef2f7 1px,transparent 1px)!important;background-size:48px 48px!important}
      .pm-stage.network:after{content:"3D МРЕЖА · плъзни, за да завъртиш"!important;right:16px!important;bottom:13px!important;font-weight:750!important;letter-spacing:.04em!important;color:#667085!important}
      .pm-stage.network .pm-canvas{transform:scale(var(--pm-scale))!important;transform-style:preserve-3d}
      .pm-stage.network .pm-lanes{display:none!important}
      .pm-globe-shell{position:absolute;left:52%;top:50%;width:69%;height:82%;transform:translate(-50%,-50%);border:1px solid color-mix(in srgb,var(--pm-accent) 18%,#dfe7f0);border-radius:50%;background:radial-gradient(circle at 38% 34%,rgba(255,255,255,.86),color-mix(in srgb,var(--pm-accent) 3%,transparent) 42%,transparent 72%);box-shadow:inset -25px -18px 55px rgba(64,91,128,.045),0 16px 45px rgba(16,24,40,.035);pointer-events:none;z-index:0;transition:transform .16s ease}
      .pm-globe-shell i{position:absolute;inset:0;border:1px solid color-mix(in srgb,var(--pm-accent) 12%,#e6ebf2);border-radius:50%;opacity:.72}
      .pm-globe-shell i:nth-child(1){transform:scaleX(.48)}
      .pm-globe-shell i:nth-child(2){transform:scaleX(.78)}
      .pm-globe-shell i:nth-child(3){transform:scaleY(.36)}
      .pm-globe-shell i:nth-child(4){transform:scaleY(.68)}
      .pm-globe-axis{position:absolute;left:52%;top:9%;bottom:9%;width:1px;background:linear-gradient(transparent,color-mix(in srgb,var(--pm-accent) 13%,#dfe7f0),transparent);pointer-events:none;z-index:0}
      .pm-stage.network .pm-links{z-index:1;transform:none!important}
      .pm-stage.network .pm-link{stroke:#b9c9dc;stroke-width:1.25;opacity:.5;stroke-dasharray:none;transition:stroke .14s ease,opacity .14s ease,stroke-width .14s ease}
      .pm-stage.network .pm-link.cross{stroke:#c7d2e1;stroke-dasharray:4 6;opacity:.4}
      .pm-stage.network .pm-link.hot{stroke:var(--pm-accent);stroke-width:2.15;opacity:.96;stroke-dasharray:none}
      .pm-stage.network .pm-node{min-width:116px;max-width:154px;border-radius:999px;padding:8px 11px;background:rgba(255,255,255,.94);backdrop-filter:blur(7px);box-shadow:0 7px 19px rgba(16,24,40,.075);transform:translate(-50%,-50%) scale(var(--globe-scale,1))!important;transition:left .15s ease,top .15s ease,transform .15s ease,opacity .15s ease,box-shadow .15s ease,border-color .15s ease}
      .pm-stage.network .pm-node .pm-kind{display:none}
      .pm-stage.network .pm-node b{font-size:10px!important;white-space:normal}
      .pm-stage.network .pm-node small{font-size:9px!important}
      .pm-stage.network.depth .pm-node:hover,.pm-stage.network.depth .pm-node.selected{transform:translate(-50%,-50%) scale(calc(var(--globe-scale,1) + .08))!important}
      .pm-stage.network .pm-node.selected{box-shadow:0 0 0 3px color-mix(in srgb,var(--pm-accent) 10%,transparent),0 13px 30px rgba(16,24,40,.13)}
      .pm-stage.network:not(.depth) .pm-globe-shell{opacity:.52}
      @media(max-width:1120px){.pm-globe-shell{width:72%;height:78%}}
    `;
    document.head.appendChild(s);
  }

  function shell(stage,canvas){
    if(canvas.querySelector('.pm-globe-shell'))return;
    const globe=document.createElement('div');globe.className='pm-globe-shell';globe.innerHTML='<i></i><i></i><i></i><i></i>';
    const axis=document.createElement('div');axis.className='pm-globe-axis';
    canvas.prepend(axis);canvas.prepend(globe);
  }

  function degreeMap(stage){
    const deg={};stage.querySelectorAll('.pm-node').forEach(n=>deg[n.dataset.node]=0);
    stage.querySelectorAll('.pm-link').forEach(l=>{if(l.dataset.a in deg)deg[l.dataset.a]++;if(l.dataset.b in deg)deg[l.dataset.b]++});
    return deg;
  }

  function seedPoints(stage){
    const nodes=[...stage.querySelectorAll('.pm-node')];if(!nodes.length)return;
    const deg=degreeMap(stage);nodes.sort((a,b)=>(deg[b.dataset.node]||0)-(deg[a.dataset.node]||0));
    nodes.forEach((node,i)=>{
      let x,y,z;
      if(i===0){x=0;y=0;z=.98}else{const k=i-1,n=Math.max(1,nodes.length-1);y=1-2*((k+.5)/n);const r=Math.sqrt(Math.max(0,1-y*y)),theta=k*GOLDEN+.45;x=Math.cos(theta)*r;z=Math.sin(theta)*r}
      node.dataset.gx=x.toFixed(5);node.dataset.gy=y.toFixed(5);node.dataset.gz=z.toFixed(5);
    });
  }

  function rotatePoint(x,y,z,rx,ry){
    const ax=rx*Math.PI/180,ay=ry*Math.PI/180,cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);
    const x1=x*cy+z*sy,z1=-x*sy+z*cy,y1=y*cx-z1*sx,z2=y*sx+z1*cx;
    return{x:x1,y:y1,z:z2};
  }

  function redraw(stage){
    if(!stage?.classList.contains('network'))return;
    const depth=stage.classList.contains('depth'),nodes=[...stage.querySelectorAll('.pm-node')],pos={};
    nodes.forEach(node=>{
      const base={x:Number(node.dataset.gx||0),y:Number(node.dataset.gy||0),z:Number(node.dataset.gz||0)},p=depth?rotatePoint(base.x,base.y,base.z,rotX,rotY):base;
      const perspective=.88+(p.z+1)*.075,left=52+p.x*35*perspective,top=50+p.y*39*perspective,scale=depth?.78+(p.z+1)*.14:1,opacity=depth?.56+(p.z+1)*.22:1;
      node.style.left=`${left}%`;node.style.top=`${top}%`;node.style.setProperty('--globe-scale',scale.toFixed(3));node.style.opacity=String(Math.min(1,opacity));node.style.zIndex=String(20+Math.round((p.z+1)*35));
      pos[node.dataset.node]={x:left*10,y:top*5.9,z:p.z};
    });
    stage.querySelectorAll('.pm-link').forEach(path=>{
      const a=pos[path.dataset.a],b=pos[path.dataset.b];if(!a||!b)return;
      const mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len,depthAvg=(a.z+b.z)/2,curve=18+Math.min(48,len*.055)+(depthAvg+1)*7;
      path.setAttribute('d',`M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${(mx+nx*curve).toFixed(1)} ${(my+ny*curve).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      if(!path.classList.contains('hot')&&!path.classList.contains('muted'))path.style.opacity=String(.28+(depthAvg+1)*.17);
    });
    const globe=stage.querySelector('.pm-globe-shell');
    if(globe)globe.style.transform=depth?`translate(-50%,-50%) rotateX(${rotX*.42}deg) rotateY(${rotY*.42}deg)`:'translate(-50%,-50%)';
  }

  function apply(){
    styleOnce();const stage=document.querySelector('.pm-stage.network'),canvas=stage?.querySelector('.pm-canvas');if(!stage||!canvas)return;
    shell(stage,canvas);seedPoints(stage);redraw(stage);
  }
  function schedule(){requestAnimationFrame(()=>requestAnimationFrame(apply))}

  function attachCoreHooks(){
    if(coreHooked)return true;
    const pm=window.BLISPerceptionMap;if(!pm)return false;
    const mount=pm.mount,render=pm.render;
    pm.mount=function(){const r=mount.apply(this,arguments);setTimeout(schedule,20);return r};
    pm.render=function(){const r=render.apply(this,arguments);setTimeout(schedule,20);return r};
    coreHooked=true;setTimeout(schedule,20);return true;
  }

  window.addEventListener('blis:perception-core-ready',()=>{attachCoreHooks();schedule()});
  document.addEventListener('click',e=>{
    if(e.target.closest?.('[data-view="network"],[data-depth],[data-zoom]'))setTimeout(schedule,10);
    if(e.target.closest?.('#nav [data-page="market"]'))setTimeout(schedule,80);
  });
  document.addEventListener('change',e=>{if(e.target.matches?.('[data-pm-period],[data-pm-type],[data-pm-source]'))setTimeout(schedule,40)});

  document.addEventListener('pointerdown',e=>{
    const stage=e.target.closest?.('.pm-stage.network');if(!stage||!stage.classList.contains('depth')||e.button!==0||e.target.closest('.pm-node'))return;
    dragging=true;startX=e.clientX;startY=e.clientY;startRX=rotX;startRY=rotY;stage.classList.add('pm-globe-dragging');stage.setPointerCapture?.(e.pointerId);e.preventDefault();
  });
  document.addEventListener('pointermove',e=>{
    const stage=document.querySelector('.pm-stage.network');if(!stage||!stage.classList.contains('depth'))return;
    if(dragging){rotY=startRY+(e.clientX-startX)*.34;rotX=Math.max(-55,Math.min(55,startRX-(e.clientY-startY)*.28));redraw(stage)}
  });
  document.addEventListener('pointerup',()=>{dragging=false;document.querySelector('.pm-stage.network')?.classList.remove('pm-globe-dragging')});
  document.addEventListener('pointercancel',()=>{dragging=false;document.querySelector('.pm-stage.network')?.classList.remove('pm-globe-dragging')});

  attachCoreHooks();
  [0,150,400,800,1400,2400].forEach(ms=>setTimeout(()=>{attachCoreHooks();schedule()},ms));
  window.BLISPerceptionGlobe={apply:schedule,reset(){rotX=-7;rotY=14;schedule()}};
})();