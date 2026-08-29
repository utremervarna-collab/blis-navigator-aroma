package main

import (
	"math"
	"sort"
	"strings"
	"time"
)

type DeepSourceV31 struct {
	Source        string  `json:"source"`
	Mentions      int     `json:"mentions"`
	New24         int     `json:"new_24h"`
	Negative      int     `json:"negative"`
	HighRisk      int     `json:"high_risk"`
	AverageRel    float64 `json:"average_relevance"`
	Impact        float64 `json:"impact"`
	Share         float64 `json:"share"`
}

type DeepNarrativeV31 struct {
	Key           string  `json:"key"`
	Topic         string  `json:"topic"`
	Sentiment     string  `json:"sentiment"`
	Scope         string  `json:"scope"`
	Mentions      int     `json:"mentions"`
	New24         int     `json:"new_24h"`
	Previous24    int     `json:"previous_24h"`
	Velocity      float64 `json:"velocity"`
	Sources       int     `json:"sources"`
	AverageRisk   float64 `json:"average_risk"`
	Confidence    float64 `json:"confidence"`
	Evidence      []IntelligenceEvidenceV3 `json:"evidence"`
}

type EarlyWarningV31 struct {
	ID          string `json:"id"`
	Level       string `json:"level"`
	Type        string `json:"type"`
	Title       string `json:"title"`
	Explanation string `json:"explanation"`
	Metric      string `json:"metric"`
	Value       float64 `json:"value"`
	Evidence    []IntelligenceEvidenceV3 `json:"evidence"`
}

func deepWindowV31(t,now time.Time)(new24,prev24,last7,prev7 bool){
	if t.IsZero(){return};age:=now.Sub(t);if age<0{return}
	new24=age<24*time.Hour;prev24=age>=24*time.Hour&&age<48*time.Hour;last7=age<7*24*time.Hour;prev7=age>=7*24*time.Hour&&age<14*24*time.Hour;return
}

func deepSourcesV31(rows []Signal,now time.Time)[]DeepSourceV31{
	type a struct{n,new24,neg,high int;rel float64}
	m:=map[string]*a{}
	for _,s:=range rows{key:=strings.TrimSpace(s.Source);if key==""{key="Неидентифициран източник"};x:=m[key];if x==nil{x=&a{};m[key]=x};x.n++;x.rel+=s.Relevance;if s.Sentiment=="negative"{x.neg++};if s.Severity=="high"||s.Severity=="critical"{x.high++};n,_,_,_:=deepWindowV31(analysisSignalTimeV3(s),now);if n{x.new24++}}
	den:=math.Max(1,float64(len(rows)));out:=[]DeepSourceV31{}
	for k,x:=range m{avg:=0.0;if x.n>0{avg=x.rel/float64(x.n)};share:=float64(x.n)/den*100;impact:=clampV3(avg*.45+float64(x.n)*2.2+float64(x.high)*11+float64(x.neg)*3);out=append(out,DeepSourceV31{Source:k,Mentions:x.n,New24:x.new24,Negative:x.neg,HighRisk:x.high,AverageRel:clampV3(avg),Impact:impact,Share:clampV3(share)})}
	sort.SliceStable(out,func(i,j int)bool{if out[i].Impact!=out[j].Impact{return out[i].Impact>out[j].Impact};return out[i].Mentions>out[j].Mentions});if len(out)>12{out=out[:12]};return out
}

func deepNarrativesV31(rows []Signal,now time.Time)[]DeepNarrativeV31{
	type a struct{n,n24,p24 int;risk float64;src map[string]bool;rows []Signal}
	m:=map[string]*a{}
	for _,s:=range rows{topic:=s.Topic;if topic==""{topic="other"};sent:=s.Sentiment;if sent==""{sent="neutral"};scope:=s.Scope;if scope==""{scope="external"};key:=topic+"|"+sent+"|"+scope;x:=m[key];if x==nil{x=&a{src:map[string]bool{}};m[key]=x};x.n++;x.risk+=s.RiskScore;x.rows=append(x.rows,s);if s.Source!=""{x.src[strings.ToLower(s.Source)]=true};n,p,_,_:=deepWindowV31(analysisSignalTimeV3(s),now);if n{x.n24++};if p{x.p24++}}
	out:=[]DeepNarrativeV31{}
	for k,x:=range m{parts:=strings.Split(k,"|");avg:=0.0;if x.n>0{avg=x.risk/float64(x.n)};velocity:=pctChangeV3(x.n24,x.p24);conf:=clampV3(25+math.Min(35,float64(x.n)*5)+math.Min(25,float64(len(x.src))*6)+math.Min(15,float64(x.n24)*4));out=append(out,DeepNarrativeV31{Key:k,Topic:parts[0],Sentiment:parts[1],Scope:parts[2],Mentions:x.n,New24:x.n24,Previous24:x.p24,Velocity:velocity,Sources:len(x.src),AverageRisk:clampV3(avg),Confidence:conf,Evidence:topEvidenceV3(x.rows,4)})}
	sort.SliceStable(out,func(i,j int)bool{si:=float64(out[i].New24)*10+math.Max(0,out[i].Velocity)+out[i].AverageRisk*.25;sj:=float64(out[j].New24)*10+math.Max(0,out[j].Velocity)+out[j].AverageRisk*.25;if si!=sj{return si>sj};return out[i].Mentions>out[j].Mentions});if len(out)>10{out=out[:10]};return out
}

