package main

import "strings"

func init() {
	oldProcess := `<section class="section soft"><div class="container"><div class="sectionHead"><h2>Как работи <em>BLIS™</em></h2><p class="lead">Процесът започва със събиране и проверка на релевантната информация и завършва с интерпретация и аргументирани препоръки. Всеки следващ цикъл надгражда натрупаното знание.</p></div><div class="process"><div class="step"><div class="stepNum">01</div><b>Събиране</b><p>Публични, медийни, дигитални, конкурентни и предоставени от клиента източници.</p></div><div class="step"><div class="stepNum">02</div><b>Проверка</b><p>Достоверност, актуалност, значимост, контекст и приложимост.</p></div><div class="step"><div class="stepNum">03</div><b>Анализ</b><p>Тенденции, зависимости, сравнения и причинно-следствени връзки.</p></div><div class="step"><div class="stepNum">04</div><b>Интерпретация</b><p>Какво означават резултатите конкретно за организацията.</p></div><div class="step"><div class="stepNum">05</div><b>Препоръки</b><p>Аргументирани възможности, рискове и практически насоки.</p></div></div></div></section>`

	newProcess := `<section class="blis-process-section" id="how-blis-works">
<style>
.blis-process-section{padding:30px 0 82px;background:#fff}
.blis-process-shell{width:min(1420px,calc(100% - 32px));margin:auto;position:relative;overflow:hidden;border-radius:18px;padding:48px 36px 42px;background:radial-gradient(circle at 84% 34%,rgba(31,138,255,.12),transparent 28%),radial-gradient(circle at 12% 76%,rgba(224,154,35,.10),transparent 25%),linear-gradient(135deg,#030813 0%,#07111f 52%,#020711 100%);border:1px solid #16273b;box-shadow:0 26px 70px rgba(4,12,27,.18);isolation:isolate}
.blis-process-shell:before{content:"";position:absolute;width:560px;height:560px;right:-220px;top:-240px;border-radius:50%;background:repeating-radial-gradient(circle,rgba(33,139,255,.20) 0 1px,transparent 1px 30px);opacity:.28;animation:bpRotate 28s linear infinite;z-index:-1}
.blis-process-head{display:grid;grid-template-columns:.78fr 1.22fr;gap:46px;align-items:start;margin-bottom:50px;position:relative;z-index:2}
.blis-process-kicker{display:inline-flex;align-items:center;gap:8px;color:#e0a23a;font-size:9px;font-weight:850;letter-spacing:.15em;text-transform:uppercase;margin-bottom:13px}.blis-process-kicker:before{content:"";width:7px;height:7px;border-radius:50%;background:#e3a331;box-shadow:0 0 16px rgba(227,163,49,.8)}
.blis-process-head h2{font:500 clamp(38px,4vw,58px)/1.06 Georgia,serif;color:#f7f9fc;margin:0;letter-spacing:-.02em}.blis-process-head h2 em{font-style:normal;color:#e3a331}
.blis-process-head p{margin:24px 0 0;color:#9baabd;font-size:14px;line-height:1.8;max-width:720px}
.blis-process-viewport{overflow-x:auto;overflow-y:hidden;padding:30px 8px 24px;scrollbar-width:none}.blis-process-viewport::-webkit-scrollbar{display:none}
.blis-process-track{min-width:1080px;display:grid;grid-template-columns:150px 1fr 150px 1fr 150px 1fr 150px 1fr 150px;align-items:start;position:relative}
.blis-process-step{text-align:center;position:relative;z-index:3;transition:opacity .35s ease,filter .35s ease}.blis-process-step.is-upcoming{opacity:.58}.blis-process-step.is-complete{opacity:.88}.blis-process-step.is-active{opacity:1}
.blis-process-orb{width:112px;height:112px;margin:0 auto 18px;border-radius:50%;display:grid;place-items:center;position:relative;background:radial-gradient(circle,rgba(16,34,56,.92) 0 54%,rgba(4,11,22,.98) 70%);border:1px solid rgba(93,126,160,.52);color:#7e91a7;transition:transform .4s cubic-bezier(.2,.8,.2,1),border-color .4s ease,color .4s ease,box-shadow .4s ease,background .4s ease}
.blis-process-orb:before,.blis-process-orb:after{content:"";position:absolute;border-radius:50%;inset:-9px;border:1px solid transparent;transition:border-color .4s ease,box-shadow .4s ease,transform .4s ease,opacity .4s ease;opacity:0}
.blis-process-orb:after{inset:-18px}
.blis-process-num{font:600 28px/1 Georgia,serif;letter-spacing:.02em}
.blis-process-step.is-complete .blis-process-orb{border-color:rgba(209,145,34,.55);color:#c98b24;background:radial-gradient(circle,rgba(64,45,12,.32),rgba(5,12,23,.98) 67%)}
.blis-process-step.is-active .blis-process-orb{transform:scale(1.065);border-color:#e2a127;color:#f0b64e;background:radial-gradient(circle,rgba(111,73,13,.43),rgba(5,13,24,.98) 66%);box-shadow:0 0 28px rgba(227,161,39,.34),0 0 70px rgba(27,134,245,.14),inset 0 0 24px rgba(226,161,41,.10)}
.blis-process-step.is-active .blis-process-orb:before{opacity:1;border-color:rgba(231,169,62,.58);box-shadow:0 0 22px rgba(227,161,39,.22);animation:bpHalo 1.6s ease-in-out infinite}
.blis-process-step.is-active .blis-process-orb:after{opacity:.44;border-color:rgba(34,143,255,.30);animation:bpHalo 1.6s .18s ease-in-out infinite}
.blis-process-label{display:inline-block;font-size:15px;font-weight:800;color:#dce6f1;transform-origin:center;transition:transform .4s cubic-bezier(.2,.8,.2,1),color .4s ease,text-shadow .4s ease}
.blis-process-step.is-active .blis-process-label{transform:scale(1.10);color:#fff;text-shadow:0 0 18px rgba(227,161,39,.28)}
.blis-process-step p{margin:9px auto 0;max-width:170px;color:#7f91a5;font-size:10px;line-height:1.6;transition:color .35s ease}.blis-process-step.is-active p{color:#aebccc}.blis-process-step.is-complete p{color:#8c9aad}
.blis-process-connector{height:112px;position:relative;z-index:2}.blis-process-connector:before{content:"";position:absolute;left:-18px;right:-18px;top:55px;height:1px;background:linear-gradient(90deg,rgba(209,145,34,.28),rgba(37,137,236,.25));transition:background .35s ease,box-shadow .35s ease}.blis-process-connector.is-complete:before{background:linear-gradient(90deg,rgba(225,158,42,.68),rgba(225,158,42,.42))}.blis-process-connector.is-flowing:before{background:linear-gradient(90deg,rgba(225,158,42,.78),rgba(47,151,255,.48));box-shadow:0 0 12px rgba(226,159,38,.14)}
.blis-process-node{position:absolute;top:52px;width:7px;height:7px;border-radius:50%;background:#344a61;border:1px solid #59738d;z-index:2}.blis-process-node.left{left:-21px}.blis-process-node.right{right:-21px}.blis-process-connector.is-complete .blis-process-node,.blis-process-connector.is-flowing .blis-process-node{background:#d89524;border-color:#e2a127;box-shadow:0 0 10px rgba(226,161,39,.42)}
.blis-process-pulse{position:absolute;top:48px;left:-18px;width:15px;height:15px;border-radius:50%;background:#f2b94f;box-shadow:0 0 12px 4px rgba(239,179,70,.42),0 0 30px 8px rgba(34,143,255,.13);opacity:0;z-index:4}.blis-process-pulse:after{content:"";position:absolute;left:-20px;top:6px;width:30px;height:2px;background:linear-gradient(90deg,transparent,#f2b94f);filter:blur(.2px)}.blis-process-connector.is-flowing .blis-process-pulse{opacity:1;animation:bpTravel .82s cubic-bezier(.22,.72,.26,1) forwards}
.blis-process-footer{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:26px;color:#93a5b9;font-size:11px;letter-spacing:.03em}.blis-process-footer:before,.blis-process-footer:after{content:"";width:84px;height:1px;background:linear-gradient(90deg,transparent,rgba(220,151,33,.56))}.blis-process-footer:after{transform:scaleX(-1)}.blis-process-footer b{color:#d99a31;font-weight:800}.blis-process-status{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;color:#5f748a;font-size:8px;font-weight:850;letter-spacing:.14em;text-transform:uppercase}.blis-process-status i{width:5px;height:5px;border-radius:50%;background:#2f9cff;box-shadow:0 0 10px rgba(47,156,255,.7);animation:bpStatus 1.9s ease-in-out infinite}
@keyframes bpTravel{0%{left:-18px;transform:scale(.66);opacity:0}12%{opacity:1}82%{opacity:1}100%{left:calc(100% + 3px);transform:scale(1);opacity:0}}
@keyframes bpHalo{0%,100%{transform:scale(.97);opacity:.38}50%{transform:scale(1.06);opacity:1}}
@keyframes bpRotate{to{transform:rotate(360deg)}}
@keyframes bpStatus{0%,100%{opacity:.35;transform:scale(.8)}50%{opacity:1;transform:scale(1.18)}}
@media(max-width:980px){.blis-process-head{grid-template-columns:1fr;gap:4px;margin-bottom:34px}.blis-process-head p{margin-top:12px}.blis-process-shell{padding:38px 24px 34px}.blis-process-viewport{margin-right:-24px;padding-right:24px}}
@media(max-width:560px){.blis-process-section{padding:18px 0 54px}.blis-process-shell{width:calc(100% - 20px);padding:30px 16px;border-radius:14px}.blis-process-head h2{font-size:38px}.blis-process-track{min-width:980px;grid-template-columns:135px 1fr 135px 1fr 135px 1fr 135px 1fr 135px}.blis-process-orb{width:98px;height:98px}.blis-process-connector{height:98px}.blis-process-connector:before{top:48px}.blis-process-node{top:45px}.blis-process-pulse{top:41px}.blis-process-label{font-size:14px}.blis-process-footer{justify-content:flex-start;min-width:650px}}
@media(prefers-reduced-motion:reduce){.blis-process-shell:before,.blis-process-step,.blis-process-orb,.blis-process-orb:before,.blis-process-orb:after,.blis-process-label,.blis-process-pulse,.blis-process-status i{animation:none!important;transition:none!important}.blis-process-pulse{display:none}}
</style>
<div class="blis-process-shell"><div class="blis-process-head"><div><div class="blis-process-kicker">BLIS ANALYTICAL CYCLE</div><h2>Как работи <em>BLIS™</em></h2></div><p>Процесът започва със събиране и проверка на релевантната информация и завършва с интерпретация и аргументирани препоръки. Всеки следващ цикъл надгражда натрупаното знание.</p></div>
<div class="blis-process-viewport" aria-label="Пет стъпки в аналитичния процес на BLIS"><div class="blis-process-track" id="blisProcessTrack">
<div class="blis-process-step is-active" data-step="0"><div class="blis-process-orb"><span class="blis-process-num">01</span></div><b class="blis-process-label">Събиране</b><p>Публични, медийни, дигитални, конкурентни и предоставени от клиента източници.</p></div>
<div class="blis-process-connector" data-connector="0"><i class="blis-process-node left"></i><span class="blis-process-pulse"></span><i class="blis-process-node right"></i></div>
<div class="blis-process-step is-upcoming" data-step="1"><div class="blis-process-orb"><span class="blis-process-num">02</span></div><b class="blis-process-label">Проверка</b><p>Достоверност, актуалност, значимост, контекст и приложимост.</p></div>
<div class="blis-process-connector" data-connector="1"><i class="blis-process-node left"></i><span class="blis-process-pulse"></span><i class="blis-process-node right"></i></div>
<div class="blis-process-step is-upcoming" data-step="2"><div class="blis-process-orb"><span class="blis-process-num">03</span></div><b class="blis-process-label">Анализ</b><p>Тенденции, зависимости, сравнения и причинно-следствени връзки.</p></div>
<div class="blis-process-connector" data-connector="2"><i class="blis-process-node left"></i><span class="blis-process-pulse"></span><i class="blis-process-node right"></i></div>
<div class="blis-process-step is-upcoming" data-step="3"><div class="blis-process-orb"><span class="blis-process-num">04</span></div><b class="blis-process-label">Интерпретация</b><p>Какво означават резултатите конкретно за организацията.</p></div>
<div class="blis-process-connector" data-connector="3"><i class="blis-process-node left"></i><span class="blis-process-pulse"></span><i class="blis-process-node right"></i></div>
<div class="blis-process-step is-upcoming" data-step="4"><div class="blis-process-orb"><span class="blis-process-num">05</span></div><b class="blis-process-label">Препоръки</b><p>Аргументирани възможности, рискове и практически насоки.</p></div>
</div></div>
<div class="blis-process-footer"><span>данни</span><b>→</b><span>анализ</span><b>→</b><span>значение</span><b>→</b><span>решение</span></div><div class="blis-process-status"><i></i><span>непрекъснат аналитичен цикъл</span></div></div>
<script>
(function(){
  var track=document.getElementById('blisProcessTrack');
  if(!track || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var steps=Array.prototype.slice.call(track.querySelectorAll('.blis-process-step'));
  var connectors=Array.prototype.slice.call(track.querySelectorAll('.blis-process-connector'));
  var current=0;
  var transitionTimer=null;
  var advanceTimer=null;
  function paint(index){
    steps.forEach(function(step,i){
      step.classList.toggle('is-active',i===index);
      step.classList.toggle('is-complete',i<index);
      step.classList.toggle('is-upcoming',i>index);
    });
    connectors.forEach(function(conn,i){
      conn.classList.remove('is-flowing');
      conn.classList.toggle('is-complete',i<index);
    });
  }
  function schedule(){
    clearTimeout(transitionTimer);clearTimeout(advanceTimer);
    if(current>=steps.length-1){
      advanceTimer=setTimeout(function(){current=0;paint(current);schedule();},1700);
      return;
    }
    transitionTimer=setTimeout(function(){
      connectors[current].classList.remove('is-flowing');
      void connectors[current].offsetWidth;
      connectors[current].classList.add('is-flowing');
      advanceTimer=setTimeout(function(){current+=1;paint(current);schedule();},820);
    },900);
  }
  paint(current);schedule();
  document.addEventListener('visibilitychange',function(){if(document.hidden){clearTimeout(transitionTimer);clearTimeout(advanceTimer)}else{paint(current);schedule()}});
})();
</script>
</section>`

	if strings.Contains(indexHTML, oldProcess) {
		indexHTML = strings.Replace(indexHTML, oldProcess, newProcess, 1)
	}
}
