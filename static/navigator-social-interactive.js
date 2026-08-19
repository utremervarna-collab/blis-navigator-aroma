/* BLIS Navigator — Social Signals interaction controller v7.
   Green wavy BLISCurves chart, one external date axis, interactive points,
   KPI drill-down and last-valid social audience/reaction evidence. */
(function(){
  'use strict';
  if(window.__BLISSocialInteractiveV7)return;
  window.__BLISSocialInteractiveV7=true;

  const GREEN='#2daf65';
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]));
  const shortDate=s=>{const p=String(s||'').slice(0,10).split('-');return p.length===3?`${p[2]}.${p[1]}`:String(s||'')};
  const num=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
  const fmt=v=>num(v)==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
  const currentClient=()=>String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.slug||'aroma').toLowerCase();
  const sourceKey=s=>String(s?.key||s?.source_key||s?.id||s?.label||s?.name||'').toLowerCase();
  const sourceText=s=>[s?.key,s?.label,s?.name,s?.url,s?.method].filter(Boolean).join(' ').toLowerCase();
  const platformOf=s=>{const q=typeof s==='string'?String(s).toLowerCase():sourceText(s);if(q.includes('linkedin'))return'LinkedIn';if(q.includes('facebook'))return'Facebook';if(q.includes('instagram'))return'Instagram';if(q.includes('youtube'))return'YouTube';if(q.includes('tiktok'))return'TikTok';if(q.includes('twitter')||q.includes('x.com'))return'X';return''};
  const isRoot=u=>/^(https?:\/\/)?(www\.)?(facebook\.com|instagram\.com|youtube\.com|tiktok\.com)\/?$/i.test(String(u||'').trim());
  const normObs=o=>({source:String(o?.source_key||o?.source||'').toLowerCase(),metric:String(o?.metric_key||o?.metric||o?.key||'').toLowerCase(),value:o?.value,time:o?.observed_at||o?.time||''});

  function styles(){
    if(document.getElementById('smInteractiveStylesV7'))return;
    const s=document.createElement('style');s.id='smInteractiveStylesV7';s.textContent=`
      #socialBody .sm-kpi[data-sm-destination]{cursor:pointer;position:relative;transition:border-color .16s ease,transform .16s ease,box-shadow .16s ease}
      #socialBody .sm-kpi[data-sm-destination]:hover{border-color:#b9cceb;transform:translateY(-1px);box-shadow:0 8px 22px rgba(23,49,92,.08)}
      #socialBody .sm-kpi[data-sm-destination]:focus-visible{outline:2px solid #1766e8;outline-offset:3px}
      #socialBody .sm-kpi-link{display:block;margin-top:8px;color:#1766e8;font-size:10px;font-weight:700;letter-spacing:.01em}
      #socialBody .sm-anchor-flash{animation:smAnchorFlash .9s ease}
      @keyframes smAnchorFlash{0%{box-shadow:0 0 0 3px rgba(23,102,232,.20)}100%{box-shadow:none}}
      #socialBody #socialTrend .sm-chart{height:205px!important;min-height:205px!important;overflow:hidden!important;padding:0!important}
      #socialBody #socialTrend .sm-chart svg{width:100%;height:100%;display:block}
      #socialBody #socialTrend .blis-click-point{cursor:pointer;transition:r .12s ease}
      #socialBody #socialTrend .blis-click-point:hover,#socialBody #socialTrend .blis-click-point.is-selected{r:5.2}
      #socialBody #socialTrend .sm-chart-dates{display:flex;justify-content:space-between;align-items:center;gap:8px;margin:7px 12px 0 28px;color:#74839a;font-size:9px;line-height:1;white-space:nowrap;font-variant-numeric:tabular-nums}
      #socialBody #socialTrend .sm-chart-dates span{min-width:30px;text-align:center}
      #socialBody #socialTrend .sm-chart-dates span:first-child{text-align:left}
      #socialBody #socialTrend .sm-chart-dates span:last-child{text-align:right}
      #socialBody #socialTrend .blis-series-note{display:none!important}
      #socialBody .sm-evidence-note{color:#7d8da3!important}
      @media(max-width:700px){#socialBody #socialTrend .sm-chart-dates span:nth-child(even){display:none}}
    `;document.head.appendChild(s);
  }

  const KPI_MAP=[
    {type:'part',id:'socialTrend',hint:'Виж динамиката →'},
    {type:'part',id:'socialTrend',hint:'Виж динамиката →'},
    {type:'part',id:'socialChannels',hint:'Виж каналите →'},
    {type:'part',id:'socialPosts',hint:'Виж публикациите →'},
    {type:'page',page:'signals',hint:'Виж сигналите →'}
  ];

  function markSections(root){
    for(const c of root.querySelectorAll('.sm-card')){
      const h=(c.querySelector('.sm-card-head h3')?.textContent||'').trim();
      if(h==='СОЦИАЛНА ДИНАМИКА')c.id='socialTrend';
      else if(h==='КАНАЛИ И ПРИНОС')c.id='socialChannels';
      else if(h==='ПОСЛЕДНИ ПУБЛИКАЦИИ ПО КАНАЛИ')c.id='socialPosts';
    }
  }

  function makeKpisInteractive(root){
    [...root.querySelectorAll('.sm-kpis .sm-kpi')].forEach((card,i)=>{
      const m=KPI_MAP[i];if(!m)return;
      card.dataset.smDestination=m.type==='page'?`page:${m.page}`:`part:${m.id}`;
      card.setAttribute('role','button');card.setAttribute('tabindex','0');
      if(!card.querySelector('.sm-kpi-link'))card.insertAdjacentHTML('beforeend',`<span class="sm-kpi-link">${esc(m.hint)}</span>`);
    });
  }

  function dateStrip(series){
    if(!series.length)return'';
    const maxLabels=7,idx=[];
    if(series.length<=maxLabels){for(let i=0;i<series.length;i++)idx.push(i)}
    else{for(let i=0;i<maxLabels;i++)idx.push(Math.round(i*(series.length-1)/(maxLabels-1)))}
    return `<div class="sm-chart-dates" aria-label="Дати на социалната динамика">${idx.map(i=>`<span>${esc(shortDate(series[i]?.date))}</span>`).join('')}</div>`;
  }

  function restorePriorCurve(root){
    if(!window.BLISCurves?.draw||!window.BLISCurves?.series)return;
    const card=root.querySelector('#socialTrend'),host=card?.querySelector('.sm-chart');
    if(!host)return;
    const series=window.BLISCurves.series('presence')||[];
    if(series.length<2)return;

    host.innerHTML=window.BLISCurves.draw('presence',{color:GREEN,width:760,height:190});
    const svg=host.querySelector('svg[data-curve-key="presence"]');
    if(svg){
      svg.querySelectorAll('text[text-anchor="middle"]').forEach(x=>x.remove());
      const dots=[...svg.querySelectorAll('circle')];
      dots.forEach((dot,i)=>{
        const row=series[i];if(!row)return;
        dot.classList.add('blis-click-point');
        dot.dataset.chartKey='presence';dot.dataset.chartLabel='Социален индекс';
        dot.dataset.chartDate=row.date||'';dot.dataset.chartValue=String(row.value??'');
        dot.setAttribute('role','button');dot.setAttribute('tabindex','0');
        dot.style.cursor='pointer';dot.style.pointerEvents='all';
        dot.setAttribute('stroke','#fff');dot.setAttribute('stroke-width','1.5');dot.setAttribute('r','3.6');
      });
    }

    card.querySelector('.sm-chart-dates')?.remove();
    host.insertAdjacentHTML('afterend',dateStrip(series));
    const sub=card.querySelector('.sm-card-head p');if(sub)sub.textContent='Дневна динамика на социалния индекс';
    const pill=card.querySelector('.sm-card-head .sm-pill');if(pill)pill.textContent='ДНЕВНА ДИНАМИКА';
    const meta=card.querySelector('.sm-chart-meta span:first-child');if(meta)meta.innerHTML=`<b>${series.length}</b> дневни точки`;
  }

  function latestPositive(obs,keys,re){
    let best=null,t0=-Infinity;
    for(const raw of obs||[]){
      const o=normObs(raw);if(!keys.has(o.source)||!re.test(o.metric))continue;
      const v=num(o.value);if(v==null||v<=0)continue;
      const t=new Date(o.time||0).getTime()||0;
      if(t>=t0){best={value:v,time:o.time,metric:o.metric};t0=t}
    }
    return best;
  }

  function evidenceByPlatform(data){
    const sources=Array.isArray(data?.sources)?data.sources:[],obs=Array.isArray(data?.observations)?data.observations:[];
    const groups=new Map();
    for(const s of sources){const p=platformOf(s);if(!p||isRoot(s?.url))continue;if(!groups.has(p))groups.set(p,[]);groups.get(p).push(s)}
    const out=new Map();
    for(const [platform,list] of groups){
      const keys=new Set(list.map(sourceKey));
      const followers=latestPositive(obs,keys,/followers|audience|последовател|subscriber|абонат/)?.value??null;
      const likes=latestPositive(obs,keys,/^likes$/)?.value??0;
      const comments=latestPositive(obs,keys,/comments_visible/)?.value??0;
      const shares=latestPositive(obs,keys,/shares_visible/)?.value??0;
      const componentSum=likes+comments+shares;
      const searchReactions=latestPositive(obs,keys,/visible_reactions_search/)?.value??0;
      const markers=latestPositive(obs,keys,/visible_reaction_markers/)?.value??0;
      const reactions=componentSum>0?componentSum:(searchReactions>0?searchReactions:(markers>0?markers:null));
      out.set(platform,{followers,reactions});
    }
    return out;
  }

  let evidenceCache={client:'',at:0,data:null,promise:null};
  async function fetchClientData(){
    const client=currentClient();
    if(evidenceCache.client===client&&evidenceCache.data&&Date.now()-evidenceCache.at<2500)return evidenceCache.data;
    if(evidenceCache.client===client&&evidenceCache.promise)return evidenceCache.promise;
    evidenceCache.client=client;
    evidenceCache.promise=fetch('/api/store/export?socialEvidence='+Date.now(),{cache:'no-store'})
      .then(r=>r.ok?r.json():null)
      .then(st=>st?.clients?.[client]||null)
      .catch(()=>null)
      .then(data=>{evidenceCache={client,at:Date.now(),data,promise:null};return data});
    return evidenceCache.promise;
  }

  function setKpiValue(card,value,foot){
    if(!card)return;
    const valueEl=card.querySelector('.sm-kpi-value');if(valueEl)valueEl.textContent=value==null?'—':fmt(value);
    const footEl=card.querySelector('.sm-kpi-foot');if(footEl&&foot){footEl.textContent=foot;footEl.classList.add('sm-evidence-note')}
  }

  function patchChannelEvidence(root,map){
    for(const card of root.querySelectorAll('.sm-channel')){
      const platform=(card.querySelector('.sm-channel-name')?.textContent||'').trim();
      const ev=map.get(platform);if(!ev)continue;
      const metrics=[...card.querySelectorAll('.sm-channel-metrics>span')];
      if(ev.followers>0&&metrics[0])metrics[0].innerHTML=`Аудитория<b>${esc(fmt(ev.followers))}</b>`;
      if(ev.reactions>0&&metrics[2]&&!/Ангажираност/i.test(metrics[2].textContent||''))metrics[2].innerHTML=`Видими реакции<b>${esc(fmt(ev.reactions))}</b>`;
    }
  }

  async function repairSocialEvidence(root){
    const data=await fetchClientData();
    if(!data||!document.getElementById('socialBody')?.contains(root.firstElementChild||root))return;
    const map=evidenceByPlatform(data),entries=[...map.values()];
    const audiences=entries.map(x=>x.followers).filter(v=>num(v)>0);
    const reactions=entries.map(x=>x.reactions).filter(v=>num(v)>0);
    const audience=audiences.length?audiences.reduce((a,b)=>a+b,0):null;
    const reactionTotal=reactions.length?reactions.reduce((a,b)=>a+b,0):null;
    const kpis=[...root.querySelectorAll('.sm-kpis .sm-kpi')];
    if(audience!=null)setKpiValue(kpis[2],audience,`Последно валидно публично измерване от ${audiences.length} канал${audiences.length===1?'':'а'}`);
    else setKpiValue(kpis[2],null,'Няма извлечено валидно измерване на аудиторията');
    const fourthTitle=(kpis[3]?.querySelector('.sm-kpi-head')?.textContent||'');
    if(!/Ангажираност/i.test(fourthTitle)){
      if(reactionTotal!=null)setKpiValue(kpis[3],reactionTotal,`Последни валидни публично видими реакции от ${reactions.length} канал${reactions.length===1?'':'а'}`);
      else setKpiValue(kpis[3],null,'Няма извлечено валидно измерване на реакциите');
    }
    patchChannelEvidence(root,map);
  }

  function patch(){
    const root=document.getElementById('socialBody');if(!root||!root.children.length)return false;
    styles();markSections(root);makeKpisInteractive(root);restorePriorCurve(root);repairSocialEvidence(root);return true
  }
  function gotoPart(id){const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});el.classList.remove('sm-anchor-flash');void el.offsetWidth;el.classList.add('sm-anchor-flash')}
  function activate(dest){if(!dest)return;if(dest.startsWith('part:'))gotoPart(dest.slice(5));else if(dest.startsWith('page:')){const page=dest.slice(5);if(typeof window.refGo==='function')window.refGo(page);else if(typeof window.go==='function')window.go(page)}}

  document.addEventListener('click',e=>{const kpi=e.target?.closest?.('#socialBody .sm-kpi[data-sm-destination]');if(kpi)activate(kpi.dataset.smDestination);const nav=e.target?.closest?.('#nav button[data-page="social"]');if(nav){setTimeout(patch,120);setTimeout(patch,650);setTimeout(patch,3000)}});
  document.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const kpi=e.target?.closest?.('#socialBody .sm-kpi[data-sm-destination]');if(kpi){e.preventDefault();activate(kpi.dataset.smDestination)}});

  const oldRefGo=window.refGo;
  if(typeof oldRefGo==='function'&&!oldRefGo.__socialInteractiveV7){const wrapped=function(id){const r=oldRefGo.apply(this,arguments);if(id==='social'){setTimeout(patch,120);setTimeout(patch,650);setTimeout(patch,3000)}return r};wrapped.__socialInteractiveV7=true;wrapped.__previous=oldRefGo;window.refGo=wrapped}

  setTimeout(patch,900);setTimeout(patch,1800);setTimeout(patch,4500);window.BLISSocialInteractivePatch=patch;
})();