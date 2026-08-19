/* BLIS Navigator — Социални сигнали v7. Валидни измервания, каноничен feed, устойчиви агрегати. */
(function(){
  'use strict';

  const SOCIAL_RE=/facebook|instagram|linkedin|youtube|tiktok|twitter|x\.com|социал/i;
  const ORDER=['LinkedIn','Facebook','Instagram','YouTube','TikTok','X'];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const arr=x=>Array.isArray(x)?x:[];
  const num=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
  const fmt=(v,d=0)=>v==null?'—':Number(v).toLocaleString('bg-BG',{maximumFractionDigits:d,minimumFractionDigits:d});
  const pct=v=>v==null?'—':fmt(v,1)+'%';
  const currentClient=()=>String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.slug||'aroma').toLowerCase();
  const state=()=>({D:(typeof D!=='undefined'&&D)||{},S:(typeof S!=='undefined'&&S)||[],A:(typeof A!=='undefined'&&A)||[],H:(typeof H!=='undefined'&&H)||[]});
  const sourceKey=s=>String(s?.key||s?.source_key||s?.id||s?.label||s?.name||'').toLowerCase();
  const sourceLabel=s=>String(s?.label||s?.name||s?.key||'Социален канал');
  const sourceText=s=>[s?.key,s?.label,s?.url,s?.method].filter(Boolean).join(' ');
  const platformOf=s=>{const q=String(typeof s==='string'?s:sourceText(s)).toLowerCase();if(q.includes('linkedin'))return'LinkedIn';if(q.includes('facebook'))return'Facebook';if(q.includes('instagram'))return'Instagram';if(q.includes('youtube'))return'YouTube';if(q.includes('tiktok'))return'TikTok';if(q.includes('twitter')||q.includes('x.com'))return'X';return''};
  const platformClass=p=>String(p||'').toLowerCase().replace(/[^a-z]/g,'');
  const platformGlyph=p=>({LinkedIn:'in',Facebook:'f',Instagram:'◎',YouTube:'▶',TikTok:'♪',X:'𝕏'}[p]||'•');
  const platformIcon=p=>`<span class="sm-platform-icon ${platformClass(p)}">${esc(platformGlyph(p))}</span>`;
  const isRoot=u=>/^(https?:\/\/)?(www\.)?(facebook\.com|instagram\.com|youtube\.com|tiktok\.com)\/?$/i.test(String(u||'').trim());
  const sourceScore=s=>{const q=sourceText(s).toLowerCase();let x=0;if(/official|официал/.test(q))x+=20;if(/_official/.test(sourceKey(s)))x+=30;if(!isRoot(s?.url))x+=10;if(/aroma|bolyarka|boliarka|astor|varna/.test(q))x+=5;return x};
  const normObs=o=>({source:String(o?.source_key||o?.source||'').toLowerCase(),metric:String(o?.metric_key||o?.metric||o?.key||'').toLowerCase(),value:o?.value,time:o?.observed_at||o?.time||''});

  function styles(){
    if(document.getElementById('smV7Styles'))return;
    const s=document.createElement('style');s.id='smV7Styles';s.textContent=`
      .sm-platform-icon{width:34px;height:34px;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;color:#fff;font:800 15px/1 Arial;box-shadow:0 4px 12px rgba(23,49,92,.13)}
      .sm-platform-icon.linkedin{background:#0a66c2;font-size:12px}.sm-platform-icon.facebook{background:#1877f2}.sm-platform-icon.instagram{background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);font-size:19px}.sm-platform-icon.youtube{background:#ff0000}.sm-platform-icon.tiktok{background:#111;text-shadow:-1px 0 #25f4ee,1px 0 #fe2c55}.sm-platform-icon.x{background:#111}
      .sm-channel-logo{background:none!important;box-shadow:none!important;width:auto!important;height:auto!important}.sm-channel-grid{grid-template-columns:repeat(auto-fit,minmax(235px,1fr))!important}.sm-channel{min-height:176px}.sm-channel.is-limited{opacity:.78}.sm-channel-status.off{background:#c7d0dc!important}.sm-channel-state{margin-left:auto;font-size:9px;font-weight:700;color:#2b9c61}.sm-channel-state.limited{color:#8c99aa}.sm-channel-observed{margin-top:9px;color:#8a98ac;font-size:10px}.sm-detail:empty,.sm-detail[data-open="0"]{display:none!important}
      .sm-network-feeds{margin-top:14px}.sm-network-feed-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sm-network-feed{border:1px solid #e4eaf2;border-radius:14px;padding:14px;background:#fff;min-width:0}.sm-network-feed.is-empty{background:#fbfcfe}.sm-network-feed-head{display:flex;align-items:center;gap:9px;margin-bottom:10px}.sm-network-feed-head b{font-size:13px;color:#213a60}.sm-network-feed-head small{margin-left:auto;color:#7f8fa5;font-size:10px}.sm-network-posts{display:grid;gap:8px}.sm-network-post{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;padding:10px 11px;border:1px solid #edf1f6;border-radius:10px;background:#fafbfd;text-decoration:none}.sm-network-post:hover{border-color:#cfd9e8;background:#fff}.sm-network-post p{margin:0;color:#2b405f;font-size:11px;line-height:1.45}.sm-network-post span{display:block;margin-top:4px;color:#8a97aa;font-size:9px}.sm-network-post em{align-self:center;color:#1766e8;font-style:normal;font-size:10px;font-weight:700;white-space:nowrap}.sm-network-empty{padding:11px 12px;border:1px dashed #dfe6ef;border-radius:10px;color:#8391a5;font-size:10px;line-height:1.45}.sm-network-profile{display:inline-block;margin-top:8px;color:#1766e8;font-size:10px;font-weight:700;text-decoration:none}.sm-history-empty{height:190px;display:flex;align-items:center;justify-content:center;text-align:center;color:#8391a5;font-size:11px;line-height:1.5;padding:24px}.sm-method strong{color:#17315c}
      @media(max-width:900px){.sm-network-feed-grid{grid-template-columns:1fr}}
    `;document.head.appendChild(s);
  }

  function latest(obs,keys,re,allowString=false){
    let best=null,t0=-Infinity;
    for(const raw of obs){const o=normObs(raw);if(!keys.has(o.source)||!re.test(o.metric))continue;const v=allowString?o.value:num(o.value);if(v==null||v==='')continue;const t=new Date(o.time||0).getTime()||0;if(t>=t0){best={value:v,time:o.time,metric:o.metric};t0=t}}
    return best;
  }
  function latestPositive(obs,keys,re){
    let best=null,t0=-Infinity;
    for(const raw of obs){const o=normObs(raw);if(!keys.has(o.source)||!re.test(o.metric))continue;const v=num(o.value);if(v==null||v<=0)continue;const t=new Date(o.time||0).getTime()||0;if(t>=t0){best={value:v,time:o.time,metric:o.metric};t0=t}}
    return best;
  }
  const latestExact=(obs,keys,metric)=>latest(obs,keys,new RegExp('^'+metric.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$'),true);
  function metricValue(D,keys){for(const k of keys){const x=arr(D.metrics).find(m=>String(m.key||m.metric||m.name||'').toLowerCase()===k);if(x&&num(x.value)!=null)return num(x.value);const y=arr(D.indices).find(m=>String(m.key||m.name||'').toLowerCase()===k);if(y&&num(y.value)!=null)return num(y.value)}return null}

  function cleanStoredPostText(text){
    const s=String(text||'').replace(/\s+/g,' ').trim();
    if(!s||s==='__BLIS_EMPTY__')return'';
    if(/class=|data-tracking|data-control|href=|<img|<svg|organization_guest|public_biz|tracking-will-navigate/i.test(s))return'';
    return s;
  }

  function canonical(sources,obs){
    const groups=new Map();
    for(const s of arr(sources)){const p=platformOf(s);if(!p||!SOCIAL_RE.test(sourceText(s)))continue;if(!groups.has(p))groups.set(p,[]);groups.get(p).push(s)}
    const out=[];
    for(const [platform,list] of groups){
      list.sort((a,b)=>sourceScore(b)-sourceScore(a));
      const specific=list.filter(x=>!isRoot(x?.url));if(!specific.length)continue;
      const chosen=specific[0],keys=new Set(list.map(sourceKey));
      const followers=latestPositive(obs,keys,/followers|audience|последовател|subscriber|абонат/)?.value??null;
      const access=latest(obs,keys,/public_page_access/)?.value??((latest(obs,keys,/profile_active|reachable/)?.value||0)*100);
      const posts=latestPositive(obs,keys,/visible_posts|recent_videos_90d|recent_public_posts|publication_count|post_count/)?.value??null;
      const engRate=latestPositive(obs,keys,/engagement_rate|ангажираност/)?.value??null;
      const likes=latestPositive(obs,keys,/^likes$/)?.value??0;
      const comments=latestPositive(obs,keys,/comments_visible/)?.value??0;
      const shares=latestPositive(obs,keys,/shares_visible/)?.value??0;
      const componentReactions=likes+comments+shares;
      const searchReactions=latestPositive(obs,keys,/visible_reactions_search/)?.value??0;
      const markers=latestPositive(obs,keys,/visible_reaction_markers/)?.value??0;
      const reactions=componentReactions>0?componentReactions:(searchReactions>0?searchReactions:(markers>0?markers:null));
      const mentions=latestPositive(obs,keys,/mentions|mention_count|brand_mentions_visible|aroma_mentions/)?.value??null;
      let stamp='';const st=latest(obs,keys,/.*/);if(st)stamp=st.time;
      out.push({platform,key:sourceKey(chosen),keys,label:sourceLabel(chosen),method:chosen.method||'Публичен социален канал',url:chosen.url||'',followers,access,posts,engRate,reactions,mentions,stamp});
    }
    return out.sort((a,b)=>ORDER.indexOf(a.platform)-ORDER.indexOf(b.platform));
  }

  function channelPosts(ch,obs){
    const out=[],seen=new Set();
    for(let i=1;i<=8;i++){
      const t=latestExact(obs,ch.keys,`post_${i}_text`),u=latestExact(obs,ch.keys,`post_${i}_url`);
      if(!t||typeof t.value!=='string')continue;
      const text=cleanStoredPostText(t.value);if(text.length<8)continue;
      const rawUrl=u&&typeof u.value==='string'?u.value:'';const url=rawUrl==='__BLIS_EMPTY__'?'':rawUrl;
      const k=(url||text).toLowerCase();if(seen.has(k))continue;seen.add(k);
      out.push({text:text.length>240?text.slice(0,239)+'…':text,url,time:t.time,verified:false});
    }
    return out.slice(0,3);
  }

  function verifiedPosts(ch){
    if(currentClient()!=='aroma'||ch.platform!=='LinkedIn')return[];
    return [
      {text:'Нова глава в историята на Aroma и покана за „Пътешествието на аромата“.',url:'https://www.linkedin.com/company/aroma-cosmetics-ad/posts/',time:'2026-07-22',verified:true},
      {text:'Покана за събитието във Videnie Immersive Space на 20 юни.',url:'https://www.linkedin.com/company/aroma-cosmetics-ad/posts/',time:'2026-07-20',verified:true},
      {text:'Aroma е финалист в категорията „Най-добър производител“.',url:'https://www.linkedin.com/company/aroma-cosmetics-ad/posts/',time:'2026-06-04',verified:true}
    ];
  }
  function displayPosts(ch,obs){const live=channelPosts(ch,obs);return live.length?live:verifiedPosts(ch)}

  function historicalPresence(H){
    const out=[];
    for(const x of arr(H)){
      const p=x?.payload||x||{},v=arr(p.indices).find(i=>String(i.key||i.name||'').toLowerCase()==='presence');
      const d=x.time||x.created_at||x.date||p.time||p.date,nv=v?num(v.value):null;
      if(nv!=null&&d)out.push({v:nv,d});
    }
    return out.slice(-30);
  }

  function measuredChart(points){
    if(points.length<2)return '<div class="sm-history-empty">Натрупва се измерена история за социалния индекс.<br>Графика ще се покаже след поне две реални измервания.</div>';
    const w=760,h=190,l=30,r=12,t=14,b=24,vals=points.map(x=>x.v),min0=Math.min(...vals),max0=Math.max(...vals),pad=Math.max(1,(max0-min0)*.2),min=Math.max(0,min0-pad),max=Math.min(100,max0+pad),span=Math.max(1,max-min),X=i=>l+(w-l-r)*i/(points.length-1),Y=v=>t+(h-t-b)*(1-(v-min)/span),d=points.map((p,i)=>(i?'L':'M')+X(i)+' '+Y(p.v)).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Измерена социална история"><g stroke="#e8edf4" stroke-width="1">${[0,.25,.5,.75,1].map(q=>`<line x1="${l}" y1="${t+(h-t-b)*q}" x2="${w-r}" y2="${t+(h-t-b)*q}"/>`).join('')}</g><path d="${d}" fill="none" stroke="#1766e8" stroke-width="2.5" stroke-linejoin="miter"/>${points.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p.v)}" r="2.7" fill="#1766e8"><title>${esc(String(p.d).slice(0,10))} · ${fmt(p.v,1)}/100</title></circle>`).join('')}</svg>`;
  }

  function dateBG(s){const d=new Date(s||0);if(isNaN(d))return'публично потвърдено';return d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})}
  function relativeDate(s){const d=new Date(s||0);if(isNaN(d))return'няма скорошна проверка';const mins=Math.max(0,Math.round((Date.now()-d.getTime())/60000));if(mins<60)return`преди ${mins} мин.`;const h=Math.round(mins/60);if(h<48)return`преди ${h} ч.`;return d.toLocaleDateString('bg-BG')}
  function channelMetric(label,value,suffix=''){return `<span>${esc(label)}<b>${esc(value==null?'—':fmt(value,suffix==='%'?1:0)+(suffix||''))}</b></span>`}
  function icon(name){const m={index:'<path d="M4 18V9M10 18V5M16 18v-8M3 20h18"/>',pulse:'<path d="M3 12h4l2-6 4 12 2-6h6"/>',audience:'<circle cx="9" cy="8" r="3"/><path d="M3 20c1-4 3-6 6-6s5 2 6 6M16 6c2 0 4 1 4 3s-1 3-3 3M17 14c2 .5 3.5 2 4 4"/>',engage:'<path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 9h8M8 12h5"/>',mentions:'<circle cx="12" cy="12" r="8"/><path d="M16 10v3a2 2 0 0 1-4 0V9a2 2 0 0 1 4 0v4a4 4 0 1 1-2-3.5"/>'};return `<svg viewBox="0 0 24 24" aria-hidden="true">${m[name]||m.index}</svg>`}
  function cardKpi(iconName,label,value,suffix,foot){return `<div class="sm-card sm-kpi"><div class="sm-kpi-head"><span class="sm-kpi-ico">${icon(iconName)}</span>${esc(label)}</div><div class="sm-kpi-value">${esc(value)}${suffix?`<small>${esc(suffix)}</small>`:''}</div><div class="sm-kpi-foot">${esc(foot)}</div></div>`}

  let cache={client:'',at:0,data:null};
  async function fullClient(){const c=currentClient();if(cache.client===c&&Date.now()-cache.at<4000&&cache.data)return cache.data;try{const r=await fetch('/api/store/export',{cache:'no-store'});if(r.ok){const st=await r.json(),data=st?.clients?.[c]||null;cache={client:c,at:Date.now(),data};return data}}catch(e){}return null}

  function postFeeds(chs,obs){
    return `<div class="sm-card sm-network-feeds"><div class="sm-card-head"><div><h3>ПОСЛЕДНИ ПУБЛИКАЦИИ ПО КАНАЛИ</h3><p>До три последно достъпни публични публикации от всеки наблюдаван профил</p></div><span class="sm-pill">ПУБЛИЧНИ ИЗТОЧНИЦИ</span></div><div class="sm-network-feed-grid">${chs.map(ch=>{const posts=displayPosts(ch,obs),count=ch.posts==null?null:Number(ch.posts);return `<section class="sm-network-feed ${posts.length?'':'is-empty'}"><div class="sm-network-feed-head">${platformIcon(ch.platform)}<b>${esc(ch.platform)}</b><small>${posts.length?`показани ${posts.length}${count!=null&&count>posts.length?` от ${fmt(count)}`:''}`:(count!=null?`${fmt(count)} измерени`:'няма измерен брой')}</small></div><div class="sm-network-posts">${posts.length?posts.map(p=>`<a class="sm-network-post" ${p.url?`href="${esc(p.url)}" target="_blank" rel="noopener noreferrer"`:''}><div><p>${esc(p.text)}</p><span>${esc(dateBG(p.time))}${p.verified?' · публично потвърдено':''}</span></div>${p.url?'<em>Отвори ↗</em>':''}</a>`).join(''):`<div class="sm-network-empty">${count!=null&&count>0?'Има измерена публикационна активност, но чистият текст на последните постове не е публично достъпен без вход/API.':'При последната проверка не е открит публично достъпен текст на публикация.'}</div>${ch.url?`<a class="sm-network-profile" href="${esc(ch.url)}" target="_blank" rel="noopener noreferrer">Отвори профила ↗</a>`:''}`}</div></section>`}).join('')}</div></div>`;
  }

  async function render(){
    const host=document.getElementById('socialBody');if(!host)return;styles();
    const {D,S,A,H}=state(),full=await fullClient();if(!document.getElementById('socialBody'))return;
    const sources=arr(full?.sources).length?full.sources:S,obs=arr(full?.observations).length?full.observations:A,chs=canonical(sources,obs),presence=metricValue(D,['presence','social','social_index']);
    const hist=historicalPresence(H),pulse=hist.length>1?Math.round((hist[hist.length-1].v-hist[hist.length-2].v)*10)/10:null;
    const feedMap=new Map(chs.map(ch=>[ch.key,displayPosts(ch,obs)]));
    chs.forEach(ch=>{const hasContent=(feedMap.get(ch.key)||[]).length>0;ch.active=ch.access>0||ch.followers!=null||(ch.posts!=null&&ch.posts>0)||(ch.reactions!=null&&ch.reactions>0)||hasContent;});
    const activeCount=chs.filter(c=>c.active).length;
    const followers=chs.map(x=>x.followers).filter(v=>num(v)>0),audience=followers.length?followers.reduce((a,b)=>a+b,0):null;
    const posts=chs.map(x=>x.posts).filter(v=>num(v)>0),totalPosts=posts.length?posts.reduce((a,b)=>a+b,0):null;
    const rates=chs.map(x=>x.engRate).filter(v=>num(v)>0),engagement=rates.length?rates.reduce((a,b)=>a+b,0)/rates.length:null;
    const reactionVals=chs.map(x=>x.reactions).filter(v=>num(v)>0),totalReactions=reactionVals.length?reactionVals.reduce((a,b)=>a+b,0):null;
    const mentionVals=chs.map(x=>x.mentions).filter(v=>num(v)>0),totalMentions=mentionVals.length?mentionVals.reduce((a,b)=>a+b,0):null;

    const channelHtml=chs.map(c=>{const firstLabel=c.followers!=null?'Аудитория':'Достъпност',firstValue=c.followers!=null?c.followers:c.access,firstSuffix=c.followers!=null?'':'%';const thirdLabel=c.engRate!=null?'Ангажираност':'Видими реакции',thirdValue=c.engRate!=null?c.engRate:c.reactions,thirdSuffix=c.engRate!=null?'%':'';return `<button type="button" class="sm-channel ${c.active?'':'is-limited'}" data-sm-channel="${esc(c.key)}"><div class="sm-channel-top"><span class="sm-channel-logo">${platformIcon(c.platform)}</span><span class="sm-channel-name">${esc(c.platform)}</span><i class="sm-channel-status ${c.active?'':'off'}"></i><span class="sm-channel-state ${c.active?'':'limited'}">${c.active?'АКТИВЕН':'ОГРАНИЧЕН ДОСТЪП'}</span></div><div class="sm-channel-metrics">${channelMetric(firstLabel,firstValue,firstSuffix)}${channelMetric('Публикации (период)',c.posts)}${channelMetric(thirdLabel,thirdValue,thirdSuffix)}${channelMetric('Споменавания',c.mentions)}</div><div class="sm-channel-observed">последна проверка: ${esc(relativeDate(c.stamp))}</div></button>`}).join('');

    const limited=chs.length-activeCount;
    const warnings=limited>0?[{c:'warn',i:'!',t:`Ограничен публичен достъп до ${limited} канал${limited===1?'':'а'}`,x:'Каналът остава наблюдаван, но не се представя като активен, докато няма достъпен профил или съдържание.'}]:[{c:'good',i:'✓',t:'Наблюдаваните социални канали са достъпни',x:'Стойностите и публикациите идват от измерими публични сигнали.'}];
    const historyBadge=hist.length>=2?'ИЗМЕРЕНА ИСТОРИЯ':'НАТРУПВАНЕ НА ИСТОРИЯ';

    host.innerHTML=`<div class="ref-title"><h2>Социални сигнали</h2><p>Как се променят социалното присъствие, активността и публичните реакции към марката</p></div><div class="sm-shell"><div class="sm-kpis">${cardKpi('index','Социален индекс',presence==null?'—':fmt(presence,0),presence==null?'':'/100',presence==null?'Натрупване на измерима база':'Текуща обща оценка')}${cardKpi('pulse','Социална динамика',pulse==null?'—':(pulse>0?'+':'')+fmt(pulse,1),pulse==null?'':' т.',pulse==null?'Нужни са две реални измервания':'Промяна между последните две измервания')}${cardKpi('audience','Публична аудитория',audience==null?'—':fmt(audience),'',audience==null?'Няма извлечено валидно публично измерване':'Сбор от последните валидни измервания на аудиторията')}${cardKpi('engage',engagement!=null?'Ангажираност':'Видими реакции',engagement!=null?pct(engagement):(totalReactions==null?'—':fmt(totalReactions)),'',engagement!=null?'Средна измерена стойност':(totalReactions==null?'Няма извлечено валидно измерване':'Последни валидни публично видими реакции'))}${cardKpi('mentions','Споменавания',totalMentions==null?'—':fmt(totalMentions),'','Публично измерими споменавания в наблюдаваните канали')}</div><div class="sm-grid-main"><div class="sm-card"><div class="sm-card-head"><div><h3>СОЦИАЛНА ДИНАМИКА</h3><p>Само реално натрупаната история на социалния индекс</p></div><span class="sm-pill">${historyBadge}</span></div><div class="sm-chart">${measuredChart(hist)}</div><div class="sm-chart-meta"><span><b>${hist.length}</b> реални измервания</span><span><b>${totalPosts==null?'—':fmt(totalPosts)}</b> публикации в периода</span><span><b>${totalMentions==null?'—':fmt(totalMentions)}</b> споменавания</span></div></div><div class="sm-card"><div class="sm-card-head"><div><h3>СОЦИАЛНИ ПРЕДУПРЕЖДЕНИЯ</h3><p>Достъпност и отклонения в наблюдаваните канали</p></div></div><div class="sm-alerts">${warnings.map(w=>`<div class="sm-alert ${w.c}"><span class="sm-alert-ico">${w.i}</span><div><b>${esc(w.t)}</b><small>${esc(w.x)}</small></div><span class="sm-alert-tag">СИГНАЛ</span></div>`).join('')}</div></div></div><div class="sm-card"><div class="sm-card-head"><div><h3>КАНАЛИ И ПРИНОС</h3><p>Една карта за всеки реално наблюдаван социален профил</p></div><span class="sm-pill">${activeCount} активни · ${chs.length} наблюдавани</span></div><div class="sm-channel-grid">${channelHtml||'<div class="sm-network-empty">Няма конфигурирани конкретни социални профили.</div>'}</div><div id="smChannelDetail" class="sm-detail" data-open="0"></div></div>${postFeeds(chs,obs)}<div class="sm-method"><strong>Метод:</strong> аудиторията и реакциите използват последните валидни положителни публични измервания; блокиран или непълен цикъл не занулява предишно валидно наблюдение. Публикация се визуализира само при чист текст и валиден публичен източник.</div></div>`;
    bind(chs);
  }

  function bind(chs){
    const detail=document.getElementById('smChannelDetail'),buttons=[...document.querySelectorAll('#socialBody [data-sm-channel]')];
    buttons.forEach(b=>b.addEventListener('click',()=>{const c=chs.find(x=>x.key===b.dataset.smChannel);if(!detail||!c)return;buttons.forEach(x=>x.classList.toggle('active',x===b));detail.dataset.open='1';detail.innerHTML=`<div class="sm-detail-box"><h4>${esc(c.platform)} — текущо състояние</h4><div class="sm-detail-stats"><div><small>${c.followers!=null?'Аудитория':'Достъпност'}</small><b>${c.followers!=null?fmt(c.followers):pct(c.access)}</b></div><div><small>Публикации в периода</small><b>${fmt(c.posts)}</b></div><div><small>${c.engRate!=null?'Ангажираност':'Видими реакции'}</small><b>${c.engRate!=null?pct(c.engRate):fmt(c.reactions)}</b></div><div><small>Споменавания</small><b>${fmt(c.mentions)}</b></div></div></div>`}))
  }

  const oldRefGo=window.refGo;
  if(typeof oldRefGo==='function')window.refGo=function(id){oldRefGo(id);if(id==='social')setTimeout(render,0)};
  function rename(){const b=document.querySelector('#nav button[data-page="social"]');if(!b)return;const spans=b.querySelectorAll('span');if(spans.length)spans[spans.length-1].textContent='Социални сигнали'}
  rename();setTimeout(rename,900);setTimeout(()=>{if(document.getElementById('social')?.classList.contains('active'))render()},1000);
  window.BLISSocialSignalsRender=render;
})();