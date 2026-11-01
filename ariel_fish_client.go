package main

import "time"

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
    site:=molloxObservedScore(c,"official_site")
    products:=molloxObservedScore(c,"products")
    competitorsScores:=[]float64{molloxObservedScore(c,"cmp_michik"),molloxObservedScore(c,"cmp_odesos"),molloxObservedScore(c,"cmp_sever"),molloxObservedScore(c,"cmp_fishland")}
    benchmark:=meanPositive(competitorsScores)
    digital:=meanPositive([]float64{site,products})
    coverage:=molloxCoverage(c,"official_site","products","cmp_michik","cmp_odesos","cmp_sever","cmp_fishland")
    var blis interface{}
    var bench interface{}
    if digital>0 {blis=digital}
    if benchmark>0 {bench=benchmark}
    // A missing observation must remain null, never a fabricated zero.
    scoreOrNil := func(key string) interface{} {
        raw := latest(c,key,"score")
        if raw == nil { return nil }
        return f(raw)
    }
    digitalComponents:=[]interface{}{}
    if scoreOrNil("official_site") != nil { digitalComponents=append(digitalComponents,comp("Сайт",site,"измерено")) }
    if scoreOrNil("products") != nil { digitalComponents=append(digitalComponents,comp("Продукти",products,"измерено")) }
    competitorKeys:=[]string{"cmp_michik","cmp_odesos","cmp_sever","cmp_fishland"}
    competitorNames:=[]string{"Мичик","Одесос","Север Експорт","Fishland"}
    competitiveComponents:=[]interface{}{}
    for i,key:=range competitorKeys {
        if scoreOrNil(key) != nil { competitiveComponents=append(competitiveComponents,comp(competitorNames[i],competitorsScores[i],"измерено")) }
    }
    inds:=[]interface{}{}
    if digital>0 {inds=append(inds,idx("digital","Измерена дигитална видимост",digital,"Техническо измерване на достъпността и текстовото съдържание на официалните страници; не е оценка на продажбите.",digitalComponents,"",[]string{"Ариел Фиш – официален сайт","Ариел Фиш – продукти"}))}
    if benchmark>0 {inds=append(inds,idx("competitive","Конкурентна дигитална среда",benchmark,"Средно от измерени публични страници на четири конкурента; показателят не измерва пазарен дял.",competitiveComponents,"",[]string{"Мичик","Одесос","Север Експорт","Fishland / Атлантик"}))}

	competitors := []interface{}{
		map[string]interface{}{"name":"Ариел Фиш","score":scoreOrNil("official_site"),"source":"https://arielfish.com/"},
		map[string]interface{}{"name":"Мичик","score":scoreOrNil("cmp_michik"),"source":"https://www.michik.bg/products"},
		map[string]interface{}{"name":"Одесос","score":scoreOrNil("cmp_odesos"),"source":"https://food-exhibitions.bg/main/odesos/"},
		map[string]interface{}{"name":"Север Експорт","score":scoreOrNil("cmp_sever"),"source":"https://severexport.com/"},
		map[string]interface{}{"name":"Fishland / Атлантик","score":scoreOrNil("cmp_fishland"),"source":"https://fishland.bg/about-us"},
	}
	return map[string]interface{}{
		"client":c.Slug,"name":c.Name,"sector":c.Sector,"note":c.Note,
		"blis_index":blis,"benchmark":bench,"relative":nil,"trend":nil,"confidence":coverage,"data_updated":latestObservedAt(c),
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
		"indices":inds,
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

func runArielFishEngine(c *Client, snapshot bool) EngineStatus {
    keys:=[]struct{ key string; terms []string }{
       {"official_site",[]string{"арие","риба","fish"}},
       {"products",[]string{"риба","хайвер","марин","пуш"}},
       {"cmp_michik",[]string{"риба","хайвер","скумрия"}},
       {"cmp_odesos",[]string{"риба","хайвер","пуш"}},
       {"cmp_sever",[]string{"fish","риба","хайвер"}},
       {"cmp_fishland",[]string{"fish","риба","products"}},
    }
    results:=[]ConnectorResult{}
    success,failed:=0,0
    for _,spec:=range keys {
        r:=probeGenericSource(c,spec.key,spec.terms)
        results=append(results,r)
        if r.OK {success++} else {failed++}
    }
    if snapshot {
        c.Snapshots=append(c.Snapshots,Snapshot{CreatedAt:nowISO(),Payload:arielFishDashboard(c)})
        if len(c.Snapshots)>180 {c.Snapshots=c.Snapshots[len(c.Snapshots)-180:]}
        saveStore()
    }
    return EngineStatus{Version:"2.9-ariel",LastRun:nowISO(),NextRun:time.Now().Add(24*time.Hour).Format(time.RFC3339),Successful:success,Failed:failed,Results:results}
}
