package main

import "bytes"

func init() {
	const kubCurrentSignalsInline = `<script>
(function(){
'use strict';
if(!/\/kub-crisis\.html$/i.test(location.pathname))return;
const rows=[
 {d:'02.09.2026',t:'10:31',title:'Евроком: Строителството в „Баба Алино“ продължава, токът не е напълно спрян',text:'Нов медиен сигнал за продължаващи строителни дейности, електрозахранване и критики към институционалните действия около „Баба Алино“.',src:'Евроком',url:'https://eurocom.bg/video/nezakonnoto-selishte-baba-alino-stroitelstvoto-prodalzhava-tokat-ne-e-napalno-spryan/',types:'institution utilities media kub',sev:'КРИТИЧЕН'},
 {d:'02.09.2026',t:'10:03',title:'Коста Стоянов: „Държавата знае, въпросът е защо не действа“',text:'Декларация от парламентарната трибуна на Народното събрание по казуса „Баба Алино“, с остри критики към институциите и действията, свързвани с КУБ.',src:'БТА',url:'https://www.bta.bg/bg/news/bulgaria/oficial-messages/1196415-kosta-stoyanov-za-nay-golyamata-koruptsionna-shema-baba-alino-darzhavata-znae',types:'institution media kub',sev:'КРИТИЧЕН'},
 {d:'02.09.2026',t:'10:03',title:'Varna24 отразява парламентарната декларация за „Баба Алино“',text:'Публикацията възпроизвежда декларацията на Коста Стоянов от парламентарната трибуна и поставя казуса отново на национално политическо ниво.',src:'Varna24',url:'https://www.varna24.bg/novini/varna/Kosta-Stoyanov-za-Baba-Alino-Durzhavata-znae-vuprosut-e-zashto-ne-deistva-3019111',types:'institution media kub',sev:'КРИТИЧЕН'},
 {d:'02.09.2026',t:'09:58',title:'БНТ: Коста Стоянов с декларация в парламента за „Баба Алино“',text:'БНТ отразява декларацията на „Възраждане“ и критиките за продължително институционално бездействие по казуса.',src:'БНТ',url:'https://bntnews.bg/news/kosta-stoyanov-za-nai-golyamata-korupcionna-shema-baba-alino-darzhavata-znae-vaprosat-e-zashto-ne-deistva-1410513news.html',types:'institution media kub',sev:'КРИТИЧЕН'},
 {d:'02.09.2026',t:'00:09',title:'Евроком: Съдебно развитие по електрозахранването в „Баба Алино“',text:'Материалът свързва съдебното развитие, електрозахранването и предстоящото запечатване на обекти с „Баба Алино“ и КУБ.',src:'Евроком',url:'https://eurocom.bg/video/sadat-vav-varna-otkaza-tok-za-nezakonnite-sgradi-v-baba-alino/',types:'institution utilities media kub',sev:'КРИТИЧЕН'},
 {d:'01.09.2026',t:'14:15',title:'Радио Варна: „Възраждане“ настоява за незабавни съдебни действия по „Баба Алино“',text:'Коста Стоянов заявява във Варна, че очаква конкретни действия срещу незаконното строителство и поставя отново темата за инвеститора.',src:'БНР · Радио Варна',url:'https://bnrnews.bg/varna/post/522721/ot-vazrazhdane-nastoyavat-za-nezabavni-sadebni-deystviya-po-kazusa-baba-alino',types:'institution media kub',sev:'ВИСОК'},
 {d:'01.09.2026',t:'12:39',title:'БТА: „Възраждане“ няма отговор на сигнала си до Главна прокуратура за „Баба Алино“',text:'На пресконференция Коста Стоянов говори за действията на украинската групировка КУБ и липсата на достатъчен институционален резултат по подадените сигнали.',src:'БТА',url:'https://www.bta.bg/bg/news/bulgaria/1195837--vazrazhdane-vse-oshte-nyama-otgovor-na-signala-si-do-glavna-prokuratura-za-nez',types:'institution media kub',sev:'КРИТИЧЕН'},
 {d:'01.09.2026',t:'12:32',title:'БНТ: Започват действия по запечатване на незаконни обекти в „Баба Алино“',text:'БНТ съобщава за очаквани действия по запечатване на обекти след разговори с общинската полиция и строителния контрол.',src:'БНТ',url:'https://bntnews.bg/news/zapechatvat-nezakonnite-obekti-v-mestnostta-baba-alino-krai-varna-1410388news.html',types:'institution media kub',sev:'КРИТИЧЕН'}
];
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function apply(){
 const feed=document.getElementById('feed');if(!feed||document.getElementById('kub-current-bootstrap'))return;
 const marker=document.createElement('div');marker.id='kub-current-bootstrap';marker.style.display='none';feed.prepend(marker);
 const existingLinks=new Set([...feed.querySelectorAll('a[href]')].map(a=>a.href));
 const existingTitles=new Set([...feed.querySelectorAll('.item h3')].map(h=>h.textContent.trim().toLowerCase()));
 const created=[];
 for(const r of rows){
  let href='';try{href=new URL(r.url,location.origin).href}catch(_){href=r.url}
  if(existingLinks.has(href)||existingTitles.has(r.title.toLowerCase()))continue;
  const a=document.createElement('article');a.className='item';a.dataset.type=r.types;a.dataset.text=(r.title+' '+r.text+' '+r.src).toLowerCase();
  a.innerHTML='<time>'+esc(r.d)+'<br>'+esc(r.t)+'</time><div><h3>'+esc(r.title)+'</h3><p>'+esc(r.text)+'</p><div class="meta"><span>ТЕКУЩ СИГНАЛ</span><span>'+esc(r.src)+'</span><span>'+esc(r.sev)+'</span></div></div><a target="_blank" rel="noopener" href="'+esc(href)+'">ИЗТОЧНИК ↗</a>';
  created.push(a);existingLinks.add(href);existingTitles.add(r.title.toLowerCase());
 }
 for(let i=created.length-1;i>=0;i--)feed.prepend(created[i]);
 try{if(Array.isArray(items))created.forEach(x=>items.unshift(x));}catch(_){ }
 try{if(typeof filterFeed==='function')filterFeed();}catch(_){ }
 const filters=document.querySelector('#monitoring .filters');
 if(filters&&!document.getElementById('kubCurrentStatus')){const s=document.createElement('span');s.id='kubCurrentStatus';s.className='filter';s.style.cursor='default';s.style.marginLeft='auto';s.textContent='ОБНОВЕНО · 02.09.2026';filters.appendChild(s);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
</script>`
	if !bytes.Contains(blisI18NScripts, []byte("kub-current-bootstrap")) {
		blisI18NScripts = append([]byte(kubCurrentSignalsInline), blisI18NScripts...)
	}
}
