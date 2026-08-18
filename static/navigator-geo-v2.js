/* BLIS Navigator — abstract monitored territory geo focus + interactive radar */
(function(){
  const territoryPath='M 55 58 L 137 27 L 222 48 L 308 25 L 395 48 L 486 34 L 544 72 L 526 126 L 552 176 L 513 222 L 430 246 L 350 232 L 274 274 L 188 249 L 105 266 L 51 225 L 66 174 L 34 126 L 47 91 Z';
  function renderGeo(){
    const live=document.getElementById('live');
    if(!live)return;
    const cards=[...live.querySelectorAll('.lm-card')];
    const card=cards.find(c=>c.querySelector('.lm-cardhead h3')?.textContent?.includes('ГЕОПОКРИТИЕ'));
    if(!card)return;
    const old=card.querySelector('.lm-map');
    if(!old||old.dataset.geoV2==='territory-radar')return;
    old.dataset.geoV2='territory-radar';
    old.className='lm-map lm-map-real';
    old.innerHTML=`
      <div class="lm-bgmap-wrap">
        <div class="lm-bgmap-stage" style="--radar-x:54%;--radar-y:50%">
          <div class="lm-bgmap-grid"></div>
          <div class="lm-bgmap-zoom">
            <svg class="lm-bgmap-svg" viewBox="0 0 580 300" role="img" aria-label="Карта на наблюдаваната територия">
              <defs>
                <linearGradient id="bgFillLive" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaf3ff"/><stop offset="1" stop-color="#dceaff"/></linearGradient>
                <filter id="bgGlowLive" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <clipPath id="bgClipLive"><path d="${territoryPath}"/></clipPath>
              </defs>
              <path class="lm-bgmap-shadow" d="${territoryPath}" transform="translate(0 5)"/>
              <path class="lm-bgmap-country" d="${territoryPath}"/>
              <g clip-path="url(#bgClipLive)">
                <path class="lm-bgmap-scanline" d="M -120 66 L 700 252"/>
                <path class="lm-bgmap-scanline second" d="M -100 16 L 720 205"/>
              </g>
              <g class="lm-bgpoint" transform="translate(208 162)"><circle class="ring r1" r="11"/><circle class="ring r2" r="11"/><circle class="core" r="4"/><text x="14" y="-9">Зона 1</text></g>
              <g class="lm-bgpoint secondary" transform="translate(421 115)"><circle class="ring r1" r="9"/><circle class="ring r2" r="9"/><circle class="core" r="3.5"/><text x="-61" y="-11">Зона 2</text></g>
              <g class="lm-bgpoint" transform="translate(348 224)"><circle class="ring r1" r="8"/><circle class="core" r="3.5"/><text x="13" y="-8">Зона 3</text></g>
            </svg>
            <div class="lm-bgmap-focusring"></div>
          </div>
          <div class="lm-territory-radar" aria-hidden="true">
            <span class="lm-radar-ring r1"></span><span class="lm-radar-ring r2"></span><span class="lm-radar-ring r3"></span>
            <span class="lm-radar-cross x"></span><span class="lm-radar-cross y"></span>
            <span class="lm-radar-sweep"></span><span class="lm-radar-center"></span>
          </div>
          <div class="lm-bgmap-live"><i></i><span>LIVE GEO FOCUS</span></div>
          <div class="lm-bgmap-caption"><b>Наблюдавана територия</b><span>активен географски мониторинг</span></div>
        </div>
      </div>
      <div class="lm-country">
        <b>Активни зони</b>
        <span>Централна <em>46%</em></span><span>Североизточна <em>22%</em></span><span>Западна <em>18%</em></span><span>Южна <em>14%</em></span>
      </div>`;
    const stage=old.querySelector('.lm-bgmap-stage');
    if(stage){
      stage.addEventListener('pointermove',e=>{
        const r=stage.getBoundingClientRect();
        const x=Math.max(10,Math.min(90,((e.clientX-r.left)/r.width)*100));
        const y=Math.max(12,Math.min(88,((e.clientY-r.top)/r.height)*100));
        stage.style.setProperty('--radar-x',x.toFixed(1)+'%');
        stage.style.setProperty('--radar-y',y.toFixed(1)+'%');
        stage.classList.add('radar-interacting');
      },{passive:true});
      stage.addEventListener('pointerleave',()=>{
        stage.style.setProperty('--radar-x','54%');
        stage.style.setProperty('--radar-y','50%');
        stage.classList.remove('radar-interacting');
      },{passive:true});
    }
  }
  function init(){renderGeo();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
