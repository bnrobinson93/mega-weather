import { useEffect, useState } from 'react'

export type GeoState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; lat: number; lon: number }
  | { status: 'error'; message: string }

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({ status: 'loading' })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        status: 'error',
        message: 'Geolocation not supported by your browser.',
      })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          status: 'success',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location access denied. Enable location in browser settings.',
          2: 'Location unavailable. Check your network or GPS.',
          3: 'Location request timed out. Try again.',
        }
        setState({
          status: 'error',
          message: messages[err.code] ?? 'Unknown location error.',
        })
      },
      { timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  return state
}
