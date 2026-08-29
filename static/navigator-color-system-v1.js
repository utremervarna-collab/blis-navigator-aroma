/* BLIS Navigator — semantic color system v1.
   Color communicates meaning: blue=brand/active, green=positive, red=risk,
   amber=attention, blue-grey=neutral/competitors. Pure presentation layer. */
(function(){
'use strict';
if(window.__BLIS_COLOR_SYSTEM_V1)return;window.__BLIS_COLOR_SYSTEM_V1=true;

function css(){
 if(document.getElementById('blisColorSystemV1Css'))return;
 const s=document.createElement('style');s.id='blisColorSystemV1Css';s.textContent=`
:root{
 --blis-primary:#1F65B7;--blis-primary-dark:#193754;--blis-primary-soft:#EDF4FD;
 --blis-positive:#3D956E;--blis-positive-soft:#EAF6F0;
 --blis-risk:#C75A54;--blis-risk-soft:#FAECE9;
 --blis-warning:#D4A64A;--blis-warning-soft:#FBF4E5;
 --blis-neutral:#6C89A8;--blis-neutral-soft:#EEF3F8;
 --blis-bg:#F5F7FA;--blis-surface:#FFFFFF;--blis-border:#E2E8EF;
 --blis-text:#203F5D;--blis-text-soft:#77889A;
}
body{background:linear-gradient(180deg,#f7f9fc 0,#f4f7fa 100%)!important}
.page.active{color:var(--blis-text)}
#nav button.active{background:linear-gradient(90deg,var(--blis-primary-soft),#f8fbff)!important;color:var(--blis-primary)!important;box-shadow:inset 3px 0 0 var(--blis-primary)!important}
#nav button.active .navico{color:var(--blis-primary)!important}
.blis-system-step.done .num{background:var(--blis-neutral-soft)!important;border-color:#cfdce8!important;color:#476b8d!important}
.blis-system-step.active{background:var(--blis-primary-soft)!important;color:var(--blis-primary-dark)!important}
.blis-system-step.active .num{background:var(--blis-primary)!important;border-color:var(--blis-primary)!important;color:#fff!important;box-shadow:0 4px 12px rgba(31,101,183,.20)}
.blis-stage-context{border-left-color:var(--blis-primary)!important;background:linear-gradient(90deg,var(--blis-primary-soft),#fbfdff)!important}
.blis-next-step button{background:linear-gradient(135deg,#2d76c5,var(--blis-primary))!important}

/* 01 Overview — brand trajectory + semantic takeaways */
.ov5-answer{border-left-color:var(--blis-primary)!important;background:linear-gradient(105deg,var(--blis-primary-soft),#fff)!important}
.ov5-score{background:linear-gradient(145deg,#f4f9ff,#fff)!important;border-color:#d8e6f4!important}
.ov5-score strong{color:var(--blis-primary)!important;text-shadow:0 8px 24px rgba(31,101,183,.12)}
.ov5-trajectory polyline{stroke:var(--blis-primary)!important}
.ov5-trajectory .area{fill:rgba(31,101,183,.10)!important}
.ov5-event>circle{fill:rgba(212,166,74,.18)!important;stroke:var(--blis-warning)!important}
.ov5-event .inner{fill:var(--blis-warning)!important}
.ov5-insight:nth-child(1){border-color:#efd4d0!important;border-top:3px solid var(--blis-risk)!important;background:linear-gradient(180deg,var(--blis-risk-soft),#fff 62%)!important}
.ov5-insight:nth-child(1) span{color:var(--blis-risk)!important}
.ov5-insight:nth-child(2){border-color:#d6eadf!important;border-top:3px solid var(--blis-positive)!important;background:linear-gradient(180deg,var(--blis-positive-soft),#fff 62%)!important}
.ov5-insight:nth-child(2) span{color:var(--blis-positive)!important}
.ov5-insight:nth-child(3){border-color:#eadfbf!important;border-top:3px solid var(--blis-warning)!important;background:linear-gradient(180deg,var(--blis-warning-soft),#fff 62%)!important}
.ov5-insight:nth-child(3) span{color:#9a772d!important}

/* 02 Signals — color is signal type */
.sig2-answer{border-left-color:var(--blis-primary)!important;border-color:#d8e5f2!important;background:linear-gradient(105deg,var(--blis-primary-soft),#fff)!important}
.sig2-pulse{background:linear-gradient(180deg,#f9fbfe,#fff)!important}
.sig2-line{background:linear-gradient(90deg,#dce5ee,var(--blis-neutral),var(--blis-primary))!important}
.sig2-dot.risk{background:var(--blis-risk)!important}.sig2-dot.good{background:var(--blis-positive)!important}.sig2-dot.comp{background:var(--blis-neutral)!important}.sig2-dot.watch{background:var(--blis-warning)!important}
.sig2-group.risk .sig2-group-head h3{color:var(--blis-risk)!important}.sig2-group.good .sig2-group-head h3{color:var(--blis-positive)!important}.sig2-group.watch .sig2-group-head h3{color:#99752b!important}
.sig2-item.risk{border-color:#efd6d2!important;border-top-color:var(--blis-risk)!important;background:linear-gradient(180deg,var(--blis-risk-soft),#fff 65%)!important}
.sig2-item.good{border-color:#d7eadf!important;border-top-color:var(--blis-positive)!important;background:linear-gradient(180deg,var(--blis-positive-soft),#fff 65%)!important}
.sig2-group.watch .sig2-item{border-color:#eadfbe!important;border-top:3px solid var(--blis-warning)!important;background:linear-gradient(180deg,var(--blis-warning-soft),#fff 65%)!important}
.sig2-item.risk .sig2-kind{color:var(--blis-risk)!important}.sig2-item.good .sig2-kind{color:var(--blis-positive)!important}.sig2-group.watch .sig2-kind{color:#99752b!important}

/* 03 Market — theme direction + richer perception map */
.market1-answer{border-left-color:var(--blis-primary)!important;border-color:#d9e6f4!important;background:linear-gradient(105deg,var(--blis-primary-soft),#fff)!important}
.market1-theme{position:relative;overflow:hidden}
.market1-theme:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--blis-neutral)}
.market1-theme.tone-positive{border-color:#d7eadf!important;background:linear-gradient(120deg,var(--blis-positive-soft),#fff 58%)!important}.market1-theme.tone-positive:before{background:var(--blis-positive)}.market1-theme.tone-positive strong{color:var(--blis-positive)!important}
.market1-theme.tone-risk{border-color:#efd6d2!important;background:linear-gradient(120deg,var(--blis-risk-soft),#fff 58%)!important}.market1-theme.tone-risk:before{background:var(--blis-risk)}.market1-theme.tone-risk strong{color:var(--blis-risk)!important}
.market1-theme.tone-warning{border-color:#eadfbe!important;background:linear-gradient(120deg,var(--blis-warning-soft),#fff 58%)!important}.market1-theme.tone-warning:before{background:var(--blis-warning)}.market1-theme.tone-warning strong{color:#99752b!important}
#market .pm-stage{background:radial-gradient(circle at 72% 20%,rgba(61,149,110,.08),transparent 24%),radial-gradient(circle at 28% 74%,rgba(212,166,74,.08),transparent 25%),radial-gradient(circle at 52% 45%,rgba(31,101,183,.09),transparent 33%),linear-gradient(#fff,#fbfcfe)!important}
#market .pm-node.selected{border-color:var(--blis-primary)!important;box-shadow:0 0 0 3px rgba(31,101,183,.09),0 12px 24px rgba(31,56,89,.10)!important}
#market .pm-link.hot{stroke:var(--blis-primary)!important}

/* 04 Digital — one coherent blue/teal family; status colors remain reserved */
#digital{--dv-navy:#10283f;--dv-navy2:#123b55;--dv-cyan:#41b7c5;--dv-teal:#2f93ab;--dv-green:#3d819f;--dv-blue:var(--blis-primary);--dv-orange:#6c89a8;--dv-purple:#5876a8;--dv-ink:var(--blis-primary-dark);--dv-muted:var(--blis-text-soft);--dv-line:var(--blis-border);--dv-soft:var(--blis-primary-soft)}
#digital .dv-stage{border-color:#d8e5f2!important;background:linear-gradient(145deg,#f8fbff,#fff)!important}
#digital .dv-radar-grid{border-color:#4bb9c2!important;background:radial-gradient(circle at 50% 50%,#176277 0,#174b66 27%,#123852 58%,#10283f 100%)!important;box-shadow:inset 0 0 0 1px rgba(75,185,194,.35),inset 0 0 35px rgba(65,183,197,.22),0 0 0 10px rgba(31,101,183,.09),0 0 36px rgba(65,183,197,.22)!important}
#digital .dv-radar-core{border-color:#4cc8c7!important;box-shadow:0 0 0 8px rgba(76,200,199,.14),0 0 24px rgba(76,200,199,.70)!important}
#digital .dv-blip i{background:#7be0dc!important;box-shadow:0 0 7px #55ccc8,0 0 14px rgba(85,204,200,.65)!important}
#digital .dv-detail{border-color:#d8e5f2!important;box-shadow:0 10px 28px rgba(31,101,183,.07)!important}

/* 05 Reputation — brand trajectory, positive/negative drivers */
.rep46-chart{color:var(--blis-primary)!important}.rep46-chart circle{fill:var(--blis-primary)!important}
.rep46-focus.risk{border-color:#efd5d1!important;background:linear-gradient(120deg,var(--blis-risk-soft),#fff)!important}.rep46-focus.risk span{color:var(--blis-risk)!important}
.rep46-focus.good{border-color:#d5e9de!important;background:linear-gradient(120deg,var(--blis-positive-soft),#fff)!important}.rep46-focus.good span{color:var(--blis-positive)!important}
.rep46-badge.risk{background:var(--blis-risk-soft)!important;color:var(--blis-risk)!important}.rep46-badge.good{background:var(--blis-positive-soft)!important;color:var(--blis-positive)!important}
.rep46-driver.tone-risk .rep46-bar i{background:var(--blis-risk)!important}.rep46-driver.tone-positive .rep46-bar i{background:var(--blis-positive)!important}.rep46-driver.tone-neutral .rep46-bar i{background:var(--blis-neutral)!important}

/* 06 Competition — colored strength axis, client + leader differentiation */
.xv2-ladder{position:relative;padding-top:28px!important}
.xv2-ladder:before{content:'по-слаба позиция';position:absolute;left:calc(30px + 10px + min(160px, .55fr));top:7px;color:#8797a8;font-size:7px;font-weight:750}
.xv2-ladder:after{content:'по-силна позиция';position:absolute;right:82px;top:7px;color:var(--blis-primary);font-size:7px;font-weight:850}
.xv2-track{background:linear-gradient(90deg,#dce6f0 0%,#bfd3e7 36%,#7eacd6 68%,var(--blis-primary) 100%)!important;box-shadow:inset 0 0 0 1px rgba(31,101,183,.10)}
.xv2-track i{background:linear-gradient(90deg,#a8bed3,#5c91c2,var(--blis-primary))!important;opacity:.84}
.xv2-track u{border-color:#5f8fb9!important}.xv2-row.client .xv2-track u{border-color:var(--blis-primary)!important;box-shadow:0 0 0 4px rgba(31,101,183,.10),0 3px 10px rgba(31,101,183,.20)!important}
.xv2-row.client{border-color:#bad2e9!important;background:linear-gradient(90deg,var(--blis-primary-soft),#fff)!important}
.xv2-row.leader:not(.client){border-color:#eadcb6!important;background:linear-gradient(90deg,var(--blis-warning-soft),#fff)!important}.xv2-row.leader:not(.client) .xv2-rank{background:var(--blis-warning)!important;color:#fff!important}.xv2-row.leader:not(.client) .xv2-track u{border-color:var(--blis-warning)!important}

/* 07 Risk & opportunities — semantic points + cards */
#opportunitiesBody .xv2-glance .xv2-card:nth-child(1){border-top:3px solid var(--blis-risk)!important;background:linear-gradient(180deg,var(--blis-risk-soft),#fff 64%)!important}
#opportunitiesBody .xv2-glance .xv2-card:nth-child(2){border-top:3px solid var(--blis-positive)!important;background:linear-gradient(180deg,var(--blis-positive-soft),#fff 64%)!important}
#opportunitiesBody .xv2-glance .xv2-card:nth-child(3){border-top:3px solid var(--blis-neutral)!important;background:linear-gradient(180deg,var(--blis-neutral-soft),#fff 64%)!important}
.xv2-dot.risk{background:var(--blis-risk)!important;box-shadow:0 0 0 5px rgba(199,90,84,.10),0 6px 16px rgba(199,90,84,.22)!important}.xv2-dot.opp{background:var(--blis-positive)!important;box-shadow:0 0 0 5px rgba(61,149,110,.10),0 6px 16px rgba(61,149,110,.22)!important}
.xv2-matrix{background:radial-gradient(circle at 72% 24%,rgba(31,101,183,.06),transparent 25%),linear-gradient(180deg,#fbfdff,#fff)!important}

/* 08 History — colored causal line and event type */
.xv2-line{background:linear-gradient(90deg,#cddcea,var(--blis-primary),#7aa6d1,var(--blis-warning))!important}
.xv2-event:before{border-color:var(--blis-primary)!important}.xv2-event.tone-risk:before{border-color:var(--blis-risk)!important;box-shadow:0 0 0 5px rgba(199,90,84,.10)!important}.xv2-event.tone-positive:before{border-color:var(--blis-positive)!important;box-shadow:0 0 0 5px rgba(61,149,110,.10)!important}.xv2-event.tone-warning:before{border-color:var(--blis-warning)!important;box-shadow:0 0 0 5px rgba(212,166,74,.10)!important}

/* 09 Reports — selection, readiness and real library */
.xv2-check:has(input:checked){border-color:#c7d9ec!important;background:var(--blis-primary-soft)!important;color:var(--blis-primary-dark)!important}
.xv2-check input{accent-color:var(--blis-primary)!important}
.xv2-side{border-color:#d4e2f0!important;background:linear-gradient(135deg,var(--blis-primary-soft),#fff)!important}.xv2-side strong{color:var(--blis-primary)!important}
.exec-library{border-color:#dce7f2!important}.exec-library-row{position:relative}.exec-library-row:before{content:'';width:6px;height:6px;border-radius:50%;background:var(--blis-positive);flex:0 0 auto;box-shadow:0 0 0 4px rgba(61,149,110,.09)}
.exec-library-actions button.primary{border-color:#bfd4ea!important;background:var(--blis-primary-soft)!important;color:var(--blis-primary)!important}.exec-export b{color:var(--blis-primary-dark)!important}

@media(max-width:760px){.xv2-ladder:before,.xv2-ladder:after{display:none}.xv2-ladder{padding-top:14px!important}}
`;
 document.head.appendChild(s);
}
function text(el){return String(el?.textContent||'').toLowerCase()}
function decorate(){
 css();
 // Market themes: color follows measured direction, never the theme identity.
 document.querySelectorAll('.market1-theme').forEach(el=>{
   el.classList.remove('tone-positive','tone-risk','tone-warning');const t=text(el);
   el.classList.add(t.includes('положителна')?'tone-positive':t.includes('негативна')?'tone-risk':'tone-warning');
 });
 // Reputation drivers: bar color follows the evidence context.
 document.querySelectorAll('.rep46-driver').forEach(el=>{
   el.classList.remove('tone-positive','tone-risk','tone-neutral');const t=text(el);
   el.classList.add(t.includes('негатив')||t.includes('рисков')?'tone-risk':t.includes('положител')?'tone-positive':'tone-neutral');
 });
 // Competition: highlight the actual leader independently of the client.
 document.querySelectorAll('#competitionBody .xv2-row').forEach((el,i)=>el.classList.toggle('leader',i===0));
 // History: event marker color follows event meaning.
 document.querySelectorAll('#historyBody .xv2-event').forEach(el=>{
   el.classList.remove('tone-positive','tone-risk','tone-warning');const t=text(el);
   el.classList.add(t.includes('риск')||t.includes('понижи')||t.includes('негатив')?'tone-risk':t.includes('възмож')||t.includes('повиши')||t.includes('положител')?'tone-positive':'tone-warning');
 });
 document.documentElement.dataset.navigatorColorSystem='semantic-v1';
}
function later(){[20,120,360,800].forEach(ms=>setTimeout(decorate,ms))}
['blis:routechange','blis:clientdata','blis:periodchange','blis:intelligence','blis:executive-data','blis:production-ready'].forEach(ev=>window.addEventListener(ev,later));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',later,{once:true});else later();
window.BLISColorSystemV1={decorate,later};
})();