package main

import (
	"fmt"
	"sort"
	"strings"
	"time"
)

func deltaPlanetSources() []Source {
	return []Source{
		{Key:"official_site",Label:"Delta Planet Mall · официален сайт",URL:"https://www.deltaplanet.bg/",Method:"официални новини, събития, кампании и позициониране",Reliability:.99},
		{Key:"about",Label:"Delta Planet Mall · За нас",URL:"https://www.deltaplanet.bg/about",Method:"официални площи, tenant mix и развлекателна концепция",Reliability:.99},
		{Key:"shops",Label:"Delta Planet Mall · Магазини",URL:"https://www.deltaplanet.bg/magazini",Method:"tenant mix и промени в търговските обекти",Reliability:.99},
		{Key:"venues",Label:"Delta Planet Mall · Заведения",URL:"https://www.deltaplanet.bg/zavedenia",Method:"F&B mix и промени",Reliability:.99},
		{Key:"map",Label:"Delta Planet Mall · План на нивата",URL:"https://www.deltaplanet.bg/detailna-karta",Method:"обекти по нива и пространствен tenant mix",Reliability:.98},
		{Key:"contact",Label:"Delta Planet Mall · Контакти",URL:"https://www.deltaplanet.bg/kontakt",Method:"официални контакти и рекламни/събитийни функции",Reliability:.99},
		{Key:"google_news",Label:"Google News · Delta Planet Mall",URL:"https://news.google.com/search?q=%22Delta%20Planet%20Mall%22&hl=bg&gl=BG&ceid=BG%3Abg",Method:"външни медийни споменавания",Reliability:.92},
		{Key:"google_business",Label:"Google Maps · Delta Planet Mall",URL:"https://www.google.com/maps/search/?api=1&query=Delta+Planet+Mall+Varna",Method:"локална видимост, оценки и отзиви",Reliability:.90},
		{Key:"tripadvisor",Label:"Tripadvisor · Delta Planet Mall",URL:"https://www.tripadvisor.com/Attraction_Review-g295392-d17513506-Reviews-Delta_Planet_Mall-Varna_Varna_Province.html",Method:"публични туристически оценки и тематични отзиви",Reliability:.88},
		{Key:"retailmap",Label:"RetailMap · Delta Planet",URL:"https://retailmap.bg/en/malls/varna/delta-planet-33",Method:"GLA, паркиране, ключови наематели и формат",Reliability:.91},
		{Key:"visit_varna",Label:"Visit Varna · Delta Planet Mall",URL:"https://visit.varna.bg/en/objects.html/shop/delta-planet-mall/1711",Method:"локален туристически профил и публични факти",Reliability:.90},

		{Key:"cmp_grand_mall",Label:"Grand Mall Varna",URL:"https://www.grandmall-varna.com/",Method:"пряк конкурент · магазини, заведения, кино, развлечения, промоции и събития",Reliability:.98},
		{Key:"cmp_grand_mall_shops",Label:"Grand Mall Varna",URL:"https://grandmall-varna.com/en/magazini",Method:"пряк конкурент · tenant mix, нови обекти и промоции",Reliability:.98},
		{Key:"cmp_mall_varna",Label:"Mall Varna",URL:"https://www.mall-varna.bg/",Method:"втори конкурентен кръг · търговски/офис площи и свободни помещения",Reliability:.96},
		{Key:"cmp_mall_varna_about",Label:"Mall Varna",URL:"https://www.mall-varna.bg/aboutus",Method:"втори конкурентен кръг · площи, функции и собственост",Reliability:.96},
		{Key:"cmp_retail_park_varna",Label:"Retail Park Varna",URL:"https://retailmap.bg/bg/%D1%82%D1%8A%D1%80%D0%B3%D0%BE%D0%B2%D1%81%D0%BA%D0%B8-%D1%86%D0%B5%D0%BD%D1%82%D1%80%D0%BE%D0%B2%D0%B5/varna/retail-park-varna-42",Method:"конкурентен формат · home/sport/tech retail, GLA и parking",Reliability:.91},
	}
}

