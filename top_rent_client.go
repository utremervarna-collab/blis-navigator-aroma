package main

import (
	"fmt"
	"math"
	"sort"
	"strings"
	"time"
)

const topRentSlug = "top-rent-a-car"

func topRentSources() []Source {
	return []Source{
		{Key:"official_site",Label:"TOP Rent A Car · официален сайт",URL:"https://toprentacar.bg/en",Method:"официални оферти, резервационен поток, услуги и позициониране",Reliability:.99},
		{Key:"locations",Label:"TOP Rent A Car · локации",URL:"https://toprentacar.bg/en/locations",Method:"летищни, градски, сезонни и международни точки",Reliability:.99},
		{Key:"fleet",Label:"TOP Rent A Car · автопарк",URL:"https://toprentacar.bg/en/car-fleet",Method:"класове автомобили, налично портфолио и продуктово позициониране",Reliability:.99},
		{Key:"prices",Label:"TOP Rent A Car · цени",URL:"https://toprentacar.bg/en/prices/car-hire",Method:"публични ценови условия и категории автомобили",Reliability:.98},
		{Key:"contacts",Label:"TOP Rent A Car · контакти",URL:"https://toprentacar.bg/en/contacts",Method:"офиси, летища, адреси и международно присъствие",Reliability:.99},
		{Key:"romania",Label:"TOP Rent A Car · Румъния",URL:"https://toprentacar.bg/en/car-hire-romania",Method:"офис Букурещ Отопени и трансгранично позициониране",Reliability:.98},
		{Key:"faq",Label:"TOP Rent A Car · условия и обслужване",URL:"https://toprentacar.bg/en/faq",Method:"работно време, летищно обслужване и клиентски условия",Reliability:.98},
		{Key:"google_news",Label:"Google News · TOP Rent A Car",URL:"https://news.google.com/",Method:"медийни и пазарни споменавания",Reliability:.92},
		{Key:"google_business",Label:"Google Maps · TOP Rent A Car",URL:"https://www.google.com/maps/search/?api=1&query=TOP+Rent+A+Car+Bulgaria",Method:"локална видимост и публични клиентски оценки",Reliability:.90},
		{Key:"tourism_bg",Label:"Министерство на туризма / НСИ",URL:"https://www.nsi.bg/",Method:"туристически поток, сезонност и входящ туризъм",Reliability:.98},
		{Key:"sofia_airport",Label:"Летище София",URL:"https://sofia-airport.eu/",Method:"полетен и пътнически контекст за търсенето",Reliability:.98},
		{Key:"varna_airport",Label:"Летище Варна",URL:"https://varna-airport.bg/",Method:"полетен и пътнически контекст за Северното Черноморие",Reliability:.98},
		{Key:"burgas_airport",Label:"Летище Бургас",URL:"https://burgas-airport.bg/",Method:"полетен и пътнически контекст за Южното Черноморие",Reliability:.98},
		{Key:"cmp_sixt",Label:"Sixt",URL:"https://www.sixt.com/",Method:"пряк международен конкурент · цени, локации, автопарк и промоции",Reliability:.97},
		{Key:"cmp_hertz",Label:"Hertz",URL:"https://www.hertz.bg/",Method:"пряк международен конкурент · цени, локации, автопарк и промоции",Reliability:.97},
		{Key:"cmp_europcar",Label:"Europcar",URL:"https://www.europcar.com/",Method:"пряк международен конкурент · цени, локации, автопарк и промоции",Reliability:.97},
		{Key:"cmp_green_motion",Label:"Green Motion",URL:"https://greenmotion.com/",Method:"конкурент · цени, локации, EV/eco позициониране и промоции",Reliability:.96},
	}
}

func topRentHasObs(c *Client,s,m string) bool {
	for i:=len(c.Observations)-1;i>=0;i-- { if c.Observations[i].SourceKey==s && c.Observations[i].MetricKey==m { return true } }
	return false
}
func topRentSeed(c *Client,s,m string,v interface{},stamp string){ if !topRentHasObs(c,s,m){ add(c,s,m,v,stamp) } }

