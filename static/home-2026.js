(function(){
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  async function tape(){
    const tr=document.getElementById('blisTapeTrack'); if(!tr)return;
    try{const r=await fetch('/api/public/home-tape',{cache:'no-store'});if(!r.ok)return;const d=await r.json();const a=Array.isArray(d.items)?d.items:[];if(!a.length)return;
      const h=a.map(x=>{const v=Number(x.value);if(!Number.isFinite(v))return'';const delta=x.has_delta?Number(x.delta):null;const cls=delta==null||!Number.isFinite(delta)||Math.abs(delta)<.05?'flat':delta>0?'up':'down';const dt=delta==null||!Number.isFinite(delta)?'LIVE':Math.abs(delta)<.05?'0.0':delta>0?'+'+delta.toFixed(1):'−'+Math.abs(delta).toFixed(1);return '<div class="tapeItem"><span class="tapeClient">'+esc(x.name)+'</span><span>'+esc(x.label)+'</span><span class="tapeValue">'+v.toFixed(1)+'</span><span class="tapeDelta '+cls+'">'+dt+'</span></div>'}).join('');tr.innerHTML=h+h;
    }catch(e){}
  } tape(); setInterval(tape,300000);
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('on')),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>io.observe(x));
  const steps=[...document.querySelectorAll('.step')];let idx=0,timer=null;const journey=document.querySelector('.journey');
  function run(){if(timer||!steps.length)return;steps.forEach(x=>x.classList.remove('is-active'));steps[0].classList.add('is-active');timer=setInterval(()=>{steps[idx].classList.remove('is-active');idx=(idx+1)%steps.length;steps[idx].classList.add('is-active')},1150)}
  function stop(){if(timer){clearInterval(timer);timer=null}}
  if(journey){new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?run():stop()),{threshold:.18}).observe(journey)}
})();