import { useDayWeather } from '../hooks/useDayWeather'
import { formatHour } from '../lib/datetime'
import { uvCategory } from '../lib/uv'
import { getWeatherInfo } from '../lib/weatherCodes'
import type { DailyPoint } from '../services/openMeteo'

interface Props {
  lat: number
  lon: number
  day: DailyPoint
  today: string
  onBack: () => void
}

function formatFullDay(dateStr: string, today: string): string {
  if (dateStr === today) return 'Today'
  const d = new Date(`${dateStr}T12:00:00`)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function DayDetail({ lat, lon, day, today, onBack }: Props) {
  const state = useDayWeather(lat, lon, day.date)
  const info = getWeatherInfo(day.weatherCode)

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center gap-3 px-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-white cursor-pointer transition-colors"
        >
          <span className="text-lg leading-none">‹</span> Back
        </button>
      </div>

      <div className="flex items-center gap-3 px-4">
        <span className="text-4xl leading-none">{info.icon}</span>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-white">
            {formatFullDay(day.date, today)}
          </span>
          <span className="text-xs text-slate-400">{info.label}</span>
        </div>
        <div className="ml-auto flex gap-2 text-lg">
          <span className="text-white font-medium">
            {Math.round(day.tempMax)}°
          </span>
          <span className="text-slate-500">{Math.round(day.tempMin)}°</span>
        </div>
      </div>

      <div className="px-4">
        {state.status === 'loading' && (
          <div className="flex justify-center py-12 text-slate-500 text-sm">
            Loading hourly…
          </div>
        )}

        {state.status === 'error' && (
          <div className="py-12 text-center text-sm text-slate-400">
            {state.message}
          </div>
        )}

        {state.status === 'success' && (
          <div className="flex flex-col">
            <div className="flex items-center gap-3 px-1 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              <span className="w-12 shrink-0">Time</span>
              <span className="w-6 shrink-0" />
              <span className="w-12 text-right">Temp</span>
              <span className="w-14 text-right">Precip</span>
              <span className="flex-1 text-right">UV</span>
            </div>
            {state.hours.map((h) => {
              const hi = getWeatherInfo(h.weatherCode)
              const uv = uvCategory(Math.round(h.uvIndex))
              return (
                <div
                  key={h.time}
                  className="flex items-center gap-3 border-t border-slate-800 py-2.5 px-1"
                >
                  <span className="w-12 shrink-0 text-sm text-slate-300">
                    {formatHour(h.time)}
                  </span>
                  <span className="w-6 shrink-0 text-lg leading-none">
                    {hi.icon}
                  </span>
                  <span className="w-12 text-right text-sm font-medium text-white">
                    {Math.round(h.temperature)}°
                  </span>
                  <span className="w-14 text-right text-sm text-sky-400">
                    {h.precipitationProbability > 0
                      ? `${h.precipitationProbability}%`
                      : '—'}
                  </span>
                  <span
                    className={`flex-1 text-right text-sm font-medium ${uv.color}`}
                  >
                    <span className="mr-1 text-[10px] text-slate-500">
                      {uv.label}
                    </span>
                    {Math.round(h.uvIndex)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
