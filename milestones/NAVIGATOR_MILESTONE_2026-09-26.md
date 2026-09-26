# BLIS™ Navigator — Production Milestone

**Date:** 2026-09-26  
**Canonical repository:** `utremervarna-collab/blis-navigator-aroma`  
**Canonical production:** https://p01--blis-navigator-aroma--2rnk9hqsd2bc.code.run/  
**Milestone commit:** `70364edacf570278c4e3e5f82ef4414c4702eeb6`  
**Commit message:** `Pin smoke to Black Sea Center dashboard-only release`

## Status

This checkpoint records the current accepted production state of BLIS™ Navigator.

- `navigator-code-run-production`: **SUCCESS**
- `navigator-extended-qa`: **SUCCESS**
- Current `main`: **green**
- No new repository, service or production URL created.

## Accepted production architecture

The shared Navigator remains on the existing canonical production service and URL.

Primary Navigator information architecture:
- Общ изглед
- Мониторинг
- Среда
- Конкуренти
- Развитие/Доклади
- Intelligence HUB
- Календар

KUB remains on its dedicated crisis route and is not merged into the shared client dashboard.

## Black Sea Center

Black Sea Center is treated as a business and office complex / office leasing profile.

Accepted state:
- Dedicated client identity and branding.
- Dedicated monitoring and office-market context.
- Competitors: Varna Towers, Business Park Varna, Landmark Centre Varna, Комфорт Бизнес Център.
- No artificial ranking when comparable index data is unavailable.
- Black Sea Center uses a dashboard-only public flow.
- The intermediate Home round-trip is removed for this profile to prevent client-context fallback.
- The canonical Black Sea Center route resolves to its own dashboard context and must not fall back to Aroma.

## Client isolation rule

Every client route, API response, brand identity, monitoring stream, competitor set and report must remain client-scoped. A supported client must never be silently demoted to Aroma because of missing UI state, localStorage state, route parsing or renderer timing.

## Production verification rule

A GitHub push is not equivalent to a live deployment.

Production acceptance requires:
1. successful build;
2. exact release marker visible on live production;
3. production smoke success;
4. desktop/mobile Extended QA success;
5. client identity and route checks against the live canonical service.

## Change control after this milestone

Any change after this checkpoint must preserve:
- the same canonical production service and URL unless explicitly approved;
- the current client isolation behavior;
- the current Navigator architecture;
- Black Sea Center dashboard-only routing;
- the existing KUB route isolation;
- working monitoring, competitor and reporting modules.

If a later change breaks production, this commit is the reference checkpoint for comparison and recovery.
