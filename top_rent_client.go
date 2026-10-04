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
	topRentSeed(c,"locations","cross_border_deактуалноry","Атина; Солун; Белград; Скопие; Букурещ",stamp)
	topRentSeed(c,"locations","varna_airport_inside_terminal",true,stamp)
	topRentSeed(c,"locations","burgas_airport_inside_terminal",true,stamp)
	topRentSeed(c,"locations","sofia_airport_t1_t2",true,stamp)
	topRentSeed(c,"romania","bucharest_otopeni_office",true,stamp)
	topRentSeed(c,"faq","airport_service_24_7",true,stamp)
	topRentSeed(c,"contacts","national_booking_phone","+359 700 89 050",stamp)
	topRentSeed(c,"contacts","mobile_phone","+359 890 170 170",stamp)
	topRentSeed(c,"fleet","fleet_monitoring_enabled",true,stamp)
	topRentSeed(c,"prices","price_intelligence_enabled",true,stamp)
	topRentSeed(c,"prices","varna_hotel_deактуалноry_eur",18.0,stamp)
	topRentSeed(c,"prices","burgas_hotel_deактуалноry_eur",18.0,stamp)
	topRentSeed(c,"prices","sofia_head_office_to_airport_eur",20.0,stamp)
	topRentSeed(c,"prices","sofia_mladost_to_airport_eur",20.0,stamp)
	topRentSeed(c,"prices","sofia_varna_one_way_eur",190.0,stamp)
	topRentSeed(c,"prices","sofia_burgas_one_way_eur",170.0,stamp)
	topRentSeed(c,"prices","varna_burgas_one_way_eur",110.0,stamp)
	topRentSeed(c,"prices","sofia_bucharest_one_way_eur",320.0,stamp)
	topRentSeed(c,"prices","winter_season_start","01.10",stamp)
	topRentSeed(c,"prices","winter_season_end","30.04",stamp)
}


