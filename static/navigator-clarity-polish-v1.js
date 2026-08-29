/* BLIS Navigator — clarity polish v1: qualitative first-read labels */
(function(){
'use strict';
if(window.__BLIS_CLARITY_POLISH_V1)return;window.__BLIS_CLARITY_POLISH_V1=true;
function css(){if(document.getElementById('clarityPolishCss'))return;const s=document.createElement('style');s.id='clarityPolishCss';s.textContent=`
.clarity-flow-ready .cmpv6-score{display:none!important}.clarity-flow-ready .cmpv6-rank-row{grid-template-columns:28px minmax(0,1fr)!important}.clarity-flow-ready .cmpv6-name small{display:none!important}.clarity-flow-ready .iv3-mini em{display:none!important}.clarity-flow-ready .sysdyn-history .sysdyn-event small{display:none!important}.clarity-flow-ready .sysdyn-comp .sysdyn-dot{font-size:0!important}.clarity-flow-ready .sysdyn-comp .sysdyn-dot:after{content:'•';font-size:11px;line-height:1}.market-system-v1 .market1-theme strong{font-size:12px!important;letter-spacing:0!important}.market-system-v1 .market1-theme small{line-height:1.45!important}
`;document.head.appendChild(s)}
function market(){const h=document.getElementById('marketBody');if(!h)return;const ans=h.querySelector('.market1-answer b');if(ans){ans.textContent=ans.textContent.replace(/ със (положителна|негативна|смесена) посока и сила \d+\/100\./i,' с $1 посока.').replace(/ \(\d+\/100\)/g,'')}h.querySelectorAll('.market1-theme').forEach(card=>{const strong=card.querySelector('strong'),small=card.querySelector('small');const n=Number(strong?.textContent||0);if(strong)strong.textContent=n>=75?'Силна тема':n>=55?'Умерена тема':'Тема за наблюдение';if(small){const t=small.textContent.toLowerCase(),dir=t.includes('положителна')?'Положителна посока':t.includes('негативна')?'Негативна посока':'Смесена посока';small.textContent=dir}})}
function clean(id){const h=document.getElementById(id+'Body')||document.getElementById(id);if(h)h.classList.add('clarity-flow-ready')}
function decorate(id){css();if(id==='market')market();if(['competition','opportunities','history','digital','reputation'].includes(id))clean(id)}
function later(id){[180,520,1000].forEach(t=>setTimeout(()=>decorate(id),t))}
window.addEventListener('blis:routechange',e=>later(e.detail?.page));window.addEventListener('blis:intelligence',()=>{const id=document.querySelector('.page.active')?.id;if(id)later(id)});window.BLISClarityPolishV1={decorate};css();
})();