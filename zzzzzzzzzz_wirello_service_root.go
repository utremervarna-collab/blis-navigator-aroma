package main

// The dedicated Wirello Render service must keep the native Navigator home
// page reachable at "/". The public demo itself remains available at /wirello.
//
// A previous response hook redirected every request for "/" back to /wirello,
// which made the "Начало" / home navigation loop back into the demo instead
// of returning to the Navigator landing screen. That redirect is intentionally
// removed here.
