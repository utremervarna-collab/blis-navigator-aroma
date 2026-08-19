package main

import (
	"html"
	"net/url"
	"regexp"
	"strings"
	"time"
)

// preciseSocialQuery builds a post-level public-search query from the exact
// configured social profile, rather than searching only by the client name.
func preciseSocialQuery(c *Client, src *Source, platform string) string {
	if src == nil || src.URL == "" {
		return ""
	}
	u, err := url.Parse(src.URL)
	if err != nil {
		return ""
	}
	path := strings.Trim(u.Path, "/")
	if path == "" {
		return ""
	}
	parts := strings.Split(path, "/")
	brand := ""
	if c != nil {
		brand = strings.TrimSpace(c.Name)
	}
	switch platform {
	case "linkedin":
		// /company/aroma-cosmetics-ad -> direct public post URLs normally begin
		// linkedin.com/posts/aroma-cosmetics-ad_...
		slug := parts[len(parts)-1]
		if len(parts) >= 2 && parts[0] == "company" {
			slug = parts[1]
		}
		return "site:linkedin.com/posts/" + slug + " \"" + brand + "\""
	case "facebook":
		handle := parts[0]
		return "site:facebook.com/" + handle + "/posts OR site:facebook.com/" + handle + "/reel \"" + brand + "\""
	case "instagram":
		handle := parts[0]
		return "site:instagram.com/" + handle + "/p OR site:instagram.com/" + handle + "/reel \"" + brand + "\""
	case "youtube":
		handle := parts[0]
		return "site:youtube.com/watch \"" + handle + "\" \"" + brand + "\""
	case "tiktok":
		handle := parts[0]
		return "site:tiktok.com/" + handle + "/video \"" + brand + "\""
	}
	return ""
}

func preciseSearchPosts(c *Client, src *Source, platform string) []socialPost {
	q := preciseSocialQuery(c, src, platform)
	if q == "" {
		return nil
	}
	searchURL := "https://www.bing.com/search?q=" + url.QueryEscape(q) + "&count=20"
	status, body, _, err := timedFetch(searchURL, 4*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	blockRE := regexp.MustCompile(`(?is)<li[^>]*class=["'][^"']*b_algo[^"']*["'][^>]*>(.*?)</li>`)
	linkRE := regexp.MustCompile(`(?is)<h2[^>]*>.*?<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)</a>`)
	pRE := regexp.MustCompile(`(?is)<p[^>]*>(.*?)</p>`)
	dateRE := regexp.MustCompile(`(?i)(20\d{2}-\d{2}-\d{2}|\d{1,2}[./-]\d{1,2}[./-]20\d{2})`)
	out := []socialPost{}
	seen := map[string]bool{}
	for _, bm := range blockRE.FindAllStringSubmatch(body, -1) {
		if len(bm) < 2 {
			continue
		}
		lm := linkRE.FindStringSubmatch(bm[1])
		if len(lm) < 3 {
			continue
		}
		postURL := normalizeSocialURL(html.UnescapeString(lm[1]), platform)
		if !isSocialPostURL(platform, postURL) || seen[strings.ToLower(postURL)] {
			continue
		}
		seen[strings.ToLower(postURL)] = true
		title := cleanPostSnippet(lm[2])
		snippet := ""
		if pm := pRE.FindStringSubmatch(bm[1]); len(pm) > 1 {
			snippet = cleanPostSnippet(pm[1])
		}
		text := snippet
		if !validPostText(text) {
			text = title
		}
		if !validPostText(text) {
			continue
		}
		published := ""
		if dm := dateRE.FindStringSubmatch(cleanPostSnippet(bm[1])); len(dm) > 1 {
			published = dm[1]
		}
		out = append(out, socialPost{Text: text, URL: postURL, Published: published, Origin: "precise_public_search"})
		if len(out) >= 5 {
			break
		}
	}
	return out
}

func runPreciseSocialDiscovery() {
	changed := false
	for _, c := range store.Clients {
		if c == nil {
			continue
		}
		for i := range c.Sources {
			s := &c.Sources[i]
			if !isSpecificSocialSource(*s) {
				continue
			}
			platform := socialPlatform(s)
			if platform == "" {
				continue
			}
			posts := preciseSearchPosts(c, s, platform)
			if len(posts) == 0 {
				continue
			}
			persistSocialPosts(c, s.Key, posts, nowISO())
			changed = true
		}
	}
	if changed {
		saveStore()
	}
}

func init() {
	go func() {
		time.Sleep(75 * time.Second)
		runPreciseSocialDiscovery()
		t := time.NewTicker(24 * time.Hour)
		defer t.Stop()
		for range t.C {
			runPreciseSocialDiscovery()
		}
	}()
}
