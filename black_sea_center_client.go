package main

import (
	"encoding/xml"
	"fmt"
	"math"
	"net/url"
	"strings"
	"time"
)

const blackSeaCenterSlug = "black-sea-center"

func blackSeaCenterClient() *Client {
	c := &Client{
		Slug:   blackSeaCenterSlug,
		Name:   "Black Sea Center",
		Sector: "Бизнес и офис комплекс / офис площи под наем",
		Note:   "Пълен публичен профил • live monitoring • офисна конкурентна среда",
		Sources: []Source{
			{Key: "official_site", Label: "Black Sea Center Offices", URL: "https://bsc-offices.com/", Method: "официален сайт, офис площи, локация, инфраструктура и проектни параметри", Reliability: .99},
			{Key: "official_contact", Label: "Black Sea Center - контакти", URL: "https://bsc-offices.com/contact-us/", Method: "официални контактни и адресни данни", Reliability: .99},
			{Key: "voivoda_group", Label: "Войвода Груп - Black Sea Center", URL: "https://voivodagroup.com/black-sea-center/", Method: "проектно позициониране, ритейл, бизнес и лайфстайл среда", Reliability: .93},
			{Key: "google_news", Label: "Google News - Black Sea Center", URL: "https://news.google.com/", Method: "медийни споменавания и нови публикации", Reliability: .92},
			{Key: "marica", Label: "Марица", URL: "https://www.marica.bg/imoti/black-sea-center-novo-pokolenie-gradsko-prostranstvo-v-centara-na-varna/amp", Method: "медийни публикации за проекта", Reliability: .88},
			{Key: "krib_media", Label: "КРИБ - медиен преглед", URL: "https://krib.bg/", Method: "медиен мониторинг и препубликувани бизнес материали", Reliability: .90},
			{Key: "babyplanet", Label: "BabyPlanet - Black Sea Center", URL: "https://babyplanet.bg/", Method: "публично потвърждение за действащ търговски обект и адрес в комплекса", Reliability: .94},
			{Key: "companybook", Label: "CompanyBook - Black Sea Center BSC", URL: "https://companybook.bg/companies/205829188", Method: "публични фирмени и регистрационни промени", Reliability: .90},
			{Key: "imot_bg", Label: "Imot.bg - локационни споменавания", URL: "https://www.imot.bg/", Method: "пазарни и локационни споменавания в имотни обяви", Reliability: .82},
			{Key: "cmp_varna_towers", Label: "Varna Towers", URL: "https://www.varnatowers.bg/", Method: "пряк конкурент · Class A офисен и бизнес комплекс · площи, заетост, наематели, услуги и публична активност", Reliability: .98},
			{Key: "cmp_business_park_varna", Label: "Business Park Varna", URL: "https://www.bpv.bg/", Method: "пряк офисен конкурент · офис площи, наематели, услуги и инвестиции", Reliability: .97},
			{Key: "cmp_landmark_centre_varna", Label: "Landmark Centre Varna", URL: "https://www.landmark.bg/landmark-centre-varna", Method: "пряк офисен конкурент · Class A офиси, площи и leasing позициониране", Reliability: .97},
			{Key: "cmp_komfort_business", Label: "Комфорт Бизнес Център", URL: "https://www.komfortbg.com/bg/portfolio/komfort-biznes-tsentr", Method: "пряк офисен конкурент · административни и офис площи, корпоративна видимост и наематели", Reliability: .96},
		},
	}
	obs := []Observation{
		{SourceKey: "official_site", MetricKey: "website_active", Value: 1.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "active_offers", Value: 1.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "product_details", Value: 1.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "prime_real_estate_sqm", Value: 65000.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "parking_spaces", Value: 600.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "office_floors_publicly_offered", Value: 2.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "fitness_spa_planned_sqm", Value: 5000.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "child_center_planned_sqm", Value: 2500.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "news_mentions_30d", Value: 2.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "official_site", MetricKey: "public_mentions_30d", Value: 7.0, ObservedAt: "2026-09-07T09:00:00Z"},
		{SourceKey: "babyplanet", MetricKey: "tenant_location_confirmed", Value: 1.0, ObservedAt: "2026-09-07T09:00:00Z"},
	}
	obs = append(obs,
		Observation{SourceKey: "official_site", MetricKey: "office_focus", Value: 1.0, ObservedAt: "2026-09-24T10:00:00Z"},
		Observation{SourceKey: "official_site", MetricKey: "location_address", Value: "бул. „Владислав Варненчик“ 186, Варна", ObservedAt: "2026-09-24T10:00:00Z"},
		Observation{SourceKey: "official_site", MetricKey: "class_a_office_positioning", Value: 1.0, ObservedAt: "2026-09-24T10:00:00Z"},
		Observation{SourceKey: "official_site", MetricKey: "leasing_active", Value: 1.0, ObservedAt: "2026-09-24T10:00:00Z"},
	)
	c.Observations = obs
	c.Snapshots = []Snapshot{{CreatedAt: "2026-09-07T09:00:00Z", Payload: dashboard(c)}}
	return c
}

