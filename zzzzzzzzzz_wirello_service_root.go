package main

import "net/http"

// The dedicated Wirello Render service keeps the public demo at /wirello,
// while the native Navigator landing page stays reachable at "/".
//
// A previous response hook redirected every request for "/" back to /wirello,
// which made the home navigation loop back into the demo. We now preserve the
// normal home response and clear the Wirello demo cookie on that response so
// the landing page can load the full Navigator home state again.
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
		if resp == nil || resp.Request == nil || resp.Request.URL.Path != "/" {
			return nil
		}
		resp.Header.Add("Set-Cookie", publicDemoCookieName+"=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax")
		resp.Header.Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
		resp.Header.Set("Pragma", "no-cache")
		resp.Header.Set("Expires", "0")
		return nil
	}
}
