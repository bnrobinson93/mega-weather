import { formatHour } from '../lib/datetime'
import { feelsColor } from '../lib/feelsColor'
import { getWeatherInfo } from '../lib/weatherCodes'
import type { HourlyPoint } from '../services/openMeteo'

interface Props {
  data: HourlyPoint[]
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
          const feels = Math.round(h.apparentTemperature)
          return (
            <div
              key={h.time}
              className="relative flex flex-col items-center gap-1.5 min-w-[56px] overflow-hidden bg-slate-800/50 rounded-2xl px-2 py-3"
            >
              {/* Feels-like color wash */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(180deg, ${feelsColor(feels, 0.28)} 0%, ${feelsColor(feels, 0.08)} 100%)`,
                }}
              />
              <span className="relative text-xs text-slate-400">
                {i === 0 ? 'Now' : formatHour(h.time)}
              </span>
              <span className="relative text-xl leading-none">{info.icon}</span>
              <span className="relative text-sm font-medium text-white">
                {Math.round(h.temperature)}°
              </span>
              <span
                className="relative text-[11px] font-medium leading-none"
                style={{ color: feelsColor(feels, 1) }}
                title="Feels like"
              >
                ≈{feels}°
              </span>
              {h.precipitationProbability > 0 && (
                <span className="relative text-xs text-sky-400">
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
