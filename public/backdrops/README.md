# Backdrop photos (optional)

Subtle full-screen background photos, resolved at runtime by
`src/lib/backdrop.ts` → `backdropImage()`. Missing files fall back to the CSS
gradient in `src/components/Backdrop.tsx`, so the app works with zero, some, or
all of these present.

## Layout

```
public/backdrops/<day|night>/<spring|summer|autumn|winter>/<condition>.webp
```

Conditions (from `conditionGroup()`): `clear` `clouds` `fog` `rain` `snow`
`thunder`. Full matrix = 2 × 4 × 6 = 48 files.

Example: `public/backdrops/night/summer/thunder.webp`

## Notes

- **webp**, landscape, ~1600px wide, quality ~60. Keep each file small (subtle,
  overlaid at 30% opacity).
- Not precached by the service worker (webp is excluded from `globPatterns` in
  `vite.config.ts`), so they load online and gracefully degrade to the gradient
  offline. Add `webp` to `globPatterns` if you want them cached for offline.
- License: use **commercially-free, no-attribution** sources only (CC0 / public
  domain). `pnpm backdrops:fetch` pulls from Openverse CC0/PDM — review results
  for quality before committing.
