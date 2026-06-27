import { useNavigate } from '@tanstack/react-router'
import { useWeatherContext } from '../contexts/weather'
import { AirQuality } from './AirQuality'
import { CurrentWeather } from './CurrentWeather'
import { DailyForecast } from './DailyForecast'
import { HourlyForecast } from './HourlyForecast'
import { ModelBadge } from './ModelBadge'

export function HomePage() {
  const { weather, location, lat, lon } = useWeatherContext()
  const navigate = useNavigate()

  // Location-local "today" / current hour, from the API's local clock.
  const today = weather.currentTime.slice(0, 10)
  const nowHour = Number(weather.currentTime.slice(11, 13))

  return (
    <>
      <CurrentWeather
        current={weather.current}
        locationName={location.displayName}
      />

      <div className="flex justify-center px-4">
        <ModelBadge lat={lat} lon={lon} />
      </div>

      <HourlyForecast data={weather.hourly} />
      <AirQuality
        lat={lat}
        lon={lon}
        uvIndex={weather.current.uvIndex}
        uvToday={weather.uvToday}
        nowHour={nowHour}
      />
      <DailyForecast
        data={weather.daily}
        today={today}
        onSelectDay={(d) =>
          navigate({ to: '/day/$date', params: { date: d.date } })
        }
      />
    </>
  )
}