func seedTopRentVerifiedMentions(c *Client) {
	if c == nil { return }
	type verifiedMention struct {
		scope, brand, source, sourceType, rawURL, title, text, published, detected string
	}
	rows := []verifiedMention{
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","Top Rent A Car supports BRCC business delegation to Romania as mobility partner","Business delegation with nearly 40 Bulgarian companies visited Ploiești and Bucharest; TOP Rent A Car participated as mobility partner.","2026-10-02T09:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","New addition to the Top Rent A Car fleet – 20 Hyundai BAYON vehicles","TOP Rent A Car announced 20 Hyundai BAYON vehicles joining its fleet, following the earlier addition of 250 Hyundai i20 vehicles.","2026-09-30T09:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Reviews","review","https://toprentacar.bg/%D0%BE%D1%82%D0%B7%D0%B8%D0%B2%D0%B8/varna?feedback_rate=fair","Verified customer review · Varna","A verified customer review for the Varna location rated service as good and staff as excellent.","2026-09-29T12:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Reviews","review","https://toprentacar.bg/en/feedback","Verified customer review · service complaint","A verified customer review described a frustrating vehicle return and rim-damage inspection experience; retained as a reputation signal.","2026-08-16T12:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","TOP MOBILITY now offers bike rentals in Bulgaria","TOP MOBILITY announced bicycle rentals as an additional mobility service in Bulgaria.","2026-07-27T09:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","The New Opel Frontera Hybrid Automatic 2026","TOP Rent A Car announced another fleet expansion with the Opel Frontera Hybrid Automatic 2026.","2026-07-17T09:00:00+03:00","2026-10-04T15:10:00+03:00"},
		{"owned","TOP Rent A Car","TOP Rent A Car Blog","web","https://toprentacar.bg/en-news/author/admin/","Top Rent A Car supported ATP Challenger 50 Plovdiv 2026","TOP Rent A Car was presented as a long-term logistics partner of the Bulgarian Tennis Federation at ATP Challenger 50 Plovdiv 2026.","2026-07-13T09:00:00+03:00","2026-10-04T15:10:00+03:00"},

		{"competitor","Sixt","SIXT SE","news","https://about.sixt.com/en/ir/20th-consecutive-record-quarter-sixt-increases-h1-revenue-by-a-currency-adjusted-11-3-to-over-two-billion-euros/","SIXT reports 20th consecutive record quarter","SIXT reported H1 2026 revenue of EUR 2.12 billion, currency-adjusted growth of 11.3%, fleet expansion in line with demand and confirmed full-year guidance.","2026-08-13T07:30:00+02:00","2026-10-04T15:10:00+03:00"},
		{"competitor","Hertz","Hertz","promotion","https://www.hertz.com/rentacar/rental-car-deals/asia_ww_summersale","Hertz worldwide sale · up to 15%","Hertz promoted savings of up to 15% for worldwide rentals, with bookings during August 2026 and pickup dates extending through December 2026.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Hertz","Hertz Bulgaria","web","https://www.hertz.bg/en/car-rental/","Hertz Bulgaria promotes monthly rental and online check-in","Hertz Bulgaria currently highlights flexible monthly rentals, immediate availability, online check-in and Fly & Drive benefits.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Europcar","Europcar Bulgaria","promotion","https://www.europcar.com/bg-bg/p/xborder/bulgaria","Europcar Bulgaria summer rental offer · save 15%","Europcar published a Bulgaria rental promotion offering 15% savings, valid for reservations through 31 August 2026 and rentals from 1 to 28 days.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Europcar","Europcar","promotion","https://www.europcar.be/en-be/p/offers/affiliate","Europcar Bulgaria affiliate offer · 10%","Europcar lists a 10% Bulgaria discount for checkout periods from 20 August to 20 December 2026, for rentals from 1 to 28 days.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Green Motion","BookingAuto","promotion","https://bookingauto.com/en/bulgaria/varna-airport/green-motion","Green Motion Летище Варна · August 2026 offer","Public rental comparison data advertised up to 30% off Green Motion bookings at Летище Варна in August 2026.","","2026-10-04T15:10:00+03:00"},
		{"competitor","Green Motion","Skyscanner","marketplace","https://www.skyscanner.fr/location-voiture/prestataire-dans-pays/green-motion/bulgarie/675/29475258","Green Motion Bulgaria · public marketplace visibility","Skyscanner showed Green Motion car hire in Bulgaria with a 4.7/5 rating and available Mini, Economy and Compact categories in July 2026.","","2026-10-04T15:10:00+03:00"},
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
	status:="Изчаква достатъчно съпоставими актуално данни";if score>0{status="Измерено от публични сигнали"}
	return map[string]interface{}{"name":name,"score":score,"news":float64(n90),"activity":float64(n90),"trend":float64(n30),"актуално_mentions_30d":n30,"актуално_mentions_90d":n90,"score_status":status}
}
func topRentObservedQuality(c *Client)(coverage,freshness float64,observedSources,recentObs int){
	if c==nil||len(c.Sources)==0{return 0,0,0,0};seen:=map[string]bool{};fresh:=map[string]bool{};keys:=map[string]bool{}
	for _,s:=range c.Sources{keys[s.Key]=true};cut48:=time.Now().Add(-48*time.Hour);cut90:=time.Now().Add(-90*24*time.Hour)
	for _,o:=range c.Observations{if !keys[o.SourceKey]{continue};seen[o.SourceKey]=true;if t,e:=time.Parse(time.RFC3339,o.ObservedAt);e==nil{if t.After(cut48){fresh[o.SourceKey]=true};if t.After(cut90){recentObs++}}}
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
		"index_status":"Индексът използва само реално наблюдавани публични сигнали. Ценовият модул не публикува сравнение, докато не са налични съпоставими сценарии по локация, период, клас автомобил и условия.",
		"nav":[]interface{}{map[string]interface{}{"key":"overview","label":"Команден център","icon":"⌂"},map[string]interface{}{"key":"social","label":"Търсене и сигнали","icon":"◉"},map[string]interface{}{"key":"market","label":"Пазар и локации","icon":"◎"},map[string]interface{}{"key":"competition","label":"Цени и конкуренти","icon":"◇"},map[string]interface{}{"key":"history","label":"Прогнози/Доклади","icon":"↗"}},
		"indices":[]interface{}{
			idx("presence","Пазарна видимост",visibility,"Показва колко добре е покрита публичната среда на TOP Rent A Car и текущият обем на измеримите сигнали.",[]interface{}{comp("Наблюдавани източници",observedSources,"актуално"),comp("Покритие",coverage,"55%"),comp("Свежест · 48 часа",freshness,"20%"),comp("Споменавания · 90 дни",brand90,"25%")},"Покритие × 55% + свежест × 20% + нормализирани сигнали × 25%",[]string{"toprentacar.bg","Google News","публични източници"}),
			idx("reputation","Репутация",reputation,"Баланс на позитивните и негативните класифицирани сигнали за марката.",[]interface{}{comp("Позитивни · 90 дни",pos90,"актуално"),comp("Негативни · 90 дни",neg90,"актуално"),comp("Всички сигнали",brand90,"актуално")},"50 + 50 × (позитивни − негативни) / всички сигнали",[]string{"reviews","Google","публичен web"}),
			idx("digital","Готовност на данните",marketReadiness,"Оценява готовността на профила да дава търговски сигнали чрез покритие, свежест и активност на измерванията.",[]interface{}{comp("Покритие",coverage,"45%"),comp("Свежест",freshness,"25%"),comp("Наблюдения · 90 дни",recentObs,"30%")},"Покритие × 45% + свежест × 25% + активност × 30%",[]string{"официални източници","летища","туристически данни"}),
			idx("competitive","Конкурентна позиция",competitive,"Сравнителна видимост спрямо наблюдаваните конкуренти.",[]interface{}{comp("TOP сигнали · 90 дни",brand90,"актуално"),comp("Конкурентни сигнали · 90 дни",comp90,"актуално"),comp("Наблюдавани конкуренти",4,"зададени")},"TOP / (TOP + среден конкурентен обем) × 100",[]string{"Sixt","Hertz","Europcar","Green Motion"}),
		},
		"metrics":[]interface{}{
			met("Основни пазари","София · Пловдив · Варна · Бургас · Русе · Букурещ"),
			met("Летищно присъствие","SOF · PDV · VAR · BOJ · OTP"),
			met("Сезонни офиси","Слънчев бряг · Обзор · Златни пясъци"),
			met("Международно развитие","Букурещ Отопени"),
			met("Трансгранични доставки","Атина · Солун · Белград · Скопие · Букурещ"),
			met("Ценово разузнаване","Активно · само при съпоставими сценарии"),
			met("Пазарен хоризонт","24 ч. сигнали · 14/30 дни прогноза"),
			met("Основен фокус","търсене · цена · наличност · репутация · конкурентни движения"),
		},
		"market_command_center":map[string]interface{}{
			"pillars":[]interface{}{"Търсене","Цени","Конкуренти","Туристически поток","Репутация","Прогноза"},
			"decision_questions":[]interface{}{"Къде се ускорява търсенето?","Къде ценовата позиция се променя?","Кой конкурент прави ход?","Къде има възможност за по-висок приход?"},
		},
		"location_matrix":[]interface{}{
			map[string]interface{}{"market":"София","type":"летище + град","priority":"висок","signals":"полетен поток · служебни пътувания · градско търсене · конкуренти"},
			map[string]interface{}{"market":"Варна","type":"летище + град + курорти","priority":"висок сезонен","signals":"туризъм · полети · курортно търсене · цени"},
			map[string]interface{}{"market":"Бургас","type":"летище + град + курорти","priority":"висок сезонен","signals":"туризъм · полети · курортно търсене · цени"},
			map[string]interface{}{"market":"Пловдив","type":"летище + град","priority":"среден","signals":"полетен поток · градско търсене · събития"},
			map[string]interface{}{"market":"Русе","type":"град","priority":"развиващ","signals":"локално търсене · трансграничен поток"},
			map[string]interface{}{"market":"Букурещ","type":"летище · международен пазар","priority":"стратегически","signals":"търсене около OTP · местни конкуренти · развитие на пазара"},
		},
		"price_intelligence":map[string]interface{}{
			"status":"актуално_top_public_fees_competitor_quotes_guarded",
			"dimensions":[]interface{}{"локация","начална дата/час","крайна дата/час","клас автомобил","депозит","застраховка","лимит км","летищни/други такси"},
			"competitors":[]interface{}{"Sixt","Hertz","Europcar","Green Motion"},
			"output":[]interface{}{"ценова разлика","пазарна медиана","позиция спрямо пазара","открита промоция","разлика в таксите","сигнал за наличност"},
			"published_top_signals":[]interface{}{
				map[string]interface{}{"label":"Доставка до адрес/хотел · Варна","value":"18 €","type":"fee","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"Доставка до адрес/хотел · Бургас","value":"18 €","type":"fee","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"София централен офис → Летище София","value":"20 €","type":"one_way","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"София → Варна","value":"190 €","type":"one_way","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"София → Бургас","value":"170 €","type":"one_way","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"Варна → Бургас","value":"110 €","type":"one_way","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"София → Букурещ","value":"320 €","type":"one_way","source":"TOP Rent A Car"},
			},
			"standard_scenarios":[]interface{}{
				map[string]interface{}{"id":"SOF-ECO-3D","market":"София","pickup":"Летище София","iata":"SOF","class":"Икономичен / Компактен","days":3},
				map[string]interface{}{"id":"SOF-ECO-7D","market":"София","pickup":"Летище София","iata":"SOF","class":"Икономичен / Компактен","days":7},
				map[string]interface{}{"id":"SOF-ECO-14D","market":"София","pickup":"Летище София","iata":"SOF","class":"Икономичен / Компактен","days":14},
				map[string]interface{}{"id":"VAR-ECO-3D","market":"Варна","pickup":"Летище Варна","iata":"VAR","class":"Икономичен / Компактен","days":3},
				map[string]interface{}{"id":"VAR-ECO-7D","market":"Варна","pickup":"Летище Варна","iata":"VAR","class":"Икономичен / Компактен","days":7},
				map[string]interface{}{"id":"VAR-ECO-14D","market":"Варна","pickup":"Летище Варна","iata":"VAR","class":"Икономичен / Компактен","days":14},
				map[string]interface{}{"id":"BOJ-ECO-3D","market":"Бургас","pickup":"Летище Бургас","iata":"BOJ","class":"Икономичен / Компактен","days":3},
				map[string]interface{}{"id":"BOJ-ECO-7D","market":"Бургас","pickup":"Летище Бургас","iata":"BOJ","class":"Икономичен / Компактен","days":7},
				map[string]interface{}{"id":"BOJ-ECO-14D","market":"Бургас","pickup":"Летище Бургас","iata":"BOJ","class":"Икономичен / Компактен","days":14},
				map[string]interface{}{"id":"OTP-ECO-3D","market":"Букурещ","pickup":"Отопени","iata":"OTP","class":"Икономичен / Компактен","days":3},
				map[string]interface{}{"id":"OTP-ECO-7D","market":"Букурещ","pickup":"Отопени","iata":"OTP","class":"Икономичен / Компактен","days":7},
				map[string]interface{}{"id":"OTP-ECO-14D","market":"Букурещ","pickup":"Отопени","iata":"OTP","class":"Икономичен / Компактен","days":14},
			},
			"quote_comparison_state":map[string]interface{}{
				"required_fields":[]interface{}{"supplier","scenario_id","total_price","currency","deposit","insurance","mileage","airport_fee","other_fees","availability","captured_at"},
				"minimum_competitors":2,
				"publish_rule":"Покажи пазарна медиана и ценова разлика само при минимум TOP + 2 конкурента със съпоставими условия.",
			},
		},
		"demand_intelligence":map[string]interface{}{
			"inputs":[]interface{}{"полетен капацитет","туристически поток","сезонност","празници","събития","търсене по дестинация","конкурентна наличност"},
			"horizons":[]interface{}{"7 дни","14 дни","30 дни"},
			"output":[]interface{}{"Натиск на търсенето","Възможност по локация","Сигнал за разпределение на автопарка","Възможност за по-висок приход"},
			"season_context":"Зимен сезон на публикуваните еднопосочни тарифи: 01.10–30.04",
			"markets":[]interface{}{
				map[string]interface{}{"market":"София","h7":"стабилно","h14":"стабилно","h30":"стабилно","confidence":"средна","driver":"целогодишно летищно + градско + служебно търсене","fleet_signal":"поддържай широк микс; наблюдавай икономичния, компактния и бизнес сегмента"},
				map[string]interface{}{"market":"Варна","h7":"сезонен спад","h14":"сезонен спад","h30":"ниска сезонност","confidence":"средна","driver":"преход след летния сезон; активен летищен поток остава","fleet_signal":"редуцирай свръхналичност; запази гъвкав резерв в икономичния и компактния клас"},
				map[string]interface{}{"market":"Бургас","h7":"сезонен спад","h14":"сезонен спад","h30":"ниска сезонност","confidence":"средна","driver":"силно сезонен туристически пазар след 30.09","fleet_signal":"приоритизирай трансфер към целогодишни пазари при доказан излишък"},
				map[string]interface{}{"market":"Пловдив","h7":"стабилно","h14":"стабилно","h30":"умерено","confidence":"ниска-средна","driver":"по-малък летищен и градски пазар","fleet_signal":"поддържай оптимизиран базов парк; избягвай излишък"},
				map[string]interface{}{"market":"Русе","h7":"умерено","h14":"умерено","h30":"умерено","confidence":"ниска","driver":"локално + трансгранично търсене","fleet_signal":"малък адаптивен парк; следи трансграничните заявки"},
				map[string]interface{}{"market":"Букурещ","h7":"стратегическо наблюдение","h14":"стратегическо наблюдение","h30":"растежов тест","confidence":"ниска-средна","driver":"нов международен пазар / OTP","fleet_signal":"следи натоварването и предварителния срок на резервациите преди разширяване"},
			},
		},
		"fleet_allocation":map[string]interface{}{
			"status":"подкрепа за решение"
			"current_actions":[]interface{}{
				map[string]interface{}{"from":"Бургас","to":"София / друг целогодишен пазар","action":"наблюдавай за потенциално преразпределение","condition":"само при доказан излишък и по-силен demand signal в целта"},
				map[string]interface{}{"from":"Варна","to":"София / Букурещ","action":"наблюдавай баланса в икономичния и компактния клас","condition":"след сравнение на натиск от резервации и наличност"},
				map[string]interface{}{"from":"София","to":"—","action":"поддържай широк продуктов микс","condition":"целогодишна база + летищно и служебно търсене"},
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
			map[string]interface{}{"title":"Възможност за по-висок приход","state":"актуално when evidence is sufficient"},
			map[string]interface{}{"title":"Разпределение на автопарка","state":"активно"},
			map[string]interface{}{"title":"Конкурентен сигнал","state":"активно наблюдение"},
			map[string]interface{}{"title":"Репутационен сигнал","state":"активно наблюдение"},
		},
		"актуално_summary":map[string]interface{}{"brand_mentions_90d":brand90,"competitor_mentions_90d":comp90,"positive_brand_mentions_90d":pos90,"negative_brand_mentions_90d":neg90},
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
