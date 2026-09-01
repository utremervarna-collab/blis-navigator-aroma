package main

import "strings"

// Canonical public-home layout cleanup.
// Remove the decorative hero canvas from the DOM and collapse the Hub teaser
// so no empty reserved fields remain between useful content blocks.
func init() {
	// 1) Homepage hero: replace the entire decorative `abstract` canvas with a
	// compact intelligence snapshot. The previous version only hid the SVG but
	// kept a 440px-high container, which still reserved a large empty field.
	const abstractStart = `<div class="abstract" aria-hidden="true">`
	const factsStart = `<section class="facts">`
	if start := strings.Index(indexHTML, abstractStart); start >= 0 {
		if facts := strings.Index(indexHTML[start:], factsStart); facts >= 0 {
			facts += start
			replacement := `<div class="heroSnapshot" aria-label="BLIS Intelligence Snapshot"><div class="floatCard"><div class="floatTop"><b>BLIS Intelligence Snapshot</b><span class="live">● Активно наблюдение</span></div><div class="snapshot"><div class="dial"><div class="dialin"><div><strong>72</strong><br><small>/100</small></div></div></div><div class="spark"><svg viewBox="0 0 250 100" aria-hidden="true"><path d="M6 83L37 68L67 71L96 55L126 61L157 40L187 45L216 25L244 18" fill="none" stroke="#2466dc" stroke-width="3"/><path d="M6 83L37 68L67 71L96 55L126 61L157 40L187 45L216 25L244 18L244 98L6 98Z" fill="#eaf2ff"/><circle cx="244" cy="18" r="4" fill="#2ba769"/></svg></div></div><div class="miniStats"><div class="miniStat"><small>Пазарна среда</small><b>↗</b></div><div class="miniStat"><small>Репутация</small><b>68</b></div><div class="miniStat"><small>Активни сигнали</small><b>4</b></div></div></div></div></section>`

			// `start:facts` contains the old abstract column plus the closing
			// wrappers of heroInner/hero. Rebuild those wrappers explicitly.
			indexHTML = indexHTML[:start] + replacement + indexHTML[facts+len(factsStart):]
		}
	}

	// 2) Homepage Intelligence Hub teaser: category pills are navigation noise
	// here and were reserving a separate vertical row. Full filtering remains
	// available inside the Hub itself. Remove this row from the homepage DOM.
	const kindsStart = `<div class="homeHubKinds">`
	const gridStart = `<div class="hubGrid">`
	if start := strings.Index(indexHTML, kindsStart); start >= 0 {
		if grid := strings.Index(indexHTML[start:], gridStart); grid >= 0 {
			grid += start
			indexHTML = indexHTML[:start] + indexHTML[grid:]
		}
	}

	const css = `<style id="blis-public-home-layout-cleanup-20260901-v2">
/* Compact homepage hero: useful content only, no hidden/reserved decorative canvas. */
.hero{min-height:0!important;padding:46px 0 52px!important;overflow:visible!important}
.heroInner{min-height:0!important;grid-template-columns:minmax(0,1.08fr) minmax(360px,.78fr)!important;gap:46px!important;align-items:center!important}
.heroSnapshot{min-width:0;display:flex;align-items:center;justify-content:center}
.heroSnapshot .floatCard{position:relative!important;right:auto!important;bottom:auto!important;width:min(100%,430px)!important;margin:0!important;padding:20px!important}
.heroSnapshot .spark svg{width:100%!important;height:100px!important}

/* Homepage Hub teaser: intro -> cards, without a reserved intermediate row. */
.homeHubLive:before{content:none!important;display:none!important}
.homeHubLive{padding:48px 0 56px!important;overflow:visible!important}
.homeHubTop{align-items:center!important;margin-bottom:18px!important}
.homeHubTop .sectionHead{margin:0!important}
.homeHubLive .hubGrid{margin:0!important}
.homeHubLive .article{min-height:220px!important}

@media(max-width:1100px){
  .hero{padding:44px 0 48px!important}
  .heroInner{grid-template-columns:1fr!important;gap:28px!important}
  .heroSnapshot{width:100%!important}
  .heroSnapshot .floatCard{width:min(100%,560px)!important;margin:0 auto!important}
  .homeHubLive{padding:44px 0 48px!important}
  .homeHubTop{display:grid!important;grid-template-columns:1fr auto!important;gap:18px!important}
  .hubAll{margin-top:0!important}
}
@media(max-width:720px){
  .hero{padding:36px 0 40px!important}
  .heroInner{gap:20px!important}
  .heroSnapshot{display:none!important}
  .homeHubLive{padding:38px 0 42px!important}
  .homeHubTop{display:block!important;margin-bottom:16px!important}
  .hubAll{margin-top:14px!important}
}
</style>`
	if !strings.Contains(indexHTML, "blis-public-home-layout-cleanup-20260901-v2") {
		indexHTML = strings.Replace(indexHTML, "</head>", css+"</head>", 1)
	}
}