func bscStaticSignal(source, sourceType, rawURL, title, text, published, topic string, relevance float64) Signal {
	fingerprint := signalHash(blackSeaCenterSlug, rawURL, title, text)
	sentiment, risk := signalSentimentAndRisk(title + " " + text)
	return Signal{
		ID:          fingerprint[:16],
		Client:      blackSeaCenterSlug,
		Brand:       "Black Sea Center",
		Source:      source,
		SourceType:  sourceType,
		Scope:       "external",
		URL:         rawURL,
		Title:       title,
		Text:        text,
		PublishedAt: published,
		DetectedAt:  nowISO(),
		Relevance:   relevance,
		Sentiment:   sentiment,
		Topic:       topic,
		RiskScore:   risk,
		Severity:    signalSeverity(risk),
		Fingerprint: fingerprint,
	}
}

func blackSeaCenterBackfill() []Signal {
	return []Signal{
		bscStaticSignal("КРИБ", "news", "https://krib.bg/%D0%BF%D1%80%D0%B5%D0%B3%D0%BB%D0%B5%D0%B4-%D0%BD%D0%B0-%D0%BC%D0%B5%D0%B4%D0%B8%D0%B8%D1%82%D0%B5-19-8-2026-%D1%81%D1%80%D1%8F%D0%B4%D0%B0/", "Black Sea Center - ново поколение градско пространство в центъра на Варна", "Медийният преглед представя Black Sea Center като мултифункционален комплекс с клас А офис пространства, ритейл, ресторанти, спорт, услуги и зони за свободното време.", "2026-08-19T00:07:00+03:00", "media", 98),
		bscStaticSignal("Марица", "news", "https://www.marica.bg/imoti/black-sea-center-novo-pokolenie-gradsko-prostranstvo-v-centara-na-varna/amp", "Black Sea Center - ново поколение градско пространство в центъра на Варна", "Публикация за офис средата, ритейл микса и пространствата за отдих и развлечения в проекта.", "2026-08-20T09:55:00+03:00", "media", 100),
		bscStaticSignal("CompanyBook", "registry", "https://companybook.bg/companies/205829188", "Промяна по БЛЕК СИЙ ЦЕНТЪР БиЕсСи ЕАД", "Публичният фирмен профил отчита промяна във внесения капитал на 19 август 2026 г.", "2026-08-19T00:00:00+03:00", "corporate", 88),
		bscStaticSignal("BabyPlanet", "web", "https://babyplanet.bg/support/help", "BabyPlanet посочва магазин в Black Sea Center", "Страницата за помощ посочва адрес бул. Владислав Варненчик 186, Black Sea Center, ет. 0. Последна актуализация 31 август 2026 г.", "2026-08-31T00:00:00+03:00", "tenant", 96),
		bscStaticSignal("BabyPlanet", "web", "https://babyplanet.bg/support/shipping", "BabyPlanet потвърждава адрес в Black Sea Center", "Страницата за доставка съдържа публично посочен адрес на физическия обект в Black Sea Center, ет. 0.", "2026-09-05T00:00:00+03:00", "tenant", 94),
		bscStaticSignal("BabyPlanet", "web", "https://babyplanet.bg/support/click-and-collect", "Вземане от магазина в Black Sea Center", "Страницата за Click & Collect посочва магазина на бул. Владислав Варненчик 186, Black Sea Center, ет. 0, Варна.", "2026-09-07T00:00:00+03:00", "tenant", 98),
		bscStaticSignal("Imot.bg", "web", "https://www.imot.bg/obiavi/prodazhbi/grad-varna/troshevo/p-8", "Локационно споменаване: Varna Mall (Black Sea Center)", "Публична имотна обява използва Black Sea Center като разпознаваем ориентир за локация в Трошево. Публикационна дата не е потвърдена, записът е маркиран при откриване.", "", "location", 82),
	}
}

