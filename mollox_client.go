package main

import (
	"fmt"
	"math"
)

// molloxSeedClient configures the public-data profile for MOLLOX Bulgaria.
// Seeded observations are limited to facts that are explicitly visible in
// MOLLOX's public pages. Dynamic web scores are added only by the live probes.
func molloxSeedClient(stamp string) *Client {
	c := &Client{
		Slug: "mollox", Name: "MOLLOX България", Sector: "Професионална хигиена / B2B решения",
		Note: "Публичен профил • данните са от проверими публични източници",
		Sources: []Source{
			{Key: "official_site", Label: "MOLLOX България", URL: "https://mollox.bg/", Method: "официален сайт, продуктова и корпоративна среда", Reliability: .99},
			{Key: "products", Label: "MOLLOX – Продукти", URL: "https://mollox.bg/products", Method: "продуктово портфолио, категории и индустрии", Reliability: .99},
			{Key: "private_label", Label: "MOLLOX – Private Label", URL: "https://mollox.bg/private-label", Method: "индивидуални формули, опаковки, дизайн и логистика", Reliability: .99},
			{Key: "contact", Label: "MOLLOX – Контакти и дистрибутори", URL: "https://mollox.bg/contact-us", Method: "дистрибуторска мрежа и публични контакти", Reliability: .99},
			{Key: "news", Label: "MOLLOX – Новини", URL: "https://mollox.bg/aktualno/", Method: "публично съдържание и секторни теми", Reliability: .98},
			{Key: "facebook", Label: "Facebook – MOLLOX България", URL: "https://www.facebook.com/molloxbg/", Method: "официален публичен социален профил", Reliability: .94},
			{Key: "linkedin", Label: "LinkedIn – MOLLOX България", URL: "https://www.linkedin.com/company/mollox-bulgaria", Method: "официален корпоративен B2B профил", Reliability: .97},
			{Key: "google_search", Label: "Google", URL: "https://www.google.com/", Method: "откриваемост и публична информационна среда", Reliability: .88},
			{Key: "google_trends", Label: "Google Trends", URL: "https://trends.google.com/", Method: "относителен интерес при търсене", Reliability: .92},
			{Key: "registry", Label: "Търговски регистър", URL: "https://portal.registryagency.bg/", Method: "официални фирмени данни", Reliability: 1.0},
			{Key: "nsi", Label: "НСИ", URL: "https://www.nsi.bg/", Method: "секторни и икономически показатели", Reliability: .98},
			{Key: "ec_echa", Label: "ECHA", URL: "https://echa.europa.eu/", Method: "европейска регулаторна среда за химични продукти", Reliability: 1.0},
			{Key: "ec_biocides", Label: "European Commission – Biocides", URL: "https://health.ec.europa.eu/biocides/overview_en", Method: "официална регулаторна среда за биоциди", Reliability: 1.0},
			{Key: "cmp_hagleitner", Label: "Hagleitner България", URL: "https://www.hagleitner.com/bg/", Method: "директен конкурент в професионалната хигиена на българския пазар", Reliability: .97},
			{Key: "cmp_katrinmax", Label: "Katrin Max / BePure", URL: "https://katrin-max.com/", Method: "директен конкурент и доставчик на професионални хигиенни решения в България", Reliability: .96},
			{Key: "cmp_hygimarket", Label: "Hygimarket", URL: "https://hygimarket.bg/", Method: "професионална хигиена, консумативи и решения за бизнес клиенти в България", Reliability: .94},
			{Key: "cmp_euroshine", Label: "Euroshine", URL: "https://euroshinebg.com/", Method: "професионална хигиена, дезинфекция и дозиращи решения в България", Reliability: .94},
		},
	}

	// Publicly verified facts from mollox.bg as of the current profile build.
	for _, x := range []struct {
		s, m string
		v    interface{}
	}{
		{"official_site", "website_active", 1.0},
		{"official_site", "iso_9001", 1.0},
		{"official_site", "iso_14001", 1.0},
		{"official_site", "technical_docs", 1.0},
		{"official_site", "sds_tds", 1.0},
		{"official_site", "health_ministry_authorized_disinfectants", 1.0},
		{"official_site", "german_lab", 1.0},
		{"official_site", "association_member", 1.0},
		{"products", "industry_count", 4.0},
		{"private_label", "service_active", 1.0},
		{"private_label", "product_types", 8.0},
		{"private_label", "full_service", 1.0},
		{"contact", "regional_distributors", 5.0},
	} {
		add(c, x.s, x.m, x.v, stamp)
	}
	return c
}

func molloxObservedScore(c *Client, key string) float64 {
	return f(latest(c, key, "score"))
}

func molloxMeanObserved(c *Client, keys ...string) float64 {
	vals := []float64{}
	for _, key := range keys {
		if v := molloxObservedScore(c, key); v > 0 {
			vals = append(vals, v)
		}
	}
	if len(vals) == 0 {
		return 0
	}
	return r1(mean(vals))
}

