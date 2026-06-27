import { useState } from 'react'
import { backdropGradient, backdropImage, season } from '../lib/backdrop'

interface Props {
  code: number
  isDay: boolean
  lat: number
}

export function Backdrop({ code, isDay, lat }: Props) {
  const img = backdropImage(code, isDay, season(new Date(), lat))
  // Track the src that 404'd; a new condition (new src) re-enables the image.
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const imgOk = failedSrc !== img

  return (
    <div aria-hidden className="fixed inset-0 -z-10 bg-slate-900">
      <div
        className={`absolute inset-0 ${backdropGradient(code, isDay)} opacity-60`}
      />
      {imgOk && (
        <img
          src={img}
          alt=""
          onError={() => setFailedSrc(img)}
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
      )}
      {/* Scrim: keeps header/footer/text readable over bright photos. */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900/80 via-slate-900/60 to-slate-900/85" />
    </div>
  )
}