func bscTermHit(text string) bool {
	low := strings.ToLower(text)
	for _, term := range []string{"black sea center", "black sea center offices", "black sea center bsc", "блек сий център", "блек сий център бисиси"} {
		if strings.Contains(low, term) {
			return true
		}
	}
	return false
}

func bscPublishedWithinWindow(raw string, days int) bool {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return true
	}
	for _, layout := range []string{time.RFC1123Z, time.RFC1123, time.RFC3339} {
		if t, err := time.Parse(layout, raw); err == nil {
			return t.After(time.Now().Add(-time.Duration(days) * 24 * time.Hour))
		}
	}
	return true
}

func collectBlackSeaCenterNews(c *Client) []Signal {
	if c == nil || c.Slug != blackSeaCenterSlug {
		return nil
	}
	query := `("Black Sea Center" OR "Black Sea Center Offices" OR "Блек Сий Център" OR "BLACK SEA CENTER BSC") (Варна OR Varna OR офис OR office OR бизнес OR business)`
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(query) + "&hl=bg&gl=BG&ceid=BG:bg"
	status, body, _, err := timedFetch(raw, 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return nil
	}
	var feed collectorRSS
	if xml.Unmarshal([]byte(body), &feed) != nil {
		return nil
	}
	out := []Signal{}
	for _, item := range feed.Channel.Items {
		title := cleanPostSnippet(item.Title)
		text := cleanPostSnippet(item.Description)
		if !bscTermHit(title+" "+text) || !bscPublishedWithinWindow(item.PubDate, 35) {
			continue
		}
		source := strings.TrimSpace(item.Source)
		if source == "" {
			source = "Google News"
		}
		out = append(out, bscStaticSignal(source, "news", item.Link, title, text, item.PubDate, signalTopic(title+" "+text), 100))
		if len(out) >= 40 {
			break
		}
	}
	return out
}


