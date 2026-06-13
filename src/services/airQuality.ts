export interface UvHourlyPoint {
  time: string
  value: number
}

export interface AirQualityData {
  usAqi: number
  europeanAqi: number
  pm2_5: number
  pm10: number
  uvIndex: number
  uvHourly: UvHourlyPoint[]
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

export function uvCategory(uv: number): { label: string; color: string } {
  if (uv < 3) return { label: 'Low', color: 'text-green-400' }
  if (uv < 6) return { label: 'Moderate', color: 'text-yellow-400' }
  if (uv < 8) return { label: 'High', color: 'text-orange-400' }
  if (uv < 11) return { label: 'Very High', color: 'text-red-400' }
  return { label: 'Extreme', color: 'text-purple-400' }
}

const BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality'

export async function fetchAirQuality(
  lat: number,
  lon: number,
): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'us_aqi,european_aqi,pm2_5,pm10,uv_index',
    hourly: 'uv_index',
    forecast_days: '1',
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
    uvIndex: d.current.uv_index,
    uvHourly: (d.hourly.time as string[]).map((time, i) => ({
      time,
      value: d.hourly.uv_index[i] as number,
    })),
  }
}
