# BLIS Navigator – Aroma public demo

Готов публичен demo build за Render.

## Какво съдържа
- само профил **Aroma**;
- няма смяна към Astor Garden;
- Go backend + вграден клиентски интерфейс;
- публични източници, индекси, конкурентно позициониране и методология;
- месечни анализи с работещ download;
- backend refresh и snapshots;
- endpoint за health check: `/api/health`.

## Render deployment

1. Създайте нов GitHub repository, например `blis-navigator-aroma`.
2. Качете **всички файлове от тази папка** в repository root.
3. В Render: **New → Web Service**.
4. Свържете GitHub и изберете repository `blis-navigator-aroma`.
5. Render ще разпознае `render.yaml`. Ако настройвате ръчно:
   - Language: `Go`
   - Build Command: `go build -tags netgo -ldflags '-s -w' -o app .`
   - Start Command: `./app`
   - Health Check Path: `/api/health`
6. Изберете име, например `blis-navigator-aroma`.
7. Натиснете **Create Web Service**.
8. След успешен deploy ще получите публичен адрес от вида:
   `https://blis-navigator-aroma.onrender.com`

## Важно за данните
Тази демо версия използва локален JSON store на Render инстанцията. На безплатен/ефемерен web service snapshots могат да се загубят при рестарт или redeploy. За постоянна клиентска версия следва да се добави PostgreSQL или persistent disk.

## Custom domain по-късно
След активиране на `brandlab.bg` може да се свърже например:
`navigator.brandlab.bg`
към същия Render service.
