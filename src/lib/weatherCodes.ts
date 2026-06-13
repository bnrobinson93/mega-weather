export interface WeatherInfo {
  label: string
  icon: string
  isDay?: boolean
}

const CODE_MAP: Record<
  number,
  { label: string; dayIcon: string; nightIcon: string }
> = {
  0: { label: 'Clear sky', dayIcon: '☀️', nightIcon: '🌙' },
  1: { label: 'Mainly clear', dayIcon: '🌤️', nightIcon: '🌙' },
  2: { label: 'Partly cloudy', dayIcon: '⛅', nightIcon: '🌤️' },
  3: { label: 'Overcast', dayIcon: '☁️', nightIcon: '☁️' },
  45: { label: 'Fog', dayIcon: '🌫️', nightIcon: '🌫️' },
  48: { label: 'Icy fog', dayIcon: '🌫️', nightIcon: '🌫️' },
  51: { label: 'Light drizzle', dayIcon: '🌦️', nightIcon: '🌧️' },
  53: { label: 'Drizzle', dayIcon: '🌦️', nightIcon: '🌧️' },
  55: { label: 'Heavy drizzle', dayIcon: '🌧️', nightIcon: '🌧️' },
  61: { label: 'Light rain', dayIcon: '🌦️', nightIcon: '🌧️' },
  63: { label: 'Rain', dayIcon: '🌧️', nightIcon: '🌧️' },
  65: { label: 'Heavy rain', dayIcon: '🌧️', nightIcon: '🌧️' },
  71: { label: 'Light snow', dayIcon: '🌨️', nightIcon: '🌨️' },
  73: { label: 'Snow', dayIcon: '❄️', nightIcon: '❄️' },
  75: { label: 'Heavy snow', dayIcon: '❄️', nightIcon: '❄️' },
  77: { label: 'Snow grains', dayIcon: '🌨️', nightIcon: '🌨️' },
  80: { label: 'Light showers', dayIcon: '🌦️', nightIcon: '🌧️' },
  81: { label: 'Showers', dayIcon: '🌧️', nightIcon: '🌧️' },
  82: { label: 'Heavy showers', dayIcon: '⛈️', nightIcon: '⛈️' },
  85: { label: 'Snow showers', dayIcon: '🌨️', nightIcon: '🌨️' },
  86: { label: 'Heavy snow showers', dayIcon: '❄️', nightIcon: '❄️' },
  95: { label: 'Thunderstorm', dayIcon: '⛈️', nightIcon: '⛈️' },
  96: { label: 'Thunderstorm w/ hail', dayIcon: '⛈️', nightIcon: '⛈️' },
  99: { label: 'Thunderstorm w/ hail', dayIcon: '⛈️', nightIcon: '⛈️' },
}

export function getWeatherInfo(code: number, isDay = true): WeatherInfo {
  const entry = CODE_MAP[code] ?? {
    label: 'Unknown',
    dayIcon: '❓',
    nightIcon: '❓',
  }
  return {
    label: entry.label,
    icon: isDay ? entry.dayIcon : entry.nightIcon,
    isDay,
  }
}
