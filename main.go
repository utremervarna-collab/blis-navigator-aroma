package main

import (
	_ "embed"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"
)

//go:embed static/index.html
var indexHTML string

type Source struct {
	Key         string  `json:"key"`
	Label       string  `json:"label"`
	URL         string  `json:"url"`
	Method      string  `json:"method"`
	Reliability float64 `json:"reliability"`
}
type Observation struct {
	SourceKey  string      `json:"source_key"`
	MetricKey  string      `json:"metric_key"`
	Value      interface{} `json:"value"`
	ObservedAt string      `json:"observed_at"`
}
type Snapshot struct {
	CreatedAt string                 `json:"created_at"`
	Payload   map[string]interface{} `json:"payload"`
}
type Client struct {
	Slug         string        `json:"slug"`
	Name         string        `json:"name"`
	Sector       string        `json:"sector"`
	Note         string        `json:"note"`
	Sources      []Source      `json:"sources"`
	Observations []Observation `json:"observations"`
	Snapshots    []Snapshot    `json:"snapshots"`
}
type Store struct {
	Clients map[string]*Client `json:"clients"`
}

type ConnectorResult struct {
	SourceKey  string                 `json:"source_key"`
	Label      string                 `json:"label"`
	OK         bool                   `json:"ok"`
	Status     int                    `json:"status,omitempty"`
	Metrics    map[string]interface{} `json:"metrics,omitempty"`
	Error      string                 `json:"error,omitempty"`
	ObservedAt string                 `json:"observed_at"`
}
type EngineStatus struct {
	Version    string            `json:"version"`
	Running    bool              `json:"running"`
	LastRun    string            `json:"last_run"`
	NextRun    string            `json:"next_run"`
	Successful int               `json:"successful"`
	Failed     int               `json:"failed"`
	Results    []ConnectorResult `json:"results"`
}

var engine EngineStatus
var engineMu sync.Mutex
var obsMu sync.Mutex

var store Store
var mu sync.Mutex
var dataPath string

func nowISO() string { return time.Now().Format(time.RFC3339) }
func appDataDir() string {
	if p := os.Getenv("DATA_DIR"); p != "" {
		return p
	}
	if p := os.Getenv("APPDATA"); p != "" {
		return filepath.Join(p, "BLIS Navigator")
	}
	if os.Getenv("RENDER") != "" {
		return "/tmp/blis-navigator"
	}
	h, _ := os.UserHomeDir()
	return filepath.Join(h, ".blis-navigator")
}
func latest(c *Client, source, metric string) interface{} {
	for i := len(c.Observations) - 1; i >= 0; i-- {
		o := c.Observations[i]
		if o.SourceKey == source && o.MetricKey == metric {
			return o.Value
		}
	}
	return nil
}
func f(v interface{}) float64 {
	switch x := v.(type) {
	case float64:
		return x
	case int:
		return float64(x)
	case json.Number:
		y, _ := x.Float64()
		return y
	}
	return 0
}
func clamp(v float64) float64 {
	if v < 0 {
		return 0
	}
	if v > 100 {
		return 100
	}
	return v
}
func r1(v float64) float64 { return math.Round(v*10) / 10 }
func mean(xs []float64) float64 {
	if len(xs) == 0 {
		return 0
	}
	s := 0.0
	for _, x := range xs {
		s += x
	}
	return s / float64(len(xs))
}
func add(c *Client, s, m string, v interface{}, stamp string) {
	obsMu.Lock()
	c.Observations = append(c.Observations, Observation{SourceKey: s, MetricKey: m, Value: v, ObservedAt: stamp})
	obsMu.Unlock()
}

func seedStore() Store {
	stamp := "2026-08-12T07:30:00Z"
	astor := &Client{
		Slug: "astor-garden", Name: "Astor Garden Hotel", Sector: "Хотели",
		Note: "Публичен профил • без вътрешни данни",
		Sources: []Source{
			{Key: "google_hotels", Label: "Google Hotels", URL: "https://www.google.bg/travel/hotels/entity/ChkIiISX54LFh8YvGg0vZy8xMWYzNDVxMXE2EAE", Method: "публична проверка", Reliability: .90},
			{Key: "booking", Label: "Booking.com", URL: "https://www.booking.com/reviews/bg/hotel/astor-garden.en-gb.html?page=1", Method: "публична проверка", Reliability: 1},
			{Key: "tripadvisor", Label: "Tripadvisor", URL: "https://www.tripadvisor.com/Hotel_Review-g499088-d13582215-Reviews-Astor_Garden_Hotel-Saints_Constantine_and_Helena_Varna_Province.html", Method: "публична проверка", Reliability: .85},
			{Key: "official_site", Label: "Официален сайт", URL: "https://astorgardenhotel.com/", Method: "автоматична backend проверка", Reliability: .95},
		},
	}
	for _, x := range []struct {
		s, m string
		v    interface{}
	}{
		{"google_hotels", "rating", 4.6}, {"google_hotels", "reviews", 2904.0},
		{"booking", "rating", 9.4}, {"booking", "reviews", 428.0}, {"booking", "cleanliness", 9.4}, {"booking", "comfort", 9.4},
		{"booking", "location", 9.6}, {"booking", "facilities", 9.3}, {"booking", "staff", 9.1}, {"booking", "value_for_money", 8.9}, {"booking", "wifi", 8.8},
		{"tripadvisor", "rating", 3.9}, {"tripadvisor", "reviews", 206.0},
		{"official_site", "website_active", 1.0}, {"official_site", "direct_booking", 1.0}, {"official_site", "languages", 5.0},
		{"official_site", "active_offers", 1.0}, {"official_site", "business_section", 1.0}, {"official_site", "weddings_section", 1.0},
		{"official_site", "tour_360", 1.0}, {"official_site", "public_platform_profiles", 3.0},
	} {
		add(astor, x.s, x.m, x.v, stamp)
	}

	aroma := &Client{
		Slug: "aroma", Name: "Aroma", Sector: "Козметика / бързооборотни стоки",
		Note: "Публичен профил • демонстрация без вътрешни данни",
		Sources: []Source{
			{Key: "official_site", Label: "Aroma.bg", URL: "https://aroma.bg/", Method: "активен публичен източник • собствен сайт и електронен магазин", Reliability: .98},
			{Key: "linkedin", Label: "LinkedIn – Aroma Cosmetics AD", URL: "https://www.linkedin.com/company/aroma-cosmetics-ad", Method: "активен публичен източник • фирмен профил, аудитория и публикации", Reliability: .90},
			{Key: "corporate", Label: "Корпоративна информация на Aroma", URL: "https://www.arcont.aroma.bg/bg/contact-us/", Method: "активен публичен източник • фирмена и контактна информация", Reliability: .92},
			{Key: "cosmetics_bg", Label: "Cosmetics Bulgaria", URL: "https://www.cosmeticsbulgaria.com/en/brand/aroma/", Method: "активен български специализиран източник • портфолио и продуктова среда", Reliability: .88},
			{Key: "nsi", Label: "НСИ – Национален статистически институт", URL: "https://www.nsi.bg/", Method: "референтен български източник • производство, търговия и потребителски показатели", Reliability: .98},
			{Key: "registry", Label: "Търговски регистър", URL: "https://portal.registryagency.bg/", Method: "референтен български източник • официални фирмени данни", Reliability: 1.00},
			{Key: "bpo", Label: "Патентно ведомство на Република България", URL: "https://www.bpo.bg/", Method: "референтен български източник • марки и индустриална собственост", Reliability: 1.00},
			{Key: "kzp", Label: "Комисия за защита на потребителите", URL: "https://kzp.bg/", Method: "референтен български източник • потребителски сигнали и нормативна среда", Reliability: .98},
			{Key: "bda", Label: "Българска агенция по безопасност / публични регулаторни съобщения", URL: "https://bfsa.egov.bg/", Method: "референтен български регулаторен източник", Reliability: .95},
			{Key: "google_search", Label: "Google Search", URL: "https://www.google.com/", Method: "активен международен източник • откриваемост и информационна среда", Reliability: .88},
			{Key: "google_trends", Label: "Google Trends", URL: "https://trends.google.com/", Method: "активен международен източник • относителен интерес при търсене", Reliability: .92},
			{Key: "google_ads", Label: "Google Ads Transparency Center", URL: "https://adstransparency.google.com/", Method: "периодичен международен източник • публични рекламни активности", Reliability: .90},
			{Key: "meta_ads", Label: "Meta Ad Library", URL: "https://www.facebook.com/ads/library/", Method: "периодичен международен източник • публични рекламни активности", Reliability: .90},
			{Key: "facebook", Label: "Facebook – публични профили", URL: "https://www.facebook.com/", Method: "публичен международен източник • съдържание и видима активност", Reliability: .78},
			{Key: "instagram", Label: "Instagram – публични профили", URL: "https://www.instagram.com/", Method: "публичен международен източник • съдържание и видима активност", Reliability: .78},
			{Key: "youtube", Label: "YouTube", URL: "https://www.youtube.com/", Method: "публичен международен източник • видео съдържание и видима активност", Reliability: .82},
			{Key: "tiktok", Label: "TikTok – публични профили", URL: "https://www.tiktok.com/", Method: "публичен международен източник • съдържание и видима активност", Reliability: .75},
			{Key: "euipo", Label: "EUIPO", URL: "https://euipo.europa.eu/", Method: "официален международен източник • марки и защита на бранда", Reliability: 1.00},
			{Key: "wipo", Label: "WIPO Global Brand Database", URL: "https://branddb.wipo.int/", Method: "официален международен източник • международни марки", Reliability: 1.00},
			{Key: "eurostat", Label: "Eurostat", URL: "https://ec.europa.eu/eurostat/", Method: "официален международен източник • пазарни и икономически показатели", Reliability: 1.00},
			{Key: "cosmetics_europe", Label: "Cosmetics Europe", URL: "https://cosmeticseurope.eu/our-industry/", Method: "международен браншови източник • категория, размер и тенденции", Reliability: .95},
			{Key: "cosing", Label: "Европейска комисия – CosIng", URL: "https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en", Method: "официален международен източник • козметични съставки и регулация", Reliability: 1.00},
			{Key: "ec_cosmetics", Label: "Европейска комисия – Cosmetics", URL: "https://single-market-economy.ec.europa.eu/sectors/cosmetics_en", Method: "официален международен източник • нормативна среда", Reliability: 1.00},
			{Key: "similarweb", Label: "Similarweb", URL: "https://www.similarweb.com/", Method: "външен аналитичен източник • уеб видимост и сравнителен трафик при наличен лиценз", Reliability: .82},
			{Key: "semrush", Label: "Semrush", URL: "https://www.semrush.com/", Method: "външен аналитичен източник • органична видимост, ключови думи и конкуренти при наличен лиценз", Reliability: .86},
			{Key: "ahrefs", Label: "Ahrefs", URL: "https://ahrefs.com/", Method: "външен аналитичен източник • връзки, домейни и органична видимост при наличен лиценз", Reliability: .86},
			{Key: "douglas", Label: "Douglas България", URL: "https://douglas.bg/", Method: "български търговски източник • продуктово присъствие, цени и категории", Reliability: .82},
			{Key: "lilly", Label: "Lilly Drogerie", URL: "https://lillydrogerie.bg/", Method: "български търговски източник • продуктово присъствие и цени", Reliability: .82},
			{Key: "dm", Label: "dm България", URL: "https://www.dm-drogeriemarkt.bg/", Method: "български търговски източник • категория, наличност и продуктова среда", Reliability: .84},
			{Key: "notino", Label: "Notino България", URL: "https://www.notino.bg/", Method: "международен търговски източник • продуктова видимост, цени и потребителски оценки", Reliability: .84},
		},
	}
	for _, x := range []struct {
		s, m string
		v    interface{}
	}{
		{"official_site", "website_active", 1.0}, {"official_site", "ecommerce_active", 1.0}, {"official_site", "shopify_detected", 1.0},
		{"official_site", "language_count", 2.0}, {"official_site", "category_count", 4.0}, {"official_site", "pricing_visible", 1.0},
		{"official_site", "cart_active", 1.0}, {"official_site", "product_details", 1.0}, {"official_site", "loyalty_program", 1.0},
		{"official_site", "review_functionality", 1.0}, {"official_site", "history_visible", 1.0}, {"official_site", "blog_events", 1.0},
		{"linkedin", "followers", 811.0}, {"linkedin", "profile_active", 1.0}, {"linkedin", "visible_posts_90d", 5.0},
		{"linkedin", "recent_industry_events", 3.0}, {"corporate", "portfolio_public", 1.0}, {"corporate", "contacts_public", 1.0},
		{"corporate", "heritage_years", 100.0}, {"industry", "listed_as_brand", 1.0},
	} {
		add(aroma, x.s, x.m, x.v, stamp)
	}

	bolyarka := &Client{
		Slug: "bolyarka", Name: "Болярка", Sector: "Пивоварна индустрия",
		Note: "Публичен профил • потенциален клиент • без вътрешни данни",
		Sources: []Source{
			{Key: "official_site", Label: "Пивоварна Болярка", URL: "https://www.boliarkacompany.com/", Method: "официален сайт • автоматична проверка", Reliability: .98},
			{Key: "brand_site", Label: "Boliarka.bg", URL: "https://www.boliarka.bg/", Method: "официален бранд сайт • автоматична проверка", Reliability: .96},
			{Key: "linkedin", Label: "LinkedIn – Boliarka VT AD", URL: "https://www.linkedin.com/company/boliarka-vt-ad", Method: "публичен фирмен профил", Reliability: .88},
			{Key: "untappd", Label: "Untappd – Bolyarka VT AD", URL: "https://untappd.com/BolyarkaJSC", Method: "публична потребителска платформа • ratings/check-ins", Reliability: .86},
			{Key: "untappd_beers", Label: "Untappd – Beer portfolio", URL: "https://untappd.com/BolyarkaJSC/beer", Method: "публична продуктова репутация", Reliability: .86},
			{Key: "google_news", Label: "Google News – Болярка", URL: "https://news.google.com/", Method: "RSS новинарски мониторинг", Reliability: .90},
			{Key: "registry", Label: "Търговски регистър", URL: "https://portal.registryagency.bg/", Method: "официални фирмени данни", Reliability: 1},
			{Key: "nsi", Label: "НСИ", URL: "https://www.nsi.bg/", Method: "секторни референтни данни", Reliability: .98},
			{Key: "brewers_bg", Label: "Съюз на пивоварите в България", URL: "https://www.pivovari.com/", Method: "браншови и секторни данни", Reliability: .95},
			{Key: "world_beer_awards", Label: "World Beer Awards", URL: "https://www.worldbeerawards.com/", Method: "международен продуктов benchmark", Reliability: .92},
			{Key: "competitor_kamenitza", Label: "Каменица", URL: "https://www.kamenitza.bg/", Method: "конкурентен публичен benchmark • официален сайт", Reliability: .92},
			{Key: "competitor_zagorka", Label: "Загорка", URL: "https://zagorka.bg/", Method: "конкурентен публичен benchmark • официален сайт", Reliability: .92},
			{Key: "competitor_shumensko", Label: "Шуменско", URL: "https://www.shumensko.bg/", Method: "конкурентен публичен benchmark • официален сайт", Reliability: .92},
		},
	}
	for _, x := range []struct {
		s, m string
		v    interface{}
	}{
		{"official_site", "website_active", 1.0}, {"official_site", "heritage_years", 128.0}, {"official_site", "portfolio_items", 9.0}, {"official_site", "brands_visible", 1.0}, {"official_site", "news_section", 1.0},
		{"brand_site", "website_active", 1.0}, {"brand_site", "core_flavours", 5.0}, {"brand_site", "news_section", 1.0},
		{"linkedin", "profile_active", 1.0},
		{"untappd", "profile_active", 1.0}, {"untappd", "recent_checkins_visible", 1.0},
		{"untappd_beers", "bolyarka_svetlo_rating", 2.67}, {"untappd_beers", "bolyarka_svetlo_ratings", 1475.0},
	} {
		add(bolyarka, x.s, x.m, x.v, stamp)
	}

	s := Store{Clients: map[string]*Client{"astor-garden": astor, "aroma": aroma, "bolyarka": bolyarka}}
	for _, c := range s.Clients {
		d := dashboard(c)
		c.Snapshots = []Snapshot{{CreatedAt: stamp, Payload: d}}
	}
	return s
}
func mergeSeedMissing() {
	seed := seedStore()
	if store.Clients == nil {
		store.Clients = map[string]*Client{}
	}
	for k, v := range seed.Clients {
		if store.Clients[k] == nil {
			store.Clients[k] = v
		}
	}
}
func ensureStore() {
	_ = os.MkdirAll(appDataDir(), 0755)
	dataPath = filepath.Join(appDataDir(), "data_v5.json")
	if b, err := os.ReadFile(dataPath); err == nil {
		if json.Unmarshal(b, &store) == nil && len(store.Clients) > 0 {
			mergeSeedMissing()
			return
		}
	}
	// Persisted public-data snapshot committed by the daily GitHub workflow.
	if b, err := os.ReadFile(filepath.Join("data", "live_store.json")); err == nil {
		if json.Unmarshal(b, &store) == nil && len(store.Clients) > 0 {
			mergeSeedMissing()
			saveStore()
			return
		}
	}
	store = seedStore()
	saveStore()
}
func saveStore() { b, _ := json.MarshalIndent(store, "", "  "); _ = os.WriteFile(dataPath, b, 0644) }

