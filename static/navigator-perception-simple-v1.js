(() => {
  'use strict';

  const STYLE_ID='pmsSimpleV1Styles';
  let scheduled=0;

  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const marketActive=()=>!!qs('#market.page.active');
  const getD=()=>{try{return typeof D!=='undefined'&&D?D:{}}catch(_){return{}}};
  const getA=()=>{try{return typeof A!=='undefined'&&Array.isArray(A)?A:[]}catch(_){return[]}};
  const periodDays=()=>Number(qs('#market [data-pm-period]')?.value)||30;
  const timeOf=x=>{const raw=x?.observed_at||x?.time||x?.created_at||x?.createdAt||x?.timestamp||x?.date;const t=raw?new Date(raw).getTime():NaN;return Number.isFinite(t)?t:null};
  const sourceOf=x=>String(x?.source||x?.source_key||'').trim();

  function ensureStyles(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
#market .pm-focusbar{display:none!important}
#market .pm-kpis>.pmx-kpis{display:none!important}
#market .pm-kpis{margin-bottom:12px!important}
#market .pms-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
#market .pms-kpi{min-width:0;height:92px;padding:12px 13px;border:1px solid #e4e9f0;border-radius:12px;background:#fff;text-align:left;cursor:pointer;transition:.16s ease;position:relative;overflow:hidden}
#market .pms-kpi:hover,#market .pms-kpi.active{border-color:#b8cef7;box-shadow:0 7px 18px rgba(29,78,216,.06);transform:translateY(-1px)}
#market .pms-kpi.active:before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--pm-accent,#1766e8)}
#market .pms-kpi-label{display:block;font-size:10px!important;color:#667085;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#market .pms-kpi-row{display:flex;align-items:baseline;gap:6px;margin-top:5px}
#market .pms-kpi-value{font-size:25px!important;line-height:1;color:#101828;font-weight:800;letter-spacing:-.035em;white-space:nowrap}
#market .pms-kpi-delta{margin-left:auto;font-size:8.5px!important;font-weight:800;white-space:nowrap;color:#98a2b3}
#market .pms-kpi-delta.up{color:#0b9555}#market .pms-kpi-delta.down{color:#d34f59}
#market .pms-kpi-foot{display:block;margin-top:8px;font-size:8px!important;color:#98a2b3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#market .pm-main{grid-template-columns:minmax(0,1fr) 326px!important;gap:12px!important}
#market .pmx-inspector-head b{font-size:12px!important}
#market .pmx-signal-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
#market .pmx-signal-stat.pms-empty{display:none!important}
#market .pmx-section.pms-hidden{display:none!important}
#market .pmx-section h4{font-size:9px!important;text-transform:none!important;letter-spacing:0!important}
#market .pmx-section p{font-size:9.5px!important}
#market .pmx-actions{grid-template-columns:1fr!important;gap:7px!important}
#market .pmx-actions button{min-height:37px!important;font-size:9px!important}
#market .pm-lower{grid-template-columns:1.35fr 1fr!important;gap:10px!important}
#market .pm-lower>.pmx-lower-card:nth-child(3){display:none!important}
#market .pm-lower.pms-one{grid-template-columns:1fr!important}
#market .pm-lower.pms-empty{display:none!important}
#market .pmx-lower-card.pms-hidden{display:none!important}
#market .pmx-lower-head h3{font-size:12px!important}
#market .pm-hero h2{font-size:21px!important}
#market .pm-hero p{max-width:700px!important;font-size:10px!important;line-height:1.45!important}
@media(max-width:980px){#market .pms-kpis{grid-template-columns:repeat(2,1fr)}#market .pm-main{grid-template-columns:1fr!important}#market .pm-lower{grid-template-columns:1fr!important}}
@media(max-width:560px){#market .pms-kpis{grid-template-columns:1fr 1fr}#market .pms-kpi{height:86px;padding:10px}#market .pms-kpi-value{font-size:21px!important}}
`;
    document.head.appendChild(s)
  }

  function existingCard(id){return qs(`#market .pmx-kpi[data-pmx-kpi="${id}"]`)}
  function cardValue(id){return existingCard(id)?.querySelector('.pmx-kpi-main strong')?.textContent?.trim()||'—'}
  function cardSuffix(id){return existingCard(id)?.querySelector('.pmx-kpi-main small')?.textContent?.trim()||''}
  function cardDelta(id){
    const e=existingCard(id)?.querySelector('.pmx-kpi-delta');
    return{text:e?.textContent?.trim()||'',cls:e?.classList.contains('up')?'up':e?.classList.contains('down')?'down':''}
  }
  function noValue(v){return !v||v==='—'||/^0(?:[.,]0+)?(?:\s*\/5)?$/.test(v)}
  function realSignalCount(){
    const d=getD(),arr=Array.isArray(d?.signals)?d.signals:[];
    if(arr.length)return arr.length;
    return qsa('#market .pm-node.kind-signal').length
  }
  function measuredSourceCount(){
    const cut=Date.now()-periodDays()*864e5,set=new Set();
    getA().forEach(x=>{const t=timeOf(x);if(t!=null&&t<cut)return;const s=sourceOf(x);if(s)set.add(s)});
    return set.size
  }
  function simplePack(){
    const pDelta=cardDelta('perception'),tDelta=cardDelta('trend'),rating=cardValue('rating'),ratingDelta=cardDelta('rating'),signals=realSignalCount();
    const fourth=!noValue(rating)
      ?{id:'rating',label:'Средна оценка',value:rating,suffix:cardSuffix('rating'),delta:ratingDelta.text,deltaCls:ratingDelta.cls,foot:'от наличните измерени рейтинги',action:'rating'}
      :{id:'sources',label:'Източници с данни',value:String(measuredSourceCount()),suffix:'',delta:'',deltaCls:'',foot:`с измервания за ${periodDays()} дни`,action:'sources'};
    return[
      {id:'perception',label:'Общо възприятие',value:cardValue('perception'),suffix:cardSuffix('perception'),delta:pDelta.text,deltaCls:pDelta.cls,foot:'обща картина от наличните измервания',action:'perception'},
      {id:'trend',label:'Промяна',value:cardValue('trend'),suffix:cardSuffix('trend'),delta:tDelta.text,deltaCls:tDelta.cls,foot:'спрямо предходното сравнимо измерване',action:'trend'},
      {id:'signals',label:'Наблюдавани сигнали',value:String(signals),suffix:'',delta:'',deltaCls:'',foot:`потвърдени сигнали в текущия профил`,action:'signals'},
      fourth
    ]
  }
  function topCard(x){return`<button type="button" class="pms-kpi" data-pms-action="${esc(x.action)}"><span class="pms-kpi-label">${esc(x.label)}</span><div class="pms-kpi-row"><strong class="pms-kpi-value">${esc(x.value)}${x.suffix?` <small>${esc(x.suffix)}</small>`:''}</strong>${x.delta?`<em class="pms-kpi-delta ${esc(x.deltaCls)}">${esc(x.delta)}</em>`:''}</div><span class="pms-kpi-foot">${esc(x.foot)}</span></button>`}
  function renderTop(){
    const host=qs('#market .pm-kpis');if(!host)return;
    let simple=qs('.pms-kpis',host);if(!simple){simple=document.createElement('div');simple.className='pms-kpis';host.appendChild(simple)}
    const html=simplePack().map(topCard).join('');if(simple.dataset.html!==html){simple.innerHTML=html;simple.dataset.html=html}
    qsa('[data-pms-action]',simple).forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>handleTop(b.dataset.pmsAction))})
  }
  function handleTop(action){
    if(action==='perception'||action==='trend'||action==='rating'){existingCard(action)?.click();return}
    if(action==='signals'){
      const sel=qs('#market .pmx-kind-filter');if(sel){sel.value='signal';sel.dispatchEvent(new Event('change',{bubbles:true}))}
      setTimeout(()=>qs('#market .pm-node.kind-signal:not(.pmx-kind-hidden)')?.click(),40);return
    }
    if(action==='sources')window.refGo?.('sources')
  }

  function simplifyInspector(){
    const d=qs('#pmDrawer');if(!d)return;
    const head=qs('.pmx-inspector-head b',d);if(head)head.textContent='Избран сигнал';
    qsa('.pmx-signal-stat',d).forEach(x=>{const v=qs('b',x)?.textContent?.trim()||'';x.classList.toggle('pms-empty',!v||v==='—'||/няма сравнима/i.test(v))});
    qsa('.pmx-section',d).forEach(sec=>{
      const h=qs('h4',sec),title=h?.textContent?.trim()||'';
      if(title==='Ключова тема')h.textContent='Какво се случва';
      if(title==='Настроение')h.textContent='Как се възприема';
      if(title==='Свързани подтеми')h.textContent='Свързани теми';
      if(title==='Източници')h.textContent='Къде го виждаме';
      if(title==='Примери за сигнали')h.textContent='Примери';
      const hasRealSent=!!qs('.pmx-sentbar',sec);
      const hasRelated=qsa('button',sec).length>0;
      const hasSource=qsa('.pmx-source-row',sec).length>0;
      const hasExample=qsa('.pmx-example',sec).length>0;
      const emptyText=/^Няма /i.test(qs('p',sec)?.textContent?.trim()||'');
      const hide=(title==='Настроение'&&!hasRealSent)||(title==='Свързани подтеми'&&!hasRelated)||(title==='Източници'&&!hasSource)||(title==='Примери за сигнали'&&!hasExample)||emptyText;
      sec.classList.toggle('pms-hidden',hide)
    });
    const alert=qs('[data-pmx-alert]',d);if(alert){alert.textContent=alert.classList.contains('saved')?'✓ Следиш сигнала':'Следи сигнал'}
    const analytics=qs('[data-pmx-analytics]',d);if(analytics)analytics.textContent='Виж свързания модул'
  }

  function simplifyLower(){
    const host=qs('#market .pm-lower');if(!host)return;
    const cards=qsa(':scope > .pmx-lower-card',host);if(!cards.length)return;
    cards.forEach((c,i)=>c.classList.toggle('pms-hidden',i>1));
    if(cards[0]){
      const h=qs('h3',cards[0]);if(h)h.textContent='Как се променя възприятието';
      cards[0].classList.toggle('pms-hidden',!!qs('.pmx-chart-empty',cards[0]))
    }
    if(cards[1]){
      const h=qs('h3',cards[1]);if(h)h.textContent='Какво се промени най-много';
      cards[1].classList.toggle('pms-hidden',qsa('.pmx-change-row',cards[1]).length===0)
    }
    const visible=cards.slice(0,2).filter(c=>!c.classList.contains('pms-hidden')).length;
    host.classList.toggle('pms-empty',visible===0);host.classList.toggle('pms-one',visible===1)
  }

  function simplifyCopy(){
    const h=qs('#market .pm-hero h2'),p=qs('#market .pm-hero p');
    if(h)h.textContent='Карта на възприятието';
    if(p)p.textContent='Избери елемент от глобуса, за да видиш какво показва, откъде идва и как се променя.'
  }
  function apply(){if(!marketActive())return;ensureStyles();renderTop();simplifyInspector();simplifyLower();simplifyCopy()}
  function schedule(delay=0){clearTimeout(scheduled);scheduled=setTimeout(()=>requestAnimationFrame(apply),delay)}
  function install(){ensureStyles();schedule(0);const root=qs('#marketBody');if(root)new MutationObserver(()=>schedule(40)).observe(root,{childList:true,subtree:true,characterData:true})}

  document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-page="market"],#market .pm-node,#market [data-pmx-kpi]'))schedule(60)},true);
  document.addEventListener('change',e=>{if(e.target.matches?.('#market select,#clientSel'))schedule(100)},true);
  window.addEventListener('blis:clientdata',()=>schedule(120));
  window.addEventListener('blis:periodchange',()=>schedule(80));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('load',()=>schedule(100),{once:true});
})();