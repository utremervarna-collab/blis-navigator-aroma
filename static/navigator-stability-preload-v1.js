/* BLIS Navigator — stability compatibility preload v19.
   Event-driven compatibility plus Overview hero-motion layer. */
(function(){
'use strict';
if(window.__BLISStabilityPreloadV19)return;window.__BLISStabilityPreloadV19=true;
window.BLISStabilityStats={
  mode:'event-driven',
  blockedIntervals:0,
  blockedTimeouts:0,
  blockedNavRebuilds:0,
  blockedNavLabelWrites:0,
  blockedMarketTextWrites:0,
  blockedCompetitionTimeouts:0,
  navRepairs:0,
  marketRepairs:0
};
document.documentElement.dataset.blisStability='event-driven';

const style=document.createElement('style');
style.id='blisOverviewHeroMotionStyle';
style.textContent=`
#overviewPremium .ov-screen{position:relative}
.blis-overview-hero-motion{height:126px;position:relative;overflow:hidden;border:1px solid #dbe4ef;border-radius:15px;background:#102840;box-shadow:0 10px 30px rgba(18,48,85,.08);isolation:isolate}
.blis-overview-hero-motion .bohm-image{position:absolute;inset:-12%;background-position:center;background-size:cover;opacity:.28;transform:scale(1.05);animation:bohmDrift 13s ease-in-out infinite alternate;filter:saturate(.82) contrast(1.04)}
.blis-overview-hero-motion .bohm-shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(7,24,44,.94) 0%,rgba(13,38,66,.73) 42%,rgba(13,39,66,.34) 72%,rgba(7,25,45,.70) 100%),radial-gradient(circle at 74% 42%,rgba(40,126,238,.23),transparent 31%),radial-gradient(circle at 18% 90%,rgba(213,148,37,.18),transparent 30%)}
.blis-overview-hero-motion .bohm-lines{position:absolute;inset:0;opacity:.58;background:repeating-linear-gradient(113deg,transparent 0 25px,rgba(73,149,238,.11) 26px,transparent 27px 52px);mask-image:linear-gradient(90deg,transparent 0,#000 18%,#000 83%,transparent 100%);animation:bohmLines 11s linear infinite}
.blis-overview-hero-motion .bohm-sweep{position:absolute;top:-80%;bottom:-80%;width:20%;left:-24%;transform:rotate(13deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.10),rgba(224,161,52,.12),transparent);filter:blur(1px);animation:bohmSweep 6.8s ease-in-out infinite}
.blis-overview-hero-motion .bohm-orbit{position:absolute;width:360px;height:360px;right:-122px;top:-118px;border-radius:50%;border:1px solid rgba(72,148,242,.22);box-shadow:0 0 0 34px rgba(50,129,226,.035),0 0 0 69px rgba(217,151,40,.025);animation:bohmRotate 24s linear infinite}
.blis-overview-hero-motion .bohm-orbit:before,.blis-overview-hero-motion .bohm-orbit:after{content:"";position:absolute;border-radius:50%;width:7px;height:7px;background:#e0a13b;box-shadow:0 0 14px rgba(224,161,59,.75)}
.blis-overview-hero-motion .bohm-orbit:before{left:45px;top:52px}.blis-overview-hero-motion .bohm-orbit:after{right:37px;bottom:72px;background:#3a99f4;box-shadow:0 0 14px rgba(58,153,244,.72)}
.blis-overview-hero-motion .bohm-copy{position:relative;z-index:4;height:100%;display:flex;align-items:center;justify-content:space-between;gap:28px;padding:24px 31px;color:#fff}
.blis-overview-hero-motion .bohm-left{display:flex;align-items:center;gap:17px;min-width:0}.blis-overview-hero-motion .bohm-mark{width:54px;height:54px;flex:0 0 54px;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(232,170,64,.66);background:radial-gradient(circle,rgba(220,151,35,.20),rgba(4,19,37,.55) 64%);color:#e4a841;font:700 17px Georgia,serif;box-shadow:0 0 0 8px rgba(226,160,51,.035),0 0 24px rgba(225,158,42,.12);position:relative}
.blis-overview-hero-motion .bohm-mark:after{content:"";position:absolute;inset:-8px;border:1px dashed rgba(64,151,247,.34);border-radius:50%;animation:bohmRotate 13s linear infinite}
.blis-overview-hero-motion .bohm-copy b{display:block;font-size:15px;letter-spacing:-.01em}.blis-overview-hero-motion .bohm-copy small{display:block;margin-top:5px;color:#aebdd0;font-size:9.5px;line-height:1.45;letter-spacing:.025em}
.blis-overview-hero-motion .bohm-state{display:flex;align-items:center;gap:9px;color:#d9e4f0;font-size:9px;font-weight:780;letter-spacing:.11em;white-space:nowrap;text-transform:uppercase}.blis-overview-hero-motion .bohm-state i{width:7px;height:7px;border-radius:50%;background:#4cd48a;box-shadow:0 0 13px rgba(76,212,138,.75);animation:bohmPulse 1.8s ease-in-out infinite}
body[data-client="aroma"] .blis-overview-hero-motion .bohm-image{background-image:url('/home-aroma.svg')}
body[data-client="bolyarka"] .blis-overview-hero-motion .bohm-image{background-image:url('/home-bolyarka.svg')}
body[data-client="astor-garden"] .blis-overview-hero-motion .bohm-image{background-image:url('/home-astor.svg')}
body[data-client="varna-towers"] .blis-overview-hero-motion .bohm-image{background-image:url('/varna-towers-profile-hero-header.webp');opacity:.34}
body[data-client="mollox"] .blis-overview-hero-motion .bohm-image{background-image:radial-gradient(circle at 72% 40%,rgba(50,145,122,.55),transparent 26%),linear-gradient(135deg,#183f45,#15364f);opacity:.64}
@keyframes bohmDrift{from{transform:scale(1.05) translate3d(-.8%,0,0)}to{transform:scale(1.11) translate3d(1.1%,-1%,0)}}
@keyframes bohmSweep{0%,18%{left:-24%;opacity:0}28%{opacity:1}64%{opacity:.8}78%,100%{left:118%;opacity:0}}
@keyframes bohmLines{from{transform:translateX(-18px)}to{transform:translateX(18px)}}
@keyframes bohmRotate{to{transform:rotate(360deg)}}
@keyframes bohmPulse{0%,100%{opacity:.42;transform:scale(.82)}50%{opacity:1;transform:scale(1.14)}}
@media(max-width:760px){.blis-overview-hero-motion{height:108px}.blis-overview-hero-motion .bohm-copy{padding:19px 18px}.blis-overview-hero-motion .bohm-state{display:none}.blis-overview-hero-motion .bohm-mark{width:46px;height:46px;flex-basis:46px}.blis-overview-hero-motion .bohm-copy b{font-size:13px}.blis-overview-hero-motion .bohm-copy small{font-size:8.8px}}
@media(prefers-reduced-motion:reduce){.blis-overview-hero-motion .bohm-image,.blis-overview-hero-motion .bohm-lines,.blis-overview-hero-motion .bohm-sweep,.blis-overview-hero-motion .bohm-orbit,.blis-overview-hero-motion .bohm-mark:after,.blis-overview-hero-motion .bohm-state i{animation:none!important}}
`;
document.head.appendChild(style);

const names={
  aroma:['Aroma Cosmetics','Клиентският hero ефект е активен в Overview'],
  bolyarka:['Болярка ВТ АД','Клиентският hero ефект е активен в Overview'],
  'astor-garden':['Astor Garden Hotel','Клиентският hero ефект е активен в Overview'],
  'varna-towers':['Varna Towers','Клиентският hero ефект е активен в Overview'],
  mollox:['MOLLOX България','Клиентският hero ефект е активен в Overview']
};
function mountOverviewHeroMotion(){
  const host=document.getElementById('overviewPremium');
  const screen=host&&host.querySelector('.ov-screen');
  if(!screen)return false;
  let fx=screen.querySelector(':scope > .blis-overview-hero-motion');
  const key=document.body.dataset.client||'aroma';
  const meta=names[key]||['BLIS Navigator','Активен клиентски профил'];
  if(!fx){
    fx=document.createElement('div');
    fx.className='blis-overview-hero-motion';
    fx.setAttribute('aria-hidden','true');
    fx.innerHTML='<div class="bohm-image"></div><div class="bohm-shade"></div><div class="bohm-lines"></div><div class="bohm-sweep"></div><div class="bohm-orbit"></div><div class="bohm-copy"><div class="bohm-left"><span class="bohm-mark">BLIS</span><span><b class="bohm-client"></b><small class="bohm-sub"></small></span></div><span class="bohm-state"><i></i> ACTIVE INTELLIGENCE</span></div>';
    screen.insertBefore(fx,screen.firstChild);
  }
  const n=fx.querySelector('.bohm-client'),s=fx.querySelector('.bohm-sub');
  if(n)n.textContent=meta[0];if(s)s.textContent=meta[1];
  fx.dataset.client=key;
  return true;
}
function scheduleMount(){
  if(mountOverviewHeroMotion())return;
  let tries=0;
  const id=setInterval(function(){tries++;if(mountOverviewHeroMotion()||tries>40)clearInterval(id)},125);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scheduleMount,{once:true});else scheduleMount();
const obs=new MutationObserver(function(m){
  let relevant=false;
  for(const x of m){if(x.target&&((x.target.id==='overviewPremium')||(x.target.closest&&x.target.closest('#overviewPremium')))){relevant=true;break}}
  if(relevant)requestAnimationFrame(mountOverviewHeroMotion);
});
if(document.documentElement)obs.observe(document.documentElement,{childList:true,subtree:true});
const bodyObs=new MutationObserver(function(){requestAnimationFrame(mountOverviewHeroMotion)});
if(document.body)bodyObs.observe(document.body,{attributes:true,attributeFilter:['data-client']});
else document.addEventListener('DOMContentLoaded',function(){bodyObs.observe(document.body,{attributes:true,attributeFilter:['data-client']})},{once:true});
})();
