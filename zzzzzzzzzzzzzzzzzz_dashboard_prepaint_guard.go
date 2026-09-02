package main

import (
	"bytes"
	"io"
	"net/http"
	"strconv"
)

// Prevent the dashboard from painting its raw HTML/client switcher before the
// canonical styles and client runtime have finished loading. This fixes the
// brief flash of default buttons / partially assembled overview when entering
// the dashboard from the home screen.
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
		if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/dashboard.html" {
			return nil
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return err
		}
		_ = resp.Body.Close()

		const guard = `<style id="blisDashboardPrepaintV2">
html:not(.blis-dashboard-ready) body{background:#f4f7fb!important;overflow:hidden!important}
html:not(.blis-dashboard-ready) .app,
html:not(.blis-dashboard-ready) #modal{visibility:hidden!important;opacity:0!important;pointer-events:none!important}
html:not(.blis-dashboard-ready) body::before{content:"BLIS Navigator";position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;background:#f4f7fb;color:#1d5fd0;font:700 22px/1.2 Arial,sans-serif;letter-spacing:-.02em}
html:not(.blis-dashboard-ready) body::after{content:"";position:fixed;z-index:2147483647;left:50%;top:calc(50% + 36px);width:24px;height:24px;margin-left:-12px;border:2px solid #d8e3ef;border-top-color:#1d73b7;border-radius:50%;animation:blisBootSpin .7s linear infinite}
@keyframes blisBootSpin{to{transform:rotate(360deg)}}
html.blis-dashboard-ready .app{animation:blisDashboardReveal .14s ease-out both}
@keyframes blisDashboardReveal{from{opacity:.01}to{opacity:1}}
</style><script id="blisDashboardPrepaintScriptV2">(function(){
var root=document.documentElement,done=false,tries=0;
function reveal(){if(done)return;done=true;requestAnimationFrame(function(){requestAnimationFrame(function(){root.classList.add('blis-dashboard-ready')})})}
function styled(){
 var menu=document.querySelector('.client-switch-menu');
 var button=document.querySelector('.client-switch-button');
 var app=document.querySelector('.app');
 var shell=document.querySelector('.shell');
 if(!menu||!button||!app||!shell)return false;
 var ms=getComputedStyle(menu),bs=getComputedStyle(button);
 return ms.display==='none'&&bs.display==='grid'&&parseFloat(bs.borderRadius||'0')>=8;
}
function check(){
 if(done)return;
 if(document.readyState==='complete'&&styled()){setTimeout(reveal,70);return}
 if(++tries<90)setTimeout(check,40);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',check,{once:true});else check();
window.addEventListener('load',check,{once:true});
setTimeout(reveal,4500);
})();</script>`

		if !bytes.Contains(body, []byte("blisDashboardPrepaintV2")) {
			if bytes.Contains(body, []byte("</head>")) {
				body = bytes.Replace(body, []byte("</head>"), []byte(guard+"</head>"), 1)
			} else {
				body = append([]byte(guard), body...)
			}
		}

		resp.Body = io.NopCloser(bytes.NewReader(body))
		resp.ContentLength = int64(len(body))
		resp.Header.Set("Content-Length", strconv.Itoa(len(body)))
		resp.Header.Del("Content-Encoding")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		return nil
	}
}
