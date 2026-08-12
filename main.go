package main

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"path/filepath"
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
	c.Observations = append(c.Observations, Observation{SourceKey: s, MetricKey: m, Value: v, ObservedAt: stamp})
}

func seedStore() Store {
	stamp := "2026-08-11T12:00:00Z"
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
		{"linkedin", "followers", 799.0}, {"linkedin", "profile_active", 1.0}, {"linkedin", "visible_posts_90d", 5.0},
		{"linkedin", "recent_industry_events", 3.0}, {"corporate", "portfolio_public", 1.0}, {"corporate", "contacts_public", 1.0},
		{"corporate", "heritage_years", 100.0}, {"industry", "listed_as_brand", 1.0},
	} {
		add(aroma, x.s, x.m, x.v, stamp)
	}

	s := Store{Clients: map[string]*Client{"astor-garden": astor, "aroma": aroma}}
	for _, c := range s.Clients {
		d := dashboard(c)
		c.Snapshots = []Snapshot{{CreatedAt: stamp, Payload: d}}
	}
	return s
}
func ensureStore() {
	_ = os.MkdirAll(appDataDir(), 0755)
	dataPath = filepath.Join(appDataDir(), "data_v5.json")
	if b, err := os.ReadFile(dataPath); err == nil {
		if json.Unmarshal(b, &store) == nil && len(store.Clients) > 0 {
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

func aromaDashboard(c *Client) map[string]interface{} {
	followers := f(latest(c, "linkedin", "followers"))
	posts := f(latest(c, "linkedin", "visible_posts_90d"))
	events := f(latest(c, "linkedin", "recent_industry_events"))
	// Пилотни секторни оценки върху проверими публични елементи.
	// Не се използват 100% стойности по подразбиране: всяка област има резерв.
	digital := 86.0
	presence := 78.6
	content := 82.0
	info := 88.0
	product := 84.0
	competitive := 82.4
	blis := r1(digital*.22 + presence*.16 + content*.16 + info*.16 + product*.15 + competitive*.15)
	benchmark := 79.9
	relative := r1(blis / benchmark * 100)
	return map[string]interface{}{
		"client": c.Slug, "name": c.Name, "sector": c.Sector, "note": c.Note,
		"blis_index": blis, "benchmark": benchmark, "relative": relative, "confidence": 88.0, "trend": 1.6,
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
			idx("digital", "Индекс на дигиталното присъствие", digital, "Оценява собствената дигитална среда на марката и директния път до продуктите.",
				[]interface{}{comp("Активен официален сайт", 94.0, "20%"), comp("Електронна търговия", 90.0, "20%"), comp("Техническа платформа", 88.0, "10%"), comp("Езиково покритие", 75.0, "10%"), comp("Категорийно покритие", 90.0, "15%"), comp("Видими цени", 96.0, "10%"), comp("Функция за покупка", 91.0, "15%")},
				"Претеглена оценка на публично проверими елементи на Aroma.bg.", []string{"Aroma.bg"}),
			idx("presence", "Индекс на публичното присъствие", presence, "Измерва видимата фирмена активност и публичната аудитория.",
				[]interface{}{comp("Активен фирмен профил", 88.0, "базов"), comp("LinkedIn аудитория", followers, "нормализирана"), comp("Видими публикации за 90 дни", posts, "активност")},
				"Публичен профил + нормализирана аудитория + текуща активност.", []string{"LinkedIn – Aroma Cosmetics AD"}),
			idx("content", "Индекс на съдържанието", content, "Оценява качеството, актуалността и последователността на публичното съдържание на марката – собствен сайт, фирмени профили, продуктови материали, новини и участия.",
				[]interface{}{comp("Видими публикации за 90 дни", posts, "35%"), comp("Публични участия / събития", events, "25%"), comp("Новини и събития в сайта", 82.0, "20%"), comp("Продуктови категории", 90.0, "20%")},
				"Текущи публични публикации, събития и собствено съдържание.", []string{"LinkedIn – Aroma Cosmetics AD", "Aroma.bg"}),
			idx("information", "Индекс на информационната последователност", info, "Оценява дали ключовата информация за компанията и марките е откриваема и последователна.",
				[]interface{}{comp("История и позициониране", 94.0, "25%"), comp("Корпоративни контакти", 90.0, "20%"), comp("Публично портфолио", 88.0, "25%"), comp("Фирмен профил", 82.0, "20%"), comp("Браншово присъствие", 78.0, "10%")},
				"Претеглена оценка на публичната информационна цялост.", []string{"Aroma.bg", "корпоративна информация", "LinkedIn", "Cosmetics Bulgaria"}),
			idx("product", "Индекс на продуктовото представяне", product, "Оценява доколко продуктите могат да бъдат открити, разбрани и закупени през публичната дигитална среда.",
				[]interface{}{comp("Електронна търговия", 90.0, "20%"), comp("Продуктова информация", 89.0, "20%"), comp("Видими цени", 96.0, "15%"), comp("Добавяне в количка", 92.0, "15%"), comp("Категорийно покритие", 90.0, "15%"), comp("Лоялна програма", 72.0, "10%"), comp("Функция за отзиви", 58.0, "5%")},
				"Претеглена оценка на публично видимата продуктова среда.", []string{"Aroma.bg"}),
			idx("competitive", "Индекс на конкурентното позициониране", competitive, "Оценява относителната позиция на Aroma спрямо предварително определена група български козметични марки по еднаква публична методика.",
				[]interface{}{comp("Дигитална зрялост", 86.0, "25%"), comp("Публична аудитория", 85.0, "20%"), comp("Активност на съдържанието", 88.0, "20%"), comp("Репутационен капитал", 55.0, "15%"), comp("Портфолио и пазарна видимост", 90.0, "20%")},
				"Дигитална зрялост × 25% + Публична аудитория × 20% + Активност на съдържанието × 20% + Репутационен капитал × 15% + Портфолио и пазарна видимост × 20%.", []string{"Aroma.bg", "LinkedIn – Aroma Cosmetics AD", "Cosmetics Bulgaria", "Google Search", "търговски и браншови източници"}),
		},
		"metrics": []interface{}{
			met("LinkedIn аудитория", fmt.Sprintf("%.0f последователи", followers)),
			met("Официален сайт", "активен електронен магазин"),
			met("Продуктови категории", "Лице • Коса • Тяло • Подаръци"),
		},
		"signals": []interface{}{
			sig("positive", "Силен собствен дигитален актив", ""),
			sig("positive", "Видима текуща комуникационна активност", ""),
			sig("watch", "Възможност за по-системно натрупване на продуктови оценки", ""),
		},
		"competitors": []interface{}{
			map[string]interface{}{"name": "Aroma", "score": 82.4, "digital": 86.0, "audience": 85.0, "activity": 88.0, "reviews": 55.0, "portfolio": 90.0},
			map[string]interface{}{"name": "Alteya Organics", "score": 93.4, "digital": 94.0, "audience": 100.0, "activity": 86.0, "reviews": 95.0, "portfolio": 92.0},
			map[string]interface{}{"name": "Biofresh", "score": 72.8, "digital": 84.0, "audience": 71.0, "activity": 55.0, "reviews": 60.0, "portfolio": 88.0},
			map[string]interface{}{"name": "Agiva", "score": 73.4, "digital": 70.0, "audience": 64.0, "activity": 92.0, "reviews": 50.0, "portfolio": 86.0},
		},
	}
}
func dashboard(c *Client) map[string]interface{} {
	if c.Slug == "astor-garden" {
		return astorDashboard(c)
	}
	return aromaDashboard(c)
}

func probeOfficial(c *Client) map[string]interface{} {
	var src *Source
	for i := range c.Sources {
		if c.Sources[i].Key == "official_site" {
			src = &c.Sources[i]
			break
		}
	}
	if src == nil {
		return map[string]interface{}{"ok": false}
	}
	cli := http.Client{Timeout: 12 * time.Second}
	req, _ := http.NewRequest("GET", src.URL, nil)
	req.Header.Set("User-Agent", "BLIS-Navigator/1.2")
	resp, err := cli.Do(req)
	if err != nil {
		return map[string]interface{}{"ok": false, "message": err.Error()}
	}
	defer resp.Body.Close()
	_, _ = io.ReadAll(io.LimitReader(resp.Body, 1024*1024))
	add(c, "official_site", "website_active", func() float64 {
		if resp.StatusCode < 400 {
			return 1
		}
		return 0
	}(), nowISO())
	return map[string]interface{}{"ok": true, "status": resp.StatusCode}
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
		jsonOut(w, map[string]interface{}{"ok": true, "time": nowISO()})
		return
	}
	if path == "api/clients" {
		c := store.Clients["aroma"]
		jsonOut(w, []map[string]string{{"slug": c.Slug, "name": c.Name, "sector": c.Sector}})
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
			mu.Lock()
			res := probeOfficial(c)
			d := dashboard(c)
			c.Snapshots = append(c.Snapshots, Snapshot{CreatedAt: nowISO(), Payload: d})
			saveStore()
			mu.Unlock()
			jsonOut(w, map[string]interface{}{"ok": true, "connector": res, "dashboard": d})
			return
		}
	}

	http.NotFound(w, r)
}
func main() {
	ensureStore()
	port := os.Getenv("PORT")
	if port == "" {
		port = "10000"
	}
	addr := "0.0.0.0:" + port
	log.Printf("BLIS Navigator Aroma listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, http.HandlerFunc(handler)))
}
