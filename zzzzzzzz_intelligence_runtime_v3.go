package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"sort"
	"strconv"
	"strings"
)

type intelligenceTransportV3 struct{ base http.RoundTripper }

func transportJSONV3(req *http.Request,status int,v interface{})(*http.Response,error){
	b,_:=json.Marshal(v)
	h:=make(http.Header);h.Set("Content-Type","application/json; charset=utf-8");h.Set("Cache-Control","no-store")
	return &http.Response{StatusCode:status,Status:strconv.Itoa(status)+" "+http.StatusText(status),Header:h,Body:io.NopCloser(bytes.NewReader(b)),ContentLength:int64(len(b)),Request:req},nil
}

func scopedClientV3(r *http.Request)(slug string,admin bool,ok bool){
	if isWirelloDemo(r){return "wirello",false,true}
	s,valid:=sessionFromRequest(r);if !valid{return "",false,false}
	if s.Admin{
		slug=strings.ToLower(strings.TrimSpace(r.URL.Query().Get("client")))
		if slug==""{slug="aroma"}
		mu.Lock();_,exists:=store.Clients[slug];mu.Unlock();if !exists{return "",true,false}
		return slug,true,true
	}
	return s.ClientSlug,false,s.ClientSlug!=""
}

func scopedSignalHealthV3(slug string)map[string]interface{}{
	restoreSignalsFromObservations();signalMu.RLock();rows:=append([]Signal{},signalState.Signals[slug]...);updated:=signalState.UpdatedAt;signalMu.RUnlock()
	ext,comp,owned:=0,0,0
	for _,s:=range rows{switch s.Scope{case "external":ext++;case "competitor":comp++;case "owned":owned++}}
	return map[string]interface{}{"ok":true,"updated_at":updated,"interval_minutes":10,"client":slug,"signals":len(rows),"external":ext,"competitor":comp,"owned":owned}
}

func intelligenceHealthV3(slug string,admin bool)map[string]interface{}{
	if !admin{return map[string]interface{}{"ok":true,"version":"3.0","client":slug,"analysis":buildAnalysisV3(slug)}}
	mu.Lock();slugs:=make([]string,0,len(store.Clients));for s:=range store.Clients{if s!="wirello"{slugs=append(slugs,s)}};mu.Unlock();sort.Strings(slugs)
	clients:=map[string]interface{}{};for _,s:=range slugs{a:=buildAnalysisV3(s);clients[s]=map[string]interface{}{"status":a.Status,"scores":a.Scores,"evidence_count":a.EvidenceCount,"sources":a.UniqueSources,"generated_at":a.GeneratedAt}}
	return map[string]interface{}{"ok":true,"version":"3.0","clients":clients,"client_count":len(slugs)}
}

func (t intelligenceTransportV3)RoundTrip(req *http.Request)(*http.Response,error){
	path:=req.URL.Path
	if path!="/api/signals"&&path!="/api/signals/health"&&path!="/api/signals/refresh"&&path!="/api/intelligence/analysis"&&path!="/api/intelligence/health"{return t.base.RoundTrip(req)}

	slug,admin,ok:=scopedClientV3(req)
	if !ok{return transportJSONV3(req,http.StatusUnauthorized,map[string]interface{}{"error":"Изисква се валидна BLIS сесия"})}

	if path=="/api/signals/refresh"{
		if !admin{return transportJSONV3(req,http.StatusForbidden,map[string]interface{}{"error":"Обновяването на intelligence потока е достъпно само за администратор"})}
		return t.base.RoundTrip(req)
	}
	if path=="/api/signals/health"&&!admin{return transportJSONV3(req,http.StatusOK,scopedSignalHealthV3(slug))}
	if path=="/api/intelligence/analysis"{
		if slug=="wirello"{return transportJSONV3(req,http.StatusOK,map[string]interface{}{"version":"3.0","client":"wirello","public_demo":true,"analysis_disabled":true})}
		return transportJSONV3(req,http.StatusOK,buildAnalysisV3(slug))
	}
	if path=="/api/intelligence/health"{return transportJSONV3(req,http.StatusOK,intelligenceHealthV3(slug,admin))}
	if path=="/api/signals"&&!admin{
		r2:=req.Clone(req.Context());q:=r2.URL.Query();q.Set("client",slug);r2.URL.RawQuery=q.Encode();return t.base.RoundTrip(r2)
	}
	return t.base.RoundTrip(req)
}

func injectIntelligenceAnalysisV3(body []byte)[]byte{
	if bytes.Contains(body,[]byte("navigator-intelligence-analysis-v3.js")){return body}
	tag:=[]byte(`<script src="/navigator-intelligence-analysis-v3.js?v=20260829-core3"></script>`)
	if bytes.Contains(body,[]byte("</body>")){return bytes.Replace(body,[]byte("</body>"),append(tag,[]byte("</body>")...),1)}
	return append(body,tag...)
}

func init(){
	if authProxy==nil{return}
	base:=authProxy.Transport;if base==nil{base=http.DefaultTransport};authProxy.Transport=intelligenceTransportV3{base:base}
	previous:=authProxy.ModifyResponse
	authProxy.ModifyResponse=func(resp *http.Response)error{
		if previous!=nil{if err:=previous(resp);err!=nil{return err}}
		if resp==nil||resp.Request==nil||resp.Request.URL.Path!="/dashboard.html"{return nil}
		body,err:=io.ReadAll(resp.Body);if err!=nil{return err};_ = resp.Body.Close();body=injectIntelligenceAnalysisV3(body);resp.Body=io.NopCloser(bytes.NewReader(body));resp.ContentLength=int64(len(body));resp.Header.Set("Content-Length",strconv.Itoa(len(body)));resp.Header.Del("Content-Encoding");resp.Header.Set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");return nil
	}
}
