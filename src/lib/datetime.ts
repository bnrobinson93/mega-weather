export function formatHour(iso: string): string {
  const h = new Date(iso).getHours()
  if (h === 0) return '12am'
  if (h === 12) return '12pm'
  return h < 12 ? `${h}am` : `${h - 12}pm`
}
