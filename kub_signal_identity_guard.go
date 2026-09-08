package main

import (
	"net/url"
	"strings"
)

// kubSignalIdentityKey is deliberately based on the article URL and title, not
// the search-engine snippet. Search result snippets can change between polls
// even when the underlying article has not changed; using them in the primary
// identity causes the same article to be counted as new again.
func kubSignalIdentityKey(s Signal) string {
	raw := strings.TrimSpace(s.URL)
	if u, err := url.Parse(raw); err == nil && u.Host != "" {
		u.Host = strings.ToLower(strings.TrimPrefix(u.Host, "www."))
		u.Fragment = ""
		q := u.Query()
		for _, k := range []string{"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid", "ref", "source"} {
			q.Del(k)
		}
		u.RawQuery = q.Encode()
		u.Path = strings.TrimSuffix(u.Path, "/")
		raw = u.String()
	}
	title := strings.Join(strings.Fields(strings.ToLower(strings.TrimSpace(s.Title))), " ")
	return strings.ToLower(strings.TrimSpace(s.Client)) + "|" + strings.ToLower(raw) + "|" + title
}

// stabilizeKUBSignalFingerprints preserves an already stored fingerprint when
// the same URL/title reappears with a changed snippet. For genuinely unseen
// articles it creates a stable fingerprint that excludes volatile snippet text.
func stabilizeKUBSignalFingerprints(fresh []Signal) []Signal {
	signalMu.RLock()
	existing := append([]Signal(nil), signalState.Signals["kub"]...)
	signalMu.RUnlock()

	known := make(map[string]Signal, len(existing))
	for _, s := range existing {
		if key := kubSignalIdentityKey(s); key != "||" {
			known[key] = s
		}
	}

	for i := range fresh {
		key := kubSignalIdentityKey(fresh[i])
		if old, ok := known[key]; ok {
			fresh[i].Fingerprint = old.Fingerprint
			fresh[i].ID = old.ID
			if old.DetectedAt != "" {
				fresh[i].DetectedAt = old.DetectedAt
			}
			continue
		}
		fp := signalHash("kub", fresh[i].URL, fresh[i].Title, "")
		fresh[i].Fingerprint = fp
		fresh[i].ID = fp[:16]
	}
	return dedupeSignals(fresh)
}
