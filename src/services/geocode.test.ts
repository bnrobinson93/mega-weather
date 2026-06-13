import { beforeEach, describe, expect, it, vi } from 'vitest'
import { reverseGeocode } from './geocode'

function mockFetch(body: unknown, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: () => Promise.resolve(body),
    }),
  )
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('reverseGeocode', () => {
  it('extracts city, state, country from Nominatim response', async () => {
    mockFetch({
      address: {
        city: 'Austin',
        state: 'Texas',
        state_code: 'TX',
        country: 'United States',
      },
    })

    const result = await reverseGeocode(30.2672, -97.7431)
    expect(result.city).toBe('Austin')
    expect(result.state).toBe('Texas')
    expect(result.country).toBe('United States')
    expect(result.displayName).toBe('Austin, TX, United States')
  })

  it('falls back to town when city is absent', async () => {
    mockFetch({
      address: {
        town: 'Round Rock',
        state: 'Texas',
        state_code: 'TX',
        country: 'United States',
      },
    })

    const result = await reverseGeocode(30.5083, -97.6789)
    expect(result.city).toBe('Round Rock')
  })

  it('falls back to village when city and town are absent', async () => {
    mockFetch({
      address: {
        village: 'Smallville',
        state: 'Kansas',
        state_code: 'KS',
        country: 'United States',
      },
    })

    const result = await reverseGeocode(38.0, -97.0)
    expect(result.city).toBe('Smallville')
  })

  it('throws on non-ok response', async () => {
    mockFetch({}, false)
    await expect(reverseGeocode(0, 0)).rejects.toThrow('Geocode failed: 500')
  })

  it('sends correct User-Agent header', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ address: { city: 'X', state: 'Y', country: 'Z' } }),
    })
    vi.stubGlobal('fetch', fetchSpy)

    await reverseGeocode(0, 0)
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('nominatim.openstreetmap.org'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('mega-weather'),
        }),
      }),
    )
  })
})
