import { describe, expect, it } from 'vitest'
import { getWeatherInfo } from './weatherCodes'

describe('getWeatherInfo', () => {
  it('returns clear sky icon for code 0 during day', () => {
    const info = getWeatherInfo(0, true)
    expect(info.label).toBe('Clear sky')
    expect(info.icon).toBe('☀️')
    expect(info.isDay).toBe(true)
  })

  it('returns moon icon for code 0 at night', () => {
    const info = getWeatherInfo(0, false)
    expect(info.icon).toBe('🌙')
  })

  it('returns thunderstorm for code 95', () => {
    const info = getWeatherInfo(95)
    expect(info.label).toBe('Thunderstorm')
    expect(info.icon).toBe('⛈️')
  })

  it('returns snow for code 73', () => {
    const info = getWeatherInfo(73)
    expect(info.label).toBe('Snow')
    expect(info.icon).toBe('❄️')
  })

  it('returns fog for code 45', () => {
    const info = getWeatherInfo(45)
    expect(info.label).toBe('Fog')
  })

  it('returns unknown for unmapped code', () => {
    const info = getWeatherInfo(999)
    expect(info.label).toBe('Unknown')
    expect(info.icon).toBe('❓')
  })

  it('defaults isDay to true', () => {
    const info = getWeatherInfo(0)
    expect(info.isDay).toBe(true)
  })
})
