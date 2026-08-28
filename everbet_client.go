package main

import "time"

var everbetCompetitorKeys = []string{
	"cmp_efbet",
	"cmp_winbet",
	"cmp_betano",
	"cmp_palmsbet",
	"cmp_sesame",
}

func everbetSeedClient(stamp string) *Client {
	c := &Client{
		Slug: "everbet", Name: "Everbet", Sector: "Онлайн казино и спортни залози",
		Note: "Публичен профил • регулирана betting среда • без вътрешни данни",
		Sources: []Source{
			{Key: "official_site", Label: "Everbet.bg", URL: "https://everbet.bg/bg", Method: "официална платформа, продуктова и регулаторна среда", Reliability: .99},
			{Key: "casino", Label: "Everbet - Онлайн казино", URL: "https://everbet.bg/bg/online-casino", Method: "казино каталог, категории, провайдъри и публични продуктови сигнали", Reliability: .99},
			{Key: "sport", Label: "Everbet - Спорт", URL: "https://everbet.bg/bg", Method: "спортни залози, пазари, live функционалности и продуктови сигнали", Reliability: .98},
			{Key: "promotions", Label: "Everbet - Промоции", URL: "https://everbet.bg/bg/promotions/new-clients", Method: "публични бонусни механики и промоционални предложения", Reliability: .99},
			{Key: "vip", Label: "Everbet - VIP Club", URL: "https://everbet.bg/bg/everbet-vip-club-new", Method: "лоялност, VIP механики, персонализирани предложения и retention сигнали", Reliability: .99},
			{Key: "terms", Label: "Everbet - Общи условия", URL: "https://everbet.bg/bg/general-terms-and-conditions", Method: "оператор, лицензиране, KYC и правила за участие", Reliability: 1.0},
			{Key: "payments", Label: "Everbet - Депозити и тегления", URL: "https://everbet.bg/bg/deposit-and-withdrawal-rules", Method: "публични правила за плащания, депозити и тегления", Reliability: .99},
			{Key: "nra", Label: "НАП", URL: "https://nra.bg/", Method: "официална регулаторна среда и хазартен надзор", Reliability: 1.0},
			{Key: "registry", Label: "Търговски регистър", URL: "https://portal.registryagency.bg/", Method: "официални фирмени данни", Reliability: 1.0},
			{Key: "google_search", Label: "Google", URL: "https://www.google.com/", Method: "откриваемост и публична информационна среда", Reliability: .88},
			{Key: "google_news", Label: "Google News", URL: "https://news.google.com/", Method: "публични медийни сигнали и новинарски споменавания", Reliability: .90},
			{Key: "cmp_efbet", Label: "efbet", URL: "https://efbet.com/BG/homepage", Method: "пряк конкурент в лицензирания български online betting и casino market", Reliability: .96},
			{Key: "cmp_winbet", Label: "WINBET", URL: "https://winbet.bg/", Method: "пряк конкурент в лицензирания български online betting и casino market", Reliability: .96},
			{Key: "cmp_betano", Label: "Betano", URL: "https://betano.bg/", Method: "пряк конкурент в лицензирания български online betting и casino market", Reliability: .96},
			{Key: "cmp_palmsbet", Label: "Palms Bet", URL: "https://www.palmsbet.com/", Method: "пряк конкурент в лицензирания български online betting и casino market", Reliability: .96},
			{Key: "cmp_sesame", Label: "Sesame", URL: "https://sesame.bg/", Method: "пряк конкурент в лицензирания български online betting и casino market", Reliability: .95},
		},
	}

	// Verified public facts visible on Everbet's official pages at profile build time.
	// Dynamic scores are collected separately by the live probes.
	for _, x := range []struct {
		s, m string
		v    interface{}
	}{
		{"official_site", "website_active", 1.0},
		{"official_site", "operator_identified", 1.0},
		{"official_site", "bulgaria_only", 1.0},
		{"official_site", "age_18", 1.0},
		{"official_site", "kyc_active", 1.0},
		{"official_site", "responsible_gaming_tools", 1.0},
		{"official_site", "core_product_sections", 6.0},
		{"terms", "sports_license_active", 1.0},
		{"terms", "casino_license_active", 1.0},
		{"terms", "license_count", 2.0},
		{"terms", "legal_entity_eik_visible", 1.0},
		{"casino", "casino_active", 1.0},
		{"casino", "provider_min_count", 15.0},
		{"casino", "catalog_sections", 5.0},
		{"promotions", "promotions_active", 1.0},
		{"promotions", "new_client_offer_tracks", 3.0},
		{"vip", "vip_active", 1.0},
		{"payments", "visible_payment_methods", 9.0},
	} {
		add(c, x.s, x.m, x.v, stamp)
	}
	return c
}

