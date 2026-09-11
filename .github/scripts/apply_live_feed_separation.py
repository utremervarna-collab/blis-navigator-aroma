from pathlib import Path
import re


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, got {count}")
    return text.replace(old, new, 1)


# Backend: extend the existing /api/signals owner instead of adding another API.
p = Path("signal_collector.go")
s = p.read_text(encoding="utf-8")
old = '''\t\tif scope == "external" || scope == "owned" {
\t\t\tfiltered := rows[:0]
\t\t\tfor _, s := range rows {
\t\t\t\tif s.Scope == scope {
\t\t\t\t\tfiltered = append(filtered, s)
\t\t\t\t}
\t\t\t}
\t\t\trows = filtered
\t\t}'''
new = '''\t\tif scope != "" {
\t\t\tfiltered := rows[:0]
\t\t\tfor _, s := range rows {
\t\t\t\tsignalScope := strings.ToLower(strings.TrimSpace(s.Scope))
\t\t\t\tkeep := true
\t\t\t\tswitch scope {
\t\t\t\tcase "external", "owned", "competitor":
\t\t\t\t\tkeep = signalScope == scope
\t\t\t\tcase "brand", "monitoring":
\t\t\t\t\tkeep = signalScope != "competitor"
\t\t\t\t}
\t\t\t\tif keep {
\t\t\t\t\tfiltered = append(filtered, s)
\t\t\t\t}
\t\t\t}
\t\t\trows = filtered
\t\t}'''
s = replace_once(s, old, new, "signal scope filter")
p.write_text(s, encoding="utf-8")


# Monitoring: use the existing renderer; make its feed brand-only and monotonic.
p = Path("static/navigator-monitoring-canonical-v5.js")
s = p.read_text(encoding="utf-8")
old = "function localRows(){const all=[];try{const x=window.BLISIntelligenceStreamV3?.getUsefulSignals?.();if(Array.isArray(x))all.push(...x)}catch(_){}all.push(...A(D().signals));return dedupe(all)}"
new = "function localRows(){const all=[];try{const x=window.BLISIntelligenceStreamV3?.getUsefulSignals?.();if(Array.isArray(x))all.push(...x)}catch(_){}all.push(...A(D().signals));return dedupe(all.filter(s=>!isCompetitor(s)))}"
s = replace_once(s, old, new, "monitoring local brand filter")

old = "let cache={client:'',at:0,rows:[]},busy=null;"
new = "function monotonicMerge(prev,incoming){const by=new Map();for(const s of A(prev)){const k=key(s);if(k&&!isCompetitor(s))by.set(k,s)}for(const s of A(incoming)){if(isCompetitor(s))continue;const k=key(s);if(!k)continue;const old=by.get(k);if(!old||(stamp(s)||0)>=(stamp(old)||0))by.set(k,s)}return dedupe([...by.values()])}\nconst liveMonitoringClients=new Set(['aroma','bolyarka','mollox']);\nlet cache={client:'',at:0,rows:[]},busy=null;"
s = replace_once(s, old, new, "monitoring monotonic helper")

old = "async function remoteRows(force=false){const c=String(client());if(!force&&cache.client===c&&Date.now()-cache.at<60000)return cache.rows;if(busy)return busy;busy=(async()=>{const all=localRows().slice();if(c&&c!=='kub')try{const r=await fetch(`/api/signals?client=${encodeURIComponent(c)}&limit=500&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});if(r.ok){const j=await r.json();all.push(...A(j?.signals))}}catch(_){}const out=dedupe(all);cache={client:c,at:Date.now(),rows:out};return out})();try{return await busy}finally{busy=null}}"
new = "async function remoteRows(force=false){const c=String(client()).toLowerCase();if(!force&&cache.client===c&&Date.now()-cache.at<60000)return cache.rows;if(busy)return busy;busy=(async()=>{const all=localRows().slice();if(c&&c!=='kub')try{const r=await fetch(`/api/signals?client=${encodeURIComponent(c)}&scope=brand&limit=500&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});if(r.ok){const j=await r.json();all.push(...A(j?.signals))}}catch(_){}const prev=cache.client===c?cache.rows:[];const out=monotonicMerge(prev,all);cache={client:c,at:Date.now(),rows:out};return out})();try{return await busy}finally{busy=null}}"
s = replace_once(s, old, new, "monitoring scoped API")

old = "function renderLocal(){const root=document.getElementById('social');if(!root?.classList.contains('active'))return;const xs=localRows(),sig=signature(xs);if(sig!==lastSig||!document.getElementById('mon5')){lastSig=sig;mount(xs)}else rewriteLegacy(root)}"
new = "function renderLocal(){const root=document.getElementById('social');if(!root?.classList.contains('active'))return;const c=String(client()).toLowerCase(),xs=monotonicMerge(cache.client===c?cache.rows:[],localRows()),sig=signature(xs);if(sig!==lastSig||!document.getElementById('mon5')){lastSig=sig;mount(xs)}else rewriteLegacy(root)}"
s = replace_once(s, old, new, "monitoring monotonic local render")

