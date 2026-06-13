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