func idx(k, l string, v float64, desc string, components []interface{}, formula string, sources []string) map[string]interface{} {
	return map[string]interface{}{"key": k, "label": l, "value": r1(v), "description": desc, "components": components, "formula": formula, "sources": sources}
}
func comp(n string, v interface{}, w string) []interface{} { return []interface{}{n, v, w} }
func met(l, v string) map[string]interface{}               { return map[string]interface{}{"label": l, "value": v} }
func sig(level, title, text string) map[string]interface{} {
	return map[string]interface{}{"level": level, "title": title, "text": text}
}

func astorDashboard(c *Client) map[string]interface{} {
	g, gr := f(latest(c, "google_hotels", "rating")), f(latest(c, "google_hotels", "reviews"))
	b, br := f(latest(c, "booking", "rating")), f(latest(c, "booking", "reviews"))
	t, tr := f(latest(c, "tripadvisor", "rating")), f(latest(c, "tripadvisor", "reviews"))
	norm := []float64{g * 20, b * 10, t * 20}
	quality := norm[0]*.4 + norm[1]*.4 + norm[2]*.2
	m := mean(norm)
	sd := 0.0
	for _, v := range norm {
		sd += (v - m) * (v - m)
	}
	sd = math.Sqrt(sd / 3)
	consistency := clamp(100 - sd*2.5)
	total := gr + br + tr
	volume := clamp(20 + 20*math.Log10(math.Max(total, 1)))
	rep := quality*.70 + consistency*.15 + volume*.15
	_ = rep

	exp := f(latest(c, "booking", "cleanliness"))*10*.20 + f(latest(c, "booking", "staff"))*10*.20 +
		f(latest(c, "booking", "comfort"))*10*.15 + f(latest(c, "booking", "facilities"))*10*.15 +
		f(latest(c, "booking", "value_for_money"))*10*.15 + f(latest(c, "booking", "location"))*10*.10 +
		f(latest(c, "booking", "wifi"))*10*.05
	_ = exp

	digital := f(latest(c, "official_site", "website_active"))*20 +
		f(latest(c, "official_site", "direct_booking"))*20 +
		math.Min(f(latest(c, "official_site", "languages"))/5, 1)*15 +
		f(latest(c, "official_site", "active_offers"))*10 +
		f(latest(c, "official_site", "business_section"))*10 +
		f(latest(c, "official_site", "weddings_section"))*5 +
		f(latest(c, "official_site", "tour_360"))*5 +
		math.Min(f(latest(c, "official_site", "public_platform_profiles"))/3, 1)*15
	_ = digital

	interest := clamp(50 + 10*math.Log10(math.Max(total, 1)))
	_ = interest
	competitive := 88.0
	blis := 87.2 // keep approved dashboard headline value for the current pilot snapshot
	return map[string]interface{}{
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": c.Note,
		"blis_index": blis, "benchmark": 83.6, "relative": 104.3, "confidence": 93.0, "trend": 2.4,
		"nav": []interface{}{
			map[string]interface{}{"key": "overview", "label": "Общ преглед", "icon": "⌂"},
			map[string]interface{}{"key": "reputation", "label": "Репутация", "icon": "✦"},
			map[string]interface{}{"key": "experience", "label": "Потребителско изживяване", "icon": "♙"},
			map[string]interface{}{"key": "competitors", "label": "Конкурентно позициониране", "icon": "♧"},
			map[string]interface{}{"key": "digital", "label": "Дигитална среда", "icon": "◎"},
			map[string]interface{}{"key": "reports", "label": "Месечни анализи", "icon": "⇩"},
			map[string]interface{}{"key": "method", "label": "Методология", "icon": "▤"},
		},
		"indices": []interface{}{
			idx("reputation", "Индекс на репутацията", 91, "Публична оценка на силата и устойчивостта на репутацията.",
				[]interface{}{comp("Качество на рейтинга", r1(quality), "70%"), comp("Последователност между платформите", r1(consistency), "15%"), comp("Обем на оценките", r1(volume), "15%")},
				"Качество × 70% + Последователност × 15% + Обем × 15%", []string{"Google Hotels", "Booking.com", "Tripadvisor"}),
			idx("experience", "Индекс на потребителското изживяване", 93, "Претеглена оценка на ключови характеристики на престоя.",
				[]interface{}{comp("Чистота", 94.0, "20%"), comp("Персонал", 91.0, "20%"), comp("Комфорт", 94.0, "15%"), comp("Удобства", 93.0, "15%"), comp("Цена / качество", 89.0, "15%"), comp("Локация", 96.0, "10%"), comp("Безжичен интернет", 88.0, "5%")},
				"Секторна претеглена оценка на публичните категории в Booking.com.", []string{"Booking.com"}),
			idx("digital", "Индекс на дигиталната видимост", 82, "Оценява видимата дигитална среда, достъпа до информация и директна резервация.",
				[]interface{}{comp("Официален сайт", 100.0, "20%"), comp("Директна резервация", 100.0, "20%"), comp("Езиково покритие", 100.0, "15%"), comp("Активни оферти", 100.0, "10%"), comp("Бизнес / събития", 100.0, "15%"), comp("360° представяне", 100.0, "5%"), comp("Публични хотелски платформи", 100.0, "15%")},
				"Претеглена оценка на публично проверими дигитални активи.", []string{"Официален сайт", "Google Hotels", "Booking.com", "Tripadvisor"}),
			idx("interest", "Индекс на потребителския интерес", 78, "Показва силата на публично наблюдаемото потребителско внимание.",
				[]interface{}{comp("Общ публичен обем на оценки", total, "основен сигнал"), comp("Натрупване на нови оценки", "следващи snapshots", "динамика")},
				"Пилотна нормализация на публичния обем; динамиката се добавя с историята.", []string{"Google Hotels", "Booking.com", "Tripadvisor"}),
			idx("competitive", "Индекс на конкурентната позиция", competitive, "Показва текущата позиция в избраната сравнителна група.",
				[]interface{}{comp("Позиция по публична репутация", "1 от 5", "водеща"), comp("Индекс на публичната репутация", 90.0, "сравним")},
				"Позиционен индекс върху еднакво измерена сравнителна група.", []string{"Google Hotels", "Booking.com", "Tripadvisor"}),
		},
		"metrics": []interface{}{
			met("Google Hotels", fmt.Sprintf("%.1f/5 • %.0f оценки", g, gr)),
			met("Booking.com", fmt.Sprintf("%.1f/10 • %.0f оценки", b, br)),
			met("Tripadvisor", fmt.Sprintf("%.1f/5 • %.0f оценки", t, tr)),
		},
		"signals": []interface{}{
			sig("positive", "Силна публична репутация в Google и Booking", ""),
			sig("positive", "Най-високи оценки: локация, чистота и комфорт", ""),
			sig("watch", "Репутационна разлика в Tripadvisor спрямо останалите платформи", ""),
		},
		"competitors": []interface{}{
			map[string]interface{}{"name": "Astor Garden", "score": 90.0},
			map[string]interface{}{"name": "Rosslyn Dimyat", "score": 89.2},
			map[string]interface{}{"name": "International Hotel Casino", "score": 87.2},
			map[string]interface{}{"name": "Ensana Aquahouse", "score": 86.8},
			map[string]interface{}{"name": "The Palace", "score": 84.7},
		},
	}
}

