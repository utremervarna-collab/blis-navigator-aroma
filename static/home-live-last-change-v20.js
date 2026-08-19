/* BLIS LIVE — canonical last measured change resolver v20.
   Uses real dashboard/history values only. Repeated identical snapshots are skipped so
   the ticker shows the most recent actual measured movement, not a duplicate 0.0. */
(function(){
  'use strict';
  if(typeof document==='undefined')return;

  const clients=[['aroma','AROMA'],['bolyarka','БОЛЯРКА'],['astor-garden','ASTOR GARDEN'],['varna-towers','VARNA TOWERS']];
  const metrics=[['blis','BLIS'],['digital','DIGITAL'],['reputation','REPUTATION'],['competitive','COMPETITIVE']];
  const colors={'AROMA':'#56d6df','БОЛЯРКА':'#f0b24a','ASTOR GARDEN':'#8fd3a8','VARNA TOWERS':'#91b3ff'};
  const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
  const dayOf=v=>{const m=String(v||'').match(/^(\d{4}-\d{2}-\d{2})/);return m?m[1]:null};

  const css=document.createElement('style');
  css.textContent=`
    .marketTape{background:linear-gradient(90deg,#11263a 0%,#183149 52%,#1b3954 100%)!important;color:#eef5fb!important}
    .tapeItem{position:relative}
    .tapeItem::before{content:"";width:4px;height:18px;border-radius:4px;background:var(--client-accent,#9fb3c6);flex:0 0 4px}
    .tapeClient{color:var(--client-accent,#9fb3c6)!important;font-weight:900!important}
    .tapeDelta{display:inline-block!important;min-width:46px!important;font-weight:950!important;letter-spacing:.01em}
    .tapeDelta.up{color:#49dc8b!important}.tapeDelta.down{color:#ff6868!important}.tapeDelta.flat{color:#79b8f7!important}
  `;
  document.head.appendChild(css);

  function valueOf(payload,key){
    if(!payload)return null;
    if(key==='blis')return num(payload.blis_index);
    const row=(payload.indices||[]).find(i=>i&&i.key===key);
    return row?num(row.value):null;
  }

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

  /*
    Current 95, history 94 → 95 → 95 => +1.0 (last actual measured change).
    We never manufacture a direction. If every earlier real day is identical => ±0.0.
    If there is no earlier real day => NEW.
  */
  function lastMeasuredChange(d,h,key){
    const current=valueOf(d,key);
    if(current===null)return {delta:null,baseline:false};
    const currentDay=dayOf(d&& (d.data_updated||d.updated_at));
    const rows=[];
    (Array.isArray(h)?h:[]).forEach((r,idx)=>{
      const payload=r&&r.payload;
      const v=valueOf(payload,key);
      if(v===null)return;
      const raw=(r&&r.created_at)||(payload&&payload.data_updated)||(payload&&payload.updated_at)||'';
      const t=Date.parse(raw);
      rows.push({value:v,day:dayOf(raw),time:Number.isFinite(t)?t:idx,idx});
    });
    rows.sort((a,b)=>a.time===b.time?a.idx-b.idx:a.time-b.time);

    let hasEarlierRealDay=false;
    for(let i=rows.length-1;i>=0;i--){
      const p=rows[i];
      if(!currentDay || !p.day || p.day!==currentDay)hasEarlierRealDay=true;
      if(Math.abs(current-p.value)>=0.05){
        return {delta:current-p.value,baseline:true,from:p.day||null,to:currentDay||null};
      }
    }

    const direct=explicitDelta(d,key);
    if(direct!==null && Math.abs(direct)>=0.05){
      return {delta:direct,baseline:true,from:null,to:currentDay||null};
    }
    if(hasEarlierRealDay)return {delta:0,baseline:true,from:null,to:currentDay||null};
    return {delta:null,baseline:false,from:null,to:currentDay||null};
  }

  let states=new Map();
  let applying=false;

  async function load(){
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
          next.set(`${name}|${label}`,lastMeasuredChange(d,h,key));
        }
      }catch(e){}
    }));
    states=next;
    apply();
  }

  function apply(){
    if(applying)return;
    applying=true;
    document.querySelectorAll('#blisTapeTrack .tapeItem').forEach(el=>{
      const name=(el.querySelector('.tapeClient')?.textContent||'').trim().toUpperCase();
      const label=(el.querySelector('.tapeMetric')?.textContent||'').trim().toUpperCase();
      const deltaEl=el.querySelector('.tapeDelta');
      if(colors[name])el.style.setProperty('--client-accent',colors[name]);
      if(!name||!label||!deltaEl)return;
      const s=states.get(`${name}|${label}`);
      deltaEl.classList.remove('up','down','flat');
      if(!s||!s.baseline||s.delta===null){
        deltaEl.classList.add('flat');
        deltaEl.textContent='NEW';
        deltaEl.title='Няма предходно реално измерване за сравнение';
        return;
      }
      const d=s.delta;
      if(Math.abs(d)<0.05){
        deltaEl.classList.add('flat');
        deltaEl.textContent='±0.0';
        deltaEl.title='Няма измерена промяна в наличната предходна история';
      }else if(d>0){
        deltaEl.classList.add('up');
        deltaEl.textContent=`+${d.toFixed(1)}`;
        deltaEl.title=`Последна измерена промяна${s.from?' спрямо '+s.from:''}`;
      }else{
        deltaEl.classList.add('down');
        deltaEl.textContent=`−${Math.abs(d).toFixed(1)}`;
        deltaEl.title=`Последна измерена промяна${s.from?' спрямо '+s.from:''}`;
      }
    });
    applying=false;
  }

  function boot(){
    const track=document.getElementById('blisTapeTrack');
    if(track)new MutationObserver(()=>requestAnimationFrame(apply)).observe(track,{childList:true,subtree:false});
    load();
    setInterval(load,60000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
    window.addEventListener('focus',load);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
