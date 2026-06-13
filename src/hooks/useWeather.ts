import { useQuery } from '@tanstack/react-query'
import { type GeoLocation, reverseGeocode } from '../services/geocode'
import { fetchWeather, type WeatherData } from '../services/openMeteo'

export type WeatherState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; weather: WeatherData; location: GeoLocation }
  | { status: 'error'; message: string }

export function useWeather(
  lat: number | null,
  lon: number | null,
): WeatherState {
  const enabled = lat != null && lon != null

  const weatherQuery = useQuery({
    queryKey: ['weather', lat, lon],
    queryFn: () => fetchWeather(lat as number, lon as number),
    enabled,
  })

  const geocodeQuery = useQuery({
    queryKey: ['geocode', lat, lon],
    queryFn: () => reverseGeocode(lat as number, lon as number),
    enabled,
    staleTime: Number.POSITIVE_INFINITY,
  })

  if (!enabled) return { status: 'idle' }
  if (weatherQuery.isPending || geocodeQuery.isPending)
    return { status: 'loading' }
  if (weatherQuery.error)
    return {
      status: 'error',
      message:
        (weatherQuery.error as Error).message ?? 'Failed to load weather.',
    }
  if (geocodeQuery.error)
    return {
      status: 'error',
      message:
        (geocodeQuery.error as Error).message ?? 'Failed to load location.',
    }
  if (weatherQuery.data && geocodeQuery.data)
    return {
      status: 'success',
      weather: weatherQuery.data,
      location: geocodeQuery.data,
    }
  return { status: 'idle' }
}
