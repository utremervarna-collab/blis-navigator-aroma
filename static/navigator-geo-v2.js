/* BLIS Navigator — recognizable Bulgaria geo focus */
(function(){
  const bgPath='M 44.0,20.0 L 68.9,55.6 L 102.5,49.3 L 169.1,62.8 L 296.3,67.4 L 339.3,45.3 L 441.3,25.1 L 504.4,56.6 L 555.3,65.7 L 510.3,101.6 L 478.7,163.6 L 506.7,213.0 L 432.1,201.4 L 343.8,228.7 L 342.8,271.8 L 264.1,280.0 L 203.0,249.7 L 133.7,273.5 L 69.6,271.0 L 63.4,213.7 L 20.0,185.9 L 34.3,173.7 L 24.9,163.4 L 39.4,135.8 L 72.5,108.7 L 30.4,71.3 L 22.6,39.7 L 44.0,20.0 Z';
  function renderGeo(){
    const live=document.getElementById('live');
    if(!live)return;
    const cards=[...live.querySelectorAll('.lm-card')];
    const card=cards.find(c=>c.querySelector('.lm-cardhead h3')?.textContent?.includes('ГЕОПОКРИТИЕ'));
    if(!card)return;
    const old=card.querySelector('.lm-map');
    if(!old||old.dataset.geoV2==='1')return;
    old.dataset.geoV2='1';
    old.className='lm-map lm-map-real';
    old.innerHTML=`
      <div class="lm-bgmap-wrap">
        <div class="lm-bgmap-stage">
          <div class="lm-bgmap-grid"></div>
          <div class="lm-bgmap-zoom">
            <svg class="lm-bgmap-svg" viewBox="0 0 580 300" role="img" aria-label="Карта на България">
              <defs>
                <linearGradient id="bgFillLive" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eaf3ff"/><stop offset="1" stop-color="#dceaff"/></linearGradient>
                <filter id="bgGlowLive" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <clipPath id="bgClipLive"><path d="${bgPath}"/></clipPath>
              </defs>
              <path class="lm-bgmap-shadow" d="${bgPath}" transform="translate(0 5)"/>
              <path class="lm-bgmap-country" d="${bgPath}"/>
              <g clip-path="url(#bgClipLive)">
                <path class="lm-bgmap-scanline" d="M -120 80 L 700 260"/>
                <path class="lm-bgmap-scanline second" d="M -100 20 L 720 200"/>
              </g>
              <g class="lm-bgpoint sofia" transform="translate(101.6 153.2)"><circle class="ring r1" r="11"/><circle class="ring r2" r="11"/><circle class="core" r="4"/><text x="13" y="-8">София</text></g>
              <g class="lm-bgpoint varna" transform="translate(499.6 108.5)"><circle class="ring r1" r="9"/><circle class="core" r="3.5"/><text x="-54" y="-10">Варна</text></g>
            </svg>
            <div class="lm-bgmap-focusring"></div>
          </div>
          <div class="lm-bgmap-live"><i></i><span>LIVE GEO FOCUS</span></div>
          <div class="lm-bgmap-caption"><b>България</b><span>активно географско наблюдение</span></div>
        </div>
      </div>
      <div class="lm-country">
        <b>Топ държави</b>
        <span>България <em>82%</em></span><span>Германия <em>5%</em></span><span>Великобритания <em>3%</em></span><span>Румъния <em>2%</em></span><span>Други <em>8%</em></span>
      </div>`;
  }
  function init(){renderGeo();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