old = "window.addEventListener('load',()=>{watch();schedule(false)},{once:true});\nwindow.BLISMonitoringCanonicalV5={renderLocal,refresh,schedule,rows:remoteRows,values};"
new = "window.addEventListener('load',()=>{watch();schedule(false)},{once:true});\nsetInterval(()=>{const c=String(client()).toLowerCase();if(liveMonitoringClients.has(c)&&document.visibilityState!=='hidden')refresh(true)},60000);\nwindow.BLISMonitoringCanonicalV5={renderLocal,refresh,schedule,rows:remoteRows,values};"
s = replace_once(s, old, new, "monitoring permanent live poll")

# Keep competitor publications out of Monitoring context.
s = s.replace("{short:'Конкуренти',full:'Конкурентна активност',value:share(xs,isCompetitor)},", "{short:'Външни',full:'Външни публикации',value:share(xs,s=>N(s?.scope)==='external')},")
s = s.replace("Значими сигнали, източници, теми, конкурентни развития и области за внимание.", "Значими сигнали за марката, източници, теми и области за внимание.")
s = s.replace("const total=xs.length,att=xs.filter(isAttention).length,comp=xs.filter(isCompetitor).length,top=topics[0]", "const total=xs.length,att=xs.filter(isAttention).length,top=topics[0]")
s = re.sub(r"if\(comp\)out\.push\(`Конкурентните развития формират \$\{Math\.round\(comp/total\*100\)\}% от значимите сигнали\.`\);", "", s, count=1)
s = s.replace(",comp=xs.filter(isCompetitor).length,top=topics.find", ",ext=xs.filter(s=>N(s?.scope)==='external').length,top=topics.find")
s = s.replace("card('Конкурентни',String(comp),xs.length?`${Math.round(comp/xs.length*100)}% от текущия поток`:'няма текущи сигнали')", "card('Външни',String(ext),xs.length?`${Math.round(ext/xs.length*100)}% от текущия поток`:'няма текущи сигнали')")
p.write_text(s, encoding="utf-8")


# Competition: competitor-only records and monotonic polling.
p = Path("static/navigator-competition-news-v1.js")
s = p.read_text(encoding="utf-8")
old = "function signals(){const out=[];try{const x=window.BLISIntelligenceStreamV3?.getUsefulSignals?.();if(Array.isArray(x))out.push(...x)}catch(_){}out.push(...A(D().signals),...apiRows);const seen=new Set();return out.filter(s=>{const k=signalKey(s);if(!k||seen.has(k))return false;seen.add(k);return true})}"
new = "function monotonicMerge(prev,incoming){const by=new Map();for(const s of A(prev)){if(String(s?.scope||'').toLowerCase()!=='competitor')continue;const k=signalKey(s);if(k)by.set(k,s)}for(const s of A(incoming)){if(String(s?.scope||'').toLowerCase()!=='competitor')continue;const k=signalKey(s);if(!k)continue;const old=by.get(k);if(!old||ts(s)>=ts(old))by.set(k,s)}return [...by.values()].sort((a,b)=>ts(b)-ts(a)).slice(0,500)}\nfunction signals(){const out=[];try{const x=window.BLISIntelligenceStreamV3?.getUsefulSignals?.();if(Array.isArray(x))out.push(...x.filter(s=>String(s?.scope||'').toLowerCase()==='competitor'))}catch(_){}out.push(...A(D().signals).filter(s=>String(s?.scope||'').toLowerCase()==='competitor'),...apiRows);const seen=new Set();return out.filter(s=>String(s?.scope||'').toLowerCase()==='competitor').filter(s=>{const k=signalKey(s);if(!k||seen.has(k))return false;seen.add(k);return true})}"
s = replace_once(s, old, new, "competition competitor-only source")

old = "async function syncAPI(force=false){const c=slug();if(!c||c==='kub'||apiBusy)return;if(!force&&c===apiClient&&Date.now()-apiUpdated<90000)return;apiBusy=true;try{const r=await fetch(`/api/signals?client=${encodeURIComponent(c)}&limit=300&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok)throw new Error('signal api '+r.status);const j=await r.json();const rows=A(j?.signals).filter(s=>String(s?.scope||'').toLowerCase()==='competitor'||String(s?.brand||'').trim());apiRows=rows;apiClient=c;apiUpdated=Date.now();schedule(0)}catch(e){console.warn('Competitor news sync',e)}finally{apiBusy=false}}"
new = "async function syncAPI(force=false){const c=slug();if(!c||c==='kub'||apiBusy)return;if(!force&&c===apiClient&&Date.now()-apiUpdated<45000)return;apiBusy=true;try{const r=await fetch(`/api/signals?client=${encodeURIComponent(c)}&scope=competitor&limit=300&_=${Date.now()}`,{cache:'no-store',headers:{Accept:'application/json'}});if(!r.ok)throw new Error('signal api '+r.status);const j=await r.json();const rows=A(j?.signals).filter(s=>String(s?.scope||'').toLowerCase()==='competitor');apiRows=monotonicMerge(apiClient===c?apiRows:[],rows);apiClient=c;apiUpdated=Date.now();schedule(0)}catch(e){console.warn('Competitor news sync',e)}finally{apiBusy=false}}"
s = replace_once(s, old, new, "competition scoped monotonic API")
s = replace_once(s, "setInterval(()=>syncAPI(false),180000)", "setInterval(()=>syncAPI(false),60000)", "competition live poll")
p.write_text(s, encoding="utf-8")

print("PATCH_OK")
