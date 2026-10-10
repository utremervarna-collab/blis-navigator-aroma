package main

import "encoding/json"

const icardSlug = "icard"

func ensureICardClient() *Client {
 mu.Lock()
 defer mu.Unlock()
 if store.Clients == nil { store.Clients = map[string]*Client{} }
 if c := store.Clients[icardSlug]; c != nil { return c }
 c := &Client{Slug:icardSlug, Name:"iCard", Sector:"Дигитални плащания и бизнес финансови услуги", Note:"Персонализирани търговски сценарии, доверие и възможности", Sources:[]Source{
  {Key:"icard_business",Label:"iCard бизнес сметка",URL:"https://icard.com/bg/business",Method:"Публично продуктово описание"},
  {Key:"icard_direct",Label:"iCard Direct",URL:"https://icard.direct/bg",Method:"Приемане на плащания и продуктови комбинации"},
 }}
 store.Clients[icardSlug] = c
 return c
}

func icardDashboard(c *Client) map[string]interface{} {
 data := map[string]interface{}{}
 if b, err := staticFS.ReadFile("static/icard-commercial-data.json"); err == nil { _ = json.Unmarshal(b, &data) }
 data["client"] = icardSlug
 data["slug"] = icardSlug
 data["client_slug"] = icardSlug
 data["name"] = c.Name
 data["profile_mode"] = "commercial_intelligence"
 data["profile_url"] = "/icard"
 data["data_status"] = "Проверена публична извадка · 10.10.2026"
 data["blis_index"] = nil
 data["benchmark"] = nil
 data["confidence"] = nil
 data["trend"] = nil
 return data
}
