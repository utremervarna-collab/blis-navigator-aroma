package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Perception v11 keeps the surrounding controls and right detail panel aligned
// with the approved reference without adding another client-side renderer.
func init() {
	if authProxy == nil {
		return
	}
	previous := authProxy.ModifyResponse
	authProxy.ModifyResponse = func(resp *http.Response) error {
		if previous != nil {
			if err := previous(resp); err != nil {
				return err
			}
		}
		return injectPerceptionV11UI(resp)
	}
}

func injectPerceptionV11UI(resp *http.Response) error {
	if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
		return nil
	}
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}
	resp.Body.Close()

	const css = `<style id="blisPerceptionV11UI">
#market .pm-main{grid-template-columns:minmax(0,1fr) 330px!important;gap:12px!important}
#market .pm-mapcard,#market .pm-drawer{min-height:650px!important}
#market .pm-maphead{height:54px!important;padding:0 15px!important;display:flex!important;align-items:center!important}
#market .pm-maphead>div{display:flex!important;align-items:center!important;gap:9px!important}
#market .pm-toolbar{min-height:50px!important;padding:9px 12px!important;gap:10px!important;background:#fff!important}
#market .pm-filterbar{gap:7px!important}
#market .pm-ref-filter-trigger{height:32px!important;padding:0 13px!important;border-radius:8px!important}
#market .pm-filterbar select{height:32px!important;border-color:#dce4ee!important;box-shadow:0 1px 2px rgba(16,24,40,.018)!important}
#market .pm-ref-stage-tools{top:13px!important;right:12px!important;gap:7px!important}
#market .pm-ref-stage-tools .pm-zoom{width:32px!important;height:32px!important;border-radius:8px!important;border-color:#dce4ee!important}
#market .pm-drawer{padding:0 16px 16px!important;max-height:650px!important;border-color:#e2e8f0!important;box-shadow:none!important}
#market .pm-ref-drawer-titlebar{height:52px!important;margin:0 -16px 14px!important;padding:0 16px!important;border-bottom:1px solid #e9eef5!important}
#market .pm-ref-drawer-titlebar b{font-size:15px!important;font-weight:790!important;color:#101828!important}
#market .pm-ref-drawer-titlebar button{font-size:21px!important;color:#475467!important}
#market .pm-ref-identity{grid-template-columns:40px 1fr!important;column-gap:11px!important;padding-bottom:9px!important}
#market .pm-ref-signal-icon{width:38px!important;height:38px!important;box-shadow:none!important}
#market .pm-drawer h3{font-size:13.5px!important;font-weight:780!important}
#market .pm-ref-identity-meta{padding:0 0 13px 51px!important;margin-bottom:13px!important;gap:9px!important}
#market .pm-ref-identity-meta span,#market .pm-ref-identity-meta strong{font-size:9.5px!important}
#market .pm-ref-section,#market .pm-drawer-section{margin-top:0!important;padding:13px 0!important;border-top:1px solid #edf1f5!important}
#market .pm-ref-section h4,#market .pm-drawer-section h4{font-size:9.5px!important;margin-bottom:8px!important;color:#344054!important}
#market .pm-ref-section p,#market .pm-drawer-section p{font-size:9.7px!important;line-height:1.55!important;color:#475467!important}
#market .pm-ref-sentbar{height:6px!important;margin:9px 0 8px!important}
#market .pm-ref-sentlegend{font-size:7.8px!important}
#market .pm-related{display:grid!important;grid-template-columns:1fr!important;gap:6px!important}
#market .pm-related button{width:100%!important;text-align:left!important;border-radius:8px!important;padding:7px 9px!important;background:#fff!important;border:1px solid #e1e7ef!important;font-size:9px!important;color:#475467!important}
#market .pm-ref-source-row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;align-items:center!important;gap:8px!important;padding:6px 0!important;border-bottom:1px solid #f2f4f7!important}
#market .pm-ref-source-row span{display:flex!important;align-items:center!important;gap:7px!important;font-size:9px!important;color:#344054!important;min-width:0!important}
#market .pm-ref-source-row span i{width:18px!important;height:18px!important;border-radius:50%!important;background:#f4f7fb!important;display:grid!important;place-items:center!important;font-style:normal!important;font-size:7px!important;color:#667085!important;flex:0 0 auto!important}
#market .pm-ref-source-row b{font-size:9px!important;color:#344054!important}
#market .pm-ref-source-row small{display:none!important}
#market .pm-ref-examples article{padding:9px 10px!important;margin-bottom:7px!important;border:1px solid #e7edf4!important;border-radius:8px!important;background:#f8fafc!important}
#market .pm-ref-examples article p{margin:0 0 4px!important;font-size:9px!important;line-height:1.45!important;color:#344054!important}
#market .pm-ref-examples article small{font-size:7.8px!important;color:#98a2b3!important}
#market .pm-ref-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:7px!important;padding-top:12px!important;margin-top:0!important;border-top:1px solid #edf1f5!important}
#market .pm-ref-actions .pm-action{margin:0!important;min-height:36px!important;padding:8px 9px!important;border-radius:8px!important;font-size:9px!important;text-align:center!important}
#market .pm-ref-actions .linklike{border:1px solid #dfe6ef!important;background:#fff!important;padding:8px 9px!important;color:#344054!important}
#market .pm-lower{grid-template-columns:1.28fr 1fr 1fr!important;gap:10px!important;margin-top:10px!important}
#market .pm-lower .pm-card{min-height:166px!important;padding:13px 14px!important}
#market .pm-lower h3{font-size:13px!important;font-weight:780!important;color:#101828!important}
#market .pm-change{padding:7px 0!important}
#market .pm-theme-cloud button{border-radius:8px!important;background:#f8fafc!important;border-color:#e3e9f1!important}
@media(max-width:1180px){#market .pm-main{grid-template-columns:1fr!important}#market .pm-drawer{max-height:none!important}}
</style>`

	body = bytes.Replace(body, []byte("</head>"), []byte(css+"</head>"), 1)
	resp.Body = io.NopCloser(bytes.NewReader(body))
	resp.ContentLength = int64(len(body))
	resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
	return nil
}