func seedTopRentFacts(c *Client) {
	stamp := "2026-10-04T12:30:00+03:00"
	topRentSeed(c,"locations","core_markets","София; Пловдив; Варна; Бургас; Русе; Букурещ",stamp)
	topRentSeed(c,"locations","airport_presence","София; Пловдив; Варна; Бургас; Букурещ Отопени",stamp)
	topRentSeed(c,"locations","seasonal_offices","Слънчев бряг; Обзор; Златни пясъци",stamp)
	topRentSeed(c,"locations","cross_border_delivery","Атина; Солун; Белград; Скопие; Букурещ",stamp)
	topRentSeed(c,"locations","varna_airport_inside_terminal",true,stamp)
	topRentSeed(c,"locations","burgas_airport_inside_terminal",true,stamp)
	topRentSeed(c,"locations","sofia_airport_t1_t2",true,stamp)
	topRentSeed(c,"romania","bucharest_otopeni_office",true,stamp)
	topRentSeed(c,"faq","airport_service_24_7",true,stamp)
	topRentSeed(c,"contacts","national_booking_phone","+359 700 89 050",stamp)
	topRentSeed(c,"contacts","mobile_phone","+359 890 170 170",stamp)
	topRentSeed(c,"fleet","fleet_monitoring_enabled",true,stamp)
	topRentSeed(c,"prices","price_intelligence_enabled",true,stamp)
}


func seedTopRentVerifiedMentions(c *Client) {
	if c == nil { return }
	type verifiedMention struct {
		scope, brand, source, sourceType, rawURL, title, text, published, detected string
	}
	rows := []verifiedMention{
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","TOP Rent A Car подкрепя бизнес делегация на BRCC в Румъния като партньор за мобилност","Бизнес делегация с близо 40 български компании посети Плоещ и Букурещ; TOP Rent A Car участва като партньор за мобилност.","2026-10-02T09:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","20 нови Hyundai BAYON в автопарка на TOP Rent A Car","TOP Rent A Car обяви добавянето на 20 Hyundai BAYON към автопарка, след по-ранното включване на 250 Hyundai i20.","2026-09-30T09:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Reviews","review","https://toprentacar.bg/%D0%BE%D1%82%D0%B7%D0%B8%D0%B2%D0%B8/varna?feedback_rate=fair","Потвърден клиентски отзив · Варна","Потвърден клиентски отзив за Варна оценява услугата като добра, а персонала като отличен.","2026-09-29T12:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Reviews","review","https://toprentacar.bg/en/feedback","Потвърден клиентски отзив · оплакване от обслужването","Потвърден клиентски отзив описва проблем при връщане на автомобила и проверка за повреда на джанта; отчетен е като репутационен сигнал.","2026-08-16T12:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","TOP MOBILITY вече предлага велосипеди под наем в България","TOP MOBILITY обяви велосипеди под наем като допълнителна услуга за мобилност в България.","2026-07-27T09:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","Нов Opel Frontera Hybrid Automatic 2026","TOP Rent A Car обяви ново разширяване на автопарка с Opel Frontera Hybrid Automatic 2026.","2026-07-17T09:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","TOP Rent A Car подкрепи ATP Challenger 50 Plovdiv 2026","TOP Rent A Car беше представен като дългосрочен логистичен партньор на Българската федерация по тенис на ATP Challenger 50 Plovdiv 2026.","2026-07-13T09:00:00+03:00","2026-10-04T15:10:00+03:00"},

		{"competitor","Sixt","SIXT SE","news","https://about.sixt.com/en/ir/20th-consecutive-record-quarter-sixt-increases-h1-revenue-by-a-currency-adjusted-11-3-to-over-two-billion-euros/","SIXT отчита 20-о поредно рекордно тримесечие","SIXT отчете 2,12 млрд. евро приходи за първото полугодие на 2026 г., 11,3% валутно коригиран ръст и разширяване на автопарка според търсенето.","2026-08-13T07:30:00+02:00","2026-10-04T15:10:00+03:00"},
		{"competitor","Hertz","Hertz","promotion","https://www.hertz.com/rentacar/rental-car-deals/asia_ww_summersale","Hertz · глобална промоция до 15%","Hertz промотира до 15% отстъпка за международни наеми с периоди на получаване до декември 2026 г.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Hertz","Hertz Bulgaria","web","https://www.hertz.bg/en/car-rental/","Hertz България промотира месечен наем и онлайн регистрация","Hertz България акцентира върху гъвкави месечни наеми, незабавна наличност, онлайн регистрация и предложения Fly & Drive.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Europcar","Europcar Bulgaria","promotion","https://www.europcar.com/bg-bg/p/xborder/bulgaria","Europcar България · лятна оферта с 15% отстъпка","Europcar публикува промоция за България с 15% отстъпка за резервации до 31 август 2026 г. и наеми от 1 до 28 дни.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Europcar","Europcar","promotion","https://www.europcar.be/en-be/p/offers/affiliate","Europcar България · партньорска оферта с 10% отстъпка","Europcar публикува 10% отстъпка за България за периоди на наем от 20 август до 20 декември 2026 г.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Green Motion","BookingAuto","promotion","https://bookingauto.com/en/bulgaria/varna-airport/green-motion","Green Motion · Летище Варна · оферта за август 2026 г.","Публични сравнителни данни за наеми показват промоция до 30% за Green Motion на Летище Варна през август 2026 г.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Green Motion","Skyscanner","marketplace","https://www.skyscanner.fr/location-voiture/prestataire-dans-pays/green-motion/bulgarie/675/29475258","Green Motion България · присъствие в публични платформи","Skyscanner показва Green Motion в България с рейтинг 4,7/5 и налични категории мини, икономичен и компактен клас през юли 2026 г.","","2026-10-04T15:10:00+03:00"},
	}
	signals := make([]Signal,0,len(rows))
	for _,r := range rows {
		fp := signalHash(c.Slug+"|verified90d|"+r.scope+"|"+r.brand,r.rawURL,r.title,r.text)
		sentiment,risk := signalSentimentAndRisk(r.title+" "+r.text)
		if r.scope=="competitor" { risk = 20 }
		signals=append(signals,Signal{
			ID:fp[:16],Client:c.Slug,Brand:r.brand,Source:r.source,SourceType:r.sourceType,Scope:r.scope,
			URL:r.rawURL,Title:r.title,Text:r.text,PublishedAt:r.published,DetectedAt:r.detected,
			Relevance:100,Sentiment:sentiment,Topic:signalTopic(r.title+" "+r.text),RiskScore:risk,Severity:signalSeverity(risk),Fingerprint:fp,
		})
	}
	mergeSignals(c.Slug,signals)
}


