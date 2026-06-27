import { useEffect, useRef, useState } from 'react'
import type { UvHourlyPoint } from '../lib/uv'

function formatHour(iso: string): string {
  const h = new Date(iso).getHours()
  if (h === 0) return '12a'
  if (h === 12) return '12p'
  return h < 12 ? `${h}a` : `${h - 12}p`
}

const H = 110
const PAD = { l: 28, r: 6, t: 8, b: 16 }
const X_LABELS = new Set(['12a', '6a', '12p', '6p'])

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(320)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver((entries) =>
      setW(entries[0].contentRect.width),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

export default function UvChart({ points }: { points: UvHourlyPoint[] }) {
  const [ref, width] = useWidth()
  const [hover, setHover] = useState<number | null>(null)

  const n = points.length
  const x0 = PAD.l
  const x1 = Math.max(x0 + 1, width - PAD.r)
  const y0 = PAD.t
  const y1 = H - PAD.b
  const yMax = Math.max(...points.map((p) => p.value), 0) + 1

  const xFor = (i: number) => (n <= 1 ? x0 : x0 + (i / (n - 1)) * (x1 - x0))
  const yFor = (v: number) => y1 - (v / yMax) * (y1 - y0)

  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(i)},${yFor(p.value)}`)
    .join(' ')
  const area = `${line} L${xFor(n - 1)},${y1} L${xFor(0)},${y1} Z`

  const currentHour = new Date().getHours()
  const hasCurrent = currentHour < n

  const yTicks = [0, Math.round(yMax / 2), Math.round(yMax)].filter(
    (v, i, a) => a.indexOf(v) === i,
  )

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const i = Math.round(((x - x0) / (x1 - x0)) * (n - 1))
    setHover(Math.max(0, Math.min(n - 1, i)))
  }

  const hp = hover != null ? points[hover] : null

  return (
    <div ref={ref} className="relative w-full" style={{ height: H }}>
      <svg
        width="100%"
        height={H}
        role="img"
        aria-label="Hourly UV index for today"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        <title>Hourly UV index for today</title>
        <defs>
          <linearGradient id="uvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
          </linearGradient>
        </defs>

        {yTicks.map((v) => (
          <g key={v}>
            <text
              x={x0 - 6}
              y={yFor(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#64748b"
              fontSize={10}
            >
              {v}
            </text>
          </g>
        ))}

        {points.map((p, i) => {
          const label = formatHour(p.time)
          if (!X_LABELS.has(label)) return null
          return (
            <text
              key={p.time}
              x={xFor(i)}
              y={H - 4}
              textAnchor="middle"
              fill="#64748b"
              fontSize={10}
            >
              {label}
            </text>
          )
        })}

        {hasCurrent && (
          <line
            x1={xFor(currentHour)}
            x2={xFor(currentHour)}
            y1={y0}
            y2={y1}
            stroke="#475569"
            strokeDasharray="3 3"
            strokeWidth={1}
          />
        )}

        <path d={area} fill="url(#uvGrad)" />
        <path
          d={line}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {hp && (
          <circle
            cx={xFor(hover as number)}
            cy={yFor(hp.value)}
            r={3}
            fill="#fbbf24"
          />
        )}
      </svg>

      {hp && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-100"
          style={{
            left: Math.min(Math.max(xFor(hover as number), 28), width - 28),
            top: yFor(hp.value) - 6,
          }}
        >
          <span className="text-amber-400">{hp.value.toFixed(1)}</span> UV ·{' '}
          {formatHour(hp.time)}
        </div>
      )}
    </div>
  )
}
