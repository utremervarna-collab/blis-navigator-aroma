# Live feed separation acceptance

Acceptance trigger for the existing Navigator after commit e1164da647f2fce48b9e2356bc0cefbbc78a4c17.

No runtime module is added by this file. The production acceptance target is:
- Aroma, Bolyarka and MOLLOX brand Monitoring uses the existing live signal API with competitor rows excluded.
- Competition uses only `scope=competitor` signals.
- Both shared UI feeds merge monotonically so an older snapshot cannot displace a newer same-fingerprint record.
- KUB remains on its dedicated crisis feed and routing.
