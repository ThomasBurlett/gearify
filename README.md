# GearCast

Outdoorsy, weather‑aware outfit planning for running and skiing. GearCast turns live conditions into
clear layering guidance and a shareable forecast link.

## Highlights

- Location search with recents (stored locally)
- Default to current location with IP fallback
- Hour‑level time selection + presets
- Full forecast summary (temp, feels‑like, humidity, wind, precip, visibility)
- Gear + pack recommendations by sport

## Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- React Router
- Vitest + Testing Library
- Oxlint + Oxfmt

## Getting started

```bash
pnpm install
pnpm dev
```

Geolocation works best on secure origins. For local dev:

- Use `https://localhost:5173` (self‑signed cert accepted)
- Or allow location for `http://localhost`

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:write
pnpm test
pnpm test:run
```

## Project structure

```text
src/
  features/
    home/
      components/
      hooks/
      store/
  components/
    ui/
  lib/
  pages/
```

## Notes

- Recents are saved in `localStorage` under `gearcast.recentLocations`.
- Weather data and geocoding are powered by Open‑Meteo (no API key required).
