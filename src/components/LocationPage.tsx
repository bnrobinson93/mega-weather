import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { clearSavedLocation, saveLocation } from '../lib/savedLocation'
import { type LocationResult, searchLocations } from '../services/geocode'

export function LocationPage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setQuery(input.trim()), 250)
    return () => clearTimeout(t)
  }, [input])

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['location-search', query],
    queryFn: () => searchLocations(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  })

  const pick = (r: LocationResult) => {
    saveLocation({ lat: r.lat, lon: r.lon, name: r.label })
    navigate({ to: '/' })
  }

  const useMyLocation = () => {
    clearSavedLocation()
    navigate({ to: '/' })
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold text-white">Choose a location</h1>
        <p className="text-sm text-slate-400">
          Search by city, state, or US ZIP code.
        </p>
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        // biome-ignore lint/a11y/noAutofocus: dedicated search page, focus is expected
        autoFocus
        placeholder="e.g. Austin, TX or 78701"
        className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-sky-500 transition-colors"
      />

      <div className="flex flex-col gap-1 min-h-[1rem]">
        {isFetching && (
          <p className="text-xs text-slate-500 px-1">Searching…</p>
        )}
        {!isFetching && query.length >= 2 && results.length === 0 && (
          <p className="text-xs text-slate-500 px-1">No matches.</p>
        )}
        {results.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => pick(r)}
            className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 px-4 py-3 text-left cursor-pointer transition-colors"
          >
            <span className="text-sm text-slate-200">{r.label}</span>
            <span className="text-slate-600 text-lg leading-none">›</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={useMyLocation}
        className="text-sm text-sky-400 hover:text-sky-300 transition-colors cursor-pointer self-start"
      >
        📍 Use my current location
      </button>
    </div>
  )
}
