package main

import (
    "encoding/json"
    "net/http"
    "strings"
)

type adminClientInput struct {
    Slug   string `json:"slug"`
    Name   string `json:"name"`
    Sector string `json:"sector"`
    Note   string `json:"note"`
}

type adminSourceInput struct {
    Key         string  `json:"key"`
    Label       string  `json:"label"`
    URL         string  `json:"url"`
    Method      string  `json:"method"`
    Reliability float64 `json:"reliability"`
}

func adminJSON(w http.ResponseWriter, status int, v interface{}) {
    w.Header().Set("Content-Type", "application/json; charset=utf-8")
    w.Header().Set("Cache-Control", "no-store")
    w.WriteHeader(status)
    _ = json.NewEncoder(w).Encode(v)
}

func adminAuthorized(r *http.Request) bool {
    s, ok := sessionFromRequest(r)
    return ok && s.Admin
}

func normalizeAdminSlug(s string) string {
    s = strings.ToLower(strings.TrimSpace(s))
    s = strings.ReplaceAll(s, " ", "-")
    return s
}

func handleOwnerAdminAPI(w http.ResponseWriter, r *http.Request) bool {
    if !strings.HasPrefix(r.URL.Path, "/api/admin/") {
        return false
    }
    if !adminAuthorized(r) {
        adminJSON(w, http.StatusUnauthorized, map[string]interface{}{"error": "owner session required"})
        return true
    }

    path := strings.TrimPrefix(r.URL.Path, "/api/admin/")
    parts := strings.Split(strings.Trim(path, "/"), "/")

    if path == "state" && r.Method == http.MethodGet {
        mu.Lock()
        clients := make(map[string]*Client, len(store.Clients))
        for k, c := range store.Clients { clients[k] = c }
        mu.Unlock()
        signalMu.RLock()
        sigCounts := map[string]int{}
        for k, rows := range signalState.Signals { sigCounts[k] = len(rows) }
        signalMu.RUnlock()
        adminJSON(w, 200, map[string]interface{}{
            "clients": clients,
            "engine": engineSnapshot(),
            "signal_counts": sigCounts,
            "signal_updated_at": signalState.UpdatedAt,
        })
        return true
    }

    if path == "signals/refresh" && r.Method == http.MethodPost {
        adminJSON(w, 200, runSignalCollector())
        return true
    }

    if len(parts) >= 1 && parts[0] == "clients" {
        if len(parts) == 1 && r.Method == http.MethodPost {
            var in adminClientInput
            if err := json.NewDecoder(r.Body).Decode(&in); err != nil { adminJSON(w, 400, map[string]string{"error":"invalid json"}); return true }
            in.Slug = normalizeAdminSlug(in.Slug)
            if in.Slug == "" || strings.Contains(in.Slug, "/") || in.Name == "" { adminJSON(w, 400, map[string]string{"error":"slug and name required"}); return true }
            mu.Lock()
            if _, exists := store.Clients[in.Slug]; exists { mu.Unlock(); adminJSON(w, 409, map[string]string{"error":"client exists"}); return true }
            store.Clients[in.Slug] = &Client{Slug:in.Slug, Name:strings.TrimSpace(in.Name), Sector:strings.TrimSpace(in.Sector), Note:strings.TrimSpace(in.Note), Sources:[]Source{}, Observations:[]Observation{}, Snapshots:[]Snapshot{}}
            mu.Unlock(); saveStore()
            adminJSON(w, 201, map[string]interface{}{"ok":true,"slug":in.Slug})
            return true
        }
        if len(parts) >= 2 {
            slug := normalizeAdminSlug(parts[1])
            mu.Lock(); c := store.Clients[slug]; mu.Unlock()
            if c == nil { adminJSON(w, 404, map[string]string{"error":"client not found"}); return true }

            if len(parts) == 2 && r.Method == http.MethodPut {
                var in adminClientInput
                if err := json.NewDecoder(r.Body).Decode(&in); err != nil { adminJSON(w, 400, map[string]string{"error":"invalid json"}); return true }
                mu.Lock()
                c.Name = strings.TrimSpace(in.Name); if c.Name == "" { c.Name = slug }
                c.Sector = strings.TrimSpace(in.Sector); c.Note = strings.TrimSpace(in.Note)
                mu.Unlock(); saveStore(); adminJSON(w, 200, map[string]bool{"ok":true}); return true
            }
            if len(parts) == 2 && r.Method == http.MethodDelete {
                mu.Lock(); delete(store.Clients, slug); mu.Unlock()
                signalMu.Lock(); delete(signalState.Signals, slug); signalMu.Unlock()
                saveStore(); saveSignalStateFile(); adminJSON(w, 200, map[string]bool{"ok":true}); return true
            }
            if len(parts) == 3 && parts[2] == "refresh" && r.Method == http.MethodPost {
                st := runClientEngine(c, true)
                adminJSON(w, 200, map[string]interface{}{"ok":true,"engine":st,"dashboard":dashboard(c)}); return true
            }
            if len(parts) == 3 && parts[2] == "observations" && r.Method == http.MethodGet {
                mu.Lock(); rows := append([]Observation{}, c.Observations...); mu.Unlock()
                if len(rows) > 500 { rows = rows[len(rows)-500:] }
                adminJSON(w, 200, rows); return true
            }
            if len(parts) == 3 && parts[2] == "sources" && r.Method == http.MethodPost {
                var in adminSourceInput
                if err := json.NewDecoder(r.Body).Decode(&in); err != nil { adminJSON(w, 400, map[string]string{"error":"invalid json"}); return true }
                in.Key = strings.TrimSpace(in.Key)
                if in.Key == "" || in.Label == "" { adminJSON(w, 400, map[string]string{"error":"key and label required"}); return true }
                mu.Lock()
                for _, s := range c.Sources { if s.Key == in.Key { mu.Unlock(); adminJSON(w,409,map[string]string{"error":"source exists"}); return true } }
                c.Sources = append(c.Sources, Source{Key:in.Key,Label:strings.TrimSpace(in.Label),URL:strings.TrimSpace(in.URL),Method:strings.TrimSpace(in.Method),Reliability:in.Reliability})
                mu.Unlock(); saveStore(); adminJSON(w,201,map[string]bool{"ok":true}); return true
            }
            if len(parts) == 4 && parts[2] == "sources" {
                key := parts[3]
                if r.Method == http.MethodPut {
                    var in adminSourceInput
                    if err := json.NewDecoder(r.Body).Decode(&in); err != nil { adminJSON(w, 400, map[string]string{"error":"invalid json"}); return true }
                    mu.Lock(); found := false
                    for i := range c.Sources { if c.Sources[i].Key == key { c.Sources[i].Label=strings.TrimSpace(in.Label); c.Sources[i].URL=strings.TrimSpace(in.URL); c.Sources[i].Method=strings.TrimSpace(in.Method); c.Sources[i].Reliability=in.Reliability; found=true; break } }
                    mu.Unlock(); if !found { adminJSON(w,404,map[string]string{"error":"source not found"}); return true }; saveStore(); adminJSON(w,200,map[string]bool{"ok":true}); return true
                }
                if r.Method == http.MethodDelete {
                    mu.Lock(); out := c.Sources[:0]; found := false
                    for _, s := range c.Sources { if s.Key == key { found=true; continue }; out=append(out,s) }; c.Sources=out; mu.Unlock()
                    if !found { adminJSON(w,404,map[string]string{"error":"source not found"}); return true }; saveStore(); adminJSON(w,200,map[string]bool{"ok":true}); return true
                }
            }
        }
    }

    if len(parts) == 3 && parts[0] == "signals" && parts[1] != "" && parts[2] != "" && r.Method == http.MethodDelete {
        slug, id := parts[1], parts[2]
        signalMu.Lock(); rows := signalState.Signals[slug]; out := rows[:0]; found := false
        for _, s := range rows { if s.ID == id { found=true; continue }; out=append(out,s) }; signalState.Signals[slug]=out; signalMu.Unlock()
        if !found { adminJSON(w,404,map[string]string{"error":"signal not found"}); return true }
        saveSignalStateFile(); adminJSON(w,200,map[string]bool{"ok":true}); return true
    }

    adminJSON(w, http.StatusNotFound, map[string]string{"error":"admin endpoint not found"})
    return true
}
