/* BLIS Navigator — canonical data/runtime + period controller */
var $=id=>document.getElementById(id);
var esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
var slug='aroma',D=null,S=[],Q={},A=[],H=[];

function clamp(v){return Math.max(0,Math.min(100,Number(v)||0))}
function idx(k){return (D?.indices||[]).find(x=>x.key===k)||null}
function score(k){if(k==='blis'){let n=Number(D?.blis_index);return Number.isFinite(n)?n:null}let x=idx(k);return x&&Number.isFinite(Number(x.value))?Number(x.value):null}
function val(v){if(v===null||v===undefined||v==='')return'—';if(typeof v==='number')return Number.isInteger(v)?String(v):v.toLocaleString('bg-BG',{maximumFractionDigits:1});return String(v)}
function hist(k){return(window.BLISPeriod?.dailySeries?BLISPeriod.dailySeries(k).map(x=>x.value):(H||[]).map(s=>{let p=s?.payload||{};if(k==='blis')return Number(p.blis_index);let x=(p.indices||[]).find(i=>i.key===k);return x?Number(x.value):NaN}).filter(Number.isFinite))}
function spark(a,color='#0f5fe9'){if(!a||a.length<2)return'<div class="scan">Тенденцията ще се появи след поне две сравними измервания.</div>';let w=180,h=44,min=Math.min(...a),max=Math.max(...a);if(min===max)max=min+1;let pts=a.map((v,i)=>[4+(w-8)*i/(a.length-1),4+(h-8)*(1-(v-min)/(max-min))]),d=pts.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');return`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="${color}" stroke-width="2.4"/></svg>`}
function trend(){let a=hist('blis');if(a.length<2)return'<div class="scan" style="margin-top:65px">Историческата графика ще се появи след натрупване на сравними измервания.</div>';let w=760,h=210,l=35,r=10,t=12,b=22,X=i=>l+(w-l-r)*i/(a.length-1),Y=v=>t+(h-t-b)*(1-clamp(v)/100),grid=[0,25,50,75,100].map(v=>`<line x1="${l}" y1="${Y(v)}" x2="${w-r}" y2="${Y(v)}" stroke="#e8edf4"/><text x="2" y="${Y(v)+4}" font-size="9" fill="#667085">${v}</text>`).join(''),d=a.map((v,i)=>(i?'L':'M')+X(i)+' '+Y(v)).join(' ');return`<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${grid}<path d="${d}" fill="none" stroke="#0f5fe9" stroke-width="2.4"/>${a.map((v,i)=>`<circle cx="${X(i)}" cy="${Y(v)}" r="2.5" fill="#2f7df4"/>`).join('')}</svg>`}
function sourceName(k){return (S||[]).find(x=>x.key===k)?.label||k||'Източник'}
function metricName(k){const m={followers:'Публична аудитория',visible_posts_90d:'Видими публикации за 90 дни',news_mentions_30d:'Новинарски споменавания за 30 дни',profile_active:'Публичен профил',website_active:'Официален сайт',category_count:'Продуктови категории',review_count:'Публични отзиви',rating:'Публична оценка',ecommerce_active:'Електронна търговия',pricing_visible:'Видими цени',cart_active:'Количка',product_details:'Продуктова информация',history_visible:'История на марката',language_count:'Езиково покритие',portfolio_items:'Портфолио'};return m[k]||String(k||'').replaceAll('_',' ')}
function activityValue(x){if(/_active$|profile_active|website_active|pricing_visible|product_details|history_visible/.test(String(x?.metric)))return Number(x?.value)>0?'Потвърдено':'Не е потвърдено';if(String(x?.metric).includes('rating')&&!String(x?.metric).includes('ratings')){let n=Number(x?.value);return Number.isFinite(n)?n.toFixed(1):'—'}return val(x?.value)}
function activityRows(re,limit=12){let rows=(window.BLISPeriod?.activity?BLISPeriod.activity():A||[]).filter(x=>re.test(String(x.metric||''))).slice(0,limit);if(!rows.length)return'<div class="scan">Източниците се наблюдават. Нов ред се появява само при реално измерена стойност или потвърдена промяна.</div>';return rows.map(x=>`<div class="listRow"><div><b>${esc(metricName(x.metric))}</b><p>${esc(sourceName(x.source))}${x.time?' · '+new Date(x.time).toLocaleString('bg-BG'):''}</p></div><div class="right">${esc(activityValue(x))}</div></div>`).join('')}

var DOSSIER={
 aroma:{accent:'#1677ff',soft:'#eef6ff',mono:'AR',descriptor:'Българска козметична компания',summary:'BLIS наблюдава публичната среда, дигиталните активи, социалните канали, репутацията и конкурентните движения.',facts:[],portfolio:[],assets:[],history:[],links:[],notes:[]},
 bolyarka:{accent:'#b42318',soft:'#fff3f1',mono:'БЛ',descriptor:'Българска пивоварна компания',summary:'BLIS наблюдава публичните канали, репутацията, секторните източници и конкурентната пивоварна среда.',facts:[],portfolio:[],assets:[],history:[],links:[],notes:[]},
 'astor-garden':{accent:'#0f766e',soft:'#ecfdf8',mono:'AG',descriptor:'Хотелиерство',summary:'BLIS наблюдава репутацията, OTA платформите, сайта, социалните канали и конкурентната хотелска среда.',facts:[],portfolio:[],assets:[],history:[],links:[],notes:[]}
};
function dossier(){return DOSSIER[slug]||{accent:'#0f5fe9',soft:'#eef5ff',mono:(D?.name||'BL').slice(0,2).toUpperCase(),descriptor:D?.sector||'',summary:D?.note||'',facts:[],portfolio:[],assets:[],history:[],links:[],notes:[]}}

function itemTime(x){const raw=x?.created_at||x?.observed_at||x?.timestamp||x?.time||x?.datetime||x?.createdAt||x?.date||x?.updated_at||x?.updatedAt;if(!raw)return null;const d=new Date(raw);return Number.isNaN(d.getTime())?null:d}
function snapshotValue(s,k){const p=s?.payload||{};if(k==='blis'){const n=Number(p.blis_index);return Number.isFinite(n)?n:null}const x=(p.indices||[]).find(i=>i.key===k),n=Number(x?.value);return Number.isFinite(n)?n:null}
function latestAnchor(items){let max=0;(items||[]).forEach(x=>{const d=itemTime(x);if(d)max=Math.max(max,d.getTime())});return max||Date.now()}

window.BLIS_STATE={get slug(){return slug},get dashboard(){return D||{}},get sources(){return S||[]},get quality(){return Q||{}},get activity(){return A||[]},get history(){return H||[]}};
window.BLISPeriod={
 days:Number(localStorage.getItem('blis-period-days'))||30,
 allowed:[30,60,90],
 set(days){days=Number(days);if(!this.allowed.includes(days))days=30;this.days=days;localStorage.setItem('blis-period-days',String(days));this.paint();window.dispatchEvent(new CustomEvent('blis:periodchange',{detail:{days,slug}}));},
 paint(){document.querySelectorAll('[data-blis-period]').forEach(b=>b.classList.toggle('active',Number(b.dataset.blisPeriod)===this.days));const l=document.getElementById('periodLabel');if(l)l.textContent=`Последните ${this.days} дни`;},
 snapshots(){const all=Array.isArray(H)?H:[],anchor=latestAnchor(all),cut=anchor-this.days*86400000;return all.filter(x=>{const d=itemTime(x);return d&&d.getTime()>=cut&&d.getTime()<=anchor}).sort((a,b)=>(itemTime(a)?.getTime()||0)-(itemTime(b)?.getTime()||0))},
 activity(){const all=Array.isArray(A)?A:[],anchor=latestAnchor(all),cut=anchor-this.days*86400000;const dated=all.filter(x=>itemTime(x));if(!dated.length)return all;return all.filter(x=>{const d=itemTime(x);return d&&d.getTime()>=cut&&d.getTime()<=anchor})},
 dailySeries(k){const byDay=new Map();this.snapshots().forEach(s=>{const d=itemTime(s),v=snapshotValue(s,k);if(!d||v==null)return;byDay.set(d.toISOString().slice(0,10),v)});return Array.from(byDay,([date,value])=>({date,value})).sort((a,b)=>a.date.localeCompare(b.date))}
};
if(!BLISPeriod.allowed.includes(BLISPeriod.days))BLISPeriod.days=30;

async function fetchJSON(url,fallback){try{let r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`${r.status} ${url}`);return await r.json()}catch(e){console.error('[BLIS]',e);return fallback}}
function renderAll(){let x=dossier();document.documentElement.style.setProperty('--client',x.accent);document.documentElement.style.setProperty('--clientSoft',x.soft);let sync=$('lastSync');if(sync)sync.textContent=D?.data_updated?new Date(D.data_updated).toLocaleString('bg-BG'):'няма синхронизация';BLISPeriod.paint();window.BLIS_DATA_READY=true;window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{slug}}));window.dispatchEvent(new CustomEvent('blis:periodchange',{detail:{days:BLISPeriod.days,slug,initial:true}}))}
async function load(){let[d,s,q,a,h]=await Promise.all([fetchJSON(`/api/clients/${slug}/dashboard`,{}),fetchJSON(`/api/clients/${slug}/sources`,[]),fetchJSON(`/api/clients/${slug}/data-quality`,{}),fetchJSON(`/api/clients/${slug}/activity`,[]),fetchJSON(`/api/clients/${slug}/history`,[])]);D=d||{};S=Array.isArray(s)?s:[];Q=q||{};A=Array.isArray(a)?a:[];H=Array.isArray(h)?h:[];renderAll();return D}
async function refreshNow(){try{await fetch(`/api/clients/${slug}/refresh`,{method:'POST'});await load()}catch(e){console.error('[BLIS refresh]',e)}}
function download(type,format){location.href=`/api/clients/${slug}/generate?type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}`}
function closeModal(){let m=$('modal');if(m)m.classList.remove('open')}

async function initDataRuntime(){try{let qClient=new URLSearchParams(location.search).get('client');if(qClient)slug=qClient;else if(window.BLIS_INITIAL_CLIENT)slug=window.BLIS_INITIAL_CLIENT;let c=await fetchJSON('/api/clients',[]),sel=$('clientSel');if(sel&&Array.isArray(c)&&c.length){sel.innerHTML=c.map(x=>`<option value="${esc(x.slug)}">${esc(x.name)}</option>`).join('');if(c.some(x=>x.slug===slug))sel.value=slug;else slug=sel.value||slug;sel.onchange=async e=>{slug=e.target.value;const u=new URL(location.href);u.searchParams.set('client',slug);history.replaceState(null,'',u);await load()}}BLISPeriod.paint();await load()}catch(e){console.error('[BLIS init]',e);window.dispatchEvent(new CustomEvent('blis:clientdata',{detail:{slug,error:true}}))}}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initDataRuntime,{once:true});else initDataRuntime();