import { getWeatherInfo } from '../lib/weatherCodes'
import type { DailyPoint } from '../services/openMeteo'

interface Props {
  data: DailyPoint[]
}

function formatDay(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

export function DailyForecast({ data }: Props) {
  return (
    <div className="w-full">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">
        7-Day Forecast
      </h2>
      <div className="flex flex-col gap-1 px-4">
        {data.map((d) => {
          const info = getWeatherInfo(d.weatherCode)
          return (
            <div
              key={d.date}
              className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3"
            >
              <span className="text-sm text-slate-300 w-12 shrink-0">
                {formatDay(d.date)}
              </span>
              <span className="text-xl leading-none">{info.icon}</span>
              <span className="text-xs text-slate-400 flex-1 truncate">
                {info.label}
              </span>
              {d.precipProbabilityMax > 0 && (
                <span className="text-xs text-sky-400 w-8 text-right">
                  {d.precipProbabilityMax}%
                </span>
              )}
              <div className="flex gap-2 text-sm shrink-0">
                <span className="text-white font-medium">
                  {Math.round(d.tempMax)}°
                </span>
                <span className="text-slate-500">{Math.round(d.tempMin)}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
