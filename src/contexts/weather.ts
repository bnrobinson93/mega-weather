import { createContext, useContext } from 'react'
import type { GeoLocation } from '../services/geocode'
import type { WeatherData } from '../services/openMeteo'

export interface WeatherContextValue {
  weather: WeatherData
  location: GeoLocation
  lat: number
  lon: number
}

const WeatherContext = createContext<WeatherContextValue | null>(null)

export const WeatherProvider = WeatherContext.Provider

export function useWeatherContext(): WeatherContextValue {
  const ctx = useContext(WeatherContext)
  if (!ctx)
    throw new Error('useWeatherContext must be used within WeatherProvider')
  return ctx
}
