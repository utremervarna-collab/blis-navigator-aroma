/* Live overlay for the KUB pressure network. Reads the existing KUB signal API. */
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
const RULES={
 vazrazhdane:/коста стоянов|възраждане|костадин костадинов/i,
 varna:/благомир коцев|община варна|кмет(?:ът)? на варна|строителен контрол/i,
 institutions:/прокурат|съд|мррб|регионалн(?:ият|ия) минист|днск|данс|полици|електроразпредел|енерго|вик|виК|водоснабд/i,
 gerb:/иван портних|герб|тодор балабанов/i,
 bird:/\bbird\b|bird\.bg/i,
 buyers:/купувач|собственик|жител|семейств|адвокат|пострадал|михаил томов/i,
 media:/.+/
};
const NRULES=[
 ['„Незаконният град / незаконно строителство“',/незакон|събар|премахван|запечат/i],
 ['„Украинска групировка КУБ“',/украинск.{0,12}групиров|престъпн.{0,12}групиров/i],
 ['„Институционален / политически чадър“',/чадър|покровител|зависимост|бездейств/i],
 ['„Кой е виновен – Коцев или Портних?“',/коцев|портних|герб/i],
 ['„Пострадали семейства / купувачи“',/купувач|жител|семейств|пострадал|ток|вода/i],
 ['„Невзоров – ДАНС – Коцев“',/невзоров|данс|свидетел/i]
];
let latest={signals:[],updated_at:''};
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function text(s){return [s.title,s.text,s.source].filter(Boolean).join(' ');}
function numRisk(s){return Math.max(0,Math.min(100,Number(s.risk_score||s.risk||0)||0));}
function matches(id,s){return RULES[id]&&RULES[id].test(text(s));}
function addStyle(){if(document.getElementById('kubaml-style'))return;const st=document.createElement('style');st.id='kubaml-style';st.textContent=`
 .kubaml-strip{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 0 14px;padding:10px 12px;border:1px solid #dce6ed;background:#f9fcfd;border-radius:13px;font-size:9px;color:#667987}.kubaml-strip b{color:#315b79}.kubaml-dot{width:8px;height:8px;border-radius:50%;background:#44a878;box-shadow:0 0 0 0 rgba(68,168,120,.35);animation:kubamlPulse 1.8s infinite}.kubaml-right{margin-left:auto}.kubaml-badge{fill:#b94b4b;stroke:#fff;stroke-width:2}.kubaml-badge-text{fill:#fff;font-size:7px;font-weight:900;pointer-events:none}.kubaml-hot .kubam-ring{animation:kubamlRing 1.8s ease-out infinite}.kubaml-livebox{margin-top:10px;padding:10px;border:1px solid #dce6ed;border-radius:11px;background:#f8fbfd}.kubaml-livebox b{font-size:9px}.kubaml-livebox p{font-size:8.8px;line-height:1.45;color:#607484;margin:4px 0}.kubaml-liveitem{padding:6px 0;border-top:1px solid #e6edf2;font-size:8.5px;line-height:1.4}.kubaml-liveitem:first-of-type{border-top:0}.kubaml-liveitem a{color:#97661b;text-decoration:none;font-weight:800}.kubaml-ncount{display:inline-block;margin-left:6px;padding:2px 5px;border-radius:999px;background:#fff1f1;color:#a74646;font-size:7px;font-weight:900}@keyframes kubamlRing{0%{opacity:.65;transform:scale(.92)}75%,100%{opacity:0;transform:scale(1.16)}}@keyframes kubamlPulse{70%{box-shadow:0 0 0 7px rgba(68,168,120,0)}100%{box-shadow:0 0 0 0 rgba(68,168,120,0)}}
 `;document.head.appendChild(st);}