func deepWarningsV31(rows []Signal,sources []DeepSourceV31,narratives []DeepNarrativeV31,now time.Time)[]EarlyWarningV31{
	warn:=[]EarlyWarningV31{};new24,prev24:=0,0;neg24,negPrev,crit24,comp24:=0,0,0,0;recent:=[]Signal{};negRows:=[]Signal{};compRows:=[]Signal{}
	for _,s:=range rows{n,p,_,_:=deepWindowV31(analysisSignalTimeV3(s),now);if n{new24++;recent=append(recent,s);if s.Sentiment=="negative"{neg24++;negRows=append(negRows,s)};if s.Severity=="critical"{crit24++};if s.Scope=="competitor"{comp24++;compRows=append(compRows,s)}};if p{prev24++;if s.Sentiment=="negative"{negPrev++}}}
	if crit24>0{warn=append(warn,EarlyWarningV31{ID:"critical-evidence",Level:"critical",Type:"risk",Title:"Критичен сигнал в последните 24 часа",Explanation:"Има поне един нов сигнал с критична рискова тежест. Това е достатъчно условие за незабавно аналитично проследяване на темата и разпространението ѝ.",Metric:"critical_24h",Value:float64(crit24),Evidence:topEvidenceV3(recent,4)})}
	if new24>=4&&(prev24==0||float64(new24)>=float64(prev24)*2){warn=append(warn,EarlyWarningV31{ID:"volume-spike",Level:"high",Type:"anomaly",Title:"Рязък скок на информационната активност",Explanation:"Новите сигнали са поне два пъти повече от предходния сравним 24-часов период. Това маркира промяна в информационната среда, а не просто висок абсолютен обем.",Metric:"signal_change_pct",Value:pctChangeV3(new24,prev24),Evidence:topEvidenceV3(recent,4)})}
	negShare:=0.0;prevNegShare:=0.0;if new24>0{negShare=float64(neg24)/float64(new24)*100};if prev24>0{prevNegShare=float64(negPrev)/float64(prev24)*100};if neg24>=2&&negShare-prevNegShare>=15{warn=append(warn,EarlyWarningV31{ID:"sentiment-erosion",Level:"high",Type:"reputation",Title:"Ускоряване на негативния контекст",Explanation:"Негативният дял в последните 24 часа е нараснал с поне 15 процентни пункта спрямо предходния период.",Metric:"negative_share_change_pp",Value:math.Round((negShare-prevNegShare)*10)/10,Evidence:topEvidenceV3(negRows,4)})}
	if comp24>=3{warn=append(warn,EarlyWarningV31{ID:"competitor-surge",Level:"medium",Type:"competition",Title:"Засилена конкурентна активност",Explanation:"За последните 24 часа е отчетена концентрация на конкурентни сигнали. Необходимо е да се разграничат продуктови, ценови, комуникационни и репутационни движения.",Metric:"competitor_signals_24h",Value:float64(comp24),Evidence:topEvidenceV3(compRows,4)})}
	if len(sources)>0&&sources[0].Share>=55&&len(rows)>=6{warn=append(warn,EarlyWarningV31{ID:"source-concentration",Level:"medium",Type:"data_quality",Title:"Висока концентрация в един източник",Explanation:"Над половината от доказателствения поток идва от един източник. Navigator понижава увереността в изводите, докато темата не бъде потвърдена независимо.",Metric:"top_source_share",Value:sources[0].Share,Evidence:topEvidenceV3(rows,3)})}
	for _,n:=range narratives{if n.New24>=2&&n.Velocity>=150&&n.Sources>=2{warn=append(warn,EarlyWarningV31{ID:"narrative-"+n.Key,Level:"medium",Type:"narrative",Title:"Бързо възникващ наратив: "+topicLabelV3(n.Topic),Explanation:"Една и съща тематична линия се ускорява едновременно в повече от един източник. Това е по-надежден ранен индикатор от единично споменаване.",Metric:"narrative_velocity",Value:n.Velocity,Evidence:n.Evidence});break}}
	order:=map[string]int{"critical":0,"high":1,"medium":2,"low":3};sort.SliceStable(warn,func(i,j int)bool{return order[warn[i].Level]<order[warn[j].Level]});return warn
}

func buildDeepAnalysisV31(slug string)map[string]interface{}{
	now:=time.Now();rows:=analysisSignalsForClientV3(slug);sources:=deepSourcesV31(rows,now);narr:=deepNarrativesV31(rows,now);warnings:=deepWarningsV31(rows,sources,narr,now)
	last7,prev7,neg7,negPrev7,comp7:=0,0,0,0,0;dated:=0
	for _,s:=range rows{t:=analysisSignalTimeV3(s);if !t.IsZero(){dated++};_,_,l,p:=deepWindowV31(t,now);if l{last7++;if s.Sentiment=="negative"{neg7++};if s.Scope=="competitor"{comp7++}};if p{prev7++;if s.Sentiment=="negative"{negPrev7++}}}
	dateCoverage:=0.0;if len(rows)>0{dateCoverage=float64(dated)/float64(len(rows))*100}
	concentration:=0.0;if len(sources)>0{concentration=sources[0].Share}
	quality:=clampV3(100-concentration*.35+math.Min(25,float64(len(sources))*2)+dateCoverage*.2)
	return map[string]interface{}{
		"version":"3.1","client":slug,"generated_at":nowISO(),"sources":sources,"narratives":narr,"early_warnings":warnings,
		"history":map[string]interface{}{"last_7d":last7,"previous_7d":prev7,"change_pct":pctChangeV3(last7,prev7),"negative_7d":neg7,"negative_previous_7d":negPrev7,"competitor_7d":comp7},
		"quality":map[string]interface{}{"evidence_quality":quality,"publication_or_detection_time_coverage":clampV3(dateCoverage),"top_source_concentration":concentration,"source_count":len(sources)},
		"capabilities":[]string{"anomaly_detection","narrative_velocity","source_impact","sentiment_shift","crisis_early_warning","competitor_surge","historical_comparison","evidence_quality"},
	}
}
