import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { type UvHourlyPoint, uvCategory } from '../lib/uv'
import { fetchAirQuality, usAqiCategory } from '../services/airQuality'

const UvChart = lazy(() => import('./UvChart'))

interface Props {
  lat: number
  lon: number
  uvIndex: number
  uvToday: UvHourlyPoint[]
  nowHour: number
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  )
}

function AirQualitySkeleton() {
  return <div className="mx-4 h-28 bg-slate-800/50 rounded-2xl animate-pulse" />
}

export function AirQuality({ lat, lon, uvIndex, uvToday, nowHour }: Props) {
  const [showUvChart, setShowUvChart] = useState(false)
  const [inView, ref] = useInView()
  const { data, error } = useQuery({
    queryKey: ['air-quality', lat, lon],
    queryFn: () => fetchAirQuality(lat, lon),
    enabled: inView,
  })

  return (
    <div ref={ref} className="w-full px-4">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Air Quality & UV
      </h2>
      {!data && !error && <AirQualitySkeleton />}
      {data &&
        (() => {
          const aqi = usAqiCategory(data.usAqi)
          const uv = uvCategory(uvIndex)
          return (
            <div className="bg-slate-800/50 rounded-2xl px-4 py-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${aqi.color}`}>
                      {data.usAqi}
                    </span>
                    <span className="text-xs text-slate-400">US AQI</span>
                  </div>
                  <div className={`text-sm font-medium mt-0.5 ${aqi.color}`}>
                    {aqi.label}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUvChart((v) => !v)}
                  className="flex flex-col items-end gap-0.5 rounded-xl px-2 py-1 -mr-1 hover:bg-slate-700/40 active:bg-slate-700/60 transition-colors cursor-pointer"
                >
                  <span className="text-xs text-slate-500">UV Index</span>
                  <span className={`text-2xl font-bold ${uv.color}`}>
                    {uvIndex.toFixed(1)}
                  </span>
                  <span
                    className={`text-xs font-medium flex items-center gap-1 ${uv.color}`}
                  >
                    {uv.label}
                    <span className="text-slate-500 text-[10px]">
                      {showUvChart ? '▲' : '▼'}
                    </span>
                  </span>
                </button>
              </div>

              {showUvChart && uvToday.length > 0 && (
                <div className="border-t border-slate-700/50 pt-2">
                  <p className="text-[10px] text-slate-500 mb-1">
                    Today's UV index
                  </p>
                  <Suspense
                    fallback={
                      <div className="h-[110px] bg-slate-800/50 rounded animate-pulse" />
                    }
                  >
                    <UvChart points={uvToday} currentHour={nowHour} />
                  </Suspense>
                </div>
              )}

              <div className="border-t border-slate-700/50 pt-3 flex justify-around">
                <Stat
                  label="PM2.5"
                  value={`${data.pm2_5.toFixed(1)}`}
                  sub="μg/m³"
                />
                <Stat
                  label="PM10"
                  value={`${data.pm10.toFixed(1)}`}
                  sub="μg/m³"
                />
                <Stat label="EU AQI" value={`${data.europeanAqi}`} sub="EAQI" />
              </div>
            </div>
          )
        })()}
      {error && (
        <p className="text-xs text-slate-500">{(error as Error).message}</p>
      )}
    </div>
  )
}
