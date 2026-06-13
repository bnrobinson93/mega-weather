import { getWeatherInfo } from '../lib/weatherCodes'
import type { CurrentWeather as Current } from '../services/openMeteo'

interface Props {
  current: Current
  locationName: string
}

function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

export function CurrentWeather({ current, locationName }: Props) {
  const info = getWeatherInfo(current.weatherCode, current.isDay)

  return (
    <div className="flex flex-col items-center gap-4 py-8 px-4">
      <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">
        {locationName}
      </p>

      <div className="text-8xl leading-none select-none">{info.icon}</div>

      <div className="text-center">
        <div className="text-7xl font-thin text-white tracking-tight">
          {Math.round(current.temperature)}°
        </div>
        <div className="text-slate-400 text-lg mt-1">{info.label}</div>
        <div className="text-slate-500 text-sm mt-0.5">
          Feels like {Math.round(current.apparentTemperature)}°
        </div>
      </div>

      <div className="flex gap-6 text-sm text-slate-400 mt-2">
        <span title="Humidity">💧 {current.humidity}%</span>
        <span title="Wind">
          🌬️ {Math.round(current.windSpeed)} mph{' '}
          {windDirection(current.windDirection)}
        </span>
        {current.precipitation > 0 && (
          <span title="Precipitation">
            🌧️ {current.precipitation.toFixed(2)}"
          </span>
        )}
      </div>
    </div>
  )
}