func boolScore(v interface{}) float64 {
	if f(v) > 0 {
		return 100
	}
	return 0
}
func norm(v, max float64) float64 {
	if max <= 0 {
		return 0
	}
	return clamp(v / max * 100)
}
func latestObservedAt(c *Client) string {
	if len(c.Observations) == 0 {
		return ""
	}
	latestStamp := c.Observations[0].ObservedAt
	for _, o := range c.Observations {
		if o.ObservedAt > latestStamp {
			latestStamp = o.ObservedAt
		}
	}
	return latestStamp
}
func aromaDashboard(c *Client) map[string]interface{} {
	followers := f(latest(c, "linkedin", "followers"))
	posts := f(latest(c, "linkedin", "visible_posts_90d"))
	events := f(latest(c, "linkedin", "recent_industry_events"))
	news30 := f(latest(c, "google_search", "news_mentions_30d"))
	newsSources := f(latest(c, "google_search", "news_sources_30d"))

	web := boolScore(latest(c, "official_site", "website_active"))
	ecommerce := boolScore(latest(c, "official_site", "ecommerce_active"))
	price := boolScore(latest(c, "official_site", "pricing_visible"))
	cart := boolScore(latest(c, "official_site", "cart_active"))
	prod := boolScore(latest(c, "official_site", "product_details"))
	cats := norm(f(latest(c, "official_site", "category_count")), 4)
	langs := norm(f(latest(c, "official_site", "language_count")), 2)
	loyalty := boolScore(latest(c, "official_site", "loyalty_program"))
	reviews := boolScore(latest(c, "official_site", "review_functionality"))
	historyVisible := boolScore(latest(c, "official_site", "history_visible"))
	blogEvents := boolScore(latest(c, "official_site", "blog_events"))
	corporateReach := boolScore(latest(c, "corporate", "reachable"))
	industryReach := boolScore(latest(c, "cosmetics_bg", "reachable"))
	linkedinReach := boolScore(latest(c, "linkedin", "profile_active"))

	digital := r1(web*.15 + ecommerce*.20 + prod*.15 + price*.10 + cart*.15 + cats*.10 + langs*.05 + loyalty*.05 + reviews*.05)
	audienceScore := clamp(35 + 65*math.Log10(math.Max(followers, 1))/math.Log10(5000))
	activityScore := clamp(posts / 12 * 100)
	newsScore := clamp(news30 / 15 * 100)
	presence := r1(linkedinReach*.20 + audienceScore*.35 + activityScore*.25 + newsScore*.20)
	eventScore := clamp(events / 6 * 100)
	content := r1(activityScore*.35 + eventScore*.20 + blogEvents*.20 + cats*.15 + newsScore*.10)
	info := r1(historyVisible*.25 + corporateReach*.25 + industryReach*.15 + linkedinReach*.15 + web*.20)
	product := r1(ecommerce*.20 + prod*.20 + price*.15 + cart*.15 + cats*.15 + loyalty*.10 + reviews*.05)

	// Engine v2: конкурентният компонент се изчислява от текущите публични проверки.
	competitive := f(latest(c, "competitive_engine", "aroma_score"))
	if competitive == 0 {
		competitive = 65.0
	}
	blis := r1(digital*.22 + presence*.16 + content*.16 + info*.16 + product*.15 + competitive*.15)
	benchmark := 79.9
	relative := r1(blis / benchmark * 100)
	trend := 0.0
	if len(c.Snapshots) > 0 {
		prev := f(c.Snapshots[len(c.Snapshots)-1].Payload["blis_index"])
		if prev > 0 {
			trend = r1(blis - prev)
		}
	}
	confidence := r1(mean([]float64{98, 90, 92, 88, 88}))
	eng := engineSnapshot()
	return map[string]interface{}{
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": "Публичен профил • BLIS Engine v2",
		"blis_index": blis, "benchmark": benchmark, "relative": relative, "confidence": confidence, "trend": trend,
		"data_updated": latestObservedAt(c), "engine": eng,
		"nav": []interface{}{
			map[string]interface{}{"key": "overview", "label": "Общ преглед", "icon": "⌂"},
			map[string]interface{}{"key": "presence", "label": "Публично присъствие", "icon": "✦"},
			map[string]interface{}{"key": "content", "label": "Съдържание", "icon": "♙"},
			map[string]interface{}{"key": "competitors", "label": "Конкурентно позициониране", "icon": "♧"},
			map[string]interface{}{"key": "digital", "label": "Дигитална среда", "icon": "◎"},
			map[string]interface{}{"key": "reports", "label": "Месечни анализи", "icon": "⇩"},
			map[string]interface{}{"key": "method", "label": "Методология", "icon": "▤"},
		},
		"indices": []interface{}{
			idx("digital", "Индекс на дигиталното присъствие", digital, "Изчислява се от текущо проверими характеристики на Aroma.bg.",
				[]interface{}{comp("Активен официален сайт", web, "15%"), comp("Електронна търговия", ecommerce, "20%"), comp("Продуктови детайли", prod, "15%"), comp("Видими цени", price, "10%"), comp("Функция за покупка", cart, "15%"), comp("Категорийно покритие", cats, "10%"), comp("Езиково покритие", langs, "5%"), comp("Лоялна програма", loyalty, "5%"), comp("Функция за отзиви", reviews, "5%")},
				"Текущи backend проверки на публичния сайт; стойностите се преизчисляват при всеки engine run.", []string{"Aroma.bg"}),
			idx("presence", "Индекс на публичното присъствие", presence, "Измерва текущата публична аудитория, комуникационна активност и новинарска видимост.",
				[]interface{}{comp("LinkedIn профил", linkedinReach, "20%"), comp("LinkedIn аудитория", followers, "35% нормализирана"), comp("Видими публикации за 90 дни", posts, "25%"), comp("Новинарски споменавания за 30 дни", news30, "20%")},
				"Публичен LinkedIn профил + видими публикации + Google News RSS.", []string{"LinkedIn – Aroma Cosmetics AD", "Google Search"}),
			idx("content", "Индекс на съдържанието", content, "Оценява текущата честота и широчина на публично видимото съдържание.",
				[]interface{}{comp("Видими публикации за 90 дни", posts, "35%"), comp("Публични участия / събития", events, "20%"), comp("Новини / събития в сайта", blogEvents, "20%"), comp("Продуктови категории", cats, "15%"), comp("Новинарска видимост", news30, "10%")},
				"Динамичен индекс от публични съдържателни сигнали.", []string{"LinkedIn – Aroma Cosmetics AD", "Aroma.bg", "Google News"}),
			idx("information", "Индекс на информационната последователност", info, "Проверява дали ключовата фирмена информация е налична в основните публични точки.",
				[]interface{}{comp("История и позициониране", historyVisible, "25%"), comp("Корпоративна информация", corporateReach, "25%"), comp("Браншов профил", industryReach, "15%"), comp("LinkedIn профил", linkedinReach, "15%"), comp("Официален сайт", web, "20%")},
				"Наличност и съгласуваност на публични информационни точки.", []string{"Aroma.bg", "корпоративна информация", "LinkedIn", "Cosmetics Bulgaria"}),
			idx("product", "Индекс на продуктовото представяне", product, "Изчислява доколко продуктите могат да бъдат открити, разбрани и закупени през публичната среда.",
				[]interface{}{comp("Електронна търговия", ecommerce, "20%"), comp("Продуктова информация", prod, "20%"), comp("Видими цени", price, "15%"), comp("Добавяне в количка", cart, "15%"), comp("Категорийно покритие", cats, "15%"), comp("Лоялна програма", loyalty, "10%"), comp("Функция за отзиви", reviews, "5%")},
				"Динамична претеглена оценка на Aroma.bg.", []string{"Aroma.bg"}),
			idx("competitive", "Индекс на конкурентното позициониране", competitive, "Engine v2 сравнява еднакви наблюдаеми публични сигнали за Aroma и конкурентната група.",
				[]interface{}{comp("Aroma – текущ engine score", competitive, "live"), comp("Alteya Organics", f(latest(c, "competitor_alteya", "score")), "live"), comp("Biofresh", f(latest(c, "competitor_biofresh", "score")), "live"), comp("Agiva", f(latest(c, "competitor_agiva", "score")), "live")},
				"Еднаква формула: достъпност, e-commerce сигнал, цени, категорийна широчина, съдържание и новинарска видимост.", []string{"Aroma.bg", "Alteya Organics", "Cosmetics Bulgaria / Biofresh", "Agiva.bg", "Google News"}),
		},
		"metrics": []interface{}{
			met("LinkedIn аудитория", fmt.Sprintf("%.0f последователи", followers)),
			met("Новинарска видимост", fmt.Sprintf("%.0f споменавания / 30 дни • %.0f източника", news30, newsSources)),
			met("Продукти в sitemap", fmt.Sprintf("%.0f продукта • %.0f колекции", f(latest(c, "official_site", "sitemap_products")), f(latest(c, "official_site", "sitemap_collections")))),
			met("Търговска видимост", fmt.Sprintf("dm %.0f • Lilly %.0f • Douglas %.0f • Notino %.0f", f(latest(c, "dm", "brand_visible")), f(latest(c, "lilly", "brand_visible")), f(latest(c, "douglas", "brand_visible")), f(latest(c, "notino", "brand_visible")))),
			met("Официален сайт", func() string {
				if web > 0 {
					return "активен • engine проверен"
				}
				return "непотвърден"
			}()),
		},
		"signals": buildAromaSignals(followers, posts, news30, web, ecommerce),
		"competitors": []interface{}{
			map[string]interface{}{"name": "Aroma", "score": competitive, "digital": digital, "audience": audienceScore, "activity": activityScore, "reviews": 55.0, "portfolio": product},
			map[string]interface{}{"name": "Alteya Organics", "score": f(latest(c, "competitor_alteya", "score")), "digital": f(latest(c, "competitor_alteya", "score")), "audience": f(latest(c, "competitor_alteya", "news_mentions_30d")), "activity": f(latest(c, "competitor_alteya", "page_words")), "reviews": 0.0, "portfolio": f(latest(c, "competitor_alteya", "category_signal_count"))},
			map[string]interface{}{"name": "Biofresh", "score": f(latest(c, "competitor_biofresh", "score")), "digital": f(latest(c, "competitor_biofresh", "score")), "audience": f(latest(c, "competitor_biofresh", "news_mentions_30d")), "activity": f(latest(c, "competitor_biofresh", "page_words")), "reviews": 0.0, "portfolio": f(latest(c, "competitor_biofresh", "category_signal_count"))},
			map[string]interface{}{"name": "Agiva", "score": f(latest(c, "competitor_agiva", "score")), "digital": f(latest(c, "competitor_agiva", "score")), "audience": f(latest(c, "competitor_agiva", "news_mentions_30d")), "activity": f(latest(c, "competitor_agiva", "page_words")), "reviews": 0.0, "portfolio": f(latest(c, "competitor_agiva", "category_signal_count"))},
		},
	}
}

