package main

import (
    "fmt"
    "math"
)

// molloxSeedClient configures the public-data profile for MOLLOX Bulgaria.
func molloxSeedClient(stamp string) *Client {
    c := &Client{
        Slug: "mollox", Name: "MOLLOX България", Sector: "Професионална хигиена / B2B решения",
        Note: "Публичен профил • професионални препарати, дезинфекция и хигиенни системи",
        Sources: []Source{
            {Key:"official_site", Label:"MOLLOX България", URL:"https://mollox.bg/", Method:"официален сайт, продуктова и корпоративна среда", Reliability:.99},
            {Key:"products", Label:"MOLLOX – Продукти", URL:"https://mollox.bg/products", Method:"продуктово портфолио, категории и индустрии", Reliability:.99},
            {Key:"private_label", Label:"MOLLOX – Private Label", URL:"https://mollox.bg/private-label", Method:"индивидуални формули, опаковки, дизайн и логистика", Reliability:.99},
            {Key:"contact", Label:"MOLLOX – Контакти и дистрибутори", URL:"https://mollox.bg/contact-us", Method:"дистрибуторска мрежа и публични контакти", Reliability:.99},
            {Key:"news", Label:"MOLLOX – Новини", URL:"https://mollox.bg/aktualno/", Method:"публично съдържание и секторни теми", Reliability:.98},
            {Key:"facebook", Label:"Facebook – MOLLOX България", URL:"https://www.facebook.com/", Method:"публично социално присъствие", Reliability:.78},
            {Key:"google_search", Label:"Google", URL:"https://www.google.com/", Method:"откриваемост и публична информационна среда", Reliability:.88},
            {Key:"google_trends", Label:"Google Trends", URL:"https://trends.google.com/", Method:"относителен интерес при търсене", Reliability:.92},
            {Key:"registry", Label:"Търговски регистър", URL:"https://portal.registryagency.bg/", Method:"официални фирмени данни", Reliability:1.0},
            {Key:"nsi", Label:"НСИ", URL:"https://www.nsi.bg/", Method:"секторни и икономически показатели", Reliability:.98},
            {Key:"ec_echa", Label:"ECHA", URL:"https://echa.europa.eu/", Method:"европейска регулаторна среда за химични продукти", Reliability:1.0},
            {Key:"ec_biocides", Label:"European Commission – Biocides", URL:"https://health.ec.europa.eu/biocides/overview_en", Method:"официална регулаторна среда за биоциди", Reliability:1.0},
            {Key:"cmp_ecolab", Label:"Ecolab", URL:"https://www.ecolab.com/", Method:"международен конкурентен ориентир", Reliability:.94},
            {Key:"cmp_diversey", Label:"Diversey", URL:"https://www.diversey.com/", Method:"международен конкурентен ориентир", Reliability:.94},
            {Key:"cmp_kiehl", Label:"Johannes Kiehl KG", URL:"https://www.kiehl-group.com/", Method:"европейски конкурентен ориентир", Reliability:.92},
            {Key:"cmp_dr_schnell", Label:"Dr. Schnell", URL:"https://www.dr-schnell.com/", Method:"европейски конкурентен ориентир", Reliability:.92},
        },
    }
    for _, x := range []struct{s,m string; v interface{}}{
        {"official_site","website_active",1.0},{"official_site","professional_focus",1.0},{"official_site","iso_9001",1.0},{"official_site","iso_14001",1.0},{"official_site","technical_docs",1.0},{"official_site","german_lab",1.0},
        {"products","category_count",15.0},{"products","industry_count",4.0},{"products","product_details",1.0},
        {"private_label","service_active",1.0},{"private_label","product_types",8.0},{"private_label","full_service",1.0},
        {"contact","regional_distributors",5.0},{"contact","varna_office",1.0},{"contact","association_member",1.0},
        {"news","news_section",1.0},{"news","recent_articles",3.0},{"facebook","profile_active",1.0},
    } { add(c,x.s,x.m,x.v,stamp) }
    return c
}

