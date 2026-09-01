package main

import "strings"

// Final public-home layout guard: remove oversized decorative areas that create
// empty visual fields around the homepage hero and Intelligence Hub teaser.
func init() {
	const css = `<style id="blis-public-home-layout-cleanup-20260901">
/* Homepage hero: keep the useful intelligence snapshot, remove the oversized decorative canvas. */
.hero,.heroInner{min-height:520px!important}
.heroInner{grid-template-columns:minmax(0,1.05fr) minmax(420px,.95fr)!important;gap:56px!important}
.abstract{height:440px!important;display:flex!important;align-items:center!important;justify-content:center!important}
.abstract>svg{display:none!important}
.floatCard{position:relative!important;right:auto!important;bottom:auto!important;width:min(100%,470px)!important;margin:0 auto!important}

/* Intelligence Hub teaser: no decorative rings or reserved empty area. */
.homeHubLive:before{content:none!important;display:none!important}
.homeHubLive{padding:64px 0!important;overflow:visible!important}
.homeHubTop{align-items:center!important;margin-bottom:24px!important}
.homeHubKinds{margin:0 0 24px!important}

@media(max-width:1100px){
  .hero,.heroInner{min-height:auto!important}
  .hero{padding:64px 0!important}
  .heroInner{grid-template-columns:1fr!important;gap:34px!important}
  .abstract{position:relative!important;right:auto!important;top:auto!important;width:100%!important;height:auto!important;opacity:1!important}
  .floatCard{display:block!important}
  .homeHubLive{padding:54px 0!important}
}
@media(max-width:720px){
  .hero{padding:46px 0!important}
  .heroInner{min-height:auto!important;gap:24px!important}
  .abstract{display:none!important}
  .homeHubLive{padding:46px 0!important}
  .homeHubTop{margin-bottom:20px!important}
  .homeHubKinds{margin-bottom:20px!important}
}
</style>`
	if !strings.Contains(indexHTML, "blis-public-home-layout-cleanup-20260901") {
		indexHTML = strings.Replace(indexHTML, "</head>", css+"</head>", 1)
	}
}