func everbetObservedScore(c *Client, key string) float64 {
	return f(latest(c, key, "score"))
}

func everbetEffective(observed, verified float64) float64 {
	if observed > 0 {
		return observed
	}
	return verified
}

func everbetMeanObserved(c *Client, keys ...string) float64 {
	vals := []float64{}
	for _, key := range keys {
		if v := everbetObservedScore(c, key); v > 0 {
			vals = append(vals, v)
		}
	}
	if len(vals) == 0 {
		return 0
	}
	return r1(mean(vals))
}

func everbetCoverage(c *Client, keys ...string) float64 {
	if len(keys) == 0 {
		return 0
	}
	seen := 0
	for _, key := range keys {
		if everbetObservedScore(c, key) > 0 {
			seen++
		}
	}
	return r1(float64(seen) / float64(len(keys)) * 100)
}

func everbetSnapshotTrend(c *Client, current float64) float64 {
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

func everbetDashboard(c *Client) map[string]interface{} {
	webObserved := everbetObservedScore(c, "official_site")
	casinoObserved := everbetObservedScore(c, "casino")
	sportObserved := everbetObservedScore(c, "sport")
	promotionsObserved := everbetObservedScore(c, "promotions")
	vipObserved := everbetObservedScore(c, "vip")
	termsObserved := everbetObservedScore(c, "terms")
	paymentsObserved := everbetObservedScore(c, "payments")
	newsObserved := everbetObservedScore(c, "google_news")

	web := everbetEffective(webObserved, boolScore(latest(c, "official_site", "website_active")))
	casino := everbetEffective(casinoObserved, boolScore(latest(c, "casino", "casino_active")))
	sport := everbetEffective(sportObserved, boolScore(latest(c, "terms", "sports_license_active")))
	promotions := everbetEffective(promotionsObserved, boolScore(latest(c, "promotions", "promotions_active")))
	vip := everbetEffective(vipObserved, boolScore(latest(c, "vip", "vip_active")))
	terms := everbetEffective(termsObserved, boolScore(latest(c, "official_site", "operator_identified")))
	payments := everbetEffective(paymentsObserved, norm(f(latest(c, "payments", "visible_payment_methods")), 9))

	licenses := mean([]float64{
		boolScore(latest(c, "terms", "sports_license_active")),
		boolScore(latest(c, "terms", "casino_license_active")),
	})
	kyc := boolScore(latest(c, "official_site", "kyc_active"))
	responsible := boolScore(latest(c, "official_site", "responsible_gaming_tools"))
	ageGate := boolScore(latest(c, "official_site", "age_18"))
	geoRule := boolScore(latest(c, "official_site", "bulgaria_only"))
	legalEntity := boolScore(latest(c, "terms", "legal_entity_eik_visible"))

	productBreadth := norm(f(latest(c, "official_site", "core_product_sections")), 6)
	providerBreadth := norm(f(latest(c, "casino", "provider_min_count")), 15)
	casinoBreadth := norm(f(latest(c, "casino", "catalog_sections")), 5)
	paymentBreadth := norm(f(latest(c, "payments", "visible_payment_methods")), 9)
	promoBreadth := norm(f(latest(c, "promotions", "new_client_offer_tracks")), 3)
	vipActive := boolScore(latest(c, "vip", "vip_active"))

	digital := r1(meanPositive([]float64{web, casino, sport, promotions, vip, payments}))
	reputation := r1(meanPositive([]float64{licenses, kyc, responsible, ageGate, geoRule, legalEntity, terms}))
	market := r1(meanPositive([]float64{productBreadth, providerBreadth, casinoBreadth, paymentBreadth, promoBreadth, vipActive, casino, sport}))
	publicVisibility := r1(meanPositive([]float64{web, promotions, vip, newsObserved}))
	competitive := r1(meanPositive([]float64{digital, reputation, market, publicVisibility}))
	blis := r1(meanPositive([]float64{digital, reputation, market, publicVisibility, competitive}))

	benchmark := everbetMeanObserved(c, everbetCompetitorKeys...)
	relative := 0.0
	if benchmark > 0 && webObserved > 0 {
		relative = r1(webObserved / benchmark * 100)
	}
	coverageKeys := append([]string{"official_site", "casino", "sport", "promotions", "vip", "terms", "payments", "google_news"}, everbetCompetitorKeys...)
	coverage := everbetCoverage(c, coverageKeys...)
	trend := everbetSnapshotTrend(c, blis)

	competitors := []interface{}{
		map[string]interface{}{"name": "Everbet", "score": webObserved, "source": "измерен публичен web профил"},
		map[string]interface{}{"name": "efbet", "score": everbetObservedScore(c, "cmp_efbet"), "source": "пряк пазарен конкурент"},
		map[string]interface{}{"name": "WINBET", "score": everbetObservedScore(c, "cmp_winbet"), "source": "пряк пазарен конкурент"},
		map[string]interface{}{"name": "Betano", "score": everbetObservedScore(c, "cmp_betano"), "source": "пряк пазарен конкурент"},
		map[string]interface{}{"name": "Palms Bet", "score": everbetObservedScore(c, "cmp_palmsbet"), "source": "пряк пазарен конкурент"},
		map[string]interface{}{"name": "Sesame", "score": everbetObservedScore(c, "cmp_sesame"), "source": "пряк пазарен конкурент"},
	}

	return map[string]interface{}{
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": c.Note,
		"blis_index": blis, "benchmark": benchmark, "relative": relative,
		"confidence": coverage, "trend": trend, "data_updated": latestObservedAt(c),
		"nav": []interface{}{
			map[string]interface{}{"key": "overview", "label": "Общ преглед", "icon": "⌂"},
			map[string]interface{}{"key": "social", "label": "Публични сигнали", "icon": "◎"},
			map[string]interface{}{"key": "digital", "label": "Дигитална видимост", "icon": "◉"},
			map[string]interface{}{"key": "reputation", "label": "Регулация и доверие", "icon": "♡"},
			map[string]interface{}{"key": "market", "label": "Пазарни сигнали", "icon": "↗"},
			map[string]interface{}{"key": "competition", "label": "Конкурентна позиция", "icon": "⚑"},
			map[string]interface{}{"key": "reports", "label": "Месечни анализи", "icon": "▤"},
			map[string]interface{}{"key": "history", "label": "История", "icon": "◷"},
			map[string]interface{}{"key": "sources", "label": "Източници", "icon": "▥"},
			map[string]interface{}{"key": "profile", "label": "Профил", "icon": "♙"},
		},
		"indices": []interface{}{
			idx("social", "Индекс на публичната видимост", publicVisibility, "Оценява достъпността на основната платформа, промоционалната активност, VIP комуникацията и текущите публични медийни сигнали.", []interface{}{comp("Официална платформа", web, "наблюдавано"), comp("Промоции", promotions, "наблюдавано"), comp("VIP Club", vip, "наблюдавано"), comp("Новинарски сигнали", newsObserved, "наблюдавано")}, "", []string{"Everbet.bg", "Everbet - Промоции", "Everbet - VIP Club", "Google News"}),
			idx("digital", "Индекс на дигиталната видимост", digital, "Обобщава наблюдаваното публично състояние на основната платформа, казиното, спорта, промоциите, VIP и платежната среда.", []interface{}{comp("Официален сайт", web, "наблюдавано"), comp("Онлайн казино", casino, "наблюдавано"), comp("Спорт", sport, "наблюдавано"), comp("Промоции", promotions, "наблюдавано"), comp("VIP Club", vip, "наблюдавано"), comp("Плащания", payments, "наблюдавано")}, "", []string{"Everbet.bg", "Everbet - Онлайн казино", "Everbet - Промоции", "Everbet - VIP Club", "Everbet - Депозити и тегления"}),
			idx("reputation", "Индекс на регулаторното доверие", reputation, "Използва само публично проверими сигнали за лицензиране, идентификация на оператора, KYC, отговорна игра, възрастови и географски ограничения.", []interface{}{comp("Лицензирани направления", licenses, "потвърдено"), comp("KYC", kyc, "потвърдено"), comp("Responsible gaming", responsible, "потвърдено"), comp("18+ ограничение", ageGate, "потвърдено"), comp("Териториално правило", geoRule, "потвърдено"), comp("Публична фирмена идентификация", legalEntity, "потвърдено")}, "", []string{"Everbet - Общи условия", "Everbet.bg", "НАП", "Търговски регистър"}),
			idx("interest", "Индекс на продуктовия и пазарния профил", market, "Оценява широчината на продуктовото предложение, казино каталога, провайдърите, платежната среда, welcome механиките и VIP програмата.", []interface{}{comp("Основни продуктови секции", productBreadth, "потвърдено"), comp("Казино провайдъри", providerBreadth, "потвърдено"), comp("Каталог и категории", casinoBreadth, "потвърдено"), comp("Платежни методи", paymentBreadth, "потвърдено"), comp("Welcome предложения", promoBreadth, "потвърдено"), comp("VIP програма", vipActive, "потвърдено")}, "", []string{"Everbet.bg", "Everbet - Онлайн казино", "Everbet - Промоции", "Everbet - VIP Club", "Everbet - Депозити и тегления"}),
			idx("competitive", "Индекс на конкурентната позиция", competitive, "BLIS производна от дигиталното присъствие, регулаторното доверие, продуктовата широчина и публичната видимост. Преките конкуренти се измерват по една и съща web процедура.", []interface{}{comp("Дигитална видимост", digital, "реални входни данни"), comp("Регулаторно доверие", reputation, "проверими входни данни"), comp("Продуктов профил", market, "проверими входни данни"), comp("Публична видимост", publicVisibility, "наблюдавани сигнали")}, "", []string{"Everbet.bg", "efbet", "WINBET", "Betano", "Palms Bet", "Sesame"}),
		},
		"metrics": []interface{}{
			met("Лицензирани направления", "2 · спорт и онлайн казино"),
			met("Основни продуктови секции", "6 · спорт, казино, live, промоции, турнири, VIP"),
			met("Видими платежни метода", "9"),
			met("Казино провайдъри", "15+ публично видими"),
		},
		"signals": []interface{}{
			sig("positive", "Комбиниран sport и casino продукт", "Everbet събира спортни залози, казино, Live Casino, турнири, промоции и VIP механики в една клиентска среда."),
			sig("positive", "Ясна публична регулаторна идентичност", "Публичните условия идентифицират оператора Евърбет БГ ЕООД, ЕИК 207058661, и активни лицензи за спортни залози и онлайн казино."),
			sig("positive", "Retention слой чрез VIP и промоции", "VIP Club и многостепенната промоционална среда създават отделна зона за лоялност и повторна активност."),
			sig("watch", "Висока конкурентна интензивност", "Everbet работи в пазар с силни директни конкуренти като efbet, WINBET, Betano, Palms Bet и Sesame."),
			sig("watch", "Промоционалната диференциация е динамична", "Welcome предложенията и бонусните механики се променят бързо и изискват постоянно конкурентно наблюдение."),
			sig("watch", "Регулаторната среда е постоянен фактор", "KYC, responsible gaming, рекламни ограничения и лицензионни изисквания трябва да се следят като отделен риск и репутационен сигнал."),
		},
		"competitors": competitors,
	}
}

func runEverbetEngine(c *Client, createSnapshot bool) EngineStatus {
	setEngineStatus(EngineStatus{Version: "2.9-portal-finalqa", Running: true, LastRun: engineSnapshot().LastRun})
	results := []ConnectorResult{}
	specs := []struct {
		key   string
		terms []string
	}{
		{"official_site", []string{"everbet", "казино", "спорт", "промоции", "лиценз"}},
		{"casino", []string{"казино", "игри", "слот", "live", "provider"}},
		{"sport", []string{"спорт", "залози", "коефициент", "live"}},
		{"promotions", []string{"промоции", "бонус", "нов клиент", "free"}},
		{"vip", []string{"vip", "клуб", "бонус", "привилегии"}},
		{"terms", []string{"лиценз", "Евърбет БГ", "НАП", "18"}},
		{"payments", []string{"депозит", "теглене", "карта", "payment"}},
		{"cmp_efbet", []string{"спорт", "казино", "залози", "live"}},
		{"cmp_winbet", []string{"спорт", "казино", "залози", "бонус"}},
		{"cmp_betano", []string{"спорт", "казино", "залози", "live"}},
		{"cmp_palmsbet", []string{"спорт", "казино", "live", "лоялност"}},
		{"cmp_sesame", []string{"спорт", "казино", "залози", "live"}},
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
		d := everbetDashboard(c)
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
