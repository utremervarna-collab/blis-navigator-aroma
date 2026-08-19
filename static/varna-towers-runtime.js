/* BLIS Navigator — Varna Towers data bootstrap + measured BLIS LIVE deltas v19. */
(function(){
  'use strict';

  /* Preserve the Varna Towers data runtime, but strip the obsolete ticker override. */
  try{
    const xhr=new XMLHttpRequest();
    xhr.open('GET','/varna-towers-data-v18.js?v=20260819-1329',false);
    xhr.send(null);
    if(xhr.status>=200&&xhr.status<300){
      let src=xhr.responseText||'';
      const marker='  /* Home BLIS LIVE visual + real delta override. */';
      const cut=src.indexOf(marker);
      if(cut>=0)src=src.slice(0,cut)+'})();\n';
      (0,eval)(src);
    }
  }catch(e){console.warn('Varna Towers bootstrap:',e)}

  if(typeof document==='undefined')return;

  const css=document.createElement('style');
  css.textContent=`
    .marketTape{background:linear-gradient(90deg,#11263a 0%,#183149 52%,#1b3954 100%)!important;color:#eef5fb!important}
    .tapeItem{position:relative}
    .tapeItem::before{content:"";width:4px;height:18px;border-radius:4px;background:var(--client-accent,#9fb3c6);flex:0 0 4px}
    .tapeClient{color:var(--client-accent,#9fb3c6)!important;font-weight:900!important}
    .tapeDelta{display:inline-block!important;min-width:42px!important;font-weight:900!important}
    .tapeDelta.up{color:#4fd18b!important}.tapeDelta.down{color:#ff7070!important}.tapeDelta.flat{color:#69aff8!important}
  `;
  document.head.appendChild(css);

  const colors={'AROMA':'#56d6df','БОЛЯРКА':'#f0b24a','ASTOR GARDEN':'#8fd3a8','VARNA TOWERS':'#91b3ff'};
  const clients=[['aroma','AROMA'],['bolyarka','БОЛЯРКА'],['astor-garden','ASTOR GARDEN'],['varna-towers','VARNA TOWERS']];
  const metrics=[['blis','BLIS'],['digital','DIGITAL'],['reputation','REPUTATION'],['competitive','COMPETITIVE']];
  const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};

  function valueOf(payload,key){
    if(!payload)return null;
    if(key==='blis')return num(payload.blis_index);
    const row=(payload.indices||[]).find(i=>i&&i.key===key);
    return row?num(row.value):null;
  }

  function dayOf(v){
    const m=String(v||'').match(/^(\d{4}-\d{2}-\d{2})/);
    return m?m[1]:null;
  }

  /* Exact same principle as Navigator trend: one measured value per real calendar day. */
  function measuredDailyDelta(d,h,key){
    if(!d||!Array.isArray(h))return {delta:null,baseline:false};
    const days=new Map();
    h.forEach(r=>{
      const v=valueOf(r&&r.payload,key);
      const day=dayOf((r&&r.created_at)||(r&&r.payload&&r.payload.data_updated));
      if(v===null||!day)return;
      days.set(day,{day,value:v});
    });
    const cur=valueOf(d,key);
    const curDay=dayOf(d.data_updated||d.updated_at);
    if(cur!==null&&curDay)days.set(curDay,{day:curDay,value:cur});
    const pts=Array.from(days.values()).sort((a,b)=>a.day.localeCompare(b.day));
    if(pts.length<2)return {delta:null,baseline:false};
    const last=pts[pts.length-1],prev=pts[pts.length-2];
    return {delta:last.value-prev.value,baseline:true,from:prev.day,to:last.day};
  }

  /* Use only explicit numeric change fields. Generic `trend` is deliberately excluded. */
  function explicitDelta(d,key){
    if(!d)return null;
    const obj=key==='blis'?d:(d.indices||[]).find(i=>i&&i.key===key);
    if(!obj)return null;
    for(const k of ['delta','change','change_value','trend_delta']){
      if(obj[k]===null||obj[k]===undefined||obj[k]==='')continue;
      const v=num(obj[k]);
      if(v!==null)return v;
    }
    return null;
  }

  let deltaMap=new Map();
  let applying=false;

  async function loadDeltas(){
    const next=new Map();
    await Promise.all(clients.map(async([slug,name])=>{
      try{
        const bust=Date.now();
        const [d,h]=await Promise.all([
          fetch(`/api/clients/${slug}/dashboard?_=${bust}`,{cache:'no-store'}).then(r=>r.ok?r.json():null),
          fetch(`/api/clients/${slug}/history?_=${bust}`,{cache:'no-store'}).then(r=>r.ok?r.json():[])
        ]);
        for(const [key,label] of metrics){
          if(valueOf(d,key)===null)continue;
          const measured=measuredDailyDelta(d,h,key);
          let delta=measured.delta;
          let baseline=measured.baseline;
          if(!baseline){
            const direct=explicitDelta(d,key);
            if(direct!==null){delta=direct;baseline=true}
          }
          next.set(`${name}|${label}`,{delta,baseline,from:measured.from,to:measured.to});
        }
      }catch(e){}
    }));
    deltaMap=next;
    applyTape();
  }

  function applyTape(){
    if(applying)return;
    applying=true;
    document.querySelectorAll('#blisTapeTrack .tapeItem').forEach(el=>{
      const name=(el.querySelector('.tapeClient')?.textContent||'').trim().toUpperCase();
      const label=(el.querySelector('.tapeMetric')?.textContent||'').trim().toUpperCase();
      if(colors[name])el.style.setProperty('--client-accent',colors[name]);
      const deltaEl=el.querySelector('.tapeDelta');
      if(!name||!label||!deltaEl)return;
      const state=deltaMap.get(`${name}|${label}`);
      deltaEl.classList.remove('up','down','flat');
      if(!state||!state.baseline||state.delta===null){
        deltaEl.classList.add('flat');
        deltaEl.textContent='NEW';
        deltaEl.title='Все още няма две реални измервания за сравнение';
        return;
      }
      const d=state.delta;
      if(Math.abs(d)<0.05){
        deltaEl.classList.add('flat');
        deltaEl.textContent='0.0';
        deltaEl.title='Без промяна спрямо предходното реално измерване';
      }else if(d>0){
        deltaEl.classList.add('up');
        deltaEl.textContent=`+${d.toFixed(1)}`;
        deltaEl.title=`Реална промяна${state.from?' спрямо '+state.from:''}`;
      }else{
        deltaEl.classList.add('down');
        deltaEl.textContent=`−${Math.abs(d).toFixed(1)}`;
        deltaEl.title=`Реална промяна${state.from?' спрямо '+state.from:''}`;
      }
    });
    applying=false;
  }

  function boot(){
    const track=document.getElementById('blisTapeTrack');
    if(track)new MutationObserver(()=>requestAnimationFrame(applyTape)).observe(track,{childList:true});
    loadDeltas();
    setInterval(loadDeltas,60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadDeltas()});
    window.addEventListener('focus',loadDeltas);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
