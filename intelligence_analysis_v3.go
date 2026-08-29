package main

import (
	"math"
	"sort"
	"strings"
	"time"
)

// IntelligenceAnalysisV3 converts collected evidence into client-level analysis.
// Every conclusion is derived from stored signals and exposes the evidence used.
type IntelligenceEvidenceV3 struct {
	ID          string  `json:"id"`
	Title       string  `json:"title"`
	Source      string  `json:"source"`
	URL         string  `json:"url"`
	Scope       string  `json:"scope"`
	Topic       string  `json:"topic"`
	Sentiment   string  `json:"sentiment"`
	Severity    string  `json:"severity"`
	Relevance   float64 `json:"relevance"`
	RiskScore   float64 `json:"risk_score"`
	PublishedAt string  `json:"published_at,omitempty"`
	DetectedAt  string  `json:"detected_at"`
}

type IntelligenceInsightV3 struct {
	ID            string                   `json:"id"`
	Category      string                   `json:"category"`
	Priority      string                   `json:"priority"`
	Direction     string                   `json:"direction"`
	Title         string                   `json:"title"`
	Finding       string                   `json:"finding"`
	WhyItMatters  string                   `json:"why_it_matters"`
	WatchNext     string                   `json:"watch_next"`
	Confidence    float64                  `json:"confidence"`
	Evidence      []IntelligenceEvidenceV3 `json:"evidence"`
}

type IntelligenceTopicV3 struct {
	Topic            string  `json:"topic"`
	Mentions         int     `json:"mentions"`
	New24            int     `json:"new_24h"`
	Previous24       int     `json:"previous_24h"`
	ChangePct        float64 `json:"change_pct"`
	Negative         int     `json:"negative"`
	Positive         int     `json:"positive"`
	HighRisk         int     `json:"high_risk"`
	AverageRelevance float64 `json:"average_relevance"`
}

type IntelligenceCompetitorV3 struct {
	Name         string  `json:"name"`
	Mentions     int     `json:"mentions"`
	New24        int     `json:"new_24h"`
	Previous24   int     `json:"previous_24h"`
	ChangePct    float64 `json:"change_pct"`
	Negative     int     `json:"negative"`
	HighRisk     int     `json:"high_risk"`
	ShareOfVoice float64 `json:"share_of_voice"`
	Pressure     float64 `json:"pressure"`
}

type IntelligenceAnalysisV3 struct {
	Version             string                       `json:"version"`
	Client              string                       `json:"client"`
	ClientName          string                       `json:"client_name"`
	Sector              string                       `json:"sector"`
	GeneratedAt         string                       `json:"generated_at"`
	Summary             string                       `json:"summary"`
	Status              string                       `json:"status"`
	Scores              map[string]float64           `json:"scores"`
	Activity            map[string]interface{}       `json:"activity"`
	Baseline            map[string]interface{}       `json:"baseline"`
	Topics              []IntelligenceTopicV3        `json:"topics"`
	Competitors         []IntelligenceCompetitorV3   `json:"competitors"`
	Insights            []IntelligenceInsightV3      `json:"insights"`
	EvidenceCount       int                          `json:"evidence_count"`
	UniqueSources       int                          `json:"unique_sources"`
	HistoricalDepthHour float64                      `json:"historical_depth_hours"`
	Method              map[string]interface{}       `json:"method"`
}

func analysisSignalTimeV3(s Signal) time.Time {
	values := []string{s.PublishedAt, s.DetectedAt}
	layouts := []string{time.RFC3339, time.RFC3339Nano, time.RFC1123Z, time.RFC1123, time.RFC822Z, time.RFC822, "Mon, 02 Jan 2006 15:04:05 MST"}
	for _, raw := range values {
		raw = strings.TrimSpace(raw)
		if raw == "" {
			continue
		}
		for _, layout := range layouts {
			if t, err := time.Parse(layout, raw); err == nil {
				return t
			}
		}
	}
	return time.Time{}
}

func clampV3(v float64) float64 {
	if v < 0 { return 0 }
	if v > 100 { return 100 }
	return math.Round(v*10) / 10
}

