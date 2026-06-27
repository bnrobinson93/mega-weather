import { describe, expect, it } from 'vitest'
import { uvCategory } from './uv'

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