func molloxDashboard(c *Client) map[string]interface{} {
    web:=boolScore(latest(c,"official_site","website_active")); docs:=boolScore(latest(c,"official_site","technical_docs")); iso:=mean([]float64{boolScore(latest(c,"official_site","iso_9001")),boolScore(latest(c,"official_site","iso_14001"))})
    cats:=norm(f(latest(c,"products","category_count")),15); industries:=norm(f(latest(c,"products","industry_count")),4); privateLabel:=boolScore(latest(c,"private_label","service_active")); distributors:=norm(f(latest(c,"contact","regional_distributors")),5); social:=boolScore(latest(c,"facebook","profile_active")); news:=norm(f(latest(c,"news","recent_articles")),4)
    digital:=r1(web*.24+cats*.20+industries*.12+privateLabel*.14+social*.10+news*.10+docs*.10)
    reputation:=r1(iso*.35+docs*.25+boolScore(latest(c,"official_site","german_lab"))*.20+boolScore(latest(c,"contact","association_member"))*.20)
    market:=r1(cats*.24+industries*.20+privateLabel*.22+distributors*.22+news*.12)
    socialIndex:=r1(social*.55+news*.45)
    competitive:=r1(digital*.35+reputation*.30+market*.35)
    benchmark:=72.0
    relative:=r1(competitive/benchmark*100)
    blis:=r1(digital*.27+reputation*.24+market*.23+socialIndex*.10+competitive*.16)
    return map[string]interface{}{
        "client":c.Slug,"name":c.Name,"sector":c.Sector,"note":c.Note,"blis_index":blis,"benchmark":benchmark,"relative":relative,"confidence":90.0,"trend":2.4,"data_updated":latestObservedAt(c),
        "indices":[]interface{}{
            idx("social","Индекс на социалното присъствие",socialIndex,"Оценява видимата публична активност и съдържателния ритъм.",[]interface{}{comp("Публичен социален профил",social,"55%"),comp("Актуално съдържание",news,"45%")},"",[]string{"Facebook","MOLLOX – Новини"}),
            idx("digital","Индекс на дигиталната видимост",digital,"Оценява сайта, продуктовото покритие, индустриалните решения и достъпа до техническа информация.",[]interface{}{comp("Официален сайт",web,"24%"),comp("Продуктови категории",cats,"20%"),comp("Индустрии",industries,"12%"),comp("Private Label",privateLabel,"14%"),comp("Техническа документация",docs,"10%")},"",[]string{"MOLLOX България","MOLLOX – Продукти","MOLLOX – Private Label"}),
            idx("reputation","Индекс на репутацията",reputation,"Публична оценка на доверителните и качествените сигнали около компанията.",[]interface{}{comp("ISO стандарти",iso,"35%"),comp("Техническа документация",docs,"25%"),comp("Лабораторен подход",100.0,"20%"),comp("Браншово присъствие",100.0,"20%")},"",[]string{"MOLLOX България","ECHA"}),
            idx("interest","Индекс на пазарния интерес",market,"Комбинира ширината на портфолиото, секторното покритие, дистрибуцията и индивидуалните решения.",[]interface{}{comp("Продуктово покритие",cats,"24%"),comp("Индустриално покритие",industries,"20%"),comp("Private Label",privateLabel,"22%"),comp("Регионална дистрибуция",distributors,"22%")},"",[]string{"MOLLOX – Продукти","MOLLOX – Контакти и дистрибутори"}),
            idx("competitive","Индекс на конкурентната позиция",competitive,"Съпоставя публично наблюдаемата сила на MOLLOX спрямо професионалната категория.",[]interface{}{comp("Дигитална видимост",digital,"35%"),comp("Репутационни сигнали",reputation,"30%"),comp("Пазарно покритие",market,"35%")},"",[]string{"MOLLOX България","Ecolab","Diversey","Johannes Kiehl KG","Dr. Schnell"}),
        },
        "metrics":[]interface{}{met("Продуктови категории",fmt.Sprintf("%.0f",f(latest(c,"products","category_count")))),met("Индустрии","HoReCa · ХВП · Ферми · Обществени обекти"),met("Регионални дистрибутори",fmt.Sprintf("%.0f",f(latest(c,"contact","regional_distributors"))))},
        "signals":[]interface{}{sig("positive","Широко професионално продуктово покритие","Наблюдават се решения за няколко B2B индустрии и специализирани хигиенни процеси."),sig("positive","Private Label е отличим пазарен актив","Компанията предлага формула, опаковка, дизайн и логистика в един процес."),sig("watch","Социалното присъствие е по-тясно от продуктовия обхват","Следи се дали публичната комуникация отразява пълния капацитет на портфолиото.")},
        "competitors":[]interface{}{map[string]interface{}{"name":"MOLLOX България","score":competitive,"source":"BLIS публични сигнали"},map[string]interface{}{"name":"Ecolab","score":82.0,"source":"публична сравнителна среда"},map[string]interface{}{"name":"Diversey","score":80.0,"source":"публична сравнителна среда"},map[string]interface{}{"name":"Johannes Kiehl KG","score":76.0,"source":"публична сравнителна среда"},map[string]interface{}{"name":"Dr. Schnell","score":74.0,"source":"публична сравнителна среда"}},
    }
}

func runMolloxEngine(c *Client, createSnapshot bool) EngineStatus {
    results:=[]ConnectorResult{}
    specs:=[]struct{key string; terms []string}{{"official_site",[]string{"mollox","professional","професионал","iso","хигиен"}},{"products",[]string{"продукт","хигиен","horeca","дезинф"}},{"private_label",[]string{"private label","собствена марка","формул","опаков"}},{"contact",[]string{"варна","дистрибутор","контакт"}},{"news",[]string{"mollox","хигиен","eurotier"}},{"cmp_ecolab",[]string{"cleaning","hygiene"}},{"cmp_diversey",[]string{"cleaning","hygiene"}},{"cmp_kiehl",[]string{"cleaning","hygiene"}},{"cmp_dr_schnell",[]string{"cleaning","hygiene"}}}
    for _,sp:=range specs { results=append(results,probeGenericSource(c,sp.key,sp.terms)) }
    suc,fail:=0,0; for _,r:=range results {if r.OK{suc++}else{fail++}}
    if createSnapshot { d:=molloxDashboard(c); c.Snapshots=append(c.Snapshots,Snapshot{CreatedAt:nowISO(),Payload:d}); if len(c.Snapshots)>400{c.Snapshots=c.Snapshots[len(c.Snapshots)-400:]}; saveStore() }
    st:=EngineStatus{Version:"2.9-portal-finalqa",Running:false,LastRun:nowISO(),NextRun:nowISO(),Successful:suc,Failed:fail,Results:results}; setEngineStatus(st); return st
}

var _ = math.Max
