// Temperature → HSL hue stops (°F → hue), a full continuous ramp tuned to look
// good: violet (frigid) → indigo → blue → cyan → teal → green → lime → amber →
// orange → red (scorching). Finely spaced so adjacent hours shift smoothly.
const STOPS: [number, number][] = [
  [0, 275],
  [15, 245],
  [28, 220],
  [38, 200],
  [48, 180],
  [58, 158],
  [66, 135],
  [72, 110],
  [78, 82],
  [84, 50],
  [90, 30],
  [96, 14],
  [105, 0],
]

export function feelsHue(tempF: number): number {
  if (tempF <= STOPS[0][0]) return STOPS[0][1]
  const last = STOPS[STOPS.length - 1]
  if (tempF >= last[0]) return last[1]
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [t0, h0] = STOPS[i]
    const [t1, h1] = STOPS[i + 1]
    if (tempF >= t0 && tempF <= t1) {
      const f = (tempF - t0) / (t1 - t0)
      return h0 + (h1 - h0) * f
    }
  }
  return last[1]
}

// HSLA string for a feels-like temperature. `alpha` for subtle washes,
// `light` to keep text legible on the dark UI.
export function feelsColor(tempF: number, alpha = 1, light = 58): string {
  return `hsla(${Math.round(feelsHue(tempF))}, 70%, ${light}%, ${alpha})`
}