func molloxCoverage(c *Client, keys ...string) float64 {
	if len(keys) == 0 {
		return 0
	}
	seen := 0
	for _, key := range keys {
		if molloxObservedScore(c, key) > 0 {
			seen++
		}
	}
	return r1(float64(seen) / float64(len(keys)) * 100)
}

func molloxSnapshotTrend(c *Client, current float64) float64 {
	for i := len(c.Snapshots) - 1; i >= 0; i-- {
		if c.Snapshots[i].Payload == nil {
			continue
		}
		if v, ok := c.Snapshots[i].Payload["blis_index"]; ok {
			prev := f(v)
			if prev > 0 {
				return r1(current - prev)
			}
		}
	}
	return 0
}

func molloxDashboard(c *Client) map[string]interface{} {
	// Every dynamic input below is an observed probe result. Verified binary facts
	// are used only where the official MOLLOX site explicitly states them.
	web := molloxObservedScore(c, "official_site")
	products := molloxObservedScore(c, "products")
	privateLabelWeb := molloxObservedScore(c, "private_label")
	contactWeb := molloxObservedScore(c, "contact")
	newsWeb := molloxObservedScore(c, "news")
	facebookWeb := molloxObservedScore(c, "facebook")
	linkedinWeb := molloxObservedScore(c, "linkedin")

	iso := mean([]float64{
		boolScore(latest(c, "official_site", "iso_9001")),
		boolScore(latest(c, "official_site", "iso_14001")),
	})
	docs := mean([]float64{
		boolScore(latest(c, "official_site", "technical_docs")),
		boolScore(latest(c, "official_site", "sds_tds")),
	})
	regulatory := boolScore(latest(c, "official_site", "health_ministry_authorized_disinfectants"))
	lab := boolScore(latest(c, "official_site", "german_lab"))
	association := boolScore(latest(c, "official_site", "association_member"))
	industries := norm(f(latest(c, "products", "industry_count")), 4)
	productTypes := norm(f(latest(c, "private_label", "product_types")), 8)
	distributors := norm(f(latest(c, "contact", "regional_distributors")), 5)
	privateLabel := boolScore(latest(c, "private_label", "service_active"))

	// BLIS indices are derived only from observed/verified public inputs.
	// Missing dynamic observations contribute 0 and are visible through coverage.
	digital := r1(meanPositive([]float64{web, products, privateLabelWeb, contactWeb, newsWeb}))
	reputation := r1(meanPositive([]float64{iso, docs, regulatory, lab, association}))
	market := r1(meanPositive([]float64{products, privateLabelWeb, contactWeb, industries, productTypes, distributors, privateLabel}))
	socialIndex := r1(meanPositive([]float64{facebookWeb, linkedinWeb, newsWeb}))
	competitive := r1(meanPositive([]float64{digital, reputation, market}))
	blis := r1(meanPositive([]float64{digital, reputation, market, socialIndex, competitive}))

	competitorKeys := []string{"cmp_hagleitner", "cmp_katrinmax", "cmp_hygimarket", "cmp_euroshine"}
	benchmark := molloxMeanObserved(c, competitorKeys...)
	relative := 0.0
	if benchmark > 0 && web > 0 {
		relative = r1(web / benchmark * 100)
	}
	coverageKeys := []string{"official_site", "products", "private_label", "contact", "news", "facebook", "linkedin", "cmp_hagleitner", "cmp_katrinmax", "cmp_hygimarket", "cmp_euroshine"}
	coverage := molloxCoverage(c, coverageKeys...)
	trend := molloxSnapshotTrend(c, blis)

	competitors := []interface{}{
		map[string]interface{}{"name": "MOLLOX България", "score": web, "source": "измерен публичен web профил"},
		map[string]interface{}{"name": "Hagleitner България", "score": molloxObservedScore(c, "cmp_hagleitner"), "source": "измерен публичен web профил"},
		map[string]interface{}{"name": "Katrin Max / BePure", "score": molloxObservedScore(c, "cmp_katrinmax"), "source": "измерен публичен web профил"},
		map[string]interface{}{"name": "Hygimarket", "score": molloxObservedScore(c, "cmp_hygimarket"), "source": "измерен публичен web профил"},
		map[string]interface{}{"name": "Euroshine", "score": molloxObservedScore(c, "cmp_euroshine"), "source": "измерен публичен web профил"},
	}

	return map[string]interface{}{
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": c.Note,
		"blis_index": blis, "benchmark": benchmark, "relative": relative,
		"confidence": coverage, "trend": trend, "data_updated": latestObservedAt(c),
		"indices": []interface{}{
			idx("social", "Индекс на социалното присъствие", socialIndex, "Изчислява се само от текущо измерени публични Facebook, LinkedIn и новинарски сигнали.", []interface{}{comp("Facebook", facebookWeb, "измерено"), comp("LinkedIn", linkedinWeb, "измерено"), comp("Публично съдържание", newsWeb, "измерено")}, "", []string{"Facebook", "LinkedIn", "MOLLOX – Новини"}),
			idx("digital", "Индекс на дигиталната видимост", digital, "Средна стойност от текущо измерените публични web профили на сайта, продуктите, Private Label, контактите и новините.", []interface{}{comp("Официален сайт", web, "измерено"), comp("Продукти", products, "измерено"), comp("Private Label", privateLabelWeb, "измерено"), comp("Контакти", contactWeb, "измерено"), comp("Новини", newsWeb, "измерено")}, "", []string{"MOLLOX България", "MOLLOX – Продукти", "MOLLOX – Private Label", "MOLLOX – Контакти и дистрибутори", "MOLLOX – Новини"}),
			idx("reputation", "Индекс на репутацията", reputation, "Използва единствено публично потвърдени доверителни сигнали от официалния профил: ISO, SDS/TDS, разрешителни, лабораторен подход и браншово членство.", []interface{}{comp("ISO 9001 и ISO 14001", iso, "потвърдено"), comp("SDS / TDS документация", docs, "потвърдено"), comp("Разрешителни за дезинфектанти", regulatory, "потвърдено"), comp("Специализирана лаборатория", lab, "потвърдено"), comp("Браншово членство", association, "потвърдено")}, "", []string{"MOLLOX България"}),
			idx("interest", "Индекс на пазарния профил", market, "Изчислява се от измеримото продуктово, индустриално, Private Label и дистрибуторско покритие.", []interface{}{comp("Продуктова страница", products, "измерено"), comp("Private Label", privateLabelWeb, "измерено"), comp("Контактна и дистрибуторска среда", contactWeb, "измерено"), comp("4 индустриални направления", industries, "потвърдено"), comp("8 Private Label типа", productTypes, "потвърдено"), comp("5 регионални дистрибутора", distributors, "потвърдено")}, "", []string{"MOLLOX – Продукти", "MOLLOX – Private Label", "MOLLOX – Контакти и дистрибутори"}),
			idx("competitive", "Индекс на конкурентната позиция", competitive, "BLIS производна от реално наблюдаваните дигитални, репутационни и пазарни входни данни. Сравнителните web оценки на конкурентите се измерват по една и съща процедура.", []interface{}{comp("Дигитална видимост", digital, "реални входни данни"), comp("Репутационни сигнали", reputation, "реални входни данни"), comp("Пазарен профил", market, "реални входни данни")}, "", []string{"MOLLOX България", "Hagleitner България", "Katrin Max / BePure", "Hygimarket", "Euroshine"}),
		},
		"metrics": []interface{}{
			met("Индустриални направления", "4"),
			met("Private Label продуктови типа", "8"),
			met("Регионални дистрибутори", "5"),
			met("ISO стандарти", "ISO 9001:2015 · ISO 14001:2015"),
		},
		"signals": []interface{}{
			sig("positive", "Пълна техническа документация", "Официалният сайт посочва SDS и TDS документация за продуктите и решенията."),
			sig("positive", "Private Label е публично потвърдена услуга", "Публичната страница описва формулиране, опаковки, дизайн на етикет и логистика."),
			sig("positive", "Регионална дистрибуция", "Публично са посочени пет регионални дистрибутора: София, Велико Търново, Бургас, Смолян/Пампорово и Сандански/Банско/Благоевград."),
		},
		"competitors": competitors,
	}
}