func pctChangeV3(now, prev int) float64 {
	if prev <= 0 {
		if now <= 0 { return 0 }
		return 100
	}
	return math.Round(((float64(now-prev)/float64(prev))*100)*10) / 10
}

func evidenceV3(s Signal) IntelligenceEvidenceV3 {
	return IntelligenceEvidenceV3{ID:s.ID, Title:s.Title, Source:s.Source, URL:s.URL, Scope:s.Scope, Topic:s.Topic, Sentiment:s.Sentiment, Severity:s.Severity, Relevance:s.Relevance, RiskScore:s.RiskScore, PublishedAt:s.PublishedAt, DetectedAt:s.DetectedAt}
}

func topEvidenceV3(rows []Signal, n int) []IntelligenceEvidenceV3 {
	cp := append([]Signal{}, rows...)
	sort.SliceStable(cp, func(i,j int) bool {
		if cp[i].RiskScore != cp[j].RiskScore { return cp[i].RiskScore > cp[j].RiskScore }
		if cp[i].Relevance != cp[j].Relevance { return cp[i].Relevance > cp[j].Relevance }
		return analysisSignalTimeV3(cp[i]).After(analysisSignalTimeV3(cp[j]))
	})
	if len(cp) > n { cp = cp[:n] }
	out := make([]IntelligenceEvidenceV3,0,len(cp))
	for _, s := range cp { out = append(out,evidenceV3(s)) }
	return out
}

func analysisSignalsForClientV3(slug string) []Signal {
	restoreSignalsFromObservations()
	signalMu.RLock()
	rows := append([]Signal{}, signalState.Signals[slug]...)
	signalMu.RUnlock()
	return rows
}

func analysisClientCopyV3(slug string) *Client {
	mu.Lock()
	defer mu.Unlock()
	c := store.Clients[slug]
	if c == nil { return nil }
	cc := *c
	cc.Sources = append([]Source{}, c.Sources...)
	cc.Observations = append([]Observation{}, c.Observations...)
	cc.Snapshots = append([]Snapshot{}, c.Snapshots...)
	return &cc
}

func analysisStatusV3(rep, risk, pressure float64) string {
	switch {
	case risk >= 70: return "Критичен риск"
	case rep < 40: return "Уязвима репутация"
	case pressure >= 70: return "Силен конкурентен натиск"
	case risk >= 50: return "Повишено внимание"
	case rep >= 75 && risk < 35: return "Стабилна позиция"
	default: return "Нормална динамика"
	}
}

func topicLabelV3(t string) string {
	switch t {
	case "regulatory": return "Регулаторна среда"
	case "reputation": return "Репутация"
	case "competition": return "Конкуренция"
	case "product": return "Продукт"
	case "commercial": return "Търговска активност"
	case "brand_mention": return "Бранд присъствие"
	default: return "Други"
	}
}

func buildTopicAnalyticsV3(rows []Signal, now time.Time) []IntelligenceTopicV3 {
	type agg struct{ all,new24,prev24,neg,pos,high int; rel float64 }
	m := map[string]*agg{}
	for _, s := range rows {
		t := s.Topic; if t=="" { t="other" }
		a := m[t]; if a==nil { a=&agg{}; m[t]=a }
		a.all++; a.rel += s.Relevance
		if s.Sentiment=="negative" { a.neg++ }; if s.Sentiment=="positive" { a.pos++ }
		if s.Severity=="high" || s.Severity=="critical" { a.high++ }
		st := analysisSignalTimeV3(s)
		if !st.IsZero() {
			age := now.Sub(st)
			if age >= 0 && age < 24*time.Hour { a.new24++ } else if age >= 24*time.Hour && age < 48*time.Hour { a.prev24++ }
		}
	}
	out := make([]IntelligenceTopicV3,0,len(m))
	for k,a := range m {
		avg := 0.0; if a.all>0 { avg=a.rel/float64(a.all) }
		out=append(out,IntelligenceTopicV3{Topic:k,Mentions:a.all,New24:a.new24,Previous24:a.prev24,ChangePct:pctChangeV3(a.new24,a.prev24),Negative:a.neg,Positive:a.pos,HighRisk:a.high,AverageRelevance:clampV3(avg)})
	}
	sort.SliceStable(out,func(i,j int)bool{
		if out[i].New24!=out[j].New24{return out[i].New24>out[j].New24}
		return out[i].Mentions>out[j].Mentions
	})
	return out
}

