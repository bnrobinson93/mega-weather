import type { UvHourlyPoint } from '../lib/uv'

export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  weatherCode: number
  windSpeed: number
  windDirection: number
  precipitation: number
  uvIndex: number
  isDay: boolean
}

export interface HourlyPoint {
  time: string
  temperature: number
  apparentTemperature: number
  weatherCode: number
  precipitationProbability: number
  uvIndex: number
}

export interface DailyPoint {
  date: string
  weatherCode: number
  tempMax: number
  tempMin: number
  precipProbabilityMax: number
  sunrise: string
  sunset: string
}

export interface WeatherData {
  current: CurrentWeather
  /** Location-local "now" (offset-less ISO, e.g. 2026-06-27T12:00). */
  currentTime: string
  hourly: HourlyPoint[]
  uvToday: UvHourlyPoint[]
  daily: DailyPoint[]
  timezone: string
  latitude: number
  longitude: number
}

export interface DayHourlyPoint {
  time: string
  temperature: number
  precipitationProbability: number
  uvIndex: number
  weatherCode: number
}

const BASE = 'https://api.open-meteo.com/v1/forecast'

const COMMON_PARAMS = {
  temperature_unit: 'fahrenheit',
  wind_speed_unit: 'mph',
  precipitation_unit: 'inch',
  timezone: 'auto',
  models: 'best_match',
}

export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'precipitation',
      'uv_index',
      'is_day',
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'precipitation_probability',
      'uv_index',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'sunrise',
      'sunset',
    ].join(','),
    forecast_days: '7',
    ...COMMON_PARAMS,
  })

  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`)
  const d = await res.json()

  // Anchor "now" to the location's own clock. Open-Meteo returns local times
  // (timezone=auto) as offset-less strings; comparing against the browser's
  // Date would mix timezones. d.current.time is in the same local frame.
  const currentTime: string | undefined = d.current?.time
  let sliceFrom = 0
  if (currentTime) {
    const hourKey = currentTime.slice(0, 13) // YYYY-MM-DDTHH
    let idx = d.hourly.time.findIndex((t: string) => t.slice(0, 13) === hourKey)
    if (idx === -1)
      idx = d.hourly.time.findIndex((t: string) => t >= currentTime)
    sliceFrom = Math.max(0, idx)
  } else {
    const now = new Date()
    const idx = d.hourly.time.findIndex((t: string) => new Date(t) >= now)
    sliceFrom = Math.max(0, idx === -1 ? 0 : idx)
  }

  const hourly: HourlyPoint[] = d.hourly.time
    .slice(sliceFrom, sliceFrom + 24)
    .map((time: string, i: number) => ({
      time,
      temperature: d.hourly.temperature_2m[sliceFrom + i],
      apparentTemperature: d.hourly.apparent_temperature[sliceFrom + i],
      weatherCode: d.hourly.weather_code[sliceFrom + i],
      precipitationProbability:
        d.hourly.precipitation_probability[sliceFrom + i],
      uvIndex: d.hourly.uv_index[sliceFrom + i],
    }))

  const today = d.daily.time[0]
  const uvToday: UvHourlyPoint[] = d.hourly.time
    .map((time: string, i: number) => ({ time, value: d.hourly.uv_index[i] }))
    .filter((p: UvHourlyPoint) => p.time.slice(0, 10) === today)

  const daily: DailyPoint[] = d.daily.time.map((date: string, i: number) => ({
    date,
    weatherCode: d.daily.weather_code[i],
    tempMax: d.daily.temperature_2m_max[i],
    tempMin: d.daily.temperature_2m_min[i],
    precipProbabilityMax: d.daily.precipitation_probability_max[i],
    sunrise: d.daily.sunrise[i],
    sunset: d.daily.sunset[i],
  }))

  return {
    current: {
      temperature: d.current.temperature_2m,
      apparentTemperature: d.current.apparent_temperature,
      humidity: d.current.relative_humidity_2m,
      weatherCode: d.current.weather_code,
      windSpeed: d.current.wind_speed_10m,
      windDirection: d.current.wind_direction_10m,
      precipitation: d.current.precipitation,
      uvIndex: d.current.uv_index,
      isDay: d.current.is_day === 1,
    },
    currentTime: currentTime ?? d.hourly.time[sliceFrom],
    hourly,
    uvToday,
    daily,
    timezone: d.timezone,
    latitude: d.latitude,
    longitude: d.longitude,
  }
}

export async function fetchDayHourly(
  lat: number,
  lon: number,
  date: string,
): Promise<DayHourlyPoint[]> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'uv_index',
      'weather_code',
    ].join(','),
    start_date: date,
    end_date: date,
    ...COMMON_PARAMS,
  })

  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`Day forecast fetch failed: ${res.status}`)
  const d = await res.json()

  return d.hourly.time.map((time: string, i: number) => ({
    time,
    temperature: d.hourly.temperature_2m[i],
    precipitationProbability: d.hourly.precipitation_probability[i],
    uvIndex: d.hourly.uv_index[i],
    weatherCode: d.hourly.weather_code[i],
  }))
}