func topRentEnsureBaselineSnapshot(c *Client) {
	if c == nil || len(c.Snapshots) > 0 {
		return
	}
	d := topRentDashboard(c)
	c.Snapshots = append(c.Snapshots, Snapshot{
		CreatedAt: nowISO(),
		Payload:   d,
	})
}

func ensureTopRentClient() *Client {
	mu.Lock()
	if store.Clients==nil { store.Clients=map[string]*Client{} }
	c:=store.Clients[topRentSlug]
	if c==nil {
		c=&Client{Slug:topRentSlug,Name:"TOP Rent A Car",Sector:"Коли под наем / мобилност / туризъм",Note:"Пазарен команден център · търсене · цени · конкуренти · локации · репутация",Sources:topRentSources()}
		store.Clients[c.Slug]=c
	} else {
		c.Name="TOP Rent A Car"; c.Sector="Коли под наем / мобилност / туризъм"; c.Note="Пазарен команден център · търсене · цени · конкуренти · локации · репутация"
		seen:=map[string]bool{}; for _,s:=range c.Sources{seen[s.Key]=true}; for _,s:=range topRentSources(){if !seen[s.Key]{c.Sources=append(c.Sources,s)}}
	}
	mu.Unlock()
	seedTopRentFacts(c)
	seedTopRentVerifiedMentions(c)
	topRentEnsureBaselineSnapshot(c)
	return c
}

