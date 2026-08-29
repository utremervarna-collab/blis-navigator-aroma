package main

import (
	"crypto/sha1"
	"encoding/hex"
	"encoding/json"
	"html"
	"net/url"
	"regexp"
	"sort"
	"strings"
	"time"
)

type competitorPageStateV32 struct{Hash string `json:"hash"`;Text string `json:"text"`;CheckedAt string `json:"checked_at"`}
var changeScriptV32=regexp.MustCompile(`(?is)<(script|style|noscript)[^>]*>.*?</(script|style|noscript)>`)
var changeTagsV32=regexp.MustCompile(`(?is)<[^>]+>`)
var changeSpaceV32=regexp.MustCompile(`\s+`)
var changeTokenV32=regexp.MustCompile(`[\p{L}\p{N}][\p{L}\p{N}\-]{3,}`)

func normalizeCompetitorPageV32(raw string)string{
	raw=changeScriptV32.ReplaceAllString(raw," ");raw=changeTagsV32.ReplaceAllString(raw," ");raw=html.UnescapeString(raw);raw=strings.ToLower(raw);raw=changeSpaceV32.ReplaceAllString(raw," ");raw=strings.TrimSpace(raw);if len(raw)>20000{raw=raw[:20000]};return raw
}
func hashTextV32(s string)string{h:=sha1.Sum([]byte(s));return hex.EncodeToString(h[:])}
func tokenSetV32(s string)map[string]bool{m:=map[string]bool{};for _,x:=range changeTokenV32.FindAllString(strings.ToLower(s),-1){if len([]rune(x))>=5{m[x]=true}};return m}
func similarityV32(a,b string)float64{aa,bb:=tokenSetV32(a),tokenSetV32(b);if len(aa)==0&&len(bb)==0{return 1};inter,union:=0,len(aa);for x:=range bb{if aa[x]{inter++}else{union++}};if union==0{return 1};return float64(inter)/float64(union)}
func addedTermsV32(old,new string)[]string{a,b:=tokenSetV32(old),tokenSetV32(new);stop:=map[string]bool{"cookie":true,"cookies":true,"privacy":true,"policy":true,"terms":true,"contact":true,"copyright":true,"facebook":true,"instagram":true,"linkedin":true};out:=[]string{};for x:=range b{if !a[x]&&!stop[x]{out=append(out,x)}};sort.Strings(out);if len(out)>14{out=out[:14]};return out}
func changeMetricV32(key string)string{return "competitor_page_state_"+strings.ReplaceAll(strings.ToLower(key)," ","_")}
func latestPageStateV32(c *Client,key string)(competitorPageStateV32,bool){metric:=changeMetricV32(key);for i:=len(c.Observations)-1;i>=0&&i>=len(c.Observations)-5000;i--{o:=c.Observations[i];if o.SourceKey!="competitor_change_tracker"||o.MetricKey!=metric{continue};raw,ok:=o.Value.(string);if !ok{continue};var st competitorPageStateV32;if json.Unmarshal([]byte(raw),&st)==nil&&st.Hash!=""{return st,true}};return competitorPageStateV32{},false}
func savePageStateV32(c *Client,key,text string){st:=competitorPageStateV32{Hash:hashTextV32(text),Text:text,CheckedAt:nowISO()};b,_:=json.Marshal(st);add(c,"competitor_change_tracker",changeMetricV32(key),string(b),st.CheckedAt)}
func validCompetitorPageV32(raw string)bool{u,e:=url.Parse(raw);if e!=nil||u.Scheme==""||u.Host==""{return false};h:=strings.ToLower(u.Host);for _,bad:=range []string{"facebook.com","instagram.com","linkedin.com","youtube.com","tiktok.com","booking.com","tripadvisor.com"}{if strings.Contains(h,bad){return false}};return true}
func allRealClientSlugsV32()[]string{mu.Lock();defer mu.Unlock();out:=[]string{};for slug,c:=range store.Clients{if c==nil||slug=="wirello"{continue};note:=strings.ToLower(c.Note);if strings.Contains(note,"фиктив")||strings.Contains(note,"fictional"){continue};out=append(out,slug)};sort.Strings(out);return out}
func clientPtrV32(slug string)*Client{mu.Lock();defer mu.Unlock();return store.Clients[slug]}
func pageChangeSignalV32(c *Client,t competitorSignalTarget,old,new string,similarity float64)Signal{
	added:=addedTermsV32(old,new);detail:="Открита е съществена промяна в публичната страница на конкурента.";if len(added)>0{detail+=" Нови/променени термини: "+strings.Join(added,", ")+"."};topic:=signalTopic(new);if topic=="brand_mention"{topic="competition"};risk:=25.0;sent:="neutral";if s,r:=signalSentimentAndRisk(strings.Join(added," "));s=="negative"{sent=s;risk=r};finger:=signalHash(c.Slug+"|competitor-change|"+t.Key,t.URL,hashTextV32(new),detail);return Signal{ID:finger[:16],Client:c.Slug,Brand:t.Name,Source:"Competitor website",SourceType:"web",Scope:"competitor",URL:t.URL,Title:"Промяна в публичната страница на "+t.Name,Text:detail+" Сходство с предходния snapshot: "+formatScoreV3(similarity*100)+".",PublishedAt:nowISO(),DetectedAt:nowISO(),Relevance:96,Sentiment:sent,Topic:topic,RiskScore:risk,Severity:signalSeverity(risk),Fingerprint:finger}}
func runCompetitorChangeTrackerV32()map[string]int{counts:=map[string]int{};for _,slug:=range allRealClientSlugsV32(){snap:=signalClientSnapshot(slug);actual:=clientPtrV32(slug);if snap==nil||actual==nil{continue};fresh:=[]Signal{};for _,t:=range competitorSignalTargets(snap){if !validCompetitorPageV32(t.URL){continue};status,body,_,err:=timedFetch(t.URL,2*1024*1024);if err!=nil||status<200||status>=400{continue};text:=normalizeCompetitorPageV32(body);if len(text)<300{continue};old,ok:=latestPageStateV32(actual,t.Key);if !ok{savePageStateV32(actual,t.Key,text);continue};if old.Hash==hashTextV32(text){continue};sim:=similarityV32(old.Text,text);savePageStateV32(actual,t.Key,text);if sim<0.86{fresh=append(fresh,pageChangeSignalV32(snap,t,old.Text,text,sim))}}
		if len(fresh)>0{mergeSignals(slug,dedupeCompetitorSignals(fresh))};counts[slug]=len(fresh)};saveSignalStateFile();saveStore();return counts}
func init(){go func(){time.Sleep(180*time.Second);runCompetitorChangeTrackerV32();ticker:=time.NewTicker(6*time.Hour);defer ticker.Stop();for range ticker.C{runCompetitorChangeTrackerV32()}}()}