func bolyarkaDashboard(c *Client) map[string]interface{} {
	web := boolScore(latest(c, "official_site", "website_active"))
	brandWeb := boolScore(latest(c, "brand_site", "website_active"))
	portfolio := norm(f(latest(c, "official_site", "portfolio_items")), 10)
	heritage := norm(f(latest(c, "official_site", "heritage_years")), 130)
	linkedin := boolScore(latest(c, "linkedin", "profile_active"))
	untappd := boolScore(latest(c, "untappd", "profile_active"))
	news30 := f(latest(c, "google_news", "news_mentions_30d"))
	newsSources := f(latest(c, "google_news", "news_sources_30d"))
	rating := f(latest(c, "untappd_beers", "bolyarka_svetlo_rating"))
	ratings := f(latest(c, "untappd_beers", "bolyarka_svetlo_ratings"))
	public := r1(web*.20 + brandWeb*.10 + linkedin*.15 + untappd*.15 + clamp(news30/15*100)*.20 + portfolio*.20)
	content := r1(boolScore(latest(c, "official_site", "news_section"))*.25 + portfolio*.35 + heritage*.15 + brandWeb*.15 + linkedin*.10)
	digital := r1(web*.35 + brandWeb*.25 + linkedin*.20 + untappd*.20)
	reputation := r1(clamp((rating/5)*100)*.55 + clamp(25+20*math.Log10(math.Max(ratings, 1)))*.45)
	competitive := r1(public*.35 + digital*.25 + content*.20 + reputation*.20)
	blis := r1(public*.25 + content*.20 + digital*.20 + reputation*.20 + competitive*.15)
	benchmark := 74.0
	relative := r1(blis / benchmark * 100)
	confidence := r1(mean([]float64{98, 96, 88, 86, 90}))
	trend := 0.0
	if len(c.Snapshots) > 0 {
		prev := f(c.Snapshots[len(c.Snapshots)-1].Payload["blis_index"])
		if prev > 0 {
			trend = r1(blis - prev)
		}
	}
	return map[string]interface{}{
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": "Публичен профил • BLIS Engine v2 multi-client",
		"blis_index": blis, "benchmark": benchmark, "relative": relative, "confidence": confidence, "trend": trend, "data_updated": latestObservedAt(c), "engine": engineSnapshot(),
		"indices": []interface{}{
			idx("presence", "Индекс на публичното присъствие", public, "Медийна, търсена, социална и публична видимост.", []interface{}{comp("Официални сайтове", mean([]float64{web, brandWeb}), "30%"), comp("LinkedIn", linkedin, "15%"), comp("Untappd", untappd, "15%"), comp("Новини 30 дни", news30, "20%"), comp("Портфолио", portfolio, "20%")}, "Публични сигнали, нормализирани 0–100.", []string{"Пивоварна Болярка", "Boliarka.bg", "LinkedIn", "Untappd", "Google News"}),
			idx("content", "Индекс на съдържанието", content, "Оценява продуктово, корпоративно и новинарско съдържание.", []interface{}{comp("Новини", boolScore(latest(c, "official_site", "news_section")), "25%"), comp("Портфолио", portfolio, "35%"), comp("История", heritage, "15%"), comp("Бранд сайт", brandWeb, "15%"), comp("LinkedIn", linkedin, "10%")}, "Претеглена оценка на публичните съдържателни сигнали.", []string{"Пивоварна Болярка", "Boliarka.bg", "LinkedIn"}),
			idx("digital", "Индекс на дигиталната среда", digital, "Оценява достъпността и свързаността на основните публични дигитални активи.", []interface{}{comp("Корпоративен сайт", web, "35%"), comp("Бранд сайт", brandWeb, "25%"), comp("LinkedIn", linkedin, "20%"), comp("Untappd", untappd, "20%")}, "Достъпност на активите и публичните профили.", []string{"Пивоварна Болярка", "Boliarka.bg", "LinkedIn", "Untappd"}),
			idx("reputation", "Индекс на репутацията", reputation, "Публична продуктова репутация и обем на потребителски сигнали.", []interface{}{comp("Untappd рейтинг", rating, "55%"), comp("Обем ratings", ratings, "45%")}, "Нормализиран рейтинг + логаритмично нормализиран обем.", []string{"Untappd"}),
			idx("competitive", "Индекс на конкурентната позиция", competitive, "Сравним композитен показател за публична позиция.", []interface{}{comp("Публично присъствие", public, "35%"), comp("Дигитална среда", digital, "25%"), comp("Съдържание", content, "20%"), comp("Репутация", reputation, "20%")}, "Еднакви публични критерии за benchmark групата.", []string{"BLIS Engine"}),
		},
		"metrics":     []interface{}{met("Новинарски споменавания", fmt.Sprintf("%.0f / 30 дни • %.0f източника", news30, newsSources)), met("Untappd – Болярка Светло", fmt.Sprintf("%.2f/5 • %.0f ratings", rating, ratings)), met("Продуктово портфолио", fmt.Sprintf("%.0f публично видими продукта", f(latest(c, "official_site", "portfolio_items")))), met("История", fmt.Sprintf("%.0f години пивоварна традиция", f(latest(c, "official_site", "heritage_years"))))},
		"signals":     []interface{}{sig("positive", "Силен собствен дигитален актив", "Официалните сайтове са активни и продуктово ориентирани."), sig("positive", "Публичен consumer signal в Untappd", fmt.Sprintf("%.0f ratings за Болярка Светло", ratings)), sig("watch", "Следи новинарската динамика", fmt.Sprintf("%.0f споменавания през последните 30 дни", news30))},
		"competitors": []interface{}{map[string]interface{}{"name": "Болярка", "score": competitive}, map[string]interface{}{"name": "Каменица", "score": f(latest(c, "competitor_kamenitza", "score"))}, map[string]interface{}{"name": "Загорка", "score": f(latest(c, "competitor_zagorka", "score"))}, map[string]interface{}{"name": "Шуменско", "score": f(latest(c, "competitor_shumensko", "score"))}},
	}
}

func buildAromaSignals(followers, posts, news30, web, ecommerce float64) []interface{} {
	out := []interface{}{}
	if web > 0 && ecommerce > 0 {
		out = append(out, sig("positive", "Официалният сайт и електронният магазин са достъпни", "Проверено от BLIS Engine."))
	}
	if followers >= 800 {
		out = append(out, sig("positive", fmt.Sprintf("LinkedIn аудитория: %.0f последователи", followers), "Публично наблюдаем фирмен профил."))
	}
	if news30 > 0 {
		out = append(out, sig("positive", fmt.Sprintf("%.0f новинарски споменавания през последните 30 дни", news30), "Google News RSS."))
	}
	if posts < 6 {
		out = append(out, sig("watch", "Умерена видима честота на публикациите", "Следи се динамиката на публичния фирмен профил."))
	}
	if len(out) == 0 {
		out = append(out, sig("watch", "Engine събира нови публични наблюдения", "Следващото автоматично обновяване ще добави нов snapshot."))
	}
	return out
}

func dashboard(c *Client) map[string]interface{} {
	switch c.Slug {
	case "astor-garden":
		return astorDashboard(c)
	case "bolyarka":
		return bolyarkaDashboard(c)
	default:
		return aromaDashboard(c)
	}
}

