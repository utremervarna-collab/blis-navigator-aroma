package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

type deepAnalysisTransportV31 struct{base http.RoundTripper}
func (t deepAnalysisTransportV31)RoundTrip(req *http.Request)(*http.Response,error){
	if req.URL.Path!="/api/intelligence/deep-analysis"{return t.base.RoundTrip(req)}
	slug,_,ok:=scopedClientV3(req);if !ok{return transportJSONV3(req,http.StatusUnauthorized,map[string]interface{}{"error":"Изисква се валидна BLIS сесия"})}
	if slug=="wirello"{return transportJSONV3(req,http.StatusOK,map[string]interface{}{"version":"3.1","client":"wirello","public_demo":true,"analysis_disabled":true})}
	return transportJSONV3(req,http.StatusOK,buildDeepAnalysisV31(slug))
}
func injectDeepAnalyticsV31(body []byte)[]byte{
	if bytes.Contains(body,[]byte("navigator-deep-analytics-v31.js")){return body}
	tag:=[]byte(`<script src="/navigator-deep-analytics-v31.js?v=20260829-deep31"></script>`)
	if bytes.Contains(body,[]byte("</body>")){return bytes.Replace(body,[]byte("</body>"),append(tag,[]byte("</body>")...),1)}
	return append(body,tag...)
}
func init(){
	if authProxy==nil{return};base:=authProxy.Transport;if base==nil{base=http.DefaultTransport};authProxy.Transport=deepAnalysisTransportV31{base:base}
	previous:=authProxy.ModifyResponse;authProxy.ModifyResponse=func(resp *http.Response)error{if previous!=nil{if err:=previous(resp);err!=nil{return err}};if resp==nil||resp.Request==nil||resp.Request.URL.Path!="/dashboard.html"{return nil};body,err:=io.ReadAll(resp.Body);if err!=nil{return err};_ = resp.Body.Close();body=injectDeepAnalyticsV31(body);resp.Body=io.NopCloser(bytes.NewReader(body));resp.ContentLength=int64(len(body));resp.Header.Set("Content-Length",strconv.Itoa(len(body)));resp.Header.Del("Content-Encoding");resp.Header.Set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");return nil}
}