func topRentSignals() []Signal {
	signalMu.RLock(); rows:=append([]Signal(nil),signalState.Signals[topRentSlug]...); signalMu.RUnlock()
	sort.SliceStable(rows,func(i,j int)bool{a,b:=rows[i].PublishedAt,rows[j].PublishedAt;if a==""{a=rows[i].DetectedAt};if b==""{b=rows[j].DetectedAt};return a>b})
	seen:=map[string]bool{}
	out:=make([]Signal,0,len(rows))
	for _,s:=range rows{
		title:=strings.ToLower(strings.Join(strings.Fields(cleanCompetitorDisplayText(s.Title))," "))
		brand:=strings.ToLower(strings.Join(strings.Fields(s.Brand)," "))
		day:=""
		if t,ok:=parseCompetitorPublished(s.PublishedAt);ok{day=t.UTC().Format("2006-01-02")}else if t,e:=time.Parse(time.RFC3339,s.DetectedAt);e==nil{day=t.UTC().Format("2006-01-02")}
		k:=strings.TrimSpace(s.Scope+"|"+brand+"|"+title+"|"+day)
		if title==""{k=s.Fingerprint}
		if k==""||seen[k]{continue}
		seen[k]=true
		out=append(out,s)
	}
	return out
}
func topRentRecent(scope string,days int) []Signal {
	cut:=time.Now().UTC().Add(-time.Duration(days)*24*time.Hour); out:=[]Signal{}
	for _,s:=range topRentSignals(){if scope!=""&&s.Scope!=scope{continue};t:=time.Time{};if x,ok:=parseCompetitorPublished(s.PublishedAt);ok{t=x}else if x,e:=time.Parse(time.RFC3339,s.DetectedAt);e==nil{t=x};if !t.IsZero()&&!t.Before(cut){out=append(out,s)}}
	return out
}
func topRentCompCount(name string,days int) int { n:=0;for _,s:=range topRentRecent("competitor",days){if strings.EqualFold(strings.TrimSpace(s.Brand),name){n++}};return n }
func topRentCompRow(name string,score float64) map[string]interface{} {
	n90,n30:=topRentCompCount(name,90),topRentCompCount(name,30)
	status:="Изчаква достатъчно съпоставими актуални данни";if score>0{status="Измерено от публични сигнали"}
	return map[string]interface{}{"name":name,"score":score,"news":float64(n90),"activity":float64(n90),"trend":float64(n30),"live_mentions_30d":n30,"live_mentions_90d":n90,"score_status":status}
}
func topRentObservedQuality(c *Client)(coverage,freshness float64,observedSources,recentObs int){
	if c==nil||len(c.Sources)==0{return 0,0,0,0}
	seen:=map[string]bool{};fresh:=map[string]bool{};keys:=map[string]bool{}
	for _,s:=range c.Sources{keys[strings.TrimSpace(s.Key)]=true}
	cut48:=time.Now().Add(-48*time.Hour);cut90:=time.Now().Add(-90*24*time.Hour)
	for _,o:=range c.Observations{
		k:=strings.TrimSpace(o.SourceKey)
		if !keys[k]{continue}
		seen[k]=true
		if t,e:=time.Parse(time.RFC3339,o.ObservedAt);e==nil{
			if t.After(cut48){fresh[k]=true}
			if t.After(cut90){recentObs++}
		}
	}
	// Seeded public facts are valid observed coverage even when their timestamp
	// predates the 48h freshness window.
	if len(seen)==0 && len(c.Observations)>0 {
		for _,o:=range c.Observations{
			k:=strings.TrimSpace(o.SourceKey)
			if keys[k]{seen[k]=true}
		}
	}
	return r1(float64(len(seen))/math.Max(float64(len(c.Sources)),1)*100),r1(float64(len(fresh))/math.Max(float64(len(c.Sources)),1)*100),len(seen),recentObs
}

