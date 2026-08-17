package main

import "strings"

func init() {
	const css = `<style id="blis-site-background-v1">
html{background:#f8f6f0}
body{background:
  radial-gradient(circle at 8% 88%,rgba(214,154,47,.10),transparent 26%),
  radial-gradient(circle at 96% 14%,rgba(30,70,108,.075),transparent 25%),
  linear-gradient(135deg,#fbfaf6 0%,#f8f7f3 46%,#f3f1ea 100%)!important;
  background-attachment:fixed;position:relative}
body:before,body:after{content:"";position:fixed;pointer-events:none;z-index:0;opacity:.72}
body:before{left:-8vw;bottom:-18vh;width:72vw;height:56vh;
  background:
    repeating-linear-gradient(8deg,transparent 0 13px,rgba(205,143,34,.16) 14px,transparent 15px 24px,rgba(19,52,82,.08) 25px,transparent 26px),
    radial-gradient(ellipse at 28% 70%,rgba(224,171,72,.13),transparent 55%);
  transform:skewX(-12deg) rotate(-4deg);filter:blur(.15px);
  -webkit-mask-image:linear-gradient(90deg,#000 0%,#000 52%,transparent 94%);mask-image:linear-gradient(90deg,#000 0%,#000 52%,transparent 94%)}
body:after{right:-10vw;top:-14vh;width:52vw;height:50vh;
  background:
    repeating-linear-gradient(-14deg,transparent 0 16px,rgba(200,139,31,.18) 17px,transparent 18px 29px,rgba(20,55,88,.07) 30px,transparent 31px),
    radial-gradient(ellipse at 62% 28%,rgba(231,190,111,.14),transparent 57%);
  transform:rotate(8deg);-webkit-mask-image:linear-gradient(270deg,#000 0%,#000 58%,transparent 96%);mask-image:linear-gradient(270deg,#000 0%,#000 58%,transparent 96%)}
.top,.marketTape,main,.footer{position:relative;z-index:2}.top{background:rgba(255,255,255,.93)!important}.hero{background:rgba(255,255,255,.62)!important;backdrop-filter:blur(2px)}
.facts,.trust{background:rgba(255,255,255,.66)!important;backdrop-filter:blur(3px)}
.section{background:rgba(255,255,255,.28)!important;backdrop-filter:blur(1.5px)}
.section.soft{background:rgba(245,247,248,.78)!important;backdrop-filter:blur(7px)}
.blis-dark-platform{background:transparent!important;backdrop-filter:none!important}
.capGrid,.article,.brandBand{background:rgba(255,255,255,.86)!important;backdrop-filter:blur(8px)}
.clientNote{background:rgba(255,249,238,.88)!important}
@media(max-width:720px){body:before{width:110vw;height:46vh;opacity:.45}body:after{width:85vw;height:38vh;opacity:.42}.hero,.section{backdrop-filter:none}}
@media(prefers-reduced-motion:no-preference){body:before{animation:bgV1Left 18s ease-in-out infinite alternate}body:after{animation:bgV1Right 22s ease-in-out infinite alternate}@keyframes bgV1Left{to{transform:skewX(-12deg) rotate(-2deg) translate3d(2vw,-1vh,0)}}@keyframes bgV1Right{to{transform:rotate(5deg) translate3d(-1.5vw,1vh,0)}}}
</style>`
	if !strings.Contains(indexHTML, "blis-site-background-v1") {
		indexHTML = strings.Replace(indexHTML, "</head>", css+"</head>", 1)
	}
}
