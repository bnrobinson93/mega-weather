import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { UpdatePrompt } from '../components/UpdatePrompt'

function RootLayout() {
  return (
    <div className="min-h-svh text-white flex flex-col items-center">
      <UpdatePrompt />
      <div className="w-full max-w-md flex flex-col gap-6 pb-10">
        <div className="flex items-center justify-center pt-6 px-4">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-slate-200"
          >
            ⛅ Mega Weather
          </Link>
        </div>

        <Outlet />

        <footer className="mt-auto px-4 py-6 text-center text-xs text-slate-600 flex flex-col gap-2">
          <Link
            to="/location"
            className="text-slate-400 hover:text-white underline transition-colors"
          >
            Change location
          </Link>
          <span className="text-balance">
            Data:{' '}
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-400 transition-colors"
            >
              Open-Meteo
            </a>{' '}
            ·{' '}
            <a
              href="https://www.geonames.org"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-400 transition-colors"
            >
              GeoNames
            </a>{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-400 transition-colors"
            >
              (CC BY 4.0)
            </a>{' '}
            · ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-slate-400 transition-colors"
            >
              OpenStreetMap
            </a>
          </span>
        </footer>
      </div>
    </div>
  )
}

export const Route = createRootRoute({ component: RootLayout })