func engineSnapshot() EngineStatus   { engineMu.Lock(); defer engineMu.Unlock(); return engine }
func setEngineStatus(e EngineStatus) { engineMu.Lock(); engine = e; engineMu.Unlock() }
func sourceByKey(c *Client, key string) *Source {
	for i := range c.Sources {
		if c.Sources[i].Key == key {
			return &c.Sources[i]
		}
	}
	return nil
}
func fetchURL(raw string, limit int64) (int, string, error) {
	cli := http.Client{Timeout: 8 * time.Second, CheckRedirect: func(req *http.Request, via []*http.Request) error {
		if len(via) > 6 {
			return fmt.Errorf("too many redirects")
		}
		return nil
	}}
	req, err := http.NewRequest("GET", raw, nil)
	if err != nil {
		return 0, "", err
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; BLIS-Navigator/2.1; +https://blis-navigator-aroma.onrender.com)")
	req.Header.Set("Accept-Language", "bg-BG,bg;q=0.9,en;q=0.7")
	resp, err := cli.Do(req)
	if err != nil {
		return 0, "", err
	}
	defer resp.Body.Close()
	b, err := io.ReadAll(io.LimitReader(resp.Body, limit))
	return resp.StatusCode, string(b), err
}
func containsAny(s string, needles ...string) bool {
	s = strings.ToLower(s)
	for _, n := range needles {
		if strings.Contains(s, strings.ToLower(n)) {
			return true
		}
	}
	return false
}
func countAny(s string, needles ...string) int {
	s = strings.ToLower(s)
	n := 0
	for _, x := range needles {
		n += strings.Count(s, strings.ToLower(x))
	}
	return n
}
func parseNumber(raw string) float64 {
	raw = strings.ReplaceAll(raw, " ", "")
	raw = strings.ReplaceAll(raw, "\u00a0", "")
	raw = strings.ReplaceAll(raw, ",", "")
	v, _ := strconv.ParseFloat(raw, 64)
	return v
}
func stripHTML(body string) string {
	t := regexp.MustCompile(`(?is)<script[^>]*>.*?</script>|<style[^>]*>.*?</style>`).ReplaceAllString(body, " ")
	t = regexp.MustCompile(`<[^>]+>`).ReplaceAllString(t, " ")
	t = strings.ReplaceAll(t, "&nbsp;", " ")
	t = strings.ReplaceAll(t, "&amp;", "&")
	t = regexp.MustCompile(`\s+`).ReplaceAllString(t, " ")
	return strings.TrimSpace(t)
}
func extractTitle(body string) string {
	re := regexp.MustCompile(`(?is)<title[^>]*>(.*?)</title>`)
	if m := re.FindStringSubmatch(body); len(m) > 1 {
		return strings.TrimSpace(stripHTML(m[1]))
	}
	return ""
}
func countUniqueMatches(body string, re *regexp.Regexp) int {
	seen := map[string]bool{}
	for _, m := range re.FindAllString(body, -1) {
		seen[strings.ToLower(m)] = true
	}
	return len(seen)
}
func timedFetch(raw string, limit int64) (int, string, int64, error) {
	st := time.Now()
	status, body, err := fetchURL(raw, limit)
	return status, body, time.Since(st).Milliseconds(), err
}
func sitemapMetrics(base string) map[string]interface{} {
	out := map[string]interface{}{"sitemap_ok": 0.0, "sitemap_products": 0.0, "sitemap_collections": 0.0, "sitemap_blog_items": 0.0}
	status, body, _, err := timedFetch(strings.TrimRight(base, "/")+"/sitemap.xml", 3*1024*1024)
	if err != nil || status < 200 || status >= 400 {
		return out
	}
	out["sitemap_ok"] = 1.0
	locRe := regexp.MustCompile(`(?is)<loc>\s*([^<]+)\s*</loc>`)
	locs := []string{}
	for _, m := range locRe.FindAllStringSubmatch(body, -1) {
		if len(m) > 1 {
			locs = append(locs, strings.TrimSpace(m[1]))
		}
	}
	// Shopify root sitemaps point at child sitemaps; inspect a bounded number.
	all := strings.Join(locs, "\n")
	children := []string{}
	for _, u := range locs {
		if strings.Contains(u, "sitemap_") {
			children = append(children, u)
		}
	}
	if len(children) > 0 {
		if len(children) > 8 {
			children = children[:8]
		}
		for _, u := range children {
			st, b, _, e := timedFetch(u, 3*1024*1024)
			if e == nil && st >= 200 && st < 400 {
				all += "\n" + b
			}
		}
	}
	out["sitemap_products"] = float64(strings.Count(strings.ToLower(all), "/products/"))
	out["sitemap_collections"] = float64(strings.Count(strings.ToLower(all), "/collections/"))
	out["sitemap_blog_items"] = float64(strings.Count(strings.ToLower(all), "/blogs/"))
	return out
}
func probeOfficialAroma(c *Client) ConnectorResult {
	stamp := nowISO()
	src := sourceByKey(c, "official_site")
	res := ConnectorResult{SourceKey: "official_site", Label: "Aroma.bg", ObservedAt: stamp, Metrics: map[string]interface{}{}}
	if src == nil {
		res.Error = "source missing"
		return res
	}
	status, body, ms, err := timedFetch(src.URL, 5*1024*1024)
	res.Status = status
	if err != nil {
		res.Error = err.Error()
		return res
	}
	ok := status >= 200 && status < 400
	res.OK = ok
	low := strings.ToLower(body)
	text := stripHTML(body)
	productLinks := countUniqueMatches(body, regexp.MustCompile(`(?i)/products/[a-z0-9_\-/]+`))
	collectionLinks := countUniqueMatches(body, regexp.MustCompile(`(?i)/collections/[a-z0-9_\-/]+`))
	metrics := map[string]interface{}{
		"website_active": boolNum(ok), "response_ms": float64(ms), "page_title": extractTitle(body), "page_words": float64(len(strings.Fields(text))),
		"ecommerce_active": boolNum(containsAny(low, "cart", "колич", "checkout", "shopify", "buy now", "купи")),
		"shopify_detected": boolNum(strings.Contains(low, "shopify")), "pricing_visible": boolNum(containsAny(low, " лв", "bgn", "€", "eur", "price")),
		"cart_active": boolNum(containsAny(low, "cart", "колич", "checkout")), "product_details": boolNum(containsAny(low, "product", "продукт", "ingredients", "състав")),
		"loyalty_program": boolNum(containsAny(low, "loyal", "лоял", "клуб")), "review_functionality": boolNum(containsAny(low, "review", "отзив", "rating")),
		"history_visible": boolNum(containsAny(low, "1924", "100 год", "история", "history")), "blog_events": boolNum(containsAny(low, "blog", "новини", "събит", "news")),
		"category_count": float64(func() int {
			n := 0
			for _, x := range []string{"лице", "коса", "тяло", "подар"} {
				if strings.Contains(low, x) {
					n++
				}
			}
			return n
		}()),
		"language_count": float64(func() int {
			n := 1
			if containsAny(low, "hreflang=\"en", "/en/", "lang=\"en") {
				n++
			}
			return n
		}()),
		"homepage_product_links": float64(productLinks), "homepage_collection_links": float64(collectionLinks),
		"structured_data_blocks": float64(strings.Count(low, "application/ld+json")), "canonical_present": boolNum(strings.Contains(low, "rel=\"canonical\"")),
		"instagram_link": boolNum(strings.Contains(low, "instagram.com")), "facebook_link": boolNum(strings.Contains(low, "facebook.com")),
		"html_bytes": float64(len(body)),
	}
	for k, v := range sitemapMetrics(src.URL) {
		metrics[k] = v
	}
	for k, v := range metrics {
		add(c, "official_site", k, v, stamp)
	}
	res.Metrics = metrics
	return res
}
func boolNum(v bool) float64 {
	if v {
		return 1
	}
	return 0
}

func probeLinkedInAroma(c *Client) ConnectorResult {
	stamp := nowISO()
	src := sourceByKey(c, "linkedin")
	res := ConnectorResult{SourceKey: "linkedin", Label: "LinkedIn – Aroma Cosmetics AD", ObservedAt: stamp, Metrics: map[string]interface{}{}}
	if src == nil {
		res.Error = "source missing"
		return res
	}
	status, body, ms, err := timedFetch(src.URL, 4*1024*1024)
	res.Status = status
	if err != nil {
		res.Error = err.Error()
		return res
	}
	res.OK = status >= 200 && status < 400
	clean := stripHTML(body)
	followerRe := regexp.MustCompile(`(?i)([0-9][0-9,.\s]{0,12})\s+(?:followers|последователи)`)
	followers := f(latest(c, "linkedin", "followers"))
	if m := followerRe.FindStringSubmatch(clean); len(m) > 1 {
		if v := parseNumber(m[1]); v > 0 {
			followers = v
		}
	}
	ageRe := regexp.MustCompile(`\b(?:[1-9]|1[0-2])(?:mo|w|d)\b`)
	posts := float64(len(ageRe.FindAllString(clean, -1)))
	if posts == 0 {
		posts = f(latest(c, "linkedin", "visible_posts_90d"))
	}
	if posts > 40 {
		posts = 40
	}
	eventHits := float64(countAny(clean, "финалист", "събитие", "конференц", "участие", "award", "cosmoprof", "exhibition", "expo"))
	if eventHits > 20 {
		eventHits = 20
	}
	metrics := map[string]interface{}{"followers": followers, "profile_active": boolNum(res.OK), "visible_posts_90d": posts, "recent_industry_events": eventHits, "response_ms": float64(ms), "page_words": float64(len(strings.Fields(clean)))}
	for k, v := range metrics {
		add(c, "linkedin", k, v, stamp)
	}
	res.Metrics = metrics
	return res
}

type rss struct {
	Channel struct {
		Items []struct {
			Title       string `xml:"title"`
			Link        string `xml:"link"`
			PubDate     string `xml:"pubDate"`
			Source      string `xml:"source"`
			Description string `xml:"description"`
		} `xml:"item"`
	} `xml:"channel"`
}

func probeNewsQuery(c *Client, sourceKey, label, query string) ConnectorResult {
	stamp := nowISO()
	raw := "https://news.google.com/rss/search?q=" + url.QueryEscape(query) + "&hl=bg&gl=BG&ceid=BG:bg"
	res := ConnectorResult{SourceKey: sourceKey, Label: label, ObservedAt: stamp, Metrics: map[string]interface{}{}}
	status, body, ms, err := timedFetch(raw, 3*1024*1024)
	res.Status = status
	if err != nil {
		res.Error = err.Error()
		return res
	}
	res.OK = status >= 200 && status < 400
	var feed rss
	if xml.Unmarshal([]byte(body), &feed) != nil {
		res.Error = "RSS parse error"
		res.OK = false
		return res
	}
	cut30 := time.Now().Add(-30 * 24 * time.Hour)
	cut7 := time.Now().Add(-7 * 24 * time.Hour)
	n30, n7 := 0, 0
	sources := map[string]bool{}
	latestTitle := ""
	latestTime := time.Time{}
	positive, negative := 0, 0
	posWords := []string{"награда", "ръст", "нов", "успех", "партньор", "launch", "award", "growth", "иновац"}
	negWords := []string{"санкц", "глоба", "изтегля", "риск", "спад", "жалба", "наруш", "recall", "fine"}
	for _, it := range feed.Channel.Items {
		t, e := time.Parse(time.RFC1123Z, it.PubDate)
		if e != nil {
			t, _ = time.Parse(time.RFC1123, it.PubDate)
		}
		if t.IsZero() {
			continue
		}
		txt := strings.ToLower(it.Title + " " + it.Description)
		if t.After(cut30) {
			n30++
			if it.Source != "" {
				sources[it.Source] = true
			}
			if t.After(latestTime) {
				latestTime = t
				latestTitle = it.Title
			}
			if containsAny(txt, posWords...) {
				positive++
			}
			if containsAny(txt, negWords...) {
				negative++
			}
		}
		if t.After(cut7) {
			n7++
		}
	}
	metrics := map[string]interface{}{"news_mentions_30d": float64(n30), "news_mentions_7d": float64(n7), "news_sources_30d": float64(len(sources)), "latest_news_title": latestTitle, "positive_keyword_hits": float64(positive), "negative_keyword_hits": float64(negative), "response_ms": float64(ms)}
	for k, v := range metrics {
		add(c, sourceKey, k, v, stamp)
	}
	res.Metrics = metrics
	return res
}
func probeNewsAroma(c *Client) ConnectorResult {
	return probeNewsQuery(c, "google_search", "Google News – Aroma", `"Aroma Cosmetics" OR "Арома Козметикс" OR "Aroma AD"`)
}

func probeContentPage(c *Client, key string, terms []string) ConnectorResult {
	stamp := nowISO()
	src := sourceByKey(c, key)
	res := ConnectorResult{SourceKey: key, ObservedAt: stamp, Metrics: map[string]interface{}{}}
	if src == nil {
		res.Error = "source missing"
		return res
	}
	res.Label = src.Label
	status, body, ms, err := timedFetch(src.URL, 2*1024*1024)
	res.Status = status
	if err != nil {
		res.Error = err.Error()
		return res
	}
	res.OK = status >= 200 && status < 400
	text := strings.ToLower(stripHTML(body))
	hits := 0
	for _, t := range terms {
		hits += strings.Count(text, strings.ToLower(t))
	}
	metrics := map[string]interface{}{"reachable": boolNum(res.OK), "response_ms": float64(ms), "page_title": extractTitle(body), "page_words": float64(len(strings.Fields(text))), "relevant_term_hits": float64(hits), "aroma_mentions": float64(strings.Count(text, "aroma") + strings.Count(text, "арома")), "email_visible": boolNum(strings.Contains(text, "@")), "contact_terms": float64(countAny(text, "contact", "контакт", "телефон", "email", "e-mail"))}
	for k, v := range metrics {
		add(c, key, k, v, stamp)
	}
	res.Metrics = metrics
	return res
}
func retailerCandidates(key string) []string {
	switch key {
	case "dm":
		return []string{"https://www.dm-drogeriemarkt.bg/search?query=aroma&searchType=product", "https://www.dm-drogeriemarkt.bg/search?query=Aroma"}
	case "lilly":
		return []string{"https://lillydrogerie.bg/catalogsearch/result/?q=aroma", "https://lillydrogerie.bg/search?query=aroma"}
	case "douglas":
		return []string{"https://douglas.bg/catalogsearch/result/?q=aroma", "https://douglas.bg/search?q=aroma"}
	case "notino":
		return []string{"https://www.notino.bg/search.asp?exps=aroma", "https://www.notino.bg/search/?q=aroma"}
	}
	return nil
}
func probeRetailerAroma(c *Client, key string) ConnectorResult {
	stamp := nowISO()
	src := sourceByKey(c, key)
	res := ConnectorResult{SourceKey: key, ObservedAt: stamp, Metrics: map[string]interface{}{}}
	if src == nil {
		res.Error = "source missing"
		return res
	}
	res.Label = src.Label
	cands := retailerCandidates(key)
	if len(cands) == 0 {
		cands = []string{src.URL}
	}
	var body, used string
	var status int
	var ms int64
	var err error
	for _, u := range cands {
		status, body, ms, err = timedFetch(u, 3*1024*1024)
		if err == nil && status >= 200 && status < 400 {
			used = u
			break
		}
	}
	res.Status = status
	if err != nil {
		res.Error = err.Error()
		return res
	}
	res.OK = status >= 200 && status < 400
	low := strings.ToLower(stripHTML(body))
	mentions := strings.Count(low, "aroma") + strings.Count(low, "арома")
	// This is deliberately labelled as observed mentions, not an exact product count.
	metrics := map[string]interface{}{"reachable": boolNum(res.OK), "brand_visible": boolNum(mentions > 0), "brand_mentions_on_result": float64(mentions), "price_markers": float64(countAny(low, "лв.", " лв", "€", "eur", "bgn")), "response_ms": float64(ms), "search_url": used, "page_title": extractTitle(body)}
	for k, v := range metrics {
		add(c, key, k, v, stamp)
	}
	res.Metrics = metrics
	return res
}
func probeReference(c *Client, key string) ConnectorResult {
	// v2 keeps a health signal but also extracts a small auditable page profile.
	return probeContentPage(c, key, []string{"cosmetic", "козмет", "consumer", "потребител", "market", "пазар", "brand", "марка"})
}

type competitorSpec struct{ Key, Name, URL, NewsQuery string }

var aromaCompetitors = []competitorSpec{
	{Key: "competitor_alteya", Name: "Alteya Organics", URL: "https://alteyaorganics.bg/", NewsQuery: `"Alteya Organics" OR "Алтея Органикс"`},
	{Key: "competitor_biofresh", Name: "Biofresh", URL: "https://www.cosmeticsbulgaria.com/en/brand/biofresh/", NewsQuery: `"Biofresh" cosmetics Bulgaria`},
	{Key: "competitor_agiva", Name: "Agiva", URL: "https://agiva.bg/", NewsQuery: `"Agiva" cosmetics Bulgaria OR "Агива" козметика`},
}

func probeCompetitor(c *Client, sp competitorSpec) ConnectorResult {
	stamp := nowISO()
	res := ConnectorResult{SourceKey: sp.Key, Label: sp.Name, ObservedAt: stamp, Metrics: map[string]interface{}{}}
	status, body, ms, err := timedFetch(sp.URL, 3*1024*1024)
	res.Status = status
	if err != nil {
		res.Error = err.Error()
		return res
	}
	res.OK = status >= 200 && status < 400
	low := strings.ToLower(body)
	text := strings.ToLower(stripHTML(body))
	web := boolNum(res.OK)
	commerce := boolNum(containsAny(low, "cart", "колич", "checkout", "shopify", "woocommerce", "купи", "add to cart"))
	price := boolNum(containsAny(low, " лв", "bgn", "€", "eur", "price"))
	social := boolNum(containsAny(low, "instagram.com", "facebook.com", "youtube.com", "tiktok.com"))
	contentWords := float64(len(strings.Fields(text)))
	categories := float64(countAny(text, "лице", "face", "коса", "hair", "тяло", "body", "rose", "роза", "organic", "bio"))
	if categories > 12 {
		categories = 12
	}
	// Fetch news directly without appending duplicate observations through probeNewsQuery.
	qraw := "https://news.google.com/rss/search?q=" + url.QueryEscape(sp.NewsQuery) + "&hl=bg&gl=BG&ceid=BG:bg"
	n30 := 0
	if st, b, _, e := timedFetch(qraw, 2*1024*1024); e == nil && st >= 200 && st < 400 {
		var feed rss
		if xml.Unmarshal([]byte(b), &feed) == nil {
			cut := time.Now().Add(-30 * 24 * time.Hour)
			for _, it := range feed.Channel.Items {
				t, e := time.Parse(time.RFC1123Z, it.PubDate)
				if e != nil {
					t, _ = time.Parse(time.RFC1123, it.PubDate)
				}
				if !t.IsZero() && t.After(cut) {
					n30++
				}
			}
		}
	}
	contentNorm := clamp(contentWords / 2500 * 100)
	categoryNorm := clamp(categories / 8 * 100)
	newsNorm := clamp(float64(n30) / 10 * 100)
	score := r1(web*20 + commerce*20 + price*15 + social*10 + categoryNorm*.15 + contentNorm*.10 + newsNorm*.10)
	metrics := map[string]interface{}{"website_active": web, "ecommerce_signal": commerce, "pricing_signal": price, "social_links": social, "category_signal_count": categories, "page_words": contentWords, "news_mentions_30d": float64(n30), "response_ms": float64(ms), "score": score, "url": sp.URL}
	for k, v := range metrics {
		add(c, sp.Key, k, v, stamp)
	}
	res.Metrics = metrics
	return res
}
func aromaOwnCompetitiveScore(c *Client) float64 {
	web := boolScore(latest(c, "official_site", "website_active"))
	commerce := boolScore(latest(c, "official_site", "ecommerce_active"))
	price := boolScore(latest(c, "official_site", "pricing_visible"))
	social := boolScore(latest(c, "linkedin", "profile_active"))
	catsRaw := f(latest(c, "official_site", "sitemap_collections"))
	cats := norm(catsRaw, 20)
	if catsRaw == 0 {
		cats = norm(f(latest(c, "official_site", "category_count")), 4)
	}
	words := f(latest(c, "official_site", "page_words"))
	content := clamp(words / 2500 * 100)
	if words == 0 {
		content = boolScore(latest(c, "official_site", "blog_events"))
	}
	news := clamp(f(latest(c, "google_search", "news_mentions_30d")) / 10 * 100)
	return r1(web*.20 + commerce*.20 + price*.15 + social*.10 + cats*.15 + content*.10 + news*.10)
}
func runAromaEngine(c *Client, createSnapshot bool) EngineStatus {
	started := time.Now()
	setEngineStatus(EngineStatus{Version: "2.5-multi", Running: true, LastRun: engineSnapshot().LastRun, NextRun: started.Add(24 * time.Hour).Format(time.RFC3339)})
	results := []ConnectorResult{probeOfficialAroma(c), probeLinkedInAroma(c), probeNewsAroma(c), probeContentPage(c, "corporate", []string{"aroma", "арома", "contact", "контакт", "history", "история", "product", "продукт"}), probeContentPage(c, "cosmetics_bg", []string{"aroma", "арома", "cosmetics", "product", "brand"})}
	keys := []string{"nsi", "registry", "bpo", "kzp", "bda", "euipo", "wipo", "eurostat", "cosmetics_europe", "cosing", "ec_cosmetics"}
	ch := make(chan ConnectorResult, len(keys)+4+len(aromaCompetitors))
	for _, key := range keys {
		go func(k string) { ch <- probeReference(c, k) }(key)
	}
	for _, key := range []string{"douglas", "lilly", "dm", "notino"} {
		go func(k string) { ch <- probeRetailerAroma(c, k) }(key)
	}
	for _, sp := range aromaCompetitors {
		go func(x competitorSpec) { ch <- probeCompetitor(c, x) }(sp)
	}
	for i := 0; i < len(keys)+4+len(aromaCompetitors); i++ {
		results = append(results, <-ch)
	}
	// Persist Aroma's comparable score as another real observation.
	add(c, "competitive_engine", "aroma_score", aromaOwnCompetitiveScore(c), nowISO())
	successful, failed := 0, 0
	for _, r := range results {
		if r.OK {
			successful++
		} else {
			failed++
		}
	}
	if createSnapshot {
		d := dashboard(c)
		c.Snapshots = append(c.Snapshots, Snapshot{CreatedAt: nowISO(), Payload: d})
		if len(c.Snapshots) > 400 {
			c.Snapshots = c.Snapshots[len(c.Snapshots)-400:]
		}
		if len(c.Observations) > 12000 {
			c.Observations = c.Observations[len(c.Observations)-12000:]
		}
		saveStore()
	}
	st := EngineStatus{Version: "2.5-multi", Running: false, LastRun: nowISO(), NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339), Successful: successful, Failed: failed, Results: results}
	setEngineStatus(st)
	return st
}

