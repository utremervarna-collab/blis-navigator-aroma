package main

const icardSlug = "icard"

func ensureICardClient() *Client {
 mu.Lock()
 defer mu.Unlock()
 if store.Clients == nil { store.Clients = map[string]*Client{} }
 if c := store.Clients[icardSlug]; c != nil { return c }
 c := &Client{Slug: icardSlug, Name: "iCard", Sector: "Дигитални плащания и бизнес финансови услуги", Note: "Търговски възможности и партньорства", Sources: []Source{
 {Key:"icard_business", Label:"iCard бизнес сметка", URL:"https://icard.com/bg/business", Method:"Публично продуктово описание"},
 {Key:"icard_direct", Label:"iCard Direct", URL:"https://icard.direct/en", Method:"Приемане на плащания и продуктови комбинации"},
 }}
 store.Clients[icardSlug] = c
 return c
}

func icardDashboard(c *Client) map[string]interface{} {
 return map[string]interface{}{
 "client":c.Slug, "slug":c.Slug, "client_slug":c.Slug, "name":c.Name, "sector":c.Sector, "note":c.Note,
 "profile_title":"iCard · Търговски възможности", "profile_mode":"commercial_intelligence",
 "blis_index":nil, "benchmark":nil, "relative":nil, "confidence":nil, "trend":nil,
 "data_status":"Начална структура · няма събрана извадка от потенциални клиенти",
 "metrics": []interface{}{
 met("Проверени възможности по сектор", "Предстои събиране"),
 met("Конкретен повод за контакт", "Предстои проверка"),
 met("Актуалност на сигналите", "Няма събрана извадка"),
 met("Пълнота на доказателствата", "Няма събрана извадка"),
 met("Приложимост на няколко услуги", "Предстои анализ"),
 },
 "indices":[]interface{}{}, "signals":[]interface{}{}, "opportunities":[]interface{}{},
 "priorities": []interface{}{
 map[string]interface{}{"name":"Приемане на плащания", "source_url":"https://icard.direct/en", "status":"Аналитична препоръка"},
 map[string]interface{}{"name":"Бизнес сметки", "source_url":"https://icard.com/bg/business", "status":"Аналитична препоръка"},
 },
 "metric_definitions":map[string]interface{}{
 "verified_opportunities":"Брой уникални компании с проверен публичен сигнал и продуктова приложимост; не означава интерес към покупка.",
 "contact_trigger":"Брой възможности с конкретно публично събитие, източник и дата.",
 "freshness":"Дни от датата на сигнала; неизвестна дата се обозначава като липсваща.",
 "evidence_completeness":"Дял от записите с компания, сигнал, източник, дата, продуктова приложимост и ограничение на извода.",
 "multiple_services":"Брой възможности с обоснована приложимост на поне две услуги.",
 },
 }
}
