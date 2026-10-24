package main

// Ariel Fish uses the canonical Navigator dashboard data contract.
// Only publicly evidenced facts are displayed. Unknown signals are explicitly unmeasured.
func ensureArielFishClient() {
	if store.Clients == nil { store.Clients = map[string]*Client{} }
	if store.Clients["ariel-fish"] != nil { return }
	store.Clients["ariel-fish"] = &Client{
		Slug:"ariel-fish", Name:"Ариел Фиш", Sector:"Рибопреработка и дистрибуция",
		Note:"Публичен аналитичен профил · липсващите измервания не се представят като нула",
		Sources:[]Source{
			{Key:"official_site",Label:"Ариел Фиш – официален сайт",URL:"https://arielfish.com/",Method:"корпоративно и продуктово съдържание",Reliability:.98},
			{Key:"products",Label:"Ариел Фиш – продукти",URL:"https://arielfish.com/produkti",Method:"публичен продуктов каталог",Reliability:.98},
			{Key:"reputation",Label:"Публичен бизнес профил",URL:"https://www.oink.bg/biz/ariel_fish_ood",Method:"външни публични отзиви, изискващи актуална проверка",Reliability:.7},
			{Key:"cmp_michik",Label:"Мичик",URL:"https://www.michik.bg/products",Method:"продуктово конкурентно сравнение",Reliability:.93},
			{Key:"cmp_odesos",Label:"Одесос",URL:"https://food-exhibitions.bg/main/odesos/",Method:"продуктово конкурентно сравнение",Reliability:.86},
			{Key:"cmp_sever",Label:"Север Експорт",URL:"https://severexport.com/",Method:"риба и дистрибуция",Reliability:.88},
			{Key:"cmp_fishland",Label:"Fishland / Атлантик",URL:"https://fishland.bg/about-us",Method:"дистрибуторски пазарен ориентир",Reliability:.89},
		},
	}
}

func arielFishDashboard(c *Client) map[string]interface{} {
	competitors := []interface{}{
		map[string]interface{}{"name":"Ариел Фиш","score":nil,"source":"https://arielfish.com/"},
		map[string]interface{}{"name":"Мичик","score":nil,"source":"https://www.michik.bg/products"},
		map[string]interface{}{"name":"Одесос","score":nil,"source":"https://food-exhibitions.bg/main/odesos/"},
		map[string]interface{}{"name":"Север Експорт","score":nil,"source":"https://severexport.com/"},
		map[string]interface{}{"name":"Fishland / Атлантик","score":nil,"source":"https://fishland.bg/about-us"},
	}
	return map[string]interface{}{
		"client":c.Slug,"name":c.Name,"sector":c.Sector,"note":c.Note,
		"blis_index":nil,"benchmark":nil,"relative":nil,"trend":nil,"confidence":nil,"data_updated":nil,
		"nav":[]interface{}{
			map[string]interface{}{"key":"overview","label":"Общ изглед","icon":"⌂"},
			map[string]interface{}{"key":"live","label":"Мониторинг","icon":"◉"},
			map[string]interface{}{"key":"digital","label":"Дигитално присъствие","icon":"◎"},
			map[string]interface{}{"key":"reputation","label":"Репутация","icon":"✦"},
			map[string]interface{}{"key":"market","label":"Търговски канали","icon":"▤"},
			map[string]interface{}{"key":"competition","label":"Конкуренти","icon":"◈"},
			map[string]interface{}{"key":"signals","label":"Сигнали","icon":"◇"},
			map[string]interface{}{"key":"reports","label":"Доклади","icon":"▣"},
			map[string]interface{}{"key":"sources","label":"Източници","icon":"↗"},
		},
		"indices":[]interface{}{},
		"metrics":[]interface{}{
			met("Основана","2010 г."),
			met("Основни продуктови групи","Мариновани, пушени и веяни продукти · филета · хайвер"),
			met("Конкуренти за наблюдение","4"),
			met("Социални профили","Не са потвърдени при началното проучване"),
			met("Споменавания за 90 дни","Не са измерени"),
		},
		"signals":[]interface{}{
			sig("neutral","Дигитално присъствие","Публичният продуктов каталог е наличен; активни официални социални канали не са надеждно идентифицирани."),
			sig("neutral","B2B видимост","Необходима е проверка на възможностите за търговско запитване през сайта."),
			sig("neutral","Конкурентен мониторинг","Четири релевантни компании са установени, но споменаванията за 90 дни още не са измерени."),
		},
		"competitors":competitors,
	}
}
