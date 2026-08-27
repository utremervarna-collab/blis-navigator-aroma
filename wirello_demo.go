package main

import "time"

// Wirello Market is a fictional, investor-facing demonstration profile.
// Every value is synthetic and exists only to demonstrate the Navigator flow.
func wirelloSeedClient(stamp string) *Client {
	c := &Client{
		Slug: "wirello", Name: "Wirello Market", Sector: "Търговска верига / модерен ритейл",
		Note: "Публичен демо профил • всички организации, стойности и сигнали са демонстрационни",
		Sources: []Source{
			{Key: "demo_web", Label: "Wirello Market — демо сайт", URL: "https://example.com/", Method: "демонстрационен дигитален източник", Reliability: .98},
			{Key: "demo_search", Label: "Търсене и откриваемост", URL: "https://trends.google.com/", Method: "демонстрационна динамика на интереса", Reliability: .91},
			{Key: "demo_reviews", Label: "Потребителски оценки", URL: "https://www.google.com/maps", Method: "демонстрационна агрегирана репутационна база", Reliability: .90},
			{Key: "demo_social", Label: "Социални канали", URL: "https://www.facebook.com/", Method: "демонстрационна публична активност", Reliability: .84},
			{Key: "demo_media", Label: "Медийна среда", URL: "https://news.google.com/", Method: "демонстрационен новинарски мониторинг", Reliability: .88},
			{Key: "demo_ads", Label: "Рекламна активност", URL: "https://www.facebook.com/ads/library/", Method: "демонстрационна рекламна видимост", Reliability: .89},
			{Key: "demo_sector", Label: "Секторен контекст", URL: "https://www.nsi.bg/", Method: "демонстрационна секторна база", Reliability: .98},
			{Key: "demo_competitors", Label: "Конкурентно наблюдение", URL: "https://example.com/", Method: "демонстрационни конкурентни профили", Reliability: .87},
		},
	}
	for _, x := range []struct{ s, m string; v interface{} }{
		{"demo_web", "website_active", 1.0}, {"demo_web", "ecommerce_active", 1.0}, {"demo_web", "store_locator", 1.0},
		{"demo_search", "search_visibility", 76.0}, {"demo_search", "interest_change", 8.4},
		{"demo_reviews", "rating", 4.3}, {"demo_reviews", "review_count", 1842.0}, {"demo_reviews", "positive_share", 78.0},
		{"demo_social", "followers", 28600.0}, {"demo_social", "visible_posts_30d", 18.0}, {"demo_social", "engagement_rate", 3.8},
		{"demo_media", "news_mentions_30d", 27.0}, {"demo_ads", "active_campaigns", 6.0},
		{"demo_sector", "category_growth", 4.6}, {"demo_competitors", "share_of_voice", 23.0},
	} { add(c, x.s, x.m, x.v, stamp) }
	return c
}

func wirelloDashboard(c *Client) map[string]interface{} {
	return map[string]interface{}{
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": c.Note,
		"blis_index": 74.6, "benchmark": 69.2, "relative": 107.8, "confidence": 91.0, "trend": 3.7, "data_updated": latestObservedAt(c),
		"indices": []interface{}{
			idx("market", "Индекс на пазарните сигнали", 72.4, "Обобщава динамиката на категорията, търсенето и видимите промени в потребителския интерес.", []interface{}{comp("Категориен интерес", 76.0, "40%"), comp("Секторна динамика", 68.0, "30%"), comp("Промоционална активност", 71.0, "30%")}, "Претеглен демонстрационен модел.", []string{"Търсене", "Секторен контекст", "Рекламна активност"}),
			idx("digital", "Индекс на дигиталната видимост", 78.1, "Оценява откриваемостта, съдържанието, онлайн услугите и свързаните дигитални точки.", []interface{}{comp("Откриваемост", 76.0, "35%"), comp("Собствени активи", 84.0, "35%"), comp("Съдържателна активност", 74.0, "30%")}, "Претеглен демонстрационен модел.", []string{"Демо сайт", "Търсене", "Социални канали"}),
			idx("reputation", "Индекс на репутацията", 75.8, "Показва силата и устойчивостта на публичното потребителско възприятие.", []interface{}{comp("Средна оценка", 86.0, "45%"), comp("Позитивен дял", 78.0, "35%"), comp("Репутационна стабилност", 61.0, "20%")}, "Претеглен демонстрационен модел.", []string{"Потребителски оценки", "Медийна среда"}),
			idx("social", "Индекс на социалната активност", 70.3, "Проследява честотата, аудиторията и видимото взаимодействие в социалните канали.", []interface{}{comp("Аудитория", 73.0, "35%"), comp("Публикационна активност", 69.0, "35%"), comp("Взаимодействие", 69.0, "30%")}, "Претеглен демонстрационен модел.", []string{"Социални канали"}),
			idx("competitive", "Индекс на конкурентната позиция", 73.7, "Сравнява Wirello Market с демонстрационна група от ритейл конкуренти.", []interface{}{comp("Share of voice", 74.0, "35%"), comp("Дигитална позиция", 78.0, "35%"), comp("Репутационна позиция", 69.0, "30%")}, "Претеглен демонстрационен модел.", []string{"Конкурентно наблюдение"}),
		},
		"metrics": []interface{}{met("Потребителска оценка", "4.3/5"), met("Публични оценки", "1 842"), met("Промяна в интереса", "+8.4%"), met("Медийни споменавания", "27")},
		"signals": []interface{}{
			sig("positive", "Ръст на интереса към седмичните предложения", "Демонстрационният модел отчита устойчиво увеличение през последните две седмици."),
			sig("watch", "Повтаряща се тема за наличностите", "Нараства делът на коментарите за липсващи промоционални продукти в две локации."),
			sig("positive", "По-силна дигитална откриваемост", "Wirello Market се придвижва над демонстрационния секторен benchmark."),
			sig("watch", "Конкурентна промоционална активност", "Два наблюдавани конкурента увеличават интензитета на кампаниите."),
		},
		"competitors": []interface{}{
			map[string]interface{}{"name": "Wirello Market", "score": 73.7, "website": 78.1, "news": 72.0, "rating": 4.3, "ratings": 1842, "activity": 74.0},
			map[string]interface{}{"name": "Northline Market", "score": 76.2, "website": 81.0, "news": 69.0, "rating": 4.2, "ratings": 2310, "activity": 79.0},
			map[string]interface{}{"name": "Urban Basket", "score": 70.1, "website": 69.0, "news": 74.0, "rating": 4.1, "ratings": 1560, "activity": 68.0},
			map[string]interface{}{"name": "Daily Point", "score": 67.8, "website": 66.0, "news": 65.0, "rating": 4.0, "ratings": 1215, "activity": 70.0},
		},
	}
}

func wirelloDemoSnapshots(c *Client) []Snapshot {
	values := []float64{68.9, 69.7, 70.4, 71.2, 72.0, 72.8, 73.5, 74.6}
	out := make([]Snapshot, 0, len(values))
	for i, v := range values {
		d := wirelloDashboard(c)
		d["blis_index"] = v
		d["trend"] = 0.0
		if rows, ok := d["indices"].([]interface{}); ok {
			for _, row := range rows {
				if m, ok := row.(map[string]interface{}); ok {
					if x, ok := m["value"].(float64); ok { m["value"] = x - (74.6-v)*0.7 }
				}
			}
		}
		stamp := time.Now().AddDate(0, 0, -(len(values)-1-i)*4).Format(time.RFC3339)
		out = append(out, Snapshot{CreatedAt: stamp, Payload: d})
	}
	return out
}
