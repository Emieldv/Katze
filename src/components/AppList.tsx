import { useState, useEffect } from 'react'
import KatzePlugin from '../plugins/KatzePlugin'
import type { InstalledApp } from '../types'

type AppListProps = {
  whitelist: string[]
  onSave: (whitelist: string[]) => Promise<void>
}

export default function AppList({ whitelist, onSave }: AppListProps) {
  const [apps, setApps] = useState<InstalledApp[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const HIDDEN_PACKAGES = [
    'com.katze.app',
    'com.android.settings',
    'com.samsung.android.app.settings',
  ]

  useEffect(() => {
    KatzePlugin.getInstalledApps()
      .then(({ apps }) => {
        const visible = apps.filter((a) => !HIDDEN_PACKAGES.includes(a.packageName))
        setApps(visible.sort((a, b) => a.appName.localeCompare(b.appName)))
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = apps.filter((app) =>
    app.appName.toLowerCase().includes(search.toLowerCase()),
  )

  function toggleApp(packageName: string) {
    const updated = whitelist.includes(packageName)
      ? whitelist.filter((p) => p !== packageName)
      : [...whitelist, packageName]
    onSave(updated)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Whitelisted apps will NOT be blocked when locked.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search apps..."
        className="w-full bg-surface-light rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:ring-1 focus:ring-primary-700 mb-4"
      />

      <div className="space-y-1">
        {filtered.map((app) => {
          const isWhitelisted = whitelist.includes(app.packageName)

          return (
            <button
              key={app.packageName}
              onClick={() => toggleApp(app.packageName)}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors active:bg-surface-lighter"
            >
              {app.icon ? (
                <img
                  src={`data:image/png;base64,${app.icon}`}
                  alt=""
                  className="w-10 h-10 rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-surface-lighter flex items-center justify-center text-xs text-gray-500">
                  ?
                </div>
              )}

              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{app.appName}</p>
                <p className="text-xs text-gray-600">{app.packageName}</p>
              </div>

              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  isWhitelisted
                    ? 'bg-primary-600 border-primary-600'
                    : 'border-gray-600'
                }`}
              >
                {isWhitelisted && (
                  <svg viewBox="0 0 12 12" className="w-3 h-3 text-white">
                    <path
                      fill="currentColor"
                      d="M10 3L4.5 8.5 2 6l.7-.7L4.5 7.1 9.3 2.3z"
                    />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