func bscSignalRows() []Signal {
	signalMu.RLock()
	rows:=append([]Signal(nil),signalState.Signals[blackSeaCenterSlug]...)
	signalMu.RUnlock()
	return rows
}
func bscSignalTime(s Signal) time.Time {
	if t,ok:=parseCompetitorPublished(s.PublishedAt);ok{return t}
	if t,e:=time.Parse(time.RFC3339,s.DetectedAt);e==nil{return t}
	return time.Time{}
}
func bscRecentSignals(scope string,days int) []Signal {
	cut:=time.Now().UTC().Add(-time.Duration(days)*24*time.Hour)
	out:=[]Signal{}
	for _,s:=range bscSignalRows(){
		if scope!=""&&s.Scope!=scope{continue}
		t:=bscSignalTime(s);if t.IsZero()||t.Before(cut){continue}
		out=append(out,s)
	}
	return out
}
func bscCompetitorCount(name string,days int) int {
	n:=0
	for _,s:=range bscRecentSignals("competitor",days){
		if strings.EqualFold(strings.TrimSpace(s.Brand),strings.TrimSpace(name)){n++}
	}
	return n
}
func bscObservedQuality(c *Client)(coverage,freshness float64,observedSources,recentObs int){
	if c==nil||len(c.Sources)==0{return 0,0,0,0}
	seen:=map[string]bool{};fresh:=map[string]bool{};keys:=map[string]bool{}
	for _,s:=range c.Sources{keys[s.Key]=true}
	cut48:=time.Now().Add(-48*time.Hour);cut90:=time.Now().Add(-90*24*time.Hour)
	for _,o:=range c.Observations{
		if !keys[o.SourceKey]{continue}
		seen[o.SourceKey]=true
		if t,e:=time.Parse(time.RFC3339,o.ObservedAt);e==nil{
			if t.After(cut48){fresh[o.SourceKey]=true}
			if t.After(cut90){recentObs++}
		}
	}
	return r1(float64(len(seen))/math.Max(float64(len(c.Sources)),1)*100),
		r1(float64(len(fresh))/math.Max(float64(len(c.Sources)),1)*100),len(seen),recentObs
}
func bscCompetitorRow(name string,priority int) map[string]interface{}{
	n90:=bscCompetitorCount(name,90);n30:=bscCompetitorCount(name,30)
	return map[string]interface{}{
		"name":name,"priority":priority,"score":0.0,"score_status":"Без изкуствен конкурентен индекс",
		"news":float64(n90),"activity":float64(n90),"trend":float64(n30),
		"live_mentions_30d":n30,"live_mentions_90d":n90,
	}
}
func blackSeaCenterDashboard(c *Client) map[string]interface{} {
	if c==nil{return map[string]interface{}{}}
	brand90,pos90,neg90:=0,0,0
	for _,s:=range bscRecentSignals("",90){
		if s.Scope=="competitor"{continue}
		brand90++
		if s.Sentiment=="positive"{pos90++}
		if s.Sentiment=="negative"{neg90++}
	}
	comp90:=len(bscRecentSignals("competitor",90))
	coverage,freshness,observedSources,recentObs:=bscObservedQuality(c)
	mentionVolume:=0.0
	if brand90>0{mentionVolume=clamp(math.Log10(float64(brand90)+1)/math.Log10(51)*100)}
	observationActivity:=0.0
	if recentObs>0{observationActivity=clamp(math.Log10(float64(recentObs)+1)/math.Log10(301)*100)}
	presence:=r1(coverage*.45+mentionVolume*.30+observationActivity*.25)
	reputation:=50.0
	if brand90>0{reputation=r1(clamp(50+50*float64(pos90-neg90)/float64(brand90)))}
	digital:=r1(coverage*.60+freshness*.40)
	competitive:=0.0
	avgComp:=float64(comp90)/4.0
	if float64(brand90)+avgComp>0{competitive=r1(float64(brand90)/(float64(brand90)+avgComp)*100)}
	blis:=r1(presence*.30+reputation*.25+digital*.25+competitive*.20)
	sampleConfidence:=clamp(float64(brand90+comp90)/20*100)
	confidence:=r1(coverage*.55+freshness*.25+sampleConfidence*.20)
	trend:=0.0
	for i:=len(c.Snapshots)-1;i>=0;i--{
		if prev,ok:=numericObsV33(c.Snapshots[i].Payload["blis_index"]);ok&&prev>0{trend=r1(blis-prev);break}
	}
	signals:=[]interface{}{}
	for _,s:=range bscSignalRows(){
		if s.Scope=="competitor"{continue}
		level:="info";if s.Severity=="critical"||s.Severity=="high"{level="watch"}else if s.Sentiment=="positive"{level="positive"}
		signals=append(signals,map[string]interface{}{"level":level,"title":s.Title,"text":s.Text,"source":s.Source,"url":s.URL,"published_at":s.PublishedAt,"detected_at":s.DetectedAt,"topic":s.Topic})
		if len(signals)>=30{break}
	}
	return map[string]interface{}{
		"client":c.Slug,"slug":c.Slug,"client_slug":c.Slug,"name":c.Name,"sector":c.Sector,"note":c.Note,
		"blis_index":blis,"benchmark":81.0,"relative":r1(blis/81.0*100),"confidence":confidence,"trend":trend,"data_updated":latestObservedAt(c),
		"benchmark_status":"Сравнителен ориентир: Varna Towers onboarding BLIS 81.0; не е live оценка на конкурента.",
		"nav":[]interface{}{
			map[string]interface{}{"key":"overview","label":"Общ изглед","icon":"⌂"},
			map[string]interface{}{"key":"social","label":"Мониторинг","icon":"◉"},
			map[string]interface{}{"key":"market","label":"Среда","icon":"◎"},
			map[string]interface{}{"key":"competition","label":"Конкуренти","icon":"◇"},
			map[string]interface{}{"key":"history","label":"Развитие/Доклади","icon":"↗"},
		},
		"indices":[]interface{}{
			idx("presence","Публично присъствие",presence,"Измерва реалното покритие на източниците, публичните споменавания и активността на наблюденията.",[]interface{}{comp("Наблюдавани източници",observedSources,"live"),comp("Покритие",coverage,"45%"),comp("Споменавания · 90 дни",brand90,"30%"),comp("Наблюдения · 90 дни",recentObs,"25%")},"Покритие × 45% + споменавания × 30% + активност × 25%",[]string{"bsc-offices.com","Google News","публичен web"}),
			idx("reputation","Репутация",reputation,"Баланс на позитивните и негативните публични сигнали за Black Sea Center.",[]interface{}{comp("Позитивни · 90 дни",pos90,"live"),comp("Негативни · 90 дни",neg90,"live"),comp("Общо · 90 дни",brand90,"live")},"50 + 50 × (позитивни − негативни) / всички сигнали",[]string{"медии","публични източници"}),
			idx("digital","Дигитална видимост",digital,"Покритие и актуалност на наблюдаваните публични дигитални източници.",[]interface{}{comp("Покритие",coverage,"60%"),comp("Свежест · 48 часа",freshness,"40%")},"Покритие × 60% + свежест × 40%",[]string{"bsc-offices.com","Google News","публични източници"}),
			idx("competitive","Конкурентна среда",competitive,"Сравнява публичната активност на Black Sea Center със средния наблюдаван обем на четирите офисни конкурента.",[]interface{}{comp("Black Sea Center · 90 дни",brand90,"live"),comp("Конкурентни сигнали · 90 дни",comp90,"live"),comp("Наблюдавани конкуренти",4,"live")},"Black Sea Center / (Black Sea Center + среден конкурентен обем) × 100",[]string{"Varna Towers","Business Park Varna","Landmark Centre Varna","Комфорт Бизнес Център"}),
		},
		"metrics":[]interface{}{
			met("Основен фокус","Офис площи под наем"),
			met("Публично посочена площ на проекта","65 000 m²"),
			met("Паркоместа","600"),
			met("Публично предлагани офисни етажи","2"),
			met("Планирани фитнес и СПА площи","5 000 m²"),
			met("Планиран детски център","2 500 m²"),
			met("Адрес","бул. „Владислав Варненчик“ 186, Варна"),
			met("Основен конкурент","Varna Towers"),
			met("Публичен tenant proof","BabyPlanet · действащ обект в комплекса"),
			met("Позициониране","офиси · търговия · услуги · спорт · свободно време"),
		},
		"signals":signals,
		"competitors":[]interface{}{
			bscCompetitorRow("Varna Towers",1),
			bscCompetitorRow("Business Park Varna",2),
			bscCompetitorRow("Landmark Centre Varna",3),
			bscCompetitorRow("Комфорт Бизнес Център",4),
		},
		"competitor_dossiers":[]interface{}{
			map[string]interface{}{"name":"Varna Towers","priority":1,"tier":"пряк офисен конкурент","format":"Class A офисен и бизнес комплекс","focus":"офисна GLA, заетост, наематели, услуги, паркиране, leasing, публична активност","monitoring":"нови наематели; свободни площи; заетост; офисни предложения; услуги; собственост; репутация; комуникация"},
			map[string]interface{}{"name":"Business Park Varna","priority":2,"tier":"пряк офисен конкурент","format":"офисен и бизнес парк","focus":"офис площи, корпоративни наематели, campus логика, услуги","monitoring":"tenant activity; availability; инвестиции; employer presence; услуги"},
			map[string]interface{}{"name":"Landmark Centre Varna","priority":3,"tier":"пряк офисен конкурент","format":"Class A офисен център","focus":"офис площи, международни корпоративни наематели, централна локация","monitoring":"availability; tenant wins; корпоративни наематели; leasing; услуги"},
			map[string]interface{}{"name":"Комфорт Бизнес Център","priority":4,"tier":"пряк офисен конкурент","format":"административен и офисен център","focus":"офис площи, централна локация, корпоративни наематели","monitoring":"availability; tenant activity; корпоративни сигнали; услуги"},
		},
		"live_summary":map[string]interface{}{"brand_mentions_90d":brand90,"competitor_mentions_90d":comp90,"positive_brand_mentions_90d":pos90,"negative_brand_mentions_90d":neg90},
	}
}
func blackSeaCenterKeywords(c *Client) []map[string]interface{} {
	brand90:=len(bscRecentSignals("",90))-len(bscRecentSignals("competitor",90))
	comp90:=len(bscRecentSignals("competitor",90))
	return []map[string]interface{}{
		{"title":"Офисно позициониране","display":"Офис площи под наем","source":"Black Sea Center Offices","status":"Активно","kind":"market","measured":true},
		{"title":"Публично наблюдавана площ","display":"65 000 m²","source":"Black Sea Center Offices","status":"Публична стойност","kind":"market","value":65000,"measured":true},
		{"title":"Споменавания за Black Sea Center","display":fmt.Sprintf("%d публикации",brand90),"source":"BLIS public-source monitoring","status":"Live","kind":"media","value":brand90,"measured":true},
		{"title":"Конкурентни споменавания","display":fmt.Sprintf("%d публикации",comp90),"source":"BLIS competitor monitoring","status":"Live","kind":"competition","value":comp90,"measured":true},
		{"title":"Основен конкурент","display":"Varna Towers","source":"BLIS офисна конкурентна матрица","status":"Наблюдава се","kind":"competition","measured":true},
	}
}

