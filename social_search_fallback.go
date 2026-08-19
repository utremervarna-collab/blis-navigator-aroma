package main

import (
	"net/url"
	"regexp"
	"strings"
	"time"
)

type socialSearchEvidence struct {
	Posts     []socialPost
	Audience  float64
	Reactions float64
}

const socialPublicNumber = `([0-9]{1,3}(?:[ .][0-9]{3})+|[0-9]+(?:[.,][0-9]+)?\s*[KMB]?)`

var socialAudienceSearchRE = regexp.MustCompile(`(?i)` + socialPublicNumber + `\s*(followers|последователи|subscribers|абонати)`)
var socialReactionSearchRE = regexp.MustCompile(`(?i)` + socialPublicNumber + `\s*(reactions?|likes?|харесвания|comments?|коментари|shares?|споделяния)`)

func socialFallbackQuery(c *Client, src *Source, platform string) string {
	if c == nil || src == nil {
		return ""
	}
	if c.Slug == "aroma" {
		switch platform {
		case "linkedin":
			return `site:linkedin.com ("Aroma Cosmetics AD" OR "aroma-cosmetics-ad")`
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

func maxPositiveMetric(text string, re *regexp.Regexp) float64 {
	best := 0.0
	for _, m := range re.FindAllStringSubmatch(text, -1) {
		if len(m) < 2 {
			continue
		}
		v := compactSocialNumber(m[1])
		if v > best {
			best = v
		}
	}
	return best
}

func reactionEvidence(text string) float64 {
	// For a single indexed result, use the largest visible interaction count.
	// This avoids double counting the same post when a snippet repeats a number.
	return maxPositiveMetric(text, socialReactionSearchRE)
}

func extractSocialSearchEvidence(c *Client, src *Source, platform string) socialSearchEvidence {
	ev := socialSearchEvidence{}
	q := socialFallbackQuery(c, src, platform)
	if q == "" {
		return ev
	}
	raw := "https://www.bing.com/search?q=" + url.QueryEscape(q) + "&count=16"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return ev
	}
	blockRE := regexp.MustCompile(`(?is)<li[^>]*class=["'][^"']*b_algo[^"']*["'][^>]*>(.*?)</li>`)
	linkRE := regexp.MustCompile(`(?is)<h2[^>]*>.*?<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)</a>`)
	pRE := regexp.MustCompile(`(?is)<p[^>]*>(.*?)</p>`)
	seenPosts := map[string]bool{}
	seenResults := map[string]bool{}
	for _, bm := range blockRE.FindAllStringSubmatch(body, -1) {
		if len(bm) < 2 {
			continue
		}
		lm := linkRE.FindStringSubmatch(bm[1])
		if len(lm) < 3 {
			continue
		}
		resultURL := normalizeSocialURL(lm[1], platform)
		resultKey := strings.ToLower(resultURL)
		if resultKey == "" || seenResults[resultKey] {
			continue
		}
		seenResults[resultKey] = true

		blockText := cleanPostSnippet(bm[1])
		if a := maxPositiveMetric(blockText, socialAudienceSearchRE); a > ev.Audience {
			ev.Audience = a
		}
		if r := reactionEvidence(blockText); r > 0 {
			ev.Reactions += r
		}

		if len(ev.Posts) >= 3 || !isSocialPostURL(platform, resultURL) || seenPosts[resultKey] {
			continue
		}
		seenPosts[resultKey] = true
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
		ev.Posts = append(ev.Posts, socialPost{Text: text, URL: resultURL, Published: nowISO(), Origin: "public_search"})
	}
	return ev
}

func extractSocialSearchPostsV2(c *Client, src *Source, platform string) []socialPost {
	return extractSocialSearchEvidence(c, src, platform).Posts
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
			if platform == "" {
				continue
			}
			ev := extractSocialSearchEvidence(c, s, platform)
			stamp := nowISO()
			if ev.Audience > 0 {
				// Only positive, publicly observed audience counts are persisted.
				// A blocked/empty response never replaces a valid historical value with zero.
				add(c, s.Key, "followers", ev.Audience, stamp)
			}
			if ev.Reactions > 0 {
				// Search-derived reactions are a fallback evidence metric. The UI uses it
				// only when direct likes/comments/shares are unavailable.
				add(c, s.Key, "visible_reactions_search", ev.Reactions, stamp)
			}
			if len(ev.Posts) > 0 {
				add(c, s.Key, "public_page_access", 100.0, stamp)
				persistSocialPosts(c, s.Key, ev.Posts, stamp)
			} else if latest(c, s.Key, "public_page_access") == nil {
				add(c, s.Key, "public_page_access", 0.0, stamp)
			}
		}
	}
	saveStore()
}

func init() {
	go func() {
		time.Sleep(1 * time.Second)
		runSocialSearchFallback()
		t := time.NewTicker(24 * time.Hour)
		defer t.Stop()
		for range t.C {
			runSocialSearchFallback()
		}
	}()
}
