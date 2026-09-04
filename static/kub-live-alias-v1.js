/* KUB client alias marker. Do not rewrite location.pathname: all KUB runtimes are served alias-aware. */
(function(){
'use strict';
const path=(location.pathname||'').toLowerCase();
if(path!=='/kub-live'&&path!=='/kub-client'&&path!=='/kub-private')return;
window.__BLIS_KUB_CLIENT_ROUTE=path;
})();
