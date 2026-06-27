import { useRegisterSW } from 'virtual:pwa-register/react'

const UPDATE_CHECK_MS = 60 * 60 * 1000 // hourly

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    // Proactively poll so long-open sessions notice a deploy in the background.
    onRegisteredSW(_url, registration) {
      if (registration) {
        setInterval(() => registration.update(), UPDATE_CHECK_MS)
      }
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 shadow-lg">
        <span className="text-sm text-slate-200">New version available</span>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3 py-1.5 text-sm text-white transition-colors cursor-pointer"
        >
          Reload
        </button>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label="Dismiss"
          className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