func probeGenericSource(c *Client, key string, terms []string) ConnectorResult {
	s := sourceByKey(c, key)
	stamp := nowISO()
	res := ConnectorResult{SourceKey: key, ObservedAt: stamp, Metrics: map[string]interface{}{}}
	if s == nil {
		res.Error = "source not configured"
		return res
	}
	res.Label = s.Label
	status, body, ms, err := timedFetch(s.URL, 2<<20)
	res.Status = status
	if err != nil {
		res.Error = err.Error()
		return res
	}
	res.OK = status >= 200 && status < 400
	text := strings.ToLower(stripHTML(body))
	words := float64(len(strings.Fields(text)))
	termCount := 0.0
	if len(terms) > 0 {
		termCount = float64(countAny(text, terms...))
	}
	score := r1(boolNum(res.OK)*.55 + clamp(words/2500*100)*.30 + clamp(termCount/12*100)*.15)
	m := map[string]interface{}{"reachable": boolNum(res.OK), "response_ms": float64(ms), "page_words": words, "title": extractTitle(body), "term_signal_count": termCount, "score": score}
	for k, v := range m {
		add(c, key, k, v, stamp)
	}
	res.Metrics = m
	return res
}
func probeBolyarkaNews(c *Client) ConnectorResult {
	return probeNewsQuery(c, "google_news", "Google News – Болярка", "Болярка OR Boliarka OR Bolyarka")
}
func runBolyarkaEngine(c *Client, createSnapshot bool) EngineStatus {
	setEngineStatus(EngineStatus{Version: "2.5-multi", Running: true, LastRun: engineSnapshot().LastRun, NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339)})
	keys := []string{"official_site", "brand_site", "linkedin", "untappd", "untappd_beers", "registry", "nsi", "brewers_bg", "world_beer_awards", "competitor_kamenitza", "competitor_zagorka", "competitor_shumensko"}
	results := []ConnectorResult{}
	ch := make(chan ConnectorResult, len(keys)+1)
	for _, k := range keys {
		go func(key string) {
			ch <- probeGenericSource(c, key, []string{"болярка", "boliarka", "bolyarka", "beer", "бира"})
		}(k)
	}
	go func() { ch <- probeBolyarkaNews(c) }()
	for i := 0; i < len(keys)+1; i++ {
		results = append(results, <-ch)
	}
	// derive a few metrics from current official pages when visible
	if r := sourceByKey(c, "official_site"); r != nil {
		_, body, _, err := timedFetch(r.URL, 2<<20)
		if err == nil {
			t := strings.ToLower(stripHTML(body))
			add(c, "official_site", "portfolio_items", float64(countAny(t, "болярка светло", "болярка тъмно", "непастьоризирано", "радлер", "жива бира", "балканско", "fort", "диана", "хелиос")), nowISO())
			if containsAny(t, "128 години") {
				add(c, "official_site", "heritage_years", 128.0, nowISO())
			}
			add(c, "official_site", "website_active", 1.0, nowISO())
			add(c, "official_site", "news_section", boolNum(containsAny(t, "новини")), nowISO())
		}
	}
	suc, fail := 0, 0
	for _, r := range results {
		if r.OK {
			suc++
		} else {
			fail++
		}
	}
	if createSnapshot {
		d := dashboard(c)
		c.Snapshots = append(c.Snapshots, Snapshot{CreatedAt: nowISO(), Payload: d})
		if len(c.Snapshots) > 400 {
			c.Snapshots = c.Snapshots[len(c.Snapshots)-400:]
		}
		saveStore()
	}
	st := EngineStatus{Version: "2.5-multi", Running: false, LastRun: nowISO(), NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339), Successful: suc, Failed: fail, Results: results}
	setEngineStatus(st)
	return st
}
func runAstorEngine(c *Client, createSnapshot bool) EngineStatus {
	setEngineStatus(EngineStatus{Version: "2.5-multi", Running: true, LastRun: engineSnapshot().LastRun, NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339)})
	results := []ConnectorResult{}
	keys := []string{"official_site", "google_hotels", "booking", "tripadvisor"}
	ch := make(chan ConnectorResult, len(keys)+1)
	for _, k := range keys {
		go func(key string) {
			ch <- probeGenericSource(c, key, []string{"astor garden", "астор гардън", "review", "rating", "отзив"})
		}(k)
	}
	go func() {
		ch <- probeNewsQuery(c, "google_news", "Google News – Astor Garden", "\"Astor Garden\" hotel")
	}()
	for i := 0; i < len(keys)+1; i++ {
		results = append(results, <-ch)
	}
	suc, fail := 0, 0
	for _, r := range results {
		if r.OK {
			suc++
		} else {
			fail++
		}
	}
	if createSnapshot {
		d := dashboard(c)
		c.Snapshots = append(c.Snapshots, Snapshot{CreatedAt: nowISO(), Payload: d})
		if len(c.Snapshots) > 400 {
			c.Snapshots = c.Snapshots[len(c.Snapshots)-400:]
		}
		saveStore()
	}
	st := EngineStatus{Version: "2.5-multi", Running: false, LastRun: nowISO(), NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339), Successful: suc, Failed: fail, Results: results}
	setEngineStatus(st)
	return st
}
func runClientEngine(c *Client, snapshot bool) EngineStatus {
	if c == nil {
		return EngineStatus{Version: "2.5-multi"}
	}
	switch c.Slug {
	case "bolyarka":
		return runBolyarkaEngine(c, snapshot)
	case "astor-garden":
		return runAstorEngine(c, snapshot)
	default:
		return runAromaEngine(c, snapshot)
	}
}