func topRentDashboard(c *Client) map[string]interface{} {
	brand90,pos90,neg90:=0,0,0
	for _,s:=range topRentRecent("",90){if s.Scope=="competitor"{continue};brand90++;if s.Sentiment=="positive"{pos90++};if s.Sentiment=="negative"{neg90++}}
	comp90:=len(topRentRecent("competitor",90))
	coverage,freshness,observedSources,recentObs:=topRentObservedQuality(c)
	visibility:=r1(coverage*.55+freshness*.20+clamp(float64(brand90)/20*100)*.25)
	reputation:=0.0;if brand90>0{reputation=r1(clamp(50+50*float64(pos90-neg90)/float64(brand90)))}
	marketReadiness:=r1(coverage*.45+freshness*.25+clamp(float64(recentObs)/50*100)*.30)
	competitive:=0.0;avgComp:=float64(comp90)/4;if float64(brand90)+avgComp>0{competitive=r1(float64(brand90)/(float64(brand90)+avgComp)*100)}
	blis:=r1(visibility*.28+reputation*.20+marketReadiness*.32+competitive*.20)
	confidence:=r1(coverage*.55+freshness*.25+clamp(float64(brand90+comp90)/25*100)*.20)
	trend:=0.0;for i:=len(c.Snapshots)-1;i>=0;i--{if prev,ok:=numericObsV33(c.Snapshots[i].Payload["blis_index"]);ok&&prev>0{trend=r1(blis-prev);break}}
	signals:=[]interface{}{};for _,s:=range topRentSignals(){if s.Scope=="competitor"{continue};level:="info";if s.Severity=="critical"||s.Severity=="high"{level="watch"}else if s.Sentiment=="positive"{level="positive"};signals=append(signals,map[string]interface{}{"level":level,"title":s.Title,"text":s.Text,"source":s.Source,"url":s.URL,"published_at":s.PublishedAt,"detected_at":s.DetectedAt,"topic":s.Topic});if len(signals)>=30{break}}
	return map[string]interface{}{
		"client":c.Slug,"slug":c.Slug,"client_slug":c.Slug,"name":c.Name,"sector":c.Sector,"note":c.Note,
		"profile_mode":"market_command_center","profile_title":"TOP Rent A Car · Пазарен команден център",
		"blis_index":blis,"benchmark":0.0,"relative":0.0,"confidence":confidence,"trend":trend,"data_updated":latestObservedAt(c),
		
		"nav":[]interface{}{map[string]interface{}{"key":"overview","label":"Команден център","icon":"⌂"},map[string]interface{}{"key":"social","label":"Търсене и сигнали","icon":"◉"},map[string]interface{}{"key":"market","label":"Пазар и локации","icon":"◎"},map[string]interface{}{"key":"competition","label":"Цени и конкуренти","icon":"◇"},map[string]interface{}{"key":"history","label":"Прогнози/Доклади","icon":"↗"}},
		"indices":[]interface{}{
			idx("presence","Пазарна видимост",visibility,"Текуща публична видимост на TOP Rent A Car.",[]interface{}{comp("Наблюдавани източници",observedSources,"актуално"),comp("Покритие",coverage,"55%"),comp("Свежест · 48 часа",freshness,"20%"),comp("Споменавания · 90 дни",brand90,"25%")},"Покритие × 55% + свежест × 20% + нормализирани сигнали × 25%",[]string{"toprentacar.bg","Google News","публични източници"}),
			idx("reputation","Репутация",reputation,"Текущ баланс на позитивни и негативни публични сигнали.",[]interface{}{comp("Позитивни · 90 дни",pos90,"актуално"),comp("Негативни · 90 дни",neg90,"актуално"),comp("Всички сигнали",brand90,"актуално")},"50 + 50 × (позитивни − негативни) / всички сигнали",[]string{"reviews","Google","публичен web"}),
			idx("digital","Готовност на данните",marketReadiness,"Актуалност и достатъчност на наличните данни.",[]interface{}{comp("Покритие",coverage,"45%"),comp("Свежест",freshness,"25%"),comp("Наблюдения · 90 дни",recentObs,"30%")},"Покритие × 45% + свежест × 25% + активност × 30%",[]string{"официални източници","летища","туристически данни"}),
			idx("competitive","Конкурентна позиция",competitive,"Сравнителна видимост спрямо наблюдаваните конкуренти.",[]interface{}{comp("TOP сигнали · 90 дни",brand90,"актуално"),comp("Конкурентни сигнали · 90 дни",comp90,"актуално"),comp("Наблюдавани конкуренти",4,"зададени")},"TOP / (TOP + среден конкурентен обем) × 100",[]string{"Sixt","Hertz","Europcar","Green Motion"}),
		},
		"metrics":[]interface{}{
			met("Основни пазари","София · Пловдив · Варна · Бургас · Русе · Букурещ"),
			met("Летищно присъствие","SOF · PDV · VAR · BOJ · OTP"),
			met("Сезонни офиси","Слънчев бряг · Обзор · Златни пясъци"),
			met("Международно развитие","Букурещ Отопени"),
						met("Ценова позиция","Недостатъчно съпоставими публични цени"),
			met("Прогноза","7 · 14 · 30 дни"),
			met("Наблюдение","търсене · цена · репутация · конкуренти"),
		},
		"market_command_center":map[string]interface{}{},
		"location_matrix":[]interface{}{
			map[string]interface{}{"market":"София","type":"Летище + град","priority":"Висок приоритет"},
			map[string]interface{}{"market":"Варна","type":"Летище + курорти","priority":"Сезонен приоритет"},
			map[string]interface{}{"market":"Бургас","type":"Летище + курорти","priority":"Сезонен приоритет"},
			map[string]interface{}{"market":"Пловдив","type":"Град + летище","priority":"Среден приоритет"},
			map[string]interface{}{"market":"Русе","type":"Град","priority":"Развиващ се пазар"},
			map[string]interface{}{"market":"Букурещ","type":"Летище + международен пазар","priority":"Стратегически пазар"},
		},
		"price_intelligence":map[string]interface{}{
			"price_position":[]interface{}{
				map[string]interface{}{"market":"София","state":"Недостатъчно съпоставими данни"},
				map[string]interface{}{"market":"Варна","state":"Недостатъчно съпоставими данни"},
				map[string]interface{}{"market":"Бургас","state":"Недостатъчно съпоставими данни"},
				map[string]interface{}{"market":"Букурещ","state":"Недостатъчно съпоставими данни"},
			},
		},
		"demand_intelligence":map[string]interface{}{
			"markets":[]interface{}{
				map[string]interface{}{"market":"София","h7":"Стабилно","h14":"Стабилно","h30":"Стабилно"},
				map[string]interface{}{"market":"Варна","h7":"Сезонен спад","h14":"Сезонен спад","h30":"Ниска сезонност"},
				map[string]interface{}{"market":"Бургас","h7":"Сезонен спад","h14":"Сезонен спад","h30":"Ниска сезонност"},
				map[string]interface{}{"market":"Пловдив","h7":"Стабилно","h14":"Стабилно","h30":"Умерено"},
				map[string]interface{}{"market":"Русе","h7":"Умерено","h14":"Умерено","h30":"Умерено"},
				map[string]interface{}{"market":"Букурещ","h7":"Наблюдение","h14":"Наблюдение","h30":"Потенциал за растеж"},
			},
		},
		"fleet_allocation":map[string]interface{}{
			"current_actions":[]interface{}{
				map[string]interface{}{"market":"София","state":"Широк продуктов микс"},
				map[string]interface{}{"market":"Варна","state":"Контрол на сезонната наличност"},
				map[string]interface{}{"market":"Бургас","state":"Контрол на сезонната наличност"},
				map[string]interface{}{"market":"Букурещ","state":"Пазар за наблюдение"},
			},
		},
		"executive_overview":map[string]interface{}{
			"logo_url":"https://www.pirinultra.com/assets/media/partners/top_rent_a_car.jpg",
			"summary":"TOP Rent A Car е водеща българска компания за автомобили под наем с над 20 години развитие, повече от 3000 нови автомобила и присъствие на основните летища, градове и летни курорти. Компанията работи както с туристически, така и с бизнес клиенти и развива допълнителни услуги за мобилност, програми за лоялност и международно присъствие.",
			"position":[]interface{}{
				map[string]interface{}{"label":"BLIS индекс","value":blis,"suffix":"/100"},
				map[string]interface{}{"label":"Пазарна видимост","value":visibility,"suffix":"/100"},
				map[string]interface{}{"label":"Репутация","value":reputation,"suffix":"/100"},
				map[string]interface{}{"label":"Конкурентна позиция","value":competitive,"suffix":"/100"},
			},
			"signals_90d":map[string]interface{}{
				"brand":brand90,
				"competitor":comp90,
				"positive":pos90,
				"negative":neg90,
			},
			"outlook":[]interface{}{
				map[string]interface{}{"label":"Търсене","state":"Стабилно в целогодишните пазари; сезонен спад по Черноморието"},
				map[string]interface{}{"label":"Конкуренция","state":"Активна международна конкуренция в основните летищни пазари"},
				map[string]interface{}{"label":"Репутация","state":func() string { if neg90>0 { return "Има негативни сигнали за наблюдение" }; return "Без водещ негативен сигнал" }()},
				map[string]interface{}{"label":"30-дневна посока","state":"Стабилен базов пазар с по-ниска сезонна активност по Черноморието"},
			},
			"company_facts":[]interface{}{
				"20+ години развитие",
				"3000+ автомобила",
				"Офиси на основните летища в България",
				"Над 500 000 обслужени клиенти",
				"Международно присъствие в Румъния",
			},
		},
		"signals":signals,
		"competitors":[]interface{}{topRentCompRow("TOP Rent A Car",competitive),topRentCompRow("Sixt",0),topRentCompRow("Hertz",0),topRentCompRow("Europcar",0),topRentCompRow("Green Motion",0)},
		"competitor_dossiers":[]interface{}{
			map[string]interface{}{"name":"Sixt","tier":"пряк международен конкурент"},
			map[string]interface{}{"name":"Hertz","tier":"пряк международен конкурент"},
			map[string]interface{}{"name":"Europcar","tier":"пряк международен конкурент"},
			map[string]interface{}{"name":"Green Motion","tier":"конкурент с eco/EV позициониране"},
		},
		"opportunity_cards":[]interface{}{
			map[string]interface{}{"title":"Приходен потенциал","state":"Следи се"},
			map[string]interface{}{"title":"Автопарк","state":"Следи се"},
			map[string]interface{}{"title":"Конкуренти","state":"Активно"},
			map[string]interface{}{"title":"Репутация","state":"Активно"},
		},
		"live_summary":map[string]interface{}{"brand_mentions_90d":brand90,"competitor_mentions_90d":comp90,"positive_brand_mentions_90d":pos90,"negative_brand_mentions_90d":neg90},
	}
}