func blackSeaCenterVerifiedCompetitorObservations() []Signal {
	rows:=[]struct{brand,source,url,title,text string}{
		{"Varna Towers","Varna Towers · официален сайт","https://www.varnatowers.bg/en/tenants","Varna Towers поддържа активен публичен списък на корпоративни и услужващи наематели","Официалната страница на Varna Towers показва активна офисна и смесена tenant база. За Black Sea Center това е пряк конкурент в офисния сегмент във Варна."},
		{"Business Park Varna","iCard / LinkedIn","https://bg.linkedin.com/company/icardofficial","iCard посочва Business Park Varna като основна локация във Варна","Публичният фирмен профил на iCard потвърждава текущо корпоративно присъствие в Business Park Varna."},
		{"Landmark Centre Varna","JOBS.BG · Cargill Bulgaria","https://www.jobs.bg/en/company/cargill","Cargill посочва офис във Varna Landmark Centre","Публичният работодателски профил на Cargill потвърждава офисна локация в Landmark Centre Varna."},
		{"Комфорт Бизнес Център","Bulgarian Dredging Company","https://www.bdrc.bg/contact","Central Point е посочен като офис локация във Варна","Публичната контактна страница потвърждава корпоративна офисна локация в конкурентния клъстер на Комфорт."},
	}
	out:=make([]Signal,0,len(rows))
	for _,r:=range rows{
		fp:=signalHash(blackSeaCenterSlug+"|competitor|"+strings.ToLower(r.brand),r.url,r.title,r.text)
		out=append(out,Signal{ID:fp[:16],Client:blackSeaCenterSlug,Brand:r.brand,Source:r.source,SourceType:"web",Scope:"competitor",URL:r.url,Title:r.title,Text:r.text,DetectedAt:nowISO(),Relevance:100,Sentiment:"neutral",Topic:"competition",RiskScore:10,Severity:"low",Fingerprint:fp})
	}
	return out
}

