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
	topRentSeed(c,"prices","varna_hotel_delivery_eur",18.0,stamp)
	topRentSeed(c,"prices","burgas_hotel_delivery_eur",18.0,stamp)
	topRentSeed(c,"prices","sofia_head_office_to_airport_eur",20.0,stamp)
	topRentSeed(c,"prices","sofia_mladost_to_airport_eur",20.0,stamp)
	topRentSeed(c,"prices","sofia_varna_one_way_eur",190.0,stamp)
	topRentSeed(c,"prices","sofia_burgas_one_way_eur",170.0,stamp)
	topRentSeed(c,"prices","varna_burgas_one_way_eur",110.0,stamp)
	topRentSeed(c,"prices","sofia_bucharest_one_way_eur",320.0,stamp)
	topRentSeed(c,"prices","winter_season_start","01.10",stamp)
	topRentSeed(c,"prices","winter_season_end","30.04",stamp)
}

func ensureTopRentClient() *Client {
	mu.Lock()
	if store.Clients==nil { store.Clients=map[string]*Client{} }
	c:=store.Clients[topRentSlug]
	if c==nil {
		c=&Client{Slug:topRentSlug,Name:"TOP Rent A Car",Sector:"Коли под наем / мобилност / туризъм",Note:"Market Command Center · търсене · цени · конкуренти · локации · репутация",Sources:topRentSources()}
		store.Clients[c.Slug]=c
	} else {
		c.Name="TOP Rent A Car"; c.Sector="Коли под наем / мобилност / туризъм"; c.Note="Market Command Center · търсене · цени · конкуренти · локации · репутация"
		seen:=map[string]bool{}; for _,s:=range c.Sources{seen[s.Key]=true}; for _,s:=range topRentSources(){if !seen[s.Key]{c.Sources=append(c.Sources,s)}}
	}
	mu.Unlock()
	seedTopRentFacts(c)
	return c
}