func deltaHasObs(c *Client, s, m string) bool {
	for i:=len(c.Observations)-1;i>=0;i-- { if c.Observations[i].SourceKey==s && c.Observations[i].MetricKey==m { return true } }
	return false
}
func deltaSeed(c *Client,s,m string,v interface{},stamp string){if !deltaHasObs(c,s,m){add(c,s,m,v,stamp)}}

func seedDeltaPlanetFacts(c *Client){
	stamp:="2026-09-23T10:45:00+03:00"
	deltaSeed(c,"about","gross_built_area_m2",120000.0,stamp)
	deltaSeed(c,"about","retail_area_m2",40000.0,stamp)
	deltaSeed(c,"about","brands_over",140.0,stamp)
	deltaSeed(c,"about","entertainment_area_m2",4000.0,stamp)
	deltaSeed(c,"about","cinema_halls",12.0,stamp)
	deltaSeed(c,"about","cinema_4dx",1.0,stamp)
	deltaSeed(c,"retailmap","gla_m2",40000.0,stamp)
	deltaSeed(c,"retailmap","parking_spaces",1300.0,stamp)
	deltaSeed(c,"retailmap","completion_year",2019.0,stamp)
	deltaSeed(c,"visit_varna","reported_occupancy_pct",94.0,stamp)
	deltaSeed(c,"contact","address","бул. „Сливница“ 185, Варна",stamp)
	deltaSeed(c,"contact","phone","052 810 232",stamp)
	deltaSeed(c,"contact","email","office@deltaplanet.bg",stamp)
	deltaSeed(c,"contact","events_contact","Антоанета Тенева · antoaneta.teneva@deltaplanet.bg",stamp)
	deltaSeed(c,"official_site","opening_hours","10:00–21:00",stamp)
	deltaSeed(c,"official_site","latest_news_2026_08_29","Всички ваучери от кампанията „Палитра от намаления“ са изчерпани",stamp)
	deltaSeed(c,"official_site","pandora_new_generation_2026_01_19",true,stamp)
	deltaSeed(c,"official_site","cinema_summer_2026",true,stamp)
	deltaSeed(c,"shops","tenant_mix","IKEA; Billa; LC Waikiki; HalfPrice; New Yorker; Reserved; Mango; Pinko; Cropp; House; Sinsay; Tezenis; Sport Depot; CCC; MAC; Pandora; Swarovski; TEDi; dm; Pepco; Comsed",stamp)
	deltaSeed(c,"venues","food_mix","Costa Coffee; Domino's Pizza; Godzila; Hungry Boys; KFC; McDonald's; Marmaris; Pizza Lab; SUBWAY; Starbucks; Nedelya",stamp)
}

func ensureDeltaPlanetClient() *Client{
	mu.Lock()
	if store.Clients==nil {store.Clients=map[string]*Client{}}
	c:=store.Clients["delta-planet"]
	if c==nil{
		c=&Client{Slug:"delta-planet",Name:"Delta Planet Mall",Sector:"Търговски център / retailtainment / развлечения",Note:"Пълен публичен профил · live monitoring · конкурентни досиета",Sources:deltaPlanetSources()}
		store.Clients[c.Slug]=c
	}else{
		c.Name="Delta Planet Mall";c.Sector="Търговски център / retailtainment / развлечения";c.Note="Пълен публичен профил · live monitoring · конкурентни досиета"
		seen:=map[string]bool{};for _,s:=range c.Sources{seen[s.Key]=true};for _,s:=range deltaPlanetSources(){if !seen[s.Key]{c.Sources=append(c.Sources,s)}}
	}
	mu.Unlock()
	seedDeltaPlanetFacts(c)
	return c
}

