package main

import (
	"bytes"
	"log"
	"net/http"
	"regexp"
)

var kubDashboardLinkRE = regexp.MustCompile(`(?is)(?:<br\s*/?>\s*)?<a\b[^>]*href=["'][^"']*dashboard\.html[^"']*["'][^>]*>.*?</a>`)

var kubRuntimeFiles = map[string]string{
	"/kub-client-content-v4.js":          "kub-client-content-v4.js",
	"/kub-crisis-shell-fix-v1.js":        "kub-crisis-shell-fix-v1.js",
	"/kub-crisis-ru-v1.js":               "kub-crisis-ru-v1.js",
	"/kub-client-stabilizer-v1.js":        "kub-client-stabilizer-v1.js",
	"/kub-crisis-dynamics-force-v1.js":    "kub-crisis-dynamics-force-v1.js",
	"/kub-attack-map-v1.js":               "kub-attack-map-v1.js",
	"/kub-attack-map-live-v1.js":          "kub-attack-map-live-v1.js",
	"/kub-attack-map-executive-v1.js":     "kub-attack-map-executive-v1.js",
	"/kub-attack-map-white3d-v1.js":       "kub-attack-map-white3d-v1.js",
	"/kub-attack-map-premium-v1.js":       "kub-attack-map-premium-v1.js",
	"/kub-dom-idempotency-v1.js":          "kub-dom-idempotency-v1.js",
	"/kub-i18n-full-v1.js":                "kub-i18n-full-v1.js",
	"/kub-i18n-polish-v1.js":              "kub-i18n-polish-v1.js",
	"/kub-i18n-final-fragments-v1.js":     "kub-i18n-final-fragments-v1.js",
}

func serveKUBRuntimeJS(file string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		b, err := staticFS.ReadFile("static/" + file)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		aliasGuard := []byte(`if(!/^\/kub-(?:crisis\.html|private|live|client|mobile(?:\.html)?)$/i.test(location.pathname))return;`)
		b = bytes.ReplaceAll(b, []byte(`if(!/\/kub-crisis\.html$/i.test(location.pathname))return;`), aliasGuard)
		b = bytes.ReplaceAll(b, []byte(`if(location.pathname!=='/kub-private')return;`), aliasGuard)
		w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		_, _ = w.Write(b)
	}
}

func serveKUBHTML(file string, injectRuntime bool) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		b, err := staticFS.ReadFile("static/" + file)
		if err != nil {
			http.Error(w, "KUB page not found", http.StatusNotFound)
			return
		}

		b = kubDashboardLinkRE.ReplaceAll(b, nil)

		if injectRuntime {
			const mobileLayout = `<style id="kub-mobile-layout-v2">
#attackmap .kubam-topgrid-fixed{display:grid!important;grid-template-columns:minmax(0,1.45fr) minmax(280px,.55fr)!important;gap:14px!important;align-items:start!important;margin-bottom:14px!important}
#attackmap .kubam-topcol{display:grid!important;gap:14px!important;min-width:0!important;max-width:100%!important;align-content:start!important}
#attackmap .kubam-topcol>.card{min-width:0!important;max-width:100%!important;margin:0!important}
#attackmap .kubam-topgrid-fixed .kubam-map-card,#attackmap .kubam-topgrid-fixed .kubam-detail{min-width:0!important;max-width:100%!important;margin:0!important}
@media(max-width:1050px){
 html,body{width:100%;max-width:100%;overflow-x:hidden}
 .app{grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:100%!important;overflow-x:hidden!important}
 .side,.main,.shell,.nav{min-width:0!important;max-width:100%!important}
 .side{width:100%!important;overflow:hidden!important}
 .nav{width:100%!important;overflow-x:auto!important;overflow-y:hidden!important;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
 .nav button{flex:0 0 auto!important}
 #attackmap .kubam-topgrid-fixed{grid-template-columns:minmax(0,1fr)!important}
}
@media(max-width:700px){
 #attackmap,#attackmap .kubam-hero,#attackmap .kubam-grid,#attackmap .kubam-lower,#attackmap .kubam-map-card,#attackmap .kubam-detail{min-width:0!important;max-width:100%!important}
 #attackmap .kubam-canvas{width:100%!important;max-width:100%!important;min-width:0!important;overflow:hidden!important}
 #attackmap .kubam-canvas svg{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;height:auto!important}
}
</style>`
			b = bytes.Replace(b, []byte("</head>"), []byte(mobileLayout+"\n</head>"), 1)

			const runtime = `<script defer src="/kub-client-content-v4.js?v=20260908-direct22"></script>
<script defer src="/kub-crisis-shell-fix-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-crisis-ru-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-attack-map-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-attack-map-live-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-attack-map-executive-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-attack-map-white3d-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-client-stabilizer-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-crisis-dynamics-force-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-attack-map-premium-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-dom-idempotency-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-i18n-full-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-i18n-polish-v1.js?v=20260908-direct22"></script>
<script defer src="/kub-i18n-final-fragments-v1.js?v=20260908-direct22"></script>
<script>
(function(){
 function placeKUBMap(){
  var page=document.getElementById('attackmap');
  if(!page||page.dataset.kubPlacement==='1')return !!page;
  var hero=page.querySelector('.kubam-hero');
  var grid=page.querySelector('.kubam-grid');
  var map=page.querySelector('.kubam-map-card');
  var detail=page.querySelector('.kubam-detail');
  if(!hero||!grid||!map||!detail||hero.children.length<2)return false;
  var intro=hero.children[0];
  var proof=hero.children[1];
  var shell=document.createElement('div');
  var left=document.createElement('div');
  var right=document.createElement('div');
  shell.className='kubam-hero kubam-topgrid-fixed';
  left.className='kubam-topcol kubam-topcol-left';
  right.className='kubam-topcol kubam-topcol-right';
  hero.parentNode.insertBefore(shell,hero);
  left.appendChild(intro);
  left.appendChild(map);
  right.appendChild(proof);
  right.appendChild(detail);
  shell.appendChild(left);
  shell.appendChild(right);
  hero.remove();
  grid.remove();
  page.dataset.kubPlacement='1';
  page.classList.add('kub-layout-fixed');
  return true;
 }
 function bootPlacement(){
  if(placeKUBMap())return;
  var tries=0;
  var timer=setInterval(function(){
   tries++;
   if(placeKUBMap()||tries>80)clearInterval(timer);
  },100);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootPlacement,{once:true});else bootPlacement();
})();
</script>`
			b = bytes.Replace(b, []byte("</body>"), []byte(runtime+"\n</body>"), 1)
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		w.Header().Set("Clear-Site-Data", `"cache"`)
		w.Header().Set("X-BLIS-KUB-Route", "direct22")
		log.Printf("KUB_PAGE route=%s file=%s bytes=%d marker=direct22", r.URL.Path, file, len(b))
		_, _ = w.Write(b)
	}
}

func init() {
	for route, file := range kubRuntimeFiles {
		http.HandleFunc(route, serveKUBRuntimeJS(file))
	}

	http.HandleFunc("/kub-client", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub-live", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub-private", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub-mobile", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub-mobile.html", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub-home.html", serveKUBHTML("kub-home.html", false))
	http.HandleFunc("/kub-crisis.html", serveKUBHTML("kub-crisis.html", true))
	http.HandleFunc("/kub", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/kub-home.html", http.StatusFound)
	})
	http.HandleFunc("/kub/", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/kub-home.html", http.StatusFound)
	})
}
