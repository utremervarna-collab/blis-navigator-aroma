package main

import "net/http"

type metricIntelligenceTransportV33 struct{base http.RoundTripper}
func (t metricIntelligenceTransportV33)RoundTrip(req *http.Request)(*http.Response,error){
	if req.URL.Path!="/api/intelligence/metric-analysis"{return t.base.RoundTrip(req)}
	slug,_,ok:=scopedClientV3(req);if !ok{return transportJSONV3(req,http.StatusUnauthorized,map[string]interface{}{"error":"Изисква се валидна BLIS сесия"})}
	if slug=="wirello"{return transportJSONV3(req,http.StatusOK,map[string]interface{}{"version":"3.3","client":"wirello","public_demo":true,"analysis_disabled":true})}
	return transportJSONV3(req,http.StatusOK,buildMetricIntelligenceV33(slug))
}
func init(){if authProxy==nil{return};base:=authProxy.Transport;if base==nil{base=http.DefaultTransport};authProxy.Transport=metricIntelligenceTransportV33{base:base}}
