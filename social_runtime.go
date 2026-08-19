package main

import (
	"encoding/xml"
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

var socialMetricRE = regexp.MustCompile(`(?i)([0-9][0-9.,\s]*|[0-9]+(?:[.,][0-9]+)?\s*[KMB])\s+(followers|последователи|subscribers|абонати|posts|публикации|videos|видеа|likes|харесвания)`)

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
		if !strings.ContainsAny(s, "KM B") {
			s = strings.ReplaceAll(s, ",", "")
			if strings.Count(s, ".") > 1 || (strings.Count(s, ".") == 1 && len(strings.Split(s, ".")[1]) == 3) {
				s = strings.ReplaceAll(s, ".", "")
			}
		}
	}
	v, _ := strconv.ParseFloat(s, 64)
	return v * mult
}

func socialPageMetrics(c *Client, key string) {
	src := sourceByKey(c, key)
	if src == nil || src.URL == "" {
		return
	}
	status, body, _, err := timedFetch(src.URL, 4*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return
	}
	stamp := nowISO()
	add(c, key, "profile_active", 1.0, stamp)
	clean := stripHTML(body)
	for _, m := range socialMetricRE.FindAllStringSubmatch(clean, -1) {
		if len(m) < 3 {
			continue
		}
		v := compactSocialNumber(m[1])
		if v <= 0 {
			continue
		}
		kind := strings.ToLower(m[2])
		switch {
		case strings.Contains(kind, "follower"), strings.Contains(kind, "последовател"), strings.Contains(kind, "subscriber"), strings.Contains(kind, "абонат"):
			add(c, key, "followers", v, stamp)
		case strings.Contains(kind, "post"), strings.Contains(kind, "публикац"), strings.Contains(kind, "video"), strings.Contains(kind, "виде"):
			add(c, key, "visible_posts", v, stamp)
		case strings.Contains(kind, "like"), strings.Contains(kind, "харес"):
			add(c, key, "likes", v, stamp)
		}
	}
	if strings.Contains(strings.ToLower(key+" "+src.Label+" "+src.URL), "youtube") {
		collectYouTubeFeed(c, key, src.URL, body)
	}
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

func collectYouTubeFeed(c *Client, key, rawURL, pageBody string) {
	channelID := youtubeChannelID(rawURL, pageBody)
	if channelID == "" {
		return
	}
	feedURL := "https://www.youtube.com/feeds/videos.xml?channel_id=" + channelID
	status, body, _, err := timedFetch(feedURL, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return
	}
	var feed youtubeAtomFeed
	if xml.Unmarshal([]byte(body), &feed) != nil || len(feed.Entries) == 0 {
		return
	}
	cut90 := time.Now().Add(-90 * 24 * time.Hour)
	recent90 := 0
	for i, e := range feed.Entries {
		published, err := time.Parse(time.RFC3339, strings.TrimSpace(e.Published))
		if err != nil {
			continue
		}
		if published.After(cut90) {
			recent90++
		}
		if i < 8 && strings.TrimSpace(e.Title) != "" {
			stamp := published.Format(time.RFC3339)
			add(c, key, "post_"+strconv.Itoa(i+1)+"_text", strings.TrimSpace(e.Title), stamp)
			if strings.TrimSpace(e.Link.Href) != "" {
				add(c, key, "post_"+strconv.Itoa(i+1)+"_url", strings.TrimSpace(e.Link.Href), stamp)
			}
		}
	}
	add(c, key, "recent_videos_90d", float64(recent90), nowISO())
	add(c, key, "youtube_channel_id", channelID, nowISO())
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
		time.Sleep(55 * time.Second)
		runSocialContentCollector()
		t := time.NewTicker(24 * time.Hour)
		defer t.Stop()
		for range t.C {
			runSocialContentCollector()
		}
	}()
}
