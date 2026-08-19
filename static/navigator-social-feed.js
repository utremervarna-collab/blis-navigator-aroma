/* BLIS Navigator — real social posts/comments feed. No synthetic text. */
(function(){
  'use strict';
  const SOCIAL_RE=/facebook|instagram|linkedin|youtube|tiktok|twitter|x\.com|(^|[_-])x($|[_-])/i;
  const TEXT_METRIC_RE=/(post|publication|comment|caption|message|video[_-]?title|latest[_-]?(post|comment)|social[_-]?(text|content)|excerpt|snippet)/i;
  const URL_METRIC_RE=/(post|comment|publication|video|permalink|social).*url|url.*(post|comment|publication|video)/i;
  const arr=x=>Array.isArray(x)?x:[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const text=v=>typeof v==='string'?v.trim():'';
  const slug=()=>String(document.body?.dataset?.client||window.BLIS_INITIAL_CLIENT||window.slug||'aroma');
  const state=()=>({A:(typeof A!=='undefined'&&A)||[],S:(typeof S!=='undefined'&&S)||[]});
  const platformName=s=>{const q=String(s||'').toLowerCase();if(q.includes('instagram'))return'Instagram';if(q.includes('facebook'))return'Facebook';if(q.includes('linkedin'))return'LinkedIn';if(q.includes('youtube'))return'YouTube';if(q.includes('tiktok'))return'TikTok';if(q.includes('twitter')||q==='x'||q.includes('x.com'))return'X';return'Социална мрежа'};
  const platformClass=p=>String(p||'').toLowerCase().replace(/[^a-z]/g,'');
  const platformGlyph=p=>({Facebook:'f',Instagram:'◎',LinkedIn:'in',YouTube:'▶',TikTok:'♪',X:'𝕏'}[p]||'●');
  const typeName=s=>{const q=String(s||'').toLowerCase();if(q.includes('comment'))return'Коментар';if(q.includes('video'))return'Видео';if(q.includes('post')||q.includes('publication')||q.includes('caption'))return'Публикация';return'Социален сигнал'};
  const isHumanText=v=>{const s=text(v);if(s.length<18||s.length>4000)return false;if(/^https?:\/\//i.test(s))return false;if(/^[-+]?\d+(?:[.,]\d+)?%?$/.test(s))return false;if(/^(true|false|ok|active|reachable)$/i.test(s))return false;return /[A-Za-zА-Яа-я]/.test(s)};
  const truncate=(s,n=240)=>{s=text(s).replace(/\s+/g,' ');return s.length>n?s.slice(0,n-1).trimEnd()+'…':s};
  const timeValue=x=>x?.published_at||x?.created_at||x?.captured_at||x?.observed_at||x?.time||x?.date||x?.timestamp||x?.meta?.published_at||x?.meta?.created_at||x?.meta?.observed_at||'';
  const dateBG=x=>{const d=new Date(timeValue(x)||0);if(isNaN(d))return'дата не е налична';return d.toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})};
  const sourceKey=x=>String(x?.source_key||x?.source||x?.channel||x?.platform||x?.network||'').toLowerCase();
  const metricKey=x=>String(x?.metric_key||x?.metric||x?.key||x?.type||x?.kind||'').toLowerCase();
  const valueOf=x=>x?.value??x?.text??x?.content??x?.message??x?.comment??x?.caption??x?.title??x?.snippet??x?.description??x?.meta?.text??x?.meta?.content??x?.meta?.message??x?.meta?.comment??x?.meta?.caption??x?.meta?.title??x?.meta?.snippet??x?.meta?.description;
  const directURL=x=>text(x?.url||x?.permalink||x?.post_url||x?.comment_url||x?.video_url||x?.meta?.url||x?.meta?.permalink||x?.meta?.post_url||x?.meta?.comment_url||x?.meta?.video_url);
  const sourceURL=(key,S)=>{const k=String(key||'').toLowerCase();const s=arr(S).find(x=>String(x?.key||x?.source_key||'').toLowerCase()===k);return text(s?.url)};
  const engagement=x=>{const m=x?.meta||x||{};const out=[];[['likes','харесвания'],['reactions','реакции'],['comments','коментари'],['replies','отговори'],['shares','споделяния'],['views','гледания']].forEach(([k,l])=>{const v=m[k];if(v!==undefined&&v!==null&&v!==''&&!isNaN(Number(v)))out.push(`${Number(v).toLocaleString('bg-BG')} ${l}`)});return out.slice(0,3)};
  function normalizeRecord(x,S){
    const sk=sourceKey(x),mk=metricKey(x),combined=sk+' '+mk+' '+String(x?.platform||x?.channel||'');
    if(!SOCIAL_RE.test(combined))return null;
    const raw=valueOf(x);if(!isHumanText(raw))return null;
    if(!TEXT_METRIC_RE.test(mk)&&!(x?.text||x?.content||x?.message||x?.comment||x?.caption||x?.snippet||x?.meta?.text||x?.meta?.content||x?.meta?.comment))return null;
    const p=platformName(combined),u=directURL(x),fallback=sourceURL(sk,S),typ=typeName(mk+' '+String(x?.type||x?.kind||''));
    return {platform:p,type:typ,text:truncate(raw),time:timeValue(x),url:u||fallback,direct:!!u,engagement:engagement(x),source:sk};
  }
  function pairObservationURLs(obs){
    const links=new Map();
    arr(obs).forEach(o=>{const sk=sourceKey(o),mk=metricKey(o),v=text(o?.value);if(SOCIAL_RE.test(sk)&&URL_METRIC_RE.test(mk)&&/^https?:\/\//i.test(v)){const stem=mk.replace(/url/g,'').replace(/[^a-z0-9]+/g,'');links.set(sk+'|'+stem,v)}});
    return arr(obs).map(o=>{if(directURL(o))return o;const sk=sourceKey(o),mk=metricKey(o),stem=mk.replace(/text|content|caption|message|title|snippet|excerpt/g,'').replace(/[^a-z0-9]+/g,'');const u=links.get(sk+'|'+stem);return u?{...o,url:u}:o});
  }
  function dedupe(rows){const seen=new Set();return rows.filter(r=>{const k=(r.url&&r.direct?r.url:'')+'|'+r.platform+'|'+r.text.toLowerCase().replace(/\s+/g,' ').slice(0,150);if(seen.has(k))return false;seen.add(k);return true})}
  let cache={client:'',at:0,rows:[]};
  async function collect(){
    const current=slug();if(cache.client===current&&Date.now()-cache.at<15000)return cache.rows;
    const {A,S}=state();let raw=[...arr(A)];
    try{const r=await fetch('/api/store/export',{cache:'no-store'});if(r.ok){const store=await r.json();const c=store?.clients?.[current];if(c?.observations)raw.push(...c.observations)}}catch(e){}
    try{if(Array.isArray(window.SOCIALSIGNAL_TABLE))raw.push(...window.SOCIALSIGNAL_TABLE)}catch(e){}
    raw=pairObservationURLs(raw);
    const rows=dedupe(raw.map(x=>normalizeRecord(x,S)).filter(Boolean));
    rows.sort((a,b)=>{const ta=new Date(a.time||0).getTime()||0,tb=new Date(b.time||0).getTime()||0;return tb-ta});
    cache={client:current,at:Date.now(),rows:rows.slice(0,8)};return cache.rows;
  }
  function signature(rows){let h=2166136261>>>0;const s=rows.map(r=>[r.platform,r.type,r.time,r.text,r.url].join('|')).join('~');for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return String(h>>>0)}
  function styles(){if(document.getElementById('blisSocialFeedStyles'))return;const s=document.createElement('style');s.id='blisSocialFeedStyles';s.textContent=`
    .sm-platform-icon{width:29px;height:29px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px;font:800 14px/1 Arial;color:#fff;box-shadow:0 3px 10px rgba(20,40,75,.12)}
    .sm-platform-icon.facebook{background:#1877f2}.sm-platform-icon.instagram{background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);font-size:18px}.sm-platform-icon.linkedin{background:#0a66c2;font-size:11px}.sm-platform-icon.youtube{background:#ff0000}.sm-platform-icon.tiktok{background:#111;text-shadow:-1px 0 #25f4ee,1px 0 #fe2c55}.sm-platform-icon.x{background:#111}
    .sm-social-feed{margin-top:18px}.sm-feed-list{display:grid;gap:10px}.sm-feed-item{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;align-items:start;padding:13px 14px;border:1px solid #e7ecf3;border-radius:12px;background:#fff;transition:.18s ease}.sm-feed-item:hover{border-color:#cfd9e8;box-shadow:0 6px 18px rgba(25,52,90,.06)}
    .sm-feed-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;color:#76849a;font-size:11px}.sm-feed-meta b{color:#213957;font-size:12px}.sm-feed-type{padding:2px 6px;border-radius:999px;background:#f1f5fa;color:#53677f;font-size:10px;font-weight:700}.sm-feed-text{margin:6px 0 5px;color:#213957;font-size:13px;line-height:1.45}.sm-feed-eng{font-size:10px;color:#7a8798}.sm-feed-link{align-self:center;white-space:nowrap;color:#1766e8;text-decoration:none;font-size:11px;font-weight:700}.sm-feed-link:hover{text-decoration:underline}.sm-feed-empty{padding:22px;border:1px dashed #dce4ef;border-radius:12px;background:#fafbfd;text-align:center;color:#718096;font-size:12px;line-height:1.5}
    .sm-channel-logo{background:none!important;box-shadow:none!important}.sm-channel-logo .sm-platform-icon{width:28px;height:28px}
    @media(max-width:760px){.sm-feed-item{grid-template-columns:36px minmax(0,1fr)}.sm-feed-link{grid-column:2;justify-self:start}}
  `;document.head.appendChild(s)}
  function iconHTML(p){return `<span class="sm-platform-icon ${platformClass(p)}">${esc(platformGlyph(p))}</span>`}
  function colorChannels(){document.querySelectorAll('#socialBody .sm-channel').forEach(ch=>{const name=ch.querySelector('.sm-channel-name')?.textContent?.trim()||ch.dataset.smChannel||'';const p=platformName(name);const logo=ch.querySelector('.sm-channel-logo');if(logo&&logo.dataset.platformIcon!==p){logo.dataset.platformIcon=p;logo.innerHTML=iconHTML(p)}})}
  function cardHTML(rows,sig){
    const body=rows.length?`<div class="sm-feed-list">${rows.map(r=>`<div class="sm-feed-item"><div>${iconHTML(r.platform)}</div><div><div class="sm-feed-meta"><b>${esc(r.platform)}</b><span class="sm-feed-type">${esc(r.type)}</span><span>${esc(dateBG(r))}</span></div><div class="sm-feed-text">${esc(r.text)}</div>${r.engagement.length?`<div class="sm-feed-eng">${esc(r.engagement.join(' · '))}</div>`:''}</div>${r.url?`<a class="sm-feed-link" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${r.direct?'Оригинал ↗':'Към канала ↗'}</a>`:''}</div>`).join('')}</div>`:`<div class="sm-feed-empty"><b>Няма налични реални публикации или коментари за избрания период.</b><br>Блокът показва само текст, действително получен от свързан социален източник.</div>`;
    return `<div class="sm-card sm-social-feed" data-social-real-feed="1" data-feed-sig="${esc(sig)}"><div class="sm-card-head"><div><h3>ПОСЛЕДНИ ПУБЛИКАЦИИ И КОМЕНТАРИ</h3><p>Последни реални текстови записи от наблюдаваните социални канали</p></div><span class="sm-pill live">● REAL DATA</span></div>${body}</div>`;
  }
  async function mount(){
    if(mount.busy)return;mount.busy=true;
    try{
      const root=document.getElementById('socialBody');if(!root)return;styles();colorChannels();
      const channelCard=[...root.querySelectorAll('.sm-card')].find(c=>(c.querySelector('h3')?.textContent||'').includes('КАНАЛИ И ПРИНОС'));if(!channelCard)return;
      const rows=await collect(),sig=signature(rows);let card=root.querySelector('[data-social-real-feed="1"]');
      if(card?.dataset.feedSig===sig){colorChannels();return}
      if(card)card.outerHTML=cardHTML(rows,sig);else channelCard.insertAdjacentHTML('afterend',cardHTML(rows,sig));
      colorChannels();
    }finally{mount.busy=false}
  }
  let timer=0;function schedule(){clearTimeout(timer);timer=setTimeout(mount,100)}
  function init(){schedule();const root=document.getElementById('socialBody');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});setInterval(()=>{if(document.getElementById('social')?.classList.contains('active'))mount()},60000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
