/* KUB live open-web signal layer. Keeps the existing validated crisis base and prepends current external mentions. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname)) return;

function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function clean(s){return String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
function fmtDate(raw){
  if(!raw) return 'LIVE';
  const d=new Date(raw); if(Number.isNaN(d.getTime())) return esc(raw);
  return d.toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit',year:'numeric'})+'<br>'+d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'});
}
function signalTypes(s){
  const low=(String(s.title||'')+' '+String(s.text||'')).toLowerCase();
  const types=['media'];
  if(/куб|корпорац|forest club|форест клуб/.test(low)) types.push('kub');
  if(/съд|прокурат|парламент|народното събрание|община|полици|министер|президент|институци|строителен контрол/.test(low)) types.push('institution');
  if(/ток|електро|вод|виК|вик|електрозахран|водоснабд/.test(low)) types.push('utilities');
  return [...new Set(types)].join(' ');
}
function sevLabel(s){
  const v=String(s.severity||'').toLowerCase();
  return v==='critical'?'КРИТИЧЕН':v==='high'?'ВИСОК':v==='medium'?'СРЕДЕН':'СИГНАЛ';
}
function addStatus(updated,count){
  const filters=document.querySelector('#monitoring .filters'); if(!filters) return;
  let el=document.getElementById('kubLiveStatus');
  if(!el){el=document.createElement('span');el.id='kubLiveStatus';el.className='filter';el.style.cursor='default';el.style.marginLeft='auto';filters.appendChild(el);}
  let t=''; if(updated){const d=new Date(updated);if(!Number.isNaN(d.getTime()))t=d.toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'});}
  el.textContent='LIVE OPEN WEB · '+count+' сигнала'+(t?' · '+t:'');
}
function insertSignals(rows,updated){
  const feed=document.getElementById('feed'); if(!feed||!Array.isArray(rows)) return;
  const currentTitles=new Set([...feed.querySelectorAll('.item h3')].map(x=>clean(x.textContent).toLowerCase()));
  const currentLinks=new Set([...feed.querySelectorAll('.item a[href]')].map(x=>x.href));
  const sorted=rows.slice().sort((a,b)=>new Date(b.published_at||b.detected_at||0)-new Date(a.published_at||a.detected_at||0));
  let added=0;
  const created=[];
  for(const s of sorted){
    const title=clean(s.title); if(!title) continue;
    const key=title.toLowerCase();
    let href=''; try{href=new URL(s.url,location.origin).href}catch(_){href=String(s.url||'')}
    if(currentTitles.has(key)||currentLinks.has(href)) continue;
    currentTitles.add(key); currentLinks.add(href);
    const article=document.createElement('article');
    article.className='item'; article.dataset.type=signalTypes(s); article.dataset.text=clean(title+' '+(s.text||'')+' '+(s.source||''));
    const source=esc(s.source||'външен източник');
    const desc=esc(clean(s.text||title)).slice(0,700);
    const severity=esc(sevLabel(s));
    const relevance=Math.round(Number(s.relevance||0));
    article.innerHTML='<time>'+fmtDate(s.published_at||s.detected_at)+'</time><div><h3>'+esc(title)+'</h3><p>'+desc+'</p><div class="meta"><span>LIVE сигнал</span><span>'+source+'</span><span>'+severity+'</span>'+(relevance?'<span>релевантност '+relevance+'%</span>':'')+'</div></div>'+(href?'<a target="_blank" rel="noopener" href="'+esc(href)+'">ИЗТОЧНИК ↗</a>':'');
    created.push(article); added++;
    if(added>=60) break;
  }
  for(let i=created.length-1;i>=0;i--) feed.prepend(created[i]);
  try{if(Array.isArray(items)) created.forEach(x=>items.unshift(x));}catch(_){ }
  try{if(typeof filterFeed==='function')filterFeed();}catch(_){ }
  addStatus(updated,rows.length);
}
async function load(){
  try{
    const res=await fetch('/api/signals?client=kub&limit=150',{cache:'no-store'});
    if(!res.ok) return;
    const data=await res.json();
    insertSignals(data.signals||[],data.updated_at||'');
  }catch(_){ }
}
function boot(){load();setInterval(load,120000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
