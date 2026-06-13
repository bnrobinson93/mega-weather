export interface CurrentWeather {
  temperature: number
  apparentTemperature: number
  humidity: number
  weatherCode: number
  windSpeed: number
  windDirection: number
  precipitation: number
  isDay: boolean
}

export interface HourlyPoint {
  time: string
  temperature: number
  apparentTemperature: number
  weatherCode: number
  precipitationProbability: number
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
  hourly: HourlyPoint[]
  daily: DailyPoint[]
  timezone: string
  latitude: number
  longitude: number
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
      'is_day',
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'weather_code',
      'precipitation_probability',
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

  const now = new Date()
  const currentHourIndex = d.hourly.time.findIndex(
    (t: string) => new Date(t) >= now,
  )
  const sliceFrom = Math.max(0, currentHourIndex === -1 ? 0 : currentHourIndex)

  const hourly: HourlyPoint[] = d.hourly.time
    .slice(sliceFrom, sliceFrom + 24)
    .map((time: string, i: number) => ({
      time,
      temperature: d.hourly.temperature_2m[sliceFrom + i],
      apparentTemperature: d.hourly.apparent_temperature[sliceFrom + i],
      weatherCode: d.hourly.weather_code[sliceFrom + i],
      precipitationProbability:
        d.hourly.precipitation_probability[sliceFrom + i],
    }))

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
      isDay: d.current.is_day === 1,
    },
    hourly,
    daily,
    timezone: d.timezone,
    latitude: d.latitude,
    longitude: d.longitude,
  }
}
