/* BLIS Navigator — Monitoring Profile V4.1
   Client-meaningful signal categories without recursive render events. */
(function(){
'use strict';
if(window.__BLIS_MONITORING_PROFILE_V41)return;
window.__BLIS_MONITORING_PROFILE_V41=true;
if(!/\/dashboard\.html$/i.test(location.pathname))return;

const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=s=>String(s??'').toLowerCase().replace(/\s+/g,' ').trim();
const text=s=>[s?.topic,s?.category,s?.kind,s?.scope,s?.title,s?.text,s?.description,s?.detail].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();
const attRe=/(critical|high|negative|риск|криз|негатив|жалб|проблем|санкц|спад|наруш|съд|дело|атака|бойкот|скандал)/i;
const compRe=/(compet|конкур)/i;
const repRe=/(репутац|отзив|оценк|rating|review|довер|недовол|жалб|коментар|sentiment|наглас)/i;
const marketRe=/(пазар|цена|ценов|търсене|продажб|категор|дял|market|price|demand|sales|share)/i;
const commRe=/(кампан|реклам|медия|публикац|комуникац|социал|social|campaign|advert|media|pr\b|съдържание|content)/i;
const productRe=/(продукт|услуг|портфоли|launch|лансир|нов\w*\s+(?:продукт|услуг)|innovation|иновац|асортимент|серия|модел)/i;

function isAttention(s){return ['critical','high'].includes(N(s?.severity))||N(s?.sentiment)==='negative'||/risk|риск/.test(N(s?.kind))||attRe.test(text(s))}
function isCompetitor(s){return N(s?.scope)==='competitor'||compRe.test([s?.topic,s?.category,s?.kind].filter(Boolean).join(' '))}
function share(rows,test){if(!rows.length)return 0;return Math.round(rows.filter(test).length/rows.length*100)}
function values(rows){return [
  {short:'За внимание',full:'Сигнали за внимание',value:share(rows,isAttention)},
  {short:'Конкуренти',full:'Конкурентна активност',value:share(rows,isCompetitor)},
  {short:'Репутация',full:'Репутационни сигнали',value:share(rows,s=>repRe.test(text(s)))},
  {short:'Пазар',full:'Пазарни промени',value:share(rows,s=>marketRe.test(text(s)))},
  {short:'Комуникации',full:'Комуникационна активност',value:share(rows,s=>commRe.test(text(s)))},
  {short:'Продукти',full:'Продуктови развития',value:share(rows,s=>productRe.test(text(s)))}
]}

function svg(vals){
  const w=360,h=300,cx=180,cy=145,R=105,n=vals.length;
  const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r]};
  const grids=[.25,.5,.75,1].map(q=>`<polygon points="${vals.map((_,i)=>pt(i,R*q).join(',')).join(' ')}" fill="none" stroke="#dce7f0" stroke-width="1"/>`).join('');
  const axes=vals.map((_,i)=>{const p=pt(i,R);return`<line x1="${cx}" y1="${cy}" x2="${p[0]}" y2="${p[1]}" stroke="#e1e9f0"/>`}).join('');
  const poly=vals.map((x,i)=>pt(i,R*Math.max(0,Math.min(100,x.value))/100).join(',')).join(' ');
  const labels=vals.map((x,i)=>{const p=pt(i,R+28),anchor=p[0]<cx-10?'end':p[0]>cx+10?'start':'middle';return`<text x="${p[0]}" y="${p[1]}" text-anchor="${anchor}" dominant-baseline="middle"><title>${E(x.full)} · ${x.value}%</title>${E(x.short)}</text>`}).join('');
  const dots=vals.map((x,i)=>{const p=pt(i,R*Math.max(0,Math.min(100,x.value))/100);return`<circle cx="${p[0]}" cy="${p[1]}" r="3.5"><title>${E(x.full)}: ${x.value}% от значимите сигнали</title></circle>`}).join('');
  return `<svg class="mon2-radar" viewBox="0 0 ${w} ${h}" aria-label="Профил на наблюдението по клиентски значими категории">${grids}${axes}<polygon class="mon2-radar-area" points="${poly}"/>${dots}${labels}</svg>`;
}

function legend(vals){return `<div class="mon4-legend">${vals.map(x=>`<div><span>${E(x.full)}</span><b>${x.value}%</b></div>`).join('')}</div>`}
function css(){
  if(document.getElementById('mon4CSS'))return;
  const s=document.createElement('style');s.id='mon4CSS';s.textContent=`
#social .mon4-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 8px;margin:2px 2px 0}
#social .mon4-legend>div{display:flex;justify-content:space-between;gap:8px;align-items:center;border:1px solid #e6edf3;border-radius:8px;background:#fbfdff;padding:6px 8px}
#social .mon4-legend span{color:#667d91;font-size:7px;line-height:1.25}
#social .mon4-legend b{color:#2f6f9e;font-size:8px;white-space:nowrap}
@media(max-width:760px){#social .mon4-legend{grid-template-columns:1fr}}
`;
  document.head.appendChild(s);
}

let busy=false,timers=[];
async function upgrade(){
  if(busy)return;
  const root=document.getElementById('social');
  if(!root?.classList.contains('active'))return;
  const wrap=root.querySelector('.mon2-radar-wrap');
  if(!wrap)return;
  const api=window.BLISMonitoringIntelligenceV2;
  if(!api?.rows)return;
  busy=true;
  try{
    const rows=await api.rows();
    if(!root.isConnected||!root.classList.contains('active'))return;
    const vals=values(Array.isArray(rows)?rows:[]);
    const old=wrap.querySelector('.mon2-radar');
    if(old)old.outerHTML=svg(vals);else wrap.insertAdjacentHTML('beforeend',svg(vals));
    wrap.querySelector('.mon4-legend')?.remove();
    wrap.insertAdjacentHTML('beforeend',legend(vals));
    const p=wrap.querySelector('p');
    if(p)p.textContent='Дял на значимите сигнали за периода по шест клиентски важни направления. Категориите могат да се припокриват.';
    wrap.dataset.monProfile='v41';
    /* Do not dispatch blis:intelligence here. V3 observes the DOM and applies
       motion automatically. Dispatching the same event from this renderer
       creates a recursive render loop with Monitoring V2. */
  }catch(err){console.error('BLIS Monitoring Profile V4.1',err)}finally{busy=false}
}
function schedule(){
  timers.forEach(clearTimeout);
  timers=[80,350,900,1800].map(ms=>setTimeout(upgrade,ms));
}
for(const ev of ['blis:routechange','blis:clientdata','blis:intelligence','blis:periodchange'])window.addEventListener(ev,schedule);
document.addEventListener('click',e=>{if(e.target.closest?.('#nav button,.client-option,.datebox,[data-page],[data-n3-page]'))schedule()},true);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('load',schedule,{once:true});
window.BLISMonitoringProfileV4={upgrade,values,schedule};
})();
