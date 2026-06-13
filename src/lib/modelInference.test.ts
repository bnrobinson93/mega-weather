import { describe, expect, it } from 'vitest'
import { inferModel } from './modelInference'

describe('inferModel', () => {
  it('returns HRRR/GFS for contiguous US', () => {
    const m = inferModel(30.27, -97.74) // Austin TX
    expect(m.name).toContain('HRRR')
    expect(m.source).toContain('National Weather Service')
  })

  it('returns HRRR/GFS for Alaska', () => {
    const m = inferModel(61.2, -149.9) // Anchorage
    expect(m.name).toContain('HRRR')
  })

  it('returns GFS for Hawaii', () => {
    const m = inferModel(21.3, -157.8) // Honolulu
    expect(m.name).toContain('GFS')
    expect(m.source).toContain('National Weather Service')
  })

  it('returns ICON-EU/ECMWF for Europe', () => {
    const m = inferModel(51.5, -0.1) // London
    expect(m.name).toContain('ICON-EU')
  })

  it('returns JMA for Japan', () => {
    const m = inferModel(35.7, 139.7) // Tokyo
    expect(m.name).toContain('JMA')
  })

  it('returns BOM for Australia', () => {
    const m = inferModel(-33.9, 151.2) // Sydney
    expect(m.name).toContain('BOM')
  })

  it('returns ECMWF for global fallback', () => {
    const m = inferModel(-1.3, 36.8) // Nairobi
    expect(m.name).toContain('ECMWF')
  })

  it('returns GEM for Canada', () => {
    const m = inferModel(53.5, -113.5) // Edmonton AB (north of 49th parallel)
    expect(m.name).toContain('GEM')
  })
})
