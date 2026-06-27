import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { WeatherProvider } from '../contexts/weather'
import { useGeolocation } from '../hooks/useGeolocation'
import { useWeather } from '../hooks/useWeather'
import { getSavedLocation } from '../lib/savedLocation'

function LoadingSpinner() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Locating you…</span>
      </div>
    </div>
  )
}

function AppLayout() {
  const [saved] = useState(getSavedLocation)
  const geo = useGeolocation(!saved)
  const navigate = useNavigate()

  const lat = saved ? saved.lat : geo.status === 'success' ? geo.lat : null
  const lon = saved ? saved.lon : geo.status === 'success' ? geo.lon : null

  const weather = useWeather(lat, lon)

  // Geolocation failed/denied/timed out and no saved fallback → manual entry.
  useEffect(() => {
    if (!saved && geo.status === 'error') navigate({ to: '/location' })
  }, [saved, geo.status, navigate])

  if (weather.status === 'success') {
    return (
      <WeatherProvider
        value={{
          weather: weather.weather,
          location: weather.location,
          lat: weather.weather.latitude,
          lon: weather.weather.longitude,
        }}
      >
        <Outlet />
      </WeatherProvider>
    )
  }

  if (weather.status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 text-center px-6 py-20">
        <div className="text-4xl">⚠️</div>
        <p className="text-slate-300 text-sm max-w-xs">{weather.message}</p>
        <button
          type="button"
          onClick={() => navigate({ to: '/location' })}
          className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer"
        >
          Choose a location
        </button>
      </div>
    )
  }

  return <LoadingSpinner />
}

export const Route = createFileRoute('/_app')({ component: AppLayout })
