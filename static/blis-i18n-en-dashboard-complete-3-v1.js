/* BLIS Navigator — final Dashboard English tail. */
(function(){'use strict';
window.BLIS_EN_TRANSLATIONS=Object.assign({},window.BLIS_EN_TRANSLATIONS||{},
{
'Петзвезден хотел в курорта Св. св. Константин и Елена. · BLIS наблюдение активно':'Five-star hotel in the Sts. Constantine and Helena resort · BLIS monitoring active',
'Болярка':'Bolyarka',
'Българска пивоварна компания от Велико Търново. · BLIS наблюдение активно':'Bulgarian brewery company from Veliko Tarnovo · BLIS monitoring active'
});
function rescan(){try{window.BLISI18N?.apply(document)}catch(_){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{[150,600,1600,3200].forEach(ms=>setTimeout(rescan,ms))},{once:true});else [150,600,1600,3200].forEach(ms=>setTimeout(rescan,ms));
window.addEventListener('blis:rendered',rescan);window.addEventListener('blis:routechange',rescan);
})();