func buildCompetitorAnalyticsV3(rows []Signal, brandCount int, now time.Time) []IntelligenceCompetitorV3 {
	type agg struct{ all,new24,prev24,neg,high int; risk float64 }
	m:=map[string]*agg{}
	totalComp:=0
	for _,s:=range rows {
		if s.Scope!="competitor" { continue }
		name:=strings.TrimSpace(s.Brand); if name=="" { name="Конкурент" }
		a:=m[name]; if a==nil {a=&agg{};m[name]=a}
		a.all++; totalComp++; a.risk+=s.RiskScore
		if s.Sentiment=="negative"{a.neg++};if s.Severity=="high"||s.Severity=="critical"{a.high++}
		st:=analysisSignalTimeV3(s);if !st.IsZero(){age:=now.Sub(st);if age>=0&&age<24*time.Hour{a.new24++}else if age>=24*time.Hour&&age<48*time.Hour{a.prev24++}}
	}
	den:=float64(brandCount+totalComp);if den<1{den=1}
	out:=make([]IntelligenceCompetitorV3,0,len(m))
	for name,a:=range m{
		avgRisk:=0.0;if a.all>0{avgRisk=a.risk/float64(a.all)}
		share:=float64(a.all)/den*100
		pressure:=clampV3(share*.65+math.Min(35,float64(a.new24)*7)+avgRisk*.18)
		out=append(out,IntelligenceCompetitorV3{Name:name,Mentions:a.all,New24:a.new24,Previous24:a.prev24,ChangePct:pctChangeV3(a.new24,a.prev24),Negative:a.neg,HighRisk:a.high,ShareOfVoice:clampV3(share),Pressure:pressure})
	}
	sort.SliceStable(out,func(i,j int)bool{if out[i].Pressure!=out[j].Pressure{return out[i].Pressure>out[j].Pressure};return out[i].Mentions>out[j].Mentions})
	return out
}

