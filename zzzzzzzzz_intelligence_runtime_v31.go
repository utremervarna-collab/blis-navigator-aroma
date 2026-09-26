package main

import "net/http"

type deepAnalysisTransportV31 struct{base http.RoundTripper}
func (t deepAnalysisTransportV31)RoundTrip(req *http.Request)(*http.Response,error){
	if req.URL.Path!="/api/intelligence/deep-analysis"{return t.base.RoundTrip(req)}
	slug,_,ok:=scopedClientV3(req);if !ok{return transportJSONV3(req,http.StatusUnauthorized,map[string]interface{}{"error":"Изисква се валидна BLIS сесия"})}
	if slug=="wirello"{return transportJSONV3(req,http.StatusOK,map[string]interface{}{"version":"3.1","client":"wirello","public_demo":true,"analysis_disabled":true})}
	return transportJSONV3(req,http.StatusOK,buildDeepAnalysisV31(slug))
}
func init(){
	if authProxy==nil{return}
	base:=authProxy.Transport
	if base==nil{base=http.DefaultTransport}
	authProxy.Transport=deepAnalysisTransportV31{base:base}
}
