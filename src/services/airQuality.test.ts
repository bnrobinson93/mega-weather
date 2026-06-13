import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAirQuality, usAqiCategory, uvCategory } from './airQuality'

beforeEach(() => vi.unstubAllGlobals())

describe('usAqiCategory', () => {
  it.each([
    [0, 'Good'],
    [50, 'Good'],
    [51, 'Moderate'],
    [100, 'Moderate'],
    [101, 'Unhealthy for Sensitive Groups'],
    [151, 'Unhealthy'],
    [201, 'Very Unhealthy'],
    [301, 'Hazardous'],
  ])('aqi %i → %s', (aqi, label) => {
    expect(usAqiCategory(aqi).label).toBe(label)
  })
})

describe('uvCategory', () => {
  it.each([
    [0, 'Low'],
    [2, 'Low'],
    [3, 'Moderate'],
    [5, 'Moderate'],
    [6, 'High'],
    [7, 'High'],
    [8, 'Very High'],
    [10, 'Very High'],
    [11, 'Extreme'],
  ])('uv %i → %s', (uv, label) => {
    expect(uvCategory(uv).label).toBe(label)
  })
})

describe('fetchAirQuality', () => {
  const mockResponse = {
    current: {
      us_aqi: 31,
      european_aqi: 27,
      pm2_5: 8.7,
      pm10: 12.8,
      uv_index: 6.25,
    },
    hourly: {
      time: Array.from(
        { length: 24 },
        (_, i) => `2025-01-01T${String(i).padStart(2, '0')}:00`,
      ),
      uv_index: Array.from({ length: 24 }, (_, i) =>
        i < 6 || i > 20 ? 0 : (i - 6) * 0.8,
      ),
    },
  }

  it('maps API response to typed object', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }),
    )

    const data = await fetchAirQuality(30.27, -97.74)
    expect(data.usAqi).toBe(31)
    expect(data.europeanAqi).toBe(27)
    expect(data.pm2_5).toBe(8.7)
    expect(data.pm10).toBe(12.8)
    expect(data.uvIndex).toBe(6.25)
    expect(data.uvHourly).toHaveLength(24)
    expect(data.uvHourly[0].time).toBe('2025-01-01T00:00')
    expect(data.uvHourly[0].value).toBe(0)
  })

  it('throws on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    )
    await expect(fetchAirQuality(0, 0)).rejects.toThrow(
      'Air quality fetch failed: 500',
    )
  })

  it('calls the air-quality endpoint', async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
    vi.stubGlobal('fetch', spy)

    await fetchAirQuality(30.27, -97.74)
    expect(spy.mock.calls[0][0]).toContain('air-quality-api.open-meteo.com')
  })
})
