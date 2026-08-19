package main

import (
	"encoding/xml"
	"html"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"
)

type youtubeAtomFeed struct {
	Entries []struct {
		Title     string `xml:"title"`
		Published string `xml:"published"`
		Link      struct {
			Href string `xml:"href,attr"`
		} `xml:"link"`
	} `xml:"entry"`
}

type socialPost struct {
	Text      string
	URL       string
	Published string
	Origin    string
}

var socialMetricRE = regexp.MustCompile(`(?i)([0-9][0-9.,\s]*|[0-9]+(?:[.,][0-9]+)?\s*[KMB])\s+(followers|последователи|subscribers|абонати|posts|публикации|videos|видеа|likes|харесвания|comments|коментари|shares|споделяния)`)

func compactSocialNumber(raw string) float64 {
	s := strings.TrimSpace(strings.ToUpper(raw))
	s = strings.ReplaceAll(s, "\u00a0", "")
	s = strings.ReplaceAll(s, " ", "")
	mult := 1.0
	if strings.HasSuffix(s, "K") {
		mult = 1_000
		s = strings.TrimSuffix(s, "K")
	} else if strings.HasSuffix(s, "M") {
		mult = 1_000_000
		s = strings.TrimSuffix(s, "M")
	} else if strings.HasSuffix(s, "B") {
		mult = 1_000_000_000
		s = strings.TrimSuffix(s, "B")
	}
	if mult > 1 {
		s = strings.ReplaceAll(s, ",", ".")
	} else {
		s = strings.ReplaceAll(s, ",", "")
		if strings.Count(s, ".") > 1 || (strings.Count(s, ".") == 1 && len(strings.Split(s, ".")[1]) == 3) {
			s = strings.ReplaceAll(s, ".", "")
		}
	}
	v, _ := strconv.ParseFloat(s, 64)
	return v * mult
}

func socialPlatform(src *Source) string {
	if src == nil {
		return ""
	}
	q := strings.ToLower(src.Key + " " + src.Label + " " + src.URL)
	switch {
	case strings.Contains(q, "linkedin"):
		return "linkedin"
	case strings.Contains(q, "facebook"):
		return "facebook"
	case strings.Contains(q, "instagram"):
		return "instagram"
	case strings.Contains(q, "youtube"):
		return "youtube"
	case strings.Contains(q, "tiktok"):
		return "tiktok"
	}
	return ""
}

func socialBrandTerms(c *Client) []string {
	if c == nil {
		return nil
	}
	switch c.Slug {
	case "bolyarka":
		return []string{"bolyarka", "boliarka", "болярка"}
	case "astor-garden":
		return []string{"astor garden", "астор гардън"}
	default:
		return []string{"aroma cosmetics", "арома козметикс", "aroma", "арома"}
	}
}

func brandMentionsVisible(c *Client, text string) float64 {
	low := strings.ToLower(text)
	seen := 0
	for _, term := range socialBrandTerms(c) {
		seen += strings.Count(low, strings.ToLower(term))
	}
	return float64(seen)
}

func visibleReactionMarkers(text string) float64 {
	low := strings.ToLower(text)
	return float64(countAny(low, " like", " likes", " reaction", " reactions", " comment", " comments", " share", " shares", "харесван", "коментар", "споделян"))
}

func normalizeSocialURL(raw, platform string) string {
	u := html.UnescapeString(strings.TrimSpace(raw))
	u = strings.ReplaceAll(u, `\/`, `/`)
	u = strings.ReplaceAll(u, `\u0026`, `&`)
	if strings.HasPrefix(u, "//") {
		u = "https:" + u
	}
	if strings.HasPrefix(u, "/") {
		host := map[string]string{"linkedin": "https://www.linkedin.com", "facebook": "https://www.facebook.com", "instagram": "https://www.instagram.com", "youtube": "https://www.youtube.com", "tiktok": "https://www.tiktok.com"}[platform]
		if host != "" {
			u = host + u
		}
	}
	return u
}

func isSocialPostURL(platform, raw string) bool {
	u := strings.ToLower(raw)
	switch platform {
	case "linkedin":
		return strings.Contains(u, "linkedin.com/posts/") || strings.Contains(u, "/feed/update/")
	case "facebook":
		return strings.Contains(u, "facebook.com/") && (strings.Contains(u, "/posts/") || strings.Contains(u, "/reel/") || strings.Contains(u, "/videos/") || strings.Contains(u, "story_fbid="))
	case "instagram":
		return strings.Contains(u, "instagram.com/p/") || strings.Contains(u, "instagram.com/reel/")
	case "youtube":
		return strings.Contains(u, "youtube.com/watch") || strings.Contains(u, "youtu.be/") || strings.Contains(u, "youtube.com/shorts/")
	case "tiktok":
		return strings.Contains(u, "tiktok.com/") && strings.Contains(u, "/video/")
	}
	return false
}

