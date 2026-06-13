import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useInView } from '../hooks/useInView'
import {
  fetchAirQuality,
  type UvHourlyPoint,
  usAqiCategory,
  uvCategory,
} from '../services/airQuality'

interface Props {
  lat: number
  lon: number
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

function formatHour(iso: string): string {
  const h = new Date(iso).getHours()
  if (h === 0) return '12a'
  if (h === 12) return '12p'
  return h < 12 ? `${h}a` : `${h - 12}p`
}

function UvChart({ points }: { points: UvHourlyPoint[] }) {
  const currentHour = new Date().getHours()
  const data = points.map((p, i) => ({
    hour: formatHour(p.time),
    uv: Math.round(p.value * 10) / 10,
    isCurrent: i === currentHour,
  }))

  // only label midnight, 6am, noon, 6pm
  const labelSet = new Set(['12a', '6a', '12p', '6p'])

  return (
    <ResponsiveContainer width="100%" height={110}>
      <AreaChart
        data={data}
        margin={{ top: 8, right: 4, left: -28, bottom: 0 }}
      >
        <defs>
          <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="hour"
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          tickFormatter={(v) => (labelSet.has(v) ? v : '')}
        />
        <YAxis
          domain={[0, 'dataMax + 1']}
          tick={{ fill: '#64748b', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            fontSize: 12,
            color: '#f1f5f9',
          }}
          itemStyle={{ color: '#fbbf24' }}
          formatter={(v: number) => [v, 'UV']}
          labelFormatter={(label) => label}
        />
        <ReferenceLine
          x={data[currentHour]?.hour}
          stroke="#475569"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
        <Area
          type="monotone"
          dataKey="uv"
          stroke="#fbbf24"
          strokeWidth={2}
          fill="url(#uvGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#fbbf24', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function AirQuality({ lat, lon }: Props) {
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
          const uv = uvCategory(data.uvIndex)
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
                    {data.uvIndex.toFixed(1)}
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

              {showUvChart && data.uvHourly.length > 0 && (
                <div className="border-t border-slate-700/50 pt-2">
                  <p className="text-[10px] text-slate-500 mb-1">
                    Today's UV index
                  </p>
                  <UvChart points={data.uvHourly} />
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
