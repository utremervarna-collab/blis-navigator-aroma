/* Wirello Market — Signals presentation tuning only. */
(function(){
  'use strict';
  const q=new URLSearchParams(location.search);
  if(q.get('client')!=='wirello' && window.BLIS_CLIENT_SCOPE!=='wirello' && window.BLIS_INITIAL_CLIENT!=='wirello') return;
  if(document.getElementById('wirelloSignalsUI')) return;

  const s=document.createElement('style');
  s.id='wirelloSignalsUI';
  s.textContent=`
    /* One clear page title only */
    #social #n15Signals > .n15-title > .n15-k,
    #social #n15Signals > .n15-title > p{display:none!important}
    #social #n15Signals > .n15-title{margin:2px 0 24px!important}
    #social #n15Signals > .n15-title > h2{
      margin:0!important;
      font-size:0!important;
      line-height:1!important;
      letter-spacing:0!important;
      color:#0b1f3a!important;
    }
    #social #n15Signals > .n15-title > h2:after{
      content:'Digital Intelligence';
      display:block;
      font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;
      font-size:44px;
      line-height:1.05;
      font-weight:850;
      letter-spacing:-.045em;
      color:#0b1f3a;
    }

    /* Larger, balanced side labels */
    #social #n15Signals .n15-dir strong{
      display:block!important;
      width:100%!important;
      margin:0 0 14px!important;
      font-size:0!important;
      line-height:1!important;
      letter-spacing:0!important;
    }
    #social #n15Signals .n15-dir strong:after{
      display:block;
      width:100%;
      font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;
      font-size:29px;
      line-height:1.12;
      font-weight:850;
      letter-spacing:-.035em;
      color:#0f223e;
      text-align:justify;
      text-align-last:justify;
    }
    #social #n15Signals .n15-dir.from strong:after{content:'Сигнали от марката'}
    #social #n15Signals .n15-dir.about strong:after{content:'Сигнали за марката'}
    #social #n15Signals .n15-dir p{
      max-width:none!important;
      font-size:11px!important;
      line-height:1.65!important;
      text-align:justify!important;
      text-justify:inter-word!important;
    }
    #social #n15Signals .n15-dir b{
      margin-top:18px!important;
      font-family:Georgia,serif!important;
      font-weight:600!important;
      font-size:42px!important;
      letter-spacing:-.035em!important;
    }

    @media(max-width:1100px){
      #social #n15Signals > .n15-title > h2:after{font-size:38px}
      #social #n15Signals .n15-dir strong:after{font-size:26px}
    }
    @media(max-width:720px){
      #social #n15Signals > .n15-title > h2:after{font-size:34px}
      #social #n15Signals .n15-dir strong:after{font-size:24px;text-align:left;text-align-last:left}
    }
  `;
  document.head.appendChild(s);
})();