func deltaSignals()[]Signal{
	signalMu.RLock(); rows:=append([]Signal(nil),signalState.Signals["delta-planet"]...); signalMu.RUnlock()
	sort.SliceStable(rows,func(i,j int)bool{a,b:=rows[i].PublishedAt,rows[j].PublishedAt;if a==""{a=rows[i].DetectedAt};if b==""{b=rows[j].DetectedAt};return a>b})
	return rows
}
func deltaRecent(scope string,days int)[]Signal{
	cut:=time.Now().UTC().Add(-time.Duration(days)*24*time.Hour);out:=[]Signal{}
	for _,s:=range deltaSignals(){if scope!=""&&s.Scope!=scope{continue};t:=time.Time{};if x,ok:=parseCompetitorPublished(s.PublishedAt);ok{t=x}else if x,e:=time.Parse(time.RFC3339,s.DetectedAt);e==nil{t=x};if !t.IsZero()&&!t.Before(cut){out=append(out,s)}}
	return out
}
func deltaCompCount(name string,days int)int{n:=0;for _,s:=range deltaRecent("competitor",days){if strings.EqualFold(strings.TrimSpace(s.Brand),name){n++}};return n}
func deltaCompRow(name string)map[string]interface{}{return map[string]interface{}{"name":name,"score":0.0,"news":float64(deltaCompCount(name,90)),"activity":float64(deltaCompCount(name,90)),"trend":float64(deltaCompCount(name,30)),"live_mentions_30d":deltaCompCount(name,30),"live_mentions_90d":deltaCompCount(name,90),"score_status":"Няма измислен benchmark · live evidence only"}}

func deltaDashboard(c *Client)map[string]interface{}{
	brand90,pos90,neg90:=0,0,0
	for _,s:=range deltaRecent("",90){if s.Scope=="competitor"{continue};brand90++;if s.Sentiment=="positive"{pos90++};if s.Sentiment=="negative"{neg90++}}
	comp90:=len(deltaRecent("competitor",90))
	signals:=[]interface{}{}
	for _,s:=range deltaSignals(){if s.Scope=="competitor"{continue};level:="info";if s.Severity=="critical"||s.Severity=="high"{level="watch"}else if s.Sentiment=="positive"{level="positive"};signals=append(signals,map[string]interface{}{"level":level,"title":s.Title,"text":s.Text,"source":s.Source,"url":s.URL,"published_at":s.PublishedAt,"detected_at":s.DetectedAt,"topic":s.Topic});if len(signals)>=30{break}}
	return map[string]interface{}{
		"client":c.Slug,"slug":c.Slug,"client_slug":c.Slug,"name":c.Name,"sector":c.Sector,"note":c.Note,
		"blis_index":0.0,"benchmark":0.0,"relative":0.0,"confidence":0.0,"trend":0.0,"data_updated":latestObservedAt(c),
		"index_status":"Индексите ще се формират след натрупване на измерими live наблюдения; не се използват демо стойности.",
		"nav":[]interface{}{map[string]interface{}{"key":"overview","label":"Общ изглед","icon":"⌂"},map[string]interface{}{"key":"social","label":"Мониторинг","icon":"◉"},map[string]interface{}{"key":"market","label":"Среда","icon":"◎"},map[string]interface{}{"key":"competition","label":"Конкуренти","icon":"◇"},map[string]interface{}{"key":"history","label":"Развитие/Доклади","icon":"↗"}},
		"indices":[]interface{}{
			idx("presence","Публично присъствие",0,"Формира се от реални споменавания, официална активност и външна видимост след натрупване на live серия.",[]interface{}{comp("Споменавания · 90 дни",brand90,"live"),comp("Позитивни · 90 дни",pos90,"live"),comp("Негативни · 90 дни",neg90,"live")},"",[]string{"официален сайт","Google News","публичен web"}),
			idx("reputation","Репутация",0,"Следи оценки, потребителски теми, оплаквания и позитивни сигнали; стойност ще се публикува след достатъчно наблюдения.",[]interface{}{comp("Негативни сигнали · 90 дни",neg90,"live")},"",[]string{"Google Maps","Tripadvisor","публични източници"}),
			idx("digital","Дигитална видимост",0,"Следи официалния сайт, новини, промоции, събития и публични профили.",[]interface{}{comp("Официални източници",11,"configured")},"",[]string{"deltaplanet.bg","Google News"}),
			idx("competitive","Конкурентна среда",0,"Съпоставя live активността на Grand Mall Varna, Mall Varna и Retail Park Varna без фиктивен benchmark.",[]interface{}{comp("Конкурентни сигнали · 90 дни",comp90,"live"),comp("Наблюдавани конкурентни формати",3,"configured")},"",[]string{"Grand Mall Varna","Mall Varna","Retail Park Varna"}),
		},
		"metrics":[]interface{}{met("РЗП","над 120 000 m²"),met("Търговски площи","над 40 000 m²"),met("GLA · RetailMap","40 000 m²"),met("Паркоместа · RetailMap","1 300"),met("Марки","над 140"),met("Развлечения","над 4 000 m²"),met("Cinema City","12 зали · 4DX"),met("Публично посочена заетост · Visit Varna","94%"),met("Адрес","бул. „Сливница“ 185, Варна"),met("Контакт","052 810 232 · office@deltaplanet.bg"),met("Реклама и събития","Антоанета Тенева · antoaneta.teneva@deltaplanet.bg")},
		"signals":signals,
		"competitors":[]interface{}{deltaCompRow("Delta Planet Mall"),deltaCompRow("Grand Mall Varna"),deltaCompRow("Mall Varna"),deltaCompRow("Retail Park Varna")},
		"competitor_dossiers":[]interface{}{
			map[string]interface{}{"name":"Grand Mall Varna","tier":"пряк конкурент","format":"традиционен shopping mall","gla":"около 50 500 m²","parking":"около 1 700 места (исторически официално публикувана стойност)","anchors":"мода, техника, хипермаркет, Cineland/IMAX, Playground, Retro Museum","monitoring":"tenant mix; нови магазини; промоции; събития; кино/развлечения; F&B; leasing; репутация; кампании"},
			map[string]interface{}{"name":"Mall Varna","tier":"втори конкурентен кръг","format":"търговски + офис площи","gla":"13 523.85 m² търговски площи по официалния профил","parking":"277 места","anchors":"офиси, свободни площи, спорт/развлечения и услуги","monitoring":"свободни помещения; наематели; промени в предназначението; услуги; събития; собственост"},
			map[string]interface{}{"name":"Retail Park Varna","tier":"конкурентен формат","format":"retail park","gla":"13 000 m²","parking":"500 места","anchors":"Decathlon, JYSK, Zora, Design Center, Мебели Виденов","monitoring":"нови наематели; категории home/sport/tech; промоции; разширения; трафик и удобство"},
		},
		"live_summary":map[string]interface{}{"brand_mentions_90d":brand90,"competitor_mentions_90d":comp90,"positive_brand_mentions_90d":pos90,"negative_brand_mentions_90d":neg90},
	}
}

