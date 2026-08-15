# BLIS Navigator 2.0 — Product & UX Specification

## 1. Product definition
BLIS Navigator 2.0 is not a dashboard. It is a client intelligence portal that combines monitoring, evidence, interpretation, trend analysis, competitive intelligence, reputation intelligence, market signals and executive reporting in one environment.

Core promise: every screen must answer three questions — What changed? Why does it matter? What evidence supports it?

## 2. Design principles
1. Portal depth over flat dashboards.
2. No empty states that look unfinished.
3. Every metric must drill down to evidence/source/history where possible.
4. Visual hierarchy must vary by analytical task; pages must not be identical grids.
5. Client-specific branding must be visible without breaking BLIS system identity.
6. Live status, change detection and intelligence timeline must make the system feel active.
7. Executive readability first, analytical depth on click.
8. Never fabricate a metric; when data is insufficient, show monitored scope, source status and accumulation state.

## 3. Global shell
### Left navigation
- Client switcher with logo, name, sector and monitoring status.
- Intelligence Home
- Live Monitoring
- Signals Center
- Reputation Intelligence
- Competitive Intelligence
- Market Intelligence
- Social Intelligence
- Digital Intelligence
- Reports & Briefings
- Evidence & Sources
- Client Intelligence Profile
- Brand Lab / analytical team block

### Global top bar
- Global search across signals, competitors, mentions, reports and sources.
- Period selector.
- Last synchronization.
- Active source count.
- Monitoring health status.
- Create report / export.

### Global BLIS Pulse
Persistent intelligence ticker with current changes: new signals, new mentions, competitor movement, data anomalies, reputation risk and source health.

## 4. Intelligence Home
This is the main executive page.

### Hero
- Client logo and branded cover zone.
- Status: LIVE INTELLIGENCE.
- Active sources.
- Last update.
- Overall BLIS Index and confidence.

### What you need to know today
3–5 automatically prioritized insight cards. Each contains:
- headline;
- category;
- significance;
- short interpretation;
- timestamp;
- source count;
- Open evidence action.

### Core KPI strip
- Reputation
- Digital visibility
- Market signals
- Competitive position
- Social intelligence

Each card shows current value, trend, confidence and short interpretation.

### What changed since last visit
- new signals;
- new competitor actions;
- new mentions;
- new reviews;
- source changes;
- no-change confirmations where useful.

### Intelligence timeline
Chronological cross-module feed with filters: Brand / Competitors / Reputation / Media / Social / Market / Digital.

### Priority matrix
High-impact / medium-impact / informational signals by urgency and confidence.

## 5. Live Monitoring
Purpose: show that BLIS is actively working.

Components:
- active source counter;
- live scan animation;
- source groups: owned media, social, news, reviews, search, sector, registries, competitors;
- last checked time per source;
- status: active / limited / awaiting access / unavailable;
- current monitoring jobs;
- recent successful checks;
- source failures / anomalies;
- next scheduled scan;
- connected-account state for social APIs.

No generic blank area is allowed.

## 6. Signals Center
Central workspace for all meaningful changes.

Signal card fields:
- title;
- category;
- severity;
- confidence;
- affected brand/competitor;
- detected at;
- period change;
- interpretation: Why it matters;
- evidence count;
- status: new / reviewed / archived.

Filters:
- severity;
- category;
- brand;
- competitor;
- source;
- period;
- status.

Views:
- feed;
- matrix;
- timeline;
- trend.

## 7. Reputation Intelligence
### Executive header
- Reputation index
- Sentiment balance when data supports it
- Review volume
- Reputation risk count

### Reputation drivers
Top positive and negative drivers with evidence.

### Theme clusters
Repeated praise, criticism, complaints, service themes, product themes, media themes.

### Review intelligence
- source-by-source rating;
- review volume;
- recent reviews;
- response status if accessible;
- historical movement.

### Media context
Mentions, media sources, tone, recurring narratives and spikes.

### Risk monitor
Emerging complaints, negative-volume spikes, sudden rating change, crisis topics.

## 8. Competitive Intelligence
One of the flagship BLIS modules.

### Branded competitor cards
Each monitored competitor gets:
- official logo;
- brand color accent;
- competitor score when evidence is sufficient;
- active sources;
- new signals;
- mention activity;
- visibility trend;
- reputation trend;
- last detected action.

### Share of voice
Display only when comparable data is valid.

### Competitive activity timeline
Campaigns, product changes, site changes, media activity, social activity, promotions, events and partnerships.

### Competitive topic map
Which topics are most associated with each competitor.

### Comparative panels
- visibility;
- media mentions;
- review performance;
- social activity;
- content volume;
- campaign intensity.

### Competitor detail page
Clicking a competitor opens a full intelligence profile with evidence and history.

## 9. Market Intelligence / Market Radar
### Market Radar hero
Animated radar with active scan status and current source count.

### Signal categories
- media and public manifestations;
- search interest;
- product/category changes;
- consumer signals;
- advertising activity;
- sector and regulatory changes;
- pricing/promotional signals when available;
- partnerships/events.

### Emerging topics
Topic clusters ranked by growth, relevance and confidence.

### Trend movement
Time-based chart for selected market themes.

### Sector context
Relevant public statistics and benchmark references when available.

### Market timeline
Chronology of important external changes.

