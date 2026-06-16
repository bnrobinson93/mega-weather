import { getWeatherInfo } from '../lib/weatherCodes'
import type { HourlyPoint } from '../services/openMeteo'

interface Props {
  data: HourlyPoint[]
}

function formatHour(iso: string): string {
  const d = new Date(iso)
  const h = d.getHours()
  if (h === 0) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}

export function HourlyForecast({ data }: Props) {
  return (
    <div className="w-full">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-3">
        Next 24 Hours
      </h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-slim px-4 pb-3">
        {data.map((h, i) => {
          const info = getWeatherInfo(h.weatherCode)
          return (
            <div
              key={h.time}
              className="flex flex-col items-center gap-1.5 min-w-[56px] bg-slate-800/50 rounded-2xl px-2 py-3"
            >
              <span className="text-xs text-slate-400">
                {i === 0 ? 'Now' : formatHour(h.time)}
              </span>
              <span className="text-xl leading-none">{info.icon}</span>
              <span className="text-sm font-medium text-white">
                {Math.round(h.temperature)}°
              </span>
              {h.precipitationProbability > 0 && (
                <span className="text-xs text-sky-400">
                  {h.precipitationProbability}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
