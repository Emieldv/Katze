import { useEffect, useState } from 'react'

import Spinner from '../../../components/Spinner'
import TextInput from '../../../components/TextInput'
import KatzePlugin from '../../../plugins/KatzePlugin'
import AppListItem from '../components/AppListItem'

import type { InstalledApp } from '../../../types'

type AppListProps = {
  whitelist: string[]
  onSave: (whitelist: string[]) => Promise<void>
}

export default function AppListScreen({ whitelist, onSave }: AppListProps) {
  const [apps, setApps] = useState<InstalledApp[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hiddenPackages = ['com.katzefocus.app', 'com.android.settings', 'com.samsung.android.app.settings']
    KatzePlugin.getInstalledApps()
      .then(({ apps }) => {
        const visible = apps.filter((a) => !hiddenPackages.includes(a.packageName))
        setApps(visible.sort((a, b) => a.appName.localeCompare(b.appName)))
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = apps.filter((app) => app.appName.toLowerCase().includes(search.toLowerCase()))

  function toggleApp(packageName: string) {
    const updated = whitelist.includes(packageName)
      ? whitelist.filter((p) => p !== packageName)
      : [...whitelist, packageName]
    onSave(updated)
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <p className='text-xs text-gray-400 mb-3'>Whitelisted apps will NOT be blocked when locked.</p>

      <TextInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder='Search apps...'
        className='mb-4'
      />

      <div className='space-y-1'>
        {filtered.map((app) => (
          <AppListItem
            key={app.packageName}
            appName={app.appName}
            packageName={app.packageName}
            icon={app.icon}
            selected={whitelist.includes(app.packageName)}
            onToggle={() => toggleApp(app.packageName)}
          />
        ))}
      </div>
    </div>
  )
}
