# BLIS Navigator 2.0 — Canonical Screen Reference

Status: LOCKED

The 17 user-supplied reference screens from 17 August 2026 are the canonical product specification for the Navigator dashboard. They define both visual composition and expected functionality. No alternative visual system should replace or reinterpret them.

## Canonical screen order

1. Общ преглед
2. Live Monitoring
3. Социални канали
4. Дигитална видимост
5. Репутация
6. Пазарни сигнали
7. Конкуренти
8. Сигнали
9. Месечни доклади
10. Източници на данни
11. История
12. Intelligence Timeline
13. Клиентски профил
14. Настройки
15. Помощ

The remaining supplied reference views define detailed states and functional variations within these modules and are part of the same canonical reference set.

## Non-negotiable implementation rules

- Preserve the left navigation structure, spacing, hierarchy and active state from the supplied references.
- Preserve the global top bar, period control, notifications, user identity and data freshness/status treatment.
- Reproduce each screen's card hierarchy, KPI layout, charts, tables, legends, badges, buttons, filters and information density as shown.
- All visible interactive controls in the references must function; do not leave decorative controls that imply unsupported behavior.
- Use source-driven/dynamic values where available. The reference numbers are presentation examples, not permission to hard-code fabricated data.
- Missing or unavailable metrics must have an intentional unavailable/collecting-data state rather than appearing visually broken.
- Do not introduce duplicate versions of modules or legacy dashboard blocks into the canonical screens.
- Terminology lock: use “Пазарни сигнали”; do not restore “Потребителски интерес” or “Дял от вниманието”.
- Keep index values aligned consistently across all pages.
- Do not widen the sidebar to increase prominence; prominence comes from visual treatment.
- Maintain usable responsive behavior while preserving the desktop reference as the primary visual target.

## Development principle

Future dashboard work must be evaluated against the supplied reference screens first. Generic dashboard conventions, prior experiments and legacy styling are secondary and must not override the canonical reference.