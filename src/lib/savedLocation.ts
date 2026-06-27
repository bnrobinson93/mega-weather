export interface SavedLocation {
  lat: number
  lon: number
  name: string
}

const KEY = 'mega-weather:location'

export function getSavedLocation(): SavedLocation | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw)
    if (typeof v?.lat === 'number' && typeof v?.lon === 'number') return v
    return null
  } catch {
    return null
  }
}

export function saveLocation(loc: SavedLocation): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(loc))
  } catch {
    // ignore write failures (private mode, quota)
  }
}

export function clearSavedLocation(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
