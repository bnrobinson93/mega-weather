#!/usr/bin/env node
/**
 * Optional backdrop fetcher.
 *
 * Populates public/backdrops/<tod>/<season>/<condition>.webp with
 * commercially-free, no-attribution-required photos.
 *
 * Sources (in order, per slot, until one returns a hit):
 *   1. Pexels    — needs PEXELS_API_KEY (free: https://www.pexels.com/api/).
 *                  Pexels License: commercial use, no attribution required.
 *                  Best coverage — fills all 48 slots.
 *   2. Openverse — keyless, filtered to CC0 / public domain. Smaller pool, so
 *                  used as a fallback when no key is set.
 *
 * Requires `sharp` for webp conversion (already a devDependency).
 * Run:  PEXELS_API_KEY=xxx node scripts/fetch-backdrops.mjs
 *       node scripts/fetch-backdrops.mjs --force   (overwrite existing)
 */

import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const sharp = await import('sharp')
  .then((m) => m.default)
  .catch(() => {
    console.error('Missing dependency `sharp`. Install it: pnpm add -D sharp')
    process.exit(1)
  })

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'backdrops')
const FORCE = process.argv.includes('--force')
const PEXELS_KEY = process.env.PEXELS_API_KEY

const TOD = ['day', 'night']
const SEASONS = ['spring', 'summer', 'autumn', 'winter']
const CONDITIONS = {
  clear: 'clear sky',
  clouds: 'cloudy sky',
  fog: 'foggy landscape',
  rain: 'rain',
  snow: 'snowy landscape',
  thunder: 'thunderstorm',
}

// Specific → generic, so sparse providers still fill the slot.
function queries(phrase, tod, season) {
  return [
    `${phrase} ${tod} ${season} landscape`,
    `${phrase} ${tod} landscape`,
    `${phrase} ${season}`,
    `${phrase} sky`,
    phrase,
  ]
}

async function pexels(query) {
  if (!PEXELS_KEY) return []
  const params = new URLSearchParams({
    query,
    orientation: 'landscape',
    per_page: '5',
  })
  const res = await fetch(`https://api.pexels.com/v1/search?${params}`, {
    headers: { Authorization: PEXELS_KEY },
  })
  if (!res.ok) return []
  const d = await res.json()
  return (d.photos ?? []).map((p) => ({
    url: p.src?.large2x ?? p.src?.large ?? p.src?.original,
    source: p.url,
    license: 'Pexels License',
  }))
}

async function openverse(query) {
  const params = new URLSearchParams({
    q: query,
    license: 'cc0,pdm',
    aspect_ratio: 'wide',
    size: 'large',
    mature: 'false',
    page_size: '5',
  })
  const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, {
    headers: { 'User-Agent': 'mega-weather backdrop fetcher' },
  })
  if (!res.ok) return []
  const d = await res.json()
  return (d.results ?? [])
    .filter((r) => r.url)
    .map((r) => ({
      url: r.url,
      source: r.foreign_landing_url ?? r.url,
      license: r.license,
    }))
}

const PROVIDERS = PEXELS_KEY ? [pexels, openverse] : [openverse]

async function findImage(phrase, tod, season) {
  for (const provider of PROVIDERS) {
    for (const q of queries(phrase, tod, season)) {
      try {
        const hits = await provider(q)
        const hit = hits.find((h) => h.url)
        if (hit) return hit
      } catch {
        // try next query/provider
      }
      await new Promise((r) => setTimeout(r, 400))
    }
  }
  return null
}

async function toWebp(srcUrl, destPath) {
  const res = await fetch(srcUrl)
  if (!res.ok) throw new Error(`download ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await mkdir(dirname(destPath), { recursive: true })
  await sharp(buf)
    .resize(1600, 900, { fit: 'cover' })
    .webp({ quality: 60 })
    .toFile(destPath)
}

async function main() {
  if (!PEXELS_KEY) {
    console.log(
      'No PEXELS_API_KEY set — using keyless Openverse only (sparse).\n' +
        'For full coverage, get a free key at https://www.pexels.com/api/ and\n' +
        're-run: PEXELS_API_KEY=xxx pnpm backdrops:fetch\n',
    )
  }

  const credits = []
  let filled = 0
  let missed = 0

  for (const tod of TOD) {
    for (const s of SEASONS) {
      for (const [cond, phrase] of Object.entries(CONDITIONS)) {
        const dest = join(OUT, tod, s, `${cond}.webp`)
        if (!FORCE && existsSync(dest)) continue

        const hit = await findImage(phrase, tod, s)
        if (!hit) {
          console.warn(`✗ ${tod}/${s}/${cond} — no result`)
          missed++
          continue
        }
        try {
          await toWebp(hit.url, dest)
          credits.push({
            file: `${tod}/${s}/${cond}.webp`,
            source: hit.source,
            license: hit.license,
          })
          console.log(`✓ ${tod}/${s}/${cond}.webp`)
          filled++
        } catch (err) {
          console.warn(`✗ ${tod}/${s}/${cond} — ${err.message}`)
          missed++
        }
      }
    }
  }

  if (credits.length) {
    await writeFile(join(OUT, 'CREDITS.json'), JSON.stringify(credits, null, 2))
  }
  console.log(
    `\nDone. ${filled} filled, ${missed} missed. Review before commit.`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
