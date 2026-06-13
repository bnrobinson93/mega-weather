import { inferModel } from '../lib/modelInference'

interface Props {
  lat: number
  lon: number
}

export function ModelBadge({ lat, lon }: Props) {
  const { name, source } = inferModel(lat, lon)
  return (
    <div className="inline-flex flex-col items-center gap-0.5 rounded-xl bg-sky-500/10 border border-sky-500/20 px-4 py-2 text-center">
      <span className="text-xs text-sky-400 font-medium">
        Optimal model for your region
      </span>
      <span className="text-sm text-white font-semibold">{name}</span>
      <span className="text-xs text-slate-500">{source}</span>
    </div>
  )
}
