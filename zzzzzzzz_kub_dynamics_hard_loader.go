package main

import "bytes"

// KUB pages can already contain the i18n runtime marker before late loader init
// mutations are considered. Attach the crisis-dynamics script to the KUB-only
// readable-type payload so it is present even when later shared loaders return early.
func init() {
	const tag = `<script defer src="/kub-crisis-dynamics-v1.js?v=20260903-dynamics6"></script>
<script>
(function(){
  function fixKubAxis(){
    var g=document.querySelector('.kubDynV4Axis');
    if(!g)return;
    var t=g.querySelectorAll('text');
    if(t.length<5)return;
    t[0].setAttribute('x','215'); t[0].setAttribute('y','202'); t[0].setAttribute('text-anchor','middle');
    t[1].setAttribute('x','385'); t[1].setAttribute('y','202'); t[1].setAttribute('text-anchor','middle');
    t[2].setAttribute('x','548'); t[2].setAttribute('y','202'); t[2].setAttribute('text-anchor','middle');
    t[3].setAttribute('x','625'); t[3].setAttribute('y','194'); t[3].setAttribute('text-anchor','middle');
    t[3].textContent='25–28 авг.';
    t[4].setAttribute('x','704'); t[4].setAttribute('y','214'); t[4].setAttribute('text-anchor','end');
    t[4].textContent=(new Date()).toLocaleDateString('bg-BG',{day:'2-digit',month:'2-digit'})+' · днес';
  }
  document.addEventListener('DOMContentLoaded',function(){fixKubAxis();setTimeout(fixKubAxis,500);setTimeout(fixKubAxis,1500);});
  new MutationObserver(fixKubAxis).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>`
	if !bytes.Contains(kubReadableTypeCSS, []byte("kub-crisis-dynamics-v1.js")) {
		kubReadableTypeCSS = append(kubReadableTypeCSS, []byte(tag)...)
	}
}