func cleanPostSnippet(raw string) string {
	s := html.UnescapeString(stripHTML(raw))
	s = regexp.MustCompile(`(?i)\b(log in|sign in|join now|view profile|follow|connect|see more|see all employees|updates)\b`).ReplaceAllString(s, " ")
	s = regexp.MustCompile(`\s+`).ReplaceAllString(s, " ")
	s = strings.TrimSpace(s)
	if len([]rune(s)) > 420 {
		r := []rune(s)
		s = strings.TrimSpace(string(r[:420])) + "…"
	}
	return s
}

func validPostText(s string) bool {
	s = strings.TrimSpace(s)
	if len([]rune(s)) < 16 {
		return false
	}
	low := strings.ToLower(s)
	bad := []string{
		"class=", "data-tracking", "data-control", "data-delayed-url", "tracking-will-navigate",
		"<img", "<svg", "aria-", "href=", "src=", "public_biz_employees", "organization_guest_main-feed",
		"inline-block relative", "__blis_empty__",
	}
	for _, x := range bad {
		if strings.Contains(low, x) {
			return false
		}
	}
	letters := 0
	for _, r := range s {
		if (r >= 'A' && r <= 'Z') || (r >= 'a' && r <= 'z') || (r >= 'А' && r <= 'я') {
			letters++
		}
	}
	return letters >= 8
}

func socialSearchQuery(c *Client, src *Source, platform string) string {
	if src == nil {
		return ""
	}
	u, err := url.Parse(src.URL)
	if err != nil {
		return ""
	}
	site := u.Host
	path := strings.Trim(u.Path, "/")
	switch platform {
	case "linkedin":
		site = "linkedin.com/posts"
	case "youtube":
		site = "youtube.com"
	}
	q := "site:" + site
	if path != "" && platform != "linkedin" && platform != "youtube" {
		q += " \"" + path + "\""
	}
	if c != nil && c.Name != "" {
		q += " \"" + c.Name + "\""
	}
	return q
}

func extractSearchPosts(c *Client, src *Source, platform string) []socialPost {
	q := socialSearchQuery(c, src, platform)
	if q == "" {
		return nil
	}
	raw := "https://www.bing.com/search?q=" + url.QueryEscape(q) + "&count=10"
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
		if !validPostText(text) {
			text = title
		}
		if !validPostText(text) {
			continue
		}
		out = append(out, socialPost{Text: text, URL: u, Origin: "public_search"})
		if len(out) >= 5 {
			break
		}
	}
	return out
}

func persistSocialPosts(c *Client, key string, posts []socialPost, stamp string) {
	valid := make([]socialPost, 0, len(posts))
	seen := map[string]bool{}
	for _, p := range posts {
		p.Text = cleanPostSnippet(p.Text)
		if !validPostText(p.Text) || !isSocialPostURL(socialPlatform(sourceByKey(c, key)), p.URL) {
			continue
		}
		id := strings.ToLower(p.URL)
		if seen[id] {
			continue
		}
		seen[id] = true
		valid = append(valid, p)
		if len(valid) >= 5 {
			break
		}
	}
	add(c, key, "recent_public_posts", float64(len(valid)), stamp)
	for i := 0; i < 5; i++ {
		idx := strconv.Itoa(i + 1)
		if i >= len(valid) {
			add(c, key, "post_"+idx+"_text", "__BLIS_EMPTY__", stamp)
			add(c, key, "post_"+idx+"_url", "__BLIS_EMPTY__", stamp)
			add(c, key, "post_"+idx+"_published", "__BLIS_EMPTY__", stamp)
			continue
		}
		p := valid[i]
		add(c, key, "post_"+idx+"_text", p.Text, stamp)
		add(c, key, "post_"+idx+"_url", p.URL, stamp)
		if p.Published != "" {
			add(c, key, "post_"+idx+"_published", p.Published, stamp)
		} else {
			add(c, key, "post_"+idx+"_published", "__BLIS_EMPTY__", stamp)
		}
		add(c, key, "post_"+idx+"_origin", p.Origin, stamp)
	}
}