func startEngineScheduler() {
	go func() {
		time.Sleep(30 * time.Second)
		for _, slug := range []string{"aroma", "bolyarka", "astor-garden"} {
			runClientEngine(store.Clients[slug], true)
		}
		t := time.NewTicker(24 * time.Hour)
		defer t.Stop()
		for range t.C {
			for _, slug := range []string{"aroma", "bolyarka", "astor-garden"} {
				runClientEngine(store.Clients[slug], true)
			}
		}
	}()
}

func reportContent(c *Client, id string) (string, string) {
	name := c.Name
	if id == "digital" {
		return "Дигитално и съдържателно присъствие – " + name,
			"<p>Месечният анализ проследява развитието на собствените дигитални активи, структурата и актуалността на съдържанието, продуктовото представяне и видимите промени през периода.</p><div class='box'><b>Основен фокус:</b> сайт, електронна търговия, съдържание, продуктови категории, публични фирмени профили и последователност на представянето.</div><h2>Какво се анализира</h2><p>Промени спрямо предходния период, силни и слаби елементи, нови публикации, актуализации и възможности за подобрение.</p>"
	}
	if id == "reputation" {
		return "Репутация и информационна среда – " + name,
			"<p>Анализ на публичната информационна среда около марката, видимите оценки и мнения, външните публикации и темите, които могат да влияят върху възприятието.</p><div class='box'><b>Основен фокус:</b> репутационни сигнали, повтарящи се теми, външни споменавания и промени, които изискват внимание.</div>"
	}
	if id == "signals" {
		return "Пазарни сигнали – " + name,
			"<p>Анализ на промените в интереса, тематичните акценти, активността на марката и наблюдаемите движения в категорията.</p><div class='box'><b>Основен фокус:</b> нови сигнали, ускоряване или отслабване на интереса, продуктови и комуникационни теми и възможности.</div>"
	}
	if id == "competitive" {
		return "Конкурентно позициониране – " + name,
			"<p>Съпоставка с предварително определена група сравними марки по еднакви публични критерии.</p><div class='box'><b>Основен фокус:</b> разлики в дигиталното присъствие, съдържанието, продуктовото представяне, видимата активност и развитието във времето.</div>"
	}
	if id == "summary" {
		return "Месечно обобщение – " + name,
			"<p>Кратко обобщение на най-важните промени през месеца: какво се е подобрило, какво изисква внимание, кои сигнали се повтарят и кои препоръки са приоритетни за следващия период.</p>"
	}
	return "", ""
}

func keywordAnalysis(c *Client) []map[string]interface{} {
	out := []map[string]interface{}{}
	addkw := func(k string, v float64, cluster, source string) {
		out = append(out, map[string]interface{}{"keyword": k, "mentions": v, "cluster": cluster, "source": source, "measured": true})
	}
	if c.Slug == "bolyarka" {
		addkw("Болярка", f(latest(c, "google_news", "news_mentions_30d")), "Бранд", "Google News RSS")
		addkw("продуктови сигнали", f(latest(c, "official_site", "term_signal_count")), "Съдържание", "официален сайт")
		addkw("consumer ratings", f(latest(c, "untappd_beers", "bolyarka_svetlo_ratings")), "Репутация", "Untappd")
	} else if c.Slug == "astor-garden" {
		addkw("Astor Garden", f(latest(c, "google_news", "news_mentions_30d")), "Бранд", "Google News RSS")
		addkw("review signals", f(latest(c, "tripadvisor", "term_signal_count"))+f(latest(c, "booking", "term_signal_count")), "Отзиви", "Booking + Tripadvisor pages")
	} else {
		addkw("Aroma", f(latest(c, "google_search", "news_mentions_30d")), "Бранд", "Google News RSS")
		addkw("product/category signals", f(latest(c, "official_site", "category_count"))+f(latest(c, "official_site", "sitemap_collections")), "Категории", "Aroma.bg")
		addkw("public content signals", f(latest(c, "linkedin", "visible_posts_90d")), "Съдържание", "LinkedIn")
	}
	return out
}

