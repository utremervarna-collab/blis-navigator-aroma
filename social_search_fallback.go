package main

import (
	"net/url"
	"regexp"
	"strings"
	"time"
)

func socialFallbackQuery(c *Client, src *Source, platform string) string {
	if c == nil || src == nil {
		return ""
	}
	if c.Slug == "aroma" {
		switch platform {
		case "linkedin":
			return `site:linkedin.com/posts "Aroma Cosmetics AD"`
		case "facebook":
			return `site:facebook.com ("aroma.official" OR "aroma.cosmetics") "Aroma"`
		case "instagram":
			return `site:instagram.com "aroma.bulgaria" "Aroma"`
		case "youtube":
			return `site:youtube.com "AromaJsc" "Aroma"`
		}
	}
	u, err := url.Parse(src.URL)
	if err != nil {
		return ""
	}
	q := "site:" + u.Host
	if p := strings.Trim(u.Path, "/"); p != "" {
		q += ` "` + p + `"`
	}
	if c.Name != "" {
		q += ` "` + c.Name + `"`
	}
	return q
}

func extractSocialSearchPostsV2(c *Client, src *Source, platform string) []socialPost {
	q := socialFallbackQuery(c, src, platform)
	if q == "" {
		return nil
	}
	raw := "https://www.bing.com/search?q=" + url.QueryEscape(q) + "&count=12"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	blockRE := regexp.MustCompile(`(?is)<li[^>]*class=["'][^"']*b_algo[^"']*["'][^>]*>(.*?)</li>`)
	linkRE := regexp.MustCompile(`(?is)<h2[^>]*>.*?<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)</a>`)
	pRE := regexp.MustCompile(`(?is)<p[^>]*>(.*?)</p>`)
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
		u := normalizeSocialURL(lm[1], platform)
		if !isSocialPostURL(platform, u) || seen[u] {
			continue
		}
		seen[u] = true
		title := cleanPostSnippet(lm[2])
		snippet := ""
		if pm := pRE.FindStringSubmatch(bm[1]); len(pm) > 1 {
			snippet = cleanPostSnippet(pm[1])
		}
		text := snippet
		if len([]rune(text)) < 24 {
			text = title
		}
		if len([]rune(text)) < 12 {
			continue
		}
		out = append(out, socialPost{Text: text, URL: u, Published: nowISO(), Origin: "public_search"})
		if len(out) >= 3 {
			break
		}
	}
	return out
}

func runSocialSearchFallback() {
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
			if platform == "" || platform == "youtube" {
				continue
			}
			posts := extractSocialSearchPostsV2(c, s, platform)
			stamp := nowISO()
			if len(posts) > 0 {
				// Public discovery is itself a measurable availability signal.
				add(c, s.Key, "public_page_access", 100.0, stamp)
				persistSocialPosts(c, s.Key, posts, stamp)
			} else if latest(c, s.Key, "public_page_access") == nil {
				add(c, s.Key, "public_page_access", 0.0, stamp)
			}
		}
	}
	saveStore()
}

func init() {
	go func() {
		time.Sleep(15 * time.Second)
		runSocialSearchFallback()
		t := time.NewTicker(24 * time.Hour)
		defer t.Stop()
		for range t.C {
			runSocialSearchFallback()
		}
	}()
}