func socialPageMetrics(c *Client, key string) {
	src := sourceByKey(c, key)
	if src == nil || src.URL == "" {
		return
	}
	stamp := nowISO()
	platform := socialPlatform(src)
	status, body, _, err := timedFetch(src.URL, 4*1024*1024)
	pageOK := err == nil && status >= 200 && status < 400
	if pageOK {
		add(c, key, "public_page_access", 100.0, stamp)
		add(c, key, "profile_active", 1.0, stamp)
		clean := stripHTML(body)
		add(c, key, "brand_mentions_visible", brandMentionsVisible(c, clean), stamp)
		add(c, key, "visible_reaction_markers", visibleReactionMarkers(clean), stamp)
		add(c, key, "page_words", float64(len(strings.Fields(clean))), stamp)
		for _, m := range socialMetricRE.FindAllStringSubmatch(clean, -1) {
			if len(m) < 3 {
				continue
			}
			v := compactSocialNumber(m[1])
			if v < 0 {
				continue
			}
			kind := strings.ToLower(m[2])
			switch {
			case strings.Contains(kind, "follower"), strings.Contains(kind, "последовател"), strings.Contains(kind, "subscriber"), strings.Contains(kind, "абонат"):
				if v > 0 { add(c, key, "followers", v, stamp) }
			case strings.Contains(kind, "post"), strings.Contains(kind, "публикац"), strings.Contains(kind, "video"), strings.Contains(kind, "виде"):
				if v > 0 { add(c, key, "visible_posts", v, stamp) }
			case strings.Contains(kind, "like"), strings.Contains(kind, "харес"):
				add(c, key, "likes", v, stamp)
			case strings.Contains(kind, "comment"), strings.Contains(kind, "коментар"):
				add(c, key, "comments_visible", v, stamp)
			case strings.Contains(kind, "share"), strings.Contains(kind, "сподел"):
				add(c, key, "shares_visible", v, stamp)
			}
		}
	} else {
		add(c, key, "public_page_access", 0.0, stamp)
	}

	if platform == "youtube" && pageOK {
		if collectYouTubeFeed(c, key, src.URL, body) {
			return
		}
	}
	// Platforms frequently block unauthenticated page reads. Public search is still attempted.
	posts := extractSearchPosts(c, src, platform)
	persistSocialPosts(c, key, posts, stamp)
}

func youtubeChannelID(rawURL, body string) string {
	for _, re := range []*regexp.Regexp{
		regexp.MustCompile(`(?i)/channel/(UC[A-Za-z0-9_-]{20,})`),
		regexp.MustCompile(`"channelId"\s*:\s*"(UC[A-Za-z0-9_-]{20,})"`),
		regexp.MustCompile(`"externalId"\s*:\s*"(UC[A-Za-z0-9_-]{20,})"`),
		regexp.MustCompile(`youtube\.com/channel/(UC[A-Za-z0-9_-]{20,})`),
	} {
		if m := re.FindStringSubmatch(rawURL + "\n" + body); len(m) > 1 {
			return m[1]
		}
	}
	return ""
}

func collectYouTubeFeed(c *Client, key, rawURL, pageBody string) bool {
	channelID := youtubeChannelID(rawURL, pageBody)
	if channelID == "" {
		return false
	}
	feedURL := "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelID
	status, body, _, err := timedFetch(feedURL, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return false
	}
	var feed youtubeAtomFeed
	if xml.Unmarshal([]byte(body), &feed) != nil || len(feed.Entries) == 0 {
		return false
	}
	cut90 := time.Now().Add(-90 * 24 * time.Hour)
	recent90 := 0
	posts := []socialPost{}
	for _, e := range feed.Entries {
		published, err := time.Parse(time.RFC3339, strings.TrimSpace(e.Published))
		if err != nil {
			continue
		}
		if published.After(cut90) {
			recent90++
		}
		text := strings.TrimSpace(e.Title)
		u := strings.TrimSpace(e.Link.Href)
		if validPostText(text) && isSocialPostURL("youtube", u) && len(posts) < 5 {
			posts = append(posts, socialPost{Text: text, URL: u, Published: published.Format(time.RFC3339), Origin: "youtube_rss"})
		}
	}
	persistSocialPosts(c, key, posts, nowISO())
	add(c, key, "recent_videos_90d", float64(recent90), nowISO())
	add(c, key, "youtube_channel_id", channelID, nowISO())
	return len(posts) > 0
}

func isSpecificSocialSource(s Source) bool {
	q := strings.ToLower(s.Key + " " + s.Label + " " + s.URL)
	if !strings.Contains(q, "facebook") && !strings.Contains(q, "instagram") && !strings.Contains(q, "linkedin") && !strings.Contains(q, "youtube") && !strings.Contains(q, "tiktok") {
		return false
	}
	u := strings.ToLower(strings.TrimSpace(s.URL))
	generic := []string{
		"https://www.facebook.com/", "https://facebook.com/",
		"https://www.instagram.com/", "https://instagram.com/",
		"https://www.youtube.com/", "https://youtube.com/",
		"https://www.tiktok.com/", "https://tiktok.com/",
	}
	for _, g := range generic {
		if u == g {
			return false
		}
	}
	return true
}

func runSocialContentCollector() {
	for _, c := range store.Clients {
		if c == nil {
			continue
		}
		for _, s := range c.Sources {
			if isSpecificSocialSource(s) {
				socialPageMetrics(c, s.Key)
			}
		}
	}
	saveStore()
}

func init() {
	go func() {
		time.Sleep(20 * time.Second)
		runSocialContentCollector()
		t := time.NewTicker(24 * time.Hour)
		defer t.Stop()
		for range t.C {
			runSocialContentCollector()
		}
	}()
}