func topRentSignals() []Signal {
	signalMu.RLock(); rows:=append([]Signal(nil),signalState.Signals[topRentSlug]...); signalMu.RUnlock()
	sort.SliceStable(rows,func(i,j int)bool{a,b:=rows[i].PublishedAt,rows[j].PublishedAt;if a==""{a=rows[i].DetectedAt};if b==""{b=rows[j].DetectedAt};return a>b})
	return rows
}
func topRentRecent(scope string,days int) []Signal {
	cut:=time.Now().UTC().Add(-time.Duration(days)*24*time.Hour); out:=[]Signal{}
	for _,s:=range topRentSignals(){if scope!=""&&s.Scope!=scope{continue};t:=time.Time{};if x,ok:=parseCompetitorPublished(s.PublishedAt);ok{t=x}else if x,e:=time.Parse(time.RFC3339,s.DetectedAt);e==nil{t=x};if !t.IsZero()&&!t.Before(cut){out=append(out,s)}}
	return out
}
func topRentCompCount(name string,days int) int { n:=0;for _,s:=range topRentRecent("competitor",days){if strings.EqualFold(strings.TrimSpace(s.Brand),name){n++}};return n }
func topRentCompRow(name string,score float64) map[string]interface{} {
	n90,n30:=topRentCompCount(name,90),topRentCompCount(name,30)
	status:="Изчаква достатъчно съпоставими live данни";if score>0{status="Измерено от публични сигнали"}
	return map[string]interface{}{"name":name,"score":score,"news":float64(n90),"activity":float64(n90),"trend":float64(n30),"live_mentions_30d":n30,"live_mentions_90d":n90,"score_status":status}
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
		"profile_mode":"market_command_center","profile_title":"TOP Rent A Car · Market Command Center",
		"blis_index":blis,"benchmark":0.0,"relative":0.0,"confidence":confidence,"trend":trend,"data_updated":latestObservedAt(c),
		"index_status":"Индексът използва само реално наблюдавани публични сигнали. Ценовият модул не публикува сравнение, докато не са налични съпоставими сценарии по локация, период, клас автомобил и условия.",
		"nav":[]interface{}{map[string]interface{}{"key":"overview","label":"Команден център","icon":"⌂"},map[string]interface{}{"key":"social","label":"Търсене и сигнали","icon":"◉"},map[string]interface{}{"key":"market","label":"Пазар и локации","icon":"◎"},map[string]interface{}{"key":"competition","label":"Цени и конкуренти","icon":"◇"},map[string]interface{}{"key":"history","label":"Прогнози/Доклади","icon":"↗"}},
		"indices":[]interface{}{
			idx("presence","Пазарна видимост",visibility,"Показва колко добре е покрита публичната среда на TOP Rent A Car и текущият обем на измеримите сигнали.",[]interface{}{comp("Наблюдавани източници",observedSources,"live"),comp("Покритие",coverage,"55%"),comp("Свежест · 48 часа",freshness,"20%"),comp("Споменавания · 90 дни",brand90,"25%")},"Покритие × 55% + свежест × 20% + нормализирани сигнали × 25%",[]string{"toprentacar.bg","Google News","публични източници"}),
			idx("reputation","Репутация",reputation,"Баланс на позитивните и негативните класифицирани сигнали за марката.",[]interface{}{comp("Позитивни · 90 дни",pos90,"live"),comp("Негативни · 90 дни",neg90,"live"),comp("Всички сигнали",brand90,"live")},"50 + 50 × (позитивни − негативни) / всички сигнали",[]string{"reviews","Google","публичен web"}),
			idx("digital","Market readiness",marketReadiness,"Оценява готовността на профила да дава търговски сигнали чрез покритие, свежест и активност на измерванията.",[]interface{}{comp("Покритие",coverage,"45%"),comp("Свежест",freshness,"25%"),comp("Наблюдения · 90 дни",recentObs,"30%")},"Покритие × 45% + свежест × 25% + активност × 30%",[]string{"официални източници","летища","туристически данни"}),
			idx("competitive","Конкурентна позиция",competitive,"Share-of-voice спрямо наблюдаваните конкуренти. Ценовата позиция се включва само при съпоставими оферти.",[]interface{}{comp("TOP сигнали · 90 дни",brand90,"live"),comp("Конкурентни сигнали · 90 дни",comp90,"live"),comp("Наблюдавани конкуренти",4,"configured")},"TOP / (TOP + среден конкурентен обем) × 100",[]string{"Sixt","Hertz","Europcar","Green Motion"}),
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
			"price_guard":"Няма фиктивни live цени. Сравнение се публикува само при еднаква локация, период, клас автомобил и условия.",
		},
		"location_matrix":[]interface{}{
			map[string]interface{}{"market":"София","type":"летище + град","priority":"висок","signals":"полетен поток · business travel · city demand · конкуренти"},
			map[string]interface{}{"market":"Варна","type":"летище + град + курорти","priority":"висок сезонен","signals":"туризъм · полети · resort demand · pricing"},
			map[string]interface{}{"market":"Бургас","type":"летище + град + курорти","priority":"висок сезонен","signals":"туризъм · полети · resort demand · pricing"},
			map[string]interface{}{"market":"Пловдив","type":"летище + град","priority":"среден","signals":"полетен поток · city demand · events"},
			map[string]interface{}{"market":"Русе","type":"град","priority":"развиващ","signals":"local demand · cross-border traffic"},
			map[string]interface{}{"market":"Букурещ","type":"летище · международен пазар","priority":"стратегически","signals":"OTP demand · local competitors · expansion proof"},
		},
		"price_intelligence":map[string]interface{}{
			"status":"live_top_public_fees_competitor_quotes_guarded",
			"dimensions":[]interface{}{"локация","начална дата/час","крайна дата/час","клас автомобил","депозит","застраховка","лимит км","летищни/други такси"},
			"competitors":[]interface{}{"Sixt","Hertz","Europcar","Green Motion"},
			"output":[]interface{}{"price gap","market median","position percentile","promotion detected","fee delta","availability signal"},
			"published_top_signals":[]interface{}{
				map[string]interface{}{"label":"Доставка до адрес/хотел · Варна","value":"18 €","type":"fee","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"Доставка до адрес/хотел · Бургас","value":"18 €","type":"fee","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"София централен офис → Летище София","value":"20 €","type":"one_way","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"София → Варна","value":"190 €","type":"one_way","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"София → Бургас","value":"170 €","type":"one_way","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"Варна → Бургас","value":"110 €","type":"one_way","source":"TOP Rent A Car"},
				map[string]interface{}{"label":"София → Букурещ","value":"320 €","type":"one_way","source":"TOP Rent A Car"},
			},
			"comparison_guard":"Конкурентна цена се показва само ако локацията, периодът, класът автомобил и съпътстващите условия са съпоставими.",
		},
		"demand_intelligence":map[string]interface{}{
			"inputs":[]interface{}{"полетен капацитет","туристически поток","сезонност","празници","събития","търсене по дестинация","конкурентна наличност"},
			"horizons":[]interface{}{"7 дни","14 дни","30 дни"},
			"output":[]interface{}{"Demand Pressure","Location Opportunity","Fleet Allocation Signal","Revenue Opportunity"},
			"model_status":"baseline_plus_live_inputs",
			"season_context":"Зимен сезон на публикуваните еднопосочни тарифи: 01.10–30.04",
			"markets":[]interface{}{
				map[string]interface{}{"market":"София","h7":"стабилно","h14":"стабилно","h30":"стабилно","confidence":"средна","driver":"целогодишен летищен + градски + business demand","fleet_signal":"поддържай широк микс; наблюдавай Economy/Compact и business класове"},
				map[string]interface{}{"market":"Варна","h7":"сезонен спад","h14":"сезонен спад","h30":"ниска сезонност","confidence":"средна","driver":"преход след летния сезон; активен летищен поток остава","fleet_signal":"редуцирай свръхналичност; запази гъвкав Economy/Compact резерв"},
				map[string]interface{}{"market":"Бургас","h7":"сезонен спад","h14":"сезонен спад","h30":"ниска сезонност","confidence":"средна","driver":"силно сезонен leisure пазар след 30.09","fleet_signal":"приоритизирай трансфер към целогодишни пазари при доказан излишък"},
				map[string]interface{}{"market":"Пловдив","h7":"стабилно","h14":"стабилно","h30":"умерено","confidence":"ниска-средна","driver":"по-малък летищен и градски пазар","fleet_signal":"поддържай оптимизиран базов парк; избягвай излишък"},
				map[string]interface{}{"market":"Русе","h7":"умерено","h14":"умерено","h30":"умерено","confidence":"ниска","driver":"локално + трансгранично търсене","fleet_signal":"малък адаптивен парк; следи cross-border заявки"},
				map[string]interface{}{"market":"Букурещ","h7":"стратегическо наблюдение","h14":"стратегическо наблюдение","h30":"растежов тест","confidence":"ниска-средна","driver":"нов международен пазар / OTP","fleet_signal":"измервай utilization и booking lead time преди разширяване"},
			},
			"method_note":"Посоките са оперативен baseline от публична сезонност и структура на локациите. Числови прогнози се публикуват едва след достатъчно live полетни, туристически и ценови наблюдения.",
		},
		"fleet_allocation":map[string]interface{}{
			"status":"decision_support",
			"rules":[]interface{}{
				"Не мести автомобили само по сезонност: изисквай потвърждение от наличност, резервации или конкурентен натиск.",
				"Сигнал за прехвърляне = слаб demand pressure + излишна наличност в изходна локация + по-висок opportunity score в целевата.",
				"Приоритетни класове за наблюдение: Economy, Compact, SUV/Family и business/automatic.",
			},
			"current_actions":[]interface{}{
				map[string]interface{}{"from":"Бургас","to":"София / друг целогодишен пазар","action":"наблюдавай за потенциално преразпределение","condition":"само при доказан излишък и по-силен demand signal в целта"},
				map[string]interface{}{"from":"Варна","to":"София / Букурещ","action":"наблюдавай Economy/Compact баланс","condition":"след сравнение на booking pressure и наличност"},
				map[string]interface{}{"from":"София","to":"—","action":"поддържай широк продуктов микс","condition":"целогодишна база + летищно и business търсене"},
			},
		},
		"signals":signals,
		"competitors":[]interface{}{topRentCompRow("TOP Rent A Car",competitive),topRentCompRow("Sixt",0),topRentCompRow("Hertz",0),topRentCompRow("Europcar",0),topRentCompRow("Green Motion",0)},
		"competitor_dossiers":[]interface{}{
			map[string]interface{}{"name":"Sixt","tier":"пряк международен конкурент","monitoring":"еднакви rental сценарии; airport presence; vehicle classes; fees; promotions; availability; reviews"},
			map[string]interface{}{"name":"Hertz","tier":"пряк международен конкурент","monitoring":"еднакви rental сценарии; airport presence; vehicle classes; fees; promotions; availability; reviews"},
			map[string]interface{}{"name":"Europcar","tier":"пряк международен конкурент","monitoring":"еднакви rental сценарии; airport presence; vehicle classes; fees; promotions; availability; reviews"},
			map[string]interface{}{"name":"Green Motion","tier":"конкурент с eco/EV позициониране","monitoring":"цени; airport presence; EV/eco proposition; fees; promotions; availability; reviews"},
		},
		"opportunity_cards":[]interface{}{
			map[string]interface{}{"title":"Revenue opportunity","state":"live when evidence is sufficient","logic":"търсене ↑ + конкурентни цени ↑ + наличност → възможност за по-висока цена"},
			map[string]interface{}{"title":"Fleet allocation","state":"decision support","logic":"очаквано търсене по локация и клас → сигнал за преразпределение"},
			map[string]interface{}{"title":"Competitive alert","state":"24/7 monitoring","logic":"нова промоция, офис, модел, fee policy или ценова промяна"},
			map[string]interface{}{"title":"Reputation alert","state":"24/7 monitoring","logic":"ускорение на негативна тема по офис, процес или условие"},
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
func init(){go func(){time.Sleep(26*time.Second);bootstrapTopRent()}()}

func topRentKeywords(c *Client) []map[string]interface{} {
	b:=len(topRentRecent("",90));k:=len(topRentRecent("competitor",90))
	return []map[string]interface{}{
		{"title":"Летищни пазари","display":"SOF · PDV · VAR · BOJ · OTP","source":"TOP Rent A Car · официални локации","status":"Потвърдено","kind":"market","measured":true},
		{"title":"Ценово разузнаване","display":"готово за съпоставими сценарии","source":"BLIS price intelligence guard","status":"Активно","kind":"competition","measured":true},
		{"title":"TOP Rent A Car сигнали","display":fmt.Sprintf("%d публикации",b),"source":"BLIS public-source monitoring","status":"Live","kind":"media","value":b,"measured":true},
		{"title":"Конкурентни сигнали","display":fmt.Sprintf("%d публикации",k),"source":"BLIS competitor monitoring","status":"Live","kind":"competition","value":k,"measured":true},
	}
}
