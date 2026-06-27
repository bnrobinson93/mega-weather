import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWeather } from './openMeteo'

function makeResponse() {
  const times = Array.from({ length: 48 }, (_, i) => {
    const d = new Date('2025-01-01T00:00:00')
    d.setHours(d.getHours() + i)
    return d.toISOString().slice(0, 16)
  })

  return {
    latitude: 30.27,
    longitude: -97.74,
    timezone: 'America/Chicago',
    current: {
      time: times[5],
      temperature_2m: 72.5,
      apparent_temperature: 70.1,
      relative_humidity_2m: 55,
      weather_code: 1,
      wind_speed_10m: 8.2,
      wind_direction_10m: 180,
      precipitation: 0,
      uv_index: 4.5,
      is_day: 1,
    },
    hourly: {
      time: times,
      temperature_2m: times.map(() => 70),
      apparent_temperature: times.map(() => 68),
      weather_code: times.map(() => 0),
      precipitation_probability: times.map(() => 10),
      uv_index: times.map(() => 3),
    },
    daily: {
      time: [
        '2025-01-01',
        '2025-01-02',
        '2025-01-03',
        '2025-01-04',
        '2025-01-05',
        '2025-01-06',
        '2025-01-07',
      ],
      weather_code: [0, 1, 2, 3, 61, 71, 95],
      temperature_2m_max: [75, 73, 70, 68, 65, 60, 72],
      temperature_2m_min: [55, 53, 50, 48, 45, 40, 52],
      precipitation_probability_max: [0, 5, 10, 20, 60, 80, 30],
      sunrise: Array.from({ length: 7 }, (_, i) => `2025-01-0${i + 1}T07:30`),
      sunset: Array.from({ length: 7 }, (_, i) => `2025-01-0${i + 1}T17:45`),
    },
  }
}

beforeEach(() => vi.unstubAllGlobals())

describe('fetchWeather', () => {
  it('maps current conditions', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeResponse()),
      }),
    )

    const data = await fetchWeather(30.27, -97.74)
    expect(data.current.temperature).toBe(72.5)
    expect(data.current.humidity).toBe(55)
    expect(data.current.isDay).toBe(true)
    expect(data.current.weatherCode).toBe(1)
  })

  it('exposes timezone and coordinates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeResponse()),
      }),
    )

    const data = await fetchWeather(30.27, -97.74)
    expect(data.timezone).toBe('America/Chicago')
    expect(data.latitude).toBe(30.27)
    expect(data.longitude).toBe(-97.74)
  })

  it('maps is_day=0 to isDay false', async () => {
    const res = makeResponse()
    res.current.is_day = 0
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(res),
      }),
    )

    const data = await fetchWeather(30.27, -97.74)
    expect(data.current.isDay).toBe(false)
  })

  it('returns 7 daily entries', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeResponse()),
      }),
    )

    const data = await fetchWeather(30.27, -97.74)
    expect(data.daily).toHaveLength(7)
    expect(data.daily[0].tempMax).toBe(75)
    expect(data.daily[0].tempMin).toBe(55)
  })

  it('slices 24 hourly entries from current time', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(makeResponse()),
      }),
    )

    const data = await fetchWeather(30.27, -97.74)
    expect(data.hourly).toHaveLength(24)
  })

  it('anchors the hourly slice to current.time, not the browser clock', async () => {
    const res = makeResponse()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(res),
      }),
    )

    const data = await fetchWeather(30.27, -97.74)
    // current.time === hourly.time[5], so "Now" must be that entry.
    expect(data.hourly[0].time).toBe(res.current.time)
    expect(data.hourly[0].time).toBe(res.hourly.time[5])
  })

  it('throws on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429 }),
    )
    await expect(fetchWeather(0, 0)).rejects.toThrow(
      'Weather fetch failed: 429',
    )
  })

  it('calls Open-Meteo with models=best_match and all param groups', async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(makeResponse()),
    })
    vi.stubGlobal('fetch', spy)

    await fetchWeather(30.27, -97.74)
    const url = spy.mock.calls[0][0] as string
    expect(url).toContain('api.open-meteo.com')
    expect(url).toContain('models=best_match')
    expect(url).toContain('temperature_unit=fahrenheit')
    expect(url).toContain('latitude=30.27')
    expect(url).toContain('current=')
    expect(url).toContain('hourly=')
    expect(url).toContain('daily=')
  })
})