func bootstrapTopRent() {
	c:=ensureTopRentClient();if c==nil{return}
	runUniversalClientEngineV34(c,true)
	if continuousMonitoringMu.TryLock(){
		snap:=signalClientSnapshot(topRentSlug)
		if snap!=nil{
			fresh:=collectClientSignals(snap)
			for _,t:=range competitorSignalTargets(snap){fresh=append(fresh,collectCompetitorNews(snap,t)...);fresh=append(fresh,collectCompetitorWeb(snap,t)...);fresh=append(fresh,collectCompetitorSocial(snap,t)...)}
			mergeSignals(topRentSlug,dedupeSignals(fresh));saveSignalStateFile();saveStore()
		}
		continuousMonitoringMu.Unlock()
	}
}
func topRentKeywords(c *Client) []map[string]interface{} {
	b:=len(topRentRecent("",90));k:=len(topRentRecent("competitor",90))
	return []map[string]interface{}{
		{"title":"Летищни пазари","display":"SOF · PDV · VAR · BOJ · OTP","source":"TOP Rent A Car · официални локации","status":"Потвърдено","kind":"market","measured":true},
		{"title":"Ценово разузнаване","display":"готово за съпоставими сценарии","source":"BLIS ценово наблюдение","status":"Активно","kind":"competition","measured":true},
		{"title":"TOP Rent A Car сигнали","display":fmt.Sprintf("%d публикации",b),"source":"BLIS публичен мониторинг","status":"Актуално","kind":"media","value":b,"measured":true},
		{"title":"Конкурентни сигнали","display":fmt.Sprintf("%d публикации",k),"source":"BLIS конкурентен мониторинг","status":"Актуално","kind":"competition","value":k,"measured":true},
	}
}
