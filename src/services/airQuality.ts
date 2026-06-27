export interface AirQualityData {
  usAqi: number
  europeanAqi: number
  pm2_5: number
  pm10: number
}

export interface AqiCategory {
  label: string
  color: string
}

export function usAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return { label: 'Good', color: 'text-green-400' }
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-400' }
  if (aqi <= 150)
    return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-400' }
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-400' }
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400' }
  return { label: 'Hazardous', color: 'text-rose-700' }
}

const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality'

export async function fetchAirQuality(
  lat: number,
  lon: number,
): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'us_aqi,european_aqi,pm2_5,pm10',
    timezone: 'auto',
  })

  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`Air quality fetch failed: ${res.status}`)
  const d = await res.json()

  return {
    usAqi: d.current.us_aqi,
    europeanAqi: d.current.european_aqi,
    pm2_5: d.current.pm2_5,
    pm10: d.current.pm10,
  }
}
