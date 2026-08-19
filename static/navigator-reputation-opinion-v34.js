/* BLIS Navigator — public opinion measured fallback v34. */
(function(){
'use strict';
if(window.__BLISReputationOpinionV34)return;window.__BLISReputationOpinionV34=true;
const N=v=>{const n=Number(v);return Number.isFinite(n)?n:null};
const A=v=>Array.isArray(v)?v:[];
const F=v=>Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
function slugNow(){try{return (typeof slug!=='undefined'&&slug)||window.BLIS_INITIAL_CLIENT||new URLSearchParams(location.search).get('client')||document.body?.dataset?.client||'aroma'}catch(e){return'aroma'}}
async function getJSON(u){try{const r=await fetch(u,{cache:'no-store'});return r.ok?await r.json():null}catch(e){return null}}
function key(x){return String(x?.metric_key||x?.metric||x?.key||x?.name||'').toLowerCase()}
function own(x){const s=String(x?.source_key||x?.source||'').toLowerCase();return !/^(cmp_|competitor_)|competitor|конкурент|сравним/.test(s)}
function rating(rows){for(const x of A(rows).slice().reverse()){if(!own(x))continue;const k=key(x),s=String(x?.source_key||x?.source||'');if(!/google|notino|makeup|trust|review|rating|untappd|trip|booking/i.test(s))continue;if(['average_rating','google_rating','review_rating','rating'].some(w=>k===w||k.endsWith('_'+w)||k.includes(w))){const v=N(x?.value);if(v!==null&&v>=0&&v<=10)return v}}return null}
function directOpinion(){const d=(typeof D!=='undefined'&&D)||{},wanted=['consumer_opinion','consumer_opinion_index','sentiment_index','consumer_sentiment','public_opinion'];for(const pool of [A(d?.indices),A(d?.metrics)])for(const x of pool){if(wanted.includes(key(x))&&N(x?.value)!==null)return N(x.value)}return null}
async function apply(){if(!document.getElementById('reputation')?.classList.contains('active'))return;if(directOpinion()!==null)return;const card=document.querySelector('#reputationBody [data-rp-dim="opinions"]');if(!card)return;const rows=await getJSON(`/api/clients/${encodeURIComponent(slugNow())}/activity?_=${Date.now()}`),r=rating(rows);if(r===null)return;const index=r<=5?r/5*100:r/10*100,strong=card.querySelector(':scope>strong'),status=card.querySelector('.rp-dim-copy>em');if(strong)strong.innerHTML=`${F(index)}<small>/100</small>`;if(status){let dot=status.querySelector('i');status.textContent='';if(!dot)dot=document.createElement('i');status.appendChild(dot);status.append(document.createTextNode(`Изведен от последната измерена публична оценка ${F(r)}/${r<=5?5:10}`))}card.dataset.rpDerived='rating'}
window.BLISReputationOpinionV34={apply};
})();