func ensureBlackSeaCenterClient() bool {
	mu.Lock()
	if store.Clients == nil {
		mu.Unlock()
		return false
	}
	if _, ok := store.Clients[blackSeaCenterSlug]; !ok {
		store.Clients[blackSeaCenterSlug] = blackSeaCenterClient()
	}
	c := store.Clients[blackSeaCenterSlug]
	mu.Unlock()
	if c == nil {
		return false
	}
	restoreSignalsFromObservations()
	mergeSignals(blackSeaCenterSlug, append(blackSeaCenterBackfill(), blackSeaCenterVerifiedCompetitorObservations()...))
	runUniversalClientEngineV34(c, true)
	fresh := collectClientSignals(c)
	fresh = append(fresh, collectBlackSeaCenterNews(c)...)
	if len(fresh) > 0 {
		mergeSignals(blackSeaCenterSlug, fresh)
	}
	saveSignalStateFile()
	saveStore()
	return true
}

func init() {
	go func() {
		for i := 0; i < 40; i++ {
			time.Sleep(500 * time.Millisecond)
			if ensureBlackSeaCenterClient() {
				break
			}
		}
	}()
	go func() {
		time.Sleep(90 * time.Second)
		for {
			c := signalClientSnapshot(blackSeaCenterSlug)
			if c != nil {
				rows := collectBlackSeaCenterNews(c)
				rows = append(rows, collectClientSignals(c)...)
				if len(rows) > 0 {
					mergeSignals(blackSeaCenterSlug, rows)
					saveSignalStateFile()
					saveStore()
				}
			}
			time.Sleep(5 * time.Minute)
		}
	}()
	// Black Sea Center currently has a dedicated signal pipeline but no dedicated
	// metric engine. Do not send it through runClientEngine: the generic fallback
	// is Aroma-specific and would create cross-client metric contamination.
}
