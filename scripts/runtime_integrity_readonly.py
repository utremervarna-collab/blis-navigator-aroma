#!/usr/bin/env python3
"""Read-only integrity summary for durable Navigator client history.

Prints counts and defect totals, never raw observations or customer data.
It does not modify production or archived records.
"""
import collections
import json
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

PATH = "data/live_store.json"
with open(PATH, encoding="utf-8") as stream:
    store = json.load(stream)

clients = store.get("clients") or {}
expected = ("aroma", "bolyarka", "mollox", "delta-planet",
            "ariel-fish", "astor-garden", "everbet", "kub")
summary = {}
hard_errors = []
identity_terms = re.compile(
    r"корпорация\s+куб|\bкуб\s*(?:ад|еоод|оод|груп)\b|"
    r"forest\s*club|форест\s*клуб|баба\s*алино|"
    r"олег\s+невзоров|k\s*u\s*b\s+corporation", re.I)
cubic_units = re.compile(r"\bкуб\.?\s*(?:м(?:етра|етър|\.)?|кубичн)", re.I)
foreign_competitors = re.compile(
    r"\baroma\b|\balteya\b|\bbiofresh\b|\bagiva\b", re.I)

def as_object(raw):
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        try:
            value = json.loads(raw)
            return value if isinstance(value, dict) else {}
        except (ValueError, TypeError):
            return {}
    return {}

def signal_published_time(row):
    payload = as_object(row.get("value"))
    raw = str(payload.get("published_at") or payload.get("PublishedAt") or "").strip()
    if not raw:
        return None
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        try:
            dt = parsedate_to_datetime(raw)
        except (ValueError, TypeError):
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)

for slug in expected:
    if slug not in clients:
        hard_errors.append("missing_client:" + slug)

for slug, client in sorted(clients.items()):
    if not isinstance(client, dict):
        hard_errors.append("invalid_client:" + slug)
        continue
    observations = client.get("observations")
    snapshots = client.get("snapshots")
    null_fields = [field for field, rows in (
        ("observations", observations), ("snapshots", snapshots))
        if rows is None]
    if not isinstance(observations, list):
        observations = []
    if not isinstance(snapshots, list):
        snapshots = []
    wrong_snapshot_client = 0
    kub_foreign_competitors = 0
    for snapshot in snapshots:
        if not isinstance(snapshot, dict):
            continue
        payload = as_object(snapshot.get("payload"))
        declared = payload.get("client")
        if declared is not None and str(declared) != slug:
            wrong_snapshot_client += 1
        if slug == "kub" and foreign_competitors.search(
            json.dumps(payload.get("competitors", []), ensure_ascii=False)):
            kub_foreign_competitors += 1

    signals = [row for row in observations if isinstance(row, dict)
               and row.get("source_key") == "signal_collector"
               and str(row.get("metric_key", "")).startswith("signal_event_")]
    keys = [str(row.get("metric_key")) for row in signals
            if row.get("metric_key")]
    duplicate_signal_keys = sum(n - 1 for n in collections.Counter(keys).values()
                                if n > 1)
    kub_cubic_false_positives = 0
    if slug == "kub":
        for row in signals:
            value = as_object(row.get("value"))
            title = str(value.get("title") or value.get("Title") or "")
            if cubic_units.search(title) and not identity_terms.search(title):
                kub_cubic_false_positives += 1

    published_times = [dt for dt in (signal_published_time(row) for row in signals)
                       if dt is not None]
    summary[slug] = {
        "newest_signal_published_utc": max(published_times).isoformat()
            if published_times else None,
        "snapshots": len(snapshots),
        "observations": len(observations),
        "signal_events": len(signals),
        "duplicate_signal_keys": duplicate_signal_keys,
        "null_fields": null_fields,
        "wrong_snapshot_client": wrong_snapshot_client,
    }
    if slug == "kub":
        summary[slug]["aroma_competitor_snapshots"] = kub_foreign_competitors
        summary[slug]["cubic_unit_false_positive_titles"] = kub_cubic_false_positives
    if wrong_snapshot_client:
        hard_errors.append("wrong_snapshot_client:" + slug)
    if slug == "kub" and kub_foreign_competitors:
        hard_errors.append("kub_foreign_competitors:" + str(kub_foreign_competitors))
    if null_fields and slug in expected:
        hard_errors.append("null_history:" + slug)

print("NAVIGATOR_READONLY_ARCHIVE_SUMMARY=" +
      json.dumps(summary, ensure_ascii=False, sort_keys=True))
print("NAVIGATOR_ARCHIVE_DEFECTS=" + json.dumps(hard_errors))
if hard_errors:
    raise SystemExit("ARCHIVE_INTEGRITY_FAILED: see aggregate defects above")
print("ARCHIVE_INTEGRITY_BASIC_CHECKS_OK")
