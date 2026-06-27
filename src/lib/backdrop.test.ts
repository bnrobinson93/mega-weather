import { describe, expect, it } from 'vitest'
import {
  backdropGradient,
  backdropImage,
  conditionGroup,
  season,
} from './backdrop'

describe('conditionGroup', () => {
  it.each([
    [0, 'clear'],
    [1, 'clear'],
    [2, 'clouds'],
    [3, 'clouds'],
    [45, 'fog'],
    [48, 'fog'],
    [51, 'rain'],
    [65, 'rain'],
    [80, 'rain'],
    [82, 'rain'],
    [71, 'snow'],
    [77, 'snow'],
    [86, 'snow'],
    [95, 'thunder'],
    [99, 'thunder'],
  ])('code %i → %s', (code, group) => {
    expect(conditionGroup(code)).toBe(group)
  })
})

describe('backdropGradient', () => {
  it('returns day vs night variants', () => {
    expect(backdropGradient(0, true)).toContain('from-sky-500')
    expect(backdropGradient(0, false)).toContain('from-indigo-800')
  })

  it('always returns a linear-gradient class', () => {
    for (const code of [0, 2, 45, 61, 71, 95, 999]) {
      expect(backdropGradient(code, true)).toMatch(/^bg-linear-to-b /)
    }
  })
})

describe('season', () => {
  it('maps northern-hemisphere months', () => {
    expect(season(new Date('2026-01-15'), 40)).toBe('winter')
    expect(season(new Date('2026-04-15'), 40)).toBe('spring')
    expect(season(new Date('2026-07-15'), 40)).toBe('summer')
    expect(season(new Date('2026-10-15'), 40)).toBe('autumn')
  })

  it('flips for the southern hemisphere', () => {
    expect(season(new Date('2026-07-15'), -33)).toBe('winter')
    expect(season(new Date('2026-01-15'), -33)).toBe('summer')
  })
})

describe('backdropImage', () => {
  it('builds the served path', () => {
    expect(backdropImage(95, false, 'summer')).toBe(
      '/backdrops/night/summer/thunder.webp',
    )
    expect(backdropImage(0, true, 'winter')).toBe(
      '/backdrops/day/winter/clear.webp',
    )
  })
})
