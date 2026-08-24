/* Wirello Market — analytical chart upgrade v2 */
(function(){
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const isWirello=()=>document.body?.dataset?.client==='wirello'||new URLSearchParams(location.search).get('client')==='wirello';
  const q=(s,r=document)=>[...r.querySelectorAll(s)];
  const num=v=>{const n=Number(String(v??'').replace(',','.').replace(/[^0-9.-]/g,''));return Number.isFinite(n)?n:null};
  const fmt=v=>Number(v).toLocaleString('bg-BG',{maximumFractionDigits:1});
  const chartHost=svg=>svg.closest('.ov-card,.sm-card,.dm-card,.ref-card,.rep-card,.market-card,.signal-card,[class*="chart"],[class*="trend"],[class*="radar"],[class*="graph"],[class*="spark"]');
  const titleFor=svg=>chartHost(svg)?.querySelector('h2,h3,h4,.title,.card-title')?.textContent?.trim()||'Аналитична визуализация';
  function svgEl(name,attrs={}){const e=document.createElementNS(NS,name);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e}
  function valuesFromSvg(svg){
    const out=[];
    q('circle',svg).forEach(c=>{const v=num(c.dataset.chartValue||c.querySelector('title')?.textContent);if(v!=null)out.push(v)});
    if(out.length>=2)return out;
    const texts=q('text',svg).map(t=>num(t.textContent)).filter(v=>v!=null&&Math.abs(v)<=10000);
    return texts.length>=2?texts:[];
  }
  function addGrid(svg){
    if(svg.dataset.wirelloGrid==='1')return;
    const vb=(svg.getAttribute('viewBox')||'0 0 720 240').split(/\s+/).map(Number); const x0=vb[0]||0,y0=vb[1]||0,w=vb[2]||720,h=vb[3]||240;
    if(w<260||h<90)return;
    const host=chartHost(svg); if(!host)return;
    if(svg.closest('.brand,.nav,.side,.icon')||svg.querySelectorAll('path,line,polyline,circle,rect').length<2)return;
    const g=svgEl('g',{'class':'wirello-analytical-grid','aria-hidden':'true'});
    const left=x0+44,right=x0+w-14,top=y0+15,bottom=y0+h-30;
    for(let i=0;i<5;i++){
      const y=top+(bottom-top)*i/4;
      g.appendChild(svgEl('line',{x1:left,y1:y,x2:right,y2:y,stroke:'#dce4ed','stroke-width':'1','stroke-dasharray':i===4?'0':'3 4'}));
    }
    g.appendChild(svgEl('line',{x1:left,y1:top,x2:left,y2:bottom,stroke:'#aebccc','stroke-width':'1'}));
    g.appendChild(svgEl('line',{x1:left,y1:bottom,x2:right,y2:bottom,stroke:'#aebccc','stroke-width':'1'}));
    const vals=valuesFromSvg(svg);
    if(vals.length>=2){
      const min=Math.min(...vals),max=Math.max(...vals),span=Math.max(1,max-min);
      for(let i=0;i<5;i++){
        const v=max-span*i/4,y=top+(bottom-top)*i/4;
        const t=svgEl('text',{x:left-8,y:y+4,'text-anchor':'end',fill:'#718197','font-size':'10','font-family':'Aptos, Segoe UI, Arial'});t.textContent=fmt(v);g.appendChild(t);
      }
    }
    svg.insertBefore(g,svg.firstChild);
    svg.dataset.wirelloGrid='1';
    q('text',svg).forEach(t=>{if(!t.closest('.wirello-analytical-grid')){t.setAttribute('font-family','Aptos, Segoe UI, Arial');const s=num(t.getAttribute('font-size'));if(s!=null&&s<10)t.setAttribute('font-size','10')}});
    q('path,polyline',svg).forEach(p=>{if(!p.closest('defs')&&!p.closest('.wirello-analytical-grid')){const fill=p.getAttribute('fill');if(fill==='none'||!fill)p.setAttribute('stroke-width',Math.max(2,num(p.getAttribute('stroke-width'))||0))}});
  }
  function addSource(svg){
    const host=chartHost(svg); if(!host||host.dataset.wirelloSource==='1')return;
    const substantial=svg.getBoundingClientRect().width>300&&svg.getBoundingClientRect().height>100;if(!substantial)return;
    const note=document.createElement('div');note.className='wirello-chart-source';note.innerHTML='<span>Източник: BLIS demo dataset · Wirello Market</span><b>Стойностите са демонстрационни</b>';
    host.appendChild(note);host.dataset.wirelloSource='1';
  }
  function enhanceBars(root=document){
    q('[class*="bar"],.bar,.bars',root).forEach(el=>{
      if(el.dataset.wirelloBars==='1'||el.closest('.nav,.side'))return;
      const rect=el.getBoundingClientRect();if(rect.width<220||rect.height<18)return;
      el.dataset.wirelloBars='1';
      el.classList.add('wirello-bars-upgraded');
    });
  }
  function enhance(root=document){if(!isWirello())return;q('.page svg',root).forEach(svg=>{addGrid(svg);addSource(svg)});enhanceBars(root)}
  function css(){if(document.getElementById('wirello-chart-upgrade-style'))return;const s=document.createElement('style');s.id='wirello-chart-upgrade-style';s.textContent=`
    body[data-client="wirello"] .wirello-chart-source{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:10px 2px 0;padding-top:9px;border-top:1px solid #e4e9ef;color:#768598;font:10.5px/1.35 Aptos,"Segoe UI",Arial,sans-serif}
    body[data-client="wirello"] .wirello-chart-source b{font-weight:650;color:#53677d}
    body[data-client="wirello"] .wirello-bars-upgraded{background-image:linear-gradient(to right,rgba(153,169,187,.16) 1px,transparent 1px);background-size:20% 100%}
    body[data-client="wirello"] .page svg{overflow:visible}
    body[data-client="wirello"] .page svg text{font-family:Aptos,"Segoe UI",Arial,sans-serif!important;fill:#5b6f84}
    body[data-client="wirello"] .page [class*="chart"],body[data-client="wirello"] .page [class*="trend"],body[data-client="wirello"] .page [class*="radar"],body[data-client="wirello"] .page [class*="graph"]{position:relative}
    body[data-client="wirello"] .page [class*="chart"] svg,body[data-client="wirello"] .page [class*="trend"] svg,body[data-client="wirello"] .page [class*="radar"] svg{min-height:150px}
    body[data-client="wirello"] .page .wirello-analytical-grid+g text{font-size:10px!important}
  `;document.head.appendChild(s)}
  function init(){css();enhance();const target=document.querySelector('.main')||document.body;new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)enhance(n)}).observe(target,{childList:true,subtree:true});setInterval(()=>enhance(),1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();