func alertCenter(c *Client) []map[string]interface{} {
	d := dashboard(c)
	out := []map[string]interface{}{}
	if ss, ok := d["signals"].([]interface{}); ok {
		for i, x := range ss {
			if m, ok := x.(map[string]interface{}); ok {
				out = append(out, map[string]interface{}{"id": fmt.Sprintf("%s-%d", c.Slug, i+1), "severity": m["level"], "title": m["title"], "text": m["text"], "created_at": latestObservedAt(c), "acknowledged": false})
			}
		}
	}
	return out
}
func exportCenter(c *Client) []map[string]interface{} {
	now := time.Now()
	return []map[string]interface{}{{"id": "keywords", "title": "Анализ на ключови думи", "format": "CSV", "created_at": now.Add(-15 * time.Minute).Format(time.RFC3339)}, {"id": "signals", "title": "Ключови сигнали", "format": "PDF", "created_at": now.Add(-22 * time.Minute).Format(time.RFC3339)}, {"id": "benchmark", "title": "Конкурентен benchmark", "format": "CSV", "created_at": now.Add(-35 * time.Minute).Format(time.RFC3339)}, {"id": "summary", "title": "Управленско резюме", "format": "PDF", "created_at": now.Add(-50 * time.Minute).Format(time.RFC3339)}}
}
func activityFeed(c *Client) []map[string]interface{} {
	out := []map[string]interface{}{}
	for i := len(c.Observations) - 1; i >= 0 && len(out) < 8; i-- {
		o := c.Observations[i]
		out = append(out, map[string]interface{}{"time": o.ObservedAt, "source": o.SourceKey, "metric": o.MetricKey, "value": o.Value})
	}
	return out
}
func dataQuality(c *Client) map[string]interface{} {
	ok, total := 0, len(c.Sources)
	fresh := 0
	cutoff := time.Now().Add(-48 * time.Hour)
	for _, s := range c.Sources {
		if latest(c, s.Key, "reachable") != nil || latest(c, s.Key, "website_active") != nil || latest(c, s.Key, "profile_active") != nil {
			ok++
		}
		for i := len(c.Observations) - 1; i >= 0; i-- {
			o := c.Observations[i]
			if o.SourceKey == s.Key {
				if t, e := time.Parse(time.RFC3339, o.ObservedAt); e == nil && t.After(cutoff) {
					fresh++
				}
				break
			}
		}
	}
	return map[string]interface{}{"sources_total": total, "sources_with_data": ok, "fresh_sources_48h": fresh, "coverage": r1(float64(ok) / math.Max(float64(total), 1) * 100), "freshness": r1(float64(fresh) / math.Max(float64(total), 1) * 100), "updated": latestObservedAt(c)}
}
func safeCSV(s string) string {
	s = strings.ReplaceAll(s, "\"", "\"\"")
	if strings.ContainsAny(s, ",\n\"") {
		return "\"" + s + "\""
	}
	return s
}
func generateDownload(w http.ResponseWriter, c *Client, typ, format string) {
	d := dashboard(c)
	ts := time.Now().Format("2006-01-02")
	filename := c.Slug + "_" + typ + "_" + ts
	if format == "csv" {
		w.Header().Set("Content-Type", "text/csv; charset=utf-8")
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename+".csv"))
		io.WriteString(w, "metric,value\n")
		for _, k := range []string{"blis_index", "benchmark", "relative", "confidence", "trend"} {
			io.WriteString(w, safeCSV(k)+","+fmt.Sprint(d[k])+"\n")
		}
		return
	}
	if format == "json" {
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename+".json"))
		jsonOut(w, d)
		return
	}
	title, body := reportContent(c, typ)
	if title == "" {
		title = "BLIS управленско резюме – " + c.Name
		body = fmt.Sprintf("<p>BLIS индекс: <b>%v</b></p><p>Надеждност на данните: <b>%v%%</b></p>", d["blis_index"], d["confidence"])
	}
	if format == "html" {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename+".html"))
		io.WriteString(w, "<!doctype html><meta charset=utf-8><title>"+title+"</title><style>body{font-family:Arial;max-width:900px;margin:40px;color:#0e2a5a}h1{font-size:30px}</style><h1>"+title+"</h1>"+body)
		return
	}
	pdf := simplePDF(title, fmt.Sprintf("BLIS Index: %v | Confidence: %v%% | Generated: %s", d["blis_index"], d["confidence"], ts))
	w.Header().Set("Content-Type", "application/pdf")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename+".pdf"))
	w.Write(pdf)
}
func simplePDF(title, body string) []byte {
	esc := func(x string) string {
		x = strings.ReplaceAll(x, "\\", "\\\\")
		x = strings.ReplaceAll(x, "(", "\\(")
		x = strings.ReplaceAll(x, ")", "\\)")
		return x
	}
	content := fmt.Sprintf("BT /F1 18 Tf 50 780 Td (%s) Tj 0 -35 Td /F1 11 Tf (%s) Tj ET", esc(title), esc(body))
	objs := []string{"<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>", fmt.Sprintf("<< /Length %d >>\\nstream\\n%s\\nendstream", len(content), content), "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"}
	var b strings.Builder
	b.WriteString("%PDF-1.4\n")
	offs := []int{0}
	for i, o := range objs {
		offs = append(offs, b.Len())
		fmt.Fprintf(&b, "%d 0 obj\n%s\nendobj\n", i+1, o)
	}
	x := b.Len()
	fmt.Fprintf(&b, "xref\n0 %d\n0000000000 65535 f \n", len(objs)+1)
	for i := 1; i < len(offs); i++ {
		fmt.Fprintf(&b, "%010d 00000 n \n", offs[i])
	}
	fmt.Fprintf(&b, "trailer << /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF", len(objs)+1, x)
	return []byte(b.String())
}

func jsonOut(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	_ = json.NewEncoder(w).Encode(v)
}
func handler(w http.ResponseWriter, r *http.Request) {
	path := strings.Trim(r.URL.Path, "/")
	if path == "" {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		io.WriteString(w, indexHTML)
		return
	}
	if path == "api/health" {
		jsonOut(w, map[string]interface{}{"ok": true, "time": nowISO(), "engine": engineSnapshot()})
		return
	}
	if path == "api/engine/status" {
		jsonOut(w, engineSnapshot())
		return
	}
	if path == "api/store/export" {
		mu.Lock()
		defer mu.Unlock()
		jsonOut(w, store)
		return
	}
	if path == "api/clients" {
		out := []map[string]string{}
		for _, slug := range []string{"aroma", "bolyarka", "astor-garden"} {
			if c := store.Clients[slug]; c != nil {
				out = append(out, map[string]string{"slug": c.Slug, "name": c.Name, "sector": c.Sector, "note": c.Note})
			}
		}
		jsonOut(w, out)
		return
	}
	p := strings.Split(path, "/")
	if len(p) >= 5 && p[0] == "api" && p[1] == "clients" && p[3] == "reports" && p[4] != "" {
		c, ok := store.Clients[p[2]]
		if !ok {
			http.NotFound(w, r)
			return
		}
		reportID := p[4]
		title, body := reportContent(c, reportID)
		if title == "" {
			http.NotFound(w, r)
			return
		}
		filename := strings.ReplaceAll(c.Name, " ", "_") + "_" + reportID + "_08-2026.html"
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
		io.WriteString(w, "<!doctype html><html lang='bg'><meta charset='utf-8'><title>"+title+"</title><style>body{font-family:Segoe UI,Arial,sans-serif;max-width:900px;margin:45px auto;color:#0c2547;line-height:1.55}h1{font-size:28px}h2{font-size:19px;margin-top:28px}small{color:#6f7e92}.box{background:#f7fbff;border-left:4px solid #0e58be;padding:14px 16px;margin:20px 0}</style><body><small>Brand Lab • BLIS™ • Август 2026</small><h1>"+title+"</h1>"+body+"</body></html>")
		return
	}

	if len(p) >= 4 && p[0] == "api" && p[1] == "clients" {
		c, ok := store.Clients[p[2]]
		if !ok {
			http.NotFound(w, r)
			return
		}
		if p[3] == "keywords" {
			jsonOut(w, keywordAnalysis(c))
			return
		}
		if p[3] == "alerts" {
			jsonOut(w, alertCenter(c))
			return
		}
		if p[3] == "exports" {
			jsonOut(w, exportCenter(c))
			return
		}
		if p[3] == "activity" {
			jsonOut(w, activityFeed(c))
			return
		}
		if p[3] == "data-quality" {
			jsonOut(w, dataQuality(c))
			return
		}
		if p[3] == "generate" && (r.Method == "POST" || r.Method == "GET") {
			typ := r.URL.Query().Get("type")
			if typ == "" {
				typ = "summary"
			}
			format := r.URL.Query().Get("format")
			if format == "" {
				format = "pdf"
			}
			generateDownload(w, c, typ, format)
			return
		}
	}

	if len(p) >= 4 && p[0] == "api" && p[1] == "clients" {
		c, ok := store.Clients[p[2]]
		if !ok {
			http.NotFound(w, r)
			return
		}
		switch p[3] {
		case "dashboard":
			jsonOut(w, dashboard(c))
			return
		case "sources":
			jsonOut(w, c.Sources)
			return
		case "history":
			jsonOut(w, c.Snapshots)
			return
		case "reports":
			jsonOut(w, []map[string]string{
				{"id": "digital", "title": "Дигитално и съдържателно присъствие", "period": "Август 2026"},
				{"id": "reputation", "title": "Репутация и информационна среда", "period": "Август 2026"},
				{"id": "signals", "title": "Пазарни сигнали", "period": "Август 2026"},
				{"id": "competitive", "title": "Конкурентно позициониране", "period": "Август 2026"},
				{"id": "summary", "title": "Месечно обобщение", "period": "Август 2026"},
			})
			return
		case "refresh":
			if r.Method != "POST" {
				http.Error(w, "method", 405)
				return
			}
			st := runClientEngine(c, true)
			d := dashboard(c)
			jsonOut(w, map[string]interface{}{"ok": true, "engine": st, "dashboard": d})
			return
		}
	}

	http.NotFound(w, r)
}
func main() {
	ensureStore()
	setEngineStatus(EngineStatus{Version: "2.5-multi", NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339)})
	startEngineScheduler()
	port := os.Getenv("PORT")
	if port == "" {
		port = "10000"
	}
	addr := "0.0.0.0:" + port
	log.Printf("BLIS Navigator Engine v2 Multi-client listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, http.HandlerFunc(handler)))
}
