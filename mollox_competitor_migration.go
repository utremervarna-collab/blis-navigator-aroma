package main

import (
	"strings"
	"time"
)

// normalizeMolloxCompetitorSet removes the superseded demo competitors from
// persisted stores and installs exactly the verified MOLLOX competitor set.
func normalizeMolloxCompetitorSet(c *Client) {
	if c == nil {
		return
	}

	competitors := []Source{
		{Key: "cmp_hmi", Label: "Хигиенно-медицинска индустрия", URL: "https://www.hmi-company.com/", Method: "български производител на професионални продукти за дезинфекция, почистване, индустриални течности и водообработка", Reliability: .99},
		{Key: "cmp_hagleitner", Label: "Hagleitner България", URL: "https://www.hagleitner.com/bg/", Method: "професионална хигиена, дезинфекция, дозатори, дозиращи системи и дигитални решения", Reliability: .99},
		{Key: "cmp_bulclean", Label: "Булклийн", URL: "https://bulclean.bg/", Method: "професионални почистващи препарати и решения; официален вносител на Evans Vanodine", Reliability: .98},
		{Key: "cmp_pachico", Label: "Пачико", URL: "https://pachico.net/", Method: "професионална хигиена, почистващи и дезинфекционни продукти; производител и B2B доставчик", Reliability: .97},
		{Key: "cmp_albis", Label: "Албис", URL: "https://albis.bg/", Method: "професионални почистващи и дезинфекционни препарати, хигиенно оборудване и консумативи", Reliability: .99},
		{Key: "cmp_calvatis", Label: "Calvatis Hygiene България / Calgonit Industrial", URL: "https://www.calvatis.com/bg/", Method: "почистващи и дезинфекционни решения за ХВП, напитки, млекопреработка, земеделие, водообработка и системно инженерство", Reliability: .99},
	}

	base := make([]Source, 0, len(c.Sources)+len(competitors))
	for _, src := range c.Sources {
		if strings.HasPrefix(src.Key, "cmp_") {
			continue
		}
		base = append(base, src)
	}
	base = append(base, competitors...)
	c.Sources = base

	allowed := map[string]bool{
		"cmp_hmi": true, "cmp_hagleitner": true, "cmp_bulclean": true,
		"cmp_pachico": true, "cmp_albis": true, "cmp_calvatis": true,
	}
	obs := c.Observations[:0]
	for _, o := range c.Observations {
		if strings.HasPrefix(o.SourceKey, "cmp_") && !allowed[o.SourceKey] {
			continue
		}
		obs = append(obs, o)
	}
	c.Observations = obs
}

func init() {
	go func() {
		// ensureStore() runs in main; allow it to finish loading any persisted snapshot.
		time.Sleep(1200 * time.Millisecond)
		deadline := time.Now().Add(20 * time.Second)
		for time.Now().Before(deadline) {
			mu.Lock()
			c := store.Clients["mollox"]
			if c != nil {
				normalizeMolloxCompetitorSet(c)
				mu.Unlock()
				saveStore()
				// Populate current observed scores for the new competitors immediately.
				runMolloxEngine(c, true)
				return
			}
			mu.Unlock()
			time.Sleep(250 * time.Millisecond)
		}
	}()
}
