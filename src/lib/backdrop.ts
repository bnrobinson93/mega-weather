export type ConditionGroup =
  | 'clear'
  | 'clouds'
  | 'fog'
  | 'rain'
  | 'snow'
  | 'thunder'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export function conditionGroup(code: number): ConditionGroup {
  if (code <= 1) return 'clear'
  if (code <= 3) return 'clouds'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 71 && code <= 77) return 'snow'
  if (code === 85 || code === 86) return 'snow'
  if (code >= 95) return 'thunder'
  return 'rain' // 51–65 drizzle/rain, 80–82 showers
}

// Meteorological seasons, flipped for the southern hemisphere.
export function season(date: Date, lat: number): Season {
  const m = date.getMonth() // 0–11
  const north: Season =
    m >= 2 && m <= 4
      ? 'spring'
      : m >= 5 && m <= 7
        ? 'summer'
        : m >= 8 && m <= 10
          ? 'autumn'
          : 'winter'
  if (lat >= 0) return north
  const flip: Record<Season, Season> = {
    spring: 'autumn',
    autumn: 'spring',
    summer: 'winter',
    winter: 'summer',
  }
  return flip[north]
}

// Static Tailwind v4 gradient classes (literal strings so the scanner emits them).
// Used as the always-visible fallback behind the (optional) photo backdrop.
const GRADIENTS: Record<ConditionGroup, { day: string; night: string }> = {
  clear: {
    day: 'bg-linear-to-b from-sky-500 to-indigo-900',
    night: 'bg-linear-to-b from-indigo-800 to-slate-950',
  },
  clouds: {
    day: 'bg-linear-to-b from-slate-400 to-slate-800',
    night: 'bg-linear-to-b from-slate-600 to-slate-900',
  },
  fog: {
    day: 'bg-linear-to-b from-slate-300 to-slate-700',
    night: 'bg-linear-to-b from-slate-500 to-slate-900',
  },
  rain: {
    day: 'bg-linear-to-b from-sky-800 to-slate-900',
    night: 'bg-linear-to-b from-slate-600 to-slate-950',
  },
  snow: {
    day: 'bg-linear-to-b from-slate-200 to-slate-600',
    night: 'bg-linear-to-b from-slate-500 to-slate-900',
  },
  thunder: {
    day: 'bg-linear-to-b from-zinc-600 to-slate-950',
    night: 'bg-linear-to-b from-zinc-700 to-slate-950',
  },
}

export function backdropGradient(code: number, isDay: boolean): string {
  const g = GRADIENTS[conditionGroup(code)]
  return isDay ? g.day : g.night
}

// Path to the (optional) photo backdrop served from /public. Missing files fall
// back to the gradient — see src/components/Backdrop.tsx.
export function backdropImage(
  code: number,
  isDay: boolean,
  season: Season,
): string {
  return `/backdrops/${isDay ? 'day' : 'night'}/${season}/${conditionGroup(code)}.webp`
}
