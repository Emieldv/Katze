import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { useStorage } from '../hooks/useStorage'
import SafeArea from '../components/SafeArea'
import AppList from '../components/AppList'
import NfcCardManager from '../components/NfcCardManager'
import TimerSettings from '../components/TimerSettings'

type SettingsProps = {
  storage: ReturnType<typeof useStorage>
}

type Tab = 'whitelist' | 'nfc' | 'timer'

export default function Settings({ storage }: SettingsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('whitelist')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'whitelist', label: 'Apps' },
    { key: 'nfc', label: 'NFC Cards' },
    { key: 'timer', label: 'Timer' },
  ]

  return (
    <SafeArea>
      <div className="px-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-primary-400 text-sm"
          >
            &larr; Back
          </button>
          <h1 className="text-xl font-bold text-primary-400">Settings</h1>
        </div>

        <div className="flex gap-1 bg-surface-light rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-700 text-white'
                  : 'text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pb-2 overflow-y-auto">
        {activeTab === 'whitelist' && (
          <AppList
            whitelist={storage.whitelist}
            onSave={storage.saveWhitelist}
          />
        )}
        {activeTab === 'nfc' && (
          <NfcCardManager
            cards={storage.nfcCards}
            onSave={storage.saveNfcCards}
          />
        )}
        {activeTab === 'timer' && (
          <TimerSettings
            config={storage.timerConfig}
            onSave={storage.saveTimerConfig}
          />
        )}
      </div>
    </SafeArea>
  )
}
