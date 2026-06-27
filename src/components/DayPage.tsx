import { useNavigate, useParams } from '@tanstack/react-router'
import { useWeatherContext } from '../contexts/weather'
import { DayDetail } from './DayDetail'

export function DayPage() {
  const { date } = useParams({ from: '/_app/day/$date' })
  const { weather, lat, lon } = useWeatherContext()
  const navigate = useNavigate()

  const day = weather.daily.find((d) => d.date === date)

  if (!day) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center px-6">
        <p className="text-slate-300 text-sm">
          Forecast unavailable for {date}.
        </p>
        <button
          type="button"
          onClick={() => navigate({ to: '/' })}
          className="px-4 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors cursor-pointer"
        >
          Back to forecast
        </button>
      </div>
    )
  }

  return (
    <DayDetail
      lat={lat}
      lon={lon}
      day={day}
      onBack={() => navigate({ to: '/' })}
    />
  )
}
