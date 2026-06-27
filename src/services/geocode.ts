export interface GeoLocation {
  city: string
  state: string
  country: string
  displayName: string
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<GeoLocation> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'mega-weather/1.0 (bnrobinson93@gmail.com)' },
  })
  if (!res.ok) throw new Error(`Geocode failed: ${res.status}`)
  const data = await res.json()
  const a = data.address ?? {}
  const city = a.city ?? a.town ?? a.village ?? a.county ?? ''
  const state = a.state ?? ''
  const country = a.country ?? ''
  const displayName = [city, a.state_code ?? state, country]
    .filter(Boolean)
    .join(', ')
  return { city, state, country, displayName }
}

export interface LocationResult {
  id: string
  name: string
  region?: string
  country?: string
  lat: number
  lon: number
  label: string
}

function label(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(', ')
}

async function searchZip(zip: string): Promise<LocationResult[]> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
  if (!res.ok) return []
  const d = await res.json()
  return (d.places ?? []).map(
    (p: Record<string, string>, i: number): LocationResult => ({
      id: `${zip}-${i}`,
      name: `${p['place name']} ${zip}`,
      region: p['state abbreviation'] ?? p.state,
      country: 'US',
      lat: Number(p.latitude),
      lon: Number(p.longitude),
      label: label([`${p['place name']} ${zip}`, p.state, 'US']),
    }),
  )
}

async function searchName(query: string): Promise<LocationResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=6&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Location search failed: ${res.status}`)
  const d = await res.json()
  return (d.results ?? []).map(
    (r: Record<string, unknown>): LocationResult => ({
      id: String(r.id),
      name: r.name as string,
      region: r.admin1 as string | undefined,
      country: r.country as string | undefined,
      lat: r.latitude as number,
      lon: r.longitude as number,
      label: label([
        r.name as string,
        r.admin1 as string | undefined,
        r.country as string | undefined,
      ]),
    }),
  )
}

export async function searchLocations(
  query: string,
): Promise<LocationResult[]> {
  const q = query.trim()
  if (q.length < 2) return []
  if (/^\d{5}$/.test(q)) return searchZip(q)
  return searchName(q)
}
