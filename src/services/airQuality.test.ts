import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAirQuality, usAqiCategory } from './airQuality'

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

describe('fetchAirQuality', () => {
  const mockResponse = {
    current: {
      us_aqi: 31,
      european_aqi: 27,
      pm2_5: 8.7,
      pm10: 12.8,
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
  })

  it('requests only AQI/PM, not UV', async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
    vi.stubGlobal('fetch', spy)

    await fetchAirQuality(30.27, -97.74)
    const url = spy.mock.calls[0][0] as string
    expect(url).not.toContain('uv_index')
    expect(url).not.toContain('hourly')
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
