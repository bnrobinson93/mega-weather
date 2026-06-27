import { useQuery } from '@tanstack/react-query'
import { type DayHourlyPoint, fetchDayHourly } from '../services/openMeteo'

export type DayWeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; hours: DayHourlyPoint[] }
  | { status: 'error'; message: string }

export function useDayWeather(
  lat: number | null,
  lon: number | null,
  date: string | null,
): DayWeatherState {
  const enabled = lat != null && lon != null && date != null

  const query = useQuery({
    queryKey: ['day-weather', lat, lon, date],
    queryFn: () => fetchDayHourly(lat as number, lon as number, date as string),
    enabled,
    staleTime: 30 * 60 * 1000,
  })

  if (!enabled) return { status: 'idle' }
  if (query.isPending) return { status: 'loading' }
  if (query.error)
    return {
      status: 'error',
      message: (query.error as Error).message ?? 'Failed to load forecast.',
    }
  if (query.data) return { status: 'success', hours: query.data }
  return { status: 'idle' }
}