func runMolloxEngine(c *Client, createSnapshot bool) EngineStatus {
	setEngineStatus(EngineStatus{Version: "2.9-portal-finalqa", Running: true, LastRun: engineSnapshot().LastRun})
	results := []ConnectorResult{}
	specs := []struct {
		key   string
		terms []string
	}{
		{"official_site", []string{"mollox", "професионал", "хигиен", "iso", "sds", "tds"}},
		{"products", []string{"продукт", "хигиен", "horeca", "дезинф"}},
		{"private_label", []string{"private label", "собствена марка", "формул", "опаков", "логист"}},
		{"contact", []string{"дистрибутор", "софия", "велико търново", "бургас", "смолян", "сандански"}},
		{"news", []string{"mollox", "хигиен", "eurotier"}},
		{"facebook", []string{"mollox"}},
		{"linkedin", []string{"mollox", "bulgaria"}},
		{"cmp_hagleitner", []string{"hygiene", "хигиен", "professional", "дезинф"}},
		{"cmp_katrinmax", []string{"хигиен", "професионал", "horeca"}},
		{"cmp_hygimarket", []string{"хигиен", "почиств", "професионал"}},
		{"cmp_euroshine", []string{"хигиен", "дезинф", "дозира"}},
	}
	for _, sp := range specs {
		results = append(results, probeGenericSource(c, sp.key, sp.terms))
	}
	suc, fail := 0, 0
	for _, r := range results {
		if r.OK {
			suc++
		} else {
			fail++
		}
	}
	if createSnapshot {
		d := molloxDashboard(c)
		c.Snapshots = append(c.Snapshots, Snapshot{CreatedAt: nowISO(), Payload: d})
		if len(c.Snapshots) > 400 {
			c.Snapshots = c.Snapshots[len(c.Snapshots)-400:]
		}
		saveStore()
	}
	st := EngineStatus{Version: "2.9-portal-finalqa", Running: false, LastRun: nowISO(), NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339), Successful: suc, Failed: fail, Results: results}
	setEngineStatus(st)
	return st
}

var _ = math.Max
