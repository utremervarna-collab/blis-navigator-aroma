package main

import (
	"embed"
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

//go:embed static/*
var staticFS embed.FS

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

type Inquiry struct {
	ID        string `json:"id"`
	Type      string `json:"type"`
	Name      string `json:"name"`
	Company   string `json:"company"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	Message   string `json:"message"`
	CreatedAt string `json:"created_at"`
}

type ExportRecord struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	Format    string `json:"format"`
	CreatedAt string `json:"created_at"`
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
var exportMu sync.Mutex
var exportHistory = map[string][]ExportRecord{}

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
func meanPositive(xs []float64) float64 {
	vals := []float64{}
	for _, x := range xs {
		if x > 0 {
			vals = append(vals, x)
		}
	}
	return mean(vals)
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
			{Key: "google_hotels", Label: "Google Hotels", URL: "https://www.google.com/travel/hotels/", Method: "публични оценки, отзиви и хотелска видимост", Reliability: .90},
			{Key: "booking", Label: "Booking.com", URL: "https://www.booking.com/reviews/bg/hotel/astor-garden.html", Method: "публични оценки, обем на отзивите и категории на преживяването", Reliability: .98},
			{Key: "tripadvisor", Label: "Tripadvisor", URL: "https://www.tripadvisor.com/Hotel_Review-g499088-d13582215-Reviews-Astor_Garden_Hotel-Saints_Constantine_and_Helena_Varna_Province.html", Method: "публични оценки, тематични отзиви и репутационни сигнали", Reliability: .88},
			{Key: "official_site", Label: "Официален сайт", URL: "https://astorgardenhotel.com/", Method: "официални оферти, директна резервация, услуги и съдържание", Reliability: .98},
			{Key: "facebook", Label: "Facebook – Astor Garden Hotel", URL: "https://www.facebook.com/AstorGardenHotel/", Method: "публично съдържание и видима социална активност", Reliability: .80},
			{Key: "instagram", Label: "Instagram – Astor Garden Hotel", URL: "https://www.instagram.com/astorgardenhotel/", Method: "публично съдържание и видима социална активност", Reliability: .80},
			{Key: "youtube", Label: "YouTube – Astor Garden Hotel", URL: "https://www.youtube.com/channel/UCqhNRzv1W5O9uj3eUlIsWYQ", Method: "официално видео съдържание и видима активност", Reliability: .82},
			{Key: "expedia", Label: "Expedia", URL: "https://www.expedia.com/Varna-Hotels-Astor-Garden-Hotel.h22962719.Hotel-Information", Method: "публична хотелска репутация и проверени отзиви", Reliability: .88},
			{Key: "hotels", Label: "Hotels.com", URL: "https://www.hotels.com/ho735807008/astor-garden-hotel-varna-bulgaria/", Method: "публични оценки, категории и потребителски теми", Reliability: .88},
			{Key: "trivago", Label: "Trivago", URL: "https://www.trivago.co.uk/en-GB/oar/astor-garden-hotel-varna?search=100-9157092", Method: "агрегирана хотелска видимост и сравнителна среда", Reliability: .82},
			{Key: "holidaycheck", Label: "HolidayCheck", URL: "https://www.holidaycheck.de/hi/astor-garden-hotel/0d838902-aa89-491e-b39a-f8192bae3ca6", Method: "публични оценки, препоръки и потребителски въпроси", Reliability: .84},
			{Key: "trip_com", Label: "Trip.com", URL: "https://www.trip.com/hotels/saints-constantine-and-helena-hotel-detail-14085203/astor-garden-hotel/", Method: "публични оценки и международна хотелска видимост", Reliability: .82},
			{Key: "skyscanner", Label: "Skyscanner Hotels", URL: "https://www.skyscanner.net/hotels/bulgaria/varna-hotels/astor-garden-hotel/ht-203823476", Method: "агрегирана видимост, оферти и рейтингова среда", Reliability: .80},
			{Key: "google_news", Label: "Google News – Astor Garden", URL: "https://news.google.com/", Method: "новинарски споменавания и източници", Reliability: .90},
			{Key: "cmp_rosslyn_booking", Label: "Booking.com – Rosslyn Dimyat", URL: "https://www.booking.com/hotel/bg/dimyat-hotel-varna.html", Method: "сравнима публична хотелска оценка и категории", Reliability: .96},
			{Key: "cmp_international_booking", Label: "Booking.com – International Hotel Casino", URL: "https://www.booking.com/hotel/bg/casino-international.html", Method: "сравнима публична хотелска оценка и категории", Reliability: .96},
			{Key: "cmp_aquahouse_booking", Label: "Booking.com – Ensana Aquahouse", URL: "https://www.booking.com/hotel/bg/aquahouse-amp-spa.html", Method: "сравнима публична хотелска оценка и категории", Reliability: .96},
			{Key: "cmp_palace_booking", Label: "Booking.com – The Palace Hotel", URL: "https://www.booking.com/hotel/bg/the-palace.html", Method: "сравнима публична хотелска оценка и категории", Reliability: .96},
		},
	}
	for _, x := range []struct {
		s, m string
		v    interface{}
	}{
		{"google_hotels", "rating", 4.6}, {"google_hotels", "reviews", 2904.0},
		{"booking", "rating", 9.4}, {"booking", "reviews", 1610.0}, {"booking", "cleanliness", 9.4}, {"booking", "comfort", 9.4},
		{"booking", "location", 9.7}, {"booking", "facilities", 9.4}, {"booking", "staff", 9.2}, {"booking", "value_for_money", 8.9}, {"booking", "wifi", 8.6},
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
			{Key: "google_search", Label: "Google", URL: "https://www.google.com/", Method: "активен международен източник • откриваемост и информационна среда", Reliability: .88},
			{Key: "google_trends", Label: "Google Trends", URL: "https://trends.google.com/", Method: "активен международен източник • относителен интерес при търсене", Reliability: .92},
			{Key: "google_ads", Label: "Google Ads Transparency Center", URL: "https://adstransparency.google.com/", Method: "периодичен международен източник • публични рекламни активности", Reliability: .90},
			{Key: "meta_ads", Label: "Meta Ad Library", URL: "https://www.facebook.com/ads/library/", Method: "периодичен международен източник • публични рекламни активности", Reliability: .90},
			{Key: "facebook", Label: "Facebook – публични профили", URL: "https://www.facebook.com/", Method: "публичен международен източник • съдържание и видима активност", Reliability: .78},
			{Key: "instagram", Label: "Instagram – публични профили", URL: "https://www.instagram.com/", Method: "публичен международен източник • съдържание и видима активност", Reliability: .78},
			{Key: "youtube", Label: "YouTube", URL: "https://www.youtube.com/", Method: "публичен международен източник • видео съдържание и видима активност", Reliability: .82},
			{Key: "tiktok", Label: "TikTok – публични профили", URL: "https://www.tiktok.com/", Method: "публичен международен източник • съдържание и видима активност", Reliability: .75},
			{Key: "facebook_official", Label: "Facebook – Aroma", URL: "https://www.facebook.com/aroma.cosmetics/", Method: "официален публичен профил • съдържание и видима активност", Reliability: .82},
			{Key: "instagram_official", Label: "Instagram – Aroma Bulgaria", URL: "https://www.instagram.com/aroma.bulgaria/", Method: "официален публичен профил • съдържание и видима активност", Reliability: .82},
			{Key: "youtube_official", Label: "YouTube – Aroma", URL: "https://www.youtube.com/@AromaJsc", Method: "официален видео канал • публикации и продуктово съдържание", Reliability: .84},
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
			{Key: "makeup", Label: "MAKEUP България", URL: "https://makeup.bg/", Method: "търговска видимост, продуктово присъствие и ценови сигнали", Reliability: .86},
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
			{Key: "untappd", Label: "Untappd – Bolyarka VT AD", URL: "https://untappd.com/BolyarkaJSC", Method: "публична потребителска платформа • оценки и видима активност", Reliability: .86},
			{Key: "untappd_beers", Label: "Untappd – Beer portfolio", URL: "https://untappd.com/BolyarkaJSC/beer", Method: "публична продуктова репутация", Reliability: .86},
			{Key: "google_news", Label: "Google News – Болярка", URL: "https://news.google.com/", Method: "RSS новинарски мониторинг", Reliability: .90},
			{Key: "registry", Label: "Търговски регистър", URL: "https://portal.registryagency.bg/", Method: "официални фирмени данни", Reliability: 1},
			{Key: "nsi", Label: "НСИ", URL: "https://www.nsi.bg/", Method: "секторни референтни данни", Reliability: .98},
			{Key: "brewers_bg", Label: "Съюз на пивоварите в България", URL: "https://www.pivovari.com/", Method: "браншови и секторни данни", Reliability: .95},
			{Key: "world_beer_awards", Label: "World Beer Awards", URL: "https://www.worldbeerawards.com/", Method: "международен продуктов сравнителен източник", Reliability: .92},
			{Key: "facebook", Label: "Facebook – Болярка", URL: "https://www.facebook.com/boliarka.beer/", Method: "публичен бранд профил • съдържание и видима активност", Reliability: .82},
			{Key: "youtube", Label: "YouTube – Boliarka", URL: "https://www.youtube.com/results?search_query=Boliarka+81", Method: "публично видео съдържание и видимост", Reliability: .72},
			{Key: "google_trends", Label: "Google Trends", URL: "https://trends.google.com/trends/", Method: "относителен интерес при търсене за марката и конкурентите", Reliability: .92},
			{Key: "meta_ads", Label: "Meta Ad Library", URL: "https://www.facebook.com/ads/library/", Method: "публична рекламна активност при наличие на активни реклами", Reliability: .90},
			{Key: "kaufland", Label: "Kaufland България", URL: "https://www.kaufland.bg/", Method: "търговска среда, оферти и наличност при публично видими резултати", Reliability: .80},
			{Key: "billa", Label: "BILLA България", URL: "https://www.billa.bg/", Method: "търговска среда, оферти и наличност при публично видими резултати", Reliability: .80},
			{Key: "metro", Label: "METRO България", URL: "https://www.metro.bg/", Method: "търговска среда и продуктова наличност при публично видими резултати", Reliability: .82},
			{Key: "untappd_bolyarka_flagship", Label: "Untappd – Болярка Светло", URL: "https://untappd.com/b/bolyarka-vt-ad-bolyarka-svetlo-bolyarka-svetlo/20480", Method: "сравнима продуктова оценка, обем рейтинги и потребителска активност", Reliability: .88},
			{Key: "untappd_kamenitza", Label: "Untappd – Kamenitza 1881", URL: "https://untappd.com/b/kamenitza-starbev-kamenitza-1881/125711", Method: "сравнима продуктова оценка и обем рейтинги", Reliability: .88},
			{Key: "untappd_zagorka", Label: "Untappd – Zagorka Special", URL: "https://untappd.com/b/zagorka-zagorka-brewery-zagorka-special-zagorka-specialno/19721", Method: "сравнима продуктова оценка и обем рейтинги", Reliability: .88},
			{Key: "untappd_shumensko", Label: "Untappd – Шуменско Специално", URL: "https://untappd.com/b/carlsberg-bulgaria-shumensko-specialno-shumensko-special/1498357", Method: "сравнима продуктова оценка и обем рейтинги", Reliability: .88},
			{Key: "competitor_kamenitza", Label: "Каменица", URL: "https://www.kamenitza.bg/", Method: "официален сайт • конкурентно сравнение", Reliability: .92},
			{Key: "competitor_zagorka", Label: "Загорка", URL: "https://zagorka.bg/", Method: "официален сайт • конкурентно сравнение", Reliability: .92},
			{Key: "competitor_shumensko", Label: "Шуменско", URL: "https://www.shumensko.bg/", Method: "официален сайт • конкурентно сравнение", Reliability: .92},
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
	for k, fresh := range seed.Clients {
		cur := store.Clients[k]
		if cur == nil {
			store.Clients[k] = fresh
			continue
		}
		existing := map[string]bool{}
		for _, src := range cur.Sources {
			existing[src.Key] = true
		}
		for _, src := range fresh.Sources {
			if !existing[src.Key] {
				cur.Sources = append(cur.Sources, src)
			}
		}
		if cur.Name == "" {
			cur.Name = fresh.Name
		}
		if cur.Sector == "" {
			cur.Sector = fresh.Sector
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
	clean := make([]interface{}, 0, len(components))
	for _, c := range components {
		if a, ok := c.([]interface{}); ok && len(a) >= 2 {
			clean = append(clean, []interface{}{a[0], a[1]})
		} else {
			clean = append(clean, c)
		}
	}
	_ = formula // вътрешната формула не се изпраща към клиентския интерфейс/API
	return map[string]interface{}{"key": k, "label": l, "value": r1(v), "description": desc, "components": clean, "sources": sources}
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
	rep := r1(quality*.70 + consistency*.15 + volume*.15)

	exp := f(latest(c, "booking", "cleanliness"))*10*.20 + f(latest(c, "booking", "staff"))*10*.20 +
		f(latest(c, "booking", "comfort"))*10*.15 + f(latest(c, "booking", "facilities"))*10*.15 +
		f(latest(c, "booking", "value_for_money"))*10*.15 + f(latest(c, "booking", "location"))*10*.10 +
		f(latest(c, "booking", "wifi"))*10*.05
	exp = r1(exp)

	digital := f(latest(c, "official_site", "website_active"))*20 +
		f(latest(c, "official_site", "direct_booking"))*20 +
		math.Min(f(latest(c, "official_site", "languages"))/5, 1)*15 +
		f(latest(c, "official_site", "active_offers"))*10 +
		f(latest(c, "official_site", "business_section"))*10 +
		f(latest(c, "official_site", "weddings_section"))*5 +
		f(latest(c, "official_site", "tour_360"))*5 +
		math.Min(f(latest(c, "official_site", "public_platform_profiles"))/3, 1)*15
	digital = r1(digital)

	interest := r1(clamp(50 + 10*math.Log10(math.Max(total, 1))))
	hotelCmp := func(key string) (float64, float64, float64) {
		rr := f(latest(c, key, "rating"))
		rv := f(latest(c, key, "reviews"))
		if rr <= 0 {
			return 0, rr, rv
		}
		return r1(clamp(rr/10*100)*.75 + clamp(20+20*math.Log10(math.Max(rv, 1)))*.25), rr, rv
	}
	competitive, _, _ := hotelCmp("booking")
	ross, rossR, rossV := hotelCmp("cmp_rosslyn_booking")
	intl, intlR, intlV := hotelCmp("cmp_international_booking")
	aqua, aquaR, aquaV := hotelCmp("cmp_aquahouse_booking")
	palace, palaceR, palaceV := hotelCmp("cmp_palace_booking")
	benchmark := r1(meanPositive([]float64{competitive, ross, intl, aqua, palace}))
	relative := 0.0
	if benchmark > 0 {
		relative = r1(competitive / benchmark * 100)
	}
	blis := r1(rep*.30 + exp*.25 + digital*.20 + interest*.10 + competitive*.15)
	return map[string]interface{}{
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": c.Note,
		"blis_index": blis, "benchmark": benchmark, "relative": relative, "confidence": 92.0, "trend": 0.0, "data_updated": latestObservedAt(c),
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
			idx("reputation", "Индекс на репутацията", rep, "Публична оценка на силата и устойчивостта на репутацията.",
				[]interface{}{comp("Качество на рейтинга", r1(quality), "70%"), comp("Последователност между платформите", r1(consistency), "15%"), comp("Обем на оценките", r1(volume), "15%")},
				"Качество × 70% + Последователност × 15% + Обем × 15%", []string{"Google Hotels", "Booking.com", "Tripadvisor"}),
			idx("experience", "Индекс на потребителското изживяване", exp, "Претеглена оценка на ключови характеристики на престоя.",
				[]interface{}{comp("Чистота", 94.0, "20%"), comp("Персонал", 91.0, "20%"), comp("Комфорт", 94.0, "15%"), comp("Удобства", 93.0, "15%"), comp("Цена / качество", 89.0, "15%"), comp("Локация", 96.0, "10%"), comp("Безжичен интернет", 88.0, "5%")},
				"Секторна претеглена оценка на публичните категории в Booking.com.", []string{"Booking.com"}),
			idx("digital", "Индекс на дигиталната видимост", digital, "Оценява видимата дигитална среда, достъпа до информация и директна резервация.",
				[]interface{}{comp("Официален сайт", 100.0, "20%"), comp("Директна резервация", 100.0, "20%"), comp("Езиково покритие", 100.0, "15%"), comp("Активни оферти", 100.0, "10%"), comp("Бизнес / събития", 100.0, "15%"), comp("360° представяне", 100.0, "5%"), comp("Публични хотелски платформи", 100.0, "15%")},
				"Претеглена оценка на публично проверими дигитални активи.", []string{"Официален сайт", "Google Hotels", "Booking.com", "Tripadvisor"}),
			idx("interest", "Индекс на потребителския интерес", interest, "Показва силата на публично наблюдаемото потребителско внимание.",
				[]interface{}{comp("Общ публичен обем на оценки", total, "основен сигнал"), comp("Натрупване на нови оценки", "следващи исторически наблюдения", "динамика")},
				"Пилотна нормализация на публичния обем; динамиката се добавя с историята.", []string{"Google Hotels", "Booking.com", "Tripadvisor"}),
			idx("competitive", "Индекс на конкурентната позиция", competitive, "Сравнява хотелите по еднакво публично измерими оценки и обем на отзивите в Booking.com.",
				[]interface{}{comp("Booking.com оценка", b, ""), comp("Обем Booking.com отзиви", br, "")},
				"Вътрешна сравнителна методика; конкретните тегла не се публикуват.", []string{"Booking.com"}),
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
			map[string]interface{}{"name": "Astor Garden", "score": competitive, "rating": b, "ratings": br, "source": "Booking.com"},
			map[string]interface{}{"name": "Rosslyn Dimyat", "score": ross, "rating": rossR, "ratings": rossV, "source": "Booking.com"},
			map[string]interface{}{"name": "International Hotel Casino", "score": intl, "rating": intlR, "ratings": intlV, "source": "Booking.com"},
			map[string]interface{}{"name": "Ensana Aquahouse", "score": aqua, "rating": aquaR, "ratings": aquaV, "source": "Booking.com"},
			map[string]interface{}{"name": "The Palace", "score": palace, "rating": palaceR, "ratings": palaceV, "source": "Booking.com"},
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
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": "Публичен аналитичен профил • автоматично обновяване",
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
				"Автоматични проверки на публичния сайт; показателят се актуализира при всяко успешно обновяване.", []string{"Aroma.bg"}),
			idx("presence", "Индекс на публичното присъствие", presence, "Измерва текущата публична аудитория, комуникационна активност и новинарска видимост.",
				[]interface{}{comp("LinkedIn профил", linkedinReach, "20%"), comp("LinkedIn аудитория", followers, "35% нормализирана"), comp("Видими публикации за 90 дни", posts, "25%"), comp("Новинарски споменавания за 30 дни", news30, "20%")},
				"Публичен LinkedIn профил + видими публикации + Google News RSS.", []string{"LinkedIn – Aroma Cosmetics AD", "Google"}),
			idx("content", "Индекс на съдържанието", content, "Оценява текущата честота и широчина на публично видимото съдържание.",
				[]interface{}{comp("Видими публикации за 90 дни", posts, "35%"), comp("Публични участия / събития", events, "20%"), comp("Новини / събития в сайта", blogEvents, "20%"), comp("Продуктови категории", cats, "15%"), comp("Новинарска видимост", news30, "10%")},
				"Динамичен индекс от публични съдържателни сигнали.", []string{"LinkedIn – Aroma Cosmetics AD", "Aroma.bg", "Google News"}),
			idx("information", "Индекс на информационната последователност", info, "Проверява дали ключовата фирмена информация е налична в основните публични точки.",
				[]interface{}{comp("История и позициониране", historyVisible, "25%"), comp("Корпоративна информация", corporateReach, "25%"), comp("Браншов профил", industryReach, "15%"), comp("LinkedIn профил", linkedinReach, "15%"), comp("Официален сайт", web, "20%")},
				"Наличност и съгласуваност на публични информационни точки.", []string{"Aroma.bg", "корпоративна информация", "LinkedIn", "Cosmetics Bulgaria"}),
			idx("product", "Индекс на продуктовото представяне", product, "Изчислява доколко продуктите могат да бъдат открити, разбрани и закупени през публичната среда.",
				[]interface{}{comp("Електронна търговия", ecommerce, "20%"), comp("Продуктова информация", prod, "20%"), comp("Видими цени", price, "15%"), comp("Добавяне в количка", cart, "15%"), comp("Категорийно покритие", cats, "15%"), comp("Лоялна програма", loyalty, "10%"), comp("Функция за отзиви", reviews, "5%")},
				"Динамична претеглена оценка на Aroma.bg.", []string{"Aroma.bg"}),
			idx("competitive", "Индекс на конкурентното позициониране", competitive, "Сравнява еднакъв набор от публично наблюдаеми показатели при наличие на достатъчно данни.",
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
			map[string]interface{}{"name": "Aroma", "score": competitive, "website": web, "ecommerce": ecommerce, "pricing": price, "social": boolScore(latest(c, "linkedin", "profile_active")), "categories": f(latest(c, "official_site", "sitemap_collections")), "content": f(latest(c, "official_site", "page_words")), "news": news30},
			map[string]interface{}{"name": "Alteya Organics", "score": f(latest(c, "competitor_alteya", "score")), "website": boolScore(latest(c, "competitor_alteya", "website_active")), "ecommerce": boolScore(latest(c, "competitor_alteya", "ecommerce_signal")), "pricing": boolScore(latest(c, "competitor_alteya", "pricing_signal")), "social": boolScore(latest(c, "competitor_alteya", "social_links")), "categories": f(latest(c, "competitor_alteya", "category_signal_count")), "content": f(latest(c, "competitor_alteya", "page_words")), "news": f(latest(c, "competitor_alteya", "news_mentions_30d"))},
			map[string]interface{}{"name": "Biofresh", "score": f(latest(c, "competitor_biofresh", "score")), "website": boolScore(latest(c, "competitor_biofresh", "website_active")), "ecommerce": boolScore(latest(c, "competitor_biofresh", "ecommerce_signal")), "pricing": boolScore(latest(c, "competitor_biofresh", "pricing_signal")), "social": boolScore(latest(c, "competitor_biofresh", "social_links")), "categories": f(latest(c, "competitor_biofresh", "category_signal_count")), "content": f(latest(c, "competitor_biofresh", "page_words")), "news": f(latest(c, "competitor_biofresh", "news_mentions_30d"))},
			map[string]interface{}{"name": "Agiva", "score": f(latest(c, "competitor_agiva", "score")), "website": boolScore(latest(c, "competitor_agiva", "website_active")), "ecommerce": boolScore(latest(c, "competitor_agiva", "ecommerce_signal")), "pricing": boolScore(latest(c, "competitor_agiva", "pricing_signal")), "social": boolScore(latest(c, "competitor_agiva", "social_links")), "categories": f(latest(c, "competitor_agiva", "category_signal_count")), "content": f(latest(c, "competitor_agiva", "page_words")), "news": f(latest(c, "competitor_agiva", "news_mentions_30d"))},
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
	// Еднаква конкурентна рамка: официален сайт, новинарска видимост и сравнима продуктова репутация.
	competitive, ownCmp := competitorBeerScore(c, "official_site", "untappd_bolyarka_flagship", "google_news")
	blis := 0.0
	if competitive > 0 {
		blis = r1(public*.25 + content*.20 + digital*.20 + reputation*.20 + competitive*.15)
	} else {
		// Не наказваме общия индекс с фиктивна нула, когато сравнителното измерване още липсва.
		blis = r1((public*.25 + content*.20 + digital*.20 + reputation*.20) / .85)
	}
	kam, kamCmp := competitorBeerScore(c, "competitor_kamenitza", "untappd_kamenitza", "news_kamenitza")
	zag, zagCmp := competitorBeerScore(c, "competitor_zagorka", "untappd_zagorka", "news_zagorka")
	shu, shuCmp := competitorBeerScore(c, "competitor_shumensko", "untappd_shumensko", "news_shumensko")
	benchmark := 0.0
	comparisonCount := 0
	for _, x := range []float64{competitive, kam, zag, shu} {
		if x > 0 {
			comparisonCount++
		}
	}
	if comparisonCount >= 2 {
		benchmark = r1(meanPositive([]float64{competitive, kam, zag, shu}))
	}
	relative := 0.0
	if benchmark > 0 {
		relative = r1(competitive / benchmark * 100)
	}
	confidence := r1(mean([]float64{98, 96, 88, 86, 90}))
	trend := 0.0
	if len(c.Snapshots) > 0 {
		prev := f(c.Snapshots[len(c.Snapshots)-1].Payload["blis_index"])
		if prev > 0 {
			trend = r1(blis - prev)
		}
	}
	return map[string]interface{}{
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": "Публичен аналитичен профил • автоматично обновяване",
		"blis_index": blis, "benchmark": benchmark, "relative": relative, "confidence": confidence, "trend": trend, "data_updated": latestObservedAt(c), "engine": engineSnapshot(),
		"indices": []interface{}{
			idx("presence", "Индекс на публичното присъствие", public, "Медийна, търсена, социална и публична видимост.", []interface{}{comp("Официални сайтове", mean([]float64{web, brandWeb}), "30%"), comp("LinkedIn", linkedin, "15%"), comp("Untappd", untappd, "15%"), comp("Новини 30 дни", news30, "20%"), comp("Портфолио", portfolio, "20%")}, "Публични сигнали, нормализирани 0–100.", []string{"Пивоварна Болярка", "Boliarka.bg", "LinkedIn", "Untappd", "Google News"}),
			idx("content", "Индекс на съдържанието", content, "Оценява продуктово, корпоративно и новинарско съдържание.", []interface{}{comp("Новини", boolScore(latest(c, "official_site", "news_section")), "25%"), comp("Портфолио", portfolio, "35%"), comp("История", heritage, "15%"), comp("Бранд сайт", brandWeb, "15%"), comp("LinkedIn", linkedin, "10%")}, "Претеглена оценка на публичните съдържателни сигнали.", []string{"Пивоварна Болярка", "Boliarka.bg", "LinkedIn"}),
			idx("digital", "Индекс на дигиталната среда", digital, "Оценява достъпността и свързаността на основните публични дигитални активи.", []interface{}{comp("Корпоративен сайт", web, "35%"), comp("Бранд сайт", brandWeb, "25%"), comp("LinkedIn", linkedin, "20%"), comp("Untappd", untappd, "20%")}, "Достъпност на активите и публичните профили.", []string{"Пивоварна Болярка", "Boliarka.bg", "LinkedIn", "Untappd"}),
			idx("reputation", "Индекс на репутацията", reputation, "Публична продуктова репутация и обем на потребителски сигнали.", []interface{}{comp("Untappd рейтинг", rating, "55%"), comp("Обем на публичните оценки", ratings, "45%")}, "Нормализиран рейтинг + логаритмично нормализиран обем.", []string{"Untappd"}),
			idx("competitive", "Индекс на конкурентната позиция", competitive, "Сравнява марките по еднакъв набор публично измерими сигнали: официален сайт, новинарска видимост и продуктова репутация в Untappd.", []interface{}{comp("Официален дигитален актив", ownCmp["website"], ""), comp("Новинарска видимост", ownCmp["news"], ""), comp("Средна продуктова оценка", ownCmp["rating"], ""), comp("Обем потребителски оценки", ownCmp["ratings"], ""), comp("Текуща потребителска активност", ownCmp["activity"], "")}, "Вътрешна сравнителна методика; конкретните тегла не се публикуват.", []string{"Официални сайтове", "Google News", "Untappd"}),
		},
		"metrics": []interface{}{met("Новинарски споменавания", fmt.Sprintf("%.0f / 30 дни • %.0f източника", news30, newsSources)), met("Untappd – Болярка Светло", fmt.Sprintf("%.2f/5 • %.0f оценки", rating, ratings)), met("Продуктово портфолио", fmt.Sprintf("%.0f публично видими продукта", f(latest(c, "official_site", "portfolio_items")))), met("История", fmt.Sprintf("%.0f години пивоварна традиция", f(latest(c, "official_site", "heritage_years"))))},
		"signals": []interface{}{sig("positive", "Силен собствен дигитален актив", "Официалните сайтове са активни и продуктово ориентирани."), sig("positive", "Публични потребителски оценки в Untappd", fmt.Sprintf("%.0f публични оценки за Болярка Светло", ratings)), sig("watch", "Следи новинарската динамика", fmt.Sprintf("%.0f споменавания през последните 30 дни", news30))},
		"competitors": []interface{}{
			map[string]interface{}{"name": "Болярка", "score": competitive, "website": ownCmp["website"], "news": ownCmp["news"], "rating": ownCmp["rating"], "ratings": ownCmp["ratings"], "activity": ownCmp["activity"]},
			map[string]interface{}{"name": "Каменица", "score": kam, "website": kamCmp["website"], "news": kamCmp["news"], "rating": kamCmp["rating"], "ratings": kamCmp["ratings"], "activity": kamCmp["activity"]},
			map[string]interface{}{"name": "Загорка", "score": zag, "website": zagCmp["website"], "news": zagCmp["news"], "rating": zagCmp["rating"], "ratings": zagCmp["ratings"], "activity": zagCmp["activity"]},
			map[string]interface{}{"name": "Шуменско", "score": shu, "website": shuCmp["website"], "news": shuCmp["news"], "rating": shuCmp["rating"], "ratings": shuCmp["ratings"], "activity": shuCmp["activity"]},
		},
	}
}

func buildAromaSignals(followers, posts, news30, web, ecommerce float64) []interface{} {
	out := []interface{}{}
	if web > 0 && ecommerce > 0 {
		out = append(out, sig("positive", "Официалният сайт и електронният магазин са достъпни", "Проверено автоматично от BLIS."))
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
		out = append(out, sig("watch", "Системата събира нови публични наблюдения", "Следващото автоматично обновяване ще добави ново историческо наблюдение."))
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
	setEngineStatus(EngineStatus{Version: "2.9-portal-finalqa", Running: true, LastRun: engineSnapshot().LastRun, NextRun: started.Add(24 * time.Hour).Format(time.RFC3339)})
	results := []ConnectorResult{probeOfficialAroma(c), probeLinkedInAroma(c), probeNewsAroma(c), probeContentPage(c, "corporate", []string{"aroma", "арома", "contact", "контакт", "history", "история", "product", "продукт"}), probeContentPage(c, "cosmetics_bg", []string{"aroma", "арома", "cosmetics", "product", "brand"})}
	keys := []string{"nsi", "registry", "bpo", "kzp", "bda", "euipo", "wipo", "eurostat", "cosmetics_europe", "cosing", "ec_cosmetics", "facebook_official", "instagram_official", "youtube_official", "google_trends", "google_ads", "meta_ads"}
	ch := make(chan ConnectorResult, len(keys)+5+len(aromaCompetitors))
	for _, key := range keys {
		go func(k string) { ch <- probeReference(c, k) }(key)
	}
	for _, key := range []string{"douglas", "lilly", "dm", "makeup", "notino"} {
		go func(k string) { ch <- probeRetailerAroma(c, k) }(key)
	}
	for _, sp := range aromaCompetitors {
		go func(x competitorSpec) { ch <- probeCompetitor(c, x) }(sp)
	}
	for i := 0; i < len(keys)+5+len(aromaCompetitors); i++ {
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
	st := EngineStatus{Version: "2.9-portal-finalqa", Running: false, LastRun: nowISO(), NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339), Successful: successful, Failed: failed, Results: results}
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
func probeUntappdComparable(c *Client, key string) ConnectorResult {
	src := sourceByKey(c, key)
	stamp := nowISO()
	res := ConnectorResult{SourceKey: key, ObservedAt: stamp, Metrics: map[string]interface{}{}}
	if src == nil {
		res.Error = "source not configured"
		return res
	}
	res.Label = src.Label
	status, body, ms, err := timedFetch(src.URL, 3<<20)
	res.Status = status
	if err != nil {
		res.Error = err.Error()
		return res
	}
	res.OK = status >= 200 && status < 400
	text := strings.ReplaceAll(stripHTML(body), "\u00a0", " ")
	rating, ratings, monthly := 0.0, 0.0, 0.0
	if m := regexp.MustCompile(`\(([0-5](?:\.[0-9]{1,2})?)\)\s*([0-9][0-9,\.]*)\s+Ratings`).FindStringSubmatch(text); len(m) >= 4 {
		rating, _ = strconv.ParseFloat(m[1], 64)
		ratings, _ = strconv.ParseFloat(strings.ReplaceAll(strings.ReplaceAll(m[3], ",", ""), ".", ""), 64)
	}
	if m := regexp.MustCompile(`Monthly\s*\(\?\)\s*([0-9][0-9,\.]*)`).FindStringSubmatch(text); len(m) >= 2 {
		monthly, _ = strconv.ParseFloat(strings.ReplaceAll(strings.ReplaceAll(m[1], ",", ""), ".", ""), 64)
	}
	m := map[string]interface{}{"reachable": boolNum(res.OK), "rating": rating, "ratings": ratings, "monthly_activity": monthly, "response_ms": float64(ms)}
	for k, v := range m {
		add(c, key, k, v, stamp)
	}
	res.Metrics = m
	return res
}
func probeBolyarkaNews(c *Client) ConnectorResult {
	return probeNewsQuery(c, "google_news", "Google News – Болярка", "Болярка OR Boliarka OR Bolyarka")
}
func competitorBeerScore(c *Client, siteKey, beerKey, newsKey string) (float64, map[string]float64) {
	webRaw := f(latest(c, siteKey, "reachable"))
	if webRaw == 0 {
		webRaw = f(latest(c, siteKey, "website_active"))
	}
	web := boolScore(webRaw)
	wordsRaw := f(latest(c, siteKey, "page_words"))
	words := clamp(wordsRaw / 2500 * 100)
	termsRaw := f(latest(c, siteKey, "term_signal_count"))
	terms := clamp(termsRaw / 12 * 100)
	newsRaw := f(latest(c, newsKey, "news_mentions_30d"))
	news := clamp(newsRaw / 15 * 100)
	ratingRaw := f(latest(c, beerKey, "rating"))
	rating := clamp(ratingRaw / 5 * 100)
	ratingsRaw := f(latest(c, beerKey, "ratings"))
	volume := 0.0
	if ratingsRaw > 0 {
		volume = clamp(20 + 20*math.Log10(ratingsRaw))
	}
	activityRaw := f(latest(c, beerKey, "monthly_activity"))
	activity := clamp(activityRaw / 700 * 100)
	evidence := 0
	for _, v := range []float64{webRaw, wordsRaw, termsRaw, newsRaw, ratingRaw, ratingsRaw, activityRaw} {
		if v > 0 {
			evidence++
		}
	}
	score := 0.0
	if evidence >= 2 {
		score = r1(web*.12 + words*.08 + terms*.08 + news*.22 + rating*.25 + volume*.15 + activity*.10)
	}
	return score, map[string]float64{"website": web, "content": wordsRaw, "brand_signals": termsRaw, "news": newsRaw, "rating": ratingRaw, "ratings": ratingsRaw, "activity": activityRaw, "evidence": float64(evidence)}
}
func runBolyarkaEngine(c *Client, createSnapshot bool) EngineStatus {
	setEngineStatus(EngineStatus{Version: "2.9-portal-finalqa", Running: true, LastRun: engineSnapshot().LastRun, NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339)})
	genericKeys := []string{"official_site", "brand_site", "linkedin", "untappd", "untappd_beers", "registry", "nsi", "brewers_bg", "world_beer_awards", "facebook", "instagram", "youtube", "beeradvocate", "pintplease", "beertasting", "google_trends", "meta_ads", "kaufland", "billa", "metro", "competitor_kamenitza", "competitor_zagorka", "competitor_shumensko"}
	beerKeys := []string{"untappd_bolyarka_flagship", "untappd_kamenitza", "untappd_zagorka", "untappd_shumensko"}
	results := []ConnectorResult{}
	jobs := len(genericKeys) + len(beerKeys) + 4
	ch := make(chan ConnectorResult, jobs)
	for _, k := range genericKeys {
		go func(key string) {
			ch <- probeGenericSource(c, key, []string{"болярка", "boliarka", "bolyarka", "beer", "бира", "product", "продукт"})
		}(k)
	}
	for _, k := range beerKeys {
		go func(key string) { ch <- probeUntappdComparable(c, key) }(k)
	}
	go func() { ch <- probeBolyarkaNews(c) }()
	go func() {
		ch <- probeNewsQuery(c, "news_kamenitza", "Google News – Каменица", "Каменица OR Kamenitza")
	}()
	go func() {
		ch <- probeNewsQuery(c, "news_zagorka", "Google News – Загорка", "Загорка OR Zagorka")
	}()
	go func() {
		ch <- probeNewsQuery(c, "news_shumensko", "Google News – Шуменско", "Шуменско OR Shumensko")
	}()
	for i := 0; i < jobs; i++ {
		results = append(results, <-ch)
	}
	if v := f(latest(c, "untappd_bolyarka_flagship", "rating")); v > 0 {
		add(c, "untappd_beers", "bolyarka_svetlo_rating", v, nowISO())
	}
	if v := f(latest(c, "untappd_bolyarka_flagship", "ratings")); v > 0 {
		add(c, "untappd_beers", "bolyarka_svetlo_ratings", v, nowISO())
	}
	if r := sourceByKey(c, "official_site"); r != nil {
		_, body, _, err := timedFetch(r.URL, 2<<20)
		if err == nil {
			t := strings.ToLower(stripHTML(body))
			add(c, "official_site", "portfolio_items", float64(countAny(t, "болярка светло", "болярка тъмно", "непастьоризирано", "радлер", "жива бира", "балканско", "fort", "диана", "хелиос")), nowISO())
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
	st := EngineStatus{Version: "2.9-portal-finalqa", Running: false, LastRun: nowISO(), NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339), Successful: suc, Failed: fail, Results: results}
	setEngineStatus(st)
	return st
}

func probeBookingComparable(c *Client, key string) ConnectorResult {
	src := sourceByKey(c, key)
	stamp := nowISO()
	res := ConnectorResult{SourceKey: key, ObservedAt: stamp, Metrics: map[string]interface{}{}}
	if src == nil {
		res.Error = "source not configured"
		return res
	}
	res.Label = src.Label
	status, body, ms, err := timedFetch(src.URL, 3<<20)
	res.Status = status
	if err != nil {
		res.Error = err.Error()
		return res
	}
	res.OK = status >= 200 && status < 400
	text := stripHTML(body)
	rating, reviews := 0.0, 0.0
	for _, pat := range []string{`Scored\s*([0-9]+(?:\.[0-9]+)?)`, `Rating\s*([0-9]+(?:\.[0-9]+)?)/10`, `([0-9]+(?:\.[0-9]+)?)\s*Rated`} {
		if m := regexp.MustCompile(pat).FindStringSubmatch(text); len(m) > 1 {
			rating, _ = strconv.ParseFloat(m[1], 64)
			if rating > 0 {
				break
			}
		}
	}
	if m := regexp.MustCompile(`([0-9][0-9,\.]*)\s+reviews`).FindStringSubmatch(strings.ToLower(text)); len(m) > 1 {
		reviews, _ = strconv.ParseFloat(strings.ReplaceAll(strings.ReplaceAll(m[1], ",", ""), ".", ""), 64)
	}
	m := map[string]interface{}{"reachable": boolNum(res.OK), "rating": rating, "reviews": reviews, "response_ms": float64(ms)}
	for k, v := range m {
		add(c, key, k, v, stamp)
	}
	res.Metrics = m
	return res
}

func runAstorEngine(c *Client, createSnapshot bool) EngineStatus {
	setEngineStatus(EngineStatus{Version: "2.9-portal-finalqa", Running: true, LastRun: engineSnapshot().LastRun, NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339)})
	results := []ConnectorResult{}
	generic := []string{"official_site", "google_hotels", "tripadvisor", "facebook", "instagram", "youtube", "expedia", "hotels", "trivago", "holidaycheck", "trip_com", "skyscanner"}
	bookingKeys := []string{"booking", "cmp_rosslyn_booking", "cmp_international_booking", "cmp_aquahouse_booking", "cmp_palace_booking"}
	jobs := len(generic) + len(bookingKeys) + 1
	ch := make(chan ConnectorResult, jobs)
	for _, k := range generic {
		go func(key string) {
			ch <- probeGenericSource(c, key, []string{"astor garden", "астор гардън", "hotel", "review", "rating", "spa", "varna"})
		}(k)
	}
	for _, k := range bookingKeys {
		go func(key string) { ch <- probeBookingComparable(c, key) }(k)
	}
	go func() {
		ch <- probeNewsQuery(c, "google_news", "Google News – Astor Garden", "\"Astor Garden\" hotel")
	}()
	for i := 0; i < jobs; i++ {
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
	st := EngineStatus{Version: "2.9-portal-finalqa", Running: false, LastRun: nowISO(), NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339), Successful: suc, Failed: fail, Results: results}
	setEngineStatus(st)
	return st
}

func runClientEngine(c *Client, snapshot bool) EngineStatus {
	if c == nil {
		return EngineStatus{Version: "2.9-portal-finalqa"}
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
	add := func(title, explanation, display, source, status, kind string, numeric interface{}) {
		out = append(out, map[string]interface{}{
			"title": title, "explanation": explanation, "display": display, "source": source,
			"status": status, "kind": kind, "value": numeric, "measured": true,
		})
	}
	if c.Slug == "bolyarka" {
		news := f(latest(c, "google_news", "news_mentions_30d"))
		if news > 0 {
			add("Нови медийни споменавания", "Публикации, открити за марката през последните 30 дни.", fmt.Sprintf("%.0f публикации", news), "Google News", "Има нови резултати", "media", news)
		} else {
			add("Нови медийни споменавания", "Публикации, открити за марката през последните 30 дни.", "Няма нови резултати", "Google News", "Без нови публикации", "media", 0)
		}
		prod := f(latest(c, "official_site", "term_signal_count"))
		if prod > 0 {
			add("Промени в продуктовото съдържание", "Нови или променени продуктови сигнали на официалния сайт.", fmt.Sprintf("%.0f промени", prod), "Пивоварна Болярка", "Открита промяна", "content", prod)
		} else {
			add("Промени в продуктовото съдържание", "Нови или променени продуктови сигнали на официалния сайт.", "Не е отчетена промяна", "Пивоварна Болярка", "Без промяна", "content", 0)
		}
		ratings := f(latest(c, "untappd_beers", "bolyarka_svetlo_ratings"))
		rating := f(latest(c, "untappd_beers", "bolyarka_svetlo_rating"))
		if ratings > 0 {
			add("Публични оценки за „Болярка Светло“", "Брой видими потребителски оценки в публичната продуктова страница.", fmt.Sprintf("%.0f оценки", ratings), "Untappd", "Налични данни", "reputation", ratings)
		}
		if rating > 0 {
			add("Средна потребителска оценка", "Текущата публично видима средна оценка за „Болярка Светло“.", fmt.Sprintf("%.2f от 5", rating), "Untappd", "Налични данни", "reputation", rating)
		}
	} else if c.Slug == "astor-garden" {
		news := f(latest(c, "google_news", "news_mentions_30d"))
		if news > 0 {
			add("Нови медийни споменавания", "Публикации за хотела през последните 30 дни.", fmt.Sprintf("%.0f публикации", news), "Google News", "Има нови резултати", "media", news)
		} else {
			add("Нови медийни споменавания", "Публикации за хотела през последните 30 дни.", "Няма нови резултати", "Google News", "Без нови публикации", "media", 0)
		}
		reviews := f(latest(c, "tripadvisor", "review_count")) + f(latest(c, "booking", "review_count")) + f(latest(c, "google_hotels", "review_count"))
		if reviews > 0 {
			add("Публични отзиви", "Общ брой видими отзиви в наблюдаваните туристически платформи.", fmt.Sprintf("%.0f отзива", reviews), "Google Hotels, Booking.com, Tripadvisor", "Налични данни", "reputation", reviews)
		}
	} else {
		news := f(latest(c, "google_search", "news_mentions_30d"))
		if news > 0 {
			add("Нови медийни споменавания", "Публикации за Aroma през последните 30 дни.", fmt.Sprintf("%.0f публикации", news), "Google News", "Има нови резултати", "media", news)
		} else {
			add("Нови медийни споменавания", "Публикации за Aroma през последните 30 дни.", "Няма нови резултати", "Google News", "Без нови публикации", "media", 0)
		}
		cats := f(latest(c, "official_site", "category_count")) + f(latest(c, "official_site", "sitemap_collections"))
		if cats > 0 {
			add("Публично продуктово покритие", "Брой открити продуктови категории и колекции на официалния сайт.", fmt.Sprintf("%.0f категории/колекции", cats), "Aroma.bg", "Налични данни", "content", cats)
		}
		posts := f(latest(c, "linkedin", "visible_posts_90d"))
		if posts > 0 {
			add("Видима комуникационна активност", "Публично видими публикации в наблюдавания фирмен профил за 90 дни.", fmt.Sprintf("%.0f публикации", posts), "LinkedIn", "Налични данни", "content", posts)
		} else {
			add("Видима комуникационна активност", "Публично видими публикации в наблюдавания фирмен профил за 90 дни.", "Няма измерени публикации", "LinkedIn", "Ограничени данни", "content", 0)
		}
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
	exportMu.Lock()
	defer exportMu.Unlock()
	recs := exportHistory[c.Slug]
	out := []map[string]interface{}{}
	for i := len(recs) - 1; i >= 0; i-- {
		r := recs[i]
		out = append(out, map[string]interface{}{"id": r.ID, "title": r.Title, "format": r.Format, "created_at": r.CreatedAt})
	}
	return out
}
func recordExport(c *Client, typ, format string) {
	titles := map[string]string{"keywords": "Теми и сигнали", "signals": "Сигнали за периода", "competitive": "Конкурентно сравнение", "benchmark": "Конкурентно сравнение", "summary": "Месечно обобщение", "digital": "Дигитално и съдържателно присъствие", "reputation": "Репутация и информационна среда"}
	t := titles[typ]
	if t == "" {
		t = "Аналитичен експорт"
	}
	exportMu.Lock()
	defer exportMu.Unlock()
	exportHistory[c.Slug] = append(exportHistory[c.Slug], ExportRecord{ID: typ, Title: t, Format: strings.ToUpper(format), CreatedAt: nowISO()})
	if len(exportHistory[c.Slug]) > 30 {
		exportHistory[c.Slug] = exportHistory[c.Slug][len(exportHistory[c.Slug])-30:]
	}
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
	recordExport(c, typ, format)
	d := dashboard(c)
	ts := time.Now().Format("2006-01-02")
	filename := c.Slug + "_" + typ + "_" + ts
	if format == "csv" {
		w.Header().Set("Content-Type", "text/csv; charset=utf-8")
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename+".csv"))
		if typ == "keywords" {
			io.WriteString(w, "Сигнал,Резултат,Статус,Източник,Обяснение\n")
			for _, x := range keywordAnalysis(c) {
				io.WriteString(w, safeCSV(fmt.Sprint(x["title"]))+","+safeCSV(fmt.Sprint(x["display"]))+","+safeCSV(fmt.Sprint(x["status"]))+","+safeCSV(fmt.Sprint(x["source"]))+","+safeCSV(fmt.Sprint(x["explanation"]))+"\n")
			}
			return
		}
		if typ == "competitive" || typ == "benchmark" {
			io.WriteString(w, "Марка,BLIS индекс,Статус\n")
			if comps, ok := d["competitors"].([]interface{}); ok {
				for _, raw := range comps {
					if m, ok := raw.(map[string]interface{}); ok {
						score := f(m["score"])
						status := "Няма достатъчно данни"
						display := ""
						if score > 0 {
							status = "Измерено"
							display = fmt.Sprintf("%.1f", score)
						}
						io.WriteString(w, safeCSV(fmt.Sprint(m["name"]))+","+safeCSV(display)+","+safeCSV(status)+"\n")
					}
				}
			}
			return
		}
		io.WriteString(w, "Показател,Стойност\n")
		labels := []struct{ K, L string }{{"blis_index", "Общ индекс BLIS"}, {"benchmark", "Сравнителен ориентир"}, {"confidence", "Надеждност на данните"}, {"trend", "Промяна спрямо предходния период"}}
		for _, x := range labels {
			io.WriteString(w, safeCSV(x.L)+","+safeCSV(fmt.Sprint(d[x.K]))+"\n")
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
		title = "BLIS месечно обобщение – " + c.Name
		body = fmt.Sprintf("<p>BLIS индекс: <b>%v</b></p><p>Надеждност на данните: <b>%v%%</b></p>", d["blis_index"], d["confidence"])
	}
	if format == "html" {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename+".html"))
		io.WriteString(w, "<!doctype html><meta charset=utf-8><title>"+title+"</title><style>body{font-family:Arial;max-width:900px;margin:40px;color:#0e2a5a}h1{font-size:30px}</style><h1>"+title+"</h1>"+body)
		return
	}
	pdf := simplePDF(title, fmt.Sprintf("BLIS индекс: %v | Надеждност: %v%% | Генерирано: %s", d["blis_index"], d["confidence"], ts))
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

func saveInquiry(in Inquiry) error {
	dir := appDataDir()
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	p := filepath.Join(dir, "inquiries.json")
	items := []Inquiry{}
	if b, err := os.ReadFile(p); err == nil {
		_ = json.Unmarshal(b, &items)
	}
	items = append(items, in)
	b, err := json.MarshalIndent(items, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p, b, 0644)
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
	if path == "api/inquiries" {
		if r.Method != "POST" {
			http.Error(w, "method", http.StatusMethodNotAllowed)
			return
		}
		var in Inquiry
		if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&in); err != nil {
			jsonOut(w, map[string]interface{}{"error": "Невалидна заявка"})
			return
		}
		in.Name = strings.TrimSpace(in.Name)
		in.Company = strings.TrimSpace(in.Company)
		in.Email = strings.TrimSpace(in.Email)
		in.Phone = strings.TrimSpace(in.Phone)
		in.Message = strings.TrimSpace(in.Message)
		in.Type = strings.TrimSpace(in.Type)
		if in.Name == "" || in.Email == "" || !strings.Contains(in.Email, "@") {
			w.WriteHeader(http.StatusBadRequest)
			jsonOut(w, map[string]interface{}{"error": "Име и валиден имейл са задължителни"})
			return
		}
		if in.Type == "" {
			in.Type = "contact"
		}
		in.ID = fmt.Sprintf("BLIS-%s-%04d", time.Now().Format("20060102"), time.Now().UnixNano()%10000)
		in.CreatedAt = nowISO()
		if err := saveInquiry(in); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			jsonOut(w, map[string]interface{}{"error": "Заявката не можа да бъде записана"})
			return
		}
		jsonOut(w, map[string]interface{}{"ok": true, "id": in.ID, "created_at": in.CreatedAt})
		return
	}
	if !strings.Contains(path, "..") && (strings.HasSuffix(path, ".html") || strings.HasSuffix(path, ".css") || strings.HasSuffix(path, ".js") || strings.HasSuffix(path, ".jpg") || strings.HasSuffix(path, ".jpeg") || strings.HasSuffix(path, ".png") || strings.HasSuffix(path, ".svg") || strings.HasSuffix(path, ".webp")) {
		b, err := staticFS.ReadFile("static/" + path)
		if err == nil {
			ct := http.DetectContentType(b)
			switch {
			case strings.HasSuffix(path, ".css"):
				ct = "text/css; charset=utf-8"
			case strings.HasSuffix(path, ".js"):
				ct = "application/javascript; charset=utf-8"
			case strings.HasSuffix(path, ".html"):
				ct = "text/html; charset=utf-8"
			}
			w.Header().Set("Content-Type", ct)
			if strings.HasSuffix(path, ".js") || strings.HasSuffix(path, ".css") || strings.HasSuffix(path, ".html") {
				w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
			}
			w.Write(b)
			return
		}
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
	setEngineStatus(EngineStatus{Version: "2.9-portal-finalqa", NextRun: time.Now().Add(24 * time.Hour).Format(time.RFC3339)})
	startEngineScheduler()
	port := os.Getenv("PORT")
	if port == "" {
		port = "10000"
	}
	addr := "0.0.0.0:" + port
	log.Printf("BLIS Navigator Engine v2 Multi-client listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, http.HandlerFunc(handler)))
}
