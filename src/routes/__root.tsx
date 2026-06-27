import { createRootRoute, Outlet } from '@tanstack/react-router'
import { WeatherProvider } from '../contexts/weather'
import { useGeolocation } from '../hooks/useGeolocation'
import { useWeather } from '../hooks/useWeather'

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 text-slate-400">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">Locating you…</span>
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center px-6">
      <div className="text-4xl">⚠️</div>
      <p className="text-slate-300 text-sm max-w-xs">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  )
}

function RootLayout() {
  const geo = useGeolocation()
  const weather = useWeather(
    geo.status === 'success' ? geo.lat : null,
    geo.status === 'success' ? geo.lon : null,
  )

  const isLoading =
    geo.status === 'loading' ||
    (geo.status === 'success' && weather.status === 'loading') ||
    (geo.status === 'success' && weather.status === 'idle')

  return (
    <div className="min-h-svh bg-slate-900 text-white flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-6 pb-10">
        <div className="flex items-center justify-center pt-6 px-4">
          <span className="text-lg font-semibold tracking-tight text-slate-200">
            ⛅ Mega Weather
          </span>
        </div>

        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        )}

        {geo.status === 'error' && (
          <div className="flex flex-1 items-center justify-center py-20">
            <ErrorState message={geo.message} />
          </div>
        )}

        {weather.status === 'error' && (
          <div className="flex flex-1 items-center justify-center py-20">
            <ErrorState
              message={weather.message}
              onRetry={() => window.location.reload()}
            />
          </div>
        )}

        {weather.status === 'success' && (
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
        )}

        <footer className="mt-auto px-4 py-6 text-center text-xs text-slate-600">
          Weather data by{' '}
          <a
            href="https://open-meteo.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-400 transition-colors"
          >
            Open-Meteo
          </a>{' '}
          under{' '}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-400 transition-colors"
          >
            CC BY 4.0
          </a>
        </footer>
      </div>
    </div>
  )
}

export const Route = createRootRoute({ component: RootLayout })
