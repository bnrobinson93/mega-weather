export interface UvHourlyPoint {
  time: string
  value: number
}

export interface UvCategory {
  label: string
  color: string
}

export function uvCategory(uv: number): UvCategory {
  if (uv < 3) return { label: 'Low', color: 'text-green-400' }
  if (uv < 6) return { label: 'Moderate', color: 'text-yellow-400' }
  if (uv < 8) return { label: 'High', color: 'text-orange-400' }
  if (uv < 11) return { label: 'Very High', color: 'text-red-400' }
  return { label: 'Extreme', color: 'text-purple-400' }
}