func bootstrapDeltaPlanet(){
	c:=ensureDeltaPlanetClient()
	if c==nil{return}
	runUniversalClientEngineV34(c,true)
	if continuousMonitoringMu.TryLock(){
		snap:=signalClientSnapshot("delta-planet")
		if snap!=nil{
			fresh:=collectClientSignals(snap)
			for _,t:=range competitorSignalTargets(snap){fresh=append(fresh,collectCompetitorNews(snap,t)...);fresh=append(fresh,collectCompetitorWeb(snap,t)...);fresh=append(fresh,collectCompetitorSocial(snap,t)...)}
			mergeSignals("delta-planet",dedupeSignals(fresh));saveSignalStateFile();saveStore()
		}
		continuousMonitoringMu.Unlock()
	}
}
func init(){go func(){time.Sleep(22*time.Second);bootstrapDeltaPlanet()}()}

func deltaPlanetKeywords(c *Client)[]map[string]interface{}{
	b:=len(deltaRecent("",90));k:=len(deltaRecent("competitor",90))
	return []map[string]interface{}{
		{"title":"Tenant mix","display":"140+ марки","source":"Delta Planet Mall · официален сайт","status":"Потвърдено","kind":"market","measured":true},
		{"title":"Търговски площи","display":"40 000+ m²","source":"Delta Planet Mall / RetailMap","status":"Потвърдено","kind":"market","measured":true},
		{"title":"Споменавания за Delta Planet Mall","display":fmt.Sprintf("%d публикации",b),"source":"BLIS public-source monitoring","status":"Live","kind":"media","value":b,"measured":true},
		{"title":"Конкурентни споменавания","display":fmt.Sprintf("%d публикации",k),"source":"BLIS competitor monitoring","status":"Live","kind":"competition","value":k,"measured":true},
	}
}
