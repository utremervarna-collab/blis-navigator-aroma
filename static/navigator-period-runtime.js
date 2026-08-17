/* BLIS Navigator — refresh active screen after a period switch */
(function(){
  window.addEventListener('blis:periodchange',function(){
    setTimeout(function(){
      var active=document.querySelector('#nav button.active');
      if(active) active.click();
    },80);
  });
})();
