import { describe, expect, it } from 'vitest'
import { feelsColor, feelsHue } from './feelsColor'

describe('feelsHue', () => {
  it('clamps the extremes', () => {
    expect(feelsHue(-20)).toBe(275)
    expect(feelsHue(200)).toBe(0)
  })

  it('frigid is violet/blue, mild is green, hot is red-ish', () => {
    expect(feelsHue(10)).toBeGreaterThan(240) // violet/indigo
    expect(feelsHue(70)).toBeGreaterThan(100) // green range
    expect(feelsHue(70)).toBeLessThan(140)
    expect(feelsHue(95)).toBeLessThan(30) // orange/red
  })

  it('decreases monotonically as it warms', () => {
    const hues = [-10, 10, 32, 50, 70, 85, 100, 120].map(feelsHue)
    for (let i = 1; i < hues.length; i++) {
      expect(hues[i]).toBeLessThanOrEqual(hues[i - 1])
    }
  })
})

describe('feelsColor', () => {
  it('builds an hsla string with alpha', () => {
    expect(feelsColor(70, 0.22)).toMatch(/^hsla\(\d+, 70%, \d+%, 0\.22\)$/)
  })
})
