# Mega Weather

Progressive web app that uses your location to show current conditions, hourly and 7-day forecasts, air quality, and UV index — powered by [Open-Meteo](https://open-meteo.com/) with automatic regional model selection.

## Features

- **Current conditions** — temperature, feels like, humidity, wind, precipitation
- **24-hour hourly forecast** — scrollable strip with precip probability
- **7-day forecast** — high/low temps, condition icon, precip chance
- **Air quality** — US AQI, EU AQI, PM2.5, PM10
- **UV index** — tap to expand a day-long UV chart
- **Regional model badge** — infers the best-fit NWP model for your coordinates (HRRR/GFS for US, GEM for Canada, ICON-EU/ECMWF for Europe, etc.)
- **PWA** — installable, offline-capable via Workbox service worker
- **No API key** — Open-Meteo is free for non-commercial use (attribution required under CC BY 4.0)

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query v5 |
| Charts | Recharts |
| PWA | vite-plugin-pwa + Workbox |
| Lint / format | Biome |
| Tests | Vitest + jsdom |

## Development

Requires [mise](https://mise.jdx.dev/) with pnpm configured.

```bash
mise exec -- pnpm install
mise exec -- pnpm dev
```

## Commands

```bash
pnpm dev              # start dev server
pnpm build            # type-check + production build
pnpm preview          # preview production build
pnpm test             # run unit tests
pnpm test:watch       # watch mode
pnpm check            # Biome lint + format check
pnpm format           # auto-format
pnpm licenses:check   # verify all deps use approved licenses
pnpm licenses:report  # generate THIRD_PARTY_LICENSES.md
```

## API calls per page load

| Request | When |
|---|---|
| Open-Meteo forecast (current + hourly + daily) | Immediate |
| Nominatim reverse geocode | Immediate |
| Open-Meteo air quality (AQI + hourly UV) | On scroll into view |

TanStack Query caches results for 5 minutes and deduplicates concurrent requests.

## Attribution

Weather data by [Open-Meteo](https://open-meteo.com/) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).  
Geocoding by [Nominatim / OpenStreetMap](https://nominatim.org/).

## License

MIT — see [LICENSE](LICENSE).
