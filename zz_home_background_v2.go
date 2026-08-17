package main

import "strings"

func init() {
	const css = `<style id="blis-site-background-v2">
html{background:#f6f2e9!important}
body{
  background:
    radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.96) 0%,rgba(250,247,240,.91) 42%,rgba(241,235,222,.92) 100%),
    linear-gradient(135deg,#fbf9f4,#f1eadc)!important;
  background-attachment:fixed!important;
  position:relative!important;
  min-height:100vh;
}
body:before,body:after{
  content:"";position:fixed;pointer-events:none;z-index:0;
  background-repeat:no-repeat;
}
body:before{
  left:-5vw;bottom:-8vh;width:72vw;height:58vh;opacity:.9;
  background:
    linear-gradient(154deg,transparent 0 34%,rgba(211,153,49,.92) 34.2% 34.45%,transparent 34.7% 100%),
    linear-gradient(160deg,transparent 0 41%,rgba(16,45,71,.68) 41.2% 41.5%,transparent 41.8% 100%),
    repeating-linear-gradient(168deg,transparent 0 11px,rgba(202,144,43,.18) 12px,transparent 13px 20px),
    radial-gradient(ellipse at 15% 95%,rgba(221,162,55,.30),transparent 55%);
  transform:rotate(-2deg);
  -webkit-mask-image:linear-gradient(90deg,#000 0%,rgba(0,0,0,.94) 52%,transparent 96%);
  mask-image:linear-gradient(90deg,#000 0%,rgba(0,0,0,.94) 52%,transparent 96%);
}
body:after{
  right:-7vw;top:-10vh;width:63vw;height:52vh;opacity:.92;
  background:
    linear-gradient(22deg,transparent 0 55%,rgba(205,145,38,.88) 55.2% 55.42%,transparent 55.7% 100%),
    linear-gradient(28deg,transparent 0 64%,rgba(17,48,76,.56) 64.2% 64.48%,transparent 64.8% 100%),
    repeating-linear-gradient(24deg,transparent 0 12px,rgba(198,139,34,.16) 13px,transparent 14px 22px),
    radial-gradient(ellipse at 90% 4%,rgba(224,168,68,.26),transparent 58%);
  transform:rotate(3deg);
  -webkit-mask-image:linear-gradient(270deg,#000 0%,rgba(0,0,0,.94) 54%,transparent 96%);
  mask-image:linear-gradient(270deg,#000 0%,rgba(0,0,0,.94) 54%,transparent 96%);
}
.top,.marketTape,main,.footer{position:relative;z-index:2}
.top{background:rgba(255,255,255,.90)!important;backdrop-filter:blur(14px)}
.hero{background:rgba(255,255,255,.47)!important;backdrop-filter:blur(5px)}
.facts,.trust{background:rgba(255,255,255,.58)!important;backdrop-filter:blur(7px)}
.section{background:rgba(255,255,255,.20)!important;backdrop-filter:blur(2px)}
.section.soft{background:rgba(246,247,247,.66)!important;backdrop-filter:blur(9px)}
.blis-dark-platform{background:transparent!important;backdrop-filter:none!important}
.capGrid,.article,.brandBand{background:rgba(255,255,255,.84)!important;box-shadow:0 16px 42px rgba(31,49,67,.055);backdrop-filter:blur(10px)}
.clientNote{background:rgba(255,249,238,.86)!important}
@media(prefers-reduced-motion:no-preference){
 body:before{animation:blisBgV2Left 18s ease-in-out infinite alternate}
 body:after{animation:blisBgV2Right 22s ease-in-out infinite alternate}
 @keyframes blisBgV2Left{to{transform:rotate(0deg) translate3d(1.4vw,-.7vh,0)}}
 @keyframes blisBgV2Right{to{transform:rotate(1deg) translate3d(-1vw,.6vh,0)}}
}
@media(max-width:720px){
 body:before{width:108vw;height:46vh;opacity:.60}
 body:after{width:94vw;height:40vh;opacity:.58}
 .hero,.facts,.trust,.section,.section.soft{backdrop-filter:none}
}
</style>`
	if !strings.Contains(indexHTML, "blis-site-background-v2") {
		indexHTML = strings.Replace(indexHTML, "</head>", css+"</head>", 1)
	}
}
