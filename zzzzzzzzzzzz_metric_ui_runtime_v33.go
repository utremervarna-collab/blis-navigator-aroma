package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

func injectMetricIntelligenceV33(body []byte)[]byte{
	if bytes.Contains(body,[]byte("navigator-metric-intelligence-v33.js")){return body}
	tag:=[]byte(`<script src="/navigator-metric-intelligence-v33.js?v=20260829-metric33"></script>`)
	if bytes.Contains(body,[]byte("</body>")){return bytes.Replace(body,[]byte("</body>"),append(tag,[]byte("</body>")...),1)}
	return append(body,tag...)
}
func init(){if authProxy==nil{return};previous:=authProxy.ModifyResponse;authProxy.ModifyResponse=func(resp *http.Response)error{if previous!=nil{if err:=previous(resp);err!=nil{return err}};if resp==nil||resp.Request==nil||resp.Request.URL.Path!="/dashboard.html"{return nil};body,err:=io.ReadAll(resp.Body);if err!=nil{return err};_ = resp.Body.Close();body=injectMetricIntelligenceV33(body);resp.Body=io.NopCloser(bytes.NewReader(body));resp.ContentLength=int64(len(body));resp.Header.Set("Content-Length",strconv.Itoa(len(body)));resp.Header.Del("Content-Encoding");resp.Header.Set("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");return nil}}
