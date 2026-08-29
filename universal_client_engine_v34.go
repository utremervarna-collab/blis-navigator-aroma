package main

import (
	"sort"
	"strings"
	"time"
)

func clientContextTermsV34(c *Client)[]string{
	seen:=map[string]bool{};out:=[]string{}
	add:=func(x string){x=strings.TrimSpace(strings.ToLower(x));if len([]rune(x))<4||seen[x]{return};seen[x]=true;out=append(out,x)}
	for _,x:=range []string{c.Name,c.Sector}{for _,p:=range strings.FieldsFunc(x,func(r rune)bool{return r=='/'||r==','||r=='-'||r=='|'}){add(p);for _,w:=range strings.Fields(p){add(w)}}}
	if len(out)>10{out=out[:10]};return out
}

func universalEngineEligibleV34()[]string{
	legacy:=map[string]bool{"aroma":true,"bolyarka":true,"astor-garden":true,"mollox":true}
	mu.Lock();defer mu.Unlock();out:=[]string{}
	for slug,c:=range store.Clients{if c==nil||legacy[slug]||slug=="wirello"{continue};note:=strings.ToLower(c.Note);if strings.Contains(note,"фиктив")||strings.Contains(note,"fictional"){continue};out=append(out,slug)}
	sort.Strings(out);return out
}

func runUniversalClientEngineV34(c *Client,createSnapshot bool)EngineStatus{
	if c==nil{return EngineStatus{Version:"3.4-universal"}}
	if c.Slug=="everbet"{return runEverbetEngine(c,createSnapshot)}
	setEngineStatus(EngineStatus{Version:"3.4-universal",Running:true,LastRun:engineSnapshot().LastRun,NextRun:time.Now().Add(24*time.Hour).Format(time.RFC3339)})
	terms:=clientContextTermsV34(c);results:=[]ConnectorResult{};ch:=make(chan ConnectorResult,len(c.Sources))
	for _,src:=range c.Sources{go func(key string){ch<-probeGenericSource(c,key,terms)}(src.Key)}
	for i:=0;i<len(c.Sources);i++{results=append(results,<-ch)}
	suc,fail:=0,0;for _,r:=range results{if r.OK{suc++}else{fail++}}
	if createSnapshot{d:=dashboard(c);c.Snapshots=append(c.Snapshots,Snapshot{CreatedAt:nowISO(),Payload:d});if len(c.Snapshots)>400{c.Snapshots=c.Snapshots[len(c.Snapshots)-400:]};if len(c.Observations)>12000{c.Observations=c.Observations[len(c.Observations)-12000:]};saveStore()}
	st:=EngineStatus{Version:"3.4-universal",Running:false,LastRun:nowISO(),NextRun:time.Now().Add(24*time.Hour).Format(time.RFC3339),Successful:suc,Failed:fail,Results:results};setEngineStatus(st);return st
}

func runUniversalClientsV34(){for _,slug:=range universalEngineEligibleV34(){c:=clientPtrV32(slug);if c!=nil{runUniversalClientEngineV34(c,true)}}}
func init(){go func(){time.Sleep(210*time.Second);runUniversalClientsV34();ticker:=time.NewTicker(24*time.Hour);defer ticker.Stop();for range ticker.C{runUniversalClientsV34()}}()}
