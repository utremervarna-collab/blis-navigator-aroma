package main

import "strings"

func init() {
	cssAnchor := `.process{display:grid;grid-template-columns:repeat(5,1fr);gap:0}.step{position:relative;text-align:center;padding:0 17px}.step:after{content:"";position:absolute;left:60%;right:-40%;top:26px;height:1px;background:#d9e1e9}.step:last-child:after{display:none}.stepNum{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--gold2),var(--gold));color:#fff;display:grid;place-items:center;margin:0 auto 17px;font-weight:850}.step b{font-size:13px}.step p{font-size:10px;color:var(--muted);line-height:1.55;max-width:175px;margin:7px auto 0}`

	cssAnimated := `.process{display:grid;grid-template-columns:repeat(5,1fr);gap:0}.step{position:relative;text-align:center;padding:0 17px;transition:opacity .35s ease}.step:after{content:"";position:absolute;left:60%;right:-40%;top:26px;height:2px;background:#d9e1e9;transition:background .35s ease,box-shadow .35s ease}.step:last-child:after{display:none}.stepNum{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--gold2),var(--gold));color:#fff;display:grid;place-items:center;margin:0 auto 17px;font-weight:850;position:relative;z-index:3;transition:transform .38s cubic-bezier(.2,.8,.2,1),box-shadow .38s ease,filter .38s ease}.stepNum:before,.stepNum:after{content:"";position:absolute;border-radius:50%;inset:-7px;border:1px solid transparent;opacity:0;pointer-events:none}.stepNum:after{inset:-14px}.step b{font-size:13px;display:inline-block;transition:transform .38s cubic-bezier(.2,.8,.2,1),color .38s ease,text-shadow .38s ease}.step p{font-size:10px;color:var(--muted);line-height:1.55;max-width:175px;margin:7px auto 0;transition:color .35s ease}.step.is-done .stepNum{filter:saturate(.92) brightness(.96);box-shadow:0 0 0 4px rgba(197,138,36,.08)}.step.is-done:after{background:linear-gradient(90deg,var(--gold),#d9e1e9)}.step.is-active .stepNum{transform:scale(1.22);filter:brightness(1.08);box-shadow:0 0 0 7px rgba(224,171,72,.10),0 0 24px rgba(197,138,36,.44),0 0 46px rgba(36,102,220,.16)}.step.is-active .stepNum:before{opacity:1;border-color:rgba(224,171,72,.62);animation:homeStepHalo 1.35s ease-in-out infinite}.step.is-active .stepNum:after{opacity:.72;border-color:rgba(36,102,220,.30);animation:homeStepHalo 1.35s .14s ease-in-out infinite}.step.is-active b{transform:scale(1.14);color:var(--navy);text-shadow:0 0 14px rgba(197,138,36,.20)}.step.is-active p{color:#52667d}.step.is-flowing:after{background:linear-gradient(90deg,var(--gold),#2e79e7);box-shadow:0 0 11px rgba(46,121,231,.20)}.stepFlowPulse{position:absolute;z-index:5;top:19px;left:60%;width:15px;height:15px;border-radius:50%;opacity:0;pointer-events:none;background:#f3bd58;box-shadow:0 0 11px 4px rgba(229,169,62,.52),0 0 24px 8px rgba(36,102,220,.16)}.stepFlowPulse:after{content:"";position:absolute;right:7px;top:6px;width:34px;height:3px;background:linear-gradient(90deg,transparent,#f3bd58)}.step.is-flowing .stepFlowPulse{opacity:1;animation:homeStepTravel .95s cubic-bezier(.2,.72,.25,1) forwards}@keyframes homeStepTravel{0%{left:60%;opacity:0;transform:scale(.75)}12%{opacity:1}84%{opacity:1}100%{left:calc(140% - 8px);opacity:0;transform:scale(1.05)}}@keyframes homeStepHalo{0%,100%{transform:scale(.96);opacity:.38}50%{transform:scale(1.08);opacity:1}}`

	if strings.Contains(indexHTML, cssAnchor) {
		indexHTML = strings.Replace(indexHTML, cssAnchor, cssAnimated, 1)
	}

	script := `<script id="blisHomeProcessMotion">(function(){
var root=document.querySelector('.process');if(!root)return;
var steps=[].slice.call(root.querySelectorAll('.step'));if(steps.length!==5)return;
steps.forEach(function(s,i){if(i<steps.length-1&&!s.querySelector('.stepFlowPulse')){var p=document.createElement('span');p.className='stepFlowPulse';s.appendChild(p)}});
var idx=0,timer=null;
function paint(){steps.forEach(function(s,i){s.classList.toggle('is-active',i===idx);s.classList.toggle('is-done',i<idx);s.classList.remove('is-flowing')})}
function cycle(){clearTimeout(timer);paint();if(idx>=steps.length-1){timer=setTimeout(function(){idx=0;paint();timer=setTimeout(cycle,850)},1450);return}timer=setTimeout(function(){var s=steps[idx];s.classList.remove('is-flowing');void s.offsetWidth;s.classList.add('is-flowing');timer=setTimeout(function(){idx++;paint();timer=setTimeout(cycle,850)},980)},760)}
paint();timer=setTimeout(cycle,900);
})();</script>`
	if !strings.Contains(indexHTML, `id="blisHomeProcessMotion"`) {
		indexHTML = strings.Replace(indexHTML, "</body>", script+"</body>", 1)
	}
}
