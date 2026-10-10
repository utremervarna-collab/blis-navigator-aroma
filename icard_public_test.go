package main

import (
 "encoding/json"
 "net/http"
 "net/http/httptest"
 "strings"
 "testing"
)

func TestICardPresentationRoutes(t *testing.T) {
 for _, path := range []string{"/icard", "/icard/", "/icard/data", "/icard/style.css", "/icard/app.js", "/icard/report"} {
  for _, method := range []string{http.MethodGet, http.MethodHead} {
   req:=httptest.NewRequest(method,path,nil)
   req.AddCookie(&http.Cookie{Name:topRentScopeCookieName,Value:"top-rent-a-car"})
   rec:=httptest.NewRecorder()
   navigatorGateway(rec,req)
   if rec.Code!=200 { t.Fatalf("%s %s: %d",method,path,rec.Code) }
   if rec.Header().Get("X-BLIS-ICard-Version")=="" { t.Fatalf("missing version on %s",path) }
   if method==http.MethodHead && rec.Body.Len()!=0 {t.Fatal("HEAD returned a body")}
  }
 }
 req:=httptest.NewRequest(http.MethodPost,"/icard/data",nil); rec:=httptest.NewRecorder()
 serveICardPublic(rec,req)
 if rec.Code!=405 {t.Fatalf("write accepted: %d",rec.Code)}
 rec=httptest.NewRecorder();serveICardPublic(rec,httptest.NewRequest("GET","/icard/report?download=1",nil))
 if !strings.Contains(rec.Header().Get("Content-Disposition"),"attachment") {t.Fatal("report download is not an attachment")}
 rec=httptest.NewRecorder();serveICardPublic(rec,httptest.NewRequest("GET","/dashboard.html?client=icard",nil))
 if rec.Code!=302||rec.Header().Get("Location")!="/icard" {t.Fatal("legacy route does not reach tailored profile")}
 if serveICardPublic(httptest.NewRecorder(),httptest.NewRequest("GET","/aroma",nil)) {t.Fatal("iCard handler intercepted another client")}
}

func TestICardSnapshotIntegrity(t *testing.T) {
 b,err:=staticFS.ReadFile("static/icard-commercial-data.json");if err!=nil {t.Fatal(err)}
 var d struct { Version string `json:"version"`; Opportunities []struct {ID string `json:"id"`;EventDate *string `json:"event_date"`;DatePrecision string `json:"date_precision"`;Products []string `json:"products"`;Sources []map[string]string `json:"sources"`;Relationship string `json:"relationship"`;ScoreParts []int `json:"score_parts"`} `json:"opportunities"`;Trust struct {Reviews []struct {ID string `json:"id"`;Stars int `json:"stars"`;SourceURL string `json:"source_url"`} `json:"reviews"`;History interface{} `json:"history"`} `json:"trust"`;CompetitiveChanges interface{} `json:"competitive_changes"` }
 if err=json.Unmarshal(b,&d);err!=nil {t.Fatal(err)}
 if len(d.Opportunities)!=9||len(d.Trust.Reviews)!=8 {t.Fatal("unexpected reviewed population")}
 ids:=map[string]bool{};dated:=0
 for _,r:=range d.Opportunities {
  if ids[r.ID]||r.ID=="" {t.Fatal("duplicate company")};ids[r.ID]=true
  if len(r.Sources)==0||len(r.Products)==0||r.Relationship=="" {t.Fatal("missing provenance")}
  if len(r.ScoreParts)!=4 {t.Fatal("missing score breakdown")}
  total:=0;for i,v:=range r.ScoreParts {if v<0||v>[]int{40,25,15,20}[i] {t.Fatal("score component out of bounds")};total+=v};if total>100 {t.Fatal("invalid score")}
  if r.DatePrecision=="day" {if r.EventDate==nil {t.Fatal("exact date missing")};dated++} else if r.EventDate!=nil {t.Fatal("fabricated precise date")}
 }
 if dated!=2||d.Trust.History!=nil||d.CompetitiveChanges!=nil {t.Fatal("unsupported dates or historical trend")}
 for _,r:=range d.Trust.Reviews {if r.Stars<1||r.Stars>5||!strings.HasPrefix(r.SourceURL,"https://www.trustpilot.com/reviews/") {t.Fatal("review without valid provenance")}}
}
