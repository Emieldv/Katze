import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AppList from '../components/AppList'
import NfcCardManager from '../components/NfcCardManager'
import SafeArea from '../components/SafeArea'
import TabBar from '../components/TabBar'
import TimerSettings from '../components/TimerSettings'

import type { useStorage } from '../hooks/useStorage'

type SettingsProps = {
  storage: ReturnType<typeof useStorage>
}

type Tab = 'whitelist' | 'nfc' | 'timer'

const tabs: { key: Tab; label: string }[] = [
  { key: 'whitelist', label: 'Apps' },
  { key: 'nfc', label: 'NFC Cards' },
  { key: 'timer', label: 'Timer' },
]

export default function Settings({ storage }: SettingsProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('whitelist')

  return (
    <SafeArea>
      <div className='px-6'>
        <button
          onClick={() => navigate('/')}
          className='flex items-center gap-2 text-sm text-primary-400 mb-4 active:opacity-70'
        >
          <svg viewBox='0 0 20 20' fill='currentColor' className='w-4 h-4'>
            <path
              fillRule='evenodd'
              d='M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z'
              clipRule='evenodd'
            />
          </svg>
          Back
        </button>
        <h1 className='text-2xl font-bold text-primary-400 mb-6'>Settings</h1>

        <div className='mb-6'>
          <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      <div className='flex-1 px-6 pb-2 overflow-y-auto'>
        {activeTab === 'whitelist' && <AppList whitelist={storage.whitelist} onSave={storage.saveWhitelist} />}
        {activeTab === 'nfc' && <NfcCardManager cards={storage.nfcCards} onSave={storage.saveNfcCards} />}
        {activeTab === 'timer' && <TimerSettings config={storage.timerConfig} onSave={storage.saveTimerConfig} />}
      </div>
    </SafeArea>
  )
}
