package main

import (
 "encoding/json"
 "net/http"
 "net/http/httptest"
 "strings"
 "testing"
)

func TestICardPresentationRoutes(t *testing.T) {
 for _, path := range []string{"/icard", "/icard/", "/icard/data", "/icard/style.css", "/icard/app.js", "/icard/report", "/icard/monitoring", "/icard/digital", "/icard/market", "/icard/competition", "/icard/trust", "/icard/niches", "/icard/reports", "/icard/sources"} {
  for _, method := range []string{http.MethodGet, http.MethodHead} {
   req:=httptest.NewRequest(method,path,nil)
   req.AddCookie(&http.Cookie{Name:topRentScopeCookieName,Value:"top-rent-a-car"})
   rec:=httptest.NewRecorder();navigatorGateway(rec,req)
   if rec.Code!=200 { t.Fatalf("%s %s: %d",method,path,rec.Code) }
   if rec.Header().Get("X-BLIS-ICard-Version")!="icard-market-v3-20261010" { t.Fatalf("wrong version on %s",path) }
   if method==http.MethodHead && rec.Body.Len()!=0 {t.Fatal("HEAD returned a body")}
  }
 }
 for _,path:=range []string{"/icard/prepare","/icard/prospects","/icard/growth"} {
  rec:=httptest.NewRecorder();serveICardPublic(rec,httptest.NewRequest("GET",path,nil))
  if rec.Code!=302 || rec.Header().Get("Location")!="/icard/niches" {t.Fatalf("retired page remains: %s",path)}
 }
 rec:=httptest.NewRecorder();serveICardPublic(rec,httptest.NewRequest(http.MethodPost,"/icard/data",nil))
 if rec.Code!=405 {t.Fatalf("write accepted: %d",rec.Code)}
 rec=httptest.NewRecorder();serveICardPublic(rec,httptest.NewRequest("GET","/icard/report?download=1",nil))
 if !strings.Contains(rec.Header().Get("Content-Disposition"),"attachment") {t.Fatal("report download missing")}
 if serveICardPublic(httptest.NewRecorder(),httptest.NewRequest("GET","/aroma",nil)) {t.Fatal("another client intercepted")}
}

func TestICardSnapshotIntegrity(t *testing.T) {
 b,err:=staticFS.ReadFile("static/icard-commercial-data.json");if err!=nil {t.Fatal(err)}
 var d struct {
  Niches []struct {ID string `json:"id"`;Products []string `json:"products"`;Conditional []string `json:"conditional_products"`;Evidence []string `json:"evidence_ids"`;Limits string `json:"limits"`} `json:"niches"`
  Products []struct {ID string `json:"id"`} `json:"products"`
  Sources []struct {ID string `json:"id"`;URL string `json:"url"`} `json:"sources"`
  Market struct {Tourism struct {Nights int `json:"nights"`;Foreign int `json:"foreign_nights"`;Establishments int `json:"establishments"`;Regions []struct {Nights int `json:"nights"`;Foreign int `json:"foreign_nights"`;Establishments int `json:"establishments"`} `json:"regions"`} `json:"tourism"`} `json:"market"`
  Trust struct {Reviews []struct {Stars int `json:"stars"`;SourceURL string `json:"source_url"`} `json:"reviews"`;History interface{} `json:"history"`} `json:"trust"`
 }
 if err=json.Unmarshal(b,&d);err!=nil {t.Fatal(err)}
 if len(d.Niches)!=8||len(d.Products)!=6||len(d.Trust.Reviews)!=8 {t.Fatal("unexpected reviewed population")}
 products:=map[string]bool{};sources:=map[string]bool{};ids:=map[string]bool{}
 for _,p:=range d.Products {products[p.ID]=true};for _,s:=range d.Sources {if !strings.HasPrefix(s.URL,"https://") {t.Fatal("invalid evidence URL")};sources[s.ID]=true}
 for _,n:=range d.Niches {
  if n.ID==""||ids[n.ID]||len(n.Evidence)==0||len(n.Products)==0||n.Limits=="" {t.Fatal("incomplete or duplicate niche")};ids[n.ID]=true
  primary:=map[string]bool{};for _,p:=range n.Products {if !products[p]||primary[p] {t.Fatal("invalid product")};primary[p]=true}
  for _,p:=range n.Conditional {if !products[p]||primary[p] {t.Fatal("conditional/primary overlap")}}
  for _,s:=range n.Evidence {if !sources[s] {t.Fatal("unknown evidence")}}
 }
 nights,foreign,est:=0,0,0
 for _,r:=range d.Market.Tourism.Regions {if r.Nights<r.Foreign||r.Foreign<0 {t.Fatal("invalid regional denominator")};nights+=r.Nights;foreign+=r.Foreign;est+=r.Establishments}
 if nights!=d.Market.Tourism.Nights||foreign!=d.Market.Tourism.Foreign||est!=d.Market.Tourism.Establishments {t.Fatal("regional totals do not reconcile")}
 if d.Trust.History!=nil {t.Fatal("unsupported trust history")}
 for _,r:=range d.Trust.Reviews {if r.Stars<1||r.Stars>5||!strings.HasPrefix(r.SourceURL,"https://www.trustpilot.com/reviews/") {t.Fatal("invalid review provenance")}}
}

func TestICardRemovedSalesContent(t *testing.T) {
 for _,f:=range []string{"static/icard-commercial.html","static/icard-commercial-data.json","static/icard-commercial.js","static/icard-commercial-report.html"} {
  b,err:=staticFS.ReadFile(f);if err!=nil {t.Fatal(err)};s:=strings.ToLower(string(b))
  for _,term:=range []string{"top rent","happy bar","албена","albena","lidl","ozone","tempus vini","възможности за развитие","подготовка за разговор","contact_role","score_parts","detailprepare","working_stage"} {if strings.Contains(s,term) {t.Fatalf("removed content %q remains in %s",term,f)}}
 }
}