func buildAnalysisV3(slug string) IntelligenceAnalysisV3 {
	now:=time.Now()
	c:=analysisClientCopyV3(slug)
	if c==nil{return IntelligenceAnalysisV3{Version:"3.0",Client:slug,GeneratedAt:nowISO(),Status:"Няма клиентски профил",Scores:map[string]float64{},Method:map[string]interface{}{"evidence_based":true}}}
	rows:=analysisSignalsForClientV3(slug)
	brandRows:=[]Signal{};compRows:=[]Signal{}
	new24,prev24,neg,pos,high:=0,0,0,0,0
	unique:=map[string]bool{};riskSum,maxRisk,relSum:=0.0,0.0,0.0
	oldest:=now
	for _,s:=range rows{
		if s.Scope=="competitor"{compRows=append(compRows,s)}else{brandRows=append(brandRows,s)}
		key:=strings.ToLower(strings.TrimSpace(s.Source));if key==""{key=strings.ToLower(strings.TrimSpace(s.URL))};if key!=""{unique[key]=true}
		if s.Sentiment=="negative"{neg++};if s.Sentiment=="positive"{pos++};if s.Severity=="high"||s.Severity=="critical"{high++}
		riskSum+=s.RiskScore;relSum+=s.Relevance;if s.RiskScore>maxRisk{maxRisk=s.RiskScore}
		st:=analysisSignalTimeV3(s);if !st.IsZero(){if st.Before(oldest){oldest=st};age:=now.Sub(st);if age>=0&&age<24*time.Hour{new24++}else if age>=24*time.Hour&&age<48*time.Hour{prev24++}}
	}
	total:=len(rows);avgRisk,avgRel:=0.0,0.0;if total>0{avgRisk=riskSum/float64(total);avgRel=relSum/float64(total)}
	negShare,posShare:=0.0,0.0;if total>0{negShare=float64(neg)/float64(total)*100;posShare=float64(pos)/float64(total)*100}
	spike:=0.0;if prev24>0{spike=math.Max(0,float64(new24-prev24)/float64(prev24)*100)}else if new24>=3{spike=100}
	reputation:=clampV3(72+posShare*.22-negShare*.48-float64(high)*2.4)
	risk:=clampV3(maxRisk*.42+avgRisk*.28+negShare*.22+math.Min(100,spike)*.08)
	competitors:=buildCompetitorAnalyticsV3(rows,len(brandRows),now)
	pressure:=0.0;if len(competitors)>0{pressure=competitors[0].Pressure}
	momentum:=clampV3(50+math.Max(-50,math.Min(50,float64(new24-prev24)*10)))
	confidence:=clampV3(18+math.Min(28,float64(total)*1.4)+math.Min(24,float64(len(unique))*3)+math.Min(18,float64(new24)*3)+avgRel*.12)
	opportunity:=clampV3(35+posShare*.3+math.Min(25,float64(new24)*3)+math.Max(0,65-pressure)*.15-math.Max(0,risk-55)*.2)

	topics:=buildTopicAnalyticsV3(rows,now)
	insights:=[]IntelligenceInsightV3{}
	add:=func(in IntelligenceInsightV3){if len(insights)<10{insights=append(insights,in)}}

	if high>0 || risk>=55 {
		cand:=[]Signal{};for _,s:=range rows{if s.Severity=="high"||s.Severity=="critical"||s.RiskScore>=60{cand=append(cand,s)}}
		add(IntelligenceInsightV3{ID:"risk",Category:"risk",Priority:func()string{if risk>=70{return "critical"};return "high"}(),Direction:"negative",Title:"Повишен рисков сигнал",Finding:"Открити са сигнали с висока тежест или концентрация на отрицателен контекст.",WhyItMatters:"Комбинацията от тежест, отрицателност и честота увеличава вероятността единичен информационен сигнал да се превърне в по-широк репутационен или пазарен проблем.",WatchNext:"Следете дали същата тема се появява в нови независими източници и дали негативният дял нараства.",Confidence:confidence,Evidence:topEvidenceV3(cand,4)})
	}
	if new24>=3 && (prev24==0 || float64(new24)>=float64(prev24)*1.8) {
		cand:=[]Signal{};for _,s:=range rows{st:=analysisSignalTimeV3(s);if !st.IsZero()&&now.Sub(st)>=0&&now.Sub(st)<24*time.Hour{cand=append(cand,s)}}
		add(IntelligenceInsightV3{ID:"activity-spike",Category:"anomaly",Priority:"high",Direction:"change",Title:"Аномалия в информационната активност",Finding:"Обемът на новите сигнали за последните 24 часа е значително над предходния сравним период.",WhyItMatters:"Рязката промяна в обема често е по-информативна от абсолютния брой споменавания и може да маркира нова тема, кампания, инцидент или конкурентно движение.",WatchNext:"Проследете дали ускорението се запазва и кои теми и източници го формират.",Confidence:confidence,Evidence:topEvidenceV3(cand,4)})
	}
	if len(competitors)>0 && pressure>=45 {
		lead:=competitors[0];cand:=[]Signal{};for _,s:=range compRows{if strings.EqualFold(strings.TrimSpace(s.Brand),lead.Name){cand=append(cand,s)}}
		add(IntelligenceInsightV3{ID:"competition",Category:"competition",Priority:func()string{if pressure>=70{return "high"};return "medium"}(),Direction:"competitive",Title:"Конкурентният натиск се концентрира около "+lead.Name,Finding:"Този конкурент има най-висока комбинирана тежест по обем, актуалност и риск в наблюдавания поток.",WhyItMatters:"Концентрацията на конкурентни сигнали показва къде пазарната среда се променя най-бързо и къде сравнителната позиция на клиента трябва да се следи по-внимателно.",WatchNext:"Следете нови продуктови, ценови, комуникационни и репутационни движения на този конкурент.",Confidence:confidence,Evidence:topEvidenceV3(cand,4)})
	}
	if negShare>=25 {
		cand:=[]Signal{};for _,s:=range brandRows{if s.Sentiment=="negative"{cand=append(cand,s)}}
		add(IntelligenceInsightV3{ID:"reputation",Category:"reputation",Priority:func()string{if reputation<45{return "high"};return "medium"}(),Direction:"negative",Title:"Отрицателният контекст влияе върху репутационния профил",Finding:"Делът на негативно класифицираните сигнали е достатъчно висок, за да влияе осезаемо върху общата репутационна оценка.",WhyItMatters:"Не е важен само броят на негативните споменавания, а дали те се повтарят по една тема и се разпространяват през независими източници.",WatchNext:"Следете повторяемите негативни теми, източниците с най-голяма тежест и дали се появява нова аудитория около тях.",Confidence:confidence,Evidence:topEvidenceV3(cand,4)})
	}
	for _,t:=range topics{
		if t.New24>=2 && t.ChangePct>=100 {
			cand:=[]Signal{};for _,s:=range rows{if s.Topic==t.Topic{cand=append(cand,s)}}
			add(IntelligenceInsightV3{ID:"topic-"+t.Topic,Category:"trend",Priority:"medium",Direction:"up",Title:"Ускорение по тема: "+topicLabelV3(t.Topic),Finding:"Темата нараства спрямо предходния 24-часов период.",WhyItMatters:"Ръстът по конкретна тема позволява да се различи реална промяна в средата от общ шум в броя споменавания.",WatchNext:"Следете дали ръстът се подкрепя от повече независими източници и дали тонът се променя.",Confidence:confidence,Evidence:topEvidenceV3(cand,3)});break
		}
	}
	if posShare>=30 && risk<45 {
		cand:=[]Signal{};for _,s:=range brandRows{if s.Sentiment=="positive"{cand=append(cand,s)}}
		add(IntelligenceInsightV3{ID:"positive",Category:"opportunity",Priority:"medium",Direction:"positive",Title:"Положителна информационна инерция",Finding:"Положителните сигнали имат значим дял при относително нисък текущ риск.",WhyItMatters:"Положителният контекст е по-ценен, когато е разпределен между независими източници и се задържа във времето.",WatchNext:"Следете кои теми създават положителния ефект и дали той се запазва в следващите периоди.",Confidence:confidence,Evidence:topEvidenceV3(cand,4)})
	}
	if total<8 || len(unique)<3 {
		add(IntelligenceInsightV3{ID:"coverage",Category:"data_quality",Priority:"medium",Direction:"neutral",Title:"Недостатъчна доказателствена база за твърд извод",Finding:"Наличните сигнали или разнообразието от източници все още са ограничени.",WhyItMatters:"Анализ с малка база може да надцени единични публикации. Navigator маркира това вместо да представя несигурен извод като факт.",WatchNext:"Необходима е по-голяма историческа дълбочина и повече независими източници.",Confidence:confidence,Evidence:topEvidenceV3(rows,3)})
	}

	d:=dashboard(c)
	baseline:=map[string]interface{}{"blis_index":d["blis_index"],"benchmark":d["benchmark"],"trend":d["trend"],"confidence":d["confidence"],"data_quality":dataQuality(c)}
	status:=analysisStatusV3(reputation,risk,pressure)
	summary:="За "+c.Name+" Navigator открива "+strconvItoaV3(total)+" проверими сигнала от "+strconvItoaV3(len(unique))+" източника. Репутационната оценка е "+formatScoreV3(reputation)+", рискът "+formatScoreV3(risk)+", а конкурентният натиск "+formatScoreV3(pressure)+". За последните 24 часа са регистрирани "+strconvItoaV3(new24)+" нови сигнала спрямо "+strconvItoaV3(prev24)+" в предходния сравним период."
	depth:=0.0;if total>0 && oldest.Before(now){depth=math.Round(now.Sub(oldest).Hours()*10)/10}
	return IntelligenceAnalysisV3{Version:"3.0",Client:c.Slug,ClientName:c.Name,Sector:c.Sector,GeneratedAt:nowISO(),Summary:summary,Status:status,Scores:map[string]float64{"reputation":reputation,"risk":risk,"competitive_pressure":pressure,"momentum":momentum,"opportunity":opportunity,"confidence":confidence},Activity:map[string]interface{}{"signals_total":total,"brand_signals":len(brandRows),"competitor_signals":len(compRows),"new_24h":new24,"previous_24h":prev24,"change_pct":pctChangeV3(new24,prev24),"negative":neg,"positive":pos,"high_risk":high,"negative_share":clampV3(negShare),"positive_share":clampV3(posShare)},Baseline:baseline,Topics:topics,Competitors:competitors,Insights:insights,EvidenceCount:total,UniqueSources:len(unique),HistoricalDepthHour:depth,Method:map[string]interface{}{"evidence_based":true,"windows":[]string{"0-24h","24-48h","historical"},"publication_time_preferred":true,"detection_time_fallback":true,"risk_inputs":[]string{"severity","maximum risk","average risk","negative share","activity anomaly"},"reputation_inputs":[]string{"positive share","negative share","high-risk evidence"},"competitive_inputs":[]string{"share of voice","freshness","risk","volume"}}}
}

