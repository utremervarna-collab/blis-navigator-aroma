package main

import "strings"

func init() {
	style := `<style id="blisHomeProcessMotionStyle">
.process .step{position:relative;text-align:center;padding:0 17px;transition:opacity .35s ease,transform .35s ease}
.process .step:after{content:"";position:absolute;left:60%;right:-40%;top:26px;height:2px;background:#d9e1e9;transition:background .35s ease,box-shadow .35s ease}
.process .step:last-child:after{display:none}
.process .stepNum{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--gold2),var(--gold));color:#fff;display:grid;place-items:center;margin:0 auto 17px;font-weight:850;position:relative;z-index:3;transition:transform .38s cubic-bezier(.2,.8,.2,1),box-shadow .38s ease,filter .38s ease}
.process .stepNum:before,.process .stepNum:after{content:"";position:absolute;border-radius:50%;inset:-8px;border:1px solid transparent;opacity:0;pointer-events:none}
.process .stepNum:after{inset:-16px}
.process .step b{font-size:13px;display:inline-block;transition:transform .38s cubic-bezier(.2,.8,.2,1),color .38s ease,text-shadow .38s ease}
.process .step p{font-size:10px;color:var(--muted);line-height:1.55;max-width:175px;margin:7px auto 0;transition:color .35s ease,transform .35s ease}
.process .step.is-done .stepNum{filter:saturate(.95) brightness(.97);box-shadow:0 0 0 4px rgba(197,138,36,.10)}
.process .step.is-done:after{background:linear-gradient(90deg,var(--gold),rgba(197,138,36,.35))}
.process .step.is-active{transform:translateY(-2px)}
.process .step.is-active .stepNum{transform:scale(1.28);filter:brightness(1.13);box-shadow:0 0 0 8px rgba(224,171,72,.14),0 0 28px rgba(197,138,36,.62),0 0 58px rgba(36,102,220,.26)}
.process .step.is-active .stepNum:before{opacity:1;border-color:rgba(224,171,72,.78);animation:homeStepHalo 1.15s ease-in-out infinite}
.process .step.is-active .stepNum:after{opacity:.8;border-color:rgba(36,102,220,.42);animation:homeStepHalo 1.15s .14s ease-in-out infinite}
.process .step.is-active b{transform:scale(1.15);color:var(--navy);text-shadow:0 0 18px rgba(197,138,36,.34)}
.process .step.is-active p{color:#4e647d;transform:translateY(2px)}
.process .step.is-flowing:after{background:linear-gradient(90deg,var(--gold) 0%,#f2b64e 28%,#2f80ed 100%);box-shadow:0 0 14px rgba(46,121,231,.34),0 0 8px rgba(224,171,72,.25)}
.process .stepFlowPulse{position:absolute;z-index:6;top:17px;left:60%;width:19px;height:19px;border-radius:50%;opacity:0;pointer-events:none;background:#ffd36f;border:1px solid rgba(255,255,255,.72);box-shadow:0 0 12px 5px rgba(229,169,62,.68),0 0 30px 12px rgba(36,102,220,.24)}
.process .stepFlowPulse:after{content:"";position:absolute;right:9px;top:7px;width:48px;height:4px;background:linear-gradient(90deg,transparent,#ffd36f);filter:blur(.25px)}
.process .step.is-flowing .stepFlowPulse{opacity:1;animation:homeStepTravel 1s cubic-bezier(.2,.72,.25,1) forwards}
@keyframes homeStepTravel{0%{left:60%;opacity:0;transform:scale(.72)}10%{opacity:1}82%{opacity:1}100%{left:calc(140% - 10px);opacity:0;transform:scale(1.12)}}
@keyframes homeStepHalo{0%,100%{transform:scale(.95);opacity:.42}50%{transform:scale(1.10);opacity:1}}
@media(max-width:1100px){.process .stepFlowPulse{display:none}.process .step.is-flowing:after{box-shadow:none}}
@media(prefers-reduced-motion:reduce){.process .stepNum:before,.process .stepNum:after,.process .stepFlowPulse{animation:none!important}}
</style>`
	if !strings.Contains(indexHTML, `id="blisHomeProcessMotionStyle"`) {
		indexHTML = strings.Replace(indexHTML, "</head>", style+"</head>", 1)
	}

	script := `<script id="blisHomeProcessMotion">(function(){
var root=document.querySelector('.process');if(!root)return;
var steps=[].slice.call(root.querySelectorAll('.step'));if(steps.length!==5)return;
steps.forEach(function(s,i){if(i<steps.length-1&&!s.querySelector('.stepFlowPulse')){var p=document.createElement('span');p.className='stepFlowPulse';s.appendChild(p)}});
var idx=0,timer=null;
function paint(){steps.forEach(function(s,i){s.classList.toggle('is-active',i===idx);s.classList.toggle('is-done',i<idx);s.classList.remove('is-flowing')})}
function cycle(){clearTimeout(timer);paint();if(idx>=steps.length-1){timer=setTimeout(function(){idx=0;paint();timer=setTimeout(cycle,700)},1500);return}timer=setTimeout(function(){var s=steps[idx];s.classList.remove('is-flowing');void s.offsetWidth;s.classList.add('is-flowing');timer=setTimeout(function(){idx++;paint();timer=setTimeout(cycle,650)},1020)},720)}
paint();timer=setTimeout(cycle,850);
})();</script>`
	if !strings.Contains(indexHTML, `id="blisHomeProcessMotion"`) {
		indexHTML = strings.Replace(indexHTML, "</body>", script+"</body>", 1)
	}
}