function ensureStrip(){const page=document.getElementById('attackmap');if(!page)return null;let el=document.getElementById('kubamlStrip');if(el)return el;el=document.createElement('div');el.id='kubamlStrip';el.className='kubaml-strip';const hero=page.querySelector('.kubam-hero');if(hero)hero.insertAdjacentElement('afterend',el);else page.prepend(el);return el;}
function fmt(raw){if(!raw)return '—';const d=new Date(raw);return Number.isNaN(d.getTime())?'—':d.toLocaleString('bg-BG',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}
function applyNodes(){
 document.querySelectorAll('.kubam-node').forEach(n=>{n.classList.remove('kubaml-hot');n.querySelectorAll('.kubaml-badge,.kubaml-badge-text').forEach(x=>x.remove());const rows=latest.signals.filter(s=>matches(n.dataset.id,s));if(!rows.length)return;const max=Math.max(...rows.map(numRisk));if(max>=80)n.classList.add('kubaml-hot');const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.classList.add('kubaml-live');const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx','25');c.setAttribute('cy','-25');c.setAttribute('r','10');c.setAttribute('class','kubaml-badge');const t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x','25');t.setAttribute('y','-22.5');t.setAttribute('text-anchor','middle');t.setAttribute('class','kubaml-badge-text');t.textContent=rows.length>99?'99+':rows.length;g.append(c,t);n.appendChild(g);});
}
function applyNarratives(){document.querySelectorAll('.kubam-narrative').forEach(row=>row.querySelectorAll('.kubaml-ncount').forEach(x=>x.remove()));document.querySelectorAll('.kubam-narrative').forEach(row=>{const h=row.querySelector('h4');if(!h)return;const rule=NRULES.find(r=>h.textContent.trim()===r[0]);if(!rule)return;const count=latest.signals.filter(s=>rule[1].test(text(s))).length;if(count){const b=document.createElement('span');b.className='kubaml-ncount';b.textContent='LIVE '+count;h.appendChild(b);}});}
function actorRows(id){return latest.signals.filter(s=>matches(id,s)).sort((a,b)=>new Date(b.published_at||b.detected_at||0)-new Date(a.published_at||a.detected_at||0));}
function enrichDetail(id){const d=document.getElementById('kubamDetail');if(!d)return;d.querySelectorAll('.kubaml-livebox').forEach(x=>x.remove());const rows=actorRows(id);if(!rows.length)return;const max=Math.max(...rows.map(numRisk));const box=document.createElement('div');box.className='kubaml-livebox';box.innerHTML='<b>LIVE OPEN WEB · '+rows.length+' свързани сигнала · max risk '+Math.round(max)+'/100</b><p>Автоматично съвпадение по актьор/роля. Не заменя редакционната верификация.</p>'+rows.slice(0,3).map(s=>'<div class="kubaml-liveitem">'+esc(s.title||'Сигнал')+(s.url?' · <a target="_blank" rel="noopener" href="'+esc(s.url)+'">източник ↗</a>':'')+'</div>').join('');d.appendChild(box);}
function currentActor(){const a=document.querySelector('.kubam-node.active');return a&&a.dataset.id||'vazrazhdane';}
function render(){const strip=ensureStrip();if(strip){const critical=latest.signals.filter(s=>numRisk(s)>=85).length;strip.innerHTML='<span class="kubaml-dot"></span><b>LIVE OPEN WEB</b><span>'+latest.signals.length+' текущи сигнала</span><span>· '+critical+' с risk ≥85</span><span class="kubaml-right">API обновено: '+fmt(latest.updated_at)+'</span>';}applyNodes();applyNarratives();enrichDetail(currentActor());}
async function load(){try{const r=await fetch('/api/signals?client=kub&limit=150',{cache:'no-store'});if(!r.ok)throw new Error(String(r.status));const d=await r.json();latest={signals:Array.isArray(d.signals)?d.signals:[],updated_at:d.updated_at||''};render();}catch(_){const strip=ensureStrip();if(strip)strip.innerHTML='<span style="width:8px;height:8px;border-radius:50%;background:#aa741c"></span><b>LIVE OPEN WEB</b><span>временно без API данни · показва се валидираната карта към 02.09.2026</span>';}}
function bind(){document.addEventListener('click',e=>{const n=e.target.closest&&e.target.closest('.kubam-node');if(n)setTimeout(()=>enrichDetail(n.dataset.id),0);});}
function boot(){addStyle();bind();const ready=()=>{if(document.getElementById('attackmap')){load();setInterval(load,120000);}else setTimeout(ready,120);};ready();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();