func strconvItoaV3(n int) string {
	if n==0{return "0"};digits:="";for n>0{digits=string(rune('0'+n%10))+digits;n/=10};return digits
}

func formatScoreV3(v float64) string {
	iv:=int(math.Round(v));return strconvItoaV3(iv)+"/100"
}

// Extended collection automatically enables real signal collection for all
// non-fictional client profiles added to the live store, without a hard-coded
// rollout list. Core clients remain handled by the original collector.
func dynamicClientSlugsV3() []string {
	legacy:=map[string]bool{"aroma":true,"bolyarka":true,"mollox":true,"varna-towers":true}
	mu.Lock();defer mu.Unlock()
	out:=[]string{}
	for slug,c:=range store.Clients{
		if c==nil||legacy[slug]||slug=="wirello"||strings.Contains(strings.ToLower(c.Note),"фиктив")||strings.Contains(strings.ToLower(c.Note),"fictional"){continue}
		out=append(out,slug)
	}
	sort.Strings(out);return out
}

func dynamicSectorHitV3(c *Client,s Signal) bool {
	if c==nil{return false};low:=strings.ToLower(s.Title+" "+s.Text);sector:=strings.ToLower(c.Sector)
	terms:=[]string{}
	for _,p:=range strings.FieldsFunc(sector,func(r rune)bool{return r=='/'||r==','||r=='-'||r==' '}){p=strings.TrimSpace(p);if len([]rune(p))>=5{terms=append(terms,p)}}
	for _,t:=range terms{if strings.Contains(low,t){return true}}
	return len(terms)==0
}

func runDynamicCollectionV3() {
	for _,slug:=range dynamicClientSlugsV3(){
		c:=signalClientSnapshot(slug);if c==nil{continue}
		fresh:=collectClientSignals(c);if len(fresh)>0{mergeSignals(slug,fresh)}
		allComp:=[]Signal{}
		for _,target:=range competitorSignalTargets(c){
			rows:=append(collectCompetitorNews(c,target),collectCompetitorWeb(c,target)...)
			rows=append(rows,collectCompetitorSocial(c,target)...)
			for _,s:=range dedupeCompetitorSignals(rows){if s.Relevance>=85||dynamicSectorHitV3(c,s){if s.Relevance<85{s.Relevance=85};allComp=append(allComp,s)}}
		}
		if len(allComp)>0{mergeSignals(slug,dedupeCompetitorSignals(allComp))}
	}
	saveSignalStateFile();saveStore()
}

func init(){
	go func(){time.Sleep(140*time.Second);runDynamicCollectionV3();ticker:=time.NewTicker(10*time.Minute);defer ticker.Stop();for range ticker.C{runDynamicCollectionV3()}}()
}