## 10. Social Intelligence
### Channel wall
Color official platform icons for Facebook, Instagram, LinkedIn, YouTube, TikTok, X, Threads, Pinterest, Reddit and other relevant channels.

Each channel card:
- public profile detected;
- connected/not connected;
- audience when available;
- activity;
- engagement when direct access exists;
- mentions;
- last post;
- status.

### Cross-network analytics
- activity trend;
- top content;
- content themes;
- audience growth;
- mentions;
- engagement;
- platform contribution.

### Direct-access unlock panel
Clearly explain what additional data appears after authenticated API access.

## 11. Digital Intelligence
### Owned digital estate
- site availability;
- response performance;
- sitemap;
- product/category structure;
- content changes;
- e-commerce;
- languages;
- structured data;
- technical anomalies.

### Search visibility
- brand discoverability;
- indexed content indicators;
- branded search signals;
- news/search presence;
- trend history.

### Content intelligence
- new pages;
- updated pages;
- product changes;
- offers;
- campaigns;
- blog/news activity.

### External visibility
Backlinks/referrals/external references when data source exists.

## 12. Reports & Briefings
Not a file archive — a reporting center.

Types:
- Executive Monthly Brief
- Reputation Report
- Competitive Intelligence Report
- Market Signals Brief
- Digital Intelligence Report
- Social Intelligence Report
- Weekly Pulse
- Custom report

Functions:
- generate;
- preview;
- PDF export;
- HTML export;
- CSV data export;
- PPT export in future phase;
- report history;
- report versioning;
- scheduled delivery in future phase.

## 13. Evidence & Sources
Every metric and signal should be traceable.

### Evidence drawer
- source;
- URL;
- observed at;
- metric;
- raw value;
- normalized value;
- confidence;
- method;
- screenshot/archive reference in future phase.

### Source map
Groups:
- official client sources;
- social;
- media;
- reviews;
- competitors;
- search;
- sector;
- regulatory;
- commerce;
- statistical.

Source status:
- active;
- restricted;
- awaiting access;
- failed;
- archived.

## 14. Client Intelligence Profile
Each client profile is a deep corporate intelligence dossier.

Sections:
- official logo;
- legal/corporate name;
- sector;
- headquarters/location;
- history;
- portfolio;
- products/services;
- markets;
- official channels;
- public contacts;
- key assets;
- current initiatives;
- monitored competitors;
- monitored topics;
- BLIS source coverage;
- data quality;
- last major changes;
- intelligence archive.

## 15. Client-specific visual themes
BLIS keeps the same navigation and system typography, but each client gets a full theme object:
- logo;
- accent;
- accent secondary;
- background;
- surface tint;
- hero background;
- gradient;
- subtle sector texture;
- competitor palette;
- chart accent.

Examples:
- Aroma: clean teal/blue, cosmetic/laboratory atmosphere.
- Bolyarka: warm burgundy, cream, brewery/heritage atmosphere.
- Astor Garden: petrol, sand/off-white, premium hospitality atmosphere.

Theme changes must affect page background, hero, selected states, side panel tint, charts, key cards and section accents — not only text color.

## 16. Visual language
- Reduce repetitive white bordered rectangles.
- Use mixed layouts: feeds, timelines, clusters, charts, radar, matrices, branded cards, source maps, split panels.
- Strong distinction between executive summary and analytical detail.
- More full-width modules.
- Use meaningful color states, not decoration.
- Motion should indicate live work: scanning, updating, new signal arrival, subtle chart animation.
- Avoid empty whitespace that communicates missing functionality.

## 17. Interaction model
Primary interactions:
- click metric → detail;
- click competitor → competitor profile;
- click signal → evidence drawer;
- click source → source history;
- click trend point → observations for that period;
- search → cross-portal results;
- filter period → refresh all modules;
- switch client → full visual and data context change.

## 18. Data integrity rules
1. No invented figures.
2. Every score must have a minimum evidence threshold.
3. If evidence is insufficient, show Accumulating comparable measurements.
4. Confidence must be visible for important indices.
5. Every automated interpretation must link to supporting evidence.
6. Missing direct social API access must be clearly distinguished from public monitoring.

## 19. Phase 1 implementation priority
1. New Intelligence Home.
2. Global search shell.
3. Live Monitoring.
4. Signals Center.
5. Deep Competitive Intelligence.
6. Deep Market Intelligence.
7. Reputation redesign.
8. Client-specific full visual themes.
9. Competitor/client official logos.
10. Evidence drawer and source drill-down.

## 20. Phase 2
- connected social APIs;
- role-specific views: Executive / Marketing / PR / Analyst;
- saved dashboards/workspaces;
- alert preferences;
- scheduled reporting;
- team notes;
- annotations;
- exported PowerPoint briefings;
- custom intelligence queries.

## 21. Acceptance criteria
Navigator 2.0 is accepted only if:
- no primary page looks empty;
- each page has a distinct analytical purpose and visual structure;
- client themes are clearly distinguishable at first glance;
- competitor logos and branded cards are present where appropriate;
- the portal visibly communicates live monitoring;
- signals include interpretation and evidence;
- the user can drill down from overview to source;
- the UI feels like a multi-layer intelligence portal, not an analytics app;
- no metric is shown without evidence or explicit status.
